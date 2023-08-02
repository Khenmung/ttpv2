import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentComponents, StudentRoutingModule } from './student-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxPrintModule } from 'ngx-print';
import { StudentviewComponent } from './studentview/studentview.component';

@NgModule({
  declarations: [StudentComponents],
  imports: [
    CommonModule,
    StudentRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
    SharedhomepageModule,
    FlexLayoutModule,
    NgxPrintModule,
  ],
  exports:[StudentComponents]
})
export class StudentModule { }
