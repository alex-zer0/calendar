import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { Stats } from '@models';

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private rest: Rest) {}

  fetchStats() {
    return this.rest.get<Stats>('Statistic');
  }
}
