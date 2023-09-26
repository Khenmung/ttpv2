import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-StudentActivity',
  templateUrl: './studentactivity.component.html',
  styleUrls: ['./studentactivity.component.scss']
})
export class StudentActivityComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  RowsToUpdate = -1;
  EvaluationStarted = false;
  EvaluationSubmitted = false;
  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  StudentClassId = 0;
  ClassId = 0;
  Permission = '';
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  AchievementAndPoints :any[]= [];
  ActivityCategory :any[]= [];
  RelevantEvaluationListForSelectedStudent :any[]= [];
  SportsResultList:any[]= [];
  SelectedBatchId = 0;SubOrgId = 0;
  Sections :any[]= [];
  Classes :any[]= [];
  dataSource: MatTableDataSource<any>;
  allMasterData :any[]= [];
  SelectedClassSubjects :any[]= [];
  StudentClasses :any[]= [];
  Students :any[]= [];
  ActivityNames :any[]= [];
  ActivitySessions :any[]= [];
  PointCategory :any[]= [];
  filteredStudents: Observable<IStudent[]>;
  SportsResultData = {
    SportResultId: 0,
    RankId: 0,
    Achievement: '',
    SportsNameId: 0,
    CategoryId: 0,
    SubCategoryId: 0,
    StudentClassId: 0,
    AchievementDate: new Date(),
    SessionId: 0,
    OrgId: 0,SubOrgId: 0,
    Active: 0
  };
  SportsResultForUpdate :any[]= [];
  displayedColumns = [
    //"SportResultId",
    "Student",
    "RankId",
    "Achievement",
    "SportsNameId",    
    "CategoryId",
    //"SubCategoryId",
    "SessionId",
    "AchievementDate",
    "Active",
    "Action"
  ];
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
      searchClassId: 0,
      searchSectionId: 0,
      searchStudentName: [0],
      //searchActivityId: [0],
      //searchCategoryId: [0],
      //searchSessionId: [0]
    });
    this.filteredStudents = this.searchForm.get("searchStudentName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      )!;
    this.ClassId = this.tokenStorage.getClassId()!;
    this.PageLoad();

  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

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
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EXECUTEEVALUATION)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.StudentClassId = this.tokenStorage.getStudentClassId()!;

        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetMasterData();

        if (this.Classes.length == 0) {
          var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
            this.Classes = [...data.value];
            this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
            this.loading = false;
          });
        }

        // this.GetStudentClasses();
      }
    }
  }
  ClearData(){
    this.SportsResultList =[];
    this.dataSource = new MatTableDataSource<ISportsResult>([]);
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
      Active: 0,
      Deleted: true,
      UpdatedDate: new Date()
    }

    this.dataservice.postPatch('SportResults', toUpdate, row.SportResultId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.SportsResultList.findIndex(x => x.SportResultId == row.SportResultId)
        this.SportsResultList.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.SportsResultList);
        this.dataSource.filterPredicate = this.createFilter();
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.MasterDataName.toLowerCase().indexOf(searchTerms.MasterDataName) !== -1
    }
    return filterFunction;
  }
  SetStudentClassId() {
    debugger;
    var obj = this.searchForm.get("searchStudentName")?.value.StudentClassId;
    if (obj != undefined) {
      this.StudentClassId = obj
    }
    else
      this.StudentClassId = 0;
  }
  SelectedClassCategory='';
  Defaultvalue=0;
  Semesters :any[]=[];
  ClassCategory:any[]=[];
  getCollegeCategory(){
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory(){
    return globalconstants.CategoryHighSchool;
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    // var _studentclassId = this.searchForm.get("searchStudentName")?.value.StudentClassId;
    // if (_studentclassId == undefined) {
    //   this.loading = false;
    //   this.contentservice.openSnackBar("Please enter student.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    if (row.RankId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter title.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.Achievement.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter description.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.CategoryId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select category.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    let checkFilterString = this.FilterOrgSubOrgBatchId + " and RankId eq " + row.RankId +
      " and SessionId eq " + row.SessionId +
      " and SportsNameId eq " + row.SportsNameId +
      " and CategoryId eq " + row.CategoryId +
      " and SubCategoryId eq " + row.SubCategoryId +
      " and Active eq " + row.Active;
    this.RowsToUpdate = 0;

    if (row.SportResultId > 0)
      checkFilterString += " and SportResultId ne " + row.SportResultId;
    let list: List = new List();
    list.fields = ["SportResultId"];
    list.PageName = "SportResults";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          var studentObj = this.Students.filter((s:any) => s.StudentClassId == row.StudentClassId)
          var _groupId = 0;
          if (studentObj.length > 0)
            _groupId = studentObj[0].HouseId;

          this.SportsResultForUpdate = [];
          this.SportsResultForUpdate.push(
            {
              SportResultId: row.SportResultId,
              RankId: row.RankId,
              Achievement: globalconstants.encodeSpecialChars(row.Achievement),
              SportsNameId: row.SportsNameId,
              ClassId: row.ClassId,
              SectionId: row.SectionId,
              GroupId: _groupId,
              CategoryId: row.CategoryId,
              SubCategoryId: row.SubCategoryId,
              StudentClassId: row.StudentClassId,
              AchievementDate: row.AchievementDate,
              SessionId: row.SessionId,
              Active: row.Active,
              OrgId: this.LoginUserDetail[0]["orgId"],
              SubOrgId: this.SubOrgId,
              BatchId: this.SelectedBatchId
            });

          if (this.SportsResultForUpdate[0].SportResultId == 0) {
            this.SportsResultForUpdate[0]["CreatedDate"] = new Date();
            this.SportsResultForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.SportsResultForUpdate[0]["UpdatedDate"];
            delete this.SportsResultForUpdate[0]["UpdatedBy"];
            this.insert(row);
          }
          else {

            this.SportsResultForUpdate[0]["UpdatedDate"] = new Date();
            this.SportsResultForUpdate[0]["UpdatedBy"];
            delete this.SportsResultForUpdate[0]["CreatedDate"];
            delete this.SportsResultForUpdate[0]["CreatedBy"];
            console.log("this.SportsResultForUpdate[0] update", this.SportsResultForUpdate[0])
            this.update(row);
          }
        }
      }, error => {
        this.loadingFalse();
        this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage, globalconstants.ActionText, globalconstants.RedBackground);
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {
    console.log("this.SportsResultForUpdate", this.SportsResultForUpdate)
    this.dataservice.postPatch('SportResults', this.SportsResultForUpdate, 0, 'post')
      .subscribe(
        (data: any) => {
          row.SportResultId = data.SportResultId;
          row.Action = false;
          if (this.RowsToUpdate == 0) {
            this.RowsToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse();
          }
        }, error => {
          this.loadingFalse();
          console.log("error on sport result insert", error);
        });
  }
  update(row) {
    //console.log("updating",this.SportsResultForUpdate);
    this.dataservice.postPatch('SportResults', this.SportsResultForUpdate[0], this.SportsResultForUpdate[0].SportResultId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          //console.log("data update", data.value);
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
 
  GetSportsResult() {
    debugger;
    var filterStr = this.FilterOrgSubOrgBatchId;// "OrgId eq " + this.LoginUserDetail[0]["orgId"];


    var _studentclassId = this.searchForm.get("searchStudentName")?.value.StudentClassId;
    //var _SportsNameId = this.searchForm.get("searchActivityId")?.value;
    //var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _classId = this.searchForm.get("searchClassId")?.value;
    //var _SessionId = this.searchForm.get("searchSessionId")?.value;
    if (_studentclassId != undefined) {
      filterStr += " and StudentClassId eq " + _studentclassId;
    }
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else
      filterStr += " and ClassId eq " + _classId;
    // if (_sectionId > 0) {
    //   if(_sectionId) filterStr += " and SectionId eq " + _sectionId;
    // }
   
    this.loading = true;
    this.SportsResultList = [];

    let list: List = new List();
    list.fields = [
      "SportResultId",
      "StudentClassId",
      "RankId",
      "Achievement",
      "SportsNameId",
      "ClassId",
      "SectionId",
      "CategoryId",
      "SubCategoryId",
      "AchievementDate",
      "SessionId",
      "BatchId",
      "Active"
    ];

    list.PageName = "SportResults";
    list.filter = [filterStr];
    this.SportsResultList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _subCategory :any[]= [];
        data.value.forEach(m => {
          var _student = this.Students.filter((s:any) => s.StudentClassId == m.StudentClassId);
          if (_student.length > 0) {
            // var lastName = _student[0].LastName ? " " + _student[0].LastName : "";
            m.Student = _student[0].Name;//_student[0].StudentClasses[0].RollNO + "-" + _student[0].FirstName + lastName;
            m.FilteredCategory = this.allMasterData.filter(a=>a.ParentId == m.SportsNameId);
            if (m.CategoryId > 0)
              _subCategory = this.allMasterData.filter((f:any) => f.ParentId == m.CategoryId);
            else
              _subCategory = [];
            var obj = this.ActivityNames.filter((f:any) => f.MasterDataId == m.SportsNameId);
            if (obj.length > 0)
              m.SportsName = obj[0].MasterDataName;
            else
              m.SportsName = '';
            m.SubCategories = _subCategory;
            m.Achievement = globalconstants.decodeSpecialChars(m.Achievement);
            m.Action = false;
            this.SportsResultList.push(m);
          }
        })
        console.log("SportsResultList",this.SportsResultList);
        if (this.SportsResultList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<ISportsResult>(this.SportsResultList);
        this.dataSource.paginator = this.paginator;
        this.loadingFalse();
      });

  }
  //FilteredCategory:any[]=[];
  SelectCategory(row){
    //debugger;
    row.FilteredCategory= this.allMasterData.filter((f:any) => f.ParentId == row.SportsNameId);
  }
  SelectSubCategory(row, event) {
    if (row.CategoryId > 0)
      row.SubCategories = this.allMasterData.filter((f:any) => f.ParentId == row.CategoryId);
    else
      row.SubCategories = [];
    this.onBlur(row);
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.ActivityNames = this.getDropDownData(globalconstants.MasterDefinitions.common.ACTIVITYNAME);
    this.PointCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.POINTSCATEGORY);
    this.ActivitySessions = this.getDropDownData(globalconstants.MasterDefinitions.common.ACTIVITYSESSION);

    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.GetPoints();
  }
  // SetCategory(row) {
  //   var _activityId = this.searchForm.get("searchActivityId")?.value;
  //   if (_activityId > 0)
  //     this.ActivityCategory = this.allMasterData.filter((f:any) => f.ParentId == _activityId);
  // }
  AddNew() {
    //var _activityId = this.searchForm.get("searchActivityId")?.value;
    //var _categoryId = this.searchForm.get("searchCategoryId")?.value;
    //var _sessionId = this.searchForm.get("searchSessionId")?.value;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _studentClassId = 0,_studName='';
    var studObj =this.searchForm.get("searchStudentName")?.value;
    _studentClassId = studObj.StudentClassId;
    _studName = studObj.Name;
    if (!_studentClassId || _studentClassId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    if (_classId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    // if (_activityId == 0) {
    //   this.loading = false;
    //   this.contentservice.openSnackBar("Please select activity.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    // if (_categoryId == 0) {
    //   this.loading = false;
    //   this.contentservice.openSnackBar("Please select category.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    // if (_sessionId == 0) {
    //   this.loading = false;
    //   this.contentservice.openSnackBar("Please select session.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
  
    var _subcategory :any[]= [];
    // if (_categoryId > 0)
    //   _subcategory = this.allMasterData.filter((f:any) => f.ParentId == _categoryId);
    var newdata = {
      SportResultId: 0,
      Student:_studName,
      RankId: 0,
      Achievement: '',
      SportsNameId: 0,
      ClassId: _classId,
      SectionId: _sectionId,
      CategoryId: 0,
      SubCategoryId: 0,
      SubCategories: _subcategory,
      StudentClassId: _studentClassId,
      AchievementDate: new Date(),
      SessionId: 0,//this.searchForm.get("searchSessionId")?.value,
      Active: 0,
      Action: false
    };
    this.SportsResultList = [];
    this.SportsResultList.push(newdata);
    this.dataSource = new MatTableDataSource<ISportsResult>(this.SportsResultList);
  }
  onBlur(row) {
    row.Action = true;
  }
  CategoryChanged(row) {
    debugger;
    row.Action = true;
    var item = this.SportsResultList.filter((f:any) => f.SportResultId == row.SportResultId);
    if (row.CategoryId > 0)
      item[0].SubCategories = this.allMasterData.filter((f:any) => f.ParentId == row.CategoryId);
    else
      item[0].SubCategories = [];

    this.dataSource = new MatTableDataSource(this.SportsResultList);
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

  GetStudentClasses() {
    //debugger;
    var filterOrgIdNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    filterOrgIdNBatchId += " and IsCurrent eq true";
    let list: List = new List();
    list.fields = ["StudentClassId,StudentId,ClassId,RollNo,SectionId,SemesterId"];
    list.PageName = "StudentClasses";
    list.filter = [filterOrgIdNBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentClasses = [...data.value];
        this.GetStudents();
      })
  }
  GetStudents() {
    debugger;
    this.loading = true;
    this.Students = [];
    var _students: any = this.tokenStorage.getStudents()!;
    //if (_students.length > 0) {
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    if (_sectionId > 0 && _classId > 0)
      _students = _students.filter((s:any) => s.StudentClasses.length > 0
        && s.StudentClasses[0].SectionId == _sectionId && s.StudentClasses[0].ClassId == _classId);
    else if (_sectionId == 0 && _classId > 0)
      _students = _students.filter((s:any) => s.StudentClasses.length > 0
        && s.StudentClasses[0].ClassId == _classId);
    _students.forEach(student => {
      var _RollNo = '';
      var _name = '';
      var _className = '';
      var _classId = '';
      var _section = '';
      var _studentClassId = 0;
      //var studentclassobj = this.StudentClasses.filter((f:any) => f.StudentId == student.StudentId);
      //if (student.StudentClasses.length > 0) {
      _studentClassId = student.StudentClasses[0].StudentClassId;
      var _classNameobj = this.Classes.filter(c => c.ClassId == student.StudentClasses[0].ClassId);
      _classId = student.StudentClasses[0].ClassId;
      if (_classNameobj.length > 0)
        _className = _classNameobj[0].ClassName;
      var _SectionObj = this.Sections.filter((f:any) => f.MasterDataId == student.StudentClasses[0].SectionId)

      if (_SectionObj.length > 0)
        _section = _SectionObj[0].MasterDataName;
      _RollNo = student.StudentClasses[0].RollNo;
      var _lastname = student.LastName == null || student.LastName == '' ? '' : " " + student.LastName;
      _name = student.FirstName + _lastname;
      var _fullDescription = _RollNo + "-" + _name + "-" + _className + "-" + _section;
      this.Students.push({
        StudentClassId: _studentClassId,
        StudentId: student.StudentId,
        HouseId: student.HouseId,
        ClassId: _classId,
        RollNo: _RollNo,
        Name: _fullDescription,
      });
      //}
    })
    //}
    this.loading = false;
    this.PageLoading = false;
    //})
  }
  GetPoints() {
    debugger;
    var filterOrgId = "Active eq true and OrgId eq " + this.LoginUserDetail[0]['orgId'];

    let list: List = new List();
    list.fields = ["AchievementAndPointId,Rank,CategoryId,Points,Active"];
    list.PageName = "AchievementAndPoints";
    list.filter = [filterOrgId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(f => {
          var obj = this.PointCategory.filter(a => a.MasterDataId == f.CategoryId);
          if (obj.length > 0) {
            if (obj[0].MasterDataName.toLowerCase() == 'individual')
              this.AchievementAndPoints.push(f);
          }
        })
        this.loading = false;
        this.PageLoading = false;
      })
  }
}
export interface ISportsResult {
  SportResultId: number;
  Achievement: string;
  RankId: number;
  SportsNameId: number;
  CategoryId: number;
  SubCategoryId: number;
  StudentClassId: number;
  AchievementDate: Date;
  SessionId: number;
  Active: number;
  Action: boolean;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}


