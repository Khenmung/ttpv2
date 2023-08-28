import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import alasql from 'alasql';
import { Observable } from 'rxjs';

import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
//import { ClasssubjectComponent } from '../studentsubject/classsubject.component';

@Component({
  selector: 'app-studentsubjectdashboard',
  templateUrl: './studentsubjectdashboard.component.html',
  styleUrls: ['./studentsubjectdashboard.component.scss']
})
export class studentsubjectdashboardComponent implements OnInit {
  PageLoading = true;
  //@Input() StudentClassId:number;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("table") mattable;
  StudentDetail: any = {};
  rowCount = 0;
  edited = false;
  LoginUserDetail:any[]= [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  SelectedStudentSubjectCount :any[]= [];
  StudentDetailToDisplay = '';
  SelectedApplicationId = 0;
  StudentClassId = 0;
  //StandardFilter = '';
  loading = false;
  ClassSubjectList :any[]= [];
  Sections :any[]= [];
  Classes :any[]= [];
  Subjects :any[]= [];
  Semesters :any[]= [];
  SelectedBatchId = 0; SubOrgId = 0;
  Batches :any[]= [];
  StudentClassSubjects :any[]= [];
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  StudentSubjectList: IStudentSubject[]= [];
  dataSource: MatTableDataSource<IStudentSubject>;
  allMasterData :any[]= [];
  Defaultvalue = 0;
  searchForm = this.fb.group({
    searchSemesterId: [0],
    searchClassId: [0],
    searchSubjectId: [0],
    searchSectionId: [0],
  });
  StoreForUpdate :any[]= [];
  StudentClassSubjectId = 0;
  StudentSubjectData = {
    StudentClassSubjectId: 0,
    SubjectId: 0,
    StudentClassId: 0,
    ClassId: 0,
    SectionId: 0,
    SemesterId: 0,
    ClassSubjectId: 0,
    BatchId: 0,
    OrgId: 0, SubOrgId: 0,
    Active: 1
  };
  nameFilter = new UntypedFormControl('');
  filterValues = {
    Student: ''
  };
  filteredOptions: Observable<IStudentSubject[]>;
  Permission = '';
  displayedColumns :any[]= [];

  constructor(
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }

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
  PageLoad() {
    //debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
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
      }
      else {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
    }
  }


  GetStudentClassSubject() {
    //debugger;
    let _sectionId = this.searchForm.get("searchSectionId")?.value;
    let _classId = this.searchForm.get("searchClassId")?.value;
    let _semesterId = this.searchForm.get("searchSemesterId")?.value;
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_sectionId == 0 && this.SelectedClassCategory == 'high school') {
      this.contentservice.openSnackBar("Please select section", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_semesterId == 0 && this.SelectedClassCategory == 'college') {
      this.contentservice.openSnackBar("Please select semester.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    // if (this.searchForm.get("searchSubjectId")?.value == 0) {
    //   this.contentservice.openSnackBar("Please select subject", globalconstants.ActionText,globalconstants.RedBackground);
    //   return;
    // }
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1" +
      ' and ClassId eq ' + _classId;
    if (_semesterId)
      filterStr += ' and SemesterId eq ' + _semesterId;
    if (_sectionId)
      filterStr += ' and SectionId eq ' + _sectionId;

    if (filterStr.length == 0) {
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    this.GetExistingStudentClassSubjects();
    // let list: List = new List();
    // list.fields = [
    //   'StudentClassId',
    //   'RollNo',
    //   'SectionId',
    //   'ClassId',
    //   'Active'
    // ];

    // list.PageName = "StudentClasses";
    // list.lookupFields = ["Student($select=PID,FirstName,LastName)"];
    // list.filter = [filterStr];
    // this.dataservice.get(list)
    //   .subscribe((studentclassdb: any) => {
    //     //debugger;
    //     //  //console.log('data.value', data.value);
    //     this.StudentSubjectList = [];
    //     var _studentClassExisting :any[]= [];
    //     //if (studentclassdb.value.length > 0) {

    //     studentclassdb.value.forEach(item => {
    //       var _lastname = item.Student.LastName == null || item.Student.LastName == '' ? '' : " " + item.Student.LastName;
    //       _studentClassExisting.push({
    //         StudentClassId: item.StudentClassId,
    //         Active: item.Active,
    //         ClassId: item.ClassId,
    //         RollNo: item.RollNo,
    //         Student: item.RollNo + " - " + item.Student.FirstName + _lastname,
    //         SectionId: item.SectionId
    //       })
    //     })
    //     this.GetExistingStudentClassSubjects(_studentClassExisting);
    //   });
  }
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  GetExistingStudentClassSubjects() {

    var orgIdSearchstr = this.FilterOrgSubOrgBatchId; //"OrgId eq " + this.LoginUserDetail[0]["orgId"] + " and BatchId eq " + this.SelectedBatchId;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    orgIdSearchstr += ' and ClassId eq ' + _classId;
    if (_semesterId)
      orgIdSearchstr += ' and SemesterId eq ' + _semesterId;
    if (_sectionId)
      orgIdSearchstr += ' and SectionId eq ' + _sectionId;

    let list: List = new List();

    list.fields = [
      "ClassSubjectId",
      "SubjectId",
      "StudentClassId",
      "StudentClassSubjectId",
      "Active",
      "ClassId",
      "SectionId",
      "SemesterId"
    ];
    list.PageName = "StudentClassSubjects";
    //list.lookupFields = ["StudentClassSubjects($select=ClassSubjectId,SubjectId,StudentClassId,StudentClassSubjectId,Active)"];
    //list.limitTo=100;
    list.filter = [orgIdSearchstr];
    //list.orderBy = "ParentId";
    debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentClassSubjects = [];
        var filteredClassSubjects = this.ClassSubjectList.filter(clssubj =>
          clssubj.ClassId == _classId
          && clssubj.SemesterId == (_semesterId ? _semesterId : clssubj.SemesterId)
          && clssubj.SectionId == (_sectionId ? _sectionId : clssubj.SectionId)
          && clssubj.SelectHowMany > 0);
        if (filteredClassSubjects.length == 0) {
          filteredClassSubjects = this.ClassSubjectList.filter(clssubj =>
            clssubj.ClassId == _classId
            && clssubj.SelectHowMany > 0);
        }
        filteredClassSubjects.forEach(clssubj => {
          var existing = data.value.filter(db => db.ClassSubjectId == clssubj.ClassSubjectId);
          if (existing.length > 0) {
            existing.forEach(existing => {
              this.StudentClassSubjects.push({
                'StudentClassSubjectId': existing.StudentClassSubjectId,
                'StudentClassId': existing.StudentClassId,
                'ClassSubjectId': existing.ClassSubjectId,
                'Active': existing.Active,
                'ClassId': existing.ClassId,
                'SectionId': existing.SectionId,
                'SemesterId': existing.SemesterId,
                'SubjectId': existing.SubjectId
              })
            })
          }
          else {
            this.StudentClassSubjects.push({
              'StudentClassSubjectId': 0,
              'StudentClassId': 0,
              'ClassSubjectId': clssubj.ClassSubjectId,
              'Active': 0,
              'ClassId': clssubj.ClassId,
              'SectionId': _sectionId,
              'SemesterId': _semesterId,
              'SubjectId': clssubj.SubjectId
            })
          }
        })


        //////////////
        //var _studentDetail: any = {};
        this.StoreForUpdate = [];
        var _students: any = this.tokenStorage.getStudents()!;
        var _filteredStudent = _students.filter((s:any) => s.StudentClasses.length > 0 
          && s.StudentClasses[0].ClassId == _classId
          && s.StudentClasses[0].SectionId == _sectionId
          && s.StudentClasses[0].SemesterId == _semesterId
          && s.StudentClasses[0].Active == 1);
        if (_filteredStudent.length > 0) {
          //for all student in student class table for the selected class.
          this.displayedColumns = ["Student"];
          //console.log("ClassSubjectList",this.ClassSubjectList)
          this.StudentSubjectList = [];
          _filteredStudent.forEach(cs => {
            var lastName = (cs.LastName) ? " " + cs.LastName : "";
            cs.Student = cs.StudentClasses[0].RollNo + "-" + cs.FirstName + lastName;

            //var _filteredStudentClassSubjectlist = this.StudentClassSubjects.filter(c => c.StudentClassId == cs.StudentClassId);
            if (cs.StudentClasses[0].RollNo == null || cs.StudentClasses[0].RollNo == '') {
              this.contentservice.openSnackBar("Please assign roll no. for " + cs.StudentClasses[0].Student, globalconstants.ActionText, globalconstants.RedBackground);
            }
            else {
              this.StudentDetail = {
                // StudentClassSubjectId: cs.StudentClassSubjectId,
                StudentClassId: cs.StudentClasses[0].StudentClassId,
                Student: cs.Student,//cs.StudentClasses[0].Student,
                RollNo: cs.StudentClasses[0].RollNo,
                Action: false
              }

              var takensubjects = this.StudentClassSubjects.filter((f:any) => f.StudentClassId == cs.StudentClasses[0].StudentClassId);
              var specificclasssubjects = this.ClassSubjectList.filter((f:any) => f.ClassId == this.searchForm.get("searchClassId")?.value && f.SelectHowMany > 0)
              //console.log("specificclasssubjects",specificclasssubjects)
              specificclasssubjects.forEach((subjectTypes, indx) => {
                var clssubject = takensubjects.filter(c => c.ClassSubjectId == subjectTypes.ClassSubjectId)
                if (clssubject.length > 0) {
                  clssubject[0].SubjectId = subjectTypes.SubjectId;
                  clssubject[0].SubjectTypeId = subjectTypes.SubjectTypeId;
                  clssubject[0].SubjectType = subjectTypes.SubjectTypeName;
                  clssubject[0].SelectHowMany = subjectTypes.SelectHowMany;
                  this.formatData(clssubject[0]);
                }
                else {
                  //debugger;
                  var newsubjects = JSON.parse(JSON.stringify(this.StudentClassSubjects[0]));
                  newsubjects["StudentClassSubjectId"] = 0;
                  newsubjects["ClassSubjectId"] = subjectTypes.ClassSubjectId;
                  newsubjects["StudentClassId"] = cs.StudentClasses[0].StudentClassId;
                  newsubjects["SubjectId"] = subjectTypes.SubjectId;
                  newsubjects["SubjectTypeId"] = subjectTypes.SubjectTypeId;
                  newsubjects["SubjectType"] = subjectTypes.SubjectTypeName;
                  newsubjects["SelectHowMany"] = subjectTypes.SelectHowMany;
                  newsubjects.Active = 0;
                  this.formatData(newsubjects);
                }

              })
              this.StudentSubjectList.push(this.StudentDetail);
            }
          })

          this.displayedColumns.push("Action");
        }
        else {
          debugger;
          var cls = this.Classes.filter(c => c.ClassId == this.searchForm.get("searchClassId")?.value)
          var _clsName = '';
          if (cls.length > 0)
            _clsName = cls[0].ClassName;

          this.contentservice.openSnackBar("No student found for the selected class " + _clsName, globalconstants.ActionText, globalconstants.RedBackground);
          this.loading = false; this.PageLoading = false;
        }
        console.log('this.StudentSubjectList', this.StudentSubjectList)
        if (this.StudentSubjectList.length > 0) {
          this.StudentSubjectList = this.StudentSubjectList.sort((a, b) => a.RollNo - b.RollNo);
          this.dataSource = new MatTableDataSource<IStudentSubject>(this.StudentSubjectList);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.dataSource.filterPredicate = this.createFilter();
          this.StudentDetailToDisplay = `${this.StudentSubjectList[0].Student} Class - ${this.StudentSubjectList[0].ClassName}, RollNo - ${this.StudentSubjectList[0].RollNo}`;
        }
        else {
          this.dataSource = new MatTableDataSource<IStudentSubject>([]);
          this.StudentDetailToDisplay = '';
        }


        this.loading = false; this.PageLoading = false;


        /////////////
      })
  }
  BindSemesterSection() {
    let _classId = this.searchForm.get("searchClassId")?.value;
    let obj = this.Classes.filter(c => c.ClassId == _classId);
    if (obj.length > 0) {
      this.SelectedClassCategory = obj[0].Category.toLowerCase();
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();
  }
  ClearData() {
    this.StudentSubjectList = [];
    this.dataSource = new MatTableDataSource<IStudentSubject>(this.StudentSubjectList);

  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.Student.toLowerCase().indexOf(searchTerms.Student) !== -1
    }
    return filterFunction;
  }
  formatData(clssubject) {
    var _subjectName = '';
    var topush = {};
    //var subjectTypes :any[]= [];

    topush = this.StudentDetail;
    let obj = this.Subjects.filter((s:any) => s.MasterDataId == clssubject.SubjectId)
    if (obj.length > 0)
      _subjectName = obj[0].MasterDataName;
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
      "SectionId": clssubject.SectionId,
      "SemesterId": clssubject.SemesterId,
      "ClassName": this.Classes.filter(c => c.ClassId == clssubject.ClassId)[0].ClassName,
      "Action": false,
      "Active": clssubject.Active,
    }
    this.StudentDetail[_subjectName] = clssubject.Active;
    topush[_subjectName] = clssubject.Active;
    this.StoreForUpdate.push(topush);
    //console.log('this.StoreForUpdate',this.StoreForUpdate)
  }
  GetClassSubjects() {

    let list: List = new List();

    list.fields = [
      "ClassSubjectId",
      "ClassId",
      "SectionId",
      "SemesterId",
      "SubjectId",
      "SubjectTypeId"
    ];
    list.PageName = "ClassSubjects";
    list.lookupFields = ["SubjectType($select=SubjectTypeName,SelectHowMany)"];

    //list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    //list.orderBy = "ParentId";
    this.ClassSubjectList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        data.value.forEach(fromdb => {
          this.ClassSubjectList.push({
            'ClassSubjectId': fromdb.ClassSubjectId,
            'ClassId': fromdb.ClassId,
            'SemesterId': fromdb.SemesterId,
            'SectionId': fromdb.SectionId,
            'SubjectId': fromdb.SubjectId,
            'SubjectTypeId': fromdb.SubjectTypeId,
            'SubjectTypeName': fromdb.SubjectType.SubjectTypeName,
            'SelectHowMany': fromdb.SubjectType.SelectHowMany
          })
        })
        this.ClassSubjectList = this.ClassSubjectList.sort((a, b) => a.SubjectTypeId - b.SubjectTypeId);
        //console.log("this.ClassSubjectList", this.ClassSubjectList)
      });

  }
  // SelectAllRowInColumn(col){
  //   this.StudentSubjectList.forEach(element => {
  //     this.SelectColumn(element, col);
  //   })
  // }
  SelectAll(event) {
    //var event ={checked:true}
    this.StudentSubjectList.forEach(element => {
      this.SelectAllInRow(element, event, "Action");

    })
  }
  UpdateAll() {
    this.StudentSubjectList.forEach(element => {
      this.SaveRow(element);
    })
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
  SelectAllRowInColumn(event, colName) {
    debugger;
    this.StudentSubjectList.forEach(element => {
      var currentrow = this.StoreForUpdate.filter((f:any) => f.Subject == colName && f.StudentClassId == element.StudentClassId);
      if (event.checked) {
        currentrow[colName] = 1;
        element[colName] = 1;
      }
      else {
        currentrow[colName] = 0;
        element[colName] = 0;
        currentrow[0].SubjectCount = 0;
      }
      element.Action = true;
    });
  }
  SelectAllInRow(element, event, colName) {
    debugger;
    var columnexist :any[]= [];
    if (colName == 'Action') {
      for (var prop in element) {
        columnexist = this.displayedColumns.filter((f:any) => f == prop)
        if (columnexist.length > 0 && event.checked && prop != 'Student' && prop != 'Action') {
          element[prop] = 1;
        }
        else if (columnexist.length > 0 && !event.checked && prop != 'Student' && prop != 'Action') {
          element[prop] = 0;
        }
        element.Action = true;
      }
    }
    else {
      var currentrow = this.StoreForUpdate.filter((f:any) => f.Subject == colName && f.StudentClassId == element.StudentClassId);
      if (event.checked) {
        currentrow[colName] = 1;
        element[colName] = 1;
      }
      else {
        currentrow[colName] = 0;
        element[colName] = 0;
        currentrow[0].SubjectCount = 0;
      }
      element.Action = true;
    }
  }
  SaveRow(element) {
    debugger;
    this.loading = true;
    this.rowCount = 0;
    this.SelectedStudentSubjectCount = [];
    ////////
    //console.log("this.StudentSubjectList", this.StudentSubjectList);
    let StudentSubjects = this.StoreForUpdate.filter((s:any) => s.StudentClassId == element.StudentClassId);
    var groupbySubjectType = alasql("select distinct SubjectTypeId,SubjectType,SelectHowMany from ? ", [StudentSubjects])
    var matchrow;
    for (var prop in element) {
      matchrow = StudentSubjects.filter(x => x.Subject == prop)
      if (matchrow.length > 0) {
        var resultarray = groupbySubjectType.filter((f:any) => f.SubjectTypeId == matchrow[0].SubjectTypeId);
        if (element[prop] == 1) {
          //assuming greater than 20 means compulsory subject types
          // if (resultarray[0].SelectHowMany > 30)
          //   matchrow[0].SubjectCount = resultarray[0].SelectHowMany;
          // //resultarray[0].SubjectCount = resultarray[0].SelectHowMany;
          // else
          resultarray[0].SubjectCount = resultarray[0].SubjectCount == undefined ? 1 : resultarray[0].SubjectCount + 1;
        }
        else {
          resultarray[0].SubjectCount = resultarray[0].SubjectCount == undefined ? 0 : resultarray[0].SubjectCount;
        }
      }
    }
    var _compulsory = groupbySubjectType.filter((f:any) => f.SubjectType.toLowerCase() == 'compulsory')
    var _otherThanCompulsory = groupbySubjectType.filter((f:any) => f.SubjectType.toLowerCase() != 'compulsory')
    var subjectCounterr = '';
    _otherThanCompulsory.forEach(noncompulsory => {
      //element.SelectHowMany =0 meeans optional
      if (noncompulsory.SubjectCount != noncompulsory.SelectHowMany) {
        subjectCounterr += " Subject type " + noncompulsory.SubjectType + " must have " + noncompulsory.SelectHowMany + " subject(s) selected.";
      }
    });
    var compulsorysubjectCount = StudentSubjects.filter(c => c.SubjectType.toLowerCase() == 'compulsory')

    if (compulsorysubjectCount.length > _compulsory[0].SubjectCount) {
      subjectCounterr += " Subject type " + _compulsory[0].SubjectType + " must have " + _compulsory[0].SelectHowMany + " subject(s) selected";
    }
    // _compulsory.forEach(s => {
    //   if (s.SelectHowMany > 30 && s.SubjectCount != s.SelectHowMany) {
    //     debugger;
    //     subjectCounterr += " Subject type " + s.SubjectType + " must have " + s.SelectHowMany + " subject(s) selected.";
    //   }
    // })
    /////////
    if (subjectCounterr.length > 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar(subjectCounterr, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      this.rowCount = Object.keys(element).length - 4;
      for (var prop in element) {

        var row: any = StudentSubjects.filter((s:any) => s.Subject == prop);

        if (row.length > 0 && prop != 'Student' && prop != 'Action') {
          var data = {
            Active: element[prop],
            StudentClassSubjectId: row[0].StudentClassSubjectId,
            StudentClassId: row[0].StudentClassId,
            ClassSubjectId: row[0].ClassSubjectId,
            SubjectId: row[0].SubjectId,
            ClassId: row[0].ClassId,
            SectionId: row[0].SectionId,
            SemesterId: row[0].SemesterId
          }
          ////console.log('data to update',data)
          if (row.length > 0) {
            this.UpdateOrSave(data, element);
          }
        }
      }
    }
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
  UpdateOrSave(row, element) {
    //debugger; 
    let checkFilterString = this.FilterOrgSubOrgBatchId + " and ClassSubjectId eq " + row.ClassSubjectId +
      " and StudentClassId eq " + row.StudentClassId;
    // " and BatchId eq " + this.SelectedBatchId


    if (row.StudentClassSubjectId > 0)
      checkFilterString += " and StudentClassSubjectId ne " + row.StudentClassSubjectId;

    let list: List = new List();
    list.fields = ["ClassSubjectId"];
    list.PageName = "StudentClassSubjects";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        
        if (data.value.length > 0) {
          console.log("row.ClassSubjectId", row.ClassSubjectId)
          console.log("data to insert",row);
          this.contentservice.openSnackBar("Record already exists!", globalconstants.ActionText, globalconstants.RedBackground);
          return;
        }
        else {

          this.StudentSubjectData.Active = row.Active;
          this.StudentSubjectData.StudentClassSubjectId = row.StudentClassSubjectId;
          this.StudentSubjectData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.StudentSubjectData.SubOrgId = this.SubOrgId;
          this.StudentSubjectData.BatchId = this.SelectedBatchId;
          this.StudentSubjectData.StudentClassId = row.StudentClassId;
          this.StudentSubjectData.SubjectId = row.SubjectId;
          this.StudentSubjectData.ClassSubjectId = row.ClassSubjectId;
          this.StudentSubjectData.ClassId = row.ClassId;
          this.StudentSubjectData.SectionId = row.SectionId;
          this.StudentSubjectData.SemesterId = row.SemesterId;
          ////console.log('data', this.StudentSubjectData);
          if (this.StudentSubjectData.StudentClassSubjectId == 0) {
            this.StudentSubjectData["CreatedDate"] = new Date();
            this.StudentSubjectData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.StudentSubjectData["UpdatedDate"];
            delete this.StudentSubjectData["UpdatedBy"];
            ////console.log('insert', this.StudentSubjectData);
            this.insert(row, element);
          }
          else {
            delete this.StudentSubjectData["CreatedDate"];
            delete this.StudentSubjectData["CreatedBy"];
            this.StudentSubjectData["UpdatedDate"] = new Date();
            this.StudentSubjectData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row, element);
          }
          row.Action = false;

        }
      });
  }

  insert(row, element) {

    //debugger;
    this.dataservice.postPatch('StudentClassSubjects', this.StudentSubjectData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.edited = false;
          //this.rowCount += 1;
          row.StudentClassSubjectId = data.StudentClassSubjectId;
          this.rowCount--;
          if (this.rowCount == 0) {
            this.loading = false;
            this.PageLoading = false;
            element.Action = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  update(row, element) {

    this.dataservice.postPatch('StudentClassSubjects', this.StudentSubjectData, this.StudentSubjectData.StudentClassSubjectId, 'patch')
      .subscribe(
        (data: any) => {
          this.edited = false;
          this.rowCount--;
          if (this.rowCount == 0) {
            element.Action = false;
            this.loading = false;
            this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  SelectedClassCategory = '';
  ClassCategory :any[]= [];

  GetMasterData() {
    debugger;
    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
      data.value.forEach(m => {
        let obj = this.ClassCategory.filter((f:any) => f.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Category = obj[0].MasterDataName.toLowerCase();
          this.Classes.push(m);
        }
      });
    });
    this.shareddata.ChangeSubjects(this.Subjects);
    this.GetClassSubjects();
    this.loading = false; this.PageLoading = false;
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
export interface IStudentSubject {
  StudentClassSubjectId: number;
  StudentClassId: number;
  ClassId: number;
  ClassName: string;
  RollNo: number;
  Student: string;
  ClassSubjectId: number;
  SubjectTypeId: number;
  SubjectType: string;
  SelectHowMany: number;
  //SubjectId:number;
  Subject: string;
  Active: number;
  Action: boolean;
}

