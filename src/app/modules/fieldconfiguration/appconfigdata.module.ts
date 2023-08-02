import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppConfigComponents, AppconfigdataRoutingModule } from './appconfigdata-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';

@NgModule({
  declarations: [AppConfigComponents],
  imports: [
    CommonModule,
    AppconfigdataRoutingModule,
    SharedModule,
    SharedhomepageModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports:[AppConfigComponents]
})
export class AppconfigdataModule { }
