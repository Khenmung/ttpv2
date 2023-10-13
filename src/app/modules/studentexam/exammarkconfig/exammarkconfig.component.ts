import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';

@Component({
  selector: 'app-exammarkconfig',
  templateUrl: './exammarkconfig.component.html',
  styleUrls: ['./exammarkconfig.component.scss']
})
export class ExammarkconfigComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  PageLoading = true;
  ResultReleased = 0;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ClassSubjects: any[] = [];
  AllowedSubjectIds: any[] = [];
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  rowCount = 0;
  ExamMarkConfigList: IExamMarkConfig[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
  SelectedApplicationId = 0;
  StoredForUpdate: any[] = [];
  Classes: any[] = [];
  ClassGroups: any[] = [];
  Subjects: any[] = [];
  Sections: any[] = [];
  ExamNames: any[] = [];
  Exams: any[] = [];
  Batches: any[] = [];
  StudentSubjects: any[] = [];
  //SelectedClassSubjects :any[]= [];
  Students: any[] = [];
  dataSource: MatTableDataSource<IExamMarkConfig>;
  allMasterData: any[] = [];
  Permission = 'deny';
  ExamId = 0;
  ExamMarkConfigData = {
    ExamMarkConfigId: 0,
    ExamId: 0,
    ClassId: 0,
    SectionId: 0,
    SemesterId: 0,
    ClassSubjectId: 0,
    Formula: '',
    Active: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0
  }
  displayedColumns = [
    'ExamMarkConfigId',
    'SubjectName',
    'Formula',
    'Active',
    'Action',
  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private contentservice: ContentService,
    private nav: Router,
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
    debugger;
    this.searchForm = this.fb.group({
      searchExamId: [0],
      searchClassId: [0],
      searchSectionId: [0],
      searchSemesterId: [0]
      //searchClassSubjectId: [0],
    });
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
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.EXAMMARKCONFIG)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.GetMasterData();
        //this.GetClassGroups();
        this.GetStudentGradeDefn();

      }
    }
  }
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  SelectedClassCategory = '';
  Defaultvalue = 0;
  Semesters: any[] = [];
  ClassCategory: any[] = [];
  clearData() {
    this.ExamMarkConfigList = [];
    this.dataSource = new MatTableDataSource(this.ExamMarkConfigList);
  }
  Calculatemark(element) {
    //   debugger;
    // var arr =[1, 2, 3, 4, 5];

    //   var a=evaluate(element.Formula)// // returns Array  [1, 2, 3]
    element.Action = true;
    // row.Action = true;
    // //console.log("three elment of a",a.entries[0])
  }
  GetExamMarkConfig() {
    debugger;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    //var _classSubjectId = this.searchForm.get("searchClassSubjectId")?.value;
    var _examId = this.searchForm.get("searchExamId")?.value
    let filterStr = this.FilterOrgSubOrgBatchId;

    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      filterStr += ' and ExamId eq ' + _examId
    }
    // if (_classId == 0) {
    //   this.contentservice.openSnackBar("Please select class", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    _classId = _classId ? _classId : 0;
    _sectionId = _sectionId ? _sectionId : 0;
    _semesterId = _semesterId ? _semesterId : 0;
    filterStr += ' and ClassId eq ' + _classId;
    //if (_semesterId)
    filterStr += ' and SemesterId eq ' + _semesterId;
    //if (_sectionId)
    filterStr += ' and SectionId eq ' + _sectionId;

    // if (_classSubjectId == 0) {
    //   this.contentservice.openSnackBar("Please select subject", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }

    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    //var _classSubjectId = this.ClassSubjects.filter(c => c.ClassId == _classId && c.SubjectId == _subjectId)[0].ClassSubjectId;
    // if (_classSubjectId > 0) {
    //   filterStr += " and ClassSubjectId eq " + _classSubjectId;
    // }
    this.loading = true;
    let list: List = new List();
    list.fields = [
      'ExamMarkConfigId',
      'ExamId',
      'ClassId',
      'SemesterId',
      'SectionId',
      'ClassSubjectId',
      'Formula',
      'Active'
    ];

    list.PageName = "ExamMarkConfigs";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ExamMarkConfigList = [];
        var clsssubjects = globalconstants.getFilteredClassSubjects(this.ClassSubjects, _classId, _sectionId, _semesterId);
        // var clsssubjects = this.ClassSubjects.filter(clssubject =>
        //        clssubject.ClassId == _classId
        //     && clssubject.SectionId == (_sectionId ? _sectionId : clssubject.SectionId)
        //     && clssubject.SemesterId == (_semesterId ? _semesterId : clssubject.SemesterId));
        clsssubjects.forEach((s,indx) => {
          var existing = data.value.filter((f: any) => f.ClassSubjectId == s.ClassSubjectId)
          if (existing.length > 0) {
            existing[0].SubjectName = s.SubjectName;
            existing[0].Sequence = indx;
            this.ExamMarkConfigList.push(existing[0]);
          }
          else {
            this.ExamMarkConfigList.push({
              ExamMarkConfigId: 0,
              ExamId: _examId,
              ClassId: _classId,
              SectionId: _sectionId,
              SemesterId: _semesterId,
              ClassSubjectId: s.ClassSubjectId,
              SubjectName: s.SubjectName,
              Sequence:indx,
              Formula: '',
              Active: false,
              Action: false
            })
          }
        })
        let noSubject = data.value.filter(f => f.ClassSubjectId == 0
          && f.ClassId == _classId
          && f.SectionId == _sectionId
          && f.SemesterId == _semesterId)
        if (noSubject.length > 0) {
          noSubject[0].Sequence = -1;
          noSubject[0].SubjectName ='All';
          this.ExamMarkConfigList.push(noSubject[0])
        }
        else {
          this.ExamMarkConfigList.push({
            ExamMarkConfigId: 0,
            ExamId: _examId,
            ClassId: _classId,
            SectionId: _sectionId,
            SemesterId: _semesterId,
            ClassSubjectId: 0,
            SubjectName: 'All',
            Sequence:-1,
            Formula: '',
            Active: false,
            Action: false
          })
        }
        if (this.ExamMarkConfigList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.ExamMarkConfigList=this.ExamMarkConfigList.sort((a,b)=>a.Sequence - b.Sequence);
        this.dataSource = new MatTableDataSource(this.ExamMarkConfigList);
        this.dataSource.paginator = this.paginator;

        this.loading = false;
        // }, error => {
        //   this.loading = false;

      })
  }

  GetResultReleased(source) {
    //this.ResultReleased = this.Exams.filter(e => e.ExamId == source.value)[0].ReleaseResult;
    this.FilterClass();
    this.clearData();
  }
  updateActive(row, value) {
    //if(!row.Action)
    row.Action = true;
    row.Active = value.checked;
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

    debugger;
    if (row.Formula.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter formula", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    var _examId = this.searchForm.get("searchExamId")?.value;
    var _classId = this.searchForm.get("searchClassId")?.value;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let checkFilterString = this.FilterOrgSubOrgBatchId + " and ExamId eq " + _examId +
      " and ClassSubjectId eq " + row.ClassSubjectId +
      " and ClassId eq " + _classId;



    if (row.ExamMarkConfigId > 0)
      checkFilterString += " and ExamMarkConfigId ne " + row.ExamMarkConfigId;

    let list: List = new List();
    list.fields = ["ExamMarkConfigId"];
    list.PageName = "ExamMarkConfigs";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          // let _examstatus = 0;
          // if (row.Marks >= row.PassMark)
          //   _examstatus = this.ExamStatuses.filter((f:any) => f.MasterDataName.toLowerCase() == "pass")[0].MasterDataId;
          // else
          //   _examstatus = this.ExamStatuses.filter((f:any) => f.MasterDataName.toLowerCase() == "fail")[0].MasterDataId;

          this.ExamMarkConfigData.ExamMarkConfigId = row.ExamMarkConfigId;
          this.ExamMarkConfigData.ExamId = _examId;
          this.ExamMarkConfigData.Active = row.Active;
          this.ExamMarkConfigData.ClassSubjectId = row.ClassSubjectId ? row.ClassSubjectId : 0;
          this.ExamMarkConfigData.Formula = row.Formula;
          this.ExamMarkConfigData.ClassId = _classId ? _classId : 0;
          this.ExamMarkConfigData.SectionId = row.SectionId ? row.SectionId : 0;
          this.ExamMarkConfigData.SemesterId = row.SemesterId ? row.SemesterId : 0;
          this.ExamMarkConfigData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ExamMarkConfigData.SubOrgId = this.SubOrgId;
          this.ExamMarkConfigData.BatchId = this.SelectedBatchId;
          ////console.log("this.ExamMarkConfigData", this.ExamMarkConfigData)
          if (this.ExamMarkConfigData.ExamMarkConfigId == 0) {
            this.ExamMarkConfigData["CreatedDate"] = new Date();
            this.ExamMarkConfigData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ExamMarkConfigData["UpdatedDate"] = new Date();
            delete this.ExamMarkConfigData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ExamMarkConfigData["CreatedDate"];
            delete this.ExamMarkConfigData["CreatedBy"];
            this.ExamMarkConfigData["UpdatedDate"] = new Date();
            this.ExamMarkConfigData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('ExamMarkConfigs', this.ExamMarkConfigData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ExamMarkConfigId = data.ExamMarkConfigId;
          row.Action = false;
          if (this.rowToUpdate == 0) {
            this.loading = false;
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch('ExamMarkConfigs', this.ExamMarkConfigData, this.ExamMarkConfigData.ExamMarkConfigId, 'patch')
      .subscribe(
        (data: any) => {
          //this.loading = false; this.PageLoading=false;
          row.Action = false;
          if (this.rowToUpdate == 0) {
            this.loading = false;
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }
  // GetClassGroupMapping() {
  //   var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
  //   this.contentservice.GetClassGroupMapping(filterOrgSubOrg, 1)
  //     .subscribe((data: any) => {
  //       this.ClassGroupMapping = data.value.map(f => {
  //         f.ClassName = f.Class.ClassName;
  //         return f;
  //       });

  //       this.loading = false;
  //       this.PageLoading = false;
  //     })
  // }
  GetclassgroupMappings() {
    this.contentservice.GetClassGroupMappings(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassGroupMappings = []
          data.value.forEach(m => {
            let filtered = this.ClassGroups.filter(g => g.ClassGroupId == m.ClassGroupId);
            if (filtered.length > 0) {
              m.GroupName = filtered[0].GroupName;
              let cls = this.Classes.filter((f: any) => f.ClassId == m.ClassId);
              if (cls.length > 0) {
                m.ClassName = cls[0].ClassName;
                let sec = this.Sections.filter((f: any) => f.MasterDataId == m.SectionId);
                if (sec.length > 0)
                  m.ClassName += "-" + sec[0].MasterDataName;
                let sem = this.Semesters.filter((f: any) => f.MasterDataId == m.SemesterId);
                if (sem.length > 0)
                  m.ClassName += "-" + sem[0].MasterDataName;
                //m.ClassName = m.Class.ClassName;
                this.ClassGroupMappings.push(m);
              }
            }
          });
          //console.log('this.ClassGroupMappings', this.ClassGroupMappings);
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
      });
  }
  GetClassGroups() {
    this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassGroups = [...data.value];
          this.GetclassgroupMappings();
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
      });
  }
  ClassGroupMappings: any[] = [];
  FilteredClasses: any[] = [];
  ExamReleased = 0;
  ExamClassGroupMaps: any[] = [];
  FilterClass() {
    debugger;
    var _examId = this.searchForm.get("searchExamId")?.value
    // var _classId = this.searchForm.get("searchClassId")?.value
    // var _sectionId = this.searchForm.get("searchSectionId")?.value
    // var _semesterId = this.searchForm.get("searchSemesterId")?.value
    //var _classGroupId = 0;
    this.ExamReleased = 0;
    this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg, _examId)
      .subscribe((data: any) => {
        this.ExamClassGroupMaps = [...data.value];
        var objExamClassGroupMaps = this.ExamClassGroupMaps.filter(g => g.ExamId == _examId);
        this.FilteredClasses = this.ClassGroupMappings.filter((f: any) => objExamClassGroupMaps.findIndex(fi => fi.ClassGroupId == f.ClassGroupId) > -1);
        //console.log('this.FilteredClasse', this.FilteredClasses)
      });

    var obj = this.Exams.filter((f: any) => f.ExamId == _examId);
    if (obj.length > 0) {
      //this.ClassGroupIdOfExam = obj[0].ClassGroupId;     

      this.ExamReleased = obj[0].ReleaseResult;
    }

    //this.SelectedClassStudentGrades = this.StudentGrades.filter((f:any) =>f.ExamId == _examId 
    //  && this.ExamClassGroups.findIndex(element=> element.ClassGroupId == f.ClassGroupId)>-1);

  }
  SelectClassSubject() {
    debugger;
    var _classId = this.searchForm.get("searchClassId")?.value;
    this.SelectedClassCategory = '';

    if (_classId > 0) {
      let obj = this.Classes.filter((f: any) => f.ClassId == _classId);
      if (obj.length > 0)
        this.SelectedClassCategory = obj[0].Category;
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.clearData();
  }

  GetClassSubject() {

    //let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";
    let list: List = new List();
    list.fields = [
      "ClassSubjectId",
      "Active",
      "SubjectId",
      "ClassId",
      "SemesterId",
      "SubjectCategoryId",
      "Confidential"
    ];
    list.PageName = "ClassSubjects";
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.ClassSubjects = [];
        data.value.forEach(cs => {
          var _class = '';
          var objclass = this.Classes.filter(c => c.ClassId == cs.ClassId)
          if (objclass.length > 0) {

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
                SectionId: cs.SectionId,
                SemesterId: cs.SemesterId,
                Confidential: cs.Confidential,
                ClassSubject: _class + '-' + _subject,
                SubjectName: _subject,
                SubjectCategoryId: cs.SubjectCategoryId
              })
            }
          }
        })
        this.ClassSubjects = this.contentservice.getConfidentialData(this.tokenStorage, this.ClassSubjects, "ClassSubject");
        this.loading = false;
      })
  }

  //ExamMarkFormula = '';
  StudentGrades: any[] = [];
  SelectedClassStudentGrades: any[] = [];
  GetStudentGradeDefn() {
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetStudentGrade(filterOrgSubOrg)
      .subscribe((data: any) => {
        this.StudentGrades = [...data.value];
      })
    this.PageLoading = false;
  }
  GetSpecificStudentGrades() {
    debugger;
    var _examId = this.searchForm.get("searchExamId")?.value;
    var _classGroupId = 0;

    if (_examId > 0) {
      var obj = this.Exams.filter((f: any) => f.ExamId == _examId)
      if (obj.length > 0) {
        _classGroupId = obj[0].ClassGroupId;
        this.SelectedClassStudentGrades = this.StudentGrades.filter((f: any) => f.ClassGroupId == _classGroupId);
      }
      else {
        this.contentservice.openSnackBar("Class group not found for selected class.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }
  }

  checkall(value) {
    this.ExamMarkConfigList.forEach(record => {
      record.Active = value.checked;
      record.Action = !record.Action;
    })
  }
  rowToUpdate = 0;
  saveall() {

    var toupdate = this.ExamMarkConfigList.filter(record => record.Action)
    this.rowToUpdate = toupdate.length;
    toupdate.forEach(record => {
      this.rowToUpdate--;
      this.UpdateOrSave(record);
    })
  }
  onBlur(element) {
    element.Action = true;
  }

  // UpdateAll() {
  //   this.ExamMarkConfigList.forEach(element => {
  //     this.SaveRow(element);
  //   })
  // }
  // SaveRow(element) {
  //   debugger;
  //   this.loading = true;
  //   this.rowCount = 0;
  //   //var columnexist;
  //   for (var prop in element) {

  //     var row: any = this.StoredForUpdate.filter((s:any) => s.SubjectMarkComponent == prop
  //       && s.StudentClassSubjectId == element.StudentClassSubjectId);

  //     if (row.length > 0 && prop != 'StudentClassSubject' && prop != 'Action') {
  //       row[0].Active = 1;
  //       row[0].Marks = row[0][prop];
  //       this.UpdateOrSave(row[0]);
  //     }
  //   }
  // }
  SubjectCategory: any[] = [];
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);

    // this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
    //   .subscribe((data: any) => {
    //     this.ClassGroups = [...data.value];
    //   });
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    // this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
    //   this.Classes = [...data.value];
    //   this.GetClassSubject();
    // })
    this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      this.Classes = [];
      data.value.forEach(m => {
        let obj = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Category = obj[0].MasterDataName.toLowerCase();
         this.Classes.push(m);
        }
      });
      this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
      this.GetClassGroups();
      this.GetClassSubject();
    });
    //if role is teacher, only their respective class and subject will be allowed.
    if (this.LoginUserDetail[0]['RoleUsers'][0].role == 'Teacher') {
      this.GetAllowedSubjects();
    }

    this.GetExams();

  }
  GetAllowedSubjects() {

    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
      'SectionId',
      'SemesterId',
      'TeacherId',
      'Active',
    ];

    list.PageName = "ClassSubjects"
    list.filter = ['Active eq 1 and TeacherId eq ' + localStorage.getItem('nameId') +
      ' and BatchId eq ' + this.SelectedBatchId + ' and OrgId eq ' + this.LoginUserDetail[0]['orgId']];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AllowedSubjectIds = [...data.value];
        var _AllClassId = [...this.Classes];

        if (this.AllowedSubjectIds.length > 0) {
          this.Classes = _AllClassId.map(m => {
            var result = this.AllowedSubjectIds.filter(x => x.ClassId == m.ClassId);
            if (result.length > 0)
              return m;
          })
        }
      });
  }
  GetExams() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] +
      ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId", "ReleaseResult", "ClassGroupId", "MarkFormula"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 " + orgIdSearchstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.forEach(e => {
          var _examName = '';
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0) {

            _examName = obj[0].MasterDataName;

            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: _examName,
              ReleaseResult: e.ReleaseResult,
              ClassGroupId: e.ClassGroupId,
              MarkFormula: e.MarkFormula
            });
          }
        })
        this.PageLoading = false;
        ////console.log("exams", this.Exams);
        //this.GetStudentSubjects();
      })
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
export interface IExamMarkConfig {
  ExamMarkConfigId: number;
  ExamId: number;
  ClassId: number;
  SectionId: number;
  SemesterId: number;
  ClassSubjectId: number;
  SubjectName: string;
  Sequence:number;
  Formula: string;
  Active: boolean;
  Action: boolean;
}


