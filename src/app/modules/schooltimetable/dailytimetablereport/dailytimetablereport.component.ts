import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';

@Component({
  selector: 'app-dailytimetablereport',
  templateUrl: './dailytimetablereport.component.html',
  styleUrls: ['./dailytimetablereport.component.scss']
})
export class DailytimetablereportComponent implements OnInit {
  PageLoading = true;
  SelectedApplicationId = 0;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  rowCount = -1;
  DataToSave = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  StoredForUpdate: any[] = [];
  PeriodTypes: any[] = [];
  Classes: any[] = [];
  Sections: any[] = [];
  Subjects: any[] = [];
  WeekDays: any[] = [];
  Periods: any[] = [];
  Batches: any[] = [];
  ClassSubjects: any[] = [];
  ClassWiseSubjects: any[] = [];
  AllClassPeriods: any[] = [];
  SchoolTimeTableListName = "SchoolTimeTables";
  SchoolTimeTableList: any[] = [];
  dataSource: MatTableDataSource<any[]>;
  allMasterData: any[] = [];
  Permission = '';
  SchoolTimeTableData = {
    TimeTableId: 0,
    DayId: 0,
    ClassId: 0,
    SectionId: 0,
    SchoolClassPeriodId: 0,
    ClassSubjectId: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns: any[] = [];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private datepipe: DatePipe,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private nav: Router,
    private shareddata: SharedataService,
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
      searchClassId: [0],
      searchSectionId: [0],
      searchSemesterId: [0]
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
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.TIMETABLE.DAILYTIMETABLEREPORT)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        // var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        // this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
        //   if(data.value) this.Classes = [...data.value]; else this.Classes = [...data];
        // });

        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.GetMasterData();
        this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
          if (this.LoginUserDetail[0]["RoleUsers"][0].role.toLowerCase() == 'student') {
            let _classId = this.tokenStorage.getClassId();
            let _classes = data.value.filter(d => d.ClassId == _classId);
            _classes.forEach(m => {
              let obj = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId);
              if (obj.length > 0) {
                m.Category = obj[0].MasterDataName.toLowerCase();
                this.Classes.push(m);
              }
            });

          }
          else {
            data.value.forEach(m => {
              let obj = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId);
              if (obj.length > 0) {
                m.Category = obj[0].MasterDataName.toLowerCase();
                this.Classes.push(m);
              }
            });
            this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
          }
        });

      }
    }
  }
  GetSchoolTimeTable() {
    debugger;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.SchoolTimeTableList = [];
    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = this.FilterOrgSubOrgBatchId + ' and Active eq 1';

    let _classId = this.searchForm.get("searchClassId")?.value;
    let _sectionId = this.searchForm.get("searchSectionId")?.value;
    let _semesterId = this.searchForm.get("searchSemesterId")?.value;

    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    filterstr += ' and ClassId eq ' + _classId;
    filterstr += ' and SemesterId eq ' + _semesterId;
    filterstr += ' and SectionId eq ' + _sectionId;

    this.loading = true;

    let list: List = new List();
    list.fields = [
      "TimeTableId",
      "DayId",
      "ClassId",
      "SectionId",
      "SemesterId",
      "SchoolClassPeriodId",
      "TeacherSubjectId",
      "Active"
    ];
    list.PageName = this.SchoolTimeTableListName;
    list.lookupFields = ["TeacherSubject($select=EmployeeId),SchoolClassPeriod($select=PeriodId)"]
    list.filter = [filterstr];
    this.displayedColumns = [
      'Day'
    ];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        var dbTimeTable = data.value.map((d => {
          d.Day = this.WeekDays.filter(w => w.MasterDataId == d.DayId)[0].MasterDataName;
          return d;
        }))
        var forDisplay: any[] = [];
        var _classId = this.searchForm.get("searchClassId")?.value;
        //this is used in html for subject dropdown.
        this.ClassWiseSubjects = this.TeacherSubjectList.filter((f: any) => f.ClassId == _classId);

        //iterrate through class
        //iterrate through weekdays
        // iterate through class periods

        //////console.log('this.WeekDays',this.WeekDays);
        var filterPeriods = this.AllClassPeriods.filter(a => a.ClassId == _classId);
        ////console.log("filterPeriods", filterPeriods)
        if (filterPeriods.length == 0) {
          this.contentservice.openSnackBar("Period not yet defined for this class.", globalconstants.ActionText, globalconstants.RedBackground);

        }
        else {
          var usedWeekDays = this.WeekDays.filter((f: any) => dbTimeTable.filter(db => db.DayId == f.MasterDataId).length > 0)
          usedWeekDays.forEach(p => {
            forDisplay = [];
            forDisplay["Day"] = p.MasterDataName;
            forDisplay["DayId"] = p.MasterDataId;

            var forSelectedClsPeriods;


            forSelectedClsPeriods = filterPeriods.sort((a, b) => a.Sequence - b.Sequence);

            forSelectedClsPeriods.forEach(clsperiod => {
              var _period = clsperiod.PeriodType.includes('Free Time') ? 'f_' + clsperiod.Period : clsperiod.Period;
              if (!this.displayedColumns.includes(_period))
                this.displayedColumns.push(_period);

              var existing = dbTimeTable.filter(d => d.SchoolClassPeriod.PeriodId == clsperiod.PeriodId
                && d.DayId == p.MasterDataId)
              if (existing.length > 0) {
                existing.forEach(exist => {
                  exist.PeriodId = clsperiod.PeriodId;
                  exist.Period = _period;
                  exist.Action = false;
                  exist.TeacherId = exist.TeacherSubject.EmployeeId;
                  exist.Sequence = clsperiod.Sequence;

                  this.StoredForUpdate.push(exist);
                  var objcls = this.ClassWiseSubjects.filter((s: any) => s.TeacherSubjectId == exist.TeacherSubjectId);
                  if (objcls.length > 0) {

                    forDisplay[clsperiod.Period] = objcls[0].SubjectName

                  }
                })
              }
              else {
                forDisplay[clsperiod.Period] = 0;
              }

            })
            //forDisplay["Action"] = false;
            forDisplay["Sequence"] = p.Sequence;
            this.SchoolTimeTableList.push(forDisplay);

          })
        }
        this.SchoolTimeTableList.sort((a, b) => a.Sequence - b.Sequence)
        //this.displayedColumns.push("Action");
        this.dataSource = new MatTableDataSource<any>(this.SchoolTimeTableList);
        this.loading = false; this.PageLoading = false;
      })
  }
  TeacherSubjectList: any[] = [];
  SelectedClassCategory = '';
  Defaultvalue = 0;
  Semesters: any[] = [];
  ClassCategory: any[] = [];
  BindSectionSemester() {
    let _classId = this.searchForm.get("searchClassId")?.value;
    let obj = this.Classes.filter(c => c.ClassId == _classId);
    if (obj.length > 0) {
      this.SelectedClassCategory = obj[0].Category.toLowerCase();
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();
  }
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  ClearData() {
    // var _searchClassId = this.searchForm.get("searchClassId")?.value;
    // var _searchSectionId = this.searchForm.get("searchSectionId")?.value;
    // var _searchSemesterId = this.searchForm.get("searchSemesterId")?.value;
    //this.SelectedClassSubjects = globalconstants.getFilteredClassSubjects(this.ClassSubjects, _searchClassId, _searchSectionId, _searchSemesterId);
    this.SchoolTimeTableList = [];
    this.dataSource = new MatTableDataSource<any>(this.SchoolTimeTableList);
  }
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
        ////console.log("this.TeacherSubjectList", this.TeacherSubjectList);
        this.loading = false;
        this.PageLoading = false;
      });
  }

  GetAllClassPeriods() {
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.SchoolTimeTableList = [];
    var orgIdSearchstr = this.FilterOrgSubOrgBatchId + ' and Active eq 1';
    //var filterstr = 'Active eq 1';

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
    list.filter = [orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AllClassPeriods = data.value.map(m => {
          var _PeriodType = '';
          if (m.PeriodTypeId != null && m.PeriodTypeId != 0)
            _PeriodType = this.PeriodTypes.filter(p => p.MasterDataId == m.PeriodTypeId)[0].MasterDataName;
          var obj = this.Periods.filter(p => p.MasterDataId == m.PeriodId);
          if (obj.length > 0) {
            m.PeriodWithTime = obj[0].MasterDataName + " - " + m.FromToTime;
            m.Period = obj[0].MasterDataName;
          }
          m.PeriodType = _PeriodType;
          return m;
        }).sort((a, b) => a.Sequence - b.Sequence);

        this.loading = false;
        this.PageLoading = false;
        ////console.log("this.AllClassPeriods", this.AllClassPeriods);
      }, error => {
        this.loading = false;
        this.PageLoading = false;
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
      "SectionId",
      "SemesterId",
      "SubjectId",
      "TeacherId"
    ];
    list.PageName = "ClassSubjects";
    list.lookupFields = ["Teacher($select=ShortName)"];
    list.filter = [filterStr];
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = data.value.map(cs => {
          var objclass = this.Classes.filter(c => c.ClassId == cs.ClassId);
          var _class = '';
          if (objclass.length > 0)
            _class = objclass[0].ClassName;
          var objsubject = this.Subjects.filter(c => c.MasterDataId == cs.SubjectId);
          var _subject = '';
          if (objsubject.length > 0)
            _subject = objsubject[0].MasterDataName;

          return {
            ClassSubjectId: cs.ClassSubjectId,
            ClassId: cs.ClassId,
            SectionId: cs.SectionId,
            SemesterId: cs.SemesterId,
            ClassName: _class,
            SubjectName: _subject
          }
        })
        this.GetTeacherSubject();
        this.loading = false;
        this.PageLoading = false;
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
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);

    this.Batches = this.tokenStorage.getBatches()!;
    //this.shareddata.ChangeBatch(this.Batches);
    //this.loading = false; this.PageLoading=false;
    this.GetClassSubject();
    this.GetAllClassPeriods();
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
export interface ISchoolTimeTable {

  TimeTableId: number;
  DayId: number;
  ClassId: number;
  SectionId: number;
  SchoolClassPeriodId: number;
  ClassSubjectId: number;
  Active: number;
  Action: boolean;
}




