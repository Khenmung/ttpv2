import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { AttendanceboardComponent } from './attendanceboard/attendanceboard.component';
import { AbsentListComponent } from './absentlist/absentlist.component';
import { AttendanceCountComponent } from './attendancecount/attendancecount.component';
//import { EmployeetotalattendanceComponent } from '../EmployeeAttendance/employeetotalattendance/employeetotalattendance.component';
import { StudentAttendanceComponent } from './studentattendance/studentattendance.component';
import { StudenttotalattendanceComponent } from './studenttotalattendance/studenttotalattendance.component';
//import { EmployeeAttendanceComponent } from '../EmployeeAttendance/employeeattendance/employeeattendance.component';
import { AttendancepercentComponent } from './attendancepercent/attendancepercent.component';
import { StudentattendancereportComponent } from '../attendance/studentattendancereport/studentattendancereport.component';
import { DefaulterComponent } from './defaulter/defaulter.component';

const routes: Routes = [
  {path:'',component:HomeComponent,
  children:[
    {path:'',component:AttendanceboardComponent},
    //{path:'teacher',component:EmployeeAttendanceComponent}
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }
export const AttendanceComponents=[
  AttendanceboardComponent,
  StudentAttendanceComponent,
  StudentattendancereportComponent,
  AttendanceboardComponent, 
  StudenttotalattendanceComponent, 
  AttendanceCountComponent,
  AbsentListComponent,
  AttendancepercentComponent,
  DefaulterComponent
]

