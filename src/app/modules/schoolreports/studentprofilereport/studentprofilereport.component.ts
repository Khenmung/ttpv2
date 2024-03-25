import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { IEvaluationMaster } from '../../evaluation/evaluationmaster/evaluationmaster.component';

@Component({
  selector: 'app-studentprofilereport',
  templateUrl: './studentprofilereport.component.html',
  styleUrls: ['./studentprofilereport.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class StudentprofilereportComponent implements OnInit {
  PageLoading = true;
  Defaultvalue=0;
  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  ClassSubjects :any[]= [];
  Ratings :any[]= [];
  SelectedApplicationId = 0;
  StudentClassId = 0;
  ClassId = 0;
  Permission = '';
  //StandardFilter = '';
  loading = false;
  StudentEvaluationList:any[]= [];
  SelectedBatchId = 0;SubOrgId = 0;
  FilterOrgSubOrgBatchId='';
  FilterOrgSubOrg='';
  QuestionnaireTypes :any[]= [];
  Classes :any[]= [];
  ClassEvaluations :any[]= [];
  RatingOptions :any[]= [];
  dataSource: MatTableDataSource<any>;
  allMasterData :any[]= [];
  EvaluationTypes :any[]= [];
  Sections :any[]= [];
  Students :any[]= [];
  Exams :any[]= [];
  ExamNames :any[]= [];
  SelectedClassSubjects :any[]= [];
  StudentEvaluationData = {
    StudentEvaluationId: 0,
    ClassEvaluationId: 0,
    RatingId: 0,
    Detail: '',
    EvaluationTypeId: 0,
    ExamId: 0,
    StudentClassId: 0,
    OrgId: 0,SubOrgId: 0,
    Active: 0
  };
  StudentEvaluationForUpdate :any[]= [];
  displayedColumns = [
    'Id',
    'Description',
    //'Detail',
    'RatingId',
  ];
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  searchForm: UntypedFormGroup;
  filteredOptions: Observable<IStudent[]>;
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
      searchEvaluationTypeId: [0],
      searchExamId: [0]
    });

    this.filteredOptions = this.searchForm.get("searchStudentName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      )!;
    // this.StudentClassId = this.tokenStorage.getStudentClassId()!;
    // if (this.StudentClassId == 0) {
    //   this.contentservice.openSnackBar("Student class Id is zero", globalconstants.ActionText, globalconstants.RedBackground);

    // }
    // else {
    //   this.ClassId = this.tokenStorage.getClassId()!;
    this.PageLoad();
    //}
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.STUDENTAPROFILE)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetMasterData();
        this.GetEvaluationMaster();
        if (this.Classes.length == 0) {
          var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
            if(data.value) this.Classes = [...data.value]; else this.Classes = [...data];
            this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
          });

        }


      }
    }
  }


  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }

  GetStudentEvaluation() {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    let filterStr = this.FilterOrgSubOrg;
    filterStr += ' and StudentClassId eq ' + this.StudentClassId

    var _searchEvaluationTypeId = this.searchForm.get("searchEvaluationTypeId")?.value;
    var _searchExamId = this.searchForm.get("searchExamId")?.value;
    //var _searchSubjectId = this.searchForm.get("searchSubjectId")?.value;
    if (_searchEvaluationTypeId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select evaluation type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //console.log("ClassEvaluations", this.ClassEvaluations)
    var _classEvaluations = this.ClassEvaluations.filter((f:any) => f.EvaluationTypeId == _searchEvaluationTypeId
      && (f.ClassId == 0 || f.ClassId == this.ClassId));
    if (_searchExamId > 0) {
      _classEvaluations = _classEvaluations.filter((f:any) => f.ExamId == _searchExamId);
    }
    let list: List = new List();
    list.fields = [
      'StudentEvaluationId',
      'StudentClassId',
      'ClassEvaluationId',
      'RatingId',
      'Detail',
      'EvaluationTypeId',
      'ExamId',
      'Active'
    ];

    list.PageName = "StudentEvaluations";
    list.lookupFields = ["StudentEvaluationAnswers($select=AnswerOptionsId)"];

    list.filter = [filterStr];
    this.StudentEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        var item;
        _classEvaluations.forEach((clseval, indx) => {
          var existing = data.value.filter((f:any) => f.ClassEvaluationId == clseval.ClassEvaluationId);
          var slNo = indx + 1 + ""
          slNo = slNo.length == 1 ? "0" + slNo : slNo;
          if (existing.length > 0) {
            clseval.ClassEvaluationOptions.forEach(cls => {
              cls.checked = existing[0].StudentEvaluationAnswers.findIndex(stud => stud.AnswerOptionsId == cls.AnswerOptionsId) >= 0
            })

            item = {
              Id: slNo,
              ClassEvaluationOptions: clseval.ClassEvaluationOptions,
              StudentClassId: this.StudentClassId,
              CatSequence: clseval.DisplayOrder,
              RatingId: existing[0].RatingId,
              Description: clseval.Description,
              Detail: existing[0].Detail,
              StudentEvaluationId: existing[0].StudentEvaluationId,
              ClassEvaluationId: existing[0].ClassEvaluationId,
              Active: existing[0].Active,
              EvaluationTypeId: existing[0].EvaluationTypeId,
              ExamId: existing[0].ExamId,
              MultipleAnswer: clseval.MultipleAnswer,
              StudentEvaluationAnswers: existing[0].StudentEvaluationAnswers,
              //Checked:StudentEvaluationAnswer.findIndex(f=>f.AnswerOptionsId===item.AnswerOptionsId) >= 0
            }
          }
          else {
            clseval.ClassEvaluationOptions.forEach(f => f.checked = false);
            item = {
              Id: slNo,
              ClassEvaluationOptions: clseval.ClassEvaluationOptions,
              StudentClassId: this.StudentClassId,
              CatSequence: clseval.DisplayOrder,
              RatingId: 0,
              Description: clseval.Description,
              Detail: '',
              StudentEvaluationId: 0,
              ClassEvaluationId: clseval.ClassEvaluationId,
              Active: 0,
              EvaluationTypeId: _searchEvaluationTypeId,
              ExamId: 0,
              MultipleAnswer: 0,
              StudentEvaluationAnswers: []
            }
          }
          this.StudentEvaluationList.push(item);
        })
        //console.log("this.StudentEvaluationList", this.StudentEvaluationList)
        this.dataSource = new MatTableDataSource<IStudentEvaluation>(this.StudentEvaluationList);
        this.loadingFalse();
      });

  }
  GetStudents() {

    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'StudentId',
      'ClassId',
      'RollNo',
      'SectionId'
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student($select=FirstName,LastName)"]
    //list.filter = [this.FilterOrgSubOrg + " and IsCurrent eq true"];
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  ////console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Students = data.value.map(student => {
            var _classNameobj = this.Classes.filter(c => c.ClassId == student.ClassId);
            var _className = '';
            if (_classNameobj.length > 0)
              _className = _classNameobj[0].ClassName;

            var _Section = '';
            var _sectionobj = this.Sections.filter((f:any) => f.MasterDataId == student.SectionId);
            if (_sectionobj.length > 0)
              _Section = _sectionobj[0].MasterDataName;

            var _lastname = student.Student.LastName == null ? '' : " " + student.Student.LastName;
            var _RollNo = student.RollNo;
            var _name = student.Student.FirstName + _lastname;
            var _fullDescription = _name + " - " + _className + " - " + _Section + " - " + _RollNo;
            return {
              StudentClassId: student.StudentClassId,
              StudentId: student.StudentId,
              Name: _fullDescription
            }
          })
        }
        this.loading = false; this.PageLoading = false;
      })
  }
  GetExams() {

    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId,1)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.map(e => {
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
  // GetSelectedClassSubject() {
  //   debugger;
  //   this.SelectedClassSubjects = this.ClassSubjects.filter((f:any) => f.ClassId == this.ClassId)
  // }
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
          var subjectobj = this.allMasterData.filter((f:any) => f.MasterDataId == m.SubjectId);
          if (subjectobj.length > 0)
            _subjectname = subjectobj[0].MasterDataName;
          m.SubjectName = _subjectname;

          return m;

        });
        this.SelectedClassSubjects = this.ClassSubjects.filter((f:any) => f.ClassId == this.ClassId);
      });
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.QuestionnaireTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
    this.EvaluationTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.EVALUATIONTYPE);
    this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.GetExams();
    this.GetClassSubjects();
    this.GetClassEvaluations();
    this.GetStudents();
    //this.GetStudentEvaluation();
  }
  // SelectSubCategory(pCategoryId) {
  //   this.SubCategories = this.allMasterData.filter((f:any) => f.ParentId == pCategoryId.value);
  // }
  onBlur(row) {
    //row.RatingId = 
    row.Action = true;
  }
  EvaluationMasterList=[];
  EvaluationMasterForDropdown=[];
  GetEvaluationMaster() {
    debugger;

    this.loading = true;
    let filterStr = this.FilterOrgSubOrg;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    // var _classGroupId = this.searchForm.get("searchClassGroupId")?.value;
    // var _evaluationMasterId = this.searchForm.get("searchEvaluationMasterId")?.value;
    // ////console.log("classgroup",this.ClassGroups)
    // if (_evaluationMasterId)
    //   filterStr += " and EvaluationMasterId eq " + _evaluationMasterId;
    // if (_classGroupId)
    //   filterStr += " and ClassGroupId eq " + _classGroupId;

    let list: List = new List();
    list.fields = [
      "EvaluationMasterId",
      "EvaluationName",
      "Description",
      "ETypeId",
      "Duration",
      "StartDate",
      "StartTime",
      "ClassGroupId",
      "FullMark",
      "PassMark",
      "DisplayResult",
      "ProvideCertificate",
      "Confidential",
      "Active"
    ];

    list.PageName = "EvaluationMasters";
    list.filter = [filterStr];
    this.EvaluationMasterList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.EvaluationMasterList = data.value.map(d => {

            d.EvaluationName = globalconstants.decodeSpecialChars(d.EvaluationName);
            d.Description = globalconstants.decodeSpecialChars(d.Description);
            d.Action = false;
            return d;
          })
        }
       
        this.loadingFalse();
      });
    //}
  }
  CategoryChanged(row) {
    debugger;
    row.Action = true;
    //row.SubCategories = this.Categories.filter((f:any)=>f.MasterDataId == row.CategoryId);
    var item = this.StudentEvaluationList.filter((f:any) => f.StudentEvaluationId == row.StudentEvaluationId);
    item[0].SubCategories = this.allMasterData.filter((f:any) => f.ParentId == row.CategoryId);

    //////console.log("dat", this.StudentEvaluationList);
    this.dataSource = new MatTableDataSource(this.StudentEvaluationList);


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
  GetClassEvaluations() {

    //////console.log(this.LoginUserDetail);

    let list: List = new List();
    list.fields = [
      'ClassEvaluationId',
      'QuestionnaireTypeId',
      'DisplayOrder',
      //'ClassId',
      //'SubjectId',
      'Description',
      'EvaluationMasterId',
      'ClassEvaluationAnswerOptionParentId',
      'MultipleAnswer',
      'ExamId'
    ];

    list.PageName = "ClassEvaluations";
    list.lookupFields = ["ClassEvaluationOptions($filter=Active eq 1;$select=ClassEvaluationAnswerOptionsId,Title,Description,Correct,Point)"]
    list.filter = [this.FilterOrgSubOrg + ' and Active eq 1'];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  ////console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.ClassEvaluations = data.value.map(clseval => {
            var _categoryName = ''
            var catobj = this.allMasterData.filter((f:any) => f.MasterDataId == clseval.QuestionnaireTypeId)
            if (catobj.length > 0)
              _categoryName = catobj[0].MasterDataName;
            var _subCategoryName = '';
            // var subcatobj = this.allMasterData.filter((f:any) => f.MasterDataId == clseval.ClassEvalSubCategoryId)
            // if (subcatobj.length > 0)
            //   _subCategoryName = subcatobj[0].MasterDataName;
            clseval.CategoryName = _categoryName;
            clseval.SubCategoryName = _subCategoryName;
            return clseval;
          })
        }
        this.loadingFalse();
      })
  }

}
export interface IStudentEvaluation {
  StudentEvaluationId: number;
  ClassEvaluationId: number;
  RatingId: number;
  Detail: string;
  StudentClassId: number;
  EvaluationTypeId: number;
  ExamId: number;
  //QuestionnaireTypeId: any[];
  Active: number;
  Action: boolean;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}



