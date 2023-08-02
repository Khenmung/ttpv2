import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-classdetail',
  templateUrl: './classdetail.component.html',
  styleUrls: ['./classdetail.component.scss']
})
export class ClassdetailComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ClassMasterListName = 'ClassMasters';
  Applications = [];
  loading = false;
  SelectedApplicationId = 0;
  SelectedBatchId = 0;SubOrgId = 0;
  ClassMasterList: IClassMaster[] = [];
  filteredOptions: Observable<IClassMaster[]>;
  dataSource: MatTableDataSource<IClassMaster>;
  allMasterData = [];
  ClassMasters = [];
  ClassCategory=[];
  Durations = [];
  StudyArea = [];
  StudyMode = [];
  Permission = 'deny';
  ExamId = 0;
  ClassMasterData = {
    ClassId: 0,
    ClassName: '',
    DurationId: 0,
    MinStudent: 0,
    MaxStudent: 0,
    StartDate: Date,
    EndDate: Date,
    CategoryId:0,
    StudyAreaId: 0,
    StudyModeId: 0,
    Confidential: false,
    Sequence: 0,
    BatchId: 0,
    OrgId: 0,SubOrgId: 0,
    Active: 0
  };
  PreviousBatchId = 0;
  StandardFilterWithPreviousBatchId = '';
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  displayedColumns = [
    "ClassId",
    "ClassName",
    "Sequence",
    "DurationId",
    "MinStudent",
    "MaxStudent",
    "StartDate",
    "EndDate",
    "CategoryId",
   //"StudyAreaId",
   // "StudyModeId",
    "Confidential",
    "Active",
    "Action"
  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
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
      searchClassName: [0]
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSDETAIL)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.StandardFilterWithPreviousBatchId = globalconstants.getOrgSubOrgFilterWithPreviousBatchId(this.tokenStorage);
        if (this.ClassMasters.length == 0) {
          var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
            this.ClassMasters = [...data.value];
          })
        }
        this.GetMasterData();
      }
    }
  }

  AddNew() {

    var newdata = {
      ClassId: 0,
      ClassName: '',
      Sequence: 0,
      DurationId: 0,
      MinStudent: 0,
      MaxStudent: 0,
      CategoryId:0,
      StartDate: new Date(),
      EndDate: new Date(),
      StudyAreaId: 0,
      StudyModeId: 0,
      Confidential: false,
      BatchId: 0,
      Active: 0,
      Action: true
    };
    this.ClassMasterList = [];
    this.ClassMasterList.push(newdata);
    this.dataSource = new MatTableDataSource<IClassMaster>(this.ClassMasterList);
  }
  ClearData(){
    this.ClassMasterList =[];
    this.dataSource = new MatTableDataSource<IClassMaster>(this.ClassMasterList);
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
  }
  updateConfidential(row, value) {
    row.Action = true;
    row.Confidential = value.checked;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    //debugger;

    if (row.Sequence > 250) {
      this.contentservice.openSnackBar("Sequence can not be greater than 250", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading = false;
      return;
    }
    // if(row.MinStudent<1)
    // {
    //   this.contentservice.openSnackBar("Minimum can not be less than 1",this.optionsNoAutoClose);
    //   this.loading=false;this.PageLoading=false;
    //   return;
    // }
    if (row.MaxStudent > 1000) {
      this.contentservice.openSnackBar("Maximum can not be greater than 1000", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading = false;
      return;
    }
    if (row.CategoryId ==0) {
      this.contentservice.openSnackBar("Please select category", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading = false;
      return;
    }
    this.loading = true;
    let checkFilterString = this.FilterOrgSubOrg + " and ClassName eq '" + row.ClassName + "'"

    if (row.ClassId > 0)
      checkFilterString += " and ClassId ne " + row.ClassId;
    let list: List = new List();
    list.fields = ["ClassId"];
    list.PageName = this.ClassMasterListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.ClassMasterData.ClassId = row.ClassId;
          this.ClassMasterData.ClassName = row.ClassName;
          this.ClassMasterData.Sequence = row.Sequence;
          this.ClassMasterData.DurationId = row.DurationId;
          this.ClassMasterData.StartDate = row.StartDate;
          this.ClassMasterData.EndDate = row.EndDate;
          this.ClassMasterData.MaxStudent = row.MaxStudent;
          this.ClassMasterData.MinStudent = row.MinStudent;
          this.ClassMasterData.CategoryId = row.CategoryId;
          this.ClassMasterData.StudyAreaId = row.StudyAreaId;
          this.ClassMasterData.StudyModeId = row.StudyModeId;
          this.ClassMasterData.Confidential = row.Confidential?row.Confidential:false;
          this.ClassMasterData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ClassMasterData.SubOrgId = this.SubOrgId;
          this.ClassMasterData.BatchId = this.SelectedBatchId;

          this.ClassMasterData.Active = row.Active;
          ////console.log('exam slot', this.ClassMasterData)

          if (this.ClassMasterData.ClassId == 0) {
            this.ClassMasterData["CreatedDate"] = new Date();
            this.ClassMasterData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ClassMasterData["UpdatedDate"] = new Date();
            delete this.ClassMasterData["UpdatedBy"];
            console.log('ClassMasterData', this.ClassMasterData)
            this.insert(row);
          }
          else {
            delete this.ClassMasterData["CreatedDate"];
            delete this.ClassMasterData["CreatedBy"];
            this.ClassMasterData["UpdatedDate"] = new Date();
            this.ClassMasterData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            console.log('ClassMasterData update', this.ClassMasterData)
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.ClassMasterListName, this.ClassMasterData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ClassId = data.ClassId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ClassMasterListName, this.ClassMasterData, this.ClassMasterData.ClassId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetClassMasters() {
    debugger;

    this.loading = true;
    let filterStr = '';
    filterStr =this.FilterOrgSubOrg;

    var _searchClassName = this.searchForm.get("searchClassName").value;
    if (_searchClassName > 0) {
      filterStr += ' and ClassId eq ' + _searchClassName;
    }
    let list: List = new List();
    list.fields = [
      "ClassId",
      "ClassName",
      "Sequence",
      "DurationId",
      "MinStudent",
      "MaxStudent",
      "StartDate",
      "EndDate",
      "CategoryId",
      "StudyAreaId",
      "StudyModeId",
      "Confidential",
      "Sequence",
      "BatchId",
      "Active"
    ];

    list.PageName = this.ClassMasterListName;
    list.filter = [filterStr];
    this.ClassMasterList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.ClassMasterList = data.value.map(f => {
            if (!f.Active)
              f.Sequence = 100
            return f;
          });
        }
        this.ClassMasterList.sort((a, b) => a.Sequence - b.Sequence);

        this.dataSource = new MatTableDataSource<IClassMaster>(this.ClassMasterList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.Durations = this.getDropDownData(globalconstants.MasterDefinitions.school.DURATION);
    this.StudyArea = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDYAREA);
    this.StudyMode = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDYMODE);
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
export interface IClassMaster {
  ClassId: number;
  ClassName: string;
  DurationId: number;
  MinStudent: number;
  MaxStudent: number;
  StartDate: Date;
  EndDate: Date;
  CategoryId:number,
  StudyAreaId: number;
  StudyModeId: number;
  Sequence: number;
  Confidential: boolean;
  BatchId: number;
  Active: number;
  Action: boolean;
}
export interface IApplication {
  ApplicationId: number;
  ApplicationName: string;
}




