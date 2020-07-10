import { Component, OnInit, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { RegistryStore } from './state/registry.state';
import { RootStore } from '../state/root.state';
import {
  Meeting, MeetingInfo, MeetingStatus, AccessRules, AuthConfig, MeetingsListParams, Stats,
  MAIN_RULES, UserRoleIdEnum, ControlTypeEnum, TechSupportConfig
} from '@models';
import { Observable, combineLatest } from 'rxjs';
import { DateTime } from 'luxon';
import { BaseComponent } from '@app/base.component';
import { GetMeetings, GetMeeting, ApplyFilter, GetStats, LoadMoreMeetings } from './state/registry.actions';
import { map, first, shareReplay } from 'rxjs/operators';
import { MeetingStatusesService, AuthService, TechSupportService } from '@services';
import { Options } from 'flatpickr/dist/types/options';

declare var tableau: any;

const ADMIN_REPORT_ROLES = [1, 2, 3, 8, 12, 16];
const ACCEPT_STATUSES = [10, 20, 60];
const BUSY_DAY_CLASS = 'flatpickr-day--busy';

interface FilterTile {
  id: number;
  title: string;
  icon: string;
  stats: string;
  color?: string;
}

const IC_TILES: FilterTile[] = [
  { id: 1, stats: 'totalComfort', title: 'Строй-Комфорт', icon: '#comfort' },
  { id: 2, stats: 'totalCheckinManagement', title: 'Управление заселением', icon: '#house-key' },
  { id: 0, stats: 'totalBuilding', title: 'Строительная площадка', icon: '#crane' },
];
const COMFORT_TILES: FilterTile[] = [
  { id: 3, stats: 'totalUnreviewed', title: 'Не рассмотренные вызовы', icon: '#bell', color: '#F3B81F' },
  { id: 4, stats: 'totalAwaiting', title: 'Ожидает подтверждения', icon: '#user-clock', color: '#50BC68' },
  { id: 5, stats: 'totalCanceled', title: 'Отмененные вызовы', icon: '#disallow', color: '#FF482D' },
];
const CONTRACTOR_TILES: FilterTile[] = [
  { id: 3, stats: 'totalUnreviewed', title: 'Не рассмотренные вызовы', icon: '#bell', color: '#F3B81F' },
  { id: 5, stats: 'totalCanceled', title: 'Отмененные вызовы', icon: '#disallow', color: '#FF482D' },
];
const VIZ_OPTIONS = {
  height: '316px',
  width: '100%',
  hideTabs: true,
  hideToolbar: true,
  showAppBanner: false
};

@Component({
  selector: 'app-registry',
  templateUrl: './registry.component.html',
  styleUrls: ['./registry.component.scss']
})
export class RegistryComponent extends BaseComponent implements OnInit, OnDestroy {
  @Select(RootStore.controlType) controlType$: Observable<ControlTypeEnum>;
  @Select(RootStore.isIC) isIC$: Observable<boolean>;
  @Select(RegistryStore.stats) stats$: Observable<Stats>;
  @Select(RegistryStore.meeting) meeting$: Observable<Meeting>;
  @Select(RegistryStore.meetings) meetings$: Observable<MeetingInfo[]>;
  @Select(RegistryStore.isWaiting) isWaiting$: Observable<boolean>;
  @Select(RegistryStore.filters) filters$: Observable<MeetingsListParams>;
  @Select(RegistryStore.activeStatusId) activeStatusId$: Observable<number>;
  @Select(RegistryStore.activePanelType) activePanelType$: Observable<number>;
  @Select(RegistryStore.isTodayActive) isTodayActive$: Observable<boolean>;

  config$: Observable<TechSupportConfig[]>;
  auth$: Observable<AuthConfig>;
  showAdd$: Observable<boolean>;
  showHomeLink$: Observable<boolean>;
  statuses$: Observable<MeetingStatus[]>;
  filterTiles$: Observable<FilterTile[]>;
  isAdminReport$: Observable<boolean>;
  isContractor$: Observable<boolean>;
  reportLink$: Observable<boolean>;

  today = new Date();
  datePickerOptions: Options = {
    inline: true,
    onReady: (a, b, instance) => {
      this.datePicker = instance;
      this.initViz();
    },
    onChange: (dates: Date[], dStr: string, obj) => {
      if (!dStr) {
        return;
      }
      this.filters$
        .pipe(first())
        .subscribe(({ date }) => {
          this.setDate(dates ? dates[0] : null);
          if (dStr === date) {
            obj.clear();
          }
        });
    },
    onDayCreate: (dObj, dStr, fp, dayElem) => {
      const isoDate = DateTime.fromJSDate(dayElem.dateObj).toISODate();
      this.stats$
        .pipe(
          first(),
          map(stats => !!stats.dates.find(d => DateTime.fromISO(d).toISODate() === isoDate))
        )
        .subscribe(res => res && (dayElem.className += ` ${BUSY_DAY_CLASS}`));
    }
  };

  private viz: any;
  private datePicker: any;

  constructor(
    private store: Store,
    private meetingStatusesService: MeetingStatusesService,
    private rulesService: AuthService,
    private supportService: TechSupportService
  ) {
    super();
  }

  ngOnInit() {
    this.auth$ = this.rulesService.listCurrent();
    this.config$ = this.supportService.getConfiguration({ type: 1 })
      .pipe(shareReplay(1));
    this.showAdd$ = this.auth$
      .pipe(map(({ accessRules }) => accessRules.includes(AccessRules.ADD)));
    this.showHomeLink$ = this.auth$
      .pipe(map(({ accessRules }) => accessRules.filter(r => MAIN_RULES.includes(r)).length > 1));
    this.isAdminReport$ = this.auth$
      .pipe(map(({ roleIds }) => ADMIN_REPORT_ROLES.some(id => roleIds.includes(id))));
    this.isContractor$ = this.auth$.pipe(map(({ roleIds }) => roleIds.includes(UserRoleIdEnum.CONTRACTOR)));
    this.reportLink$ = combineLatest(this.isAdminReport$, this.config$)
      .pipe(map(([isAdminReport, configItems]) => {
        const configKey = isAdminReport ? 'AdminDesktop' : 'UserDesktop';
        const config = configItems.find(c => c.name === configKey);
        if (!config) {
          return null;
        }
        return JSON.parse(config.value).Link || null;
      }));
    this.filterTiles$ = combineLatest(this.isIC$, this.isContractor$)
      .pipe(map(([isIC, isContractor]) => {
        if (!isIC) {
          return COMFORT_TILES;
        }
        return isContractor ? CONTRACTOR_TILES : IC_TILES;
      }));
    this.statuses$ = this.meetingStatusesService.fetchAll()
      .pipe(map(statuses => statuses.filter(({ id }) => ACCEPT_STATUSES.includes(id))));
    this.store.dispatch(new GetMeetings());
    this.store.dispatch(new GetStats());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.viz) {
      this.viz.dispose();
      this.viz = null;
    }
  }

  initViz() {
    if (this.viz) {
      return;
    }
    this.reportLink$
      .pipe(first())
      .subscribe((link) => {
        if (link) {
          const container = document.getElementById('vizDashboard');
          this.viz = new tableau.Viz(container, link, VIZ_OPTIONS);
        }
      });
  }

  loadMore() {
    this.store.dispatch(new LoadMoreMeetings());
  }

  selectMeeting(meeting: Meeting) {
    this.store.dispatch(new GetMeeting(meeting.id));
  }

  applyFilter(key: string, value: string|number|null, skipClear?: boolean) {
    this.store.dispatch(new ApplyFilter({ [key]: value }));
    this.store.dispatch(new GetMeetings());
    if (!skipClear && this.datePicker) {
      this.datePicker.clear();
    }
  }

  toggleToday() {
    this.isTodayActive$
      .pipe(first())
      .subscribe(isActive => this.setDate(null, !isActive, true));
  }

  private setDate(jsDate?: Date|null, isToday?: boolean, toReset?: boolean) {
    let date = null;
    if (isToday) {
      date = DateTime.utc().toISODate();
    } else if (jsDate) {
      date = DateTime.fromJSDate(jsDate).toISODate();
    }
    this.applyFilter('date', date, !toReset);
  }
}
