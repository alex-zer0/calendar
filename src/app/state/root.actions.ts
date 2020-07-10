import { ControlTypeEnum } from '@models';

export class SetControlType {
  static type = '[Root] Set controlType';
  constructor(public type: ControlTypeEnum) {}
}
