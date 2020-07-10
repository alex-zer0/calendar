import { State, Action, StateContext, Selector } from '@ngxs/store';
import { ApplyFilters, GetUsers, UpdateUser, ResetUsers, UpdateConfig, GetConfig, ResetConfig } from './admin.actions';
import { UserAdminService, UserAdminParams, UserAdminMeta, TechSupportService } from '@services';
import { tap } from 'rxjs/operators';
import { User, TechSupportConfig } from '@app/models';

interface AdminState {
  users: User[];
  filters: UserAdminParams;
  meta: UserAdminMeta;
  config: TechSupportConfig[];
  loading: boolean;
}

const initialMeta = {
  offset: 0,
  totalCount: 0,
  limit: 10
};

const initialFilters = {
  limit: 10,
  dynamicFilter: ''
};

const initialState = {
  users: [],
  loading: false,
  meta: initialMeta,
  filters: initialFilters,
  config: []
};

@State<AdminState>({
  name: 'admin',
  defaults: initialState
})
export class AdminStore {
  constructor(
    private userAdminService: UserAdminService,
    private techSupportService: TechSupportService,
  ) {}

  @Selector()
  static users(state: AdminState): User[] {
    return state.users;
  }
  @Selector()
  static filters(state: AdminState): UserAdminParams {
    return state.filters;
  }
  @Selector()
  static usersMeta(state: AdminState): UserAdminMeta {
    return state.meta;
  }
  @Selector()
  static config(state: AdminState): TechSupportConfig[] {
    return state.config;
  }

  @Action(GetUsers, { cancelUncompleted: true })
  getUsers({ getState, patchState }: StateContext<AdminState>) {
    const { filters } = getState();
    return this.userAdminService.fetchAll({ ...filters })
      .pipe(tap(({ data, meta }) => patchState({ meta, users: data })));
  }

  @Action(ResetUsers)
  resetUsers({ patchState }: StateContext<AdminState>) {
    patchState({ users: [], meta: initialMeta, filters: initialFilters });
  }

  @Action(UpdateUser)
  updateUser({ getState, patchState }: StateContext<AdminState>, { id, input }: UpdateUser) {
    const { users } = getState();
    return this.userAdminService.updateUser(id, input)
      .pipe(tap(user => patchState({ users: users.map(u => u.globalId === user.globalId ? user : u) })));
  }

  @Action(ApplyFilters)
  applyFilter({ patchState, getState, dispatch }: StateContext<AdminState>, { input }: ApplyFilters) {
    const { filters } = getState();
    const isResetOffset = filters.limit !== input.limit || filters.dynamicFilter !== input.dynamicFilter;
    const offset = isResetOffset ? 0 : input.offset;
    const newFilters = { ...filters, ...input, offset };
    patchState({ filters: newFilters });
    dispatch(new GetUsers(newFilters));
  }

  @Action(GetConfig, { cancelUncompleted: true })
  getConfig({ patchState }: StateContext<AdminState>, { type }: GetConfig) {
    return this.techSupportService.getConfiguration({ type })
      .pipe(tap(config => patchState({ config })));
  }

  @Action(UpdateConfig, { cancelUncompleted: true })
  updateConfig({ getState, patchState }: StateContext<AdminState>, { id, value }: UpdateConfig) {
    const { config } = getState();
    return this.techSupportService.updateConfiguration({ id, value })
      .pipe(tap(configItem => patchState({ config: config.map(c => c.id === id ? configItem : c) })));
  }

  @Action(ResetConfig)
  resetConfig({ patchState }: StateContext<AdminState>) {
    patchState({ config: [] });
  }
}
