import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeDataComponents, EmployeeRoutingModule } from './employee-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';


@NgModule({
  declarations: [EmployeeDataComponents],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SharedhomepageModule,
    MaterialModule,
    EmployeeRoutingModule  
  ]
})
export class EmployeeModule { }
