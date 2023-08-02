import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-groupactivity',
  templateUrl: './groupactivity.component.html',
  styleUrls: ['./groupactivity.component.scss']
})
export class GroupactivityComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  RowsToUpdate = -1;
  EvaluationStarted = false;
  EvaluationSubmitted = false;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  ClassId = 0;
  Permission = '';
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  ActivityCategory = [];
  RelevantEvaluationListForSelectedStudent = [];
  SportsResultList: any[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
  Sections = [];
  Classes = [];
  AchievementAndPoints = [];
  PointCategory = [];
  dataSource: MatTableDataSource<any>;
  allMasterData = [];
  SelectedClassSubjects = [];
  //StudentClasses = [];
  Groups = [];
  Students = [];
  ActivityNames = [];
  ActivitySessions = [];
  filteredStudents: Observable<IStudent[]>;
  SportsResultData = {
    SportResultId: 0,
    RankId: 0,
    Achievement: '',
    SportsNameId: 0,
    CategoryId: 0,
    SubCategoryId: 0,
    GroupId: 0,
    AchievementDate: new Date(),
    SessionId: 0,
    OrgId: 0, SubOrgId: 0,
    Active: 0
  };
  SportsResultForUpdate = [];
  displayedColumns = [
    "SportResultId",
    "RankId",
    "Achievement",
    "CategoryId",
    "SubCategoryId",
    "SessionId",
    "Active",
    "Action"
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
    debugger;

    this.searchForm = this.fb.group({
      searchGroupId: [0],
      searchActivityId: [0],
      searchCategoryId: [0],
      searchSubCategoryId: [0],
      searchSessionId: [0]
    });
    // this.filteredStudents = this.searchForm.get("searchStudentName").valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => typeof value === 'string' ? value : value.Name),
    //     map(Name => Name ? this._filter(Name) : this.Students.slice())
    //   );
    this.ClassId = this.tokenStorage.getClassId();
    this.PageLoad();

  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  StudentGroups = [];
  StudentClubs = [];
  StudentHouses = [];
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
        //this.GroupId = this.tokenStorage.getGroupId();

        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetMasterData();

        if (this.Classes.length == 0) {
          var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
            this.Classes = [...data.value];
            this.loading = false;
            this.PageLoading = false;
          });
        }

        //this.GetStudentClasses();
      }
    }
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

  ClearData() {
    this.SportsResultList = [];
    this.dataSource = new MatTableDataSource<ISportsResult>(this.SportsResultList);
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
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
    if (row.SessionId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select session.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    //    this.SubOrgId = this.tokenStorage.getSubOrgId();
    let checkFilterString = this.FilterOrgSubOrgBatchId + " and GroupId eq " + row.GroupId +
      " and SessionId eq " + row.SessionId +
      " and SportsNameId eq " + row.SportsNameId +
      " and CategoryId eq " + row.CategoryId +
      " and SubCategoryId eq " + row.SubCategoryId
    //" and BatchId eq " + this.SelectedBatchId;
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
          this.loading = false;
          this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.SportsResultForUpdate = [];;
          this.SportsResultForUpdate.push(
            {
              SportResultId: row.SportResultId,
              RankId: row.RankId,
              Achievement: globalconstants.encodeSpecialChars(row.Achievement),
              SportsNameId: row.SportsNameId,// this.searchForm.get("searchActivityId").value,
              CategoryId: row.CategoryId,
              SubCategoryId: row.SubCategoryId,
              GroupId: row.GroupId,
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
            //console.log("this.SportsResultForUpdate[0] update", this.SportsResultForUpdate[0])
            this.SportsResultForUpdate[0]["UpdatedDate"] = new Date();
            this.SportsResultForUpdate[0]["UpdatedBy"];
            delete this.SportsResultForUpdate[0]["CreatedDate"];
            delete this.SportsResultForUpdate[0]["CreatedBy"];
            this.insert(row);
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
    //console.log("this.SportsResultForUpdate", this.SportsResultForUpdate)
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
    this.dataservice.postPatch('SportResults', this.SportsResultForUpdate[0], this.SportsResultForUpdate[0].SportsResultResultId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          console.log("data update", data.value);
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }

  GetSportsResult() {
    debugger;
    var filterStr = this.FilterOrgSubOrg + " and Active eq 1";
    var _GroupId = this.searchForm.get("searchGroupId").value;
    var _SportsNameId = this.searchForm.get("searchActivityId").value;
    var _categoryId = this.searchForm.get("searchCategoryId").value;
    var _subCategoryId = this.searchForm.get("searchSubCategoryId").value;
    var _SessionId = this.searchForm.get("searchSessionId").value;
    if (_GroupId != undefined) {
      filterStr += " and GroupId eq " + _GroupId;
    }
    else {
      this.contentservice.openSnackBar("Please select student group.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_SportsNameId > 0) {
      filterStr += " and SportsNameId eq " + _SportsNameId;
    }
    if (_SessionId > 0) {
      filterStr += " and SessionId eq " + _SessionId;
    }

    if (_categoryId > 0) {
      filterStr += " and CategoryId eq " + _categoryId;
    }
    if (_subCategoryId > 0) {
      filterStr += " and SubCategoryId eq " + _subCategoryId;
    }

    this.loading = true;
    this.SportsResultList = [];

    let list: List = new List();
    list.fields = [
      "SportResultId",
      "GroupId",
      "RankId",
      "Achievement",
      "SportsNameId",
      "CategoryId",
      "SubCategoryId",
      "AchievementDate",
      "SessionId",
      "Active"
    ];

    list.PageName = "SportResults";
    list.filter = [filterStr];
    this.SportsResultList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _category = [], _subCategory = [];
        this.SportsResultList = data.value.map(m => {
          _category = this.allMasterData.filter(a => a.ParentId == m.SportsNameId)
          if (m.CategoryId > 0)
            _subCategory = this.allMasterData.filter(f => f.ParentId == m.CategoryId);
          else
            _subCategory = [];
          var obj = this.ActivityNames.filter(f => f.MasterDataId == m.SportsNameId);
          if (obj.length > 0)
            m.SportsName = obj[0].MasterDataName;
          else
            m.SportsName = '';
          m.Category = _category;
          m.SubCategories = _subCategory;
          m.Achievement = globalconstants.decodeSpecialChars(m.Achievement);
          m.Action = false;
          return m;
        })

        if (this.SportsResultList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<ISportsResult>(this.SportsResultList);
        this.dataSource.paginator = this.paginator;
        this.loadingFalse();
      });

  }
  SelectSubCategory(row, event) {
    if (row.CategoryId > 0)
      row.SubCategories = this.allMasterData.filter(f => f.ParentId == row.CategoryId);
    else
      row.SubCategories = [];
    this.onBlur(row);
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.ActivityNames = this.getDropDownData(globalconstants.MasterDefinitions.common.ACTIVITYNAME);
    this.StudentClubs = this.getDropDownData(globalconstants.MasterDefinitions.school.CLUBS);
    this.StudentHouses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
    this.StudentGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGROUP);
    this.ActivitySessions = this.getDropDownData(globalconstants.MasterDefinitions.common.ACTIVITYSESSION);
    this.PointCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.POINTSCATEGORY);
    //this.StudentGroups = [...this.StudentClubs, ...this.StudentHouses, ...this.StudentGroups];
    // this.Groups.push({
    //   name: "Club",
    //   disable: true,
    //   group: this.StudentClubs
    // },
    //   {
    //     name: "House",
    //     disable: true,
    //     group: this.StudentHouses
    //   },
    //   {
    //     name: "Student Group",
    //     disable: true,
    //     group: this.StudentGroups
    //   }
    // )
    this.GetPoints();
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
  }
  SetCategory() {
    var _activityId = this.searchForm.get("searchActivityId").value;
    if (_activityId > 0)
      this.ActivityCategory = this.allMasterData.filter(f => f.ParentId == _activityId);
    else
      this.ActivityCategory = [];
    this.ClearData();
  }
  AddNew() {
    debugger;
    var _groupId = this.searchForm.get("searchGroupId").value;
    var _activityId = this.searchForm.get("searchActivityId").value;
    var _categoryId = this.searchForm.get("searchCategoryId").value;
    var _sessionId = this.searchForm.get("searchSessionId").value;
    if (_groupId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select house.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_activityId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select activity.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    // if(_categoryId==0)
    // {
    //   this.loading=false;
    //   this.contentservice.openSnackBar("Please select category.",globalconstants.ActionText,globalconstants.RedBackground);
    //   return;
    // }

    var _subCategory = [];
    if (_categoryId > 0)
      _subCategory = this.allMasterData.filter(f => f.ParentId == _categoryId)

    var newdata = {
      SportResultId: 0,
      RankId: 0,
      Achievement: '',
      SportsNameId: _activityId,
      CategoryId: _categoryId,
      SubCategoryId: 0,
      SubCategories: _subCategory,
      GroupId: _groupId,
      AchievementDate: new Date(),
      SessionId: _sessionId,
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
    var item = this.SportsResultList.filter(f => f.SportResultId == row.SportResultId);
    if (row.CategoryId > 0)
      item[0].SubCategories = this.allMasterData.filter(f => f.ParentId == row.CategoryId);
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

  }

  GetPoints() {
    //debugger;
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
            if (obj[0].MasterDataName.toLowerCase() == 'group')
              this.AchievementAndPoints.push(f);
          }
        })

      })
  }
  // GetStudents() {
  //   this.loading = true;
  //   let list: List = new List();
  //   list.fields = [
  //     'StudentId',
  //     'FirstName',
  //     'LastName',
  //     'ContactNo',
  //   ];

  //   list.PageName = "Students";
  //   list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       debugger;
  //       this.Students = [];
  //       if (data.value.length > 0) {

  //         data.value.forEach(student => {
  //           var _RollNo = '';
  //           var _name = '';
  //           var _className = '';
  //           var _classId = '';
  //           var _section = '';
  //           var _GroupId = 0;
  //           var studentclassobj = this.StudentClasses.filter(f => f.StudentId == student.StudentId);
  //           if (studentclassobj.length > 0) {
  //             _GroupId = studentclassobj[0].GroupId;
  //             var _classNameobj = this.Classes.filter(c => c.ClassId == studentclassobj[0].ClassId);
  //             _classId = studentclassobj[0].ClassId;
  //             if (_classNameobj.length > 0)
  //               _className = _classNameobj[0].ClassName;
  //             var _SectionObj = this.Sections.filter(f => f.MasterDataId == studentclassobj[0].SectionId)

  //             if (_SectionObj.length > 0)
  //               _section = _SectionObj[0].MasterDataName;
  //             _RollNo = studentclassobj[0].RollNo;
  //             var _lastname = student.LastName == null || student.LastName == '' ? '' : " " + student.LastName;
  //             _name = student.FirstName + _lastname;
  //             var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo + "-" + student.ContactNo;
  //             this.Students.push({
  //               GroupId: _GroupId,
  //               StudentId: student.StudentId,
  //               ClassId: _classId,
  //               Name: _fullDescription,
  //             });
  //           }
  //         })
  //       }
  //       this.loading = false; this.PageLoading = false;
  //     })
  // }
}
export interface ISportsResult {
  SportResultId: number;
  Achievement: string;
  RankId: 0;
  SportsNameId: number;
  CategoryId: number;
  SubCategoryId: number;
  GroupId: number;
  AchievementDate: Date;
  SessionId: number;
  Active: number;
  Action: boolean;
}
export interface IStudent {
  GroupId: number;
  StudentId: number;
  Name: string;
}



