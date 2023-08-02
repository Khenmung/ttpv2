import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-employee-gradehistory',
  templateUrl: './employee-gradehistory.component.html',
  styleUrls: ['./employee-gradehistory.component.scss']
})
export class EmployeeGradehistoryComponent implements OnInit { PageLoading=true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};

  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  Permission='';
  FilterOrgSubOrg = '';
  loading = false;
  rowCount = 0;
  EmployeeGradeHistoryList: IEmployeeGradeHistory[] = [];
  Employees: IEmployee[] = [];
  //EmployeeSalaryComponentList: IEmployeeSalaryComponent[] = [];
  SelectedBatchId = 0;SubOrgId = 0;
  StoredForUpdate = [];
  //SubjectMarkComponents = [];
  GradeComponents = [];
  Grades = [];
  SalaryComponents = [];
  ComponentTypes = [];
  Batches = [];
  Departments = [];
  WorkAccounts = [];
  JobTitles = [];
  Designations = [];
  dataSource: MatTableDataSource<IEmployeeGradeHistory>;
  allMasterData = [];
  filteredOptions: Observable<IEmployee[]>;
  
  EmployeeGradeHistoryData = {
    "EmployeeGradeHistoryId": 0,
    "EmployeeId": 0,
    "DepartmentId": 0,
    "EmpGradeId": 0,
    "WorkAccountId": 0,
    "JobTitleId": 0,
    "DesignationId": 0,
    "CTC": 0,
    "IsCurrent": 0,
    "FromDate": new Date(),
    "ToDate": new Date(),
    "Active": 0,
    "OrgId": 0,
    "SubOrgId": 0
  };
  displayedColumns = [
    "Action",
    "Active",
    "DepartmentId",
    "EmpGradeId",
    "WorkAccountId",
    "JobTitleId",
    "DesignationId",
    "CTC",
    "FromDate",
    "ToDate",
  ];
  searchForm: UntypedFormGroup;
  SelectedApplicationId=0;
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private contentservice: ContentService,
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
    //debugger;
    this.searchForm = this.fb.group({
      searchEmployeeName: [''],
    });
    this.PageLoad();
    this.filteredOptions = this.searchForm.get("searchEmployeeName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Employees.slice())
      );
    this.GetEmployees();
  }
  private _filter(name: string): IEmployee[] {

    const filterValue = name.toLowerCase();
    return this.Employees.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IEmployee): string {
    return user && user.Name ? user.Name : '';
  }


  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    //this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.WORKHISTORY);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission == 'deny') {
        this.loading = false; this.PageLoading=false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      this.SubOrgId= +this.tokenStorage.getSubOrgId();
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.GetMasterData();
      }
    }
  }
  updateActive(row, value) {
    //if(!row.Action)
    row.Action = !row.Action;
    row.Active = row.Active == 1 ? 0 : 1;
  }
  updateIsCurrent(row, value) {
    //if(!row.Action)
    row.Action = true;
    row.IsCurrent = value.checked ? 1 : 0;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          // this.GetApplicationRoles();
          this.contentservice.openSnackBar(globalconstants.DeletedMessage,globalconstants.ActionText,globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    //debugger;

    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let checkFilterString = this.FilterOrgSubOrg + " and EmployeeId eq " + this.searchForm.get("searchEmployeeName").value.EmployeeId +
      " and JobTitleId eq " + row.JobTitleId +
      " and EmpGradeId eq " + row.EmpGradeId +
      " and DepartmentId eq " + row.DepartmentId +
      " and DesignationId eq " + row.DesignationId

    if (row.EmployeeGradeHistoryId > 0)
      checkFilterString += " and EmployeeGradeHistoryId ne " + row.EmployeeGradeHistoryId;
    //checkFilterString += " and " + this.StandardFilter;

    let list: List = new List();
    list.fields = ["EmployeeGradeHistoryId"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.EmployeeGradeHistoryData.EmployeeGradeHistoryId = row.EmployeeGradeHistoryId;
          this.EmployeeGradeHistoryData.EmployeeId = this.searchForm.get("searchEmployeeName").value.EmployeeId;
          this.EmployeeGradeHistoryData.Active = row.Active;
          this.EmployeeGradeHistoryData.DepartmentId = row.DepartmentId;
          this.EmployeeGradeHistoryData.DesignationId = row.DesignationId;
          this.EmployeeGradeHistoryData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.EmployeeGradeHistoryData.SubOrgId = this.SubOrgId;
          this.EmployeeGradeHistoryData.WorkAccountId = row.WorkAccountId;
          this.EmployeeGradeHistoryData.EmpGradeId = row.EmpGradeId;
          this.EmployeeGradeHistoryData.FromDate = row.FromDate;
          this.EmployeeGradeHistoryData.ToDate = row.ToDate;
          this.EmployeeGradeHistoryData.CTC = row.CTC.toString();
          this.EmployeeGradeHistoryData.IsCurrent = row.isCurrent;
          this.EmployeeGradeHistoryData.JobTitleId = row.JobTitleId;
          if (this.EmployeeGradeHistoryData.EmployeeGradeHistoryId == 0) {
            this.EmployeeGradeHistoryData["CreatedDate"] = new Date();
            this.EmployeeGradeHistoryData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmployeeGradeHistoryData["UpdatedDate"] = new Date();
            delete this.EmployeeGradeHistoryData["UpdatedBy"];
            //console.log('exam EmployeeGradeHistoryData', this.EmployeeGradeHistoryData)
            this.insert(row);
          }
          else {
            delete this.EmployeeGradeHistoryData["CreatedDate"];
            delete this.EmployeeGradeHistoryData["CreatedBy"];
            this.EmployeeGradeHistoryData["UpdatedDate"] = new Date();
            this.EmployeeGradeHistoryData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('EmpEmployeeGradeSalHistories', this.EmployeeGradeHistoryData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmployeeGradeHistoryId = data.EmployeeGradeHistoryId;
          this.loading = false; this.PageLoading=false;
          // this.rowCount+=1;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false; this.PageLoading=false;
          //   this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          // }
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {
    //console.log("to update", this.EmployeeGradeHistoryData)
    this.dataservice.postPatch('EmpEmployeeGradeSalHistories', this.EmployeeGradeHistoryData, this.EmployeeGradeHistoryData.EmployeeGradeHistoryId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading=false;
          //this.rowCount+=1;
          //if (this.rowCount == this.displayedColumns.length - 2) {
          //  this.loading = false; this.PageLoading=false;
          //  this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          //}
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }

  // checkall(value) {
  //   this.EmployeeSalaryComponentList.forEach(record => {
  //     if (value.checked)
  //       record.Active = 1;
  //     else
  //       record.Active = 0;
  //     record.Action = !record.Action;
  //   })
  // }
  // saveall() {
  //   this.EmployeeSalaryComponentList.forEach(record => {
  //     if (record.Action == true) {
  //       this.UpdateOrSave(record);
  //     }
  //   })
  // }
  // onBlur(element, event) {
  //   //debugger;
  //   var _colName = event.srcElement.name;
  //   //console.log("event", event);
  //   var row = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == _colName && s.StudentClassSubjectId == element.StudentClassSubjectId);
  //   row[0][_colName] = element[_colName];
  // }

  // UpdateAll() {
  //   this.EmployeeSalaryComponentList.forEach(element => {
  //     this.SaveRow(element);
  //   })
  // }
  SaveRow(element) {
    //debugger;
    this.loading = true;
    this.rowCount = 0;
    //var columnexist;
    for (var prop in element) {

      var row: any = this.StoredForUpdate.filter(s => s.SubjectMarkComponent == prop && s.StudentClassSubjectId == element.StudentClassSubjectId);

      if (row.length > 0 && prop != 'StudentClassSubject' && prop != 'Action') {
        row[0].Active = 1;
        row[0].Marks = row[0][prop];
        this.UpdateOrSave(row[0]);
      }

    }

  }
  get f() { return this.searchForm.controls; }
  addnew() {
    this.EmployeeGradeHistoryList.push({
      "EmployeeGradeHistoryId": 0,
      "EmpEmployeeId": 0,
      "DepartmentId": 0,
      "EmpGradeId": 0,
      "WorkAccountId": 0,
      "JobTitleId": 0,
      "DesignationId": 0,
      "CTC": 0,
      "IsCurrent":0,
      "FromDate": new Date(),
      "ToDate": new Date(),
      "Active": 0,
      "Action": true
    });
    this.dataSource = new MatTableDataSource<IEmployeeGradeHistory>(this.EmployeeGradeHistoryList);
  }
  GetGradeComponents() {

    //var orgIdSearchstr = this.FilterOrgSubOrg;//;

    let list: List = new List();

    list.fields = ["EmpGradeSalaryComponentId",
      "EmpGradeId",
      "SalaryComponentId",
      "FormulaOrAmount",
      "CommonComponent"];
    list.PageName = "EmpGradeComponents";
    list.filter = [this.FilterOrgSubOrg +" and Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        this.GradeComponents = [...data.value];
      })
  }
  GetEmployees() {

    //var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = [
      "EmpEmployeeId",
      "FirstName",
      "LastName"];
    list.PageName = "EmpEmployees";
    list.filter = [this.FilterOrgSubOrg +" and Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        this.Employees = data.value.map(m => {
          var _lastname = m.LastName == null? '' : " " + m.LastName;
          return {
            EmployeeId: m.EmpEmployeeId,
            Name: m.FirstName + _lastname
          }
        })
      })
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SubOrgId, this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.school.BATCH);
        this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.DEPARTMENT);
        this.Grades = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEGRADE);
        this.SalaryComponents = this.getDropDownData(globalconstants.MasterDefinitions.employee.SALARYCOMPONENT);
        this.ComponentTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.COMPONENTTYPE);
        this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
        this.JobTitles = this.getDropDownData(globalconstants.MasterDefinitions.employee.JOBTITLE);
        this.Designations = this.getDropDownData(globalconstants.MasterDefinitions.employee.DESIGNATION);
        this.loading = false; this.PageLoading=false;
      });
  }
  GetEmployeeGradeHistory() {
    this.loading = true;
    //debugger;
    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var filterstr = this.FilterOrgSubOrg + ' and Active eq 1 and EmployeeId eq ' + this.searchForm.get("searchEmployeeName").value.EmployeeId;
    let list: List = new List();

    list.fields = [
      "EmployeeGradeHistoryId",
      "DepartmentId",
      "EmpGradeId",
      "WorkAccountId",
      "JobTitleId",
      "DesignationId",
      "CTC",
      "IsCurrent",
      "FromDate",
      "ToDate",
      "Active",
    ];

    list.PageName = "EmpEmployeeGradeSalHistories";
    //list.lookupFields = ["EmpEmployeeSalaryComponents", "EmpGradeComponents"];
    list.filter = [filterstr];
    list.orderBy = "EmployeeGradeHistoryId desc";
    //list.orderBy = "ParentId";
    this.EmployeeGradeHistoryList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0)
          this.EmployeeGradeHistoryList = data.value.map((h, indx) => {
            //if (indx == 0)
              h.Action = true;
            // else
            //   h.Action = false;
            return h;
          });
          console.log("this.EmployeeGradeHistoryList",this.EmployeeGradeHistoryList)
        this.loading = false; this.PageLoading=false;
        this.dataSource = new MatTableDataSource<IEmployeeGradeHistory>(this.EmployeeGradeHistoryList);
      })
  }
  GetSalaryComponents() {

    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var filterstr = this.FilterOrgSubOrg + " and Active eq 1 and EmployeeId eq " + this.searchForm.get("searchEmployeeId").value;
    let list: List = new List();

    list.fields = [
      "EmpEmployeeSalaryComponents/EmployeeSalaryComponentId",
      "EmpEmployeeSalaryComponents/EmpGradeComponentId",
      "EmpEmployeeSalaryComponents/Amount",
      "EmpEmployeeSalaryComponents/Active",
    ]
    list.PageName = "EmpEmployeeGradeSalHistory";
    list.lookupFields = ["EmpEmployeeSalaryComponents", "EmpGradeComponents"];

    list.filter = [filterstr];
    //list.orderBy = "ParentId";
    //this.EmployeeSalaryComponentList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.EmployeeSalaryComponentList
      })

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
export interface IEmployeeGradeHistory {
  EmployeeGradeHistoryId: number;
  DepartmentId
  EmpGradeId: number;
  EmpEmployeeId: number;
  WorkAccountId: number;
  JobTitleId: number;
  DesignationId: number;
  IsCurrent: number;
  CTC: number;
  FromDate: Date;
  ToDate: Date;
  Active: number;
  Action: boolean;
}
export interface IEmployeeSalaryComponent {
  EmployeeSalaryComponentId: number;
  EmployeeId: number;
  EmpGradeComponentId: number;
  Amount: number;
  Active: number;
  Action: boolean;
}
export interface IEmployee {
  EmployeeId: number;
  Name: string;
}