import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-teacherperiod',
  templateUrl: './teacherperiod.component.html',
  styleUrls: ['./teacherperiod.component.scss']
})
export class TeacherperiodComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  PageLoading = true;
  SelectedApplicationId = 0;
  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  rowCount = -1;
  DataToSave = 0;
  SelectedBatchId = 0;SubOrgId = 0;
  StoredForUpdate :any[]= [];
  PeriodTypes :any[]= [];
  Classes :any[]= [];
  Sections :any[]= [];
  Subjects :any[]= [];
  WeekDays :any[]= [];
  Periods :any[]= [];
  Batches :any[]= [];
  ClassSubjects :any[]= [];
  ClassWiseSubjects :any[]= [];
  AllClassPeriods :any[]= [];
  AllTimeTable :any[]= [];
  SchoolTimeTableListName = "SchoolTimeTables";
  SchoolTimeTableList :any[]= [];
  dataSource: MatTableDataSource<any[]>;
  dataSourceDayStatistic: MatTableDataSource<any[]>;
  dataSourcePeriodStatistic: MatTableDataSource<any[]>;
  allMasterData :any[]= [];
  Permission = '';
  SchoolTimeTableData = {
    TimeTableId: 0,
    DayId: 0,
    ClassId: 0,
    SectionId: 0,
    SchoolClassPeriodId: 0,
    TeacherSubjectId: 0,
    OrgId: 0,SubOrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns:any[]= [];
  DataForAllClasses :any[]= [];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private datepipe: DatePipe,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private fb: UntypedFormBuilder
  ) {

  }

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
      searchEmployeeId: [0]
    });
    this.dataSource = new MatTableDataSource<any[]>([]);
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.TIMETABLE.CLASSTIMETABLE)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
          this.Classes = [...data.value];
        });

        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.GetMasterData();

      }
    }
  }
  Teachers :any[]= [];
  WorkAccounts :any[]= [];
  GetTeachers() {

    var orgIdSearchstr = this.FilterOrgSubOrg ;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var _WorkAccount = this.WorkAccounts.filter((f:any) => f.MasterDataName.toLowerCase() == "teaching");
    var _workAccountId = 0;
    if (_WorkAccount.length > 0)
      _workAccountId = _WorkAccount[0].MasterDataId;

    let list: List = new List();

    list.fields = ["WorkAccountId"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["Employee($select=EmpEmployeeId", "FirstName", "LastName)"]
    list.filter = [orgIdSearchstr + " and Active eq 1 and WorkAccountId eq " + _workAccountId];
    //list.orderBy = "ParentId";
    this.Teachers = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.filter((f:any) => {
          var _lastname = f.Employee.LastName == null ? '' : " " + f.Employee.LastName;
          this.Teachers.push({
            TeacherId: f.Employee.EmpEmployeeId,
            TeacherName: f.Employee.FirstName + _lastname
          })
        })

      })
  }
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;
    var updateActive = this.StoredForUpdate.filter((s:any) => s.DayId == row.DayId);
    updateActive.forEach(u => u.Active = 1)
  }
  // Save(row) {
  //   this.rowCount = 0;
  //   this.UpdateOrSave(row);
  // }
  UpdateOrSave(element, row) {

    debugger;
    //this.StoredForUpdate.filter((f:any)=>f.TeacherId == row.)
    this.loading = true;
    let checkFilterString =
      "DayId eq " + row.DayId +
      //" and TeacherSubjectId eq " + row.TeacherSubjectId +   
      //" and TeacherId eq " + row.TeacherId +
      " and Active eq 1"
    //console.log("this.AllTimeTable", this.AllTimeTable)
    var duplicateCheck = alasql("select DayId,PeriodId,TeacherId from ? where DayId = ? and PeriodId = ? and TeacherId = ?",
      [this.DataForAllClasses, row.DayId, row.PeriodId, row.TeacherId])
    if (duplicateCheck.length > 1) {
      //console.log("duplicateCheck",duplicateCheck);
      var _detail = '';
      var _dupdetail = this.DataForAllClasses.filter((f:any) => f.DayId == row.DayId && f.PeriodId == row.PeriodId && row.TeacherId == row.TeacherId);
      _dupdetail.forEach(d => {
        var objclass = this.Classes.filter(c => c.ClassId == d.ClassId);
        var _className = '';
        if (objclass.length > 0)
          _className = objclass[0].ClassName;
        var _sectionName = '';
        var objSection = this.Sections.filter((f:any) => f.MasterDataId == d.SectionId);
        if (objSection.length > 0)
          _sectionName = objSection[0].MasterDataName;

        _detail += "Class: " + _className + ", Section: " + _sectionName + ", Period: " + d.Period + "\n";

      })
      var _teacherobj = this.TeacherSubjectList.filter((f:any) => f.EmployeeId == row.TeacherId)
      this.contentservice.openSnackBar("Teacher " + _teacherobj[0].TeacherName + " already exists in the same period in another class.\n" + _detail, globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      element.Action = true;
    }
    else {

      this.SchoolTimeTableData.TimeTableId = row.TimeTableId;
      this.SchoolTimeTableData.SchoolClassPeriodId = row.SchoolClassPeriodId;
      this.SchoolTimeTableData.ClassId = row.ClassId;
      this.SchoolTimeTableData.Active = row.Active;
      this.SchoolTimeTableData.DayId = row.DayId;
      this.SchoolTimeTableData.SectionId = row.SectionId;
      this.SchoolTimeTableData.TeacherSubjectId = row.TeacherSubjectId;

      this.SchoolTimeTableData.OrgId = this.LoginUserDetail[0]["orgId"];
      this.SchoolTimeTableData.SubOrgId = this.SubOrgId;
      this.SchoolTimeTableData.BatchId = this.SelectedBatchId;

      //console.log('data', this.SchoolTimeTableData);
      if (this.SchoolTimeTableData.TimeTableId == 0) {
        this.SchoolTimeTableData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
        this.SchoolTimeTableData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
        this.SchoolTimeTableData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
        delete this.SchoolTimeTableData["UpdatedBy"];
        ////console.log('exam slot', this.SchoolClassPeriodListData)
        this.insert(element, row);
      }
      else {
        delete this.SchoolTimeTableData["CreatedDate"];
        delete this.SchoolTimeTableData["CreatedBy"];
        this.SchoolTimeTableData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd')
        this.SchoolTimeTableData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
        this.update(element);
      }
    }
  }

  insert(element, row) {

    //debugger;
    this.dataservice.postPatch(this.SchoolTimeTableListName, this.SchoolTimeTableData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.TimeTableId = data.TimeTableId;
          this.GetAllSchoolTimeTable();
          element.Action = false;
          this.loading = false;
          if (this.rowCount == 0) {
            this.rowCount = -1;
            this.loading = false; this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.SchoolTimeTableListName, this.SchoolTimeTableData, this.SchoolTimeTableData.TimeTableId, 'patch')
      .subscribe(
        (data: any) => {
          debugger;
          this.GetAllSchoolTimeTable();
          row.Action = false;
          if (this.rowCount == 0) {
            this.rowCount = -1;
            this.loading = false;
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }
  TeacherName = '';
  DayStatisticDisplay = ["TeacherName"];
  PeriodStatisticDisplay = ["Day"];
  DayStatistics :any[]= [];
  PeriodStatistics :any[]= [];
  GetSchoolTimeTable() {
    debugger;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.SchoolTimeTableList = [];

    this.loading = true;

    this.displayedColumns = [
      'Action',
      'Day'
    ];

    //this.FormatData(_classId, _sectionId);

    this.GetPeriodStatistic();
    this.loading = false;
    this.PageLoading = false;
    //})
  }
  ClearData(){
    this.PeriodStatistics=[];
    this.dataSourcePeriodStatistic = new MatTableDataSource<any>(this.PeriodStatistics);
  }
  FormatData(pClassId, pSectionId) {

    var dbTimeTable :any[]= [];
    this.StoredForUpdate = [];
    if (pClassId > 0 && pSectionId > 0)
      dbTimeTable = this.AllTimeTable.filter((f:any) => f.ClassId == pClassId && f.SectionId == pSectionId);
    else
      dbTimeTable = [...this.AllTimeTable]

    this.SchoolTimeTableList = [];
    var forDisplay:any[]= [];
    var distinctClass = alasql("select distinct ClassId from ?", [dbTimeTable]);
    if (distinctClass.length == 0)
      distinctClass.push({ ClassId: pClassId, SectionId: pSectionId });

    distinctClass.forEach(distinctcls => {
      this.ClassWiseSubjects = this.TeacherSubjectList.filter((f:any) => f.ClassId == distinctcls.ClassId);
      if (this.ClassWiseSubjects.length == 0 && pClassId > 0) {
        this.contentservice.openSnackBar("Subject Teacher not defined for this class!", globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {
        //iterrate through class
        //iterrate through weekdays
        // iterate through class periods
        var filterPeriods :any[]= [];
        filterPeriods = this.AllClassPeriods.filter(a => a.ClassId == distinctcls.ClassId);

        if (filterPeriods.length == 0) {
          console.log("Period not yet defined for this class : " + distinctcls.ClassId);
        }
        else {

          var forSelectedClsPeriods;
          forSelectedClsPeriods = filterPeriods.sort((a, b) => a.Sequence - b.Sequence);
          console.log("forSelectedClsPeriods", forSelectedClsPeriods);
          debugger;
          this.WeekDays.sort((a, b) => a.Sequence - b.Sequence).forEach(p => {
            if (!this.DayStatisticDisplay.includes(p.MasterDataName))
              this.DayStatisticDisplay.push(p.MasterDataName)
          })
          this.WeekDays.forEach(p => {
            forDisplay = [];
            forDisplay["Day"] = p.MasterDataName;
            forDisplay["DayId"] = p.MasterDataId;

            forSelectedClsPeriods.forEach(clsperiod => {
              var _period = clsperiod.PeriodType.includes('Free Time') ? 'f_' + clsperiod.Period : clsperiod.Period;

              if (!this.displayedColumns.includes(_period))
                this.displayedColumns.push(_period);
              if (!this.PeriodStatisticDisplay.includes(_period) && !_period.includes('f_'))
                this.PeriodStatisticDisplay.push(_period);

              var existing = dbTimeTable.filter(d =>
                d.SchoolClassPeriod.PeriodId == clsperiod.PeriodId
                //&& d.SectionId == pSectionId
                && d.DayId == p.MasterDataId
                && d.ClassId == distinctcls.ClassId)
              if (existing.length > 0) {
                existing.forEach(alreadyassignedclassperiod => {
                  var _teacherId = alreadyassignedclassperiod.TeacherSubjects == null ? 0 : alreadyassignedclassperiod.TeacherSubjects.EmployeeId
                  var clsObj = this.Classes.filter(c => c.ClassId == clsperiod.ClassId);
                  var clsName = '';
                  if (clsObj.length > 0) {
                    clsName = clsObj[0].ClassName;
                    alreadyassignedclassperiod.PeriodId = clsperiod.PeriodId;
                    alreadyassignedclassperiod.Period = _period;
                    alreadyassignedclassperiod.Action = false;
                    alreadyassignedclassperiod.TeacherId = _teacherId;
                    alreadyassignedclassperiod.Sequence = clsperiod.Sequence;
                    alreadyassignedclassperiod.SubjectNClass = clsName + "-" + alreadyassignedclassperiod.Section + "-" + alreadyassignedclassperiod.Subject;
                    this.StoredForUpdate.push(alreadyassignedclassperiod);
                    forDisplay[clsperiod.Period] = alreadyassignedclassperiod.TeacherSubjectId;//this.ClassSubjects.filter((s:any) => s.TeacherSubjectId == )[0].SubjectName
                    forDisplay["Active"] = alreadyassignedclassperiod.Active;
                  }
                })
              }
              else {
                forDisplay[clsperiod.Period] = 0;
                this.StoredForUpdate.push({
                  "TimeTableId": 0,
                  "DayId": p.MasterDataId,
                  "Day": p.MasterDataName,
                  "ClassId": clsperiod.ClassId,
                  "SectionId": clsperiod.PeriodId,
                  "SchoolClassPeriodId": clsperiod.SchoolClassPeriodId,
                  "TeacherSubjectId": 0,
                  "TeacherId": 0,
                  "SubjectNClass": '',
                  "Sequence": clsperiod.Sequence,
                  "Period": _period,
                  "PeriodId": clsperiod.PeriodId,
                  "Active": 0,
                  "Action": false
                })
              }

            })
            forDisplay["Action"] = false;
            forDisplay["Sequence"] = p.Sequence;
            this.SchoolTimeTableList.push(forDisplay);

          })
        }
      }
    })//foreach distinct class

  }

  GetPeriodStatistic() {
    debugger;
    var groupbySubjects = alasql("select ClassSubjectId,Count(1) TeacherCount from ? group by ClassSubjectId", [this.TeacherSubjectList]);
    var filterSubjectMorethanOneTeacher = groupbySubjects.filter((s:any) => s.TeacherCount > 1);
    var ClassSubjectIdWithTeacherId = this.TeacherSubjectList.filter(t => filterSubjectMorethanOneTeacher.findIndex(s => s.ClassSubjectId == t.ClassSubjectId) > -1)

    var _teacherId = this.searchForm.get("searchEmployeeId")?.value;
    this.TeacherName = '';
    var obj = this.Teachers.filter((f:any) => f.TeacherId == _teacherId);
    if (obj.length > 0)
      this.TeacherName = obj[0].TeacherName.trim();
    this.PeriodStatistics = [];
    //var _DistinctTeacher = alasql("select distinct EmployeeId,TeacherName from ?", [this.TeacherSubjectList]);
    //_DistinctTeacher.forEach(teacher => {
    var _forCurrentTeacher = this.DataForAllClasses.filter(assigned => assigned.TeacherId == _teacherId);
    //var _eachPeriod = alasql("select Period,SubjectName from ?", [_forCurrentTeacher]);
    this.WeekDays.forEach(weekday => {
      this.PeriodStatisticDisplay.forEach(col => {

        var periodmatch = _forCurrentTeacher.filter((f:any) => f.Period == col && f.Day == weekday.MasterDataName);
        if (periodmatch.length > 0) {
          periodmatch.forEach(eachperiod => {
            var row = this.PeriodStatistics.filter((s:any) => s.Day == weekday.MasterDataName && s.TeacherName.trim() == this.TeacherName);
            if (row.length > 0) {
              var multipletime = '';
              row.forEach(r => {
                multipletime += eachperiod.SubjectNClass + ',';
              })
              row[0][col] = multipletime;
            }
            else {
              var _data = { TeacherName: this.TeacherName, TeacherId: _teacherId, Day: weekday.MasterDataName, [col]: eachperiod.SubjectNClass }
              this.PeriodStatistics.push(_data);
            }
          });
        }
        else {
          //for one subject multiple teacher;
          var subjectWithMultiTeacher = this.DataForAllClasses.filter((f:any) => ClassSubjectIdWithTeacherId.findIndex(d => d.ClassSubjectId == f.ClassSubjectId) > -1
            && f.Period == col && f.Day == weekday.MasterDataName);
            if(subjectWithMultiTeacher.length>0)
            {
              var _data = { TeacherName: this.TeacherName, TeacherId: _teacherId, Day: weekday.MasterDataName, [col]: subjectWithMultiTeacher[0].SubjectNClass }
              this.PeriodStatistics.push(_data);
            }
        }
      })

    });
    //});
    //console.log("PeriodStatisticDisplay", this.PeriodStatisticDisplay);
    //console.log("this.PeriodStatistics", this.PeriodStatistics);
    if (this.PeriodStatistics.length == 0) {
      this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
    }
    this.dataSourcePeriodStatistic = new MatTableDataSource<any>(this.PeriodStatistics);
  }
  GetAllSchoolTimeTable() {
    debugger;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = this.FilterOrgSubOrgBatchId + ' and Active eq 1';

    let list: List = new List();
    list.fields = [
      "TimeTableId",
      "DayId",
      "ClassId",
      "SectionId",
      "SchoolClassPeriodId",
      "TeacherSubjectId",
      "Active"
    ];
    list.PageName = this.SchoolTimeTableListName;
    list.lookupFields = ["TeacherSubjects($select=TeacherSubjectId,EmployeeId),SchoolClassPeriod($select=PeriodId)"]
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        var dbTimeTable = data.value.map((d => {
          d.Day = this.WeekDays.filter(w => w.MasterDataId == d.DayId)[0].MasterDataName;
          return d;
        }))
        this.AllTimeTable = [];
        dbTimeTable.forEach(f => {
          var _teacherId = 0;
          if (f.TeacherSubjects)
            _teacherId = f.TeacherSubjects.EmployeeId;

          var _section = ''
          var objsection = this.Sections.filter((s:any) => s.MasterDataId == f.SectionId);
          var objTeachersubj = this.TeacherSubjectList.filter(t => t.TeacherSubjectId == f.TeacherSubjectId);

          if (objsection.length > 0 && objTeachersubj.length > 0) {
            _section = objsection[0].MasterDataName;
            f.Section = _section;
            f.PeriodId = f.SchoolClassPeriod.PeriodId;
            f.Period = this.AllClassPeriods.filter(p => p.PeriodId == f.SchoolClassPeriod.PeriodId)[0].Period;
            f.TeacherId = _teacherId;
            f.Subject = objTeachersubj[0].SubjectName;
            this.AllTimeTable.push(f);
          }
        })
        this.FormatData(0, 0);
        this.DataForAllClasses = JSON.parse(JSON.stringify(this.StoredForUpdate));
        this.StoredForUpdate = [];
      })
  }
  TeacherSubjectList :any[]= [];
  GetTeacherSubject() {
    let filterStr = '';//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    //debugger;
    this.loading = true;

    filterStr = this.FilterOrgSubOrg + ' and Active eq 1';
    let list: List = new List();
    list.fields = [
      'TeacherSubjectId',
      'EmployeeId',
      'ClassSubjectId',
      'Active',
    ];

    list.PageName = "TeacherSubjects";
    list.lookupFields = ["Employee($select=ShortName,FirstName,LastName)"];
    list.filter = [filterStr];
    this.TeacherSubjectList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        data.value.forEach(teachersubject => {
          var _teacherName = teachersubject.Employee.FirstName;
          if (teachersubject.Employee.LastName != '')
            _teacherName += " " + teachersubject.Employee.LastName;

          var objClsSubject = this.ClassSubjects.filter(clssubject => clssubject.ClassSubjectId == teachersubject.ClassSubjectId)
          objClsSubject.forEach(clssubject => {
            teachersubject["ClassName"] = clssubject["ClassName"];
            teachersubject["SubjectName"] = clssubject.SubjectName + " (" + teachersubject.Employee.ShortName + ")";
            teachersubject.ClassId = clssubject.ClassId;
            teachersubject.TeacherName = _teacherName;
            this.TeacherSubjectList.push(teachersubject);
          });
        })
        this.GetAllClassPeriods();
        //GetAllSchoolTimeTable(); --teacherlist,alltimeperiods
        //format();
        this.loading = false;
        this.PageLoading = false;
      });
  }
  GetAllClassPeriods() {
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.SchoolTimeTableList = [];
    //var orgIdSearchstr = ' OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    this.loading = true;

    let list: List = new List();
    list.fields = [
      "SchoolClassPeriodId",
      "ClassId",
      "PeriodId",
      "PeriodTypeId",
      "Sequence",
      "FromToTime",
      "Active"
    ];
    list.PageName = "SchoolClassPeriods";
    list.filter = [this.FilterOrgSubOrgBatchId];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.AllClassPeriods = data.value.map(m => {
          var _PeriodType = '';
          if (m.PeriodTypeId != null && m.PeriodTypeId != 0)
            _PeriodType = this.PeriodTypes.filter(p => p.MasterDataId == m.PeriodTypeId)[0].MasterDataName;
          var obj = this.Periods.filter(p => p.MasterDataId == m.PeriodId);
          m.Period = '';
          if (obj.length > 0)
            m.Period = obj[0].MasterDataName// + " - " + m.FromToTime;
          m.Sequence = m.Sequence == 0 ? 500 : m.Sequence;
          m.PeriodType = _PeriodType;
          return m;
        }).sort((a, b) => a.Sequence - b.Sequence);

        if (this.AllClassPeriods.length == 0) {
          this.contentservice.openSnackBar("Class periods not defined.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.GetAllSchoolTimeTable();
        }
        this.loading = false; this.PageLoading = false;

      })
  }
  GetClassSubject() {

    //let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";
    //+ ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();
    list.fields = [
      "ClassSubjectId",
      "ClassId",
      "SubjectId"
    ];
    list.PageName = "ClassSubjects";
    //list.lookupFields = ["Teacher($select=ShortName)"];
    list.filter = [filterStr];
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = [];
        data.value.forEach(cs => {
          var objclass = this.Classes.filter(c => c.ClassId == cs.ClassId);
          var _class = '';
          if (objclass.length > 0) {
            _class = objclass[0].ClassName;
            var objsubject = this.Subjects.filter(c => c.MasterDataId == cs.SubjectId);
            var _subject = '';
            if (objsubject.length > 0) {
              _subject = objsubject[0].MasterDataName;
              this.ClassSubjects.push({
                ClassSubjectId: cs.ClassSubjectId,
                ClassId: cs.ClassId,
                ClassName: _class,
                SubjectName: _subject
              });
            }
          }
        })
        this.GetTeacherSubject();
        this.loading = false;
        this.PageLoading = false;
      })
  }
  ReplicateToClasses() {

    if (this.searchForm.get("searchClassIdApplyAll")?.value == 0) {
      this.contentservice.openSnackBar("Please select classes to replicate to!", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    this.rowCount = 0;

    //not action means data has been saved.
    var filteredAction = this.SchoolTimeTableList.filter((s:any) => !s.Action);
    var selectedClassIds = this.searchForm.get("searchClassIdApplyAll")?.value;
    delete selectedClassIds[this.searchForm.get("searchClassId")?.value];
    this.DataToSave = filteredAction.length * selectedClassIds.length;
    var existInDB :any[]= [];

    filteredAction.forEach(toReplicate => {
      selectedClassIds.forEach(toSelectedClassId => {
        existInDB = this.AllClassPeriods.filter(d => d.ClassId == toSelectedClassId && d.PeriodId == toReplicate.PeriodId)
        if (existInDB.length == 0) {
          var toinsert = JSON.parse(JSON.stringify(toReplicate));
          toinsert.SchoolClassPeriodId = 0;
          toinsert.ClassId = toSelectedClassId;
          this.UpdateOrSave(toReplicate, toinsert);
        }
        else {
          var _schoolClassPeriodId = 0;
          existInDB.forEach(e => {
            _schoolClassPeriodId = JSON.parse(JSON.stringify(e.SchoolClassPeriodId));
            e = JSON.parse(JSON.stringify(toReplicate));
            e.SchoolClassPeriodId = _schoolClassPeriodId;
            e.ClassId = toSelectedClassId;
            this.UpdateOrSave(toReplicate, e);

          })
        }
      })
    })


  }

  SaveRow(element) {
    //debugger;
    this.loading = true;
    this.rowCount = 0;

    var _toUpdate = this.StoredForUpdate.filter((s:any) => s.Day == element.Day && s.Action);

    var validated = _toUpdate.filter(t => t.TeacherSubjectId == 0 && !t.Period.includes('f_'));
    if (validated.length > 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Subject must be selected for periods", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.rowCount = _toUpdate.length;
    for (var rowCount = 0; rowCount < _toUpdate.length; rowCount++) {
      this.rowCount--;
      this.UpdateOrSave(element, _toUpdate[rowCount]);
    }
    //element.Action = false;

  }
  SaveAll() {
    var _toUpdate = this.StoredForUpdate.filter((s:any) => s.Action);

    var validated = _toUpdate.filter(t => t.TeacherSubjectId == 0 && !t.Period.includes('f_'));
    if (validated.length > 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Subject must be selected for periods", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.rowCount = _toUpdate.length;
    for (var i = 0; i < _toUpdate.length; i++) {
      this.rowCount--;
      this.UpdateOrSave(_toUpdate[i], _toUpdate[i]);
    }
  }
  CheckAll(value) {
    this.SchoolTimeTableList.forEach(record => {
      if (value.checked)
        record.Active = 1;
      else
        record.Active = 0;
      record.Action = !record.Action;
    })
  }

  GetMasterData() {
    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Periods = this.getDropDownData(globalconstants.MasterDefinitions.school.PERIOD);
    this.Periods.sort((a, b) => a.Sequence - b.Sequence);

    this.PeriodTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.PERIODTYPE);
    this.WeekDays = this.getDropDownData(globalconstants.MasterDefinitions.school.WEEKDAYS);

    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
    this.Batches = this.tokenStorage.getBatches()!;;
    this.GetTeachers();

    this.GetClassSubject();
    //this.GetTeacherSubject(); -- this.ClassSubjects
    //--teacherlist
  }

  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }

}
export interface ISchoolTimeTable {

  TimeTableId: number;
  DayId: number;
  ClassId: number;
  SectionId: number;
  SchoolClassPeriodId: number;
  TeacherSubjectId: number;
  Active: number;
  Action: boolean;
}




