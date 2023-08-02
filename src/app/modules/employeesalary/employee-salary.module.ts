import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { employeesalaryComponents, EmployeeSalaryRoutingModule } from './employee-salary-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxPrintModule } from 'ngx-print';

@NgModule({
  declarations: [employeesalaryComponents],
  imports: [
    CommonModule,
    EmployeeSalaryRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    SharedhomepageModule,
    NgxPrintModule
  ],
  exports:[employeesalaryComponents],
  //providers:[{provide: MAT_DATE_LOCALE, useValue: 'en-GB'}]
})
export class EmployeeManagementModule { }
