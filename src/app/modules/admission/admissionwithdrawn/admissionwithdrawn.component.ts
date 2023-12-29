import { Component, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable, EMPTY, map, startWith } from 'rxjs';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { TableUtil } from '../../../shared/TableUtil';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
//import { SharedataService } from '../../../shared/sharedata.service';
import { IStudentDownload } from '../studentdatadump/studentdatadump.component';

@Component({
  selector: 'app-admissionwithdrawn',
  templateUrl: './admissionwithdrawn.component.html',
  styleUrls: ['./admissionwithdrawn.component.scss']
})
export class AdmissionWithdrawnComponent {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  Permission = '';
  PromotePermission = '';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  InActiveStudents: any[] = [];
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  ReasonForLeaving: any[] = [];
  loading = false;
  Genders: any[] = [];
  Classes: any[] = [];
  SelectedBatchId = 0;
  SubOrgId = 0;
  StudentClassList: IStudentClass[] = [];
  dataSource: MatTableDataSource<IStudentClass>;
  allMasterData: any[] = [];
  searchForm: UntypedFormGroup;
  FeeCategories: any[] = [];
  SelectedApplicationId = 0;

  displayedColumns = [
    'PID',
    'Name',
    'FatherName',
    'MotherName',
    'ReasonForLeaving',
    'UpdatedDate',
    'Notes',
    'Active',
    'Action'
  ];
  nameFilter = new UntypedFormControl('');
  IdFilter = new UntypedFormControl('');
  filterValues = {
    AdmissionNo: 0,
    StudentId: 0,
    StudentName: ''
  };
  Semesters: any[] = [];
  Students: IStudent[] = [];
  Batches: any = [];
  Months: any = [];
  filteredStudents: Observable<IStudent[]>;
  filteredFathers: Observable<IStudent[]>;
  filteredMothers: Observable<IStudent[]>;
  filteredOptions: Observable<IStudentClass[]>;
  constructor(private servicework: SwUpdate,
    private dialog: MatDialog,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private route: Router,
  ) { }

  ngOnInit(): void {


    this.PageLoad();
  }

  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.searchForm = this.fb.group({
      searchPID: [0],
      searchStudentName: [''],
      searchFatherName: [''],
      searchMotherName: ['']
    })
    if (this.LoginUserDetail == null)
      this.route.navigate(['/auth/login']);
    else {
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;

      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);

      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.Admission.ADMISSIONWITHDRAWN);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      //  this.Months = this.contentservice.GetSessionFormattedMonths()!;
      this.filteredStudents = this.searchForm.get("searchStudentName")?.valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.Name),
          map(Name => Name ? this._filter(Name) : this.InActiveStudents.slice())
        )!;
      this.filteredFathers = this.searchForm.get("searchFatherName")?.valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.FatherName),
          map(Name => Name ? this._filterF(Name) : this.InActiveStudents.slice())
        )!;
      this.filteredMothers = this.searchForm.get("searchMotherName")?.valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.MotherName),
          map(Name => Name ? this._filterM(Name) : this.InActiveStudents.slice())
        )!;
      this.GetMasterData();
      this.GetStudents();
    }
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.InActiveStudents.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  private _filterF(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    var arr = this.InActiveStudents.filter(option => option.FatherName.toLowerCase().includes(filterValue));
    return arr;
  }
  private _filterM(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    var arr: any[] = [];
    if (name)
      arr = this.InActiveStudents.filter(option => option.MotherName.toLowerCase().includes(filterValue));
    return arr;
  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  displayFnF(stud: IStudent): string {
    return stud && stud.FatherName ? stud.FatherName : '';
  }
  displayFnM(stud: IStudent): string {
    return stud && stud.MotherName ? stud.MotherName : '';
  }
  RemoveDuplicates(arr) {
    return arr.filter((item,
      index) => arr.indexOf(item) === index);
  }
  onBlur(row) {
    row.Action = true;
  }
  UploadExcel() {

  }

  exportArray() {
    if (this.InActiveStudents.length > 0) {
      const datatoExport: Partial<IStudentDownload>[] = this.InActiveStudents;
      TableUtil.exportArrayToExcel(datatoExport, "InActiveStudents");
    }
  }


  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
  }

  Delete(row) {

    this.openDialog(row)
  }
  openDialog(row) {
    debugger;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Are you sure want to re-active?',
        buttonText: {
          ok: 'Save',
          cancel: 'No'
        }
      }
    });

    dialogRef.afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.ReActivate(row);
        }
      });
  }

  ReActivate(row) {
    debugger;
    let toUpdate = {
      Active: 1,
      Deleted: false,
      BatchId: this.SelectedBatchId,
      UpdatedDate: new Date()
    }

    this.dataservice.postPatch('Students', toUpdate, row.StudentId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.InActiveStudents.findIndex(x => x.PID == row.PID)
        this.InActiveStudents.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.InActiveStudents);
        this.dataSource.filterPredicate = this.createFilter();
        let _students = this.tokenStorage.getStudents();
        _students?.push(row);
        this.tokenStorage.saveStudents(_students);
        this.contentservice.openSnackBar(globalconstants.ReactivatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
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

  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  Sections: any = [];
  GetMasterData() {
    this.allMasterData = this.tokenStorage.getMasterData()!;

    this.contentservice.GetClasses(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        this.Classes = [...data.value];
        this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
      });
    this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Batches = this.tokenStorage.getBatches()!;
    this.PageLoading = false;
    this.loading = false;
  }
  GetStudent() {
    debugger;
    let _pid = this.searchForm.get("searchPID")?.value;
    //let _studentObj = this.searchForm.get("searchStudentName")?.value;
    var objstudent = this.searchForm.get("searchStudentName")?.value;
    var objFather = this.searchForm.get("searchFatherName")?.value;
    var objMother = this.searchForm.get("searchMotherName")?.value;

    let _students: any = [...this.InActiveStudents];
    if (_pid > 0)
      _students = this.InActiveStudents.filter(i => i.PID == _pid);
    if (objstudent.StudentId)
      _students = this.InActiveStudents.filter(i => i.StudentId == objstudent.StudentId);
    if (objFather.FatherName)
      _students = this.InActiveStudents.filter(i => i.FatherName == objFather.FatherName);
    if (objMother.MotherName)
      _students = this.InActiveStudents.filter(i => i.MotherName == objMother.MotherName);

    if (_students.length == 0) {
      this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
    }
    this.dataSource = new MatTableDataSource<any>(_students);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  generateDetail(element) {
    let StudentName = element.PID + ' ' + element.Name + ' ' + element.FatherName + ' ' + element.MotherName + ',';

    let studentclass: any = this.Students.filter(sid => sid.StudentId == element.StudentId);
    if (studentclass.length > 0) {
      var _clsName = '', _rollNo = '';
      _rollNo = studentclass[0].RollNo ? studentclass[0].RollNo : '';
      var objcls = this.Classes.filter((f: any) => f.ClassId == studentclass[0].ClassId);
      if (objcls.length > 0)
        _clsName = objcls[0].ClassName;

      var _sectionName = '';
      var sectionObj = this.Sections.filter((f: any) => f.MasterDataId == studentclass[0].SectionId)
      if (sectionObj.length > 0)
        _sectionName = sectionObj[0].MasterDataName;
      this.StudentClassId = studentclass[0].StudentClassId
      StudentName += "-" + _clsName + "-" + _sectionName + "-" + _rollNo;
    }

    this.tokenStorage.saveStudentClassId(this.StudentClassId.toString());
    this.tokenStorage.saveStudentId(element.StudentId);

  }
  view(element) {
    debugger;
    this.generateDetail(element);
    this.SaveIds(element);
    this.route.navigate(['/edu/addstudent/' + element.StudentId]);
  }
  StudentClassId = 0;
  StudentId = 0;
  SaveIds(element) {
    debugger;
    var _ClassId = 0;
    //if (element.StudentClasses.length > 0) {
    if (element.StudentClasses) {
      this.StudentClassId = element.StudentClassId;
      _ClassId = element.ClassId;
    }

    this.StudentId = element.StudentId;

    this.tokenStorage.saveStudentClassId(this.StudentClassId + "");
    this.tokenStorage.saveClassId(_ClassId + "");
    this.tokenStorage.saveStudentId(this.StudentId + "");

  }
  GetStudents() {
    debugger;
    //let _batchId = this.searchForm.get('searchBatchId')?.value;
    let filterStr = '';
    filterStr = this.FilterOrgSubOrg + filterStr;

    this.Students = [];
    let list: List = new List();
    list.fields = [
      'StudentId',
      'FirstName',
      'LastName',
      'FatherName',
      'MotherName',
      'PersonalNo',
      "PID",
      "Active",
      "RemarkId",
      "GenderId",
      "HouseId",
      "EmailAddress",
      "ReasonForLeavingId",
      "AdmissionStatusId",
      "Active"
    ];
    list.PageName = "Students";
    list.lookupFields = ["StudentClasses($filter=BatchId eq " + this.SelectedBatchId + ";$select=UpdatedDate,StudentClassId,ClassId,SectionId,SemesterId,RollNo,FeeTypeId,BatchId,IsCurrent,HouseId,StudentId)"];

    list.filter = [filterStr + " and Active eq 0"];
    this.loading = true;
    this.PageLoading = true;
    this.dataservice.get(list).subscribe((data: any) => {
      this.InActiveStudents=[];
      data.value.forEach(f => {
        f.ClassName = '';
        if (f.StudentClasses.length > 0) {
          let obj = this.Classes.find(c => c.ClassId == f.StudentClasses[0].ClassId);
          if (obj)
            f.ClassName = obj.ClassName;
          f.RollNo = f.StudentClasses[0].RollNo ? '-' + f.StudentClasses[0].RollNo : '';
          f.Section = '';
          let objSection = this.Sections.find(c => c.MasterDataId == f.StudentClasses[0].SectionId);
          if (objSection) {
            f.Section = objSection.MasterDataName;
          }
          f.Semester = '';
          let objSemester = this.Semesters.find(c => c.MasterDataId == f.StudentClasses[0].SemesterId);
          if (objSemester) {
            f.Semester = objSemester.MasterDataName;
          }

          f.Name = (f.FirstName + " " + f.LastName).trim() + "-" + f.ClassName + "-" + f.Semester + f.Section + f.RollNo;
          let item = this.ReasonForLeaving.find(h => h.MasterDataId == f.ReasonForLeavingId)
          if (item)
            f.ReasonForLeaving = item.MasterDataName
          else
            f.ReasonForLeaving = '';
          this.InActiveStudents.push(f);
        }
      })

      this.loading = false;
      this.PageLoading = false;
    })

  }

  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }

}
export interface IStudentClass {
  PID: number;
  StudentClassId: number;
  //AdmissionNo: string;
  AdmissionDate: Date;
  ClassId: number;
  SemesterId: number;
  Semester: string;
  ClassName: string;
  StudentId: number;
  StudentName: string;
  FatherName: string;
  MotherName: string;
  RollNo: string;
  SectionId?: number;
  Section: string;
  FeeTypeId: number;
  FeeType: string;
  Promote: number;
  ExamStatus: string;
  GenderName: string;
  Remark: string;
  Remarks: string;
  Active: number;
  Action: boolean
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
  FatherName: string;
  MotherName: string;
}
