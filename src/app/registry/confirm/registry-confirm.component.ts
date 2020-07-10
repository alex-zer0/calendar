import { Component, OnInit } from '@angular/core';
import { ModalComponent, ModalOptions } from '@app/shared/components/modal.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Meeting, User, FreeBusyData } from '@models';
import { tap, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UserService, FreeBusyService } from '@app/services';

@Component({
  selector: 'app-registry-confirm',
  templateUrl: './registry-confirm.component.html',
  styleUrls: ['./registry-confirm.component.scss']
})
export class RegistryConfirmComponent extends ModalComponent implements OnInit {
  documents = [];
  meeting: Meeting;
  form: FormGroup;
  isFreeBusyLoaded = false;
  users$: Observable<User[]>;
  freeBusy$: Observable<FreeBusyData>;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private freeBusyService: FreeBusyService,
  ) {
    super();
  }

  ngOnInit() {
    this.initForm();

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
        tap(() => this.isFreeBusyLoaded = false),
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
      globalId: [null, Validators.required],
      metaInfo: this.fb.group({
        sections: this.fb.array([], Validators.required)
      }),
      checkLists: this.fb.array([], Validators.required),
      time: this.fb.group({
        start: [null, Validators.required],
        end: [null, [Validators.required, this.validateTime.bind(this)]]
      }, { validator: this.validateTime }),
      date: [null, Validators.required]
    });
  }

  private validateTime = (formGroup: FormGroup): void => {
    if (!formGroup.get('start') || !formGroup.get('end')) {
      return;
    }
    const isValid = formGroup.get('start').value < formGroup.get('end').value;
    formGroup.get('start').setErrors(isValid ? null : { time: true });
  }

  private setFormData(meeting: Meeting): void {
    const { livingComplexId } = meeting.object;
    this.form.patchValue({ ...meeting, livingComplexId });
    this.meeting = meeting;
  }
}
