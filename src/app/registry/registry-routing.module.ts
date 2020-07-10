import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistryComponent } from './registry.component';

const routes: Routes = [
  {
    path: '',
    component: RegistryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistryRoutingModule { }
