import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
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
  Defaultvalue = 0;
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
  EmployeeClassList: any = [];
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
    RollNo: '',
    SectionId: 0,
    FeeTypeId: 0,
    Admitted: false,
    AdmissionNo: '',
    AdmissionDate: new Date(),
    Remarks: '',
    Active: 1
  };
  displayedColumns = [
    'StudentName',
    'ClassId',
    'ExamStatus',
    'AdmitTo',
    'SemesterId',
    'SectionId',
    'RollNo',
    'FeeTypeId',
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
  PreviousBatchStudents: any = [];
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
    this.PromotionExamId = +localStorage.getItem("PromotionExamId")!;
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
        this.EmployeeClassList = this.tokenStorage.getEmployeeClasses();
        //this.shareddata.CurrentBatchId.subscribe(c => this.CurrentBatchId = c);
        this.CurrentBatchStudents = this.tokenStorage.getStudents()!;
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.NextBatchId = +this.tokenStorage.getNextBatchId()!;

        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.StandardFilterWithPreviousBatchId = globalconstants.getOrgSubOrgFilterWithPreviousBatchId(this.tokenStorage);

        var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.Admission.STUDENTADMISSION);
        if (perObj.length > 0)
          this.Permission = perObj[0].permission;

        //this.checkBatchIdNSelectedIdEqual = +this.tokenStorage.getCheckEqualBatchId();
        //////console.log('selected batchid', this.SelectedBatchId);
        //////console.log('current batchid', this.CurrentBatchId)
        if (this.Permission == 'read')
          this.displayedColumns = [
            'StudentName',
            'ClassId',
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

        this.GetMasterData();
        this.GetFeeTypes();
        this.loading = false; this.PageLoading = false;
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

  // GenerateRollNo() {

  //   let filterStr = this.FilterOrgSubOrgBatchId;// ' (' + this.FilterOrgSubOrg +") and SubOrgId eq " + this.SubOrgId;
  //   var _gendersort = this.searchForm.get("searchGenderAscDesc")?.value;
  //   var _namesort = this.searchForm.get("searchNameAscDesc")?.value;
  //   if (_gendersort == 0) {
  //     this.loading = false; this.PageLoading = false;
  //     this.contentservice.openSnackBar("Please select gender sort.", globalconstants.ActionText, globalconstants.RedBackground);
  //     return;
  //   }
  //   if (_namesort == 0) {
  //     this.loading = false; this.PageLoading = false;
  //     this.contentservice.openSnackBar("Please select name sort.", globalconstants.ActionText, globalconstants.RedBackground);
  //     return;
  //   }
  //   this.loading = true;
  //   if (this.searchForm.get("searchClassId")?.value > 0)
  //     filterStr += " and ClassId eq " + this.searchForm.get("searchClassId")?.value;
  //   else {
  //     this.loading = false; this.PageLoading = false;
  //     this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
  //     return;
  //   }
  //   let _sectionId = this.searchForm.get("searchSectionId")?.value;
  //   let _semesterId = this.searchForm.get("searchSemesterId")?.value;
  //   if (_sectionId > 0)
  //     if (_sectionId) filterStr += " and SectionId eq " + _sectionId;
  //   if (_semesterId > 0)
  //     if (_semesterId) filterStr += " and SemesterId eq " + _semesterId;
  //   filterStr += " and IsCurrent eq true";
  //   if (filterStr.length == 0) {
  //     this.loading = false; this.PageLoading = false;
  //     this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
  //     return;
  //   }

  //   let list: List = new List();
  //   list.fields = [
  //     'StudentClassId',
  //     'StudentId',
  //     'AdmissionNo',
  //     'FeeTypeId',
  //     'ClassId',
  //     'SemesterId',
  //     'RollNo',
  //     'SectionId',
  //     'Remarks',
  //     'Active'
  //   ];

  //   list.PageName = "StudentClasses";
  //   list.lookupFields = ["Student($select=*)"];
  //   list.filter = [filterStr];
  //   this.StudentClassList = [];
  //   this.dataservice.get(list)
  //     .subscribe((StudentClassesdb: any) => {
  //       var result;
  //       result = [...StudentClassesdb.value];
  //       var StudentClassRollNoGenList: any[] = [];
  //       result.forEach(stud => {
  //         var feetype = this.FeeTypes.find(t => t.FeeTypeId == stud.FeeTypeId);
  //         var _feetype = ''
  //         if (feetype)
  //           _feetype = feetype.FeeTypeName;


  //         StudentClassRollNoGenList.push({
  //           StudentClassId: stud.StudentClassId,
  //           //AdmissionNo:stud.AdmissionNo,
  //           ClassId: stud.ClassId,
  //           AdmitTo: stud.ClassId,
  //           StudentId: stud.StudentId,
  //           StudentName: stud.Student.FirstName + " " + stud.Student.LastName,
  //           ClassName: this.Classes.filter(c => c.ClassId == stud.ClassId)[0].ClassName,
  //           FeeTypeId: stud.FeeTypeId,
  //           FeeType: _feetype,
  //           SectionId: stud.SectionId,
  //           Section: stud.SectionId > 0 ? this.Sections.filter(sc => sc.MasterDataId == stud.SectionId)[0].MasterDataName : '',
  //           RollNo: stud.RollNo,
  //           Active: stud.Active,
  //           FirstName: stud.Student.FirstName,
  //           LastName: stud.Student.LastName,
  //           FatherName: stud.Student.FatherName,
  //           MotherName: stud.Student.MotherName,
  //           FatherOccupation: stud.Student.FatherOccupation,
  //           MotherOccupation: stud.Student.MotherOccupation,
  //           PresentAddress: stud.Student.PresentAddress,
  //           PermanentAddress: stud.Student.PermanentAddress,
  //           Gender: stud.Student.Gender,
  //           DOB: new Date(stud.Student.DOB),//this.formatdate.transform(stud.Student.DOB,'dd/MM/yyyy'),
  //           Bloodgroup: stud.Student.Bloodgroup,
  //           Category: stud.Student.Category,
  //           BankAccountNo: stud.Student.BankAccountNo,
  //           IFSCCode: stud.Student.IFSCCode,
  //           MICRNo: stud.Student.MICRNo,
  //           AadharNo: stud.Student.AadharNo,
  //           Photo: stud.Student.Photo,
  //           Religion: stud.Student.Religion,
  //           PersonalNo: stud.Student.PersonalNo,
  //           WhatsAppNumber: stud.Student.WhatsAppNumber,
  //           FatherContactNo: stud.Student.FatherContactNo,
  //           MotherContactNo: stud.Student.MotherContactNo,
  //           PrimaryContactFatherOrMother: stud.Student.PrimaryContactFatherOrMother,
  //           NameOfContactPerson: stud.Student.NameOfContactPerson,
  //           RelationWithContactPerson: stud.Student.RelationWithContactPerson,
  //           ContactPersonContactNo: stud.Student.ContactPersonContactNo,
  //           AlternateContact: stud.Student.AlternateContact,
  //           EmailAddress: stud.Student.EmailAddress,
  //           LastSchoolPercentage: stud.Student.LastSchoolPercentage,
  //           ClassAdmissionSought: stud.Student.ClassAdmissionSought,
  //           TransferFromSchool: stud.Student.TransferFromSchool,
  //           TransferFromSchoolBoard: stud.Student.TransferFromSchoolBoard,
  //           Promote: 0,
  //           Action: true
  //         });

  //       })
  //       //var orderbyArr = this.RollNoGenerationSortBy.split(',');
  //       if (StudentClassRollNoGenList.length == 0)
  //         this.contentservice.openSnackBar("No record found!", globalconstants.ActionText, globalconstants.RedBackground);
  //       else {

  //         this.RollNoGenerationSortBy = 'Gender ' + _gendersort + ',StudentName ' + _namesort;
  //         var orderbystatement = "select StudentClassId,StudentId,StudentName,ClassId,SectionId,RollNo,Gender,FeeTypeId,Promote,Active,[Action] from ? order by " +
  //           this.RollNoGenerationSortBy;

  //         this.StudentClassList = alasql(orderbystatement, [StudentClassRollNoGenList]);
  //         this.StudentClassList.forEach((student, index) => {
  //           student.RollNo = (index + 1) + "";
  //         });

  //         this.contentservice.openSnackBar("New Roll Nos. has been generated. Please confirm and save it all.", globalconstants.ActionText, globalconstants.RedBackground);

  //         this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList);
  //         //this.dataSource.sort = this.sort;
  //         //this.dataSource.paginator = this.paginator;
  //         //this.dataSource.filterPredicate = this.createFilter();
  //         this.loading = false; this.PageLoading = false;
  //       }
  //     })
  // }
  sortMultiple(a, b) {

  }
  // PromoteAll() {
  //   var _rowstoupdate = this.StudentClassList.filter((f: any) => f.Promote == 1);
  //   this.RowsToUpdate = _rowstoupdate.length;
  //   _rowstoupdate.forEach(s => {
  //     this.RowsToUpdate--;
  //     s.StudentClassId = 0;
  //     delete s["SectionId"];
  //     s.RollNo = '';
  //     this.SelectedBatchId = this.CurrentBatchId;
  //     s.ClassId = this.Classes[this.Classes.findIndex(i => s.ClassId) + 1].ClassId;
  //     this.UpdateOrSave(s);
  //   })
  // }
  PromoteRow(row) {
    if (row.Promote == 1) {
      row.StudentClassId = 0;
      delete row.SectionId;
      row.RollNo = '';
      this.SelectedBatchId = this.CurrentBatchId;
      row.ClassId = this.Classes[this.Classes.findIndex(i => row.ClassId) + 1].ClassId;
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
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula", "DefaultType"];
    list.PageName = "SchoolFeeTypes";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];

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
    var obj = this.Classes.find((f: any) => f.ClassId == event.option.value.ClassId);
    if (obj) {
      this.ClassCategoryName = obj.Category;
    }
    if (this.ClassCategoryName == 'high school') {
      this.displayedColumns = [
        'StudentName',
        'ClassId',
        'ExamStatus',
        'AdmitTo',
        'SectionId',
        'RollNo',
        'FeeTypeId',
        'Remarks',
        'Active',
        'Action'
      ];
    }
    else if (this.ClassCategoryName == 'college') {
      this.displayedColumns = [
        'StudentName',
        'ClassId',
        'ExamStatus',
        'AdmitTo',
        'SemesterId',
        'RollNo',
        'FeeTypeId',
        'Remarks',
        'Active',
        'Action'
      ];
    }
  }
  GetExams() {
    //var previousBatchId = this.tokenStorage.getPreviousBatchId();
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
          this.searchForm.patchValue({ "searchExamId": this.PromotionExamId });
        }
        this.loading = false;
      })
  }
  PreviousClassId = 0;
  GetStudentClasses(previousbatch) {

    let filterStr = '';//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    this.loading = true;
    var _classId = this.searchForm.get("searchClassId")?.value;
    //var _FeeTypeId = this.searchForm.get("searchFeeTypeId")?.value;

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
    //  filterStr += " and IsCurrent eq true";
    }

    // if (_FeeTypeId > 0)
    //   filterStr += " and FeeTypeId eq " + _FeeTypeId;

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
  SelectedClassCategory = '';
  AdmitToChange(row) {

    if (row.AdmitTo > 0) {
      let obj = this.Classes.find((f: any) => f.ClassId == row.AdmitTo);
      if (obj)
        this.SelectedClassCategory = obj.Category;
    }
    row.SemesterId = 0;
    row.SectionId = 0;
    if (this.SelectedClassCategory == globalconstants.CategoryCollege)
      this.displayedColumns = [
        'StudentName',
        'ClassId',
        'ExamStatus',
        'AdmitTo',
        'SemesterId',
        'RollNo',
        'FeeTypeId',
        'Remarks',
        'Active',
        'Action'
      ];
    else
      this.displayedColumns = [
        'StudentName',
        'ClassId',
        'ExamStatus',
        'AdmitTo',
        'SectionId',
        'RollNo',
        'FeeTypeId',
        'Remarks',
        'Active',
        'Action'
      ];
    row.Action = true;
  }

  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  GetData() {
    debugger;
    this.HeaderTitle = '';
    //this.GetStudentClasses('')
    //.subscribe((StudentClassesdb: any) => {
    var _StudentId = this.searchForm.get("searchStudentName")?.value.StudentId;
    var _PId = this.searchForm.get("searchPID")?.value;
    var _examId = this.searchForm.get("searchExamId")?.value;
    if (!_StudentId && _PId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    if (_PId > 0) {
      let studId = this.PreviousBatchStudents.find((s: any) => s["PID"] == _PId)
      if (studId)
        _StudentId = studId.StudentId;
    }
    this.loading = true;
    if (_examId == 0) {
      // this.loading = false;
      // this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      // return;
      this.Display([], _StudentId);
    }
    else {
      this.GetExamResult(this.PreviousBatchId, _StudentId)
        .subscribe((examresult: any) => {
          this.Display(examresult.value, _StudentId);
        })
    }
  }
  Display(examresult, pStudentId) {
    this.StudentClassList = [];
    var _defaultTypeId = 0;
    var defaultFeeTypeObj = this.FeeTypes.find((f: any) => f.DefaultType == 1);
    if (defaultFeeTypeObj)
      _defaultTypeId = defaultFeeTypeObj.FeeTypeId;
    var _previousStudent: any = this.PreviousBatchStudents.find(studnt => studnt.StudentId == pStudentId)
    var alreadyPromoted = this.CurrentBatchStudents.find(studnt => studnt.StudentId == pStudentId)

    if (_previousStudent) {
      var _examStatus = '';
      var objexam = examresult.find(ex => ex.StudentId == _previousStudent.StudentId)
      if (objexam)
        _examStatus = objexam.Division;
      var currentClassIndex = this.Classes.findIndex(i => i.ClassId == _previousStudent.StudentClasses[0].ClassId);
      var _admitToClassId = 0, _admitToNextClassId = 0;
      if (_examStatus.toLowerCase().includes("fail") || _examStatus == '') {
        _admitToClassId = this.Classes[currentClassIndex].ClassId;
        _admitToNextClassId = this.Classes[currentClassIndex + 1].ClassId;
        this.AdmitToClasses = this.Classes.filter(c => c.ClassId == _admitToClassId || c.ClassId == _admitToNextClassId);
      }
      else {
        _admitToClassId = this.Classes[currentClassIndex + 1].ClassId;
        this.AdmitToClasses = this.Classes.filter(c => c.ClassId == _admitToClassId);
      }

      let _studentClassId = 0;
      let _admissionDate = new Date();
      let _admissionStatus = 0;

      if (alreadyPromoted &&
        alreadyPromoted.StudentClasses && alreadyPromoted.StudentClasses.length > 0) {
        //_admissionDate = objexam[0].StudentClass.AdmissionDate;
        _studentClassId = alreadyPromoted.StudentClasses[0].StudentClassId;
        _admissionStatus = 1;
      }
      var _genderName = '';
      var genderObj = this.Genders.find((f: any) => f.MasterDataId == _previousStudent.GenderId);
      if (genderObj)
        _genderName = genderObj.MasterDataName;
      var feetypeobj = this.FeeTypes.find(t => t.FeeTypeId == _defaultTypeId);

      var _feetype = ''
      if (feetypeobj)
        _feetype = feetypeobj.FeeTypeName;
      //var _lastname = _Student[0].Student.LastName == null ? '' : " " + _Student[0].Student.LastName;
      this.StudentClassList.push({
        PID: _previousStudent.PID,
        StudentClassId: _studentClassId,
        AdmissionDate: _admissionDate,
        ClassId: _previousStudent.StudentClasses[0].ClassId,
        AdmitTo: _admitToClassId,
        StudentId: _previousStudent.StudentId,
        StudentName: _previousStudent.Name,
        ClassName: this.Classes.find(c => c.ClassId == _previousStudent.StudentClasses[0].ClassId).ClassName,
        FeeTypeId: _defaultTypeId,
        FeeType: _feetype,
        RollNo: '',
        SectionId: _previousStudent.StudentClasses[0].SectionId,
        SemesterId: _previousStudent.StudentClasses[0].SemesterId,
        Section: _previousStudent.StudentClasses[0].SectionId > 0 ? this.Sections.find(sc => sc.MasterDataId == _previousStudent.StudentClasses[0].SectionId).MasterDataName : '',
        Active: _admissionStatus,
        Promote: 0,
        Remarks: '',
        GenderName: _genderName,
        ExamStatus: _examStatus,
        Action: false
      });

      // else {
      //   this.loading = false;
      //   this.contentservice.openSnackBar("No exam result found for this student!", globalconstants.ActionText, globalconstants.RedBackground);
      // }
    }
    else if (this.StudentClassList.length == 0) {
      this.HeaderTitle = '';
      this.contentservice.openSnackBar("No record found!", globalconstants.ActionText, globalconstants.RedBackground);
    }
    if (this.StudentClassList[0])
      this.AdmitToChange(this.StudentClassList[0]);
    //console.log("classid",this.StudentClassList)
    this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList.sort((a, b) => +a.RollNo - +b.RollNo));
    //this.dataSource.sort = this.sort;
    //this.dataSource.paginator = this.paginator;
    //this.dataSource.filterPredicate = this.createFilter();
    this.loading = false;
    this.PageLoading = false;
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
    //this.RowsToUpdate = 0;
    //this.UpdateOrSave(element);

  }
  StudentId = 0;
  StudentClassId = 0;
  SaveIds(element) {
    debugger;
    var _ClassId = 0;
    //if (element.StudentClasses.length > 0) {
    if (element.StudentClassId) {
      this.StudentClassId = element.StudentClassId;
      _ClassId = element.ClassId;
    }

    this.StudentId = element.StudentId;
    this.tokenStorage.saveStudentClassId(this.StudentClassId + "");
    this.tokenStorage.saveClassId(_ClassId + "");
    this.tokenStorage.saveStudentId(this.StudentId + "");

  }
  generateDetail(element) {
    debugger;

    let studentclass: any = this.PreviousBatchStudents.find(sid => sid.StudentId == element.StudentId);
    let StudentName = studentclass.PID + "-" + studentclass.FirstName + ', ' + studentclass.FatherName + ', ' + studentclass.MotherName + ', ';
    if (studentclass) {
      var _clsName = '';
      var objcls = this.Classes.find((f: any) => f.ClassId == element.AdmitTo);
      if (objcls)
        _clsName = objcls.ClassName

      var _sectionName = '';
      var sectionObj = this.Sections.find((f: any) => f.MasterDataId == element.SectionId)
      if (sectionObj)
        _sectionName = sectionObj.MasterDataName;
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
    debugger;
    //row.Active = value.checked ? 1 : 0;
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

    debugger;

    if (!row.FeeTypeId) {
      this.contentservice.openSnackBar("Please select fee type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    let checkFilterString = "StudentId eq " + row.StudentId + ' and BatchId eq ' + this.SelectedBatchId +
      " and SemesterId eq " + row.SemesterId
      " and SectionId eq " + row.SemesterId;

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
            let _currentBatchId = +this.tokenStorage.getCurrentBatchId()!;
            let _isCurrent = false;
            if (_currentBatchId == this.SelectedBatchId)
              _isCurrent = true;

            this.DataCollection.forEach(item => {
              //var _section= this.Sections.filter((s:any)=>s.MasterDataId == row.Section)
              this.StudentClassData.Active = 1;// item.Active;
              this.StudentClassData.StudentClassId = item.StudentClassId;
              this.StudentClassData.StudentId = item.StudentId;
              this.StudentClassData.ClassId = item.AdmitTo;
              this.StudentClassData.SemesterId = item.SemesterId;
              this.StudentClassData.FeeTypeId = item.FeeTypeId;
              this.StudentClassData.RollNo = item.RollNo;
              this.StudentClassData.SectionId = item.SectionId;
              this.StudentClassData.Remarks = item.Remarks;
              this.StudentClassData.AdmissionNo = item.AdmissionNo ? item.AdmissionNo : '';
              this.StudentClassData.IsCurrent = _isCurrent;
              this.StudentClassData.Admitted = true;

              this.StudentClassData.OrgId = this.LoginUserDetail[0]["orgId"];
              this.StudentClassData.SubOrgId = this.SubOrgId;
              this.StudentClassData.BatchId = this.SelectedBatchId;
              if (this.StudentClassData.StudentClassId == 0) {
                this.StudentClassData.AdmissionNo = _year //+ ClassStrength;

                this.StudentClassData.AdmissionDate = new Date();
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
          this.RowsToUpdate -= 1;
          let iteminserted: any = this.StudentClassList.find(s => s.StudentId == row.StudentId && s["BatchId"] == row.BatchId)
          iteminserted.ClassName = this.Classes.find(c => c.ClassId == data.ClassId).ClassName;
          iteminserted.StudentClassId = data.StudentClassId;
          let NewStudentFromPrevious: any = this.PreviousBatchStudents.find(st => st.StudentId == this.StudentClassData.StudentId);
          var cls = [{
            StudentClassId: data.StudentClassId,
            ClassId: this.StudentClassData.ClassId,
            FeeTypeId: this.StudentClassData.FeeTypeId,
            RollNo: this.StudentClassData.RollNo,
            SectionId: this.StudentClassData.SectionId,
            SemesterId: this.StudentClassData.SemesterId,
            Remarks: this.StudentClassData.Remarks,
            AdmissionNo: data.AdmissionNo,
            AdmissionDate: data.AdmissionDate,
            StudentFeeTypes: [...NewStudentFromPrevious.StudentClasses[0].StudentFeeTypes]
          }];
          NewStudentFromPrevious.StudentClasses = [...cls];
          row.Action = false;

          var stud = this.CurrentBatchStudents.find((f: any) => f.StudentId == this.StudentClassData.StudentId
            && f.BatchId == this.StudentClassData.BatchId);
          if (stud) {
            stud["StudentClasses"] = [...cls];
          }
          else {
            this.CurrentBatchStudents.push(NewStudentFromPrevious);
          }
          this.tokenStorage.saveStudents(this.CurrentBatchStudents);
          this.CurrentBatchStudents = this.tokenStorage.getStudents()!;

          //this.RowsToUpdate--;
          if (this.RowsToUpdate == 0) {
            this.CreateInvoice(row);
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.RowsToUpdate = -1;
          }

        }, error => {
          this.loading = false;
          this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.formatError(error), globalconstants.ActionText, globalconstants.RedBackground);
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
        }, error => {
          this.loading = false;
          this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.formatError(error), globalconstants.ActionText, globalconstants.RedBackground);
        });
  }
  CreateInvoice(row) {
    debugger;
    this.loading = true;
    this.contentservice.GetClassFeeWithFeeDefinition(this.FilterOrgSubOrgBatchId, this.StudentClassData.ClassId, 0, 0)//,this.StudentClassData.SemesterId,this.StudentClassData.SectionId)
      .subscribe((datacls: any) => {

        var _clsfeeWithDefinitions: any = [];
        let items = datacls.value.filter(m => m.FeeDefinition.Active == 1 && m.SemesterId == this.StudentClassData.SemesterId
          && m.SectionId == this.StudentClassData.SectionId);
        if (items.length == 0) {
          _clsfeeWithDefinitions = datacls.value.filter(m => m.FeeDefinition.Active == 1);
        }
        else
          _clsfeeWithDefinitions = [...items];

        this.contentservice.getStudentClassWithFeeType(this.FilterOrgSubOrgBatchId, this.StudentClassData.ClassId, this.StudentClassData.SemesterId, this.StudentClassData.SectionId, row.StudentClassId, this.StudentClassData.FeeTypeId, 0, 0)
          .subscribe((data: any) => {
            var studentfeedetail: any[] = [];
            var _feeName = '', _remark1 = '', _remark2 = '';
            var _category = '';
            var _subCategory = '';
            let _studentAllFeeTypes: any = [];
            let _formula = '';
            let _StudentNewFeeType = this.FeeTypes.find(fee => fee.FeeTypeId == this.StudentClassData.FeeTypeId);
            data.value.forEach(studcls => {
              var objClassFee = _clsfeeWithDefinitions.filter(def => def.ClassId == studcls.ClassId);
              let _currentstudent: any = this.PreviousBatchStudents.find(s => s.StudentId == studcls.StudentId);
              _feeName = '';
              _remark1 = '';
              _remark2 = '';
              if (_currentstudent) {
                _remark1 = _currentstudent.Remark1;
                _remark2 = _currentstudent.Remark2;
              }
              _studentAllFeeTypes = [];

              //studcls.StudentFeeTypes.forEach(item => {
              _studentAllFeeTypes.push(
                { FeeTypeId: _StudentNewFeeType.FeeTypeId, FeeName: _StudentNewFeeType.FeeName, Formula: _StudentNewFeeType.Formula, Discount: 0, FromMonth: 0, ToMonth: 0 })
              // })

              _studentAllFeeTypes = _studentAllFeeTypes.sort((a, b) => b.FromMonth - a.FromMonth);

              objClassFee.forEach(clsfee => {
                _category = '';
                _subCategory = '';

                var objcat = this.FeeCategories.find((f: any) => f.MasterDataId == clsfee.FeeDefinition.FeeCategoryId);
                if (objcat)
                  _category = objcat.MasterDataName;

                var objsubcat = this.FeeCategories.find((f: any) => f.MasterDataId == clsfee.FeeDefinition.FeeSubCategoryId);
                if (objsubcat)
                  _subCategory = objsubcat.MasterDataName;

                let _feeObj = _studentAllFeeTypes.find(ft => clsfee.Month >= ft.FromMonth && clsfee.Month <= ft.ToMonth);
                if (!_feeObj) {
                  _feeObj = _studentAllFeeTypes.find(ft => ft.FromMonth == 0 && ft.ToMonth == 0);
                }
                if (_feeObj.Discount && _feeObj.Discount > 0)
                  _formula = _feeObj.Formula + "-" + _feeObj.Discount;
                else
                  _formula = _feeObj.Formula

                //_formula = _feeObj.Formula;

                if (_formula && _formula.length > 0) {
                  _feeName = clsfee.FeeDefinition.FeeName;
                  studentfeedetail.push({
                    Month: clsfee.Month,
                    MonthDisplay: clsfee.MonthDisplay,
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
                    Remark1: _remark1,
                    Remark2: _remark2
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
    list.lookupFields = ["StudentClass($select=ClassId,SectionId,RollNo,Remarks;$expand=StudentFeeTypes($filter=IsCurrent eq true and Active eq true;$select=FeeTypeId))"];
    list.filter = [filterstr];
    return this.dataservice.get(list)

  }
  PromotionExamId = 0;
  SelectionChange() {
    this.PromotionExamId = this.searchForm.get("searchExamId")?.value;
    localStorage.setItem("PromotionExamId", this.PromotionExamId + "");
  }
  GetFreshData() {
    this.tokenStorage.savePreviousBatchStudents([]);
    this.GetStudents();
  }
  GetStudents() {
    this.PreviousBatchStudents = this.tokenStorage.getPreviousBatchStudents()!;
    if (this.PreviousBatchStudents.length == 0) {
      this.loading = true;
      this.PageLoading = true;
      this.StandardFilterWithPreviousBatchId += this.GetEmployeeClassIds();
      //this.StandardFilterWithPreviousBatchId += " and IsCurrent eq true";

      let list: List = new List();
      list.fields = [
        "ClassId,StudentClassId,SectionId,SemesterId,FeeTypeId,StudentId,RollNo"
      ];
      let studentfield = "PID,StudentId,FirstName,LastName,FatherName,FatherOccupation,MotherName,Height,Weight," +
        "MotherOccupation,GenderId,PermanentAddress,PresentAddress,DOB,BloodgroupId,CategoryId,AccountHolderName," +
        "BankAccountNo,IFSCCode,MICRNo,AdhaarNo,Photo,ReligionId,PersonalNo,WhatsAppNumber,FatherContactNo,MotherContactNo," +
        "PrimaryContactFatherOrMother,NameOfContactPerson,RelationWithContactPerson,ContactPersonContactNo,AlternateContact," +
        "ClassAdmissionSought,LastSchoolPercentage,TransferFromSchool,TransferFromSchoolBoard,ClubId,HouseId,RemarkId,Remark2Id," +
        "AdmissionStatusId,AdmissionDate,Notes,EmailAddress,Active,ReasonForLeavingId,IdentificationMark,BoardRegistrationNo,Deleted"
      list.PageName = "StudentClasses";
      list.lookupFields = ["Student($select=" + studentfield + "),StudentFeeTypes($select=FromMonth,ToMonth,FeeTypeId,IsCurrent,Discount,Active)"]
      list.filter = [this.StandardFilterWithPreviousBatchId + ' and Active eq 1'];

      this.dataservice.get(list)
        .subscribe((data: any) => {
          let result = data.value.filter(s => s.Student.Deleted == false);
          this.PreviousBatchStudents = [];
          var _classNameobj;
          var _className = '';
          var _studentClassId = 0;
          var _remark1 = '';
          var _remark2 = '';
          var _Section = '';
          var _semester = '';
          var _lastname = '';
          var _name = '';
          let newStudents: any = [];
          for (let i = 0; i < result.length; i++) {

            let stud = JSON.parse(JSON.stringify(result[i].Student));
            newStudents.push(stud);
            result[i].StudentFeeTypes.forEach(item => {
              item.Feetype = this.FeeTypes.filter(f => f.FeeTypeId == item.FeeTypeId);
            })
            let feetypes = JSON.parse(JSON.stringify(result[i].StudentFeeTypes));

            delete result[i].Student;
            delete result[i].StudentFeeTypes;

            let cls = JSON.parse(JSON.stringify(result[i]));
            newStudents[i].StudentClasses = [];
            newStudents[i].StudentClasses.push(cls);
            newStudents[i].StudentClasses[0].StudentFeeTypes = feetypes;

            _classNameobj;
            _className = '';
            _studentClassId = 0;
            //if (d.StudentClasses.length > 0) {
            _classNameobj = this.Classes.find(c => c.ClassId == newStudents[i].StudentClasses[0].ClassId);
            if (_classNameobj)
              _className = _classNameobj.ClassName;

            _remark1 = '';
            _remark2 = '';
            if (newStudents[i].RemarkId) {
              var _remarkObj = this.Remark1.find((f: any) => f.MasterDataId == newStudents[i].RemarkId);
              if (_remarkObj)
                _remark1 = _remarkObj.MasterDataName;
            }
            if (newStudents[i].Remark2Id) {
              var _remark2Obj = this.Remark2.find((f: any) => f.MasterDataId == newStudents[i].Remark2Id);
              if (_remark2Obj)
                _remark2 = _remark2Obj.MasterDataName;
            }
            _Section = '';
            var _sectionobj = this.Sections.find((f: any) => f.MasterDataId == newStudents[i].StudentClasses[0].SectionId);
            if (_sectionobj)
              _Section = _sectionobj.MasterDataName;
            _semester = '';
            var _semesterobj = this.Semesters.find((f: any) => f.MasterDataId == newStudents[i].StudentClasses[0].SemesterId);
            if (_semesterobj)
              _semester = _semesterobj.MasterDataName;

            //var _RollNo = d.StudentClasses[0].RollNo;
            _studentClassId = newStudents[i].StudentClasses[0].StudentClassId;
            //}
            _lastname = newStudents[i].LastName == null ? '' : " " + newStudents[i].LastName;

            _name = newStudents[i].PID + "-" + newStudents[i].FirstName + _lastname + "-" + _className + "-" + _Section + "-" + newStudents[i].StudentClasses[0].RollNo;
            //var _fullDescription = _name + "-" + _className + "-" + _Section + "-" + _RollNo;

            newStudents[i].RollNo = '';
            newStudents[i].Name = _name;
            newStudents[i].ClassName = _className;
            newStudents[i].Section = _Section;
            newStudents[i].Semester = _semester;
            newStudents[i].Remark1 = _remark1;
            newStudents[i].Remark2 = _remark2;
            newStudents[i].StudentClassId = _studentClassId;
            this.PreviousBatchStudents.push(newStudents[i]);
            // });
          }
          this.loading = false;
          this.PageLoading = false;
          this.tokenStorage.savePreviousBatchStudents(this.PreviousBatchStudents);
        })
    }
  }
  GetEmployeeClassIds() {
    let filter = '';
    this.EmployeeClassList.forEach(item => {
      if (filter.length == 0)
        filter = " and (ClassId eq " + item;
      else
        filter += " or ClassId eq " + item;
    })
    if (filter.length > 0)
      filter += ")"
    return filter;
  }
  Remark1: any = [];
  Remark2: any = [];

  GetMasterData() {
    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Remark1 = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARK1);
    this.Remark2 = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARK2);
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
        let obj = this.ClassCategory.find(c => c.MasterDataId == m.CategoryId);
        if (obj) {
          m.Category = obj.MasterDataName.toLowerCase();
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
  SectionId: number;
  SemesterId: number;
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