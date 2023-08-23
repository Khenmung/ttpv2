import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { evaluate } from 'mathjs';
import { ContentService } from '../../../shared/content.service';

@Component({
  selector: 'app-employee-salary-component',
  templateUrl: './employee-salary-component.component.html',
  styleUrls: ['./employee-salary-component.component.scss'],
})
export class EmployeeSalaryComponentComponent implements OnInit {
  PageLoading = true;
  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  FilterOrgSubOrg = '';
  loading = false;
  rowCount = 0;
  //Month = 0;
  CurrentEmployee :any[]= [];
  EmpComponents: IEmpComponent[]= [];
  SelectedBatchId = 0;
  SubOrgId = 0;
  //StoredForUpdate :any[]= [];
  Months :any[]= [];
  EmployeeVariables :any[]= [];
  VariableConfigs :any[]= [];
  BasicSalary = 0;
  Employees :any[]= [];
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
  SalaryComponents :any[]= [];
  ComponentTypes :any[]= [];
  VariableTypes :any[]= [];
  dataSource: MatTableDataSource<IEmployeeSalaryComponent>;
  allMasterData :any[]= [];
  filteredOptions: Observable<IEmployee[]>;
  EmployeeSalaryComponentList :any[]= [];
  EmployeeSalaryComponentToSave :any[]= [];
  EmployeeSalaryComponentData = {
    EmployeeSalaryComponentId: 0,
    EmployeeId: 0,
    DepartmentId: 0,
    EmpComponentId: 0,
    ActualFormulaOrAmount: '',
    Month: 0,
    OrgId: 0, 
    BatchId:0,
    SubOrgId: 0,
    Amount: 0,
    Active: 1
  };
  displayedColumns = [
    "SalaryComponent",
    "FormulaOrAmount",
    "ActualFormulaOrAmount",
    "Description",
    "Amount",
    "Active",
    "Action"
  ];
  Permission = '';
  searchForm: UntypedFormGroup;
  SelectedApplicationId = 0;
  constructor(private servicework: SwUpdate,
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
    this.filteredOptions = this.searchForm.get("searchEmployee")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Employees.slice())
      )!;

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
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employeesalary.SALARYCOMPONENT);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission == 'deny') {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.getVariablesText();
        this.GetVariableConfigs();
        this.GetMasterData();
      }
    }
  }

  updateActive(row, value) {
    //if(!row.Action)
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
    this.onBlur(row, value);
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

    //debugger;

    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let checkFilterString = this.FilterOrgSubOrg + " and EmployeeId eq " + this.searchForm.get("searchEmployee")?.value.EmployeeId +
      " and EmpComponentId eq " + row.EmpComponentId +
      " and Month eq " + row.Month

    if (row.EmployeeSalaryComponentId > 0)
      checkFilterString += " and EmployeeSalaryComponentId ne " + row.EmployeeSalaryComponentId;
    //checkFilterString += " and " + this.StandardFilter;

    let list: List = new List();
    list.fields = ["EmployeeSalaryComponentId"];
    list.PageName = "EmpEmployeeSalaryComponents";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.EmployeeSalaryComponentData.EmployeeSalaryComponentId = row.EmployeeSalaryComponentId;
          this.EmployeeSalaryComponentData.Month = row.Month;
          this.EmployeeSalaryComponentData.ActualFormulaOrAmount = row.ActualFormulaOrAmount.toString();
          this.EmployeeSalaryComponentData.EmployeeId = row.EmployeeId;
          this.EmployeeSalaryComponentData.DepartmentId = row.DepartmentId;
          this.EmployeeSalaryComponentData.Active = row.Active;
          this.EmployeeSalaryComponentData.Amount = row.Amount;
          this.EmployeeSalaryComponentData.BatchId=this.SelectedBatchId,
          this.EmployeeSalaryComponentData.EmpComponentId = row.EmpComponentId;
          this.EmployeeSalaryComponentData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.EmployeeSalaryComponentData.SubOrgId = this.SubOrgId;

          if (this.EmployeeSalaryComponentData.EmployeeSalaryComponentId == 0) {
            this.EmployeeSalaryComponentData["CreatedDate"] = new Date();
            this.EmployeeSalaryComponentData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmployeeSalaryComponentData["UpdatedDate"] = new Date();
            delete this.EmployeeSalaryComponentData["UpdatedBy"];
            
            this.EmployeeSalaryComponentToSave.push(this.EmployeeSalaryComponentData)
            console.log('EmployeeSalaryComponentData', this.EmployeeSalaryComponentData)
            this.insert(row);
          }
          else {
            delete this.EmployeeSalaryComponentData["CreatedDate"];
            delete this.EmployeeSalaryComponentData["CreatedBy"];
            this.EmployeeSalaryComponentData["UpdatedDate"] = new Date();
            this.EmployeeSalaryComponentData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('EmpEmployeeSalaryComponents', this.EmployeeSalaryComponentToSave, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmployeeSalaryComponentId = data.EmployeeSalaryComponentId;
          this.loading = false; this.PageLoading = false;
          row.Action = false;
          this.VariableConfigs.push({ "VariableName": row.SalaryComponent, "VariableAmount": row.Amount });
          // this.rowCount+=1;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false; this.PageLoading=false;
          //   this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          // }
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch('EmpEmployeeSalaryComponents', this.EmployeeSalaryComponentData, this.EmployeeSalaryComponentData.EmployeeSalaryComponentId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.Action = false;
          var vartoUpdate = this.VariableConfigs.filter((f:any) => f.VariableName == row.VariableName);
          if (vartoUpdate.length > 0)
            vartoUpdate[0].VariableAmount = row.Amount;
          // this.rowCount+=1;
          // if (this.rowCount == this.displayedColumns.length - 2) {
          //   this.loading = false; this.PageLoading=false;
          //   this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          // }
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }

  // checkall(value) {
  //   this.GradeComponentList.forEach(record => {
  //     if (value.checked)
  //       record.Active = 1;
  //     else
  //       record.Active = 0;
  //     record.Action = !record.Action;
  //   })
  // }
  // saveall() {
  //   this.GradeComponentList.forEach(record => {
  //     if (record.Action == true) {
  //       this.UpdateOrSave(record);
  //     }
  //   })
  // }
  TotalAmount = 0;
  onBlur(element, event) {
    debugger;
    //var _colName = event.srcElement.name;
    var formula = element["ActualFormulaOrAmount"];
    if (formula.length == 0)
      formula = element["FormulaOrAmount"];
    element["Amount"] = this.resolveFormula(formula, element.EmployeeId);//_amount;
    this.TotalAmount = this.EmployeeSalaryComponentList.reduce((acc, current) => acc + current.Amount, 0)
    element.Action = true;
  }
  resolveFormula(formula, pEmployeeId) {
    //employee detail must be replaced first.
    var _employeeVariable = this.EmployeeVariable.filter((f:any) => f.EmployeeId == pEmployeeId)[0].data;
    _employeeVariable.forEach(f => {
      if (formula.includes("["+f.VariableName+"]"))
        formula = formula.replaceAll("["+f.VariableName+"]", f.VariableAmount);
    })
    var _variableConfigs = JSON.parse(JSON.stringify(this.VariableConfigs));

    //replacing variable config with employee variables.
    _variableConfigs.forEach(va => {
      if (isNaN(va.VariableAmount)) {
        var indx = _employeeVariable.findIndex(emp => va.VariableAmount.includes(emp.VariableName));
        if (indx > -1) {
          if (isNaN(_employeeVariable[indx].VariableAmount))
            va.VariableAmount = va.VariableAmount.replaceAll('[' + _employeeVariable[indx].VariableName + ']', "'" + _employeeVariable[indx].VariableAmount + "'")
          else
            va.VariableAmount = va.VariableAmount.replaceAll('[' + _employeeVariable[indx].VariableName + ']', _employeeVariable[indx].VariableAmount)
        }
      }
    })
    //replacing variable config amount with other variable config names.
    var searchinconfig = JSON.parse(JSON.stringify(_variableConfigs));

    _variableConfigs.forEach(va => {
      if (isNaN(va.VariableAmount)) {
        var indx = searchinconfig.findIndex(f => va.VariableAmount.includes(f.VariableName));
        if (indx > -1) {
          //if (isNaN(searchinconfig[indx].VariableAmount))
          va.VariableAmount = va.VariableAmount.replaceAll('[' + searchinconfig[indx].VariableName + ']', evaluate(searchinconfig[indx].VariableAmount))
          //else
          //  va.VariableAmount = va.VariableAmount.replaceAll('[' + searchinconfig[indx].VariableName + ']', searchinconfig[indx].VariableAmount)
        }
      }
    })

    _variableConfigs.forEach(f => {
      if (formula.includes('[' + f.VariableName + ']'))
        formula = formula.replaceAll('[' + f.VariableName + ']', evaluate(f.VariableAmount));
    })
    //formula.indexOf(i=>)
    return evaluate(formula);
  }
  // UpdateAll() {
  //   this.GradeComponentList.forEach(element => {
  //     this.SaveRow(element);
  //   })
  // }
  // SaveRow(element) {
  //   //debugger;
  //   this.loading = true;
  //   this.rowCount = 0;
  //   //var columnexist;
  //   for (var prop in element) {

  //     var row: any = this.StoredForUpdate.filter((s:any) => s.SubjectMarkComponent == prop && s.StudentClassSubjectId == element.StudentClassSubjectId);

  //     if (row.length > 0 && prop != 'StudentClassSubject' && prop != 'Action') {
  //       row[0].Active = 1;
  //       row[0].Marks = row[0][prop];
  //       this.UpdateOrSave(row[0]);
  //     }

  //   }

  // }
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
        //this.loading = false; this.PageLoading=false;

        this.GetEmployees();
        this.GetEmpComponents();
      });
  }
  GetVariableConfigs() {

    //var orgIdSearchstr = this.FilterOrgSubOrg;// ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    //var variabletypeId = this.VariableTypes.filter((f:any) => f.MasterDataName.toLowerCase() == 'payroll')[0].MasterDataId;
    let list: List = new List();

    list.fields = [
      "VariableName",
      "VariableFormula"
    ];

    list.PageName = "VariableConfigurations";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];// and VariableTypeId eq " + variabletypeId];
    //list.orderBy = "ParentId";
    this.VariableConfigs= [];
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
      "FormulaOrAmount",
      "Active"
    ];

    list.PageName = "EmpComponents";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];
    //list.orderBy = "ParentId";
    this.EmpComponents = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //var _percentorAmount = '';
        this.EmpComponents = [...data.value];
        this.loading = false; this.PageLoading = false;
        //this.dataSource = new MatemTableDataSource<IEmployeeSalaryComponent>(this.GradeComponentList);
      })
  }
  EmployeeVariable :any[]= [];
  GetEmployeeSalaryComponents(mode) {
    var filterstr = this.FilterOrgSubOrg;
    var _employeeId = this.searchForm.get("searchEmployee")?.value.EmployeeId;
    // if (!_employeeId && mode == 'read') {
    //   this.contentService.openSnackBar("Please select employee.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    // else 
    if (_employeeId) {
      filterstr += " and EmployeeId eq " + _employeeId;
    }
    var _Month = this.searchForm.get("searchMonth")?.value;
    if (_Month == 0) {
      this.contentService.openSnackBar("Please select month.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _departmentId = this.searchForm.get("searchDepartment")?.value;
    if (!_departmentId && mode == 'update') {
      this.contentService.openSnackBar("Please select department.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else if (_departmentId)
      filterstr += " and DepartmentId eq " + _departmentId;

    filterstr += ' and Month eq ' + _Month
    this.loading = true;
    //console.log("Month", this.Month);
    let list: List = new List();

    list.fields = [
      "EmployeeSalaryComponentId",
      "EmployeeId",
      "EmpComponentId",
      "DepartmentId",
      "ActualFormulaOrAmount",
      "Description",
      "Month",
      "Amount",
      "Active"
    ];

    list.PageName = "EmpEmployeeSalaryComponents";
    list.filter = [filterstr];
    //list.orderBy = "ParentId";
    this.EmployeeSalaryComponentList = [];

    var sources = [this.dataservice.get(list), this.GetEmployeeVariables(mode)]
    forkJoin(sources)
      .subscribe((data: any) => {
        debugger;
        ///////////////////
        console.log("data[0].value",data[0].value)
        var _EmpSalaryComponents = [...data[0].value];
        var _EmpVariables = [...data[1].value];
        this.EmployeeVariable = [];
        _EmpVariables.forEach(item => {
          this.EmployeeVariable.push(
            {
              "EmployeeId": item.EmployeeId, data: [
                { "VariableName": "Grade", "VariableAmount": this.getMasterText(this.Grades, item.EmpGradeId) },
                { "VariableName": "Department", "VariableAmount": this.getMasterText(this.Departments, item.DepartmentId) },
                { "VariableName": "CTC", "VariableAmount": item.CTC },
                { "VariableName": "WorkAccount", "VariableAmount": this.getMasterText(this.WorkAccounts, item.WorkAccountId) },
                { "VariableName": "JobTitle", "VariableAmount": this.getMasterText(this.JobTitles, item.JobTitleId) },
                { "VariableName": "Designation", "VariableAmount": this.getMasterText(this.Designations, item.DesignationId) },
                { "VariableName": "Gender", "VariableAmount": this.getMasterText(this.Genders, item.Employee.GenderId) },
                { "VariableName": "DOB", "VariableAmount": item.Employee.DOB },
                { "VariableName": "DOJ", "VariableAmount": item.Employee.DOJ },
                { "VariableName": "City", "VariableAmount": this.getMasterText(this.City, item.Employee.PresentAddressCityId) },
                { "VariableName": "State", "VariableAmount": this.getMasterText(this.States, item.Employee.PresentAddressStateId) },
                { "VariableName": "Country", "VariableAmount": this.getMasterText(this.Countries, item.Employee.PresentAddressCountryId) },
                { "VariableName": "Category", "VariableAmount": this.getMasterText(this.Categories, item.Employee.CategoryId) },
                { "VariableName": "Religion", "VariableAmount": this.getMasterText(this.Religions, item.Employee.ReligionId) },
                { "VariableName": "EmploymentStatus", "VariableAmount": this.getMasterText(this.EmploymentStatus, item.Employee.EmploymentStatusId) },
                { "VariableName": "EmploymentType", "VariableAmount": this.getMasterText(this.EmploymentTypes, item.Employee.EmploymentTypeId) },
                { "VariableName": "Nature", "VariableAmount": this.getMasterText(this.Natures, item.Employee.NatureId) },
                { "VariableName": "ConfirmationDate", "VariableAmount": item.Employee.ConfirmationDate },
                { "VariableName": "MaritalStatus", "VariableAmount": this.getMasterText(this.MaritalStatus, item.Employee.MaritalStatusId) },
              ]
            })
        });
        ///////////////////////

        //var empDetailForVariable:any[]=[];
        _EmpVariables.forEach(emp => {
          //empDetailForVariable:any[]=[];
          this.EmpComponents.forEach(ec => {

            var existing = _EmpSalaryComponents.filter(e => e.EmpComponentId == ec.EmpSalaryComponentId
              && e.EmployeeId == emp.EmployeeId
              && e.Month == _Month);
            if (existing.length > 0) {
              this.EmployeeSalaryComponentList.push({
                EmployeeSalaryComponentId: existing[0].EmployeeSalaryComponentId,
                EmployeeId: existing[0].EmployeeId,
                DepartmentId: emp.DepartmentId,
                EmpComponentId: existing[0].EmpComponentId,
                SalaryComponent: ec.SalaryComponent,
                ActualFormulaOrAmount: existing[0].ActualFormulaOrAmount,
                Description:existing[0].Description,
                FormulaOrAmount: ec.FormulaOrAmount,
                Month: _Month,
                Amount: existing[0].Amount,
                Active: existing[0].Active,
                Action: false
              });
              var empVar = this.EmployeeVariable.filter(v=>v.EmployeeId == emp.EmployeeId)
              empVar[0].data.push({
                "VariableName": ec.SalaryComponent,
                "VariableAmount": existing[0].Amount
              })
            }
            else {
              this.EmployeeSalaryComponentList.push({
                EmployeeSalaryComponentId: 0,
                EmployeeId: emp["EmployeeId"],
                DepartmentId:emp.DepartmentId,
                EmpComponentId: ec.EmpSalaryComponentId,
                ActualFormulaOrAmount: '',
                Description:'',
                SalaryComponent: ec.SalaryComponent,
                FormulaOrAmount: ec.FormulaOrAmount,
                Month: _Month,
                Amount: 0,
                Active: 0,
                Action: false
              });
            }
          })
        })

        // }
        // else {
        //   this.contentservice.openSnackBar("Employee grade has to be defined", globalconstants.ActionText, globalconstants.RedBackground);
        // }
        this.TotalAmount = this.EmployeeSalaryComponentList.reduce((acc, current) => acc + current.Amount, 0)

        if (mode == 'read') {
          this.loading = false;
          this.PageLoading = false;

          this.dataSource = new MatTableDataSource<IEmployeeSalaryComponent>(this.EmployeeSalaryComponentList);
        }
        else {
          this.EmployeeSalaryComponentToSave = [];
          var formula = '';
          //console.log("before", this.EmployeeSalaryComponentList)
          this.EmployeeSalaryComponentList.forEach(sal => {
            formula = sal["ActualFormulaOrAmount"];
            if (formula.length == 0)
              formula = sal["FormulaOrAmount"];
            sal["Amount"] = this.resolveFormula(formula, sal.EmployeeId);//_amount;
            this.EmployeeSalaryComponentToSave.push({
              EmployeeSalaryComponentId: sal.EmployeeSalaryComponentId,
              EmployeeId: sal.EmployeeId,
              DepartmentId:sal.DepartmentId,
              EmpComponentId: sal.EmpComponentId,
              Month: sal.Month,
              ActualFormulaOrAmount: sal.ActualFormulaOrAmount.toString(),
              Description:sal.Description,
              Active: sal.EmployeeSalaryComponentId==0?1:sal.Active,
              Amount: sal.Amount,
              BatchId:this.SelectedBatchId,
              OrgId: this.LoginUserDetail[0]["orgId"],
              SubOrgId: this.SubOrgId,
            })
          })
          console.log("this.EmployeeSalaryComponentToSave", this.EmployeeSalaryComponentToSave);
          this.dataservice.postPatch('EmpEmployeeSalaryComponents', this.EmployeeSalaryComponentToSave, 0, 'post')
            .subscribe(
              (data: any) => {
                this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
                this.loading = false;
                this.PageLoading = false;
              });
        }
      })

  }

  GetEmployees() {

    //var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = [
      "EmpEmployeeId",
      "EmployeeCode",
      "FirstName",
      "LastName"
    ];
    list.PageName = "EmpEmployees";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        this.Employees = data.value.map(m => {
          var _lastname = m.LastName == null ? '' : " " + m.LastName;
          return {
            EmployeeId: m.EmpEmployeeId,
            Name: m.EmployeeCode + "-" + m.FirstName + _lastname
          }
        })

      })
  }
  GetEmployeeVariables(mode) {

    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var searchfilter = this.FilterOrgSubOrg;
    var _employeeId = this.searchForm.get("searchEmployee")?.value.EmployeeId;
    // if (mode == 'read' && !_employeeId) {
    //   this.contentService.openSnackBar("Please select employee.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return [];
    // }
    // else 
    if (_employeeId)
      searchfilter += " and EmployeeId eq " + _employeeId;

    var _departmentId = this.searchForm.get("searchDepartment")?.value;
    if (mode == 'update' && !_departmentId) {
      this.contentService.openSnackBar("Please select department.", globalconstants.ActionText, globalconstants.RedBackground);
      return [];
    }
    if (_departmentId)
      searchfilter += " and DepartmentId eq " + _departmentId;

    let list: List = new List();

    list.fields = ["EmployeeId,EmpGradeId,DepartmentId,WorkAccountId,JobTitleId,DesignationId,CTC"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["Employee($select=GenderId,DOB,DOJ,PresentAddressCityId,PresentAddressStateId,PresentAddressCountryId,CategoryId,ReligionId,EmploymentStatusId,EmploymentTypeId,NatureId,ConfirmationDate,MaritalStatusId)"];
    list.filter = [searchfilter + " and Active eq 1 and IsCurrent eq 1"];
    return this.dataservice.get(list);
    // .subscribe((data: any) => {
    //this.CurrentEmployee = 

    //console.log("v inside", this.VariableConfigs)
    //})
  }
  getMasterText(arr, itemId) {
    var filtered = arr.filter((f:any) => f.MasterDataId == itemId);
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
  Description:string;
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
