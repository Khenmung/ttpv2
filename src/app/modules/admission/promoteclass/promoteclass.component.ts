import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import alasql from 'alasql';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { map, startWith } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-promoteclass',
  templateUrl: './promoteclass.component.html',
  styleUrls: ['./promoteclass.component.scss']
})
export class PromoteclassComponent implements OnInit {
  PageLoading = true;
  //@ViewChild(MatPaginator) paginator: MatPaginator;
  //@ViewChild(MatSort) sort: MatSort;
  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  RowsToUpdate = -1;
  //RowsT = 0;
  RollNoGenerationSortBy = '';
  SearchSectionId = 0;
  Permission = '';
  PromotePermission = '';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  ClassCategory: any[] = [];
  ExamStatuses: any[] = [];
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  StandardFilterWithPreviousBatchId = '';
  SameClassPreviousBatch = "SameClassPreviousBatch";
  PreviousClassPreviousBatch = "PreviousClassPreviousBatch";
  SameClassPreviousBatchLabel = "";
  PreviousClassPreviousBatchLabel = "";
  HeaderTitle = '';
  loading = false;
  RollNoGeneration: any[] = [];
  //  ClassPromotion :any[]=[];
  Exams: any[] = [];
  ExamNames: any[] = [];
  Genders: any[] = [];
  Classes: any[] = [];
  FeeTypes: any[] = [];
  Sections: any[] = [];
  Remarks: any[] = [];
  Semesters: any[] = [];
  StudentGrades: any[] = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  SubOrgId = 0;
  PreviousBatchId = 0;
  NextBatchId = 0;
  Batches: any[] = [];
  filteredStudents: Observable<IStudent[]>;
  StudentClassList: IStudentClass[] = [];
  dataSource: MatTableDataSource<IStudentClass>;
  allMasterData: any[] = [];
  searchForm: UntypedFormGroup;
  FeeCategories: any[] = [];
  SelectedApplicationId = 0;
  //checkBatchIdNSelectedIdEqual = 0;
  StudentClassData = {
    StudentClassId: 0,
    ClassId: 0,
    SemesterId: 0,
    IsCurrent: false,
    OrgId: 0,
    SubOrgId: 0,
    BatchId: 0,
    StudentId: 0,
    RollNo: 0,
    SectionId: 0,
    FeeTypeId: 0,
    AdmissionNo: '',
    AdmissionDate: new Date(),
    Remarks: '',
    Active: 1
  };
  displayedColumns = [
    'StudentName',
    'GenderName',
    'Remark',
    //'SectionId',
    //'RollNo',
    'FeeTypeId',
    'ClassId',
    'SemesterId',
    'ExamStatus',
    'AdmitTo',
    'Remarks',
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
  PreviousBatchStudents: IStudent[] = [];
  filteredOptions: Observable<IStudentClass[]>;
  constructor(private servicework: SwUpdate,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private route: Router,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }

  ngOnInit(): void {
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    this.searchForm = this.fb.group({
      searchExamId: [0],
      searchPID: [0],
      searchStudentName: [0],
    });
    this.filteredStudents = this.searchForm.get("searchStudentName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.PreviousBatchStudents.slice())
      )!;
    this.nameFilter.valueChanges
      .subscribe(
        name => {
          this.filterValues.StudentName = name;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.IdFilter.valueChanges
      .subscribe(
        AdmissionNo => {
          this.filterValues.AdmissionNo = AdmissionNo;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.PageLoad();
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.PreviousBatchStudents.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  CurrentBatchStudents: any[] = [];
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.PreviousBatchId = +this.tokenStorage.getPreviousBatchId()!;
      if (this.PreviousBatchId == -1) {
        this.loading = false;
        this.PageLoading = false;
        this.contentservice.openSnackBar("No previous batch exists!", globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        //var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);

        this.Batches = this.tokenStorage.getBatches()!;

        //this.shareddata.CurrentBatchId.subscribe(c => this.CurrentBatchId = c);
        this.CurrentBatchStudents = this.tokenStorage.getStudents()!;
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.NextBatchId = +this.tokenStorage.getNextBatchId()!;

        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.StandardFilterWithPreviousBatchId = globalconstants.getOrgSubOrgFilterWithPreviousBatchId(this.tokenStorage);

        var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.CLASSSTUDENT);
        if (perObj.length > 0)
          this.Permission = perObj[0].permission;

        //this.checkBatchIdNSelectedIdEqual = +this.tokenStorage.getCheckEqualBatchId();
        //////console.log('selected batchid', this.SelectedBatchId);
        //////console.log('current batchid', this.CurrentBatchId)
        if (this.PromotePermission == 'read')
          this.displayedColumns = [
            'Student',
            'ClassName',
            'RollNo',
            'GenderName',
            'SectionId',
            'SemesterId',
            'FeeTypeId',
            'Action'
          ];
        //this.shareddata.CurrentPreviousBatchIdOfSelecteBatchId.subscribe(p => this.PreviousBatchId = p);
        //this.shareddata.CurrentFeeType.subscribe(b => this.FeeTypes = b);
        this.shareddata.CurrentSection.subscribe(b => this.Sections = b);
        //this.shareddata.CurrentBatch.subscribe(b => this.Batches = b);
        this.Batches = this.tokenStorage.getBatches()!;

        if (this.Classes.length == 0 || this.FeeTypes.length == 0 || this.Sections.length == 0) {
          this.GetMasterData();
          this.GetFeeTypes();
        }
        else {
          this.loading = false; this.PageLoading = false;
        }
        this.GetStudents();
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
  GenerateRollNoOnList() {
    debugger;
    var _gendersort = this.searchForm.get("searchGenderAscDesc")?.value;
    var _namesort = this.searchForm.get("searchNameAscDesc")?.value;
    if (_gendersort == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select gender sort.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_namesort == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select name sort.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.StudentClassList.length > 0) {

      // this.StudentClassList.sort((a, b) => {
      //   const compareGender = a.GenderName.localeCompare(b.GenderName);
      //   const compareName = a.StudentName.localeCompare(b.StudentName);
      //   return compareGender || compareName;
      // })
      this.StudentClassList = alasql("select * from ? order by GenderName " + _gendersort + ",StudentName " + _namesort, [this.StudentClassList])
      this.StudentClassList.forEach((studcls, indx) => {
        studcls.RollNo = indx + 1 + "";
        studcls.Action = true;
      })
      this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList);
      //this.dataSource.paginator = this.paginator;
      //this.dataSource.sort = this.sort;
      //this.dataSource.filterPredicate = this.createFilter();
    }
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("No student to assign roll no.", globalconstants.ActionText, globalconstants.RedBackground);

    }
  }
  GenerateRollNo() {

    let filterStr = this.FilterOrgSubOrgBatchId;// ' (' + this.FilterOrgSubOrg +") and SubOrgId eq " + this.SubOrgId;
    var _gendersort = this.searchForm.get("searchGenderAscDesc")?.value;
    var _namesort = this.searchForm.get("searchNameAscDesc")?.value;
    if (_gendersort == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select gender sort.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_namesort == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select name sort.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    if (this.searchForm.get("searchClassId")?.value > 0)
      filterStr += " and ClassId eq " + this.searchForm.get("searchClassId")?.value;
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    let _sectionId = this.searchForm.get("searchSectionId")?.value;
    let _semesterId = this.searchForm.get("searchSemesterId")?.value;
    if (_sectionId > 0)
      if (_sectionId) filterStr += " and SectionId eq " + _sectionId;
    if (_semesterId > 0)
      if (_semesterId) filterStr += " and SemesterId eq " + _semesterId;
    filterStr += " and IsCurrent eq true";
    if (filterStr.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'StudentId',
      'AdmissionNo',
      'FeeTypeId',
      'ClassId',
      'SemesterId',
      'RollNo',
      'SectionId',
      'Remarks',
      'Active'
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student($select=*)"];
    list.filter = [filterStr];
    this.StudentClassList = [];
    this.dataservice.get(list)
      .subscribe((StudentClassesdb: any) => {
        var result;
        result = [...StudentClassesdb.value];
        var StudentClassRollNoGenList: any[] = [];
        result.forEach(stud => {
          var feetype = this.FeeTypes.filter(t => t.FeeTypeId == stud.FeeTypeId);
          var _feetype = ''
          if (feetype.length > 0)
            _feetype = feetype[0].FeeTypeName;


          StudentClassRollNoGenList.push({
            StudentClassId: stud.StudentClassId,
            //AdmissionNo:stud.AdmissionNo,
            ClassId: stud.ClassId,
            AdmitTo: stud.ClassId,
            StudentId: stud.StudentId,
            StudentName: stud.Student.FirstName + " " + stud.Student.LastName,
            ClassName: this.Classes.filter(c => c.ClassId == stud.ClassId)[0].ClassName,
            FeeTypeId: stud.FeeTypeId,
            FeeType: _feetype,
            SectionId: stud.SectionId,
            Section: stud.SectionId > 0 ? this.Sections.filter(sc => sc.MasterDataId == stud.SectionId)[0].MasterDataName : '',
            RollNo: stud.RollNo,
            Active: stud.Active,
            FirstName: stud.Student.FirstName,
            LastName: stud.Student.LastName,
            FatherName: stud.Student.FatherName,
            MotherName: stud.Student.MotherName,
            FatherOccupation: stud.Student.FatherOccupation,
            MotherOccupation: stud.Student.MotherOccupation,
            PresentAddress: stud.Student.PresentAddress,
            PermanentAddress: stud.Student.PermanentAddress,
            Gender: stud.Student.Gender,
            DOB: new Date(stud.Student.DOB),//this.formatdate.transform(stud.Student.DOB,'dd/MM/yyyy'),
            Bloodgroup: stud.Student.Bloodgroup,
            Category: stud.Student.Category,
            BankAccountNo: stud.Student.BankAccountNo,
            IFSCCode: stud.Student.IFSCCode,
            MICRNo: stud.Student.MICRNo,
            AadharNo: stud.Student.AadharNo,
            Photo: stud.Student.Photo,
            Religion: stud.Student.Religion,
            PersonalNo: stud.Student.PersonalNo,
            WhatsAppNumber: stud.Student.WhatsAppNumber,
            FatherContactNo: stud.Student.FatherContactNo,
            MotherContactNo: stud.Student.MotherContactNo,
            PrimaryContactFatherOrMother: stud.Student.PrimaryContactFatherOrMother,
            NameOfContactPerson: stud.Student.NameOfContactPerson,
            RelationWithContactPerson: stud.Student.RelationWithContactPerson,
            ContactPersonContactNo: stud.Student.ContactPersonContactNo,
            AlternateContact: stud.Student.AlternateContact,
            EmailAddress: stud.Student.EmailAddress,
            LastSchoolPercentage: stud.Student.LastSchoolPercentage,
            ClassAdmissionSought: stud.Student.ClassAdmissionSought,
            TransferFromSchool: stud.Student.TransferFromSchool,
            TransferFromSchoolBoard: stud.Student.TransferFromSchoolBoard,
            Promote: 0,
            Action: true
          });

        })
        //var orderbyArr = this.RollNoGenerationSortBy.split(',');
        if (StudentClassRollNoGenList.length == 0)
          this.contentservice.openSnackBar("No record found!", globalconstants.ActionText, globalconstants.RedBackground);
        else {

          this.RollNoGenerationSortBy = 'Gender ' + _gendersort + ',StudentName ' + _namesort;
          var orderbystatement = "select StudentClassId,StudentId,StudentName,ClassId,SectionId,RollNo,Gender,FeeTypeId,Promote,Active,[Action] from ? order by " +
            this.RollNoGenerationSortBy;

          this.StudentClassList = alasql(orderbystatement, [StudentClassRollNoGenList]);
          this.StudentClassList.forEach((student, index) => {
            student.RollNo = (index + 1) + "";
          });

          this.contentservice.openSnackBar("New Roll Nos. has been generated. Please confirm and save it all.", globalconstants.ActionText, globalconstants.RedBackground);

          this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList);
          //this.dataSource.sort = this.sort;
          //this.dataSource.paginator = this.paginator;
          //this.dataSource.filterPredicate = this.createFilter();
          this.loading = false; this.PageLoading = false;
        }
      })
  }
  sortMultiple(a, b) {

  }
  PromoteAll() {
    var _rowstoupdate = this.StudentClassList.filter((f: any) => f.Promote == 1);
    this.RowsToUpdate = _rowstoupdate.length;
    _rowstoupdate.forEach(s => {
      this.RowsToUpdate--;
      s.StudentClassId = 0;
      delete s.SectionId;
      s.RollNo = '';
      this.SelectedBatchId = this.CurrentBatchId;
      s.ClassId = this.Classes[this.Classes.findIndex(i => s.ClassId) + 1].MasterDataId;
      this.UpdateOrSave(s);
    })
  }
  PromoteRow(row) {
    if (row.Promote == 1) {
      row.StudentClassId = 0;
      delete row.SectionId;
      row.RollNo = '';
      this.SelectedBatchId = this.CurrentBatchId;
      row.ClassId = this.Classes[this.Classes.findIndex(i => row.ClassId) + 1].MasterDataId;
      this.UpdateOrSave(row);
    }
  }
  CheckPromoteAll(event) {
    //debugger;
    var _promote = 0;
    if (event.checked) {
      _promote = 1;
    }

    this.StudentClassList.forEach(s => {
      s.Promote = _promote;
    })

  }
  EnablePromote(row, control) {
    if (control.checked) {
      row.Promote = 1;
      row.Action = true;
    }
    else {
      row.Promote = 0;
      row.Action = false;
    }

  }
  // promotePreviousBatch() {
  //   //debugger;
  //   var previousBatchId = +this.tokenStorage.getPreviousBatchId();
  //   this.SelectedBatchId = previousBatchId;
  //   this.GetStudentClasses(0);
  // }
  onBlur(row) {
    row.Action = true;
  }
  UploadExcel() {

  }
  GetFeeTypes() {
    this.loading = true;
    //var filter = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula","DefaultType"];
    list.PageName = "SchoolFeeTypes";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeTypes = [...data.value];
        //this.shareddata.ChangeFeeType(this.FeeTypes);
        this.loading = false; this.PageLoading = false;
      })
  }


  SetLabel() {
    let _classId = this.searchForm.get("searchClassId")?.value;
    let _previousBathId = +this.tokenStorage.getPreviousBatchId()!;
    let _currentClassIndex = this.Classes.findIndex(s => s.ClassId == _classId);
    let _previousClassName = '', _sameClassName;
    if (_currentClassIndex > 0)
      _previousClassName = this.Classes[_currentClassIndex - 1].ClassName;
    _sameClassName = this.Classes[_currentClassIndex].ClassName;
    let _previousBatchName = '';
    if (_previousBathId > 0)
      _previousBatchName = this.Batches.filter((f: any) => f.BatchId == _previousBathId)[0].BatchName;

    if (_previousBathId > -1 && _currentClassIndex > 0) {


      this.PreviousClassPreviousBatchLabel = _previousClassName + " from " + _previousBatchName;
      this.SameClassPreviousBatchLabel = _sameClassName + " from " + _previousBatchName;
    }
    else if (_previousBathId > -1 && _currentClassIndex == 0) {
      this.PreviousClassPreviousBatchLabel = "";
      this.SameClassPreviousBatchLabel = _sameClassName + " from " + _previousBatchName;
    }
    else {
      this.PreviousClassPreviousBatchLabel = "";
      this.SameClassPreviousBatchLabel = "";
    }
  }
  ClassCategoryName = '';
  SetCategory(event) {
    this.ClassCategoryName = '';
    var obj = this.Classes.filter((f: any) => f.ClassId == event.option.value.StudentClasses[0].ClassId);
    if (obj.length > 0) {
      this.ClassCategoryName = obj[0].Category;
    }
    if (this.ClassCategoryName == 'high school') {
      this.displayedColumns = [
        'StudentName',
        'GenderName',
        'Remark',
        'SectionId',
        'FeeTypeId',
        'ClassId',
        'ExamStatus',
        'AdmitTo',
        'Remarks',
        'Active',
        'Action'
      ];
    }
    else if (this.ClassCategoryName == 'college') {
      this.displayedColumns = [
        'StudentName',
        'GenderName',
        'Remark',
        'SectionId',
        'FeeTypeId',
        'ClassId',
        'SemesterId',
        'ExamStatus',
        'AdmitTo',
        'Remarks',
        'Active',
        'Action'
      ];
    }
  }
  GetExams() {
    var previousBatchId = this.tokenStorage.getPreviousBatchId();
    this.contentservice.GetExams(this.StandardFilterWithPreviousBatchId, 1)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.forEach(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId,
              StartDate: e.StartDate
            })
        })
        if (this.Exams.length > 0) {
          this.Exams = this.Exams.sort((a, b) => new Date(b.StartDate).getTime() - new Date(a.StartDate).getTime());
          this.searchForm.patchValue({ "searchExamId": this.Exams[0].ExamId });
        }
        ////console.log("this.exams",this.Exams);
      })
  }
  PreviousClassId = 0;
  GetStudentClasses(previousbatch) {

    let filterStr = '';//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    this.loading = true;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _FeeTypeId = this.searchForm.get("searchFeeTypeId")?.value;

    //this.HeaderTitle = '';
    var classIdIndex = this.Classes.findIndex(s => s.ClassId == _classId);
    if (previousbatch == this.SameClassPreviousBatch) {//SameClassPreviousBatch
      filterStr = this.StandardFilterWithPreviousBatchId;
      filterStr += " and ClassId eq " + _classId;
    }
    else if (previousbatch == this.PreviousClassPreviousBatch) {

      filterStr = this.StandardFilterWithPreviousBatchId;
      this.PreviousClassId = 0;
      if (classIdIndex > 0)//means not if first element
      {
        this.PreviousClassId = this.Classes[classIdIndex - 1]["ClassId"];
        filterStr += " and ClassId eq " + this.PreviousClassId;
      }
      else {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar("Previous class not defined.", globalconstants.ActionText, globalconstants.RedBackground);
        //return;
      }
    }
    else {//not previous
      filterStr = this.FilterOrgSubOrgBatchId;
      if (_classId > 0)
        filterStr += " and ClassId eq " + _classId;
      filterStr += " and IsCurrent eq true";
    }

    if (_FeeTypeId > 0)
      filterStr += " and FeeTypeId eq " + _FeeTypeId;

    let _sectionId = this.searchForm.get("searchSectionId")?.value;
    let _semesterId = this.searchForm.get("searchSemesterId")?.value;
    if (_sectionId > 0)
      if (_sectionId) filterStr += " and SectionId eq " + _sectionId;
    if (_semesterId > 0)
      filterStr += " and SemesterId eq " + _semesterId;

    //filterStr += ' and BatchId eq ' + this.SelectedBatchId;
    if (classIdIndex == 0 && previousbatch == this.PreviousClassPreviousBatch) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Previous class not defined.", globalconstants.ActionText, globalconstants.RedBackground);
      return null;
    }
    else if (filterStr.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return null;
    }
    else {
      let list: List = new List();
      list.fields = [
        'StudentClassId',
        'AdmissionNo',
        'AdmissionDate',
        'StudentId',
        'FeeTypeId',
        'ClassId',
        'SemesterId',
        'RollNo',
        'SectionId',
        'Remarks',
        'Active'
      ];

      list.PageName = "StudentClasses";
      list.lookupFields = ["Student($select=PID,FirstName,LastName,GenderId,RemarkId)"];
      list.filter = [filterStr];
      this.StudentClassList = [];
      return this.dataservice.get(list);
    }
  }
  AdmitToClasses: any[] = [];
  GetData() {
    debugger;
    this.HeaderTitle = '';
    //this.GetStudentClasses('')
    //.subscribe((StudentClassesdb: any) => {
    var _StudentId = this.searchForm.get("searchStudentName")?.value.StudentId;
    var _PId = this.searchForm.get("searchPID")?.value;
    var _examId = this.searchForm.get("searchExamId")?.value;
    if (_StudentId == undefined && _PId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_examId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_PId > 0) {
      let studId = this.PreviousBatchStudents.filter((s: any) => s["PID"] == _PId)
      _StudentId = studId[0].StudentId;
    }
    this.loading = true;
    this.GetExamResult(this.PreviousBatchId, _StudentId)
      .subscribe((examresult: any) => {

        this.StudentClassList = [];
        var _defaultTypeId = 0;
        var defaultFeeTypeObj = this.FeeTypes.filter((f: any) => f.DefaultType == 1);
        if (defaultFeeTypeObj.length > 0)
          _defaultTypeId = defaultFeeTypeObj[0].FeeTypeId;
        var _previousStudent: any = this.PreviousBatchStudents.filter(studnt => studnt.StudentId == _StudentId)
        var alreadyPromoted = this.CurrentBatchStudents.filter(studnt => studnt.StudentId == _StudentId)


        //this.Students.forEach((s:any) => {
        if (_previousStudent.length > 0) {
          var _examStatus = '';
          var objexam = examresult.value.filter(ex => ex.StudentId == _previousStudent[0].StudentId)
          if (objexam.length > 0) {
            _examStatus = objexam[0].Division;
            var currentClassIndex = this.Classes.findIndex(i => i.ClassId == objexam[0].StudentClass.ClassId);
            var _admitToClassId = 0;
            if (_examStatus.toLowerCase().includes("fail")) {
              _admitToClassId = this.Classes[currentClassIndex].ClassId;
              this.AdmitToClasses = this.Classes.filter(c => c.ClassId == _admitToClassId);
            }
            else {
              _admitToClassId = this.Classes[currentClassIndex + 1].ClassId;
              this.AdmitToClasses = this.Classes.filter(c => c.ClassId == _admitToClassId);
            }

            let _studentClassId = 0;
            let _admissionDate = new Date();
            let _admissionStatus = 0;

            if (alreadyPromoted.length > 0 &&
              alreadyPromoted[0].StudentClasses && alreadyPromoted[0].StudentClasses.length > 0) {
              //_admissionDate = objexam[0].StudentClass.AdmissionDate;
              _studentClassId = alreadyPromoted[0].StudentClasses[0].StudentClassId;
              _admissionStatus = 1;
            }
            var _genderName = '';
            var genderObj = this.Genders.filter((f: any) => f.MasterDataId == _previousStudent[0].GenderId);
            if (genderObj.length > 0)
              _genderName = genderObj[0].MasterDataName;
            var feetype = this.FeeTypes.filter(t => t.FeeTypeId == objexam[0].StudentClass.FeeTypeId);

            var _feetype = ''
            if (feetype.length > 0)
              _feetype = feetype[0].FeeTypeName;
            //var _lastname = _Student[0].Student.LastName == null ? '' : " " + _Student[0].Student.LastName;
            this.StudentClassList.push({
              PID: _previousStudent[0].PID,
              StudentClassId: _studentClassId,
              AdmissionDate: _admissionDate,
              ClassId: objexam[0].StudentClass.ClassId,
              AdmitTo: _admitToClassId,
              StudentId: _previousStudent[0].StudentId,
              StudentName: _previousStudent[0].Name,
              ClassName: this.Classes.filter(c => c.ClassId == objexam[0].StudentClass.ClassId)[0].ClassName,
              FeeTypeId: (objexam[0].StudentClass.FeeTypeId == 0 || objexam[0].StudentClass.FeeTypeId == null) ? _defaultTypeId : objexam[0].StudentClass.FeeTypeId,
              FeeType: _feetype,
              RollNo: objexam[0].StudentClass.RollNo,
              SectionId: objexam[0].StudentClass.SectionId,
              Section: objexam[0].StudentClass.SectionId > 0 ? this.Sections.filter(sc => sc.MasterDataId == objexam[0].StudentClass.SectionId)[0].MasterDataName : '',
              Active: _admissionStatus,
              Promote: 0,
              Remarks: '',
              GenderName: _genderName,
              ExamStatus: _examStatus,
              Action: false
            });
          }
          else {
            this.loading = false;
            this.contentservice.openSnackBar("No exam result found for this student!", globalconstants.ActionText, globalconstants.RedBackground);
          }
        }
        else if (this.StudentClassList.length == 0) {
          this.HeaderTitle = '';
          this.contentservice.openSnackBar("No record found!", globalconstants.ActionText, globalconstants.RedBackground);
        }
        ////console.log("classid",this.StudentClassList)
        this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList.sort((a, b) => +a.RollNo - +b.RollNo));
        //this.dataSource.sort = this.sort;
        //this.dataSource.paginator = this.paginator;
        //this.dataSource.filterPredicate = this.createFilter();
        this.loading = false;
        this.PageLoading = false;
      })
    //})
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,

    });
  }
  SelectALL(event) {
    if (event.checked)
      this.StudentClassList.forEach(f => {
        f.Active = 1;
        f.Action = true;
      })
    else
      this.StudentClassList.forEach(f => {
        f.Active = 0;
        f.Action = true;
      })
  }
  feepayment(element) {
    this.generateDetail(element);
    this.RowsToUpdate = 0;
    //this.UpdateOrSave(element);

  }
  StudentId = 0;
  StudentClassId = 0;
  SaveIds(element) {
    debugger;
    var _ClassId = 0;
    //if (element.StudentClasses.length > 0) {
    if (element.StudentClassId != undefined && element.StudentClassId > 0) {
      this.StudentClassId = element.StudentClassId;
      _ClassId = element.ClassId;
    }

    this.StudentId = element.StudentId;
    this.tokenStorage.saveStudentClassId(this.StudentClassId + "");
    this.tokenStorage.saveClassId(_ClassId + "");
    this.tokenStorage.saveStudentId(this.StudentId + "");

  }
  generateDetail(element) {


    let studentclass: any = this.PreviousBatchStudents.filter(sid => sid.StudentId == element.StudentId);
    let StudentName = studentclass[0].Name + ', ' + studentclass[0].FatherName + ', ' + studentclass[0].MotherName + ', ';
    if (studentclass.length > 0) {
      var _clsName = '';
      var objcls = this.Classes.filter((f: any) => f.ClassId == element.AdmitTo);
      if (objcls.length > 0)
        _clsName = objcls[0].ClassName

      var _sectionName = '';
      var sectionObj = this.Sections.filter((f: any) => f.MasterDataId == element.SectionId)
      if (sectionObj.length > 0)
        _sectionName = sectionObj[0].MasterDataName;
      this.StudentClassId = element.StudentClassId
      StudentName += _clsName + "-" + _sectionName + "-" + element.RollNo;
    }

    this.shareddata.ChangeStudentName(StudentName);

    //this.shareddata.ChangeStudentClassId(this.StudentClassId);
    this.tokenStorage.saveStudentClassId(this.StudentClassId.toString());
    this.tokenStorage.saveStudentId(element.StudentId);
    //this.shareddata.ChangeStudentId(element.StudentId);
    this.SaveIds(element);
    this.route.navigate(['/edu/feepayment']);
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
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
  // SaveAll() {
  //   debugger;
  //   var _toUpdate = this.StudentClassList.filter((f: any) => f.Action);
  //   this.RowsToUpdate = _toUpdate.length;
  //   _toUpdate.forEach(e => {
  //     this.RowsToUpdate -= 1;
  //     this.UpdateOrSave(e);
  //   })
  // }
  // SaveRow(row) {
  //   debugger;
  //   this.RowsToUpdate = 0;
  //   this.UpdateOrSave(row);
  // }
  RowCount = 0;
  DataCollection: any = [];
  SaveAll() {
    debugger;
    var _toUpdate = this.StudentClassList.filter((f: any) => f.Action);
    this.RowsToUpdate = _toUpdate.length;
    this.RowCount = 0;
    this.DataCollection = [];
    _toUpdate.forEach(e => {
      this.RowsToUpdate -= 1;
      this.DataCollection.push(JSON.parse(JSON.stringify(e)));
      this.UpdateOrSave(e);
    })
  }
  SaveRow(row) {
    debugger;
    this.RowsToUpdate = 0;
    this.RowsToUpdate = 1;
    this.DataCollection = [];
    this.DataCollection.push(JSON.parse(JSON.stringify(row)));
    this.RowCount = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;

    let checkFilterString = "StudentId eq " + row.StudentId + ' and BatchId eq ' + this.SelectedBatchId +
      " and SemesterId eq " + row.SemesterId;
    checkFilterString += " and IsCurrent eq true";
    if (row.StudentClassId > 0)
      checkFilterString += " and StudentClassId ne " + row.StudentClassId;

    let list: List = new List();
    list.fields = ["StudentClassId"];
    list.PageName = "StudentClasses";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar("Student already exist in this batch.", globalconstants.ActionText, globalconstants.RedBackground);
          row.Ative = 0;
          return;
        }
        else {
          this.RowCount += 1;
          // this.contentservice.GetStudentClassCount(this.FilterOrgSubOrg, 0, 0, 0, this.SelectedBatchId)
          //   .subscribe((data: any) => {
          if (this.DataCollection.length == this.RowCount) {
            // var ClassStrength = data.value.length;
            // ClassStrength += 1;
            var _batchName = this.tokenStorage.getSelectedBatchName()!;
            //var _admissionNo = this.searchForm.get("AdmissionNo")?.value;
            var _year = _batchName.split('-')[0].trim();
            //var _year = new Date().getFullYear();

            this.DataCollection.forEach(item => {
              //var _section= this.Sections.filter((s:any)=>s.MasterDataId == row.Section)
              this.StudentClassData.Active = item.Active;
              this.StudentClassData.StudentClassId = item.StudentClassId;
              this.StudentClassData.StudentId = item.StudentId;
              this.StudentClassData.ClassId = item.AdmitTo;
              this.StudentClassData.SemesterId = item.SemesterId;
              this.StudentClassData.FeeTypeId = item.FeeTypeId;
              this.StudentClassData.RollNo = item.RollNo;
              this.StudentClassData.SectionId = item.SectionId;
              this.StudentClassData.Remarks = item.Remarks;
              this.StudentClassData.AdmissionNo = item.AdmissionNo ? item.AdmissionNo : '';
              //this.StudentClassData.AdmissionDate = new Date();

              this.StudentClassData.OrgId = this.LoginUserDetail[0]["orgId"];
              this.StudentClassData.SubOrgId = this.SubOrgId;
              this.StudentClassData.BatchId = this.SelectedBatchId;
              if (this.StudentClassData.StudentClassId == 0) {
                this.StudentClassData.AdmissionNo = _year //+ ClassStrength;
                this.StudentClassData.IsCurrent = true;
                //this.StudentClassData.AdmissionDate = new Date();
                this.StudentClassData["CreatedDate"] = new Date();
                this.StudentClassData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
                delete this.StudentClassData["UpdatedDate"];
                delete this.StudentClassData["UpdatedBy"];
                //console.log('to insert', this.StudentClassData)
                this.insert(item);
              }
              else {
                delete this.StudentClassData["CreatedDate"];
                delete this.StudentClassData["CreatedBy"];
                this.StudentClassData.IsCurrent = false;
                this.StudentClassData["UpdatedDate"] = new Date();
                this.StudentClassData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
                //console.log('to update', this.StudentClassData)
                this.update(item);
              }
            })
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('StudentClasses', this.StudentClassData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          let iteminserted:any = this.StudentClassList.filter(s=>s.StudentId == row.StudentId && s["BatchId"] == row.BatchId)
          iteminserted.ClassName = this.Classes.filter(c => c.ClassId == data.ClassId)[0].ClassName;
          iteminserted.StudentClassId = data.StudentClassId;
          var NewStudentFromPrevious: any = this.PreviousBatchStudents.filter(st => st.StudentId == this.StudentClassData.StudentId);
          var cls = [{
            StudentClassId: data.StudentClassId,
            ClassId: this.StudentClassData.ClassId,
            FeeTypeId: this.StudentClassData.FeeTypeId,
            RollNo: this.StudentClassData.RollNo,
            SectionId: this.StudentClassData.SectionId,
            Remarks: this.StudentClassData.Remarks,
            AdmissionNo: data.AdmissionNo,
            AdmissionDate: data.AdmissionDate
          }];
          NewStudentFromPrevious[0].StudentClasses = [...cls];
          row.Action = false;

          var stud = this.CurrentBatchStudents.filter((f: any) => f.StudentId == this.StudentClassData.StudentId
          && f.BatchId == this.StudentClassData.BatchId);
          if (stud.length > 0) {
            stud["StudentClasses"] = [...cls];
          }
          else {
            this.CurrentBatchStudents.push(NewStudentFromPrevious[0]);
          }
          this.tokenStorage.saveStudents(this.CurrentBatchStudents);
          this.CurrentBatchStudents = this.tokenStorage.getStudents()!;

          //this.RowsToUpdate--;
          if (this.RowsToUpdate == 0) {
            this.CreateInvoice(row);
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.RowsToUpdate = -1;
          }

        });
  }
  update(row) {

    this.dataservice.postPatch('StudentClasses', this.StudentClassData, this.StudentClassData.StudentClassId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.RowsToUpdate--;

          if (this.RowsToUpdate == 0) {

            this.loading = false; this.PageLoading = false;
            this.CreateInvoice(row);
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  CreateInvoice(row) {
    debugger;
    this.loading = true;
    this.contentservice.GetClassFeeWithFeeDefinition(this.FilterOrgSubOrgBatchId, 0, this.StudentClassData.ClassId)//,this.StudentClassData.SemesterId,this.StudentClassData.SectionId)
      .subscribe((datacls: any) => {

        var _clsfeeWithDefinitions: any = [];
        let items = datacls.value.filter(m => m.FeeDefinition.Active == 1 && m.SemesterId == this.StudentClassData.SemesterId
          && m.SectionId == this.StudentClassData.SectionId);
        if (items.length == 0) {
          _clsfeeWithDefinitions = datacls.value.filter(m => m.FeeDefinition.Active == 1);
        }
        else
          _clsfeeWithDefinitions = [...items];

        this.contentservice.getStudentClassWithFeeType(this.FilterOrgSubOrgBatchId, this.StudentClassData.ClassId, this.StudentClassData.SemesterId, this.StudentClassData.SectionId, row.StudentClassId, 0)
          .subscribe((data: any) => {
            var studentfeedetail: any[] = [];
            //let _Students:any = this.tokenStorage.getStudents()!;
            data.value.forEach(studcls => {
              var _feeName = '';
              var objClassFee = _clsfeeWithDefinitions.filter(def => def.ClassId == studcls.ClassId);
              let _currentstudent =this.PreviousBatchStudents.filter(s=>s.StudentId == studcls.StudentId);
              objClassFee.forEach(clsfee => {
                var _category = '';
                var _subCategory = '';

                var objcat = this.FeeCategories.filter((f: any) => f.MasterDataId == clsfee.FeeDefinition.FeeCategoryId);
                if (objcat.length > 0)
                  _category = objcat[0].MasterDataName;

                var objsubcat = this.FeeCategories.filter((f: any) => f.MasterDataId == clsfee.FeeDefinition.FeeSubCategoryId);
                if (objsubcat.length > 0)
                  _subCategory = objsubcat[0].MasterDataName;

                var _formula = studcls.FeeType.Active == 1 ? studcls.FeeType.Formula : '';
               
                if (_formula.length > 0) {
                  _feeName = clsfee.FeeDefinition.FeeName;
                  studentfeedetail.push({
                    Month: clsfee.Month,
                    Amount: clsfee.Amount,
                    Formula: _formula,
                    FeeName: _feeName,
                    StudentClassId: studcls.StudentClassId,
                    FeeCategory: _category,
                    FeeSubCategory: _subCategory,
                    FeeTypeId: studcls.FeeTypeId,
                    ClassId: studcls.ClassId,
                    SectionId: studcls.SectionId,
                    SemesterId: studcls.SemesterId,
                    RollNo: studcls.RollNo,
                    Remark1:_currentstudent[0]["Remark1"],
                    Remark2:_currentstudent[0]["Remark2"]
                  });
                }

              })
            })
            // //console.log("studentfeedetailxxxx",studentfeedetail)
            this.contentservice.createInvoice(studentfeedetail, this.SelectedBatchId, this.LoginUserDetail[0]["orgId"], this.SubOrgId)
              .subscribe((data: any) => {
                this.loading = false;
                this.contentservice.openSnackBar("Invoice created successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
              },
                error => {
                  this.loading = false;
                  //console.log("create invoice error", error);
                  this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage, globalconstants.ActionText, globalconstants.RedBackground);
                })
          })
      });

  }

  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

  GetExamResult(pBatchId, pStudentId) {
    var _examId = this.searchForm.get("searchExamId")?.value;
    var _PId = this.searchForm.get("searchPID")?.value;

    //var _classId = this.searchForm.get("searchClassId")?.value;
    //var _sectionId = this.searchForm.get("searchSectionId")?.value;
    let filterstr = this.StandardFilterWithPreviousBatchId +
      " and ExamId eq " + _examId;

    if (_PId > 0) {
      let studId = this.PreviousBatchStudents.filter((s: any) => s["PID"] == _PId);
      if (studId.length > 0)
        filterstr += " and StudentId eq " + studId[0].StudentId;
    }
    else if (pStudentId > 0) {
      filterstr += " and StudentId eq " + pStudentId;
    }


    let list: List = new List();
    list.fields = ["Division", "StudentClassId", "StudentId"];
    //list.PageName = "StudentClasses";
    list.PageName = "ExamStudentResults";
    list.lookupFields = ["StudentClass($select=ClassId,FeeTypeId,SectionId,RollNo,Remarks)"];
    list.filter = [filterstr];
    return this.dataservice.get(list)

  }
  GetStudents() {

    let list: List = new List();
    list.fields = [
      'StudentId',
      'FirstName',
      'LastName',
      'FatherName',
      'MotherName',
      'PersonalNo',
      'FatherContactNo',
      'MotherContactNo',
      "PID",
      "Active",
      "RemarkId",
      "Remark2Id",
      "GenderId",
      "HouseId",
      "EmailAddress",
      "UserId",
      "ReasonForLeavingId",
      "AdmissionStatusId"
    ];

    list.PageName = "Students";
    list.lookupFields = ["StudentClasses($filter=BatchId eq " + this.PreviousBatchId + ";$select=ClassId,StudentClassId,SectionId)"]
    // 'OrgId eq ' + this.LoginUserDetail[0]["orgId"]  + " and SubOrgId eq " + this.SubOrgId + ' and BatchId eq ' + this.PreviousBatchId
    list.filter = [this.FilterOrgSubOrg + ' and Active eq 1'];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  ////console.log('data.value', data.value);
        var _students: any = [...data.value]; //this.tokenStorage.getStudents()!;
        //_students = _students.filter(a => a.Active == 1);
        this.PreviousBatchStudents = _students.map(student => {
          var _lastname = student.LastName == null ? '' : " " + student.LastName;
          //student.StudentId
          //  StudentId: student.StudentId,

          student.Name = student.PID + '-' + student.FirstName + _lastname;
          return student;
          //}
        })
        this.loading = false;
        this.PageLoading = false;
      })
  }
  GetMasterData() {
    this.allMasterData = this.tokenStorage.getMasterData()!;
    // this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
    //   .subscribe((data: any) => {
    //     debugger;
    //     this.allMasterData = [...data.value];
    this.RollNoGeneration = this.getDropDownData(globalconstants.MasterDefinitions.school.ROLLNOGENERATION);
    this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.StudentGrades = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
    this.Remarks = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARK1);
    this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
    this.RollNoGenerationSortBy = "Sort by: " + this.RollNoGeneration.filter((f: any) => f.MasterDataName.toLowerCase() == 'sort by')[0].Logic;
    this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
      this.Classes = data.value.map(m => {
        m.Category = '';
        let obj = this.ClassCategory.filter(c => c.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Cagegory = obj[0].MasterDataName.toLowerCase();
        }
        return m;
      })
      this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
    })
    //this.loading = false; this.PageLoading = false;

    this.GetExams();
    // });
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
  PID: number;
  StudentClassId: number;
  AdmissionDate: Date;
  AdmitTo: number;
  ClassId: number;
  ClassName: string;
  StudentId: number;
  StudentName: string;
  RollNo: string;
  SectionId?: number;
  Section: string;
  FeeTypeId: number;
  FeeType: string;
  Promote: number;
  ExamStatus: string;
  GenderName: string;
  Remarks: string;
  Active: number;
  Action: boolean
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}