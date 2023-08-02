import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-userreportconfigcolumns',
  templateUrl: './userreportconfigcolumns.component.html',
  styleUrls: ['./userreportconfigcolumns.component.scss']
})
export class UserReportConfigColumnsComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  boolEnableButton = false;
  BaseReportId = 0;
  ParentId = 0;
  Permission = '';
  DisplayColumns = [
    "ReportConfigItemId",
    "ReportName",
    //"DisplayName",
    //"ColumnSequence",   
    "Active",
    "Action"
  ];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  ColumnsOfAvailableReports = [];
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  ToUpateCount = -1;
  AvailableReportNames = [];
  AppReportNames = [];
  Applications = [];
  ReportNames = [];
  ReportConfigItemListName = "ReportConfigItems";
  ReportConfigItemList = [];
  dataSource: MatTableDataSource<IReportConfigItem>;
  allMasterData = [];
  PagePermission = '';
  SubOrgId=0;
  ReportConfigItemData = {
    ReportConfigItemId: 0,
    ReportName: '',
    DisplayName: '',
    ParentId: 0,
    Formula: '',
    ColumnSequence: 0,
    ApplicationId: 0,
    TableNames: '',
    OrgId: 0,SubOrgId: 0,
    UserId: '',
    Active: 0
  };
  ModuleName ='';
  StudentAllMustMandatory = ['FirstName', 'Gender', 'DOB', 'Bloodgroup', 'Category', 'Religion', 
    'ClassAdmissionSought',
    'AdmissionStatus'];
  EmployeeAllMustMandatory = ['FirstName', 'Gender', 'DOB', 'Bloodgroup', 'Category', 'Religion', 'ContactNo',
    'EmploymentStatus', 'EmploymentType', 'MaritalStatus', 'Nature', 'PresentAddress', 'PermanentAddress', 'Department',
    'EmpGrade', 'Designation']
  SelectedApplicationId = 0;
  ApplicationName = '';
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,

    private nav: Router,
    private fb: UntypedFormBuilder
  ) {

  }

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
      //searchApplicationId: [0],
      searchAvailableReportName: [0],
      searchReportName: [0]
    });
    //this.dataSource = new MatTableDataSource<IReportConfigItem>([]);
    this.Applications = this.tokenStorage.getPermittedApplications();
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
    this.PageLoad()
  }

  PageLoad() {
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    this.ApplicationName = this.LoginUserDetail[0]["org"];
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    this.FilterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.FilterOrgSubOrgBatchId= globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    this.GetBaseReportId();
  }
  updateActive(row, value) {
    debugger;
    if (this.StudentAllMustMandatory.indexOf(row.ReportName) == -1)
      row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }
  EnableButton() {
    this.boolEnableButton = true;
  }
  addnew() {
    debugger;

    var newdata = {
      ReportConfigItemId: 0,
      ReportName: '',
      DisplayName: '',
      ParentId: 0,
      Formula: '',
      ColumnSequence: 0,
      OldSequence: 0,
      ApplicationId: this.SelectedApplicationId,
      TableNames: '',
      OrgId: 0,SubOrgId: 0,
      UserId: '',
      Active: 0,
      Action: false
    }
    ////console.log('DisplayColumns', this.DisplayColumns)
    ////console.log('this.ReportConfigItemList', this.ReportConfigItemList)
    this.ReportConfigItemList.push(newdata);
    this.dataSource = new MatTableDataSource(this.ReportConfigItemList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  SelectAll(event) {
    this.ReportConfigItemList.forEach(f => {
      if (event.checked == true) {
        f.Active = true;
      }
      else
        f.Active = false;
    })
  }
  SaveAll() {
    var edited = this.ReportConfigItemList.filter(f => f.Action || f.ReportConfigItemId == 0);
    this.ToUpateCount = edited.length;
    edited.forEach(f => {
      this.ToUpateCount--;
      this.UpdateOrSave(f);
    })
  }
  Save(row) {
    this.ToUpateCount = 0;
    this.UpdateOrSave(row)
  }
  UpdateOrSave(row) {

    debugger;
    var AvailableReportId = this.searchForm.get("searchAvailableReportName").value;
    //var ApplicationId = this.SelectedApplicationId;
    var MyReportNameId = this.searchForm.get("searchReportName").value;
    // if (ApplicationId == 0) {
    //   this.contentservice.openSnackBar("Please select application name", globalconstants.ActionText,globalconstants.RedBackground);
    //   return;
    // }
    if (AvailableReportId == 0) {
      this.contentservice.openSnackBar("Please select available report name", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (MyReportNameId == 0) {
      this.contentservice.openSnackBar("Please select my report name", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    let checkFilterString = this.FilterOrgSubOrgBatchId + " and Active eq 1 and ReportName eq '" + row.ReportName + "'" +
      " and ApplicationId eq " + row.ApplicationId + 
      " and ParentId eq " + MyReportNameId;

    if (row.ReportConfigItemId > 0)
      checkFilterString += " and ReportConfigItemId ne " + row.ReportConfigItemId;

    this.loading = true;
    let list: List = new List();
    list.fields = ["*"];
    list.PageName = this.ReportConfigItemListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.ReportConfigItemData.ReportConfigItemId = row.ReportConfigItemId;
          this.ReportConfigItemData.ApplicationId = row.ApplicationId;
          this.ReportConfigItemData.DisplayName = row.DisplayName;
          this.ReportConfigItemData.ColumnSequence = row.ColumnSequence;
          this.ReportConfigItemData.Formula = row.Formula;
          this.ReportConfigItemData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ReportConfigItemData.SubOrgId = this.SubOrgId;
          this.ReportConfigItemData.ParentId = MyReportNameId;
          this.ReportConfigItemData.UserId = row.UserId;
          this.ReportConfigItemData.Active = row.Active;
          this.ReportConfigItemData.ReportName = row.ReportName;
          this.ReportConfigItemData.TableNames = row.TableNames;

          ////console.log('data', this.ReportConfigItemData);

          if (this.ReportConfigItemData.ReportConfigItemId == 0) {
            this.ReportConfigItemData["CreatedDate"] = new Date();
            this.ReportConfigItemData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ReportConfigItemData["UpdatedDate"] = new Date();
            delete this.ReportConfigItemData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ReportConfigItemData["CreatedDate"];
            delete this.ReportConfigItemData["CreatedBy"];
            this.ReportConfigItemData["UpdatedDate"] = new Date();
            this.ReportConfigItemData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.ReportConfigItemListName, this.ReportConfigItemData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ReportConfigItemId = data.ReportConfigItemId;
          row.Action = false;
          this.loading = false; this.PageLoading = false;
          if (this.ToUpateCount == 0) {
            this.ToUpateCount = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ReportConfigItemListName, this.ReportConfigItemData, this.ReportConfigItemData.ReportConfigItemId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.Action = false;
          if (this.ToUpateCount == 0) {
            this.ToUpateCount = -1;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  ReSequence(editedrow) {
    debugger;
    //var diff = 0;
    if (editedrow.ColumnSequence != editedrow.OldSequence) {

      if (editedrow.ColumnSequence > editedrow.OldSequence) {
        var filteredData = this.ReportConfigItemList.filter(currentrow => currentrow.ReportConfigItemId != editedrow.ReportConfigItemId
          && currentrow.ColumnSequence > editedrow.OldSequence
          && currentrow.ColumnSequence <= editedrow.ColumnSequence)

        filteredData.forEach(currentrow => {

          currentrow.ColumnSequence -= 1;
          currentrow.OldSequence -= 1;
          currentrow.Action = true;

        });
      }
      else if (editedrow.ColumnSequence < editedrow.OldSequence) {
        var filteredData = this.ReportConfigItemList.filter(currentrow => currentrow.ReportConfigItemId != editedrow.ReportConfigItemId
          && currentrow.ColumnSequence >= editedrow.ColumnSequence
          && currentrow.ColumnSequence < editedrow.OldSequence)

        filteredData.forEach(currentrow => {
          currentrow.ColumnSequence += 1;
          currentrow.OldSequence += 1;
          currentrow.Action = true;
        })
      }

      editedrow.OldSequence = editedrow.ColumnSequence;
      this.ReportConfigItemList.sort((a, b) => a.ColumnSequence - b.ColumnSequence);
      this.dataSource = new MatTableDataSource<IReportConfigItem>(this.ReportConfigItemList);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      //this.onBlur(editedrow);
    }
    editedrow.Action = true;
  }
  get f() {
    return this.searchForm.controls;
  }
  GetReportNameNColumns(){
  
  }
  GetReportConfigItem() {
    debugger;

    this.ReportConfigItemList = [];
    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = this.FilterOrgSubOrg;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var ApplicationId = this.SelectedApplicationId;  //this.SelectedApplicationId;
    var AvailableReportId = this.searchForm.get("searchAvailableReportName").value;
    var MyReportNameId = this.searchForm.get("searchReportName").value;
    
    if (ApplicationId == 0) {
      this.contentservice.openSnackBar("Please select application name", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (AvailableReportId == undefined || AvailableReportId == 0) {
      this.contentservice.openSnackBar("Please select available report name", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (MyReportNameId == undefined || MyReportNameId == 0) {
      this.contentservice.openSnackBar("Please select my report name", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    filterstr += " and ApplicationId eq " + this.SelectedApplicationId;
    filterstr += " and ParentId eq " + MyReportNameId;

    let list: List = new List();
    list.fields = [
      "ReportConfigItemId",
      "ReportName",
      "DisplayName",
      "ParentId",
      "Formula",
      "ColumnSequence",
      "ApplicationId",
      "TableNames",
      "OrgId",
      "UserId",
      "Active"
    ];
    list.PageName = this.ReportConfigItemListName;
    //list.lookupFields = ["SchoolClassPeriod"]
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var MyReportNameId = this.searchForm.get("searchReportName").value;
        this.ReportConfigItemList = [];
        var applicationAvailableReportCol = this.ColumnsOfAvailableReports.filter(f => f.ParentId == this.searchForm.get("searchAvailableReportName").value);
        applicationAvailableReportCol.forEach(a => {
          var existing = data.value.filter(d => d.ReportName == a.ReportName);
          if (existing.length > 0) {
            existing[0].Action = false;
            existing[0].OldSequence = existing[0].ColumnSequence;
            existing[0].TableNames = a.TableNames;
            this.ReportConfigItemList.push(existing[0]);
          }
          else {
            a.Active = 0;
            a.Action = false;
            a.ReportConfigItemId = 0;
            a.OldSequence = a.ColumnSequence;
            a.ColumnSequence = 100;
            a.ParentId = MyReportNameId;

            this.ReportConfigItemList.push(a);
          }
        })

        this.ReportConfigItemList.forEach(f => {
          if (this.ModuleName == 'Student Module') {
            if (this.StudentAllMustMandatory.indexOf(f.ReportName) > -1) {
              f.Active = 1;
              f.Action = false;
            }
          }
          else if (this.ModuleName == 'Employee Module') {
            if (this.EmployeeAllMustMandatory.indexOf(f.ReportName) > -1) {
              f.Active = 1;
              f.Action = false;
            }
          }
        })
        this.ReportConfigItemList.sort((a, b) => b.Active - a.Active || a.ColumnSequence - b.ColumnSequence);
        this.dataSource = new MatTableDataSource<IReportConfigItem>(this.ReportConfigItemList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
        this.boolEnableButton = false;
      })
  }

  onBlur(element) {
    if (this.StudentAllMustMandatory.indexOf(element.ReportName) == -1)
      element.Action = true;
  }
  GetBaseReportId() {

    let list: List = new List();
    list.fields = [
      "ReportConfigItemId"
    ]
    list.PageName = this.ReportConfigItemListName;
    list.filter = ["Active eq 1 and ReportName eq 'Reports' and OrgId eq 0"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.BaseReportId = data.value[0].ReportConfigItemId;
          this.GetReportNames();
        }
        else {
          this.contentservice.openSnackBar("Base report Id not found!", globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.loading = false; this.PageLoading = false;
      });
  }
  GetReportNames() {

    let list: List = new List();
    list.fields = [
      "ReportConfigItemId",
      "ReportName",
      "DisplayName",
      "ParentId",
      "ApplicationId",
      "TableNames",
      "OrgId",
      "UserId",
      "Active"]
    list.PageName = this.ReportConfigItemListName;
    list.filter = ["Active eq 1 and (ParentId eq " + this.BaseReportId +
      " or ("+ this.FilterOrgSubOrg + "))"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ReportNames = [...data.value];
        this.GetAvailableReportNames();
        this.loading = false; this.PageLoading = false;
      });
  }
  GetAvailableReportNames() {
    debugger;
    this.ReportConfigItemList = [];
    this.AvailableReportNames = this.ReportNames.filter(a => a.ApplicationId == this.SelectedApplicationId
      && a.ParentId == this.BaseReportId);
    this.dataSource = new MatTableDataSource(this.ReportConfigItemList);
  }
  GetMyReportNames() {
    this.ReportConfigItemList = [];
    var AvailableReportId = this.searchForm.get("searchAvailableReportName").value;
    this.AppReportNames = this.ReportNames.filter(a => a.ApplicationId == this.SelectedApplicationId
      && a.ParentId == AvailableReportId);
    this.dataSource = new MatTableDataSource(this.ReportConfigItemList);
    this.boolEnableButton = true;
    
    this.ModuleName = this.AvailableReportNames.filter(f => f.ReportConfigItemId == AvailableReportId)[0].ReportName;
    this.getAvailableReportColumn();
  }
  getAvailableReportColumn() {
    let list: List = new List();
    list.fields = [
      "ReportConfigItemId",
      "ReportName",
      "DisplayName",
      "ParentId",
      "ApplicationId",
      "ColumnSequence",
      "TableNames",
      "OrgId",
      "UserId",
      "Active"]
    list.PageName = this.ReportConfigItemListName;
    list.filter = ["OrgId eq 0 and Active eq 1 and ParentId eq " + this.searchForm.get("searchAvailableReportName").value];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ColumnsOfAvailableReports = [...data.value];
        this.loading = false; this.PageLoading = false;
      });
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
export interface IReportConfigItem {
  ReportConfigItemId: number;
  ReportName: string;
  DisplayName: string;
  ParentId: number;
  Formula: string;
  ColumnSequence: number;
  ApplicationId: number;
  TableNames: string;
  OrgId: number;SubOrgId: number;
  UserId: string;
  Active: number;
  CreatedBy: string;
  CreatedDate: Date;
  UpdatedBy: string;
  UpdatedDate: Date;

}






