import { Component, OnInit, ViewChild } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { TableUtil } from '../../../shared/TableUtil';
import { MatPaginator } from '@angular/material/paginator';
import { evaluate } from 'mathjs';

@Component({
  selector: 'app-examsubjectmarkentry',
  templateUrl: './examsubjectmarkentry.component.html',
  styleUrls: ['./examsubjectmarkentry.component.scss']
})
export class ExamSubjectMarkEntryComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  Defaultvalue = 0;
  SelectedClassCategory = '';
  PageLoading = true;
  ResultReleased = 0;
  Semesters: any[] = [];
  ClassCategory: any[] = [];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ClassSubjects: any[] = [];
  ExamMarkConfigs: any[] = [];
  AllowedSubjectIds: any[] = [];
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  rowCount = 0;
  ExamStudentSubjectResult: IExamStudentSubjectResult[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
  SelectedApplicationId = 0;
  StoredForUpdate: any[] = [];
  SubjectMarkComponents: any[] = [];
  MarkComponents: any[] = [];
  Classes: any[] = [];
  ClassGroups: any[] = [];
  Subjects: any[] = [];
  Sections: any[] = [];
  ExamStatuses: any[] = [];
  ExamNames: any[] = [];
  Exams: any[] = [];
  Batches: any[] = [];
  StudentSubjects: any[] = [];
  SelectedClassSubjects: any[] = [];
  Students: any[] = [];
  dataSource: MatTableDataSource<IExamStudentSubjectResult>;
  allMasterData: any[] = [];
  Permission = 'deny';
  ExamId = 0;
  EmployeeClasses: any = [];
  ExamStudentSubjectResultData = {
    ExamStudentSubjectResultId: 0,
    StudentClassId: 0,
    ClassId: 0,
    SectionId: 0,
    SemesterId: 0,
    ExamId: 0,
    StudentClassSubjectId: 0,
    ClassSubjectMarkComponentId: 0,
    Marks: 0,
    Grade: '',
    ExamStatus: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    'StudentClassSubject',
  ];
  searchForm: UntypedFormGroup;
  ExamClassGroups: any[] = [];
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
      searchSemesterId: [0],
      searchClassSubjectId: [0],
      updateCheckBox: [0]
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
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.ExamMarkEntry)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.EmployeeClasses = this.tokenStorage.getEmployeeClasses();
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        //this.GetStudents();
        this.Students = this.tokenStorage.getStudents()!;
        this.GetMasterData();
        this.GetClassGroupMapping();
        this.GetStudentGradeDefn();
        this.GetExamMarkConfig();

      }
    }
  }
  GetResultReleased(source) {
    debugger;
    this.ResultReleased = this.Exams.filter(e => e.ExamId == source.value)[0].ReleaseResult;
    this.FilterClass();
    this.ClearData();
  }
  ClearData() {
    debugger;
    this.ExamStudentSubjectResult = [];
    this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>(this.ExamStudentSubjectResult);
    var _classId = this.searchForm.get("searchClassId")?.value
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    this.SelectedClassSubjects = globalconstants.getFilteredClassSubjects(this.ClassSubjects, _classId, _sectionId, _semesterId);
  }
  updateActive(row, value) {
    //if(!row.Action)
    row.Action = !row.Action;
    row.Active = row.Active == 1 ? 0 : 1;
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
  UpdateOrSave(row, valuerow) {

    debugger;
    //row added immediately here and rowcount is increased after duplicate check to make sure 
    // insert/update does not happen if any issue occured.
    this.DataCollection.push(JSON.parse(JSON.stringify(row)));
    if (row.Marks > row.FullMark) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Marks cannot be greater than FullMark (" + row.FullMark + ").", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (isNaN(row.Marks)) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Marks should be a number.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.Marks > 1000) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Marks cannot be greater than 1000.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _classSubjectId = this.searchForm.get("searchClassSubjectId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _examId = this.searchForm.get("searchExamId")?.value
    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_sectionId == 0 && this.SelectedClassCategory == globalconstants.CategoryHighSchool) {
      this.contentservice.openSnackBar("Please select student section.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_semesterId == 0 && this.SelectedClassCategory == globalconstants.CategoryCollege) {
      this.contentservice.openSnackBar("Please select student semester.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_classSubjectId == 0) {
      this.contentservice.openSnackBar("Please select subject", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    var _examId = this.searchForm.get("searchExamId")?.value;
    let checkFilterString = this.FilterOrgSubOrgBatchId + " and ExamId eq " + _examId +
      " and StudentClassSubjectId eq " + row.StudentClassSubjectId +
      " and ClassSubjectMarkComponentId eq " + row.ClassSubjectMarkComponentId;
    " and StudentClassId eq " + row.StudentClassId

    if (row.ExamStudentSubjectResultId > 0)
      checkFilterString += " and ExamStudentSubjectResultId ne " + row.ExamStudentSubjectResultId;
    //checkFilterString += " and " + this.StandardFilterWithBatchId;

    let list: List = new List();
    list.fields = ["ExamStudentSubjectResultId"];
    list.PageName = "ExamStudentSubjectResults";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;


        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.rowCount += 1;
          if (this.DataCollection.length == this.rowCount) {
            this.rowCount = 0;
            console.log("this.DataCollection", this.DataCollection);
            var _classId = this.searchForm.get("searchClassId")?.value;
            var _sectionId = this.searchForm.get("searchSectionId")?.value;
            var _semesterId = this.searchForm.get("searchSemesterId")?.value;

            this.DataCollection.forEach(item => {

              let _examstatus = 0;
              if (item.Marks >= item.PassMark)
                _examstatus = this.ExamStatuses.find((f: any) => f.MasterDataName.toLowerCase() == "pass").MasterDataId;
              else
                _examstatus = this.ExamStatuses.find((f: any) => f.MasterDataName.toLowerCase() == "fail").MasterDataId;

              this.ExamStudentSubjectResultData.ExamStudentSubjectResultId = item.ExamStudentSubjectResultId;
              this.ExamStudentSubjectResultData.ExamId = _examId;
              this.ExamStudentSubjectResultData.StudentClassId = item.StudentClassId;
              this.ExamStudentSubjectResultData.ClassId = _classId;
              this.ExamStudentSubjectResultData.SectionId = _sectionId;
              this.ExamStudentSubjectResultData.SemesterId = _semesterId;
              this.ExamStudentSubjectResultData.Active = item.Active;
              this.ExamStudentSubjectResultData.StudentClassSubjectId = item.StudentClassSubjectId;
              this.ExamStudentSubjectResultData.ClassSubjectMarkComponentId = item.ClassSubjectMarkComponentId;
              this.ExamStudentSubjectResultData.OrgId = this.LoginUserDetail[0]["orgId"];
              this.ExamStudentSubjectResultData.SubOrgId = this.SubOrgId;
              this.ExamStudentSubjectResultData.BatchId = this.SelectedBatchId;
              this.ExamStudentSubjectResultData.ExamStatus = _examstatus;
              this.ExamStudentSubjectResultData.Marks = parseFloat(item.Marks);


              if (this.ExamStudentSubjectResultData.ExamStudentSubjectResultId == 0) {
                this.ExamStudentSubjectResultData["CreatedDate"] = new Date();
                this.ExamStudentSubjectResultData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
                this.ExamStudentSubjectResultData["UpdatedDate"] = new Date();
                delete this.ExamStudentSubjectResultData["UpdatedBy"];
                //console.log("this.ExamStudentSubjectResultData insert", this.ExamStudentSubjectResultData)
                this.insert(item, valuerow);
              }
              else {
                delete this.ExamStudentSubjectResultData["CreatedDate"];
                delete this.ExamStudentSubjectResultData["CreatedBy"];
                this.ExamStudentSubjectResultData["UpdatedDate"] = new Date();
                this.ExamStudentSubjectResultData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
                this.update(item, valuerow);
              }
            })
          }
        }
      });
  }

  insert(row, valuerow) {

    debugger;
    this.ExamStudentSubjectResultData = JSON.parse(JSON.stringify(this.ExamStudentSubjectResultData));
    ////console.log("this.ExamStudentSubjectResultData", this.ExamStudentSubjectResultData);

    this.dataservice.postPatch('ExamStudentSubjectResults', this.ExamStudentSubjectResultData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ExamStudentSubjectResultId = data.ExamStudentSubjectResultId;
          valuerow.Action = false;
          this.rowCount += 1;
          this.loading = false; this.PageLoading = false;
          // this.rowSave += 1;
          if (this.rowCount == this.DataCollection.length) {
            this.loading = false; this.PageLoading = false;
            this.DataToSave.forEach(item => {
              item.Action = false;
            })
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row, valuerow) {
    //this.ExamStudentSubjectResultData = JSON.parse(JSON.stringify(this.ExamStudentSubjectResultData));
    ////console.log("this.ExamStudentSubjectResultData update", this.ExamStudentSubjectResultData);
    this.dataservice.postPatch('ExamStudentSubjectResults', this.ExamStudentSubjectResultData, this.ExamStudentSubjectResultData.ExamStudentSubjectResultId, 'patch')
      .subscribe(
        (data: any) => {
          //this.loading = false; this.PageLoading=false;
          valuerow.Action = false;
          this.rowCount += 1;
          if (this.rowCount == this.DataCollection.length) {// this.displayedColumns.length - 2) {
            this.loading = false; this.PageLoading = false;
            this.DataToSave.forEach(item => {
              item.Action = false;
            })
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }
  GetClassGroupMapping() {
    //var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroupMapping(this.FilterOrgSubOrg, 1)
      .subscribe((data: any) => {
        this.ClassGroupMapping = data.value.map(f => {
          f.ClassName = f.Class.ClassName;
          f.Sequence = f.Class.Sequence;
          return f;
        });
        this.loading = false;
        this.PageLoading = false;
      })
  }
  FilteredClasses: any[] = [];
  // FilterClass() {
  //   var _examId = this.searchForm.get("searchExamId")?.value
  //   var _classGroupId = 0;
  //   var obj = this.Exams.filter((f:any) => f.ExamId == _examId);
  //   if (obj.length > 0)
  //     _classGroupId = obj[0].ClassGroupId;
  //   this.FilteredClasses = this.ClassGroupMapping.filter((f:any) => f.ClassGroupId == _classGroupId);
  //   this.SelectedClassStudentGrades = this.StudentGrades.filter((f:any) => f.ClassGroupId == _classGroupId);
  // }

  ExamReleased = 0;
  FilterClass() {
    var _examId = this.searchForm.get("searchExamId")?.value
    //var _classGroupId = 0;
    this.ExamReleased = 0;
    this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg, _examId)
      .subscribe((data: any) => {
        this.ExamClassGroups = [...data.value];
        var objExamClassGroups = this.ExamClassGroups.filter(g => g.ExamId == _examId);
        this.FilteredClasses = this.ClassGroupMapping.filter((f: any) => objExamClassGroups.findIndex(fi => fi.ClassGroupId == f.ClassGroupId) > -1);
        if (this.EmployeeClasses.length > 0)
          this.FilteredClasses = this.FilteredClasses.filter(f => this.EmployeeClasses.indexOf(f.ClassId) > -1);
        this.FilteredClasses = this.FilteredClasses.sort((a, b) => a.Sequence - b.Sequence);
      });

    var obj = this.Exams.find((f: any) => f.ExamId == _examId);
    if (obj) {
      this.ExamReleased = obj.ReleaseResult;
    }

    //this.SelectedClassStudentGrades = this.StudentGrades.filter((f:any) =>f.ExamId == _examId 
    //  && this.ExamClassGroups.findIndex(element=> element.ClassGroupId == f.ClassGroupId)>-1);

  }
  GetStudentSubjects() {
    debugger;

    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _classSubjectId = this.searchForm.get("searchClassSubjectId")?.value;
    var _examId = this.searchForm.get("searchExamId")?.value
    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_sectionId == 0 && this.SelectedClassCategory == globalconstants.CategoryHighSchool) {
      this.contentservice.openSnackBar("Please select student section.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_semesterId == 0 && this.SelectedClassCategory == globalconstants.CategoryCollege) {
      this.contentservice.openSnackBar("Please select student semester.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_classSubjectId == 0) {
      this.contentservice.openSnackBar("Please select subject.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let filterStr = this.FilterOrgSubOrgBatchId;
    filterStr += " and ClassSubjectId eq " + _classSubjectId;
    filterStr += ' and ClassId eq ' + _classId;
    //if (_semesterId)
    filterStr += ' and SemesterId eq ' + _semesterId;
    //if (_sectionId)
    filterStr += ' and SectionId eq ' + _sectionId;

    filterStr += " and Active eq 1";
    let list: List = new List();
    list.fields = [
      'StudentClassSubjectId',
      'ClassSubjectId',
      'StudentClassId',
      'ClassId',
      'SectionId',
      'SemesterId',
      'Active'
    ];

    list.PageName = "StudentClassSubjects";
    //list.lookupFields = ["StudentClass($select=Active)"]
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _class = '';
        var _subject = '';
        var _section = '';
        var _semester = '';
        var _studname = '';

        this.StudentSubjects = [];

        //var dbdata = data.value.filter(x => x.ClassSubject.Active == 1)
        var dbdata: any[] = [];
        var clssubj = this.ClassSubjects.filter((f: any) => f.ClassSubjectId == _classSubjectId);
        if (data.value.length == 0) {
          this.loading = false;
          this.contentservice.openSnackBar("No student offer this subject.", globalconstants.ActionText, globalconstants.RedBackground);
          return;
        }

        data.value.forEach(x => {

          if (clssubj.length > 0) {
            //x.ClassId = clssubj[0].ClassId;
            x.SubjectId = clssubj[0].SubjectId;
            //x.SemesterId = clssubj[0].SemesterId;
            x.SubjectCategoryId = clssubj[0].SubjectCategoryId;

            var stdcls = this.Students.find(d => d.StudentClasses.length > 0 && d.StudentClasses[0].StudentClassId == x.StudentClassId);
            if (stdcls) {
              var _lastname = stdcls.LastName == null || stdcls.LastName == '' ? '' : " " + stdcls.LastName;
              _studname = stdcls.FirstName + _lastname;
              x.Name = _studname;
              //x.SectionId = stdcls[0].StudentClasses[0].SectionId;
              x.RollNo = stdcls.StudentClasses[0].RollNo;
              x.StudentId = stdcls.StudentId;
              dbdata.push(x);
            }
          }

          //return x;
        })
        dbdata.forEach(s => {
          _class = '';
          _subject = '';
          _studname = '';
          _semester = '';
          //var clssubj = this.ClassSubjects.filter((f:any)=>f.ClassSubjectId == s.ClassSubjectId);
          // let _studentObj = this.Students.filter(c => c.StudentId == s.StudentClass.StudentId);
          // if (_studentObj.length > 0) {
          //   var _lastname = _studentObj[0].LastName == null || _studentObj[0].LastName == '' ? '' : " " + _studentObj[0].LastName;
          //   _studname = _studentObj[0].FirstName + _lastname;

          let _stdClass = this.Classes.find(c => c.ClassId == s.ClassId);
          if (_stdClass) {

            _class = _stdClass.ClassName;

            let _stdSubject = this.Subjects.find(c => c.MasterDataId == s.SubjectId);
            if (_stdSubject) {
              _subject = _stdSubject.MasterDataName;

              let _stdSection = this.Sections.find(c => c.MasterDataId == s.SectionId);
              if (_stdSection) {
                _section = '-' + _stdSection.MasterDataName;
              }
              let _stdSemester = this.Semesters.find(c => c.MasterDataId == s.SemesterId);
              if (_stdSemester) {
                _semester = '-' + _stdSemester.MasterDataName;
              }

              this.StudentSubjects.push({
                StudentClassSubjectId: s.StudentClassSubjectId,
                ClassSubjectId: s.ClassSubjectId,
                StudentClassId: s.StudentClassId,
                RollNo: s.RollNo,
                StudentClassSubject: s.RollNo + '-' + s.Name,// + '-' + _class + _semester + _section,
                SubjectId: s.SubjectId,
                ClassId: s.ClassId,
                SemesterId: s.SemesterId,
                StudentId: s.StudentId,
                SectionId: s.SectionId,
                SubjectCategoryId: s.SubjectCategoryId
              })

            }
          }
        })
        ////console.log("this.StudentSubjects",this.StudentSubjects)
        this.loading = false;
        this.PageLoading = false;
        this.GetSubjectMarkComponents(_classSubjectId);
      }, error => {
        debugger;
        console.log(error)
      });
  }
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
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

    this.ClearData();
    //this.GetSpecificStudentGrades();
  }

  GetClassSubject() {

    //let filterStr = '(' + this.FilterOrgSubOrg +") and Active eq 1";
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";
    let list: List = new List();
    list.fields = [
      "ClassSubjectId",
      "Active",
      "SubjectId",
      "ClassId",
      "SectionId",
      "SemesterId",
      "SubjectCategoryId",
      "Confidential",
      "SubjectTypeId"
    ];
    list.PageName = "ClassSubjects";
    list.lookupFields = ["SubjectType($select=SubjectTypeName,SelectHowMany)"];
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.ClassSubjects = [];
        var result = data.value.filter((f: any) => f.SubjectType.SelectHowMany > 0)
        result.forEach(cs => {
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
              SectionId: cs.SectionId,
              SemesterId: cs.SemesterId,
              Confidential: cs.Confidential,
              ClassSubject: _class + '-' + _subject,
              SubjectName: _subject,
              SubjectCategoryId: cs.SubjectCategoryId
            });

          }
        })
        this.ClassSubjects = this.contentservice.getConfidentialData(this.tokenStorage, this.ClassSubjects, "ClassSubject");
        this.loading = false;
      })
  }
  GetSubjectMarkComponents(pClassSubjectId) {
    debugger;
    var orgIdSearchstr = this.FilterOrgSubOrgBatchId;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var filterstr = " and ClassId eq " + _classId + " and ExamId eq " + this.searchForm.get("searchExamId")?.value;

    filterstr += ' and ClassSubjectId eq ' + pClassSubjectId + ' and Active eq 1';


    let list: List = new List();
    list.fields = [
      "ClassSubjectMarkComponentId",
      "ClassSubjectId",
      "ExamId",
      "SubjectComponentId",
      "FullMark",
      "PassMark",
      "Active"
    ];
    list.PageName = "ClassSubjectMarkComponents";
    //list.lookupFields = ["ClassSubject($select=Active,ClassId,SubjectId)"];
    list.filter = [orgIdSearchstr + filterstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.SubjectMarkComponents = data.value.filter(x => x.ClassSubject.Active == 1)
        let clsSubject = this.ClassSubjects.find((s: any) => s.ClassSubjectId == pClassSubjectId);
        this.SubjectMarkComponents = data.value.map(c => {
          var _sequence = 0;

          var _sequenceObj = this.MarkComponents.find((s: any) => s.MasterDataId == c.SubjectComponentId);
          if (_sequenceObj) {
            _sequence = _sequenceObj.Sequence
          }
          return {
            "ClassSubjectMarkComponentId": c.ClassSubjectMarkComponentId,
            "ClassId": clsSubject.ClassId,
            //"SectionId": clsSubject[0].SectionId,
            //"SemesterId": clsSubject[0].SemesterId,
            "SubjectId": clsSubject.SubjectId,
            "ClassSubjectId": c.ClassSubjectId,
            "SubjectComponentId": c.SubjectComponentId,
            "Sequence": _sequence,
            "ExamId": c.ExamId,
            "FullMark": c.FullMark,
            "PassMark": c.PassMark,
          }
        });

        this.StudentSubjects.forEach(ss => {
          ss.Components = this.SubjectMarkComponents.filter(sc => sc.ClassSubjectId == ss.ClassSubjectId).sort((a, b) => a.Sequence - b.Sequence);
        })
        this.GetExamStudentSubjectResults();
      })
  }
  ExamMarkFormula = '';
  GetExamStudentSubjectResults() {
    debugger;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.ExamStudentSubjectResult = [];
    this.StoredForUpdate = [];
    this.loading = true;

    var _examId = this.searchForm.get("searchExamId")?.value;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _classSubjectId = this.searchForm.get("searchClassSubjectId")?.value;

    var _examMarkFormulaObj: any[];
    //for section or semester and subject
    _examMarkFormulaObj = this.ExamMarkConfigs.filter(e => e.ExamId == _examId
      && e.ClassId == _classId
      && e.SemesterId == _semesterId
      && e.SectionId == _sectionId
      && e.ClassSubjectId == _classSubjectId
      && e.Formula.length > 0);
    if (_examMarkFormulaObj.length == 0) {
      //for section or semester
      _examMarkFormulaObj = this.ExamMarkConfigs.filter(e => e.ExamId == _examId
        && e.ClassId == _classId
        // && e.SemesterId == _semesterId
        // && e.SectionId == _sectionId
        && e.ClassSubjectId == _classSubjectId
        && e.Formula.length > 0)
      if (_examMarkFormulaObj.length == 0) {
        //for class
        _examMarkFormulaObj = this.ExamMarkConfigs.filter(e => e.ExamId == _examId
          && e.ClassId == _classId
          && e.SemesterId == 0
          && e.SectionId == 0
          && e.ClassSubjectId == 0
          && e.Formula.length > 0)

        if (_examMarkFormulaObj.length > 0) {
          this.ExamMarkFormula = '';
          this.ExamMarkFormula = _examMarkFormulaObj[0].Formula;
          this.GetMultiExamsStudentSubjectResults(this.ExamMarkFormula);
        }
        else
          this.GetOneExamResult([]);
      }
      else
      // this.GetOneExamResult([]);
      {
        this.ExamMarkFormula = '';
        this.ExamMarkFormula = _examMarkFormulaObj[0].Formula;
        this.GetMultiExamsStudentSubjectResults(this.ExamMarkFormula);
      }
    }
    else {
      this.ExamMarkFormula = '';
      this.ExamMarkFormula = _examMarkFormulaObj[0].Formula;
      this.GetMultiExamsStudentSubjectResults(this.ExamMarkFormula);
    }

    // if (_examMarkFormulaObj.length == 0) {
    //   _examMarkFormulaObj = this.ExamMarkConfigs.filter(e => e.ExamId == _examId
    //     && e.ClassId == _classId && e.Formula.length > 0);
    //   if (_examMarkFormulaObj.length == 0) {
    //     _examMarkFormulaObj = this.ExamMarkConfigs.filter(e => e.ExamId == _examId && e.Formula.length > 0);
    //     if (_examMarkFormulaObj.length == 0) {
    //       this.GetOneExamResult([]);
    //     }
    //     else 
    //       this.GetmultiExamsResult(_examMarkFormulaObj[0].Formula);
    //   }
    //   else
    //     this.GetmultiExamsResult(_examMarkFormulaObj[0].Formula);
    // }
    // else
    //   this.GetmultiExamsResult(_examMarkFormulaObj[0].Formula);
  }
  exportArray() {

    const datatoExport: Partial<any>[] = this.ExamStudentSubjectResult;
    TableUtil.exportArrayToExcel(datatoExport, "markentry");
  }
  GetmultiExamsResult(pExamMarkFormula) {
    this.ExamMarkFormula = '';
    this.ExamMarkFormula = pExamMarkFormula;
    this.GetMultiExamsStudentSubjectResults(this.ExamMarkFormula);
  }
  GetOneExamResult(pExamsSubjectMarks) {
    var filterstr = '';
    this.loading = true;
    var _classId = this.searchForm.get("searchClassId")?.value
    var _classSubjectId = this.searchForm.get("searchClassSubjectId")?.value
    var _examId = this.searchForm.get("searchExamId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    filterstr = ' and ExamId eq ' + _examId + " and ClassSubjectId eq " + _classSubjectId + " and Active eq 1";

    let list: List = new List();
    list.fields = [
      "ClassSubjectMarkComponentId,ExamId,ClassSubjectId,SubjectComponentId,FullMark"
    ];
    list.PageName = "ClassSubjectMarkComponents";
    list.lookupFields = ["ExamStudentSubjectResults($filter=Deleted eq false;$select=ExamStudentSubjectResultId,ExamId,StudentClassId,StudentClassSubjectId,ClassSubjectMarkComponentId,Marks,Grade,ExamStatus,Active)"];
    list.filter = [this.FilterOrgSubOrgBatchId + filterstr];
    //list.orderBy = "ParentId";
    this.displayedColumns = [
      'StudentClassSubject',
    ];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //var _examReleased =this.Exams.filter(e=>e.ExamId == _examId)[0].ReleaseResult;
        let result: any[] = [];
        data.value.forEach(db => {
          db.ExamStudentSubjectResults.forEach(mark => {
            result.push({
              ExamStudentSubjectResultId: mark.ExamStudentSubjectResultId,
              FullMark: db.FullMark,
              SubjectComponentId: db.SubjectComponentId,
              ClassSubjectId: db.ClassSubjectId,
              StudentClassSubjectId: mark.StudentClassSubjectId,
              ClassSubjectMarkComponentId: db.ClassSubjectMarkComponentId,
              StudentClassId: mark.StudentClassId,
              ExamId: mark.ExamId,
              Marks: mark.Marks,
              Grade: mark.Grade,
              ExamStatus: mark.ExamStatus,
              Active: mark.Active
            });
          })
        })
        ////console.log("result", result);
        var toUpdate = this.searchForm.get("updateCheckBox")?.value;
        //let sectionwiseexist = this.StudentSubjects.filter(sec => sec.SectionId > 0);
        //let semesterwiseexist = this.StudentSubjects.filter(sec => sec.SemesterId > 0);

        var filteredStudentSubjects: any[] = [];
        //if (sectionwiseexist.length > 0 && semesterwiseexist.length > 0) {
        filteredStudentSubjects = this.StudentSubjects.filter(studentsubject => {
          return studentsubject.ClassId == _classId
            && studentsubject.ClassSubjectId == _classSubjectId
            && studentsubject.SectionId == _sectionId
            && studentsubject.SemesterId == _semesterId
        });
        //console.log("filteredStudentSubjects", filteredStudentSubjects)
        filteredStudentSubjects.forEach(studentsubject => {
          studentsubject.Components = studentsubject.Components.filter(c => c.ExamId == _examId)
        });

        var forDisplay;
        if (filteredStudentSubjects.length == 0 || filteredStudentSubjects[0].Components.length == 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar("Student Subject/Subject components not defined for this class subject!", globalconstants.ActionText, globalconstants.RedBackground);
          this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>([]);
          return;
        }
        debugger;
        filteredStudentSubjects.forEach(ss => {
          forDisplay = {
            RollNo: ss.RollNo,
            StudentClassSubject: ss.StudentClassSubject,
            StudentClassSubjectId: ss.StudentClassSubjectId
          }

          ss.Components.forEach(component => {
            let existing = result.filter(db => db.StudentClassSubjectId == ss.StudentClassSubjectId
              && db.ClassSubjectMarkComponentId == component.ClassSubjectMarkComponentId);
            if (existing.length > 0) {
              var _ComponentName = this.MarkComponents.filter(c => c.MasterDataId == existing[0].SubjectComponentId)[0].MasterDataName;
              var _toPush;
              if (this.displayedColumns.indexOf(_ComponentName) == -1)
                this.displayedColumns.push(_ComponentName)
              var _mark = 0;
              let _action = false;
              if (toUpdate) {
                _action = true;
                var replacedFormula: any = this.ExamMarkFormula;
                var _subjectmarkconfig = pExamsSubjectMarks.filter(m => m.StudentClassSubjectId == ss.StudentClassSubjectId)
                //if exammarkconfig is defined. other wise mark is 0
                if (_subjectmarkconfig.length > 0) {
                  _subjectmarkconfig.forEach(sub => {
                    replacedFormula = replacedFormula.replaceAll("[" + sub.ExamName + "]", sub.Marks);
                  })

                  var objresult = evaluate(replacedFormula).entries;
                  if (objresult.length > 0)
                    _mark = objresult[0].toFixed(2);
                }
                else
                  _mark = existing[0].Marks
              }
              else
                _mark = existing[0].Marks

              _toPush = {
                ExamStudentSubjectResultId: existing[0].ExamStudentSubjectResultId,
                ExamId: existing[0].ExamId,
                ClassSubjectId: ss.ClassSubjectId,
                StudentClassId: existing[0].StudentClassId,
                StudentClassSubjectId: existing[0].StudentClassSubjectId,
                StudentClassSubject: ss.StudentClassSubject,
                ClassSubjectMarkComponentId: existing[0].ClassSubjectMarkComponentId,
                SubjectCategoryId: ss.SubjectCategoryId,
                SubjectMarkComponent: _ComponentName,
                FullMark: component.FullMark,
                PassMark: component.PassMark,
                Marks: _mark,
                Grade: existing[0].Grade,
                ExamStatus: existing[0].ExamStatus,
                Active: existing[0].Active,
                Action: _action
              }
              _toPush[_ComponentName] = _mark;
              forDisplay[_ComponentName] = _mark;
              forDisplay["Action"] = _action;
              this.StoredForUpdate.push(_toPush);
            }
            else {
              var _componentName = this.MarkComponents.filter(c => c.MasterDataId == component.SubjectComponentId)[0].MasterDataName;
              if (this.displayedColumns.indexOf(_componentName) == -1)
                this.displayedColumns.push(_componentName)

              var _mark = 0;
              var replacedFormula: any = this.ExamMarkFormula;
              var _subjectmarkconfig = pExamsSubjectMarks.filter(m => m.StudentClassSubjectId == ss.StudentClassSubjectId)
              //if exammarkconfig is defined. other wise mark is 0
              if (_subjectmarkconfig.length > 0) {
                _subjectmarkconfig.forEach(sub => {
                  replacedFormula = replacedFormula.replaceAll("[" + sub.ExamName + "]", sub.Marks);
                })

                var objresult = evaluate(replacedFormula).entries;
                if (objresult.length > 0)
                  _mark = objresult[0].toFixed(2);
              }

              _toPush = {
                ExamStudentSubjectResultId: 0,
                ExamId: _examId,
                StudentClassSubjectId: ss.StudentClassSubjectId,
                ClassSubjectId: ss.ClassSubjectId,
                StudentClassId: ss.StudentClassId,
                SubjectCategoryId: ss.SubjectCategoryId,
                StudentClassSubject: ss.StudentClassSubject,
                ClassSubjectMarkComponentId: component.ClassSubjectMarkComponentId,
                SubjectMarkComponent: _componentName,
                FullMark: component.FullMark,
                PassMark: component.PassMark,
                Marks: _mark,
                Grade: '',
                ExamStatus: 0,
                Active: 0,
                Action: false
              }
              _toPush[_componentName] = _mark;
              forDisplay[_componentName] = _mark;

              this.StoredForUpdate.push(_toPush);
            }
          })
          forDisplay["Action"] = false;
          this.ExamStudentSubjectResult.push(forDisplay);

        })
        this.ExamStudentSubjectResult = this.ExamStudentSubjectResult.sort((a, b) => a.RollNo - b.RollNo);
        ////console.log("this.ExamStudentSubjectResult", this.ExamStudentSubjectResult)
        if (this.displayedColumns.indexOf("Action") == -1)
          this.displayedColumns.push("Action");
        this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>(this.ExamStudentSubjectResult);
        this.dataSource.paginator = this.paginator;
        this.loading = false; this.PageLoading = false;
      })
  }

  MultiExamsStudentSubjectResult: any[] = [];
  GetMultiExamsStudentSubjectResults(pExamSubjectFormula) {
    debugger;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.MultiExamsStudentSubjectResult = [];
    this.StoredForUpdate = [];
    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = '', mainfilter = ' and Active eq 1';
    this.loading = true;

    //var _classId = this.searchForm.get("searchClassId")?.value;
    var _classSubjectId = this.searchForm.get("searchClassSubjectId")?.value;
    //var _examId = this.searchForm.get("searchExamId")?.value;


    // var _examMarkFormulaObj = this.Exams.filter(e => e.ExamId == _examId && e.Formula.length > 0);
    // var _examMarkFormula = '';
    // if (_examMarkFormulaObj.length > 0)
    //   _examMarkFormula = _examMarkFormulaObj[0].MarkFormula;

    this.Exams.forEach((m, indx) => {
      if (pExamSubjectFormula.includes(m.ExamName)) {
        filterstr += 'ExamId eq ' + m.ExamId + " or ";
      }
    })

    if (filterstr.length > 0) {

      filterstr = filterstr.substring(0, filterstr.length - 4)
      filterstr = "Active eq true and (" + filterstr + ")";

    }

    else
      filterstr = 'Active eq true'

    if (_classSubjectId > 0) {
      // filterstr += ' and ClassSubjectId eq ' + _classSubjectId;
      mainfilter += ' and ClassSubjectId eq ' + _classSubjectId;
    }

    let list: List = new List();
    list.fields = [
      "StudentClassSubjectId",
      "ClassSubjectId",
      "StudentClassId",
      "SubjectId"
    ];
    list.PageName = 'StudentClassSubjects'
    list.lookupFields = ["ExamResultSubjectMarks($filter=" + filterstr + ";$select=ExamId,StudentClassId,StudentClassSubjectId,Marks)"];
    list.filter = [this.FilterOrgSubOrgBatchId + mainfilter];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        let result: any[] = [];

        data.value.forEach(d => {

          //loop through each exam marks
          d.ExamResultSubjectMarks.forEach(s => {
            let _examName = '';
            let examobj = this.Exams.find(e => e.ExamId == s.ExamId)
            if (examobj)
              _examName = examobj.ExamName;

            let item = {
              StudentClassSubjectId: s.StudentClassSubjectId,
              ExamId: s.ExamId,
              ExamName: _examName,
              Marks: s.Marks,
              StudentClassId: d.StudentClassId,
              ClassSubjectId: d.ClassSubjectId,
              SubjectId: d.SubjectId
            }

            result.push(item);
          });
        });

        // var distinctExam = alasql("select distinct ExamId from ? ", [result]);

        // var resultmarksum = alasql("select sum(Marks) Marks,StudentClassSubjectId,ExamId from ? group by StudentClassSubjectId,ExamId", [result]);
        // resultmarksum.forEach(f => {
        //   f.Marks = parseFloat((f.Marks / distinctExam.length).toFixed(2));
        // })

        this.GetOneExamResult(result);
      })
  }
  StudentGrades: any[] = [];
  SelectedClassStudentGrades: any[] = [];
  ClassGroupMapping: any[] = [];
  GetExamMarkConfig() {
    let list: List = new List();
    list.fields = [
      'ExamMarkConfigId',
      'ExamId',
      'ClassSubjectId',
      'Formula',
      'ClassId',
      'SectionId',
      'SemesterId',
      'Active',
    ];

    list.PageName = "ExamMarkConfigs"
    list.filter = [this.FilterOrgSubOrg + " and Active eq true"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ExamMarkConfigs = [...data.value];
      });

  }
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
    this.ExamStudentSubjectResult.forEach(record => {
      if (value.checked)
        record.Active = 1;
      else
        record.Active = 0;
      record.Action = !record.Action;
    })
  }
  DataToSave: any = [];
  SaveAll() {
    this.loading = true;
    this.DataCollection = [];

    this.DataToSave = this.ExamStudentSubjectResult.filter(f => f.Action);
    this.rowCount = 0;
    this.DataToSave.forEach(record => {

      for (var prop in record) {

        var row: any = this.StoredForUpdate.find((s: any) => s.SubjectMarkComponent === prop
          && s.StudentClassSubjectId === record.StudentClassSubjectId);

        if (row && prop !== 'StudentClassSubject' && prop !== 'Action') {
          row.Active = 1;
          row.Marks = row[prop];
          //tosave = JSON.parse(JSON.stringify(row[0]));
          this.UpdateOrSave(row, record);
        }
      }

      // if (record.Action == true) {
      //   this.UpdateOrSave(record, record);
      // }
    })
    if (this.DataToSave.length == 0) {
      this.loading = false;
    }
  }
  onBlur(element, colName) {
    debugger;
    //var _colName = event.srcElement.name;
    //////console.log("event", event);
    var indx = this.StoredForUpdate.findIndex((s: any) => s.SubjectMarkComponent == colName
      && s.StudentClassSubjectId == element.StudentClassSubjectId);
    if (indx > -1)
      this.StoredForUpdate[indx][colName] = element[colName];
    //row[0][colName] = element[colName];
    element.Action = true;
  }

  DataCollection: any = [];
  //rowSave =0;
  SaveRow(element) {
    debugger;
    this.loading = true;
    this.rowCount = 0;
    //this.rowSave = 0;
    //var columnexist;
    this.DataCollection = [];
    for (let prop in element) {

      let row: any = this.StoredForUpdate.find((s: any) => s.SubjectMarkComponent === prop
        && s.StudentClassSubjectId === element.StudentClassSubjectId);

      if (row && prop !== 'StudentClassSubject' && prop !== 'Action') {
        row.Active = 1;
        row.Marks = row[prop];
        //tosave = JSON.parse(JSON.stringify(row[0]));
        this.UpdateOrSave(row, element);
      }
    }
  }
  SubjectCategory: any[] = [];
  SubjectTypes: any[] = [];
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
    this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);

    this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      });
    // this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
    //   if(data.value) this.Classes = [...data.value]; else this.Classes = [...data];
    //   this.GetClassSubject();
    // })
    this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
      this.Classes = [];
      data.value.map(m => {
        let obj = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Category = obj[0].MasterDataName.toLowerCase();
          this.Classes.push(m);
        }
      });
      this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
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
      'SemesterId',
      'SectionId',
      'TeacherId',
      'Active',
    ];

    list.PageName = "ClassSubjects"
    list.filter = [this.FilterOrgSubOrgBatchId + ' and Active eq 1 and TeacherId eq ' + localStorage.getItem('nameId')];
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

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId", "ReleaseResult", "ClassGroupId"];
    list.PageName = "Exams";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];

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
              //MarkFormula: e.MarkFormula
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
export interface IExamStudentSubjectResult {
  ExamStudentSubjectResultId: number;
  ExamId: number;
  StudentClassSubjectId: number;
  RollNo: number;
  StudentClassSubject: string;
  ClassSubjectMarkComponentId: number;
  SubjectMarkComponent: string;
  FullMark: number;
  PassMark: number;
  Marks: number;
  Grade: string;
  ExamStatus: number;
  Active: number;
  Action: boolean;
}

