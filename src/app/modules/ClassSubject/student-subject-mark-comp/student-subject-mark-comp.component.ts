import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-student-subject-mark-comp',
  templateUrl: './student-subject-mark-comp.component.html',
  styleUrls: ['./student-subject-mark-comp.component.scss']
})
export class StudentSubjectMarkCompComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  loading = false;
  Permission = '';
  LoginUserDetail: any[] = [];
  CurrentBatch = '';
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  SubOrgId = 0;
  SelectedApplicationId = 0;
  Defaultvalue = 0;
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  StandardOrgIdWithPreviousBatchId = '';
  PreviousBatchId = 0;
  Classes: any[] = [];
  Subjects: any[] = [];
  Sections: any[] = [];
  ClassSubjectWithComponents: any[] = [];
  ClassSubjects: any[] = [];
  ClassGroups: any[] = [];
  MarkComponents: any[] = [];
  SelectedClassSubjects: any[] = [];
  Batches: any[] = [];
  Semesters: any[] = [];
  ELEMENT_DATA: ISubjectMarkComponent[] = [];
  dataSource: MatTableDataSource<ISubjectMarkComponent>;
  allMasterData: any[] = [];
  searchForm: UntypedFormGroup;
  classSubjectComponentData = {
    ClassSubjectMarkComponentId: 0,
    ClassSubjectId: 0,
    SectionId: 0,
    SemesterId: 0,
    SubjectComponentId: 0,
    ExamId: 0,
    FullMark: 0,
    PassMark: 0,
    OverallPassMark: 0,
    BatchId: 0,
    OrgId: 0, SubOrgId: 0,
    Active: 0
  };
  Exams: any[] = [];
  ExamNames: any[] = [];
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,

    private route: Router,
    private fb: UntypedFormBuilder,
    private shareddata: SharedataService) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null || this.LoginUserDetail.length == 0)
      this.route.navigate(['auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.SUBJECTMARKCOMPONENT);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.StandardOrgIdWithPreviousBatchId = globalconstants.getOrgSubOrgFilterWithPreviousBatchId(this.tokenStorage);
        this.searchForm = this.fb.group({
          searchExamId: [0],
          searchSubjectId: [0],
          searchClassId: [0],
          searchCopyExamId: [0],
          searchSemesterId: [0],
          searchSectionId: [0],
        });
        //debugger;
        //this.GetClassFee();
        this.PageLoad();
      }
    }
  }
  PageLoad() {
    //this.shareddata.CurrentSelectedBatchId.subscribe(c=>this.SelectedBatchId=c);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;

    this.GetMasterData();
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroupMapping(filterOrgSubOrg, 1)
      .subscribe((data: any) => {
        this.ClassGroupMappings = data.value.map(m => {
          m.ClassName = m.Class.ClassName;
          m.ClassId = m.Class.ClassId;
          m.SemesterId = m.Class.SemesterId;
          m.SectionId = m.Class.SectionId;
          return m;
        })
      })

  }
  //displayedColumns = ['position', 'name', 'weight', 'symbol'];
  ClassGroupMappings: any[] = [];
  displayedColumns = ['ClassSubjectMarkComponentId', 
 //'ClassSubject', 
  'SubjectComponent', 
  'FullMark', 
  'PassMark', 
  'OverallPassMark', 
  'Active', 'Action'];
  SelectedClassCategory = '';
  SelectClassSubject() {
    debugger;
    //this.SelectedClassSubjects = this.ClassSubjects.filter((f:any) => f.ClassId == this.searchForm.get("searchClassId")?.value);
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    this.SelectedClassSubjects = globalconstants.getFilteredClassSubjects(this.ClassSubjects, _classId, _sectionId, _semesterId);
    this.ELEMENT_DATA = [];
    this.dataSource = new MatTableDataSource<any>([]);
    let obj = this.Classes.filter(c => c.ClassId == _classId);
    if (obj.length > 0) {
      this.SelectedClassCategory = obj[0].Category.toLowerCase();
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
  }
  UpdateSelectedBatchId(value) {
    this.SelectedBatchId = value;
  }
  onBlur(element) {
    element.Action = element.PassMark < 1000 && element.FullMark < 1000 ? true : false;
  }
  SelectAll(event) {
    //var event ={checked:true}
    this.ELEMENT_DATA.forEach(element => {
      element.Active = event.checked ? 1 : 0;
      element.Action = true;
    })
  }
  ToUpdateCount = -1;
  // SaveAll() {
  //   debugger;
  //   var toUpdate = this.ELEMENT_DATA.filter(all => all.Action)
  //   this.ToUpdateCount = toUpdate.length;
  //   toUpdate.forEach(item => {
  //     this.UpdateOrSave(item);
  //   })
  // }  
  // Save(element) {
  //   this.ToUpdateCount = 1;
  //   this.UpdateOrSave(element);
  // }
  RowCount = 0;
  DataCollection: any = [];
  SaveAll() {
    debugger;
    //var _toUpdate = this.StudentClassList.filter((f: any) => f.Action);
    //this.DataCountToSave = this.ClassSubjectList.length;
    this.RowCount = 0;
    this.DataCollection = [];
    this.loading = true;
    var toUpdate = this.ELEMENT_DATA.filter((f: any) => f.Action);
    this.ToUpdateCount = toUpdate.length;
    toUpdate.forEach((record) => {
      this.DataCollection.push(JSON.parse(JSON.stringify(record)));
      this.UpdateOrSave(record);
    })
  }
  SaveRow(row) {
    debugger;
    //this.NoOfRecordToUpdate = 0;
    this.DataCollection = [];
    this.DataCollection.push(JSON.parse(JSON.stringify(row)));
    this.RowCount = 0;
    this.ToUpdateCount = 1;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {
    //debugger;
    this.loading = true;
    var _examId = this.searchForm.get("searchExamId")?.value;
    let checkFilterString = this.FilterOrgSubOrgBatchId + //"OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      " and ClassSubjectId eq " + row.ClassSubjectId +
      " and SemesterId eq " + row.SemesterId +
      " and SectionId eq " + row.SectionId +
      " and SubjectComponentId eq " + row.SubjectComponentId +
      " and ExamId eq " + _examId;

    if (row.ClassSubjectMarkComponentId > 0)
      checkFilterString += " and ClassSubjectMarkComponentId ne " + row.ClassSubjectMarkComponentId;

    let list: List = new List();
    list.fields = ["ClassSubjectMarkComponentId"];
    list.PageName = "ClassSubjectMarkComponents";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.RowCount += 1;
          if (this.RowCount == this.DataCollection.length) {
            this.DataCollection.forEach(item => {

              this.classSubjectComponentData.Active = item.Active;// == true ? 1 : 0;
              this.classSubjectComponentData.ClassSubjectMarkComponentId = item.ClassSubjectMarkComponentId;
              this.classSubjectComponentData.ClassSubjectId = item.ClassSubjectId;
              this.classSubjectComponentData.SemesterId = item.SemesterId;
              this.classSubjectComponentData.SectionId = item.SectionId;
              this.classSubjectComponentData.SubjectComponentId = item.SubjectComponentId;
              this.classSubjectComponentData.ExamId = item.ExamId;
              this.classSubjectComponentData.FullMark = item.FullMark == '' ? 0 : item.FullMark;
              this.classSubjectComponentData.PassMark = item.PassMark == '' ? 0 : item.PassMark;
              this.classSubjectComponentData.OverallPassMark = item.OverallPassMark == '' ? 0 : item.OverallPassMark;
              this.classSubjectComponentData.BatchId = this.SelectedBatchId;
              this.classSubjectComponentData.OrgId = this.LoginUserDetail[0]["orgId"];
              this.classSubjectComponentData.SubOrgId = this.SubOrgId;

              if (this.classSubjectComponentData.ClassSubjectMarkComponentId == 0) {
                this.classSubjectComponentData["CreatedDate"] = new Date();
                this.classSubjectComponentData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
                delete this.classSubjectComponentData["UpdatedDate"];
                delete this.classSubjectComponentData["UpdatedBy"];
                //////console.log('this', this.classSubjectComponentData);
                this.insert(item);
              }
              else {
                delete this.classSubjectComponentData["CreatedDate"];
                delete this.classSubjectComponentData["CreatedBy"];
                this.classSubjectComponentData["UpdatedDate"] = new Date();
                this.classSubjectComponentData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];

                this.update(item);
              }
            })
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('ClassSubjectMarkComponents', this.classSubjectComponentData, 0, 'post')
      .subscribe(
        (data: any) => {

          let insertedItem = this.DataCollection.filter(f => f.SubjectComponentId == row.SubjectComponentId
            && f.ClassSubjectId == row.ClassSubjectId
            && f.ClassId == row.ClassId
            && f.SectionId == row.SectionId
            && f.SemesterId == row.SemesterId);

          if (insertedItem.length > 0) {
            insertedItem[0].ClassSubjectMarkComponentId = data.ClassSubjectMarkComponentId;
            insertedItem[0].Action = false;
          }

          this.ToUpdateCount--;

          if (this.ToUpdateCount == 0) {
            this.loading = false;
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.router.navigate(['/home/pages']);
        });

  }
  update(row) {

    this.dataservice.postPatch('ClassSubjectMarkComponents', this.classSubjectComponentData, this.classSubjectComponentData.ClassSubjectMarkComponentId, 'patch')
      .subscribe(
        (data: any) => {
          let updatedItem = this.DataCollection.filter(f => f.ClassSubjectMarkComponentId == row.ClassSubjectMarkComponentId);
          if (updatedItem.length > 0)
            updatedItem[0].Action = false;
          
          this.ToUpdateCount--;
          if (this.ToUpdateCount == 0) {
            this.loading = false;
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  ClassCategory: any[] = [];
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);

    this.Batches = this.tokenStorage.getBatches()!;
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroups(filterOrgSubOrg)
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      })
    //this.shareddata.ChangeBatch(this.Batches);
    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId, 2)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.forEach(f => {
          var obj = this.ExamNames.filter(e => e.MasterDataId == f.ExamNameId);
          if (obj.length > 0) {
            f.ExamName = obj[0].MasterDataName;
            this.Exams.push(f);
          }

        })
      });

    //if (this.Classes.length == 0) {
    //var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.loading = true;
    this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
      data.value.forEach(m => {
        let obj = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Category = obj[0].MasterDataName.toLowerCase();
          this.Classes.push(m);
        }
      });
      this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
      this.GetClassSubject();
    })
    //}

    this.loading = false;
    this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);

  }
  MergeSubjectnComponents() {

    this.ClassSubjectWithComponents = this.ClassSubjects.map(s => {
      s.Components = this.MarkComponents;
      return s;
    })
    this.loading = false;
  }
  GetClassSubject() {

    //let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]
    var filterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    let filterStr = filterOrgSubOrgBatchId + " and Active eq 1";
    let list: List = new List();
    list.fields = [
      "ClassSubjectId",
      "SubjectId",
      "ClassId",
      "SemesterId",
      "SectionId",
      "Active"
    ];
    list.PageName = "ClassSubjects";
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = [];
        data.value.forEach(cs => {
          var _class = '';
          var objclass = this.Classes.filter(c => c.ClassId == cs.ClassId)
          if (objclass.length > 0)
            _class = objclass[0].ClassName;

          var _subject = ''
          var objsubject = this.Subjects.filter(c => c.MasterDataId == cs.SubjectId)
          if (objsubject.length > 0) {
            _subject = objsubject[0].MasterDataName;
            this.ClassSubjects.push({
              ClassSubjectId: cs.ClassSubjectId,
              Active: cs.Active,
              SubjectId: cs.SubjectId,
              ClassId: cs.ClassId,
              SemesterId: cs.SemesterId,
              SectionId: cs.SectionId,
              ClassSubject: _class + ' - ' + _subject,
              SubjectName: _subject
            })
          }
        })
        this.MergeSubjectnComponents();
      })
  }
  CopyFromOtherExam() {
    ////console.log("here ", this.PreviousBatchId)
    var _otherExamId = this.searchForm.get("searchCopyExamId")?.value;
    var _examId = this.searchForm.get("searchExamId")?.value;
    this.PreviousBatchId = +this.tokenStorage.getPreviousBatchId()!;
    if (_examId == 0)
      this.contentservice.openSnackBar("Please select exam for which formula to define.", globalconstants.ActionText, globalconstants.RedBackground);
    else if (_otherExamId == 0)
      this.contentservice.openSnackBar("Please select exam from where formula to copy from.", globalconstants.ActionText, globalconstants.RedBackground);
    else
      this.GetClassSubjectComponent(_otherExamId)
  }
  DisableSaveButton = false;
  SelectedClasses: any[] = [];
  DisableSave() {
    var examobj = this.Exams.filter((f: any) => f.ExamId == this.searchForm.get("searchExamId")?.value);
    if (examobj.length > 0) {
      if (examobj[0].ReleaseResult == 1)
        this.DisableSaveButton = true;
      else
        this.DisableSaveButton = false;
    }
    else
      this.DisableSaveButton = false;
    this.ELEMENT_DATA = [];
    this.dataSource = new MatTableDataSource<any>([]);
    this.FilterClass();
  }
  ClearData() {
    this.ELEMENT_DATA = [];
    this.dataSource = new MatTableDataSource<any>([]);
  }
  datafromotherexam = '';
  GetClassSubjectComponent(otherExamId) {
    debugger;
    //var _copyExamId = this.searchForm.get("searchCopyExamId")?.value;
    var _examId = this.searchForm.get("searchExamId")?.value;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _classSubjectId = this.searchForm.get("searchSubjectId")?.value;//.SubjectId;
    var _subjectId = 0;
    var obj = this.SelectedClassSubjects.filter((f: any) => f.ClassSubjectId == _classSubjectId);
    if (obj.length > 0)
      _subjectId = obj[0].SubjectId;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var filterstr = this.FilterOrgSubOrgBatchId;
    filterstr += " and SemesterId eq " + _semesterId;
    filterstr += " and SectionId eq " + _sectionId;


    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_classSubjectId > 0) {
      filterstr += " and ClassSubjectId eq " + _classSubjectId;
    }
    if (otherExamId > 0) {
      this.datafromotherexam = "Data from '" + this.Exams.filter(e => e.ExamId == otherExamId)[0].ExamName + "'";
      filterstr += " and (ExamId eq " + _examId + " or ExamId eq " + otherExamId + ")";
      //filterstr += 'ExamId eq ' + otherExamId + " and " + this.StandardOrgIdWithBatchId;
    }
    else {
      this.datafromotherexam = '';
      filterstr += " and ExamId eq " + _examId;
    }
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }


    this.loading = true;
    let list: List = new List();
    list.fields = [
      "ClassSubjectMarkComponentId",
      "ClassSubjectId",
      "SubjectComponentId",
      "SemesterId",
      "SectionId",
      "ExamId",
      "FullMark",
      "PassMark",
      "OverallPassMark",
      "BatchId",
      "OrgId",
      "Active"
    ];
    list.PageName = "ClassSubjectMarkComponents";
    //list.lookupFields = ["ClassSubject($select=SubjectId,ClassId)"];
    list.filter = [filterstr];
    //list.orderBy = "ParentId";
    //this.ELEMENT_DATA = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        var clsSubjMarkComponentsDefinitionFiltered: any[] = [];
        //if all subject is selected.
        var fitlersectionsemesterClass = globalconstants.getFilteredClassSubjects(this.ClassSubjects, _classId, _sectionId, _semesterId);
        // clsSubjFiltered = data.value.filter(item => item.ClassSubject.ClassId == _classId);
        clsSubjMarkComponentsDefinitionFiltered = data.value.map(item => {
          var _clssubject = fitlersectionsemesterClass.filter((f: any) => f.ClassSubjectId == item.ClassSubjectId);
          if (_clssubject.length > 0) {
            item.SubjectId = _clssubject[0].SubjectId;
            item.SectionId = _clssubject[0].SectionId;
            item.SemesterId = _clssubject[0].SemesterId;
            item.ClassId = _clssubject[0].ClassId;
          }
          return item;
        });
        var filteredClassSubjectnComponents = this.ClassSubjectWithComponents.filter(clssubjcomponent =>
          clssubjcomponent.ClassId == _classId);
        if (_subjectId > 0) {
          clsSubjMarkComponentsDefinitionFiltered = clsSubjMarkComponentsDefinitionFiltered.filter(item => item.SubjectId == _subjectId);
          filteredClassSubjectnComponents = filteredClassSubjectnComponents.filter(clssubjcomponent => clssubjcomponent.SubjectId == _subjectId);
        }
        let semesterwise = clsSubjMarkComponentsDefinitionFiltered.filter(item => item.SemesterId > 0);
        if (semesterwise.length > 0)
          clsSubjMarkComponentsDefinitionFiltered = clsSubjMarkComponentsDefinitionFiltered.filter(item => item.SemesterId == _semesterId);
        let sectionwise = clsSubjMarkComponentsDefinitionFiltered.filter(item => item.SectionId > 0);
        if (sectionwise.length > 0)
          clsSubjMarkComponentsDefinitionFiltered = clsSubjMarkComponentsDefinitionFiltered.filter(item => item.SectionId == _sectionId);

        this.ELEMENT_DATA = [];
        ////////////////////
        var _CopyFromExam: any[] = [];
        var _SelectedExam = clsSubjMarkComponentsDefinitionFiltered.filter(d => d.ExamId == _examId);
        if (otherExamId > 0) {
          _CopyFromExam = clsSubjMarkComponentsDefinitionFiltered.filter(d => d.ExamId == otherExamId);

          this.ELEMENT_DATA = _CopyFromExam.map(f => {
            f.ExamId = _examId;

            let existing = _SelectedExam.filter(fromdb => fromdb.ClassSubjectId == f.ClassSubjectId
              && fromdb.SubjectComponentId == f.SubjectComponentId)

            if (existing.length > 0) {
              f.ClassSubjectMarkComponentId = existing[0].ClassSubjectMarkComponentId;
            }
            else {
              f.ClassSubjectMarkComponentId = 0;
            }
            f.ClassSubject = this.ClassSubjects.filter((s: any) => s.ClassSubjectId == f.ClassSubjectId)[0].ClassSubject;
            f.SubjectComponent = this.MarkComponents.filter(m => m.MasterDataId == f.SubjectComponentId)[0].MasterDataName;
            f.Action = false;
            f.Active = 0;
            return f;
          });
        }
        else {
          filteredClassSubjectnComponents.forEach((subj, indx) => {
            subj.Components.forEach(component => {

              let existing = clsSubjMarkComponentsDefinitionFiltered.filter(fromdb => fromdb.SubjectId == subj.SubjectId
                && fromdb.SubjectComponentId == component.MasterDataId)
              if (existing.length > 0) {
                existing.forEach(e => {
                  //e.ClassSubjectMarkComponentId = existing[0].ClassSubjectMarkComponentId;
                  e.ClassSubject = subj.ClassSubject;
                  e.SubjectComponent = this.MarkComponents.filter(m => m.MasterDataId == component.MasterDataId)[0].MasterDataName;
                  e.Action = false;
                  this.ELEMENT_DATA.push(e);
                })
              }
              else {
                let item = {
                  ClassSubjectMarkComponentId: 0,
                  ClassSubjectId: subj.ClassSubjectId,
                  ClassSubject: subj.ClassSubject,
                  SemesterId: _semesterId,
                  SectionId: _sectionId,
                  ExamId: _examId,
                  SubjectComponentId: component.MasterDataId,
                  SubjectComponent: this.MarkComponents.filter(m => m.MasterDataId == component.MasterDataId)[0].MasterDataName,
                  FullMark: 0,
                  PassMark: 0,
                  OverallPassMark: 0,
                  BatchId: 0,
                  Active: 0,
                  Action: false
                }
                this.ELEMENT_DATA.push(item);
              }
            });

          })
        }


        /////////////////////

        ////console.log("his.ELEMENT_DATA",this.ELEMENT_DATA);
        if (this.ELEMENT_DATA.length == 0)
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a, b) => b.Active - a.Active);
        this.dataSource = new MatTableDataSource<ISubjectMarkComponent>(this.ELEMENT_DATA);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      });
  }
  ExamReleased = 0;
  FilteredClasses: any[] = [];
  ExamClassGroups: any[] = [];
  FilterClass() {
    this.loading = true;
    var _examId = this.searchForm.get("searchExamId")?.value
    //var _classGroupId = 0;
    this.ExamReleased = 0;
    this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg, _examId)
      .subscribe((data: any) => {
        this.ExamClassGroups = [...data.value];
        this.FilteredClasses = this.ClassGroupMappings.filter((f: any) => this.ExamClassGroups.findIndex(fi => fi.ClassGroupId == f.ClassGroupId) > -1);
        this.loading = false;
      });
    var obj = this.Exams.filter((f: any) => f.ExamId == _examId);
    if (obj.length > 0) {
      this.ExamReleased = obj[0].ReleaseResult;
    }

  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
  }
  updateAmount(row, value) {
    row.Action = true;
    row.Amount = value;
  }
  updatePaymentOrder(row, value) {
    row.Action = true;
    //row.PaymentOrder = value;
  }
  enableAction(row, value) {
    row.Action = true;
    row.Active = !row.Active;
    //let amount = +value;
    if (Number.isNaN(value))
      value = 0;
    row.Amount = parseFloat(value);
    //////console.log('from change', row);
  }
}
export interface ISubjectMarkComponent {
  ClassSubjectMarkComponentId: number;
  ClassSubjectId: number;
  SubjectComponentId: number;
  BatchId: number;
  FullMark: number,
  PassMark: number,
  OverallPassMark: number,
  Active: number;
  Action: boolean;
}

