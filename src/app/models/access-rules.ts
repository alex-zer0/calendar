export enum AccessRules {
  IC = 'AccessUnitIC',
  BUILD_COMFORT = 'AccessUnitBuildComfort',
  KM = 'AccessUnitKM',
  REPORTS = 'AccessUnitReports',
  ADMIN = 'AccessUnitAdministration',
  EDIT = 'CallEdit',
  ADD = 'CallInitiate',
  DELETE = 'CallDelete',
  REJECT = 'CallReject',
  MAKE = 'CallMake',
  CONFIRM = 'CallConfirm',
  CONFIRM_WORK = 'ConfirmWork',
  CONFIRM_DECISION = 'ConfirmDecision',
}

export const MAIN_RULES = [
  AccessRules.IC,
  AccessRules.KM,
  AccessRules.BUILD_COMFORT,
  AccessRules.ADMIN,
  AccessRules.REPORTS,
];
