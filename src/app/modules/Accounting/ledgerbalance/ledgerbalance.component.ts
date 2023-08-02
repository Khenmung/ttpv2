import { Component, OnInit, ViewChild } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import alasql from 'alasql';
import { IAccountingVoucher } from '../JournalEntry/JournalEntry.component';
import { IGeneralLedger } from '../ledgeraccount/ledgeraccount.component';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-ledgerbalance',
  templateUrl: './ledgerbalance.component.html',
  styleUrls: ['./ledgerbalance.component.scss']
})
export class LedgerBalanceComponent implements OnInit {
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
  SelectedBatchId = 0;
  SubOrgId = 0;
  AccountingVoucherList: IAccountingVoucher[] = [];
  dataSource: MatTableDataSource<IAccountingVoucher>;
  allMasterData = [];
  searchForm: UntypedFormGroup;
  TotalDebit = 0;
  TotalCredit = 0;
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
  headercolumns = ["Debit", "Credit"];
  displayedColumns = [
    "DrDate",
    "DrShortText",
    "DrAmt",
    "CrDate",
    "CrShortText",
    "CrAmt"
  ];

  constructor(private servicework: SwUpdate,
    private datepipe: DatePipe,
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private contentservice: ContentService,
  ) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.searchForm = this.fb.group({
      searchFromDate: [new Date()],
      searchToDate: [new Date()],
      searchGeneralLedgerId: [0]
    });
    this.filteredOptions = this.searchForm.get("searchGeneralLedgerId").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.TeacherName),
        map(TeacherName => TeacherName ? this._filter(TeacherName) : this.GeneralLedgers.slice())
      );
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
  // addnew() {
  //   var newdata = {
  //     AccountingVoucherId: 0,
  //     DocDate: new Date(),
  //     PostingDate: new Date(),
  //     Reference: '',
  //     LedgerId: 0,
  //     Debit: false,
  //     Amount: '',
  //     ShortText: '',
  //     Active: 0,
  //     Action: true
  //   }
  //   //this.AccountingVoucherList.push(newdata);
  //   this.dataSource = new MatTableDataSource<IAccountingVoucher>(this.AccountingVoucherList);
  // }
  CreditBalance = 0;
  DebitBalance = 0;
  GetAccountingVoucher() {
    debugger;
    let filterStr = this.FilterOrgSubOrg + " and LedgerId eq 0 and Active eq 1";
    filterStr += " and PostingDate ge " + this.datepipe.transform(this.searchForm.get("searchFromDate").value, 'yyyy-MM-dd') + //T00:00:00.000Z
      " and  PostingDate le " + this.datepipe.transform(this.searchForm.get("searchToDate").value, 'yyyy-MM-dd');//T00:00:00.000Z
    this.loading = true;

    var _GeneralLedgerId = this.searchForm.get("searchGeneralLedgerId").value.GeneralLedgerId;
    // if (_GeneralLedgerId) {
    //   filterStr += " and GeneralLedgerAccountId eq " + _GeneralLedgerId;

    let list: List = new List();
    list.fields = [
      "AccountingVoucherId",
      "PostingDate",
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
    //list.lookupFields = ["AccountingTrialBalance"];
    list.filter = [filterStr];
    this.AccountingVoucherList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(f => {
          var _generalaccount = this.GLAccounts.filter(g => g.GeneralLedgerId == f.GeneralLedgerAccountId);
          if (_generalaccount.length > 0) {
            f.AccountName = _generalaccount[0].GeneralLedgerName;
            //f.DebitAccount = _generalaccount[0].DebitAccount;
            f.AccountGroupId = _generalaccount[0].AccountGroupId;
            f.AccountSubGroupId = _generalaccount[0].AccountSubGroupId;
            f.AccountNatureId = _generalaccount[0].AccountNatureId;
            this.AccountingVoucherList.push(f);
          }
        })
        var currentAccountType = this.AccountingVoucherList.filter(ac => ac.GeneralLedgerAccountId == _GeneralLedgerId)
        var allRelatedAccounts = this.AccountingVoucherList.filter(all => currentAccountType.findIndex(indx => indx.Reference == all.Reference) > -1);
        const DistinctReference = [...new Set(allRelatedAccounts.map(item => item.Reference))];
        var _ledgerBalance = [];
        DistinctReference.forEach((related: any) => {
          var sameReference = allRelatedAccounts.filter(same => same.Reference == related);

          sameReference.forEach((same: any) => {
            if (same.Debit) {
              var credit = sameReference.filter(cr => !cr.Debit);
              credit.forEach(onlycr => {
                var emptytext: any = _ledgerBalance.filter(l => l.DrShortText.length == 0);
                if (emptytext.length > 0) {
                  emptytext[0].DrDate = same.PostingDate,
                    emptytext[0].DrShortText = onlycr.ShortText;
                  emptytext[0].DrAmt = same.BaseAmount;
                }
                else
                  _ledgerBalance.push({
                    "DrDate": same.PostingDate,
                    "DrShortText": onlycr.ShortText,
                    "CrShortText": '',
                    "DrAmt": same.BaseAmount,
                    "CrAmt": 0
                  });
              })
            }
            else {
              var debit = sameReference.filter(cr => cr.Debit);
              debit.forEach(onlydr => {
                var emptytext: any = _ledgerBalance.filter(l => l.CrShortText.length == 0);
                if (emptytext.length > 0) {
                  emptytext[0].CrDate = same.PostingDate,
                    emptytext[0].CrShortText = onlydr.ShortText;
                  emptytext[0].CrAmt = same.BaseAmount;
                }
                else
                  _ledgerBalance.push({
                    "CrDate": same.PostingDate,
                    "CrShortText": onlydr.ShortText,
                    "DrShortText": '',
                    "CrAmt": same.BaseAmount,
                    "DrAmt": 0
                  });
              })
            }
          })

        })
        console.log("_ledgerBalance", _ledgerBalance)
        this.TotalCredit = _ledgerBalance.reduce((acc, current) => acc + current["CrAmt"], 0)
        this.TotalDebit = _ledgerBalance.reduce((acc, current) => acc + current["DrAmt"], 0)
        if (this.TotalCredit > this.TotalDebit) {
          this.CreditBalance = this.TotalCredit - this.TotalDebit;
          this.DebitBalance = 0;
        }
        else if (this.TotalCredit < this.TotalDebit) {
          this.DebitBalance = this.TotalDebit - this.TotalCredit;
          this.CreditBalance = 0;
        }
        else {
          this.DebitBalance = 0;
          this.CreditBalance = 0;
        }
        this.dataSource = new MatTableDataSource<any>(_ledgerBalance);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matsort;
        this.loading = false;
        this.PageLoading = false;
      });
    //}
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

