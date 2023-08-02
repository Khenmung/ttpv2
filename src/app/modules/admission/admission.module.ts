import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdmissionComponents, AdmissionRoutingModule } from './admission-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { MaterialModule } from 'src/app/shared/material/material.module';


@NgModule({
  declarations: [
    AdmissionComponents
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
