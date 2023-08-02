import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ISyllabus } from '../syllabus/syllabus.component';

@Component({
  selector: 'app-questionandexamreport',
  templateUrl: './questionandexamreport.component.html',
  styleUrls: ['./questionandexamreport.component.scss']
})
export class QuestionandexamreportComponent implements OnInit {
  PageLoading = true;
  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  LoginUserDetail: any[] = [];
  ClassGroups = [];
  CurrentRow: any = {};
  selectedIndex = 0;
  selectedRowIndex = -1;
  RowToUpdate = -1;
  EvaluationNames = [];
  QuestionBankIdTopass = 0;
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  QuestionBankOptionList = [];
  QuestionBankList: IQuestionNExam[] = [];
  //EvaluationMasterId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  QuestionnaireTypes = [];
  SubCategories = [];
  Classes = [];
  ClassSubjects = [];
  Exams = [];
  ExamNames = [];
  SelectedClassSubjects = [];
  filteredOptions: Observable<IQuestionNExam[]>;
  dataSource: MatTableDataSource<IQuestionNExam>;
  SyllabusDataSource: MatTableDataSource<ISyllabus>;
  allMasterData = [];

  QuestionBankNExamData = {
    QuestionBankId: 0,
    QuestionBankNExamId: 0,
    ExamId: 0,
    BatchId: 0,
    OrgId: 0, SubOrgId: 0,
    Active: false
  };
  EvaluationMasterForClassGroup = [];
  QuestionBankNExamForUpdate = [];
  displayedColumns = [
    'Id',
    'Question'
  ];
  searchForm: UntypedFormGroup;
  QuestionPaperHeading = '';
  constructor(private servicework: SwUpdate,
    //private dd: safeHTML,   
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private fb: UntypedFormBuilder,
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
    this.imgURL = '';
    this.StudentClassId = this.tokenStorage.getStudentClassId();
    this.searchForm = this.fb.group({
      searchClassId: [0],
      searchSubjectId: [0],
      searchExamId: [0],
    })
    this.PageLoad();
  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }

  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EVALUATIONQUESTIONNAIRE)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        //this.GetEvaluationNames();
        this.GetMasterData();

        this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
          .subscribe((data: any) => {
            this.ClassGroups = [...data.value];
          });
      }
    }
  }
  EscapeSpecialCharacter(str) {

    if ((str === null) || (str === ''))
      return false;
    else
      str = str.toString();

    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    var format = /[!@#$&%^&*_+\=\[\]{};:'"\\|<>]+/;
    return str.replace(format, function (m) { return map[m]; });
    //return str.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
  SelectedLessons = [];
  SelectContentUnit = [];
  SelectedSubContentUnit = [];
  SelectSubject() {
    debugger;
    var _searchClassId = this.searchForm.get("searchClassId").value;
    if (_searchClassId > 0)
      this.SelectedClassSubjects = this.ClassSubjects.filter(d => d.ClassId == _searchClassId);
    this.cleardata();
    //this.GetSyllabusDetailForDropDown();
  }
  SelectContentUnitChanged() {
    debugger;
    var _searchContentUnitId = this.searchForm.get("searchContentUnitId").value;
    if (_searchContentUnitId > 0)
      this.SelectedSubContentUnit = this.allMasterData.filter(d => d.ParentId == _searchContentUnitId);
    this.cleardata();
  }
  SelectSubContentUnitChanged() {
    debugger;
    var _searchSubContentUnitId = this.searchForm.get("searchSubContentUnitId").value;
    if (_searchSubContentUnitId > 0)
      this.SelectedLessons = this.allMasterData.filter(d => d.ParentId == _searchSubContentUnitId);
    else
      this.SelectedLessons = [];
    this.cleardata();
  }
  preview(files, row) {
    if (files.length === 0)
      return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }
    debugger;
    this.selectedFile = files[0];
    if (this.selectedFile.size > 120000) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Image size should be less than 100kb", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      row.Diagram = reader.result;
    }
  }
  imagePath: string;
  message: string;
  imgURL: any;
  selectedFile: any;
  formdata: FormData;

  GetExams() {

    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId, '')
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.forEach(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId
            })
        });
        this.loading = false; this.PageLoading = false;
      })
  }
  SelectSubContentUnit(pContentUnitId) {
    this.SelectedSubContentUnit = this.allMasterData.filter(f => f.ParentId == pContentUnitId.value);
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
  tabchanged(indx) {
    debugger;
    this.selectedIndex = indx;
  }
  highlight(rowId) {
    if (this.selectedRowIndex == rowId)
      this.selectedRowIndex = -1;
    else
      this.selectedRowIndex = rowId
  }
  AddNew() {
    debugger;
    var _syllabusId = this.searchForm.get("searchUnitDetailId").value;
    if (_syllabusId == 0) {
      this.contentservice.openSnackBar("Please select unit detail", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var newItem = {
      QuestionBankNExamId: 0,
      QuestionBankId: 0,
      ExamId: _syllabusId,
      Active: false,
      Action: false
    }
    this.QuestionBankList = [];
    this.QuestionBankList.push(newItem);
    this.dataSource = new MatTableDataSource(this.QuestionBankList);
  }
  SaveAll() {
    var _toUpdate = this.QuestionBankList.filter(f => f.Action);
    this.RowToUpdate = _toUpdate.length;
    _toUpdate.forEach(question => {
      this.RowToUpdate--;
      this.UpdateOrSave(question);
    })
  }
  SaveRow(row) {
    this.RowToUpdate = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    if (row.ExamId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let checkFilterString = this.FilterOrgSubOrg;// "OrgId eq " + this.LoginUserDetail[0]["orgId"];
    if (row.QuestionBankNExamId > 0)
      checkFilterString += " and QuestionBankNExamId ne " + row.QuestionBankNExamId

    checkFilterString += " and QuestionBankId eq " + row.QuestionBankId
    checkFilterString += " and ExamId eq " + row.ExamId
    checkFilterString += " and BatchId eq " + this.SelectedBatchId;

    let list: List = new List();
    list.fields = ["QuestionBankNExamId"];
    list.PageName = "QuestionBankNExams";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
          this.SubOrgId = this.tokenStorage.getSubOrgId();
          this.QuestionBankNExamForUpdate = [];
          this.QuestionBankNExamData.QuestionBankNExamId = row.QuestionBankNExamId;
          this.QuestionBankNExamData.QuestionBankId = row.QuestionBankId;
          this.QuestionBankNExamData.ExamId = row.ExamId;
          this.QuestionBankNExamData.OrgId = this.LoginUserDetail[0]['orgId'];
          this.QuestionBankNExamData.SubOrgId = this.SubOrgId;
          this.QuestionBankNExamData.BatchId = this.SelectedBatchId;
          this.QuestionBankNExamData.Active = row.Active;

          this.QuestionBankNExamForUpdate.push(this.QuestionBankNExamData);
          console.log('dta', this.QuestionBankNExamForUpdate);

          if (this.QuestionBankNExamForUpdate[0].QuestionBankNExamId == 0) {
            this.QuestionBankNExamForUpdate[0]["CreatedDate"] = new Date();
            this.QuestionBankNExamForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.QuestionBankNExamForUpdate[0]["UpdatedDate"] = new Date();
            delete this.QuestionBankNExamForUpdate[0]["UpdatedBy"];
            this.insert(row);
          }
          else {
            this.QuestionBankNExamForUpdate[0]["UpdatedDate"] = new Date();
            this.QuestionBankNExamForUpdate[0]["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.QuestionBankNExamForUpdate[0]["CreatedDate"];
            delete this.QuestionBankNExamForUpdate[0]["CreatedBy"];
            this.update(row);
          }
        }
      })
  }
  RandomArr = [];
  RandomQuestion = [];
  GetRandomNumber() {
    var noofRandom = this.searchForm.get("searchNoOfRandom").value;
    if (noofRandom < 1) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter no. of random number.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.RandomArr = [];
    while (this.RandomArr.length < noofRandom) {
      var r = Math.floor(Math.random() * 100) + 1;
      if (this.RandomArr.indexOf(r) === -1) this.RandomArr.push(r);
    }
    this.RandomQuestion = [];
    this.RandomArr.forEach(r => {
      var randomItem = this.QuestionNExams.filter(q => q.Id == r)
      if (randomItem.length > 0)
        this.RandomQuestion.push(randomItem);
    })
    this.dataSource = new MatTableDataSource(this.RandomQuestion);
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {
    this.dataservice.postPatch('QuestionBankNExams', this.QuestionBankNExamForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.QuestionBankNExamId = data.QuestionBankNExamId;
          row.Action = false;
          if (this.RowToUpdate == 0) {
            this.RowToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse()
          }
        });
  }
  update(row) {
    //console.log("updating",this.QuestionBankForUpdate);
    this.dataservice.postPatch('QuestionBankNExams', this.QuestionBankNExamForUpdate[0], this.QuestionBankNExamForUpdate[0].QuestionBankNExamId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          if (this.RowToUpdate == 0) {
            this.RowToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse()
          }
          this.loadingFalse();
        });
  }
  cleardata() {
    this.UnitDetails = [];
    this.searchForm.patchValue({ 'searchUnitDetailId': 0 });
    this.QuestionBankList = [];
    this.dataSource = new MatTableDataSource<IQuestionNExam>(this.QuestionBankList);
  }
  Lessons = [];
  ContentUnit = [];
  SubContentUnit = [];
  DifficultyLevels = [];
  UnitDetails = [];
  ExamName = '';
  ClassName = ''
  SubjectName = '';

  GetSyllabusDetail() {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    let filterStr = this.FilterOrgSubOrg + " and Active eq true";// 'Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var _examId = this.searchForm.get("searchExamId").value;

    if (_examId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      var obj = this.Exams.filter(e => e.ExamId == _examId);
      if (obj.length > 0)
        this.ExamName = obj[0].ExamName;
    }
    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId > 0) {
      filterStr += " and ClassId eq " + _classId
      var obj = this.Classes.filter(c => c.ClassId == _classId)
      if (obj.length > 0)
        this.ClassName = obj[0].ClassName;
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    var _ClassSubjectId = this.searchForm.get("searchSubjectId").value;
    if (_ClassSubjectId > 0) {
      var obj = this.ClassSubjects.filter(s => s.ClassSubjectId == _ClassSubjectId)
      if (obj.length > 0) {
        this.SubjectName = obj[0].SubjectName;
        filterStr += " and SubjectId eq " + obj[0].SubjectId;
      }
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select subject.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let list: List = new List();
    list.fields = [
      'SyllabusId',
      'ClassId',
      'SubjectId',
      'ContentUnitId',
      'SubContentUnitId',
      'Lesson',
      // 'Active'
    ];

    list.PageName = "SyllabusDetails";
    list.lookupFields = ["QuestionBanks($select=QuestionBankId,SyllabusId,Question,Diagram,DifficultyLevelId,Active;$expand=StorageFnPs($select=FileId,FileName))"]
    list.filter = [filterStr];
    this.QuestionBankList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.UnitDetails = [];
        this.QuestionBankList = [];
        var _imgURL = globalconstants.apiUrl + "/Uploads/" + this.LoginUserDetail[0]["org"] +
          "/Question photo/"; //+ fileNames[0].FileName;

        data.value.forEach(f => {
          var clsObj = this.Classes.filter(c => c.ClassId == f.ClassId);
          if (clsObj.length > 0)
            f.ClassName = clsObj[0].ClassName;
          else
            f.ClassName = '';
          var subjObj = this.ClassSubjects.filter(s => s.SubjectId == f.SubjectId);
          if (subjObj.length > 0)
            f.SubjectName = subjObj[0].SubjectName
          else
            f.SubjectName = '';


          f.UnitDetail = f.ClassName + ", " + f.SubjectName

          f.QuestionBanks.forEach(q => {
            var _level = 0
            var obj = this.DifficultyLevels.filter(d => d.MasterDataId == q.DifficultyLevelId);
            if (obj.length > 0) {
              _level = obj[0].MasterDataName;
            }
            if (q.StorageFnPs.length > 0)
              q.Diagram = _imgURL + "/" + q.StorageFnPs[0].FileName;
            q.Question = globalconstants.decodeSpecialChars(q.Question);
            q.DifficultyLevel = _level;
            this.QuestionBankList.push(q);
          })
        })
        this.GetQuestionNExam(_examId);

      })
  }
  QuestionNExams = [];
  GetQuestionNExam(pExamId) {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    let filterStr = this.FilterOrgSubOrg + " and Active eq true";//"Active eq true and OrgId eq " + this.LoginUserDetail[0]["orgId"];
    if (pExamId > 0)
      filterStr += " and ExamId eq " + pExamId;

    let list: List = new List();
    list.fields = [
      'QuestionBankNExamId',
      'QuestionBankId',
      'ExamId',
      'Active'
    ];

    list.PageName = "QuestionBankNExams";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.QuestionNExams = [];
        this.QuestionBankList.forEach(item => {
          if (pExamId > 0) {
            var existing = data.value.filter(d => d.QuestionBankId == item.QuestionBankId);
            if (existing.length > 0) {
              item["Question"] = globalconstants.decodeSpecialChars(item["Question"]);
              item["ExamId"] = existing[0].ExamId
              item.QuestionBankNExamId = existing[0].QuestionBankNExamId;
              item.Active = existing[0].Active;
            }
            else {
              item.QuestionBankNExamId = 0;
              item["ExamId"] = 0;
              item.Active = false;
            }
          }
          else {
            item.QuestionBankNExamId = 0;
            item["ExamId"] = 0;
            item.Active = false;
          }
          this.QuestionNExams.push(item);
        })
        this.QuestionNExams.forEach((q, indx) => {
          q.Id = ++indx;
        })
        if (this.QuestionNExams.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        console.log("this.QuestionNExams", this.QuestionNExams);
        this.dataSource = new MatTableDataSource<IQuestionNExam>(this.QuestionNExams);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }
  GetClassSubjects() {
    this.loading = true;
    let list = new List();
    list.PageName = "ClassSubjects";
    list.fields = ["ClassSubjectId,ClassId,SubjectId"];
    //list.lookupFields = ["ClassMaster($select=ClassId,ClassName)"];
    //list.filter = ['Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = data.value.map(m => {
          var _subjectname = "";
          var subjectobj = this.allMasterData.filter(f => f.MasterDataId == m.SubjectId);
          if (subjectobj.length > 0)
            _subjectname = subjectobj[0].MasterDataName;
          m.SubjectName = _subjectname;
          return m;

        });
        this.loading = false;
      });
  }
  GetSelectedClassSubject() {
    debugger;
    this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.searchForm.get("searchClassId").value)
  }

  GetMasterData() {
    debugger;
    this.allMasterData = this.tokenStorage.getMasterData();
    //var result = this.allMasterData.filter(f=>f.MasterDataName =='Question Bank ContentUnit')
    //console.log("result",result)
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.ContentUnit = this.getDropDownData(globalconstants.MasterDefinitions.school.BOOKCONTENTUNIT);
    this.DifficultyLevels = this.getDropDownData(globalconstants.MasterDefinitions.school.DIFFICULTYLEVEL);
    this.GetExams();
    if (this.Classes.length == 0) {
      var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
        this.Classes = [...data.value];
        this.loading = false; this.PageLoading = false;
        this.GetClassSubjects();
      });
      //this.GetQuestionBank();
    }

    //this.GetQuestionBankOption();
    this.loading = false
  }
  onBlur(row) {
    row.Action = true;
  }
  Sequencing(editedrow) {
    debugger;
    editedrow.Action = true;
    var editedrowindx = this.QuestionBankList.findIndex(x => x.QuestionBankId == editedrow.QuestionBankId);
    //var numbering = 0;
    this.QuestionBankList.forEach((listrow, indx) => {
      if (indx > editedrowindx) {
        //numbering+=1;
        //listrow.DisplayOrder = editedrow.DisplayOrder + numbering;
        listrow.Action = true;
      }
    })
  }
  ContentUnitChanged(row) {
    debugger;
    row.Action = true;
    if (row.ContentUnitId > 0)
      row.SubCategories = this.allMasterData.filter(f => f.ParentId == row.ContentUnitId);
    else
      row.SubCategories = [];
  }
  SubContentUnitChanged(row) {
    row.Action = true;
    if (row.SubContentUnitId > 0)
      row.Lessons = this.allMasterData.filter(f => f.ParentId == row.SubContentUnitId);
    else
      row.Lessons = [];
  }
  UpdateMultiAnswer(row, event) {
    row.MultipleAnswer = event.checked ? 1 : 0;
    row.Action = true;
  }
  UpdateActive(row, event) {
    row.Active = event.checked;
    row.Action = true;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }

}

export interface IQuestionNExam {
  QuestionBankNExamId: number;
  QuestionBankId: number;
  ExamId: number;
  Active: boolean;
  Action: boolean;
}

export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}




