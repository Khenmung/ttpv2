import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { FileUploadService } from '../../../shared/upload.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { ISyllabus } from '../syllabus/syllabus.component';
//import { QuestionBankOptionComponent } from '../QuestionBankoption/QuestionBankoption.component';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {
  PageLoading = true;
  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  LoginUserDetail:any[]= [];
  ClassGroups :any[]= [];
  Sections:any[]=[];
  CurrentRow: any = {};
  selectedIndex = 0;
  selectedRowIndex = -1;
  RowToUpdate = -1;
  EvaluationNames :any[]= [];
  QuestionBankIdTopass = 0;
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  QuestionBankOptionList :any[]= [];
  QuestionBankList: IQuestionBank[]= [];
  //EvaluationMasterId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  QuestionnaireTypes :any[]= [];
  SubCategories :any[]= [];
  Classes :any[]= [];
  ClassSubjects :any[]= [];
  Exams :any[]= [];
  ExamNames :any[]= [];
  SelectedClassSubjects :any[]= [];
  filteredOptions: Observable<IQuestionBank[]>;
  dataSource: MatTableDataSource<IQuestionBank>;
  SyllabusDataSource: MatTableDataSource<ISyllabus>;
  allMasterData :any[]= [];

  QuestionBankData = {
    QuestionBankId: 0,
    SyllabusId: 0,
    DifficultyLevelId: 0,
    Question: '',
    Diagram: '',
    OrgId: 0, SubOrgId: 0,
    Active: false
  };
  EvaluationMasterForClassGroup :any[]= [];
  QuestionBankForUpdate :any[]= [];
  displayedColumns = [
    'QuestionBankId',
    'Question',
    'DifficultyLevelId',
    'Active',
    'Action'
  ];
  SyllabusDisplayedColumns = [
    'UnitDetail',
    'Lesson',
    'Action'
  ];
  searchForm: UntypedFormGroup;

  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private fb: UntypedFormBuilder,
    private fileUploadService: FileUploadService,
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
    this.StudentClassId = this.tokenStorage.getStudentClassId()!;
    this.searchForm = this.fb.group({
      searchClassId: [0],
      searchSectionId: [0],
      searchSemesterId: [0],
      searchSubjectId: [0],
      searchContentUnitId: [0],
      searchSubContentUnitId: [0],
      searchLesson: [0],
      searchUnitDetailId: [0]
    })
    this.PageLoad();
  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  ckeConfig: any;

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
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);

        this.ckeConfig = {
          allowedContent: false,
          extraPlugins: 'divarea',
          forcePasteAsPlainText: false,
          removeButtons: 'About',
          scayt_autoStartup: true,
          autoGrow_onStartup: true,
          //autoGrow_minHeight: 500,
          autoGrow_maxHeight: 600,
          font_names: "Arial;Times New Roman;Verdana;'Kalam', cursive;",
          contentsCss: 'https://fonts.googleapis.com/css2?family=Kalam:wght@300&display=swap'
        };
        //this.GetEvaluationNames();
        this.GetMasterData();
        // if (this.Classes.length == 0) {
        //   var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        //   this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
        //     this.Classes = [...data.value];
        //     this.loading = false; this.PageLoading = false;
        //   });
        //   //this.GetQuestionBank();
        // }
        this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
          data.value.forEach(m => {
            let obj = this.ClassCategory.filter((f:any) => f.MasterDataId == m.CategoryId);
            if (obj.length > 0) {
              m.Category = obj[0].MasterDataName.toLowerCase();
              this.Classes.push(m);
            }
          });
          this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
        });
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
  SelectedLessons :any[]= [];
  SelectContentUnit :any[]= [];
  SelectedSubContentUnit :any[]= [];
  SelectSubject() {
    debugger;
    let _classId = this.searchForm.get("searchClassId")?.value;
    let obj = this.Classes.filter(c => c.ClassId == _classId);
    if (obj.length > 0) {
      this.SelectedClassCategory = obj[0].Category.toLowerCase();
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.cleardata();
    //this.GetSyllabusDetailForDropDown();
  }
  Defaultvalue = 0;
  SelectedClassCategory = '';
  Semesters :any[]= [];
  ClassCategory :any[]= [];
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  SelectContentUnitChanged() {
    debugger;
    var _searchContentUnitId = this.searchForm.get("searchContentUnitId")?.value;
    if (_searchContentUnitId > 0)
      this.SelectedSubContentUnit = this.allMasterData.filter(d => d.ParentId == _searchContentUnitId);
    this.cleardata();
  }
  SelectSubContentUnitChanged() {
    debugger;
    var _searchSubContentUnitId = this.searchForm.get("searchSubContentUnitId")?.value;
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
      this.selectedFile = null;
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

  uploadFile(QuestionId) {
    debugger;
    let error: boolean = false;
    this.loading = true;
    if (this.selectedFile == undefined) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select a file.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.formdata = new FormData();
    this.formdata.append("description", "Question Bank photo");
    this.formdata.append("fileOrPhoto", "1");
    this.formdata.append("folderName", "Question photo");
    this.formdata.append("parentId", "0");

    this.formdata.append("batchId", "0");
    this.formdata.append("orgName", this.LoginUserDetail[0]["org"]);
    this.formdata.append("orgId", this.LoginUserDetail[0]["orgId"]);
    this.formdata.append("pageId", "0");

    this.formdata.append("questionId", QuestionId + "");
    //this.formdata.append("studentClassId", this.StudentClassId.toString());
    this.formdata.append("docTypeId", "0");

    this.formdata.append("image", this.selectedFile, this.selectedFile.name);
    this.uploadImage();
  }

  uploadImage() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.fileUploadService.postFiles(this.formdata).subscribe(res => {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Files uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);

      //this.Edit = false;
    });
  }
  GetExams() {

    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId, 2)
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
    this.SelectedSubContentUnit = this.allMasterData.filter((f:any) => f.ParentId == pContentUnitId.value);
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
  // viewchild(row) {
  //   debugger;
  //   this.option.GetQuestionBankOption(row.QuestionBankId, row.QuestionBankAnswerOptionParentId);
  //   this.tabchanged(1);
  // }
  tabchanged(indx) {
    debugger;
    this.selectedIndex = indx;
  }
  // Detail(value) {
  //   debugger;
  //   this.EvaluationMasterId = value.EvaluationMasterId;
  //   this.selectedIndex += 1;
  //   this.PageLoad();
  // }
  highlight(rowId) {
    if (this.selectedRowIndex == rowId)
      this.selectedRowIndex = -1;
    else
      this.selectedRowIndex = rowId
  }
  AddNew() {
    debugger;
    var _syllabusId = this.searchForm.get("searchUnitDetailId")?.value;
    if (_syllabusId == 0) {
      this.contentservice.openSnackBar("Please select unit detail", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var newItem = {
      QuestionBankId: 0,
      SyllabusId: _syllabusId,
      DifficultyLevelId: 0,
      Question: '',
      Diagram: '',
      Active: false,
      Action: false
    }
    this.QuestionBankList = [];
    this.QuestionBankList.push(newItem);
    this.dataSource = new MatTableDataSource(this.QuestionBankList);
  }
  SaveAll() {
    var _toUpdate = this.QuestionBankList.filter((f:any) => f.Action);
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
    if (row.Question.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter Question", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //console.log("length:" + row.Question.length)
    //row.Question = row.Question.replaceAll("'", "''");
    let checkFilterString = "Question eq '" + row.Question + "'";
    if (row.DifficultyLevelId > 0)
      checkFilterString += " and DifficultyLevelId eq " + row.DifficultyLevelId

    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.QuestionBankForUpdate = [];
    this.QuestionBankData.QuestionBankId = row.QuestionBankId;
    this.QuestionBankData.SyllabusId = row.SyllabusId;
    this.QuestionBankData.Diagram = row.Diagram;
    this.QuestionBankData.DifficultyLevelId = row.DifficultyLevelId;
    this.QuestionBankData.Question = row.Question;
    this.QuestionBankData.OrgId = this.LoginUserDetail[0]['orgId'];
    this.QuestionBankData.SubOrgId = this.SubOrgId;
    this.QuestionBankData.Active = row.Active;

    this.QuestionBankForUpdate.push(this.QuestionBankData);
    //console.log('dta', this.QuestionBankForUpdate);

    if (this.QuestionBankForUpdate[0].QuestionBankId == 0) {
      this.QuestionBankForUpdate[0]["CreatedDate"] = new Date();
      this.QuestionBankForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
      this.QuestionBankForUpdate[0]["UpdatedDate"] = new Date();
      delete this.QuestionBankForUpdate[0]["UpdatedBy"];
      this.insert(row);
    }
    else {
      this.QuestionBankForUpdate[0]["UpdatedDate"] = new Date();
      this.QuestionBankForUpdate[0]["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
      delete this.QuestionBankForUpdate[0]["CreatedDate"];
      delete this.QuestionBankForUpdate[0]["CreatedBy"];
      this.update(row);
    }
  }
  RandomArr :any[]= [];
  GetRandomNumber(NoOfRandom) {
    this.RandomArr = [];
    while (this.RandomArr.length < NoOfRandom) {
      var r = Math.floor(Math.random() * 100) + 1;
      if (this.RandomArr.indexOf(r) === -1) this.RandomArr.push(r);
    }

  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {
    this.dataservice.postPatch('QuestionBanks', this.QuestionBankForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.QuestionBankId = data.QuestionBankId;
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
    this.dataservice.postPatch('QuestionBanks', this.QuestionBankForUpdate[0], this.QuestionBankForUpdate[0].QuestionBankId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          if (this.RowToUpdate == 0) {
            this.RowToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse()
          }
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  cleardata() {
    this.UnitDetails = [];
    this.searchForm.patchValue({ 'searchUnitDetailId': 0 });
    this.QuestionBankList = [];
    this.dataSource = new MatTableDataSource<IQuestionBank>(this.QuestionBankList);
    var _searchClassId = this.searchForm.get("searchClassId")?.value;
    var _searchSectionId = this.searchForm.get("searchSectionId")?.value;
    var _searchSemesterId = this.searchForm.get("searchSemesterId")?.value;
    this.SelectedClassSubjects = globalconstants.getStrictFilteredClassSubjects(this.ClassSubjects, _searchClassId, _searchSectionId, _searchSemesterId);

  }
  Lessons :any[]= [];
  ContentUnit :any[]= [];
  SubContentUnit :any[]= [];
  DifficultyLevels :any[]= [];
  UnitDetails :any[]= [];
  GetSyllabusDetailForDropDown() {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    let filterStr = this.FilterOrgSubOrg + " and Active eq true";// and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var _classId = this.searchForm.get("searchClassId")?.value;
    if (_classId > 0)
      filterStr += " and ClassId eq " + _classId
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    var _classSubjectId = this.searchForm.get("searchSubjectId")?.value;
    if (_classSubjectId > 0)
      filterStr += " and SubjectId eq " + _classSubjectId
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select subject.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _ContentUnitId = this.searchForm.get("searchContentUnitId")?.value;
    if (_ContentUnitId > 0)
      filterStr += " and ContentUnitId eq " + _ContentUnitId

    var _SubContentUnitId = this.searchForm.get("searchSubContentUnitId")?.value;
    if (_SubContentUnitId > 0)
      filterStr += " and SubContentUnitId eq " + _SubContentUnitId

    let list: List = new List();
    list.fields = [
      'SyllabusId',
      'ClassId',
      'SubjectId',
      'ContentUnitId',
      'SubContentUnitId',
      'Lesson',
      'Active'
    ];

    list.PageName = "SyllabusDetails";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.UnitDetails = [];
        data.value.forEach(f => {
          var clsObj = this.Classes.filter(c => c.ClassId == f.ClassId);
          if (clsObj.length > 0)
            f.ClassName = clsObj[0].ClassName;
          else
            f.ClassName = '';
          var subjObj = this.ClassSubjects.filter((s:any) => s.SubjectId == f.SubjectId);
          if (subjObj.length > 0)
            f.SubjectName = subjObj[0].SubjectName
          else
            f.SubjectName = '';

          var unitobj = this.ContentUnit.filter(c => c.MasterDataId == f.ContentUnitId);
          if (unitobj.length > 0)
            f.ContentUnit = unitobj[0].MasterDataName;
          else
            f.ContentUnit = '';

          if (f.SubContentUnitId > 0) {
            var subunitobj = this.allMasterData.filter(g => g.MasterDataId == f.SubContentUnitId);
            if (subunitobj.length > 0)
              f.SubContentUnit = subunitobj[0].MasterDataName;
            else
              f.SubContentUnit = '';
          }
          else
            f.SubContentUnit = '';

          f.UnitDetail = f.ClassName + ", " + f.SubjectName + "-" + f.ContentUnit + "->" + f.SubContentUnit + "->" + f.Lesson;
          this.UnitDetails.push(f);
        })
      })

  }
  GetSyllabusDetail() {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    let filterStr = this.FilterOrgSubOrg + " and Active eq true";// 'Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var _classId = this.searchForm.get("searchClassId")?.value;
    if (_classId > 0)
      filterStr += " and ClassId eq " + _classId
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    var _classSubjectId = this.searchForm.get("searchSubjectId")?.value;
    if (_classSubjectId > 0)
      filterStr += " and SubjectId eq " + _classSubjectId
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select subject.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _ContentUnitId = this.searchForm.get("searchContentUnitId")?.value;
    if (_ContentUnitId > 0)
      filterStr += " and ContentUnitId eq " + _ContentUnitId

    var _SubContentUnitId = this.searchForm.get("searchSubContentUnitId")?.value;
    if (_SubContentUnitId > 0)
      filterStr += " and SubContentUnitId eq " + _SubContentUnitId

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
        var forUnitDetail = {};
        var _imgURL = globalconstants.apiUrl + "/Uploads/" + this.LoginUserDetail[0]["org"] +
          "/Question photo/"; //+ fileNames[0].FileName;


        data.value.forEach(f => {
          var clsObj = this.Classes.filter(c => c.ClassId == f.ClassId);
          if (clsObj.length > 0)
            f.ClassName = clsObj[0].ClassName;
          else
            f.ClassName = '';
          var subjObj = this.ClassSubjects.filter((s:any) => s.SubjectId == f.SubjectId);
          if (subjObj.length > 0)
            f.SubjectName = subjObj[0].SubjectName
          else
            f.SubjectName = '';

          var unitobj = this.ContentUnit.filter(c => c.MasterDataId == f.ContentUnitId);
          if (unitobj.length > 0)
            f.ContentUnit = unitobj[0].MasterDataName;
          else
            f.ContentUnit = '';

          if (f.SubContentUnitId > 0) {
            var subunitobj = this.allMasterData.filter(g => g.MasterDataId == f.SubContentUnitId);
            if (subunitobj.length > 0)
              f.SubContentUnit = subunitobj[0].MasterDataName;
            else
              f.SubContentUnit = '';
          }
          else
            f.SubContentUnit = '';

          f.UnitDetail = f.ClassName + ", " + f.SubjectName + "-" + f.ContentUnit + "->" + f.SubContentUnit + "->" + f.Lesson;

          forUnitDetail["UnitDetail"] = f.UnitDetail;
          forUnitDetail["SyllabusId"] = f.SyllabusId;
          this.UnitDetails.push(forUnitDetail);

          f.QuestionBanks.forEach(q => {

            if (q.StorageFnPs.length > 0)
              q.Diagram = _imgURL + "/" + q.StorageFnPs[0].FileName;
            q.Question = globalconstants.decodeSpecialChars(q.Question);

            this.QuestionBankList.push(q);
          })
        })
        if (this.QuestionBankList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);

        }
        //console.log("QuestionBankList",data.value)
        this.dataSource = new MatTableDataSource(this.QuestionBankList);
        this.loading = false;
      })
  }
  GetQuestionBank(row) {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    let filterStr = this.FilterOrgSubOrg + " and Active eq true";// 'Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    if (row.SyllabusId > 0)
      filterStr += " and SyllabusId eq " + row.SyllabusId;
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select syllabus detail.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }


    let list: List = new List();
    list.fields = [
      'QuestionBankId',
      'SyllabusId',
      'Question',
      'Diagram',
      'Active'
    ];

    list.PageName = "QuestionBanks";
    list.lookupFields = ["StorageFnPs($select=FileId,FileName)"]
    list.filter = [filterStr];
    this.QuestionBankList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  //console.log('data.value', data.value);
        var _imgURL = globalconstants.apiUrl + "/Uploads/" + this.LoginUserDetail[0]["org"] +
          "/Question photo/"; //+ fileNames[0].FileName;

        if (data.value.length > 0) {
          data.value.forEach(item => {
            if (item.ContentUnitId > 0) {
              item.SubCategories = this.allMasterData.filter((f:any) => f.ParentId == item.ContentUnitId);
              if (item.LessonId > 0)
                item.Lessons = this.allMasterData.filter((f:any) => f.ParentId == item.LessonId);
              else
                item.Lessons = [];
            }
            else {
              item.SubCategories = [];
              item.Lessons = [];
            }
            if (item.StorageFnPs.length > 0)
              item.Diagram = _imgURL + "/" + item.StorageFnPs[0].FileName;
            item.Questions = globalconstants.decodeSpecialChars(item.Questions);
            this.QuestionBankList.push(item);

            //return item;
          })
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }

        this.dataSource = new MatTableDataSource<IQuestionBank>(this.QuestionBankList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }
  GetClassSubjects() {
    this.loading = true;
    let list = new List();
    list.PageName = "ClassSubjects";
    list.fields = ["ClassSubjectId,ClassId,SubjectId,SectionId,SemesterId"];
    //list.lookupFields = ["ClassMaster($select=ClassId,ClassName)"];
    //list.filter = ['Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = data.value.map(m => {
          var _subjectname = "";
          var subjectobj = this.allMasterData.filter((f:any) => f.MasterDataId == m.SubjectId);
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
    //this.SelectedClassSubjects = this.ClassSubjects.filter((f:any) => f.ClassId == this.searchForm.get("searchClassId")?.value)
    var _searchClassId = this.searchForm.get("searchClassId")?.value;
    var _searchSectionId = this.searchForm.get("searchSectionId")?.value;
    var _searchSemesterId = this.searchForm.get("searchSemesterId")?.value;
    this.SelectedClassSubjects = globalconstants.getStrictFilteredClassSubjects(this.ClassSubjects, _searchClassId, _searchSectionId, _searchSemesterId);
  }

  GetMasterData() {
    debugger;
    this.allMasterData = this.tokenStorage.getMasterData()!;
    //var result = this.allMasterData.filter((f:any)=>f.MasterDataName =='Question Bank ContentUnit')
    //console.log("result",result)
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.ContentUnit = this.getDropDownData(globalconstants.MasterDefinitions.school.BOOKCONTENTUNIT);
    this.DifficultyLevels = this.getDropDownData(globalconstants.MasterDefinitions.school.DIFFICULTYLEVEL);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.GetExams();
    this.GetClassSubjects();
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
      row.SubCategories = this.allMasterData.filter((f:any) => f.ParentId == row.ContentUnitId);
    else
      row.SubCategories = [];
  }
  SubContentUnitChanged(row) {
    row.Action = true;
    if (row.SubContentUnitId > 0)
      row.Lessons = this.allMasterData.filter((f:any) => f.ParentId == row.SubContentUnitId);
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

export interface IQuestionBank {
  QuestionBankId: number;
  SyllabusId: number;
  DifficultyLevelId: number;
  Question: string;
  Diagram: string;
  Active: boolean;
  Action: boolean;
}

export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}



