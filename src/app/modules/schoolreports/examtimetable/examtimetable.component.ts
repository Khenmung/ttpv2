import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import * as moment from 'moment';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
@Component({
  selector: 'app-examtimetable',
  templateUrl: './examtimetable.component.html',
  styleUrls: ['./examtimetable.component.scss']
})
export class ExamtimetableComponent implements OnInit {
  PageLoading = true;
  @ViewChild('allSelected') private allSelected: MatOption;
  Defaultvalue = 0;
  weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};

  NoOfColumn = 0;
  SelectedExamName = '';
  SelectedClasses = '';
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  GradingSlotNClassSubjects: any[] = [];
  MarkingSlotNClassSubjects: any[] = [];
  SelectedApplicationId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  ExamSlots: any[] = [];
  Classes: any[] = [];
  Semesters: any[] = [];
  Sections: any[] = [];
  Subjects: any[] = [];
  ExamNames: any[] = [];
  SlotNames: any[] = [];
  Batches: any[] = [];
  Exams: any[] = [];
  DateArray: any[] = [];
  ClassSubjectList: any[] = [];
  GradingdataSource: MatTableDataSource<[]>;
  MarkingdataSource: MatTableDataSource<[]>;
  allMasterData: any[] = [];
  Permission = 'deny';
  ExamId = 0;
  SlotNClassSubjectData = {
    SlotClassSubjectId: 0,
    SlotId: 0,
    ClassSubjectId: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns: any[] = [
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
      searchClassId: [0],
      searchSectionId: [0],
      searchSemesterId: [0]
    });
    this.PageLoad();
  }
  ClassCategory = [];
  AllStudents: any[] = [];
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    ////console.log('loginuserdetail', this.LoginUserDetail)
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.EXAMTIMETABLE);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.AllStudents = this.tokenStorage.getStudents()!;
        this.GetMasterData();
        this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
          this.Classes = [];
          data.value.forEach(m => {
            let obj: any = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId);
            if (obj.length > 0) {
              m.Category = obj[0].MasterDataName.toLowerCase();
              this.Classes.push(m);
            }
          })
          if (this.LoginUserDetail[0]['RoleUsers'][0]['role'].toLowerCase() == 'student') {
            let _classId = this.tokenStorage.getClassId();
            this.Classes = this.Classes.filter(c => c.ClassId == _classId);
          }
          else
            this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);


        });

      }
    }
  }

  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }

  GetClassSubject() {
    //let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";
    //filterStr += ' and BatchId eq ' + this.SelectedBatchId;
    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
      'SubjectCategoryId',
      'Active'
    ];

    list.PageName = "ClassSubjects";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  ////console.log('data.value', data.value);
        this.ClassSubjectList = data.value.map(item => {
          var _class = '';
          var clsObj = this.Classes.filter(c => c.ClassId == item.ClassId);
          if (clsObj.length > 0)
            _class = clsObj[0].ClassName
          var _subject = '', _subCategory = '';
          var subjObj = this.Subjects.filter(c => c.MasterDataId == item.SubjectId);
          if (subjObj.length > 0)
            _subject = subjObj[0].MasterDataName;
          var subjCatObj: any = this.SubjectCategory.filter((c: any) => c.MasterDataId == item.SubjectCategoryId);
          if (subjCatObj.length > 0)
            _subCategory = subjCatObj[0].MasterDataName;

          return {
            ClassSubjectId: item.ClassSubjectId,
            ClassSubject: _class + " - " + _subject,
            SubjectCategory: _subCategory,
            SubjectId: item.SubjectId,
            ClassId: item.ClassId
          }
        })
        this.loading = false; this.PageLoading = false;
      });
  }
  GetExams() {

    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId, 2)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.map(e => {
          var obj = this.ExamNames.find(n => n.MasterDataId == e.ExamNameId);
          if (obj)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj.MasterDataName,
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
      "ClassGroupId",
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
        //var filteredExams = data.value.filter(d => d.ExamId == this.searchForm.get("searchExamId")?.value)

        this.ExamSlots = data.value.map(s => {

          let exams = this.ExamNames.find(e => e.MasterDataId === s.Exam.ExamNameId);
          var _slotName = this.SlotNames.find(e => e.MasterDataId === s.SlotNameId).MasterDataName;

          //var day = this.weekday[new Date(s.ExamDate).getDay()]
          var _examname = '';
          if (exams)
            _examname = exams.MasterDataName;
          return {
            SlotId: s.ExamSlotId,
            ClassGroupId: s.ClassGroupId,
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
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  SelectedClassCategory = '';
  BindSectionSemester() {
    let _classId = this.searchForm.get("searchClassId")?.value;

    let obj = this.Classes.filter(c => c.ClassId == _classId);
    if (obj.length > 0) {
      this.SelectedClassCategory = obj[0].Category.toLowerCase();
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();
  }
  ClearData() {
    this.GradingSlotNClassSubjects = [];
    this.MarkingSlotNClassSubjects = [];
    this.GradingdataSource = new MatTableDataSource<any>(this.GradingSlotNClassSubjects);
    this.MarkingdataSource = new MatTableDataSource<any>(this.MarkingSlotNClassSubjects);
  }
  toggleAllSelection() {
    debugger;
    let obj = this.searchForm.get("searchClassId")!;
    if (this.allSelected.selected) {

      obj.patchValue([...this.Classes.map(item => item.ClassId), 0]);
    } else {
      obj.patchValue([]);
    }
  }
  tosslePerOne() {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }

    if (this.searchForm.get("searchClassId")?.value.length == this.Classes.length) {
      this.allSelected.select();

    }
    return true;


  }
  GetSlotNClassSubjects() {
    //////console.log("this.searchForm.get(searchClassId).value",this.searchForm.get("searchClassId")?.value)
    //var orgIdSearchstr = this.FilterOrgSubOrgBatchId; // ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = ' and Active eq 1 ';
    let _examId = this.searchForm.get("searchExamId")?.value;
    let _classId = this.searchForm.get("searchClassId")?.value;
    let _sectionId = this.searchForm.get("searchSectionId")?.value;
    let _semesterId = this.searchForm.get("searchSemesterId")?.value;
    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    this.SelectedClasses = '';

    this.SelectedExamName = this.Exams.find((f: any) => f.ExamId == _examId).ExamName;
    var classesobj = this.Classes.find((f: any) => f.ClassId == _classId);
    if (classesobj)
      this.SelectedClasses = classesobj.ClassName;
    var semesterobj = this.Semesters.find((f: any) => f.MasterDataId == _semesterId);
    if (semesterobj)
      this.SelectedClasses += "-" + semesterobj.MasterDataName;
    var sectionobj = this.Sections.find((f: any) => f.MasterDataId == _sectionId);
    if (sectionobj)
      this.SelectedClasses += "-" + sectionobj.MasterDataName;

    filterstr += " and ClassId eq " + _classId;
    filterstr += " and SemesterId eq " + _semesterId;
    filterstr += " and SectionId eq " + _sectionId;
    //this.SelectedClasses =  this.SelectedClasses.
    let list: List = new List();
    list.fields = [
      "SlotClassSubjectId",
      "SlotId",
      "ClassSubjectId",
      "Active"];
    list.PageName = "SlotAndClassSubjects";
    list.lookupFields = [//"ClassSubject($select=ClassSubjectId,SubjectId,ClassId)",
      "Slot($filter=Active eq 1;$select=SlotNameId,ExamId,ExamDate,ClassGroupId,StartTime,EndTime,Sequence)"];
    list.filter = [this.FilterOrgSubOrgBatchId + filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        var filteredData: any[] = [];
        let _classSubjects = globalconstants.getFilteredClassSubjects(this.ClassSubjectList, _classId, _sectionId, _semesterId)
        let _classGroupIds = this.ClassGroupMapping.filter(c => c.ClassId === _classId);
        let _classGroupOfExam = this.ExamClassGroups.find(e => e.ExamId === _examId
          && _classGroupIds.findIndex(i => i.ClassGroupId === e.ClassGroupId) > -1);
        let result = data.value.filter(d => d.Slot.ExamId === _examId && d.Slot.ClassGroupId === _classGroupOfExam.ClassGroupId)
        if (_classId > 0)
          result.forEach(d => {
            d.Slot.ExamDate = moment(d.Slot.ExamDate).format('DD/MM/yyyy');
            let clssub = _classSubjects.find(sub => sub.ClassSubjectId == d.ClassSubjectId)
            if (d.Slot.ExamId == _examId && clssub) {
              d.ClassSubject = JSON.parse(JSON.stringify(clssub));
              filteredData.push(d);
            }
          })
        else
          data.value.forEach(d => {
            d.Slot.ExamDate = moment(d.Slot.ExamDate).format('DD/MM/yyyy');
            if (d.Slot.ExamId == _examId) {
              filteredData.push(d);
            }
          });

        this.GradingSlotNClassSubjects = [];
        this.MarkingSlotNClassSubjects = [];
        this.displayedColumns = [];

        let markingSubjectsData = filteredData.filter(cat => cat.ClassSubject.SubjectCategory.toLowerCase() == 'marking');
        let gradingSubjectsData = filteredData.filter(cat => cat.ClassSubject.SubjectCategory.toLowerCase() == 'grading');
        if (markingSubjectsData.length > 0) {
          this.MarkingSlotNClassSubjects = this.GenerateTable(markingSubjectsData);
          this.MarkingdataSource = new MatTableDataSource<any>(this.MarkingSlotNClassSubjects);
        }
        if (gradingSubjectsData.length > 0) {
          this.GradingSlotNClassSubjects = this.GenerateTable(gradingSubjectsData);
          this.GradingdataSource = new MatTableDataSource<any>(this.GradingSlotNClassSubjects);
        }
        // if (this.MarkingSlotNClassSubjects.length == 0) {
        //   this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);

        // }


        this.loading = false; this.PageLoading = false;
      })
  }
  GenerateTable(pSelectedClsSlotnSubjects) {
    let str = "select distinct Slot->ExamDate as ExamDate,Slot->ClassGroupId as ClassGroupId from ? " +
      "where Slot->ClassGroupId =? order by Slot->ExamDate,Slot->ClassGroupId";
    var _EachExamDate: any = alasql(str, [pSelectedClsSlotnSubjects, pSelectedClsSlotnSubjects[0].Slot.ClassGroupId]);
    var filteredOneSlotSubjects: any[] = [];
    let _examId = this.searchForm.get("searchExamId")?.value;
    debugger;
    _EachExamDate = _EachExamDate.sort((a, b) => {
      let start = a.ExamDate.split('/');
      let end = b.ExamDate.split('/');
      return new Date(start[2], start[1], start[0]).getTime() - new Date(end[2], end[1], end[0]).getTime()
    });
    ////console.log('_EachExamDate', _EachExamDate)
    //preparing data for each exam date
    //var timeTableRow = {};
    var _SlotNClassSubjects: any[] = [];
    _EachExamDate.forEach(edate => {
      var RowsForOneExamDate: any[] = [];

      var header = {};
      var _examDate = edate.ExamDate;
      var daynumber = moment(_examDate, 'DD/MM/YYYY').day()
      var day = this.weekday[daynumber]
      var _dateHeader = '<b>' + _examDate + " - " + day + "</b>";
      var timeTableRow: any[] = [];

      var examDateSlot = this.ExamSlots.filter((f: any) => {
        return f.ExamDate == _examDate && f.ClassGroupId == edate.ClassGroupId && f.ExamId == _examId
      });//.sort((a,b)=>a.Sequence - b.Sequence);

      //SubjectRow = {};
      examDateSlot.forEach((slot, index) => {
        var oneSlotClasslist: any[] = [];
        if (index == 0) {
          header["Slot0"] = _dateHeader + ",&nbsp;<b>" + slot.SlotName + "</b>";
          header["daterow"] = true;
        }
        else {
          header["daterow"] = true;
          header["Slot" + index] = "<b>" + slot.SlotName + "</b>";
        }
        //SlotRow["Slot" + index] = "<b>" + slot.SlotName + "</b>";
        let indxstr = 'Slot' + index;
        if (this.displayedColumns.indexOf(indxstr) == -1)
          this.displayedColumns.push(indxstr);

        //filtering only for one slot in one exam date
        filteredOneSlotSubjects = pSelectedClsSlotnSubjects.filter((f: any) => f.SlotId == slot.SlotId
          && f.Slot.ClassGroupId === slot.ClassGroupId
          && moment(f.Slot.ExamDate).format('dd/MM/yyyy') == moment(edate.ExamDate).format('dd/MM/yyyy'))
          .sort((a, b) => a.Slot.Sequence - b.Slot.Sequence);
        //timeTableRow["ExamDate"]["slot" + index]["ClassSubject"] :any[]= [];
        ////console.log("filteredOneSlotSubjects",filteredOneSlotSubjects)

        var distinctClasses = alasql("select distinct ClassSubject->ClassId as ClassId from ? ", [filteredOneSlotSubjects]);
        oneSlotClasslist = distinctClasses.map(distcls => {
          var _classobj = this.Classes.find((s: any) => s.ClassId == distcls.ClassId);
          var _className = '';
          var _classSequence = '';
          if (_classobj) {
            _classSequence = _classobj.Sequence;
            _className = _classobj.ClassName;
          }
          //timeTableRow.push({ "ClassName": _className })
          return { ["Slot" + index]: slot.SlotName, "ClassName": _className, "ClassId": distcls.ClassId, "Sequence": _classSequence, "Subjects": '' }
        });

        ////console.log("oneSlotClasslist", oneSlotClasslist);
        filteredOneSlotSubjects.forEach(f => {
          let _subject = '';
          let obj = this.Subjects.find((s: any) => s.MasterDataId == f.ClassSubject.SubjectId)
          if (obj)
            _subject = obj.MasterDataName;
          var classobj = oneSlotClasslist.find(c => c.ClassId == f.ClassSubject.ClassId)
          if (classobj)
            classobj.Subjects += classobj.Subjects.length == 0 ? classobj.ClassName + " - " + _subject : ", " + _subject
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
        ////console.log("timeTableRow", timeTableRow)
      })

      //this.SlotNClassSubjects.push("<div style='background-color:lightgray'>"+header+"</div>");
      _SlotNClassSubjects.push(header);
      //this.SlotNClassSubjects.push(SlotRow);
      RowsForOneExamDate.push(...timeTableRow);

      RowsForOneExamDate.forEach(row => {
        _SlotNClassSubjects.push(row);
      })
    })
    return _SlotNClassSubjects;
  }
  SubjectCategory = [];
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.SlotNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSLOTNAME);
    //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.Batches = this.tokenStorage.getBatches()!;
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY);

    //this.shareddata.ChangeBatch(this.Batches);
    this.GetExams();
    this.GetExamSlots();
    this.GetClassSubject();
    this.Getclassgroups();
    this.GetClassGroupMapping();
  }
  ClassGroupMapping: any = [];
  GetClassGroupMapping() {
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroupMapping(filterOrgSubOrg, 1)
      .subscribe((data: any) => {
        this.ClassGroupMapping = data.value.map(f => {

          f.ClassName = f.Class.ClassName;
          f.Sequence = f.Class.Sequence;
          return f;
        });
      })
  }
  ExamClassGroups: any = [];
  FilteredClasses: any = [];
  ExamChange() {
    let _examId = this.searchForm.get("searchExamId")?.value;
    this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg, _examId)
      .subscribe((data: any) => {
        this.ExamClassGroups = data.value.map(e => {
          e.GroupName = this.ClassGroups.filter(c => c.ClassGroupId == e.ClassGroupId)[0].GroupName;
          return e;
        })
        let _filteredClassGroup = this.ExamClassGroups.filter(e => e.ExamId == _examId);
        this.FilteredClasses = this.ClassGroupMapping.filter((f: any) => _filteredClassGroup.findIndex(fi => fi.ClassGroupId == f.ClassGroupId) > -1);
        this.FilteredClasses = this.FilteredClasses.sort((a, b) => a.Sequence - b.Sequence);
      })
  }
  ClassGroups: any[] = [];
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
  SubjectId: number;
  ClassId: number;
  Active: number;
}



