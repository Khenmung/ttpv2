import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { IGeneralLedger } from '../ledgeraccount/ledgeraccount.component';
import { SwUpdate } from '@angular/service-worker';
import { MatPaginator } from '@angular/material/paginator';
import * as moment from 'moment';
import alasql from 'alasql';
import * as _ from 'lodash';

@Component({
  selector: 'app-JournalEntry',
  templateUrl: './JournalEntry.component.html',
  styleUrls: ['./JournalEntry.component.scss']
})
export class JournalEntryComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  PageLoading = true;
  @ViewChild("table") mattable;
  GeneralLedgers: any[] = [];
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
  //GLAccounts: any[] = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  SubOrgId = 0;
  AccountingVoucherList: IAccountingVoucher[] = [];
  dataSource: MatTableDataSource<IAccountingVoucher>;
  allMasterData: any[] = [];
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
    ActivityTypeId: 0,
    LedgerPostingId: 0,
    OrgId: 0, SubOrgId: 0,
    Active: 0,
  };

  displayedColumns = [
    "AccountingVoucherId",
    "PostingDate",
    "GeneralLedgerAccountId",
    "ShortText",
    //"Reference",
    "DebitAmount",
    "CreditAmount",
    //"ActivityTypeId",
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
  FinancialStart: any;
  FinancialEnd: any;
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
      searchDescription: [''],
      searchShortText: [''],
      searchPostingDateFrom: [new Date()],
      searchPostingDateTo: [new Date()],
    });
    this.PageLoad();
    //        this.GetTeachers();
  }

  PageLoad() {

    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    var FinancialStartEnd = JSON.parse(this.tokenStorage.getSelectedBatchStartEnd()!);
    this.FinancialStart = moment(FinancialStartEnd.StartDate).format('YYYY-MM-DD');
    this.FinancialEnd = moment(FinancialStartEnd.EndDate).format('YYYY-MM-DD');
    console.log("this.FinancialStart", this.FinancialStart);
    this.filteredOptions = this.searchForm.get("searchGeneralLedgerId")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.GeneralLedgerName),
        map(GeneralLedgerName => GeneralLedgerName ? this._filter(GeneralLedgerName) : this.GeneralLedgers.slice())
      )!;

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.accounting.JOURNALENTRY);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission && this.Permission != 'deny') {

        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.GetMasterData();
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
  addnew(freshentry, pdesc = '', pAmount = 0) {
    debugger;
    let _ShortText = '', _DebitAmount = 0, _CreditAmount = 0;
    if (freshentry) {
      this.AccountingVoucherList = [];
      this.reference = ''
      this.TranParentId = 0;
    }
    else {
      _ShortText = pdesc ? pdesc : this.AccountingVoucherList[0].ShortText;
      if (this.AccountingVoucherList[0].Debit)
        _CreditAmount = this.AccountingVoucherList[0].Amount;
      else
        _DebitAmount = this.AccountingVoucherList[0].Amount;
      this.reference = this.AccountingVoucherList[0].Reference;
    }
    //if (row.Reference || mode) {
    let _operatingActivityId = 0, _action = true;
    let obj: any = this.ActivityTypes.find((f: any) => f.MasterDataName.toLowerCase() == 'operating');
    if (obj) {
      _operatingActivityId = obj.MasterDataId;
    }
    if (this.CurrentAccountingMode == 'double entry') {
      _action = false;
    }
    let _GeneralLedgerId = this.searchForm.get("searchGeneralLedgerId")?.value.GeneralLedgerId;
    let objLedger = this.GeneralLedgers.find(f => f.GeneralLedgerId == _GeneralLedgerId);
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
      GeneralLedgerAccountId: objLedger,
      GeneralLedgerAccount: {},
      Debit: false,
      BaseAmount: pAmount,
      DebitAmount: _DebitAmount,
      CreditAmount: _CreditAmount,
      LedgerPostingId: 0,
      Amount: 0,
      ShortText: _ShortText,
      ActivityTypeId: _operatingActivityId,
      Active: 1,
      Action: _action
    }

    this.AccountingVoucherList.push(newdata);
    this.dataSource = new MatTableDataSource<IAccountingVoucher>(this.AccountingVoucherList);
    //}
  }
  TranParentId = 0;
  SetReference(row) {
    debugger;
    if (row.Reference.length == 0) {
      var matches = row.ShortText.replaceAll(' ', '').substr(0, 10) //.match(/\b(\w)/g);
      this.reference = matches + moment(new Date()).format('YYYYMMDDHHmmss');
      row.Reference = this.reference;
      this.TranParentId = this.searchForm.get("searchGeneralLedgerId")?.value.GeneralLedgerId;
    }
  }
  FilteredGeneralLedger: any[] = [];
  BindReference() {
    debugger;
    this.FilteredGeneralLedger = [];
    var GeneralLedgerId = this.searchForm.get("searchGeneralLedgerId")?.value.GeneralLedgerId;
    this.FilteredGeneralLedger = this.AllAccountingVouchers.filter((f: any) => f.GeneralLedgerAccountId == GeneralLedgerId);
  }
  AllAccountingVouchers: any[] = [];
  GetAllAccountingVoucher() {
    let filterStr = this.FilterOrgSubOrg + ' and LedgerId eq 0 and ClassFeeId eq 0 and Active eq 1';
    debugger;
    this.loading = true;
    var FinancialStartEnd = JSON.parse(this.tokenStorage.getSelectedBatchStartEnd()!);
    filterStr += " and PostingDate ge " + this.datepipe.transform(FinancialStartEnd.StartDate, 'yyyy-MM-dd') + //T00:00:00.000Z
      " and  PostingDate le " + this.datepipe.transform(FinancialStartEnd.EndDate, 'yyyy-MM-dd');//T00:00:00.000Z

    let list: List = new List();
    list.fields = [
      "GeneralLedgerAccountId",
      "ShortText",
      "Reference"
    ];

    list.PageName = this.AccountingVoucherListName;
    //list.limitTo = 50;
    //list.orderBy = "ShortText";
    //list.lookupFields = ["AccountingLedgerTrialBalance"];
    list.filter = [filterStr + " and GeneralLedgerAccountId ne null"];
    this.AllAccountingVouchers = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AllAccountingVouchers = alasql("select distinct ShortText,Reference from ?", [data.value]);
        //console.log("allaccountingvouchers",this.AllAccountingVouchers);
      })
  }
  GetLedgerPosting() {
    let filterStr = this.FilterOrgSubOrg + " and Active eq 1";

    var _searchDescriptionObj = this.searchForm.get("searchDescription")?.value;
    if (_searchDescriptionObj) {
      filterStr += " and Reference eq '" + _searchDescriptionObj.Reference + "'";
    }

    let list: List = new List();
    list.fields = [
      "LedgerPostingId",
      "AccountingVoucherId",
      "PostingGeneralLedgerId",
      "Amount",
      "Debit",
      "ShortText",
      "Reference",
    ];

    list.PageName = "LedgerPostings";
    list.filter = [filterStr];
    this.AccountingVoucherList = [];
    return this.dataservice.get(list);
  }
  GetAccountingVoucher() {

    let filterStr = this.FilterOrgSubOrg + ' and FeeReceiptId eq 0 and ClassFeeId eq 0 and Active eq 1';
    debugger;
    var _searchDescription = this.searchForm.get("searchDescription")?.value;
    var _PostingDateFrom = this.searchForm.get("searchPostingDateFrom")?.value;
    var _PostingDateTo = this.searchForm.get("searchPostingDateTo")?.value;
    var _GeneralLedger = this.searchForm.get("searchGeneralLedgerId")?.value;
    if (!_searchDescription) {
      this.contentservice.openSnackBar("Please select description.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_GeneralLedger.GeneralLedgerId) {
      filterStr += " and GeneralLedgerAccountId eq " + _GeneralLedger.GeneralLedgerId;
      //this.contentservice.openSnackBar("Please select Account.", globalconstants.ActionText, globalconstants.RedBackground);
      //return;
    }

    this.loading = true;
    // var FinancialStartEnd = JSON.parse(this.tokenStorage.getSelectedBatchStartEnd()!);
    // filterStr += " and PostingDate ge " + this.datepipe.transform(FinancialStartEnd.StartDate, 'yyyy-MM-dd') + //T00:00:00.000Z
    //   " and PostingDate le " + this.datepipe.transform(FinancialStartEnd.EndDate, 'yyyy-MM-dd');//T00:00:00.000Z
    let toDate = new Date(_PostingDateTo).setDate(new Date(_PostingDateTo).getDate() + 1);
    filterStr += " and PostingDate ge " + this.datepipe.transform(_PostingDateFrom, 'yyyy-MM-dd') + //T00:00:00.000Z
      " and PostingDate lt " + this.datepipe.transform(toDate, 'yyyy-MM-dd');//T00:00:00.000Z

    filterStr += " and ShortText eq '" + _searchDescription.ShortText + "'"

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
      "ActivityTypeId",
      "LedgerPostingId",
      "Active",
    ];

    list.PageName = this.AccountingVoucherListName;
    //list.limitTo = 50;
    //list.orderBy = "ShortText";
    //list.lookupFields = ["AccountingLedgerTrialBalance"];
    list.filter = [filterStr + " and GeneralLedgerAccountId ne null"];
    this.AccountingVoucherList = [];

    forkJoin([this.dataservice.get(list), this.GetLedgerPosting()])
      .subscribe((data: any) => {
        this.LedgerPosting = data[1].value.map(item => {
          item.OrgId = this.LoginUserDetail[0]['orgId'];
          item.SubOrgId = this.SubOrgId;
          return item;
        });
        //console.log("this.LedgerPosting1", this.LedgerPosting)
        this.AccountingVoucherList = data[0].value.map(m => {

          if (m.Debit)
            m.DebitAmount = m.Amount;
          else
            m.CreditAmount = m.Amount;

          let obj = this.GeneralLedgers.find((f: any) => f.GeneralLedgerId == m.GeneralLedgerAccountId)
          if (obj) {
            m.GeneralLedgerAccountId = obj;
            //  m.GeneralLedgerName = obj.GeneralLedgerName
          }
          // else
          //   m.GeneralLedgerName = '';
          return m;
        });

        //console.log("AccountingVoucherList", this.AccountingVoucherList);
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
    //debugger;
    return name && this.GeneralLedgers.filter(
      account => account.GeneralLedgerName.toLowerCase().includes(name?.toLowerCase())) || this.GeneralLedgers;
  }

  EnableSaveAll = false;
  LedgerPosting: ILedgerPosting[] = [];
  onBlur(row, colName) {
    debugger;
    //let _ledgerPostings = this.LedgerPosting;
    if (row[colName] > 0 && colName.toLowerCase() == 'debitamount') {
      row.Debit = true;
      row.Amount = row[colName];
      row.CreditAmount = 0;
      row.BaseAmount = row[colName];
    }
    else if (row[colName] > 0 && colName.toLowerCase() == 'creditamount') {
      row.Debit = false;
      row.Amount = row[colName];
      row.BaseAmount = row[colName];
      row.DebitAmount = 0;
    }
    if (this.CurrentAccountingMode == 'double entry') {
      let _drAmount = 0, _crAmount = 0;
      this.AccountingVoucherList = this.AccountingVoucherList.filter(e => e.Reference == row.Reference);
      if (this.AccountingVoucherList.length > 1) {
        this.AccountingVoucherList.forEach(item => {
          if (item.Debit && !_drAmount)
            _drAmount = item.Amount;
          else if (!_crAmount)
            _crAmount = item.Amount;
        })

        if (_drAmount && _crAmount) {
          //enable all rows save button.
          this.EnableSaveAll = true;
          // this.AccountingVoucherList.forEach(item => {
          //   item.Active = 1;
          //   item.Action = true;
          // })

          //////setting ledgerposting

          let doubledrcr = _.countBy(this.AccountingVoucherList, (item) => {
            return item.Debit ? 'debit' : 'credit';
          })
          let _debitCreditAccount: any = [];
          let firstitem: any = {};
          if (doubledrcr.debit < doubledrcr.credit || doubledrcr.debit == doubledrcr.credit) {
            firstitem = this.AccountingVoucherList.find(f => f.Debit);
            _debitCreditAccount = this.AccountingVoucherList.filter(f => !f.Debit && f.Reference == row.Reference);
          }
          else if (doubledrcr.debit > doubledrcr.credit) {
            firstitem = this.AccountingVoucherList.find(f => !f.Debit);
            _debitCreditAccount = this.AccountingVoucherList.filter(f => f.Debit && f.Reference == row.Reference);
          }
          let _mainObj = this.GeneralLedgers.find(g => g.GeneralLedgerId == firstitem.GeneralLedgerAccountId['GeneralLedgerId']);
          let _narration = firstitem.Debit ? "To " + _mainObj.GeneralLedgerName : "By " + _mainObj.GeneralLedgerName;

          _debitCreditAccount.forEach(opposite => {

            let _oppositeAccountObj = this.GeneralLedgers.find(g => g.GeneralLedgerId == opposite.GeneralLedgerAccountId['GeneralLedgerId']);
            let _mainNarration = opposite.Debit ? "To " + _oppositeAccountObj.GeneralLedgerName : "By " + _oppositeAccountObj.GeneralLedgerName;
            //main
            let existing: any = this.LedgerPosting.find(l => l.Debit == firstitem.Debit
              && l.PostingGeneralLedgerId == firstitem.GeneralLedgerAccountId['GeneralLedgerId']
              && l.ShortText == _mainNarration)
            if (existing) {
              existing.AccountingVoucherId = firstitem.AccountingVoucherId;
              existing.PostingGeneralLedgerId = firstitem.GeneralLedgerAccountId['GeneralLedgerId'];
              existing.Debit = firstitem.Debit;
              existing.Amount = opposite.Amount;
              existing.ShortText = _mainNarration;
              existing.Reference = firstitem.Reference;
              existing.OrgId = this.LoginUserDetail[0]['orgId'];
              existing.SubOrgId = this.SubOrgId;
              existing.UpdatedDate = new Date();
              existing.Active = 1;
            }
            else {
              this.LedgerPosting.push({
                "LedgerPostingId": 0,
                "AccountingVoucherId": firstitem.AccountingVoucherId,
                "PostingGeneralLedgerId": firstitem.GeneralLedgerAccountId['GeneralLedgerId'],
                "Amount": opposite.Amount,
                "Debit": firstitem.Debit,
                "ShortText": _mainNarration,
                "Reference": firstitem.Reference,
                "OrgId": this.LoginUserDetail[0]['orgId'],
                "SubOrgId": this.SubOrgId,
                "CreatedDate": new Date(),
                "UpdatedDate": new Date(),
                "Active": 1
              });
            }
            //main ends
            //opposite
            let existingOpposite = this.LedgerPosting.find(l => l.Debit == opposite.Debit
              && l.PostingGeneralLedgerId == _oppositeAccountObj.GeneralLedgerId
              && l.ShortText == _narration)

            if (existingOpposite) {
              existingOpposite.AccountingVoucherId = opposite.AccountingVoucherId;
              existingOpposite.PostingGeneralLedgerId = _oppositeAccountObj.GeneralLedgerId;
              existingOpposite.Amount = opposite.Amount;
              existingOpposite.Debit = opposite.Debit;
              existingOpposite.ShortText = _narration;
              existingOpposite.Reference = firstitem.Reference;
              existingOpposite.OrgId = this.LoginUserDetail[0]['orgId'];
              existingOpposite.SubOrgId = this.SubOrgId;
              existing.UpdatedDate = new Date();
              existingOpposite.Active = 1;
            }
            else {
              this.LedgerPosting.push({
                "LedgerPostingId": 0,
                "AccountingVoucherId": opposite.AccountingVoucherId,
                "PostingGeneralLedgerId": _oppositeAccountObj.GeneralLedgerId,
                "Amount": opposite.Amount,
                "Debit": opposite.Debit,
                "ShortText": _narration,
                "Reference": firstitem.Reference,
                "OrgId": this.LoginUserDetail[0]['orgId'],
                "SubOrgId": this.SubOrgId,
                "CreatedDate": new Date(),
                "UpdatedDate": new Date(),
                "Active": 1
              })
            }
          })

        }
        //assigning amount of the opposite amount to current row.
        else if (row.Debit) {
          let creditrow: any = this.AccountingVoucherList.find((n: any) => !n.Debit);
          if (creditrow && creditrow.CreditAmount) {
            row.DebitAmount = creditrow.CreditAmount;
            row.Amount = creditrow.CreditAmount;
            row.BaseAmount = creditrow.CreditAmount;
          }
          else {
            let _newBlankRow = this.AccountingVoucherList.find(n => n.Amount == 0);
            if (!_newBlankRow)
              this.addnew(false, row.ShortText, row.Amount);
          }
        }
        else if (!row.Debit) {
          let drrow: any = this.AccountingVoucherList.find((n: any) => n.Debit);
          if (drrow && drrow.DebitAmount) {
            row.CreditAmount = drrow.DebitAmount;
            row.Amount = drrow.DebitAmount;
            row.BaseAmount = drrow.DebitAmount;
          }
          else {
            let _newBlankRow = this.AccountingVoucherList.find(n => n.Amount == 0);
            if (!_newBlankRow)
              this.addnew(false, row.ShortText, row.Amount);
          }
        }
        //ends of assigning amount of the opposite amount to current row.
        this.dataSource = new MatTableDataSource<any>(this.AccountingVoucherList);
      }
      else {
        let _newBlankRow = this.AccountingVoucherList.find(n => n.Amount == 0);
        if (!_newBlankRow && row.Amount)
          this.addnew(false, row.ShortText, row.Amount);
      }
    }
    else {
      this.EnableSaveAll = true;
    }
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
  }

  ClearShorttext() {
    this.searchForm.patchValue({ "searchShortText": "" });
  }
  RemoveAccount(row) {
    let currentIndx = this.LedgerPosting.findIndex(x => x.AccountingVoucherId === row.AccountingVoucherId);
    if (currentIndx > -1)
      this.LedgerPosting[currentIndx].PostingGeneralLedgerId = row.GeneralLedgerAccountId;
  }
  RowsToSave = 0;
  JournalEntryNPosting: { "LedgerPosting": any[], "AccountingVoucher": any[] } = { "LedgerPosting": [], "AccountingVoucher": [] };
  SaveAll() {
    this.RowsToSave = 0;
    let accountNotSelected = this.AccountingVoucherList.findIndex(x => !x.GeneralLedgerAccountId);
    if (accountNotSelected > -1) {
      this.contentservice.openSnackBar("Please select an account at row " + (accountNotSelected + 1) + ".", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.CurrentAccountingMode.toLowerCase() == 'double entry') {
      let _totalDebit = this.AccountingVoucherList.reduce((acc, current) => current.Debit ? (acc + current.Amount) : acc, 0);
      let _totalCredit = this.AccountingVoucherList.reduce((acc, current) => !current.Debit ? (acc + current.Amount) : acc, 0);
      if (_totalCredit !== _totalDebit) {
        this.contentservice.openSnackBar("Total Debit and Credit are not equal.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
      let uniqueRows = _.uniqBy(this.AccountingVoucherList, 'ShortText');
      if (uniqueRows.length > 1) {
        this.contentservice.openSnackBar("Narration should be the same for all rows.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }
    this.AccountingVoucherList.forEach(item => {
      this.UpdateOrSave(item);
    })
    //}
  }
  reference = '';
  //RowsSent: any = [];
  UpdateOrSave(row) {
    //this.RowsSent.push(row);
    debugger;
    var errorMessage = '';
    //var reference = '';
    if (row.GeneralLedgerAccountId.GeneralLedgerId == 0)
      errorMessage += 'Please select one of the accounts<br>';
    if (row.Reference == '') {
      this.contentservice.openSnackBar("Please enter reference.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else
      this.reference = row.Reference;

    if (row.ShortText.length == 0) {
      errorMessage += 'Please enter description.';
      this.contentservice.openSnackBar(errorMessage, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.Amount > 1000000 || row.Amount < -1000000)
      errorMessage += "Amount should be less than 10,00,000 or greater than -10,00,000<br>";

    if (errorMessage.length > 0) {
      this.loading = false;
      this.PageLoading = false;
      //this.contentservice.openSnackBar(errorMessage,globalconstants.ActionText,globalconstants.RedBackground);
      this.contentservice.openSnackBar(errorMessage, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      let checkFilterString = "GeneralLedgerAccountId eq " + row.GeneralLedgerAccountId.GeneralLedgerId +
        " and Reference eq '" + row.Reference + "'";


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
            this.RowsToSave += 1;
            if (this.RowsToSave == this.AccountingVoucherList.length) {
              this.AccountingVoucherList.forEach((list: any) => {

                this.AccountingVoucherData.Active = list.Active;
                this.AccountingVoucherData.AccountingVoucherId = list.AccountingVoucherId;
                this.AccountingVoucherData.LedgerPostingId = list.LedgerPostingId;
                this.AccountingVoucherData.BaseAmount = +list.BaseAmount;
                this.AccountingVoucherData.Amount = +list.Amount;
                this.AccountingVoucherData.DocDate = list.DocDate;
                this.AccountingVoucherData.Debit = list.Debit;
                this.AccountingVoucherData.PostingDate = list.PostingDate;
                this.AccountingVoucherData.Reference = list.Reference;
                this.AccountingVoucherData.LedgerId = list.LedgerId;
                this.AccountingVoucherData.ActivityTypeId = list.ActivityTypeId;
                this.AccountingVoucherData.GeneralLedgerAccountId = list.GeneralLedgerAccountId.GeneralLedgerId;
                this.AccountingVoucherData.ClassFeeId = 0;
                this.AccountingVoucherData.FeeReceiptId = 0;
                this.AccountingVoucherData.ParentId = this.ParentId;
                this.AccountingVoucherData.TranParentId = this.TranParentId;
                this.AccountingVoucherData.ShortText = row.ShortText;
                this.AccountingVoucherData.OrgId = this.LoginUserDetail[0]["orgId"];
                this.AccountingVoucherData.SubOrgId = this.SubOrgId;

                if (list.AccountingVoucherId == 0) {
                  this.AccountingVoucherData["CreatedDate"] = new Date();
                  this.AccountingVoucherData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
                  delete this.AccountingVoucherData["UpdatedDate"];
                  delete this.AccountingVoucherData["UpdatedBy"];
                  //console.log('to insert', this.AccountingVoucherData)
                  this.JournalEntryNPosting.AccountingVoucher.push(JSON.parse(JSON.stringify(this.AccountingVoucherData)));
                  // if (this.RowsToSave == this.AccountingVoucherList.length)
                  //   this.insert();
                }
                else {
                  delete this.AccountingVoucherData["CreatedDate"];
                  delete this.AccountingVoucherData["CreatedBy"];
                  this.AccountingVoucherData["UpdatedDate"] = new Date();
                  this.AccountingVoucherData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
                  //console.log('to update', this.AccountingVoucherData)
                  this.JournalEntryNPosting.AccountingVoucher.push(JSON.parse(JSON.stringify(this.AccountingVoucherData)));
                  // if (this.RowsToSave == this.AccountingVoucherList.length)
                  //   this.insert();
                }
              })
              this.insert();
            }
          }
        });
    }
  }

  insert() {

    //debugger;
    this.JournalEntryNPosting.LedgerPosting = this.LedgerPosting;
    console.log("this.JournalEntryNPosting", this.JournalEntryNPosting);
    this.dataservice.postPatch(this.AccountingVoucherListName, this.JournalEntryNPosting, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          //row.AccountingVoucherId = data.AccountingVoucherId;
          //row.Action = false;
          // var indx = this.AllAccountingVouchers.findIndex(f => f.GeneralLedgerAccountId == this.AccountingVoucherData.GeneralLedgerAccountId
          //   && f.Reference == this.reference);
          // if (indx > -1) {
          //   this.AllAccountingVouchers.push({ "GeneralLedgerAccountId": this.AccountingVoucherData.GeneralLedgerAccountId, "Reference": this.reference });
          // }
          // this.ParentId = data.ParentId;

          this.EnableSaveAll = false;
          this.AccountingVoucherList = [];
          this.LedgerPosting = [];
          this.JournalEntryNPosting.AccountingVoucher = [];
          this.JournalEntryNPosting.LedgerPosting = [];

          this.dataSource = new MatTableDataSource<any>(this.AccountingVoucherList);
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.AccountingVoucherListName, this.AccountingVoucherData, this.AccountingVoucherData.AccountingVoucherId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;

          row.Action = false;
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
    this.GeneralLedgers = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.GeneralLedgers = [...data.value];
        this.loading = false; this.PageLoading = false;
      })
  }
  ActivityTypes = [];
  AccountingModes: any = [];
  CurrentAccountingMode = '';
  GetMasterData() {
    debugger;
    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.AccountingModes = this.getDropDownData(globalconstants.MasterDefinitions.accounting.ACCOUNTINGMODE);
    let objAccountingMode = this.AccountingModes.find(m => m.Active);
    if (objAccountingMode)
      this.CurrentAccountingMode = objAccountingMode.MasterDataName.toLowerCase();
    if(this.CurrentAccountingMode.toLowerCase() =='single entry')
    {
      this.displayedColumns = [
        "AccountingVoucherId",
        "PostingDate",
        "GeneralLedgerAccountId",
        "ShortText",
        "Amount",
        "Active",
        "Action",
      ];
    }
    console.log("CurrentAccountingMode", this.CurrentAccountingMode);

    this.ActivityTypes = this.getDropDownData(globalconstants.MasterDefinitions.accounting.ACTIVITYTYPE)
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
  LedgerPostingId: number;
  ParentId: number;
  Debit: boolean;
  Amount: number;
  BaseAmount: number;
  ShortText: string;
  Active: number;
  Action: boolean
}
export interface ILedgerPosting {
  LedgerPostingId: number;
  AccountingVoucherId: number;
  PostingGeneralLedgerId: number;
  Amount: number;
  Debit: boolean;
  ShortText: string;
  Reference: string;
  CreatedDate: Date;
  UpdatedDate: Date;
  OrgId: number;
  SubOrgId: number;
  Active: number;

}

