import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdmissionComponents, AdmissionRoutingModule } from './admission-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { MaterialModule } from '../../shared/material/material.module';
import { StudenthistoryComponent } from './studenthistory/studenthistory.component';
import { StudentstatusComponent } from './studentstatus/studentstatus.component';


@NgModule({
  declarations: [
    AdmissionComponents,
    StudentstatusComponent,
    
  ],
  imports: [
    CommonModule,
    AdmissionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SharedhomepageModule,
    MaterialModule
  ],
  exports:[
    AdmissionComponents
  ]
})
export class AdmissionModule { }
