import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@auth/core';
import { AccessRulesGuard } from './access-rules.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('app/home/home.module').then(m => m.HomeModule),
    canActivate: [AuthGuard, AccessRulesGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('app/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, AccessRulesGuard],
  },
  {
    path: 'operation-report',
    loadChildren: () => import('app/operation-report/operation-report.module').then(m => m.OperationReportModule),
    canActivate: [AuthGuard, AccessRulesGuard],
  },
  {
    path: 'registry',
    loadChildren: () => import('app/registry/registry.module').then(m => m.RegistryModule),
    canActivate: [AuthGuard, AccessRulesGuard],
  },
  {
    path: 'form',
    loadChildren: () => import('app/work-control/work-control.module').then(m => m.WorkControlModule),
    canActivate: [AuthGuard, AccessRulesGuard],
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
