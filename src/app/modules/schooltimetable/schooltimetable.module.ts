import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchooltimetableRoutingModule, SchoolTimeTableComponents } from './schooltimetable-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { NgxPrintModule } from 'ngx-print';

@NgModule({
  declarations: [SchoolTimeTableComponents],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    SharedhomepageModule,
    MaterialModule,
    NgxPrintModule,
    SchooltimetableRoutingModule
  ],
  exports:[SchoolTimeTableComponents]
})
export class SchooltimetableModule { }
