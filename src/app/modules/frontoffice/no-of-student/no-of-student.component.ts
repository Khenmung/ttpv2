import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
@Component({
  selector: 'app-no-of-student',
  templateUrl: './no-of-student.component.html',
  styleUrls: ['./no-of-student.component.scss']
})
export class NoOfStudentComponent implements OnInit {
  PageLoading = true;
  Defaultvalue = 0;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("table") mattable;
  RowsToUpdate = -1;
  RollNoGenerationSortBy = '';
  SearchSectionId = 0;
  SubOrgId = 0;
  Permission = '';
  PromotePermission = '';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  StandardFilterWithPreviousBatchId = '';
  SameClassPreviousBatch = "SameClassPreviousBatch";
  PreviousClassPreviousBatch = "PreviousClassPreviousBatch";
  HeaderTitle = '';
  loading = false;
  RollNoGeneration: any[] = [];
  Genders: any[] = [];
  Classes: any[] = [];
  FeeTypes: any[] = [];
  Sections: any[] = [];
  Semesters: any[] = [];
  StudentGrades: any[] = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  PreviousBatchId = 0;
  NextBatchId = 0;
  Batches: any[] = [];
  StudentClassList: IStudentClass[] = [];
  dataSource: MatTableDataSource<IStudentClass>;
  allMasterData: any[] = [];
  searchForm: UntypedFormGroup;
  SelectedApplicationId = 0;
  //checkBatchIdNSelectedIdEqual = 0;
  StudentClassData = {
    StudentClassId: 0,
    ClassId: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0,
    StudentId: 0,
    RollNo: 0,
    SectionId: 0,
    FeeTypeId: 0,
    Active: 1
  };
  TotalStudent = 0;
  displayedColumns = [
    'ClassName',
    'MaxStudent'
  ];
  constructor(private servicework: SwUpdate,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.searchForm = this.fb.group({
      searchClassId: [0],
    });
    this.PageLoad();
  }
  AllStudents: any[] = [];
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
        this.Classes = [...data.value.sort((a, b) => a.Sequence - b.Sequence)];
      })
      //this.shareddata.CurrentBatchId.subscribe(c => this.CurrentBatchId = c);
      this.Batches = this.tokenStorage.getBatches()!;
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.NextBatchId = +this.tokenStorage.getNextBatchId()!;
      this.PreviousBatchId = +this.tokenStorage.getPreviousBatchId()!;
      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.StandardFilterWithPreviousBatchId = globalconstants.getOrgSubOrgFilterWithPreviousBatchId(this.tokenStorage);
      this.AllStudents = this.tokenStorage.getStudents()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.misc.NOOFSTUDENT);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {

        //this.checkBatchIdNSelectedIdEqual = +this.tokenStorage.getCheckEqualBatchId();
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;

        this.shareddata.CurrentPreviousBatchIdOfSelecteBatchId.subscribe(p => this.PreviousBatchId = p);
        this.shareddata.CurrentSection.subscribe(b => this.Sections = b);
        this.Batches = this.tokenStorage.getBatches()!;

        if (this.Classes.length == 0 || this.FeeTypes.length == 0 || this.Sections.length == 0) {
          this.GetMasterData();
          this.GetFeeTypes();
        }
        else {
          this.loading = false; this.PageLoading = false;
        }
      }
    }
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.StudentName.toLowerCase().indexOf(searchTerms.StudentName) !== -1
        && data.StudentId.toString().toLowerCase().indexOf(searchTerms.StudentId) !== -1
      // && data.colour.toLowerCase().indexOf(searchTerms.colour) !== -1
      // && data.pet.toLowerCase().indexOf(searchTerms.pet) !== -1;
    }
    return filterFunction;
  }
  openDialog() {
    debugger;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Save',
          cancel: 'No'
        }
      }
    });
    const snack = this.snackBar.open('Snack bar open before dialog');

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        //this.GenerateRollNo();
        snack.dismiss();
        const a = document.createElement('a');
        a.click();
        a.remove();
        snack.dismiss();
        this.snackBar.open('Closing snack bar in a few seconds', 'Fechar', {
          duration: 2000,
        });
      }
    });
  }

  GetFeeTypes() {
    this.loading = true;
    //var filter = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
    list.PageName = "SchoolFeeTypes";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeTypes = [...data.value];
        this.shareddata.ChangeFeeType(this.FeeTypes);
        this.loading = false; this.PageLoading = false;
      })
  }
  BoyGirlTotal = {};
  StudentCount: any = [];
  GetStudentClasses() {
    debugger;
    this.TotalStudent = 0;
    let filterStr = '';//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    this.loading = true;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _students: any[] = [];
    var _students = this.AllStudents.filter(s => s.StudentClasses && s.StudentClasses.length > 0)
    if (_classId > 0) {
      _students = _students.filter(s => s.StudentClasses && s.StudentClasses[0].ClassId == _classId)
    }
    else

      //   filterStr += " and ClassId eq " + _classId;
      // filterStr += " and IsCurrent eq true";

      // let list: List = new List();
      // list.fields = [
      //   'StudentClassId',
      //   'ClassId',
      //   'SectionId',
      //   'SemesterId',
      //   'StudentId',
      //   'Active'
      // ];

      // list.PageName = "StudentClasses";
      // list.lookupFields = ["Class($select=ClassName,ClassId,Sequence,MaxStudent)"]
      // list.filter = [filterStr + ' and Active eq 1'];
      this.StudentClassList = [];
    // this.dataservice.get(list)
    //   .subscribe((StudentClassesdb: any) => {
    ////console.log("Studenclass no.", StudentClassesdb.value)
    let errormsg = '';
    this.BoyGirlTotal = [];
    let _clsname = ''
    let _sectionname = '', Seq = 0;
    let _semesterName = ''
    let _pid = 0
    let _gender = '';
    //this.StudentClassList = StudentClassesdb.value.map(student => {
    _students.forEach(student => {
      _clsname = ''
      _sectionname = '', Seq = 0;
      _semesterName = ''
      _pid = 0
      _gender = '';
      let objgender = this.Genders.find((s: any) => s.MasterDataId == student.GenderId)
      if (objgender)
        _gender = objgender.MasterDataName;

      _pid = student.PID;
      if (student.StudentClasses) {
        let clsobj = this.Classes.find((s: any) => s.ClassId == student.StudentClasses[0].ClassId)
        if (clsobj)
          _clsname = clsobj.ClassName;
        let sectionobj = this.Sections.find((s: any) => s.MasterDataId == student.StudentClasses[0].SectionId)
        if (sectionobj) {
          _sectionname = sectionobj.MasterDataName;
          Seq = sectionobj.Sequence;
        }
        else {
          errormsg += _pid + ",";
        }
        let semesterobj = this.Semesters.find((s: any) => s.MasterDataId == student.StudentClasses[0].SemesterId)
        if (semesterobj)
          _semesterName = semesterobj.MasterDataName
        else {
          errormsg += _pid + ",";
        }
        //}
        //var objgender = this.Genders.filter(g => g.MasterDataId == student.GenderId);
        student.PID = _pid;
        student.ClassId = student.StudentClasses[0].ClassId;
        student.Gender = _gender;
        student.ClassName = _clsname + (_sectionname == "" ? "" : " - " + _sectionname);
        student.Section = _sectionname;
        student.SectionSequence = Seq;
        student.Semester = _semesterName;
        student.Sequence = clsobj.Sequence;
        student.MaxStudent = clsobj.MaxStudent;
        this.StudentClassList.push(student);
      }
    })
    // if (errormsg.length > 0) {
    //   errormsg = "Section not defined for PID: " + errormsg;
    //   this.contentservice.openSnackBar(errormsg, globalconstants.ActionText, globalconstants.RedBackground);
    // }
    var _classStudentCount: any[] = [];
    //if (errormsg.length == 0) {
    _classStudentCount = alasql("select ClassId,ClassName,Section,SectionSequence,Semester,Gender,MaxStudent,count(StudentClassId) NoOfStudent from ? group by ClassId,ClassName,Section,SectionSequence,Semester,Gender,MaxStudent",
      [this.StudentClassList])
    //}
    // else {
    //   _classStudentCount = alasql("select ClassId,ClassName,Gender,MaxStudent,sum(1) NoOfStudent from ? group by ClassId,ClassName,Gender,MaxStudent",
    //     [this.StudentClassList])
    // }
    var pivottedClass: any[] = [];
    var _filteredClasses: any[] = [];
    if (_classId > 0)
      _filteredClasses = this.Classes.filter(c => c.ClassId == _classId);
    else
      _filteredClasses = [...this.Classes]

    var classNSection: any[] = [];
    _filteredClasses.forEach((c, indx) => {
      var currentCls = _classStudentCount.filter((s: any) => s.ClassId == c.ClassId);
      var _noOfSections = alasql("select distinct Section,SectionSequence,ClassName,Semester from ?", [currentCls]);
      if (_noOfSections.length > 0) {
        _noOfSections = _noOfSections.sort((a, b) => a.SectionSequence - b.SectionSequence);
        _noOfSections.forEach(s => {
          classNSection.push({ MaxStudent: c.MaxStudent, Sequence: indx, ClassId: c.ClassId, ClassName: c.ClassName + "-" + s.Section, Section: s.Section, Semester: s.Semester });
        })
      }
      else {

        classNSection.push({ MaxStudent: c.MaxStudent, Sequence: indx, ClassId: c.ClassId, ClassName: c.ClassName, Section: "", Semester: "" });
      }
    })
    var _tempClassId = 0;
    var _classTotal = 0;
    classNSection.forEach((c, cindx) => {

      var newClassRow: any[] = [];
      //this.Sections.forEach(s => {

      this.Genders.forEach(g => {
        var sectionGenderRow: any[] = [];
        //if (errormsg.length == 0) {
        sectionGenderRow = _classStudentCount.filter(cls =>
          cls.Section == c.Section
          && cls.ClassId == c.ClassId
          && cls.Gender == g.MasterDataName)
        if (this.displayedColumns.indexOf(g.MasterDataName) == -1)
          this.displayedColumns.push(g.MasterDataName)

        if (sectionGenderRow.length > 0) {
          sectionGenderRow[0].Sequence = c.Sequence;
        }
        else {
          var sectionRow: any[] = []; //_classStudentCount.filter(cls =>cls.ClassId == c.ClassId)
          sectionRow.push({
            ClassName: c.ClassName,
            MaxStudent: c.MaxStudent,
            Section: c.Section,
            Total: 0,
            NoOfStudent: 0,
            [g.MasterDataName]: 0
          })
          sectionGenderRow.push(sectionRow[0]);
          //}
        }
        var existing = newClassRow.filter(n => n.ClassId == sectionGenderRow[0].ClassId
          && n.Gender == sectionGenderRow[0].Gender
          && n.Section == sectionGenderRow[0].Section)

        if (existing.length == 0)
          newClassRow.push(sectionGenderRow[0]);
        if (isNaN(this.BoyGirlTotal[g.MasterDataName]))
          this.BoyGirlTotal[g.MasterDataName] = 0;
        this.BoyGirlTotal[g.MasterDataName] += sectionGenderRow[0].NoOfStudent
        newClassRow[0][g.MasterDataName] = sectionGenderRow[0].NoOfStudent;
        newClassRow[0].Total = newClassRow[0].Total ? newClassRow[0].Total + (+sectionGenderRow[0].NoOfStudent) : sectionGenderRow[0].NoOfStudent;

      })
      if (newClassRow.length > 0) {
        if (cindx < classNSection.length - 1) {
          if (_tempClassId == c.ClassId && _tempClassId != classNSection[cindx + 1].ClassId) {
            _classTotal += (+newClassRow[0].Total);
            newClassRow[0].ClassTotal = _classTotal;
            _classTotal = 0;
          }
          else {
            _classTotal += (+newClassRow[0].Total);
          }
        }
        else {
          //if last one
          if (cindx == classNSection.length - 1) {
            _classTotal += (+newClassRow[0].Total);
            newClassRow[0].ClassTotal = _classTotal;
            _classTotal = 0;
          }
        }

        this.TotalStudent += newClassRow[0].Total;
        pivottedClass.push(newClassRow[0]);
      }
      _tempClassId = c.ClassId;
      //})

    })
    if (this.displayedColumns.indexOf('Total') == -1)
      this.displayedColumns.push("Total");
    if (this.displayedColumns.indexOf('ClassTotal') == -1)
      this.displayedColumns.push("ClassTotal");
    if (this.StudentClassList.length == 0) {
      this.HeaderTitle = '';
      this.contentservice.openSnackBar("No record found!", globalconstants.ActionText, globalconstants.RedBackground);
    }
    ////console.log("BoyGirlTotal", this.BoyGirlTotal);
    this.StudentCount = pivottedClass.sort((a, b) => +a.Sequence - +b.Sequence);
    this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentCount);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = this.createFilter();
    this.loading = false; this.PageLoading = false;

    //})

    //set current batch id back to the actual one.
    //this.shareddata.CurrentSelectedBatchId.subscribe(s => this.SelectedBatchId = s);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,

    });
  }


  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  Students: any[] = [];
  // GetStudents() {

  //   // let list: List = new List();
  //   // list.fields = [
  //   //   'StudentId',
  //   //   'GenderId',
  //   //   'PID'
  //   // ];

  //   // list.PageName = "Students";
  //   // list.filter = ['Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

  //   // this.dataservice.get(list)
  //   //   .subscribe((data: any) => {
  //   //debugger;
  //   //  ////console.log('data.value', data.value);
  //   var _students: any = this.tokenStorage.getStudents()!;
  //   if (_students.length > 0) {
  //     _students.forEach(student => {
  //       var obj = this.Genders.filter(g => g.MasterDataId == student.GenderId);
  //       if (obj.length > 0)
  //         this.Students.push({
  //           PID: student.PID,
  //           StudentId: student.StudentId,
  //           GenderId: student.GenderId,
  //           Gender: obj[0].MasterDataName
  //         })
  //     })
  //   }
  //   this.loading = false; this.PageLoading = false;
  //   // })
  // }
  GetMasterData() {

    // this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SubOrgId, this.SelectedApplicationId)
    //   .subscribe((data: any) => {
    debugger;
    this.allMasterData = this.tokenStorage.getMasterData()!;// [...data.value];
    this.RollNoGeneration = this.getDropDownData(globalconstants.MasterDefinitions.school.ROLLNOGENERATION);
    this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.StudentGrades = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
    //this.ClassPromotion = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSPROMOTION);
    //this.GetStudents();
    //this.shareddata.ChangeBatch(this.Batches);
    this.RollNoGenerationSortBy = "Sort by: " + this.RollNoGeneration.filter((f: any) => f.MasterDataName.toLowerCase() == 'sort by')[0].Logic;
    this.loading = false; this.PageLoading = false;
    //});
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
export interface IStudentClass {
  StudentClassId: number;
  ClassId: number;
  ClassName: string;
  SectionId: number;
  SemesterId: number;
  Semester: string;
  Sequence: number;
  Section: string;
  Active: number;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}
