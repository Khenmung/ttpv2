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
  selector: 'app-ReportConfigItem',
  templateUrl: './reportconfigitem.component.html',
  styleUrls: ['./reportconfigitem.component.scss']
})
export class ReportConfigItemComponent implements OnInit { PageLoading=true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  BaseReportId = 0;
  ParentId = 0;
  Permission = '';
  DisplayColumns = [
    "ReportName",
    "DisplayName",
    //"Formula",
    "ColumnSequence",
    "TableNames",
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
  StandardFilterWithBatchId = '';
  loading = false;
  ToUpdateCount = -1;
  AppReportNames = [];
  Applications = [];
  ReportNames = [];
  ReportConfigItemListName = "ReportConfigItems";
  ReportConfigItemList = [];
  dataSource: MatTableDataSource<IReportConfigItem>;
  allMasterData = [];
  PagePermission = '';
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
      searchApplicationId: [0],
      searchReportName: [0]
    });
    //this.dataSource = new MatTableDataSource<IReportConfigItem>([]);
    this.PageLoad();
  }

  PageLoad() {
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    this.ApplicationName = this.LoginUserDetail[0]["org"];
    this.Applications = this.tokenStorage.getPermittedApplications();
    this.loading = true;
    this.GetBaseReportId();
  }
  updateActive(row, value) {
    debugger;
    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }

  addnew() {
    debugger;
    var appId = this.searchForm.get("searchApplicationId").value;
    if (appId == 0) {
      this.contentservice.openSnackBar("Please select application", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }

    var newdata = {
      ReportConfigItemId: 0,
      ReportName: '',
      ParentId: 0,
      Formula: '',
      ColumnSequence: 0,
      ApplicationId: appId,
      TableNames: '',
      OrgId: 0,SubOrgId: 0,
      UserId: '',
      Active: 0,
      Action: false
    }
    //console.log('DisplayColumns', this.DisplayColumns)
    //console.log('this.ReportConfigItemList', this.ReportConfigItemList)
    this.ReportConfigItemList.push(newdata);
    this.dataSource = new MatTableDataSource(this.ReportConfigItemList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }
  SaveAll() {
    var edited = this.ReportConfigItemList.filter(f => f.Action);
    this.ToUpdateCount = edited.length;
    edited.forEach(e => {
      this.ToUpdateCount--;
      this.UpdateOrSave(e);
    })
  }
  Save(row) {
    this.ToUpdateCount = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    //debugger;


    var ReportNameId = this.searchForm.get("searchReportName").value

    if (this.ApplicationName.toLowerCase() != "ttp" && ReportNameId == 0) {
      this.contentservice.openSnackBar("Please select report name", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }

    if (ReportNameId == undefined || ReportNameId == 0)
      this.ParentId = this.BaseReportId;
    else
      this.ParentId = ReportNameId;

    let checkFilterString = "ReportName eq '" + row.ReportName + "'" +
      " and ApplicationId eq " + row.ApplicationId +
      " and OrgId eq 0 and ParentId eq " + this.ParentId;

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
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {


          this.ReportConfigItemData.ReportConfigItemId = row.ReportConfigItemId;
          this.ReportConfigItemData.ApplicationId = row.ApplicationId;
          this.ReportConfigItemData.DisplayName = row.DisplayName;
          this.ReportConfigItemData.ColumnSequence = row.ColumnSequence;
          this.ReportConfigItemData.Formula = row.Formula;
          this.ReportConfigItemData.OrgId = 0;
          this.ReportConfigItemData.ParentId = this.ParentId;
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
          this.loading = false; this.PageLoading=false;
          if (this.ToUpdateCount == 0) {
            this.ToUpdateCount = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ReportConfigItemListName, this.ReportConfigItemData, this.ReportConfigItemData.ReportConfigItemId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading=false;
          row.Action = false;
          if (this.ToUpdateCount == 0) {
            this.ToUpdateCount = -1;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          }
        });
  }
  ReSequence(editedrow) {
    debugger;
    var diff = 0;
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
      editedrow.Action = true;
      editedrow.OldSequence = editedrow.ColumnSequence;
      this.ReportConfigItemList.sort((a, b) => a.ColumnSequence - b.ColumnSequence);
      this.dataSource = new MatTableDataSource<IReportConfigItem>(this.ReportConfigItemList);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.onBlur(editedrow);
    }
  }

  GetReportConfigItem() {
    debugger;
    this.ReportConfigItemList = [];
    var orgIdSearchstr = ' and OrgId eq 0';
    var filterstr = 'Active eq 1 ';
    var searchApplicationId = this.searchForm.get("searchApplicationId").value;
    if (searchApplicationId == 0) {
      this.contentservice.openSnackBar("Please select application", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    filterstr = "ApplicationId eq " + searchApplicationId;
    if (this.searchForm.get("searchReportName").value > 0)
      filterstr += " and ParentId eq " + this.searchForm.get("searchReportName").value;
    else
      filterstr += " and ParentId eq " + this.BaseReportId;

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
    list.filter = [filterstr + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ReportConfigItemList = [];
        this.ReportConfigItemList = data.value.map(d => {
          d.Action = false;
          d.OldSequence = d.ReportConfigItemId;
          return d;
        })
        this.ReportConfigItemList = this.ReportConfigItemList.sort((a,b)=>a.ColumnSequence - b.ColumnSequence);
        this.dataSource = new MatTableDataSource<IReportConfigItem>(this.ReportConfigItemList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading=false;
      })
  }

  onBlur(element) {
    element.Action = true;
  }
  GetBaseReportId() {

    let list: List = new List();
    list.fields = [
      "ReportConfigItemId"
    ]
    list.PageName = this.ReportConfigItemListName;
    list.filter = ["Active eq 1 and ReportName eq 'Reports'"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.BaseReportId = data.value[0].ReportConfigItemId;
          this.GetReportNames();
        }
        else {
          this.contentservice.openSnackBar("Base report Id not found!", globalconstants.ActionText,globalconstants.RedBackground);
        }
        this.loading = false; this.PageLoading=false;
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
    list.filter = ["Active eq 1 and ParentId eq " + this.BaseReportId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ReportNames = [...data.value];
        this.loading = false; this.PageLoading=false;
      });
  }
  GetAppReportNames() {
    debugger;
    this.ReportConfigItemList = [];
    this.AppReportNames = this.ReportNames.filter(a => a.ApplicationId == this.searchForm.get("searchApplicationId").value
      && a.ParentId == this.BaseReportId);
    this.dataSource = new MatTableDataSource(this.ReportConfigItemList);
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





