import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeSalaryComponentComponent } from './employee-salary-component/employee-salary-component.component';
import { EmpComponentsComponent } from './emp-components/emp-components.component';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { EmpmanagementboardComponent } from './empmanagementboard/empmanagementboard.component';
import { VariableConfigComponent } from './variable-config/variable-config.component';
import { SalaryslipComponent } from './salaryslip/salaryslip.component';
import { EmployeeGradehistoryComponent } from './employee-gradehistory/employee-gradehistory.component';

const routes: Routes = [
  {
    path:"",component:HomeComponent,
    children:[
      {path:"",component:EmpmanagementboardComponent},
      //{path:"emphistory",component:EmployeeGradehistoryComponent},
      //{path:"empsalcomp",component:EmployeeSalaryComponentComponent},     
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeSalaryRoutingModule { }
export const employeesalaryComponents=[
  EmpComponentsComponent,
  EmployeeSalaryComponentComponent,
  EmpmanagementboardComponent,
  VariableConfigComponent,
  SalaryslipComponent,
  EmployeeGradehistoryComponent
]