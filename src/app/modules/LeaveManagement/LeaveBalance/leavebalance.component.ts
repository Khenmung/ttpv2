//import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { evaluate } from 'mathjs';
import { forkJoin, observable, Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { IEmployee } from '../../employeesalary/employee-gradehistory/employee-gradehistory.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import alasql from 'alasql';
import * as moment from 'moment';

@Component({
  selector: 'app-leavebalance',
  templateUrl: './leavebalance.component.html',
  styleUrls: ['./leavebalance.component.scss']
})
export class LeaveBalanceComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  PageLoading = true;
  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  PagePermission = '';
  Defaultvalue=0;
  LeaveBalanceListName = 'LeaveBalances';
  EmployeeLeaveListName = 'LeaveEmployeeLeaves';
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  rowCount = 0;
  LeavePolicies :any[]= [];
  RawLeaveBalance :any[]= [];
  //LeaveBalanceList:any[]= [];
  PreviousBatchId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  StoredForUpdate :any[]= [];
  Leaves :any[]= [];
  Grades :any[]= [];
  Departments :any[]= [];
  WorkAccounts :any[]= [];
  Designations :any[]= [];
  JobTitles :any[]= [];
  Genders :any[]= [];
  City :any[]= [];
  Countries :any[]= [];
  States :any[]= [];
  BloodGroups :any[]= [];
  Religions :any[]= [];
  Categories :any[]= [];
  Locations :any[]= [];
  EmploymentStatus :any[]= [];
  EmploymentTypes :any[]= [];
  Natures :any[]= [];
  MaritalStatus :any[]= [];
  ComponentTypes :any[]= [];
  VariableTypes :any[]= [];
  //OpenAdjustCloseLeaves :any[]= [];
  DropDownMonths :any[]= [];
  Employees :any[]= [];
  filteredOptions: Observable<IEmployee[]>;
  dataSource: MatTableDataSource<ILeaveBalance>;
  allMasterData :any[]= [];
  SelectedApplicationId = 0;
  LeaveBalanceData = {
    LeaveBalanceId: 0,
    EmployeeId: 0,
    DepartmentId: 0,
    LeavePolicyId: 0,
    OB: 0,
    Adjusted: 0,
    CB: 0,
    BatchId: 0,
    OrgId: 0,
    SubOrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "Employee",
    "Leave",
    "OB",
    "Adjusted",
    "CB",
    "Year"
  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private shareddata: SharedataService,
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
      searchEmployee: [0],
      searchDepartmentId: [0]
    });
    this.PageLoad();
    this.filteredOptions = this.searchForm.get("searchEmployee")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Employees.slice())
      )!;

    this.DropDownMonths = this.contentservice.GetSessionFormattedMonths();//this.GetSessionFormattedMonths();

  }
  private _filter(name: string): IEmployee[] {

    const filterValue = name.toLowerCase();
    return this.Employees.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IEmployee): string {
    return user && user.Name ? user.Name : '';
  }

  LeaveStatuses :any[]= [];
  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.PreviousBatchId = +this.tokenStorage.getPreviousBatchId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.GetMasterData();
      this.getBatches();

    }
  }
  updateCommonComponent(row, value) {
    //debugger;
    row.Action = true;
    row.CommonComponent = value.checked == 1 ? 1 : 0;

  }
  updateDeduction(row, value) {
    //debugger;
    row.Action = true;
    row.Deduction = value.checked == 1 ? 1 : 0;
  }

  updateActive(row, value) {
    //if(!row.Action)
    row.Action = true;
    row.Active = value.checked == 1 ? 1 : 0;
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
  GetSessionFormattedMonths() {
    var _sessionStartEnd = {
      StartDate: new Date(),
      EndDate: new Date()
    };
    var Months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
    var monthArray :any[]= [];
    //setTimeout(() => {

    this.shareddata.CurrentSelectedBatchStartEnd$.subscribe((b: any) => {

      if (b.length != 0) {
        _sessionStartEnd = { ...b };
        ////console.log('b',b)
        var _Year = new Date(_sessionStartEnd.StartDate).getFullYear();
        var startMonth = new Date(_sessionStartEnd.StartDate).getMonth();

        for (var month = 0; month < 12; month++, startMonth++) {
          monthArray.push({
            MonthName: Months[startMonth] + " " + _Year,
            val: _Year + startMonth.toString().padStart(2, "0")
          })
          if (startMonth == 11) {
            startMonth = -1;
            _Year += 1;
          }
        }
      }
    });
    //////console.log('monthArray',monthArray);
    //}, 3000);
    return monthArray;
  }
  EmployeeLeaveList :any[]= [];
  GetEmployeeLeave() {

    let list: List = new List();
    list.fields = [
      "EmployeeLeaveId",
      "EmployeeId",
      "LeaveTypeId",
      "NoOfDays",
      "LeaveStatusId",
    ];
    var obj = this.LeaveStatuses.filter((f:any) => f.MasterDataName.toLowerCase() == "approved");
    var _ApprovedId = 0;
    if (obj.length > 0)
      _ApprovedId = obj[0].MasterDataId;

    list.PageName = this.EmployeeLeaveListName;
    list.filter = [this.FilterOrgSubOrgBatchId + //" and EmployeeId eq " + _employeeId +
      " and LeaveStatusId eq " + _ApprovedId + " and Active eq 1"];

    return this.dataservice.get(list);

  }
  UpdateOrSave(row) {

    //debugger;

    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let checkFilterString = this.FilterOrgSubOrg + " and LeaveNameId eq " + row.LeaveNameId +
      " and EmployeeId eq " + this.searchForm.get("searchEmployee")?.value

    if (row.LeaveBalanceId > 0)
      checkFilterString += " and LeaveBalanceId ne " + row.LeaveBalanceId;

    let list: List = new List();
    list.fields = ["LeaveBalanceId"];
    list.PageName = this.LeaveBalanceListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.LeaveBalanceData.LeaveBalanceId = row.LeaveBalanceId;
          this.LeaveBalanceData.EmployeeId = row.EmployeeId;
          this.LeaveBalanceData.OB = row.OB;
          this.LeaveBalanceData.Adjusted = row.Adjusted;
          this.LeaveBalanceData.CB = row.CB;
          this.LeaveBalanceData.LeavePolicyId = row.LeavePolicyId;
          this.LeaveBalanceData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.LeaveBalanceData.SubOrgId = this.SubOrgId;
          this.LeaveBalanceData.BatchId = this.SelectedBatchId;
          this.LeaveBalanceData.Active = row.Active;

          ////console.log('data', this.LeaveBalanceData);
          if (this.LeaveBalanceData.LeaveBalanceId == 0) {
            this.LeaveBalanceData["CreatedDate"] = new Date();
            this.LeaveBalanceData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.LeaveBalanceData["UpdatedDate"] = new Date();
            delete this.LeaveBalanceData["UpdatedBy"];
            //////console.log('exam slot', this.ExamStudentSubjectResultData)
            this.insert(this.LeaveBalanceData);
          }
          else {
            delete this.LeaveBalanceData["CreatedDate"];
            delete this.LeaveBalanceData["CreatedBy"];
            this.LeaveBalanceData["UpdatedDate"] = new Date();
            this.LeaveBalanceData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(list) {

    //debugger;
    this.dataservice.postPatch(this.LeaveBalanceListName, list, 0, 'post')
      .subscribe(
        (data: any) => {
          //row.LeaveBalanceId = data.LeaveBalanceId;
          this.loading = false; this.PageLoading = false;
          // this.rowCount+=1;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false; this.PageLoading=false;
          //   this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          // }
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {
    //////console.log("this.EmpComponentData", this.EmpComponentData);
    this.dataservice.postPatch(this.LeaveBalanceListName, this.LeaveBalanceData, this.LeaveBalanceData.LeaveBalanceId, 'patch')
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

  // checkall(value) {
  //   this.EmpComponentList.forEach(record => {
  //     if (value.checked)
  //       record.Active = 1;
  //     else
  //       record.Active = 0;
  //     record.Action = !record.Action;
  //   })
  // }
  // saveall() {
  //   this.EmpComponentList.forEach(record => {
  //     if (record.Action == true) {
  //       this.UpdateOrSave(record);
  //     }
  //   })
  // }
  onBlur(element, event) {
    //debugger;
    //var _colName = event.srcElement.name;
    ////console.log("event", event);
    //var row = this.StoredForUpdate.filter((s:any) => s.SubjectMarkComponent == _colName && s.StudentClassSubjectId == element.StudentClassSubjectId);
    //row[0][_colName] = element[_colName];
  }

  // UpdateAll() {
  //   this.EmpComponentList.forEach(element => {
  //     this.SaveRow(element);
  //   })
  // }
  SaveRow(element) {
    //debugger;
    this.loading = true;
    this.rowCount = 0;

  }
  GetMasterData() {

    // this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SubOrgId, this.SelectedApplicationId)
    //   .subscribe((data: any) => {
        //debugger;
        this.allMasterData = this.tokenStorage.getMasterData()!;//[...data.value];
        //this.OpenAdjustCloseLeaves = this.getDropDownData(globalconstants.MasterDefinitions.leave.OPENADJUSTCLOSE);
        //this.OpenAdjustCloseLeaves.sort((a, b) => a.Sequence - b.Sequence);
        this.Leaves = this.getDropDownData(globalconstants.MasterDefinitions.leave.EMPLOYEELEAVE);
        this.Leaves.sort((a, b) => a.Sequence - b.Sequence);
        this.LeaveStatuses = this.getDropDownData(globalconstants.MasterDefinitions.leave.LEAVESTATUS);
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

        this.GetEmployees();
        this.GetLeavePolicy();
     // });
  }
  GetLeavePolicy() {
    debugger;
    //var orgIdAndBatchSearchstr = 'BatchId eq ' + this.SelectedBatchId + ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    this.loading = true;
    let list: List = new List();

    list.fields = [
      "LeavePolicyId",
      "LeaveNameId",
      "BatchId",
      "FormulaOrDays"];
    list.PageName = "LeavePolicies";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.LeavePolicies = data.value.map(m => {
          m.Leave = this.Leaves.filter(l => l.MasterDataId == m.LeaveNameId)[0].MasterDataName;
          m.Year = this.Batches.filter(b => b.BatchId == m.BatchId)[0].BatchName;
          return m;
        });
        this.loading = false; this.PageLoading = false;
      })

  }
  RegularizeLeave(mode) {
    debugger;
    this.loading = true;

    var source = [this.GetEmployeeLeave(), this.GetCurrentEmployeeVariableData(), this.GetLeaveBalance()];
    forkJoin(source)
      //this.GetCurrentEmployeeVariableData()
      .subscribe((data: any) => {

        var _empLeaves = alasql("select EmployeeId,LeaveTypeId,sum(NoOfDays) LeaveDays from ? group by EmployeeId,LeaveTypeId", [data[0].value]);
        this.EmployeeLeaveList = [];
        this.EmployeeLeaveList = [..._empLeaves];
        var existingdata;
        this.StoredForUpdate = [];
        var employeeVariable: any = {};
        var employees = [...data[1].value];
        this.RawLeaveBalance = [...data[2].value];
        ////console.log("employee", employees);
        var _NoOfMonths = 0;
        var _NoOfYears = 0;
        var _Age = 0;
        var _sessionStartEnd = JSON.parse(this.tokenStorage.getSelectedBatchStartEnd()!);
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

          this.LeavePolicies.forEach(pol => {
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
              && d.EmployeeId == item.Employee.EmpEmployeeId);
            // && d.BatchId == this.SelectedBatchId);

            if (existingdata.length > 0) {
              existingdata.forEach(ex => {
                ex.Leave = pol.Leave;
                ex.Year = pol.Year;
                ex.Employee = item.Employee.EmployeeCode + "-" + item.Employee.FirstName + (item.Employee.LastName ? ' ' + item.Employee.LastName : '' );
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
              var _lastName = item.Employee.LastName ? ' ' + item.Employee.LastName : '';
              if (pol.BatchId == this.SelectedBatchId) {
                var newdata = {
                  LeaveBalanceId: 0,
                  Employee:item.Employee.EmployeeCode +"-"+ item.Employee.FirstName + _lastName,
                  Year: pol.Year,
                  Leave: pol.Leave,
                  EmployeeId: item.Employee.EmpEmployeeId,
                  DepartmentId: item.DepartmentId,
                  LeavePolicyId: pol.LeavePolicyId,
                  BatchId: this.SelectedBatchId,
                  OB: _NoOfDays,
                  Adjusted: 0,
                  CB: _NoOfDays,
                  Active: 1,
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
        if (mode == 'update') {
          this.StoredForUpdate.forEach(leave => {
            var latestLeavecount = this.EmployeeLeaveList.filter(r => r.LeaveTypeId == leave.LeavePolicyId
              && r.EmployeeId == leave.EmployeeId);

            if (latestLeavecount.length > 0) {
              leave.Adjusted = latestLeavecount[0].LeaveDays;
              leave.CB = leave.OB - latestLeavecount[0].LeaveDays;
            }
            // else {
            //   leave.CB = leave.OB;
            // }
          })

          this.insert(this.StoredForUpdate);
        }
        else if (mode == 'read') {
          if (this.RawLeaveBalance.length == 0)
            this.contentservice.openSnackBar("No record found.", globalconstants.ActionText, globalconstants.RedBackground);
          this.loading = false;
          this.RawLeaveBalance = this.RawLeaveBalance.sort((a, b) => b.BatchId - a.BatchId);

          this.dataSource = new MatTableDataSource<any>(this.RawLeaveBalance);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      })
  }
  GetCurrentEmployeeVariableData() {
    var _DepartmentId = this.searchForm.get("searchDepartmentId")?.value;
    var _employeeId = this.searchForm.get("searchEmployee")?.value.EmployeeId;

    //var orgIdSearchstr = ' and OrgId eq ' + OrgId;
    var searchfilter = '';
    if (_employeeId > 0)
      searchfilter = " and EmployeeId eq " + _employeeId
    if (_DepartmentId > 0)
      searchfilter += " and DepartmentId eq " + _DepartmentId

    let list: List = new List();

    list.fields = ["DesignationId,WorkAccountId,JobTitleId,DepartmentId,EmpGradeId,EmployeeId"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["Employee($SELECT=EmpEmployeeId,EmployeeCode,FirstName,LastName,ShortName,GenderId,PresentAddressCountryId,PresentAddressStateId,DOB,DOJ,CategoryId,EmploymentStatusId,EmploymentTypeId,NatureId,ConfirmationDate,MaritalStatusId)"];
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1 and IsCurrent eq 1" + searchfilter];
    return this.dataservice.get(list);
  }
  Batches :any[]= [];
  getBatches() {

    var list = new List();
    list.fields = [
      "BatchId",
      "BatchName",
      "StartDate",
      "EndDate",
      "CurrentBatch",
      "Active"];
    list.PageName = "Batches";

    list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] + " and Active eq 1"];
    this.dataservice.get(list).subscribe((data: any) => {
      this.Batches = [...data.value];
    })
  }
  getMasterText(arr, itemId) {
    var filtered = arr.filter((f:any) => f.MasterDataId == itemId);
    if (filtered.length > 0)
      return filtered[0].MasterDataName;
    else
      return '';
  }
  GetEmployees() {
    this.loading = true;
    //var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

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
        this.loading = false; this.PageLoading = false;
        //////console.log("employeeid", this.searchForm.get("searchEmployee")?.value.EmployeeId)
        //this.GetGradeComponents();
      })

  }
  GetEmployeeHistory() {
    this.loading = true;
    var orgIdSearchstr = globalconstants.getOrgSubOrgFilter(this.tokenStorage);// 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var _employeeId = 0;
    var EmployeeFilter = '';
    var _DepartmentId = this.searchForm.get("searchDepartmentId")?.value;
    _employeeId = this.searchForm.get("searchEmployee")?.value.EmployeeId;
    if (_employeeId) {
      EmployeeFilter = " and EmployeeId eq " + _employeeId;
    }
    if (_DepartmentId > 0) {
      EmployeeFilter += " and DepartmentId eq " + _DepartmentId;
    }
    let list: List = new List();
    list.fields = [
      "EmployeeGradeHistoryId",
      "EmployeeId",
      "DepartmentId"
    ];

    list.PageName = "EmpEmployeeGradeSalHistories";
    list.filter = [orgIdSearchstr + EmployeeFilter];
    //list.orderBy = "ParentId";
    //this.LeaveBalanceList :any[]= [];
    return this.dataservice.get(list);
  }
  GetLeaveBalance() {
    debugger;
    this.loading = true;
    var orgIdSearchstr = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);// 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var _employeeId = 0;
    var EmployeeFilter = '';
    var _DepartmentId = this.searchForm.get("searchDepartmentId")?.value;
    _employeeId = this.searchForm.get("searchEmployee")?.value.EmployeeId;
    if (_employeeId) {
      EmployeeFilter = " and EmployeeId eq " + _employeeId;
    }
    if (_DepartmentId > 0) {
      EmployeeFilter += " and DepartmentId eq " + _DepartmentId;
    }
    let list: List = new List();
    list.fields = [
      "LeaveBalanceId",
      "EmployeeId",
      "DepartmentId",
      "LeavePolicyId",
      "OB",
      "Adjusted",
      "CB",
      "Active"
    ];

    list.PageName = this.LeaveBalanceListName;
    list.filter = [orgIdSearchstr + EmployeeFilter];
    //list.orderBy = "ParentId";
    //this.LeaveBalanceList :any[]= [];
    return this.dataservice.get(list);
    //var sources = [this.dataservice.get(list), this.GetEmployeeHistory()];
    // forkJoin(sources)
    //   .subscribe((data: any) => {
    //     this.RawLeaveBalance :any[]= [];
    //     var _LeaveBalance = data[0].value;
    //     var _EmployeeHistory = data[1].value;
    //     _LeaveBalance.forEach(f => {
    //       var _history = _EmployeeHistory.filter(e => e.EmployeeId == f.EmployeeId);
    //       var _employee = this.Employees.filter(e => e.EmployeeId == f.EmployeeId);
    //       if (_history.length > 0 && _employee.length > 0) {
    //         f.Leave = this.LeavePolicies.filter(p => p.LeavePolicyId == f.LeavePolicyId)[0].Leave;
    //         f.Employee = _employee[0].Name;
    //         this.RawLeaveBalance.push(f);
    //       }
    //     })

    //     if (this.RawLeaveBalance.length == 0)
    //       this.contentservice.openSnackBar("No record found.", globalconstants.ActionText, globalconstants.RedBackground);
    //     //this.GetCurrentEmployeeVariableData(_employeeId, _DepartmentId, this.FilterOrgSubOrg);


    //     this.loading = false;
    //     this.dataSource = new MatTableDataSource<any>(this.RawLeaveBalance);
    //     this.dataSource.paginator = this.paginator;
    //     this.dataSource.sort = this.sort;

    //   })
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
export interface ILeaveBalance {
  LeaveBalanceId: number;
  EmployeeId: number;
  LeavePolicyId: number;
  Leave: string;
  NoOfDays: number;
  Active: number;
  Action: boolean;
}
// export interface IMonth{
//   val:number;
//   monthName:string;
// }