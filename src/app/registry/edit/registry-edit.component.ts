import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalComponent, ModalOptions } from '@app/shared/components/modal.component';
import { Meeting, User, FreeBusyData, AuthConfig } from '@models';
import { DateTime } from 'luxon';
import { tap, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UserService, FreeBusyService } from '@app/services';

@Component({
  selector: 'app-registry-edit',
  templateUrl: './registry-edit.component.html',
  styleUrls: ['./registry-edit.component.scss']
})
export class RegistryEditComponent extends ModalComponent implements OnInit {
  @Input() auth: AuthConfig;
  documents = [];
  meeting: Meeting;
  form: FormGroup;
  isFreeBusyLoaded = false;
  users$: Observable<User[]>;
  freeBusy$: Observable<FreeBusyData>;

  get isBuildComfortAdmin() {
    return this.auth.roleIds.includes(10);
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private freeBusyService: FreeBusyService,
  ) {
    super();
  }

  ngOnInit() {
    this.initForm();

    if (this.isBuildComfortAdmin) {
      this.users$ = this.form.get('objectId').valueChanges
        .pipe(
          debounceTime(300),
          switchMap((objectId) => {
            const livingComplexId = this.form.get('livingComplexId').value;
            if (!objectId || !livingComplexId) {
              return of([]);
            }
            return this.userService.fetchComfort({ objectId, livingComplexId });
          })
        );

      this.freeBusy$ = this.form.get('globalId').valueChanges
        .pipe(
          tap(() => {
            this.form.get('date').reset();
            this.form.get('time').reset({ start: null, end: null });
            this.isFreeBusyLoaded = false;
          }),
          switchMap((globalId) => {
            if (!globalId) {
              return of({});
            }
            return this.freeBusyService.fetchById(globalId)
              .pipe(catchError(() => of({})));
          }),
          tap(() => this.isFreeBusyLoaded = true)
        );
    }
  }

  open(options: ModalOptions) {
    this.setFormData(options.data);
    return super.open(options)
      .pipe(tap(() => this.form.reset()));
  }

  save(): void {
    const { guestSelect, ...data } = this.form.getRawValue();
    this.close(data);
  }

  uploadDocument(file: File, index: number): void {
    this.documents[index] = file;
  }

  removeDocument(index: number) {
    this.documents.splice(index, 1);
  }

  private initForm(): void {
    this.form = this.fb.group({
      livingComplexId: [null, Validators.required],
      objectId: [null, Validators.required],
      metaInfo: this.fb.group({
        sections: this.fb.array([], Validators.required)
      }),
      checkLists: this.fb.array([], Validators.required),
      ...(this.isBuildComfortAdmin ? {
        globalId: [null, Validators.required],
        time: this.fb.group({
          start: [null, Validators.required],
          end: [null, [Validators.required, this.validateTime.bind(this)]]
        }, { validator: this.validateTime }),
        date: [null, Validators.required]
      } : null)
    });
  }

  private setFormData(meeting: Meeting): void {
    const { object: { livingComplexId }, metaInfo, users, ...rest } = meeting;
    this.form.patchValue({ ...rest, livingComplexId });
    this.meeting = meeting;
    if (this.isBuildComfortAdmin) {
      const start = DateTime.fromISO(this.meeting.meetingStartDate).toFormat('HH:mm');
      const end = DateTime.fromISO(this.meeting.meetingEndDate).toFormat('HH:mm');
      const { globalId } = users.find(u => u.userRoleId === 1002) || { globalId: null };
      this.form.patchValue({ globalId, time: { start, end }, date: this.meeting.meetingStartDate });
    }
  }

  private validateTime = (formGroup: FormGroup): void => {
    if (!formGroup.get('start') || !formGroup.get('end')) {
      return;
    }
    const isValid = formGroup.get('start').value < formGroup.get('end').value;
    formGroup.get('start').setErrors(isValid ? null : { time: true });
  }
}
