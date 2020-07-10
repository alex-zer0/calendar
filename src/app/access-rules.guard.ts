import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '@services';
import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { AccessRules, CONTROL_TYPE_OPTIONS, MAIN_RULES, ControlTypeEnum } from '@models';
import { Store, Select } from '@ngxs/store';
import { RootStore } from './state/root.state';
import { SetControlType } from './state/root.actions';

const ROUTES = {
  [AccessRules.IC]: '/registry',
  [AccessRules.KM]: '/registry',
  [AccessRules.BUILD_COMFORT]: '/registry',
  [AccessRules.ADMIN]: '/admin',
  [AccessRules.REPORTS]: '/operation-report',
};

@Injectable()
export class AccessRulesGuard implements CanActivate {
  @Select(RootStore.controlType) controlType$: Observable<ControlTypeEnum>;

  constructor(
    private service: AuthService,
    private store: Store,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.service.listCurrent()
      .pipe(
        withLatestFrom(this.controlType$),
        map(([{ accessRules }, controlType]) => {
          if (route.url.length > 0 &&
            (accessRules.length === 0 || route.url[0].path === 'form' && !accessRules.includes(AccessRules.ADD))) {
            this.router.navigateByUrl('/');
            return false;
          }
          const filteredRules = accessRules.filter(r => MAIN_RULES.includes(r));
          if (route.url.some(u => u.path === 'admin') && !filteredRules.includes(AccessRules.ADMIN)) {
            this.router.navigateByUrl('/');
            return false;
          }
          if (filteredRules.length === 1) {
            const rule = filteredRules[0];
            const routePath = ROUTES[rule];
            if (routePath === '/registry') {
              const option = CONTROL_TYPE_OPTIONS.find(o => o.rule === rule);
              if (option && option.id !== controlType) {
                this.store.dispatch(new SetControlType(option.id));
              }
            }
            if (route.url.length === 0) {
              this.router.navigateByUrl(routePath);
              return false;
            }
          }
          return true;
        })
      );
  }
}
