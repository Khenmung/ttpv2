import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeLeaveComponent } from './employee-leave/employee-leave.component';
import { LeaveBalanceComponent } from './LeaveBalance/leavebalance.component';
import { LeaveboardComponent } from './leaveboard/leaveboard.component';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { LeavepolicyComponent } from './leavepolicy/leavepolicy.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [
      { path: "", component: LeaveboardComponent },
      { path: "gleave", component: LeaveBalanceComponent },
      { path: "empleave", component: EmployeeLeaveComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveManagementRoutingModule { }
export const LeaveManagementComponents=[
  LeaveBalanceComponent,
  EmployeeLeaveComponent,
  LeaveboardComponent,
  LeavepolicyComponent
]
