import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { map, catchError, retry } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { AuthConfig } from '@models';

const INITIAL_CONFIG = { accessRules: [], roleIds: [] };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private config: AuthConfig;

  constructor(private rest: Rest) {}

  listCurrent(): Observable<AuthConfig> {
    if (this.config) {
      return of(this.config);
    }
    return this.rest.get<AuthConfig>('AccessRules/list-current')
      .pipe(
        map(config => this.config = config || INITIAL_CONFIG),
        retry(3),
        catchError(() => of(INITIAL_CONFIG))
      );
  }
}
