import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { EMPTY, Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { TableUtil } from '../../../shared/TableUtil';
import { IStudentDownload } from '../studentdatadump/studentdatadump.component';

@Component({
  selector: 'app-AssignStudentclassdashboard',
  templateUrl: './Assignstudentclassdashboard.component.html',
  styleUrls: ['./Assignstudentclassdashboard.component.scss']
})
export class AssignStudentclassdashboardComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  RowsToUpdate = -1;
  Defaultvalue = 0;
  //RowsT = 0;
  RollNoGenerationSortBy = '';
  SearchSectionId = 0;
  Permission = '';
  PromotePermission = '';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};

  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  StandardFilterWithPreviousBatchId = '';
  SameClassPreviousBatch: string = "SameClassPreviousBatch";
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
  Remark2: any[] = [];
  StudentGrades: any[] = [];
  ClassCategory: any[] = [];
  Selectzero = 0;
  CurrentBatchId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  PreviousBatchId = 0;
  NextBatchId = 0;
  Batches: any[] = [];
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
    OrgId: 0,
    SubOrgId: 0,
    BatchId: 0,
    StudentId: 0,
    RollNo: 0,
    SectionId: 0,
    FeeTypeId: 0,
    AdmissionNo: '',
    Remarks: '',
    Active: 1
  };
  displayedColumns = [
    'StudentName',
    'GenderName',
    //'Remark',
    //'AdmissionNo',
    'ClassId',
    'SectionId',
    'SemesterId',
    'RollNo',
    'FeeTypeId',
    'Remarks',
    'Active',
    'ExamStatus',
    'Action'
  ];
  nameFilter = new UntypedFormControl('');
  IdFilter = new UntypedFormControl('');
  filterValues: any = {
    AdmissionNo: 0,
    StudentId: 0,
    StudentName: ''
  };
  Semesters: any[] = [];
  Students: IStudent[] = [];
  filteredOptions: Observable<IStudentClass[]>;
  constructor(private servicework: SwUpdate,
    private dialog: MatDialog,
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
      searchExamId: [0],
      searchFeeTypeId: [0],
      searchSectionId: [0],
      searchClassId: [0],
      searchSemesterId: [0],
      searchRemarkId: [0],
      searchGenderAscDesc: [''],
      searchNameAscDesc: ['']
    });
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
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      this.Batches = this.tokenStorage.getBatches()!;
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.NextBatchId = +this.tokenStorage.getNextBatchId()!;
      this.PreviousBatchId = +this.tokenStorage.getPreviousBatchId()!;
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
        this.loading = false; 
        this.PageLoading = false;
      }
      //this.GetStudents();
    }
  }
  AddNew() {
    // var _classId = this.searchForm.get("searchClassId")?.value ;
    // if(_classId==0)

    var item = {
      PID: 0,
      StudentClassId: 0,
      //AdmissionNo: '',
      AdmissionDate: new Date(),
      ClassId: 0,
      SemesterId: 0,
      Semester: '',
      ClassName: '',
      StudentId: 0,
      StudentName: '',
      FatherName: '',
      MotherName: '',
      RollNo: '',
      SectionId: 0,
      Section: '',
      FeeTypeId: 0,
      FeeType: '',
      Promote: 0,
      ExamStatus: '',
      GenderName: '',
      Remark: '',
      Remarks: '',
      Active: 0,
      Action: false
    }
    this.StudentClassList = []
    this.StudentClassList.push(item);
    this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
  // openDialog() {
  //   debugger;
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     data: {
  //       message: 'Are you sure want to delete?',
  //       buttonText: {
  //         ok: 'Save',
  //         cancel: 'No'
  //       }
  //     }
  //   });
  //   const snack = this.snackBar.open('Snack bar open before dialog');

  //   dialogRef.afterClosed().subscribe((confirmed: boolean) => {
  //     if (confirmed) {
  //       //this.GenerateRollNo();
  //       snack.dismiss();
  //       const a = document.createElement('a');
  //       a.click();
  //       a.remove();
  //       snack.dismiss();
  //       this.snackBar.open('Closing snack bar in a few seconds', 'Fechar', {
  //         duration: 2000,
  //       });
  //     }
  //   });
  // }
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
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = this.createFilter();
    }
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("No student to assign roll no.", globalconstants.ActionText, globalconstants.RedBackground);

    }
  }
  StudentClassForDownload: any[] = [];
  GenerateRollNo() {

    let filterStr = this.FilterOrgSubOrgBatchId //+") and SubOrgId eq " + this.SubOrgId;
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
    var _classId = this.searchForm.get("searchClassId")?.value;
    if (_classId > 0)
      filterStr += " and ClassId eq " + _classId;
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    let _sectionId = this.searchForm.get("searchSectionId")?.value;
    let _semesterId = this.searchForm.get("searchSemesterId")?.value;
    if (_sectionId) filterStr += " and SectionId eq " + _sectionId;
    if (_semesterId) filterStr += " and SemesterId eq " + _semesterId;

    filterStr += " and IsCurrent eq true";
    // else {
    //   this.loading = false; this.PageLoading=false;
    //   this.contentservice.openSnackBar("Please select section.", globalconstants.ActionText,globalconstants.RedBackground);
    //   return;
    // }
    //filterStr += ' and BatchId eq ' + this.SelectedBatchId;

    if (filterStr.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    let studentFields = "FirstName,LastName,FatherName,MotherName,FatherOccupation,MotherOccupation,PresentAddress," +
      "PermanentAddress,GenderId,DOB,Bloodgroup,Category,BankAccountNo,IFSCCode,MICRNo,AadharNo,Photo,Religion," +
      "PersonalNo,WhatsAppNumber,FatherContactNo,MotherContactNo,PrimaryContactFatherOrMother," +
      "NameOfContactPerson,RelationWithContactPerson,ContactPersonContactNo,AlternateContact,EmailAddress," +
      "LastSchoolPercentage,ClassAdmissionSought,TransferFromSchool,TransferFromSchoolBoard"

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
    list.lookupFields = ["Student($select=" + studentFields + ")"];
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
            Gender: stud.Student.GenderId,
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
          this.StudentClassForDownload = alasql("select StudentClassId,StudentId,StudentName,ClassId,SectionId,RollNo,Gender,FeeTypeId,FatherName,MotherName from ?", [StudentClassRollNoGenList])

          this.StudentClassList = alasql(orderbystatement, [StudentClassRollNoGenList]);
          this.StudentClassList.forEach((student, index) => {
            student.RollNo = (index + 1) + "";
          });

          this.contentservice.openSnackBar("New Roll Nos. has been generated. Please confirm and save it all.", globalconstants.ActionText, globalconstants.RedBackground);

          this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.dataSource.filterPredicate = this.createFilter();
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
  promotePreviousBatch() {
    //debugger;
    var previousBatchId = +this.tokenStorage.getPreviousBatchId()!;
    this.SelectedBatchId = previousBatchId;
    this.GetStudentClasses('0');
  }
  onBlur(row) {
    row.Action = true;
  }
  UploadExcel() {

  }
  GetFeeTypes() {
    this.loading = true;
    //var filter = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula", "Confidential"];
    list.PageName = "SchoolFeeTypes";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.FeeTypes = [...data.value];
        this.FeeTypes = this.contentservice.getDropDownDataFeeType(this.tokenStorage, data.value)
        this.shareddata.ChangeFeeType(this.FeeTypes);
        this.loading = false; this.PageLoading = false;
      })
  }
  CopyFromSameClassPreviousBatch() {
    var _classId = this.searchForm.get("searchClassId")?.value;
    if (_classId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.PreviousBatchId == -1) {
      this.StudentClassList = [];
      this.dataSource = new MatTableDataSource<IStudentClass>();
      this.contentservice.openSnackBar("Previous batch not defined.", globalconstants.ActionText, globalconstants.RedBackground);
    }
    else {
      var SameClassPreviousBatchData: any[] = [];
      var ExistingData: any[] = [];
      this.StudentClassList = [];
      this.HeaderTitle = this.SameClassPreviousBatchLabel;
      this.GetStudentClasses(this.SameClassPreviousBatch)
        .subscribe((data: any) => {
          //SameClassPreviousBatchData = [...data.value];
          var result;
          result = [...data.value];

          this.GetExamResult(this.PreviousBatchId, _classId)
            .subscribe((examresult: any) => {
              //var _classId = this.searchForm.get("searchClassId")?.value

              var _defaultTypeId = 0;
              var defaultFeeTypeObj = this.FeeTypes.filter((f: any) => f.defaultType == 1);
              if (defaultFeeTypeObj.length > 0)
                _defaultTypeId = defaultFeeTypeObj[0].FeeTypeId;
              result.forEach(s => {
                var _genderName = '';
                var _examStatus = '';
                var objExam = examresult.value.filter(st => st.StudentId == s.StudentId)
                if (objExam.length > 0)
                  _examStatus = objExam[0].Division;
                var genderObj = this.Genders.filter((f: any) => f.MasterDataId == s.Student.GenderId);
                if (genderObj.length > 0)
                  _genderName = genderObj[0].MasterDataName;
                var feetype = this.FeeTypes.filter(t => t.FeeTypeId == s.FeeTypeId);
                var _feetype = ''
                if (feetype.length > 0)
                  _feetype = feetype[0].FeeTypeName;
                var _lastname = s.Student.LastName == null ? '' : " " + s.Student.LastName;
                SameClassPreviousBatchData.push({
                  StudentClassId: 0,
                  ClassId: s.ClassId,
                  StudentId: s.StudentId,
                  StudentName: s.Student.FirstName + _lastname,
                  ClassName: this.Classes.filter(c => c.ClassId == s.ClassId)[0].ClassName,
                  FeeTypeId: (s.FeeTypeId == 0 || s.FeeTypeId == null) ? _defaultTypeId : s.FeeTypeId,
                  FeeType: _feetype,
                  RollNo: s.RollNo,
                  SectionId: s.SectionId,
                  Section: s.SectionId > 0 ? this.Sections.filter(sc => sc.MasterDataId == s.SectionId)[0].MasterDataName : '',
                  Active: 0,
                  Promote: 0,
                  Remarks: '',
                  GenderName: _genderName,
                  ExamStatus: _examStatus,
                  Action: false
                });
              })

              this.GetStudentClasses('')
                .subscribe((data: any) => {
                  ExistingData = [...data.value];
                  SameClassPreviousBatchData.forEach(spb => {
                    var promoted = ExistingData.filter((f: any) => f.StudentId == spb.StudentId);
                    if (promoted.length == 0) {
                      this.StudentClassList.push(spb);
                    }
                  })
                  if (this.StudentClassList.length == 0) {
                    this.contentservice.openSnackBar("No data from " + this.HeaderTitle, globalconstants.ActionText, globalconstants.RedBackground);
                  }
                  this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList.sort((a, b) => +a.RollNo - +b.RollNo));
                  this.dataSource.sort = this.sort;
                  this.dataSource.paginator = this.paginator;
                  this.dataSource.filterPredicate = this.createFilter();
                  this.loading = false; this.PageLoading = false;

                })
            })
        });
    }
  }
  exportArray() {
    if (this.StudentClassForDownload.length > 0) {
      const datatoExport: Partial<IStudentDownload>[] = this.StudentClassForDownload;
      TableUtil.exportArrayToExcel(datatoExport, "studentclassdetail");
    }
  }
  CopyFromPreviousClassAndBatch() {
    debugger;
    var _classId = this.searchForm.get("searchClassId")?.value;
    if (_classId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.PreviousBatchId == -1) {
      this.StudentClassList = [];
      this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList);
      this.contentservice.openSnackBar("Previous batch not defined.", globalconstants.ActionText, globalconstants.RedBackground);

    } else {
      this.HeaderTitle = this.PreviousClassPreviousBatchLabel;
      var PreviousClassAndPreviousBatchData: any[] = [];
      this.StudentClassList = [];
      var ExistingData: any[] = [];
      this.GetStudentClasses(this.PreviousClassPreviousBatch)
        .subscribe((data: any) => {

          var result;
          result = [...data.value];

          this.GetExamResult(this.PreviousBatchId, this.PreviousClassId)
            .subscribe((examresult: any) => {

              ////console.log('result',result)
              var _defaultTypeId = 0;
              var defaultFeeTypeObj = this.FeeTypes.filter((f: any) => f.defaultType == 1);
              if (defaultFeeTypeObj.length > 0)
                _defaultTypeId = defaultFeeTypeObj[0].FeeTypeId;
              var _examStatus = '';
              result.forEach(s => {
                _examStatus = '';
                var objExam = examresult.value.filter(st => st.StudentId == s.StudentId)
                if (objExam.length > 0)
                  _examStatus = objExam[0].Division;
                var _genderName = '';
                var genderObj = this.Genders.filter((f: any) => f.MasterDataId == s.Student.GenderId);
                if (genderObj.length > 0)
                  _genderName = genderObj[0].MasterDataName;
                var feetype = this.FeeTypes.filter(t => t.FeeTypeId == s.FeeTypeId);
                var _feetype = ''
                if (feetype.length > 0)
                  _feetype = feetype[0].FeeTypeName;
                var _lastname = s.Student.LastName == null ? '' : " " + s.Student.LastName;
                PreviousClassAndPreviousBatchData.push({
                  StudentClassId: 0,
                  ClassId: s.ClassId,
                  StudentId: s.StudentId,
                  StudentName: s.Student.FirstName + _lastname,
                  ClassName: this.Classes.filter(c => c.ClassId == s.ClassId)[0].ClassName,
                  FeeTypeId: (s.FeeTypeId == 0 || s.FeeTypeId == null) ? _defaultTypeId : s.FeeTypeId,
                  FeeType: _feetype,
                  RollNo: s.RollNo,
                  SectionId: s.SectionId,
                  Section: s.SectionId > 0 ? this.Sections.filter(sc => sc.MasterDataId == s.SectionId)[0].MasterDataName : '',
                  Active: 0,
                  Promote: 0,
                  Remarks: '',
                  GenderName: _genderName,
                  ExamStatus: _examStatus,
                  Action: false
                });
              })

              this.GetStudentClasses('')
                .subscribe((data: any) => {
                  ExistingData = [...data.value]
                  PreviousClassAndPreviousBatchData.forEach(spb => {
                    var promoted = ExistingData.filter((f: any) => f.StudentId == spb.StudentId);
                    if (promoted.length == 0) {
                      this.StudentClassList.push(spb);
                    }
                  })
                  if (this.StudentClassList.length == 0) {
                    this.contentservice.openSnackBar("No data from " + this.HeaderTitle + " or all students have been promoted.", globalconstants.ActionText, globalconstants.RedBackground);
                  }
                  this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList.sort((a, b) => +a.RollNo - +b.RollNo));
                  this.dataSource.sort = this.sort;
                  this.dataSource.paginator = this.paginator;
                  this.dataSource.filterPredicate = this.createFilter();
                  this.loading = false; this.PageLoading = false;
                })
            })
        })
    }
  }
  CategoryName = '';
  SetLabel() {
    debugger;
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
    var _categoryObj = this.Classes.filter(c => c.ClassId == _classId)
    //var _category = ''
    if (_categoryObj.length > 0)
      this.CategoryName = _categoryObj[0].Category.toLowerCase();

    if (this.CategoryName == 'high school')
      this.displayedColumns = [
        'StudentName',
        'GenderName',
        //'Remark',
        //'AdmissionNo',
        'ClassId',
        'SectionId',
        'RollNo',
        'FeeTypeId',
        'Remarks',
        'Active',
        'ExamStatus',
        'Action'
      ];
    else
      this.displayedColumns = [
        'StudentName',
        'GenderName',
        //'Remark',
        //'AdmissionNo',
        'ClassId',
        'SemesterId',
        'RollNo',
        'FeeTypeId',
        'Remarks',
        'Active',
        'ExamStatus',
        'Action'
      ];
  }

  GetExams() {
    //var previousBatchId = this.tokenStorage.getPreviousBatchId();
    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId, 1)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.map(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId
            })
        })
      })
  }
  PreviousClassId = 0;
  GetStudentClasses(previousbatch: string) {

    let filterStr = '';//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    this.loading = true;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _FeeTypeId = this.searchForm.get("searchFeeTypeId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    let _sectionId = this.searchForm.get("searchSectionId")?.value;
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
    else {
      filterStr = this.FilterOrgSubOrgBatchId;
      if (_classId > 0)
        filterStr += " and ClassId eq " + _classId;
    }

    if (_FeeTypeId > 0)
      filterStr += " and FeeTypeId eq " + _FeeTypeId;
    if (_semesterId) filterStr += " and SemesterId eq " + _semesterId;
    if (_sectionId) filterStr += " and SectionId eq " + _sectionId;


    //filterStr += ' and BatchId eq ' + this.SelectedBatchId;
    if (classIdIndex == 0 && previousbatch == this.PreviousClassPreviousBatch) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Previous class not defined.", globalconstants.ActionText, globalconstants.RedBackground);
      return EMPTY;
    }
    else if (filterStr.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return EMPTY;
    }
    else {
      filterStr += " and IsCurrent eq true";
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
  GetData(previousbatch) {
    this.HeaderTitle = '';
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _FeeTypeId = this.searchForm.get("searchFeeTypeId")?.value;
    if(!_classId && !_FeeTypeId)
    {
      this.contentservice.openSnackBar("Please select either class or Fee type.",globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    this.loading=true;
    this.PageLoading=true;

    this.GetStudentClasses('')
      .subscribe((StudentClassesdb: any) => {
        
        this.GetExamResult(this.SelectedBatchId, _classId)
          .subscribe((examresult: any) => {

            var result;
            var _RemarkId = this.searchForm.get("searchRemarkId")?.value;
            if (_RemarkId > 0)
              result = StudentClassesdb.value.filter((f: any) => f.Student.RemarkId == _RemarkId);
            else
              result = [...StudentClassesdb.value];

            var _defaultTypeId = 0;
            var defaultFeeTypeObj = this.FeeTypes.filter((f: any) => f.defaultType == 1);
            if (defaultFeeTypeObj.length > 0)
              _defaultTypeId = defaultFeeTypeObj[0].FeeTypeId;
            result.forEach(s => {
              var obj = this.Remarks.filter((f: any) => f.MasterDataId == s.Student.RemarkId);
              var _remark = '';
              var _examStatus = '';
              var objexam = examresult.value.filter(ex => ex.StudentId == s.StudentId)
              if (objexam.length > 0)
                _examStatus = objexam[0].Division;
              if (obj.length > 0)
                _remark = obj[0].MasterDataName

              var _genderName = '';
              var genderObj = this.Genders.filter((f: any) => f.MasterDataId == s.Student.GenderId);
              if (genderObj.length > 0)
                _genderName = genderObj[0].MasterDataName;
              var _semesterName = '';
              var semesterObj = this.Semesters.filter((f: any) => f.MasterDataId == s.Student.SemesterId);
              if (semesterObj.length > 0)
                _semesterName = semesterObj[0].MasterDataName;

              var feetype = this.FeeTypes.filter(t => t.FeeTypeId == s.FeeTypeId);
              var _feetype = ''
              if (feetype.length > 0)
                _feetype = feetype[0].FeeTypeName;
              var _lastname = s.Student.LastName == null ? '' : " " + s.Student.LastName;
              this.StudentClassList.push({
                PID: s.Student.PID,
                StudentClassId: previousbatch == '' ? s.StudentClassId : 0,
                //AdmissionNo: s.AdmissionNo,
                AdmissionDate: s.AdmissionDate,
                ClassId: s.ClassId,
                SemesterId: s.SemesterId,
                Semester: _semesterName,
                StudentId: s.StudentId,
                FatherName: s.Student.FatherName,
                MotherName: s.Student.MotherName,
                StudentName: s.Student.FirstName + _lastname,
                ClassName: this.Classes.filter(c => c.ClassId == s.ClassId)[0].ClassName,
                FeeTypeId: (s.FeeTypeId == 0 || s.FeeTypeId == null) ? _defaultTypeId : s.FeeTypeId,
                FeeType: _feetype,
                RollNo: s.RollNo,
                SectionId: s.SectionId,
                Section: s.SectionId > 0 ? this.Sections.filter(sc => sc.MasterDataId == s.SectionId)[0].MasterDataName : '',
                Active: previousbatch == '' ? s.Active : 0,
                Promote: 0,
                Remark: _remark,
                Remarks: s.Remarks,
                GenderName: _genderName,
                ExamStatus: _examStatus,
                Action: false
              });
            })

            if (this.StudentClassList.length == 0) {
              this.HeaderTitle = '';
              this.contentservice.openSnackBar("No record found!", globalconstants.ActionText, globalconstants.RedBackground);
            }
            this.StudentClassForDownload = alasql("select PID,StudentName,Semester,CourseYear,ClassName,RollNo,Section,FatherName,MotherName from ? ", [this.StudentClassList])
            this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList.sort((a, b) => +a.RollNo - +b.RollNo));
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.dataSource.filterPredicate = this.createFilter();
            this.loading = false; this.PageLoading = false;
          })
      })
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
  DataCollection: any = [];
  RowCount = 0;
  SaveAll() {
    debugger;
    var _toUpdate = this.StudentClassList.filter((f: any) => f.Action);
    this.RowsToUpdate = _toUpdate.length;
    this.RowCount = 0;
    this.DataCollection = [];
    _toUpdate.forEach(e => {
      this.DataCollection.push(JSON.parse(JSON.stringify(e)));
      this.UpdateOrSave(e);
    })
  }
  SaveRow(row) {
    debugger;
    this.RowsToUpdate = 1;
    this.DataCollection = [];
    this.DataCollection.push(JSON.parse(JSON.stringify(row)));
    this.RowCount = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;

    let checkFilterString = "StudentId eq " + row.StudentId +
      ' and BatchId eq ' + this.SelectedBatchId +
      " and SemesterId eq " + row.SemesterId;


    if (row.StudentClassId > 0)
      checkFilterString += " and StudentClassId ne " + row.StudentClassId;
    checkFilterString += " and IsCurrent eq true";
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
          if (this.DataCollection.length == this.RowCount) {

            var _batchName = this.tokenStorage.getSelectedBatchName()!;
            //var _admissionNo = this.searchForm.get("AdmissionNo")?.value;
            var _year = _batchName.split('-')[0].trim();
            //var _year = new Date().getFullYear();
            this.DataCollection.forEach(item => {

              this.StudentClassData.Active = item.Active;
              this.StudentClassData.StudentClassId = item.StudentClassId;
              this.StudentClassData.StudentId = item.StudentId;
              this.StudentClassData.ClassId = item.ClassId;
              this.StudentClassData.SemesterId = item.SemesterId;
              this.StudentClassData.FeeTypeId = item.FeeTypeId;
              this.StudentClassData.RollNo = item.RollNo;
              this.StudentClassData.SectionId = item.SectionId;
              this.StudentClassData.Remarks = item.Remarks;
              this.StudentClassData.AdmissionNo = item.AdmissionNo;

              this.StudentClassData.OrgId = this.LoginUserDetail[0]["orgId"];
              this.StudentClassData.SubOrgId = this.SubOrgId;
              this.StudentClassData.BatchId = this.SelectedBatchId;
              if (this.StudentClassData.StudentClassId == 0) {
                this.StudentClassData.AdmissionNo = _year //+ ClassStrength;
                this.StudentClassData["AdmissionDate"] = new Date();
                this.StudentClassData["CreatedDate"] = new Date();
                this.StudentClassData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
                delete this.StudentClassData["UpdatedDate"];
                delete this.StudentClassData["UpdatedBy"];
                ////console.log('to insert', this.StudentClassData)
                this.insert(item);
              }
              else {
                delete this.StudentClassData["CreatedDate"];
                delete this.StudentClassData["CreatedBy"];
                this.StudentClassData["UpdatedDate"] = new Date();
                this.StudentClassData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
                this.update(item);
              }
            });
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
          iteminserted[0].ClassName = this.Classes.filter(c => c.ClassId == data.ClassId)[0].ClassName
          iteminserted[0].StudentClassId = data.StudentClassId;
          this.StudentClassData.StudentClassId = data.StudentClassId;
          iteminserted[0].Action = false;

          this.RowsToUpdate--;
          if (this.RowsToUpdate == 0) {
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.RowsToUpdate = -1;
          }

        });
  }
  update(row) {

    this.dataservice.postPatch('StudentClasses', this.StudentClassData, this.StudentClassData.StudentClassId, 'patch')
      .subscribe(
        (data: any) => {
          let itemupdated:any = this.StudentClassList.filter(s=>s.StudentClassId == row.StudentClassId)
          itemupdated[0].Action = false;
          this.RowsToUpdate--;

          if (this.RowsToUpdate == 0) {

            this.loading = false; this.PageLoading = false;
            this.CreateInvoice(row);
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        }, error => {
          var msg = globalconstants.formatError(error);
          this.contentservice.openSnackBar(msg, globalconstants.ActionText, globalconstants.RedBackground);
          this.loading = false;
        });
  }
  Delete(row) {

    this.openDialog(row)
  }
  openDialog(row) {
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

    this.dataservice.postPatch('StudentClasses', toUpdate, row.StudentClassId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.StudentClassList.findIndex(x => x.StudentClassId == row.StudentClassId)
        this.StudentClassList.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.StudentClassList);
        this.dataSource.filterPredicate = this.createFilter();
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  // createFilter(): (data: any, filter: string) => boolean {
  //   let filterFunction = function (data, filter): boolean {
  //     let searchTerms = JSON.parse(filter);
  //     return data.MasterDataName.toLowerCase().indexOf(searchTerms.MasterDataName) !== -1
  //   }
  //   return filterFunction;
  // }
  CreateInvoice(row) {
    debugger;
    this.loading = true;
    this.contentservice.GetClassFeeWithFeeDefinition(this.FilterOrgSubOrgBatchId, 0, row.ClassId)//,row.SemesterId,row.SectionId)
      .subscribe((datacls: any) => {

        var _clsfeeWithDefinitions: any = [];
        let items = datacls.value.filter(m => m.FeeDefinition.Active == 1 && m.SemesterId == this.StudentClassData.SemesterId
          && m.SectionId == this.StudentClassData.SectionId);
        if (items.length == 0) {
          _clsfeeWithDefinitions = datacls.value.filter(m => m.FeeDefinition.Active == 1);
        }
        else
          _clsfeeWithDefinitions = [...items];

        this.contentservice.getStudentClassWithFeeType(this.FilterOrgSubOrgBatchId, row.ClassId, row.SemesterId, row.SectionId, row.StudentClassId, row.FeeTypeId)
          .subscribe((data: any) => {
            var studentfeedetail: any[] = [];
            data.value.forEach(studcls => {
              var _feeName = '';
              var objClassFee = _clsfeeWithDefinitions.filter(def => def.ClassId == studcls.ClassId);
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
                    SectionId: studcls.SectionId,
                    SemesterId: studcls.SemesterId,
                    ClassId: studcls.ClassId,
                    RollNo: studcls.RollNo
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
  ExamStatuses: any[] = [];
  GetExamResult(pBatchId, pClassId) {
    var _examId = this.searchForm.get("searchExamId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    let filterstr = this.FilterOrgSubOrg;
    filterstr += " and ExamId eq " + _examId;
    filterstr += " and ClassId eq " + pClassId;
    if (_sectionId) filterstr += " and SectionId eq " + _sectionId;
    if (_semesterId) filterstr += " and SemesterId eq " + _semesterId;
    filterstr += " and BatchId eq " + pBatchId;
    let list: List = new List();
    list.fields = ["Division", "StudentClassId", "StudentId"];
    //list.PageName = "StudentClasses";
    list.PageName = "ExamStudentResults";
    list.filter = [filterstr];
    return this.dataservice.get(list)

  }
  GetStudents() {

    // let list: List = new List();
    // list.fields = [
    //   'PID',
    //   'StudentId',
    //   'FirstName',
    //   'LastName'
    // ];

    // list.PageName = "Students";
    // //list.lookupFields = ["Student"]
    // list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    //debugger;
    //  ////console.log('data.value', data.value);
    var _students: any = this.tokenStorage.getStudents()!;
    _students = _students.filter(a => a.Active == 1);
    this.Students = _students.map(student => {
      var _lastname = student.LastName == null ? '' : " " + student.LastName;
      return {
        StudentId: student.StudentId,
        Name: student.PID + '-' + student.FirstName + _lastname
      }
    })
    this.loading = false;
    this.PageLoading = false;
    //  })
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
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.StudentGrades = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
    this.Remarks = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARK1);
    this.Remark2 = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARK2);
    this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
    this.RollNoGenerationSortBy = "Sort by: " + this.RollNoGeneration.filter((f: any) => f.MasterDataName.toLowerCase() == 'sort by')[0].Logic;
    this.loading = false; this.PageLoading = false;
    this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
      this.Classes = data.value.map(m => {

        var obj = this.ClassCategory.filter(c => c.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Category = obj[0].MasterDataName.toLowerCase();
        }
        else
          m.Category = '';
        return m;
      })

      this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
    })
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
}