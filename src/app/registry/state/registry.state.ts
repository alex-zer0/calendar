import { State, Action, StateContext, Selector } from '@ngxs/store';
import {
  GetMeeting, GetMeetings, RemoveMeeting, UpdateMeeting, ResetMeeting,
  ApplyFilter, GetStats, LoadMoreMeetings, RemoveMeetingUI
} from './registry.actions';
import {
  Meeting, MeetingInfo, MeetingStatusIdEnum, MeetingsListParams, MeetingsListMeta,
  Stats, UserRoleIdEnum, User, USER_ROLE_IDS
} from '@models';
import { StatsService, MeetingService } from '@services';
import { tap, catchError, mergeMap } from 'rxjs/operators';
import { DateTime } from 'luxon';
import { throwError } from 'rxjs';

interface RegistryState {
  meetings: MeetingInfo[];
  meeting: Meeting;
  stats: Stats;
  filters: MeetingsListParams;
  meta: MeetingsListMeta;
  isWaiting: boolean;
  loading: boolean;
}

const initialState = {
  meetings: [],
  meeting: null,
  isWaiting: false,
  loading: false,
  stats: null,
  meta: {
    offset: 0,
    totalCount: 0,
    limit: 20
  },
  filters: {
    statusId: MeetingStatusIdEnum.IN_PROGRESS,
    date: DateTime.utc().toISODate()
  }
};

@State<RegistryState>({
  name: 'registry',
  defaults: initialState
})
export class RegistryStore {
  constructor(
    private service: MeetingService,
    private statsService: StatsService
  ) {}

  @Selector()
  static meetings(state: RegistryState): MeetingInfo[] {
    return state.meetings;
  }
  @Selector()
  static meeting(state: RegistryState): Meeting {
    return state.meeting;
  }
  @Selector()
  static stats(state: RegistryState): Stats {
    return state.stats;
  }
  @Selector()
  static isWaiting(state: RegistryState): boolean {
    return state.isWaiting;
  }
  @Selector()
  static filters(state: RegistryState): MeetingsListParams {
    return state.filters;
  }
  @Selector()
  static activeStatusId(state: RegistryState): number {
    return state.filters.statusId;
  }
  @Selector()
  static activePanelType(state: RegistryState): number {
    return state.filters.panelType;
  }
  @Selector()
  static isTodayActive(state: RegistryState): boolean {
    return state.filters.date === DateTime.utc().toISODate();
  }
  @Selector()
  static initiator(state: RegistryState): User|undefined {
    return state.meeting && state.meeting.users &&
      state.meeting.users.find(u => u.userRoleId === UserRoleIdEnum.INITIATOR);
  }
  @Selector()
  static finishingControl(state: RegistryState): User[] {
    return state.meeting && state.meeting.users &&
      state.meeting.users.filter(u => u && u.userRoleId === UserRoleIdEnum.FINISHING) || [];
  }
  @Selector()
  static authControl(state: RegistryState): User[] {
    return state.meeting && state.meeting.users && state.meeting.users
      .filter(u => u && USER_ROLE_IDS.AUTH.includes(u.userRoleId)) || [];
  }
  @Selector()
  static buildControl(state: RegistryState): User[] {
    return state.meeting && state.meeting.users && state.meeting.users
      .filter(u => u && USER_ROLE_IDS.BUILDING.includes(u.userRoleId)) || [];
  }
  @Selector()
  static buildComfort(state: RegistryState): User[] {
    return state.meeting && state.meeting.users && state.meeting.users
      .filter(u => u && USER_ROLE_IDS.BUILD_COMFORT.includes(u.userRoleId)) || [];
  }
  @Selector()
  static isValidUsers(state: RegistryState): boolean {
    const validIds = [
      ...USER_ROLE_IDS.AUTH,
      ...USER_ROLE_IDS.BUILDING,
      ...USER_ROLE_IDS.BUILD_COMFORT,
      UserRoleIdEnum.FINISHING,
      UserRoleIdEnum.INITIATOR
    ];
    return state.meeting && state.meeting.users && state.meeting.users
      .some(u => u && validIds.includes(u.userRoleId));
  }

  @Action(GetStats)
  getStats({ patchState }: StateContext<RegistryState>) {
    return this.statsService.fetchStats()
      .pipe(tap(stats => patchState({ stats })));
  }

  @Action(GetMeetings)
  getMeetings({ patchState, getState }: StateContext<RegistryState>) {
    patchState({ loading: true });
    const { filters, meta: { offset, limit } } = getState();
    return this.service.fetchList({ ...filters, offset, limit })
      .pipe(
        tap(({ data, meta }) => patchState({
          meta,
          meetings: data.sort(this.sortMeetings),
          loading: false
        }))
      );
  }

  @Action(LoadMoreMeetings)
  loadMoreMeetings({ patchState, getState }: StateContext<RegistryState>) {
    const { filters, meta: { offset = 0, limit, totalCount = 0 }, loading, meetings } = getState();
    if (loading) {
      return;
    }
    patchState({ loading: true });
    const newOffset = offset + limit < totalCount ? offset + limit : null;
    if (!newOffset) {
      return;
    }
    return this.service.fetchList({ ...filters, limit, offset: newOffset })
      .pipe(
        tap(({ data, meta }) => patchState({
          meta,
          meetings: meetings.concat(data).sort(this.sortMeetings),
          loading: false
        }))
      );
  }

  @Action(GetMeeting)
  getMeeting({ patchState }: StateContext<RegistryState>, { id }: GetMeeting) {
    return this.service.fetchById(id)
      .pipe(tap(meeting => patchState({ meeting })));
  }

  @Action(ResetMeeting)
  resetMeeting({ patchState }: StateContext<RegistryState>) {
    patchState({ meeting: null });
  }

  @Action(RemoveMeetingUI)
  removeMeetingUI({ patchState, getState, dispatch }: StateContext<RegistryState>) {
    const { meetings = [], meeting = null } = getState() || {};
    patchState({ meeting: null, meetings: meetings.filter(m => meeting && m.id !== meeting.id) });
    dispatch(new GetStats());
  }

  @Action(RemoveMeeting)
  removeMeeting({ patchState, getState, dispatch }: StateContext<RegistryState>, { id }: RemoveMeeting) {
    patchState({ isWaiting: true });
    return this.service.removeById(id)
      .pipe(
        tap(() => {
          const { meetings = [] } = getState() || {};
          patchState({ meeting: null, isWaiting: false, meetings: meetings.filter(m => m.id !== id) });
        }),
        mergeMap(() => dispatch(new GetStats()))
      );
  }

  @Action(UpdateMeeting)
  updateMeeting({ patchState, getState, dispatch }: StateContext<RegistryState>, { input, isRemove }: UpdateMeeting) {
    const { meeting: { id } } = getState();
    if (id) {
      patchState({ isWaiting: true });
      return this.service.updateMeeting(id, input)
        .pipe(
          catchError((err) => {
            patchState({ isWaiting: false });
            return throwError(err);
          }),
          tap((meeting) => {
            patchState({ meeting, isWaiting: false });
            if (isRemove) {
              dispatch(new RemoveMeetingUI());
            }
          }),
          mergeMap(() => dispatch(new GetStats()))
        );
    }
  }

  @Action(ApplyFilter)
  applyFilter({ patchState, getState }: StateContext<RegistryState>, { input }: ApplyFilter) {
    const { filters, meta } = getState();
    if (input.panelType != null) {
      input.statusId = null;
      input.date = null;
      if (filters.panelType === input.panelType) {
        input.panelType = null;
      }
    }
    if (input.statusId != null && filters.statusId === input.statusId) {
      input.statusId = null;
    }
    if (input.date != null) {
      if (filters.date === input.date) {
        input.date = null;
      } else {
        input.panelType = null;
      }
    }
    patchState({ filters: { ...filters, ...input }, meta: { ...meta, offset: 0, totalCount: 0 } });
  }

  private sortMeetings = (a: MeetingInfo, b: MeetingInfo) => {
    return DateTime.fromISO(b.meetingEndDate).diff(DateTime.fromISO(a.meetingEndDate)).milliseconds;
  }
}
