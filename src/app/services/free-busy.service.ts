import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { FreeBusyData } from '@models';

export interface FreeBusyParams {
  livingComplexId: number;
  objectId: number;
  checklistIds?: string;
}

@Injectable({ providedIn: 'root' })
export class FreeBusyService {
  constructor(private rest: Rest) {}

  fetchForIdpTeam(params: FreeBusyParams) {
    return this.rest.get<FreeBusyData>('FreeBusy/forIdpTeam', params);
  }

  fetchById(globalId: string) {
    return this.rest.get<FreeBusyData>(`FreeBusy/${globalId}`);
  }

  constructionExist(params: FreeBusyParams) {
    return this.rest.get<FreeBusyData>('FreeBusy/construction-exist', params);
  }
}
