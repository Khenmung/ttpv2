import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { evaluate } from 'mathjs';
import * as moment from 'moment';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { EMPTY, forkJoin } from 'rxjs';
import { TableUtil } from '../../../shared/TableUtil';

@Component({
  selector: 'app-verifyresults',
  templateUrl: './verifyresults.component.html',
  styleUrls: ['./verifyresults.component.scss']
})
export class VerifyResultsComponent implements OnInit {

  //   @ViewChild(MatPaginator) nonGradingPaginator: MatPaginator;
  //   @ViewChild(MatSort) nonGradingSort: MatSort;
  //   @ViewChild(MatPaginator) GradingPaginator: MatPaginator;
  //  // @ViewChild(MatSort) GradingSort: MatSort;

  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  PageLoading = true;
  AttendanceModes: any[] = [];
  //SelectedClassAttendances :any[]= [];
  StudentAttendanceList: any[] = [];
  AttendanceStatusSum: any[] = [];
  AttendanceDisplay = '';
  ClassStrength = '';

  ClickedVerified = false;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  rowCount = 0;
  ExamStudentSubjectResult: IExamStudentSubjectResult[] = [];
  ExamStudentSubjectGrading: any[] = [];
  FullMarkForAllSubjects100Pc = 0;
  ClassSubjectComponents: any[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
  SelectedApplicationId = 0;
  StoredForUpdate: any[] = [];
  SubjectMarkComponents: any[] = [];
  MarkComponents: any[] = [];
  StudentGrades: any[] = [];
  SelectedClassStudentGrades: any[] = [];
  Students: any[] = [];
  Classes: any[] = [];
  ClassGroups: any[] = [];
  Subjects: any[] = [];
  Sections: any[] = [];
  ExamStatuses: any[] = [];
  ExamNames: any[] = [];
  Exams: any[] = [];
  Batches: any[] = [];
  ExamClassGroups: any[] = [];
  StudentSubjects: any[] = [];
  SubjectCategory: any[] = [];
  dataSource: MatTableDataSource<IExamStudentSubjectResult>;
  GradingDataSource: MatTableDataSource<any[]>;
  allMasterData: any[] = [];
  Permission = 'deny';
  ExamId = 0;
  ClassSubjects: any[] = [];
  SectionSelected = true;
  ExamResultProperties: any[] = [];
  ExamNCalculate: any[] = [];
  ClassGroupIdOfExam = 0;
  FilteredClasses: any[] = [];
  ExamReleased = 0;
  AttendanceStatus: any[] = [];
  ExamStudentSubjectResultData = {
    ExamStudentSubjectResultId: 0,
    ExamId: 0,
    StudentClassSubjectId: 0,
    ClassSubjectMarkComponentId: 0,
    Marks: 0,
    ActualMarks: 0,
    ExamStatus: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0,
    Active: 0
  };
  VerifiedResult: {
    "ExamStudentResult": any[],
    "ExamResultSubjectMark": any[]
  } = {
      "ExamStudentResult": [],
      "ExamResultSubjectMark": []
    }
  displayedColumns = [
    'Student',
  ];
  GradingDisplayedColumns = [
    'Student',
  ];
  Defaultvalue = 0;
  Semesters: any[] = [];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private route: Router,
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
    //this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>(this.ExamStudentSubjectResult);
    //this.dataSource.paginator = this.nonGradingPaginator;//.toArray()[0];
    ////debugger;
    this.searchForm = this.fb.group({
      searchExamId: [0],
      searchClassId: [0],
      searchSectionId: [0],
      searchSemesterId: [0],
      searchSubjectId: [0],
      viewMarkPercentCheckBox: [false]
    });
    this.PageLoad();
  }

  PageLoad() {
    debugger;
    this.Loading(true);
    this.PageLoading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.VERIFYRESULT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      ////console.log('this.Permission', this.Permission)
      if (this.Permission != 'deny') {

        //var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);


        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.GetMasterData();
      }
    }
  }
  FilterClass() {
    debugger;
    var _examId = this.searchForm.get("searchExamId")?.value
    //var _classGroupId = 0;
    this.ExamReleased = 0;
    this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg, _examId)
      .subscribe((data: any) => {
        this.ExamClassGroups = [...data.value];
        var objExamClassGroups = this.ExamClassGroups.filter(g => g.ExamId == _examId);
        this.FilteredClasses = this.ClassGroupMapping.filter((f: any) => objExamClassGroups.findIndex(fi => fi.ClassGroupId == f.ClassGroupId) > -1);
        this.FilteredClasses = this.FilteredClasses.sort((a, b) => a.Sequence - b.Sequence);
      });


    var obj = this.Exams.filter((f: any) => f.ExamId == _examId);
    if (obj.length > 0) {
      //this.ClassGroupIdOfExam = obj[0].ClassGroupId;     

      this.ExamReleased = obj[0].ReleaseResult;
    }

    //this.GetSelectedSubjectsForSelectedExam();
    this.ClearData();
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  clear() {
    this.searchForm.patchValue({ searchExamId: 0 });
    this.searchForm.patchValue({ searchClassId: 0 });
    this.searchForm.patchValue({ searchSectionId: 0 });
    this.searchForm.patchValue({ searchSemesterId: 0 });

  }
  ClearData() {
    this.ExamStudentSubjectResult = [];
    this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>(this.ExamStudentSubjectResult);
    this.ExamStudentSubjectGrading = [];
    this.GradingDataSource = new MatTableDataSource<any[]>(this.ExamStudentSubjectGrading);
  }
  logourl = '';
  CommonHeader: any[] = [];
  Organization: any[] = [];
  GetOrganization() {

    let list: List = new List();
    list.fields = [
      "OrganizationId",
      "OrganizationName",
      "LogoPath",
      "Address",
      "CityId",
      "StateId",
      "CountryId",
      "WebSite",
      "Contact",
      "RegistrationNo",
      "ValidFrom",
      "ValidTo"

    ];
    list.PageName = "Organizations";
    list.filter = ["OrganizationId eq " + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((org: any) => {
        this.Organization = org.value.map(m => {
          //m.CountryName = '';
          var countryObj = this.allMasterData.filter((f: any) => f.MasterDataId == m.CountryId);
          if (countryObj.length > 0)
            m.Country = countryObj[0].MasterDataName;

          var stateObj = this.allMasterData.filter((f: any) => f.MasterDataId == m.StateId);
          if (stateObj.length > 0)
            m.State = stateObj[0].MasterDataName;

          var cityObj = this.allMasterData.filter((f: any) => f.MasterDataId == m.CityId);
          if (cityObj.length > 0)
            m.City = cityObj[0].MasterDataName;

          return [{
            name: "OrganizationId", val: m.OrganizationId
          }, {
            name: "Organization", val: m.OrganizationName
          }, {
            name: "LogoPath", val: m.LogoPath
          }, {
            name: "Address", val: m.Address
          }, {
            name: "City", val: m.City
          }, {
            name: "State", val: m.State
          }, {
            name: "Country", val: m.Country
          }, {
            name: "Contact", val: m.Contact
          }, {
            name: "RegistrationNo", val: m.RegistrationNo == null ? '' : m.RegistrationNo
          }, {
            name: "ValidFrom", val: m.ValidFrom
          }, {
            name: "ValidTo", val: m.ValidTo
          },
          {
            name: "WebSite", val: m.WebSite == null ? '' : m.WebSite
          },
          {
            name: "ToDay", val: moment(new Date()).format("DD/MM/YYYY")
          }
          ]
        })
        ////console.log("this.Organization",this.Organization);
        ////console.log("this.CommonHeader.",this.CommonHeader);
        var imgobj = this.CommonHeader.filter((f: any) => f.MasterDataName == 'img');
        if (imgobj.length > 0) {
          this.logourl = imgobj[0].Description;
        }
        this.CommonHeader = this.CommonHeader.filter((f: any) => f.MasterDataName != 'img');
        ////console.log("this.commonheadersetting.",commonheadersetting);
        this.CommonHeader.forEach(header => {
          this.Organization[0].forEach(orgdet => {
            header.Description = header.Description.replaceAll("[" + orgdet.name + "]", orgdet.val);
            // header.Description = header.Description.replaceAll("[" + orgdet.OrganizationAddress + "]", orgdet.val);
          })
        })
        // this.CommonHeader.forEach(header => {
        //   this.Organization[0].forEach(orgdet => {
        //     header.Description = header.Description.replaceAll("[" + orgdet.name + "]", orgdet.val);
        //     // header.Description = header.Description.replaceAll("[" + orgdet.OrganizationAddress + "]", orgdet.val);
        //   })
        // })

        //this.loading = false; this.PageLoading = false;
      });
    ////console.log("this.Organization[0]",this.Organization[0])
    ////console.log("this.CommonHeader",this.CommonHeader)
  }
  GetClassSubject() {
    this.Loading(true);
    //let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";
    let list: List = new List();
    list.fields = [
      "ClassSubjectId",
      "Active",
      "SubjectId",
      "ClassId",
      "SemesterId",
      "SectionId",
      "RemarkId",
      "SubjectCategoryId",
      "SubjectTypeId",
      "Confidential"
    ];
    list.PageName = "ClassSubjects";
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.ClassSubjects = data.value.map(cs => {
          var _class = '';
          var objclass = this.Classes.filter(c => c.ClassId == cs.ClassId)
          if (objclass.length > 0)
            _class = objclass[0].ClassName;

          var _subject = ''
          var objsubject = this.Subjects.filter(c => c.MasterDataId == cs.SubjectId)
          if (objsubject.length > 0)
            _subject = objsubject[0].MasterDataName;
          var _remark = ''
          if (cs.RemarkId) {
            var objRemark = this.ClassSubjectRemarks.filter(c => c.MasterDataId == cs.RemarkId)
            if (objRemark.length > 0)
              _remark = objRemark[0].MasterDataName;
          }
          var _section = ''
          var objsection = this.Sections.filter(c => c.MasterDataId == cs.SectionId)
          if (objsection.length > 0)
            _section = objsection[0].MasterDataName;
          var _semester = ''
          var objsemester = this.Semesters.filter(c => c.MasterDataId == cs.SemesterId)
          if (objsemester.length > 0)
            _semester = objsemester[0].MasterDataName;

          var _subjectType = '', _selectHowMany = 0;
          var objsubjectType = this.SubjectTypes.filter(c => c.SubjectTypeId == cs.SubjectTypeId)
          if (objsubjectType.length > 0) {
            _subjectType = objsubjectType[0].SubjectTypeName;
            _selectHowMany = objsubjectType[0].SelectHowMany;
          }

          return {
            ClassSubjectId: cs.ClassSubjectId,
            Active: cs.Active,
            SubjectId: cs.SubjectId,
            ClassId: cs.ClassId,
            SectionId: cs.SectionId,
            SemesterId: cs.SemesterId,
            Remark: _remark,
            Confidential: cs.Confidential,
            ClassSubject: _class + '-' + _subject,
            Semester: _semester,
            Section: _section,
            SubjectName: _subject,
            SubjectTypeId: cs.SubjectTypeId,
            SubjectType: _subjectType,
            SelectHowMany: _selectHowMany,
            SubjectCategoryId: cs.SubjectCategoryId
          }
        })
        this.ClassSubjects = this.contentservice.getConfidentialData(this.tokenStorage, this.ClassSubjects, "ClassSubject");
        ////console.log("this.ClassSubjects",this.ClassSubjects.filter(f=>f.ClassSubjectId==1136));
        //this.Loading(false);
        this.GetSubjectComponents();
      })
  }
  // GetExamClassGroup() {
  //   this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg)
  //     .subscribe((data: any) => {
  //       this.ExamClassGroups = [...data.value];
  //     });
  // }
  SelectedStudentClass: any[] = [];
  GetStudents(pClassId, pSemesterId, pSectionId) {
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    // var orgIdSearchstr = this.FilterOrgSubOrgBatchId;
    // orgIdSearchstr += ' and ClassId eq ' + pClassId;
    // orgIdSearchstr += ' and SemesterId eq ' + pSemesterId;
    // orgIdSearchstr += ' and SectionId eq ' + pSectionId;
    // orgIdSearchstr += ' and IsCurrent eq true and Active eq 1';

    // let list: List = new List();
    // list.fields = [
    //   "StudentClassId",
    //   "ClassId",
    //   "SectionId",
    //   "SemesterId",
    //   "StudentId",
    //   "SectionId",
    //   "RollNo"
    // ];
    // list.PageName = "StudentClasses";
    // //list.lookupFields = ["Student($select=Active,FirstName,LastName)"];
    // list.filter = [orgIdSearchstr];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    //     this.SelectedStudentClass = [...data.value];
    this.Students = [];
    var studentList = this.tokenStorage.getStudents()!;
    //var _students = studentList.filter((s: any) => s["Active"] == 1 && data.value.findIndex(fi => fi.StudentId == s["StudentId"]) > -1)
    if (pSemesterId == 0 && pSectionId == 0)
      this.Students = studentList.filter((s: any) => s.StudentClasses
        && s.StudentClasses.length > 0
        && s.StudentClasses[0].ClassId == pClassId)
    else
      this.Students = studentList.filter((s: any) => s.StudentClasses
        && s.StudentClasses.length > 0
        && s.StudentClasses[0].ClassId == pClassId
        && s.StudentClasses[0].SemesterId == pSemesterId
        && s.StudentClasses[0].SectionId == pSectionId)

    // _students.forEach(f => {
    //   var match = _students.filter(stud => stud["StudentId"] == f.StudentId)
    //   f.FirstName = match[0]["FirstName"];
    //   f.LastName = match[0]["LastName"];
    //   this.Students.push(f);
    // })

    //this.Loading(false);
    //})

  }
  Verified() {
    debugger;
    var _classId = this.searchForm.get("searchClassId")?.value;
    if (_classId == 0) {
      this.contentservice.openSnackBar("Class Id is zero.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    if (this.ExamStudentSubjectResult.length == 0 && this.ExamStudentSubjectGrading.length == 0) {
      this.Loading(false); this.PageLoading = false;
      this.contentservice.openSnackBar("No data to verified.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      this.Loading(true);
      var _examId = this.searchForm.get("searchExamId")?.value;
      var _ExamResultProperties = this.ExamNCalculate.filter(e => e.ExamId == _examId)
      if (_ExamResultProperties.filter((f: any) => f.PropertyName.toLowerCase().includes('attendance')).length > 0) {
        this.GetStudentAttendance()
          .subscribe((attendance: any) => {
            this.StudentAttendanceList = [];
            //var classfilteredAttendance = attendance.value.filter(fil => this.SelectedStudentClass.findIndex(fdx => fdx.StudentClassId == fil.StudentClassId) > -1)
            attendance.value.forEach(main => {
              //var cls = this.SelectedStudentClass.filter(studcls => studcls.StudentClassId == att.StudentClassId)
              //if (att.StudentClass.ClassId == _classId) {
              // main.Attendances.forEach(att => {
              this.StudentAttendanceList.push({
                AttendanceId: main.AttendanceId,
                AttendanceStatusId: main.AttendanceStatusId,
                //AttendanceStatus: this.AttendanceStatus.filter((f:any) => f.AttendanceStatusId == main.AttendanceStatusId)[0].MasterDataName,
                AttendanceDate: main.AttendanceDate,
                StudentClassId: main.StudentClassId,
                ClassId: main.ClassId
              });
              //})
            });
            this.ProcessVerify();
          });
      }
      else {
        this.ProcessVerify();
      }
    }
  }
  ProcessVerify() {

    this.VerifiedResult.ExamStudentResult = [];
    var _examId = this.searchForm.get("searchExamId")?.value;
    console.log("_examId",_examId);
    var _TotalDays = 0;
    this.StudentAttendanceList.forEach(f => {
      f.AttendanceDate = moment(f.AttendanceDate).format('YYYY-MM-DD');
    })
    //var objExams = this.Exams.filter(ex => ex.ExamId == _examId);
    var distinctObj = alasql("select distinct AttendanceDate from ?", [this.StudentAttendanceList]);
    if (distinctObj.length > 0) {
      _TotalDays = distinctObj.length;
    }
    ////debugger;
    this.ExamStudentSubjectResult.forEach(d => {
      var _TotalPresent = 0;
      let _presentId = this.AttendanceStatus.filter((f: any) => f.MasterDataName.toLowerCase() == 'present')[0].MasterDataId;
      var attendancelist = this.StudentAttendanceList.filter((f: any) => f.StudentClassId == d["StudentClassId"])
        .filter((f: any) => f.AttendanceStatusId == _presentId);

      _TotalPresent = attendancelist.filter((f: any) => f.AttendanceStatusId == _presentId).length;

      this.AttendanceDisplay = _TotalPresent + "/" + _TotalDays + ""
      if (this.ExamNCalculate.length > 0) {
        var _ExamResultProperties = this.ExamNCalculate.filter(e => e.ExamId == _examId)
        if (_ExamResultProperties.filter((f: any) => f.PropertyName.toLowerCase().includes('rank')).length == 0)
          d["Rank"] = 0;
        if (_ExamResultProperties.filter((f: any) => f.PropertyName.toLowerCase().includes('division')).length == 0)
          d["Division"] = ''
        if (_ExamResultProperties.filter((f: any) => f.PropertyName.toLowerCase().includes('percentage')).length == 0)
          d["Percentage"] = '';
        if (_ExamResultProperties.filter((f: any) => f.PropertyName.toLowerCase().includes('total')).length == 0)
          d["Total"] = '';
        if (_ExamResultProperties.filter((f: any) => f.PropertyName.toLowerCase().includes('attendance')).length == 0)
          this.AttendanceDisplay = '';
        if (_ExamResultProperties.filter((f: any) => f.PropertyName.toLowerCase().includes('class strength')).length == 0)
          this.ClassStrength = '';
      }
      else {
        d["Rank"] = 0;
        d["Division"] = ''
        d["Percentage"] = '';
        d["Total"] = '';
        this.AttendanceDisplay = '';
        this.ClassStrength = '';
      }
      let _totalMarks = 0;
      if (this.FullMarkForAllSubjects100Pc)
        _totalMarks = +d["Total Percent"];
      else
        _totalMarks = +d["Total Marks"];

      this.VerifiedResult.ExamStudentResult.push({
        "ExamStudentResultId": 0,
        "ExamId": this.searchForm.get("searchExamId")?.value,
        "ClassId": this.searchForm.get("searchClassId")?.value,
        "SectionId": this.searchForm.get("searchSectionId")?.value,
        "SemesterId": this.searchForm.get("searchSemesterId")?.value,
        "StudentClassId": d["StudentClassId"],
        "StudentId": d["StudentId"],
        "Rank": d["Rank"],
        "Division": d["Division"],
        "MarkPercent": +d["Percentage"],
        "TotalMarks": _totalMarks,
        "Attendance": this.AttendanceDisplay,
        "ClassStrength": this.ClassStrength,
        "OrgId": this.LoginUserDetail[0]["orgId"],
        "SubOrgId": this.SubOrgId,
        "BatchId": this.SelectedBatchId,
        "ExamStatusId": 0,
        "Active": 1,
        "FailCount": d["FailCount"],
        "PassCount": d["PassCount"]
      });
    })
    console.log("verifiedresult", this.VerifiedResult)
    this.dataservice.postPatch('ExamStudentResults', this.VerifiedResult, 0, 'post')
      .subscribe(
        (data: any) => {
          this.Loading(false);
          this.PageLoading = false;
          this.ClickedVerified = true;
          this.contentservice.openSnackBar("Exam result verified.", globalconstants.ActionText, globalconstants.BlueBackground);
        }, error => {
          ////console.log("error",error);
          this.contentservice.openSnackBar("Something went wrong. Please try again.", globalconstants.ActionText, globalconstants.RedBackground);
          this.Loading(false); this.PageLoading = false;
        })
  }
  GetExamNCalculate() {

    let filterStr = this.FilterOrgSubOrg + " and Active eq true";
    let list: List = new List();
    list.fields = ["*"];

    list.PageName = "ExamNCalculates";
    list.filter = [filterStr];
    this.ExamNCalculate = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(f => {
          var objProperty = this.ExamResultProperties.filter(p => p.MasterDataId == f.CalculateResultPropertyId)
          if (objProperty.length > 0)
            f.PropertyName = objProperty[0].MasterDataName;
          else
            f.PropertyName = '';

          var objExam = this.Exams.filter(e => e.ExamId == f.ExamId);
          if (objExam.length > 0) {
            f.ExamName = objExam[0].ExamName;
            this.ExamNCalculate.push(f);
          }
        })
      })
  }
  Loading(pLoading) {
    this.PageLoading = pLoading;
    this.loading = pLoading;
  }
  ClassName = '';
  SectionName = '';
  SemesterName = '';
  ExamName = '';
  BatchName = '';
  AllSubjectCounts = 0;
  GetStudentSubjects() {
    debugger;
    this.ClickedVerified = false;
    var _examId = this.searchForm.get("searchExamId")?.value;
    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      this.ExamReleased = this.Exams.find((f: any) => f.ExamId == _examId).ReleaseResult;
    }
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.ClassName = this.Classes.filter(c => c.ClassId == _classId)[0].ClassName;
    if (_semesterId)
      this.SemesterName = this.Semesters.filter(se => se.MasterDataId == _semesterId)[0].MasterDataName;
    if (_sectionId)
      this.SectionName = this.Sections.filter(se => se.MasterDataId == _sectionId)[0].MasterDataName;
    this.ExamName = this.Exams.find(se => se.ExamId == _examId).ExamName;
    this.BatchName = this.tokenStorage.getSelectedBatchName()!;
    this.Loading(true);
    this.GetSpecificStudentGrades();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let filterStr = this.FilterOrgSubOrgBatchId;
    filterStr += " and ClassId eq " + _classId;
    if (_semesterId)
      filterStr += " and SemesterId eq " + _semesterId;
    if (_sectionId)
      filterStr += " and SectionId eq " + _sectionId;
    filterStr += " and Active eq 1";
    if (_sectionId > 0) {
      this.SectionSelected = true;


    }

    if (this.SelectedClassCategory == 'college' && _semesterId > 0) {
      this.SectionSelected = true;
    }
    //getting this.students
    this.GetStudents(_classId, _semesterId, _sectionId);

    let list: List = new List();
    list.fields = [
      //"StudentId", "RollNo", "SectionId", "ClassId", "StudentClassId"
      "StudentClassSubjectId,ClassSubjectId,StudentClassId,ClassId,SectionId,SemesterId,Active"
    ];

    list.PageName = "StudentClassSubjects"
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _class = '';
        var _subject = '';
        var _section = '';
        var _semester = '';
        this.StudentSubjects = [];

        data.value.forEach(s => {
          _class = '';
          _subject = '';

          var _activeStudents = this.Students.find(a => a.StudentClasses[0].StudentClassId === s.StudentClassId)
          if (_activeStudents) {
            let _stdClass = this.Classes.find(c => c.ClassId == s.ClassId);
            if (_stdClass) {
              _class = _stdClass.ClassName;
              var _subjectIdObj = this.ClassSubjects.find(p => p.ClassSubjectId == s.ClassSubjectId)
              if (_subjectIdObj) {
                let _stdSubject = this.Subjects.find(c => c.MasterDataId == _subjectIdObj.SubjectId);
                if (_stdSubject) {
                  _subject = _stdSubject.MasterDataName;

                  let _stdSection = this.Sections.find(c => c.MasterDataId == _activeStudents.StudentClasses[0].SectionId);
                  if (_stdSection)
                    _section = _stdSection.MasterDataName;

                  let _stdSemester = this.Semesters.find(c => c.MasterDataId == _activeStudents.StudentClasses[0].SemesterId);
                  if (_stdSemester)
                    _semester = _stdSemester.MasterDataName;

                  this.StudentSubjects.push({
                    StudentClassSubjectId: s.StudentClassSubjectId,
                    ClassSubjectId: _subjectIdObj.ClassSubjectId,
                    StudentClassId: s.StudentClassId,
                    RollNo: _activeStudents.StudentClasses[0].RollNo,
                    SubjectId: _subjectIdObj.SubjectId,
                    Subject: _subject,
                    Section: _section,
                    Semester: _semester,
                    ClassId: s.ClassId,
                    SemesterId: _activeStudents.StudentClasses[0].SemesterId,
                    StudentId: _activeStudents.StudentId,
                    SectionId: _activeStudents.StudentClasses[0].SectionId,
                    SubjectTypeId: _subjectIdObj.SubjectTypeId,
                    SubjectType: _subjectIdObj.SubjectType,
                    Remark: _subjectIdObj.Remark,
                    SelectHowMany: _subjectIdObj.SelectHowMany,
                    SubjectCategoryId: _subjectIdObj.SubjectCategoryId,
                    Active: s.Active
                  });
                }
              }
            }
          }
          //})
        });

        ////console.log("this.StudentSubjects",this.StudentSubjects)
        this.GetExamStudentSubjectResults(_examId, _classId, _sectionId, _semesterId);
        this.ClassStrength = this.Students.length + "";
      }, error => {
        console.log(error);
      });
  }
  ExportArray() {
    debugger
    if (this.ExamStudentSubjectResult.length > 0) {
      let gradingmarks: any = [];
      let templaterow = this.ExamStudentSubjectResult[0];
      this.ExamStudentSubjectGrading.forEach((gradingitem) => {
        let newItem = {
          StudentClassId: gradingitem.StudentClassId,
          StudentId: gradingitem.StudentId,
          Student: gradingitem.Student
        }
        Object.keys(templaterow).forEach((col, indx) => {
          if (indx > 2) {

            Object.keys(gradingitem).forEach((eleCol, grIndix) => {
              if (grIndix == indx) {
                newItem[col] = gradingitem[eleCol];
              }

            })
          }

        })
        gradingmarks.push(newItem);
      })
      let toExport = this.ExamStudentSubjectResult.concat(gradingmarks);
      const datatoExport: Partial<any>[] = toExport;
      TableUtil.exportArrayToExcel(datatoExport, this.ExamName);
    }
  }
  TotalMarkingSubjectFullMark = 0;
  GetExamStudentSubjectResults(pExamId, pClassId, pSectionId, pSemesterId) {
    this.ClickedVerified = false;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.ExamStudentSubjectResult = [];
    this.ExamStudentSubjectGrading = [];
    var _examId = this.searchForm.get("searchExamId")?.value;
    var orgIdSearchstr = this.FilterOrgSubOrgBatchId;
    var filterstr = " and ExamId eq " + pExamId;
    filterstr += " and ClassId eq " + pClassId;
    if (pSemesterId)
      filterstr += " and SemesterId eq " + pSemesterId;
    if (pSectionId)
      filterstr += " and SectionId eq " + pSectionId;
    filterstr += " and Active eq 1";

    let list: List = new List();
    list.fields = [
      "ExamStudentSubjectResultId",
      "ExamId",
      "StudentClassSubjectId",
      "ClassSubjectMarkComponentId",
      "Marks",
      "ExamStatus",
      "Active"
    ];
    list.PageName = "ExamStudentSubjectResults";
    list.filter = [orgIdSearchstr + filterstr];
    //list.orderBy = "ParentId";
    this.displayedColumns = [
      'Student'
    ];
    this.GradingDisplayedColumns = [
      'Student'
    ];
    this.dataservice.get(list)
      .subscribe((examComponentResult: any) => {
        debugger;
        //var result = examComponentResult.value.filter(x => x.StudentClassSubjectId == 40592);
        var StudentOwnSubjects: any[] = [];
        this.AllSubjectCounts = 0;
        let SelectHowManyOfElective = 0;
        //1. Select student's subjects
        //2. Select all components for the selected class semester section subject mark components
        //3. Get all existing or entered component mark from no. 2
        //4. Get All individual students of the select class, semester, section.
        //5. Loop through individual students
        // Loop through subjects of each student
        ///Loop through each subject Component With Passmark greater than Zero to decide pass or failed.
        // loop through each subject Components
        if (pSemesterId == 0 && pSectionId == 0)
          StudentOwnSubjects = this.StudentSubjects.filter(studentsubject => {
            return studentsubject.ClassId == pClassId
              && studentsubject.SelectHowMany > 0;
          });
        else
          StudentOwnSubjects = this.StudentSubjects.filter(studentsubject => {
            return studentsubject.ClassId == pClassId
              && studentsubject.SectionId == pSectionId
              && studentsubject.SemesterId == pSemesterId
              && studentsubject.SelectHowMany > 0;
          });

        var _ClsSectionSemSubjectsMarkCompntDefn: any[] = [];

        _ClsSectionSemSubjectsMarkCompntDefn = this.ClassSubjectComponents.filter(c =>
          c.ClassId == pClassId
            && c.ExamId == pExamId
            && c.SectionId == pSectionId ? pSectionId : c.SectionId
              && c.SemesterId == pSemesterId ? pSemesterId : c.SemesterId);
        if (_ClsSectionSemSubjectsMarkCompntDefn.length == 0) {
          _ClsSectionSemSubjectsMarkCompntDefn = this.ClassSubjectComponents.filter(c =>
            c.ClassId == pClassId
            && c.ExamId == pExamId);
        }


        let objAllMarking = _ClsSectionSemSubjectsMarkCompntDefn.filter(de => de.SubjectCategory == 'Marking');

        let HowManyObj = objAllMarking.filter(o => o.SubjectType.toLowerCase() == 'elective');
        if (HowManyObj.length > 0)
          SelectHowManyOfElective = HowManyObj[0].SelectHowMany;

        let objAllCompulsory = objAllMarking.filter(de => de.SubjectType.toLowerCase() === 'compulsory');

        this.TotalMarkingSubjectFullMark = 0;
        //console.log("objAllComp", objAllCompulsory);
        if (objAllCompulsory.length > 0) {
          let distinctStr = "select distinct SubjectTypeId,SelectHowMany,FullMark,SubjectType from ? where SubjectType != 'Compulsory'";
          let distinctSubjectTypesWithoutCompulsory = alasql(distinctStr, [objAllMarking]);

          this.TotalMarkingSubjectFullMark = objAllCompulsory.reduce((acc, current) => acc + current.FullMark, 0);
          distinctSubjectTypesWithoutCompulsory.forEach(item => {
            this.TotalMarkingSubjectFullMark += item.SelectHowMany * item.FullMark;
          })
        }
        var AllComponentsMarkObtained: any[] = [];

        examComponentResult.value.forEach(d => {
          var present = _ClsSectionSemSubjectsMarkCompntDefn.filter((f: any) => f.ClassSubjectMarkComponentId == d.ClassSubjectMarkComponentId)
          if (present.length > 0)
            AllComponentsMarkObtained.push(d);
        })
        this.FullMarkForAllSubjects100Pc = 0;
        var ForGrading, ForNonGrading;

        StudentOwnSubjects.forEach(f => {
          var stud = this.Students.filter((s: any) => s.StudentClasses[0].StudentClassId == f.StudentClassId);
          if (stud.length > 0) {
            var _lastname = stud[0].LastName == null ? '' : " " + stud[0].LastName;
            f.Student = stud[0].StudentClasses[0].RollNo + "-" + stud[0].FirstName + _lastname + "-" + f.Section;
            f.StudentId = stud[0].StudentId;
          }
        })
        //debugger;
        var filteredIndividualStud = alasql("select distinct Student,StudentId,StudentClassId,FullMark from ? ", [StudentOwnSubjects]);
        var _subjectCategoryName = '';
        this.VerifiedResult.ExamResultSubjectMark = [];
        var errormessageforEachSubject: any[] = [];
        //var viewMarkPercent = this.searchForm.get("viewMarkPercentCheckBox")?.value;

        /////////
        let compulsorySubjectCount = 0;
        let _subjectCategoryMarkingId = 0;
        let _markingId = this.SubjectCategory.find((f: any) => f.MasterDataName.toLowerCase() == 'marking').MasterDataId;
        let _SelectedClassStudentGrades = this.SelectedClassStudentGrades.filter((f: any) => f.SubjectCategoryId == _markingId);
        let _ToCalculateRankAndPercentage = _SelectedClassStudentGrades.reduce((filtered, option: any) => {
          if (option.AssignRank) {
            let _gname = option.GradeName.toLowerCase();
            filtered.push(_gname);
          }
          return filtered;
        }, []);
        var _objSubjectCat = this.SubjectCategory.find((f: any) => f.MasterDataName.toLowerCase() == 'marking')
        if (_objSubjectCat)
          _subjectCategoryMarkingId = _objSubjectCat.MasterDataId;
        // var _noOfSubjectForAStudent = this.ClassSubjects.filter(allsubj => allsubj.SubjectCategoryId == _subjectCategoryMarkingId
        //   && allsubj.ClassId == pClassId)

        let clssubj = globalconstants.getFilteredClassSubjects(this.ClassSubjects, pClassId, pSectionId, pSemesterId);
        var _noOfMarkingSubjectForAStudent = clssubj.filter(allsubj => allsubj.SubjectCategoryId == _subjectCategoryMarkingId);
        var AllMarkingSubjectCounts = alasql("select SubjectTypeId,SubjectType,SelectHowMany from ? ", [_noOfMarkingSubjectForAStudent]);
        compulsorySubjectCount = AllMarkingSubjectCounts.filter(com => com.SubjectType.toLowerCase() == 'compulsory').length;
        //var OtherthanCompulsory= SubjectCounts.filter(com=>com.SubjectType.toLowerCase() !='compulsory');
        var notCompulsorySubjectType = this.SubjectTypes.filter((s: any) => s.SubjectTypeName.toLowerCase() != 'compulsory');
        var subjectsWithNotCompulsory = AllMarkingSubjectCounts.filter(com => com.SubjectType.toLowerCase() != 'compulsory'
          && com.SubjectType.toLowerCase() != 'optional');
        var uniqueTypesOtherthanCompulsoryType = alasql("select distinct SubjectTypeId,SubjectType,SelectHowMany from ?", [subjectsWithNotCompulsory]);
        //console.log("subjectsWithNotCompulsory", subjectsWithNotCompulsory)
        subjectsWithNotCompulsory = uniqueTypesOtherthanCompulsoryType.filter(sub => notCompulsorySubjectType.findIndex(fi => fi.SubjectTypeId == sub.SubjectTypeId) > -1);
        this.AllSubjectCounts = compulsorySubjectCount + subjectsWithNotCompulsory.reduce((acc, current) => acc + current.SelectHowMany, 0);

        //console.log("_noOfSubjectForAStudent", allSubjectCounts)
        let classGroupObj = this.ClassGroupMapping.filter(g => g.ClassId == pClassId);
        let MarkConvertTo = 0;
        if (classGroupObj.length > 0) {
          let markConvertToObj = this.ExamClassGroups.filter(m => m.ExamId == _examId && classGroupObj.findIndex(n => n.ClassGroupId == m.ClassGroupId) > -1);
          if (markConvertToObj.length > 0) {
            MarkConvertTo = markConvertToObj[0].MarkConvertTo;
            this.FullMarkForAllSubjects100Pc = this.AllSubjectCounts * MarkConvertTo;
          }
          else
            this.FullMarkForAllSubjects100Pc = 0;
        }
        ////////  

        //for each student
        filteredIndividualStud.forEach(ss => {
          let _totalPercent = 0

          //intial columns
          ForGrading = {
            "StudentClassId": ss.StudentClassId,
            "Student": ss.Student,
            "Grade": 0
          }
          ForNonGrading = {
            "StudentClassId": ss.StudentClassId,
            "StudentId": ss.StudentId,
            "Student": ss.Student,
            "Total Marks": 0,
            "Total Percent": 0,
            "Rank": 0,
            "Grade": 0,
            "Division": '',
            "FailCount": 0,
            "PassCount": 0,
            "FullMark": 0
          }

          var forEachSubjectOfStud = this.StudentSubjects.filter((s: any) => s.Student == ss.Student)
          // forEachSubjectOfStud.forEach(t=>{
          //   if(t.SubjectType.toLowerCase()=='elective')
          //   {
          //     t.SubjectType = "zelective";
          //   }
          // })
          forEachSubjectOfStud = forEachSubjectOfStud.sort((a, b) => a.SubjectType.localeCompare(b.SubjectType)); //a.ClassSubjectId - b.ClassSubjectId);// 
          let ElectivePassed = 0;
          forEachSubjectOfStud.forEach((eachsubj, subjIndx) => {
            var markPercent = 0;
            ForNonGrading["Remark"] = eachsubj.Remark;
            // if (ss.Student == '21-Niangliankim -A') {
            //   debugger;
            //   //console.log("eachsubj.Subject", eachsubj.Subject);
            // }
            var _objSubjectCategory = this.SubjectCategory.find((f: any) => f.MasterDataId === eachsubj.SubjectCategoryId)
            if (_objSubjectCategory)
              _subjectCategoryName = _objSubjectCategory.MasterDataName.toLowerCase();

            var markObtained = alasql("select ExamId,StudentClassSubjectId,SUM(Marks) as Marks FROM ? where StudentClassSubjectId = ? GROUP BY StudentClassSubjectId,ExamId",
              [AllComponentsMarkObtained, eachsubj.StudentClassSubjectId]);
            var _subjectPassMarkFullMarkFromDefn = alasql("select ClassSubjectId,SUM(PassMark) as PassMark,SUM(FullMark) as FullMark,SUM(OverallPassMark) as OverallPassMark FROM ? where ClassSubjectId = ? GROUP BY ClassSubjectId",
              [_ClsSectionSemSubjectsMarkCompntDefn, eachsubj.ClassSubjectId]);
            if (_subjectPassMarkFullMarkFromDefn.length == 0) {
              if (!errormessageforEachSubject.includes(eachsubj.Subject))
                errormessageforEachSubject.push(eachsubj.Subject) //+= "\nComponent not defined for the subject: " + eachsubj.Subject;
              //this.contentservice.openSnackBar("Component not defined for the subject: " + eachsubj.Subject, globalconstants.ActionText, globalconstants.RedBackground);
              return;
            }
            else {
              // if (eachsubj.Student == '21-Niangliankim -A' && eachsubj.Subject.toLowerCase() == 'commerce') {
              //   debugger;
              // }
              let failedInComponent = false;

              ///////////////deciding pass or failed.
              var subjectEachComponentPassmarkGreaterthanZero = _ClsSectionSemSubjectsMarkCompntDefn.filter(comp => comp.PassMark > 0
                && comp.ClassSubjectId == eachsubj.ClassSubjectId)
              subjectEachComponentPassmarkGreaterthanZero.forEach(compmarkDefn => {
                let currentComponentobtainedmark = AllComponentsMarkObtained.find(eres => eres.StudentClassSubjectId == eachsubj.StudentClassSubjectId
                  && eres.ClassSubjectMarkComponentId == compmarkDefn.ClassSubjectMarkComponentId)
                //var componentPercent = (compmarkobtained.FullMark / _subjectPassMarkFullMark[0].FullMark) * 100;
                //markPercent += (componentobtainedmark[0].Marks / compmarkobtained.FullMark) * componentPercent;
                if (currentComponentobtainedmark) {
                  if (!failedInComponent && currentComponentobtainedmark.Marks < compmarkDefn.PassMark) {

                    //but if its subject type is eletive and already passed in other elective subject
                    //then it is not a fail.
                    if (eachsubj.SubjectType.toLowerCase() == 'elective' && ElectivePassed === SelectHowManyOfElective)
                      failedInComponent = false;
                    else
                      failedInComponent = true;

                  }
                  // else {
                  //   if (eachsubj.SubjectType.toLowerCase() == 'elective')
                  //     ElectivePassed += 1;
                  // }
                }
                else {
                  if (eachsubj.SubjectType.toLowerCase() === 'elective' && ElectivePassed === SelectHowManyOfElective)
                    failedInComponent = true;
                  else if (eachsubj.SubjectType.toLowerCase() !== 'elective')
                    failedInComponent = true;

                }

              })
              //counting no. of pass subjects of elective
              if (subjectEachComponentPassmarkGreaterthanZero.length > 0) {
                if (eachsubj.SubjectType.toLowerCase() === 'elective' && !failedInComponent)
                  ElectivePassed += 1;
              }
              //////////////end of deciding pass or faild.

              ////////////Converting mark to 100
              var allComponentsOfCurrentSubjectFromDefn = _ClsSectionSemSubjectsMarkCompntDefn.filter(comp => comp.ClassSubjectId == eachsubj.ClassSubjectId)
              //let totalFullMarkOfAllComp = alasql("select sum(FullMark) TotalFullMark from ?", [allComponentsOfCurrentSubjectFromDefn]);
              let totalFullMarkOfAllComp = allComponentsOfCurrentSubjectFromDefn.reduce((acc, current) => acc + (current.FullMark ? current.FullMark : 0), 0);
              if (totalFullMarkOfAllComp > 0 && _subjectCategoryName == 'marking') {

                allComponentsOfCurrentSubjectFromDefn.forEach(thisCompmarkFromDefn => {

                  let thisCompWeightage = +((thisCompmarkFromDefn.FullMark / totalFullMarkOfAllComp) * MarkConvertTo).toFixed(5);

                  let componentObtainedmark = AllComponentsMarkObtained.filter(eres => eres.StudentClassSubjectId == eachsubj.StudentClassSubjectId
                    && eres.ClassSubjectMarkComponentId == thisCompmarkFromDefn.ClassSubjectMarkComponentId)

                  if (componentObtainedmark.length > 0 && componentObtainedmark[0].Marks > 0) {
                    markPercent += +((componentObtainedmark[0].Marks / thisCompmarkFromDefn.FullMark) * thisCompWeightage).toFixed(5);
                  }
                  else {
                    markPercent = 0;
                  }
                  if (isNaN(markPercent))
                    markPercent = 0;

                  ////////////////////added for component mark display
                  if (allComponentsOfCurrentSubjectFromDefn.length > 1) {
                    if (thisCompmarkFromDefn.SubjectComponentName && this.displayedColumns.indexOf(thisCompmarkFromDefn.SubjectComponentName + "-" + eachsubj.Subject) == -1) {
                      this.displayedColumns.push(thisCompmarkFromDefn.SubjectComponentName + "-" + eachsubj.Subject);
                    }
                    if (componentObtainedmark.length > 0)
                      ForNonGrading[thisCompmarkFromDefn.SubjectComponentName + "-" + eachsubj.Subject] = componentObtainedmark[0].Marks;
                    else
                      ForNonGrading[thisCompmarkFromDefn.SubjectComponentName + "-" + eachsubj.Subject] = 0;
                  }
                  /////////////////////
                })
              }
              ////////////end of Converting mark to 100

              ////console.log("markPercent",markPercent);
              var _statusFail = true;
              var ExamResultSubjectMarkData = {
                ExamResultSubjectMarkId: 0,
                StudentClassId: 0,
                ClassId: 0,
                SectionId: 0,
                SemesterId: 0,
                ExamId: 0,
                StudentClassSubjectId: 0,
                Marks: 0,
                ActualMarks: 0,
                Grade: '',
                OrgId: 0, SubOrgId: 0,
                Active: 0,
                BatchId: 0
              }
              if (markObtained.length > 0) {

                ExamResultSubjectMarkData.Active = 1;
                ExamResultSubjectMarkData.BatchId = this.SelectedBatchId;
                ExamResultSubjectMarkData.ExamId = markObtained[0].ExamId;
                ExamResultSubjectMarkData.ExamResultSubjectMarkId = 0;
                ExamResultSubjectMarkData.Marks = markObtained[0].Marks;
                ExamResultSubjectMarkData.ActualMarks = markObtained[0].Marks;
                ExamResultSubjectMarkData.OrgId = this.LoginUserDetail[0]['orgId'];
                ExamResultSubjectMarkData.SubOrgId = this.SubOrgId;
                ExamResultSubjectMarkData.StudentClassId = ss.StudentClassId;
                ExamResultSubjectMarkData.ClassId = pClassId;
                ExamResultSubjectMarkData.SectionId = pSectionId;
                ExamResultSubjectMarkData.SemesterId = pSemesterId;
                ExamResultSubjectMarkData.StudentClassSubjectId = eachsubj.StudentClassSubjectId;
                ExamResultSubjectMarkData.Grade = '';

                if (_subjectCategoryName == 'grading') {

                  if (markObtained[0].Marks) {
                    //var rows :any[]= [];
                    //rows.push(markObtained[0]);

                    var _grade = this.SetGrade(markObtained, eachsubj.SubjectCategoryId, MarkConvertTo, totalFullMarkOfAllComp);
                    markObtained[0].Grade = globalconstants.decodeSpecialChars(_grade);
                    ForGrading[eachsubj.Subject] = markObtained[0].Grade;
                    ExamResultSubjectMarkData.Grade = markObtained[0].Grade;
                  }
                  else
                    ForGrading[eachsubj.Subject] = '';

                  if (this.GradingDisplayedColumns.indexOf(eachsubj.Subject) === -1 && eachsubj.Subject.length > 0)
                    this.GradingDisplayedColumns.push(eachsubj.Subject)
                }
                else if (_subjectCategoryName == 'marking') {
                  //sumOfAllFullMark += totalFullMarkOfAllComp;
                  if (!failedInComponent)//if passed in all components;
                  {
                    if (markObtained[0].Marks < _subjectPassMarkFullMarkFromDefn[0].OverallPassMark) {//failed
                      _statusFail = true;
                    }
                    else {//passed
                      if (eachsubj.SubjectType.toLowerCase() === 'elective')
                        ElectivePassed += 1;
                      _statusFail = false;
                    }
                    if (_statusFail && eachsubj.SubjectType.toLowerCase() === 'elective') {
                      if (ElectivePassed === SelectHowManyOfElective)
                        _statusFail = false;
                      if (subjIndx < forEachSubjectOfStud.length - 1)//have not gone through all the subjects
                      {
                        _statusFail = false;
                      }
                    }
                  }
                  //_statusFail = ((markObtained[0].Marks * 100) / _subjectPassMarkFullMark[0].FullMark) < _subjectPassMarkFullMark[0].OverallPassMark
                  if (this.FullMarkForAllSubjects100Pc)
                    ForNonGrading["FullMark"] = this.FullMarkForAllSubjects100Pc;
                  else
                    ForNonGrading["FullMark"] = this.TotalMarkingSubjectFullMark;

                  if (failedInComponent || _statusFail) {
                    ForNonGrading["FailCount"] += 1;
                  }
                  else
                    ForNonGrading["PassCount"] += 1;
                  // if (eachsubj.Subject == 'Geography') {
                  //   debugger;
                  // }
                  if (this.displayedColumns.indexOf(eachsubj.Subject) == -1 && eachsubj.Subject.length > 0)
                    this.displayedColumns.push(eachsubj.Subject)
                  if (markObtained.length > 0) {
                    //var markConvertedto100Percent = '', 
                    var _processedmark = '';
                    // if (markObtained[0].Marks > 0)
                    //   markConvertedto100Percent = ((markObtained[0].Marks * 100) / _subjectPassMarkFullMark[0].FullMark).toFixed(2);
                    // if (viewMarkPercent) {
                    //   _processedmark = markPercent + "";
                    // }
                    // else
                    _processedmark = markObtained[0].Marks ? markObtained[0].Marks : '-';
                    if ((failedInComponent || _statusFail) && markObtained[0].Marks) {
                      _processedmark = "(" + _processedmark + ")";
                    }


                    ForNonGrading[eachsubj.Subject] = _processedmark;// (failedInComponent || _statusFail) ? "(" + _processedmark + ")" : _processedmark;
                    ForNonGrading["Total Marks"] = (parseFloat(ForNonGrading["Total Marks"]) + parseFloat(markObtained[0].Marks));//.toFixed(2);
                    _totalPercent = (parseFloat(ForNonGrading["Total Percent"]) + markPercent)
                    // if (ss.Student == '22-Pauthianmung Hanghal -A')
                    //   console.log("before tofixed(2)", _totalPercent);
                    ForNonGrading["Total Percent"] = +(_totalPercent);//.toFixed(2);
                  }
                }
              }
              else {
                ExamResultSubjectMarkData.Active = 1;
                ExamResultSubjectMarkData.BatchId = this.SelectedBatchId;
                ExamResultSubjectMarkData.ExamId = pExamId;
                ExamResultSubjectMarkData.ExamResultSubjectMarkId = 0;
                ExamResultSubjectMarkData.Marks = 0;
                ExamResultSubjectMarkData.ActualMarks = 0;
                ExamResultSubjectMarkData.OrgId = this.LoginUserDetail[0]['orgId'];
                ExamResultSubjectMarkData.SubOrgId = this.SubOrgId;
                ExamResultSubjectMarkData.StudentClassId = ss.StudentClassId;
                ExamResultSubjectMarkData.ClassId = pClassId;
                ExamResultSubjectMarkData.SectionId = pSectionId;
                ExamResultSubjectMarkData.SemesterId = pSemesterId;
                ExamResultSubjectMarkData.StudentClassSubjectId = eachsubj.StudentClassSubjectId;
                ExamResultSubjectMarkData.Grade = '';
                ForNonGrading[eachsubj.Subject] = '';
                ForNonGrading["Total Marks"] = ForNonGrading["Total Marks"] ? ForNonGrading["Total Marks"] : 0;
                ForNonGrading["Total Percent"] = ForNonGrading["Total Percent"] ? ForNonGrading["Total Percent"] : 0;

                if (this.displayedColumns.indexOf(eachsubj.Subject) === -1 && _subjectCategoryName === 'marking') {
                  this.displayedColumns.push(eachsubj.Subject);
                }
                if (this.GradingDisplayedColumns.indexOf(eachsubj.Subject) === -1 && _subjectCategoryName === 'grading') {
                  this.GradingDisplayedColumns.push(eachsubj.Subject)
                }
              }
              //preparing each subject for insert.
              if (ExamResultSubjectMarkData)
                this.VerifiedResult.ExamResultSubjectMark.push(JSON.parse(JSON.stringify(ExamResultSubjectMarkData)))
            }
            // if (ss.Student == '22-Pauthianmung Hanghal -A') {
            //   console.log("//markPercent", markPercent)
            //   console.log("eachsubj.Subject", eachsubj.Subject + "//")
            // }
          })//for each subject of student.

          if (errormessageforEachSubject.length == 0) {
            //   this.contentservice.openSnackBar(errormessageforEachSubject, globalconstants.ActionText, globalconstants.RedBackground);
            // }
            // else {
            //for each subject display 
            ForNonGrading["Total Percent"] = ForNonGrading["Total Percent"].toFixed(2);
            ForNonGrading["Total Marks"] = ForNonGrading["Total Marks"].toFixed(2);
            this.ExamStudentSubjectResult.push(ForNonGrading);
            this.ExamStudentSubjectGrading.push(ForGrading);
          }
        })//for each student;

        if (errormessageforEachSubject.length > 0) {
          //var distinctsubjecterror = alasql("select ")
          this.Loading(false);
          this.contentservice.openSnackBar("Subject component not defined for " + errormessageforEachSubject.join(', '), globalconstants.ActionText, globalconstants.RedBackground);
          return;
        }
        //for each student
        if (this.ExamStudentSubjectResult.length > 0) {
          //if (_subjectCategoryName == 'marking') {

          if (this.FullMarkForAllSubjects100Pc)
            this.displayedColumns.push("Total Marks", "Total Percent", "Percentage", "Rank", "Division");
          else
            this.displayedColumns.push("Total Marks", "Percentage", "Rank", "Division");



          if (_SelectedClassStudentGrades.length > 0) {
            _SelectedClassStudentGrades.sort((a, b) => a.Sequence - b.Sequence);
            var rankCount = 0;
            var previousTotal = 0;

            this.ExamStudentSubjectResult.forEach((result: any, index) => {

              if (this.FullMarkForAllSubjects100Pc)
                result["Percentage"] = ((result["Total Percent"] / this.FullMarkForAllSubjects100Pc) * 100).toFixed(2);
              else {
                result["Percentage"] = ((result["Total Marks"] / this.TotalMarkingSubjectFullMark) * 100).toFixed(2);
              }

              for (var i = 0; i < _SelectedClassStudentGrades.length; i++) {
                var formula = _SelectedClassStudentGrades[i].Formula
                  .replaceAll("[TMO]", result["Total Marks"])
                  .replaceAll("[Percentage]", result["Percentage"])
                  .replaceAll("[TFM]", result.FullMark)
                  .replaceAll("[Remark]", result.Remark)
                  .replaceAll("[PassCount]", result.PassCount)
                  .replaceAll("[FailCount]", result.FailCount);

                if (evaluate(formula)) {
                  //if (r.FailCount == 0) {
                  result.Grade = _SelectedClassStudentGrades[i].StudentGradeId;
                  result.Division = _SelectedClassStudentGrades[i].GradeName;
                  break;
                  //}
                }
              }


            })
            //const _notToCalculateRankAndPercentage
            this.ExamStudentSubjectResult = this.ExamStudentSubjectResult.sort((a: any, b: any) => b["Percentage"] - a["Percentage"]);
            this.ExamStudentSubjectResult.forEach((result: any, index) => {
              if (_ToCalculateRankAndPercentage.includes(result.Division.toLowerCase())) {
                //result["Percentage"] = ((result.Total / this.ClassFullMark[0].FullMark) * 100).toFixed(2);
                if (previousTotal != result["Percentage"] && result["Percentage"] > 0) {
                  rankCount += 1;
                  result.Rank = rankCount;
                }
                else if (previousTotal == result["Percentage"] && result["Percentage"] > 0) {
                  result.Rank = rankCount;
                }
                else if (result["Percentage"] == 0)
                  result.Rank = 0;
                previousTotal = result["Percentage"]
              }
            });
          }
          else {
            this.contentservice.openSnackBar("Student grade for marking not defined.", globalconstants.ActionText, globalconstants.RedBackground);

          }
          //this.ExamStudentSubjectResult = this.ExamStudentSubjectResult.filter((f: any) => f["Total Percent"] > 0);
          this.ExamStudentSubjectResult.sort((a, b) => a.Rank - b.Rank)
        }

        if (this.ExamStudentSubjectResult.length == 0 || this.displayedColumns.length < 2) {
          this.ExamStudentSubjectResult = [];
        }
        if (this.GradingDisplayedColumns.length == 1)
          this.ExamStudentSubjectGrading = [];
        if (this.ExamStudentSubjectResult.length == 0 && this.ExamStudentSubjectGrading.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }

        ////console.log("this.ExamStudentSubjectResult", this.ExamStudentSubjectResult)
        var sortedresult = this.ExamStudentSubjectResult.filter((f: any) => f.Rank != 0);
        var rankzero = this.ExamStudentSubjectResult.filter((f: any) => f.Rank == 0);
        rankzero.forEach(zerorank => {
          sortedresult.push(zerorank);
        })
        this.ExamStudentSubjectResult = JSON.parse(JSON.stringify(sortedresult));
        let _rank, lastDigit;
        sortedresult.forEach(item => {
          _rank = item.Rank + "";
          lastDigit = _rank.substring(_rank.length - 1)
          switch (lastDigit) {
            case "0":
              if (_rank == "0")
                _rank = ""
              else
                _rank = _rank + "th"
              break;
            case "1":
              if (_rank == "11")
                _rank = _rank + "th"
              else
                _rank = _rank + "st"
              break;
            case "2":
              if (_rank == "12")
                _rank = _rank + "th"
              else
                _rank = _rank + "nd"
              break;
            case "3":
              if (_rank == "13")
                _rank = _rank + "th"
              else
                _rank = _rank + "rd"
              break;
            default:
              _rank = _rank + "th"
              break;
          }
          item.Rank = _rank;
        })
        //this.ExamStudentSubjectResult =sortedresult;
        this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>(sortedresult);
        this.dataSource.paginator = this.paginator.toArray()[0];
        this.dataSource.sort = this.sort.toArray()[0];


        // this.dataSource.paginator = this.nonGradingPaginator;//.toArray()[0];
        // this.dataSource.sort = this.nonGradingSort;
        //this.dataSource.sort = this.sort.toArray()[0];
        ////console.log("this.ExamStudentSubjectResult",this.ExamStudentSubjectResult);
        ////console.log("columns",this.displayedColumns);

        this.GradingDataSource = new MatTableDataSource<any[]>(this.ExamStudentSubjectGrading);
        this.GradingDataSource.paginator = this.paginator.toArray()[1];
        this.GradingDataSource.sort = this.sort.toArray()[1];
        //this.GradingDataSource.paginator = this.paginator.toArray()[1];
        //this.GradingDataSource.sort = this.sort.toArray()[1];

        this.Loading(false);
        this.PageLoading = false;
        ////console.log("ClickedVerified",this.ClickedVerified)
        ////console.log("SectionSelected",this.SectionSelected)
        ////console.log("this.ExamReleased",this.ExamReleased)
      })
    //})
  }
  GetRank(pSortedresult) {
    let _rank, lastDigit;
    pSortedresult.forEach(item => {
      _rank = item.Rank + "";
      lastDigit = _rank.substring(_rank.length - 1)
      switch (lastDigit) {
        case "1":
          if (_rank == "11")
            _rank = _rank + "th"
          else
            _rank = _rank + "st"
          break;
        case "2":
          if (_rank == "12")
            _rank = _rank + "th"
          else
            _rank = _rank + "nd"
          break;
        case "3":
          _rank = _rank + "rd"
          break;
        default:
          _rank = _rank + "th"
          break;
      }
      item.Rank = _rank;
    })
  }
  SetGrade(pMarks: any[], gradingTypeId, _markConvertTo, _totalFullMark) {
    var _StudentGrade = '';
    var _gradeDefinitionsForSpecificSubjectCategory = this.SelectedClassStudentGrades.filter((f: any) => f.SubjectCategoryId == gradingTypeId)
    if (_gradeDefinitionsForSpecificSubjectCategory.length > 0) {
      _gradeDefinitionsForSpecificSubjectCategory.sort((a, b) => a.Sequence - b.Sequence);
      pMarks.forEach((result: any) => {
        for (var i = 0; i < _gradeDefinitionsForSpecificSubjectCategory.length; i++) {
          if (_markConvertTo > 0)
            result.Marks = +((result.Marks / _totalFullMark) * _markConvertTo).toFixed(2)
          var formula = _gradeDefinitionsForSpecificSubjectCategory[i].Formula
            .replaceAll("[Mark]", result.Marks)
          if (evaluate(formula)) {
            _StudentGrade = _gradeDefinitionsForSpecificSubjectCategory[i].GradeName;
            break;
          }
        }
      })
    }
    return _StudentGrade;
  }
  ClassSubjectRemarks: any = [];
  ClassCategory: any[] = [];
  GetMasterData() {
    this.Loading(true);
    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.ClassSubjectRemarks = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSSUBJECTREMARK);
    this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
    this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.AttendanceModes = this.getDropDownData(globalconstants.MasterDefinitions.school.ATTENDANCEMODE);
    this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY);
    this.ExamResultProperties = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMnCalculate);
    this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions.common.ATTENDANCESTATUS);
    this.CommonHeader = this.getDropDownData(globalconstants.MasterDefinitions.common.COMMONPRINTHEADING);

    this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
      this.Classes = data.value.map(m => {
        let obj = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId);
        if (obj.length > 0)
          m.Category = obj[0].MasterDataName.toLowerCase();
        else
          m.Category = '';
        return m;
      })
      this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
      this.GetSubjectTypes();
    });
    let funcCallArray = [this.GetClassGroup(), this.GetClassGroupMapping(), this.GetExams(), this.GetOrganization(), this.GetStudentGradeDefn()];
    forkJoin(funcCallArray)
      .subscribe((data: any) => {
        this.Loading(false);
      })

    //this.Loading(false);
    //this.PageLoading = false;
  }
  GetClassGroup() {
    this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      })
  }
  ClassGroupMapping: any[] = [];
  GetClassGroupMapping() {
    this.contentservice.GetClassGroupMapping(this.FilterOrgSubOrg, 1)
      .subscribe((data: any) => {
        //debugger;
        data.value.forEach(f => {
          f.ClassName = f.Class.ClassName;
          f.Sequence = f.Class.Sequence;
          if (f.ClassGroup) {
            f.GroupName = f.ClassGroup.GroupName;
            this.ClassGroupMapping.push(f);
          }

        });
      })
  }
  GetStudentGradeDefn() {
    //var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetStudentGrade(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        this.StudentGrades = [...data.value];
      })
  }

  GetStudentGradeDefn_old(classgroupmapping) {
    var orgIdSearchstr = this.FilterOrgSubOrg + " and Active eq 1";
    //batch wise not necessary
    //+ ' and BatchId eq ' + this.SelectedBatchId;
    let list: List = new List();

    list.fields = ["StudentGradeId,GradeName,ClassGroupId,SubjectCategoryId,Formula,Sequence"];
    list.PageName = "StudentGrades";
    list.filter = [orgIdSearchstr];
    this.StudentGrades = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        classgroupmapping.forEach(f => {
          var mapped = data.value.filter(d => d.ClassGroupId == f.ClassGroupId)
          var _grades: any[] = [];
          mapped.forEach(m => {
            _grades.push(
              {
                StudentGradeId: m.StudentGradeId,
                GradeName: m.GradeName,
                SubjectCategoryId: m.SubjectCategoryId,
                Formula: m.Formula,
                ClassGroupId: m.ClassGroupId,
                Sequence: m.Sequence
              })
          })
          f.grades = _grades.sort((a, b) => a.Sequence - b.Sequence);
          this.StudentGrades.push(f);
        })
      })
  }
  SelectedClassCategory = '';
  GetStudentGrade() {
    debugger;
    var _classId = this.searchForm.get("searchClassId")?.value;
    // var _sectionId = this.searchForm.get("searchSectionId")?.value;
    // var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    if (_classId > 0) {
      let obj = this.Classes.filter(c => c.ClassId == _classId);
      if (obj.length > 0)
        this.SelectedClassCategory = obj[0].Category;
      else
        this.SelectedClassCategory = '';
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    // if (_classId > 0) {
    //   //this.SelectedClassAttendances = this.AttendanceStatusSum.filter((f:any) => f.ClassId == _classId);
    //   var studentList: any = this.tokenStorage.getStudents()!;
    //   this.Students = studentList.filter((s: any) =>
    //     s["Active"] == 1 && s.StudentClasses
    //     && s.StudentClasses.length > 0
    //     && s.StudentClasses[0].ClassId == _classId
    //   );
    //   this.ClearData();
    //   if (this.Students.length == 0) {
    //     this.route.navigate(['/']);
    //   }
    // }
    this.FilterClass();

  }

  GetSpecificStudentGrades() {
    //debugger;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _examId = this.searchForm.get("searchExamId")?.value;
    if (_classId > 0) {
      var obj = globalconstants.getFilteredClassGroupMapping(this.ClassGroupMapping, _classId, _sectionId, _semesterId)
      if (obj.length > 0) {
        var relevantGroupForExam = this.ExamClassGroups.filter(e => e.ExamId == _examId && obj.findIndex(fi => fi.ClassGroupId == e.ClassGroupId) > -1)
        this.SelectedClassStudentGrades = this.StudentGrades.filter((f: any) => f.ClassGroupId == relevantGroupForExam[0].ClassGroupId && f.ExamId == _examId);
      }
      else {
        this.contentservice.openSnackBar("Class group not found for selected class.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }
  }
  GetExams() {
    var orgIdSearchstr = this.FilterOrgSubOrgBatchId + " and Active eq 1";

    let list: List = new List();

    list.fields = [
      "ExamId", "ExamNameId", "ClassGroupId",
      "StartDate", "EndDate",
      "ReleaseResult", "AttendanceStartDate"];
    list.PageName = "Exams";
    list.filter = [orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.forEach(e => {
          //var _examName = '';
          let obj = this.ExamNames.find(n => n.MasterDataId == e.ExamNameId && n.Active == 1)
          if (obj) {
            //_examName = obj[0].MasterDataName
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj.MasterDataName,
              ClassGroupId: e.ClassGroupId,
              StartDate: e.StartDate,
              EndDate: e.EndDate,
              AttendanceStartDate: e.AttendanceStartDate,
              //AttendanceModeId: e.AttendanceModeId,
              Sequence: obj.Sequence,
              ReleaseResult: e.ReleaseResult
            })
          }
        })
        this.Exams = this.Exams.sort((a, b) => a.Sequence - b.Sequence);
        //console.log("this.exams",this.Exams)
        this.GetExamNCalculate();
      })
  }
  TotalAttendance: any[] = [];
  GetStudentAttendance() {
    //debugger;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    let examObj = this.Exams.find(e => e.ExamId == this.searchForm.get("searchExamId")?.value);
    var _filter = this.FilterOrgSubOrgBatchId;
    _filter += ' and ClassId eq ' + _classId;
    _filter += ' and SemesterId eq ' + _semesterId;
    _filter += ' and SectionId eq ' + _sectionId;

    var _startDate, _endDate;
    if (examObj && examObj.AttendanceStartDate != null) {
      ////console.log("examObj[0].AttendanceStartDate",examObj[0].AttendanceStartDate)
      _startDate = moment(examObj.AttendanceStartDate).format('YYYY-MM-DD');
      _endDate = moment(examObj.EndDate).format('YYYY-MM-DD');
      _filter += ' and AttendanceDate ge ' + _startDate + ' and AttendanceDate le ' + _endDate;


      let list: List = new List();
      list.fields = [
        //"ClassId,RollNo,SectionId"
        "AttendanceId,ClassId,SemesterId,SectionId,StudentClassId,AttendanceDate,AttendanceStatusId"
      ];
      //list.PageName = "StudentClasses";
      //list.lookupFields = ["Attendances($filter=" + _filter + ";$select=AttendanceId,StudentClassId,AttendanceDate,AttendanceStatus)"];
      list.PageName = "Attendances";
      list.filter = [_filter];
      //  list.limitTo=10;

      return this.dataservice.get(list)
    }
    else {
      this.contentservice.openSnackBar("Invalid attendance start date.", globalconstants.ActionText, globalconstants.RedBackground);
      return EMPTY;
    }
  }
  SubjectTypes: any[] = [];
  GetSubjectTypes() {
    var orgIdSearchstr = this.FilterOrgSubOrg + " and Active eq 1";
    this.Loading(true);
    let list: List = new List();

    list.fields = ["SubjectTypeId", "SubjectTypeName", "SelectHowMany"];
    list.PageName = "SubjectTypes";
    list.filter = [orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.Loading(true);
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.SubjectTypes = [...data.value];
        this.GetClassSubject();

      })
  }
  GetSubjectComponents() {

    this.Loading(true);
    let list: List = new List();

    list.fields = ["ClassSubjectMarkComponentId", "ExamId", "SubjectComponentId", "ClassSubjectId", "FullMark", "PassMark", "OverallPassMark"];
    list.PageName = "ClassSubjectMarkComponents";
    //list.lookupFields = ["ClassSubject($filter=Active eq 1;$select=SubjectCategoryId,SubjectTypeId,ClassId,Active)"];
    list.filter = [this.FilterOrgSubOrgBatchId + " and ExamId gt 0 and Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.ClassSubjectComponents = [];

        data.value.forEach(e => {
          var obj = this.ClassSubjects.filter((s: any) => s.ClassSubjectId == e.ClassSubjectId);
          if (obj.length > 0) {
            e.ClassId = obj[0].ClassId;
            e.SectionId = obj[0].SectionId;
            e.SemesterId = obj[0].SemesterId;
            e.SubjectTypeId = obj[0].SubjectTypeId;
            e.SubjectName = obj[0].SubjectName;
            var selectHowManyObj = this.SubjectTypes.filter((f: any) => f.SubjectTypeId == obj[0].SubjectTypeId)
            var selectHowMany = 0, _subjectType = '';
            if (selectHowManyObj.length > 0) {
              selectHowMany = selectHowManyObj[0].SelectHowMany;
              _subjectType = selectHowManyObj[0].SubjectTypeName;
            }

            e.SubjectComponentName = this.MarkComponents.filter(c => c.MasterDataId == e.SubjectComponentId)[0].MasterDataName;
            e.SelectHowMany = selectHowMany;
            e.SubjectType = _subjectType;
            e.SubjectCategoryId = obj[0].SubjectCategoryId;
            e.SubjectCategory = this.SubjectCategory.filter(c => c.MasterDataId == obj[0].SubjectCategoryId)[0].MasterDataName;
            this.ClassSubjectComponents.push(e);
          }
        })
        let test = this.ClassSubjectComponents.filter(f => f.ClassSubjectId == 1136)
        //console.log("ClassSubjectComponents",test)
        this.Loading(false);
        this.PageLoading = false;
      })
  }

  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }
  GetDropDownWithNoConfidential(dropdowntype) {
    let Id = 0;
    let Ids = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    })
    if (Ids.length > 0) {
      Id = Ids[0].MasterDataId;
      return this.allMasterData.filter((item, index) => {
        return item.ParentId == Id
      })
    }
    else
      return [];
  }
}
export interface IExamStudentSubjectResult {
  ExamStudentSubjectResultId: number;
  ExamId: number;
  StudentClassSubjectId: number;
  Student: string;
  ClassSubjectMarkComponentId: number;
  SubjectMarkComponent: string;
  FullMark: number;
  PassMark: number;
  Marks: number;
  Rank: number;
  ExamStatus: number;
  Active: number;
  Action: boolean;
}


