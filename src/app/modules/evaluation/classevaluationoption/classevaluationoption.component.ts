import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-ClassEvaluationOption',
  templateUrl: './classevaluationoption.component.html',
  styleUrls: ['./classevaluationoption.component.scss']
})
export class ClassEvaluationOptionComponent implements OnInit {
  PageLoading = true;
  @Input() ClassEvaluationId: number;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  FilterOrgSubOrg = '';
  loading = false;
  ClassEvaluationOptionList: IClassEvaluationOption[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
  QuestionnaireTypes = [];
  EvaluationOptionAutoComplete = [];
  Classes = [];
  RatingOptions = [];
  filteredOptions: Observable<IClassEvaluationOption[]>;
  dataSource: MatTableDataSource<IClassEvaluationOption>;
  allMasterData = [];
  AnswerOptionsId = 0;
  ClassEvaluationOptionData = {
    ClassEvaluationAnswerOptionsId: 0,
    Title: '',
    Description: '',
    Point: 0,
    Correct: 0,
    ClassEvaluationId: 0,
    ParentId: 0,
    Active: 0
  };
  ClassEvaluationOptionForUpdate = [];
  displayedColumns = [
    'ClassEvaluationAnswerOptionsId',
    'Title',
    'Description',
    'Point',
    'Correct',
    'ParentId',
    'Active',
    'Action'
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
    this.StudentClassId = this.tokenStorage.getStudentClassId();
    this.PageLoad();
  }

  displayFn(option: IClassEvaluationOption): string {
    return option && option.Title ? option.Title : '';
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.CLASSEVALUATIONOPTION)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.searchForm = this.fb.group({
          searchParent: ['']
        })
        this.GetEvaluationOptionAutoComplete();
        this.filteredOptions = this.searchForm.get("searchParent").valueChanges
          .pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : value.Title),
            map(Title => Title ? this._filter(Title) : this.EvaluationOptionAutoComplete.slice())
          );
        
        this.loading = false; this.PageLoading = false;

      }
    }
  }
  private _filter(name: string): IClassEvaluationOption[] {

    const filterValue = name.toLowerCase();
    return this.EvaluationOptionAutoComplete.filter(option => option.Title.toLowerCase().includes(filterValue));

  }
  // SelectSubCategory(pCategoryId) {
  //   this.SubCategories = this.allMasterData.filter(f => f.ParentId == pCategoryId.value);
  // }
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
  AddParent() {
    debugger;
    var _title = this.searchForm.get("searchParent").value.Title;
    var parentItem = {
      ClassEvaluationAnswerOptionsId: 0,
      Title: _title,
      Description: '0',
      Point: 0,
      Correct: 0,
      ClassEvaluationId: 0,
      ParentId: 0,
      Active: 1
    }
    this.UpdateOrSave(parentItem);
  }
  AddNew() {
    var _AnswerOptionId = this.searchForm.get("searchParent").value.ClassEvaluationAnswerOptionsId;
    // if (_AnswerOptionId == undefined) {
    //   this.loading = false; this.PageLoading=false;
    //   this.contentservice.openSnackBar("Please select parent", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    if (_AnswerOptionId == undefined)
      _AnswerOptionId = 0;
    var newItem = {
      ClassEvaluationAnswerOptionsId: 0,
      Title: '',
      Description: '',
      Point: 0,
      Correct: 0,
      ClassEvaluationId: 0,
      ParentId: _AnswerOptionId,
      Active: 0,
      Action: false
    }
    this.ClassEvaluationOptionList = [];
    this.ClassEvaluationOptionList.push(newItem);
    this.dataSource = new MatTableDataSource(this.ClassEvaluationOptionList);
  }
  ClearData() {
    this.ClassEvaluationOptionList = [];
    this.dataSource = new MatTableDataSource(this.ClassEvaluationOptionList);
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    if (row.Title == undefined) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Title is required.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let checkFilterString = this.FilterOrgSubOrg;
    if (row.ParentId != null)
      checkFilterString += " and ParentId eq " + row.ParentId
    checkFilterString += " and Title eq '" + globalconstants.encodeSpecialChars(row.Title) + "'";

    if (row.ClassEvaluationAnswerOptionsId > 0)
      checkFilterString += " and ClassEvaluationAnswerOptionsId ne " + row.ClassEvaluationAnswerOptionsId;
    //checkFilterString += " and OrgId eq " + this.LoginUserDetail[0]["orgId"];
    let list: List = new List();
    list.fields = ["ClassEvaluationAnswerOptionsId"];
    list.PageName = "ClassEvaluationOptions";
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
          this.ClassEvaluationOptionForUpdate = [];
          this.ClassEvaluationOptionForUpdate.push(
            {
              ClassEvaluationAnswerOptionsId: row.ClassEvaluationAnswerOptionsId,
              Title: globalconstants.encodeSpecialChars(row.Title),
              Description: globalconstants.encodeSpecialChars(row.Description),
              Point: row.Point,
              Correct: row.Correct,
              ClassEvaluationId: this.ClassEvaluationId,
              ParentId: row.ParentId,
              Active: row.Active,
              OrgId: this.LoginUserDetail[0]["orgId"],
              SubOrgId: this.SubOrgId
            });
          //console.log('dta', this.ClassEvaluationOptionForUpdate);

          if (this.ClassEvaluationOptionForUpdate[0].ClassEvaluationAnswerOptionsId == 0) {
            this.ClassEvaluationOptionForUpdate[0]["CreatedDate"] = new Date();
            this.ClassEvaluationOptionForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ClassEvaluationOptionForUpdate[0]["UpdatedDate"] = new Date();
            delete this.ClassEvaluationOptionForUpdate[0]["UpdatedBy"];
            this.insert(row);
          }
          else {
            this.ClassEvaluationOptionForUpdate[0]["CreatedDate"] = new Date(row.CreatedDate);
            this.ClassEvaluationOptionForUpdate[0]["CreatedBy"] = row.CreatedBy;
            this.ClassEvaluationOptionForUpdate[0]["UpdatedDate"] = new Date();
            delete this.ClassEvaluationOptionForUpdate[0]["UpdatedBy"];
            this.update(row);
          }
        }
      });

  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {
    this.dataservice.postPatch('ClassEvaluationOptions', this.ClassEvaluationOptionForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.ClassEvaluationAnswerOptionsId = data.ClassEvaluationAnswerOptionsId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.GetEvaluationOptionAutoComplete();
          this.loadingFalse()
        });
  }
  update(row) {
    this.dataservice.postPatch('ClassEvaluationOptions', this.ClassEvaluationOptionForUpdate[0], this.ClassEvaluationOptionForUpdate[0].ClassEvaluationAnswerOptionsId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.GetEvaluationOptionAutoComplete();
          this.loadingFalse();
        });
  }
  SearchAnswerOptions() {
    debugger;
    this.AnswerOptionsId = this.searchForm.get("searchParent").value.ClassEvaluationAnswerOptionsId;
    if (this.AnswerOptionsId == undefined)
      this.AnswerOptionsId = 0;
    this.GetClassEvaluationOption(0, this.AnswerOptionsId);
    // else
    //   this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
  }
  GetClassEvaluationOption(pClassEvaluationId, pAnswerOptionId) {
    debugger;
    this.loading = true;
    let filterStr = this.FilterOrgSubOrg;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    // if (pAnswerOptionId == 0 && pClassEvaluationId == 0) {
    //   this.contentservice.openSnackBar("Atleast one parameter should be provided.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    //if (pAnswerOptionId > 0)
    filterStr += " and ParentId eq " + pAnswerOptionId

    if (pClassEvaluationId > 0)
      filterStr += " and ClassEvaluationId eq " + pClassEvaluationId

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

    list.filter = [filterStr];
    this.ClassEvaluationOptionList = [];
    this.dataSource = new MatTableDataSource<any>([]);
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.ClassEvaluationOptionList = data.value.map(item => {
            item.Title = globalconstants.decodeSpecialChars(item.Title);
            item.Action = false;
            return item;
          })
        }
        else {
          this.contentservice.openSnackBar("No answer option found.", globalconstants.ActionText, globalconstants.BlueBackground);
        }

        this.dataSource = new MatTableDataSource<IClassEvaluationOption>(this.ClassEvaluationOptionList);

        this.loadingFalse();
      });

  }
  GetEvaluationOptionAutoComplete() {
    //debugger;
    this.loading = true;
    let filterStr = this.FilterOrgSubOrg + " and ParentId eq 0";// and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
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

    list.filter = [filterStr];
    this.ClassEvaluationOptionList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.EvaluationOptionAutoComplete = [...data.value]
      })
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.QuestionnaireTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
    //this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
    this.loading = false; this.PageLoading = false;
  }
  onBlur(row) {
    row.Action = true;
  }
  UpdateActive(row, event) {
    row.Active = event.checked ? 1 : 0;
    row.Action = true;
  }
  UpdateCorrect(row, event) {
    row.Correct = event.checked ? 1 : 0;
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
export interface IClassEvaluationOption {
  ClassEvaluationAnswerOptionsId: number;
  Title: string;
  Description: string;
  Point: number;
  Correct: number;
  ClassEvaluationId: number;
  ParentId: number;
  Active: number;
  Action: boolean;
}

export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}




