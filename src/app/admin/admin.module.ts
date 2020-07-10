import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { NgxsModule } from '@ngxs/store';

import { AdminStore } from './state/admin.state';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminUsersComponent } from './users/admin-users.component';
import { AdminEditUserComponent } from './edit-user/edit-user.component';
import { AdminNotificationsComponent } from './notifications/admin-notifications.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule,

    NgxsModule.forFeature([AdminStore])
  ],
  declarations: [
    AdminComponent,
    AdminUsersComponent,
    AdminEditUserComponent,
    AdminNotificationsComponent,
    AdminDashboardComponent
  ]
})
export class AdminModule {}
