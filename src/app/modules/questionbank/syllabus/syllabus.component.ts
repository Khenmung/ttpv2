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
import { FileUploadService } from 'src/app/shared/upload.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-syllabus',
  templateUrl: './syllabus.component.html',
  styleUrls: ['./syllabus.component.scss']
})
export class SyllabusComponent implements OnInit {
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
  SyllabusIdTopass = 0;
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  SyllabusOptionList = [];
  SyllabusList: ISyllabus[] = [];
  //EvaluationMasterId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  QuestionnaireTypes = [];
  SubContentUnits = [];
  Classes = [];
  ClassSubjects = [];
  //Exams = [];
  //ExamNames = [];
  SelectedClassSubjects = [];
  filteredOptions: Observable<ISyllabus[]>;
  dataSource: MatTableDataSource<ISyllabus>;
  allMasterData = [];

  SyllabusData = {
    SyllabusId: 0,
    ClassId: 0,
    SubjectId: 0,
    ContentUnitId: 0,
    SubContentUnitId: 0,
    Lesson: '',
    OrgId: 0, SubOrgId: 0,
    Active: false
  };
  EvaluationMasterForClassGroup = [];
  SyllabusForUpdate = [];
  displayedColumns = [
    'SyllabusId',
    'ContentUnitId',
    'SubContentUnitId',
    'Lesson',
    'Active',
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
    this.StudentClassId = this.tokenStorage.getStudentClassId();
    this.searchForm = this.fb.group({
      searchClassId: [0],
      searchSubjectId: [0],
      searchContentUnitId: [0],
      searchSubContentUnitId: [0],
      searchLessonId: [0],
      searchDifficultyLevelId: [0]
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
        this.SubOrgId = this.tokenStorage.getSubOrgId();
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        //this.GetEvaluationNames();
        this.GetMasterData();
        if (this.Classes.length == 0) {
          var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
            this.Classes = [...data.value];
            this.loading = false; this.PageLoading = false;
          });
          //this.GetSyllabus();
        }
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
    this.formdata.append("folderName", "Question Bank");
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
  // GetExams() {

  //   this.contentservice.GetExams(this.LoginUserDetail[0]["orgId"],this.SubOrgId, this.SelectedBatchId)
  //     .subscribe((data: any) => {
  //       this.Exams = [];
  //       data.value.forEach(e => {
  //         var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
  //         if (obj.length > 0)
  //           this.Exams.push({
  //             ExamId: e.ExamId,
  //             ExamName: obj[0].MasterDataName,
  //             ClassGroupId: e.ClassGroupId
  //           })
  //       });
  //       this.loading = false; this.PageLoading = false;
  //     })
  // }
  SelectSubContentUnit(pContentUnitId) {
    this.SubContentUnits = this.allMasterData.filter(f => f.ParentId == pContentUnitId.value);
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
  //   this.option.GetSyllabusOption(row.SyllabusId, row.SyllabusAnswerOptionParentId);
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
    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    var _SubjectId = this.searchForm.get("searchSubjectId").value;
    if (_SubjectId == 0) {
      this.contentservice.openSnackBar("Please select subject.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _searchContentUnitId = this.searchForm.get("searchContentUnitId").value;
    var _searchSubContentUnitId = this.searchForm.get("searchSubContentUnitId").value;

    debugger;
    var Sub = [];
    if (_searchContentUnitId > 0) {
      Sub = this.allMasterData.filter(f => f.ParentId == _searchContentUnitId)
    }
    var newItem = {
      SyllabusId: 0,
      ClassId: _classId,
      SubjectId: _SubjectId,
      ContentUnitId: _searchContentUnitId,
      SubContentUnitId: _searchSubContentUnitId,
      SubContentUnits: Sub,
      Lesson: '',
      Active: false,
      Action: false
    }
    this.SyllabusList = [];
    this.SyllabusList.push(newItem);
    this.dataSource = new MatTableDataSource(this.SyllabusList);
  }
  SaveAll() {
    var _toUpdate = this.SyllabusList.filter(f => f.Action);
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
    let checkFilterString = this.FilterOrgSubOrg;// "OrgId eq " + this.LoginUserDetail[0]["orgId"];

    if (row.Lesson.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter lesson", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else
      checkFilterString += " and Lesson eq '" + globalconstants.encodeSpecialChars(row.Lesson) + "'";

    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else
      checkFilterString += " and ClassId eq " + _classId;

    var _SubjectId = this.searchForm.get("searchSubjectId").value;
    if (_SubjectId == 0) {
      this.contentservice.openSnackBar("Please select subject.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else
      checkFilterString += " and SubjectId eq " + _SubjectId;

    if (row.ContentUnitId == 0) {
      this.contentservice.openSnackBar("Please select content unit.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else
      checkFilterString += " and ContentUnitId eq " + row.ContentUnitId;

    if (row.SubContentUnitId > 0) {
      checkFilterString += " and SubContentUnitId eq " + row.SubContentUnitId;
    }

    if (row.SyllabusId > 0)
      checkFilterString += " and SyllabusId ne " + row.SyllabusId;
    let list: List = new List();
    list.fields = ["SyllabusId"];
    list.PageName = "SyllabusDetails";
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
          this.SyllabusForUpdate = [];;
          this.SyllabusData.SyllabusId = row.SyllabusId;
          this.SyllabusData.ContentUnitId = row.ContentUnitId;
          this.SyllabusData.SubContentUnitId = row.SubContentUnitId;
          this.SyllabusData.ClassId = row.ClassId;
          this.SyllabusData.SubjectId = row.SubjectId;
          this.SyllabusData.Lesson = row.Lesson;
          this.SyllabusData.OrgId = this.LoginUserDetail[0]['orgId'];
          this.SyllabusData.SubOrgId = this.SubOrgId;
          this.SyllabusData.Active = row.Active;

          this.SyllabusForUpdate.push(this.SyllabusData);
          console.log('SyllabusForUpdate', this.SyllabusForUpdate);
          // if (this.SyllabusForUpdate[0].SyllabusId == 0)
          //   this.SyllabusForUpdate[0].SyllabusId == null;

          if (this.SyllabusForUpdate[0].SyllabusId == 0) {
            this.SyllabusForUpdate[0]["CreatedDate"] = new Date();
            this.SyllabusForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.SyllabusForUpdate[0]["UpdatedDate"] = new Date();
            delete this.SyllabusForUpdate[0]["UpdatedBy"];
            this.insert(row);
          }
          else {
            this.SyllabusForUpdate[0]["UpdatedDate"] = new Date();
            this.SyllabusForUpdate[0]["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.SyllabusForUpdate[0]["CreatedDate"];
            delete this.SyllabusForUpdate[0]["CreatedBy"];
            this.update(row);
          }
        }
      });
  }
  RandomArr = [];
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
    this.dataservice.postPatch('SyllabusDetails', this.SyllabusForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.SyllabusId = data.SyllabusId;
          row.Action = false;
          if (this.RowToUpdate == 0) {
            this.RowToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse()
          }
        });
  }
  update(row) {
    //console.log("updating",this.SyllabusForUpdate);
    this.dataservice.postPatch('SyllabusDetails', this.SyllabusForUpdate[0], this.SyllabusForUpdate[0].SyllabusId, 'patch')
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
    this.SyllabusList = [];
    this.dataSource = new MatTableDataSource<ISyllabus>(this.SyllabusList);
  }
  Lessons = [];
  ContentUnit = [];
  SubContentUnit = [];
  DifficultyLevels = [];
  GetSyllabus() {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    let filterStr = this.FilterOrgSubOrg //'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId > 0)
      filterStr += " and ClassId eq " + _classId
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    var _SubjectId = this.searchForm.get("searchSubjectId").value;
    if (_SubjectId > 0)
      filterStr += " and SubjectId eq " + _SubjectId
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select subject.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _ContentUnitId = this.searchForm.get("searchContentUnitId").value;
    if (_ContentUnitId > 0)
      filterStr += " and ContentUnitId eq " + _ContentUnitId

    var _SubContentUnitId = this.searchForm.get("searchSubContentUnitId").value;
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
    this.SyllabusList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;

        if (data.value.length > 0) {
          data.value.forEach(item => {
            if (item.ContentUnitId > 0) {
              item.SubContentUnits = this.allMasterData.filter(f => f.ParentId == item.ContentUnitId);

            }
            else {
              item.SubContentUnits = [];
            }
            this.SyllabusList.push(item);

            //return item;
          })
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }

        this.dataSource = new MatTableDataSource<ISyllabus>(this.SyllabusList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }
  GetEvaluationNames() {
    //debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    let filterStr = this.FilterOrgSubOrg + " and Active eq true";// and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
      'EvaluationMasterId',
      'EvaluationName',
      'ClassGroupId',
      'Description',
      'Duration',
      'AppendAnswer',
      'DisplayResult',
      'ProvideCertificate',
      'FullMark',
      'PassMark',
      'Active'
    ];

    list.PageName = "EvaluationMasters";

    list.filter = [filterStr];
    this.EvaluationNames = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.EvaluationNames = data.value.map(item => {
            return item;
          })
        }
        //this.loadingFalse();
      });

  }
  GetSyllabusOption() {
    //debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    let filterStr = this.FilterOrgSubOrg + " and ParentId eq 0";// and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
      'SyllabusAnswerOptionsId',
      'Title',
      'Description',
      'Point',
      'Correct',
      'ParentId',
      'Active',
    ];

    list.PageName = "SyllabusOptions";

    list.filter = [filterStr];
    this.SyllabusOptionList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.SyllabusOptionList = data.value.map(item => {
            return item;
          })
        }
      });

  }
  GetClassSubjects() {
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
    //this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.ContentUnit = this.getDropDownData(globalconstants.MasterDefinitions.school.BOOKCONTENTUNIT);
    //this.GetExams();
    this.GetClassSubjects();
    //this.GetSyllabusOption();
    this.loading = false
  }
  onBlur(row) {
    row.Action = true;
  }
  Sequencing(editedrow) {
    debugger;
    editedrow.Action = true;
    var editedrowindx = this.SyllabusList.findIndex(x => x.SyllabusId == editedrow.SyllabusId);
    //var numbering = 0;
    this.SyllabusList.forEach((listrow, indx) => {
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
      row.SubContentUnits = this.allMasterData.filter(f => f.ParentId == row.ContentUnitId);
    else
      row.SubContentUnits = [];
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

export interface ISyllabus {
  SyllabusId: number;
  ClassId: number;
  SubjectId: number;
  ContentUnitId: number;
  SubContentUnitId: number;
  Lesson: string;
  Active: boolean;
  Action: boolean;
}

export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}



