import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-studenttotalattendance',
  templateUrl: './studenttotalattendance.component.html',
  styleUrls: ['./studenttotalattendance.component.scss']
})
export class StudenttotalattendanceComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paging: MatPaginator;
  ClassGroups :any[]= [];
  //SubjectCategory :any[]= [];
  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  TotalAttendanceListName = 'TotalAttendances';
  Applications :any[]= [];
  loading = false;
  SelectedBatchId = 0; SubOrgId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';

  TotalAttendanceList: ITotalAttendance[]= [];
  filteredOptions: Observable<ITotalAttendance[]>;
  dataSource: MatTableDataSource<ITotalAttendance>;
  allMasterData :any[]= [];
  TotalAttendance :any[]= [];
  Permission = 'deny';
  Classes :any[]= [];
  ExamStatus :any[]= [];
  TotalAttendanceData = {
    TotalAttendanceId: 0,
    ClassId: 0,
    TotalNoOfAttendance: 0,
    ExamId: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0,
    Active: false
  };
  MonthYears :any[]= [];
  displayedColumns = [
    "TotalAttendanceId",
    "ClassName",
    "TotalNoOfAttendance",
    "Action"
  ];
  SelectedApplicationId = 0;
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
      // searchClassId: [0],
      // searchSectionId: [0],
      // searchSemesterId: [0]
    });
    this.PageLoad();
  }
  Exams :any[]= [];
  ExamNames :any[]= [];
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
  PageLoad() {

    debugger;
    this.loading = true;
    this.MonthYears = this.contentservice.GetSessionFormattedMonths();
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //this.EmployeeId = +this.tokenStorage.getEmployeeId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.STUDENTTOTALATTENDANCE);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu'])
      }
      else {
        this.GetClassGroupMapping();
        this.GetMasterData();
        this.Getclassgroups();
      }
    }
  }

  // AddNew() {
  //   var _examId = this.searchForm.get("searchExamId")?.value;
  //   var newdata = {
  //     TotalAttendanceId: 0,
  //     ClassId: 0,
  //     TotalNoOfAttendance: 0,
  //     ExamId: _examId,
  //     BatchId: 0,
  //     Active: 0,
  //     Action: false
  //   };
  //   this.TotalAttendanceList :any[]= [];
  //   this.TotalAttendanceList.push(newdata);
  //   this.dataSource = new MatTableDataSource<ITotalAttendance>(this.TotalAttendanceList);
  //   this.dataSource.paginator = this.paging;
  // }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    // if (row.ClassId == 0) {
    //   this.loading = false;
    //   this.contentservice.openSnackBar("Please select class group.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }

    if (row.ExamId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let checkFilterString = this.FilterOrgSubOrgBatchId + " and ExamId eq " + row.ExamId +
      " and ClassId eq " + row.ClassId;

    if (row.TotalAttendanceId > 0)
      checkFilterString += " and TotalAttendanceId ne " + row.TotalAttendanceId;
    let list: List = new List();
    list.fields = ["TotalAttendanceId"];
    list.PageName = this.TotalAttendanceListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.TotalAttendanceData.TotalAttendanceId = row.TotalAttendanceId;
          this.TotalAttendanceData.Active = true;
          this.TotalAttendanceData.ExamId = this.searchForm.get("searchExamId")?.value;
          this.TotalAttendanceData.ClassId = row.ClassId;
          this.TotalAttendanceData.TotalNoOfAttendance = +row.TotalNoOfAttendance;
          this.TotalAttendanceData.BatchId = this.SelectedBatchId;
          this.TotalAttendanceData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.TotalAttendanceData.SubOrgId = this.SubOrgId;

          //console.log("this.TotalAttendanceData", this.TotalAttendanceData);
          if (this.TotalAttendanceData.TotalAttendanceId == 0) {
            this.TotalAttendanceData["CreatedDate"] = new Date();
            this.TotalAttendanceData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.TotalAttendanceData["UpdatedDate"] = new Date();
            delete this.TotalAttendanceData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.TotalAttendanceData["CreatedDate"];
            delete this.TotalAttendanceData["CreatedBy"];
            this.TotalAttendanceData["UpdatedDate"] = new Date();
            this.TotalAttendanceData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.TotalAttendanceListName, this.TotalAttendanceData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.TotalAttendanceId = data.TotalAttendanceId;
          row.Action = false;
          if (this.RowsToUpdate == 0) {
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse()
          }
        });
  }
  update(row) {

    this.dataservice.postPatch(this.TotalAttendanceListName, this.TotalAttendanceData, this.TotalAttendanceData.TotalAttendanceId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          if (this.RowsToUpdate == 0) {
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse();
          }
        });
  }
  Getclassgroups() {
    this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassGroups = [...data.value];
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
      });
  }
  ExamReleaseResult = true;
  GetTotalAttendance() {
    debugger;
    this.loading = true;
    let filterStr = this.FilterOrgSubOrgBatchId;

    var _examId = this.searchForm.get("searchExamId")?.value;

    if (_examId > 0) {
      filterStr += " and ExamId eq " + _examId;
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //var ExamReleaseResult =true; 
    var examObj = this.Exams.filter((f:any) => f.ExamId == _examId);
    if (examObj.length > 0) {
      this.ExamReleaseResult = examObj[0].ReleaseResult == 1 ? true : false;
    }
    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.TotalAttendanceListName;
    list.filter = [filterStr];
    
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.TotalAttendanceList= [];
        var _classes = this.ClassGroupMapping.filter(g => g.ClassGroupId == examObj[0].ClassGroupId);
        _classes.forEach(f => {

          var objExisting = data.value.filter(c => c.ClassId == f.ClassId);
          if (objExisting.length > 0) {
            this.TotalAttendanceList.push({
              TotalAttendanceId: objExisting[0].TotalAttendanceId,
              ClassId: objExisting[0].ClassId,
              ClassName: f.ClassName,
              TotalNoOfAttendance: objExisting[0].TotalNoOfAttendance,
              ExamId: objExisting[0].ExamId,
              BatchId: objExisting[0].BatchId,
              Action: false,
              Active: objExisting[0].Active
            })

          } // f.ClassName = objExisting[0].ClassName;
          else {
            this.TotalAttendanceList.push({
              TotalAttendanceId: 0,
              ClassId: f.ClassId,
              ClassName: f.ClassName,
              TotalNoOfAttendance: 22,
              ExamId: this.searchForm.get("searchExamId")?.value,
              BatchId: this.SelectedBatchId,
              Action: false,
              Active: false
            })
          }
        });
        this.TotalAttendanceList = this.TotalAttendanceList.sort((a, b) => a.ExamId - b.ExamId);

        this.dataSource = new MatTableDataSource<ITotalAttendance>(this.TotalAttendanceList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });
  }
  RowsToUpdate = 0;
  SaveAll() {
    var toupdate = this.TotalAttendanceList.filter((f:any) => f.Action);
    this.RowsToUpdate = toupdate.length;
    toupdate.forEach(f => {
      this.RowsToUpdate--;
      this.UpdateOrSave(f);
    })
  }
  SelectAll(event) {
    debugger;
    this.TotalAttendanceList.forEach(f => {
      f.Active = event.checked;
      f.Action = true;
    })
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.ExamStatus = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS)
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME)

    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      this.Classes = [...data.value];
      this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
      this.loading = false; this.PageLoading = false;
    });
    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId, 2)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.forEach(f => {
          var obj = this.ExamNames.filter(e => e.MasterDataId == f.ExamNameId);
          if (obj.length > 0) {
            f.ExamName = obj[0].MasterDataName;
            this.Exams.push(f);
          }

        })
      })
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }
}
export interface ITotalAttendance {
  TotalAttendanceId: number;
  ClassId: number;
  ClassName: string;
  TotalNoOfAttendance: number;
  ExamId: number;
  Active: boolean;
  BatchId: number;
  Action: boolean;
}

