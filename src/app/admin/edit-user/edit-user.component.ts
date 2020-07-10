import { Component, OnDestroy, HostBinding, OnInit, Input } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseComponent } from '@app/base.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User, Role } from '@app/models';
import { UserAdminInput } from '@app/services';

interface EditUserResult {
  id: string;
  input: UserAdminInput;
}

@Component({
  selector: 'app-admin-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class AdminEditUserComponent extends BaseComponent implements OnDestroy, OnInit {
  @HostBinding('class.modal-opened')
  isOpened: boolean;
  @Input() roles: Role[];

  user: User;
  form: FormGroup;
  roles$: Observable<{id: number, description: string}[]>;
  protected result$: Subject<EditUserResult|null>;

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      fullName: [null, Validators.required],
      email: [null, Validators.required],
      rolesIds: [[]]
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.result$) {
      this.close(null);
    }
  }

  open(user: User): Observable<EditUserResult|null> {
    this.isOpened = true;
    this.user = user;
    this.form.reset({
      ...user,
      rolesIds: user.roles.map(({ roleId }) => roleId)
    });
    this.result$ = new Subject<EditUserResult|null>();
    return this.result$.asObservable()
      .pipe(tap(() => this.isOpened = false));
  }

  save() {
    const { email, fullName, ...rest } = this.form.getRawValue();
    this.close({ id: this.user.globalId, input: { ...rest } });
  }

  close(result?: EditUserResult|null) {
    this.result$.next(result);
    this.result$.complete();
  }
}
