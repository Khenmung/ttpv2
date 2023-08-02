import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { EmployeeactivityComponent } from './employeeactivity/employeeactivity.component';
import { EmployeeactivityboardComponent } from './employeeactivityboard/employeeactivityboard.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [
      { path: "", component: EmployeeactivityboardComponent },
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeactivityRoutingModule { }
export const EmployeeactivityModuleComponent=[
  EmployeeactivityComponent,
  EmployeeactivityboardComponent
];
