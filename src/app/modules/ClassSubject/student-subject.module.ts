import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentSubjectComponents, StudentSubjectRoutingModule } from './student-subject-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material/material.module';
import { SharedModule } from '../../shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxPrintModule } from 'ngx-print';
import { SubjectcomponentComponent } from './subjectcomponent/subjectcomponent.component';

@NgModule({
  declarations: [StudentSubjectComponents],
  imports: [
    CommonModule,
    SharedhomepageModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MaterialModule,
    MatDialogModule,
    FlexLayoutModule,
    NgxPrintModule,
    StudentSubjectRoutingModule,
    
    MatDatepickerModule
  ],
  
  exports:[StudentSubjectComponents]
})
export class StudentSubjectModule { }
