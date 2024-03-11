import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import alasql from 'alasql';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { IStudentEvaluation } from '../studentprofilereport/studentprofilereport.component';
import * as _ from 'lodash';
import { evaluate } from 'mathjs';
@Component({
  selector: 'app-printprogressreport',
  templateUrl: './printprogressreport.component.html',
  styleUrls: ['./printprogressreport.component.scss']
})
export class PrintprogressreportComponent implements OnInit {
  PageLoading = true;
  @ViewChild("printSection") printSection: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  OverAllGrade = 'Over All Grade';
  StudentAttendanceList: any[] = [];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ExamStudentResults: any[] = [];
  GradedMarksResults: any[] = [];
  NonGradedMarkResults: any[] = [];
  SubjectCategory: any[] = [];
  StandardFilterWithBatchId = '';
  Defaultvalue = 0;
  SelectedClassCategory = '';
  loading = false;
  rowCount = 0;
  ExamStudentSubjectResult: IExamStudentSubjectResult[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
  StoredForUpdate: any[] = [];
  SubjectMarkComponents: any[] = [];
  MarkComponents: any[] = [];
  StudentGrades: any[] = [];
  Students: any[] = [];
  Classes: any[] = [];
  ClassGroups: any[] = [];
  Subjects: any[] = [];
  Sections: any[] = [];
  Semesters: any[] = [];
  ClassCategory: any[] = [];
  ExamStatuses: any[] = [];
  ExamNames: any[] = [];
  StudentClassId = 0;
  Exams: any[] = [];
  Batches: any[] = [];
  StudentSubjects: any[] = [];
  ClassEvaluations: any[] = [];
  QuestionnaireTypes: any[] = [];
  ClassEvaluationOptionList: any[] = [];
  ClassGroupMappings: any[] = [];
  CurrentClassGroups: any[] = [];
  dataSource: MatTableDataSource<IExamStudentSubjectResult>;
  dataSourceEvaluation: MatTableDataSource<IStudentEvaluation>;
  GradedSubjectsDataSource: MatTableDataSource<any[]>;
  NonGradedSubjectsDataSource: MatTableDataSource<any[]>;
  allMasterData: any[] = [];
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
  SignatureColumns = [
    "FirstCol"
  ];
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
    this.searchForm = this.fb.group({
      //searchExamId: [0],
      searchClassId: [0],
      searchSectionId: [0],
      searchSemesterId: [0]
    });
    this.PageLoad();
  }
  filterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  StudentName: any[] = [];
  FeePaymentPermission = '';
  ExamClassGroups: any[] = [];
  AllStudents: any[] = [];
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.PROGRESSREPORT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      //////console.log('this.Permission', this.Permission)
      if (this.Permission != 'deny') {

        this.AllStudents = this.tokenStorage.getStudents()!;
        this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
        var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.FEEPAYMENT);
        if (perObj.length > 0) {
          this.FeePaymentPermission = perObj[0].permission;
        }

        this.StudentClassId = this.tokenStorage.getStudentClassId()!;
        this.filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        //let _role = this.LoginUserDetail[0]['RoleUsers'][0].role;
        // let fields = "StudentId,PID,PresentAddress,DOB";
        // this.contentservice.GetStudentUncommonFields(fields, this.FilterOrgSubOrgBatchId, _role, localStorage.getItem('studentId'))
        //   .subscribe((all: any) => {
        //     this.AllStudents.forEach(stud => {
        //       let match = all.value.filter(a => a.StudentId == stud.StudentId);
        //       if (match.length > 0) {
        //         stud.PresentAddress = match[0].PresentAddress;
        //         stud.DOB = match[0].DOB;
        //       }
        //     })
        //   })

        this.contentservice.GetExamClassGroup(this.filterOrgSubOrg, 0)
          .subscribe((data: any) => {
            this.ExamClassGroups = [...data.value];
            //var objExamClassGroups = this.ExamClassGroups.filter(g => g.ExamId == _examId);
            //this.FilteredClasses = this.ClassGroupMapping.filter((f:any) => objExamClassGroups.findIndex(fi => fi.ClassGroupId == f.ClassGroupId) > -1);
          });
        this.StandardFilterWithBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetMasterData();
        this.GetStudentGradeDefn();

      }
      else {
        this.loading = false;
        this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
    }
  }
  StudentStatuses: any = [];
  ExamIdToWithHeld: any = [];
  getStudentStatuss() {

    const _classId = this.searchForm.get("searchClassId")?.value;
    const _sectionId = this.searchForm.get("searchSectionId")?.value;
    const _semesterId = this.searchForm.get("searchSemesterId")?.value;
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq true";
    filterStr += " and ClassId eq " + _classId;
    filterStr += " and SemesterId eq " + _semesterId;
    filterStr += " and SectionId eq " + _sectionId;

    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'ClassId',
      'StudentStatureId',
      'StatusId',
      'SectionId',
      'SemesterId',
      'Active'
    ];
    list.PageName = "StudentStatures";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentStatuses = [...data.value];
        this.Exams.forEach(x => {
          if (x.WithHeldResultStatusId) {
            if (this.StudentStatuses.findIndex(i => i.StatusId === x.WithHeldResultStatusId) >= -1)
              this.ExamIdToWithHeld.push(x);
          }
        });
        this.GetStudentSubject();
      })
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

        this.loading = false; this.PageLoading = false;
      });
    ////console.log("this.Organization[0]",this.Organization[0])
    ////console.log("this.CommonHeader",this.CommonHeader)
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
  GetClassSubject() {
    debugger;
    var _classId = this.searchForm.get("searchClassId")?.value;
    //var _sectionId = this.searchForm.get("searchSectionId")?.value;
    //var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    //let filterStr = 'Active eq 1 and StudentClassId eq ' + this.StudentClassId;
    let filterStr = this.filterOrgSubOrg
    filterStr += " and ClassId eq " + _classId;
    //filterStr += " and SemesterId eq " + _semesterId;
    //filterStr += " and SectionId eq " + _sectionId;

    filterStr += " and Active eq 1";

    let list: List = new List();
    list.fields = [
      "ClassSubjectId",
      "SectionId",
      "SemesterId",
      "SubjectId",
      "ClassId",
      "SubjectCategoryId"
    ];
    list.PageName = "ClassSubjects";
    list.filter = [filterStr];
    return this.dataservice.get(list);

  }
  GetStudentSubject() {
    debugger;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    //let filterStr = 'Active eq 1 and StudentClassId eq ' + this.StudentClassId;
    let filterStr = this.filterOrgSubOrg
    filterStr += " and ClassId eq " + _classId;
    if (!_semesterId && !_sectionId) {
      this.contentservice.openSnackBar("Please select section/semester.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_semesterId) filterStr += " and SemesterId eq " + _semesterId;
    if (_sectionId) filterStr += " and SectionId eq " + _sectionId;
    filterStr += " and Active eq 1";

    let list: List = new List();
    list.fields = [
      "StudentClassSubjectId",
      "ClassSubjectId",
      "StudentClassId",
      "SectionId",
      "SemesterId",
      "Active",
      "SubjectId"
    ];
    list.PageName = "StudentClassSubjects";
    //list.lookupFields = ["ClassSubject($select=SubjectCategoryId,ClassId)"];
    list.filter = [filterStr];

    this.loading = true;
    let sources = [this.dataservice.get(list), this.GetClassSubject()];
    forkJoin(sources)
      .subscribe((data: any) => {
        //debugger;
        let classSubject = [...data[1].value];// globalconstants.getFilteredClassSubjects(data[1].value,_classId,_sectionId,_semesterId);
        this.StudentSubjects = [];
        data[0].value.forEach(ss => {

          var obj = this.Subjects.filter((s: any) => s.MasterDataId == ss.SubjectId);
          if (obj.length > 0) {
            ss.Subject = obj[0].MasterDataName;
            let clssubject = classSubject.filter(c => c.ClassSubjectId == ss.ClassSubjectId);
            if (clssubject.length > 0) {
              ss.SubjectCategoryId = clssubject[0].SubjectCategoryId;
              ss.ClassId = clssubject[0].ClassId;
              this.StudentSubjects.push(ss);
            }
          }
        })


        this.GetStudentSubjectResults();
      })
  }
  ReportCardSignatures: any = [];
  ReportSignatureList: any = [];
  GetExamGrandTotal() {
    debugger;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    let filterStr = this.filterOrgSubOrg;
    this.ReportSignatureList = [];
    //filterStr += ' and StudentClassId eq ' + this.StudentClassId;
    filterStr += " and ClassId eq " + _classId;
    if (_semesterId) filterStr += " and SemesterId eq " + _semesterId;
    if (_sectionId) filterStr += " and SectionId eq " + _sectionId;
    filterStr += " and Active eq 1";

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
        let uniqueExamNames = alasql("select distinct ExamId,ExamName from ?", [this.ExamNCalculateList]);
        let eachStudent = alasql("select distinct StudentClassId from ?", [data.value]);
        //console.log("uniqueExamNames", uniqueExamNames)
        const _resultSummaryText = this.ExamNCalculateList.filter(ataglance => ataglance.CalculateCategoryName.toLowerCase() === "result summary");
        // _resultSummaryText.forEach(item => {
        //   let row = this.ExamStudentResults.find(x => x.FirstCol === item.PropertyName);
        //   if (!row) {
        //     this.ExamStudentResults.push({"StudentClassId":0,"ExamId": item.ExamId, "FirstCol": item.PropertyName });
        //     uniqueExamNames.forEach(exam => {
        //       if (exam.ExamName)
        //         this.ExamStudentResults[this.ExamStudentResults.length - 1][exam.ExamName] = '1';
        //     })
        //   }
        //   else {
        //     uniqueExamNames.forEach(exam => {
        //       row[exam.ExamName] = '1';
        //     })
        //   }
        // })
        //console.log("this.ExamStudentResults1", this.ExamStudentResults);
        // this.ReportCardSignatures.forEach(item => {
        //   this.ReportSignatureList.push({ 'FirstCol': item.MasterDataName })
        // })
        eachStudent.forEach(s => {
          _resultSummaryText.forEach(item => {
            let row = this.ExamStudentResults.find(x => x.StudentClassId == s.StudentClassId
              && x.FirstCol === item.PropertyName);
            if (!row) {
              this.ExamStudentResults.push({ "StudentClassId": s.StudentClassId, "FirstCol": item.PropertyName });
              uniqueExamNames.forEach(exam => {
                if (exam.ExamName)
                  this.ExamStudentResults[this.ExamStudentResults.length - 1][exam.ExamName] = '';
              })
            }
            else {
              uniqueExamNames.forEach(exam => {
                row[exam.ExamName] = '';
              })
            }
          })
        })

        let result: any = [];
        data.value.forEach(item => {

          let _exam = this.Exams.find(e => e.ExamId == item.ExamId);
          if (_exam) {
            item.Sequence = _exam.Sequence;
            result.push(item);
          }
        });
        result = result.sort((a, b) => a.Sequence - b.Sequence);

        //////////////
        let _ValueForFormula: any = [];
        var _ExamName = '';
        result.forEach(eachexam => {
          _ValueForFormula = [];
          _ExamName = '';
          var obj = this.Exams.find(exam => exam.ExamId == eachexam.ExamId);
          if (obj) {
            _ExamName = obj.ExamName;
            eachexam.ExamName = _ExamName;
            if (this.DisplayColumns.indexOf(_ExamName) == -1)
              this.DisplayColumns.push(_ExamName);
            Object.keys(eachexam).forEach(col => {
              _ValueForFormula.push({ "Text": "[" + col + "]", "Val": eachexam[col] });
            })

            //Object.keys(eachexam).forEach(col => {
            let _examSummaryText = _resultSummaryText.filter(e => e.ExamId == eachexam.ExamId);
            _examSummaryText.forEach(summary => {
              let resultrow = this.ExamStudentResults.find((f: any) => f.StudentClassId == eachexam.StudentClassId
                && f.FirstCol === summary.PropertyName)
              let _formula = summary.Formula;
              _ValueForFormula.forEach(f => {
                _formula = _formula.replaceAll(f.Text, f.Val);
              })
              try {
                let objresult = evaluate(_formula);
                if (objresult)
                  resultrow[_ExamName] = objresult.toFixed(0);
              }
              catch
              {
                resultrow[_ExamName] = _formula;
              }

            });
          }

        })
        // console.log("this.ExamStudentResults", this.ExamStudentResults)
        // this.ExamStudentResults.push(
        //   { "FirstCol": "Grand Total" },
        //   { "FirstCol": "Percentage (%)" },
        //   { "FirstCol": "Division" },
        //   { "FirstCol": "Rank" },
        //   { "FirstCol": "Attendance" },
        //   { "FirstCol": "Class Strength" });
        // var ToInclude = [
        //   { "ColumnName": "TotalMarks", "Display": "Grand Total" },
        //   { "ColumnName": "MarkPercent", "Display": "Percentage (%)" },
        //   { "ColumnName": "Division", "Display": "Division" },
        //   { "ColumnName": "Rank", "Display": "Rank" },
        //   { "ColumnName": "Attendance", "Display": "Attendance" },
        //   { "ColumnName": "ClassStrength", "Display": "Class Strength" }
        // ]
        // this.ReportCardSignatures.forEach(item => {
        //   this.ReportSignatureList.push({ 'FirstCol': item.MasterDataName })
        // })
        // data.value.forEach(eachexam => {
        //   var _ExamName = '';
        //   var obj = this.Exams.find(exam => exam.ExamId == eachexam.ExamId);
        //   if (obj) {
        //     _ExamName = obj.ExamName;
        //     eachexam.ExamName = _ExamName;
        //     if (this.DisplayColumns.indexOf(_ExamName) == -1)
        //       this.DisplayColumns.push(_ExamName);
        //     Object.keys(eachexam).forEach(col => {
        //       var objcolumn = ToInclude.filter(include => include.ColumnName == col);
        //       if (objcolumn.length > 0) {
        //         var resultrow = this.ExamStudentResults.filter((f: any) => f.FirstCol == objcolumn[0].Display)
        //         resultrow[0][_ExamName] = eachexam[objcolumn[0].ColumnName]
        //       }
        //     })
        //     this.ReportSignatureList.forEach(item => {
        //       if (this.SignatureColumns.indexOf(_ExamName) == -1)
        //         this.SignatureColumns.push(_ExamName);
        //       item[_ExamName] = ''

        //     })
        //   }
        // })
        //this.loading = false;
        //this.PageLoading = false;
        this.GetClassEvaluations();

      });
  }
  ExamNCalculateList: any = [];
  GetExamNCalculates() {

    var orgIdSearchstr = this.filterOrgSubOrg + ' and Active eq true';
    // let _examId = this.searchForm.get("searchExamId")?.value;
    // orgIdSearchstr += " and ExamId eq " + _examId;

    let list: List = new List();
    list.fields = [
      "ExamNCalculateId",
      "ExamId",
      "CalculateResultPropertyId",
      "Formula",
      "CalculateCategoryId",
      "Sequence",
      "Active"
    ];

    list.PageName = "ExamnCalculates";
    list.filter = [orgIdSearchstr];
    this.ExamNCalculateList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.ExamNCalculateList = [];
        data.value.forEach(item => {
          let exResult = this.ResultSummaryText.find(f => f.MasterDataId === item.CalculateResultPropertyId);
          let exCat = this.ResultSummaryCategory.find(f => f.MasterDataId === item.CalculateCategoryId);
          let examobj = this.Exams.find(f => f.ExamId == item.ExamId);
          if (examobj) {
            item.ExamName = examobj.ExamName;
            if (exResult) {
              item.PropertyName = exResult.MasterDataName;
              if (exCat) {
                item.CalculateCategoryName = exCat.MasterDataName;
                this.ExamNCalculateList.push(item);
              }
            }
          }
        });
        this.ExamNCalculateList = this.ExamNCalculateList.sort((a, b) => a.Sequence - b.Sequence);
        //this.GetExams();
      })
  }
  BindSemesterSection() {
    var _classId = this.searchForm.get("searchClassId")?.value;
    this.SelectedClassCategory = '';

    if (_classId > 0) {
      let obj = this.Classes.filter((f: any) => f.ClassId == _classId);
      if (obj.length > 0)
        this.SelectedClassCategory = obj[0].Category;
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();
  }
  ClearData() {
    this.StudentEvaluationList = [];
    this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
    this.GradedMarksResults = [];
    this.GradedDataSourceArray = [];
    this.NonGradedMarkResults = [];
    this.NonGradedDataSourceArray = [];
    this.EvaluationArray = [];
  }
  EvaluationArray: any = [];
  StudentEvaluationArray: any = [];
  GradedDataSourceArray: any[] = [];
  NonGradedDataSourceArray: any[] = [];
  ExamResultArray: any[] = [];
  ReportCardSignatureArray: any[] = [];
  CurrentStudent: any[] = [];
  GetGradedNonGradedSubjectMark() {
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    let filterStr = this.filterOrgSubOrg + " and Active eq true";
    this.GradedDataSourceArray = [];
    this.NonGradedDataSourceArray = [];
    this.ExamResultArray = [];
    this.EvaluationArray = [];
    this.ReportCardSignatureArray = [];
    this.ReportSignatureList = [];
    //filterStr += ' and StudentClassId eq ' + this.StudentClassId;
    filterStr += " and ClassId eq " + _classId
    if (_semesterId) filterStr += " and SemesterId eq " + _semesterId;
    if (_sectionId) filterStr += " and SectionId eq " + _sectionId;
    this.loading = true;
    this.PageLoading = true;
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
        //forkJoin([this.dataservice.get(list), this.GetClassEvaluations()])
        // .subscribe((res: any) => {
        this.ReportCardSignatures.forEach(item => {
          this.ReportSignatureList.push({ 'FirstCol': item.MasterDataName })
        })
        var studentsForSelectedClassSection = alasql("select distinct StudentClassId from ? ", [data.value]);
        this.CurrentStudent = [];
        studentsForSelectedClassSection.forEach(stud => {
          this.GradedMarksResults = [];
          this.NonGradedMarkResults = [];
          var _studcurrent = this.AllStudents.find((s: any) => s.StudentClasses.length > 0
            && s.StudentClasses[0].StudentClassId == stud.StudentClassId)
          if (_studcurrent) {

            const objhouse = this.Houses.find(h => h.MasterDataId == _studcurrent.HouseId);
            if (objhouse)
              _studcurrent.House = objhouse.MasterDataName;
            let classobj = this.Classes.find(c => c.ClassId == _studcurrent.StudentClasses[0].ClassId);
            if (classobj) {
              _studcurrent.ClassName = classobj.ClassName;
              _studcurrent.ClassDetail = _studcurrent.ClassName + "-" + _studcurrent.Section +
                _studcurrent.Semester + ", Roll No. : " + _studcurrent.StudentClasses[0].RollNo
              this.CurrentStudent.push(_studcurrent);
            }
          }
          ////console.log("this.currentstudent", this.CurrentStudent);
          var detailForEachStudent = data.value.filter(db => db.StudentClassId == stud.StudentClassId);
          if (this.CurrentStudent.length > 0) {

            detailForEachStudent.forEach(eachexam => {
              var examName = '';
              var objSubject = this.StudentSubjects.find(subject => subject.StudentClassSubjectId === eachexam.StudentClassSubjectId);
              if (objSubject) {
                eachexam.Subject = objSubject.Subject;
                var _subjectCategory = this.SubjectCategory.find((f: any) => f.MasterDataId === objSubject.SubjectCategoryId);
                var objExam = this.Exams.find(exam => exam.ExamId === eachexam.ExamId);
                if (objExam) {
                  examName = objExam.ExamName;
                  eachexam.ExamName = examName;
                  var currentSubjectrow: any = {};
                  if (_subjectCategory.MasterDataName.toLowerCase() == 'grading') {
                    if (this.GradedDisplayColumns.indexOf(examName) == -1)
                      this.GradedDisplayColumns.push(examName);

                    currentSubjectrow = this.GradedMarksResults.find((f: any) => f.Subject.toLowerCase() == eachexam["Subject"].toLowerCase());
                    if (!currentSubjectrow)
                      this.GradedMarksResults.push({ "Subject": eachexam["Subject"], [examName]: eachexam["Grade"], "ExamId": eachexam.ExamId });
                    else
                      currentSubjectrow[examName] = eachexam["Grade"]
                  }
                  else {
                    if (this.NonGradedDisplayColumns.indexOf(examName) == -1)
                      this.NonGradedDisplayColumns.push(examName);

                    currentSubjectrow = this.NonGradedMarkResults.find((f: any) => f.Subject.toLowerCase() == eachexam["Subject"].toLowerCase());
                    if (!currentSubjectrow)
                      this.NonGradedMarkResults.push({ "Subject": eachexam["Subject"], [examName]: eachexam["Marks"] });
                    else
                      currentSubjectrow[examName] = eachexam["Marks"];
                  }
                }
              }
            })

            //over all grade calculation
            if (this.GradedMarksResults.length > 0) {
              var objExam = this.GradedMarksResults[0];
              //var obj = this.Exams.filter(ex => ex.ExamId == objExam[0].ExamId);
              //if (obj.length > 0) {
              let _classId = this.tokenStorage.getClassId()!;

              var _gradingSubjectCategoryId = this.SubjectCategory.find((s: any) => s.MasterDataName.toLowerCase() == 'grading').MasterDataId;
              var OverAllGradeRow = { 'Subject': this.OverAllGrade };
              //var obj = this.ExamClassGroups.filter(ex => ex.ExamId == objExam["ExamId"]);
              var _studentClassGroupObj = globalconstants.getFilteredClassGroupMapping(this.ClassGroupMappings, _classId, _sectionId, _semesterId);
              var _classGroupId = 0;
              if (_studentClassGroupObj.length > 0) {
                var obj = this.ExamClassGroups.find(ex => _studentClassGroupObj.findIndex(fi => fi.ClassGroupId == ex.ClassGroupId) > -1 &&
                  ex.ExamId == objExam["ExamId"]);
                if (obj)
                  _classGroupId = obj.ClassGroupId;

              }
              Object.keys(objExam).forEach((exam: any) => {
                var totalPoints = 0;
                if (exam != 'Subject') {
                  //var obj = this.Exams.filter(ex => ex.ExamName.toLowerCase() == exam.toLowerCase());
                  if (_studentClassGroupObj.length > 0) {
                    var currentExamStudentGrades = this.StudentGrades.filter((s: any) => s.ClassGroupId == _classGroupId
                      && s.SubjectCategoryId == _gradingSubjectCategoryId
                      && s.ExamId == objExam["ExamId"]);

                    this.GradedMarksResults.forEach(subj => {
                      var objgradepoint = currentExamStudentGrades.find(c => c.GradeName == subj[exam]);
                      if (objgradepoint)
                        totalPoints += objgradepoint.Points;
                    })
                    var average = Math.round(totalPoints / this.GradedMarksResults.length);
                    var overallgrade = currentExamStudentGrades.find(overall => overall.Points == average)
                    if (overallgrade)
                      OverAllGradeRow[exam] = overallgrade.GradeName;
                  }
                }
              });
              this.GradedMarksResults.push(OverAllGradeRow);
            }
          }
          //console.log("this.NonGradedMarkResults", this.NonGradedMarkResults);
          if (this.NonGradedMarkResults.length == 0) {
            this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
          }
          else {
            this.NonGradedDataSourceArray.push(this.NonGradedMarkResults);
            let _studExamResult = this.ExamStudentResults.filter(sr => sr.StudentClassId == stud.StudentClassId)
            this.ExamResultArray.push(_studExamResult);

            this.ReportCardSignatureArray.push(this.ReportSignatureList);
          }
          this.GradedDataSourceArray.push(JSON.parse(JSON.stringify(this.GradedMarksResults)));

        });

        for (let colIndx = 1; colIndx < this.NonGradedDisplayColumns.length; colIndx++) {
          this.ReportSignatureList.forEach(item => {
            if (this.SignatureColumns.indexOf(this.NonGradedDisplayColumns[colIndx]) == -1)
              this.SignatureColumns.push(this.NonGradedDisplayColumns[colIndx]);
            item[this.NonGradedDisplayColumns[colIndx]] = ''
          })
        }
        this.loading = false;
        this.PageLoading = false;
        //console.log("this.NonGradedDataSourceArray", this.NonGradedDataSourceArray)


      })
  }
  processEvaluationResult(data) {
    debugger;
    this.StudentEvaluationArray = [];
    const students: any = alasql("select  distinct StudentClassId from ?", [data]);
    let _studentEvaluationdata: any = [];
    //console.log("this.Result", this.Result);
    var _distinctEvaluationType = alasql('select distinct EvaluationMasterId,EvaluationName from ?', [this.EvaluationExamMap]);

    //for each student
    students.forEach(stud => {
      _studentEvaluationdata = data.filter(f => f.StudentClassId === stud.StudentClassId);
      _studentEvaluationdata.forEach(e => {
        let objExam = this.EvaluationExamMap.find(e => e.EvaluationExamMapId === e.EvaluationExamMapId);
        if (objExam)
          e.ExamId = objExam.ExamId;
      })
      // _studentEvaluationdata = data.reduce((filtered, option) => {
      //   if (option.StudentClassId === stud.StudentClassId) {

      //     let objExam = this.EvaluationExamMap.find(e => e.EvaluationExamMapId === option.EvaluationExamMapId);
      //     if (objExam)
      //       option.ExamId = objExam.ExamId;

      //     filtered.push(option);
      //   }
      //   return filtered;
      // }, []);
      this.StudentEvaluationList = [];

      //for each evaluation type
      _distinctEvaluationType.forEach(distinctevaluation => {

        this.StudentEvaluationList.push({
          Description: distinctevaluation.EvaluationName,
          EvaluationName: distinctevaluation.EvaluationName,
          EvaluationMasterId: distinctevaluation.EvaluationMasterId,
          QuestionnaireType: 'Evaluation Master'
        });

        var _oneEvaluationMultipExam = this.EvaluationExamMap.filter((f: any) => f.EvaluationMasterId == distinctevaluation.EvaluationMasterId);
        _oneEvaluationMultipExam = _oneEvaluationMultipExam.sort((a, b) => a.Sequence - b.Sequence)
        var ans: any[] = [];
        let existing: any = {};
        //foreach exam
        _oneEvaluationMultipExam.forEach(evalExam => {

          if (this.EvaluationDisplayedColumns.indexOf(evalExam.ExamName) == -1) {
            this.EvaluationDisplayedColumns.push(evalExam.ExamName);
          }
          var _classEvaluationExamMap = this.ClassEvaluations.filter((f: any) => f.EvaluationMasterId == evalExam.EvaluationMasterId
            && f.ExamId == evalExam.ExamId);

          _classEvaluationExamMap.forEach(clseval => {
            existing = _studentEvaluationdata.find((f: any) => f.ClassEvaluationId == clseval.ClassEvaluationId
              && f.EvaluationExamMapId == evalExam.EvaluationExamMapId);
            ans = [];
            if (existing) {
              clseval.ClassEvaluationOptions.forEach(cls => {
                var selected = existing.StudentEvaluationAnswers
                  .findIndex(stud => stud.ClassEvaluationAnswerOptionsId == cls.ClassEvaluationAnswerOptionsId)
                if (selected > -1)
                  ans.push(cls.Title);
              });
              if (existing.AnswerText.length > 0 && ans.length == 0)
                ans = existing.AnswerText
            }

            var _description = globalconstants.decodeSpecialChars(clseval.Description);
            // var row = this.StudentEvaluationList.filter((f:any) => f["Description"] == _description
            //   && f.EvaluationMasterId == clseval.EvaluationMasterId);
            var row = this.StudentEvaluationList.filter((f: any) => f["ClassEvaluationId"] == clseval.ClassEvaluationId
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
                ExamId: evalExam.ExamId,
                EvaluationName: evalExam.EvaluationName,
                EvaluationMasterId: evalExam.EvaluationMasterId,
                QuestionnaireType: clseval.QuestionnaireType,
                DisplayOrder: clseval.DisplayOrder
              });
            }
          })
        })//class evaluation
        this.StudentEvaluationList = this.StudentEvaluationList.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
        this.StudentEvaluationArray.push(this.StudentEvaluationList);
        //console.log("this.EvaluationArray", this.EvaluationArray);
      })//each evaluation exam map

      //this.StudentEvaluationArray.push(this.EvaluationArray);
    })
    console.log("this.StudentEvaluationArray", this.StudentEvaluationArray)
  }
  getDataSource(data) {
    return new MatTableDataSource<any>(data);
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

  GetProgressReport() {
    this.GetStudentSubject();
  }
  Houses: any[] = [];
  ETypes: any = [];
  ResultSummaryText: any = [];
  ResultSummaryCategory: any = [];
  GetMasterData() {
    debugger;
    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
    this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
    this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY);
    this.QuestionnaireTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
    this.ETypes = this.getDropDownData(globalconstants.MasterDefinitions.school.EVALUATIONTYPE);
    this.ReportCardSignatures = this.getDropDownData(globalconstants.MasterDefinitions.school.REPORTCARDSIGNATURE);
    this.ResultSummaryText = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMnCalculate);
    this.ResultSummaryCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CALCULATECATEGORIES);
    this.Batches = this.tokenStorage.getBatches()!;
    this.CommonHeader = this.getDropDownData(globalconstants.MasterDefinitions.common.COMMONPRINTHEADING);
    this.contentservice.GetClasses(this.filterOrgSubOrg).subscribe((data: any) => {
      this.Classes = [];
      let result = data.value ? data.value : data;
      result.forEach(m => {
        let obj = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Category = obj[0].MasterDataName.toLowerCase();
          this.Classes.push(m);
        }
      });
      this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
    });
    //var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroupMapping(this.filterOrgSubOrg, 1)
      .subscribe((data: any) => {
        this.ClassGroupMappings = [...data.value];
      })

    this.contentservice.GetClassGroups(this.filterOrgSubOrg)
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      });
    this.GetExams();
    this.GetOrganization();

  }
  GetExams() {

    var orgIdSearchstr = this.FilterOrgSubOrgBatchId +
      " and Active eq 1 and ReleaseResult eq 1"

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId", "ClassGroupId", "EndDate", "Sequence", "BatchId"];
    list.PageName = "Exams";
    list.filter = [orgIdSearchstr];
    //list.orderBy = "EndDate desc";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = [];
        var result = data.value.sort((a, b) => b.EndDate - a.EndDate);
        result.forEach(e => {
          var obj = this.ExamNames.find(n => n.MasterDataId === e.ExamNameId);
          if (obj)
            this.Exams.push({
              ExamId: e.ExamId,
              Sequence: e.Sequence,
              ExamName: obj.MasterDataName,
              ClassGroupId: e.ClassGroupId,
              BatchId: e.BatchId
            })
        })
        this.GetExamNCalculates();
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
    list.filter = [this.filterOrgSubOrg + " and Active eq 1"];
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
          this.GetEvaluationExamMap();

        }
        else {
          this.contentservice.openSnackBar("No answer option found.", globalconstants.ActionText, globalconstants.BlueBackground);
        }
        //this.loading = false; this.PageLoading=false;
      });

  }
  EvaluationExamMap: any[] = [];
  GetEvaluationExamMap() {

    let list: List = new List();
    list.fields = [
      'EvaluationExamMapId',
      'ExamId',
      'EvaluationMasterId',
      'Active',
    ];
    list.PageName = "EvaluationExamMaps";
    list.lookupFields = ["EvaluationMaster($select=Active,EvaluationMasterId,ClassGroupId,EvaluationName,ETypeId)"];
    list.filter = [this.filterOrgSubOrg + " and Active eq true"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.EvaluationExamMap = [];
        debugger;
        let _ExamName = '';
        let _etypeId = this.ETypes.find(e => e.MasterDataName.toLowerCase() == 'student profile').MasterDataId;
        data.value.forEach(f => {
          _ExamName = '';
          if (f.EvaluationMaster.Active && f.EvaluationMaster.ETypeId !== _etypeId) {
            let objexam = this.Exams.find(e => e.ExamId === f.ExamId)
            if (objexam) {
              _ExamName = objexam.ExamName;
              f.ClassGroupId = f.EvaluationMaster.ClassGroupId;
              f.ExamName = _ExamName;
              f.Sequence = objexam.Sequence;
              f.EvaluationName = f.EvaluationMaster.EvaluationName;
              this.EvaluationExamMap.push(f);
            }
          }
        });
        //this.GetClassEvaluations();
        //console.log("this.EvaluationExamMap", this.EvaluationExamMap)
      })
  }
  GetClassEvaluations() {
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    let filterStr = this.filterOrgSubOrg;
    let list: List = new List();
    list.fields = [
      'ClassEvaluationId',
      'QuestionnaireTypeId',
      'EvaluationMasterId',
      'DisplayOrder',
      'Description',
      'ExamId',
      'ClassEvaluationAnswerOptionParentId',
      'MultipleAnswer',
    ];
    //const obj = this.CurrentClassGroups.find(g => g.ClassGroupId === f.EvaluationMaster.ClassGroupId);
    this.CurrentClassGroups = globalconstants.getFilteredClassGroupMapping(this.ClassGroupMappings, _classId, _sectionId, _semesterId);
    this.EvaluationExamMap = this.EvaluationExamMap.filter(e => this.CurrentClassGroups.findIndex(i => i.ClassGroupId === e.EvaluationMaster.ClassGroupId) > -1)
    this.EvaluationExamMap.forEach(mapexam => {
      filterStr += " and EvaluationMasterId eq " + mapexam.EvaluationMasterId;
    })
    list.PageName = "ClassEvaluations";
    list.lookupFields = ["EvaluationMaster($select=ETypeId)"]
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassEvaluations = [];
        let _profileTypeId = this.ETypes.find(e => e.MasterDataName.toLowerCase() == 'student profile').MasterDataId;
        var _data = data.value.filter((f: any) => f.EvaluationMaster.ETypeId !== _profileTypeId);
        //if (_data.length > 0) {
        _data.forEach(clseval => {
          let obj = this.QuestionnaireTypes.find((f: any) => f.MasterDataId == clseval.QuestionnaireTypeId);
          if (obj) {
            clseval.Description = globalconstants.decodeSpecialChars(clseval.Description);
            clseval.QuestionnaireType = obj.MasterDataName
            clseval.ClassEvaluationOptions = this.ClassEvaluationOptionList.filter((f: any) => f.ParentId == clseval.ClassEvaluationAnswerOptionParentId)
            this.ClassEvaluations.push(clseval);
          }
        })
        //}
        this.StartEvaluation(_classId, _semesterId, _sectionId);
        this.loading = false; this.PageLoading = false;
      })
  }
  StudentEvaluationList: any[] = [];
  Result: any[] = [];
  StartEvaluation(pClassId, pSemesterId, pSectionId) {
    debugger;
    this.loading = true;
    this.StudentEvaluationList = [];
    this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;

    let filterStr = this.filterOrgSubOrg;

    filterStr += " and ClassId eq " + pClassId;
    if (pSemesterId) filterStr += " and SemesterId eq " + pSemesterId;
    if (pSectionId) filterStr += " and SectionId eq " + pSectionId;
    filterStr += " and BatchId eq " + this.SelectedBatchId + " and Active eq 1";

    let list: List = new List();
    list.fields = [
      'StudentEvaluationResultId',
      'StudentClassId',
      'StudentId',
      'ClassId',
      'SectionId',
      'SemesterId',
      'ClassEvaluationId',
      'EvaluationExamMapId',
      'AnswerText',
      'HistoryText',
      'Active'
    ];

    list.PageName = "StudentEvaluationResults";
    list.lookupFields = ["StudentEvaluationAnswers($filter=Active eq 1;$select=StudentEvaluationAnswerId,StudentEvaluationResultId,ClassEvaluationAnswerOptionsId,Active)"];

    list.filter = [filterStr];
    this.StudentEvaluationList = [];
    this.dataservice.get(list).subscribe((data: any) => {
      this.processEvaluationResult(data.value);
      this.GetGradedNonGradedSubjectMark();
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




