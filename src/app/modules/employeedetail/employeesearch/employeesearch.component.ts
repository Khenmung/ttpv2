import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TableUtil } from 'src/app/shared/TableUtil';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import * as XLSX from 'xlsx';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-employeesearch',
  templateUrl: './employeesearch.component.html',
  styleUrls: ['./employeesearch.component.scss']
})
export class EmployeesearchComponent implements OnInit { PageLoading=true;
  @ViewChild("table") tableRef: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  loading = false;
  Designations = [];
  filterOrgIdNBatchId = '';
  filterOrgIdOnly = '';
  filterBatchIdNOrgId = '';
  EmployeeData: IEmployee[];
  dataSource: MatTableDataSource<IEmployee>;
  displayedColumns = [
    'EmployeeCode',
    'Name',
    'Department',
    'Designation',
    'Grade',
    'Manager',
    'Active',
    'Action'];
  SelectedApplicationId = 0;
  allMasterData = [];
  Employees = [];
  Genders = [];
  Grades = [];
  Batches = [];
  Bloodgroup = [];
  Category = [];
  Religion = [];
  Departments = [];
  States = []
  PrimaryContact = [];
  Location = [];
  LanguageSubjUpper = [];
  LanguageSubjLower = [];
  UploadTypes = [];
  ReasonForLeaving = [];
  //StandardFilter ='';
  SelectedBatchId = 0;
  SubOrgId = 0;
  SelectedBatchEmpEmployeeIdRollNo = [];
  EmployeeClassId = 0;
  EmployeeSearchForm: UntypedFormGroup;
  filteredEmployees: Observable<IEmployee[]>;
  filteredEmployeeCode: Observable<IEmployee[]>;
  LoginUserDetail = [];
  Permission = '';
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private route: Router,

    private fb: UntypedFormBuilder,
    private shareddata: SharedataService,
    private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    //debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.EMPLOYEEDETAIL);
    if (perObj.length > 0)
      this.Permission = perObj[0].permission;
    if (this.Permission == 'deny') {
      this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
    }
    else {
      this.SubOrgId = this.tokenStorage.getSubOrgId();
      this.filterOrgIdOnly = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.filterBatchIdNOrgId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.EmployeeSearchForm = this.fb.group({
        searchemployeeName: [''],
        searchEmployeeCode: ['']
      })
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
     
      this.filteredEmployees = this.EmployeeSearchForm.get("searchemployeeName").valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.Name),
          map(Name => Name ? this._filter(Name) : this.Employees.slice())
        );
      this.filteredEmployeeCode = this.EmployeeSearchForm.get("searchEmployeeCode").valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.EmployeeCode),
          map(EmployeeCode => EmployeeCode ? this._filterC(EmployeeCode) : this.Employees.slice())
        );

      this.GetMasterData();
      this.GetEmployees();
      this.loading = false; this.PageLoading=false;
    }
  }
  private _filter(name: string): IEmployee[] {

    const filterValue = name.toLowerCase();
    return this.Employees.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  private _filterC(name: string): IEmployee[] {

    const filterValue = name.toLowerCase();
    return this.Employees.filter(option => option.EmployeeCode.toLowerCase().includes(filterValue));

  }
  displayFn(emp: IEmployee): string {
    return emp && emp.Name ? emp.Name : '';
  }
  displayFnC(emp: IEmployee): string {
    return emp && emp.EmployeeCode ? emp.EmployeeCode : '';
  }
  GetMasterData() {
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SubOrgId, this.SelectedApplicationId)
      .subscribe((data: any) => {

        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.filterOrgIdNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);

        this.shareddata.ChangeMasterData(data.value);
        this.allMasterData = [...data.value];

        this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
        this.shareddata.ChangeReasonForLeaving(this.ReasonForLeaving);

        //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.Batches = this.tokenStorage.getBatches()

        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
        this.shareddata.ChangeCategory(this.Category);

        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
        this.shareddata.ChangeReligion(this.Religion);

        this.States = this.getDropDownData(globalconstants.MasterDefinitions.common.STATE);
        this.shareddata.ChangeStates(this.States);

        this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions.school.PRIMARYCONTACT);
        this.shareddata.ChangePrimaryContact(this.PrimaryContact);

        this.Location = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.LOCATION);
        this.shareddata.ChangeLocation(this.Location);

        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
        this.shareddata.ChangeGenders(this.Genders);

        this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
        this.shareddata.ChangeBloodgroup(this.Bloodgroup);

        this.LanguageSubjUpper = this.getDropDownData(globalconstants.MasterDefinitions.school.LANGUAGESUBJECTUPPERCLS);
        this.shareddata.ChangeLanguageSubjectUpper(this.LanguageSubjUpper);

        this.LanguageSubjLower = this.getDropDownData(globalconstants.MasterDefinitions.school.LANGUAGESUBJECTLOWERCLS);
        this.shareddata.ChangeLanguageSubjectLower(this.LanguageSubjLower);

        this.Designations = this.getDropDownData(globalconstants.MasterDefinitions.employee.DESIGNATION);
        this.Grades = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEGRADE);
        this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.employee.DEPARTMENT);

        this.UploadTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.UPLOADTYPE);
        this.shareddata.ChangeUploadType(this.UploadTypes);

        this.loading = false; this.PageLoading=false;
        //this.getSelectedBatchEmpEmployeeIdRollNo();


      });

  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
    // let Ids = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    // });
    // if (Ids.length > 0) {
    //   var Id = Ids[0].MasterDataId;
    //   return this.allMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   });
    // }
    // else
    //   return [];
  }
  fee(id) {
    this.route.navigate(['/edu/addEmployeefeepayment/' + id]);
  }
  class(id) {
    this.route.navigate(['/edu/addEmployeecls/' + id]);
  }
  view(element) {
    //debugger;
    this.generateDetail(element);
    //  this.route.navigate(['/admin/addEmployee/' + id], { queryParams: { scid: this.EmployeeClassId, bid: this.BatchId } });
    this.route.navigate(['/employee/info']);
  }
  feepayment(element) {
    this.generateDetail(element);
    this.route.navigate(['/edu/feepayment']);
  }
  generateDetail(element) {
    debugger;
    let EmployeeName = element.EmployeeCode + ' ' + element.Name;
    this.shareddata.ChangeEmployeeName(EmployeeName);

    this.tokenStorage.saveEmployeeId(element.EmpEmployeeId);

  }
  addNew() {
    //var url = this.route.url;
    this.tokenStorage.saveEmployeeId("0");
    this.route.navigate(['/employee/info']);
  }
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.tableRef.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'basicinfo.xlsx');
  }
  exportArray() {
    const datatoExport: Partial<IEmployeeDownload>[] = this.EmployeeData.map(x => ({
      EmployeeCode: x.EmployeeCode,
      FistName: x.FirstName,
      LastName: x.LastName,
      Designation: x.Designation,
      Department: x.Department,
      Manager: x.Manager,
      Grade: x.Grade
    }));
    TableUtil.exportArrayToExcel(datatoExport, "ExampleArray");
  }
  getSelectedBatchEmpEmployeeIdRollNo() {
    let list: List = new List();
    list.fields = ["EmpEmployeeId", "RollNo", "SectionId", "EmployeeClassId", "ClassId"];
    list.PageName = "EmployeeClasses";
    list.filter = [this.filterOrgIdNBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.SelectedBatchEmpEmployeeIdRollNo = [...data.value];

        }
      })
  }
  GetEmployee() {
    debugger;
    this.loading = true;
    let checkFilterString = '';//"OrgId eq " + this.LoginUserDetail[0]["orgId"] + ' and Batch eq ' + 
    var EmployeeName = this.EmployeeSearchForm.get("searchemployeeName").value.Name;
    var EmployeeCode = this.EmployeeSearchForm.get("searchEmployeeCode").value.EmployeeCode;
    if (EmployeeCode != undefined && EmployeeCode.trim().length > 0)
      checkFilterString += " and  EmployeeCode eq '" + this.EmployeeSearchForm.get("searchEmployeeCode").value.EmployeeCode + "'";
    if (EmployeeName != undefined && EmployeeName.trim().length > 0)
      checkFilterString += " and  EmpEmployeeId eq " + this.EmployeeSearchForm.get("searchemployeeName").value.EmployeeId;

    let list: List = new List();
    list.fields = [
      "EmpEmployeeId", "ShortName", "FirstName", "LastName", "EmployeeCode", "Active"
    ];
    list.PageName = "EmpEmployees";
    list.lookupFields = ["EmpEmployeeGradeSalHistoryEmployees($filter=IsCurrent eq 1 and Active eq 1;$select=ManagerId,EmployeeId,EmpGradeId,DepartmentId,DesignationId,Active)"];
    list.filter = [this.filterOrgIdOnly + checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        ////console.log(data.value);
        if (data.value.length > 0) {

          this.EmployeeData = data.value.map(item => {
            var _gradeName = '';
            var _designationName = '';
            var _departmentName = '';
            var _managerName = '';

            if (item.EmpEmployeeGradeSalHistoryEmployees.length > 0) {
              var gradeObj = this.Grades.filter(g => g.MasterDataId == item.EmpEmployeeGradeSalHistoryEmployees[0].EmpGradeId);

              if (gradeObj.length > 0)
                _gradeName = gradeObj[0].MasterDataName;

              var designationObj = this.Designations.filter(d => d.MasterDataId == item.EmpEmployeeGradeSalHistoryEmployees[0].DesignationId);
              if (designationObj.length > 0)
                _designationName = designationObj[0].MasterDataName;

              var departmentObj = this.Departments.filter(d => d.MasterDataId == item.EmpEmployeeGradeSalHistoryEmployees[0].DepartmentId);
              if (departmentObj.length > 0)
                _departmentName = departmentObj[0].MasterDataName;

              var managerObj = this.Employees.filter(d => d.EmployeeId == item.EmpEmployeeGradeSalHistoryEmployees[0].ManagerId);
              if (managerObj.length > 0)
                _managerName = managerObj[0].Name;
            }
            var _lastname = item.LastName == null? '' : " " + item.LastName;
            item.EmployeeCode = item.EmployeeCode;
            item.Name = item.FirstName + _lastname;
            item.Grade = _gradeName;
            item.Designation = _designationName;
            item.Department = _departmentName;
            item.Manager = _managerName;//item.EmpEmployeeGradeSalHistoryManagers.FirstName + " " + item.EmpEmployeeGradeSalHistoryManagers.LastName;
            return item;
          })
        }
        else {
          this.EmployeeData = [];
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<IEmployee>(this.EmployeeData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading=false;
      });

  }
  GetEmployees() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["ManagerId", "ReportingTo"];
    //list.PageName = "EmpEmployees";
    //list.filter = [
    var checkFilterString = this.filterOrgIdOnly;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    if(this.LoginUserDetail[0]["RoleUsers"][0].role=="Employee")
    {      
      checkFilterString += " and IsCurrent eq 1 and Active eq 1 and (ManagerId eq " + localStorage.getItem("employeeId") + 
      " or ReportingTo eq " + localStorage.getItem("employeeId") + 
      " or EmployeeId eq " + localStorage.getItem("employeeId") + 
      ")"
    }
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["Employee($select=EmpEmployeeId,EmployeeCode,FirstName,LastName,ShortName,ContactNo)"]
    list.filter = [checkFilterString];


    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Employees = data.value.map(history => {
            var _lastname = history.Employee.LastName == null ? '' : " " + history.Employee.LastName
            var _name = history.Employee.FirstName + _lastname;
            var _fullDescription = _name + "-" + history.Employee.ContactNo;
            return {
              EmployeeId: history.Employee.EmpEmployeeId,
              EmployeeCode: history.Employee.EmployeeCode,
              Name: _fullDescription
            }
          })
        }
        this.loading = false; this.PageLoading=false;
      })
  }
}
export interface IEmployee {
  EmployeeCode: string;
  Name: string;
  FirstName: string;
  LastName: string;
  ShortName: string;
  Department: string;
  Designation: string;
  Manager: string;
  Grade: string;
  Active: boolean;
  Action: boolean;
}
export interface IEmployeeDownload {
  EmployeeCode: string;
  FistName: string;
  LastName: string;
}



