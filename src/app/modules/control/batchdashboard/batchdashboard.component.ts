import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import {SwUpdate} from '@angular/service-worker';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-batchdashboard',
  templateUrl: './batchdashboard.component.html',
  styleUrls: ['./batchdashboard.component.scss']
})
export class BatchdashboardComponent implements OnInit { PageLoading=true;

  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  Permission = '';
  //StandardFilter = '';
  loading = false;
  SelectedBatchId = 0;SubOrgId = 0;
  FilterOrgSubOrg='';
  FilterOrgSubOrgBatchId='';

  Batches = [];
  BatchList: IBatches[] = [];
  dataSource: MatTableDataSource<IBatches>;
  allMasterData = [];
  BatchData = {
    BatchId: 0,
    BatchName: '',
    StartDate: Date,
    EndDate: Date,
    CurrentBatch:0,
    OrgId: 0,
    //SubOrgId: 0,
    Active: 1
  };
  displayedColumns = [
    'BatchId',
    'BatchName',
    'StartDate',
    'EndDate',
    'CurrentBatch',
    'Active',
    'Action'
  ];

  constructor(private servicework: SwUpdate,
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
    this.PageLoad();
  }
  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.BATCHDASHBOARD)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SubOrgId = this.tokenStorage.getSubOrgId();
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);

        this.GetBatches();
      }
    }
  }

  onBlur(row) {
    row.Action = true;
  }
  GetBatches() {
    let filterStr = "OrgId eq " + this.LoginUserDetail[0]["orgId"];

    if (filterStr.length == 0) {
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }

    let list: List = new List();
    list.fields = [
      'BatchId',
      'BatchName',
      'StartDate',
      'EndDate',
      'CurrentBatch',
      'OrgId',
      'Active'
    ];

    list.PageName = "Batches";
    list.filter = [filterStr];
    this.BatchList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.BatchList = [...data.value.sort((a, b) => new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime())];
        this.dataSource = new MatTableDataSource<IBatches>(this.BatchList);
        this.loading = false; this.PageLoading=false;
      });
  }
  updateCurrentBatch(row, value) {
    row.CurrentBatch = value.checked ? 1 : 0;
    row.Action = true;
  }
  addnew() {
    var newdata = {
      BatchId: 0,
      BatchName: 'new batch name',
      StartDate: new Date(),
      EndDate: new Date(),
      CurrentBatch:0,
      OrgId: +this.LoginUserDetail[0]["orgId"],
      SubOrgId:this.SubOrgId,
      Active: 1
    }
    this.BatchList.push(newdata);
    this.dataSource = new MatTableDataSource<IBatches>(this.BatchList);
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;

  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.contentservice.openSnackBar(globalconstants.DeletedMessage,globalconstants.ActionText,globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    //debugger;
    // if (row.CurrentBatch == 1 && row.Active == 0) {
    //   this.contentservice.openSnackBar("Current batch should be active!", globalconstants.ActionText,globalconstants.RedBackground);
    //   return;
    // }
    // if (row.CurrentBatch == 1) {
    //   var existingActive = this.BatchList.filter(b => b.CurrentBatch == 1 && b.BatchId != row.BatchId);
    //   if (existingActive.length > 0) {
    //     this.contentservice.openSnackBar("There is already another current batch!", globalconstants.ActionText,globalconstants.RedBackground);
    //     return;
    //   }
    // }
    this.loading = true;
    let checkFilterString = "OrgId eq " + this.LoginUserDetail[0]["orgId"] + " and BatchName eq '" + row.BatchName + "'";

    if (row.BatchId > 0)
      checkFilterString += " and BatchId ne " + row.BatchId;

    let list: List = new List();
    list.fields = ["BatchId"];
    list.PageName = "Batches";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
          row.Ative = 0;
          this.loading = false; this.PageLoading=false;
          return;
        }
        else {

          this.BatchData.Active = row.Active;
          this.BatchData.BatchId = row.BatchId;
          this.BatchData.BatchName = row.BatchName;
          this.BatchData.StartDate = row.StartDate;
          this.BatchData.EndDate = row.EndDate;
          this.BatchData.CurrentBatch = row.CurrentBatch;
          this.BatchData.OrgId = this.LoginUserDetail[0]["orgId"];
          //this.BatchData.SubOrgId = this.SubOrgId;
          if (this.BatchData.BatchId == 0) {
            this.BatchData["CreatedDate"] = new Date();
            this.BatchData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.BatchData["UpdatedDate"];
            delete this.BatchData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.BatchData["CreatedDate"];
            delete this.BatchData["CreatedBy"];
            this.BatchData["UpdatedDate"] = new Date();
            this.BatchData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('Batches', this.BatchData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading=false;
          row.BatchId = data.BatchId;
          this.GetBatches();
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch('Batches', this.BatchData, this.BatchData.BatchId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading=false;
          row.Action = false;
          this.GetBatches();
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

}
export interface IBatches {
  BatchId: number;
  BatchName: string;
  StartDate: Date;
  EndDate: Date;
  CurrentBatch:number;
  OrgId: number;
  SubOrgId: number;
  Active;
}


