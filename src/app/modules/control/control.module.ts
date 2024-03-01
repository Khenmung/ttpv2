import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminsettingsRoutingModule, settingsComponent } from './control-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material/material.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { SchoolReportsModule } from '../schoolreports/reports.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxPrintModule } from 'ngx-print';

@NgModule({
  declarations: [settingsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AdminsettingsRoutingModule,
    SharedhomepageModule,
    SchoolReportsModule,
    FlexLayoutModule,
    NgxPrintModule
    //GlobaladminInitialModule
  ],
  exports:[settingsComponent]
})
export class ControlModule { }
