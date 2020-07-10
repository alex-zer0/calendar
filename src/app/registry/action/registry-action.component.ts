import { Component, OnDestroy, HostBinding, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { AccessRules, DeclineReason, Meeting } from '@app/models';
import { RegistryActionSchema, schemas, REJECT_SCHEMA } from './schema';
import { DictionaryService } from '@app/services/dictionary.service';

@Component({
  selector: 'app-registry-action',
  templateUrl: './registry-action.component.html',
  styleUrls: ['./registry-action.component.scss']
})
export class RegistryActionModalComponent implements OnInit, OnDestroy {
  @HostBinding('class.modal-opened')
  isOpened: boolean;

  documents = [];
  form: FormGroup;
  linksGroup: FormArray;
  schema: RegistryActionSchema;
  declineReasons$: Observable<DeclineReason[]>;
  protected result$: Subject<{}>;

  constructor(
    private fb: FormBuilder,
    private dictionaryService: DictionaryService
  ) {}

  ngOnInit() {
    this.declineReasons$ = this.dictionaryService.getDeclineReasons();
  }

  ngOnDestroy() {
    if (this.result$) {
      this.close(false);
    }
  }

  open(rule: AccessRules, meeting: Meeting): Observable<any> {
    const isRejectConfirm = rule === AccessRules.REJECT && meeting && meeting.status.id === 50;
    this.schema = isRejectConfirm ? REJECT_SCHEMA : schemas[rule];
    const data = rule === AccessRules.CONFIRM_DECISION && meeting.resolution ? {
      comment: meeting.resolution.comment,
      link: meeting.resolution.description
    } : null;
    this.initForm(data);
    this.isOpened = true;
    this.result$ = new Subject<{}>();
    return this.result$.asObservable()
      .pipe(tap(() => this.isOpened = false));
  }

  save() {
    this.close({
      ...this.form.getRawValue(),
      files: this.documents || []
    });
  }

  close(result?: any) {
    this.result$.next(result);
    this.result$.complete();
  }

  addLink(): void {
    this.linksGroup.push(this.getLinkGroup());
  }

  uploadDocument(file: File, index: number): void {
    this.documents[index] = file;
  }

  removeDocument(index: number) {
    this.documents.splice(index, 1);
  }

  private initForm(data?: {[key: string]: string}): void {
    const form: {[key: string]: any} = {};
    const { fields } = this.schema;
    if (fields.includes('comment')) {
      form.comment = [null, Validators.required];
    }
    if (fields.includes('reason')) {
      form.comment = [null, Validators.required];
      form.declineReasonId = [null, Validators.required];
    }
    if (fields.includes('links')) {
      form.link = '';
    }
    if (fields.includes('rejectComment')) {
      form.comment = [null, Validators.required];
      form.declineReasonId = 2;
    }

    this.form = this.fb.group(form);

    if (data) {
      this.form.patchValue(data);
    }

    if (fields.includes('links')) {
      this.linksGroup = this.form.get('links') as FormArray;
    }
  }

  private getLinkGroup(): FormGroup {
    return this.fb.group({ link: [null, Validators.required] });
  }
}
