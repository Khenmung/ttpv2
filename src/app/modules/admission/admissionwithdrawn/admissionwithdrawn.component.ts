import { Component, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable, EMPTY } from 'rxjs';
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
    'FirstName',
    'LastName',
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
  Months:any=[];
  filteredOptions: Observable<IStudentClass[]>;
  constructor(private servicework: SwUpdate,
    private dialog: MatDialog,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
  ) { }

  ngOnInit(): void {


    this.PageLoad();
  }

  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;

      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);

      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.Admission.ADMISSIONWITHDRAWN);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      //  this.Months = this.contentservice.GetSessionFormattedMonths()!;
      this.GetMasterData();
      this.GetStudents();
    }
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
  GetMasterData() {
    this.allMasterData = this.tokenStorage.getMasterData()!;

    // this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
    //   .subscribe((data: any) => {
    //     debugger;
    //     this.allMasterData = [...data.value];
    this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
    this.Batches = this.tokenStorage.getBatches()!;
    this.PageLoading=false;
    this.loading=false;
  }

  GetStudents() {
    //let _batchId = this.searchForm.get('searchBatchId')?.value;
    let filterStr = this.FilterOrgSubOrg;
    // if (_batchId)
    //   this.contentservice.openSnackBar('Please select batch.', globalconstants.ActionText, globalconstants.RedBackground);
    // else
    //  filterStr += ' and BatchId eq ' + _batchId;


    this.Students = [];
    let list: List = new List();
    list.fields = [
      'StudentId',
      'FirstName',
      'LastName',
      'FatherName',
      'MotherName',
      'UpdatedDate',
      "ReasonForLeavingId",
      "Notes",
      "PID",
      "Active"
    ];
    list.PageName = "Students";

    list.filter = [filterStr + " and (Active eq 0 or BatchId eq 0)"];
    this.loading = true;
    this.PageLoading = true;
    this.dataservice.get(list).subscribe((data: any) => {

      this.InActiveStudents = data.value.map(f => {

        let item = this.ReasonForLeaving.filter(h => h.MasterDataId == f.ReasonForLeavingId)
        if (item.length > 0)
          f.ReasonForLeaving = item[0].MasterDataName
        else
          f.ReasonForLeaving = '';
        return f;
      })

      if (this.InActiveStudents.length == 0) {
        this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }

      this.dataSource = new MatTableDataSource<any>(this.InActiveStudents);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loading = false;
      this.PageLoading = false;
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
