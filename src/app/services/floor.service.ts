import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { WorkObject } from '@models';

interface FloorParams {
  limit?: number;
  livingComplexIds: number[];
  objectIds: number[];
  sectionIds: number[];
  floorIds?: string;
  sortBy?: string;
  sortAsNumeric?: boolean;
}

@Injectable({ providedIn: 'root' })
export class FloorService {
  constructor(private rest: Rest) {}

  fetchAll(params: FloorParams) {
    return this.rest.get<WorkObject[]>('Floor', params);
  }
}
