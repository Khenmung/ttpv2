import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { TableUtil } from '../../../shared/TableUtil';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { IStudentDownload } from '../studentdatadump/studentdatadump.component';

@Component({
  selector: 'app-studenthistory',
  templateUrl: './studenthistory.component.html',
  styleUrls: ['./studenthistory.component.scss']
})
export class StudenthistoryComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("table") mattable;
  Defaultvalue = 0;
  Permission = '';
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};

  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  Genders: any[] = [];
  Classes: any[] = [];
  FeeTypes: any[] = [];
  Sections: any[] = [];
  Remarks: any[] = [];
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
    'PID',
    'StudentName',
    'GenderName',
    'FatherName',
    'MotherName',
    'ClassName',
    'AdmissionDate',
    'Section',
    'Semester',
    'RollNo',
    'FeeType',
    'Batch',
    'Remarks',
    'Active',
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
      searchPID: [0],
      searchStudentName: ['']
    });

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
      this.allMasterData = this.tokenStorage.getMasterData()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.Admission.STUDENTCLASSHISTORY);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

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
      //this.GetStudents();
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


  GetFeeTypes() {
    this.loading = true;
    //var filter = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula", "Confidential"];
    list.PageName = "SchoolFeeTypes";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.FeeTypes = [...data.value];
        this.FeeTypes = this.contentservice.getDropDownDataFeeType(this.tokenStorage, data.value)
        this.shareddata.ChangeFeeType(this.FeeTypes);
        this.loading = false; this.PageLoading = false;
      })
  }


  exportArray() {
    if (this.StudentClassList.length > 0) {
      const datatoExport: Partial<IStudentDownload>[] = this.StudentClassList;
      TableUtil.exportArrayToExcel(datatoExport, "studentclassdetail");
    }
  }

  CategoryName = '';
  GetStudent() {
    debugger;
    let filterStr = this.FilterOrgSubOrg;//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    this.loading = true;
    let _paramstr = '';
    var _PID = this.searchForm.get("searchPID")?.value;
    var _studentName = this.searchForm.get("searchStudentName")?.value;
    if (_PID)
      _paramstr += " and PID eq " + _PID
    if (_studentName.length > 0) {
      if (_studentName.length < 3) {
        this.loading = false;
        this.contentservice.openSnackBar("Please enter atleast 3 characters.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
      _paramstr += " and contains(FirstName,'" + _studentName + "')";
    }

    if (_paramstr.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //filterStr += " and IsCurrent eq true";
    let list: List = new List();
    list.fields = [
      'PID',
      'FirstName',
      'LastName',
      'FatherName',
      'MotherName',
      'StudentId',
      'GenderId',
      'Notes',
      'Active'
    ];

    list.PageName = "Students";
    list.lookupFields = ["StudentClasses($select=StudentClassId,AdmissionDate,StudentId,FeeTypeId,ClassId,SemesterId,RollNo,SectionId,Remarks,Active,BatchId;$expand=StudentFeeTypes($filter=IsCurrent eq true and Active eq true;$select=FeeTypeId))"];
    list.filter = [filterStr + _paramstr];
    this.StudentClassList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _defaultTypeId = 0;
        var defaultFeeTypeObj = this.FeeTypes.find((f: any) => f.defaultType == 1);
        if (defaultFeeTypeObj)
          _defaultTypeId = defaultFeeTypeObj.FeeTypeId;
        data.value.forEach(s => {
          s.StudentClasses.forEach(c => {

            var _genderName = '';
            var genderObj = this.Genders.filter((f: any) => f.MasterDataId == s.GenderId);
            if (genderObj.length > 0)
              _genderName = genderObj[0].MasterDataName;
            var _batchName = '';
            var batchObj = this.Batches.filter((f: any) => f.BatchId == c.BatchId);
            if (batchObj.length > 0)
              _batchName = batchObj[0].BatchName;

            var _className = '';
            var _classObj = this.Classes.filter((f: any) => f.ClassId == c.ClassId);
            if (_classObj.length > 0)
              _className = _classObj[0].ClassName;

            var _semesterName = '';
            var semesterObj = this.Semesters.filter((f: any) => f.MasterDataId == c.SemesterId);
            if (semesterObj.length > 0)
              _semesterName = semesterObj[0].MasterDataName;
            var _section = '';
            var _sectionObj = this.Sections.filter((f: any) => f.MasterDataId == c.SectionId);
            if (_sectionObj.length > 0)
              _section = _sectionObj[0].MasterDataName;
            var _feetype = ''
            if (c.StudentFeeTypes.length > 0 && c.StudentFeeTypes[0].FeeTypeId) {
              let feetypeobj = this.FeeTypes.find(t => t.FeeTypeId == c.StudentFeeTypes[0].FeeTypeId);

              if (feetypeobj) {
                _defaultTypeId = c.StudentFeeTypes[0].FeeTypeId;

                _feetype = feetypeobj.FeeTypeName;
              }
            }
            var _lastname = s.LastName == null ? '' : " " + s.LastName;
            this.StudentClassList.push({
              PID: s.PID,
              StudentClassId: 0,
              AdmissionDate: c.AdmissionDate,
              ClassName: _className,
              SemesterId: c.SemesterId,
              Semester: _semesterName,
              StudentId: s.StudentId,
              FatherName: s.FatherName,
              MotherName: s.MotherName,
              StudentName: s.FirstName + _lastname,
              FeeTypeId: _defaultTypeId,
              FeeType: _feetype,
              RollNo: c.RollNo,
              Section: _section,
              Active: c.Active,
              Remarks: s.Remarks,
              GenderName: _genderName,
              Batch: _batchName,
              Action: false
            });
          })
        })

        if (this.StudentClassList.length == 0) {
          this.contentservice.openSnackBar("No record found!", globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList.sort((a, b) => +a.PID - +b.PID));
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.dataSource.filterPredicate = this.createFilter();
        this.loading = false; this.PageLoading = false;
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

  // UpdateOrSave(row) {

  //   //debugger;
  //   this.loading = true;

  //   let checkFilterString = "StudentId eq " + row.StudentId + ' and BatchId eq ' + this.SelectedBatchId +
  //     " and SemesterId eq " + row.SemesterId;


  //   if (row.StudentClassId > 0)
  //     checkFilterString += " and StudentClassId ne " + row.StudentClassId;
  //   checkFilterString += " and IsCurrent eq true";
  //   let list: List = new List();
  //   list.fields = ["StudentClassId"];
  //   list.PageName = "StudentClasses";
  //   list.filter = [checkFilterString];

  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       //debugger;
  //       if (data.value.length > 0) {
  //         this.loading = false; this.PageLoading = false;
  //         this.contentservice.openSnackBar("Student already exist in this batch.", globalconstants.ActionText, globalconstants.RedBackground);
  //         row.Ative = 0;
  //         return;
  //       }
  //       else {
  //         this.contentservice.GetStudentClassCount(this.FilterOrgSubOrg, 0, 0, 0, this.SelectedBatchId)
  //           .subscribe((data: any) => {

  //             var ClassStrength = data.value.length;
  //             ClassStrength += 1;
  //             var _batchName = this.tokenStorage.getSelectedBatchName()!;
  //             //var _admissionNo = this.searchForm.get("AdmissionNo")?.value;
  //             var _year = _batchName.split('-')[0].trim();
  //             //var _year = new Date().getFullYear();

  //             //var _section= this.Sections.filter((s:any)=>s.MasterDataId == row.Section)
  //             this.StudentClassData.Active = row.Active;
  //             this.StudentClassData.StudentClassId = row.StudentClassId;
  //             this.StudentClassData.StudentId = row.StudentId;
  //             this.StudentClassData.ClassId = row.ClassId;
  //             this.StudentClassData.SemesterId = row.SemesterId;
  //             this.StudentClassData.FeeTypeId = row.FeeTypeId;
  //             this.StudentClassData.RollNo = row.RollNo;
  //             this.StudentClassData.SectionId = row.SectionId;
  //             this.StudentClassData.Remarks = row.Remarks;
  //             this.StudentClassData.AdmissionNo = row.AdmissionNo;

  //             this.StudentClassData.OrgId = this.LoginUserDetail[0]["orgId"];
  //             this.StudentClassData.SubOrgId = this.SubOrgId;
  //             this.StudentClassData.BatchId = this.SelectedBatchId;
  //             if (this.StudentClassData.StudentClassId == 0) {
  //               this.StudentClassData.AdmissionNo = _year + ClassStrength;
  //               this.StudentClassData["AdmissionDate"] = new Date();
  //               this.StudentClassData["CreatedDate"] = new Date();
  //               this.StudentClassData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
  //               delete this.StudentClassData["UpdatedDate"];
  //               delete this.StudentClassData["UpdatedBy"];
  //               ////console.log('to insert', this.StudentClassData)
  //               this.insert(row);
  //             }
  //             else {
  //               delete this.StudentClassData["CreatedDate"];
  //               delete this.StudentClassData["CreatedBy"];
  //               this.StudentClassData["UpdatedDate"] = new Date();
  //               this.StudentClassData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
  //               this.update(row);
  //             }
  //           });
  //       }
  //     });
  // }

  // insert(row) {

  //   //debugger;
  //   this.dataservice.postPatch('StudentClasses', this.StudentClassData, 0, 'post')
  //     .subscribe(
  //       (data: any) => {
  //         this.loading = false; this.PageLoading = false;
  //         row.ClassName = this.Classes.filter(c => c.ClassId == data.ClassId)[0].ClassName
  //         row.StudentClassId = data.StudentClassId;
  //         this.StudentClassData.StudentClassId = data.StudentClassId;
  //         row.Action = false;

  //         this.RowsToUpdate--;
  //         if (this.RowsToUpdate == 0) {
  //           this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
  //           this.RowsToUpdate = -1;
  //         }

  //       });
  // }
  // update(row) {

  //   this.dataservice.postPatch('StudentClasses', this.StudentClassData, this.StudentClassData.StudentClassId, 'patch')
  //     .subscribe(
  //       (data: any) => {
  //         row.Action = false;
  //         this.RowsToUpdate--;

  //         if (this.RowsToUpdate == 0) {

  //           this.loading = false; this.PageLoading = false;
  //           this.CreateInvoice(row);
  //           this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
  //         }
  //       }, error => {
  //         var msg = globalconstants.formatError(error);
  //         this.contentservice.openSnackBar(msg, globalconstants.ActionText, globalconstants.RedBackground);
  //         this.loading = false;
  //       });
  // }
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


  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

  GetStudents() {


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
    this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.Remarks = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARK1);
    this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
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

  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }

}
export interface IStudentClass {
  PID: number;
  StudentClassId: number;
  AdmissionDate: Date;
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
  GenderName: string;
  Batch: string;
  Remarks: string;
  Active: number;
  Action: boolean
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}
