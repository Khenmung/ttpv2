import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import alasql from 'alasql';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IAccountingVoucher } from '../JournalEntry/JournalEntry.component';
import { IGeneralLedger } from '../ledgeraccount/ledgeraccount.component';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-trial-balance',
  templateUrl: './trial-balance.component.html',
  styleUrls: ['./trial-balance.component.scss']
})
export class TrialBalanceComponent implements OnInit {
  PageLoading = true;
  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) matsort: MatSort;


  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  AccountingVoucherListName = 'AccountingVouchers';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  filteredOptions: Observable<IGeneralLedger[]>;
  AccountingPeriod = [];
  SelectedApplicationId = 0;
  Permission = '';
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  GLAccounts = [];
  GeneralLedgers = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;SubOrgId = 0;
  AccountingVoucherList: IAccountingVoucher[] = [];
  dataSource: MatTableDataSource<IAccountingVoucher>;
  allMasterData = [];
  searchForm: UntypedFormGroup;
  TotalDebit = 0;
  TotalCredit = 0;
  TotalBalance=0;
  AccountingVoucherData = {
    AccountingVoucherId: 0,
    DocDate: new Date(),
    PostingDate: new Date(),
    Reference: '',
    LedgerId: 0,
    Debit: false,
    Amount: '',
    ShortText: '',
    OrgId: 0,SubOrgId: 0,
    Active: 0,
  };

  displayedColumns = [
    "AccountName",
    "Dr",
    "Cr",
    "Balance"
  ];
  //filteredOptions: Observable<IGLAccounts[]>;
  //Students: any;

  constructor(private servicework: SwUpdate,
    private datepipe: DatePipe,
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private contentservice: ContentService,
  ) { }
  MinDate :Date;
  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    var FinancialStartEnd = JSON.parse(this.tokenStorage.getSelectedBatchStartEnd());
    this.MinDate = FinancialStartEnd.StartDate;
    this.searchForm = this.fb.group({
      searchFromDate: [new Date()],
      searchToDate: [new Date()]
    });
    // this.filteredOptions = this.searchForm.get("searchGeneralLedgerId").valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => typeof value === 'string' ? value : value.TeacherName),
    //     map(TeacherName => TeacherName ? this._filter(TeacherName) : this.GeneralLedgers.slice())
    //   );
    this.PageLoad();
    //        this.GetTeachers();
  }
  // private _filter(name: string): ITeachers[] {

  //   const filterValue = name.toLowerCase();
  //   return this.Teachers.filter(option => option.TeacherName.toLowerCase().includes(filterValue));

  // }
  // displayFn(teacher: ITeachers): string {
  //   return teacher && teacher.TeacherName ? teacher.TeacherName : '';
  // }
  private _filter(name: string): IAccountingVoucher[] {

    const filterValue = name.toLowerCase();
    return this.GeneralLedgers.filter(option => option.GeneralLedgerName.toLowerCase().includes(filterValue));

  }
  displayFn(ledger: IGeneralLedger): string {
    return ledger && ledger.GeneralLedgerName ? ledger.GeneralLedgerName : '';
  }
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
      this.AccountingPeriod = JSON.parse(this.tokenStorage.getSelectedBatchStartEnd());

      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.accounting.TRIALBALANCE);
      if (perObj.length > 0) {

        this.Permission = perObj[0].permission;
        if (this.Permission != 'deny') {
          this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
          this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          //this.GetMasterData();
          this.GetGLAccounts();
          this.GetGeneralLedgerAutoComplete();
        }

      }
    }
  }
  updateDebitCredit(row, event) {
    row.Active = event.checked ? 1 : 0;
    row.Action = true;
  }
  addnew() {
    var newdata = {
      AccountingVoucherId: 0,
      DocDate: new Date(),
      PostingDate: new Date(),
      Reference: '',
      LedgerId: 0,
      Debit: false,
      Amount: '',
      ShortText: '',
      Active: 0,
      Action: true
    }
    //this.AccountingVoucherList.push(newdata);
    this.dataSource = new MatTableDataSource<IAccountingVoucher>(this.AccountingVoucherList);
  }

  GetAccountingVoucher() {
    let filterStr = this.FilterOrgSubOrg + " and LedgerId eq 0 and Active eq 1";
    debugger;
    this.loading = true;

    // var _GeneralLedgerId = this.searchForm.get("searchGeneralLedgerId").value.GeneralLedgerId;
    // if (_GeneralLedgerId == undefined) {
    //   this.loading = false;
    //   this.contentservice.openSnackBar("Please select account.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    // else {
    //   filterStr += " and GeneralLedgerAccountId eq " + _GeneralLedgerId
    // }

    //filterStr += " and PostingDate ge datetime'" + this.datepipe.transform(this.AccountingPeriod[0].StartDate, 'yyyy-MM-dd') + //T00:00:00.000Z
    //  "' and  PostingDate le datetime'" + this.datepipe.transform(this.AccountingPeriod[0].EndDate, 'yyyy-MM-dd') + "'";//T00:00:00.000Z
      filterStr += " and PostingDate ge " + this.datepipe.transform(this.searchForm.get("searchFromDate").value, 'yyyy-MM-dd') + //T00:00:00.000Z
      " and  PostingDate le " + this.datepipe.transform(this.searchForm.get("searchToDate").value, 'yyyy-MM-dd');//T00:00:00.000Z
    // if (_ClassId != 0)
    //   filterStr += " and ClassId eq " + _ClassId;

    let list: List = new List();
    list.fields = [
      "AccountingVoucherId",
      "GeneralLedgerAccountId",
      "Reference",
      "LedgerId",
      "Debit",
      "BaseAmount",
      "Amount",
      "Active",
    ];

    list.PageName = this.AccountingVoucherListName;
    //list.lookupFields = ["AccountingTrialBalance"];
    list.filter = [filterStr];
    this.AccountingVoucherList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(f => {
          var _generalaccount = this.GLAccounts.filter(g => g.GeneralLedgerId == f.GeneralLedgerAccountId);
          if (_generalaccount.length > 0) {
            f.AccountName = _generalaccount[0].GeneralLedgerName;
            f.DebitAccount = _generalaccount[0].DebitAccount;
            f.AccountGroupId = _generalaccount[0].AccountGroupId;
            f.AccountSubGroupId = _generalaccount[0].AccountSubGroupId;
            f.AccountNatureId = _generalaccount[0].AccountNatureId;
            this.AccountingVoucherList.push(f);
          }
        })
        //console.log("this.AccountingVoucherList", this.AccountingVoucherList)
        var groupbyDebitCredit = alasql("select sum(BaseAmount) as Amount,Debit,AccountName from ? GROUP BY AccountName,Debit order by AccountName",
          [this.AccountingVoucherList])
          groupbyDebitCredit = groupbyDebitCredit.sort((a,b)=>a.AccountName -b.AccountName);
          var result =[];
          groupbyDebitCredit.forEach(f => {

            var existing = result.filter(r=>r.AccountName ==f.AccountName);
            if(existing.length>0)
            {
              if (f.Debit) {
                existing[0].Dr += f.Amount;
                //existing[0].Cr = 0;
              }
              else {
                existing[0].Cr += f.Amount
                //f.Dr = 0;
              }
            }
            else
            {
              var temprow ={"AccountName":f.AccountName, "Dr":0,"Cr":0};
              if (f.Debit) {
                temprow.Dr = f.Amount;
                temprow.Cr = 0;
              }
              else {
                temprow.Cr = f.Amount
                temprow.Dr = 0;
              }
              result.push(temprow);
            }
        })
        //console.log("groupbyDebitCredit", groupbyDebitCredit)
        //var display = result.filter(f => f.Dr != undefined)
        result.forEach(row=>{
          row.Balance=row.Dr -row.Cr;
        })
        this.TotalCredit = result.reduce((acc, current) => acc + current.Cr, 0)
        this.TotalDebit = result.reduce((acc, current) => acc + current.Dr, 0)
        this.TotalBalance = result.reduce((acc, current) => acc + current.Balance, 0)

        this.dataSource = new MatTableDataSource<IAccountingVoucher>(result);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matsort;
        this.loading = false; this.PageLoading = false;
        //this.changeDetectorRefs.detectChanges();
      });
  }
  GetGeneralLedgerAutoComplete() {

    let list: List = new List();
    list.fields = [
      "GeneralLedgerId",
      "GeneralLedgerName",
      "AccountNatureId",
      "AccountGroupId"
    ];

    list.PageName = "GeneralLedgers";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];
    this.GLAccounts = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.GeneralLedgers = [...data.value];
        this.loading = false; this.PageLoading = false;
      })
  }
  
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }


  GetGLAccounts() {

    let list: List = new List();
    list.fields = [
      "GeneralLedgerId",
      "GeneralLedgerName",
      "AccountNatureId",
      "AccountGroupId",
      "AccountSubGroupId",
      "Active"
    ];

    list.PageName = "GeneralLedgers";
    list.lookupFields = ["AccountNature($select=Active,AccountNatureId,DebitType)"];
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];
    this.GLAccounts = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        data.value.forEach(f => {

          if (f.AccountNature.Active == true) {
            f.DebitAccount = f.AccountNature.DebitType
            this.GLAccounts.push(f)
          }
        });

        //this.loading = false; this.PageLoading = false;
      })
  }
  GetAccountingPeriod() {

    let list: List = new List();
    list.fields = [
      "AccountingPeriodId",
      "StartDate",
      "EndDate"
    ];

    list.PageName = "AccountingPeriods";
    list.filter = [this.FilterOrgSubOrg + " and CurrentPeriod eq 1 and Active eq 1"];
    this.GLAccounts = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AccountingPeriod = data.value.map(f => {
          return {
            StartDate: f.StartDate,
            EndDate: f.EndDate
          }
        });

        this.loading = false; this.PageLoading = false;
      })
  }

  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.loading = false; this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
    // let Id = 0;
    // let Ids = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    // })
    // if (Ids.length > 0) {
    //   Id = Ids[0].MasterDataId;
    //   return this.allMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   })
    // }
    // else
    //   return [];

  }

}
export interface ITrialBalance {
  AccountingTrialBalanceId: number;
  GeneralLedger: string;
  AccountGroupId: number;
  AccountNatureId: number;
  DebitCreditId: number;
  Balance: number;
  DepartmentId: number;
  Active: number;
  Action: boolean
}


