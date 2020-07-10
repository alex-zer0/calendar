import { AccessRules } from './access-rules';

export enum ControlTypeEnum {
  IC = 'ic',
  BUILD_COMFORT = 'comfort',
  KM = 'km'
}

export const CONTROL_TYPE_IDS = {
  [ControlTypeEnum.IC]: [1, 2, 4],
  [ControlTypeEnum.BUILD_COMFORT]: [3],
  [ControlTypeEnum.KM]: [5]
};

export const CONTROL_TYPE_OPTIONS = [
  {
    id: ControlTypeEnum.IC,
    icon: '#helmet',
    rule: AccessRules.IC,
    title: 'Сдача работ на строительной площадке'
  },
  {
    id: ControlTypeEnum.BUILD_COMFORT,
    icon: '#home',
    rule: AccessRules.BUILD_COMFORT,
    title: 'Сдача систем Строй-Комфорту'
  },
  {
    id: ControlTypeEnum.KM,
    icon: '#house',
    rule: AccessRules.KM,
    title: 'Управлению по заселению и проведения предварительной приемки квартир и приемки МОП'
  }
];
