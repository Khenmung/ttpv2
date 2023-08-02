import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GlobalAdminInitialComponents, GlobaladminInitialRoutingModule } from './globaladminInitial-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ControlModule } from '../control/control.module';


@NgModule({
  declarations: [GlobalAdminInitialComponents],
  imports: [
    CommonModule,
    GlobaladminInitialRoutingModule,
    SharedModule,
    SharedhomepageModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    ControlModule
    //DefinePagesModule
  ],
  exports:[GlobalAdminInitialComponents]
})
export class GlobaladminInitialModule { }
