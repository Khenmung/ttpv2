import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-gradehistory',
  templateUrl: './gradehistory.component.html',
  styleUrls: ['./gradehistory.component.scss']
})
export class GradehistoryComponent implements OnInit {
    PageLoading = true;

  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  // optionsNoAutoClose = {
  //   autoClose: false,
  //   keepAfterRouteChange: true
  // };
  // optionAutoClose = {
  //   autoClose: true,
  //   keepAfterRouteChange: true
  // };
  EmploymentHistoryListName = 'EmpEmployeeGradeSalHistories';
  Employees = [];
  Grades = [];
  Designations = [];
  Departments = [];
  WorkAccounts = [];
  JobTitles = [];
  loading = false;
  FilterOrgSubOrgStr='';
  SelectedBatchId = 0;SubOrgId = 0;
  EmploymentHistoryList: IEmployeementHistory[] = [];
  filteredOptions: Observable<IEmployeementHistory[]>;
  //filteredEmployees: Observable<IEmployee[]>;
  dataSource: MatTableDataSource<IEmployeementHistory>;
  allMasterData = [];
  EmploymentHistory = [];
  Permission = 'deny';
  EmployeeId = 0;
  SelectedApplicationId = 0;
  EmploymentHistoryData = {
    EmployeeGradeHistoryId: 0,
    EmpGradeId: 0,
    EmployeeId: 0,
    DepartmentId: 0,
    CTC: 0,
    FromDate: new Date(),
    ToDate: new Date(),
    ManagerId: 0,
    ReportingTo: 0,
    JobTitleId: 0,
    DesignationId: 0,
    WorkAccountId: 0,
    IsCurrent: 0,
    OrgId: 0,SubOrgId: 0,
    Remarks: '',
    ApprovedBy: 0,
    Active: 0
  };
  displayedColumns = [
    "Action",
    "Active",
    "IsCurrent",
    "EmployeeGradeHistoryId",
    "EmpGradeId",
    "DesignationId",
    "JobTitleId",
    "DepartmentId",
    "WorkAccountId",
    "ManagerName",
    "ReportingToName",
    "FromDate",
    "ToDate",
    "Remarks",

  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private nav: Router,
    private datepipe: DatePipe,
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
      searchClassName: [0]
    });
    // this.filteredEmployees = this.EmployeeSearchForm.get("searchemployeeName").valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => typeof value === 'string' ? value : value.Name),
    //     map(Name => Name ? this._filter(Name) : this.Employees.slice())
    //   );
    this.PageLoad();
  }
  filterEmployee(name: string) {
    var filterValue = '';
    if (name != undefined)
      filterValue = name.toLowerCase();

    return name && this.Employees.filter(option => option.Name.toLowerCase().includes(filterValue)) || this.Employees;

  }
  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.EmployeeId = +this.tokenStorage.getEmployeeId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.EMPLOYMENTHISTORY)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.SubOrgId = +this.tokenStorage.getSubOrgId();
        this.FilterOrgSubOrgStr = globalconstants.getOrgSubOrgFilter(this.tokenStorage);

        this.GetEmployees();
        //this.GetMasterData();

      }
    }
  }

  AddNew() {

    var newdata = {
      EmployeeGradeHistoryId: 0,
      EmpGradeId: 0,
      DepartmentId: 0,
      CTC: 0,
      FromDate: new Date(),
      ToDate: new Date(),
      ManagerId: 0,
      ManagerName: '',
      ReportingTo: 0,
      ReportingName: '',
      JobTitleId: 0,
      DesignationId: 0,
      WorkAccountId: 0,
      IsCurrent: 0,
      Remarks: '',
      Active: 0,
      Action: false
    };
    this.EmploymentHistoryList = [];
    this.EmploymentHistoryList.push(newdata);
    this.dataSource = new MatTableDataSource<IEmployeementHistory>(this.EmploymentHistoryList);
  }
  onBlur(element) {
    element.Action = true;
  }
  UpdateManagerId(row: IEmployeementHistory) {
    row.Action = true;
    row.ManagerId = this.Employees.filter(f => f.Name == row.ManagerName)[0].EmployeeId
  }
  UpdateReportingToId(row) {
    row.Action = true;
    row.ReportingTo = this.Employees.filter(f => f.Name == row.ReportingToName)[0].EmployeeId
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    let checkFilterString = "EmpGradeId eq " + row.EmpGradeId +
      " and DesignationId eq " + row.DesignationId +
      " and EmployeeId eq " + this.EmployeeId
    if (row.ManagerId == null || row.ManagerId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please assign manager.", globalconstants.ActionText, globalconstants.RedBackground);
      return
    }
    if (row.WorkAccountId == null || row.WorkAccountId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select work account.", globalconstants.ActionText, globalconstants.RedBackground);
      return
    }
    if (row.EmployeeGradeHistoryId > 0)
      checkFilterString += " and EmployeeGradeHistoryId ne " + row.EmployeeGradeHistoryId;
    let list: List = new List();
    list.fields = ["EmployeeGradeHistoryId"];
    list.PageName = this.EmploymentHistoryListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.EmploymentHistoryData.EmployeeGradeHistoryId = row.EmployeeGradeHistoryId;
          this.EmploymentHistoryData.Active = row.Active;
          this.EmploymentHistoryData.EmpGradeId = row.EmpGradeId;
          this.EmploymentHistoryData.EmployeeId = this.EmployeeId;
          this.EmploymentHistoryData.DesignationId = row.DesignationId;
          this.EmploymentHistoryData.DepartmentId = row.DepartmentId;
          this.EmploymentHistoryData.JobTitleId = row.JobTitleId;
          this.EmploymentHistoryData.ManagerId = +row.ManagerId;
          this.EmploymentHistoryData.ReportingTo = +row.ReportingTo;
          this.EmploymentHistoryData.WorkAccountId = +row.WorkAccountId;
          this.EmploymentHistoryData.IsCurrent = +row.IsCurrent;

          this.EmploymentHistoryData.CTC = row.CTC;
          this.EmploymentHistoryData.FromDate = row.FromDate;
          this.EmploymentHistoryData.ToDate = row.ToDate;
          this.EmploymentHistoryData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.EmploymentHistoryData.SubOrgId = this.SubOrgId;

          if (this.EmploymentHistoryData.EmployeeGradeHistoryId == 0) {
            this.EmploymentHistoryData.IsCurrent = 1;
            this.EmploymentHistoryData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.EmploymentHistoryData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmploymentHistoryData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            delete this.EmploymentHistoryData["UpdatedBy"];
            //console.log('this.EmploymentHistoryData', this.EmploymentHistoryData)
            this.insert(row);
          }
          else {
            this.EmploymentHistoryData.IsCurrent = +row.IsCurrent;
            delete this.EmploymentHistoryData["CreatedDate"];
            delete this.EmploymentHistoryData["CreatedBy"];
            this.EmploymentHistoryData["UpdatedDate"] = new Date();
            this.EmploymentHistoryData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.EmploymentHistoryListName, this.EmploymentHistoryData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmployeeGradeHistoryId = data.EmployeeGradeHistoryId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
          this.GetEmploymentHistory();
        });
  }
  update(row) {

    this.dataservice.postPatch(this.EmploymentHistoryListName, this.EmploymentHistoryData, this.EmploymentHistoryData.EmployeeGradeHistoryId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
          this.GetEmploymentHistory();
        });
  }
  GetEmploymentHistory() {
    debugger;

    this.loading = true;
    let filterStr = 'EmployeeId eq ' + this.EmployeeId

    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.EmploymentHistoryListName;
    list.filter = [filterStr];
    this.EmploymentHistoryList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.EmploymentHistoryList = data.value.map(f => {

          var _ManagerNameObj = this.Employees.filter(e => e.EmployeeId == f.ManagerId);
          var _ManagerName = '';
          if (_ManagerNameObj.length > 0) {
            _ManagerName = _ManagerNameObj[0].Name;
          }
          var _ReportingToNameObj = this.Employees.filter(e => e.EmployeeId == f.ReportingTo);
          var _ReportingToName = '';
          if (_ReportingToNameObj.length > 0) {
            _ReportingToName = _ReportingToNameObj[0].Name;
          }
          f.ReportingToName = _ReportingToName;
          f.ManagerName = _ManagerName;
          return f;
        }).sort((a, b) => b.EmployeeGradeHistoryId - a.EmployeeGradeHistoryId)
        console.log("EmploymentHistoryList1", this.EmploymentHistoryList)
        this.dataSource = new MatTableDataSource<IEmployeementHistory>(this.EmploymentHistoryList);
        this.loadingFalse();
      });

  }
  updateIsCurrent(row, value) {
    row.Action = true;
    row.IsCurrent = value.checked ? 1 : 0;
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.Grades = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEGRADE);
    this.Designations = this.getDropDownData(globalconstants.MasterDefinitions.employee.DESIGNATION);
    this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.employee.DEPARTMENT);
    this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
    this.JobTitles = this.getDropDownData(globalconstants.MasterDefinitions.employee.JOBTITLE);
    this.GetEmploymentHistory();
    this.loading = false; this.PageLoading = false;
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
    list.filter = [this.FilterOrgSubOrgStr + " and Active eq 1"];// and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

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
              Name: _name,
              NameNContact: _fullDescription
            }
          })
        }
        this.GetMasterData();
        this.loading = false; this.PageLoading = false;
      })
  }
}
export interface IEmployeementHistory {
  EmployeeGradeHistoryId: number;
  EmpGradeId: number;
  DepartmentId: number;
  CTC: number;
  FromDate: Date;
  ToDate: Date;
  ManagerId: number;
  ManagerName: string;
  ReportingTo: number;
  ReportingName: string;
  JobTitleId: number;
  DesignationId: number;
  WorkAccountId: number;
  Remarks: string;
  Active: number;
  Action: boolean;
}


