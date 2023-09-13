import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';

@Component({
  selector: 'app-evaluationresultlist',
  templateUrl: './evaluationresultlist.component.html',
  styleUrls: ['./evaluationresultlist.component.scss']
})
export class EvaluationresultlistComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  EvaluationUpdatable = false;
  RowsToUpdate = -1;
  EvaluationStarted = false;
  EvaluationSubmitted = false;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ClassSubjects: any[] = [];
  Ratings: any[] = [];
  SelectedApplicationId = 0;
  StudentClassId = 0;
  StudentId = 0;
  ClassId = 0;
  Permission = '';
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  AssessmentTypeList: any[] = [];
  StudentEvaluationList: any[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
  //EvaluationStatuses :any =[];
  QuestionnaireTypes: any[] = [];
  Sections: any[] = [];
  Classes: any[] = [];
  ClassEvaluations: any[] = [];
  AssessmentTypeDatasource: MatTableDataSource<any>;
  RatingOptions: any[] = [];
  dataSource: MatTableDataSource<any>;
  allMasterData: any[] = [];
  EvaluationMaster: any[] = [];
  Exams: any[] = [];
  ExamNames: any[] = [];
  SelectedClassSubjects: any[] = [];
  StudentClasses: any[] = [];
  Students: any[] = [];
  PrintHeading: any[] = [];
  ClassGroups: any[] = [];
  ClassGroupMappings: any[] = [];
  Result: any[] = [];
  StudentName = '';
  EvaluatedStudent: any[] = [];
  StudentEvaluationListColumns = [
    'Name',
    'TotalMark'
  ];
  AssessmentPrintHeading: any[] = [];
  ClassEvaluationOptionList: any[] = [];
  filteredStudents: Observable<IStudent[]>;
  StudentEvaluationForUpdate: any[] = [];
  displayedColumns = [
    'Description',
    'Points',
    'Action'
  ];
  EvaluationExamMap: any[] = [];
  ExamClassGroups: any[] = [];
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
    debugger;
    this.searchForm = this.fb.group({
      searchStudentName: [0],
      searchEvaluationMasterId: [0],
      searchClassId: [0],
      searchSubjectId: [0],
      searchSectionId: [0],
      searchSemesterId: [0],
      searchExamId: [0]
    });
    this.filteredStudents = this.searchForm.get("searchStudentName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.FullName),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      )!;
    //this.ClassId = this.tokenStorage.getClassId()!;
    this.PageLoad();

  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.FullName.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.FullName ? user.FullName : '';
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EVALUATIONRESULT)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetEvaluationNames();

        this.GetEvaluationOption();
        // if (this.Classes.length == 0) {
        //   var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        //   this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
        //     this.Classes = [...data.value];
        //   });
        // }

        //this.Students = this.tokenStorage.getStudents()!;
        //this.GetStudentClasses();

      }
    }
  }
  getExamClassGroup(pExamId) {
    this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg, pExamId)
      .subscribe((data: any) => {
        this.ExamClassGroups = [...data.value];
      });
  }
  FullMark = 0; PassMark = 0; MarkObtain = 0;
  GetEvaluatedStudent(row) {
    debugger;
    this.loading = true;
    this.StudentEvaluationList = [];
    this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;

    var _searchEvaluationMasterId = this.searchForm.get("searchEvaluationMasterId")?.value;
    //var _studentObj = this.searchForm.get("searchStudentName")?.value;

    var _evaluationobj = this.EvaluationMaster.filter((f: any) => f.EvaluationMasterId == _searchEvaluationMasterId)
    if (_evaluationobj.length > 0) {
      this.FullMark = _evaluationobj[0].FullMark;
      this.PassMark = _evaluationobj[0].PassMark;
    }
    //  _studentObj["AssessmentName"] = _evaluationobj[0].EvaluationName;

    this.StudentName = row.Name;
    this.StudentClassId = row.StudentClassId;
    this.StudentId = row.StudentId;

    this.ApplyVariables(row);

    let filterStr = this.FilterOrgSubOrg;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    if (this.EvaluationUpdatable)
      filterStr += ' and StudentId eq ' + row.StudentId
    else {
      filterStr += ' and StudentClassId eq ' + row.StudentClassId
      filterStr += ' and EvaluationExamMapId eq ' + row.EvaluationExamMapId
    }
    var _classEvaluations = this.ClassEvaluations.filter((f: any) => f.EvaluationMasterId == row.EvaluationMasterId
      && (!f.ExamId || f.ExamId == row.ExamId));
    let list: List = new List();
    list.fields = [
      'StudentEvaluationResultId',
      'StudentClassId',
      'StudentId',
      'ClassEvaluationId',
      'EvaluationExamMapId',
      'AnswerText',
      'Points',
      'History',
      'Active'
    ];

    list.PageName = "StudentEvaluationResults";
    list.lookupFields = ["StudentEvaluationAnswers($select=StudentEvaluationAnswerId,StudentEvaluationResultId,ClassEvaluationAnswerOptionsId,Active)"];

    list.filter = [filterStr];
    this.StudentEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger
        this.Result = [...data.value]
        //console.log("data.value", data.value);
        //console.log("_classEvaluations", _classEvaluations);
        var item;
        _classEvaluations.forEach(clseval => {
          var existing = this.Result.filter((f: any) => f.ClassEvaluationId == clseval.ClassEvaluationId);
          if (existing.length > 0) {

            clseval.ClassEvaluationOptions.forEach(cls => {
              var selectedorNot = existing[0].StudentEvaluationAnswers
                .filter(stud => stud.ClassEvaluationAnswerOptionsId == cls.ClassEvaluationAnswerOptionsId)
              if (selectedorNot.length > 0) {
                selectedorNot.forEach(answer => {
                  if (answer.Active == 1)
                    cls.checked = true;
                  cls.StudentEvaluationAnswerId = answer.StudentEvaluationAnswerId
                })
              }
              else {
                cls.checked = false;
                cls.StudentEvaluationAnswerId = 0;
              }
            })
            let answerId = 0;
            let _markobtained = 0;
            if (existing[0].StudentEvaluationAnswers.length > 0) {
              answerId = existing[0].StudentEvaluationAnswers[0].ClassEvaluationAnswerOptionsId;
              _markobtained = clseval.ClassEvaluationOptions.filter(g => g.ClassEvaluationAnswerOptionsId == answerId)[0].Point;
            }
            item = {
              ClassEvaluationOptions: clseval.ClassEvaluationOptions,
              StudentEvaluationAnswers: existing[0].StudentEvaluationAnswers,
              StudentClassId: this.StudentClassId,
              StudentId: this.StudentId,
              CatSequence: clseval.DisplayOrder,
              Points: existing[0].Points ? existing[0].Points : _markobtained,
              DefinedPoint: clseval.Point,
              ClassEvaluationAnswerOptionParentId: clseval.ClassEvaluationAnswerOptionParentId,
              EvaluationExamMapId: existing[0].EvaluationExamMapId,
              Description: globalconstants.decodeSpecialChars(clseval.Description),
              AnswerText: globalconstants.decodeSpecialChars(existing[0].AnswerText),
              History: globalconstants.decodeSpecialChars(existing[0].History),
              StudentEvaluationResultId: existing[0].StudentEvaluationResultId,
              ClassEvaluationId: clseval.ClassEvaluationId,
              Active: existing[0].Active,
              EvaluationMasterId: row.EvaluationMasterId,
              MultipleAnswer: clseval.MultipleAnswer,
              QuestionnaireTypeId: clseval.QuestionnaireTypeId,
              QuestionnaireType: clseval.QuestionnaireType,
              DisplayOrder: clseval.DisplayOrder,
              Action: false
            }
            this.StudentEvaluationList.push(JSON.parse(JSON.stringify(item)));
          }
          else if (clseval.QuestionnaireType == 'Heading' || clseval.QuestionnaireType == 'Sub Heading') {
            clseval.ClassEvaluationOptions.forEach(f => f.checked = false);
            item = {
              ClassEvaluationOptions: clseval.ClassEvaluationOptions,
              StudentClassId: this.StudentClassId,
              StudentId: this.StudentId,
              CatSequence: clseval.DisplayOrder,
              AnswerOptionsId: 0,
              Description: globalconstants.decodeSpecialChars(clseval.Description),
              AnswerText: '',
              History: '',
              Points: clseval.Point ? clseval.Point : 0,
              DefinedPoint: clseval.Point,
              StudentEvaluationResultId: 0,
              ClassEvaluationAnswerOptionParentId: clseval.ClassEvaluationAnswerOptionParentId,
              EvaluationExamMapId: row.EvaluationExamMapId,
              ClassEvaluationId: clseval.ClassEvaluationId,
              Active: 0,
              EvaluationMasterId: row.EvaluationMasterId,
              MultipleAnswer: clseval.MultipleAnswer,
              QuestionnaireTypeId: clseval.QuestionnaireTypeId,
              QuestionnaireType: clseval.QuestionnaireType,
              DisplayOrder: clseval.DisplayOrder,
              StudentEvaluationAnswers: [],
              Action: false
            }
            this.StudentEvaluationList.push(JSON.parse(JSON.stringify(item)));
          }

        })
        if (this.StudentEvaluationList.length == 0) {
          this.StudentEvaluationList = [];
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        else
          this.StudentEvaluationList = this.StudentEvaluationList.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
        this.MarkObtain = this.GetMarkObtain();
        row.EvaluationStarted = true;
        this.dataSource = new MatTableDataSource<IStudentEvaluation>(this.StudentEvaluationList);
        this.dataSource.paginator = this.paginator;
        this.loading = false; this.PageLoading = false;
      })
  }
  GetAllEvaluatedStudentMarks() {
    debugger;
    this.loading = true;
    let StudentResultList: any = [];
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;

    let _searchEvaluationMasterId = this.searchForm.get("searchEvaluationMasterId")?.value;
    let _classId = this.searchForm.get("searchClassId")?.value;
    let _sectionId = this.searchForm.get("searchSectionId")?.value;
    let _semesterId = this.searchForm.get("searchSemesterId")?.value;
    let _examId = this.searchForm.get("searchExamId")?.value;
    let _FullMark = 0, _PassMark = 0;
    var _evaluationobj = this.EvaluationMaster.filter((f: any) => f.EvaluationMasterId == _searchEvaluationMasterId)
    if (_evaluationobj.length > 0) {
      _FullMark = _evaluationobj[0].FullMark;
      _PassMark = _evaluationobj[0].PassMark;
    }

    let filterStr = this.FilterOrgSubOrg;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    let _evaluationExamMapIdObj = this.EvaluationExamMap.filter((f: any) => f.EvaluationMasterId == _searchEvaluationMasterId
      && f.ExamId == _examId);
    if (_evaluationExamMapIdObj.length > 0)
      filterStr += ' and EvaluationExamMapId eq ' + _evaluationExamMapIdObj[0].EvaluationExamMapId;

    var _classEvaluations = this.ClassEvaluations.filter((f: any) => f.EvaluationMasterId == _searchEvaluationMasterId
      && (!f.ExamId || f.ExamId == _examId));
    let list: List = new List();
    list.fields = [
      'StudentEvaluationResultId',
      'StudentClassId',
      'StudentId',
      'ClassEvaluationId',
      'Points',
    ];

    list.PageName = "StudentEvaluationResults";

    list.filter = [filterStr];
    this.StudentEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger
        this.Result = [...data.value]
        //console.log("data.value", data.value);
        //console.log("_classEvaluations", _classEvaluations);
        var item;
        this.EvaluatedStudent.forEach(st => {
          let _mark = 0;
          _classEvaluations.forEach(clseval => {

            var existing = this.Result.filter((f: any) => f.StudentClassId == st.StudentClassId
              && f.ClassEvaluationId == clseval.ClassEvaluationId);

            if (existing.length > 0) {
              _mark += existing[0].Points;
            }

          })
          item = {
            EvaluationResultMarkId: st.EvaluationResultMarkId,
            StudentClassId: st.StudentClassId,
            ClassId: _classId,
            SectionId: _sectionId,
            SemesterId: _semesterId,
            //ExamId: _examId,
            EvaluationExamMapId: _evaluationExamMapIdObj[0].EvaluationExamMapId,
            //EvaluationMasterId: _searchEvaluationMasterId,
            TotalMark: _mark,
            Rank: 0,
            //Division: '',
            TestStatusId: 0,
            Pc: 0,
            Active: true,
            SubOrgId: this.SubOrgId,
            OrgId: this.LoginUserDetail[0]["orgId"],
            CreatedDate: new Date(),
            CreatedBy: this.LoginUserDetail[0]['orgId']
          }
          StudentResultList.push(item);

        })
        StudentResultList = StudentResultList.sort((a, b) => a.TotalMark - b.TotalMark);
        let _previousMark = 0;
        StudentResultList.forEach((r, indx) => {
          if (_previousMark != r.TotalMark)
            r.Rank = indx + 1;
          r.TestStatusId = 0;
          // if(r.TotalMark<_PassMark)
          // {
          //   r.TestStatusId =this.EvaluationStatuses.filter(s=>s.MasterDataName.toLowerCase()) 
          // }
          if (_FullMark > 0)
            r.Pc = +(r.TotalMark / _FullMark * 100).toFixed(2);
          _previousMark = r.TotalMark;
        })
       // console.log("StudentResultList", StudentResultList);
        this.NoOfRecordToUpdate=0;
        this.insert(StudentResultList);
        // this.loading = false;
        // this.PageLoading = false;
      })
  }
  GetMarkObtain() {
    let _mark = 0;
    this.StudentEvaluationList.forEach(f => {
      _mark += f.Points ? +f.Points : 0;
    })
    return _mark;
  }
  ApplyVariables(studentInfo) {
    //console.log("studentInfo", studentInfo)
    //console.log("this.AssessmentPrintHeading", this.AssessmentPrintHeading)
    this.PrintHeading = JSON.parse(JSON.stringify(this.AssessmentPrintHeading));
    this.PrintHeading.forEach((stud, indx) => {
      Object.keys(studentInfo).forEach(studproperty => {
        if (stud.Description.includes(studproperty)) {
          this.PrintHeading[indx].Description = stud.Description.replaceAll("[" + studproperty + "]", studentInfo[studproperty]);
        }
      });
    })

  }
  trackCategories(indx, item) {
    return this.StudentEvaluationList.filter((f: any) => f.ClassEvalCategoryId == item.ClassEvalCategoryId)
  }
  GetExams() {
    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId, 1)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.map(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId,
              AttendanceStartDate: e.AttendanceStartDate
            })
        })
        this.contentservice.GetEvaluationExamMaps(this.FilterOrgSubOrg, 1)
          .subscribe((data: any) => {
            data.value.forEach(m => {

              let EvaluationObj = this.EvaluationMaster.filter((f: any) => f.EvaluationMasterId == m.EvaluationMasterId);
              if (EvaluationObj.length > 0) {
                m.EvaluationName = EvaluationObj[0].EvaluationName;
                m.Duration = EvaluationObj[0].Duration;

                var _clsObj = this.ClassGroups.filter((f: any) => f.ClassGroupId == EvaluationObj[0].ClassGroupId);
                if (_clsObj.length > 0) {
                  m.ClassGroupName = _clsObj[0].MasterDataName;
                  m.ClassGroupId = EvaluationObj[0].ClassGroupId;
                  var _examObj = this.Exams.filter((f: any) => f.ExamId == m.ExamId);
                  if (_examObj.length > 0)
                    m.ExamName = _examObj[0].ExamName
                  else
                    m.ExamName = '';
                  m.Action1 = true;
                  this.EvaluationExamMap.push(m);
                }
                else
                  m.ClassGroupName = '';

              }
            })
            //this.EvaluationClassGroup = [...data.value];
            this.loading = false; this.PageLoading = false;
          })
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
  BindSectionSemester() {
    let _classId = this.searchForm.get("searchClassId")?.value;
    let obj = this.Classes.filter(c => c.ClassId == _classId);
    if (obj.length > 0) {
      this.SelectedClassCategory = obj[0].Category.toLowerCase();
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();
  }
  ClearData() {
    this.EvaluatedStudent = [];
    this.AssessmentTypeDatasource = new MatTableDataSource<any>(this.EvaluatedStudent);
    this.StudentEvaluationList = [];
    this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
    let _classId = this.searchForm.get("searchClassId")?.value;
    let _sectionId = this.searchForm.get("searchSectionId")?.value;
    let _semesterId = this.searchForm.get("searchSemesterId")?.value;
    this.SelectedClassSubjects = globalconstants.getFilteredClassSubjects(this.ClassSubjects, _classId, _sectionId, _semesterId);
  }
  GetClassSubjects() {
    let list = new List();
    list.PageName = "ClassSubjects";
    list.fields = ["ClassSubjectId,ClassId,SubjectId,SemesterId,SectionId"];
    //list.filter = ['Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = data.value.map(m => {
          var _subjectname = "";
          var subjectobj = this.allMasterData.filter((f: any) => f.MasterDataId == m.SubjectId);
          if (subjectobj.length > 0)
            _subjectname = subjectobj[0].MasterDataName;
          m.SubjectName = _subjectname;

          return m;

        });

      });
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.QuestionnaireTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
    //this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP);
    this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    //this.EvaluationStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EVALUATIONSTATUS);
    this.AssessmentPrintHeading = this.getDropDownData(globalconstants.MasterDefinitions.school.ASSESSMENTPRINTHEADING);
    //console.log("this.AssessmentPrintHeading",this.AssessmentPrintHeading)
    this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      });
    // var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    //       this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
    //   this.Classes = [...data.value];
    // });
    this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
      data.value.forEach(m => {
        let obj = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Category = obj[0].MasterDataName.toLowerCase();
          this.Classes.push(m);
        }
      });
      this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
    });
    this.GetExams();
    this.GetClassSubjects();
    this.GetClassEvaluations();
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroupMapping(filterOrgSubOrg, 1)
      .subscribe((data: any) => {
        this.ClassGroupMappings = data.value.map(m => {
          m.ClassName = m.Class.ClassName;
          return m;
        });
      })

  }
  onBlur(row) {
    debugger;
    let _MarkObtain = this.GetMarkObtain();
    if (this.FullMark < _MarkObtain) {
      this.contentservice.openSnackBar("Mark obtained can not be greater than full mark.", globalconstants.ActionText, globalconstants.RedBackground);
    }
    else
      row.Action = true;
  }
  CategoryChanged(row) {
    debugger;
    row.Action = true;
    var item = this.StudentEvaluationList.filter((f: any) => f.StudentEvaluationId == row.StudentEvaluationId);
    item[0].SubCategories = this.allMasterData.filter((f: any) => f.ParentId == row.CategoryId);

    this.dataSource = new MatTableDataSource(this.StudentEvaluationList);
  }
  UpdateActive(row, event) {
    row.Active = event.checked ? 1 : 0;
    row.Action = true;
  }
  NoOfRecordToUpdate = 0;
  saveall() {
    debugger;
    //var toUpdateAttendance = this.StudentAttendanceList.filter((f:any) => f.Action);
    //console.log("toUpdateAttendance",toUpdateAttendance);
    this.NoOfRecordToUpdate = this.StudentEvaluationList.length;
    this.loading = true;
    this.StudentEvaluationList.forEach((record) => {
      this.NoOfRecordToUpdate--;
      this.UpdateOrSave(record);
    })
    if (this.StudentEvaluationList.length == 0) {
      this.loading = false;
    }
  }
  SaveRow(row) {
    this.NoOfRecordToUpdate = 0;
    this.UpdateOrSave(row);
  }
  EvaluationResultData = {
    StudentEvaluationResultId: 0,
    Points: 0
  }
  UpdateOrSave(row) {
    debugger;
    //this.NoOfRecordToUpdate = 0;
    if (row.Points <= this.FullMark) {
      this.EvaluationResultData.StudentEvaluationResultId = row.StudentEvaluationResultId;
      this.EvaluationResultData.Points = +row.Points;
      delete this.EvaluationResultData["CreatedDate"];
      delete this.EvaluationResultData["CreatedBy"];
      this.EvaluationResultData["UpdatedDate"] = new Date();
      this.EvaluationResultData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
      console.log("StudentAttendanceData update", this.EvaluationResultData);
      this.update(row);

    }
  }

  // insert(row) {
  //   console.log("this.StudentAttendanceData", this.StudentAttendanceData);
  //   this.dataservice.postPatch('Attendances', this.StudentAttendanceData, 0, 'post')
  //     .subscribe(
  //       (data: any) => {
  //         //this.edited = false;
  //         row.AttendanceId = data.AttendanceId;
  //         row.Action = false;
  //         if (this.NoOfRecordToUpdate == 0) {
  //           this.NoOfRecordToUpdate = -1;
  //           this.loading = false;
  //           this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
  //         }
  //       });
  // }
  update(row) {
    this.dataservice.postPatch('StudentEvaluationResults', this.EvaluationResultData, this.EvaluationResultData.StudentEvaluationResultId, 'patch')
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
  insert(data) {
    this.dataservice.postPatch('EvaluationResultMarks', data, 0, 'post')
      .subscribe(
        (data: any) => {
          //this.edited = false;
          // row.Action = false;
          if (this.NoOfRecordToUpdate == 0) {
            this.NoOfRecordToUpdate = -1;
            this.loading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
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
  GetEvaluationNames() {
    //debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    let filterStr = this.FilterOrgSubOrg + " and Active eq true";// and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
      'EvaluationMasterId',
      'EvaluationName',
      'Description',
      'Duration',
      'ClassGroupId',
      'DisplayResult',
      'AppendAnswer',
      'ProvideCertificate',
      'FullMark',
      'PassMark',
      'Confidential',
      'Active'
    ];

    list.PageName = "EvaluationMasters";

    list.filter = [filterStr];
    this.EvaluationMaster = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          var result = data.value.map(d => {
            d.EvaluationName = globalconstants.decodeSpecialChars(d.EvaluationName);
            return d;
          })
          this.EvaluationMaster = this.contentservice.getConfidentialData(this.tokenStorage, result, "EvaluationName")
        }
        this.GetMasterData();
      });

  }
  FilteredClasses: any[] = [];
  FilteredExams: any[] = [];
  GetUpdatable() {
    debugger;
    var _evaluationMasterId = this.searchForm.get("searchEvaluationMasterId")?.value;
    let ObjEvaluationMaster: any = [];
    if (_evaluationMasterId > 0)
      ObjEvaluationMaster = this.EvaluationMaster.filter((f: any) => f.EvaluationMasterId == _evaluationMasterId);
    this.EvaluationUpdatable = ObjEvaluationMaster[0].AppendAnswer;
    //var _classgroupObj = this.EvaluationMaster.filter((f: any) => f.EvaluationMasterId == _evaluationMasterId)
    var _classGroupId = 0;
    var _evaluationexammapforselectedEvaluation = this.EvaluationExamMap.filter(ee => ee.EvaluationMasterId == _evaluationMasterId);
    this.FilteredExams = this.Exams.filter(e => {
      return _evaluationexammapforselectedEvaluation.filter(ee => ee.ExamId == e.ExamId).length > 0
    })
    if (ObjEvaluationMaster.length > 0) {
      _classGroupId = ObjEvaluationMaster[0].ClassGroupId;
      this.FilteredClasses = this.ClassGroupMappings.filter(g => g.ClassGroupId == _classGroupId)
    }
  }
  // SelectClass() {
  //   var _evaluationMasterId = this.searchForm.get("searchEvaluationMasterId")?.value;
  //   var _classgroupObj = this.EvaluationMaster.filter((f:any) => f.EvaluationMasterId == _evaluationMasterId)
  //   var _classGroupId = 0;
  //   if (_classgroupObj.length > 0) {
  //     _classGroupId = _classgroupObj[0].ClassGroupId;
  //     this.FilteredClasses = this.ClassGroupMappings.filter(g => g.ClassGroupId == _classGroupId)
  //   }
  // }
  GetEvaluationMapping(pClassId, pSectionId, pSemesterId, pEvaluationExamMapId, pEvaluationMasterId, pExamId) {
    debugger;

    let filterStr = this.FilterOrgSubOrg;// + 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    filterStr += ' and ClassId eq ' + pClassId
    filterStr += ' and SectionId eq ' + pSectionId
    filterStr += ' and SemesterId eq ' + pSemesterId
    filterStr += ' and EvaluationExamMapId eq ' + pEvaluationExamMapId
    filterStr += ' and Active eq true';
    let list: List = new List();
    list.fields = [
      'EvaluationResultMarkId',
      'StudentClassId',
      'EvaluationExamMapId',
      'ClassId',
      'SectionId',
      'SemesterId',
      'TotalMark',
      'Active'
    ];

    list.PageName = "EvaluationResultMarks";
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.EvaluatedStudent = [];
        var _students: any[] = [];
        var _evaluationName = this.EvaluationMaster.filter(e => e.EvaluationMasterId == pEvaluationMasterId)[0].EvaluationName;
        //if (pSectionId > 0)
        _students = this.Students.filter((s: any) => s.ClassId == pClassId
          && s.SemesterId == pSemesterId
          && s.SectionId == pSectionId);
        // else
        //   _students = this.Students.filter((s:any) => s.ClassId == pClassId);
        _students.forEach(stud => {
          var answeredstudent = data.value.filter(ans => ans.StudentClassId == stud.StudentClassId)
          if (answeredstudent.length > 0) {
            answeredstudent[0].Name = stud.FullName;
            answeredstudent[0].EvaluationMasterId = pEvaluationMasterId;
            answeredstudent[0].EvaluationName = _evaluationName;
            answeredstudent[0].ExamId = pExamId;
            answeredstudent[0].StudentId = stud.StudentId;

            this.EvaluatedStudent.push(answeredstudent[0]);
          }
        })
        if (this.EvaluatedStudent.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        //console.log("this.StudentEvaluationList", this.EvaluatedStudent)
        this.AssessmentTypeDatasource = new MatTableDataSource<any>(this.EvaluatedStudent);
        this.AssessmentTypeDatasource.paginator = this.paginator;
        this.loading = false;
        this.PageLoading = false;
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
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];
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
        }
        else {
          this.contentservice.openSnackBar("No answer option found.", globalconstants.ActionText, globalconstants.BlueBackground);
        }
        //this.loading = false; this.PageLoading=false;
      });

  }
  GetClassEvaluations() {

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

    list.PageName = "ClassEvaluations";
    list.filter = [this.FilterOrgSubOrg + ' and Active eq 1'];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassEvaluations = [];
        if (data.value.length > 0) {
          data.value.forEach(clseval => {
            var obj = this.QuestionnaireTypes.filter((f: any) => f.MasterDataId == clseval.QuestionnaireTypeId);
            if (obj.length > 0) {
              clseval.QuestionnaireType = obj[0].MasterDataName
              clseval.ClassEvaluationOptions = this.ClassEvaluationOptionList.filter((f: any) => f.ParentId == clseval.ClassEvaluationAnswerOptionParentId)
              this.ClassEvaluations.push(clseval);
            }
          })
          //   console.log("this.ClassEvaluations", this.ClassEvaluations)
        }
        this.loading = false; this.PageLoading = false;
      })
  }

  GetStudentClasses() {
    debugger;
    var _evaluationMasterId = this.searchForm.get("searchEvaluationMasterId")?.value
    var _searchClassId = this.searchForm.get("searchClassId")?.value;
    var _searchSectionId = this.searchForm.get("searchSectionId")?.value;
    var _searchSemesterId = this.searchForm.get("searchSemesterId")?.value;
    var _examId = this.searchForm.get("searchExamId")?.value;
    this.StudentEvaluationList = [];
    this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
    var _evaluationGroupId = 0;
    this.loading = true;
    if (_evaluationMasterId == 0) {
      this.contentservice.openSnackBar("Please select evaluation type.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      return;
    }

    if (_searchClassId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      return;
    }

    var _evaluationObj = this.EvaluationMaster.filter((f: any) => f.EvaluationMasterId == _evaluationMasterId);
    if (_evaluationObj.length > 0) {
      _evaluationGroupId = _evaluationObj[0].ClassGroupId;
    }


    var _evaluationdetail: any[] = [];
    _evaluationdetail = this.EvaluationExamMap.filter((f: any) => f.EvaluationMasterId == _evaluationMasterId
      && f.ExamId == _examId);

    this.EvaluatedStudent = [];
    //var __classGroupId = 0;
    if (_evaluationdetail.length == 0) {
      this.loading = false;
      this.PageLoading = false;
      this.EvaluatedStudent = [];
      this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    //var _examId = this.searchForm.get("searchExamId")?.value;

    var filterOrgIdNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    filterOrgIdNBatchId += " and ClassId eq " + _searchClassId;
    if (_searchSemesterId > 0)
      filterOrgIdNBatchId += " and SemesterId eq " + _searchSemesterId;
    if (_searchSectionId > 0)
      filterOrgIdNBatchId += " and SectionId eq " + _searchSectionId;
    filterOrgIdNBatchId += " and IsCurrent eq true";

    let list: List = new List();
    list.fields = ["StudentClassId,StudentId,ClassId,RollNo,SectionId,SemesterId"];
    list.PageName = "StudentClasses";
    list.filter = [filterOrgIdNBatchId];
    this.PageLoading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentClasses = [...data.value];
        this.GetStudents();
        if (this.EvaluationUpdatable)
          this.ForUpdatableEvaluation(_searchClassId, _searchSectionId, _searchSemesterId, _evaluationMasterId, _examId);
        else
          this.GetEvaluationMapping(_searchClassId, _searchSectionId, _searchSemesterId, _evaluationdetail[0].EvaluationExamMapId, _evaluationMasterId, _examId);
      })
  }
  ForUpdatableEvaluation(pClassId, pSectionId, pSemesterId, pEvaluationMasterId, pExamId) {
    var _students: any[] = [];
    var _evaluationName = this.EvaluationMaster.filter(e => e.EvaluationMasterId == pEvaluationMasterId)[0].EvaluationName;
    //if (pSectionId > 0)
    _students = this.Students.filter((s: any) => s.ClassId == pClassId
      && s.SemesterId == pSemesterId
      && s.SectionId == pSectionId);
    // else
    //   _students = this.Students.filter((s:any) => s.ClassId == pClassId);
    _students.forEach(stud => {
      // var answeredstudent = data.value.filter(ans => ans.StudentClassId == stud.StudentClassId)
      // if (answeredstudent.length > 0) {
      //   answeredstudent[0].Name = stud.FullName;
      //   answeredstudent[0].EvaluationMasterId = pEvaluationMasterId;
      //   answeredstudent[0].EvaluationName = _evaluationName;
      //   answeredstudent[0].ExamId = pExamId;
      //   answeredstudent[0].StudentId = stud.StudentId;

      this.EvaluatedStudent.push({
        Name: stud.FullName,
        EvaluationMasterId: pEvaluationMasterId,
        EvaluationName: _evaluationName,
        ExamId: pExamId,
        StudentId: stud.StudentId
      });
    })
    if (this.EvaluatedStudent.length == 0) {
      this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
    }
    //console.log("this.StudentEvaluationList", this.EvaluatedStudent)
    this.AssessmentTypeDatasource = new MatTableDataSource<any>(this.EvaluatedStudent);
    this.AssessmentTypeDatasource.paginator = this.paginator;
    this.loading = false;
    this.PageLoading = false;
  }
  GetStudents() {
    this.loading = true;
    var _filter = ''
    // let list: List = new List();
    // list.fields = [
    //   'StudentId',
    //   'FirstName',
    //   'LastName',
    //   'ContactNo',
    // ];
    var _students: any = this.tokenStorage.getStudents()!;
    //var filteredStudents :any[]=[];
    if (this.LoginUserDetail[0]["RoleUsers"][0].role.toLowerCase() == 'student') {
      this.StudentId = this.tokenStorage.getStudentId()!;;
      _students = _students.filter((s: any) => s.StudentId == this.StudentId)
      //_filter = ' and StudentId eq ' + this.StudentId;
    }
    // list.PageName = "Students";
    // list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"] + _filter];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    debugger;
    this.Students = [];
    //if (data.value.length > 0) {
    var _RollNo = '';
    var _name = '';
    var _className = '';
    var _classId = '';
    var _section = '';
    var _sectionName = '';
    var _studentClassId = 0;
    var _batchName = '';
    _students.forEach(student => {
      _RollNo = '';
      _name = '';
      _className = '';
      _classId = '';
      _section = '';
      _sectionName = '';
      _studentClassId = 0;
      _batchName = '';
      var studentclassobj = this.StudentClasses.filter((f: any) => f.StudentId == student.StudentId);
      if (studentclassobj.length > 0) {
        _studentClassId = studentclassobj[0].StudentClassId;
        _batchName = this.tokenStorage.getSelectedBatchName()!;
        var _classNameobj = this.Classes.filter(c => c.ClassId == studentclassobj[0].ClassId);
        _classId = studentclassobj[0].ClassId;
        if (_classNameobj.length > 0)
          _className = _classNameobj[0].ClassName;

        var _SectionObj = this.Sections.filter((f: any) => f.MasterDataId == studentclassobj[0].SectionId);
        if (_SectionObj.length > 0)
          _section = _SectionObj[0].MasterDataName;
        var _SemesterObj = this.Semesters.filter((f: any) => f.MasterDataId == studentclassobj[0].SemesterId);
        if (_SemesterObj.length > 0)
          _section = " " + _SemesterObj[0].MasterDataName;

        _RollNo = studentclassobj[0].RollNo;

        var _lastname = student.LastName == null ? '' : " " + student.LastName;
        _name = student.FirstName + _lastname;
        var _fullDescription = _RollNo + "-" + _name;// + "-" + _className + "-" + _section;
        this.Students.push({
          StudentClassId: _studentClassId,
          StudentId: student.StudentId,
          ClassId: _classId,
          ClassName: _className,
          RollNo: _RollNo,
          Name: _name,
          SectionId: studentclassobj[0].SectionId,
          SemesterId: studentclassobj[0].SemesterId,
          Section: _section,
          Batch: _batchName,
          FullName: _fullDescription,
        });

      }
    })
    //}
    this.Students = this.Students.sort((a, b) => a.RollNo - b.RollNo)
    this.loading = false;
    this.PageLoading = false;
    //})
  }
}
export interface IStudentEvaluation {
  StudentEvaluationId: number;
  ClassEvaluationId: number;
  EvaluationExamMapId: number;
  ClassEvaluationAnswerOptionParentId: number;
  StudentEvaluationResultId: number;
  AnswerText: string;
  StudentClassId: number;
  EvaluationMasterId: number;
  Active: number;
  Action: boolean;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
  FullName: string;
  ClassName: string;
  Section: string;
}



