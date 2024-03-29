import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
import { TableUtil } from '../../../shared/TableUtil';
import { evaluate } from 'mathjs';
import moment from 'moment';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  PageLoading = true;
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

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
  GetDataSource(data, indx) {
    const ds = new MatTableDataSource<any>(data);
    // ds.paginator = this.paginator.toArray()[indx];
    // ds.sort = this.sort.toArray()[indx];  
    return ds;
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
      this.DisplayCategories.forEach(data => {
        this.ExamStudentResult.concat(data);
      })
      let toExport = this.ExamStudentResult.concat(_resultAtAGlance);
      //console.log(toExport);
      const datatoExport: Partial<any>[] = toExport;
      TableUtil.exportArrayToExcel(datatoExport, this.ExamNameShort.replace(' ', '_'));
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
  ExamNCalculateList: any = [];
  GetExamNCalculates() {

    var orgIdSearchstr = this.FilterOrgSubOrg + ' and Active eq true';
    let _examId = this.searchForm.get("searchExamId")?.value;
    orgIdSearchstr += " and ExamId eq " + _examId;

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
          let exResult = this.ExamResultProperties.find(f => f.MasterDataId === item.CalculateResultPropertyId);
          let exCat = this.CalculateCategories.find(f => f.MasterDataId === item.CalculateCategoryId);
          if (exResult) {
            item.PropertyName = exResult.MasterDataName;
            if (exCat) {
              item.CalculateCategoryName = exCat.MasterDataName;
              this.ExamNCalculateList.push(item);
            }
          }
        });
        this.ExamNCalculateList = this.ExamNCalculateList.sort((a, b) => a.Sequence - b.Sequence);
        this.GetExamStudentResults();
      })

  }
  ResultAtAGlance: any[] = [];
  DisplayCategories: any[] = [];
  //FailStudent: any[] = [];
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
      _section = " " + this.Sections.find((s: any) => s.MasterDataId == _sectionId).MasterDataName;
    }
    this.ClassName = this.Classes.find(c => c.ClassId == _classId).ClassName + _section;

    let objexamname = this.Exams.find(c => c.ExamId == _examId);
    if (objexamname)
      this.ExamNameShort = objexamname.ExamName;

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

        this.ExamStudentResult = [];
        let objResCategory: any = [];
        data.value.forEach(studcls => {
          var stud = _students.filter(st => st.StudentClasses.length > 0 && st.StudentClasses[0].StudentClassId == studcls.StudentClassId)
          objResCategory = [];
          this.SelectedClassStudentGrades.forEach(rc => {

            let obj = rc.grades.find(i => i.GradeName === studcls.Division)
            if (obj)
              objResCategory.push(obj);

          });
          let _rescatname = '';
          let AssignRank = false;
          if (objResCategory.length > 0) {
            _rescatname = objResCategory[0].ResultCategory;
            AssignRank = objResCategory[0].AssignRank;
          }
          else
            console.log("studcls", studcls)
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
              ResultCategory: _rescatname,
              MarkPercent: studcls.MarkPercent,
              Rank: studcls.Rank,
              AssignRank: AssignRank,
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
          var _sectionObj = this.Sections.find((s: any) => s.MasterDataId == d["SectionId"]);
          if (_sectionObj)
            _section = _sectionObj.MasterDataName;
          d["Section"] = _section;
          d["Percent"] = d["MarkPercent"];
          var _className = '';
          var _classObj = this.Classes.find((s: any) => s.ClassId == d.ClassId);
          if (_classObj)
            _className = _classObj.ClassName;
          d["ClassName"] = _className;
          //d["RollNo"] = d.StudentClass["RollNo"];
          //var _lastname = d.Student.LastN == null ? '' : " " + d["Student"].LastName;
          //d["Student"] = d["Student"].FirstName + _lastname;
          return d;

        })

        //assign rank
        let onlyAssignRank = this.ExamStudentResult.filter(rnk => rnk.AssignRank)
        var _rank = 0;
        var _previouspercent = 0;
        onlyAssignRank = onlyAssignRank.sort((a, b) => b["Percent"] - a["Percent"])
        onlyAssignRank.forEach(p => {
          if (_previouspercent != p["Percent"] && +p["Percent"] !== 0) {
            _rank += 1;
          }
          else if (+p["Percent"] === 0)
            _rank = 0;
          p.Rank = _rank;
          _previouspercent = p["Percent"];
        })
        //end assign rank

        //let _resultCategories: any = [];
        let _ValueForFormula: any = [];
        let res: any = [];
        this.DisplayCategories = [];
        //console.log("ExamStudentRe this.ResultCategoriessult0", this.ResultCategories);
        let see = this.ExamStudentResult.map(m => m.ResultCategory + "-" + m.Division);
        for (let i = 0; i < this.ResultCategories.length; i++) {

          //this.ResultCategories.forEach((cat: any, idx) => {
          res = this.ExamStudentResult.reduce((filtered: any, option: any) => {
            if (option.ResultCategory && option.ResultCategory.toLowerCase() === this.ResultCategories[i].MasterDataName.toLowerCase())
              filtered.push(option);
            return filtered;
          }, []);

          _ValueForFormula.push({ "Text": "[" + this.ResultCategories[i].MasterDataName + "]", "Val": res.length })
          if (res.length > 0) {
            res = res.sort((a, b) => a.Rank - b.Rank);
            this.DisplayCategories.push(res);
          }
          else {
            this.ResultCategories.splice(i,1);
            i-=1;
          }
        }

        var NOOFSTUDENT = this.ExamStudentResult.length;
        _ValueForFormula.push({ "Text": "[NoOfStudents]", "Val": NOOFSTUDENT });
       // console.log("ExamStudentRe this.ResultCategoriessult1", this.ResultCategories);
        this.ResultAtAGlance = [];
        let onlyAtAGlance = this.ExamNCalculateList.filter(ataglance => ataglance.CalculateCategoryName.toLowerCase() === "at a glance")
        let formula: any = '';
        onlyAtAGlance.forEach(item => {

          formula = item.Formula
          for (var i = 0; i < _ValueForFormula.length; i++) {
            formula = formula.replaceAll(_ValueForFormula[i].Text, _ValueForFormula[i].Val);
          }
          //console.log("formula",formula);
          let objresult = evaluate(formula);
          if (objresult) {
            this.ResultAtAGlance.push(
              { "Text": item.PropertyName, "Val": (objresult % 1) ? objresult.toFixed(2) : objresult }
            );
          }
        })
        // // var passPercentWSP = parseFloat("" + ((PassStudent.length + this.PromotedStudent.length) / NOOFSTUDENT) * 100).toFixed(2);
        // // var passPercentWithoutSP = parseFloat("" + (PassStudent.length / NOOFSTUDENT) * 100).toFixed(2);
        // this.ResultAtAGlance = [];
        // this.ResultAtAGlance.push(
        //   { "Text": "No. Of Student", "Val": NOOFSTUDENT },
        //   { "Text": "No. Of Student Pass", "Val": PassStudent.length },
        //   { "Text": "No. Of Student Fail", "Val": this.FailStudent.length },
        //   { "Text": "No. Of Student Simple Pass", "Val": this.PromotedStudent.length },
        //   { "Text": "Pass Percentage with s.p", "Val": passPercentWSP },
        //   { "Text": "Pass Percentage without s.p", "Val": passPercentWithoutSP }
        // );

        this.AtAGlanceDatasource = new MatTableDataSource(this.ResultAtAGlance);

        //console.log("this.ExamStudentResult", this.ExamStudentResult)
        this.ExamStudentResult = this.GetRankText(this.ExamStudentResult);
        this.ExamStudentResult = onlyAssignRank.sort((a, b) => a.Rank - b.Rank);
        // this.passdataSource = new MatTableDataSource(this.ExamStudentResult);
        // this.passdataSource.paginator = this.paginator;
        // this.passdataSource.sort = this.sort;

        // this.promoteddataSource = new MatTableDataSource(this.PromotedStudent);
        // this.faildataSource = new MatTableDataSource(this.FailStudent);
        this.loading = false; this.PageLoading = false;
      })
  }
  GetRankText(pSortedresult) {
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
        let _grades: any[] = [];
        let _resultCatName = '', _gradeType = '';
        this.ClassGroupMapping.forEach(f => {
          var mapped = data.value.filter(d => d.ClassGroupId == f.ClassGroupId)
          _grades = [];

          mapped.forEach(l => {
            _resultCatName = '';
            _gradeType = '';
            let obj = this.SubjectCategory.find((f: any) => f.MasterDataId == l.SubjectCategoryId)
            if (obj)
              _gradeType = obj.MasterDataName
            let objResultCat = this.ResultCategories.find(m => m.MasterDataId === l.ResultCategoryId)
            if (objResultCat) {
              _resultCatName = objResultCat.MasterDataName;
              _grades.push(
                {
                  StudentGradeId: l.StudentGradeId,
                  GradeName: l.GradeName,
                  SubjectCategoryId: l.SubjectCategoryId,
                  GradeType: _gradeType,
                  Formula: l.Formula,
                  ResultCategory: _resultCatName,
                  ClassGroupId: l.ClassGroupId,
                  AssignRank: l.AssignRank,
                  ExamId: l.ExamId
                })
            }
          })
          f.grades = _grades;
          this.StudentGrades.push(f);
        })
      })
  }
  ClearData() {
    this.ExamStudentResult = [];
    this.passdataSource = new MatTableDataSource(this.ExamStudentResult);
    // this.passdataSource.paginator = this.paginator;
    // this.passdataSource.sort = this.sort;

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
    var _examId = this.searchForm.get("searchExamId")?.value;
    this.SelectedClassCategory = '';

    if (_classId > 0) {
      let obj = this.Classes.find((f: any) => f.ClassId == _classId);
      if (obj)
        this.SelectedClassCategory = obj.Category;
      this.SelectedClassStudentGrades = this.StudentGrades.filter((f: any) => f.ClassId === _classId
        && f.grades.find(e => e.ExamId === _examId));
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
        this.FilteredClasses = this.FilteredClasses.sort((a, b) => a.Class.Sequence - b.Class.Sequence);
      });

    var obj = this.Exams.filter((f: any) => f.ExamId == _examId);
    if (obj.length > 0) {
      this.ExamReleased = obj[0].ReleaseResult;
    }

  }
  ResultCategories: any = [];
  ExamResultProperties: any = [];
  CalculateCategories: any = [];
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
    this.ResultCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.RESULTCATEGORIES);
    this.ExamResultProperties = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMnCalculate);
    this.CalculateCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.CALCULATECATEGORIES);
    this.CommonHeader = this.getDropDownData(globalconstants.MasterDefinitions.common.COMMONPRINTHEADING);
    
    this.Batches = this.tokenStorage.getBatches()!;
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroups(filterOrgSubOrg)
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      });
    this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      this.Classes = [];

      data.value.map(m => {
        let obj = this.ClassCategory.find((f: any) => f.MasterDataId == m.CategoryId);
        if (obj) {
          m.Category = obj.MasterDataName.toLowerCase();
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
    this.GetOrganization();
    this.GetExams();
    //this.GetStudentSubjects();
    this.GetClassGroupMapping();
  }
  logourl = "";
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

        this.loading = false; this.PageLoading = false;
      });
    ////console.log("this.Organization[0]",this.Organization[0])
    ////console.log("this.CommonHeader",this.CommonHeader)
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
  ResultCategory: string;
  Rank: number;
  AssignRank: boolean;
  Student: string;
  //OrgId: number;SubOrgId: number;
  //BatchId: number;
  Active: number;
  //Action: boolean

}



