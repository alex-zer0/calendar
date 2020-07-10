import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { SectionService, FloorService } from '@services';
import { map, switchMap, startWith, tap, debounceTime } from 'rxjs/operators';
import { Section, Floor, RealEstate } from '@models';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-work-section-control',
  templateUrl: './work-section-control.component.html',
  styleUrls: ['./work-section-control.component.scss']
})
export class WorkSectionControlComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() index: number;
  @Output() onRemove = new EventEmitter();

  sectionsGroup: FormArray;
  livingComplexControl: FormControl;
  objectControl: FormControl;
  sectionControl: FormControl;
  floorControl: FormControl;
  realEstatesControl: FormControl;
  sectionGroup: FormGroup;

  sections$: Observable<Section[]>;
  floors$: Observable<Floor[]>;
  realEstates$: Observable<RealEstate[]>;

  constructor(
    private sectionService: SectionService,
    private floorService: FloorService,
  ) {}

  ngOnInit() {
    const sections = this.form.get('metaInfo').get('sections') as FormArray;
    this.sectionGroup = sections.at(this.index) as FormGroup;
    this.livingComplexControl = this.form.get('livingComplexId') as FormControl;
    this.objectControl = this.form.get('objectId') as FormControl;
    this.sectionControl = this.sectionGroup.get('sectionId') as FormControl;
    this.realEstatesControl = this.sectionGroup.get('realEstates') as FormControl;
    this.floorControl = this.sectionGroup.get('floors') as FormControl;

    let initialSectionId = this.sectionControl.value;
    let initialFloorId = this.floorControl.value;

    this.sections$ = this.objectControl.valueChanges
      .pipe(
        startWith(this.objectControl.value),
        tap(id => this.toggleEnable(this.sectionControl, !!id)),
        debounceTime(100),
        switchMap((objectId) => {
          if (objectId == null || this.livingComplexControl.value == null) {
            return of([]);
          }
          const livingComplexIds = [this.livingComplexControl.value];
          return this.sectionService.fetchAll({ livingComplexIds, objectIds: [objectId] });
        })
      );
    this.floors$ = this.sectionControl.valueChanges
      .pipe(
        startWith(initialSectionId),
        tap((sectionId) => {
          if (initialSectionId == null || initialSectionId !== sectionId) {
            this.floorControl.reset([]);
            this.realEstatesControl.reset([]);
            initialSectionId = null;
          }
          this.toggleEnable(this.floorControl, false);
          this.toggleEnable(this.realEstatesControl, !!sectionId);
        }),
        debounceTime(100),
        switchMap((sectionId) => {
          if (sectionId == null || this.livingComplexControl.value == null) {
            return of([]);
          }
          const livingComplexIds = [this.livingComplexControl.value];
          const objectIds = [this.objectControl.value];
          return this.floorService.fetchAll({
            livingComplexIds,
            objectIds,
            sortAsNumeric: true,
            sectionIds: [sectionId]
          });
        }),
        tap(res => this.toggleEnable(this.floorControl, res.length > 0))
      );
    this.realEstates$ = this.floorControl.valueChanges
      .pipe(
        startWith(initialFloorId),
        tap((floorId) => {
          if (initialFloorId == null || initialFloorId !== floorId) {
            this.realEstatesControl.reset([]);
            initialFloorId = null;
          }
          this.toggleEnable(this.realEstatesControl, false);
        }),
        debounceTime(100),
        switchMap((floorIds) => {
          if (!floorIds || !floorIds.length || !this.livingComplexControl.value) {
            return of([]);
          }
          const livingComplexIds = [this.livingComplexControl.value];
          const objectIds = [this.objectControl.value];
          const sectionIds = [this.sectionControl.value];
          return this.floorService.fetchAll({ livingComplexIds, objectIds, sectionIds, floorIds: floorIds.join(',') });
        }),
        map(floors => floors.reduce((arr, nx) => arr.concat(nx.realEstates), [])),
        tap(res => this.toggleEnable(this.realEstatesControl, res.length > 0))
      );
  }

  setNames(arr: any[], key: string, field: string) {
    if (!arr || !this.sectionGroup) {
      return;
    }
    const control = this.sectionGroup.get(key);
    if (control) {
      control.setValue(arr.map(a => a[field]));
    }
  }

  private toggleEnable(control: FormControl, isEnabled: boolean) {
    return isEnabled ? control.enable() : control.disable();
  }
}
