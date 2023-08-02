import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IGeneralLedger } from '../ledgeraccount/ledgeraccount.component';
import { SwUpdate } from '@angular/service-worker';
import { MatPaginator } from '@angular/material/paginator';
import * as moment from 'moment';
import alasql from 'alasql';

@Component({
  selector: 'app-JournalEntry',
  templateUrl: './JournalEntry.component.html',
  styleUrls: ['./JournalEntry.component.scss']
})
export class JournalEntryComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  PageLoading = true;
  @ViewChild("table") mattable;
  GeneralLedgers = [];
  AccountingVoucherListName = 'AccountingVouchers';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  DummyMasterItemId = 4579;
  AccountingPeriod = {
    StartDate: new Date(),
    EndDate: new Date()
  }
  ParentId = 0;
  Permission = '';
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  SelectedApplicationId = 0;
  loading = false;
  GLAccounts = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  SubOrgId = 0;
  AccountingVoucherList: IAccountingVoucher[] = [];
  dataSource: MatTableDataSource<IAccountingVoucher>;
  allMasterData = [];
  searchForm: UntypedFormGroup;
  AccountingVoucherData = {
    AccountingVoucherId: 0,
    DocDate: new Date(),
    PostingDate: new Date(),
    Reference: '',
    TranParentId: 0,
    FeeReceiptId: 0,
    ParentId: 0,
    ClassFeeId: 0,
    LedgerId: 0,
    GeneralLedgerAccountId: 0,
    Debit: 0,
    BaseAmount: 0,
    Amount: 0,
    ShortText: '',
    
    OrgId: 0,SubOrgId: 0,
    Active: 0,
  };

  displayedColumns = [
    //"DocDate",
    "PostingDate",
    "GeneralLedgerAccountId",
    "ShortText",
    "Reference",
    "BaseAmount",
    "Debit",
    "Active",
    "Action",
  ];
  filteredOptions: Observable<IGeneralLedger[]>;
  //Students: any;

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
      searchGeneralLedgerId: [0],
      searchReference: [''],
      searchShortText: [''],
      //searchPostingDate:[new Date()]
    });
    this.PageLoad();
    //        this.GetTeachers();
  }

  PageLoad() {

    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();

    this.filteredOptions = this.searchForm.get("searchGeneralLedgerId").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.GeneralLedgerName),
        map(GeneralLedgerName => GeneralLedgerName ? this._filter(GeneralLedgerName) : this.GeneralLedgers.slice())
      );

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
      this.SubOrgId = this.tokenStorage.getSubOrgId();
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.accounting.JOURNALENTRY);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission && this.Permission != 'denied') {
      
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.GetAllAccountingVoucher();
        this.GetGeneralLedgerAutoComplete();
      }
    }
  }
  private _filter(name: string): IAccountingVoucher[] {

    const filterValue = name.toLowerCase();
    return this.GeneralLedgers.filter(option => option.GeneralLedgerName.toLowerCase().includes(filterValue));

  }
  displayFn(ledger: IGeneralLedger): string {
    return ledger && ledger.GeneralLedgerName ? ledger.GeneralLedgerName : '';
  }

  TransactionMode = true;
  addnew(mode) {
    //this.TransactionMode = mode;
    if (mode) {
      this.AccountingVoucherList = [];
      this.reference = ''
      this.TranParentId = 0;
    }
    //var debitcredit = debit == 'debit' ? 0 : 1
    if (this.reference.length > 0 || mode) {
      var newdata = {
        AccountingVoucherId: 0,
        DocDate: new Date(),
        PostingDate: new Date(),
        Reference: this.reference,
        FeeReceiptId: 0,
        ParentId: 0,
        TranParentId: 0,
        ClassFeeId: 0,
        LedgerId: 0,
        GeneralLedgerName: '',
        GeneralLedgerAccountId: this.searchForm.get("searchGeneralLedgerId").value.GeneralLedgerId,
        Debit: false,
        BaseAmount: 0,
        Amount: 0,
        ShortText: '',
        Active: 0,
        Action: true
      }

      this.AccountingVoucherList.push(newdata);
      this.dataSource = new MatTableDataSource<IAccountingVoucher>(this.AccountingVoucherList);
    }
  }
  TranParentId = 0;
  SetReference(row) {
    debugger;
    if (row.Reference.length == 0) {
      var matches = row.ShortText.replaceAll(' ', '').substr(0, 10) //.match(/\b(\w)/g);
      this.reference = matches + moment(new Date()).format('YYYYMMDDHHmmss');
      row.Reference = this.reference;
      this.TranParentId = this.searchForm.get("searchGeneralLedgerId").value.GeneralLedgerId;
    }
  }
  FilteredGeneralLedger = [];
  BindReference() {
    debugger;
    this.FilteredGeneralLedger = [];
    var GeneralLedgerId = this.searchForm.get("searchGeneralLedgerId").value.GeneralLedgerId;
    this.FilteredGeneralLedger = this.AllAccountingVouchers.filter(f => f.GeneralLedgerAccountId == GeneralLedgerId);
  }
  AllAccountingVouchers = [];
  GetAllAccountingVoucher() {
    let filterStr = this.FilterOrgSubOrg + ' and LedgerId eq 0 and Active eq 1';
    debugger;
    this.loading = true;
    var FinancialStartEnd = JSON.parse(this.tokenStorage.getSelectedBatchStartEnd());
    filterStr += " and PostingDate ge " + this.datepipe.transform(FinancialStartEnd.StartDate, 'yyyy-MM-dd') + //T00:00:00.000Z
      " and  PostingDate le " + this.datepipe.transform(FinancialStartEnd.EndDate, 'yyyy-MM-dd');//T00:00:00.000Z

    let list: List = new List();
    list.fields = [
      "GeneralLedgerAccountId",
      "Reference",
    ];

    list.PageName = this.AccountingVoucherListName;
    //list.limitTo = 50;
    //list.orderBy = "ShortText";
    //list.lookupFields = ["AccountingLedgerTrialBalance"];
    list.filter = [filterStr + " and GeneralLedgerAccountId ne null"];
    this.AllAccountingVouchers = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AllAccountingVouchers = alasql("select distinct GeneralLedgerAccountId,Reference from ?", [data.value]);
        //console.log("allaccountingvouchers",this.AllAccountingVouchers);
      })
  }
  GetAccountingVoucher() {

    let filterStr = this.FilterOrgSubOrg + ' and LedgerId eq 0 and Active eq 1';
    debugger;
    this.loading = true;
    var FinancialStartEnd = JSON.parse(this.tokenStorage.getSelectedBatchStartEnd());
    filterStr += " and PostingDate ge " + this.datepipe.transform(FinancialStartEnd.StartDate, 'yyyy-MM-dd') + //T00:00:00.000Z
      " and  PostingDate le " + this.datepipe.transform(FinancialStartEnd.EndDate, 'yyyy-MM-dd');//T00:00:00.000Z

    var searchReference = this.searchForm.get("searchReference").value;
    if (searchReference != "") {
      this.reference = searchReference;
      filterStr += " and Reference eq '" + searchReference + "'"
    }

    let list: List = new List();
    list.fields = [
      "AccountingVoucherId",
      "DocDate",
      "PostingDate",
      "GeneralLedgerAccountId",
      "Reference",
      "FeeReceiptId",
      "ParentId",
      "ClassFeeId",
      "LedgerId",
      "Debit",
      "BaseAmount",
      "Amount",
      "ShortText",
      "Active",
    ];

    list.PageName = this.AccountingVoucherListName;
    //list.limitTo = 50;
    //list.orderBy = "ShortText";
    //list.lookupFields = ["AccountingLedgerTrialBalance"];
    list.filter = [filterStr + " and GeneralLedgerAccountId ne null"];
    this.AccountingVoucherList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AccountingVoucherList = data.value.map(m => {

          var obj = this.GeneralLedgers.filter(f => f.GeneralLedgerId == m.GeneralLedgerAccountId)
          if (obj.length > 0) {
            m.GeneralLedgerAccountId = obj[0];
          }
          else
            m.GeneralLedgerName = '';
          return m;
        });

        //        console.log("AccountingVoucherList", this.AccountingVoucherList);
        if (this.AccountingVoucherList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<IAccountingVoucher>(this.AccountingVoucherList);
        this.dataSource.paginator = this.paginator;
        //}

        this.loading = false; this.PageLoading = false;
      });
  }
  filterAccount(name: string) {
    return name && this.GeneralLedgers.filter(
      account => account.GeneralLedgerName.toLowerCase().includes(name?.toLowerCase())
    ) || this.GeneralLedgers;
  }
  onBlur(row) {
    row.Action = true;
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
  }
  UpdateDebit(row, event) {
    if (event.checked)
      row.Debit = true;
    else
      row.Debit = false;
    this.onBlur(row);
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
  ClearShorttext() {
    this.searchForm.patchValue({ "searchShortText": "" });
  }
  reference = '';
  UpdateOrSave(row) {

    debugger;
    var errorMessage = '';
    //var reference = '';
    if (row.GeneralLedgerAccountId == 0)
      errorMessage += 'Please select one of the accounts<br>';
    if (row.Reference == '') {
      this.contentservice.openSnackBar("Please enter reference.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else
      this.reference = row.Reference;

    if (row.ShortText.length == 0) {
      errorMessage += 'Please enter description.<br>';
      //this.contentservice.openSnackBar(errorMessage, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.Amount > 1000000 || row.Amount < -1000000)
      errorMessage += "Amount should be less than 10,00,000 or greater than -10,00,000<br>";

    if (errorMessage.length > 0) {
      this.loading = false;
      this.PageLoading = false;
      //this.contentservice.openSnackBar(errorMessage,globalconstants.ActionText,globalconstants.RedBackground);
      this.contentservice.openSnackBar(errorMessage, globalconstants.ActionText, globalconstants.RedBackground);

    }
    else {
      let checkFilterString = "GeneralLedgerAccountId eq " + row.GeneralLedgerAccountId.GeneralLedgerId +
        " and Reference eq '" + this.reference + "'";


      if (row.AccountingVoucherId > 0)
        checkFilterString += " and AccountingVoucherId ne " + row.AccountingVoucherId;
      checkFilterString += " and " + globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      let list: List = new List();
      list.fields = ["AccountingVoucherId"];
      list.PageName = this.AccountingVoucherListName;
      list.filter = [checkFilterString];
      this.loading = true;
      this.dataservice.get(list)
        .subscribe((data: any) => {
          //debugger;
          if (data.value.length > 0) {
            this.loading = false; this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
          }
          else {

            this.AccountingVoucherData.Active = row.Active;
            this.AccountingVoucherData.AccountingVoucherId = row.AccountingVoucherId;
            this.AccountingVoucherData.BaseAmount = +row.BaseAmount;
            this.AccountingVoucherData.Amount = +row.Amount;
            this.AccountingVoucherData.DocDate = row.DocDate;
            this.AccountingVoucherData.Debit = row.Debit;
            this.AccountingVoucherData.PostingDate = row.PostingDate;
            this.AccountingVoucherData.Reference = this.reference;
            this.AccountingVoucherData.LedgerId = row.LedgerId;
            this.AccountingVoucherData.GeneralLedgerAccountId = row.GeneralLedgerAccountId.GeneralLedgerId;
            this.AccountingVoucherData.ClassFeeId = 0;
            this.AccountingVoucherData.FeeReceiptId = 0;
            this.AccountingVoucherData.ParentId = this.ParentId;
            this.AccountingVoucherData.TranParentId = this.TranParentId;
            this.AccountingVoucherData.ShortText = row.ShortText;
            this.AccountingVoucherData.OrgId = this.LoginUserDetail[0]["orgId"];
            this.AccountingVoucherData.SubOrgId = this.SubOrgId;

            if (row.AccountingVoucherId == 0) {
              this.AccountingVoucherData["CreatedDate"] = new Date();
              this.AccountingVoucherData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
              delete this.AccountingVoucherData["UpdatedDate"];
              delete this.AccountingVoucherData["UpdatedBy"];
              console.log('to insert', this.AccountingVoucherData)
              this.insert(row);
            }
            else {
              delete this.AccountingVoucherData["CreatedDate"];
              delete this.AccountingVoucherData["CreatedBy"];
              this.AccountingVoucherData["UpdatedDate"] = new Date();
              this.AccountingVoucherData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
              console.log('to update', this.AccountingVoucherData)
              this.update(row);
            }
          }
        });
    }
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.AccountingVoucherListName, this.AccountingVoucherData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.AccountingVoucherId = data.AccountingVoucherId;
          var indx = this.AllAccountingVouchers.findIndex(f => f.GeneralLedgerAccountId == this.AccountingVoucherData.GeneralLedgerAccountId
            && f.Reference == this.reference);
          if (indx > -1) {
            this.AllAccountingVouchers.push({ "GeneralLedgerAccountId": this.AccountingVoucherData.GeneralLedgerAccountId, "Reference": this.reference });
          }
          this.ParentId = data.ParentId;
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
export interface IAccountingVoucher {
  AccountingVoucherId: number;
  DocDate: Date;
  PostingDate: Date;
  Reference: string;
  LedgerId: number;
  GeneralLedgerAccountId: number;
  GeneralLedgerName: string;
  ParentId: number;
  Debit: boolean;
  Amount: number;
  BaseAmount: number;
  ShortText: string;
  Active: number;
  Action: boolean
}


