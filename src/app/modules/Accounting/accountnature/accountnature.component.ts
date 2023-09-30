import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-accountnature',
  templateUrl: './accountnature.component.html',
  styleUrls: ['./accountnature.component.scss']
})
export class AccountNatureComponent implements OnInit {
  PageLoading = true;
  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  GeneralLedgers: any[] = [];
  AccountNatureListName = 'AccountNatures';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  DummyMasterItemId = 4579;
  AccountingPeriod: any = {
    StartDate: new Date(),
    EndDate: new Date()
  }
  AccountNatures: any[] = [];
  Permission = '';
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  SelectedApplicationId = 0;
  loading = false;
  GLAccounts: any[] = [];
  AccountTypes: any[] = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  AccountNatureList: IAccountNature[] = [];
  dataSource: MatTableDataSource<IAccountNature>;
  allMasterData: any[] = [];
  searchForm: UntypedFormGroup;
  AccountNatureData: any = {
    AccountNatureId: 0,
    AccountName: '',
    ParentId: 0,
    DebitType: false,
    AccountTypeId: 0,
    TBSequence: 0,
    IncomeStatementSequence: 0,
    ExpenseSequence: 0,
    AssetSequence: 0,
    LnESequence: 0,
    OrgId: 0,
    SubOrgId: 0,
    Active: 0,
  };

  displayedColumns = [
    "AccountNatureId",
    "AccountName",
    "ParentId",
    "DebitType",
    "AccountTypeId",
    "IncomeStatementSequence",
    "ExpenseSequence",
    "AssetSequence",
    "LnESequence",
    "TBSequence",
    "Active",
    "Action",
  ];
  filteredAccounts: Observable<IAccountNature[]>;

  constructor(private servicework: SwUpdate,
    private dialog: MatDialog,
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
      searchParentId: [0],
      searchAccountName: ['']
    });
    this.filteredAccounts = this.searchForm.get("searchAccountName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.AccountName),
        map(Name => Name ? this._filter(Name) : this.AccountNatures.slice())
      )!;
    this.PageLoad();
  }

  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();

    // this.filteredOptions = this.searchForm.get("searchGeneralLedgerId")?.valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => typeof value === 'string' ? value : value.TeacherName),
    //     map(TeacherName => TeacherName ? this._filter(TeacherName) : this.GeneralLedgers.slice())
    //   );

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      //this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.accounting.ACCOUNTNATURE);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {

        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.GetMasterData();
        this.GetAccountNatureAutoComplete();
      }
    }

  }
  FilteredAccountNature: any[] = [];
  filterAccountNature() {
    var _parentId = this.searchForm.get("searchAccountName")?.value;
    this.FilteredAccountNature = this.AccountNatureList.filter((f: any) => f.ParentId == _parentId);
  }
  private _filter(name: string): IAccountNature[] {

    const filterValue = name.toLowerCase();
    return this.AccountNatures.filter(option => option.AccountName.toLowerCase().includes(filterValue));

  }

  displayFn(ledger: IAccountNature): string {
    return ledger && ledger.AccountName ? ledger.AccountName : '';
  }
  addnew() {
    //var debitcredit = debit == 'debit' ? 0 : 1
    var newdata = {
      AccountNatureId: 0,
      AccountName: '',
      DebitType: false,
      AccountTypeId: 0,
      IncomeStatementSequence: 0,
      ExpenseSequence: 0,
      TBSequence: 0,
      AssetSequence: 0,
      LnESequence: 0,
      ParentId: 0,
      Active: 0,
      Action: true
    }
    this.AccountNatureList.push(newdata);
    this.dataSource = new MatTableDataSource<IAccountNature>(this.AccountNatureList);
  }

  GetAccountNature() {

    let filterStr = this.FilterOrgSubOrg;
    debugger;
    this.loading = true;

    var _searchAccountId = this.searchForm.get("searchAccountName")?.value.AccountNatureId;
    //var _searchParentId = this.searchForm.get("searchParentId")?.value;
    if (_searchAccountId == undefined) {
      filterStr += " and ParentId eq 0";
    }
    else if (_searchAccountId > 0) {
      filterStr += " and ParentId eq " + _searchAccountId
    }

    let list: List = new List();
    list.fields = [
      "AccountNatureId",
      "AccountName",
      "ParentId",
      "DebitType",
      "AccountTypeId",
      "IncomeStatementSequence",
      "TBSequence",
      "ExpenseSequence",
      "AssetSequence",
      "LnESequence",
      "Active",
    ];

    list.PageName = this.AccountNatureListName;
    list.filter = [filterStr];
    this.AccountNatureList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AccountNatureList = [...data.value];
        if (this.AccountNatureList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        this.dataSource = new MatTableDataSource<IAccountNature>(this.AccountNatureList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.loading = false;
        this.PageLoading = false;
      });
  }
  GetAccountNatures() {

    let filterStr = "Active eq true and " + this.FilterOrgSubOrg;
    debugger;
    this.loading = true;

    let list: List = new List();
    list.fields = [
      "AccountNatureId",
      "AccountName",
      "ParentId",
      "DebitType",
      "Active",
    ];

    list.PageName = this.AccountNatureListName;
    list.filter = [filterStr];
    this.AccountNatureList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AccountNatureList = [...data.value];
        this.loading = false;
        this.PageLoading = false;
      });
  }
  GetAccountNatureAutoComplete() {
    let filterStr = '(OrgId eq 0 or (' + this.FilterOrgSubOrg + ")) and Active eq true";
    this.loading = true;

    let list: List = new List();
    list.fields = [
      "AccountNatureId",
      "AccountName",
      "ParentId",
      "DebitType",
      "Active",
    ];

    list.PageName = this.AccountNatureListName;
    list.filter = [filterStr];
    //this.AccountNatures :any[]= [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AccountNatures = [...data.value];

        this.loading = false;
        this.PageLoading = false;
      });
  }

  onBlur(row) {
    row.Action = true;
  }
  updateActive(row, value) {

    row.Active = value.checked;
    row.Action = true;
  }
  UpdateDebit(row, event) {
    if (event.checked)
      row.DebitType = true;
    else
      row.DebitType = false;
    this.onBlur(row);
  }

  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = this.FilterOrgSubOrg;
    if (row.AccountName.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter account name.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      checkFilterString += " and AccountName eq '" + row.AccountName + "'";

    }
    if (row.DebitType != undefined)
      " or DebitType eq " + row.DebitType


    if (row.AccountNatureId > 0)
      checkFilterString += " and AccountNatureId ne " + row.AccountNatureId;
    checkFilterString += " and " + globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    let list: List = new List();
    list.fields = ["AccountNatureId"];
    list.PageName = this.AccountNatureListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.AccountNatureData.Active = row.Active;
          this.AccountNatureData.AccountNatureId = row.AccountNatureId;
          this.AccountNatureData.AccountName = row.AccountName;
          this.AccountNatureData.ParentId = row.ParentId;
          this.AccountNatureData.DebitType = row.DebitType;
          this.AccountNatureData.AccountTypeId = row.AccountTypeId;
          this.AccountNatureData.IncomeStatementSequence = row.IncomeStatementSequence;
          this.AccountNatureData.ExpenseSequence = row.ExpenseSequence;
          this.AccountNatureData.AssetSequence = row.AssetSequence;
          this.AccountNatureData.LnESequence = row.LnESequence;
          this.AccountNatureData.TBSequence = row.TBSequence;

          this.AccountNatureData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.AccountNatureData.SubOrgId = this.SubOrgId;

          if (row.AccountNatureId == 0) {
            this.AccountNatureData["CreatedDate"] = new Date();
            this.AccountNatureData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.AccountNatureData["UpdatedDate"];
            delete this.AccountNatureData["UpdatedBy"];
            //console.log('to insert', this.AccountNatureData)
            this.insert(row);
          }
          else {
            delete this.AccountNatureData["CreatedDate"];
            delete this.AccountNatureData["CreatedBy"];
            this.AccountNatureData["UpdatedDate"] = new Date();
            this.AccountNatureData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            //console.log('to update', this.AccountNatureData)
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.AccountNatureListName, this.AccountNatureData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.PageLoading = false;
          row.Action = false;
          row.AccountNatureId = data.AccountNatureId;

          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.AccountNatureListName, this.AccountNatureData, this.AccountNatureData.AccountNatureId, 'patch')
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

  openDialog(row) {
    debugger;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Save',
          cancel: 'No'
        }
      }
    });

    dialogRef.afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.UpdateAsDeleted(row);
        }
      });
  }

  UpdateAsDeleted(row) {
    debugger;
    let toUpdate = {
      Active: false,
      Deleted: true,
      UpdatedDate: new Date()
    }

    this.dataservice.postPatch('AccountNatures', toUpdate, row.AccountNatureId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.AccountNatureList.findIndex(x => x.AccountNatureId == row.AccountNatureId)
        this.AccountNatureList.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.AccountNatureList);
        this.dataSource.filterPredicate = this.createFilter();
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.MasterDataName.toLowerCase().indexOf(searchTerms.MasterDataName) !== -1
    }
    return filterFunction;
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.AccountTypes = this.getDropDownData(globalconstants.MasterDefinitions.accounting.ACCOUNTTYPE)
    this.loading = false; this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }

}
export interface IAccountNature {
  AccountNatureId: number;
  AccountName: string;
  ParentId: number;
  DebitType: boolean
  Active: number;
  Action: boolean
}


