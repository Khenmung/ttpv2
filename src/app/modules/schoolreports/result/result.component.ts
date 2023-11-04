import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import alasql from 'alasql';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { TableUtil } from '../../../shared/TableUtil';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedClassStudentGrades: any[] = [];
  SelectedApplicationId = 0;
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  rowCount = 0;
  ExamName = '';
  ClassName = '';
  ExamStudentResult: IExamStudentResult[] = [];
  ClassFullMark = 0;
  ClassSubjectComponents: any[] = [];
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
  ExamStatuses: any[] = [];
  ExamNames: any[] = [];
  Exams: any[] = [];
  Batches: any[] = [];
  SubjectCategory: any[] = [];
  StudentSubjects: any[] = [];
  passdataSource: MatTableDataSource<IExamStudentResult>;
  promoteddataSource: MatTableDataSource<IExamStudentResult> = new MatTableDataSource();
  faildataSource: MatTableDataSource<IExamStudentResult> = new MatTableDataSource();
  AtAGlanceDatasource: MatTableDataSource<any>;
  allMasterData: any[] = [];
  Permission = 'deny';
  ExamId = 0;
  ExamStudentResultData = {
    ExamStudentResultId: 0,
    ExamId: 0,
    StudentClassId: 0,
    TotalMarks: 0,
    Grade: 0,
    Rank: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0,
    Active: 0,
    Action: false
  };
  displayedColumns = [
    "Rank",
    "Student",
    "Section",
    "RollNo",
    "TotalMarks",
    "Percent",
    "Division",

  ];
  failpromoteddisplayedColumns = [
    "Student",
    "Section",
    "RollNo",
    "TotalMarks",
    "Percent",
    "Division"
  ];
  AtAGlancedisplayedColumns = ["Text", "Val"];
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
      searchClassId: [0],
      searchSectionId: [0],
      searchSemesterId: [0]
    });
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
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.RESULT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        debugger;
        //var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);


        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.GetMasterData();
        this.GetSubjectComponents();
      }
    }
  }
  ExportArray() {
    debugger;
    if (this.ExamStudentResult.length > 0) {
      let _resultAtAGlance: any = [];
      this.ResultAtAGlance.forEach(item => {
        _resultAtAGlance.push({
          Student: item.Text,
          SectionId: item.Val
        })
      })
      let toExport = this.ExamStudentResult.concat(this.PromotedStudent, this.FailStudent, _resultAtAGlance);
      //console.log(toExport);
      const datatoExport: Partial<any>[] = toExport;
      TableUtil.exportArrayToExcel(datatoExport, this.ExamNameShort.replace(' ','_'));
      //TableUtil.exportArrayToExcel(this.ResultAtAGlance, this.ExamName);
    }
  }
  clear() { }
  GetStudentSubjects() {

    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";

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
        var _class = '';
        var _subject = '';
        var _section = '';
        this.StudentSubjects = data.value.map(s => {
          _class = '';
          _subject = '';

          let _stdClass = this.Classes.filter(c => c.ClassId == s.ClassSubject.ClassId);
          if (_stdClass.length > 0)
            _class = _stdClass[0].ClassName;

          let _stdSubject = this.Subjects.filter(c => c.MasterDataId == s.ClassSubject.SubjectId);
          if (_stdSubject.length > 0)
            _subject = _stdSubject[0].MasterDataName;

          let _stdSection = this.Sections.filter(c => c.MasterDataId == s.StudentClass.SectionId);
          if (_stdSection.length > 0)
            _section = _stdSection[0].MasterDataName;
          return {
            StudentClassSubjectId: s.StudentClassSubjectId,
            ClassSubjectId: s.ClassSubjectId,
            StudentClassId: s.StudentClassId,
            Student: s.StudentClass.RollNo,
            SubjectId: s.ClassSubject.SubjectId,
            Subject: _subject,
            ClassId: s.ClassSubject.ClassId,
            StudentId: s.StudentClass.StudentId,
            SectionId: s.StudentClass.SectionId
          }

        })
        this.loading = false; this.PageLoading = false;
      });
  }
  // GetStudents(classId) {
  //   //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
  //   var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"] + 
  //   ' and BatchId eq ' + this.SelectedBatchId + ' and Active eq 1';
  //   //var filterstr = 'Active eq 1';
  //   if (classId != undefined)
  //   orgIdSearchstr += ' and ClassId eq ' + classId

  //   let list: List = new List();
  //   list.fields = [
  //     "StudentClassId",
  //     "ClassId",
  //     "StudentId"
  //   ];
  //   list.PageName = "StudentClasses";
  //   list.lookupFields = ["Student($select=FirstName,LastName)"];
  //   list.filter = [orgIdSearchstr];

  //   return this.dataservice.get(list);

  // }
  ResultAtAGlance: any[] = [];
  PromotedStudent: any[] = [];
  FailStudent: any[] = [];
  ExamNameShort = '';
  GetExamStudentResults() {

    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    //this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.ExamStudentResult = [];
    //var orgIdSearchstr = this.FilterOrgSubOrgBatchId;
    var filterstr = '';
    var _examId = this.searchForm.get("searchExamId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;

    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _section = '';
    if (_sectionId > 0) {
      _section = " " + this.Sections.filter((s: any) => s.MasterDataId == _sectionId)[0].MasterDataName;
    }
    this.ClassName = this.Classes.filter(c => c.ClassId == _classId)[0].ClassName + _section;

    let objexamname = this.Exams.filter(c => c.ExamId == _examId);
    if (objexamname.length > 0)
      this.ExamNameShort = objexamname[0].ExamName;

    this.ExamName = "Exam: " + this.ExamNameShort;
    this.loading = true;

    filterstr = " and ClassId eq " + _classId;
    if (_semesterId == 0 && _sectionId == 0) {
    }
    else {
      filterstr += " and SemesterId eq " + _semesterId;
      filterstr += " and SectionId eq " + _sectionId;
    }
    filterstr += " and ExamId eq " + _examId + " and Active eq 1";

    let list: List = new List();
    list.fields = [
      //"StudentId,ClassId,SectionId,RollNo"
      "ExamStudentResultId,ExamId,ClassId,SectionId,StudentClassId,SemesterId,TotalMarks,Division,MarkPercent,Rank,Active"
    ];
    //list.PageName = "StudentClasses";
    list.PageName = "ExamStudentResults";
    //list.lookupFields = ["ExamStudentResults($filter=ExamId eq " + _examId + ";$select=ExamStudentResultId,ExamId,StudentClassId,TotalMarks,Division,MarkPercent,Rank,Active)"];
    list.filter = [this.FilterOrgSubOrgBatchId + filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //console.log("examresults1", data.value);
        var _students: any = this.tokenStorage.getStudents()!;
        var classMarks = this.ClassSubjectComponents.filter(c => c.ClassId == _classId);
        if (classMarks.length > 0)
          this.ClassFullMark = alasql("select ClassId,sum(FullMark) as FullMark from ? group by ClassId", [classMarks]);
        //  //console.log("data.value",data.value)
        this.ExamStudentResult = [];
        data.value.forEach(studcls => {
          var stud = _students.filter(st => st.StudentClasses.length > 0 && st.StudentClasses[0].StudentClassId == studcls.StudentClassId)
          //studcls.forEach(res => {
          if (stud.length > 0) {
            this.ExamStudentResult.push({
              ExamStudentResultId: studcls.ExamStudentResultId,
              ExamId: studcls.ExamId,
              StudentClassId: studcls.StudentClassId,
              Student: stud[0].FirstName + " " + (stud[0].LastName == null ? '' : stud[0].LastName),
              SectionId: studcls.SectionId,
              RollNo: stud[0].StudentClasses[0].RollNo,
              TotalMarks: studcls.TotalMarks,
              Division: studcls.Division,
              MarkPercent: studcls.MarkPercent,
              Rank: studcls.Rank,
              Active: studcls.Active,
              StudentClass: "",
              GradeId: 0,
              GradeType: ''
            })
          }
          //})
        })

        ////console.log("this.ExamStudentResult",this.ExamStudentResult);
        this.ExamStudentResult = this.ExamStudentResult.map((d: any) => {
          var _section = '';
          //var _gradeObj = this.SelectedClassStudentGrades[0].grades.filter((f:any) => f.StudentGradeId == d.Grade);
          var _sectionObj = this.Sections.filter((s: any) => s.MasterDataId == d["SectionId"]);
          if (_sectionObj.length > 0)
            _section = _sectionObj[0].MasterDataName;
          d["Section"] = _section;
          d["Percent"] = d["MarkPercent"];
          var _className = '';
          var _classObj = this.Classes.filter((s: any) => s.ClassId == d.ClassId);
          if (_classObj.length > 0)
            _className = _classObj[0].ClassName;
          d["ClassName"] = _className;
          //d["RollNo"] = d.StudentClass["RollNo"];
          //var _lastname = d.Student.LastN == null ? '' : " " + d["Student"].LastName;
          //d["Student"] = d["Student"].FirstName + _lastname;
          return d;

        })

        //this.ResultAtAGlance.push(atAGlance)
        var PassStudent = this.ExamStudentResult.filter(p => p.Division.toLowerCase() != 'promoted' && p.Division.toLowerCase() != 'fail');
        this.PromotedStudent = this.ExamStudentResult.filter(p => p.Division.toLowerCase() == 'promoted');
        this.FailStudent = this.ExamStudentResult.filter(p => p.Division.toLowerCase() == 'fail');
        var NOOFSTUDENT = this.ExamStudentResult.length;
        var passPercentWSP = parseFloat("" + ((PassStudent.length + this.PromotedStudent.length) / NOOFSTUDENT) * 100).toFixed(2);
        var passPercentWithoutSP = parseFloat("" + (PassStudent.length / NOOFSTUDENT) * 100).toFixed(2);
        this.ResultAtAGlance = [];
        this.ResultAtAGlance.push(
          { "Text": "No. Of Student", "Val": NOOFSTUDENT },
          { "Text": "No. Of Student Pass", "Val": PassStudent.length },
          { "Text": "No. Of Student Fail", "Val": this.FailStudent.length },
          { "Text": "No. Of Student Simple Pass", "Val": this.PromotedStudent.length },
          { "Text": "Pass Percentage with s.p", "Val": passPercentWSP },
          { "Text": "Pass Percentage without s.p", "Val": passPercentWithoutSP }
        );

        this.AtAGlanceDatasource = new MatTableDataSource(this.ResultAtAGlance);
        var _rank = 0;
        var _previouspercent = 0;
        PassStudent = PassStudent.sort((a, b) => b["Percent"] - a["Percent"])
        PassStudent.forEach(p => {
          if (_previouspercent != p["Percent"] && +p["Percent"] !== 0) {
            _rank += 1;
          }
          else if (+p["Percent"] === 0)
            _rank = 0;
          p.Rank = _rank;
          _previouspercent = p["Percent"];
        })
        //console.log("this.ExamStudentResult",this.ExamStudentResult)
        this.ExamStudentResult = this.GetRank(this.ExamStudentResult);
        this.ExamStudentResult = PassStudent.sort((a, b) => a.Rank - b.Rank)
        this.passdataSource = new MatTableDataSource(this.ExamStudentResult);
        this.passdataSource.paginator = this.paginator;
        this.passdataSource.sort = this.sort;

        this.promoteddataSource = new MatTableDataSource(this.PromotedStudent);
        this.faildataSource = new MatTableDataSource(this.FailStudent);
        this.loading = false; this.PageLoading = false;
      })
  }
  GetRank(pSortedresult) {
    let _rank, lastDigit;
    //console.log("pSortedresult",pSortedresult);
    pSortedresult.forEach(item => {
      _rank = item.Rank + "";
      lastDigit = _rank.substring(_rank.length - 1)
      switch (lastDigit) {
        case "0":
          if (_rank === "0" || _rank == 0)
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
    return pSortedresult;
  }
  GetStudentGradeDefn() {
    this.StudentGrades = [];
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetStudentGrade(filterOrgSubOrg)
      .subscribe((data: any) => {
        debugger;
        this.ClassGroupMapping.forEach(f => {
          var mapped = data.value.filter(d => d.ClassGroupId == f.ClassGroupId)
          var _grades: any[] = [];
          mapped.forEach(m => {
            _grades.push(
              {
                StudentGradeId: m.StudentGradeId,
                GradeName: m.GradeName,
                SubjectCategoryId: m.SubjectCategoryId,
                GradeType: this.SubjectCategory.filter((f: any) => f.MasterDataId == m.SubjectCategoryId)[0].MasterDataName,
                Formula: m.Formula,
                ClassGroupId: m.ClassGroupId
              })
          })
          f.grades = _grades;
          this.StudentGrades.push(f);
        })
      })
  }
  ClearData() {
    this.ExamStudentResult = [];
    this.passdataSource = new MatTableDataSource(this.ExamStudentResult);
    this.passdataSource.paginator = this.paginator;
    this.passdataSource.sort = this.sort;

    this.promoteddataSource = new MatTableDataSource();
    this.faildataSource = new MatTableDataSource();
  }
  SelectedClassCategory = '';
  ClassCategory: any[] = [];
  Defaultvalue = 0;
  Semesters: any[] = [];
  GetSelectedClassStudentGrade() {
    debugger;
    var _classId = this.searchForm.get("searchClassId")?.value;
    this.SelectedClassCategory = '';

    if (_classId > 0) {
      let obj = this.Classes.filter((f: any) => f.ClassId == _classId);
      if (obj.length > 0)
        this.SelectedClassCategory = obj[0].Category;
      this.SelectedClassStudentGrades = this.StudentGrades.filter((f: any) => f.ClassId == _classId);
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
  }
  ClassGroupMapping: any[] = [];
  FilteredClasses: any[] = [];
  GetClassGroupMapping() {
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroupMapping(filterOrgSubOrg, 1)
      .subscribe((data: any) => {
        let _classId = this.tokenStorage.getClassId();
        this.ClassGroupMapping = [];
        if (this.LoginUserDetail[0]["RoleUsers"][0].role.toLowerCase() == 'student') {
          data.value.map(f => {
            f.ClassName = f.Class.ClassName;
            if (f.ClassId == _classId)
              this.ClassGroupMapping.push(f);
          });
        }
        else {
          data.value.map(f => {
            f.ClassName = f.Class.ClassName;
            this.ClassGroupMapping.push(f);
          });
        }
        this.GetStudentGradeDefn();
      })
  }
  // FilterClass() {
  //   debugger;
  //   var _examId = this.searchForm.get("searchExamId")?.value
  //   var _classGroupId = 0;
  //   var objExam = this.Exams.filter((f:any) => f.ExamId == _examId);
  //   if (objExam.length > 0)
  //     _classGroupId = objExam[0].ClassGroupId;
  //   this.FilteredClasses = this.ClassGroupMapping.filter((f:any) => f.ClassGroupId == _classGroupId);
  // }
  ExamReleased = 0;
  ExamClassGroups: any[] = [];
  FilterClass() {
    debugger;
    var _examId = this.searchForm.get("searchExamId")?.value
    //var _classGroupId = 0;
    this.ExamReleased = 0;
    this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg, _examId)
      .subscribe((data: any) => {
        this.ExamClassGroups = [...data.value];
        this.FilteredClasses = this.ClassGroupMapping.filter((f: any) => this.ExamClassGroups.findIndex(fi => fi.ClassGroupId == f.ClassGroupId) > -1);
      });

    var obj = this.Exams.filter((f: any) => f.ExamId == _examId);
    if (obj.length > 0) {
      this.ExamReleased = obj[0].ReleaseResult;
    }

  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.Sections = this.Sections.filter((s: any) => s.MasterDataName != 'N/A');
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
    this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.Batches = this.tokenStorage.getBatches()!;
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroups(filterOrgSubOrg)
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      });
    this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      this.Classes = [];


      data.value.map(m => {
        let obj = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Category = obj[0].MasterDataName.toLowerCase();
          this.Classes.push(m);
        }
      });
      if (this.LoginUserDetail[0]["RoleUsers"][0].role.toLowerCase() == 'student') {
        let _classId = this.tokenStorage.getClassId();
        this.Classes = this.Classes.filter(c => c.ClassId == _classId);
      }
      else
        this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
    });
    this.GetExams();
    //this.GetStudentSubjects();
    this.GetClassGroupMapping();
  }

  GetExams() {

    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId, 1)
      .subscribe((data: any) => {
        this.Exams = [];
        var result = data.value.filter((f: any) => f.ReleaseResult == 1);
        result.map(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId
            })
        })
      })
  }
  GetSubjectComponents() {

    //var orgIdSearchstr = this.FilterOrgSubOrgBatchId;// 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    this.loading = true;
    let list: List = new List();

    list.fields = ["ClassSubjectMarkComponentId", "SubjectComponentId", "ClassSubjectId", "FullMark"];
    list.PageName = "ClassSubjectMarkComponents";
    list.lookupFields = ["ClassSubject($filter=Active eq 1;$select=ClassId)"];
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
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
  SectionId: number;
  RollNo: number;
  StudentClass: {},
  TotalMarks: number;
  MarkPercent: number;
  Division: string;
  GradeId: number;
  GradeType: string;
  Rank: number;
  Student: string;
  //OrgId: number;SubOrgId: number;
  //BatchId: number;
  Active: number;
  //Action: boolean

}



