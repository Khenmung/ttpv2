import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeactivityModuleComponent, EmployeeactivityRoutingModule } from './employeeactivity-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { MaterialModule } from 'src/app/shared/material/material.module';


@NgModule({
  declarations: [EmployeeactivityModuleComponent],
  imports: [
    CommonModule,
    EmployeeactivityRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    SharedModule,
    SharedhomepageModule,
    MaterialModule
  ],
  exports:[EmployeeactivityModuleComponent]
})
export class EmployeeactivityModule { }
