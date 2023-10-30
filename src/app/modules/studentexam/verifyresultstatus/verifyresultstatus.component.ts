import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
@Component({
  selector: 'app-verifyresultstatus',
  templateUrl: './verifyresultstatus.component.html',
  styleUrls: ['./verifyresultstatus.component.scss']
})
export class VerifyresultstatusComponent implements OnInit {
  PageLoading = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ClickedVerified = false;
  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  SelectedClassStudentGrades :any[]= [];
  SelectedApplicationId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  rowCount = 0;
  ExamStudentResult: IExamStudentResult[]= [];
  ClassFullMark = 0;
  ClassSubjectComponents :any[]= [];
  SelectedBatchId = 0; SubOrgId = 0;
  Students :any[]= [];
  Classes :any[]= [];
  ExamNames :any[]= [];
  Exams :any[]= [];
  Batches :any[]= [];
  dataSource: MatTableDataSource<IExamStudentResult>;
  allMasterData :any[]= [];
  Permission = 'deny';
  ExamId = 0;
  displayedColumns = [
    "ExamName",
    "ClassName",
    "Active"
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
      searchExamId: [0],
    });
    this.PageLoad();
  }

  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.VERIFYRESULTSTATUS);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
          if(data.value) this.Classes = [...data.value]; else this.Classes = [...data];
          this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
        });

        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.GetMasterData();
        this.GetClassGroupMapping();
      }
      else {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
    }
  }
  ExamClassGroups :any[]= [];
  GetExamStudentResults() {

    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.ExamStudentResult = [];
    var filterstr = ' and Active eq 1 ';
    var _examId = this.searchForm.get("searchExamId")?.value;
    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _examClassGroupId = []
    var _examClassGroupId = this.Exams.filter((f:any) => f.ExamId == _examId);
    // if (obj.length > 0) {
    //   _examClassGroupId = obj[0].ClassGroupId;
    // }
    this.loading = true;
    filterstr = ' and ExamId eq ' + this.searchForm.get("searchExamId")?.value;

    let list: List = new List();
    list.fields = [
      "ExamResultSubjectMarkId",
      "ExamId",
      "StudentClassId",
      "Active"
    ];
    list.PageName = "ExamResultSubjectMarks";
    //list.lookupFields = ["StudentClass($select=ClassId)"];
    list.filter = [this.FilterOrgSubOrgBatchId + filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        var _examId = this.searchForm.get("searchExamId")?.value
        //var _classGroupId = 0;
        var filteredClassGroupMapping :any[]= [];
        this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg, _examId)
          .subscribe((data: any) => {
            this.ExamClassGroups = [...data.value];
            var objExamClassGroups = this.ExamClassGroups.filter(g => g.ExamId == _examId);
            filteredClassGroupMapping = this.ClassGroupMapping.filter((f:any) => objExamClassGroups.findIndex(fi => fi.ClassGroupId == f.ClassGroupId) > -1);

            //var filteredClassGroupMapping = this.ClassGroupMapping.filter((s:any) => _examClassGroupId.findIndex(i=>i.ClassGroupMappingId == s.ClassGroupMappingId)>-1);
            data.value.forEach(d => {
              var _className = '';
              var _classgroupObj = filteredClassGroupMapping.filter((s:any) => s.ClassId == d.StudentClass["ClassId"]);
              if (_classgroupObj.length > 0) {
                _className = _classgroupObj[0].ClassName;
                d["ClassName"] = _className;
                d["ClassId"] = d.StudentClass["ClassId"];
                d["ExamName"] = this.Exams.filter((f:any) => f.ExamId == d.ExamId)[0].ExamName;
                this.ExamStudentResult.push(d);
              }
            })
            var _distinctExamClass = alasql("select distinct ExamId,ExamName,ClassId,ClassName,Active from ? where Active =true", [this.ExamStudentResult])
            var statusdetail :any[]= [];
            filteredClassGroupMapping.forEach(cls => {
              var verified = _distinctExamClass.filter((f:any) => f.ClassId == cls.ClassId)
              if (verified.length > 0) {
                statusdetail.push(
                  {
                    ExamName: verified[0].ExamName,
                    ClassName: verified[0].ClassName,
                    Active: 1
                  }
                )
              }
              else {
                var _examId = this.searchForm.get("searchExamId")?.value;
                statusdetail.push(
                  {
                    ExamName: this.Exams.filter((f:any) => f.ExamId == _examId)[0].ExamName,
                    ClassName: cls.ClassName,
                    Active: 0
                  }
                )
              }
            })

            statusdetail = statusdetail.sort((a, b) => b.Active - a.Active);
            this.dataSource = new MatTableDataSource(statusdetail);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.loading = false; this.PageLoading = false;
          })
      });
  }

  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.Batches = this.tokenStorage.getBatches()!;
    this.GetExams();

  }

  GetExams() {

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId", "ClassGroupId"];
    list.PageName = "Exams";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.forEach(e => {
          //var _examName = '';
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId)
          if (obj.length > 0) {
            //_examName = obj[0].MasterDataName
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId
            })
          }
        })
        this.loading = false;
        this.PageLoading = false;
      })
  }
  ClassGroupMapping :any[]= [];
  GetClassGroupMapping() {

    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroupMapping(filterOrgSubOrg, 1)
      .subscribe((data: any) => {
        this.ClassGroupMapping = data.value.map(f => {
          f.ClassName = f.Class.ClassName;
          return f;
        });
      })
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
export interface IExamStudentResult {
  ExamStudentResultId: number;
  ExamId: number;
  StudentClassId: number;
  StudentClass: {},
  TotalMarks: number;
  GradeId: number;
  Rank: number;
  OrgId: number; SubOrgId: number;
  BatchId: number;
  Active: number;
  Action: boolean

}




