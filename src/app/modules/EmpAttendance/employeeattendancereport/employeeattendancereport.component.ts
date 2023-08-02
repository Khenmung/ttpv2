import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-employeeattendancereport',
  templateUrl: './employeeattendancereport.component.html',
  styleUrls: ['./employeeattendancereport.component.scss']
})
export class EmployeeAttendanceReportComponent implements OnInit {
  PageLoading = true;
  //@Input() StudentClassId:number;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("table") mattable;
  StudentDetail: any = {};
  rowCount = 0;
  edited = false;
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  SelectedStudentSubjectCount = [];
  StudentDetailToDisplay = '';
  SelectedApplicationId = 0;
  StudentClassId = 0;
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  //ClassSubjectList = [];
  //Sections = [];
  //Classes = [];
  //Subjects = [];
  SelectedBatchId = 0; SubOrgId = 0;
  Batches = [];
  StudentClassSubjects = [];
  Departments = [];
  //StudentSubjectList: IStudentSubject[] = [];
  dataSource: MatTableDataSource<IEmployeeAttendance>;
  allMasterData = [];
  searchForm = this.fb.group({
    searchMonth: [0],
    searchDepartment: [0]
  });
  StudentSubjectData = {
    StudentClassSubjectId: 0,
    SubjectId: 0,
    StudentClassId: 0,
    ClassId: 0,
    SectionId: 0,
    ClassSubjectId: 0,
    BatchId: 0,
    OrgId: 0, SubOrgId: 0,
    Active: 1
  };
  nameFilter = new UntypedFormControl('');
  filterValues = {
    Student: ''
  };
  filteredOptions: Observable<IEmployeeAttendance[]>;
  Permission = '';
  displayedColumns = [
    "Employee"
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }
  Months = [];
  Employees = [];
  WeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  ngOnInit(): void {

    this.nameFilter.valueChanges
      .subscribe(
        name => {
          this.filterValues.Student = name;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.PageLoad();
  }
  PageLoad() {
    //debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.Months = this.contentservice.GetSessionFormattedMonths();
    this.StudentClassId = 1;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employeeattendance.ATTENDANCEREPORT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SubOrgId = this.tokenStorage.getSubOrgId();
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.GetMasterData();
        this.GetEmployees();
        this.GetHoliday();
      }
      else {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
    }
  }
  HolidayList = [];
  GetHoliday() {
    debugger;

    this.loading = true;
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";

    let list: List = new List();
    list.fields = ["HolidayId,StartDate,EndDate"];

    list.PageName = "Holidays";
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
  EmployeeAttendanceList = [];
  GetEmployeeAttendance() {
    debugger;
    var SelectedMonth = this.searchForm.get("searchMonth").value;
    var _Department = this.searchForm.get("searchDepartment").value;
    if (SelectedMonth == 0) {
      this.contentservice.openSnackBar("Please select month", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    let filterStr = this.FilterOrgSubOrg + " and Active eq true";

    if (filterStr.length == 0) {
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;

    if (filterStr.length == 0) {
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.EmployeeAttendanceList = [];
    this.dataSource = new MatTableDataSource<IEmployeeAttendance>(this.EmployeeAttendanceList);
    SelectedMonth = SelectedMonth + "";
    var fromDate = new Date(SelectedMonth.substr(0, 4), SelectedMonth.substr(4, 5), 1);
    var toDate = new Date(SelectedMonth.substr(0, 4), SelectedMonth.substr(4, 5), 0);

    var datefilterStr = filterStr + ' and AttendanceDate ge ' + moment(fromDate).format('yyyy-MM-DD')
    datefilterStr += ' and AttendanceDate le ' + moment(fromDate).endOf('month').format('yyyy-MM-DD')

    let list: List = new List();
    list.fields = [
      "EmployeeId",
      "AttendanceDate",
      "AttendanceStatusId",
    ];
    list.PageName = "EmployeeAttendances";
    //list.lookupFields = ["StudentClass"];
    list.filter = [datefilterStr]; //+ //"'" + //"T00:00:00.000Z'" +

    this.dataservice.get(list)
      .subscribe((employeeAttendance: any) => {
        this.displayedColumns = ["Employee"];
        var weekdaysCount = 0, Holidays = 0;
        var tempdate;
        var lastDateOfMonth = new Date(moment(fromDate).endOf('month').format('YYYY-MM-DD')).getDate();
        for (let day = 1; day <= lastDateOfMonth; day++) {
          tempdate = new Date(SelectedMonth.substr(0, 4), SelectedMonth.substr(4, 2), day);
          var inHoliday = this.HolidayList.filter(h => new Date(h.StartDate).getTime() >= tempdate.getTime() && new Date(h.EndDate).getTime() <= tempdate.getTime())
          if (inHoliday.length > 0)
            Holidays += 1;
          if (tempdate.getDay() == 6 || tempdate.getDay() == 0) {
            weekdaysCount += 1;
          }
        }
        let absent = 0;
        let Present = 0;
        let today = new Date().getDay();
        //var lastDateOfMonth = new Date(moment(fromDate).endOf('month').format('YYYY-MM-DD')).getDate();
        //var _employeeDepartmentWise = [];
        if (_Department > 0)
          this.EmployeeAttendanceList = this.Employees.filter(f => f.DepartmentId == _Department)
        else
          this.EmployeeAttendanceList = [...this.Employees];

        this.EmployeeAttendanceList.forEach(emp => {
          absent = 0;
          Present = 0;
          var empName = emp.FirstName + (emp.LastName ? " " + emp.LastName : "");
          emp.Employee = empName;
          var dayHead = '';
          let existing = employeeAttendance.value.filter(db => db.EmployeeId == emp.EmpEmployeeId);
          if (existing.length > 0) {
            //the whole month for an employee.
            for (let dayCount = 1; dayCount <= lastDateOfMonth; dayCount++) {
              tempdate = new Date(SelectedMonth.substr(0, 4), SelectedMonth.substr(4, 2), dayCount);
              var wd = tempdate.getDay();
              dayHead = dayCount + " " + this.WeekDays[wd];
              if (this.displayedColumns.indexOf(dayHead) == -1) {
                this.displayedColumns.push(dayHead);
              }

              var dayattendance = existing.filter(e => new Date(e.AttendanceDate).getDate() == dayCount);
              if (dayattendance.length > 0) {

                var obj = this.AttendanceStatus.filter(f => f.MasterDataId == dayattendance[0].AttendanceStatusId);
                if (obj.length > 0)
                  dayattendance[0].AttendanceStatus = obj[0].MasterDataName.substr(0,1);
                else
                  dayattendance[0].AttendanceStatus = '';

                emp[dayHead] = dayattendance[0].AttendanceStatus ? dayattendance[0].AttendanceStatus : '';
                if (this.WeekDays[wd] != 'Sat' && this.WeekDays[wd] != 'Sun' && today <= dayCount && (dayattendance[0].AttendanceStatusId == this.AttendanceAbsentId || !dayattendance[0].AttendanceStatus))
                  absent += 1;
                else if (this.WeekDays[wd] != 'Sat' && this.WeekDays[wd] != 'Sun')
                  Present += 1;
              }
              else {
                emp[dayHead] = '-';
                if (today <= dayCount && this.WeekDays[wd] != 'Sat' && this.WeekDays[wd] != 'Sun')
                  absent += 1;
              }
            }
          }
          else {
            for (let day = 1; day <= lastDateOfMonth; day++) {
              tempdate = new Date(SelectedMonth.substr(0, 4), SelectedMonth.substr(4, 2), day);
              var wd = tempdate.getDay();
              dayHead = day + " " + this.WeekDays[wd];
              if (this.displayedColumns.indexOf(dayHead) == -1) {
                this.displayedColumns.push(dayHead);
              }

              emp[dayHead] = '-';
              if (today <= day && (this.WeekDays[wd] != 'Sat' && this.WeekDays[wd] != 'Sun'))
                absent += 1;
            }
            // for (let day = 1; day <= lastDateOfMonth; day++) {
            //   if (this.displayedColumns.indexOf(day + "") == -1)
            //     this.displayedColumns.push(day + "");

            //   emp[day] = 0;
            //   absent += 1;
            // }
          }
          if (this.displayedColumns.indexOf("Pre") == -1)
            this.displayedColumns.push("Pre");
          if (this.displayedColumns.indexOf("Ab") == -1)
            this.displayedColumns.push("Ab");
          emp["Pre"] = Present;//toDate.getDate() - absent;
          var _ab = absent - (weekdaysCount + Holidays);

          emp["Ab"] = _ab < 0 ? 0 : _ab;
        })
        //console.log("employee",this.Employees)
        //this.EmployeeAttendanceList = this.EmployeeAttendanceList.sort((a, b) => a.RollNo - b.RollNo)
        this.dataSource = new MatTableDataSource<IEmployeeAttendance>(this.EmployeeAttendanceList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      });
    //this.changeDetectorRefs.detectChanges();
    //});

  }
  GetEmployees() {
    var filterStr = this.FilterOrgSubOrg + " and Active eq 1";
    let list: List = new List();
    list.fields = [
      'EmpEmployeeId',
      'FirstName',
      'LastName',
      'ShortName',
      'DepartmentId'
    ];

    list.PageName = "EmpEmployees";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((employee: any) => {
        this.Employees = [...employee.value];
        this.loading = false;
        this.PageLoading = false;
      })
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.Student.toLowerCase().indexOf(searchTerms.Student) !== -1
      // && data.id.toString().toLowerCase().indexOf(searchTerms.id) !== -1
      // && data.colour.toLowerCase().indexOf(searchTerms.colour) !== -1
      // && data.pet.toLowerCase().indexOf(searchTerms.pet) !== -1;
    }
    return filterFunction;
  }

  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      searchSubjectId: 0,
      searchSubjectTypeId: 0,
      //searchBatchId: this.SelectedBatchId
    });
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

  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

  AttendanceStatus = [];
  AttendancePresentId=0;
  AttendanceAbsentId=0;
  GetMasterData() {
    debugger;
    this.allMasterData = this.tokenStorage.getMasterData();
    //this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions.common.ATTENDANCESTATUS);
    this.AttendancePresentId = this.AttendanceStatus.filter(f=>f.MasterDataName.toLowerCase()=='present')[0].MasterDataId;
    this.AttendanceAbsentId = this.AttendanceStatus.filter(f=>f.MasterDataName.toLowerCase()=='absent')[0].MasterDataId;
    this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.employee.DEPARTMENT);
    this.loading = false; this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownDataNoConfidentail(dropdowntype, this.tokenStorage, this.allMasterData);
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
export interface IEmployeeAttendance {
  EmployeeAttendanceId: number;
  EmployeeId: number;
  Employee: string;
  AttendanceStatus: number;
  AttendanceDate: Date;
  Remarks: string;
  ReportedTo: number;
  Approved: boolean;
  ApprovedBy: string;
  Action: boolean
}

