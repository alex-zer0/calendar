import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { Observable } from 'rxjs';
import { DeclineReason } from '@models';
import { shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DictionaryService {
  constructor(private rest: Rest) {}

  getDeclineReasons(): Observable<DeclineReason[]> {
    return this.rest.get<DeclineReason[]>('dictionary/decline-reasons')
      .pipe(shareReplay(1));
  }
}
