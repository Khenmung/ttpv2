import { Component, OnInit, ViewChild } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-ledgeraccount',
  templateUrl: './ledgeraccount.component.html',
  styleUrls: ['./ledgeraccount.component.scss']
})
export class LedgerAccountComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  PageLoading = true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  GeneralLedgerList: IGeneralLedger[] = [];
  SelectedBatchId = 0;
  SubOrgId = 0;
  TopAccountNatures = [];
  AccountNatures = [];
  AccountGroups = [];
  GeneralLedgerAutoComplete = [];
  AccountNatureList = [];
  filteredOptions = [];
  dataSource: MatTableDataSource<IGeneralLedger>;
  allMasterData = [];
  PlusOrMinus = [];
  ExamId = 0;
  GeneralLedgerData = {
    GeneralLedgerId: 0,
    GeneralLedgerName: '',
    ContactNo: '',
    ContactName: '',
    Email: '',
    Address: '',
    AccountNatureId: 0,
    AccountGroupId: 0,
    AccountSubGroupId: 0,
    IncomeStatementSequence: 0,
    IncomeStatementPlus: 0,
    ExpenseSequence: 0,
    ExpensePlus: 0,
    LnEPlus: 0,
    LnESequence: 0,
    AssetSequence: 0,
    AssetPlus: 0,
    TBSequence: 0,
    TBPlus: 0,
    OrgId: 0,SubOrgId: 0,
    Active: 0
  };
  GeneralLedgerForUpdate = [];
  displayedColumns = [
    'Action',
    'Active',
    'GeneralLedgerName',
    'AccountNatureId',
    'AccountGroupId',
    //'AccountSubGroupId',
    'IncomeStatementSequence',
    'IncomeStatementPlus',
    'ExpenseSequence',
    'ExpensePlus',
    'AssetSequence',
    'AssetPlus',
    'LnESequence',
    'LnEPlus',
    'TBSequence',
    'TBPlus',
    'ContactNo',
    'ContactName',
    'Email',
    'Address',
    'GeneralLedgerId'
  ];
  searchForm: UntypedFormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    //debugger;
    this.searchForm = this.fb.group({
      searchLedgerName: [0],
      searchAccountNatureId: [0],
      searchAccountGroupId: [0],
      searchAccountSubGroupId: [0]
    });
    this.PlusOrMinus = [
      { "Text": "None", "Val": 0 },
      { "Text": "Plus", "Val": 1 },
      { "Text": "Minus", "Val": -1 }
    ]
    // this.filteredOptions = this.searchForm.get("searchLedgerName").valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => typeof value === 'string' ? value : value.GeneralLedgerName),
    //     map(GeneralLedgerName => GeneralLedgerName ? this._filter(GeneralLedgerName) : this.GeneralLedgerAutoComplete.slice())
    //   );
    //this.StudentClassId = this.tokenStorage.getStudentClassId();
    this.PageLoad();
  }
  private _filter(name: string): IGeneralLedger[] {

    const filterValue = name.toLowerCase();
    return this.GeneralLedgerAutoComplete.filter(option => option.GeneralLedgerName.toLowerCase().includes(filterValue));

  }
  displayFn(ledger: IGeneralLedger): string {
    return ledger && ledger.GeneralLedgerName ? ledger.GeneralLedgerName : '';
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.STUDENTAPROFILE)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      debugger;
      if (this.Permission != 'deny') {
        this.SubOrgId = this.tokenStorage.getSubOrgId();
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetMasterData();
        this.GetAccountNature();
        this.GetGeneralLedgerAutoComplete();
      }
    }
  }
  AccountSubGroups = [];
  GetSubGroup() {
    debugger;
    var _groupId = this.searchForm.get("searchAccountGroupId").value;
    if (_groupId > 0) {
      this.AccountSubGroups = this.AccountNatures.filter(f => f.ParentId == _groupId)
      this.filteredOptions = this.GeneralLedgerAutoComplete.filter(x => x.AccountGroupId == _groupId)
    }

  }
  GetSubGroupAccounts() {
    var _subgroupId = this.searchForm.get("searchAccountSubGroupId").value;
    this.filteredOptions = this.GeneralLedgerAutoComplete.filter(x => x.AccountGroupId == _subgroupId)
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          // this.GetApplicationRoles();

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  AddNew() {
    var subgroupId = this.searchForm.get("searchAccountSubGroupId").value;
    var newItem = {
      GeneralLedgerId: 0,
      GeneralLedgerName: '',
      AccountNatureId: this.searchForm.get("searchAccountNatureId").value,
      AccountGroupId: this.searchForm.get("searchAccountGroupId").value,
      AccountSubGroupId: subgroupId,
      AccountGroups: this.AccountGroups,
      IncomeStatementSequence: 0,
      IncomeStatementPlus: 0,
      ExpenseSequence: 0,
      ExpensePlus: 0,
      AssetPlus: 0,
      AssetSequence: 0,
      LnEPlus: 0,
      LnESequence: 0,
      TBPlus: 0,
      TBSequence: 0,
      ContactNo: '',
      ContactName: '',
      Email: '',
      Address: '',
      OrgId: 0,
      SubOrgId:0,
      Active: 0,
      Action: false
    }
    this.GeneralLedgerList = [];
    this.GeneralLedgerList.push(newItem);
    this.dataSource = new MatTableDataSource(this.GeneralLedgerList);
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = this.FilterOrgSubOrg;
    if (row.AccountNatureId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select account nature.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      checkFilterString += ' and AccountNatureId eq ' + row.AccountNatureId;
    }
    if (row.AccountGroupId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select account group.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    // else {
    //   checkFilterString += ' and AccountGroupId eq ' + row.AccountGroupId;
    // }
    if (row.GeneralLedgerName.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter account name.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      checkFilterString += " and GeneralLedgerName eq '" + row.GeneralLedgerName + "'";
    }
    // if (row.AccountSubGroupId > 0) {
    //   checkFilterString += " and AccountSubGroupId eq " + row.AccountSubGroupId;
    // }

    if (row.GeneralLedgerId > 0)
      checkFilterString += " and GeneralLedgerId ne " + row.GeneralLedgerId;

    let list: List = new List();
    list.fields = ["GeneralLedgerId"];
    list.PageName = "GeneralLedgers";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
          this.GeneralLedgerForUpdate = [];;
          this.GeneralLedgerData.GeneralLedgerId = row.GeneralLedgerId;
          this.GeneralLedgerData.AccountNatureId = row.AccountNatureId;
          this.GeneralLedgerData.AccountGroupId = row.AccountGroupId;
          this.GeneralLedgerData.IncomeStatementPlus = row.IncomeStatementPlus;
          this.GeneralLedgerData.IncomeStatementSequence = row.IncomeStatementSequence;
          this.GeneralLedgerData.ExpenseSequence = row.ExpenseSequence;
          this.GeneralLedgerData.ExpensePlus = row.ExpensePlus;
          this.GeneralLedgerData.AssetPlus = row.AssetPlus;
          this.GeneralLedgerData.AssetSequence = row.AssetSequence;
          this.GeneralLedgerData.LnESequence = row.LnESequence;
          this.GeneralLedgerData.LnEPlus = row.LnEPlus;
          this.GeneralLedgerData.TBPlus = row.TBPlus;
          this.GeneralLedgerData.TBSequence = row.TBSequence;
          this.GeneralLedgerData.AccountSubGroupId = row.AccountSubGroupId == null ? 0 : row.AccountSubGroupId;
          this.GeneralLedgerData.GeneralLedgerName = row.GeneralLedgerName;
          this.GeneralLedgerData.ContactNo = row.ContactNo;
          this.GeneralLedgerData.ContactName = row.ContactName;
          this.GeneralLedgerData.Email = row.Email;
          this.GeneralLedgerData.Address = row.Address;

          this.GeneralLedgerData.Active = row.Active;
          this.GeneralLedgerData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.GeneralLedgerData.SubOrgId = this.SubOrgId;

          if (this.GeneralLedgerData.GeneralLedgerId == 0) {
            this.GeneralLedgerData["CreatedDate"] = new Date();
            this.GeneralLedgerData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.GeneralLedgerData["UpdatedDate"] = new Date();
            delete this.GeneralLedgerData["UpdatedBy"];
            console.log("inserting1", this.GeneralLedgerData);
            this.insert(row);
          }
          else {
            this.GeneralLedgerData["CreatedDate"] = new Date();
            this.GeneralLedgerData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.GeneralLedgerData["UpdatedDate"] = new Date();
            delete this.GeneralLedgerData["UpdatedBy"];
            console.log("inserting2", this.GeneralLedgerData);
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {
    //console.log("inserting",this.GeneralLedgerForUpdate);
    //debugger;
    this.dataservice.postPatch("GeneralLedgers", this.GeneralLedgerData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.GeneralLedgerId = data.GeneralLedgerId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {
    //console.log("updating",this.GeneralLedgerForUpdate);
    this.dataservice.postPatch("GeneralLedgers", this.GeneralLedgerData, this.GeneralLedgerData.GeneralLedgerId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetAccountNature() {
    //debugger;
    this.loading = true;
    let filterStr = 'Active eq true and (OrgId eq 0 or (' + this.FilterOrgSubOrg +"))";

    let list: List = new List();
    list.fields = [
      'AccountNatureId',
      'AccountName',
      'ParentId',
      'DebitType',
      'Active'
    ];

    list.PageName = "AccountNatures";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.AccountNatures = [...data.value];
          this.TopAccountNatures = this.AccountNatures.filter(f => f.ParentId == 0);
        }
        this.loadingFalse();
      });

  }
  GetGeneralLedgerAutoComplete() {
    //debugger;
    this.loading = true;
    let filterStr =this.FilterOrgSubOrg+ ' and Active eq 1';

    let list: List = new List();
    list.fields = [
      'GeneralLedgerId',
      'GeneralLedgerName',
      'AccountSubGroupId',
      'AccountNatureId',
      'AccountGroupId',
      'Active',
    ];

    list.PageName = "GeneralLedgers";
    list.filter = [filterStr];
    this.GeneralLedgerList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.GeneralLedgerAutoComplete = [...data.value];
        }
        this.loadingFalse();
      });

  }
  GetGeneralLedger() {
    //debugger;
    this.loading = true;

    let filterStr = ''+this.FilterOrgSubOrg + ' and Active eq 1';
    var AccountNatureId = this.searchForm.get("searchAccountNatureId").value
    var AccountGroupId = this.searchForm.get("searchAccountGroupId").value
    var AccountSubGroupId = this.searchForm.get("searchAccountSubGroupId").value
    var GeneralLedgerId = this.searchForm.get("searchLedgerName").value.GeneralLedgerId;

    if (AccountNatureId == 0 && AccountGroupId == 0 && GeneralLedgerId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select search criteria", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (AccountNatureId > 0) {
      filterStr += ' and AccountNatureId eq ' + AccountNatureId;
    }
    if (AccountGroupId > 0) {
      filterStr += ' and AccountGroupId eq ' + AccountGroupId;
    }
    if (AccountSubGroupId > 0) {
      filterStr += ' and AccountSubGroupId eq ' + AccountSubGroupId;
    }
    if (GeneralLedgerId > 0) {
      filterStr += ' and GeneralLedgerId eq ' + GeneralLedgerId;
    }
    let list: List = new List();
    list.fields = [
      'GeneralLedgerId',
      'GeneralLedgerName',
      'IncomeStatementSequence',
      'IncomeStatementPlus',
      'ExpensePlus',
      'ExpenseSequence',
      'AssetSequence',
      'AssetPlus',
      'LnESequence',
      'LnEPlus',
      'TBSequence',
      'TBPlus',
      'AccountSubGroupId',
      'AccountNatureId',
      'AccountGroupId',
      'ContactNo',
      'ContactName',
      'Email',
      'Address',
      'Active',
    ];

    list.PageName = "GeneralLedgers";
    list.filter = [filterStr];
    this.GeneralLedgerList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          var acgroup = [];
          this.GeneralLedgerList = data.value.map(item => {
            //acgroup = this.allMasterData.filter(f => f.ParentId == item.AccountNatureId);
            item.AccountGroups = this.AccountNatures.filter(f => f.ParentId == item.AccountNatureId);
            item.AccountSubGroups = this.AccountNatures.filter(f => f.ParentId == item.AccountGroupId);
            item.Action = false;
            return item;
          });
        }
        if (this.GeneralLedgerList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        console.log("this.GeneralLedgerList", this.GeneralLedgerList);
        this.dataSource = new MatTableDataSource<IGeneralLedger>(this.GeneralLedgerList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
  }
  onBlur(row) {
    row.Action = true;
  }
  AccountNatureChanged(row) {
    debugger;
    row.Action = true;
    var acgroup = this.AccountNatures.filter(f => f.ParentId == row.AccountNatureId);
    row.AccountGroups = acgroup;
    this.dataSource = new MatTableDataSource(this.GeneralLedgerList);
  }

  SearchAccountNatureChanged() {
    debugger;
    var natureId = this.searchForm.get("searchAccountNatureId").value;
    if (natureId > 0)
      this.AccountGroups = this.AccountNatures.filter(f => f.ParentId == natureId);
  }
  UpdateActive(row, event) {
    row.Active = event.checked ? 1 : 0;
    row.Action = true;
  }
  UpdateBS(row, event) {
    debugger;
    row.BalanceSheetPlus = event.checked;
    row.Action = true;
  }
  UpdatePnL(row, event) {
    row.IncomeStatementPlus = event.checked;
    row.Action = true;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);

  }

}
export interface IGeneralLedger {
  GeneralLedgerId: number;
  GeneralLedgerName: string;
  AccountSubGroupId: number;
  ContactNo: string;
  ContactName: string;
  Email: string;
  Address: string;
  IncomeStatementPlus: number;
  IncomeStatementSequence: number;
  ExpensePlus: number;
  ExpenseSequence: number;
  AssetPlus: number;
  AssetSequence: number;
  LnEPlus: number;
  LnESequence: number;
  TBPlus: number;
  TBSequence: number;
  AccountNatureId: number;
  AccountGroupId: number;
  AccountGroups: any[];
  OrgId: number;
  SubOrgId: number;
  Active: number;
  Action: boolean;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}

