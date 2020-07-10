import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgDefinitionsComponent } from './components/svg-definitions.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { PageLockerComponent } from './components/page-locker.component';
import { ModalComponent } from './components/modal.component';
import { UserPhotoComponent } from './components/user-photo/user-photo.component';
import { DatePickerComponent } from './components/date-picker.component';

import { InfiniteScrollDirective } from './directives/infinite-scroll.directive';
import { TextHighlightPipe } from './pipes/text-highlight.pipe';
import { WorkObjectControlComponent } from './components/work-object-control/work-object-control.component';
import { WorkTypesControlComponent } from './components/work-types-control/work-types-control.component';
import { GuestsControlComponent } from './components/guests-control/guests-control.component';
import { WorkSectionControlComponent } from './components/work-section-control/work-section-control.component';
import { WorkTimeControlComponent } from './components/work-time-control/work-time-control.component';
import { InfoModalComponent } from './components/info-modal.component';
import { PaginationComponent } from './components/pagination/pagination.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgSelectModule
  ],
  declarations: [
    SvgDefinitionsComponent,
    FileUploadComponent,
    DatePickerComponent,
    PageLockerComponent,
    UserPhotoComponent,
    PaginationComponent,
    ModalComponent,
    InfoModalComponent,
    WorkObjectControlComponent,
    WorkTypesControlComponent,
    WorkSectionControlComponent,
    WorkTimeControlComponent,
    GuestsControlComponent,

    InfiniteScrollDirective,
    TextHighlightPipe
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgSelectModule,

    SvgDefinitionsComponent,
    FileUploadComponent,
    DatePickerComponent,
    PageLockerComponent,
    UserPhotoComponent,
    PaginationComponent,
    ModalComponent,
    InfoModalComponent,
    WorkObjectControlComponent,
    WorkTypesControlComponent,
    WorkSectionControlComponent,
    WorkTimeControlComponent,
    GuestsControlComponent,

    InfiniteScrollDirective,
    TextHighlightPipe
  ]
})
export class SharedModule { }
