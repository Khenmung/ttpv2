import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IAccountingVoucher } from '../JournalEntry/JournalEntry.component';
import { IGeneralLedger } from '../ledgeraccount/ledgeraccount.component';

@Component({
  selector: 'app-balancesheet',
  templateUrl: './balancesheet.component.html',
  styleUrls: ['./balancesheet.component.scss']
})
export class BalancesheetComponent implements OnInit {
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
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  GLAccounts = [];
  GeneralLedgers = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;SubOrgId = 0;
  AccountingVoucherList: IAccountingVoucher[] = [];
  AssetDataSource: MatTableDataSource<IAccountingVoucher>;
  LiabilityDataSource: MatTableDataSource<IAccountingVoucher>;
  TrialBalanceDatasource: MatTableDataSource<IAccountingVoucher>;
  allMasterData = [];
  searchForm: UntypedFormGroup;
  Asset = [];
  Liability = [];
  TotalAsset = 0;
  TotalLiability = 0;
  NetIncome = 0;
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
    "DrBalance",
    "CrBalance"
  ];
  BalanceSheetColumns = [
    "AccountName",
    "Balance"
  ];
  //filteredOptions: Observable<IGLAccounts[]>;
  //Students: any;

  constructor(
    private datepipe: DatePipe,
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private contentservice: ContentService,
  ) { }
  MinDate: Date;
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

      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.accounting.BALANCESHEET);
      if (perObj.length > 0) {

        this.Permission = perObj[0].permission;
        if (this.Permission != 'deny') {
          this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
          this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          //this.GetMasterData();
          this.GetAccountNature();

          //this.GetGeneralLedgerAutoComplete();
        }

      }
    }
  }
  updateDebitCredit(row, event) {
    row.Active = event.checked ? 1 : 0;
    row.Action = true;
  }

  TrialBalance = [];
  TotalDr = 0;
  TotalCr = 0;
  GetAccountingVoucher() {
    let filterStr = this.FilterOrgSubOrg + " and FeeReceiptId eq 0 and Active eq 1";
    debugger;
    this.loading = true;
    var toDate = new Date(this.searchForm.get("searchToDate").value);
    toDate.setDate(toDate.getDate() + 1);
    filterStr += " and PostingDate ge " + this.datepipe.transform(this.searchForm.get("searchFromDate").value, 'yyyy-MM-dd') + //T00:00:00.000Z
      " and PostingDate lt " + this.datepipe.transform(toDate, 'yyyy-MM-dd');//T00:00:00.000Z

    let list: List = new List();
    list.fields = [
      "AccountingVoucherId",
      "GeneralLedgerAccountId",
      "ShortText",
      "Reference",
      "LedgerId",
      "Debit",
      "BaseAmount",
      "Amount",
      "Active",
    ];

    list.PageName = this.AccountingVoucherListName;
    //list.lookupFields = ["GeneralLedger($select=GeneralLedgerName,IncomeStatementSequence,IncomeStatementPlus,BalanceSheetSequence,BalanceSheetPlus"];
    list.filter = [filterStr];
    this.AccountingVoucherList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Asset = [];
        this.Liability = [];
        this.TrialBalance=[];
        //var tuitionFee= data.value.filter(f=>f.GeneralLedgerAccountId==)
        data.value.forEach(f => {
          var _generalaccount = this.GLAccounts.filter(g => g.GeneralLedgerId == f.GeneralLedgerAccountId);

          if (_generalaccount.length > 0) {
            f.Debit=f.Debit!=undefined?f.Debit:false;
            f.AccountNature = _generalaccount[0].AccountNature;
            f.AccountName = _generalaccount[0].GeneralLedgerName;
            f.DebitAccount = _generalaccount[0].DebitAccount;
            f.AccountGroupId = _generalaccount[0].AccountGroupId;
            f.AccountSubGroupId = _generalaccount[0].AccountSubGroupId;
            f.AccountNatureId = _generalaccount[0].AccountNatureId;
            f.GeneralLedgerName = _generalaccount[0].GeneralLedgerName;
            f.IncomeStatementSequence = _generalaccount[0].IncomeStatementSequence;
            f.IncomeStatementPlus = _generalaccount[0].IncomeStatementPlus;
            f.BalanceSheetSequence = _generalaccount[0].BalanceSheetSequence;
            f.BalanceSheetPlus = _generalaccount[0].BalanceSheetPlus;
            this.TrialBalance.push(f);
          }
        });
        this.TrialBalance = this.FormatData(this.TrialBalance);
        //this.Expense = this.FormatData(this.Expense, "expense");
        this.TotalDr = this.TrialBalance.reduce((acc, current) => acc + (current.DrBalance ? current.DrBalance : 0), 0);
        this.TotalCr = this.TrialBalance.reduce((acc, current) => acc + (current.CrBalance ? current.CrBalance : 0), 0);


        //this.TrialBalanceDatasource = new MatTableDataSource<IAccountingVoucher>(this.TrialBalance);

        this.TrialBalance.forEach(t => {

          if (t.AccountNature.toLowerCase() == "asset") {
            this.Asset.push(t);
          }
          else if (t.AccountNature.toLowerCase() == "liability" || t.AccountNature.toLowerCase() == "equity")
            this.Liability.push(t);
        })

        // this.TotalAsset = this.Asset.reduce((acc, current) => acc + current.Balance, 0);
        // this.TotalLiability = this.Liability.reduce((acc, current) => acc + current.Balance, 0);

        //this.Asset = this.Asset.sort((a, b) => a.IncomeStatementSequence - b.IncomeStatementSequence);
        this.TotalAsset = this.Asset.reduce((acc, current) => {
          if (current.AssetPlus == 1)
            acc += current.Balance
          else if (current.AssetPlus == -1)
            acc -= current.Balance;
        }, 0);
        this.TotalLiability = this.Liability.reduce((acc, current) => {
          if (current.LnEPlus == 1)
            acc += current.Balance
          else if (current.LnEPlus == -1)
            acc -= current.Balance;
        }, 0);

        this.NetIncome = this.TotalAsset - this.TotalLiability;

        this.AssetDataSource = new MatTableDataSource<IAccountingVoucher>(this.Asset);
        this.LiabilityDataSource = new MatTableDataSource<IAccountingVoucher>(this.Liability);

        this.loading = false; 
        this.PageLoading = false;
      });
  }
  FormatData(pdata) {
    //console.log("this.AccountingVoucherList", this.AccountingVoucherList)
    var sql="select sum(BaseAmount) as Amount,Debit,AccountName,AccountNature,"+
    "AssetSequence,AssetPlus,LnESequence,LnEPlus from ? GROUP BY AccountName,Debit,AccountNature,AssetSequence,AssetPlus,LnESequence,LnEPlus order by AccountName";
     var groupbyDebitCredit = alasql(sql,[pdata]);
    
      groupbyDebitCredit = groupbyDebitCredit.sort((a, b) => a.AccountName - b.AccountName);
    var result = [];
    groupbyDebitCredit.forEach(f => {

      var existing = result.filter(r => r.AccountName == f.AccountName);

      if (existing.length > 0) {
        if (f.Debit) {
          existing[0].Dr += f.Amount;
          existing[0].Cr = existing[0].Cr ? existing[0].Cr : 0;
        }
        else {
          existing[0].Cr += f.Amount;
          existing[0].Dr = existing[0].Dr ? existing[0].Dr : 0;
        }
      }
      else {
        var temprow = {
          "AssetSequence": f.AssetSequence,
          "AssetPlus": f.AssetPlus,
          "LnESequence": f.LnESequence,
          "LnEPlus": f.LnEPlus,
          "AccountName": f.AccountName, "Dr": 0, "Cr": 0, "AccountNature": f.AccountNature
        };
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

    result = result.filter(f => f.Dr!=undefined)
    result.forEach(row => {
      if (row.Dr > row.Cr) {
        row.Balance = row.Dr - row.Cr;
        row.DrBalance = row.Dr - row.Cr;
      }
      else {
        row.Balance = row.Cr - row.Dr;
        row.CrBalance = row.Cr - row.Dr;
      }
    })
    return result;
    // this.Expense = this.Expense.filter(f => f.Dr != undefined)
    // this.Expense.forEach(expense => {
    //   expense.Balance = expense.Dr - expense.Cr;
    // })
    // this.TotalCredit = this.Income.reduce((acc, current) => acc + current.Cr, 0);
    // this.TotalDebit = this.Income.reduce((acc, current) => acc + current.Dr, 0);

  }
  GetGeneralLedgerAutoComplete() {

    let list: List = new List();
    list.fields = [
      "GeneralLedgerId",
      "GeneralLedgerName",
      "AccountNatureId",
      "AccountGroupId",
      "GeneralLedgerName",
      "AssetSequence",
      "AssetPlus",
      "LnESequence",
      "LnEPlus"
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
  onBlur(row) {
    row.Action = true;
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
  }
  // delete(element) {
  //   let toupdate = {
  //     Active: element.Active == 1 ? 0 : 1
  //   }
  //   this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
  //     .subscribe(
  //       (data: any) => {
  //         // this.GetApplicationRoles();
  //         this.contentservice.openSnackBar(globalconstants.DeletedMessage,globalconstants.ActionText,globalconstants.BlueBackground);

  //       });
  // }

  UpdateOrSave(row) {

    //debugger;
    this.loading = true;


    this.AccountingVoucherData.Active = row.Active;
    this.AccountingVoucherData.AccountingVoucherId = row.AccountingVoucherId;
    this.AccountingVoucherData.Amount = row.Amount;
    this.AccountingVoucherData.DocDate = row.DocDate;
    this.AccountingVoucherData.Debit = row.Debit;
    this.AccountingVoucherData.PostingDate = row.PostingDate;
    this.AccountingVoucherData.Reference = row.Reference;
    this.AccountingVoucherData.LedgerId = row.LedgerId;
    this.AccountingVoucherData.ShortText = row.ShortText;
    this.AccountingVoucherData.OrgId = this.LoginUserDetail[0]["orgId"];
    this.AccountingVoucherData.SubOrgId = this.SubOrgId;
    if (row.AccountingVoucherId == 0) {
      this.AccountingVoucherData["CreatedDate"] = new Date();
      this.AccountingVoucherData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
      delete this.AccountingVoucherData["UpdatedDate"];
      delete this.AccountingVoucherData["UpdatedBy"];
      //console.log('to insert', this.AccountingVoucherData)
      this.insert(row);
    }
    else {
      delete this.AccountingVoucherData["CreatedDate"];
      delete this.AccountingVoucherData["CreatedBy"];
      this.AccountingVoucherData["UpdatedDate"] = new Date();
      this.AccountingVoucherData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
      //console.log('to update', this.AccountingVoucherData)
      this.update(row);
    }
    //        }
    //      });

  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.AccountingVoucherListName, this.AccountingVoucherData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.AccountingVoucherId = data.AccountingVoucherId;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.AccountingVoucherListName, this.AccountingVoucherData, this.AccountingVoucherData.AccountingVoucherId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;

          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  AccountNatureList = [];
  GetAccountNature() {

    let filterStr = '(OrgId eq 0 or (' + this.FilterOrgSubOrg +"))";
    debugger;
    this.loading = true;

    // var _searchAccountId = this.searchForm.get("searchAccountName").value.AccountNatureId;
    // //var _searchParentId = this.searchForm.get("searchParentId").value;
    // if (_searchAccountId == undefined) {
    //   filterStr += " and ParentId eq 0"
    // }
    // else if (_searchAccountId > 0) {
    //   filterStr += " and ParentId eq " + _searchAccountId
    // }

    let list: List = new List();
    list.fields = [
      "AccountNatureId",
      "AccountName",
      "ParentId",
      "DebitType",
      "Active",
    ];

    list.PageName = "AccountNatures";
    list.filter = [filterStr];
    this.AccountNatureList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AccountNatureList = [...data.value];
        this.GetGLAccounts();

      });
  }

  GetGLAccounts() {

    let list: List = new List();
    list.fields = [
      "GeneralLedgerId",
      "GeneralLedgerName",
      "AccountNatureId",
      "AccountGroupId",
      "AccountSubGroupId",
      "GeneralLedgerName",
      "AssetSequence",
      "AssetPlus",
      "LnESequence",
      "LnEPlus",
      "Active"
    ];

    list.PageName = "GeneralLedgers";
    //list.lookupFields = ["AccountNature($select=Active,AccountNatureId,DebitType)"];
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];
    this.GLAccounts = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        data.value.forEach(f => {
          var obj = this.AccountNatureList.filter(n => n.AccountNatureId == f.AccountNatureId)
          if (obj.length > 0) {
            f.AccountNature = obj[0].AccountName;
            f.DebitAccount = obj[0].DebitType
            this.GLAccounts.push(f)

          }
        });

        this.loading = false;
        this.PageLoading = false;
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




