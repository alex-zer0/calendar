import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { AdminStore } from '../state/admin.state';
import { Observable } from 'rxjs';
import { User, Role, PaginationData } from '@app/models';
import { GetUsers, UpdateUser, ApplyFilters, ResetUsers } from '../state/admin.actions';
import { AdminEditUserComponent } from '../edit-user/edit-user.component';
import { RolesService } from '@app/services/roles.service';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@app/base.component';

const LIMITS = [10, 20, 30, 40, 50];

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent extends BaseComponent implements OnInit, OnDestroy {
  @Select(AdminStore.users) users$: Observable<User[]>;
  @Select(AdminStore.usersMeta) usersMeta$: Observable<PaginationData>;
  form: FormGroup;

  limits = LIMITS.map(id => ({ id }));
  roles$: Observable<Role[]>;

  @ViewChild('editModal', { static: true })
  private editModal: AdminEditUserComponent;

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private rolesService: RolesService
  ) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      dynamicFilter: '',
      limit: 10,
      offset: 0
    });

    this.roles$ = this.rolesService.fetchAll();

    this.form.valueChanges
      .pipe(
        takeUntil(this.ngDestroy$),
        debounceTime(300)
      )
      .subscribe(values => this.store.dispatch(new ApplyFilters(values)));

    this.store.dispatch(new GetUsers({}));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.store.dispatch(new ResetUsers());
  }

  editUser(user: User) {
    this.editModal.open(user)
      .subscribe(res => res && this.store.dispatch(new UpdateUser(res.id, res.input)));
  }

  changePage(offset: number) {
    this.form.get('offset').setValue(offset);
  }

  getRoles(user: User) {
    return user.roles.map(r => r.roleDescription || r.roleName).join(', ');
  }
}
