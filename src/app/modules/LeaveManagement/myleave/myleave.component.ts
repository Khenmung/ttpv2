import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { IEmployee } from '../../employeesalary/employee-gradehistory/employee-gradehistory.component';
import * as moment from 'moment';
import alasql from 'alasql';
import { evaluate } from 'mathjs';

@Component({
  selector: 'app-myleave',
  templateUrl: './myleave.component.html',
  styleUrls: ['./myleave.component.scss']
})
export class MyLeaveComponent implements OnInit {
  PageLoading = true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  EmployeeLeaveListName = 'LeaveEmployeeLeaves';
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  newitem = false;
  loading = false;
  rowCount = 0;
  ApprovedEmployeeLeaves: IEmployeeLeave[] = [];
  EmployeeLeaveList: IEmployeeLeave[] = [];
  SelectedBatchId = 0;
  SubOrgId = 0;
  ApprovePermission = '';
  Grades: any[] = [];
  Leaves: any[] = [];
  LeaveStatus: any[] = [];
  Employees: any[] = [];
  dataSource: MatTableDataSource<IEmployeeLeave>;
  filteredOptions: Observable<IEmployee[]>;
  allMasterData: any[] = [];
  //LeaveStatuses :any[]= [];
  Departments: any[] = [];
  WorkAccounts: any[] = [];
  Designations: any[] = [];
  JobTitles: any[] = [];
  Genders: any[] = [];
  City: any[] = [];
  Countries: any[] = [];
  States: any[] = [];
  BloodGroups: any[] = [];
  Religions: any[] = [];
  Categories: any[] = [];
  Locations: any[] = [];
  EmploymentStatus: any[] = [];
  EmploymentTypes: any[] = [];
  Natures: any[] = [];
  MaritalStatus: any[] = [];
  ComponentTypes: any[] = [];
  VariableTypes: any[] = [];
  PreviousBatchId = 0;
  WeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  EmployeeLeaveData = {
    EmployeeLeaveId: 0,
    EmployeeId: 0,
    LeaveTypeId: 0,
    LeaveFrom: new Date(),
    LeaveTo: new Date(),
    NoOfDays: 0,
    BatchId: 0,
    LeaveReason: '',
    ApplyDate: new Date(),
    LeaveStatusId: 0,
    ApproveRejectedDate: new Date(),
    ApprovedBy: 0,
    Remarks: '',
    OrgId: 0,
    SubOrgId: 0,
    Active: 0,
  };
  LeaveManagement = {
    LeaveBalance: [],
    EmployeeLeave: {}
  }
  //LeaveManagement["LeaveBalance"]:any[]=[];
  displayedColumns = [
    "EmployeeLeaveId",
    "LeaveTypeId",
    "LeaveFrom",
    "LeaveTo",
    "NoOfDays",
    "LeaveReason",
    "LeaveStatusId",
    "Remarks",
    "Active",
    "Action"
  ];
  Permission = ''
  searchForm: UntypedFormGroup;
  SelectedApplicationId = 0;
  EmployeeId = 0;
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
    //debugger;
    this.searchForm = this.fb.group({
      searchLeaveStatusId: [0],
    });
    this.PageLoad();
    // this.filteredOptions = this.searchForm.get("searchEmployee")?.valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => typeof value === 'string' ? value : value.Name),
    //     map(Name => Name ? this._filter(Name) : this.Employees.slice())
    //   )!;

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
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.EMPLOYEE);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        var leaveObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.LEAVEAPPROVEPERMISSION);
        if (leaveObj.length > 0)
          this.ApprovePermission = leaveObj[0].permission;
        this.PreviousBatchId = +this.tokenStorage.getPreviousBatchId()!;
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.EmployeeId = this.tokenStorage.getEmployeeId()!;
        this.GetMasterData();
        this.GetHoliday();
      }
    }

  }

  updateActive(row, value) {
    //if(!row.Action)
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
          // this.GetApplicationRoles();
          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  ApproveReject(element) {
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
  SetStatus(element) {

    var statusobj = this.LeaveStatus.filter((f: any) => f.MasterDataId == element.LeaveStatusId)
    if (statusobj.length > 0) {
      element.LeaveStatus = statusobj[0].MasterDataName;
    }
  }
  dateChage(element) {
    debugger;

    //console.log('noofdays', _noOfDays)
    let _noOfDays = this.GetNoOfDays(element.LeaveFrom, element.LeaveTo, element.ExcludeDays);
    if (_noOfDays < 0) {
      this.contentservice.openSnackBar("Leave from must be less than leave to.", globalconstants.ActionText, globalconstants.RedBackground);
      element.Action = false;
      element.NoOfDays = 0;
      return;
    }

    _noOfDays = _noOfDays + 1;
    element.NoOfDays = _noOfDays;

  }
  GetNoOfDays(pFrom, pTo, pExcludeDays) {
    let a = moment(pFrom).startOf('day');
    let b = moment(pTo).startOf('day');
    let _noOfDays = b.diff(a, 'days');
    if (_noOfDays < 0)
      return _noOfDays;
    else {
      var tempdate, Holidays = 0, ExcludeDaysCount = 0;
      _noOfDays = _noOfDays + 1;
      for (let day = 1; day <= _noOfDays; day++) {
        tempdate = pFrom.add(day, 'days').startOf('day');
        var inHoliday = this.HolidayList.filter((h: any) => tempdate.diff(moment(h.StartDate).startOf('day'), 'days') >= 0 && tempdate.diff(moment(h.EndDate).startOf('day'), 'days') <= 0)
        if (inHoliday.length > 0)
          Holidays += 1;

        //exclude days set in the formula by user.
        pExcludeDays.forEach(w => {
          if (w.toLowerCase() == this.WeekDays[tempdate.getDay()].toLowerCase())
            ExcludeDaysCount += 1;
        })      
      }
      return _noOfDays - (ExcludeDaysCount + Holidays);
    }
  }
  HolidayListName = 'Holidays';
  HolidayList: any = [];
  GetHoliday() {
    debugger;

    this.loading = true;
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";

    let list: List = new List();
    list.fields = ["HolidayId,StartDate,EndDate"];

    list.PageName = this.HolidayListName;
    list.filter = [filterStr];
    this.HolidayList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.HolidayList = [...data.value];
        }
        this.loading = false;
      });

  }
  UpdateOrSave(row) {

    debugger;
    if (!row.NoOfDays) {
      this.contentservice.openSnackBar("Please enter no. of days.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.LeaveReason.length == 0) {
      this.contentservice.openSnackBar("Please enter reason.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (!row.LeaveTypeId) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select leave type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    //var _employeeId = this.searchForm.get("searchEmployee")?.value.EmployeeId;
    let checkFilterString = this.FilterOrgSubOrgBatchId + " and EmployeeId eq " + this.EmployeeId +
      " and LeaveFrom eq " + moment(row.LeaveFrom).format('YYYY-MM-DD') +
      " and LeaveTo eq " + moment(row.LeaveTo).format('YYYY-MM-DD') +
      " and Active eq 1"

    if (row.EmployeeLeaveId > 0)
      checkFilterString += " and EmployeeLeaveId ne " + row.EmployeeLeaveId;

    let list: List = new List();
    list.fields = ["EmployeeLeaveId"];
    list.PageName = this.EmployeeLeaveListName;
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
          list.fields = ["LeaveBalanceId,LeavePolicyId,OB,CB,Adjusted,EmployeeId,BatchId,Active"];
          list.PageName = "LeaveBalances";
          list.filter = ["EmployeeId eq " + this.EmployeeId + " and LeavePolicyId eq " + row.LeaveTypeId];
          this.dataservice.get(list)
            .subscribe((leavedata: any) => {
              var _NoOfLeaveClosingBalance = 0;
              if (leavedata.value.length > 0) {
                _NoOfLeaveClosingBalance = leavedata.value.reduce((ac, current) => ac + current.CB, 0);
                this.RawLeaveBalance = [...leavedata.value];
              }
              if (_NoOfLeaveClosingBalance > 0 && row.NoOfDays > _NoOfLeaveClosingBalance) {
                this.loading = false;
                this.contentservice.openSnackBar("No sufficient number of leaves available.", globalconstants.ActionText, globalconstants.RedBackground);
                //return;
              }
              else {
                var _leaveStatusId = 0;
                var pendingStatusObj = this.LeaveStatus.filter(l => l.MasterDataName.toLowerCase() == "pending")
                if (pendingStatusObj.length > 0 && row.LeaveStatusId == 0) {
                  this.EmployeeLeaveData.ApproveRejectedDate = new Date();
                  _leaveStatusId = pendingStatusObj[0].MasterDataId;
                  this.EmployeeLeaveData.ApprovedBy = 0;
                }
                else {
                  this.EmployeeLeaveData.ApproveRejectedDate = new Date();
                  _leaveStatusId = row.LeaveStatusId;
                  this.EmployeeLeaveData.ApprovedBy = +this.LoginUserDetail[0]["employeeId"];
                }
                this.EmployeeLeaveData.EmployeeLeaveId = row.EmployeeLeaveId;
                this.EmployeeLeaveData.EmployeeId = this.EmployeeId;// this.searchForm.get("searchEmployee")?.value.EmployeeId;
                this.EmployeeLeaveData.Active = row.Active;
                this.EmployeeLeaveData.LeaveTypeId = row.LeaveTypeId;
                this.EmployeeLeaveData.LeaveFrom = row.LeaveFrom;
                this.EmployeeLeaveData.LeaveTo = row.LeaveTo;
                this.EmployeeLeaveData.LeaveReason = row.LeaveReason;
                this.EmployeeLeaveData.LeaveStatusId = _leaveStatusId;
                this.EmployeeLeaveData.ApplyDate = row.ApplyDate;

                this.EmployeeLeaveData.NoOfDays = +row.NoOfDays;
                this.EmployeeLeaveData.BatchId = this.SelectedBatchId;
                this.EmployeeLeaveData.OrgId = this.LoginUserDetail[0]["orgId"];
                this.EmployeeLeaveData.SubOrgId = this.SubOrgId;
                this.EmployeeLeaveData.Remarks = row.Remarks;
                //console.log('data', this.EmployeeLeaveData);

                if (this.EmployeeLeaveData.EmployeeLeaveId == 0) {
                  this.EmployeeLeaveData["CreatedDate"] = new Date();
                  this.EmployeeLeaveData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
                  this.EmployeeLeaveData["UpdatedDate"] = new Date();
                  delete this.EmployeeLeaveData["UpdatedBy"];
                  //this.LeaveManagement.EmployeeLeave = this.EmployeeLeaveData;

                  this.insert(row);
                }
                else {
                  delete this.EmployeeLeaveData["CreatedDate"];
                  delete this.EmployeeLeaveData["CreatedBy"];
                  this.EmployeeLeaveData["UpdatedDate"] = new Date();
                  this.EmployeeLeaveData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
                  this.LeaveManagement.EmployeeLeave = this.EmployeeLeaveData;

                  this.RegularizeLeave(row);
                }

              }
            })
        }
      });
  }

  get f() {
    return this.searchForm.controls;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.EmployeeLeaveListName, this.EmployeeLeaveData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmployeeLeaveId = data.EmployeeLeaveId;
          this.loading = false; this.PageLoading = false;
          this.newitem = false;
          // this.rowCount+=1;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false; this.PageLoading=false;
          //   this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          // }
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {
    ////console.log("this.GradeComponentData", this.GradeComponentData);
    this.dataservice.postPatch(this.EmployeeLeaveListName, this.LeaveManagement, this.EmployeeLeaveData.EmployeeLeaveId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          // this.rowCount+=1;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false; this.PageLoading=false;
          //   this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          // }
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }

  onBlur(element) {
    element.Action = true;
  }

  // UpdateAll() {
  //   this.GradeComponentList.forEach(element => {
  //     this.SaveRow(element);
  //   })
  // }
  SaveRow(element) {
    //debugger;
    this.loading = true;
    this.rowCount = 0;

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SubOrgId, this.SelectedApplicationId)
      .subscribe((data: any) => {
        //debugger;
        this.allMasterData = [...data.value];
        this.Leaves = this.getDropDownData(globalconstants.MasterDefinitions.leave.EMPLOYEELEAVE);
        this.Leaves.sort((a, b) => a.Sequence - b.Sequence);
        this.Grades = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEGRADE);
        this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.DEPARTMENT);
        this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
        this.Designations = this.getDropDownData(globalconstants.MasterDefinitions.employee.DESIGNATION);
        this.JobTitles = this.getDropDownData(globalconstants.MasterDefinitions.employee.JOBTITLE);
        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEGENDER);
        this.City = this.getDropDownData(globalconstants.MasterDefinitions.common.CITY);
        this.Countries = this.getDropDownData(globalconstants.MasterDefinitions.common.COUNTRY);
        this.States = this.getDropDownData(globalconstants.MasterDefinitions.common.STATE);
        this.BloodGroups = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
        this.Religions = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
        this.Categories = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.LOCATION);
        this.EmploymentStatus = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYMENTSTATUS);
        this.EmploymentTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYMENTTYPE);;
        this.Natures = this.getDropDownData(globalconstants.MasterDefinitions.employee.NATURE);
        this.MaritalStatus = this.getDropDownData(globalconstants.MasterDefinitions.employee.MARITALSTATUS);
        this.ComponentTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.COMPONENTTYPE);
        this.VariableTypes = this.getDropDownData(globalconstants.MasterDefinitions.common.CONFIGTYPE);
        this.Grades = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEGRADE);
        this.Leaves = this.getDropDownData(globalconstants.MasterDefinitions.leave.EMPLOYEELEAVE);
        this.LeaveStatus = this.getDropDownData(globalconstants.MasterDefinitions.leave.LEAVESTATUS);
        this.loading = false; this.PageLoading = false;
        this.GetEmployees();
        this.GetLeavePolicy();
      });
  }
  GetEmployees() {

    //var orgIdSearchstr =this.StandardFilter;

    let list: List = new List();

    list.fields = [
      "EmpEmployeeId",
      "EmployeeCode",
      "FirstName",
      "LastName"];
    list.PageName = "EmpEmployees";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        this.Employees = data.value.map(m => {
          return {
            EmployeeId: m.EmpEmployeeId,
            Name: m.EmployeeCode + "-" + m.FirstName + " " + m.LastName
          }
        })
        //console.log("employeeid",this.searchForm.get("searchEmployee")?.value.EmployeeId)
        //this.GetGradeComponents();
      })

  }
  // GetApprovedEmployeeLeave(pLeavePolicyId) {

  //   let list: List = new List();
  //   list.fields = [
  //     "EmployeeLeaveId",
  //     "EmployeeId",
  //     "LeaveTypeId",
  //     "NoOfDays",
  //     "LeaveStatusId",
  //   ];
  //   var obj = this.LeaveStatus.filter((f:any) => f.MasterDataName.toLowerCase() == "approved");
  //   var _ApprovedId = 0;
  //   if (obj.length > 0)
  //     _ApprovedId = obj[0].MasterDataId;

  //   list.PageName = this.EmployeeLeaveListName;
  //   list.filter = [this.FilterOrgSubOrgBatchId + //" and EmployeeId eq " + _employeeId +
  //     " and LeaveTypeId eq " + pLeavePolicyId + " and LeaveStatusId eq " + _ApprovedId + " and Active eq 1"];

  //   return this.dataservice.get(list);

  // }
  GetEmployeeLeave() {
    debugger;
    //var orgIdSearchstr = this.FilterOrgSubOrg;// 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
     var _leaveStatusId = this.searchForm.get("searchLeaveStatusId")?.value;
    if (!_leaveStatusId) {
      this.contentservice.openSnackBar("Please select status.", globalconstants.ActionText, globalconstants.RedBackground);
    }
    else {
    this.displayedColumns = [
      "EmployeeLeaveId",
      "LeaveTypeId",
      "LeaveFrom",
      "LeaveTo",
      "NoOfDays",
      "LeaveReason",
      //"ApplyDate",      
      //"ApproveRejecteDate",
      //"ApprovedBy",
      "Remarks",
      "LeaveStatusId",
      "Active",
      "Action"
    ];
    let list: List = new List();

    list.fields = [
      "EmployeeLeaveId",
      "EmployeeId",
      "LeaveTypeId",
      "LeaveFrom",
      "LeaveTo",
      "NoOfDays",
      "LeaveReason",
      "ApplyDate",
      "LeaveStatusId",
      "ApproveRejectedDate",
      "ApprovedBy",
      "Remarks",
      "Active"
    ];
    this.loading = true;
    list.PageName = this.EmployeeLeaveListName;
    list.filter = [this.FilterOrgSubOrgBatchId + " and EmployeeId eq " + this.EmployeeId];
    //list.orderBy = "ParentId";
    this.EmployeeLeaveList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;

        if (data.value.length > 0)
          this.EmployeeLeaveList = data.value.map(d => {
            d.LeaveStatus = this.LeaveStatus.filter(l => l.MasterDataId == d.LeaveStatusId)[0].MasterDataName;
            return d;
          })
        else {
          this.contentservice.openSnackBar("No record found!", globalconstants.ActionText, globalconstants.RedBackground);
        }

        this.dataSource = new MatTableDataSource<IEmployeeLeave>(this.EmployeeLeaveList);
        this.loading = false;
      })
     }
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
  addnew() {
    debugger;
    this.displayedColumns = [
      "EmployeeLeaveId",
      "LeaveTypeId",
      "LeaveFrom",
      "LeaveTo",
      "NoOfDays",
      "LeaveReason",
      "Active",
      "Action"
    ]
    this.EmployeeLeaveList = [];
    var _leaveStatusId = this.LeaveStatus.filter(l => l.MasterDataName.toLowerCase() == 'pending')[0].MasterDataId;
    var newdata = {
      EmployeeLeaveId: 0,
      EmployeeId: this.EmployeeId,
      LeaveTypeId: 0,
      LeaveFrom: new Date(),
      LeaveTo: new Date(),
      NoOfDays: 1,
      LeaveReason: '',
      LeaveStatus: 'Pending',
      ApplyDate: new Date(),
      LeaveStatusId: _leaveStatusId,
      ApproveRejecteDate: new Date(),
      BatchId: this.SelectedBatchId,
      ApprovedBy: 0,
      Remarks: '',
      Active: 0,
      Action: true
    }
    this.EmployeeLeaveList.push(newdata)
    this.newitem = true;
    this.dataSource = new MatTableDataSource(this.EmployeeLeaveList);
  }
  RawLeaveBalance: any[] = [];
  StoredForUpdate: any[] = [];
  LeavePolicies: any[] = [];
  GetLeavePolicy() {
    debugger;
    //var orgIdAndBatchSearchstr = 'BatchId eq ' + this.SelectedBatchId + ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    this.loading = true;
    let list: List = new List();

    list.fields = [
      "LeavePolicyId",
      "LeaveNameId",
      "BatchId",
      "Description",
      "ExcludeDays",
      "FormulaOrDays"];
    list.PageName = "LeavePolicies";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.LeavePolicies = data.value.map(m => {
          m.Leave = this.Leaves.filter(l => l.MasterDataId == m.LeaveNameId)[0].MasterDataName;
          // m.Batch = this.Batches.filter(b=>b.BatchId == m.BatchId)[0].BatchName;
          return m;
        });
        this.loading = false; this.PageLoading = false;
      })
  }
  RegularizeLeave(row) {
    debugger;
    this.loading = true;
    var _EmployeeId = this.searchForm.get("searchEmployee")?.value.EmployeeId;
    if (!_EmployeeId) {
      this.contentservice.openSnackBar("Please select employee.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      return;
    }

    var source = [this.GetCurrentEmployeeVariableData()];
    forkJoin(source)
      .subscribe((data: any) => {
        var _leaveApprovedstatusId = '';
        var _leaveApprovedStatusObj = this.LeaveStatus.filter(l => l.MasterDataName.toLowerCase() == 'approved');
        if (_leaveApprovedStatusObj.length > 0)
          _leaveApprovedstatusId = _leaveApprovedStatusObj[0].MasterDataId;

        this.ApprovedEmployeeLeaves = alasql("select EmployeeId,LeaveTypeId,sum(NoOfDays) LeaveDays,LeaveStatusId from ? where LeaveTypeId = ? and LeaveStatusId = ? group by EmployeeId,LeaveTypeId,LeaveStatusId", [this.EmployeeLeaveList, row.LeaveTypeId, _leaveApprovedstatusId]);
        //this.ApprovedEmployeeLeaves = [..._empLeaves];
        var existingdata;
        this.StoredForUpdate = [];
        var employeeVariable: any = {};
        var employees = [...data[0].value];
        //console.log("employee", employees);
        var _NoOfMonths = 0;
        var _NoOfYears = 0;
        var _Age = 0;
        var _sessionStartEnd = JSON.parse(this.tokenStorage.getSelectedBatchStartEnd()!!);
        var startMonth = new Date(_sessionStartEnd["StartDate"]).getMonth();
        var _currentMonth = new Date().getMonth();
        var ConfirmationMonth = 0;
        var joinDate = 0;

        employees.forEach(item => {
          _Age = Math.round(new Date().getTime() - new Date(item.Employee.DOB).getTime()) / 365 * (1000 * 60 * 60 * 24);
          //const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          if (moment(item.Employee.ConfirmationDate).year == moment().year) {
            ConfirmationMonth = new Date(item.Employee.ConfirmationDate).getMonth();
            joinDate = new Date(item.Employee.ConfirmationDate).getDate();
            if (_currentMonth >= startMonth)
              _NoOfMonths = _currentMonth - (ConfirmationMonth - startMonth);
            else if (_currentMonth < startMonth)
              _NoOfMonths = (_currentMonth + (12 - startMonth)) - ConfirmationMonth;
          }
          else {
            if (_currentMonth >= startMonth)
              _NoOfMonths = _currentMonth - startMonth + 1;
            else if (_currentMonth < startMonth)
              _NoOfMonths = _currentMonth + (12 - startMonth) + 1;
          }
          _NoOfYears = _NoOfMonths / 12;
          employeeVariable =
          {
            "Grade": this.getMasterText(this.Grades, item.EmpGradeId),
            "Department": this.getMasterText(this.Departments, item.DepartmentId),
            "WorkAccount": this.getMasterText(this.WorkAccounts, item.WorkAccountId),
            "JobTitle": this.getMasterText(this.JobTitles, item.JobTitleId),
            "Designation": this.getMasterText(this.Designations, item.DesignationId),
            "Gender": this.getMasterText(this.Genders, item.Employee.GenderId),
            "DOB": item.Employee.DOB,
            "DOJ": item.Employee.DOJ,
            "NoOfMonths": _NoOfMonths,
            "NoOfYears": _NoOfYears,
            "Age": _Age,
            "PreviousYearCB": 0,
            "State": this.getMasterText(this.States, item.Employee.PresentAddressStateId),
            "Country": this.getMasterText(this.Countries, item.Employee.PresentAddressCountryId),
            "Category": this.getMasterText(this.Categories, item.Employee.CategoryId),
            "EmploymentStatus": this.getMasterText(this.EmploymentStatus, item.Employee.EmploymentStatusId),
            "EmploymentType": this.getMasterText(this.EmploymentTypes, item.Employee.EmploymentTypeId),
            "WorkNature": this.getMasterText(this.Natures, item.Employee.NatureId),
            "MaritalStatus": this.getMasterText(this.MaritalStatus, item.Employee.MaritalStatusId),
          }
          var _policy = this.LeavePolicies.filter(l => l.LeavePolicyId == row.LeaveTypeId);
          _policy.forEach(pol => {
            var _NoOfDays = 0, _formula = '';
            var previousData = this.RawLeaveBalance.filter(d => d.LeavePolicyId == pol.LeavePolicyId
              && d.EmployeeId == item.Employee.EmpEmployeeId
              && d.BatchId == this.PreviousBatchId);
            if (previousData.length > 0) {
              employeeVariable.PreviousYearCB = previousData[0].CB;
            }
            Object.keys(employeeVariable).forEach(e => {
              if (pol.FormulaOrDays.includes('[' + e + ']')) {
                if (isNaN(employeeVariable[e]))//text
                  pol.FormulaOrDays = pol.FormulaOrDays.replaceAll('[' + e + ']', "'" + employeeVariable[e] + "'");
                else
                  pol.FormulaOrDays = pol.FormulaOrDays.replaceAll('[' + e + ']', employeeVariable[e]);
              }
            })
            _formula = pol.FormulaOrDays;
            _NoOfDays = evaluate(_formula);
            //var _empThisLeave = this.EmployeeLeaveList.filter(e => e.LeavePolicyId == item.LeavePolicyId)
            existingdata = this.RawLeaveBalance.filter(d => d.LeavePolicyId == pol.LeavePolicyId
              && d.EmployeeId == item.Employee.EmpEmployeeId
              && d.BatchId == this.SelectedBatchId);

            if (existingdata.length > 0) {
              existingdata.forEach(ex => {
                ex.Leave = pol.Leave;
                ex.Batch = pol.Batch;
                ex.Employee = item.Employee.FirstName + (item.Employee.LastName ? ' ' + item.Employee.LastName : '');
                this.StoredForUpdate.push(
                  {
                    LeaveBalanceId: ex.LeaveBalanceId,
                    EmployeeId: item.Employee.EmpEmployeeId,
                    DepartmentId: item.DepartmentId,
                    LeavePolicyId: pol.LeavePolicyId,
                    OB: ex.OB,
                    Adjusted: ex.Adjusted,
                    CB: ex.CB,
                    Active: ex.Active,
                    BatchId: ex.BatchId,
                    OrgId: this.LoginUserDetail[0]["orgId"],
                    SubOrgId: this.SubOrgId
                  }
                )
              })
            }
            else {
              if (pol.BatchId == this.SelectedBatchId) {
                var _lastName = item.Employee.LastName ? ' ' + item.Employee.LastName : '';
                var newdata = {
                  LeaveBalanceId: 0,
                  Employee: item.Employee.FirstName + _lastName,
                  EmployeeId: item.Employee.EmpEmployeeId,
                  DepartmentId: item.DepartmentId,
                  LeavePolicyId: pol.LeavePolicyId,
                  Leave: pol.Leave,
                  Batch: pol.Batch,
                  OB: _NoOfDays,
                  Adjusted: 0,
                  CB: _NoOfDays,
                  Active: 1,
                  BatchId: this.SelectedBatchId,
                  Action: true
                }
                this.StoredForUpdate.push(
                  {
                    LeaveBalanceId: 0,
                    EmployeeId: item.Employee.EmpEmployeeId,
                    DepartmentId: item.DepartmentId,
                    LeavePolicyId: pol.LeavePolicyId,
                    OB: _NoOfDays,
                    Adjusted: 0,
                    CB: _NoOfDays,
                    Active: 1,
                    BatchId: this.SelectedBatchId,
                    OrgId: this.LoginUserDetail[0]["orgId"],
                    SubOrgId: this.SubOrgId
                  }
                )
                this.RawLeaveBalance.push(newdata);
              }
            }
          })
        });
        //var rows = this.EmployeeLeaveList.filter(r=>r.LeaveTypeId == row.LeaveTypeId && r.BatchId == this.SelectedBatchId);
        // var _leavestatus = '';
        // var _leaveStatusObj = this.LeaveStatus.filter(l => l.MasterDataId == row.LeaveStatusId);
        // if (_leaveStatusObj.length > 0)
        //   _leavestatus = _leaveStatusObj[0].MasterDataName;
        // if (_leavestatus.toLowerCase() == "approved")
        //   this.ApprovedEmployeeLeaves.push(row);

        var totalLeaves = this.ApprovedEmployeeLeaves.reduce((acc, cur) => acc + cur["LeaveDays"], 0);
        this.StoredForUpdate.forEach(leave => {
          if (row.LeaveTypeId == leave.LeavePolicyId && leave.BatchId == this.SelectedBatchId) {
            leave.Adjusted = totalLeaves;
            leave.CB = (leave.OB - totalLeaves);
          }
        })

        this.LeaveManagement.LeaveBalance = JSON.parse(JSON.stringify(this.StoredForUpdate));
        console.log("this.LeaveManagement", this.LeaveManagement);
        this.update(row);
      })
  }
  GetCurrentEmployeeVariableData() {
    //var _DepartmentId = this.searchForm.get("searchDepartmentId")?.value;
    //var _employeeId = this.searchForm.get("searchEmployee")?.value.EmployeeId;

    //var orgIdSearchstr = ' and OrgId eq ' + OrgId;
    var searchfilter = '';
    // if (!_employeeId)
    //   this.contentservice.openSnackBar("Please select employee.", globalconstants.ActionText, globalconstants.RedBackground);
    // else {
    //   searchfilter = " and EmployeeId eq " + _employeeId
    // }
    searchfilter = " and EmployeeId eq " + this.EmployeeId;
    let list: List = new List();

    list.fields = ["DesignationId,WorkAccountId,JobTitleId,DepartmentId,EmpGradeId,EmployeeId"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["Employee($SELECT=EmpEmployeeId,FirstName,LastName,ShortName,GenderId,PresentAddressCountryId,PresentAddressStateId,DOB,DOJ,CategoryId,EmploymentStatusId,EmploymentTypeId,NatureId,ConfirmationDate,MaritalStatusId)"];
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1 and IsCurrent eq 1" + searchfilter];
    return this.dataservice.get(list);
  }
  getMasterText(arr, itemId) {
    var filtered = arr.filter((f: any) => f.MasterDataId == itemId);
    if (filtered.length > 0)
      return filtered[0].MasterDataName;
    else
      return '';
  }
}
export interface IEmployeeLeave {
  EmployeeLeaveId: number;
  EmployeeId: number;
  LeaveTypeId: number;
  LeaveFrom: Date;
  LeaveTo: Date;
  NoOfDays: number;
  LeaveReason: string;
  LeaveStatus: string;
  ApplyDate: Date;
  LeaveStatusId: number;
  ApproveRejecteDate: Date;
  ApprovedBy: number;
  BatchId: number;
  Remarks: string;
  Action: boolean;
}
