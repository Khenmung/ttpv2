import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../../shared/components/home/home.component';
import { EducationhistoryComponent } from './educationhistory/educationhistory.component';
import { EmployeeComponent } from './employee/employee.component';
import { EmployeeactivityComponent } from '../employeeactivity/employeeactivity/employeeactivity.component';
import { EmployeeboardComponent } from './employeeboard/employeeboard.component';
import { EmployeedocumentsComponent } from './employeedocuments/employeedocuments.component';
import { EmployeesearchComponent } from './employeesearch/employeesearch.component';
import { EmployeeskillComponent } from './employeeskill/employeeskill.component';
import { FamilyComponent } from './family/family.component';
import { GradehistoryComponent } from './gradehistory/gradehistory.component';
import { WorkhistoryComponent } from './workhistory/workhistory.component';

const routes: Routes = [  
  {
    path: "", component: HomeComponent,
    children: [
      { path: "", component: EmployeesearchComponent },
      { path: "info", component: EmployeeboardComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeedetailRoutingModule { }
export const EmployeeDetailComponents = [
  EmployeeboardComponent,
  EmployeeComponent,
  EmployeedocumentsComponent,
  WorkhistoryComponent,
  EducationhistoryComponent,
  FamilyComponent,
  EmployeesearchComponent,
  EmployeeskillComponent,
  GradehistoryComponent
]
