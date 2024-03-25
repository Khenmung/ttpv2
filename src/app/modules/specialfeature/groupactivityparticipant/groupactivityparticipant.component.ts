import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';

@Component({
  selector: 'app-groupactivityparticipant',
  templateUrl: './groupactivityparticipant.component.html',
  styleUrls: ['./groupactivityparticipant.component.scss']
})
export class GroupactivityparticipantComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  RowsToUpdate = -1;
  Defaultvalue=0;
  EvaluationStarted = false;
  EvaluationSubmitted = false;
  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  ClassId = 0;
  Permission = '';
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  ActivityCategory :any[]= [];
  RelevantEvaluationListForSelectedStudent :any[]= [];
  GroupActivityParticipantList:any[]= [];
  SelectedBatchId = 0; SubOrgId = 0;
  Sections :any[]= [];
  Classes :any[]= [];
  dataSource: MatTableDataSource<any>;
  GroupActivityParticipantDataSource: MatTableDataSource<any>;
  HouseFilteredStudent :any[]= [];
  allMasterData :any[]= [];
  SelectedClassSubjects :any[]= [];
  //StudentClasses :any[]= [];
  Groups :any[]= [];
  Students :any[]= [];
  StudentClasses :any[]= [];
  ActivityNames :any[]= [];
  ActivitySessions :any[]= [];
  filteredStudents: Observable<IStudent[]>;
  GroupActivityParticipantData = {
    GroupActivityParticipantId: 0,
    SportResultId: 0,
    StudentClassId: 0,
    Description: '',
    OrgId: 0, SubOrgId: 0,
    Active: 0
  };
  GroupActivityParticipantForUpdate :any[]= [];
  displayedColumns = [
    "GroupName",
    "ActivityName",
    "Category",
    "SubCategory",
    "Session",
    "Action"
  ];
  ParticipantDisplayedColumns = [
    "GroupActivityParticipantId",
    "Student",
    "Description",
    "Active",
    "Action"
  ];
  searchForm: UntypedFormGroup;
  gap: UntypedFormGroup;
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
    this.gap = this.fb.group({
      searchStudentName: ['']
    })
    this.filteredStudents = this.gap.get("searchStudentName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.HouseFilteredStudent.slice())
      )!;

    this.ClassId = this.tokenStorage.getClassId()!;
    this.PageLoad();

  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.HouseFilteredStudent.filter(option => option.Name.toLowerCase().includes(filterValue));

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
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SPECIALFEATURE.GROUPPARTICIPANT)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetMasterData();

        if (this.Classes.length == 0) {
          var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
            if(data.value) this.Classes = [...data.value]; else this.Classes = [...data];
            this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
            this.GetStudentClasses();
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


  UpdateOrSave(row) {

    debugger;
    this.loading = true;

    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    //this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    let checkFilterString = this.FilterOrgSubOrg + " and SportResultId eq " + row.SportResultId +
      " and StudentClassId eq " + row.StudentClassId

    this.RowsToUpdate = 0;

    if (row.GroupActivityParticipantId > 0)
      checkFilterString += " and GroupActivityParticipantId ne " + row.GroupActivityParticipantId;

    let list: List = new List();
    list.fields = ["GroupActivityParticipantId"];
    list.PageName = "GroupActivityParticipants";
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

          this.GroupActivityParticipantForUpdate = [];
          this.GroupActivityParticipantForUpdate.push(
            {
              GroupActivityParticipantId: row.GroupActivityParticipantId,
              SportResultId: row.SportResultId,
              StudentClassId: row.StudentClassId,
              Description: row.Description,
              Active: row.Active,
              OrgId: this.LoginUserDetail[0]["orgId"],
              SubOrgId: this.SubOrgId,
              BatchId: this.SelectedBatchId
            });

          if (this.GroupActivityParticipantForUpdate[0].GroupActivityParticipantId == 0) {
            this.GroupActivityParticipantForUpdate[0]["CreatedDate"] = new Date();
            this.GroupActivityParticipantForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.GroupActivityParticipantForUpdate[0]["UpdatedDate"];
            delete this.GroupActivityParticipantForUpdate[0]["UpdatedBy"];
            ////console.log("this.GroupActivityParticipantForUpdate", this.GroupActivityParticipantForUpdate);
            this.insert(row);
          }
          else {
            ////console.log("this.GroupActivityParticipantForUpdate[0] update", this.GroupActivityParticipantForUpdate[0])
            this.GroupActivityParticipantForUpdate[0]["UpdatedDate"] = new Date();
            this.GroupActivityParticipantForUpdate[0]["UpdatedBy"];
            delete this.GroupActivityParticipantForUpdate[0]["CreatedDate"];
            delete this.GroupActivityParticipantForUpdate[0]["CreatedBy"];
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
    ////console.log("this.GroupActivityParticipantForUpdate", this.GroupActivityParticipantForUpdate[0])
    this.dataservice.postPatch('GroupActivityParticipants', this.GroupActivityParticipantForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.GroupActivityParticipantId = data.GroupActivityParticipantId;
          row.Action = false;
          if (this.RowsToUpdate == 0) {
            this.RowsToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse();
          }
        }, error => {
          this.loadingFalse();
          //console.log("error on group activity participant insert", error);
        });
  }
  update(row) {
    ////console.log("updating",this.GroupActivityParticipantForUpdate);
    this.dataservice.postPatch('GroupActivityParticipants', this.GroupActivityParticipantForUpdate[0], this.GroupActivityParticipantForUpdate[0].GroupActivityParticipantId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          ////console.log("data update", data.value);
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GroupActivityList :any[]= [];
  GetSportResult() {
    debugger;

    var filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";
    var _GroupId = this.searchForm.get("searchGroupId")?.value;
    var _SportsNameId = this.searchForm.get("searchActivityId")?.value;
    var _categoryId = this.searchForm.get("searchCategoryId")?.value;
    var _subCategoryId = this.searchForm.get("searchSubCategoryId")?.value;
    var _SessionId = this.searchForm.get("searchSessionId")?.value;
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
    this.GroupActivityParticipantList = [];
    this.ShowParticipants = false;

    let list: List = new List();
    list.fields = [
      "SportResultId",
      "StudentClassId",
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
    this.GroupActivityParticipantList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _Category = '', _subCategory = '';
        this.GroupActivityList = data.value.map(m => {
          var objStudent = this.Students.filter((s:any) => s.StudentClassId == m.StudentClassId)
          if (objStudent.length > 0) {
            m.Student = objStudent[0].Name;
          }
          if (m.CategoryId > 0)
            _Category = this.allMasterData.filter((f:any) => f.MasterDataId == m.CategoryId)[0].MasterDataName;
          else
            _Category = '';
          if (m.SubCategoryId > 0)
            _subCategory = this.allMasterData.filter((f:any) => f.MasterDataId == m.SubCategoryId)[0].MasterDataName;
          else
            _subCategory = '';

          var obj = this.ActivityNames.filter((f:any) => f.MasterDataId == m.SportsNameId);
          if (obj.length > 0)
            m.ActivityName = obj[0].MasterDataName;
          else
            m.ActivityName = '';
          var objsession = this.ActivitySessions.filter((f:any) => f.MasterDataId == m.SessionId);
          if (objsession.length > 0)
            m.Session = objsession[0].MasterDataName;
          else
            m.Session = '';
          var objGroup = this.StudentHouses.filter((s:any) => s.MasterDataId == _GroupId);
          // this.Groups.forEach(f => {
          //   f.group.forEach(g => {
          //     if (g.MasterDataId == _GroupId)
          //       objGroup.push(g);
          //   })
          // });

          if (objGroup.length > 0)
            m.GroupName = objGroup[0].MasterDataName;
          else
            m.GroupName = '';

          m.Category = _Category;
          m.SubCategory = _subCategory;
          m.Achievement = globalconstants.decodeSpecialChars(m.Achievement);
          m.Action = true;
          return m;
        })

        if (this.GroupActivityList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<any>(this.GroupActivityList);
        this.dataSource.paginator = this.paginator;
        this.loadingFalse();
      });

  }
  SelectedActivity :any[]= [];
  ShowParticipants = false;
  GetGroupActivityParticipant(row) {
    debugger;
    this.ShowParticipants = true;
    var filterStr = "Active eq true and OrgId eq " + this.LoginUserDetail[0]["orgId"];
    filterStr += " and SportResultId eq " + row.SportResultId;
    this.loading = true;

    this.HouseFilteredStudent = this.Students.filter((s:any) => s.HouseId == row.GroupId);
    this.SelectedActivity = [];
    this.SelectedActivity.push(row);
    this.GroupActivityParticipantList = [];

    let list: List = new List();
    list.fields = ["*"];
    list.PageName = "GroupActivityParticipants";
    list.filter = [filterStr];
    this.GroupActivityParticipantList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.GroupActivityParticipantList = data.value.map(m => {

          var obj = this.Students.filter((f:any) => f.StudentClassId == m.StudentClassId)
          if (obj.length > 0)
            m.Student = obj[0].Name;
          else
            m.Student = '';
          return m;
        })

        if (this.GroupActivityParticipantList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.GroupActivityParticipantDataSource = new MatTableDataSource<IGroupActivityParticipant>(this.GroupActivityParticipantList);
        this.dataSource.paginator = this.paginator;
        this.loadingFalse();
      });

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
  }
  GetStudentClasses() {
    //debugger;
    var filterOrgIdNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    //filterOrgIdNBatchId += " and Active eq 1";
    let list: List = new List();
    list.fields = ["StudentClassId,StudentId,ClassId,RollNo,SectionId"];
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
    //var extrafilter = ''
    // let list: List = new List();
    // list.fields = [
    //   'StudentId',
    //   'FirstName',
    //   'LastName',
    //   'FatherName',
    //   'MotherName',
    //   'ContactNo',
    //   'FatherContactNo',
    //   'MotherContactNo',
    //   'HouseId'
    // ];
    // list.PageName = "Students";

    // var standardfilter = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    // list.filter = [standardfilter];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    debugger;
    //this.Students = [...data.value];
    //  ////console.log('data.value', data.value);
    this.Students = [];
    var _students: any = this.tokenStorage.getStudents()!;
    if (_students.length > 0) {

      //var _students = [...data.value];

      _students.forEach(student => {
        var _RollNo = '';
        var _name = '';
        var _className = '';
        var _section = '';
        var _studentClassId = 0;
        var studentclassobj = this.StudentClasses.filter((f:any) => f.StudentId == student.StudentId);
        if (studentclassobj.length > 0) {
          _studentClassId = studentclassobj[0].StudentClassId;
          var _classNameobj = this.Classes.filter(c => c.ClassId == studentclassobj[0].ClassId);

          if (_classNameobj.length > 0)
            _className = _classNameobj[0].ClassName;
          var _SectionObj = this.Sections.filter((f:any) => f.MasterDataId == studentclassobj[0].SectionId)

          if (_SectionObj.length > 0)
            _section = _SectionObj[0].MasterDataName;
          _RollNo = studentclassobj[0].RollNo == null ? '' : studentclassobj[0].RollNo;

          student.PersonalNo = student.PersonalNo == null ? '' : student.PersonalNo;
          var _lastname = student.LastName == null || student.LastName == '' ? '' : " " + student.LastName;
          _name = student.FirstName + _lastname;
          var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo //+ "-" + student.ContactNo;
          this.Students.push({
            StudentClassId: _studentClassId,
            StudentId: student.StudentId,
            Name: _fullDescription,
            HouseId: student.HouseId
          });
        }
      })
    }
    this.loading = false;
    this.PageLoading = false;
    // })
  }
  GroupChanged() {
    this.cleardata();
  }
  SetCategory() {
    var _activityId = this.searchForm.get("searchActivityId")?.value;
    if (_activityId > 0)
      this.ActivityCategory = this.allMasterData.filter((f:any) => f.ParentId == _activityId);
    else
      this.ActivityCategory = [];
    this.cleardata();
  }

  AddNew() {
    debugger;

    var _groupId = this.SelectedActivity[0].GroupId;
    var _activityId = this.SelectedActivity[0].SportsNameId;
    var _categoryId = this.SelectedActivity[0].CategoryId;
    //var _sessionId = this.searchForm.get("searchSessionId")?.value;
    if (_groupId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select student group.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_activityId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select activity.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _subCategory :any[]= [];
    if (_categoryId > 0)
      _subCategory = this.allMasterData.filter((f:any) => f.ParentId == _categoryId)
    var objStudent = this.gap.get("searchStudentName")?.value;
    if (objStudent == '') {
      this.loading = false;
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      var newdata = {
        GroupActivityParticipantId: 0,
        SportResultId: this.SelectedActivity[0].SportResultId,
        StudentClassId: objStudent.StudentClassId,
        Student: objStudent.Name,
        Description: '',
        Active: true,
        Action: false
      };
      this.GroupActivityParticipantList = [];
      this.GroupActivityParticipantList.push(newdata);
      this.GroupActivityParticipantDataSource = new MatTableDataSource<any>(this.GroupActivityParticipantList);
    }
  }
  onBlur(row) {
    row.Action = true;
  }
  cleardata() {
    this.ShowParticipants = false;
    this.GroupActivityList = [];
    this.dataSource = new MatTableDataSource(this.GroupActivityList);
    this.GroupActivityParticipantList = [];
    this.GroupActivityParticipantDataSource = new MatTableDataSource(this.GroupActivityParticipantList);
  }
  CategoryChanged() {
    this.cleardata();
  }
  SessionChanged() {
    this.cleardata();
  }
  UpdateActive(row, event) {
    row.Active = event.checked;
    row.Action = true;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);

  }

}
export interface IGroupActivityParticipant {
  GroupActivityParticipantId: number;
  SportResultId: number;
  StudentClassId: number;
  Description: string;
  OrgId: number; SubOrgId: number;
  Active: number;
  UpdatedDate

  Action: boolean;
}
export interface IStudent {
  GroupId: number;
  StudentId: number;
  Name: string;
}




