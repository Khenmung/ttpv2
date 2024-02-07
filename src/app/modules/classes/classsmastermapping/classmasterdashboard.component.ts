//import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
//import { ClasssubjectComponent } from '../classsubject/classsubject.component';
import { SwUpdate } from '@angular/service-worker';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-classmasterdashboard',
  templateUrl: './classmasterdashboard.component.html',
  styleUrls: ['./classmasterdashboard.component.scss']
})
export class ClassmasterdashboardComponent implements OnInit {
  PageLoading = true;

  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  TeacherClassSubjectListName = 'StudTeacherClassMappings';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  PreviousBatchId = 0;
  SelectedApplicationId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  StandardFilterWithPreviousBatchId = '';
  loading = false;
  Permission = '';
  Classes: any[] = [];
  Subjects: any[] = [];
  Sections: any[] = [];
  ClassSubjects: any[] = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  //CheckBatchIDForEdit = 1;
  Batches: any[] = [];
  WorkAccounts: any[] = [];
  Teachers: any[] = [];
  ClassSubjectTeacherList: IClassTeacher[] = [];
  dataSource: MatTableDataSource<IClassTeacher>;
  allMasterData: any[] = [];
  searchForm: UntypedFormGroup;
  //ClassSubjectId = 0;
  ClassSubjectTeacherData = {
    TeacherClassMappingId: 0,
    TeacherId: 0,
    HelperId: 0,
    ClassId: 0,
    SectionId: 0,
    SemesterId: 0,
    BatchId: 0,
    OrgId: 0, SubOrgId: 0,
    Active: 1
  };
  displayedColumns = [
    "ClassName",
    "Section",
    "TeacherId",
    "HelperId",
    "Active",
    "Action",
  ];
  Helpers: any[] = [];
  filteredOptions: Observable<ITeachers[]>;
  //Students: any;
  SelectedClassCategory = '';
  Defaultvalue = 0;
  ClassCategory: any[] = [];
  Semesters: any[] = [];
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private dialog: MatDialog,
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
      searchTeacherId: [0],
      searchClassId: [0],
      searchSectionId: [0],
      searchSemesterId: [0],
    });
    this.PageLoad();
    //        this.GetTeachers();
  }
  private _filter(name: string): ITeachers[] {

    const filterValue = name.toLowerCase();
    return this.Teachers.filter(option => option.TeacherName.toLowerCase().includes(filterValue));

  }
  displayFn(teacher: ITeachers): string {
    return teacher && teacher.TeacherName ? teacher.TeacherName : '';
  }

  PageLoad() {

    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    let obj = this.searchForm.get("searchTeacherId")!;
    this.filteredOptions = obj.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.TeacherName),
        map(TeacherName => TeacherName ? this._filter(TeacherName) : this.Teachers.slice())
      );

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSTEACHER);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      // //console.log("this.Permission",this.Permission);
      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu']);

      }
      else {

        //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        //this.CheckPermission = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages[0].SUBJECT.CLASSSUBJECTMAPPING);
        //////console.log(this.CheckPermission);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.StandardFilterWithPreviousBatchId = globalconstants.getOrgSubOrgFilterWithPreviousBatchId(this.tokenStorage);

        this.shareddata.CurrentSubjects.subscribe(r => this.Subjects = r);

        // var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        //   this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
        //   if(data.value) this.Classes = [...data.value]; else this.Classes = [...data];
        // })
        this.GetMasterData();
        this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
          this.Classes = data.value.map(m => {
            m.Category = '';
            var obj = this.ClassCategory.filter(c => c.MasterDataId == m.CategoryId);
            if (obj.length > 0)
              m.Category = obj[0].MasterDataName.toLowerCase();
            return m;
          })
          this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
        });

      }
    }
  }

  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }

  View(element) {
    // //debugger;
    // this.ClassSubjectId = element.ClassSubjectId;
    // this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    // setTimeout(() => {
    //   this.classSubjectAdd.PageLoad();
    // }, 50);
  }
  CopyFromPreviousBatch() {
    ////console.log("here ", this.PreviousBatchId)
    this.PreviousBatchId = +this.tokenStorage.getPreviousBatchId()!;
    if (this.PreviousBatchId == -1)
      this.contentservice.openSnackBar("Previous batch not defined.", globalconstants.ActionText, globalconstants.RedBackground);
    else
      this.GetClassTeacher(1)
  }
  addnew() {
    let _classId = this.searchForm.get("searchClassId")?.value;
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    let obj = this.Classes.find(c => c.ClassId == _classId);
    let _clsName = '';
    if (obj)
      _clsName = obj.ClassName;
    let newItem = {
      "TeacherClassMappingId": 0,
      "TeacherId": 0,
      "HelperId": 0,
      "ClassId": _classId,
      "ClassName": _clsName,
      "SectionId": this.searchForm.get("searchSectionId")?.value,
      "SemesterId": this.searchForm.get("searchSemesterId")?.value,
      "Section": '',
      "Semester": '',
      "Active": 0,
      "Action": false
    }
    this.ClassSubjectTeacherList = [];
    this.ClassSubjectTeacherList.push(newItem);
    this.dataSource = new MatTableDataSource<IClassTeacher>(this.ClassSubjectTeacherList);
  }
  GetClassTeacher(previousbatch) {
    let filterStr = '';//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    debugger;
    this.loading = true;
    var _teacherId = this.searchForm.get("searchTeacherId")?.value.TeacherId;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    if (!_teacherId && !_classId) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select atleast one of the options", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    if (previousbatch == 1)
      filterStr = this.StandardFilterWithPreviousBatchId
    else
      filterStr = this.FilterOrgSubOrgBatchId;

    if (_teacherId)
      filterStr += " and TeacherId eq " + _teacherId;
    if (_classId)
      filterStr += " and ClassId eq " + _classId;
    if (_semesterId)
      if (_semesterId) filterStr += " and SemesterId eq " + _semesterId;
    if (_sectionId)
      if (_sectionId) filterStr += " and SectionId eq " + _sectionId;


    // else {
    //   this.loading = false; this.PageLoading=false;
    //   this.contentservice.openSnackBar("Please select teacher", globalconstants.ActionText,globalconstants.RedBackground);
    //   return;
    // }
    //filterStr += ' and ' + ;

    let list: List = new List();
    list.fields = [
      "TeacherClassMappingId",
      "TeacherId",
      "HelperId",
      "ClassId",
      "SectionId",
      "SemesterId",
      "BatchId",
      "Active"
    ];

    list.PageName = this.TeacherClassSubjectListName;
    list.filter = [filterStr];
    this.ClassSubjectTeacherList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  ////console.log('data.value', data.value);
        //if (_classId != 0 && _teacherId) {
        //if (data.value.length > 0)
        data.value.forEach(element => {
          let objClass = this.Classes.find((f: any) => f.ClassId == element.ClassId);
          let _className = '';
          if (objClass)
            _className = objClass.ClassName;

          let objSection = this.Sections.find((f: any) => f.MasterDataId == element.SectionId);
          let _section = '';
          if (objSection)
            _section = objSection.MasterDataName;
          let objSemester = this.Semesters.find((f: any) => f.MasterDataId == element.SemesterId);
          let _semester = '';
          if (objSemester)
            _semester = objSemester.MasterDataName;

          this.ClassSubjectTeacherList.push({
            "TeacherClassMappingId": previousbatch == 1 ? 0 : element.TeacherClassMappingId,
            "TeacherId": element.TeacherId,
            "HelperId": element.HelperId,
            "ClassId": element.ClassId,
            "ClassName": _className,
            "SectionId": element.SectionId,
            "SemesterId": element.SemesterId,
            "Section": _section,
            "Semester": _semester,
            "Active": previousbatch == 1 ? 0 : element.Active,
            "Action": false
          })
        });
        // else
        //   this.Sections.forEach(s => {
        //     this.ClassSubjectTeacherList.push({
        //       "TeacherClassMappingId": 0,
        //       "TeacherId": 0,
        //       "ClassId": this.searchForm.get("searchClassId")?.value,
        //       "HelperId": 0,
        //       "SectionId": s.MasterDataId,
        //       "Section": s.MasterDataName,

        //       "Active": 0,
        //       "Action": false
        //     })
        //   });

        //}
        // else {
        //   //var filteredClasses = ;
        //   this.Sections.forEach(s => {
        //     var existing = data.value.filter((f:any) => f.SectionId == s.MasterDataId);
        //     if (existing.length > 0) {
        //       this.ClassSubjectTeacherList.push({
        //         "TeacherClassMappingId": previousbatch == 1 ? 0 : existing[0].TeacherClassMappingId,
        //         "TeacherId": existing[0].TeacherId,
        //         "HelperId": existing[0].HelperId,
        //         "ClassId": existing[0].ClassId,
        //         "SectionId": existing[0].SectionId,
        //         "Section": this.Sections.filter((s:any) => s.MasterDataId == existing[0].SectionId)[0].MasterDataName,
        //         "Active": previousbatch == 1 ? 0 : existing[0].Active,
        //         "Action": false
        //       })
        //     }
        //     else {
        //       this.ClassSubjectTeacherList.push({
        //         "TeacherClassMappingId": 0,
        //         "TeacherId": 0,
        //         "HelperId": 0,
        //         "ClassId": this.searchForm.get("searchClassId")?.value,
        //         "SectionId": s.MasterDataId,
        //         "Section": s.MasterDataName,
        //         "Active": 0,
        //         "Action": false
        //       })
        //     }

        //  })
        //}
        this.dataSource = new MatTableDataSource<IClassTeacher>(this.ClassSubjectTeacherList);
        this.loading = false; this.PageLoading = false;
        //this.changeDetectorRefs.detectChanges();
      });
  }
  ClearData() {
    this.ClassSubjectTeacherList = [];
    this.dataSource = new MatTableDataSource<IClassTeacher>(this.ClassSubjectTeacherList);
  }
  onBlur(row) {
    row.Action = true;
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
  }
  delete(element) {
    this.openDialog(element);
  }
  openDialog(row) {
    //debugger;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Save',
          cancel: 'No'
        }
      }
    });

    dialogRef.afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.UpdateAsDeleted(row);
        }
      });
  }

  UpdateAsDeleted(row) {
    debugger;
    let toUpdate = {
      Active: 0,
      Deleted: true,
      UpdatedDate: new Date()
    }

    this.dataservice.postPatch(this.TeacherClassSubjectListName, toUpdate, row.TeacherClassMappingId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.ClassSubjectTeacherList.findIndex(x => x.TeacherClassMappingId == row.TeacherClassMappingId);
        this.ClassSubjectTeacherList.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.ClassSubjectTeacherList);
        this.dataSource.filterPredicate = this.createFilter();
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.GroupName.toLowerCase().indexOf(searchTerms.GroupName) !== -1
    }
    return filterFunction;
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;

    let checkFilterString = this.FilterOrgSubOrgBatchId + " and TeacherId eq " + row.TeacherId +
      " and ClassId eq " + row.ClassId +
      " and SemesterId eq " + row.SemesterId +
      " and SectionId eq " + row.SectionId +
      " and Active eq 1 ";

    if (row.TeacherClassMappingId > 0)
      checkFilterString += " and TeacherClassMappingId ne " + row.TeacherClassMappingId;

    //checkFilterString += ' and ' + this.StandardFilterWithBatchId;

    let list: List = new List();
    list.fields = ["TeacherClassMappingId"];
    list.PageName = this.TeacherClassSubjectListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
          row.Ative = 0;
          return;
        }
        else {

          this.ClassSubjectTeacherData.Active = row.Active;
          this.ClassSubjectTeacherData.TeacherClassMappingId = row.TeacherClassMappingId;
          this.ClassSubjectTeacherData.ClassId = row.ClassId;
          this.ClassSubjectTeacherData.TeacherId = row.TeacherId;
          this.ClassSubjectTeacherData.HelperId = row.HelperId;
          this.ClassSubjectTeacherData.SectionId = row.SectionId;
          this.ClassSubjectTeacherData.SemesterId = row.SemesterId;
          this.ClassSubjectTeacherData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ClassSubjectTeacherData.SubOrgId = this.SubOrgId;
          this.ClassSubjectTeacherData.BatchId = this.SelectedBatchId;
          if (row.TeacherClassMappingId == 0) {
            this.ClassSubjectTeacherData["CreatedDate"] = new Date();
            this.ClassSubjectTeacherData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.ClassSubjectTeacherData["UpdatedDate"];
            delete this.ClassSubjectTeacherData["UpdatedBy"];
            ////console.log('to insert', this.ClassSubjectTeacherData)
            this.insert(row);
          }
          else {

            delete this.ClassSubjectTeacherData["CreatedDate"];
            delete this.ClassSubjectTeacherData["CreatedBy"];
            this.ClassSubjectTeacherData["UpdatedDate"] = new Date();
            this.ClassSubjectTeacherData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            ////console.log('to update', this.ClassSubjectTeacherData)
            this.update(row);
          }
        }
      });

  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.TeacherClassSubjectListName, this.ClassSubjectTeacherData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.TeacherClassMappingId = data.TeacherClassMappingId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.TeacherClassSubjectListName, this.ClassSubjectTeacherData, this.ClassSubjectTeacherData.TeacherClassMappingId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

  GetTeachers() {

    var orgIdSearchstr = this.FilterOrgSubOrg + " and IsCurrent eq 1 and Active eq 1";
    var _WorkAccount = this.WorkAccounts.filter((f: any) => f.MasterDataName.toLowerCase() == "teaching" || f.MasterDataName.toLowerCase() == "helper");
    var _workAccountIdFilter = '';
    if (_WorkAccount.length == 2) {
      _workAccountIdFilter += " and (WorkAccountId eq " + _WorkAccount[0].MasterDataId + " or WorkAccountId eq " + _WorkAccount[1].MasterDataId + ")"
    }
    else if (_WorkAccount.length == 1)
      _workAccountIdFilter = " and WorkAccountId eq " + _WorkAccount[0].MasterDataId
    else if (_WorkAccount.length == 0) {
      this.contentservice.openSnackBar("Invalid employee work category.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let list: List = new List();

    list.fields = ["WorkAccountId"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["Employee($select=EmpEmployeeId", "FirstName", "LastName)"]
    list.filter = [orgIdSearchstr + _workAccountIdFilter];
    //list.orderBy = "ParentId";
    this.Teachers = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.filter((f: any) => {
          var _lastname = f.Employee.LastName == null ? '' : " " + f.Employee.LastName;
          var _type = '';
          var obj = this.WorkAccounts.filter(g => g.MasterDataId == f.WorkAccountId);
          if (obj.length > 0) {
            _type = obj[0].MasterDataName;
            if (_type.toLowerCase() == 'helper') {
              this.Helpers.push({
                TeacherId: f.Employee.EmpEmployeeId,
                TeacherName: f.Employee.FirstName + _lastname
              })
            }
            else
              this.Teachers.push({
                TeacherId: f.Employee.EmpEmployeeId,
                TeacherName: f.Employee.FirstName + _lastname
              })
          }
        })
      })
  }
  GetClassSubject() {

    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
    ];

    list.PageName = "ClassSubjects";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    //list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.ClassSubjects = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = [];
        data.value.forEach(item => {
          var objsubject = this.Subjects.filter((f: any) => f.MasterDataId == item.SubjectId)
          if (objsubject.length > 0) {
            this.ClassSubjects.push({
              ClassSubjectId: item.ClassSubjectId,
              ClassSubject: objsubject[0].MasterDataName,
              ClassId: item.ClassId
            })
          }
        })
      })
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Sections = this.Sections.filter((s: any) => s.MasterDataName != 'N/A');
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
    //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.Batches = this.tokenStorage.getBatches()!;

    //this.shareddata.ChangeClasses(this.Classes);
    this.shareddata.ChangeSubjects(this.Subjects);
    //this.shareddata.ChangeBatch(this.Batches);
    this.GetTeachers();
    //this.GetClassSubject();
    this.loading = false; this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }
  //CategoryName = '';
  BindSectionSemester(element) {
    debugger;
    var _categoryObj = this.Classes.filter(c => c.ClassId == element.value);
    //var _category = ''
    if (_categoryObj.length > 0)
      this.SelectedClassCategory = _categoryObj[0].Category.toLowerCase();
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();
  }
}
export interface IClassTeacher {
  TeacherClassMappingId: number;
  TeacherId: number;
  ClassId: number;
  ClassName: string;
  HelperId: number;
  SectionId: number;
  SemesterId: number;
  Section: string;
  Semester: string;
  Active: number;
  Action: boolean
}
export interface ITeachers {
  TeacherId: number;
  TeacherName: string;
}
