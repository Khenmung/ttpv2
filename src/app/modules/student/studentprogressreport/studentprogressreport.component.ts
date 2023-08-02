import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IStudentEvaluation } from '../../evaluation/evaluationcontrol/evaluationcontrol.component';
import { SwUpdate } from '@angular/service-worker';
import { SharedataService } from 'src/app/shared/sharedata.service';
import * as moment from 'moment';
@Component({
  selector: 'app-studentprogressreport',
  templateUrl: './studentprogressreport.component.html',
  styleUrls: ['./studentprogressreport.component.scss']
})
export class StudentprogressreportComponent implements OnInit {
  PageLoading = true;
  @ViewChild("printSection") printSection: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  OverAllGrade = 'Over All Grade';
  StudentAttendanceList = [];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ExamStudentResults = [];
  GradedMarksResults = [];
  NonGradedMarkResults = [];
  SubjectCategory = [];
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  rowCount = 0;
  ExamStudentSubjectResult: IExamStudentSubjectResult[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
  StoredForUpdate = [];
  SubjectMarkComponents = [];
  MarkComponents = [];
  StudentGrades = [];
  Students = [];
  Classes = [];
  ClassGroups = [];
  Subjects = [];
  Sections = [];
  ExamStatuses = [];
  ExamNames = [];
  StudentClassId = 0;
  Exams = [];
  Batches = [];
  Houses = [];
  StudentSubjects = [];
  ClassEvaluations = [];
  QuestionnaireTypes = [];
  ClassEvaluationOptionList = [];
  ClassGroupMappings = [];
  CurrentStudentClassGroups = [];
  dataSource: MatTableDataSource<IExamStudentSubjectResult>;
  dataSourceEvaluation: MatTableDataSource<IStudentEvaluation>;
  GradedSubjectsDataSource: MatTableDataSource<any[]>;
  NonGradedSubjectsDataSource: MatTableDataSource<any[]>;
  allMasterData = [];
  Permission = 'deny';
  ExamId = 0;
  SelectedApplicationId = 0;
  ExamStudentSubjectResultData = {
    ExamStudentSubjectResultId: 0,
    ExamId: 0,
    StudentClassSubjectId: 0,
    ClassSubjectMarkComponentId: 0,
    Marks: 0,
    ExamStatus: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0,
    Active: 0
  };
  DisplayColumns = [
    "FirstCol"
  ];
  GradedDisplayColumns = [
    "Subject"
  ];
  NonGradedDisplayColumns = [
    "Subject"
  ];
  EvaluationDisplayedColumns = [
    'Description',
    //'AnswerText'
  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private shareddata: SharedataService
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
  CurrentStudent: any = {};
  StudentName = [];
  FeePaymentPermission = '';
  ExamClassGroups = [];
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.PROGRESSREPORT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      ////console.log('this.Permission', this.Permission)
      if (this.Permission != 'deny') {
        //console.log("localStorage.getItem(StudentDetail)",localStorage.getItem("StudentDetail"))
        var studentdetail = [JSON.parse("{" + localStorage.getItem("StudentDetail") + "}")];
        var _studentId = this.tokenStorage.getStudentId();
        var _student = this.tokenStorage.getStudents();
        this.CurrentStudent = _student.filter((f: any) => f.StudentId == _studentId)[0];
        var obj = this.Houses.filter(h => h.MasterDataId == this.CurrentStudent.HouseId);
        if (obj.length > 0)
          this.CurrentStudent.House = obj[0].MasterDataName;

        studentdetail.forEach(s => {
          this.StudentName.push({ "Name": s.StudentName, "Class": s.ClassName, "Section": s.Section, "RollNo": s.RollNo })
        })

        //console.log("StudentName",this.StudentName);
        //this.LoginUserDetail = this.tokenStorage.getUserDetail();
        this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
        var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.FEEPAYMENT);
        if (perObj.length > 0) {
          this.FeePaymentPermission = perObj[0].permission;
        }

        this.StudentClassId = this.tokenStorage.getStudentClassId();
        var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
          this.Classes = [...data.value];
        });
        this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg, 0)
          .subscribe((data: any) => {
            this.ExamClassGroups = [...data.value];
            //var objExamClassGroups = this.ExamClassGroups.filter(g => g.ExamId == _examId);
            //this.FilteredClasses = this.ClassGroupMapping.filter(f => objExamClassGroups.findIndex(fi => fi.ClassGroupId == f.ClassGroupId) > -1);
          });
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.GetMasterData();
        this.GetStudentGradeDefn();
        //this.GetStudentAttendance();
      }
      else {
        this.loading = false;
        this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
    }
  }
  StyleStr = '';
  print(): void {

    var str = `.container{
      position: relative;
      display: flex;
      justify-content: center;
      margin:0px;
      padding: 0px;

    }
    img { border: 0; }

     .container img{
       width: 100%;
      
     }`;
    this.StyleStr += str;

    let printContents, popupWin;
    printContents = this.printSection.nativeElement.innerHTML; // document.getElementById('print-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>
          <style>${this.StyleStr}
          </style>
        </head>
    <body style='margin:0px;padding:0px' onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
  }
  logourl = "";
  CommonHeader = [];
  Organization = [];
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
          var countryObj = this.allMasterData.filter(f => f.MasterDataId == m.CountryId);
          if (countryObj.length > 0)
            m.Country = countryObj[0].MasterDataName;

          var stateObj = this.allMasterData.filter(f => f.MasterDataId == m.StateId);
          if (stateObj.length > 0)
            m.State = stateObj[0].MasterDataName;

          var cityObj = this.allMasterData.filter(f => f.MasterDataId == m.CityId);
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
        //console.log("this.Organization",this.Organization);


        var imgobj = this.CommonHeader.filter(f => f.MasterDataName == 'img');
        if (imgobj.length > 0) {
          this.logourl = imgobj[0].Description;
        }
        this.CommonHeader = this.CommonHeader.filter(f => f.MasterDataName != 'img');
        //console.log("this.commonheadersetting.",commonheadersetting);
        this.CommonHeader.forEach(header => {
          this.Organization[0].forEach(orgdet => {
            header.Description = header.Description.replaceAll("[" + orgdet.name + "]", orgdet.val);
            // header.Description = header.Description.replaceAll("[" + orgdet.OrganizationAddress + "]", orgdet.val);
          })
        })

        this.loading = false; this.PageLoading = false;
      });
    //console.log("this.Organization[0]",this.Organization[0])
    //console.log("this.CommonHeader",this.CommonHeader)
  }
  back() {
    this.nav.navigate(['/edu']);
  }
  GetClassGroupMapping() {
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroupMapping(filterOrgSubOrg, 1)
      .subscribe((data: any) => {
        //debugger;
        data.value.map(f => {
          f.ClassName = f.Class.ClassName;
          if (f.ClassGroup) {
            f.GroupName = f.ClassGroup.GroupName;
            this.ClassGroupMappings.push(f);
          }

        });
      })
  }
  GetStudentSubject() {
    debugger;
    let filterStr = 'Active eq 1 and StudentClassId eq ' + this.StudentClassId;

    let list: List = new List();
    list.fields = [
      "StudentClassSubjectId",
      "ClassSubjectId",
      "StudentClassId",
      "Active",
      "SubjectId"
    ];
    list.PageName = "StudentClassSubjects";
    list.lookupFields = ["ClassSubject($select=SubjectCategoryId,ClassId)"];
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.StudentSubjects = [];
        data.value.forEach(ss => {

          var obj = this.Subjects.filter(s => s.MasterDataId == ss.SubjectId);
          if (obj.length > 0) {
            ss.Subject = obj[0].MasterDataName;
            ss.SubjectCategoryId = ss.ClassSubject.SubjectCategoryId;
            ss.ClassId = ss.ClassSubject.ClassId;
            this.StudentSubjects.push(ss);
          }
        })
        if (this.StudentSubjects.length > 0)
          this.CurrentStudentClassGroups = this.ClassGroupMappings.filter(f => f.ClassId == this.StudentSubjects[0].ClassId);
        this.GetEvaluationExamMap();
        this.GetStudentSubjectResults();
      })
  }

  GetExamGrandTotal() {
    debugger;
    let filterStr = this.FilterOrgSubOrg + ' and Active eq 1';

    filterStr += ' and StudentClassId eq ' + this.StudentClassId;

    let list: List = new List();
    list.fields = [
      "ExamId",
      "StudentClassId",
      "TotalMarks",
      "MarkPercent",
      "Attendance",
      "ClassStrength",
      "Division",
      "Rank",
      "Active"
    ];

    list.PageName = "ExamStudentResults";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ExamStudentResults = [];
        this.ExamStudentResults.push(
          { "FirstCol": "Grand Total" },
          { "FirstCol": "Percentage (%)" },
          { "FirstCol": "Division" },
          { "FirstCol": "Rank" },
          { "FirstCol": "Attendance" },
          { "FirstCol": "Class Strength" });
        var ToInclude = [
          { "ColumnName": "TotalMarks", "Display": "Grand Total" },
          { "ColumnName": "MarkPercent", "Display": "Percentage (%)" },
          { "ColumnName": "Division", "Display": "Division" },
          { "ColumnName": "Rank", "Display": "Rank" },
          { "ColumnName": "Attendance", "Display": "Attendance" },
          { "ColumnName": "ClassStrength", "Display": "Class Strength" }
        ]

        data.value.forEach(eachexam => {
          var _ExamName = '';
          var obj = this.Exams.filter(exam => exam.ExamId == eachexam.ExamId);
          if (obj.length > 0) {
            _ExamName = obj[0].ExamName;
            eachexam.ExamName = _ExamName;
            if (this.DisplayColumns.indexOf(_ExamName) == -1)
              this.DisplayColumns.push(_ExamName);
            Object.keys(eachexam).forEach(col => {
              var objcolumn = ToInclude.filter(include => include.ColumnName == col);
              if (objcolumn.length > 0) {
                var resultrow = this.ExamStudentResults.filter(f => f.FirstCol == objcolumn[0].Display)
                resultrow[0][_ExamName] = eachexam[objcolumn[0].ColumnName]
              }
            })
          }
        })
        //this.loading = false;
        //this.PageLoading = false;
        this.GetGradedNonGradedSubjectMark();
      });
  }
  GetGradedNonGradedSubjectMark() {

    let filterStr = this.FilterOrgSubOrg + " and Active eq true";

    filterStr += ' and StudentClassId eq ' + this.StudentClassId;

    let list: List = new List();
    list.fields = [
      "ExamResultSubjectMarkId",
      "StudentClassId",
      "ExamId",
      "StudentClassSubjectId",
      "Marks",
      "Grade"
    ];

    list.PageName = "ExamResultSubjectMarks";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.GradedMarksResults = [];
        this.NonGradedMarkResults = [];

        data.value.map(eachexam => {
          var examName = '';
          var objSubject = this.StudentSubjects.filter(subject => subject.StudentClassSubjectId == eachexam.StudentClassSubjectId);
          if (objSubject.length > 0) {
            eachexam.Subject = objSubject[0].Subject;
            var _subjectCategory = this.SubjectCategory.filter(f => f.MasterDataId == objSubject[0].SubjectCategoryId);
            var objExam = this.Exams.filter(exam => exam.ExamId == eachexam.ExamId);
            if (objExam.length > 0) {
              examName = objExam[0].ExamName;
              eachexam.ExamName = examName;
              var currentSubjectrow = [];
              if (_subjectCategory[0].MasterDataName.toLowerCase() == 'grading') {
                if (this.GradedDisplayColumns.indexOf(examName) == -1)
                  this.GradedDisplayColumns.push(examName);

                currentSubjectrow = this.GradedMarksResults.filter(f => f.Subject.toLowerCase() == eachexam["Subject"].toLowerCase());
                if (currentSubjectrow.length == 0)
                  this.GradedMarksResults.push({ "Subject": eachexam["Subject"], [examName]: eachexam["Grade"], "ExamId": eachexam.ExamId });
                else
                  currentSubjectrow[0][examName] = eachexam["Grade"]
              }
              else {
                if (this.NonGradedDisplayColumns.indexOf(examName) == -1)
                  this.NonGradedDisplayColumns.push(examName);

                currentSubjectrow = this.NonGradedMarkResults.filter(f => f.Subject.toLowerCase() == eachexam["Subject"].toLowerCase());
                if (currentSubjectrow.length == 0)
                  this.NonGradedMarkResults.push({ "Subject": eachexam["Subject"], [examName]: eachexam["Marks"] });
                else
                  currentSubjectrow[0][examName] = eachexam["Marks"]
              }
            }
          }
        })
        //over all grade calculation
        if (this.GradedMarksResults.length > 0) {
          var objExam = this.GradedMarksResults[0];
          //var obj = this.Exams.filter(ex => ex.ExamId == objExam[0].ExamId);
          //if (obj.length > 0) {
          let _classId = this.tokenStorage.getClassId();

          var _gradingSubjectCategoryId = this.SubjectCategory.filter(s => s.MasterDataName.toLowerCase() == 'grading')[0].MasterDataId;
          var OverAllGradeRow = { 'Subject': this.OverAllGrade };
          //var obj = this.ExamClassGroups.filter(ex => ex.ExamId == objExam["ExamId"]);
          var _studentClassGroupObj = this.ClassGroupMappings.filter(m => m.ClassId == _classId)
          var _classGroupId = 0;
          if (_studentClassGroupObj.length > 0) {
            var obj = this.ExamClassGroups.filter(ex => _studentClassGroupObj.findIndex(fi => fi.ClassGroupId == ex.ClassGroupId) > -1 &&
              ex.ExamId == objExam["ExamId"]);
            if (obj.length > 0)
              _classGroupId = obj[0].ClassGroupId;

          }
          Object.keys(objExam).forEach((exam: any) => {
            var totalPoints = 0;
            if (exam != 'Subject') {
              //var obj = this.Exams.filter(ex => ex.ExamName.toLowerCase() == exam.toLowerCase());
              if (_studentClassGroupObj.length > 0) {
                var currentExamStudentGrades = this.StudentGrades.filter(s => s.ClassGroupId == _classGroupId
                  && s.SubjectCategoryId == _gradingSubjectCategoryId
                  && s.ExamId == objExam["ExamId"]);

                this.GradedMarksResults.forEach(subj => {
                  var objgradepoint = currentExamStudentGrades.filter(c => c.GradeName == subj[exam]);
                  if (objgradepoint.length > 0)
                    totalPoints += objgradepoint[0].Points;
                })
                var average = Math.round(totalPoints / this.GradedMarksResults.length);
                var overallgrade = currentExamStudentGrades.filter(overall => overall.Points == average)
                if (overallgrade.length > 0)
                  OverAllGradeRow[exam] = overallgrade[0].GradeName;
              }
            }
          });
          this.GradedMarksResults.push(OverAllGradeRow);

        }
        //console.log("this.GradedMarksResults",this.GradedMarksResults)
        this.loading = false;
        this.PageLoading = false;
        this.GradedSubjectsDataSource = new MatTableDataSource<any>(this.GradedMarksResults);
        this.NonGradedSubjectsDataSource = new MatTableDataSource<any>(this.NonGradedMarkResults);
        this.dataSource = new MatTableDataSource<any>(this.ExamStudentResults);
      });
  }
  GetStudentGradeDefn() {
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetStudentGrade(filterOrgSubOrg)
      .subscribe((data: any) => {
        this.StudentGrades = data.value.map(m => {
          m.GradeName = globalconstants.decodeSpecialChars(m.GradeName);
          return m;
        });
      })
  }
  GetStudentSubjectResults() {
    this.PageLoading = true;
    this.GetExamGrandTotal();

  }
  // GetStudentSubjectResults_old() {
  //   debugger;

  //   //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
  //   let filterStr = 'Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

  //   filterStr += ' and StudentClassId eq ' + this.StudentClassId;

  //   let list: List = new List();
  //   list.fields = [
  //     "ExamStudentSubjectResultId",
  //     "ExamId",
  //     "StudentClassSubjectId",
  //     "StudentClassId",
  //     "ClassSubjectMarkComponentId",
  //     "Marks",
  //     "ExamStatus",
  //     "Active"
  //   ];

  //   list.PageName = "ExamStudentSubjectResults";
  //   list.lookupFields = [
  //     "StudentClassSubject($select=SubjectId,ClassSubjectId,StudentClassId;$expand=StudentClass($select=ClassId,StudentId,RollNo,SectionId))"];
  //   list.filter = [filterStr];
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       //console.log("data", data)
  //       var _class = '';
  //       var _subject = '';
  //       var _section = '';
  //       var _Mark = '';
  //       this.ExamStudentSubjectResult = data.value.map(s => {
  //         _class = '';
  //         _subject = '';
  //         _Mark = '';
  //         let _stdClass = this.Classes.filter(c => c.ClassId == s.StudentClassSubject.StudentClass.ClassId);
  //         if (_stdClass.length > 0)
  //           _class = _stdClass[0].ClassName;

  //         let _stdSubject = this.Subjects.filter(c => c.MasterDataId == s.StudentClassSubject.SubjectId);
  //         if (_stdSubject.length > 0)
  //           _subject = _stdSubject[0].MasterDataName;

  //         let _stdSection = this.Sections.filter(c => c.MasterDataId == s.StudentClassSubject.StudentClass.SectionId);
  //         if (_stdSection.length > 0)
  //           _section = _stdSection[0].MasterDataName;
  //         var _ExamName = '';
  //         var examobj = this.Exams.filter(f => f.ExamId == s.ExamId)
  //         if (examobj.length > 0)
  //           _ExamName = examobj[0].ExamName;

  //         return {
  //           StudentClassSubjectId: s.StudentClassSubjectId,
  //           ClassSubjectId: s.StudentClassSubject.ClassSubjectId,
  //           StudentClassId: s.StudentClassId,
  //           Student: s.StudentClassSubject.StudentClass.RollNo,
  //           SubjectId: s.StudentClassSubject.SubjectId,
  //           Subject: _subject,
  //           ClassId: s.StudentClassSubject.StudentClass.ClassId,
  //           StudentId: s.StudentClassSubject.StudentClass.StudentId,
  //           SectionId: s.StudentClassSubject.StudentClass.SectionId,
  //           Mark: s.Marks,
  //           ExamStatus: s.ExamStatus,
  //           ExamName: _ExamName
  //         }
  //       })
  //       var marksum = alasql("select SubjectId,Subject,ExamName,sum(Mark) Mark from ? group by SubjectId,Subject,ExamName", [this.ExamStudentSubjectResult])

  //       var progressreport = [];
  //       var examEolumns = [];
  //       this.Exams.forEach(e => {
  //         examEolumns.push(e.ExamName)
  //       })

  //       //progressreport.push(JSON.parse(columns));

  //       this.StudentSubjects.forEach((ss) => {
  //         progressreport.push({
  //           "Subject": ss.Subject,
  //           "SubjectId": ss.SubjectId
  //         });
  //       })
  //       progressreport.forEach((subject) => {
  //         examEolumns.forEach(exam => {
  //           //subject["'"+exam + "'"] = ''
  //           subject[exam] = ''
  //           // if (this.DisplayColumns.indexOf(exam) == -1)
  //           //   this.DisplayColumns.push(exam)
  //         })
  //       })

  //       progressreport.forEach(report => {

  //         var current = marksum.filter(c => c.SubjectId == report.SubjectId);
  //         current.forEach(exam => {
  //           if (exam.ExamName.length > 0 && this.DisplayColumns.indexOf(exam.ExamName) == -1)
  //             this.DisplayColumns.push(exam.ExamName)
  //           report[exam.ExamName] = exam.Mark
  //         })
  //       })

  //       //console.log("this.DisplayColumns", this.DisplayColumns);
  //       //console.log("shd", progressreport);

  //       this.dataSource = new MatTableDataSource<any>(progressreport);
  //       this.dataSource.sort = this.sort;
  //       this.dataSource.paginator = this.paginator;
  //       this.loading = false; this.PageLoading = false;
  //     });
  // }

  GetMasterData() {
    debugger;
    this.allMasterData = this.tokenStorage.getMasterData();
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
    this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
    //this.StudentGrades = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
    this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY);
    this.QuestionnaireTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
    this.Batches = this.tokenStorage.getBatches()
    this.CommonHeader = this.getDropDownData(globalconstants.MasterDefinitions.common.COMMONPRINTHEADING);
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroupMapping(filterOrgSubOrg, 1)
      .subscribe((data: any) => {
        this.ClassGroupMappings = [...data.value];
      })
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroups(filterOrgSubOrg)
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      });
    this.GetExams();
    this.GetOrganization();

  }
  GetExams() {

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId", "ClassGroupId"];
    list.PageName = "Exams";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1 and ReleaseResult eq 1"];
    list.orderBy = "EndDate desc";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId
            })
        })
        this.GetStudentSubject();
        this.GetEvaluationOption();
      })
  }
  GetEvaluationOption() {
    let list: List = new List();
    list.fields = [
      'ClassEvaluationAnswerOptionsId',
      'Title',
      'Description',
      'Point',
      'Correct',
      'ParentId',
      'ClassEvaluationId',
      'Active',
    ];

    list.PageName = "ClassEvaluationOptions";
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.ClassEvaluationOptionList = [];
    this.dataSource = new MatTableDataSource<any>([]);
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassEvaluationOptionList = data.value.map(item => {
            item.Title = globalconstants.decodeSpecialChars(item.Title);
            item.Active = 0;
            return item;
          })
          this.GetClassEvaluations();
        }
        else {
          this.contentservice.openSnackBar("No answer option found.", globalconstants.ActionText, globalconstants.BlueBackground);
        }
        //this.loading = false; this.PageLoading=false;
      });

  }
  EvaluationExamMap = [];
  GetEvaluationExamMap() {

    let list: List = new List();
    list.fields = [
      'EvaluationExamMapId',
      'ExamId',
      'EvaluationMasterId',
      'Active',
    ];
    list.PageName = "EvaluationExamMaps";
    list.lookupFields = ["EvaluationMaster($select=Active,EvaluationMasterId,ClassGroupId,EvaluationName,AppendAnswer)"];
    list.filter = [this.FilterOrgSubOrg + ' and Active eq true'];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.EvaluationExamMap = [];
        debugger;
        data.value.forEach(f => {
          var _ExamName = '';
          var obj = this.CurrentStudentClassGroups.filter(g => g.ClassGroupId == f.EvaluationMaster.ClassGroupId);

          if (obj.length > 0 && f.EvaluationMaster.Active == 1 && f.EvaluationMaster.AppendAnswer == 0) {
            var objexam = this.Exams.filter(e => e.ExamId == f.ExamId)
            if (objexam.length > 0) {
              _ExamName = objexam[0].ExamName;
              f.ClassGroupId = f.EvaluationMaster.ClassGroupId;
              f.ExamName = _ExamName;
              f.EvaluationName = f.EvaluationMaster.EvaluationName;
              this.EvaluationExamMap.push(f);
            }
          }
        });
        //console.log("this.EvaluationExamMap",this.EvaluationExamMap)
      })
  }
  GetClassEvaluations() {

    let list: List = new List();
    list.fields = [
      'ClassEvaluationId',
      'QuestionnaireTypeId',
      'EvaluationMasterId',
      'DisplayOrder',
      'Description',
      'ClassEvaluationAnswerOptionParentId',
      'MultipleAnswer',
    ];

    list.PageName = "ClassEvaluations";
    list.lookupFields = ["EvaluationMaster($select=AppendAnswer)"]
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassEvaluations = [];
        var _data = data.value.filter(f => f.EvaluationMaster.AppendAnswer == false);
        if (_data.length > 0) {
          _data.forEach(clseval => {
            var obj = this.QuestionnaireTypes.filter(f => f.MasterDataId == clseval.QuestionnaireTypeId);
            if (obj.length > 0) {
              clseval.Description = globalconstants.decodeSpecialChars(clseval.Description);
              clseval.QuestionnaireType = obj[0].MasterDataName
              clseval.ClassEvaluationOptions = this.ClassEvaluationOptionList.filter(f => f.ParentId == clseval.ClassEvaluationAnswerOptionParentId)
              this.ClassEvaluations.push(clseval);
            }
          })
          this.StartEvaluation();
        }
        this.loading = false; this.PageLoading = false;
      })
  }
  StudentEvaluationList = [];
  Result = [];
  StartEvaluation() {
    debugger;
    this.loading = true;
    this.StudentEvaluationList = [];
    this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();

    let filterStr = this.FilterOrgSubOrg;
    filterStr += ' and StudentClassId eq ' + this.StudentClassId
    let list: List = new List();
    list.fields = [
      'StudentEvaluationResultId',
      'StudentClassId',
      'StudentId',
      'ClassEvaluationId',
      'EvaluationExamMapId',
      'AnswerText',
      'History',
      'Active'
    ];

    list.PageName = "StudentEvaluationResults";
    list.lookupFields = ["StudentEvaluationAnswers($filter=Active eq 1;$select=StudentEvaluationAnswerId,StudentEvaluationResultId,ClassEvaluationAnswerOptionsId,Active)"];

    list.filter = [filterStr];
    this.StudentEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger
        this.Result = [...data.value]
        var _distinctEvaluationType = alasql('select distinct EvaluationMasterId,EvaluationName from ?', [this.EvaluationExamMap])

        _distinctEvaluationType.forEach(distinctevaluation => {

          this.StudentEvaluationList.push({
            Description: distinctevaluation.EvaluationName,
            EvaluationName: distinctevaluation.EvaluationName,
            EvaluationMasterId: distinctevaluation.EvaluationMasterId,
            QuestionnaireType: 'Evaluation Master'
          });

          var _oneEvaluationMultipExam = this.EvaluationExamMap.filter(f => f.EvaluationMasterId == distinctevaluation.EvaluationMasterId);
          _oneEvaluationMultipExam.forEach(evalExam => {

            if (this.EvaluationDisplayedColumns.indexOf(evalExam.ExamName) == -1) {
              this.EvaluationDisplayedColumns.push(evalExam.ExamName);
            }
            var _classEvaluationExamMap = this.ClassEvaluations.filter(f => f.EvaluationMasterId == evalExam.EvaluationMasterId
              && f.ExamId == null || f.ExamId == 0 || f.ExamId == evalExam.ExamId);

            _classEvaluationExamMap.forEach(clseval => {
              var existing = this.Result.filter(f => f.ClassEvaluationId == clseval.ClassEvaluationId
                && f.EvaluationExamMapId == evalExam.EvaluationExamMapId);
              var ans = [];
              if (existing.length > 0) {
                clseval.ClassEvaluationOptions.forEach(cls => {
                  var selected = existing[0].StudentEvaluationAnswers
                    .filter(stud => stud.ClassEvaluationAnswerOptionsId == cls.ClassEvaluationAnswerOptionsId)
                  if (selected.length > 0)
                    ans.push(cls.Title);
                });
                if (existing[0].AnswerText.length > 0 && ans.length == 0)
                  ans = existing[0].AnswerText
              }

              var _description = globalconstants.decodeSpecialChars(clseval.Description);
              // var row = this.StudentEvaluationList.filter(f => f["Description"] == _description
              //   && f.EvaluationMasterId == clseval.EvaluationMasterId);
              var row = this.StudentEvaluationList.filter(f => f["ClassEvaluationId"] == clseval.ClassEvaluationId
                && f.EvaluationMasterId == clseval.EvaluationMasterId);
              if (row.length > 0) {
                row[0][evalExam.ExamName] = ans;
              }
              else {
                // if (existing.length > 0)
                //   _textAnswer = existing[0].AnswerText
                this.StudentEvaluationList.push({
                  ClassEvaluationId: clseval.ClassEvaluationId,
                  Description: _description,
                  [evalExam.ExamName]: ans,
                  EvaluationName: evalExam.EvaluationName,
                  EvaluationMasterId: evalExam.EvaluationMasterId,
                  QuestionnaireType: clseval.QuestionnaireType,
                  DisplayOrder: clseval.DisplayOrder
                });
              }
            })
          })//class evaluation
        })//each evaluation exam map

        if (this.StudentEvaluationList.length == 0) {
          this.StudentEvaluationList = [];
          this.contentservice.openSnackBar(globalconstants.NoEvaluationRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        else
          this.StudentEvaluationList = this.StudentEvaluationList.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
        //  console.log("this.StudentEvaluationList",this.StudentEvaluationList)
        this.dataSourceEvaluation = new MatTableDataSource<IStudentEvaluation>(this.StudentEvaluationList);
        this.dataSource.paginator = this.paginator;
        this.loading = false;
        this.PageLoading = false;
      })
  }
  // ApplyVariables(studentInfo) {
  //   this.PrintHeading = [...this.AssessmentPrintHeading];
  //   this.AssessmentPrintHeading.forEach((stud, indx) => {
  //     Object.keys(studentInfo).forEach(studproperty => {
  //       if (stud.Logic.includes(studproperty)) {
  //         this.PrintHeading[indx].Logic = stud.Logic.replaceAll("[" + studproperty + "]", studentInfo[studproperty]);
  //       }
  //     });
  //   })

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
export interface IExamStudentSubjectResult {
  ExamStudentSubjectResultId: number;
  ExamId: number;
  ExamName: string;
  SubjectId: number;
  StudentClassSubjectId: number;
  Student: string;
  ClassSubjectMarkComponentId: number;
  SubjectMarkComponent: string;
  FullMark: number;
  PassMark: number;
  Mark: number;
  ExamStatus: number;
  Active: number;
  Action: boolean;
}



