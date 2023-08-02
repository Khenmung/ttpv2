import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ClassEvaluationOptionComponent } from '../classevaluationoption/classevaluationoption.component';
import { SwUpdate } from '@angular/service-worker';
import { ConfirmDialogComponent } from 'src/app/shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ClassEvaluation',
  templateUrl: './classevaluation.component.html',
  styleUrls: ['./classevaluation.component.scss']
})
export class ClassEvaluationComponent implements OnInit {
  PageLoading = true;
  @ViewChild("table") mattable;
  @ViewChild(ClassEvaluationOptionComponent) option: ClassEvaluationOptionComponent;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  LoginUserDetail: any[] = [];
  ClassGroups = [];
  CurrentRow: any = {};
  selectedIndex = 0;
  selectedRowIndex = -1;
  RowToUpdate = -1;
  EvaluationNames = [];
  ClassEvaluationIdTopass = 0;
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  ClassEvaluationOptionList = [];
  ClassEvaluationList: IClassEvaluation[] = [];
  //EvaluationMasterId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  QuestionnaireTypes = [];
  SubCategories = [];
  Classes = [];
  ClassSubjects = [];
  Exams = [];
  ExamNames = [];
  //SelectedClassSubjects = [];
  filteredOptions: Observable<IClassEvaluation[]>;
  dataSource: MatTableDataSource<IClassEvaluation>;
  allMasterData = [];

  ClassEvaluationData = {
    ClassEvaluationId: 0,
    ClassEvalCategoryId: 0,
    ClassEvalSubCategoryId: 0,
    MultipleAnswer: 0,
    ExamId: 0,
    EvaluationMasterId: 0,
    Description: '',
    DisplayOrder: 0,
    ClassEvaluationAnswerOptionParentId: 0,
    OrgId: 0, SubOrgId: 0,
    Active: 0,
  };
  EvaluationMasterForClassGroup = [];
  ClassEvaluationForUpdate = [];
  displayedColumns = [
    'ClassEvaluationId',
    'Description',
    'QuestionnaireTypeId',
    'DisplayOrder',
    'ClassEvaluationAnswerOptionParentId',
    'Marks',
    'ExamId',
    'MultipleAnswer',
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
    private dialog: MatDialog
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
    this.StudentClassId = this.tokenStorage.getStudentClassId();
    this.searchForm = this.fb.group({
      searchClassGroupId: [0],
      searchEvaluationMasterId: [0],
    })
    this.PageLoad();
  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  ExamClassGroups = [];
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
        this.GetEvaluationNames();
        this.GetMasterData();
        if (this.Classes.length == 0) {
          this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
            this.Classes = [...data.value];
            this.loading = false; this.PageLoading = false;
          });
          //this.GetClassEvaluation();
        }
        this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg, 0)
          .subscribe((data: any) => {
            this.ExamClassGroups = [...data.value];

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
  FilteredExam = [];
  SelectEvaluation() {
    debugger;
    var _searchClassGroupId = this.searchForm.get("searchClassGroupId").value;
    this.EvaluationMasterForClassGroup = this.EvaluationNames.filter(d => d.ClassGroupId == _searchClassGroupId);
    var examsOfSelectGroup = this.ExamClassGroups.filter(exgroup => exgroup.ClassGroupId == _searchClassGroupId)

    this.FilteredExam = this.Exams.filter(e => examsOfSelectGroup.findIndex(x => x.ExamId == e.ExamId) > -1);
    this.ClearData();
  }
ClearData(){
  this.ClassEvaluationList =[];
  this.dataSource = new MatTableDataSource<any>(this.ClassEvaluationList);
}
  GetExams() {

    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId, 1)
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
  SelectSubCategory(pCategoryId) {
    this.SubCategories = this.allMasterData.filter(f => f.ParentId == pCategoryId.value);
  }
  delete(element) {
    this.openDialog(element);
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
      ClassEvaluationId: row.ClassEvaluationId,
      Active: 0,
      Deleted: true,
      UpdatedDate: new Date()
    }
    //console.log("toUpdate",toUpdate);
    this.dataservice.postPatch('ClassEvaluations', toUpdate, row.ClassEvaluationId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.ClassEvaluationList.findIndex(x => x.ClassEvaluationId == row.ClassEvaluationId)
        this.ClassEvaluationList.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.ClassEvaluationList);
        this.dataSource.filterPredicate = this.createFilter();
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.Description.toLowerCase().indexOf(searchTerms.Description) !== -1
    }
    return filterFunction;
  }
  viewchild(row) {
    debugger;
    this.option.GetClassEvaluationOption(row.ClassEvaluationId, row.ClassEvaluationAnswerOptionParentId);
    this.tabchanged(1);
  }
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
    var _EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;

    var newItem = {
      ClassEvaluationId: 0,
      QuestionnaireTypeId: 0,
      Description: '',
      MultipleAnswer: 0,
      ExamId: 0,
      Marks:0,
      EvaluationMasterId: _EvaluationMasterId,
      ClassEvaluationAnswerOptionParentId: 0,
      DisplayOrder: 0,
      Active: 0,
      Action: false
    }
    this.ClassEvaluationList = [];
    this.ClassEvaluationList.push(newItem);
    this.dataSource = new MatTableDataSource(this.ClassEvaluationList);
  }
  SaveAll() {
    var _toUpdate = this.ClassEvaluationList.filter(f => f.Action);
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
    if (row.Description.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter description", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //this.EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value
    if (row.EvaluationMasterId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("No Evaluation type Id selected.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    // if (this.contentservice.checkSpecialChar(row.Description)) {
    //   this.loading = false; this.PageLoading=false;
    //   this.contentservice.openSnackBar("Special characters not allowed in questionnaire!", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }

    let checkFilterString = "Description eq '" + globalconstants.encodeSpecialChars(row.Description) + "'";
    if (row.QuestionnaireTypeId > 0)
      checkFilterString += " and QuestionnaireTypeId eq " + row.QuestionnaireTypeId
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    // checkFilterString += " and EvaluationMasterId eq " + row.EvaluationMasterId

    // if (row.ClassEvaluationId > 0)
    //   checkFilterString += " and ClassEvaluationId ne " + row.ClassEvaluationId;
    // checkFilterString += " and " + this.StandardFilter;
    // let list: List = new List();
    // list.fields = ["ClassEvaluationId"];
    // list.PageName = "ClassEvaluations";
    // list.filter = [checkFilterString];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    //     //debugger;
    //     if (data.value.length > 0) {
    //       this.loading = false; this.PageLoading = false;
    //       this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
    //       //this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
    //     }
    //     else {
    //this.shareddata.CurrentSelectedBatchId.subscribe(c => this.SelectedBatchId = c);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    this.ClassEvaluationForUpdate = [];;
    ////console.log("inserting-1",this.ClassEvaluationForUpdate);
    this.ClassEvaluationForUpdate.push(
      {
        ClassEvaluationId: row.ClassEvaluationId,
        Active: row.Active,
        QuestionnaireTypeId: row.QuestionnaireTypeId,
        MultipleAnswer: row.MultipleAnswer,
        ExamId: row.ExamId,
        Marks:row.Marks,
        ClassEvaluationAnswerOptionParentId: row.ClassEvaluationAnswerOptionParentId,
        EvaluationMasterId: row.EvaluationMasterId,
        Description: globalconstants.encodeSpecialChars(row.Description),
        DisplayOrder: row.DisplayOrder,
        OrgId: this.LoginUserDetail[0]["orgId"],
        SubOrgId: this.SubOrgId
      });
    //console.log('dta', this.ClassEvaluationForUpdate);
    if (this.ClassEvaluationForUpdate[0].ClassEvaluationAnswerOptionParentId == 0)
      this.ClassEvaluationForUpdate[0].ClassEvaluationAnswerOptionParentId == null;

    if (this.ClassEvaluationForUpdate[0].ClassEvaluationId == 0) {
      this.ClassEvaluationForUpdate[0]["CreatedDate"] = new Date();
      this.ClassEvaluationForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
      this.ClassEvaluationForUpdate[0]["UpdatedDate"] = new Date();
      delete this.ClassEvaluationForUpdate[0]["UpdatedBy"];
      delete this.ClassEvaluationForUpdate[0]["SubCategories"];
      ////console.log("inserting1",this.ClassEvaluationForUpdate);
      this.insert(row);
    }
    else {
      //this.ClassEvaluationForUpdate[0]["CreatedDate"] = new Date(row.CreatedDate);
      //this.ClassEvaluationForUpdate[0]["CreatedBy"] = row.CreatedBy;
      this.ClassEvaluationForUpdate[0]["UpdatedDate"] = new Date();
      delete this.ClassEvaluationForUpdate[0]["SubCategories"];
      delete this.ClassEvaluationForUpdate[0]["UpdatedBy"];
      //this.ClassEvaluationForUpdate[0]["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
      //this.insert(row);
      this.update(row);
    }
    //}
    //});
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {
    //console.log("inserting",this.ClassEvaluationForUpdate);
    //debugger;
    this.dataservice.postPatch('ClassEvaluations', this.ClassEvaluationForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.ClassEvaluationId = data.ClassEvaluationId;
          row.Action = false;
          if (this.RowToUpdate == 0) {
            this.RowToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse()
          }
        });
  }
  update(row) {
    //console.log("updating",this.ClassEvaluationForUpdate);
    this.dataservice.postPatch('ClassEvaluations', this.ClassEvaluationForUpdate[0], this.ClassEvaluationForUpdate[0].ClassEvaluationId, 'patch')
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

  GetClassEvaluation() {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    let filterStr = this.FilterOrgSubOrg;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var _EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;

    // if (this.EvaluationMasterId > 0)
    //   filterStr += " and EvaluationMasterId eq " + this.EvaluationMasterId;
    if (_EvaluationMasterId > 0)
      filterStr += " and EvaluationMasterId eq " + _EvaluationMasterId
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select evaluation type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //filterStr += ' and StudentClassId eq ' + this.StudentClassId
    let list: List = new List();
    list.fields = [
      'ClassEvaluationId',
      'QuestionnaireTypeId',
      'Description',
      'EvaluationMasterId',
      'MultipleAnswer',
      'ExamId',
      'Marks',
      'ClassEvaluationAnswerOptionParentId',
      'DisplayOrder',
      'Active'
    ];

    list.PageName = "ClassEvaluations";

    list.filter = [filterStr];
    this.ClassEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          data.value.forEach(item => {
            var _updatable = false;
            var obj = this.EvaluationNames.filter(f => f.EvaluationMasterId == item.EvaluationMasterId);
            if (obj.length > 0) {
              _updatable = obj[0].AppendAnswer;
              item.Action = false;
              item.Description = globalconstants.decodeSpecialChars(item.Description);
              item.Updatable = _updatable;
              this.ClassEvaluationList.push(item);
            }
            //return item;
          })
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }

        this.ClassEvaluationList = this.ClassEvaluationList.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
        this.dataSource = new MatTableDataSource<IClassEvaluation>(this.ClassEvaluationList);
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
      'Confidential',
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
          this.EvaluationNames = this.contentservice.getConfidentialData(this.tokenStorage, data.value, "EvaluationName");
        }
        //this.loadingFalse();
      });

  }
  GetClassEvaluationOption() {
    //debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    let filterStr = this.FilterOrgSubOrg + " and ParentId eq 0";// and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
      'ClassEvaluationAnswerOptionsId',
      'Title',
      'Description',
      'Point',
      'Correct',
      'ParentId',
      'Active',
    ];

    list.PageName = "ClassEvaluationOptions";

    list.filter = [filterStr];
    this.ClassEvaluationOptionList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassEvaluationOptionList = data.value.map(item => {
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
    //this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.searchForm.get("searchClassId").value)
    // var _classId = this.searchForm.get("searchClassId").value;
    // var _sectionId = this.searchForm.get("searchSectionId").value;
    // var _semesterId = this.searchForm.get("searchSemesterId").value;
    // this.SelectedClassSubjects = globalconstants.getFilteredClassSubjects(this.ClassSubjects,_classId,_sectionId,_semesterId);
  }

  GetMasterData() {
    debugger;
    this.allMasterData = this.tokenStorage.getMasterData();
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.QuestionnaireTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
    this.GetExams();
    this.GetClassSubjects();
    this.GetClassEvaluationOption();
    this.loading = false
  }
  onBlur(row) {
    row.Action = true;
  }
  Sequencing(editedrow) {
    debugger;
    editedrow.Action = true;
    var editedrowindx = this.ClassEvaluationList.findIndex(x => x.ClassEvaluationId == editedrow.ClassEvaluationId);
    var numbering = 0;
    this.ClassEvaluationList.forEach((listrow, indx) => {
      if (indx > editedrowindx) {
        numbering += 1;
        listrow.DisplayOrder = editedrow.DisplayOrder + numbering;
        listrow.Action = true;
      }
    })
  }
  CategoryChanged(row) {
    debugger;
    row.Action = true;
    row.SubCategories = this.allMasterData.filter(f => f.ParentId == row.ClassEvalCategoryId);
  }
  UpdateMultiAnswer(row, event) {
    row.MultipleAnswer = event.checked ? 1 : 0;
    row.Action = true;
  }
  UpdateActive(row, event) {
    row.Active = event.checked ? 1 : 0;
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

}

export interface IClassEvaluation {
  ClassEvaluationId: number;
  QuestionnaireTypeId: number;
  MultipleAnswer: number;
  ExamId: number;
  Description: string;
  Marks:number;
  ClassEvaluationAnswerOptionParentId: number;
  DisplayOrder: number;
  Active: number;
  Action: boolean;
}

export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}



