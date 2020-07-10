import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { WorkChecklistItem } from '@models';
import { shareReplay, map } from 'rxjs/operators';
import { of } from 'rxjs';

interface ChecklistParams {
  checklistId: number;
}

@Injectable({ providedIn: 'root' })
export class ChecklistService {
  private data: WorkChecklistItem[];

  constructor(private rest: Rest) {}

  fetchAll(params?: ChecklistParams) {
    if (this.data) {
      return of(this.data);
    }
    return this.rest.get<WorkChecklistItem[]>('Checklist', { limit: 100, ...params })
      .pipe(
        map(data => this.data = data),
        shareReplay(1)
      );
  }
}
