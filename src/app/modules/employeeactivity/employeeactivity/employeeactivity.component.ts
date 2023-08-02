import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IStudent } from '../../admission/AssignStudentClass/Assignstudentclassdashboard.component';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-employeeactivity',
  templateUrl: './employeeactivity.component.html',
  styleUrls: ['./employeeactivity.component.scss']
})
export class EmployeeactivityComponent implements OnInit {
  PageLoading = true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  EmployeeId = 0;
  Permission = '';
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  EmployeeActivityList: IEmployeeActivity[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
  EmployeeActivity = [];
  EmployeeActivitySession = [];
  EmployeeActivityCategories = [];
  EmployeeActivitySubCategories = [];
  //Classes = [];
  Batches = [];
  Employees: IEmployee[] = [];
  filteredOptions: Observable<IEmployee[]>;
  dataSource: MatTableDataSource<IEmployeeActivity>;
  allMasterData = [];

  EmployeeActivityData = {
    EmployeeActivityId: 0,
    Achievement: '',
    Secured: '',
    ActivityNameId: 0,
    GroupId: 0,
    CategoryId: 0,
    SubCategoryId: 0,
    EmployeeId: 0,
    AchievementDate: new Date(),
    SessionId: 0,
    BatchId: 0,
    OrgId: 0, SubOrgId: 0,
    Active: 0,
  };
  EmployeeActivityForUpdate = [];
  displayedColumns = [
    'EmployeeActivityId',
    'Employee',
    'Achievement',
    'Secured',
    'ActivityNameId',
    'CategoryId',
    'SubCategoryId',
    'SessionId',
    'AchievementDate',
    'Active',
    'Action'
  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private datepipe: DatePipe,
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
    //debugger;
    this.searchForm = this.fb.group({
      searchEmployeeName: [0],
      searchActivity: [0],
      searchSession: [0],
      searchCategoryId:[0]
    });
    this.filteredOptions = this.searchForm.get("searchEmployeeName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Employees.slice())
      );
    //this.EmployeeId = this.tokenStorage.getEmployeeId();
    this.PageLoad();
  }
  private _filter(name: string): IEmployee[] {

    const filterValue = name.toLowerCase();
    return this.Employees.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.EMPLOYEEPROFILE)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetMasterData();

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
  AddNew() {
    var _employee = this.searchForm.get("searchEmployeeName").value.name;
    if (!_employee) {
      this.contentservice.openSnackBar("Please select employee.", globalconstants.ActionText, globalconstants.RedBackground);
    }
    else {
      var newItem = {
        EmployeeActivityId: 0,
        Employee: _employee,
        Achievement: '',
        Secured: '',
        ActivityNameId: 0,
        GroupId: 0,
        CategoryId: 0,
        SubCategoryId: 0,
        EmployeeId: 0,
        AchievementDate: new Date(),
        SessionId: 0,
        BatchId: 0,
        Action: false
      }
      this.EmployeeActivityList = [];
      this.EmployeeActivityList.push(newItem);
      this.dataSource = new MatTableDataSource(this.EmployeeActivityList);
    }
  }
  UpdateOrSave(row) {

    //debugger;
    var _employeeId = this.searchForm.get("searchEmployeeName").value.EmployeeId;
    var _ActivityId = this.searchForm.get("searchActivity").value;
    this.loading = true;
    if (_employeeId == undefined) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select employee.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.SessionId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select session.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    let checkFilterString = this.FilterOrgSubOrg + " and Active eq true";// and OrgId eq " + this.LoginUserDetail[0]["orgId"];
    if (row.CategoryId > 0)
      checkFilterString += " and CategoryId eq " + row.CategoryId
    if (row.SubCategoryId > 0)
      checkFilterString += " and SubCategoryId eq " + row.SubCategoryId;

    if (row.SessionId > 0)
      checkFilterString += " and SessionId eq " + row.SessionId;
    checkFilterString += " and EmployeeId eq " + _employeeId;

    if (row.EmployeeActivityId > 0)
      checkFilterString += " and EmployeeActivityId ne " + row.EmployeeActivityId;
    let list: List = new List();
    list.fields = ["EmployeeActivityId"];
    list.PageName = "EmployeeActivities";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          //this.shareddata.CurrentSelectedBatchId.subscribe(c => this.SelectedBatchId = c);
          this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
          this.SubOrgId = this.tokenStorage.getSubOrgId();
          this.EmployeeActivityForUpdate = [];;
          //console.log("inserting-1",this.EmployeeActivityForUpdate);

          this.EmployeeActivityData.EmployeeActivityId = row.EmployeeActivityId;
          this.EmployeeActivityData.ActivityNameId = _ActivityId;
          this.EmployeeActivityData.CategoryId = row.CategoryId;
          this.EmployeeActivityData.Secured = row.Secured;
          this.EmployeeActivityData.SubCategoryId = row.SubCategoryId;
          this.EmployeeActivityData.AchievementDate = row.AchievementDate;
          this.EmployeeActivityData.EmployeeId = _employeeId;
          this.EmployeeActivityData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.EmployeeActivityData.SubOrgId = this.SubOrgId;
          this.EmployeeActivityData.Achievement = row.Achievement;
          this.EmployeeActivityData.SessionId = row.SessionId;
          this.EmployeeActivityData.BatchId = this.SelectedBatchId;
          this.EmployeeActivityData.Active = row.Active;

          if (this.EmployeeActivityData.EmployeeActivityId == 0) {
            this.EmployeeActivityData["CreatedDate"] = new Date();
            this.EmployeeActivityData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmployeeActivityData["UpdatedDate"] = new Date();
            delete this.EmployeeActivityData["UpdatedBy"];
            console.log("this.EmployeeActivityData", this.EmployeeActivityData)
            this.insert(row, this.EmployeeActivityData);
          }
          else {
            this.EmployeeActivityData["CreatedDate"] = new Date(row.CreatedDate);
            this.EmployeeActivityData["CreatedBy"] = row.CreatedBy;
            this.EmployeeActivityData["UpdatedDate"] = new Date();
            this.EmployeeActivityData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row, toinsert) {
    //console.log("inserting",this.EmployeeActivityForUpdate);

    //debugger;
    this.dataservice.postPatch('EmployeeActivities', toinsert, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmployeeActivityId = data.EmployeeActivityId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
          this.GetEmployeeActivity();
        });
  }
  update(row) {
    //console.log("updating",this.EmployeeActivityForUpdate);
    this.dataservice.postPatch('EmployeeActivities', this.EmployeeActivityForUpdate[0], this.EmployeeActivityForUpdate[0].EmployeeActivityId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetEmployeeActivity() {
    debugger;
    this.loading = true;
    var _employeeId = this.searchForm.get("searchEmployeeName").value.EmployeeId;
    var _activityId = this.searchForm.get("searchActivity").value;
    var _sessionId = this.searchForm.get("searchSession").value;
    var _categoryId = this.searchForm.get("searchCategoryId").value;

    // if (_employeeId == undefined) {
    //   this.loading = false;
    //   this.contentservice.openSnackBar("Please select employee.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    //this.EmployeeId = _employeeId;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    let filterStr = this.FilterOrgSubOrg;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    if (_employeeId)
      filterStr += ' and EmployeeId eq ' + _employeeId;
    if (_activityId > 0)
      filterStr += ' and ActivityNameId eq ' + _activityId;
    if (_sessionId > 0)
      filterStr += ' and SessionId eq ' + _sessionId;
    if (_categoryId > 0)
      filterStr += ' and CategoryId eq ' + _categoryId;

    let list: List = new List();
    list.fields = [
      'EmployeeActivityId',
      'Achievement',
      'Secured',
      'ActivityNameId',
      'GroupId',
      'CategoryId',
      'SubCategoryId',
      'EmployeeId',
      'AchievementDate',
      'SessionId',
      'BatchId',
      'Active'
    ];

    list.PageName = "EmployeeActivities";
    list.lookupFields = ["Employee($select=FirstName,LastName,EmployeeCode)"];
    list.filter = [filterStr];
    this.EmployeeActivityList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.EmployeeActivityList = data.value.map(item => {
            var _lastname = item.Employee.LastName ? " " + item.Employee.LastName : '';
            item.Employee = item.Employee.FirstName + _lastname;
            item.Action = false;
            return item;
          })
        }
        if (this.EmployeeActivityList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        //console.log('EmployeeActivity', this.EmployeeActivityList)
        this.dataSource = new MatTableDataSource<IEmployeeActivity>(this.EmployeeActivityList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.Batches = this.tokenStorage.getBatches()
    this.EmployeeActivity = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEACTIVITY);
    this.EmployeeActivityCategories = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEACTIVITYCATEGORY);
    this.EmployeeActivitySession = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEACTIVITYSESSION);
    this.GetEmployees();
    //this.GetEmployeeActivity();
  }
  onBlur(row) {
    row.Action = true;
  }
  CategoryChanged(row) {
    debugger;
    row.Action = true;
    //row.SubCategories = this.Categories.filter(f=>f.MasterDataId == row.CategoryId);
    var item = this.EmployeeActivityList.filter(f => f.EmployeeActivityId == row.EmployeeActivityId);
    //item[0].SubCategories = this.allMasterData.filter(f => f.ParentId == row.CategoryId);

    ////console.log("dat", this.EmployeeActivityList);
    this.dataSource = new MatTableDataSource(this.EmployeeActivityList);


  }
  UpdateActive(row, event) {
    row.Active = event.checked;
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
  GetEmployees() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["EmpEmployeeId", "EmployeeCode", "FirstName", "LastName", "ContactNo"];
    list.PageName = "EmpEmployees";
    list.filter = [this.FilterOrgSubOrg];//'OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Employees = data.value.map(Employee => {
            var _lastname = Employee.LastName == null ? '' : " " + Employee.LastName;
            var _name = Employee.FirstName + _lastname;
            var _fullDescription = _name + "-" + Employee.ContactNo;
            return {
              EmployeeId: Employee.EmpEmployeeId,
              EmployeeCode: Employee.EmployeeCode,
              Name: _fullDescription
            }
          })
        }
        this.loading = false;
        this.PageLoading = false;
      })
  }
}
export interface IEmployeeActivity {
  EmployeeActivityId: number;
  Achievement: string;
  ActivityNameId: number;
  GroupId: number;
  CategoryId: number;
  SubCategoryId: number;
  EmployeeId: number;
  AchievementDate: Date;
  SessionId: number;
  Action: boolean;
}
export interface IEmployee {
  EmployeeId: number;
  EmployeeCode: number;
  Name: string;
}



