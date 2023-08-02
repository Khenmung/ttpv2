import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material/material.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SharedataService } from '../../shared/sharedata.service'
import { FlexLayoutModule } from '@angular/flex-layout';
import { AuthComponents, AuthenticationRoutingModule } from './authentication-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { GlobaladminInitialModule } from '../globaladmininitial/globaladminInitial.module';
import { AboutttpComponent } from './aboutttp/aboutttp.component';

@NgModule({
  declarations: [AuthComponents, AboutttpComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    FlexLayoutModule,
    SharedhomepageModule,
    AuthenticationRoutingModule,
    GlobaladminInitialModule
  ],
  exports: [
    AuthComponents
  ],
  providers: [SharedataService]
})
export class AuthModule { }
