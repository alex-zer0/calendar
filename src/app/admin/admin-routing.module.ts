import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminUsersComponent } from './users/admin-users.component';
import { AdminNotificationsComponent } from './notifications/admin-notifications.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'users'
      },
      {
        path: 'users',
        component: AdminUsersComponent
      },
      {
        path: 'notifications',
        component: AdminNotificationsComponent
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
