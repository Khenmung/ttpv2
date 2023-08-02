import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import * as moment from 'moment';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-studentattendance',
  templateUrl: './studentattendance.component.html',
  styleUrls: ['./studentattendance.component.scss']
})
export class StudentAttendanceComponent implements OnInit {
  PageLoading = true;

  //@Input() StudentClassId:number;
  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  //edited = false;
  //AnyEnableSave =false;
  EnableSave = true;
  Permission = 'deny';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  SaveAll = false;
  NoOfRecordToUpdate = -1;
  StudentDetailToDisplay = '';
  StudentClassId = 0;
  OrgSubOrgFilter = '';
  loading = false;
  Sections = [];
  Classes = [];
  Subjects = [];
  ClassSubjects = [];
  SelectedBatchId = 0; SubOrgId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  Batches = [];
  //AttendanceStatusId = [];
  FilteredClassSubjects = [];
  StudentAttendanceList: IStudentAttendance[] = [];
  StudentClassList = [];
  dataSource: MatTableDataSource<IStudentAttendance>;
  allMasterData = [];
  searchForm = this.fb.group({
    searchClassId: [0],
    searchSectionId: [0],
    searchClassSubjectId: [0],
    searchAttendanceDate: [new Date()],
    searchSemesterId: [0]
  });
  StudentClassSubjectId = 0;
  StudentAttendanceData = {
    AttendanceId: 0,
    StudentClassId: 0,
    ClassId: 0,
    SemesterId: 0,
    SectionId: 0,
    AttendanceStatusId: 0,
    AttendanceDate: new Date(),
    ClassSubjectId: 0,
    TeacherId: 0,
    Approved: false,
    ApprovedBy: '',
    Remarks: '',
    BatchId: 0,
    OrgId: 0,
    SubOrgId: 0
  };
  displayedColumns = [
    'StudentRollNo',
    'AttendanceStatusId',
    'Remarks',
    'Action'
  ];
  AttendancePresentId=0;
  AttendanceAbsentId=0;
  SelectedApplicationId = 0;
  Students = [];
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
    this.PageLoading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.StudentClassId = 0;
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.STUDENTATTENDANCE)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.Students = this.tokenStorage.getStudents();
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
        //this.OrgSubOrgFilter = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        
        this.GetMasterData();
        //this.GetSubjectTypes();

        

      }
    }

  }
  PageLoad() {

  }
  SelectedClassCategory = '';
  bindClassSubject() {
    debugger;
    var _classId = this.searchForm.get("searchClassId").value;
    var _sectionId = this.searchForm.get("searchSectionId").value;
    var _semesterId = this.searchForm.get("searchSemesterId").value;
    this.FilteredClassSubjects = globalconstants.getFilteredClassSubjects(this.ClassSubjects, _classId, _sectionId, _semesterId);


    this.SelectedClassCategory = '';

    if (_classId > 0) {
      let obj = this.Classes.filter(f => f.ClassId == _classId);
      if (obj.length > 0)
        this.SelectedClassCategory = obj[0].Category;
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();
  }
  checkall(value) {
    debugger;

    this.StudentAttendanceList.forEach(record => {
      if (value.checked) {
        record.AttendanceStatusId = this.AttendancePresentId;
      }
      else
        record.AttendanceStatusId = this.AttendanceAbsentId;
      record.Action = true;
    })
    //this.AnyEnableSave=true;
  }
  AttendanceMsg = '';
  GetStudentAttendance() {
    debugger;
    //this.StudentAttendanceList=[];
    //this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);
    var _subjectwise = this.searchForm.get("searchClassSubjectId").value;
    if (_subjectwise > 0) {
      var obj = this.FilteredClassSubjects.filter(f => f.ClassSubjectId == _subjectwise);
      if (obj.length > 0) {
        this.AttendanceMsg = "Attendance for " + obj[0].ClassSubject;
      }
      else
        this.AttendanceMsg = 'No subject name found.'

    }
    else
      this.AttendanceMsg = 'Daily Attendance';

    let filterStr = this.FilterOrgSubOrgBatchId;
    //' and StudentClassId eq ' + this.StudentClassId;
    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      filterStr += ' and ClassId eq ' + _classId;
    }
    var filterStrClsSub = '';
    var _sectionId = this.searchForm.get("searchSectionId").value;
    var _classSubjectId = this.searchForm.get("searchClassSubjectId").value;
    var _semesterId = this.searchForm.get("searchSemesterId").value;
    if (_sectionId == 0 && this.SelectedClassCategory == globalconstants.CategoryHighSchool) {
      this.contentservice.openSnackBar("Please select either section.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_semesterId == 0 && this.SelectedClassCategory == globalconstants.CategoryCollege) {
      this.contentservice.openSnackBar("Please select either semester.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var _AttendanceDate = new Date(this.searchForm.get("searchAttendanceDate").value)
    _AttendanceDate.setHours(0, 0, 0, 0);
    if (_AttendanceDate.getTime() > today.getTime()) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Attendance date cannot be greater than today's date.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.LoginUserDetail[0]['RoleUsers'][0]['role'].toLowerCase() != 'admin' && _AttendanceDate.getTime() != today.getTime()) {
      this.EnableSave = false;
    }
    else
      this.EnableSave = true;

    if(_semesterId) filterStr += " and SemesterId eq " + _semesterId;
    if(_sectionId) filterStr += " and SectionId eq " + _sectionId;
    filterStr += " and ClassSubjectId eq " + _classSubjectId;

    if (filterStr.length == 0) {
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.StudentAttendanceList = [];
    this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);

    var datefilterStr = filterStr + ' and AttendanceDate ge ' + moment(this.searchForm.get("searchAttendanceDate").value).format('yyyy-MM-DD')
    datefilterStr += ' and AttendanceDate lt ' + moment(this.searchForm.get("searchAttendanceDate").value).add(1, 'day').format('yyyy-MM-DD')
    datefilterStr += ' and StudentClassId gt 0'

    let list: List = new List();
    list.fields = [
      "AttendanceId",
      "StudentClassId",
      "ClassId",
      "SectionId",
      "SemesterId",
      "AttendanceDate",
      "AttendanceStatusId",
      "ClassSubjectId",
      "Remarks",
      "OrgId",
      "BatchId"
    ];
    list.PageName = "Attendances";
    //list.lookupFields = ["StudentClass"];
    list.filter = [datefilterStr + filterStrClsSub]; //+ //"'" + //"T00:00:00.000Z'" +

    this.dataservice.get(list)
      .subscribe((attendance: any) => {
        var studentCls = this.Students.filter(f => f.StudentClasses
          && f.StudentClasses.length > 0
          && f.StudentClasses[0].ClassId == _classId
          && f.StudentClasses[0].SectionId == (_sectionId ? _sectionId : f.StudentClasses[0].SectionId)
          && f.StudentClasses[0].SemesterId == (_semesterId ? _semesterId : f.StudentClasses[0].SemesterId)
          && f.StudentClasses[0].Active == 1);

        studentCls.forEach(sc => {
          var studName = sc.StudentClasses[0].RollNo + "-" + sc.FirstName + (sc.LastName ? " " + sc.LastName : "");
          let existing = attendance.value.filter(db => db.StudentClassId == sc.StudentClasses[0].StudentClassId);
          if (existing.length > 0) {
            this.StudentAttendanceList.push({
              AttendanceId: existing[0].AttendanceId,
              RollNo: sc.StudentClasses[0].RollNo,
              ClassId: sc.StudentClasses[0].ClassId,
              SectionId: sc.StudentClasses[0].SectionId,
              SemesterId: sc.StudentClasses[0].SemesterId,
              StudentClassId: existing[0].StudentClassId,
              AttendanceStatusId: existing[0].AttendanceStatusId,
              AttendanceDate: existing[0].AttendanceDate,
              ClassSubjectId: existing[0].ClassSubjectId,
              Remarks: existing[0].Remarks,
              StudentRollNo: studName,
              Action: false
            });
          }
          else {
            if (_classSubjectId > 0) {
              var indx = this.StudentClassSubjects.findIndex(s => s.StudentClassId == sc.StudentClasses[0].StudentClassId)
              if (indx > -1) {
                this.StudentAttendanceList.push({
                  AttendanceId: 0,
                  RollNo: sc.StudentClasses[0].RollNo,
                  ClassId: sc.StudentClasses[0].ClassId,
                  SectionId: sc.StudentClasses[0].SectionId,
                  SemesterId: sc.StudentClasses[0].SemesterId,
                  StudentClassId: sc.StudentClasses[0].StudentClassId,
                  AttendanceStatusId: this.AttendanceAbsentId,
                  AttendanceDate: new Date(),
                  ClassSubjectId: 0,
                  Remarks: '',
                  StudentRollNo: studName,
                  Action: false
                });
              }
            }
            else {
              this.StudentAttendanceList.push({
                AttendanceId: 0,
                RollNo: sc.StudentClasses[0].RollNo,
                ClassId: sc.StudentClasses[0].ClassId,
                SectionId: sc.StudentClasses[0].SectionId,
                SemesterId: sc.StudentClasses[0].SemesterId,
                StudentClassId: sc.StudentClasses[0].StudentClassId,
                AttendanceStatusId: 0,
                AttendanceDate: new Date(),
                ClassSubjectId: 0,
                Remarks: '',
                StudentRollNo: studName,
                Action: false
              });
            }

          }
        })
        this.StudentAttendanceList = this.StudentAttendanceList.sort((a, b) => a.RollNo - b.RollNo)
        this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      });
    //this.changeDetectorRefs.detectChanges();
    //});
  }
  ClearData() {
    this.StudentAttendanceList = [];
    this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);

  }
  StudentClassSubjects = [];
  GetExistingStudentClassSubjects() {
    var clssubjectid = this.searchForm.get("searchClassSubjectId").value;
    var orgIdSearchstr = this.FilterOrgSubOrgBatchId;
    var _classId = this.searchForm.get("searchClassId").value;
    var _sectionId = this.searchForm.get("searchSectionId").value;
    var _semesterId = this.searchForm.get("searchSemesterId").value;
    this.StudentAttendanceList = [];
    this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);

    if (_classId > 0 && clssubjectid > 0) {

      orgIdSearchstr += ' and ClassSubjectId eq ' + clssubjectid;
      orgIdSearchstr += ' and ClassId eq ' + _classId;
      orgIdSearchstr += ' and SemesterId eq ' + _semesterId;
      orgIdSearchstr += ' and SectionId eq ' + _sectionId;
      orgIdSearchstr += " and Active eq 1";

      let list: List = new List();

      list.fields = [
        "ClassSubjectId",
        "StudentClassId",
      ];
      list.PageName = "StudentClassSubjects";
      list.filter = [orgIdSearchstr];
      //list.orderBy = "ParentId";
      debugger;
      this.dataservice.get(list)
        .subscribe((data: any) => {
          this.StudentClassSubjects = [...data.value];
        })
    }
    else {
      if (clssubjectid > 0)
        this.contentservice.openSnackBar("Please select class, section, subject.", globalconstants.ActionText, globalconstants.RedBackground);
    }
    this.ClearData();
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      searchSection: ''
    });
  }
  UpdateActive(element, event) {
    element.Action = true;
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
  saveall() {
    debugger;
    //var toUpdateAttendance = this.StudentAttendanceList.filter(f => f.Action);
    //console.log("toUpdateAttendance",toUpdateAttendance);
    this.NoOfRecordToUpdate = this.StudentAttendanceList.length;
    this.loading = true;
    this.StudentAttendanceList.forEach((record) => {
      this.NoOfRecordToUpdate--;
      this.UpdateOrSave(record);
    })
    if (this.StudentAttendanceList.length == 0) {
      this.loading = false;
    }
  }
  SaveRow(row) {
    this.NoOfRecordToUpdate = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {
debugger;
    //this.NoOfRecordToUpdate = 0;
    var _AttendanceDate = this.searchForm.get("searchAttendanceDate").value;

    var clssubjectid = this.searchForm.get("searchClassSubjectId").value
    if (clssubjectid == undefined)
      clssubjectid = 0;

    let checkFilterString = this.FilterOrgSubOrg + " and StudentClassId eq " + row.StudentClassId +
      " and AttendanceDate ge " + moment(_AttendanceDate).format('YYYY-MM-DD') +
      " and AttendanceDate lt " + moment(_AttendanceDate).add(1, 'day').format('YYYY-MM-DD')
    //if (clssubjectid > 0)
    checkFilterString += " and ClassSubjectId eq " + clssubjectid

    if (row.AttendanceId > 0)
      checkFilterString += " and AttendanceId ne " + row.AttendanceId;

    let list: List = new List();
    list.fields = ["AttendanceId"];
    list.PageName = "Attendances";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.StudentAttendanceData.StudentClassId = row.StudentClassId;
          this.StudentAttendanceData.ClassId = row.ClassId;
          this.StudentAttendanceData.SectionId = row.SectionId;
          this.StudentAttendanceData.SemesterId = row.SemesterId;
          this.StudentAttendanceData.AttendanceDate = new Date(_AttendanceDate);
          this.StudentAttendanceData.AttendanceId = row.AttendanceId;
          this.StudentAttendanceData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.StudentAttendanceData.SubOrgId = this.SubOrgId;
          this.StudentAttendanceData.BatchId = this.SelectedBatchId;
          this.StudentAttendanceData.AttendanceStatusId = row.AttendanceStatusId;
          this.StudentAttendanceData.ClassSubjectId = clssubjectid;
          this.StudentAttendanceData.Approved = false;
          this.StudentAttendanceData.ApprovedBy = '';
          this.StudentAttendanceData.Remarks = row.Remarks;
          if (this.StudentAttendanceData.AttendanceId == 0) {
            this.StudentAttendanceData["CreatedDate"] = new Date();
            this.StudentAttendanceData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.StudentAttendanceData["UpdatedDate"];
            delete this.StudentAttendanceData["UpdatedBy"];
            //console.log("StudentAttendanceData insert",this.StudentAttendanceData);
            this.insert(row);
          }
          else {
            delete this.StudentAttendanceData["CreatedDate"];
            delete this.StudentAttendanceData["CreatedBy"];
            this.StudentAttendanceData["UpdatedDate"] = new Date();
            this.StudentAttendanceData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            //console.log("StudentAttendanceData update",this.StudentAttendanceData);
            this.update(row);
          }
          row.Action = false;
        }
      });
  }

  insert(row) {
    console.log("this.StudentAttendanceData",this.StudentAttendanceData);
    this.dataservice.postPatch('Attendances', this.StudentAttendanceData, 0, 'post')
      .subscribe(
        (data: any) => {
          //this.edited = false;
          row.AttendanceId = data.AttendanceId;
          row.Action = false;
          if (this.NoOfRecordToUpdate == 0) {
            this.NoOfRecordToUpdate = -1;
            this.loading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  update(row) {
    this.dataservice.postPatch('Attendances', this.StudentAttendanceData, this.StudentAttendanceData.AttendanceId, 'patch')
      .subscribe(
        (data: any) => {
          //this.edited = false;
          row.Action = false;
          if (this.NoOfRecordToUpdate == 0) {
            this.NoOfRecordToUpdate = -1;
            this.loading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
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
      'SubjectTypeId',
      'SectionId',
      'SemesterId'
    ];
    this.loading = true;
    list.PageName = "ClassSubjects";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    //list.filter = ["Active eq 1 and BatchId eq " + this.SelectedBatchId + " and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    //list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.ClassSubjects = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = [];
        data.value.forEach(item => {
          var objsubject = this.Subjects.filter(f => f.MasterDataId == item.SubjectId)
          if (objsubject.length > 0) {
            var type = this.SubjectTypes.filter(s => s.SubjectTypeId == item.SubjectTypeId && s.SelectHowMany != 0);
            if (type.length > 0) {
              this.ClassSubjects.push({
                ClassSubjectId: item.ClassSubjectId,
                ClassSubject: objsubject[0].MasterDataName,
                ClassId: item.ClassId,
                SubjectTypeId: item.SubjectTypeId,
                SemesterId: item.SemesterId,
                SectionId: item.SectionId
              })
            }
          }
        })
        this.loading = false;
        this.PageLoading = false;
      })
  }
  GetSubjectTypes() {

    var orgIdSearchstr = this.FilterOrgSubOrg + ' and Active eq 1';

    let list: List = new List();
    this.loading = true;
    list.fields = ["SubjectTypeId", "SubjectTypeName", "SelectHowMany"];
    list.PageName = "SubjectTypes";
    list.filter = [orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SubjectTypes = [...data.value];
        this.GetClassSubject();
      })
  }
  SubjectTypes = [];
  Semesters = [];
  ClassCategory = [];
  AttendanceStatus=[];
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions.common.ATTENDANCESTATUS);
    //this.SubjectTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTTYPE);
    this.AttendancePresentId = this.AttendanceStatus.filter(f=>f.MasterDataName.toLowerCase()=='present')[0].MasterDataId;
    this.AttendanceAbsentId = this.AttendanceStatus.filter(f=>f.MasterDataName.toLowerCase()=='absent')[0].MasterDataId;
    this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
      this.Classes = data.value.map(m => {
        let obj = this.ClassCategory.filter(c => c.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Category = obj[0].MasterDataName.toLowerCase();
        }
        else
          m.Category = '';
        return m;
      })
    })
    this.shareddata.ChangeSubjects(this.Subjects);
    this.GetSubjectTypes();
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
  RollNo: number;
  ClassId: number;
  SectionId: number;
  SemesterId: number;
  StudentClassId: number;
  AttendanceStatusId: number;
  ClassSubjectId: number;
  AttendanceDate: Date;
  StudentRollNo: string;
  Remarks: string;
  Action: boolean
}


