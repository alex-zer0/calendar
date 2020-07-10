import { MeetingsListParams } from '@models';

export class GetMeetings {
  static type = '[Registry] Get meetings';
}

export class LoadMoreMeetings {
  static type = '[Registry] Load more meetings';
}

export class GetStats {
  static type = '[Registry] Get stats';
}

export class ResetMeeting {
  static type = '[Registry] Reset meeting';
}

export class GetMeeting {
  static type = '[Registry] Get meeting';
  constructor(public id: number) {}
}

export class RemoveMeetingUI {
  static type = '[Registry] Remove meeting on UI';
}

export class RemoveMeeting {
  static type = '[Registry] Remove meeting';
  constructor(public id: number) {}
}

export class UpdateMeeting {
  static type = '[Registry] Update meeting';
  constructor(public input: any, public isRemove?: boolean) {}
}

export class ApplyFilter {
  static type = '[Registry] Apply filter';
  constructor(public input: MeetingsListParams) {}
}
