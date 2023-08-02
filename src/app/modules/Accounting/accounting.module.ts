import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountingComponents, AccountingRoutingModule } from './accounting-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StudentSubjectModule } from '../ClassSubject/student-subject.module';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ErrorStateMatcher, MAT_DATE_LOCALE } from '@angular/material/core';
import { TouchedErrorStateMatcher } from 'src/app/shared/formvalidation';
import { ProfitandlossComponent } from './profitandloss/profitandloss.component';
import { BalancesheetComponent } from './balancesheet/balancesheet.component';


@NgModule({
  declarations: [AccountingComponents, ProfitandlossComponent, BalancesheetComponent],
  imports: [
    CommonModule,
    AccountingRoutingModule,
    SharedhomepageModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    StudentSubjectModule,
    MaterialModule,
    MatAutocompleteModule
  ],
  exports:[AccountingComponents],
  providers:[
    { provide: ErrorStateMatcher, useClass: TouchedErrorStateMatcher },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
})
export class AccountingModule { }
