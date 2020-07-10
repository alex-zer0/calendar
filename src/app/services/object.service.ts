import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { WorkObject } from '@models';

interface ObjectParams {
  limit: number;
  livingComplexId: number;
  sortBy: string;
}

@Injectable({ providedIn: 'root' })
export class ObjectService {
  constructor(private rest: Rest) {}

  fetchByLivingComplexId(params: ObjectParams) {
    return this.rest.get<WorkObject[]>('Object', params);
  }
}
