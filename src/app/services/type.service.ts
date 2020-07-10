import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { WorkType } from '@models';

@Injectable({ providedIn: 'root' })
export class TypeService {
  constructor(private rest: Rest) {}

  fetchAll() {
    return this.rest.get<WorkType[]>('Type');
  }
}
