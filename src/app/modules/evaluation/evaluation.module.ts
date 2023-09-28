import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EvaluationComponents, EvaluationRoutingModule } from './evaluation-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { NgxPrintModule } from 'ngx-print';
import { SharedModule } from '../../shared/shared.module';

import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
//import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import {NgxMatTimepickerModule} from 'ngx-mat-timepicker';
@NgModule({
  declarations: [
    EvaluationComponents,
          
  ],
  imports: [
    CommonModule,
    EvaluationRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    SharedhomepageModule,
    NgxPrintModule,
    SharedModule,
    //NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatMomentModule
    
  ],
  exports:[
    EvaluationComponents
  ]
})
export class EvaluationModule { }
