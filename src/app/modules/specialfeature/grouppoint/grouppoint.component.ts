import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import alasql from 'alasql';
import { Observable } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';

@Component({
  selector: 'app-grouppoint',
  templateUrl: './grouppoint.component.html',
  styleUrls: ['./grouppoint.component.scss']
})
export class GrouppointComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  RowsToUpdate = -1;
  Defaultvalue=0;
  EvaluationStarted = false;
  EvaluationSubmitted = false;
  LoginUserDetail:any[]= [];
  StudentClasses :any[]= [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  ClassId = 0;
  Permission = '';
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  ActivityCategory :any[]= [];
  RelevantEvaluationListForSelectedStudent :any[]= [];
  SportsResultList:any[]= [];
  SelectedBatchId = 0; SubOrgId = 0;
  Sections :any[]= [];
  Classes :any[]= [];
  AchievementAndPoints :any[]= [];
  dataSource: MatTableDataSource<any>;
  allMasterData :any[]= [];
  SelectedClassSubjects :any[]= [];
  PointCategory :any[]= [];
  Groups :any[]= [];
  Students :any[]= [];
  ActivityNames :any[]= [];
  ActivitySessions :any[]= [];
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
  SportsResultForUpdate :any[]= [];
  displayedColumns = [
    "GroupName",
    // "Category",
    // "SubCategory",
    "Points"
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
      searchSessionId: [0]
    });
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
  StudentGroups :any[]= [];
  StudentClubs :any[]= [];
  StudentHouses :any[]= [];
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SPECIALFEATURE.GROUPPOINT)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        //this.GroupId = this.tokenStorage.getGroupId();

        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetMasterData();

        if (this.Classes.length == 0) {
          var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
            this.Classes = [...data.value];
            this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
            this.loading = false;
            this.PageLoading = false;
          });
        }
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



  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }

  GetSportsResult() {
    debugger;
    var filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";
    var _SessionId = this.searchForm.get("searchSessionId")?.value;
    if (_SessionId > 0) {
      filterStr += " and SessionId eq " + _SessionId;
    }

    this.loading = true;
    this.SportsResultList = [];

    let list: List = new List();
    list.fields = [
      "SportResultId",
      "GroupId",
      "StudentClassId",
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
    list.lookupFields = ["Rank($select=Rank,Points,CategoryId)"];
    list.filter = [filterStr];
    this.SportsResultList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SportsResultList = [];
        data.value.forEach(m => {
          // if (m.StudentClassId > 0) {
          //   var obj = this.Students.filter((s:any) => s.StudentClassId == m.StudentClassId);
          //   if (obj.length > 0)
          //     m.GroupId = obj[0].HouseId;
          // }
          if (m.Rank.Points > 0) {
            var objGroup = this.StudentHouses.filter(h => h.MasterDataId == m.GroupId);
            if (objGroup.length > 0) {
              m.GroupName = objGroup[0].MasterDataName;
            }
            else
              m.GroupName = '';

            var obj = this.ActivityNames.filter((f:any) => f.MasterDataId == m.SportsNameId);
            if (obj.length > 0)
              m.SportsName = obj[0].MasterDataName;
            else
              m.SportsName = '';
            if (m.CategoryId > 0) {
              var obj = this.allMasterData.filter((f:any) => f.MasterDataId == m.CategoryId);
              if (obj.length > 0)
                m.Category = obj[0].MasterDataName.toLowerCase();
            }
            if (m.SubCategoryId > 0)
              m.SubCategory = this.allMasterData.filter((f:any) => f.MasterDataId == m.SubCategoryId)[0].MasterDataName;
            m.Points = m.Rank.Points;
            m.PointCategory = this.PointCategory.filter(c => c.MasterDataId == m.Rank.CategoryId)[0].MasterDataName;
            this.SportsResultList.push(m);
          }
        })
        var result = alasql("select sum(Points) as Points,GroupName from ? group by GroupName", [this.SportsResultList])
        if (this.SportsResultList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<ISportsResult>(result);
        this.dataSource.paginator = this.paginator;
        this.loadingFalse();
      });
  }
  ClearData(){
    this.SportsResultList =[];
    this.dataSource = new MatTableDataSource<ISportsResult>([]);
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
    this.loading = true;
    // let list: List = new List();
    // list.fields = [
    //   'StudentId',
    //   'FirstName',
    //   'LastName',
    //   'HouseId',
    // ];

    // list.PageName = "Students";
    // list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    debugger;
    this.Students = [];
    var _students: any = this.tokenStorage.getStudents()!;
    if (_students.length > 0) {

      _students.forEach(student => {
        var _RollNo = '';
        var _name = '';
        var _className = '';
        var _classId = '';
        var _section = '';
        var _studentClassId = 0;
        var studentclassobj = this.StudentClasses.filter((f:any) => f.StudentId == student.StudentId);
        if (studentclassobj.length > 0) {
          _studentClassId = studentclassobj[0].StudentClassId;
          var _classNameobj = this.Classes.filter(c => c.ClassId == studentclassobj[0].ClassId);
          _classId = studentclassobj[0].ClassId;
          if (_classNameobj.length > 0)
            _className = _classNameobj[0].ClassName;
          var _SectionObj = this.Sections.filter((f:any) => f.MasterDataId == studentclassobj[0].SectionId)

          if (_SectionObj.length > 0)
            _section = _SectionObj[0].MasterDataName;
          _RollNo = studentclassobj[0].RollNo;
          var _lastname = student.LastName == null || student.LastName == '' ? '' : " " + student.LastName;
          _name = student.FirstName + _lastname;
          var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo + "-" + student.PersonalNo;
          this.Students.push({
            StudentClassId: _studentClassId,
            StudentId: student.StudentId,
            ClassId: _classId,
            Name: _fullDescription,
            HouseId: student.HouseId
          });
        }
      })
    }
    this.loading = false;
    this.PageLoading = false;
    //})
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
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.GetPoints();
  }
  SetCategory() {
    var _activityId = this.searchForm.get("searchActivityId")?.value;
    if (_activityId > 0)
      this.ActivityCategory = this.allMasterData.filter((f:any) => f.ParentId == _activityId);
    else
      this.ActivityCategory = [];
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
    //this.GetSportsResult();
  }
}
export interface ISportsResult {
  SportResultId: number;
  Achievement: string;
  RankId: 0;
  SportsNameId: number;
  CategoryId: number;
  SubCategoryId: number;
  GroupId: number;
  StudentClassId: number;
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
