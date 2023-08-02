import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveManagementComponents, LeaveManagementRoutingModule } from './leave-management-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [LeaveManagementComponents],
  imports: [
    CommonModule,
    LeaveManagementRoutingModule,
    SharedhomepageModule,
    MaterialModule,
    SharedModule,    
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule
  ],
  exports:[LeaveManagementComponents]
})
export class LeaveManagementModule { }
