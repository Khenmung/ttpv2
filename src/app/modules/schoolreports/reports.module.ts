import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material/material.module';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher, MAT_DATE_LOCALE } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxFileDropModule } from 'ngx-file-drop';
import { SchoolReportsComponents, SchoolReportsRoutingModule } from './reports-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { MatTableModule } from '@angular/material/table';
import { TouchedErrorStateMatcher } from 'src/app/shared/formvalidation';
import { NgxPrintModule } from 'ngx-print';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    SchoolReportsComponents    
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    NgxFileDropModule,
    SchoolReportsRoutingModule,
    SharedhomepageModule,
    MatTableModule,
    NgxPrintModule,    
    NgChartsModule
  ],
  providers:[
    { provide: ErrorStateMatcher, useClass: TouchedErrorStateMatcher },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  exports:[SchoolReportsComponents]
})
export class SchoolReportsModule { }
