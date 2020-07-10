import { Component, Input, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { UserService } from '@services';
import { debounceTime, switchMap, startWith } from 'rxjs/operators';
import { User, UserRoleIdEnum } from '@models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-guests-control',
  templateUrl: './guests-control.component.html',
  styleUrls: ['./guests-control.component.scss']
})
export class GuestsControlComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;
  @Input() users: User[];
  @Input() onlyGuests: boolean;

  guestsGroup: FormArray;
  guests$: Observable<User[]>;
  guestTypeahead$ = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.guestsGroup = this.form.get('guests') as FormArray;

    if (this.users && this.users.length > 0) {
      this.users
        .filter(u => this.onlyGuests || u && u.userRoleId === UserRoleIdEnum.GUEST)
        .forEach(u => this.addGuest(u));
    }

    this.guests$ = this.guestTypeahead$
      .pipe(
        startWith(null),
        debounceTime(300),
        switchMap(query => this.userService.fetchAll({ dynamicFilter: query || '' }))
      );
  }

  ngOnDestroy() {
    this.guestsGroup.clear();
  }

  addGuest(data?: User): void {
    this.form.get('guestSelect').setValue(null, { emitEvent: false });
    const guests = this.guestsGroup.getRawValue();
    if (!data || guests.some(g => g.globalId === data.globalId)) {
      return;
    }
    const { globalId, email, fullName } = data;
    this.guestsGroup.push(this.fb.group({ globalId, email, fullName }));
  }
}
