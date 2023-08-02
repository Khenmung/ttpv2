import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeAttendanceComponents, EmployeeattendanceRoutingModule } from './employeeattendance-routing.module';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedhomepageModule } from '../sharedhomepage.module';


@NgModule({
  declarations: [EmployeeAttendanceComponents],
  imports: [    
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    SharedhomepageModule,
    EmployeeattendanceRoutingModule
  ],
  exports:[EmployeeAttendanceComponents],
})
export class EmployeeattendanceModule { }

