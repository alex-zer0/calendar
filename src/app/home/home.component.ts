import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetControlType } from '@app/state/root.actions';
import { ControlTypeEnum, CONTROL_TYPE_OPTIONS, AuthConfig, AccessRules } from '@models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '@services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  options = CONTROL_TYPE_OPTIONS;
  auth$: Observable<AuthConfig>;
  isAdmin$: Observable<boolean>;
  isReport$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private store: Store
  ) { }

  ngOnInit() {
    this.auth$ = this.authService.listCurrent();
    this.isAdmin$ = this.auth$
      .pipe(map(({ accessRules }) => accessRules.includes(AccessRules.ADMIN)));
    this.isReport$ = this.auth$
      .pipe(map(({ accessRules }) => accessRules.includes(AccessRules.REPORTS)));
  }

  setControlType(type: ControlTypeEnum) {
    this.store.dispatch(new SetControlType(type));
  }
}
