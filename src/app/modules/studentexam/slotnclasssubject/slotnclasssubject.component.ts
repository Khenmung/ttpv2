import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { boolean } from 'mathjs';
import * as moment from 'moment';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';

@Component({
  selector: 'app-slotnclasssubject',
  templateUrl: './slotnclasssubject.component.html',
  styleUrls: ['./slotnclasssubject.component.scss']
})
export class SlotnclasssubjectComponent implements OnInit {
  PageLoading = true;
  weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  ClassGroupMapping :any[]= [];
  FilteredClasses :any[]= [];

  DistinctExamDate :any[]= [];
  Permission = 'deny';
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  DataToUpdateCount = -1;
  StoreForUpdate: ISlotNClassSubject[]= [];
  ClassWiseSubjectDisplay :any[]= [];
  SelectedBatchId = 0; SubOrgId = 0;
  SelectedApplicationId = 0;
  AllSelectedSubjects :any[]= [];
  ExamSlots :any[]= [];
  Classes :any[]= [];
  Subjects :any[]= [];
  ExamNames :any[]= [];
  SlotNames :any[]= [];
  Batches :any[]= [];
  ClassSubjectList :any[]= [];
  Exams :any[]= [];
  ClassWiseDatasource: MatTableDataSource<any>[]= [];
  dataSource: MatTableDataSource<any>;
  allMasterData :any[]= [];
  rowCount = 0;
  ExamId = 0;
  SlotNClassSubjectData = {
    SlotClassSubjectId: 0,
    SlotId: 0,
    ClassSubjectId: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0,
    Active: 0
  };
  SelectedExamSlots :any[]= [];
  displayedColumns = [
    "ClassName",
    "SlotClassSubjectId",
    "Action"
  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
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
      searchSlotId: [0],
      searchExamId: [0],
      searchSubjectId: [0],
    });
    this.PageLoad();
  }
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.SLOTNCLASSSUBJECT);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);

        this.GetMasterData();
        this.GetClassGroupMapping();

      }
    }
  }
  public trackItem(index: number, item: any) {
    return item.ClassName;
  }
  updateActive(item, value, selectedSubjectname) {
    debugger;
    this.ClassWiseSubjectDisplay.filter((f:any) => {
      if (f.ClassName == item.ClassName) {
        f.Subject.forEach(sub => {
          if (sub.SubjectName == selectedSubjectname) {
            if (value.source._checked)
              sub.value = 1;
            else
              sub.value = 0;
          }
          else {
            if (sub.value != 2)
              sub.value = 0;
          }
        })
      }
    })

    item.Action = true;
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
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }

  Save(row) {
    this.DataToUpdateCount = 0;
    this.UpdateOrSave(row);
  }
  SaveRow(element) {
    debugger;
    this.loading = true;

    var classSujects = this.StoreForUpdate.filter((s:any) => s.SlotId == this.searchForm.get("searchSlotId")?.value
      && s.ClassName.toLowerCase() == element.ClassName.toLowerCase());

    this.DataToUpdateCount = 0;

    Object.keys(element).forEach(subjectname => {
      var subjectdetail = classSujects.filter((f:any) => f.Subject == subjectname)

      subjectdetail.forEach(row => {
        row.Active = element[subjectname];
        this.UpdateOrSave(row);
      })
      if (subjectdetail.length == 0) {
        this.loading = false; this.PageLoading = false;
      }
      element.Action = false;
    })
  }
  UpdateOrSave(row) {
    //console.log("row", row)
    this.loading = true;
    debugger;
    var subobject = row.Subject.filter(sub => sub.value == 1)
    if (subobject.length > 0)
      row.SelectedSubject = subobject[0];
    else
      row.Subject = {};

    if (row.SelectedSubject) {

      let checkFilterString = this.FilterOrgSubOrgBatchId + " and SlotId eq " + this.searchForm.get("searchSlotId")?.value +
        " and ClassSubjectId eq " + row.SelectedSubject.ClassSubjectId;

      if (row.SlotClassSubjectId > 0)
        checkFilterString += " and SlotClassSubjectId ne " + row.SlotClassSubjectId;
      //checkFilterString += " and " + this.StandardFilterWithBatchId;

      let list: List = new List();
      list.fields = ["SlotClassSubjectId"];
      list.PageName = "SlotAndClassSubjects";
      list.filter = [checkFilterString];

      this.dataservice.get(list)
        .subscribe((data: any) => {
          //debugger;
          if (data.length > 0) {
            this.loading = false; this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
          }
          this.InsertOrUpdate(row, row.SelectedSubject.ClassSubjectId);
        })
    }
    else {
      this.InsertOrUpdate(row, 0);
    }
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('SlotAndClassSubjects', this.SlotNClassSubjectData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.SlotClassSubjectId = data.SlotClassSubjectId;
          row.Action = false;
          this.loadingFalse();
          if (this.DataToUpdateCount == 0) {
            this.DataToUpdateCount = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.GetSelectedSubjectsForSelectedExam();
          }
        }, err => {
          row.Action = false;
          this.loadingFalse();
          console.log("slot and subject insert", err);
          this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage, globalconstants.ActionText, globalconstants.RedBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch('SlotAndClassSubjects', this.SlotNClassSubjectData, this.SlotNClassSubjectData.SlotClassSubjectId, 'patch')
      .subscribe(
        (data: any) => {
          this.loadingFalse();
          row.Action = false;
          if (this.DataToUpdateCount == 0) {
            this.DataToUpdateCount = -1;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.GetSelectedSubjectsForSelectedExam();
          }
        }, err => {
          row.Action = false;
          this.loadingFalse();
          console.log("slot and subject update", err);
          this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage, globalconstants.ActionText, globalconstants.RedBackground);
        });
  }
  InsertOrUpdate(row, pClassSubjectId) {
    this.SlotNClassSubjectData.SlotClassSubjectId = row.SlotClassSubjectId;
    this.SlotNClassSubjectData.SlotId = this.searchForm.get("searchSlotId")?.value;
    //this.SlotNClassSubjectData.Active = pClassSubjectId ? 1 : 0;
    if (pClassSubjectId)
    {
      this.SlotNClassSubjectData.ClassSubjectId = pClassSubjectId;
      this.SlotNClassSubjectData.Active = 1;
    }      
    else
    {
      delete this.SlotNClassSubjectData.ClassSubjectId;
      this.SlotNClassSubjectData.Active = 0;      
    }      

    this.SlotNClassSubjectData.OrgId = this.LoginUserDetail[0]["orgId"];
    this.SlotNClassSubjectData.SubOrgId = this.SubOrgId;
    this.SlotNClassSubjectData.BatchId = this.SelectedBatchId;
    if (this.SlotNClassSubjectData.SlotClassSubjectId == 0) {
      this.SlotNClassSubjectData["CreatedDate"] = new Date();
      this.SlotNClassSubjectData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
      this.SlotNClassSubjectData["UpdatedDate"] = new Date();
      delete this.SlotNClassSubjectData["UpdatedBy"];
      ////console.log('exam slot', this.SlotNClassSubjectData)
      this.insert(row);
    }
    else {
      delete this.SlotNClassSubjectData["CreatedDate"];
      delete this.SlotNClassSubjectData["CreatedBy"];
      this.SlotNClassSubjectData["UpdatedDate"] = new Date();
      this.SlotNClassSubjectData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
      this.update(row);
    }

  }
  onBlur(element) {
    element.Action = true;
  }
  GetClassSubject() {
    //let filterStr = '(' + this.FilterOrgSubOrg +") and Active eq 1";
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";
    this.loading = true;
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
        debugger;
        //  //console.log('data.value', data.value);
        this.ClassSubjectList = [];
        data.value.forEach(item => {
          var _class = '';
          var _subject = '';
          var clsobj = this.Classes.filter(c => c.ClassId == item.ClassId)
          var subjobj = this.Subjects.filter(c => c.MasterDataId == item.SubjectId)

          if (clsobj.length > 0 && subjobj.length > 0) {
            _class = clsobj[0].ClassName;
            _subject = subjobj[0].MasterDataName;
            this.ClassSubjectList.push({
              ClassSubjectId: item.ClassSubjectId,
              ClassSubject: _class + " - " + _subject,
              Subject: _subject,
              ClassName: _class,
              SubjectId: item.SubjectId,
              ClassId: item.ClassId
            })
          }
        })
        this.loading = false; this.PageLoading = false;
        //console.log("this.ClassSubjectList", this.ClassSubjectList);
      });
  }

  GetClassGroupMapping() {
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroupMapping(filterOrgSubOrg, 1)
      .subscribe((data: any) => {
        this.ClassGroupMapping = data.value.map(f => {
          f.ClassName = f.Class.ClassName;
          return f;
        });
      })
  }
  ExamClassGroups :any[]= [];
  FilteredClassGroup :any[]= [];
  FilterClass() {
    debugger;
    var _examId = this.searchForm.get("searchExamId")?.value
    var _classGroupId = 0;
    var obj = this.Exams.filter((f:any) => f.ExamId == _examId);

    if (obj.length > 0) {
      _classGroupId = obj[0].ClassGroupId;
      this.ExamReleased = obj[0].ReleaseResult == 1 ? true : false;
    }

    this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg, _examId)
      .subscribe((data: any) => {
        this.ExamClassGroups = data.value.map(e => {
          e.GroupName = this.ClassGroups.filter(c => c.ClassGroupId == e.ClassGroupId)[0].GroupName;
          return e;
        })
        this.FilteredClassGroup = this.ExamClassGroups.filter(e => e.ExamId == _examId);
        this.FilteredClasses = this.ClassGroupMapping.filter((f:any) => this.FilteredClassGroup.findIndex(fi => fi.ClassGroupId == f.ClassGroupId) > -1);
      })


  }
  GetExams() {

    //var orgIdSearchstr = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId", "StartDate", "EndDate", "ClassGroupId",
      "ReleaseResult", "ReleaseDate", "OrgId", "BatchId", "Active"];
    list.PageName = "Exams";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = [];
        this.ExamNames.forEach(e => {
          let existing = data.value.filter(db => db.ExamNameId == e.MasterDataId);
          if (existing.length > 0) {
            var obj = this.ExamNames.filter((f:any) => f.MasterDataId == existing[0].ExamNameId);
            if (obj.length > 0) {
              existing[0].ExamName = obj[0].MasterDataName;
              existing[0].Action = false;
              this.Exams.push(existing[0]);
            }
          }
        })
        ////console.log('this', this.Exams)
        this.Exams = this.Exams.sort((a, b) => {
          return this.getTime(a.StartDate) - this.getTime(b.StartDate)
        })
        this.loading = false; this.PageLoading = false;
      })
  }
  private getTime(date?: Date) {
    var std = new Date(date!);
    return std != null ? std.getTime() : 0;
  }
  GetExamSlots() {

    var orgIdSearchstr = this.FilterOrgSubOrgBatchId + ' and Active eq 1';
    //var filterstr = '';
    //filterstr = " and ExamDate ge datetime'" + new Date().toISOString() + "'";
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "ExamSlotId",
      "ExamId",
      "SlotNameId",
      "ExamDate",
      "StartTime",
      "Sequence",
      "EndTime"
    ];
    list.PageName = "ExamSlots";
    list.lookupFields = ["Exam($select=ExamNameId)"];
    list.filter = [orgIdSearchstr];
    //list.orderBy = "ExamDate,Sequence";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.Exams = [...data.value];
        //this.ExamSlots = 
        var result = data.value.sort((a, b) => a.ExamDate - b.ExamDate || a.Sequence - b.Sequence);
        result = result.map(s => {
          let exams = this.ExamNames.filter(e => e.MasterDataId == s.Exam.ExamNameId);
          var day = this.weekday[new Date(s.ExamDate).getDay()]
          var _examname = '';
          if (exams.length > 0)
            _examname = exams[0].MasterDataName;
          var _slotName = '';
          var obj = this.SlotNames.filter((f:any) => f.MasterDataId == s.SlotNameId);
          if (obj.length > 0)
            _slotName = obj[0].MasterDataName;
          return {
            ExamId: s.ExamId,
            ExamSlotId: s.ExamSlotId,
            ExamDate: this.datepipe.transform(s.ExamDate, 'dd/MM/yyyy'),
            ExamDateDetail: this.datepipe.transform(s.ExamDate, 'dd/MM/yyyy') + " - " + day + " - (" + s.StartTime + " - " + s.EndTime + "), " + _slotName,
            Sequence: s.Sequence
          }
        })
        this.ExamSlots = [...result];//.sort((a, b) => a.ExamDate.getTime() - b.ExamDate.getTime())
        //this.DistinctExamDate = alasql("select DISTINCT ExamId,ExamDate,ExamDateDetail from ? group by ExamId,ExamDate,ExamDateDetail",[result]);        
        //console.log("this.DistinctExamDate",this.DistinctExamDate)
      })
  }
  GetSelectedExamSlot() {
    this.SelectedExamSlots = this.ExamSlots.filter((f:any) => f.ExamId == this.searchForm.get("searchExamId")?.value)
      .sort((a, b) => moment.utc(a.ExamDate).diff(moment.utc(b.ExamDate)));
    this.emptyresult();
    this.GetSelectedSubjectsForSelectedExam();
    this.FilterClass();
  }
  GetSelectedSubjectsForSelectedExam() {

    var filterstr = this.FilterOrgSubOrgBatchId;

    filterstr += ' and ExamId eq ' + this.searchForm.get("searchExamId")?.value + ' and Active eq 1';

    let list: List = new List();
    list.fields = [
      "ExamId",
      "SlotNameId",
      "Sequence",
      "ExamDate"
    ];
    list.PageName = "Examslots";
    list.filter = [filterstr];
    list.lookupFields = ["SlotAndClassSubjects($select=SlotId,ClassSubjectId)"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AllSelectedSubjects = data.value.map(m => {
          var _slotName = this.SlotNames.filter(name => name.MasterDataId == m.SlotNameId)[0].MasterDataName;
          m.SlotName = _slotName;
          m.Tooltip = moment(m.ExamDate).format('DD/MM/yyyy') + " - " + _slotName;
          return m;
        });
        //console.log("all",this.AllSelectedSubjects)
      })
  }
  emptyresult() {
    this.ClassWiseSubjectDisplay = [];
    this.dataSource = new MatTableDataSource<any>(this.ClassWiseSubjectDisplay);
  }
  ExamReleased = false;
  GetSlotNClassSubjects() {

    debugger;
    var orgIdSearchstr = this.FilterOrgSubOrgBatchId + ' and Active eq 1';
    //var filterstr = 'Active eq 1';
    if (this.searchForm.get("searchSlotId")?.value == 0) {
      this.contentservice.openSnackBar("Please select exam slot", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    orgIdSearchstr += ' and SlotId eq ' + this.searchForm.get("searchSlotId")?.value;

    let list: List = new List();
    list.fields = [
      "SlotClassSubjectId",
      "SlotId",
      "ClassSubjectId",
      "Active"
    ];
    list.PageName = "SlotAndClassSubjects";
    list.lookupFields = ["ClassSubject($select=SubjectId,ClassId)", "Slot($select=SlotNameId)"];
    list.filter = [orgIdSearchstr];

    this.ClassWiseSubjectDisplay = [];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StoreForUpdate = [];
        this.FilteredClasses.forEach(cls => {
          this.ClassWiseSubjectDisplay.push({
            ClassName: cls.ClassName,
            Subject: []
          });
        })
        debugger;
        this.ClassWiseSubjectDisplay.forEach(displayrow => {
          displayrow["Subject"] = [];
          displayrow["SlotClassSubjectId"] = 0;
          var _currentClassSubjectlist = this.ClassSubjectList.filter((f:any) => f.ClassName == displayrow.ClassName)
            .sort((a, b) => a.Subject - b.Subject);
          _currentClassSubjectlist.forEach((clssub) => {

            var selected = 0;
            var toolTip = '';
            let existing = data.value.filter(db => db.ClassSubjectId == clssub.ClassSubjectId);

            if (existing.length > 0) {
              let existingsubject = this.AllSelectedSubjects
                .filter((f:any) => f.SlotAndClassSubjects.filter(c => c.Active==1 && c.SlotId != existing[0].SlotId && c.ClassSubjectId == clssub.ClassSubjectId).length > 0)
              if (existingsubject.length > 0) {
                toolTip = existingsubject[0].Tooltip;
                selected = 2;
              }
              displayrow["SlotClassSubjectId"] = existing[0].SlotClassSubjectId;
              displayrow["Subject"].push(
                {
                  ClassSubjectId: existing[0].ClassSubjectId,
                  SubjectName: clssub.Subject,
                  value: selected == 2 ? 2 : 1,
                  Tooltip: toolTip
                });
              // displayrow["Subject"][clssub.Subject] = +existing[0].Active;
              //displayrow['Selected'] = selected;
              this.StoreForUpdate.push({
                SlotClassSubjectId: existing[0].SlotClassSubjectId,
                SlotId: existing[0].SlotId,
                Slot: this.ExamSlots.filter((s:any) => s.ExamSlotId == existing[0].SlotId)[0].ExamSlotName,
                ClassSubjectId: existing[0].ClassSubjectId,
                ClassSubject: clssub.ClassSubject,
                Subject: clssub.Subject,
                SubjectId: existing[0].ClassSubject.SubjectId,
                ClassId: existing[0].ClassSubject.ClassId,
                ClassName: displayrow.ClassName,
                Active: existing[0].Active,
                Action: false
              });
            }
            else {
              var toopTip = '';
              let existingsubject = this.AllSelectedSubjects
                .filter((f:any) => f.SlotAndClassSubjects.filter(c => c.Active==1 && c.ClassSubjectId == clssub.ClassSubjectId).length > 0)
              if (existingsubject.length > 0) {
                toopTip = existingsubject[0].Tooltip;
                selected = 2;
              }
              displayrow["Subject"].push(
                {
                  ClassSubjectId: clssub.ClassSubjectId,
                  SubjectName: clssub.Subject,
                  value: selected,
                  Tooltip: toopTip
                });

              this.StoreForUpdate.push({
                SlotClassSubjectId: 0,
                SlotId: this.searchForm.get("searchSlotId")?.value,
                Slot: this.ExamSlots.filter((s:any) => s.ExamSlotId == this.searchForm.get("searchSlotId")?.value)[0].ExamSlotName,
                ClassSubjectId: clssub.ClassSubjectId,
                ClassSubject: clssub.ClassSubject,
                Subject: clssub.Subject,
                SubjectId: clssub.ClassSubject.SubjectId,
                ClassId: clssub.ClassSubject.ClassId,
                ClassName: displayrow.ClassName,
                Active: 0,
                Action: false
              });
            }
          });
          displayrow["Action"] = false;
        })
        if (this.StoreForUpdate.length == 0) {
          this.contentservice.openSnackBar("No record found! Subject not defined in class subject module.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        //console.log('ClassWiseSubjectDisplay', this.ClassWiseSubjectDisplay)
        this.dataSource = new MatTableDataSource<any>(this.ClassWiseSubjectDisplay);
        this.loading = false; this.PageLoading = false;
      })
  }
  checkall(value) {
    this.StoreForUpdate.forEach(record => {
      if (value.checked)
        record.Active = 1;
      else
        record.Active = 0;
      record.Action = !record.Action;
    })
  }
  SaveAll() {
    debugger;
    var toUpdate = this.ClassWiseSubjectDisplay.filter((f:any) => f.Action == true);
    this.DataToUpdateCount = toUpdate.length;
    toUpdate.forEach(record => {
      this.DataToUpdateCount--;
      this.UpdateOrSave(record);
    })
  }

  UpdateAll() {
    this.StoreForUpdate.forEach(element => {
      this.SaveRow(element);
    })
  }


  IsEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
      return false;
    }

    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];

      // If values of same property are not equal,
      // objects are not equivalent
      if (a[propName] !== b[propName]) {
        return false;
      }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.SlotNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSLOTNAME);
    //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      this.Classes = [...data.value];
      this.GetExams();
      this.GetExamSlots();
      this.GetClassSubject();
      this.Getclassgroups();
    })
    //this.shareddata.ChangeBatch(this.Batches);


  }
  ClassGroups :any[]= [];
  Getclassgroups() {
    this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassGroups = [...data.value];
        }
        else {
          this.contentservice.openSnackBar("Class group: " + globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
      });
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
  Subject: string,
  SubjectId: number;
  ClassId: number;
  ClassName: string;
  Active: number;
  Action: boolean;
}


