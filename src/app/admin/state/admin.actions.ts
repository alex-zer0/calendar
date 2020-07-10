import { UserAdminParams, UserAdminInput } from '@services';

export class GetUsers {
  static type = '[Admin] Get users';
  constructor(public params: UserAdminParams) {}
}

export class UpdateUser {
  static type = '[Admin] Update user';
  constructor(public id: string, public input: UserAdminInput) {}
}

export class ApplyFilters {
  static type = '[Admin] Apply filters';
  constructor(public input: UserAdminParams) {}
}

export class ResetUsers {
  static type = '[Admin] Reset users';
}

export class GetConfig {
  static type = '[Admin] Get config';
  constructor(public type: number) {}
}

export class UpdateConfig {
  static type = '[Admin] Update config';
  constructor(public id: number, public value: string) {}
}

export class ResetConfig {
  static type = '[Admin] Reset config';
}
