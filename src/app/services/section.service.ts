import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { WorkObject } from '@models';

interface SectionParams {
  limit?: number;
  livingComplexIds: number[];
  objectIds: number[];
  sectionIds?: number[];
  sortBy?: string;
}

@Injectable({ providedIn: 'root' })
export class SectionService {
  constructor(private rest: Rest) {}

  fetchAll(params: SectionParams) {
    return this.rest.get<WorkObject[]>('Section', params);
  }
}
