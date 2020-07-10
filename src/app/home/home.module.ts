import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { HomeFeedbackComponent } from './feedback/home-feedback.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    HomeRoutingModule
  ],
  declarations: [
    HomeComponent,
    HomeFeedbackComponent
  ]
})
export class HomeModule {}
