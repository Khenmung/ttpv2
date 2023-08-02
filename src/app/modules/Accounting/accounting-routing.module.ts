import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { JournalEntryComponent } from './JournalEntry/JournalEntry.component';
import { AccountingboardComponent } from './accountingboard/accountingboard.component';
import { TrialBalanceComponent } from './trial-balance/trial-balance.component';
import { LedgerAccountComponent } from './ledgeraccount/ledgeraccount.component';
import { AccountNatureComponent } from './accountnature/accountnature.component';
import { LedgerBalanceComponent } from './ledgerbalance/ledgerbalance.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [
      { path: "", component: AccountingboardComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingRoutingModule { }
export const AccountingComponents=[
  JournalEntryComponent,
  TrialBalanceComponent,
  AccountingboardComponent,
  LedgerAccountComponent,
  AccountNatureComponent,
  LedgerBalanceComponent
]
