import { AfterViewInit, ChangeDetectorRef, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AccountNatureComponent } from '../accountnature/accountnature.component';
import { BalancesheetComponent } from '../balancesheet/balancesheet.component';
import { JournalEntryComponent } from '../JournalEntry/JournalEntry.component';
import { LedgerAccountComponent } from '../ledgeraccount/ledgeraccount.component';
import { LedgerBalanceComponent } from '../ledgerbalance/ledgerbalance.component';
import { ProfitandlossComponent } from '../profitandloss/profitandloss.component';
import { TrialBalanceComponent } from '../trial-balance/trial-balance.component';

@Component({
  selector: 'app-accountingboard',
  templateUrl: './accountingboard.component.html',
  styleUrls: ['./accountingboard.component.scss']
})
export class AccountingboardComponent implements AfterViewInit {
  components:any = [
    AccountNatureComponent,
    LedgerAccountComponent,
    JournalEntryComponent,
    LedgerBalanceComponent,
    TrialBalanceComponent,
    ProfitandlossComponent,
    BalancesheetComponent
  ];
  LoginUserDetail=[];
  tabNames = [
    { 'label': 'Plan', 'faIcon': '' },
    { 'label': 'Plan Feature', 'faIcon': '' },  
    { 'label': 'Plan Feature', 'faIcon': '' },    
    { 'label': 'Plan Feature', 'faIcon': '' },    
    { 'label': 'Plan Feature', 'faIcon': '' }, 
    { 'label': 'Plan Feature', 'faIcon': '' },
    { 'label': 'Plan Feature', 'faIcon': '' }
  ];

  Permissions =
    {
      ParentPermission: '',
      AccountingVoucherPermission: '',
      TrialBalancePermission: '',
      LedgerAccountPermission: ''
    };

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private contentservice: ContentService,
    ) {
  }

  public ngAfterViewInit(): void {
    debugger
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.accounting.ACCOUNTING)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;

    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.accounting.JOURNALENTRY)
    var comindx = this.components.indexOf(JournalEntryComponent);
    this.GetComponents(perObj,comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.accounting.TRIALBALANCE)
    var comindx = this.components.indexOf(TrialBalanceComponent);
    this.GetComponents(perObj,comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.accounting.ACCOUNTS)
    var comindx = this.components.indexOf(LedgerAccountComponent);
    this.GetComponents(perObj,comindx)
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.accounting.ACCOUNTNATURE)
    var comindx = this.components.indexOf(AccountNatureComponent);
    this.GetComponents(perObj,comindx)
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.accounting.LEDGERBALANCE)
    var comindx = this.components.indexOf(LedgerBalanceComponent);
    this.GetComponents(perObj,comindx)
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.accounting.INCOMESTATEMENT)
    var comindx = this.components.indexOf(ProfitandlossComponent);
    this.GetComponents(perObj,comindx)
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.accounting.BALANCESHEET)
    var comindx = this.components.indexOf(BalancesheetComponent);
    this.GetComponents(perObj,comindx)

    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
    setTimeout(() => {
    this.renderComponent(0);
      this.cdr.detectChanges();
    }, 250); 
  }
  GetComponents(perObj, comindx) {
    if (perObj.length > 0) {
      if (perObj[0].permission == 'deny') {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }
      else {
        this.tabNames[comindx].faIcon = perObj[0].faIcon;
        this.tabNames[comindx].label = perObj[0].label;
      }
    }
    else {
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
    }
  }
  public tabChange(index: number) {
    //    //console.log("index", index)
    setTimeout(() => {
      this.renderComponent(index);
    }, 1000);

  }
  selectedIndex = 0;


  private renderComponent(index: number): any {
    
    this.viewContainer.createComponent(this.components[index]);
    //ClassprerequisiteComponent this.componentFactoryResolver.resolveComponentFactory
  }
}
