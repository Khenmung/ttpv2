import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyLeaveComponent } from './myleave/myleave.component';
import { LeaveBalanceComponent } from './LeaveBalance/leavebalance.component';
import { LeaveboardComponent } from './leaveboard/leaveboard.component';
import { HomeComponent } from '../../shared/components/home/home.component';
import { LeavepolicyComponent } from './leavepolicy/leavepolicy.component';
import { LeaveRequestsComponent } from './leaverequests/leaverequests.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [
      { path: "", component: LeaveboardComponent },
      { path: "gleave", component: LeaveBalanceComponent },
      { path: "empleave", component: MyLeaveComponent }
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
  LeaveRequestsComponent,
  MyLeaveComponent,
  LeaveboardComponent,
  LeavepolicyComponent
]
