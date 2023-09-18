import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { AnyObject } from 'chart.js/dist/types/basic';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-exams',
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.scss']
})
export class ExamsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  PageLoading = true;
  AttendanceModes: any[] = [];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  Students: any[] = [];
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  Exams: IExams[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
  ClassGroups: any[] = [];
  SelectedApplicationId = 0;
  StudentGradeFormula: any[] = [];
  ClassSubjectComponents: any[] = [];
  ExamNames: any[] = [];
  Batches: any[] = [];
  ExamModes: any[] = [];
  ExamStudentSubjectResult: any[] = [];
  dataSource: MatTableDataSource<IExams>;
  allMasterData: any[] = [];
  Permission = 'deny';
  ExamId = 0;
  ExamsData: {
    ExamId: number,
    ExamNameId: number,
    StartDate: any,
    EndDate: any,
    ClassGroupId: number,
    ReleaseResult: number,
    ReleaseDate: any,
    AttendanceStartDate: any,
    OrgId: number, SubOrgId: number,
    BatchId: number,
    Active: number
  } = {
      ExamId: 0,
      ExamNameId: 0,
      StartDate: null,
      EndDate: Date,
      ClassGroupId: 0,
      ReleaseResult: 0,
      ReleaseDate: null,
      AttendanceStartDate: null,
      OrgId: 0, SubOrgId: 0,
      BatchId: 0,
      Active: 1
    };
  displayedColumns = [
    'ExamId',
    'ExamName',
    'StartDate',
    'EndDate',
    'AttendanceStartDate',
    'ReleaseDate',
    'ReleaseResult',
    'Active',
    'Action'
  ];
  StudentSubjects: any[] = [];
  StudentGrades: any[] = [];
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private contentservice: ContentService,
    private datepipe: DatePipe
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
    this.PageLoad()
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var feature = globalconstants.AppAndMenuAndFeatures.edu.examination.exam;

      var perObj = globalconstants.getPermission(this.tokenStorage, feature);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission == 'deny')
        this.nav.navigate(['/auth/login']);
      else {

        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetMasterData();
        this.GetSubjectComponents();
        //this.GetStudentSubjects();
      }
    }
  }
  addnew() {

    let toadd: any = {
      ExamId: 0,
      ExamNameId: 0,
      ExamName: '',
      StartDate: new Date(),
      EndDate: new Date(),
      MarkFormula: '',
      Sequence: 0,
      ClassGroupId: 0,
      ReleaseResult: 0,
      ReleaseDate: null,
      AttendanceStartDate: new Date(),
      //AttendanceModeId: 0,
      BatchId: 0,
      OrgId: 0, SubOrgId: 0,
      Active: 0,
      Action: false

    };
    this.Exams.push(toadd);
    this.dataSource = new MatTableDataSource<IExams>(this.Exams);

  }
  updateRelease(row, value) {
    row.Action = true;
    row.ReleaseResult = value.checked ? 1 : 0;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
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
  UpdateOrSave(row) {

    debugger;
    this.loading = true;

    let checkFilterString = this.FilterOrgSubOrgBatchId + " and ExamNameId eq " + row.ExamNameId;

    if (row.ExamId > 0)
      checkFilterString += " and ExamId ne " + row.ExamId;

    let list: List = new List();
    list.fields = ["ExamId"];
    list.PageName = "Exams";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.ExamsData.ExamId = row.ExamId;
          this.ExamsData.Active = row.Active;
          this.ExamsData.ExamNameId = row.ExamNameId;
          this.ExamsData.StartDate = row.StartDate;
          this.ExamsData.EndDate = row.EndDate;
          this.ExamsData.ClassGroupId = 0//row.ClassGroupId;
          //this.ExamsData.MarkFormula = row.MarkFormula;
          this.ExamsData.AttendanceStartDate = row.AttendanceStartDate;
          this.ExamsData.ReleaseResult = row.ReleaseResult;
          this.ExamsData.BatchId = this.SelectedBatchId;
          if (row.ReleaseResult == 1) {
            row.ReleaseDate = this.datepipe.transform(new Date(), 'dd/MM/yyyy');
            this.ExamsData.ReleaseDate = new Date()  //new Date();
          }
          // else
          //   this.ExamsData.ReleaseDate = ;

          this.ExamsData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ExamsData.SubOrgId = this.SubOrgId;
          if (this.ExamsData.ExamId == 0) {
            this.ExamsData["CreatedDate"] = new Date();
            this.ExamsData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.ExamsData["UpdatedDate"];
            delete this.ExamsData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ExamsData["CreatedDate"];
            delete this.ExamsData["CreatedBy"];
            this.ExamsData["UpdatedDate"] = new Date();
            this.ExamsData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });

  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('Exams', this.ExamsData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.ExamId = data.ExamId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch('Exams', this.ExamsData, this.ExamsData.ExamId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          //this.GetExamStudentSubjectResults(this.ExamsData.ExamId, row);
        });
  }
  GetExams() {
    debugger;
    //var orgIdSearchstr = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);

    let list: List = new List();

    list.fields = [
      "ExamId", "ExamNameId", "StartDate",
      "EndDate", "ClassGroupId", "AttendanceStartDate",
      "ReleaseResult", "ReleaseDate", "OrgId", "BatchId", "Active"];
    list.PageName = "Exams";
    list.filter = [this.FilterOrgSubOrgBatchId];
    //list.orderBy = "Active desc";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.Exams = [...data.value];
        this.Exams = this.ExamNames.map(e => {
          let existing = data.value.filter(db => db.ExamNameId == e.MasterDataId);
          if (existing.length > 0) {
            if (existing[0].ReleaseDate != null)
              existing[0].ReleaseDate = moment(existing[0].ReleaseDate).format("DD/MM/yyyy");
            existing[0].ExamName = this.ExamNames.filter((f: any) => f.MasterDataId == existing[0].ExamNameId)[0].MasterDataName;
            existing[0].Sequence = e.Sequence;
            existing[0].Action = false;
            return existing[0];
          }
          else {
            return {
              ExamId: 0,
              ExamNameId: e.MasterDataId,
              ExamName: e.MasterDataName,
              AttendanceStartDate: new Date(),
              Sequence: e.Sequence,
              //MarkFormula:'',
              StartDate: new Date(),
              EndDate: new Date(),
              ReleaseResult: 0,
              ReleaseDate: null,
              OrgId: 0, SubOrgId: 0,
              ClassGroupId: 0,
              Active: 0,
              Action: false
            }
          }
        })
        ////console.log('this', this.Exams)
        this.Exams = this.Exams.sort((a, b) => {
          return b.Active - a.Active || a.Sequence - b.Sequence;
        })
        this.dataSource = new MatTableDataSource<IExams>(this.Exams);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      },
        error => console.log("error in exams fetching", error))

  }
  private getTime(date?: Date) {
    var std = new Date(date!);
    return std != null ? std.getTime() : 0;
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.StudentGradeFormula = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
    this.StudentGrades = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
    this.AttendanceModes = this.getDropDownData(globalconstants.MasterDefinitions.school.ATTENDANCEMODE);
    this.GetClassGroup();
    this.GetExams();

  }
  GetClassGroup() {
    this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      })
  }
  GetSubjectComponents() {

    this.loading = true;
    let list: List = new List();

    list.fields = ["ClassSubjectMarkComponentId", "SubjectComponentId", "ClassSubjectId", "FullMark", "PassMark"];
    list.PageName = "ClassSubjectMarkComponents";
    list.lookupFields = ["ClassSubject($filter=Active eq 1;$select=ClassId)"];
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.ClassSubjectComponents = data.value.map(e => {
          e.ClassId = e.ClassSubject.ClassId;
          return e;
        })
        this.loading = false; this.PageLoading = false;
      })
  }

  GetStudentSubjects() {

    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    filterStr += ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();
    list.fields = [
      'StudentClassSubjectId',
      'ClassSubjectId',
      'StudentClassId',
      'Active'
    ];

    list.PageName = "StudentClassSubjects";
    list.lookupFields = ["ClassSubject($select=SubjectId,ClassId)",
      "StudentClass($select=StudentId,RollNo,SectionId)"]
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        this.StudentSubjects = data.value.map(s => {

          return {
            StudentClassSubjectId: s.StudentClassSubjectId,
            ClassSubjectId: s.ClassSubjectId,
            StudentClassId: s.StudentClassId,
            RollNo: s.StudentClass.RollNo,
            SubjectId: s.ClassSubject.SubjectId,
            ClassId: s.ClassSubject.ClassId,
            StudentId: s.StudentClass.StudentId,
            SectionId: s.StudentClass.SectionId
          }

        })
        this.loading = false; this.PageLoading = false;
      });
  }
  // GetStudents() {
  //   var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
  //   var filterstr = 'Active eq 1';

  //   let list: List = new List();
  //   list.fields = [
  //     "StudentClassId",
  //     "ClassId",
  //     "StudentId"
  //   ];
  //   list.PageName = "StudentClasses";
  //   list.lookupFields = ["Student($select=FirstName,LastName)"];
  //   list.filter = [filterstr + orgIdSearchstr];

  //   return this.dataservice.get(list);

  // }
  onBlur(element) {
    element.Action = true;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);

  }

}
export interface IExams {
  ExamId: number;
  ExamNameId: number;
  ExamName: string;
  StartDate: Date;
  EndDate: Date;
  Sequence: number;
  AttendanceStartDate: Date;
  ClassGroupId: number;
  ReleaseResult: number;
  ReleaseDate: Date;
  OrgId: number; SubOrgId: number;
  BatchId: number;
  Active: number;
}
