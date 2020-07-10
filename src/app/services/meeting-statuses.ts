import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { MeetingStatus } from '@models';

@Injectable({ providedIn: 'root' })
export class MeetingStatusesService {
  constructor(private rest: Rest) {}

  fetchAll() {
    return this.rest.get<MeetingStatus[]>('MeetingStatuses');
  }
}
