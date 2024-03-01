import { Component, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { column } from 'mathjs';
import { TableUtil } from '../../../shared/TableUtil';
import moment from 'moment';

@Component({
  selector: 'app-downloadsyncdata',
  templateUrl: './downloadsyncdata.component.html',
  styleUrls: ['./downloadsyncdata.component.scss']
})
export class DownloadsyncdataComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  PageLoading = true;
  ResultReleased = 0;
  LoginUserDetail: any[] = [];

  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  rowCount = 0;
  SyncDataList: IDataSync[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
  SelectedApplicationId = 0;
  StoredForUpdate: any[] = [];
  Classes: any[] = [];
  ClassGroups: any[] = [];
  Subjects: any[] = [];
  Sections: any[] = [];
  ExamNames: any[] = [];
  Exams: any[] = [];
  Batches: any[] = [];
  StudentSubjects: any[] = [];
  //SelectedClassSubjects :any[]= [];
  Students: any[] = [];
  dataSource: MatTableDataSource<IDataSync>;
  allMasterData: any[] = [];
  Permission = 'deny';
  ExamId = 0;
  ExamMarkConfigData = {
    ExamMarkConfigId: 0,
    ExamId: 0,
    ClassId: 0,
    SectionId: 0,
    SemesterId: 0,
    ClassSubjectId: 0,
    Formula: '',
    Active: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0
  }
  displayedColumns = [
    //"DataSyncId",
    "TableName",
    "CreatedDate",
    "DataMode",
    "Synced",
    "Action"
  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private contentservice: ContentService,
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
    // debugger;

    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.DOWNLOADSYNCDATA)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        // this.GetMasterData();
        this.GetSyncData();
      }
    }
  }

  SelectedClassCategory = '';
  Defaultvalue = 0;

  clearData() {
    this.SyncDataList = [];
    this.dataSource = new MatTableDataSource(this.SyncDataList);
  }

  GetSyncData() {

    this.loading = true;
    let filterStr = '';
    let list: List = new List();
    list.fields = [
      "DataSyncId",
      "TableName",
      "Text",
      "DataMode",
      "Active",
      "Synced",
      "SyncId",
      "CreatedDate"
    ];

    list.PageName = "DataSyncs";
    list.filter = [this.FilterOrgSubOrgBatchId];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SyncDataList = [...data.value];

        if (this.SyncDataList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        //this.SyncDataList = this.SyncDataList.sort((a: any, b: any) => b.Active - a.Active);
        this.dataSource = new MatTableDataSource(this.SyncDataList);
        this.dataSource.paginator = this.paginator;
        console.log("this.SyncDataList", this.SyncDataList);
        this.loading = false;
        this.PageLoading = false;
      })
  }

  updateActive(row, value) {
    //if(!row.Action)
    row.Action = true;
    row.Active = value.checked;
  }
  DownloadedSyncData: any = [];
  Download() {
    this.DownloadedSyncData = [];
    let dataLength = this.SyncDataList.length;
    this.SyncDataList.forEach((item, indx) => {
      let list: List = new List();
      list.fields = ["*"];
      list.PageName = item.TableName;
      list.filter = [this.FilterOrgSubOrg + " and SyncId  eq " + item.SyncId];
      this.dataservice.get(list)
        .subscribe((data: any) => {
          let row = data.value[0];
          let datastring = '{';
          Object.keys(row).forEach(column => {
            if (isNaN(row[column]))
              datastring += "'" + column + "': '" + row[column] + "',"
            else
              datastring += "'" + column + "':" + row[column] + ','
          })
          datastring = datastring.substring(0, datastring.length - 1);
          datastring += "}";
          this.DownloadedSyncData.push({ "TableName": item.TableName, "SyncId": item.SyncId, "DataMode": item.DataMode, "data": datastring })
          if (indx == dataLength - 1)
            this.exportArray();
        })
    })

  }
  exportArray() {
    const datatoExport: Partial<any>[] = this.DownloadedSyncData;
    TableUtil.exportArrayToExcel(datatoExport, "datatosync" + moment().format("YYYYMMDD"));
  }
  UpdateOrSave(row) {

    debugger;
    // if (row.Formula.length == 0) {
    //   this.loading = false; this.PageLoading = false;
    //   this.contentservice.openSnackBar("Please enter formula", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }

    this.loading = true;
    var _examId = this.searchForm.get("searchExamId")?.value;
    var _classId = this.searchForm.get("searchClassId")?.value;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let checkFilterString = this.FilterOrgSubOrgBatchId + " and ExamId eq " + _examId +
      " and ClassSubjectId eq " + row.ClassSubjectId +
      " and ClassId eq " + _classId;



    if (row.ExamMarkConfigId > 0)
      checkFilterString += " and ExamMarkConfigId ne " + row.ExamMarkConfigId;

    let list: List = new List();
    list.fields = ["ExamMarkConfigId"];
    list.PageName = "DataSyncs";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          // let _examstatus = 0;
          // if (row.Marks >= row.PassMark)
          //   _examstatus = this.ExamStatuses.filter((f:any) => f.MasterDataName.toLowerCase() == "pass")[0].MasterDataId;
          // else
          //   _examstatus = this.ExamStatuses.filter((f:any) => f.MasterDataName.toLowerCase() == "fail")[0].MasterDataId;

          this.ExamMarkConfigData.ExamMarkConfigId = row.ExamMarkConfigId;
          this.ExamMarkConfigData.ExamId = _examId;
          this.ExamMarkConfigData.Active = row.Active;
          this.ExamMarkConfigData.ClassSubjectId = row.ClassSubjectId ? row.ClassSubjectId : 0;
          this.ExamMarkConfigData.Formula = row.Formula;
          this.ExamMarkConfigData.ClassId = _classId ? _classId : 0;
          this.ExamMarkConfigData.SectionId = row.SectionId ? row.SectionId : 0;
          this.ExamMarkConfigData.SemesterId = row.SemesterId ? row.SemesterId : 0;
          this.ExamMarkConfigData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ExamMarkConfigData.SubOrgId = this.SubOrgId;
          this.ExamMarkConfigData.BatchId = this.SelectedBatchId;
          ////console.log("this.ExamMarkConfigData", this.ExamMarkConfigData)
          if (this.ExamMarkConfigData.ExamMarkConfigId == 0) {
            this.ExamMarkConfigData["CreatedDate"] = new Date();
            this.ExamMarkConfigData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ExamMarkConfigData["UpdatedDate"] = new Date();
            delete this.ExamMarkConfigData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ExamMarkConfigData["CreatedDate"];
            delete this.ExamMarkConfigData["CreatedBy"];
            this.ExamMarkConfigData["UpdatedDate"] = new Date();
            this.ExamMarkConfigData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('ExamMarkConfigs', this.ExamMarkConfigData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ExamMarkConfigId = data.ExamMarkConfigId;
          row.Action = false;
          if (this.rowToUpdate == 0) {
            this.loading = false;
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch('ExamMarkConfigs', this.ExamMarkConfigData, this.ExamMarkConfigData.ExamMarkConfigId, 'patch')
      .subscribe(
        (data: any) => {
          //this.loading = false; this.PageLoading=false;
          row.Action = false;
          if (this.rowToUpdate == 0) {
            this.loading = false;
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }

  StudentGrades: any[] = [];
  SelectedClassStudentGrades: any[] = [];
  GetStudentGradeDefn() {
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetStudentGrade(filterOrgSubOrg)
      .subscribe((data: any) => {
        this.StudentGrades = [...data.value];
      })
    this.PageLoading = false;
  }
  GetSpecificStudentGrades() {
    debugger;
    var _examId = this.searchForm.get("searchExamId")?.value;
    var _classGroupId = 0;

    if (_examId > 0) {
      var obj = this.Exams.filter((f: any) => f.ExamId == _examId)
      if (obj.length > 0) {
        _classGroupId = obj[0].ClassGroupId;
        this.SelectedClassStudentGrades = this.StudentGrades.filter((f: any) => f.ClassGroupId == _classGroupId);
      }
      else {
        this.contentservice.openSnackBar("Class group not found for selected class.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }
  }

  checkall(value) {
    this.SyncDataList.forEach(record => {
      record.Active = value.checked;
      record.Action = !record.Action;
    })
  }
  rowToUpdate = 0;
  saveall() {

    var toupdate = this.SyncDataList.filter(record => record.Action)
    this.rowToUpdate = toupdate.length;
    toupdate.forEach(record => {
      this.rowToUpdate--;
      this.UpdateOrSave(record);
    })
  }
  onBlur(element) {
    element.Action = true;
  }

  SubjectCategory: any[] = [];
  // GetMasterData() {

  //   this.allMasterData = this.tokenStorage.getMasterData()!;
  //   this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
  //   this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
  //   this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
  //   this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
  //   this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);

  //   // this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
  //   //   .subscribe((data: any) => {
  //   //     this.ClassGroups = [...data.value];
  //   //   });
  //   var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
  //   // this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
  //   //   if(data.value) this.Classes = [...data.value]; else this.Classes = [...data];
  //   //   this.GetClassSubject();
  //   // })
  //   this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
  //     this.Classes = [];
  //     data.value.forEach(m => {
  //       let obj = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId);
  //       if (obj.length > 0) {
  //         m.Category = obj[0].MasterDataName.toLowerCase();
  //         this.Classes.push(m);
  //       }
  //     });
  //     this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
  //     this.GetClassGroups();
  //     this.GetClassSubject();
  //   });
  //   //if role is teacher, only their respective class and subject will be allowed.
  //   if (this.LoginUserDetail[0]['RoleUsers'][0].role == 'Teacher') {
  //     this.GetAllowedSubjects();
  //   }

  //   this.GetExams();

  // }
  // GetAllowedSubjects() {

  //   let list: List = new List();
  //   list.fields = [
  //     'ClassSubjectId',
  //     'SubjectId',
  //     'ClassId',
  //     'SectionId',
  //     'SemesterId',
  //     'TeacherId',
  //     'Active',
  //   ];

  //   list.PageName = "ClassSubjects"
  //   list.filter = ['Active eq 1 and TeacherId eq ' + localStorage.getItem('nameId') +
  //     ' and BatchId eq ' + this.SelectedBatchId + ' and OrgId eq ' + this.LoginUserDetail[0]['orgId']];
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.AllowedSubjectIds = [...data.value];
  //       var _AllClassId = [...this.Classes];

  //       if (this.AllowedSubjectIds.length > 0) {
  //         this.Classes = _AllClassId.map(m => {
  //           var result = this.AllowedSubjectIds.filter(x => x.ClassId == m.ClassId);
  //           if (result.length > 0)
  //             return m;
  //         })
  //       }
  //     });
  // }
  // GetExams() {

  //   // var orgIdSearchstr = this.FilterOrgSubOrgBatchId 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] +
  //   //   ' and BatchId eq ' + this.SelectedBatchId;

  //   let list: List = new List();

  //   list.fields = ["ExamId", "ExamNameId", "ReleaseResult", "ClassGroupId", "MarkFormula"];
  //   list.PageName = "Exams";
  //   list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];

  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.Exams = [];
  //       data.value.forEach(e => {
  //         var _examName = '';
  //         var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
  //         if (obj.length > 0) {

  //           _examName = obj[0].MasterDataName;

  //           this.Exams.push({
  //             ExamId: e.ExamId,
  //             ExamName: _examName,
  //             ReleaseResult: e.ReleaseResult,
  //             ClassGroupId: e.ClassGroupId,
  //             MarkFormula: e.MarkFormula
  //           });
  //         }
  //       })
  //       this.PageLoading = false;
  //       ////console.log("exams", this.Exams);
  //       //this.GetStudentSubjects();
  //     })
  // }

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
export interface IDataSync {
  DataSyncId: number;
  TableName: string;
  Text: string;
  DataMode: string;
  Active: boolean;
  OrgId: boolean;
  SubOrgId: boolean;
  Synced: boolean;
  SyncId: string;
  Action: boolean;
}
