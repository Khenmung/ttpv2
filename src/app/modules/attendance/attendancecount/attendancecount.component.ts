import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import * as moment from 'moment';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-attendancecount',
  templateUrl: './attendancecount.component.html',
  styleUrls: ['./attendancecount.component.scss']
})
export class AttendanceCountComponent implements OnInit {
  PageLoading = true;

  //@Input() StudentClassId:number;
  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  edited = false;
  //AnyEnableSave =false;
  EnableSave = true;
  Permission = 'deny';
  LoginUserDetail:any[]= [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  SaveAll = false;
  NoOfRecordToUpdate = -1;
  StudentDetailToDisplay = '';
  StudentClassId = 0;
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  Sections :any[]= [];
  Classes :any[]= [];
  Subjects :any[]= [];
  ClassSubjects :any[]= [];
  SelectedBatchId = 0;SubOrgId = 0;

  Batches :any[]= [];
  AttendanceStatus :any[]= [];
  FilteredClassSubjects :any[]= [];
  StudentAttendanceList: IStudentAttendance[]= [];
  StudentClassList :any[]= [];
  dataSource: MatTableDataSource<any>;
  allMasterData :any[]= [];
  searchForm = this.fb.group({
    searchFromDate: [new Date()],
    searchToDate: [new Date()],
    searchClassSubjectId: [0]
  });
  StudentClassSubjectId = 0;
  displayedColumns = [
    'ClassName',
    'Present',
    'Absent'
  ];
  SelectedApplicationId = 0;
  TotalPresent = 0;
  TotalAbsent = 0;
  Students :any[]= [];
  constructor(private servicework: SwUpdate,
    private fb: UntypedFormBuilder,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    debugger;

    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.StudentClassId = 0;
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.Students = this.tokenStorage.getStudents()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.STUDENTATTENDANCE)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetMasterData();
        var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
          this.Classes = [...data.value];
        })

      }
    }

  }
  PageLoad() {

  }
  // bindClassSubject() {
  //   debugger;
  //   var classId = this.searchForm.get("searchClassId")?.value;
  //   this.FilteredClassSubjects = this.ClassSubjects.filter((f:any) => f.ClassId == classId);

  // }
  // checkall(value) {
  //   this.StudentAttendanceList.forEach(record => {
  //     if (value.checked) {
  //       record.AttendanceStatusId = 1;
  //     }
  //     else
  //       record.AttendanceStatusId = 0;
  //     record.Action = true;
  //   })
  //   //this.AnyEnableSave=true;
  // }

  GetStudentAttendance() {
    debugger;

    //let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"]+ " and SubOrgId eq " + this.SubOrgId + " and Active eq 1"
    var filterStrClsSub = '';

    this.loading = true;
    var today = new Date();
    today.setHours(0, 0, 0, 0);


    var _toDate = new Date(this.searchForm.get("searchToDate")?.value)
    var _fromDate = new Date(this.searchForm.get("searchToDate")?.value);
    _toDate.setDate(_toDate.getDate() + 1);
    var _ClassSubjectId = this.searchForm.get("searchClassSubjectId")?.value;
    _toDate.setHours(0, 0, 0, 0);

    this.StudentAttendanceList = [];

    var datefilterStr = ' and AttendanceDate ge ' + moment(_fromDate).format('yyyy-MM-DD')
    datefilterStr += ' and AttendanceDate lt ' + moment(_toDate).format('yyyy-MM-DD')
    datefilterStr += ' and StudentClassId gt 0'

    datefilterStr += ' and BatchId eq ' + this.SelectedBatchId;
    datefilterStr += ' and ClassSubjectId eq 0';// + _ClassSubjectId;

    let list: List = new List();
    list.fields = [
      "AttendanceId",
      "StudentClassId",
      "ClassId",
      "SectionId",
      "AttendanceDate",
      "AttendanceStatusId",
      "ClassSubjectId",
      "Remarks",
      "OrgId",
      "BatchId"
    ];
    list.PageName = "Attendances";
    list.filter = [this.FilterOrgSubOrg +
      datefilterStr + filterStrClsSub]; //+ //"'" + //"T00:00:00.000Z'" +

    this.dataservice.get(list)
      .subscribe((attendance: any) => {

        var _attendanceTotal = attendance.value.filter(att => this.Students.filter((s:any) => s.StudentClasses.length > 0
          && s.StudentClasses[0].Active == 1
          && s.StudentClasses[0].StudentClassId == att.StudentClassId).length > 0)

        _attendanceTotal.forEach(sc => {

          var _className = '', _sectionName = '';
          var clsObj = this.Classes.filter(c => c.ClassId == sc.ClassId);
          if (clsObj.length > 0) {
            _className = clsObj[0].ClassName;
            var sectionObj = this.Sections.filter(c => c.MasterDataId == sc.SectionId);
            if (sectionObj.length > 0) {
              _sectionName = sectionObj[0].MasterDataName;
              this.StudentAttendanceList.push({
                AttendanceId: sc.AttendanceId,
                AttendanceStatusId: sc.AttendanceStatusId,
                AttendanceDate: sc.AttendanceDate,
                ClassName: _className + "-" + _sectionName,
                Sequence: clsObj[0].Sequence
              });
            }
          }
        })
        var _data :any[]= [];
        var sumOfAttendance = alasql("select count(AttendanceStatusId) PresentAbsent,ClassName,AttendanceStatusId,Sequence from ? group by ClassName,AttendanceStatusId,Sequence",
          [this.StudentAttendanceList]);
        sumOfAttendance.forEach(att => {
          var existing = _data.filter((f:any) => f.ClassName == att.ClassName);
          if (existing.length > 0) {
            if (att.AttendanceStatusId == this.AttendancePresentId)
              existing[0]["Present"] = att.PresentAbsent
            else if (att.AttendanceStatusId == this.AttendanceAbsentId)
              existing[0]["Absent"] = att.PresentAbsent
          }
          else {
            if (att.AttendanceStatusId == this.AttendancePresentId)
              _data.push({ ClassName: att.ClassName, Present: att.PresentAbsent, Sequence: att.Sequence })
            else
              _data.push({ ClassName: att.ClassName, Absent: att.PresentAbsent, Sequence: att.Sequence })

          }

        })
        //console.log("_data",_data);
        _data = _data.sort((a, b) => a.Sequence - b.Sequence || a.ClassName - b.ClassName);
        this.TotalPresent = _data.reduce((acc, current) => acc + (current.Present == null ? 0 : current.Present), 0);
        this.TotalAbsent = _data.reduce((acc, current) => acc + (current.Absent == null ? 0 : current.Absent), 0);
        this.dataSource = new MatTableDataSource<any>(_data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      });
    //this.changeDetectorRefs.detectChanges();
  }
  clear() {
    this.searchForm.patchValue({
      //searchClassId: 0,
      searchSection: ''
    });
  }
  ClearData(){
    this.StudentAttendanceList=[];
    this.dataSource = new MatTableDataSource<any>(this.StudentAttendanceList);
  }
  UpdateActive(element, event) {
    element.Action = true;
    //this.AnyEnableSave=true;
    element.AttendanceStatusId = event.checked == true ? this.AttendancePresentId : this.AttendanceAbsentId;
  }
  onChangeEvent(row, value) {
    //debugger;
    if (row.Remarks.length > 0)
      row.Action = true;
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
  // saveall() {
  //   var toUpdateAttendance = this.StudentAttendanceList.filter((f:any) => f.Action);
  //   this.NoOfRecordToUpdate = toUpdateAttendance.length;
  //   this.loading=true;
  //   toUpdateAttendance.forEach((record) => {
  //     this.NoOfRecordToUpdate--;
  //     this.UpdateOrSave(record);
  //   })
  //   if(toUpdateAttendance.length==0)
  //   {
  //     this.loading=false;
  //   }
  // }


  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  GetClassSubject() {
    debugger;
    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
      'SectionId',
      'SemesterId',
    ];

    list.PageName = "ClassSubjects";
    list.filter = [this.FilterOrgSubOrgBatchId  + " and Active eq 1"];
    //list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.ClassSubjects = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        this.ClassSubjects = data.value.map(item => {
          // var _classname = ''
          // var objCls = this.Classes.filter((f:any) => f.ClassId == item.ClassId)
          // if (objCls.length > 0)
          //   _classname = objCls[0].ClassName;

          var _subjectName = '';
          var objsubject = this.Subjects.filter((f:any) => f.MasterDataId == item.SubjectId)
          if (objsubject.length > 0)
            _subjectName = objsubject[0].MasterDataName;

          return {
            ClassSubjectId: item.ClassSubjectId,
            ClassSubject: _subjectName,
            ClassId: item.ClassId,
            SectionId: item.SectionId,
            SemesterId: item.SemesterId
          }
        })
      })
  }
  AttendancePresentId=0;
  AttendanceAbsentId=0;
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions.common.ATTENDANCESTATUS);
    this.AttendancePresentId =this.AttendanceStatus.filter((s:any)=>s.MasterDataName.toLowerCase()=='present')[0].MasterDataId;
    this.AttendanceAbsentId =this.AttendanceStatus.filter((s:any)=>s.MasterDataName.toLowerCase()=='absent')[0].MasterDataId;

    this.shareddata.ChangeSubjects(this.Subjects);
    this.GetClassSubject();
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
export interface IStudentAttendance {
  AttendanceId: number;
  AttendanceStatusId: number;
  AttendanceDate: Date;
  ClassName: string;
  Sequence: number;
}


