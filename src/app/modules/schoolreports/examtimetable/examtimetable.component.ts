import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import * as moment from 'moment';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
@Component({
  selector: 'app-examtimetable',
  templateUrl: './examtimetable.component.html',
  styleUrls: ['./examtimetable.component.scss']
})
export class ExamtimetableComponent implements OnInit {
  PageLoading = true;
  @ViewChild('allSelected') private allSelected: MatOption;

  weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  NoOfColumn = 0;
  SelectedExamName = '';
  SelectedClasses = '';
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  SlotNClassSubjects = [];
  SelectedApplicationId = 0;
  SelectedBatchId = 0;SubOrgId = 0;
  ExamSlots = [];
  Classes = [];
  Subjects = [];
  ExamNames = [];
  SlotNames = [];
  Batches = [];
  Exams = [];
  DateArray = [];
  ClassSubjectList = [];
  dataSource: MatTableDataSource<[]>;
  allMasterData = [];
  Permission = 'deny';
  ExamId = 0;
  SlotNClassSubjectData = {
    SlotClassSubjectId: 0,
    SlotId: 0,
    ClassSubjectId: 0,
    OrgId: 0,SubOrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private contentservice: ContentService,
    private nav: Router,
    private shareddata: SharedataService,
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
      searchExamId: [0],
      searchClassId: [0]
    });
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //console.log('loginuserdetail', this.LoginUserDetail)
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.EXAMTIMETABLE);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
          this.Classes = [...data.value];
          this.GetMasterData();
        });

        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);


      }
    }
  }

  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }

  GetClassSubject() {
    //let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    let filterStr =this.FilterOrgSubOrgBatchId + " and Active eq 1";
    //filterStr += ' and BatchId eq ' + this.SelectedBatchId;
    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
      'Active'
    ];

    list.PageName = "ClassSubjects";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        this.ClassSubjectList = data.value.map(item => {
          var _class = '';
          var clsObj = this.Classes.filter(c => c.ClassId == item.ClassId);
          if (clsObj.length > 0)
            _class = clsObj[0].ClassName
          var _subject = '';
          var subjObj = this.Subjects.filter(c => c.MasterDataId == item.SubjectId);
          if (subjObj.length > 0)
            _subject = subjObj[0].MasterDataName;

          return {
            ClassSubjectId: item.ClassSubjectId,
            ClassSubject: _class + " - " + _subject,
            SubjectId: item.SubjectId,
            ClassId: item.ClassId
          }
        })
        this.loading = false; this.PageLoading = false;
      });
  }
  GetExams() {

    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId,2)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.map(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId
            })
        })
      });
  }
  GetExamSlots() {
    //debugger;

    let list: List = new List();
    list.fields = [
      "ExamSlotId",
      "ExamId",
      "SlotNameId",
      "ExamDate",
      "StartTime",
      "Sequence",
      "EndTime"];
    list.PageName = "ExamSlots";
    list.lookupFields = ["Exam($select=ExamNameId)"];
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    list.orderBy = "ExamId,Sequence";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //var filteredExams = data.value.filter(d => d.ExamId == this.searchForm.get("searchExamId").value)

        this.ExamSlots = data.value.map(s => {

          let exams = this.ExamNames.filter(e => e.MasterDataId == s.Exam.ExamNameId);
          var _slotName = this.SlotNames.filter(e => e.MasterDataId == s.SlotNameId)[0].MasterDataName;

          var day = this.weekday[new Date(s.ExamDate).getDay()]
          var _examname = '';
          if (exams.length > 0)
            _examname = exams[0].MasterDataName;
          return {
            SlotId: s.ExamSlotId,
            SlotName: _slotName + " - (" + s.StartTime + " - " + s.EndTime + ")",
            ExamName: _examname,
            ExamDate: moment(s.ExamDate).format('DD/MM/yyyy'),
            StartTime: s.StartTime,
            EndTime: s.EndTime,
            ExamId: s.ExamId,
            Sequence: s.Sequence
          }
        })
        this.NoOfColumn = this.ExamSlots.length;

      })
  }
  toggleAllSelection() {
    debugger;
    if (this.allSelected.selected) {
      this.searchForm.get("searchClassId")
        .patchValue([...this.Classes.map(item => item.ClassId), 0]);
    } else {
      this.searchForm.get("searchClassId").patchValue([]);
    }
  }
  tosslePerOne() {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }

    if (this.searchForm.get("searchClassId").value.length == this.Classes.length) {
      this.allSelected.select();

    }
    return true;


  }
  GetSlotNClassSubjects() {
    ////console.log("this.searchForm.get(searchClassId).value",this.searchForm.get("searchClassId").value)
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchExamId").value == 0) {
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.SelectedClasses = '';
    this.SelectedExamName = this.Exams.filter(f => f.ExamId == this.searchForm.get("searchExamId").value)[0].ExamName;
    var classesobj = this.Classes.filter(f => (this.searchForm.get("searchClassId").value+"").includes(f.ClassId));
    classesobj.forEach((m, indx) => {

      this.SelectedClasses += indx == classesobj.length - 1 ? m.ClassName + "." : m.ClassName + ", ";

    });
    //this.SelectedClasses =  this.SelectedClasses.
    let list: List = new List();
    list.fields = [
      "SlotClassSubjectId",
      "SlotId",
      "ClassSubjectId",
      "Active"];
    list.PageName = "SlotAndClassSubjects";
    list.lookupFields = ["ClassSubject($select=ClassSubjectId,SubjectId,ClassId)",
      "Slot($filter=Active eq 1;$select=SlotNameId,ExamId,ExamDate,StartTime,EndTime,Sequence)"];
    list.filter = [filterstr + orgIdSearchstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        var filteredData = [];
        if (this.searchForm.get("searchClassId").value.length > 0)
          data.value.forEach(d => {
            d.Slot.ExamDate = moment(d.Slot.ExamDate).format('DD/MM/yyyy');
            if (d.Slot.ExamId == this.searchForm.get("searchExamId").value
              && this.searchForm.get("searchClassId").value.indexOf(d.ClassSubject.ClassId) > -1) {
              filteredData.push(d);
            }
          })
        else
          data.value.forEach(d => {
            d.Slot.ExamDate = moment(d.Slot.ExamDate).format('DD/MM/yyyy');
            if (d.Slot.ExamId == this.searchForm.get("searchExamId").value) {
              filteredData.push(d);
            }
          });

        this.SlotNClassSubjects = [];
        this.displayedColumns = [];
        var _EachExamDate = alasql("select distinct Slot->ExamDate as ExamDate from ? order by Slot->ExamDate", [filteredData]);
        var filteredOneSlotSubjects = [];

        debugger;

        //preparing data for each exam date
        //var timeTableRow = {};
        var SubjectRow = {};
        _EachExamDate.forEach(edate => {
          var RowsForOneExamDate = [];

          var header = {};
          var SlotRow = {};
          var _examDate = edate.ExamDate;
          var daynumber = moment(_examDate, 'DD/MM/YYYY').day()
          var day = this.weekday[daynumber]
          var _dateHeader = '<b>' + _examDate + " - " + day + "</b>";
          var timeTableRow = [];

          var examDateSlot = this.ExamSlots.filter(f => {
            return f.ExamDate == _examDate && f.ExamId == this.searchForm.get("searchExamId").value
          });//.sort((a,b)=>a.Sequence - b.Sequence);

          SubjectRow = {};
          examDateSlot.forEach((slot, index) => {
            var oneSlotClasslist = [];
            if (index == 0) {
              header["Slot0"] = _dateHeader;
              header["daterow"] = true;
            }
            else {
              header["daterow"] = true;
              header["Slot" + index] = '';
            }
            SlotRow["Slot" + index] = "<b>" + slot.SlotName + "</b>";

            if (this.displayedColumns.indexOf("Slot" + index) == -1)
              this.displayedColumns.push("Slot" + index);

            //filtering only for one slot in one exam date
            filteredOneSlotSubjects = filteredData.filter(f => f.SlotId == slot.SlotId
              && moment(f.Slot.ExamDate).format('dd/MM/yyyy') == moment(edate.ExamDate).format('dd/MM/yyyy'))
              .sort((a, b) => a.Slot.Sequence - b.Slot.Sequence);
            //timeTableRow["ExamDate"]["slot" + index]["ClassSubject"] = [];
            //console.log("filteredOneSlotSubjects",filteredOneSlotSubjects)

            var distinctClasses = alasql("select distinct ClassSubject->ClassId as ClassId from ? ", [filteredOneSlotSubjects]);
            oneSlotClasslist = distinctClasses.map(d => {
              var _classobj = this.Classes.filter(s => s.ClassId == d.ClassId);
              var _className = '';
              var _classSequence = '';
              if (_classobj.length > 0) {
                _classSequence = _classobj[0].Sequence;
                _className = _classobj[0].ClassName;
              }
              //timeTableRow.push({ "ClassName": _className })
              return { ["Slot" + index]: slot.SlotName, "ClassName": _className, "ClassId": d.ClassId, "Sequence": _classSequence, "Subjects": '' }
            });

            //console.log("oneSlotClasslist", oneSlotClasslist);
            filteredOneSlotSubjects.forEach(f => {
              var _subject = '';
              var obj = this.Subjects.filter(s => s.MasterDataId == f.ClassSubject.SubjectId)
              if (obj.length > 0)
                _subject = obj[0].MasterDataName;
              var classobj = oneSlotClasslist.filter(c => c.ClassId == f.ClassSubject.ClassId)
              if (classobj.length > 0)
                classobj[0].Subjects += classobj[0].Subjects.length == 0 ? classobj[0].ClassName + " - " + _subject : ", " + _subject
            })
            if (timeTableRow.length == 0) {
              oneSlotClasslist.forEach((r) => {
                timeTableRow.push({ ["Slot" + index]: r.Subjects })
              })
            }
            else {
              var existingrow = timeTableRow.length;
              oneSlotClasslist.forEach((r, inx) => {
                if (existingrow <= inx)
                  timeTableRow.push({ ["Slot" + index]: r.Subjects })
                else
                  timeTableRow[inx]["Slot" + index] = r.Subjects;
                timeTableRow[inx]["daterow"] = false;
              })
            }
            //console.log("timeTableRow", timeTableRow)
          })

          //this.SlotNClassSubjects.push("<div style='background-color:lightgray'>"+header+"</div>");
          this.SlotNClassSubjects.push(header);
          this.SlotNClassSubjects.push(SlotRow);
          RowsForOneExamDate.push(...timeTableRow);

          RowsForOneExamDate.forEach(row => {
            this.SlotNClassSubjects.push(row);
          })
          //this.SlotNClassSubjects.push(...timeTableRow);

          //console.log("SlotNClassSubjects", this.SlotNClassSubjects)
        })
        this.dataSource = new MatTableDataSource<any>(this.SlotNClassSubjects);
        this.loading = false; this.PageLoading = false;
      })
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.SlotNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSLOTNAME);
    //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.Batches = this.tokenStorage.getBatches()
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);

    //this.shareddata.ChangeBatch(this.Batches);
    this.GetExams();
    this.GetExamSlots();
    this.GetClassSubject();
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
export interface ISlotNClassSubject {
  SlotClassSubjectId: number;
  SlotId: number;
  Slot: string;
  ClassSubjectId: number;
  ClassSubject: string;
  SubjectId: number;
  ClassId: number;
  Active: number;
}



