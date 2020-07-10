import { State, Action, StateContext, Selector } from '@ngxs/store';
import { SetControlType } from './root.actions';
import { ControlTypeEnum, CONTROL_TYPE_IDS } from '@models';

interface RootState {
  controlType: ControlTypeEnum;
}

@State<RootState>({
  name: 'root',
  defaults: { controlType: null }
})
export class RootStore {
  @Selector()
  static controlType(state: RootState): string {
    return state.controlType;
  }
  @Selector()
  static controlTypeIds(state: RootState): number[] {
    return CONTROL_TYPE_IDS[state.controlType] || [];
  }
  @Selector()
  static isBuildComfort(state: RootState): boolean {
    return state.controlType === ControlTypeEnum.COMFORT;
  }
  @Selector()
  static isIC(state: RootState): boolean {
    return state.controlType === ControlTypeEnum.IC;
  }
  @Selector()
  static isKM(state: RootState): boolean {
    return state.controlType === ControlTypeEnum.KM;
  }

  @Action(SetControlType)
  setControlType({ patchState }: StateContext<RootState>, { type }: SetControlType) {
    return patchState({ controlType: type || null });
  }
}
