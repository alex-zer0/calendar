import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';

import { RegistryRoutingModule } from './registry-routing.module';
import { RegistryComponent } from './registry.component';
import { NgxsModule } from '@ngxs/store';
import { RegistryStore } from './state/registry.state';
import { RegistryEditComponent } from './edit/registry-edit.component';
import { RegistryActionModalComponent } from './action/registry-action.component';
import { RegistryMeetingComponent } from './meeting/registry-meeting.component';
import { RegistryConfirmComponent } from './confirm/registry-confirm.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RegistryRoutingModule,

    NgxsModule.forFeature([RegistryStore])
  ],
  declarations: [
    RegistryComponent,
    RegistryMeetingComponent,
    RegistryEditComponent,
    RegistryConfirmComponent,
    RegistryActionModalComponent
  ]
})
export class RegistryModule {}
