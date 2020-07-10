import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ObjectService, LivingComplexService } from '@services';
import { Observable, of } from 'rxjs';
import { WorkObject, LivingComplex } from '@models';
import { switchMap, startWith, tap, debounceTime, takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@app/base.component';

@Component({
  selector: 'app-work-object-control',
  templateUrl: './work-object-control.component.html',
  styleUrls: ['./work-object-control.component.scss']
})
export class WorkObjectControlComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;
  @Input() sections: any;
  @Input() hideLC: boolean;

  formSections: FormArray;
  livingComplexControl: FormControl;
  objectControl: FormControl;
  livingComplexes$: Observable<LivingComplex[]>;
  objects$: Observable<WorkObject[]>;

  constructor(
    private fb: FormBuilder,
    private objectService: ObjectService,
    private livingComplexService: LivingComplexService
  ) {
    super();
  }

  ngOnInit() {
    this.livingComplexControl = this.form.get('livingComplexId') as FormControl;
    this.objectControl = this.form.get('objectId') as FormControl;
    this.formSections = this.form.get('metaInfo').get('sections') as FormArray;
    let initialObjectId = this.objectControl.value;

    if (this.sections) {
      this.sections.forEach(section => this.addSection(section));
    } else {
      this.addSection();
    }

    this.livingComplexes$ = this.livingComplexService
      .fetchAll({ sortBy: 'name', limit: 1000 });
    this.objects$ = this.livingComplexControl.valueChanges
      .pipe(
        startWith(this.livingComplexControl.value),
        tap(id => id ? this.objectControl.enable() : this.objectControl.disable()),
        switchMap((livingComplexId) => {
          if (!livingComplexId) {
            return of([]);
          }
          return this.objectService.fetchByLivingComplexId({
            livingComplexId, limit: 500, sortBy: 'commercialName'
          });
        })
      );

    this.objectControl.valueChanges
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((objectId) => {
        if (initialObjectId == null || initialObjectId !== objectId) {
          this.formSections.clear();
          this.addSection();
          initialObjectId = null;
        }
      });

    if (!this.hideLC) {
      this.livingComplexControl.valueChanges
        .pipe(
          debounceTime(100),
          takeUntil(this.ngDestroy$)
        )
        .subscribe(() => {
          this.objectControl.reset();
          this.formSections.clear();
          this.addSection();
        });
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.formSections.clear();
  }

  addSection(data?: any): void {
    const section = this.getSection();
    if (data) {
      section.patchValue({
        sectionId: data.sectionId,
        sectionName: data.sectionName,
        floorNames: data.floors ? data.floors.map(f => f.name) : [],
        realEstateNames: data.realEstates ? data.realEstates.map(f => f.name) : [],
        floors: data.floors ? data.floors.map(f => f.id) : [],
        realEstates: data.realEstates ? data.realEstates.map(f => f.id) : [],
      });
    }
    this.formSections.push(section);
  }

  private getSection(): FormGroup {
    return this.fb.group({
      sectionId: [null, Validators.required],
      sectionName: '',
      floors: [[]],
      floorNames: '',
      realEstates: [[]],
      realEstateNames: '',
    });
  }
}
