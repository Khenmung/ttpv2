import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-studentattendancereport',
  templateUrl: './studentattendancereport.component.html',
  styleUrls: ['./studentattendancereport.component.scss']
})
export class StudentattendancereportComponent implements OnInit {
  PageLoading = true;
  //@Input() StudentClassId:number;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;
  @ViewChild("table") mattable;
  Students :any[]= [];
  StudentDetail: any = {};
  rowCount = 0;
  edited = false;
  LoginUserDetail: any[]= [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  SelectedStudentSubjectCount :any[]= [];
  StudentDetailToDisplay = '';
  SelectedApplicationId = 0;
  StudentClassId = 0;
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  ClassSubjectList:any[]= [];
  Sections :any[]= [];
  Classes :any[]= [];
  Subjects :any[]= [];
  SelectedBatchId = 0; SubOrgId = 0;
  Batches :any[]= [];
  StudentClassSubjects :any[]= [];

  //StudentSubjectList: IStudentSubject[]= [];
  dataSource: MatTableDataSource<IStudentAttendance>;
  allMasterData :any[]= [];

  nameFilter = new UntypedFormControl('');
  filterValues = {
    Student: ''
  };
  filteredOptions: Observable<IStudentAttendance[]>;
  Permission = '';
  displayedColumns = [
    "Student"
  ];
  searchForm = this.fb.group({
    searchClassId: [0],
    searchSectionId: [0],
    searchSemesterId: [0],
    searchMonth: [0],
    searchClassSubjectId: [0]
  })
  constructor(
    private servicework: SwUpdate,
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }
  Months :any[]= [];
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
  WeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  PageLoad() {
    //debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.Months = this.contentservice.GetSessionFormattedMonths();
    this.StudentClassId = 1;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.STUDENTSUBJECT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;

        this.GetMasterData();
        //this.SubjectTypes();
        //this.GetClassSubject();
        this.GetHoliday();
      }
      else {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
    }
  }
  FilteredClassSubjects :any[]= [];
  bindClassSubject() {
    debugger;
    var classId = this.searchForm.get("searchClassId")!.value;
    // this.FilteredClassSubjects = this.ClassSubjects.filter((f:any) => f.ClassId == classId);
    this.SelectedClassCategory = '';

    if (classId > 0) {
      let obj:any[] = this.Classes.filter((f:any) => f.ClassId == classId);
      if (obj.length > 0)
        this.SelectedClassCategory = obj[0].Category;
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();
  }
  ClassSubjects :any[]= [];
  GetClassSubject() {
    debugger;
    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
      'SectionId',
      'SemesterId',
      'SubjectTypeId'
    ];

    list.PageName = "ClassSubjects";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    //list.filter = ["Active eq 1 and BatchId eq " + this.SelectedBatchId + " and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    //list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.ClassSubjects = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects= [];
        data.value.forEach(item => {
          var objsubject:any[] = this.Subjects.filter((f:any) => f.MasterDataId == item.SubjectId)
          if (objsubject.length > 0) {
            var type = this.SubjectTypes.filter((s:any) => s.SubjectTypeId == item.SubjectTypeId && s.SelectHowMany != 0);
            if (type.length > 0) {
              this.ClassSubjects.push({
                ClassSubjectId: item.ClassSubjectId,
                ClassSubject: objsubject[0].MasterDataName,
                ClassId: item.ClassId,
                SectionId: item.SectionId,
                SemesterId: item.SemesterId
              })
            }
          }
        })
      })
  }
  Defaultvalue = 0;
  SelectedClassCategory = '';
  StudentAttendanceList :any[]= [];
  Semesters :any[]= [];
  ClassCategory :any[]= [];
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  GetStudentAttendance() {
    debugger;
    var SelectedMonth = this.searchForm.get("searchMonth")?.value;
    var SelectedClassId = this.searchForm.get("searchClassId")?.value;
    var SelectedSectionId = this.searchForm.get("searchSectionId")?.value;
    var SelectedSemesterId = this.searchForm.get("searchSemesterId")?.value;
    var SelectedClassSubjectId = this.searchForm.get("searchClassSubjectId")?.value;

    if (SelectedMonth == 0) {
      this.contentservice.openSnackBar("Please select month.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (SelectedClassId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (SelectedSectionId == 0 && SelectedSemesterId == 0) {
      this.contentservice.openSnackBar("Please select either section or semester.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    let filterStr = this.FilterOrgSubOrg;

    if (filterStr.length == 0) {
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;


    if (filterStr.length == 0) {
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.StudentAttendanceList= [];
    this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);
    SelectedMonth = SelectedMonth + "";
    var fromDate = new Date(SelectedMonth.substr(0, 4), SelectedMonth.substr(4, 5), 1);
    var toDate = new Date(SelectedMonth.substr(0, 4), +SelectedMonth.substr(4, 5) + 1, 1);

    var datefilterStr = filterStr + ' and AttendanceDate ge ' + moment(fromDate).format('yyyy-MM-DD')
    datefilterStr += ' and AttendanceDate lt ' + moment(toDate).format('yyyy-MM-DD')
    datefilterStr += " and ClassId eq " + SelectedClassId
    if (SelectedSemesterId)
      datefilterStr += " and SemesterId eq " + SelectedSemesterId;
    if (SelectedSectionId)
      datefilterStr += " and SectionId eq " + SelectedSectionId;

    //if (SelectedClassSubjectId > 0)
    datefilterStr += " and ClassSubjectId eq " + SelectedClassSubjectId;

    let list: List = new List();
    list.fields = [
      "StudentClassId",
      "ClassId",
      "AttendanceDate",
      "AttendanceStatusId",
      "Approved"
    ];
    list.PageName = "Attendances";
    //list.lookupFields = ["StudentClass"];
    list.filter = [datefilterStr]; //+ //"'" + //"T00:00:00.000Z'" +

    this.dataservice.get(list)
      .subscribe((StudentAttendance: any) => {
        var weekdaysCount = 0, Holidays = 0;
        var tempdate;
        var lastDateOfMonth = new Date(moment(fromDate).endOf('month').format('YYYY-MM-DD')).getDate();
        for (let day = 1; day <= lastDateOfMonth; day++) {
          tempdate = new Date(SelectedMonth.substr(0, 4), SelectedMonth.substr(4, 2), day);
          var inHoliday = this.HolidayList.filter((h:any) => new Date(h.StartDate).getTime() >= tempdate.getTime() && new Date(h.EndDate).getTime() <= tempdate.getTime())
          if (inHoliday.length > 0)
            Holidays += 1;
          if (tempdate.getDay() == 6 || tempdate.getDay() == 0) {
            weekdaysCount += 1;
          }
        }
        let absent = 0, Present = 0;
        this.displayedColumns = ["Student"];
        this.StudentAttendanceList = this.Students.filter((s:any) => s.ClassId == SelectedClassId
          && s.SectionId == SelectedSectionId);

        debugger;
        if (SelectedClassSubjectId > 0)
          this.StudentAttendanceList = this.StudentAttendanceList.filter((s:any) => this.StudentClassSubjects.findIndex(d => d.StudentClassId == s.StudentClassId) > -1);
        var today = new Date().getDay();
        this.StudentAttendanceList.forEach((stud:any) => {
          absent = 0;
          Present = 0;
          var dayHead = '';
          let existing = StudentAttendance.value.filter(db => db.StudentClassId == stud.StudentClassId);
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
                stud[dayHead] = dayattendance[0].AttendanceStatusId == this.AttendancePresentId ? 'P' : dayattendance[0].Approved ? 'L' : '-';
                if (today <= dayCount && this.WeekDays[wd] != 'Sat' && this.WeekDays[wd] != 'Sun' && (dayattendance[0].AttendanceStatusId == this.AttendanceAbsentId || !dayattendance[0].AttendanceStatusId))
                  absent += 1;
                else if (this.WeekDays[wd] != 'Sat' && this.WeekDays[wd] != 'Sun')
                  Present += 1;
              }
              else {
                stud[dayHead] = '-';
                if (today <= dayCount && this.WeekDays[wd] != 'Sat' && this.WeekDays[wd] != 'Sun')
                  absent += 1;
              }
            }
          }
          else {
            if (SelectedClassSubjectId > 0) {
              var indx = this.StudentClassSubjects.findIndex(f => f.StudentClassId == stud.StudentClassId);
              if (indx > -1) {
                for (let day = 1; day <= lastDateOfMonth; day++) {
                  tempdate = new Date(SelectedMonth.substr(0, 4), SelectedMonth.substr(4, 2), day);
                  var wd = tempdate.getDay();
                  dayHead = day + " " + this.WeekDays[wd];
                  if (this.displayedColumns.indexOf(dayHead) == -1) {
                    this.displayedColumns.push(dayHead);
                  }

                  stud[dayHead] = '-';
                  if (today <= day && this.WeekDays[wd] != 'Sat' && this.WeekDays[wd] != 'Sun')
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

                stud[dayHead] = '-';
                absent += 1;
              }
            }
          }
          if (this.displayedColumns.indexOf("Pre") == -1)
            this.displayedColumns.push("Pre");
          if (this.displayedColumns.indexOf("Ab") == -1)
            this.displayedColumns.push("Ab");
          stud["Pre"] = Present;
          var _ab = (absent - (weekdaysCount + Holidays));
          stud["Ab"] = _ab < 0 ? 0 : _ab;
        })
        //console.log("employee",this.Employees)
        this.StudentAttendanceList = this.StudentAttendanceList.sort((a, b) => a.RollNo - b.RollNo)
        this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);
        this.dataSource.paginator = this.paginator;
        //this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      });
    //this.changeDetectorRefs.detectChanges();
    //});

  }
  ClearData() {
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    this.FilteredClassSubjects = globalconstants.getFilteredClassSubjects(this.ClassSubjects, _classId, _sectionId, _semesterId);

    this.StudentAttendanceList= [];
    this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);
  }
  HolidayListName = 'Holidays';
  HolidayList :any[]= [];
  GetHoliday() {
    debugger;

    this.loading = true;
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";

    let list: List = new List();
    list.fields = ["HolidayId,StartDate,EndDate"];

    list.PageName = this.HolidayListName;
    list.filter = [filterStr];
    this.HolidayList= [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.HolidayList = [...data.value];
        }
        this.loading = false;
      });

  }
  GetExistingStudentClassSubjects() {
    this.loading = true;
    var clssubjectid = this.searchForm.get("searchClassSubjectId")?.value;
    var orgIdSearchstr = this.FilterOrgSubOrgBatchId;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;

    if (_classId > 0 && clssubjectid > 0) {

      orgIdSearchstr += ' and ClassSubjectId eq ' + clssubjectid;
      orgIdSearchstr += ' and ClassId eq ' + _classId;
      if (_sectionId > 0)
        orgIdSearchstr += ' and SectionId eq ' + _sectionId;
      if (_semesterId > 0)
        orgIdSearchstr += ' and SemesterId eq ' + _semesterId;
      orgIdSearchstr += " and Active eq 1";

      let list: List = new List();

      list.fields = [
        "ClassSubjectId",
        "StudentClassId",
      ];
      list.PageName = "StudentClassSubjects";
      list.filter = [orgIdSearchstr];
      //list.orderBy = "ParentId";
      debugger;
      this.dataservice.get(list)
        .subscribe((data: any) => {
          this.StudentClassSubjects = [...data.value];
          this.loading = false;
        })
    }
    else {
      this.loading = false;
      if (clssubjectid > 0)
        this.contentservice.openSnackBar("Please select class, section, subject.", globalconstants.ActionText, globalconstants.RedBackground);
    }
    this.ClearData();
  }
  AssignNameClassSection(pStudents) {
    this.Students = [];
    pStudents.forEach(student => {
      var _RollNo = '';
      var _name = '';
      var _className = '';
      var _classId = 0;
      var _section = '';
      var _sectionId = 0;
      var _studentClassId = 0;
      //var studentclassobj = this.StudentClasses.filter((f:any) => f.StudentId == student.StudentId);
      //if (studentclassobj.length > 0) {
      if (student.StudentClasses && student.StudentClasses.length > 0 && student.StudentClasses[0].Active == 1) {
        _studentClassId = student.StudentClasses[0].StudentClassId;
        var _classNameobj = this.Classes.filter(c => c.ClassId == student.StudentClasses[0].ClassId);

        if (_classNameobj.length > 0)
          _className = _classNameobj[0].ClassName;
        var _SectionObj = this.Sections.filter((f:any) => f.MasterDataId == student.StudentClasses[0].SectionId)

        if (_SectionObj.length > 0)
          _section = _SectionObj[0].MasterDataName;
        _RollNo = student.StudentClasses[0].RollNo == null ? '' : student.StudentClasses[0].RollNo;
        _classId = student.StudentClasses[0].ClassId;
        _sectionId = student.StudentClasses[0].SectionId;
      }
      student.PersonalNo = student.PersonalNo == null ? '' : student.PersonalNo;
      var _lastname = student.LastName == null ? '' : " " + student.LastName;
      _name = student.FirstName + _lastname;
      var _fullDescription = _name + "-" + _RollNo;
      student.StudentClassId = _studentClassId;
      student.ClassId = _classId;
      student.RollNo = _RollNo;
      student.SectionId = _sectionId;
      student.Student = _fullDescription;
      student.ClassName = _className;
      this.Students.push(student);

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
  formatData(clssubject) {
    var _subjectName = '';
    var topush = {};
    //var subjectTypes :any[]= [];

    topush = this.StudentDetail;

    _subjectName = this.Subjects.filter((s:any) => s.MasterDataId == clssubject.SubjectId)[0].MasterDataName;
    if (this.displayedColumns.indexOf(_subjectName) == -1)
      this.displayedColumns.push(_subjectName);

    topush = {
      "StudentClassSubjectId": clssubject.StudentClassSubjectId,
      "StudentClassId": this.StudentDetail["StudentClassId"],
      "Student": this.StudentDetail["Student"],
      "RollNo": this.StudentDetail["RollNo"],
      "SubjectTypeId": clssubject.SubjectTypeId,
      "SubjectType": clssubject.SubjectType,
      "SelectHowMany": clssubject.SelectHowMany,
      "SubjectId": clssubject.SubjectId,
      "Subject": _subjectName,
      "ClassSubjectId": clssubject.ClassSubjectId,
      "ClassId": clssubject.ClassId,
      "ClassName": this.Classes.filter(c => c.ClassId == clssubject.ClassId)[0].ClassName,
      "Action": false,
      "Active": clssubject.Active,
    }
    this.StudentDetail[_subjectName] = clssubject.Active;
    topush[_subjectName] = clssubject.Active;
  }

  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      searchSubjectId: 0,
      searchSubjectTypeId: 0,
      //searchBatchId: this.SelectedBatchId
    });
  }
  // SelectColumn(element,colName) {
  //   this.SelectAllInRow(element, col);
  // }
  // SelectAllRowInColumn(event, colName) {
  //   debugger;
  //   this.StudentSubjectList.forEach(element => {
  //     var currentrow = this.StoreForUpdate.filter((f:any) => f.Subject == colName && f.StudentClassId == element.StudentClassId);
  //     if (event.checked) {
  //       currentrow[colName] = 1;
  //       element[colName] = 1;
  //     }
  //     else {
  //       currentrow[colName] = 0;
  //       element[colName] = 0;
  //       currentrow[0].SubjectCount = 0;
  //     }
  //     element.Action = true;
  //   });
  // }
  // SelectAllInRow(element, event, colName) {
  //   debugger;
  //   var columnexist :any[]= [];
  //   if (colName == 'Action') {
  //     for (var prop in element) {
  //       columnexist = this.displayedColumns.filter((f:any) => f == prop)
  //       if (columnexist.length > 0 && event.checked && prop != 'Student' && prop != 'Action') {
  //         element[prop] = 1;
  //       }
  //       else if (columnexist.length > 0 && !event.checked && prop != 'Student' && prop != 'Action') {
  //         element[prop] = 0;
  //       }
  //       element.Action = true;
  //     }
  //   }
  //   else {
  //     var currentrow = this.StoreForUpdate.filter((f:any) => f.Subject == colName && f.StudentClassId == element.StudentClassId);
  //     if (event.checked) {
  //       currentrow[colName] = 1;
  //       element[colName] = 1;
  //     }
  //     else {
  //       currentrow[colName] = 0;
  //       element[colName] = 0;
  //       currentrow[0].SubjectCount = 0;
  //     }
  //     element.Action = true;
  //   }
  // }
  // SaveRow(element) {
  //   //debugger;
  //   this.loading = true;
  //   this.rowCount = 0;
  //   this.SelectedStudentSubjectCount :any[]= [];
  //   ////////
  //   //console.log("this.StudentSubjectList", this.StudentSubjectList);
  //   let StudentSubjects = this.StoreForUpdate.filter((s:any) => s.StudentClassId == element.StudentClassId);
  //   var groupbySubjectType = alasql("select distinct SubjectTypeId,SubjectType,SelectHowMany from ? ", [StudentSubjects])
  //   var matchrow;
  //   for (var prop in element) {
  //     matchrow = StudentSubjects.filter(x => x.Subject == prop)
  //     if (matchrow.length > 0) {
  //       var resultarray = groupbySubjectType.filter((f:any) => f.SubjectTypeId == matchrow[0].SubjectTypeId);
  //       if (element[prop] == 1) {
  //         //assuming greater than 20 means compulsory subject types
  //         // if (resultarray[0].SelectHowMany > 30)
  //         //   matchrow[0].SubjectCount = resultarray[0].SelectHowMany;
  //         // //resultarray[0].SubjectCount = resultarray[0].SelectHowMany;
  //         // else
  //         resultarray[0].SubjectCount = resultarray[0].SubjectCount == undefined ? 1 : resultarray[0].SubjectCount + 1;
  //       }
  //       else {
  //         resultarray[0].SubjectCount = resultarray[0].SubjectCount == undefined ? 0 : resultarray[0].SubjectCount;
  //       }
  //     }
  //   }
  //   var _compulsory = groupbySubjectType.filter((f:any) => f.SubjectType.toLowerCase() == 'compulsory')
  //   var _otherThanCompulsory = groupbySubjectType.filter((f:any) => f.SubjectType.toLowerCase() != 'compulsory')
  //   var subjectCounterr = '';
  //   _otherThanCompulsory.forEach(noncompulsory => {
  //     //element.SelectHowMany =0 meeans optional
  //     if (noncompulsory.SubjectCount != noncompulsory.SelectHowMany) {
  //       subjectCounterr += " Subject type " + noncompulsory.SubjectType + " must have " + noncompulsory.SelectHowMany + " subject(s) selected.";
  //     }
  //   });
  //   var compulsorysubjectCount = StudentSubjects.filter(c => c.SubjectType.toLowerCase() == 'compulsory')

  //   if (compulsorysubjectCount.length > _compulsory[0].SubjectCount) {
  //     subjectCounterr += " Subject type " + _compulsory[0].SubjectType + " must have " + _compulsory[0].SelectHowMany + " subject(s) selected";
  //   }
  //   // _compulsory.forEach(s => {
  //   //   if (s.SelectHowMany > 30 && s.SubjectCount != s.SelectHowMany) {
  //   //     debugger;
  //   //     subjectCounterr += " Subject type " + s.SubjectType + " must have " + s.SelectHowMany + " subject(s) selected.";
  //   //   }
  //   // })
  //   /////////
  //   if (subjectCounterr.length > 0) {
  //     this.loading = false; this.PageLoading = false;
  //     this.contentservice.openSnackBar(subjectCounterr, globalconstants.ActionText, globalconstants.RedBackground);
  //     return;
  //   }
  //   else {
  //     for (var prop in element) {
  //       var row: any = StudentSubjects.filter((s:any) => s.Subject == prop);

  //       if (row.length > 0 && prop != 'Student' && prop != 'Action') {
  //         var data = {
  //           Active: element[prop],
  //           StudentClassSubjectId: row[0].StudentClassSubjectId,
  //           StudentClassId: row[0].StudentClassId,
  //           ClassSubjectId: row[0].ClassSubjectId,
  //           SubjectId: row[0].SubjectId
  //         }
  //         ////console.log('data to update',data)
  //         if (row.length > 0)
  //           this.UpdateOrSave(data, element);
  //       }
  //     }
  //   }
  // }
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
  // UpdateOrSave(row, element) {
  //   //debugger;
  //   let checkFilterString = "ClassSubjectId eq " + row.ClassSubjectId +
  //     " and StudentClassId eq " + row.StudentClassId +
  //     " and BatchId eq " + this.SelectedBatchId


  //   if (row.StudentClassSubjectId > 0)
  //     checkFilterString += " and StudentClassSubjectId ne " + row.StudentClassSubjectId;
  //   checkFilterString += " and " + this.StandardFilter
  //   let list: List = new List();
  //   list.fields = ["ClassSubjectId"];
  //   list.PageName = "StudentClassSubjects";
  //   list.filter = [checkFilterString];

  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       //debugger;
  //       if (data.value.length > 0) {
  //         console.log("row.ClassSubjectId", row.ClassSubjectId)
  //         this.contentservice.openSnackBar("Record already exists!", globalconstants.ActionText, globalconstants.RedBackground);
  //         return;
  //       }
  //       else {

  //         this.StudentSubjectData.Active = row.Active;
  //         this.StudentSubjectData.StudentClassSubjectId = row.StudentClassSubjectId;
  //         this.StudentSubjectData.OrgId = this.LoginUserDetail[0]["orgId"];.SubOrgId = this.SubOrgId
  //         this.StudentSubjectData.BatchId = this.SelectedBatchId;
  //         this.StudentSubjectData.StudentClassId = row.StudentClassId;
  //         this.StudentSubjectData.SubjectId = row.SubjectId;
  //         this.StudentSubjectData.ClassSubjectId = row.ClassSubjectId;
  //         this.StudentSubjectData.ClassId = row.ClassId;
  //         this.StudentSubjectData.SectionId = row.SectionId;
  //         ////console.log('data', this.StudentSubjectData);
  //         if (this.StudentSubjectData.StudentClassSubjectId == 0) {
  //           this.StudentSubjectData["CreatedDate"] = new Date();
  //           this.StudentSubjectData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
  //           delete this.StudentSubjectData["UpdatedDate"];
  //           delete this.StudentSubjectData["UpdatedBy"];
  //           ////console.log('insert', this.StudentSubjectData);
  //           this.insert(row, element);
  //         }
  //         else {
  //           delete this.StudentSubjectData["CreatedDate"];
  //           delete this.StudentSubjectData["CreatedBy"];
  //           this.StudentSubjectData["UpdatedDate"] = new Date();
  //           this.StudentSubjectData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
  //           this.update(row, element);
  //         }
  //         row.Action = false;

  //       }
  //     });
  // }

  // insert(row, element) {

  //   //debugger;
  //   this.dataservice.postPatch('StudentClassSubjects', this.StudentSubjectData, 0, 'post')
  //     .subscribe(
  //       (data: any) => {
  //         this.edited = false;
  //         this.rowCount += 1;
  //         row.StudentClassSubjectId = data.StudentClassSubjectId;

  //         if (this.rowCount == Object.keys(row).length - 3) {
  //           this.loading = false; this.PageLoading = false;
  //           element.Action = false;
  //           this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
  //         }
  //       });
  // }
  // update(row, element) {

  //   this.dataservice.postPatch('StudentClassSubjects', this.StudentSubjectData, this.StudentSubjectData.StudentClassSubjectId, 'patch')
  //     .subscribe(
  //       (data: any) => {
  //         this.edited = false;

  //         this.rowCount += 1;
  //         if (this.rowCount == Object.keys(row).length - 3) {
  //           element.Action = false;
  //           this.loading = false; this.PageLoading = false;
  //           //this.GetStudentClassSubject();
  //           this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
  //         }
  //         //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
  //       });
  // }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  SubjectTypes :any[]= [];
  GetSubjectTypes() {

    var orgIdSearchstr = this.FilterOrgSubOrg + ' and Active eq 1';

    let list: List = new List();

    list.fields = ["SubjectTypeId", "SubjectTypeName", "SelectHowMany"];
    list.PageName = "SubjectTypes";
    list.filter = [orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SubjectTypes = [...data.value];
        this.GetClassSubject();
      })
  }
  AttendanceStatus :any[]= [];
  AttendancePresentId = 0;
  AttendanceAbsentId = 0;
  GetMasterData() {
    debugger;
    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions.common.ATTENDANCESTATUS);
    this.AttendancePresentId = this.AttendanceStatus.filter((s:any) => s.MasterDataName.toLowerCase() == 'present')[0].MasterDataId;
    this.AttendanceAbsentId = this.AttendanceStatus.filter((s:any) => s.MasterDataName.toLowerCase() == 'absent')[0].MasterDataId;
    
    this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
      this.Classes = data.value.map(m => {
        let obj = this.ClassCategory.filter(c => c.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Category = obj[0].MasterDataName.toLowerCase();
        }
        else
          m.Category = '';
        return m;
      })
      this.Students = this.tokenStorage.getStudents()!;
      this.AssignNameClassSection(this.Students);
    })
    this.GetSubjectTypes();
    this.loading = false;
    this.PageLoading = false;
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
export interface IStudentAttendance {
  StudentAttendanceId: number;
  EmployeeId: number;
  Employee: string;
  AttendanceStatusId: number;
  AttendanceDate: Date;
  Remarks: string;
  ReportedTo: number;
  Approved: boolean;
  ApprovedBy: string;
  Action: boolean
}


