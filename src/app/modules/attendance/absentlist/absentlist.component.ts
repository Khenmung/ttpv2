import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import * as moment from 'moment';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { TableUtil } from '../../../shared/TableUtil';

@Component({
  selector: 'app-absentlist',
  templateUrl: './absentlist.component.html',
  styleUrls: ['./absentlist.component.scss']
})
export class AbsentListComponent implements OnInit {
  PageLoading = true;

  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  EnableSave = true;
  Permission = 'deny';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  SaveAll = false;
  NoOfRecordToUpdate = -1;
  StudentDetailToDisplay = '';
  StudentClassId = 0;
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  Sections: any[] = [];
  Classes: any[] = [];
  Subjects: any[] = [];
  ClassSubjects: any[] = [];
  AttendanceStatus: any[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
  Batches: any[] = [];
  AttendanceStatusId: any[] = [];
  FilteredClassSubjects: any[] = [];
  StudentAttendanceList: IStudentAttendance[] = [];
  StudentClassList: any[] = [];
  dataSource: MatTableDataSource<IStudentAttendance>;
  allMasterData: any[] = [];
  searchForm = this.fb.group({
    searchClassId: [0],
    searchSectionId: [0],
    searchSemesterId: [0],
    searchClassSubjectId: [0],
    searchAttendanceFromDate: [new Date()],
    searchAttendanceDate: [new Date()]
  });
  StudentClassSubjectId = 0;
  StudentAttendanceData = {
    AttendanceId: 0,
    ReportedTo: 0,
    Approved: false,
    ApprovedBy: '',
    OrgId: 0, SubOrgId: 0,
    BatchId: 0
  };
  displayedColumns = [
    'Student',
    'ClassName',
    'Section',
    'RollNo',
    'AttendanceDate',
    'PersonalNo',
    'ClassSubject',
    'Remarks',
    'ReportedTo',
    'Approved',
    'ApprovedByName',
    'Action'
  ];
  SelectedApplicationId = 0;

  constructor(private servicework: SwUpdate,

    private fb: UntypedFormBuilder,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private route: ActivatedRoute,
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
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.STUDENTATTENDANCE)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetMasterData();
        this.GetTeachers();
        // var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        // this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
        //   if(data.value) this.Classes = [...data.value]; else this.Classes = [...data];
        // })
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
          this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
        });
      }
    }

  }
  PageLoad() {

  }
  bindClassSubject() {
    debugger;
    var classId = this.searchForm.get("searchClassId")?.value;
    this.SelectedClassCategory = '';

    if (classId > 0) {
      let obj = this.Classes.filter((f: any) => f.ClassId == classId);
      if (obj.length > 0)
        this.SelectedClassCategory = obj[0].Category;
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    if (this.SelectedClassCategory == this.getHighSchoolCategory()) {
      this.displayedColumns = [
        'ClassName',
        'Student',
        'ClassName',
        'Section',
        'RollNo',
        'AttendanceDate',
        'PersonalNo',
        'ClassSubject',
        'Remarks',
        'ReportedTo',
        'Approved',
        'ApprovedByName',
        'Action'
      ];
    }
    else if (this.SelectedClassCategory == this.getCollegeCategory()) {
      this.displayedColumns = [
        'ClassName',
        'Student',
        'ClassName',
        'Semester',
        'RollNo',
        'AttendanceDate',
        'PersonalNo',
        'ClassSubject',
        'Remarks',
        'ReportedTo',
        'Approved',
        'ApprovedByName',
        'Action'
      ];
    }
    this.ClearData();
  }

  Teachers: any[] = [];
  GetTeachers() {

    var orgIdSearchstr = this.FilterOrgSubOrg;
    //var _WorkAccount = this.WorkAccounts.filter((f:any) => f.MasterDataName.toLowerCase() == "teaching");
    // var _workAccountId = 0;
    // if (_WorkAccount.length > 0)
    //   _workAccountId = _WorkAccount[0].MasterDataId;

    let list: List = new List();

    list.fields = ["WorkAccountId"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["Employee($select=UserId,EmpEmployeeId,FirstName,LastName)"]
    list.filter = [orgIdSearchstr + " and Active eq 1"]; // and WorkAccountId eq " + _workAccountId
    //list.orderBy = "ParentId";
    this.Teachers = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.filter((f: any) => {
          this.Teachers.push({
            UserId: f.Employee.UserId,
            TeacherId: f.Employee.EmpEmployeeId,
            TeacherName: f.Employee.FirstName + " " + f.Employee.LastName
          })
        })
        //console.log("this.Teacher", this.Teachers)
      })
  }
  SelectedClassCategory = '';
  Defaultvalue = 0;
  Semesters: any[] = [];
  ClassCategory: any[] = [];
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  GetStudentAttendance() {
    debugger;
    let filterStr = this.FilterOrgSubOrg;
    //' and StudentClassId eq ' + this.StudentClassId;
    var _classId = this.searchForm.get("searchClassId")?.value;
    if (_classId > 0) {
      filterStr += ' and ClassId eq ' + _classId;
    }
    //var filterStrClsSub = '';
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    let _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _classSubjectId = this.searchForm.get("searchClassSubjectId")?.value;

    this.loading = true;
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var _AttendanceDate = new Date(this.searchForm.get("searchAttendanceDate")?.value)
    //var _AttendanceFromDate = new Date(this.searchForm.get("searchAttendanceFromDate")?.value)
    _AttendanceDate.setHours(0, 0, 0, 0);
    //_AttendanceFromDate.setHours(0, 0, 0, 0);
    if (_AttendanceDate.getTime() > today.getTime()) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Attendance date cannot be greater than today's date.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    if (_semesterId) filterStr += " and SemesterId eq " + _semesterId;
    if (_sectionId) filterStr += " and SectionId eq " + _sectionId;
    filterStr += " and BatchId eq " + this.SelectedBatchId;

    var datefilterStr = " and AttendanceDate ge " + moment(this.searchForm.get("searchAttendanceFromDate")?.value).format('yyyy-MM-DD')
    datefilterStr += ' and AttendanceDate lt ' + moment(this.searchForm.get("searchAttendanceDate")?.value).add(1, 'day').format('yyyy-MM-DD')
    datefilterStr += ' and StudentClassId gt 0';
    datefilterStr += ' and AttendanceStatusId eq ' + this.AttendanceAbsentId;
    datefilterStr += " and ClassSubjectId eq " + _classSubjectId;

    if (filterStr.length == 0) {
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.StudentAttendanceList = [];
    this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);
    let list: List = new List();
    list.fields = [
      "AttendanceId,StudentClassId,ClassId,SectionId,SemesterId,AttendanceDate,AttendanceStatusId,ClassSubjectId,Remarks,Approved,ReportedTo,ApprovedBy"
    ];

    list.PageName = "Attendances";
    //list.lookupFields = ["Attendances($filter=" + datefilterStr + ";$select=AttendanceId,StudentClassId,AttendanceDate,AttendanceStatusId,ClassSubjectId,Remarks,Approved,ReportedTo,ApprovedBy)"];
    list.filter = [filterStr + datefilterStr];
    this.StudentClassList = [];
    this.dataservice.get(list)
      .subscribe((attendance: any) => {

        var _AllStudents: any = this.tokenStorage.getStudents()!;
        if (_classId > 0 && _sectionId > 0) {
          _AllStudents = _AllStudents.filter(stud => stud.StudentClasses &&
            stud.StudentClasses.length > 0 &&
            stud.StudentClasses[0].ClassId == _classId && stud.StudentClasses[0].SectionId == _sectionId)
        }
        else if (_classId > 0 && _sectionId == 0) {
          _AllStudents = _AllStudents.filter(stud => stud.StudentClasses &&
            stud.StudentClasses.length > 0 &&
            stud.StudentClasses[0].ClassId == _classId)
        }
        else if (_classId == 0 && _sectionId == 0) {
          _AllStudents = _AllStudents.filter(stud => stud.StudentClasses &&
            stud.StudentClasses.length > 0)
        }
        _AllStudents = _AllStudents.filter((f: any) => f.StudentClasses.length > 0 && f.StudentClasses[0].Active == 1);
        // studentclass.value.forEach(item => {
        //   var _student = _AllStudents.filter(a=>a.StudentId == item.StudentId);

        attendance.value.forEach(sc => {
          let _student = _AllStudents.filter(a => a.StudentClasses[0].StudentClassId == sc.StudentClassId);
          //sc.Attendances.forEach(att => {
          if (_student.length > 0) {
            var _subjName = '';
            if (sc.ClassSubjectId > 0) {
              var obj = this.ClassSubjects.filter((s: any) => s.ClassSubjectId == sc.ClassSubjectId);
              if (obj.length > 0)
                _subjName = obj[0].ClassSubject;
            }
            var _approvedByName = ''
            if (sc.Approved) {
              var objApproved = this.Teachers.filter(t => t.UserId == sc.ApprovedBy)
              if (objApproved.length > 0)
                _approvedByName = objApproved[0].TeacherName;
            }
            var _Classobj = this.Classes.filter((s: any) => s.ClassId == sc.ClassId);
            var _Class = '';
            if (_Classobj.length > 0) {
              _Class = _Classobj[0].ClassName;

              var _semesterobj = this.Semesters.filter((s: any) => s.MasterDataId == sc.SemesterId);
              var _semester = '';
              if (_semesterobj.length > 0) {
                _semester = _semesterobj[0].MasterDataName;
              }
              var _sectionobj = this.Sections.filter((s: any) => s.MasterDataId == sc.SectionId);
              var _section = '';
              if (_sectionobj.length > 0) {
                _section = _sectionobj[0].MasterDataName;
              }
              this.StudentAttendanceList.push({
                AttendanceId: sc.AttendanceId,
                Student: _student[0].FirstName + " " + (_student[0].LastName == null ? '' : _student[0].LastName),
                RollNo: _student[0].StudentClasses[0].RollNo,
                PID: _student[0].PID,
                Section: _section,
                Semester: _semester,
                StudentClassId: sc.StudentClassId,
                AttendanceStatusId: sc.AttendanceStatusId,
                AttendanceStatus: this.AttendanceStatus.filter(a => a.MasterDataId == sc.AttendanceStatusId)[0].MasterDataName,
                AttendanceDate: sc.AttendanceDate,
                ClassSubjectId: sc.ClassSubjectId,
                Approved: sc.Approved,
                ReportedTo: sc.ReportedTo,
                ApprovedBy: sc.ApprovedBy,
                ApprovedByName: _approvedByName,
                ClassName: _Class,
                ClassSubject: _subjName,
                Remarks: sc.Remarks,
                PersonalNo: _student[0].PersonalNo,
                ClassSequence: sc.ClassSequence
              });

            }
          }
        })
        if (this.StudentAttendanceList.length == 0)
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        else {

          this.StudentAttendanceList = this.StudentAttendanceList.sort((a: any, b: any) => {
            // if (a.ClassSequence == b.ClassSequence) {
            //   return a.Section.localeCompare(b.Section);
            // }
            return a.ClassSequence - b.ClassSequence;

            //return a.ClassSequence - b.ClassSequence || (a.ClassSequence == b.ClassSequence?a.Section.localeCompare(b.Section):0)
            //return a.ClassSequence - b.ClassSequence// || a.Section.localeCompare(b.Section)
          })
          //this.StudentAttendanceList.for
        }
        ////console.log("this.StudentAttendanceList", this.StudentAttendanceList);
        this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      });
    //this.changeDetectorRefs.detectChanges();
    // });
  }
  sortdata(a, b) {
    var aSize = a.ClassSequence;
    var bSize = b.ClassSequence;
    var aLow = a.RollNo;
    var bLow = b.RollNo;
    //console.log(aLow + " | " + bLow);

    if (aSize == bSize) {
      return (aLow < bLow) ? -1 : (aLow > bLow) ? 1 : 0;
    }
    else {
      return (aSize < bSize) ? -1 : 1;
    }
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      searchSectionId: 0,
      searchSemesterId: 0,
      searchSection: ''
    });
  }
  ClearData() {
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    let _semesterId = this.searchForm.get("searchSemesterId")?.value;
    this.FilteredClassSubjects = globalconstants.getFilteredClassSubjects(this.ClassSubjects, _classId, _sectionId, _semesterId);
    this.StudentAttendanceList = [];
    this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);
  }
  UpdateApproved(element, event) {
    debugger;
    element.Action = true;
    element.Approved = event.checked;
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
  //   this.NoOfRecordToUpdate = this.StudentAttendanceList.length;
  //   this.loading = true;
  //   this.StudentAttendanceList.forEach((record) => {
  //     this.NoOfRecordToUpdate--;
  //     this.UpdateOrSave(record);
  //   })
  //   if (this.StudentAttendanceList.length == 0) {
  //     this.loading = false;
  //   }
  // }
  // SaveRow(row) {
  //   this.NoOfRecordToUpdate = 0;
  //   this.UpdateOrSave(row);
  // }
  RowCount = 0;
  DataCollection: any = [];
  saveall() {
    debugger;
    //var _toUpdate = this.StudentClassList.filter((f: any) => f.Action);
    this.NoOfRecordToUpdate = this.StudentAttendanceList.length;
    this.RowCount = 0;
    this.DataCollection = [];
    this.loading = true;
    this.StudentAttendanceList.forEach((record) => {
      this.NoOfRecordToUpdate--;
      this.DataCollection.push(JSON.parse(JSON.stringify(record)));
      this.UpdateOrSave(record);
    })
  }
  SaveRow(row) {
    debugger;
    this.NoOfRecordToUpdate = 0;
    this.DataCollection = [];
    this.DataCollection.push(JSON.parse(JSON.stringify(row)));
    this.RowCount = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {
    debugger;
    //this.NoOfRecordToUpdate = 0;
    var _AttendanceDate = this.searchForm.get("searchAttendanceDate")?.value;

    var clssubjectid = this.searchForm.get("searchClassSubjectId")?.value
    if (clssubjectid == undefined)
      clssubjectid = 0;

    let checkFilterString = "AttendanceId eq " + row.AttendanceId +
      " and AttendanceDate ge " + moment(_AttendanceDate).format('YYYY-MM-DD') +
      " and AttendanceDate lt " + moment(_AttendanceDate).add(1, 'day').format('YYYY-MM-DD') +
      " and StudentClassId eq " + row.StudentClassId

    if (clssubjectid > 0)
      checkFilterString += " and ClassSubjectId eq " + clssubjectid

    if (row.AttendanceId > 0)
      checkFilterString += " and AttendanceId ne " + row.AttendanceId;

    let list: List = new List();
    list.fields = ["AttendanceId"];
    list.PageName = "Attendances";
    list.filter = [checkFilterString + " and " + this.FilterOrgSubOrg];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.RowCount += 1;
          if (this.DataCollection.length == this.RowCount) {

            this.DataCollection.forEach(item => {

              this.StudentAttendanceData.AttendanceId = item.AttendanceId;
              this.StudentAttendanceData.OrgId = this.LoginUserDetail[0]["orgId"];
              this.StudentAttendanceData.SubOrgId = this.SubOrgId;
              this.StudentAttendanceData.BatchId = this.SelectedBatchId;
              this.StudentAttendanceData.Approved = item.Approved;
              this.StudentAttendanceData.ReportedTo = item.ReportedTo;
              this.StudentAttendanceData.ApprovedBy = this.LoginUserDetail[0]["userId"];
              if (this.StudentAttendanceData.AttendanceId == 0) {
                this.StudentAttendanceData["CreatedDate"] = new Date();
                this.StudentAttendanceData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
                delete this.StudentAttendanceData["UpdatedDate"];
                delete this.StudentAttendanceData["UpdatedBy"];

                this.insert(item);
              }
              else {

                delete this.StudentAttendanceData["CreatedDate"];
                delete this.StudentAttendanceData["CreatedBy"];
                this.StudentAttendanceData["UpdatedDate"] = new Date();
                this.StudentAttendanceData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
                ////console.log("StudentAttendanceData", this.StudentAttendanceData);
                this.update(item);
              }

            })
            // row.Action = false;
          }
        }
      });
  }

  insert(row) {

    this.dataservice.postPatch('Attendances', this.StudentAttendanceData, 0, 'post')
      .subscribe(
        (data: any) => {
          //this.edited = false;
          let insertedItem: any = this.StudentAttendanceList.filter(f => f.AttendanceId == row.AttendanceId);
          insertedItem[0].AttendanceId = data.AttendanceId;
          insertedItem[0].Action = false;
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
          let insertedItem: any = this.StudentAttendanceList.filter(f => f.AttendanceId == row.AttendanceId);
          insertedItem[0].Action = false;
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
      'SectionId',
      'SemesterId',
    ];

    list.PageName = "ClassSubjects";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    //list.filter = ["Active eq 1 and BatchId eq " + this.SelectedBatchId + " and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    //list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.ClassSubjects = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  ////console.log('data.value', data.value);
        this.ClassSubjects = [];
        data.value.forEach(item => {
          //var _subjectName = '';
          var objsubject = this.Subjects.filter((f: any) => f.MasterDataId == item.SubjectId)
          if (objsubject.length > 0) {
            // _subjectName = objsubject[0].MasterDataName;
            this.ClassSubjects.push({
              ClassSubjectId: item.ClassSubjectId,
              ClassSubject: objsubject[0].MasterDataName,
              ClassId: item.ClassId,
              SectionId: item.SectionId,
              SemesterId: item.SemesterId
            })
          }
        })
      })
  }
  AttendancePresentId = 0;
  AttendanceAbsentId = 0;
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    //this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions.common.ATTENDANCESTATUS);
    this.AttendancePresentId = this.AttendanceStatus.filter((s: any) => s.MasterDataName.toLowerCase() == 'present')[0].MasterDataId;
    this.AttendanceAbsentId = this.AttendanceStatus.filter((s: any) => s.MasterDataName.toLowerCase() == 'absent')[0].MasterDataId;
    this.shareddata.ChangeSubjects(this.Subjects);
    this.GetClassSubject();
    this.loading = false; this.PageLoading = false;

  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }
  exportArray() {
    if (this.StudentAttendanceList.length > 0) {
      let toExport: any[] = [];
      this.StudentAttendanceList.forEach(m => {
        toExport.push({
          AttendanceId: m.AttendanceId,
          PID: m.PID,
          Student: m.Student,
          AttendanceDate: moment(m.AttendanceDate).format('DD-MM-YYYY'),
          AttendanceStatus: m.AttendanceStatus,
          ClassName: m.ClassName,
          RollNo: m.RollNo,
          Section: m.Section,
          Semester: m.Semester,
          PersonalNo: m.PersonalNo,
          Subject: m.ClassSubject,
          Remarks: m.Remarks,
          ReportedTo: m.ReportedTo,
          LeaveGranted: m.Approved
        })
      })
      const datatoExport: Partial<any>[] = toExport;
      TableUtil.exportArrayToExcel(datatoExport, "StudentAbsentlist");
    }
  }
}
export interface IStudentAttendance {
  AttendanceId: number;
  PID: number;
  RollNo: number;
  Section: string;
  Semester: string;
  StudentClassId: number;
  AttendanceStatusId: number;
  AttendanceStatus: string;
  ClassSubjectId: number;
  ClassSubject: string;
  AttendanceDate: Date;
  Student: string;
  PersonalNo: string;
  ClassName: string;
  Approved: boolean;
  ReportedTo: number;
  ApprovedBy: string;
  ApprovedByName: string;
  ClassSequence: number;
  Remarks: string;
}


