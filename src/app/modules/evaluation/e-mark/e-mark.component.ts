import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';

@Component({
  selector: 'EmarkApp',
  templateUrl: './e-mark.component.html',
  styleUrls: ['./e-mark.component.scss']
})
export class EMarkComponent implements OnInit {
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
  FilterOrgSubOrgBatchId = "";
  loading = false;
  AssessmentTypeList: any[] = [];
  EvaluationResultMarkList: any[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
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
  ];
  EvaluationResultMarkData = {
    'EvaluationResultMarkId': 0,
    'Active': false
  }
  AssessmentPrintHeading: any[] = [];
  ClassEvaluationOptionList: any[] = [];
  filteredStudents: Observable<IStudent[]>;
  StudentEvaluationForUpdate: any[] = [];
  displayedColumns = [
    'FullName',
    'TotalMark',
    'Rank',
    'Active',
    'Action'
  ];
  EvaluationExamMap: any[] = [];
  ExamClassGroups: any[] = [];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private dialog: MatDialog,
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
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EMARK)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        if(this.Permission =='read')
        {
          this.displayedColumns = [
            'FullName',
            'TotalMark',
            'Rank'           
          ];
        }
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetEvaluationNames();
        this.GetEvaluationOption();

        // if (this.Classes.length == 0) {

        //   this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
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

  GetEvaluatedStudent(pClassId, pSectionId, pSemesterId, pEvaluationExamMapId) {
    let filterStr = this.FilterOrgSubOrg;// + 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    filterStr += ' and ClassId eq ' + pClassId
    filterStr += ' and SemesterId eq ' + pSemesterId
    filterStr += ' and SectionId eq ' + pSectionId
    filterStr += ' and EvaluationExamMapId eq ' + pEvaluationExamMapId
    filterStr += ' and Active eq true'
    let list: List = new List();
    list.fields = [
      'EvaluationResultMarkId',
      'StudentClassId',
      'EvaluationExamMapId',
      'ClassId',
      'SectionId',
      'SemesterId',
      'TotalMark',
      'Rank',
      'Active'
    ];

    list.PageName = "EvaluationResultMarks";
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger
        //var _students:any = this.tokenStorage.getStudents()!;
        var _filteredStudents: any[] = [];
        //if (pSectionId > 0)
        _filteredStudents = this.Students.filter(stud => data.value.findIndex(fi => fi.StudentClassId == stud.StudentClassId) > -1);// && stud.SectionId == pSectionId)
        // else
        //   _filteredStudents = this.Students.filter(stud => data.value.findIndex(fi => fi.StudentClassId == stud.StudentClassId) > -1)

        this.EvaluationResultMarkList = [];
        _filteredStudents.forEach(v => {
          var match = data.value.filter(d => d.StudentClassId == v.StudentClassId);
          v.Active = match[0].Active;
          v.TotalMark = match[0].TotalMark;
          v.Rank = match[0].Rank;
          v.EvaluationResultMarkId = match[0].EvaluationResultMarkId;
          this.EvaluationResultMarkList.push(v);
        })

        if (this.EvaluationResultMarkList.length == 0) {
          //this.StudentEvaluationList = [];
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        else
          this.EvaluationResultMarkList = this.EvaluationResultMarkList.sort((a, b) => a.Rank - b.Rank)
        ////console.log("this.StudentEvaluationList", this.StudentEvaluationList)
        //row.EvaluationStarted = true;
        this.dataSource = new MatTableDataSource<IStudentEvaluation>(this.EvaluationResultMarkList);
        this.dataSource.paginator = this.paginator;
        this.loading = false; this.PageLoading = false;
      })
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    this.EvaluationResultMarkData.EvaluationResultMarkId = row.EvaluationResultMarkId;
    this.EvaluationResultMarkData.Active = row.Active;
    this.update(row);

  }
  loadingFalse() {
    this.loading = false;
    this.PageLoading = false;
  }
  loadingTrue() {
    this.loading = true;
    this.PageLoading = true;
  }

  update(row) {
    //console.log("this.EvaluationResultMarkData", this.EvaluationResultMarkData)
    this.dataservice.postPatch("EvaluationResultMarks", this.EvaluationResultMarkData, this.EvaluationResultMarkData.EvaluationResultMarkId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  Delete(row) {

    this.openDialog(row)
  }
  openDialog(row) {
    debugger;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Save',
          cancel: 'No'
        }
      }
    });

    dialogRef.afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.UpdateAsDeleted(row);
        }
      });
  }

  UpdateAsDeleted(row) {
    debugger;
    let toUpdate = {
      Active: false,
      Deleted: true,
      UpdatedDate: new Date()
    }

    this.dataservice.postPatch('EvaluationResultMarks', toUpdate, row.EvaluationResultMarkId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.EvaluationResultMarkList.findIndex(x => x.StudentEvaluationResultId == row.StudentEvaluationResultId)
        this.EvaluationResultMarkList.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.EvaluationResultMarkList);
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  ApplyVariables(studentInfo) {
    ////console.log("studentInfo", studentInfo)
    ////console.log("this.AssessmentPrintHeading", this.AssessmentPrintHeading)
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
    return this.EvaluationResultMarkList.filter((f: any) => f.ClassEvalCategoryId == item.ClassEvalCategoryId)
  }
  GetExams() {
    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId, 2)
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
  GetClassSubjects() {
    this.loadingTrue();
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
        //this.SelectedClassSubjects = this.ClassSubjects.filter((f:any) => f.ClassId == this.ClassId);
        var _classId = this.searchForm.get("searchClassId")?.value;
        var _sectionId = this.searchForm.get("searchSectionId")?.value;
        var _semesterId = this.searchForm.get("searchSemesterId")?.value;
        this.SelectedClassSubjects = globalconstants.getFilteredClassSubjects(this.ClassSubjects, _classId, _sectionId, _semesterId);
        this.loadingFalse();
      });
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
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.QuestionnaireTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
    //this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP);
    this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.AssessmentPrintHeading = this.getDropDownData(globalconstants.MasterDefinitions.school.ASSESSMENTPRINTHEADING);
    ////console.log("this.AssessmentPrintHeading",this.AssessmentPrintHeading)
    this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      });
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
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
    this.loadingTrue();
    this.contentservice.GetClassGroupMapping(filterOrgSubOrg, 1)
      .subscribe((data: any) => {
        this.ClassGroupMappings = data.value.map(m => {
          m.ClassName = m.Class.ClassName;
          return m;
        });
        this.loadingFalse();
      })
  }
  onBlur(row) {
    row.Action = true;
  }
  // CategoryChanged(row) {
  //   debugger;
  //   row.Action = true;
  //   var item = this.EvaluationResultMarkList.filter((f: any) => f.StudentEvaluationId == row.StudentEvaluationId);
  //   item[0].SubCategories = this.allMasterData.filter((f: any) => f.ParentId == row.CategoryId);

  //   this.dataSource = new MatTableDataSource(this.EvaluationResultMarkList);
  // }
  updateSubmitted(row, event) {
    row.Active = event.checked;
    row.Action = true;
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
  BindSectionSemester() {
    debugger;
    let _classId = this.searchForm.get("searchClassId")?.value;
    let obj = this.Classes.filter(c => c.ClassId == _classId);
    if (obj.length > 0) {
      this.SelectedClassCategory = obj[0].Category;
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();
  }
  ClearData() {
    this.EvaluatedStudent = [];
    this.dataSource = new MatTableDataSource<any>(this.EvaluatedStudent);
  }
  FilteredClasses: any[] = [];
  FilteredExams: any[] = [];
  GetUpdatable() {
    debugger;
    var _evaluationMasterId = this.searchForm.get("searchEvaluationMasterId")?.value;
    if (_evaluationMasterId > 0)
      this.EvaluationUpdatable = this.EvaluationMaster.filter((f: any) => f.EvaluationMasterId == _evaluationMasterId)[0].AppendAnswer;
    var _classgroupObj = this.EvaluationMaster.filter((f: any) => f.EvaluationMasterId == _evaluationMasterId)
    var _classGroupId = 0;
    var _evaluationexammapforselectedEvaluation = this.EvaluationExamMap.filter(ee => ee.EvaluationMasterId == _evaluationMasterId);
    this.FilteredExams = this.Exams.filter(e => {
      return _evaluationexammapforselectedEvaluation.filter(ee => ee.ExamId == e.ExamId).length > 0
    })
    if (_classgroupObj.length > 0) {
      _classGroupId = _classgroupObj[0].ClassGroupId;
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
  GetEvaluationMapping(pClassId, pSemesterId, pSectionId, pEvaluationExamMapId, pEvaluationMasterId, pExamId) {
    debugger;

    let filterStr = this.FilterOrgSubOrg;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    filterStr += ' and ClassId eq ' + pClassId;
    if (pSemesterId)
      filterStr += ' and SemesterId eq ' + pSemesterId;
    if (pSectionId)
      filterStr += ' and SectionId eq ' + pSectionId;

    filterStr += ' and EvaluationExamMapId eq ' + pEvaluationExamMapId
    let list: List = new List();
    list.fields = [
      'StudentEvaluationResultId',
      'StudentClassId',
      'EvaluationExamMapId',
      'ClassId',
      'AnswerText',
      'Active'
    ];

    list.PageName = "StudentEvaluationResults";
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
        ////console.log("this.StudentEvaluationList", this.EvaluatedStudent)
        this.dataSource = new MatTableDataSource<any>(this.EvaluatedStudent);
        this.dataSource.paginator = this.paginator;
        this.loading = false;
        this.PageLoading = false;
      })
  }
  GetEvaluationOption() {
    this.loadingTrue();
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
        this.loadingFalse();
      });

  }
  GetClassEvaluations() {
    this.loadingTrue();
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
    list.filter = ['Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

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
          //   //console.log("this.ClassEvaluations", this.ClassEvaluations)
        }
        this.loading = false;
        this.PageLoading = false;
      })
  }

  GetStudentClasses() {
    //debugger;
    var _evaluationMasterId = this.searchForm.get("searchEvaluationMasterId")?.value
    var _searchClassId = this.searchForm.get("searchClassId")?.value;
    var _searchSectionId = this.searchForm.get("searchSectionId")?.value;
    var _searchSemesterId = this.searchForm.get("searchSemesterId")?.value;
    var _examId = this.searchForm.get("searchExamId")?.value;

    //var _evaluationClassGroupId = 0;
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
    // if (_searchSectionId > 0) {

    // }
    // var _evaluationObj = this.EvaluationMaster.filter((f:any) => f.EvaluationMasterId == _evaluationMasterId);
    // if (_evaluationObj.length > 0) {
    //   _evaluationClassGroupId = _evaluationObj[0].ClassGroupId;
    // }


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
    filterOrgIdNBatchId += " and SemesterId eq " + _searchSemesterId;
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
        this.GetEvaluatedStudent(_searchClassId, _searchSectionId, _searchSemesterId, _evaluationdetail[0].EvaluationExamMapId);
        //this.GetEvaluationMapping(_searchClassId, _searchSectionId, _evaluationdetail[0].EvaluationExamMapId, _evaluationMasterId, _examId);
      })
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
    //var _semester = '';
    //var _semesterName = '';
    var _studentClassId = 0;
    var _batchName = '';
    _students.forEach(student => {
      _RollNo = '';
      _name = '';
      _className = '';
      _classId = '';
      _section = '';
      _sectionName = '';
      //_semester = '';
      //_semesterName = '';
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
        if (_SectionObj.length > 0) {
          _section = _SectionObj[0].MasterDataName;
          _sectionName += "-" + _SectionObj[0].MasterDataName;
        }

        var _SemesterObj = this.Semesters.filter((f: any) => f.MasterDataId == studentclassobj[0].SemesterId);
        if (_SemesterObj.length > 0) {
          _section += _SemesterObj[0].MasterDataName;
          _sectionName += "-" + _SemesterObj[0].MasterDataName;
        }

        _RollNo = studentclassobj[0].RollNo;


        var _lastname = student.LastName == null ? '' : " " + student.LastName;
        _name = student.FirstName + _lastname;
        var _fullDescription = _RollNo + "-" + _name;// + "-" + _className + _sectionName;
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
    this.Students = this.Students.sort((a, b) => a.RollNo - b.RollNo);
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
  Semester: string;
}

