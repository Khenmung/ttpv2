import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import alasql from 'alasql';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { TableUtil } from '../../../shared/TableUtil';

@Component({
  selector: 'app-studentsubjectreport',
  templateUrl: './studentsubjectreport.component.html',
  styleUrls: ['./studentsubjectreport.component.scss']
})
export class StudentSubjectReportComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  PageLoading = true;
  ResultReleased = 0;
  Defaultvalue = 0;
  LoginUserDetail: any[] = [];
  Semesters: any[] = [];
  CurrentRow: any = {};
  ClassSubjects: any[] = [];
  AllowedSubjectIds: any[] = [];
  FilterOrgSubOrgBatchId = '';
  loading = false;
  rowCount = 0;
  ExamStudentSubjectResult: IExamStudentSubjectResult[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
  SelectedApplicationId = 0;
  //StoredForUpdate :any[]= [];
  SubjectMarkComponents: any[] = [];
  MarkComponents: any[] = [];
  Classes: any[] = [];
  //ClassGroups :any[]= [];
  Subjects: any[] = [];
  Sections: any[] = [];
  //ExamStatuses :any[]= [];
  //ExamNames :any[]= [];
  //Exams :any[]= [];
  Batches: any[] = [];
  StudentSubjects: any[] = [];
  SelectedClassSubjects: any[] = [];
  Students: any[] = [];
  dataSource: MatTableDataSource<IExamStudentSubjectResult>;
  allMasterData: any[] = [];
  Permission = 'deny';
  ExamId = 0;
  ExamStudentSubjectResultData = {
    ExamStudentSubjectResultId: 0,
    StudentClassId: 0,
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
    'SubjectName',
    'SubjectCount'
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
      searchClassId: [0],
      searchSectionId: [0],
      searchClassSubjectId: [0],
      searchSemesterId: [0]
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
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.STUDENTSUBJECTREPORT)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetStudents();
        //this.GetClassGroupMapping();
        //this.GetStudentGradeDefn();

      }
    }
  }

  GetClassGroupMapping() {
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroupMapping(filterOrgSubOrg, 1)
      .subscribe((data: any) => {
        this.ClassGroupMapping = data.value.map(f => {
          f.ClassName = f.Class.ClassName;
          return f;
        });
        this.loading = false;
        this.PageLoading = false;
      })
  }
  FilteredClasses: any[] = [];
  SubjectCount: any[] = [];
  ExportArray() {
    debugger;
    if (this.StudentSubjects.length > 0) {
      let stud = {}
      const datatoExport: Partial<any>[] = this.StudentSubjects.map(m => {
        stud = { "Student": m.Name, "Class": m.ClassName, "Section": m.SectionName, "Semester": m.SemesterName, "Subject": m.SubjectName, }
        return stud;
      });
      TableUtil.exportArrayToExcel(datatoExport, "StudentSubjects");
    }
  }
  GetStudentSubjects() {
    debugger;

    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _classSubjectId = this.searchForm.get("searchClassSubjectId")?.value;
    //var _examId =this.searchForm.get("searchExamId")?.value
    // if (_examId == 0) {
    //   this.contentservice.openSnackBar("Please select exam", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_classSubjectId == 0) {
      this.contentservice.openSnackBar("Please select subject.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    var studclssubjfilter = this.FilterOrgSubOrgBatchId + " and Active eq 1";
    studclssubjfilter += " and ClassId eq " + _classId;
    if (_semesterId)
      studclssubjfilter += " and SemesterId eq " + _semesterId;
    if (_sectionId)
      studclssubjfilter += " and SectionId eq " + _sectionId;
    if (_classSubjectId > 0) {
      //filterStr += " and ClassSubjectId eq " + _classSubjectId;
      studclssubjfilter += " and ClassSubjectId eq " + _classSubjectId;

    }
    //filterStr += " and ClassId eq " + _classId;

    let list: List = new List();
    list.fields = [
      //'ClassId', 'ClassSubjectId', 'SubjectId'
      "StudentClassSubjectId,ClassSubjectId,ClassId,SectionId,SemesterId,SubjectId,StudentClassId,Active"
    ];
    //list.PageName = "ClassSubjects"
    list.PageName = "StudentClassSubjects";
    //list.lookupFields = ["StudentClassSubjects($filter=" + studclssubjfilter + ";$select=StudentClassSubjectId,ClassSubjectId,StudentClassId,Active)"]
    list.filter = [studclssubjfilter];
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _class = '';
        var _subject = '';
        var _section = '';
        var _semester = '';
        var _studname = '';

        this.StudentSubjects = [];
        var filteredStudents = this.Students.filter((f: any) => f.StudentClasses.length > 0
          && f.StudentClasses[0].ClassId == _classId
          && f.StudentClasses[0].SemesterId == _semesterId
          && f.StudentClasses[0].SectionId == _sectionId
          && f.Active == 1);

        //dbdata = data.value.filter(x =>x.StudentClassSubjects.filter(y=>y.StudentClass.SectionId == _sectionId).length>0)
        ////console.log("this.StudentSubjects", this.StudentSubjects);
        data.value.forEach(s => {
          //s.StudentClassSubjects.forEach((inner, index) => {

          ////console.log("index",index);
          var studentcls: any = filteredStudents.filter((f: any) => f.StudentClasses[0].StudentClassId == s.StudentClassId);
          _class = '';
          _subject = '';
          _studname = '';
          //let _studentObj = this.Students.filter(c => c.StudentId == s.StudentClass.StudentId);
          //if (_studentObj.length > 0) {
          //  var _lastname = _studentObj[0].LastName == null || _studentObj[0].LastName == '' ? '' : " " + _studentObj[0].LastName;
          //  _studname = _studentObj[0].FirstName + _lastname;
          if (studentcls.length > 0) {
            let _stdClass = this.Classes.find(c => c.ClassId == s.ClassId);
            if (_stdClass)
              _class = _stdClass.ClassName;

            let _stdSubject = this.Subjects.find(c => c.MasterDataId == s.SubjectId);
            if (_stdSubject)
              _subject = _stdSubject.MasterDataName;

            let _stdSection = this.Sections.find(c => c.MasterDataId == studentcls[0].StudentClasses[0].SectionId);
            if (_stdSection)
              _section = _stdSection.MasterDataName;
            let _stdSemester = this.Semesters.find(c => c.MasterDataId == studentcls[0].StudentClasses[0].SemesterId);
            if (_stdSemester)
              _semester = _stdSemester.MasterDataName;
            //if section is selected, item is taken only if section object length >0
            if (_sectionId > 0) {
              if (_stdSection && studentcls[0].StudentClasses[0].SectionId == _sectionId) {
                this.StudentSubjects.push({
                  Name: studentcls[0].FirstName + " " + studentcls[0].LastName,
                  RollNo: studentcls[0].StudentClasses[0].RollNo,
                  SubjectName: _subject,
                  ClassName: _class,
                  SectionName: _section,
                  SemesterName: _semester,
                  SubjectId: s.SubjectId,
                  ClassId: s.ClassId,
                  StudentId: studentcls[0].StudentClasses[0].StudentId,
                  SectionId: studentcls[0].StudentClasses[0].SectionId,
                  SemesterId: studentcls[0].StudentClasses[0].SemesterId,
                })
              }
            }
            else {
              this.StudentSubjects.push({
                Name: studentcls[0].FirstName + " " + studentcls[0].LastName,
                RollNo: studentcls[0].StudentClasses[0].RollNo,
                SubjectName: _subject,
                ClassName: _class,
                SectionName: _section,
                SemesterName: _semester,
                SubjectId: s.SubjectId,
                ClassId: s.ClassId,
                StudentId: studentcls[0].StudentClasses[0].StudentId,
                SectionId: studentcls[0].StudentClasses[0].SectionId,
                SemesterId: studentcls[0].StudentClasses[0].SemesterId,
              })
            }
          }
          //})
        })
        //SubjectCount :any[]= [];
        this.displayedColumns = [
          "RollNo",
          'Name',
          //     'SubjectName'
        ];

        //this.SubjectCount = alasql("select count(SubjectName) SubjectCount,SubjectName,SectionName,ClassName,Name from ? group by SubjectName,SectionName,ClassName,Name", [this.StudentSubjects]);
        this.StudentSubjects = this.StudentSubjects.sort((a, b) => a.SubjectName - b.SubjectName)
        if (this.StudentSubjects.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource(this.StudentSubjects);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
        this.PageLoading = false;
      }, error => {
        debugger;
        console.log(error)
      });
  }
  SelectedClassCategory = '';
  SelectClassSubject() {
    debugger;
    let _classId = this.searchForm.get("searchClassId")?.value;
    let obj = this.Classes.filter(c => c.ClassId == _classId);
    if (obj.length > 0) {
      this.SelectedClassCategory = obj[0].Category.toLowerCase();
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.SelectedClassSubjects = this.ClassSubjects.filter((f: any) => f.ClassId == _classId
      && f.SelectHowMany > 0);
    //this.GetSpecificStudentGrades();
  }
  GetStudents() {
    this.loading = true;
    // let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]

    // let list: List = new List();
    // list.fields = [
    //   "StudentId",
    //   "FirstName",
    //   "LastName"
    // ];
    // list.PageName = "Students";
    // list.filter = [filterStr];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    var _students: any = this.tokenStorage.getStudents()!;
    this.Students = _students.filter((s: any) => s.Active == 1);
    this.GetMasterData();
    //});
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
      "SectionId",
      "SemesterId",
      "SubjectCategoryId",
      "Confidential"
    ];
    list.PageName = "ClassSubjects";
    list.lookupFields = ["SubjectType($select=SubjectTypeName,SelectHowMany)"];
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
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
              Confidential: cs.Confidential,
              ClassSubject: _class + '-' + _subject,
              SubjectName: _subject,
              SubjectCategoryId: cs.SubjectCategoryId,
              SubjectTypeId: cs.SubjectTypeId,
              SubjectTypeName: cs.SubjectType.SubjectTypeName,
              SelectHowMany: cs.SubjectType.SelectHowMany
            })
          }
        })
        this.ClassSubjects = this.contentservice.getConfidentialData(this.tokenStorage, this.ClassSubjects, "ClassSubject");
        this.loading = false;
        this.PageLoading = false;
      })
  }
  GetSubjectMarkComponents(pClassSubjectId) {
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    var orgIdSearchstr = this.FilterOrgSubOrgBatchId + " and Active eq 1";
    orgIdSearchstr += ' and ClassSubjectId eq ' + pClassSubjectId;

    //filterstr = 'ExamId eq ' + this.searchForm.get("searchExamId")?.value;

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
    list.filter = [orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SubjectMarkComponents = [];
        data.value.forEach(x => {
          var clsSubject = this.ClassSubjects.filter((f: any) => f.ClassSubjectId == x.ClassSubjectId)
          if (clsSubject.length > 0) {
            x.SubjectId = clsSubject[0].SubjectId;
            x.SemesterId = clsSubject[0].SemesterId;
            x.SectionId = clsSubject[0].SectionId;
            x.ClassId = clsSubject[0].ClassId;
            this.SubjectMarkComponents.push(x);
          }
        })
        this.SubjectMarkComponents = this.SubjectMarkComponents.map(c => {
          var _sequence = 0;
          var _sequenceObj = this.MarkComponents.filter((s: any) => s.MasterDataId == c.SubjectComponentId);
          if (_sequenceObj.length > 0) {
            _sequence = _sequenceObj[0].Sequence
          }
          return {
            "ClassSubjectMarkComponentId": c.ClassSubjectMarkComponentId,
            "ClassId": c.ClassId,
            "SemesterId": c.SemesterId,
            "SectionId": c.SectionId,
            "SubjectId": c.SubjectId,
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
        //this.GetExamStudentSubjectResults();
      })
  }

  StudentGrades: any[] = [];
  SelectedClassStudentGrades: any[] = [];
  ClassGroupMapping: any[] = [];
  // GetClassGroupMapping() {
  //   var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
  //   //+ ' and BatchId eq ' + this.SelectedBatchId;

  //   let list: List = new List();

  //   list.fields = ["ClassId,ClassGroupId"];
  //   list.PageName = "ClassGroupMappings";
  //   list.filter = ["Active eq 1" + orgIdSearchstr];
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.ClassGroupMapping = [...data.value];
  //     })
  // }
  GetStudentGradeDefn() {
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetStudentGrade(filterOrgSubOrg)
      .subscribe((data: any) => {
        this.StudentGrades = [...data.value];
      })
    this.PageLoading = false;
  }
  // GetSpecificStudentGrades() {
  //   debugger;
  //   var _examId = this.searchForm.get("searchExamId")?.value;
  //   var _classGroupId = 0;

  //   if (_examId > 0) {
  //     var obj = this.Exams.filter((f:any) => f.ExamId == _examId)
  //     if (obj.length > 0) {
  //       _classGroupId = obj[0].ClassGroupId;
  //       this.SelectedClassStudentGrades = this.StudentGrades.filter((f:any) => f.ClassGroupId == _classGroupId);
  //     }
  //     else {
  //       this.contentservice.openSnackBar("Class group not found for selected class.", globalconstants.ActionText, globalconstants.RedBackground);
  //       return;
  //     }
  //   }
  // }

  checkall(value) {
    this.ExamStudentSubjectResult.forEach(record => {
      if (value.checked)
        record.Active = 1;
      else
        record.Active = 0;
      record.Action = !record.Action;
    })
  }

  SubjectCategory: any[] = [];
  ClassCategory: any[] = [];
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);

    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      data.value.forEach(m => {
        let obj = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Category = obj[0].MasterDataName.toLowerCase();
          this.Classes.push(m);
        }
      });
      this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
      this.GetClassSubject();
    });
    // this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
    //   if(data.value) this.Classes = [...data.value]; else this.Classes = [...data];
    //   this.GetClassSubject();
    // })

    //if role is teacher, only their respective class and subject will be allowed.
    if (this.LoginUserDetail[0]['RoleUsers'][0].role == 'Teacher') {
      this.GetAllowedSubjects();
    }
  }
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  GetAllowedSubjects() {
    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
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
  // GetExams() {

  //   var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] +
  //     ' and BatchId eq ' + this.SelectedBatchId;

  //   let list: List = new List();

  //   list.fields = ["ExamId", "ExamNameId", "ReleaseResult", "ClassGroupId"];
  //   list.PageName = "Exams";
  //   list.filter = ["Active eq 1 " + orgIdSearchstr];

  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.Exams = [];
  //       data.value.forEach(e => {
  //         var _examName = '';
  //         var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
  //         if (obj.length > 0) {

  //           _examName = obj[0].MasterDataName;

  //           this.Exams.push({
  //             ExamId: e.ExamId,
  //             ExamName: _examName,
  //             ReleaseResult: e.ReleaseResult,
  //             ClassGroupId: e.ClassGroupId
  //           });
  //         }
  //       })
  //       this.PageLoading = false;
  //       ////console.log("exams", this.Exams);
  //       //this.GetStudentSubjects();
  //     })
  // }

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


