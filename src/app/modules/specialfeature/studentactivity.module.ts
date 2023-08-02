import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentActivityComponents, StudentactivityRoutingModule } from './studentactivity-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { NgxPrintModule } from 'ngx-print';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';

@NgModule({
  declarations: [StudentActivityComponents],
  imports: [
    CommonModule,
    StudentactivityRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
    SharedhomepageModule,
    NgxPrintModule,
    FlexLayoutModule
  ]
})
export class StudentactivityModule { }
