import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { EmployeeAttendanceComponent } from './employeeattendance/employeeattendance.component';
import { EmployeeattendanceboardComponent } from './employeeattendanceboard/employeeattendanceboard.component';
import { EmployeeAttendanceReportComponent } from './employeeattendancereport/employeeattendancereport.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      { path: '', component: EmployeeattendanceboardComponent },
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeattendanceRoutingModule { }
export const EmployeeAttendanceComponents = [
  EmployeeAttendanceComponent,
  EmployeeattendanceboardComponent,
  EmployeeAttendanceReportComponent

]
