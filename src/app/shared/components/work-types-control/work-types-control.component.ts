import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ChecklistService } from '@services';
import { map, takeUntil, withLatestFrom } from 'rxjs/operators';
import { MeetingCheckList, WorkChecklistItem, CheckListControlTypes } from '@models';
import { Observable } from 'rxjs';
import { BaseComponent } from '@app/base.component';
import { RootStore } from '@app/state/root.state';
import { Select } from '@ngxs/store';

@Component({
  selector: 'app-work-types-control',
  templateUrl: './work-types-control.component.html',
  styleUrls: ['./work-types-control.component.scss']
})
export class WorkTypesControlComponent extends BaseComponent implements OnInit, OnDestroy {
  @Select(RootStore.isIC) isIC$: Observable<boolean>;

  @Input() form: FormGroup;
  @Input() checkLists: MeetingCheckList[];

  checkListsGroup: FormArray;
  checklists$: Observable<WorkChecklistItem[]>;

  constructor(
    private fb: FormBuilder,
    private checklistService: ChecklistService
  ) {
    super();
  }

  ngOnInit() {
    this.checkListsGroup = this.form.get('checkLists') as FormArray;
    const firstGroup = this.getCheckListGroup();
    this.checkListsGroup.push(firstGroup);

    if (this.checkLists && this.checkLists.length) {
      firstGroup.patchValue(this.checkLists[0]);
      this.checkLists.slice(1).forEach(c => c && this.addCheckList(c));
    }
    this.checklists$ = this.checklistService.fetchAll()
      .pipe(map(this.groupChecklistByTitle));

    this.form.get('metaInfo').get('sections').valueChanges
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(v =>
        v.some(s => s.sectionId != null) ? this.checkListsGroup.enable() : this.checkListsGroup.disable());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.checkListsGroup.clear();
  }

  addCheckList(data?: MeetingCheckList): void {
    const formGroup = this.getCheckListGroup();
    if (data) {
      formGroup.patchValue(data);
    }
    this.checkListsGroup.push(formGroup);
  }

  onChangeCheckList(item: WorkChecklistItem, control: FormGroup) {
    if (item) {
      control.get('checklistTitle').setValue(item.title);
      control.get('controlTypes').setValue(item.controlTypes);
    }
  }

  isDecoration(types: string[]): boolean {
    return types ? types.includes(CheckListControlTypes.DECORATION) : false;
  }

  private getCheckListGroup(): FormGroup {
    const group = this.fb.group({
      checklistId: [null, Validators.required],
      checklistTitle: '',
      controlTypes: [[]],
      axis: [null, Validators.required],
      highMark: [null, Validators.required],
      scope: null
    });

    group.get('controlTypes').valueChanges
      .pipe(
        takeUntil(this.ngDestroy$),
        withLatestFrom(this.isIC$)
      )
      .subscribe(([types, isIC]) => {
        const validators = !isIC || this.isDecoration(types) ? [] : [Validators.required];
        group.get('axis').setValidators(validators);
        group.get('axis').updateValueAndValidity();
        group.get('highMark').setValidators(validators);
        group.get('highMark').updateValueAndValidity();
      });

    return group;
  }

  private groupChecklistByTitle(checklist: WorkChecklistItem[]): WorkChecklistItem[] {
    return checklist.reduce((result, root) => {
      if (!root.childs || !root.childs.length) {
        return result;
      }
      const children = root.childs.reduce((pr, cur) => {
        if (!cur.childs || !cur.childs.length) {
          if (cur.isFolder) {
            return pr;
          }
          return pr.concat({ ...cur, groupTitle: root.title });
        }
        return pr.concat(
          cur.childs
            .filter(c => !c.isFolder)
            .map(c => ({ ...c, groupTitle: `${root.title} <span>${cur.title}</span>` }))
        );
      }, []);
      return result.concat(children);
    }, []);
  }
}
