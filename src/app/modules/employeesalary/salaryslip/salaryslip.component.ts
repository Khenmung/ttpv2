import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import * as moment from 'moment';
import { Observable, forkJoin } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-salaryslip',
  templateUrl: './salaryslip.component.html',
  styleUrls: ['./salaryslip.component.scss']
})
export class SalaryslipComponent implements OnInit {
  PageLoading = true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  FilterOrgSubOrg = '';
  loading = false;
  rowCount = 0;
  //Month = 0;
  CurrentEmployee = [];
  EmpComponents: IEmpComponent[] = [];
  SelectedBatchId = 0;
  SubOrgId = 0;
  //StoredForUpdate = [];
  Months = [];
  EmployeeVariables = [];
  VariableConfigs = [];
  BasicSalary = 0;
  Employees = [];
  Grades = [];
  Departments = [];
  WorkAccounts = [];
  Designations = [];
  JobTitles = [];
  Genders = [];
  City = [];
  Countries = [];
  States = [];
  BloodGroups = [];
  Religions = [];
  Categories = [];
  Locations = [];
  EmploymentStatus = [];
  EmploymentTypes = [];
  Natures = [];
  MaritalStatus = [];
  SalaryComponents = [];
  ComponentTypes = [];
  VariableTypes = [];
  EarnedDataSource: MatTableDataSource<IEmployeeSalaryComponent>;
  DeductionDataSource: MatTableDataSource<IEmployeeSalaryComponent>;
  allMasterData = [];
  filteredOptions: Observable<IEmployee[]>;
  EarnedSalary = [];
  DeductionSalary = [];
  EarnedTotal = 0;
  DeductionTotal = 0;
  NetIncome = 0;
  displayedColumns = [
    "SlNo",
    "SalaryComponent",
    "Amount",
  ];
  DeductionDisplayedColumns = [
    "SalaryComponent",
    "Amount",
  ];
  Permission = '';
  searchForm: UntypedFormGroup;
  SelectedApplicationId = 0;
  SalarySlipHeader = [];
  Organization = [];
  logourl = '';
  MonthYear = '';
  constructor(
    private servicework: SwUpdate,
    private contentService: ContentService,
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
    //var thisyear = new Date().getFullYear();
    this.searchForm = this.fb.group({
      searchEmployee: [''],
      searchMonth: [0],
      searchDepartment: [0]
      // searchYear: [thisyear, [Validators.min(2020), Validators.max(2050)]]
    });

    this.PageLoad();
    this.Months = this.contentService.GetSessionFormattedMonths();
    this.filteredOptions = this.searchForm.get("searchEmployee").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Employees.slice())
      );

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
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.SALARY);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission == 'deny') {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        //this.getVariablesText();
        //this.GetVariableConfigs();

        this.GetMasterData();
      }
    }
  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SubOrgId, this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.school.BATCH);
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
        this.SalarySlipHeader = this.getDropDownData(globalconstants.MasterDefinitions.employee.SALARYSLIPHEADER);
        //this.loading = false; this.PageLoading=false;

        this.GetEmployees();
        this.GetEmpComponents();
        this.GetOrganization();
      });
  }
  GetOrganization() {

    let list: List = new List();
    list.fields = [
      "OrganizationId",
      "OrganizationName",
      "LogoPath",
      "Address",
      "CityId",
      "StateId",
      "CountryId",
      "WebSite",
      "Contact",
      "RegistrationNo",
      "ValidFrom",
      "ValidTo"

    ];
    list.PageName = "Organizations";
    list.filter = ["OrganizationId eq " + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((org: any) => {
        this.Organization = org.value.map(m => {
          //m.CountryName = '';
          var countryObj = this.allMasterData.filter(f => f.MasterDataId == m.CountryId);
          if (countryObj.length > 0)
            m.Country = countryObj[0].MasterDataName;

          var stateObj = this.allMasterData.filter(f => f.MasterDataId == m.StateId);
          if (stateObj.length > 0)
            m.State = stateObj[0].MasterDataName;

          var cityObj = this.allMasterData.filter(f => f.MasterDataId == m.CityId);
          if (cityObj.length > 0)
            m.City = cityObj[0].MasterDataName;

          return [{
            name: "OrganizationId", val: m.OrganizationId
          }, {
            name: "Organization", val: m.OrganizationName
          }, {
            name: "LogoPath", val: m.LogoPath
          }, {
            name: "Address", val: m.Address
          }, {
            name: "City", val: m.City
          }, {
            name: "State", val: m.State
          }, {
            name: "Country", val: m.Country
          }, {
            name: "Contact", val: m.Contact
          }, {
            name: "RegistrationNo", val: m.RegistrationNo == null ? '' : m.RegistrationNo
          }, {
            name: "ValidFrom", val: m.ValidFrom
          }, {
            name: "ValidTo", val: m.ValidTo
          },
          {
            name: "WebSite", val: m.WebSite == null ? '' : m.WebSite
          },
          {
            name: "ToDay", val: moment(new Date()).format("DD/MM/YYYY")
          }
          ]
        })
        //console.log("this.Organization",this.Organization);
        //console.log("this.CommonHeader.",this.CommonHeader);
        var imgobj = this.SalarySlipHeader.filter(f => f.MasterDataName == 'img');
        if (imgobj.length > 0) {
          this.logourl = imgobj[0].Description;
        }
        this.SalarySlipHeader = this.SalarySlipHeader.filter(f => f.MasterDataName != 'img');
        //console.log("this.commonheadersetting.",commonheadersetting);
        this.SalarySlipHeader.forEach(header => {
          this.Organization[0].forEach(orgdet => {
            header.Description = header.Description.replaceAll("[" + orgdet.name + "]", orgdet.val);
          })
        })
        this.loading = false;
        this.PageLoading = false;
      });
  }
  GetVariableConfigs() {

    //var orgIdSearchstr = this.FilterOrgSubOrg;// ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    //var variabletypeId = this.VariableTypes.filter(f => f.MasterDataName.toLowerCase() == 'payroll')[0].MasterDataId;
    let list: List = new List();

    list.fields = [
      "VariableName",
      "VariableFormula"
    ];

    list.PageName = "VariableConfigurations";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];// and VariableTypeId eq " + variabletypeId];
    //list.orderBy = "ParentId";
    this.VariableConfigs = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(f => {
          this.VariableConfigs.push({
            "VariableName": f.VariableName, "VariableAmount": f.VariableFormula
          });
        })
      })
    //console.log('this.VariableConfigs', this.VariableConfigs);
  }
  GetEmpComponents() {

    //var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = [
      "EmpSalaryComponentId",
      "SalaryComponent",
      "ComponentTypeId",
      "Active"
    ];

    list.PageName = "EmpComponents";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];
    //list.orderBy = "ParentId";
    this.EmpComponents = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(m => {
          var obj = this.ComponentTypes.filter(f => f.MasterDataId == m.ComponentTypeId)
          if (obj.length > 0) {
            m.Component = obj[0].MasterDataName;
            this.EmpComponents.push(m);
          }
        })
        this.loading = false;
        this.PageLoading = false;
      })
  }
  EmployeeVariable = [];
  Employee: any = {}
  GetEmployeeSalaryComponents(mode) {
    var filterstr = this.FilterOrgSubOrg;

    var _employeeObj = this.searchForm.get("searchEmployee").value;
    var _employeeId = _employeeObj.EmployeeId;


    // if (!_employeeId && mode == 'read') {
    //   this.contentService.openSnackBar("Please select employee.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    // else 

    var _Month = this.searchForm.get("searchMonth").value;
    if (_Month == 0) {
      this.contentService.openSnackBar("Please select month.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _departmentId = this.searchForm.get("searchDepartment").value;
    if (!_departmentId && mode == 'update') {
      this.contentService.openSnackBar("Please select department.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else if (_departmentId)
      filterstr += " and DepartmentId eq " + _departmentId;
    if (_employeeId) {
      filterstr += " and EmployeeId eq " + _employeeId;
      this.Employee.Name = _employeeObj.Name;
      this.Employee.PFAccountNo = _employeeObj.PFAccountNo;
      this.Employee.BankAccountNo = _employeeObj.BankAccountNo;
      this.Employee.PAN = _employeeObj.PAN;

      let obj = this.Months.filter(m => m.val == _Month)
      if (obj.length > 0)
        this.Employee.MonthYear = obj[0].MonthName;
    }
    filterstr += ' and Month eq ' + _Month


    this.loading = true;
    //console.log("Month", this.Month);
    let list: List = new List();

    list.fields = [
      "EmployeeSalaryComponentId",
      "EmployeeId",
      "EmpComponentId",
      "DepartmentId",
      "Month",
      "Amount",
      "Active"
    ];

    list.PageName = "EmpEmployeeSalaryComponents";
    list.filter = [filterstr];

    var sources = [this.dataservice.get(list), this.GetEmployeeVariables(mode)]
    forkJoin(sources)
      .subscribe((data: any) => {
        debugger;
        ///////////////////
        //console.log("data[0].value", data[0].value)
        var _EmpSalaryComponents = [...data[0].value];
        var _EmpVariables = [...data[1].value];
        this.EarnedSalary = [];
        var _deduction = [];
        var _data = {};
        var _earnedIndx = 0, _deductionIndx = 0;
        _EmpVariables.forEach(emp => {
          _data = {};
          this.Employee.Department = this.Departments.filter(d => d.MasterDataId == emp.DepartmentId)[0].MasterDataName;
          this.Employee.Designation = this.Designations.filter(d => d.MasterDataId == emp.DesignationId)[0].MasterDataName;
          this.Employee.Grade = this.Grades.filter(d => d.MasterDataId == emp.EmpGradeId)[0].MasterDataName;
          this.EmpComponents.forEach((ec: any, indx) => {

            var existing = _EmpSalaryComponents.filter(e => e.EmpComponentId == ec.EmpSalaryComponentId
              && e.EmployeeId == emp.EmployeeId
              && e.Month == _Month);

            if (existing.length > 0 && ec.Component.toLowerCase() == 'earned') {
              _earnedIndx += 1;
              _data = {
                SlNo: _earnedIndx,
                SalaryComponent: ec.SalaryComponent,
                Amount: existing[0].Amount,
              }
              this.EarnedSalary.push(_data);

            }
            else {
              if (existing.length > 0 && ec.Component.toLowerCase() == 'deduction') {
                _deductionIndx += 1;
                _data = {
                  SlNo: _deductionIndx,
                  SalaryComponent: ec.SalaryComponent,
                  Amount: existing[0].Amount,
                }
                _deduction.push(_data);

              }
            }
          })
        })
        var diff = this.EarnedSalary.length - _deduction.length;
        for (let i = 0; i < diff; i++) {
          //_deductionIndx +=1;
          _data = {
            SalaryComponent: '',
            Amount: '',
          }
          _deduction.push(_data);
        }
        this.EarnedTotal = this.EarnedSalary.reduce((acc, current) => acc + current.Amount, 0);
        this.DeductionTotal = _deduction.reduce((acc, current) => acc + +current.Amount, 0);
        this.NetIncome = this.EarnedTotal - this.DeductionTotal;

        this.EarnedDataSource = new MatTableDataSource<IEmployeeSalaryComponent>(this.EarnedSalary);
        this.DeductionDataSource = new MatTableDataSource<IEmployeeSalaryComponent>(_deduction);
        this.loading = false;
        this.PageLoading = false;
      })
  }

  GetEmployees() {

    //var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = [
      "EmpEmployeeId",
      "EmployeeCode",
      "FirstName",
      "LastName",
      "PFAccountNo",
      "BankAccountNo",
      "PAN"
    ];
    list.PageName = "EmpEmployees";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        this.Employees = data.value.map(m => {
          var _lastname = m.LastName == null ? '' : " " + m.LastName;
          m.EmployeeId = m.EmpEmployeeId;
          m.Name = m.EmployeeCode + "-" + m.FirstName + _lastname;
          return m;

        })

      })
  }
  GetEmployeeVariables(mode) {

    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var searchfilter = this.FilterOrgSubOrg;
    var _employeeId = this.searchForm.get("searchEmployee").value.EmployeeId;
    // if (mode == 'read' && !_employeeId) {
    //   this.contentService.openSnackBar("Please select employee.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return [];
    // }
    // else 
    if (_employeeId)
      searchfilter += " and EmployeeId eq " + _employeeId;

    var _departmentId = this.searchForm.get("searchDepartment").value;
    if (mode == 'update' && !_departmentId) {
      this.contentService.openSnackBar("Please select department.", globalconstants.ActionText, globalconstants.RedBackground);
      return [];
    }
    if (_departmentId)
      searchfilter += " and DepartmentId eq " + _departmentId;

    let list: List = new List();

    list.fields = ["EmployeeId,EmpGradeId,DepartmentId,WorkAccountId,JobTitleId,DesignationId,CTC"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.filter = [searchfilter + " and Active eq 1 and IsCurrent eq 1"];
    return this.dataservice.get(list);
  }
  getMasterText(arr, itemId) {
    var filtered = arr.filter(f => f.MasterDataId == itemId);
    if (filtered.length > 0)
      return filtered[0].MasterDataName;
    else
      return '';
  }
  getVariablesText() {
    this.EmployeeVariables = [...globalconstants.MasterDefinitions.EmployeeVariableName];
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
export interface IEmployeeSalaryComponent {
  EmployeeSalaryComponentId: number;
  EmployeeId: number;
  EmpComponentId: number;
  ActualFormulaOrAmount: string;
  FormulaOrAmount: number;
  Month: number;
  Amount: number;
  Active: number;
  Action: boolean;
}
export interface IEmpComponent {
  EmpSalaryComponentId: number;
  SalaryComponent: string;
  FormulaOrAmount: number;
}
export interface IEmployee {
  EmployeeId: number;
  Name: string;
}

