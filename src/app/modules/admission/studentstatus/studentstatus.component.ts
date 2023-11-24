import { Component, ViewChild } from '@angular/core';
import { globalconstants } from '../../../shared/globalconstant';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TableUtil } from '../../../shared/TableUtil';
import { IStudentDownload } from '../studentdatadump/studentdatadump.component';

@Component({
  selector: 'app-studentstatus',
  templateUrl: './studentstatus.component.html',
  styleUrls: ['./studentstatus.component.scss']
})
export class StudentstatusComponent {
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
  Classes: any[] = [];
  StudentStatuses: any[] = [];
  Sections: any[] = [];
  ClassCategory: any[] = [];
  Selectzero = 0;
  CurrentBatchId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  PreviousBatchId = 0;
  NextBatchId = 0;
  Batches: any[] = [];
  StudentStatusList: IStudentStatus[] = [];
  dataSource: MatTableDataSource<IStudentStatus>;
  allMasterData: any[] = [];
  searchForm: UntypedFormGroup;
  FeeCategories: any[] = [];
  SelectedApplicationId = 0;
  StudentStatusData = {
    StudentClassId: 0,
    StudentStatureId: 0,
    StatusId: 0,
    OrgId: 0,
    SubOrgId: 0,
    Active: 1
  };
  displayedColumns = [
    'PID',
    'StudentName',
    'ClassName',
    'Semester',
    'RollNo',
    'StatusId'
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
  filteredOptions: Observable<IStudentStatus[]>;
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
      searchClassId: [0],
      searchSemesterId: [0],
      searchSectionId: [0]
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

      if (this.Classes.length == 0 || this.Sections.length == 0) {
        this.GetMasterData();
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


  exportArray() {
    if (this.StudentStatusList.length > 0) {
      const datatoExport: Partial<IStudentDownload>[] = this.StudentStatusList;
      TableUtil.exportArrayToExcel(datatoExport, "studentstatus");
    }
  }

  CategoryName = '';
  GetStudentStatus() {
    debugger;
    let filterStr = this.FilterOrgSubOrgBatchId;//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    this.loading = true;
    let _paramstr = '';
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    if (_classId)
      _paramstr += " and ClassId eq " + _classId;
    if (_semesterId)
      _paramstr += " and SemesterId eq " + _semesterId;
    if (_sectionId)
      _paramstr += " and SectionId eq " + _sectionId;
    

    if (_paramstr.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //filterStr += " and IsCurrent eq true";
    let list: List = new List();
    list.fields = [
      'StudentStatureId',
      'StatusId',
      'StudentClassId',
      'Active'
    ];

    list.PageName = "StudentStatures";
    //list.lookupFields = ["StudentClasses($select=StudentClassId,AdmissionDate,StudentId,FeeTypeId,ClassId,SemesterId,RollNo,SectionId,Remarks,Active,BatchId)"];
    list.filter = [filterStr + _paramstr];
    this.StudentStatusList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        data.value.forEach(st => {
          let _student: any = this.Students.filter((s: any) => s.StudentClasses[0].StudentClassId === st.StudentClassId)
          if (_student.length > 0) {
            //s.StudentClasses.forEach(c => {

            // var _genderName = '';
            // var genderObj = this.Genders.filter((f: any) => f.MasterDataId == s.GenderId);
            // if (genderObj.length > 0)
            //   _genderName = genderObj[0].MasterDataName;
            // var _batchName = '';
            // var batchObj = this.Batches.filter((f: any) => f.BatchId == c.BatchId);
            // if (batchObj.length > 0)
            //   _batchName = batchObj[0].BatchName;

            // var _className = '';
            // var _classObj = this.Classes.filter((f: any) => f.ClassId == c.ClassId);
            // if (_classObj.length > 0)
            //   _className = _classObj[0].ClassName;

            // var _semesterName = '';
            // var semesterObj = this.Semesters.filter((f: any) => f.MasterDataId == c.SemesterId);
            // if (semesterObj.length > 0)
            //   _semesterName = semesterObj[0].MasterDataName;
            // var _section = '';
            // var _sectionObj = this.Sections.filter((f: any) => f.MasterDataId == c.SectionId);
            // if (_sectionObj.length > 0)
            //   _section = _sectionObj[0].MasterDataName;

            // var feetype = this.FeeTypes.filter(t => t.FeeTypeId == c.FeeTypeId);
            // var _feetype = ''
            // if (feetype.length > 0)
            //   _feetype = feetype[0].FeeTypeName;
            // var _lastname = s.LastName == null ? '' : " " + s.LastName;
            this.StudentStatusList.push({
              PID: st.PID,
              StudentStatureId: st.StudentStatureId,
              StudentClassId: st.StudentClassId,
              StudentName: _student[0].Name,
              ClassName: _student[0].ClassName,
              Semester: _student[0].StudentClasses[0].Semester + _student[0].StudentClasses[0].Section,
              RollNo: _student[0].StudentClasses[0].RollNo,
              StatusId: st.StatusId,
              Active: st.Active,
              Action: st.Action
            });
          }
        })

        if (this.StudentStatusList.length == 0) {
          this.contentservice.openSnackBar("No record found!", globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<IStudentStatus>(this.StudentStatusList.sort((a, b) => +a.PID - +b.PID));
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
      this.StudentStatusList.forEach(f => {
        f.Active = 1;
        f.Action = true;
      })
    else
      this.StudentStatusList.forEach(f => {
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
  //             this.StudentStatus.Active = row.Active;
  //             this.StudentStatus.StudentClassId = row.StudentClassId;
  //             this.StudentStatus.StudentId = row.StudentId;
  //             this.StudentStatus.ClassId = row.ClassId;
  //             this.StudentStatus.SemesterId = row.SemesterId;
  //             this.StudentStatus.FeeTypeId = row.FeeTypeId;
  //             this.StudentStatus.RollNo = row.RollNo;
  //             this.StudentStatus.SectionId = row.SectionId;
  //             this.StudentStatus.Remarks = row.Remarks;
  //             this.StudentStatus.AdmissionNo = row.AdmissionNo;

  //             this.StudentStatus.OrgId = this.LoginUserDetail[0]["orgId"];
  //             this.StudentStatus.SubOrgId = this.SubOrgId;
  //             this.StudentStatus.BatchId = this.SelectedBatchId;
  //             if (this.StudentStatus.StudentClassId == 0) {
  //               this.StudentStatus.AdmissionNo = _year + ClassStrength;
  //               this.StudentStatus["AdmissionDate"] = new Date();
  //               this.StudentStatus["CreatedDate"] = new Date();
  //               this.StudentStatus["CreatedBy"] = this.LoginUserDetail[0]["userId"];
  //               delete this.StudentStatus["UpdatedDate"];
  //               delete this.StudentStatus["UpdatedBy"];
  //               ////console.log('to insert', this.StudentStatus)
  //               this.insert(row);
  //             }
  //             else {
  //               delete this.StudentStatus["CreatedDate"];
  //               delete this.StudentStatus["CreatedBy"];
  //               this.StudentStatus["UpdatedDate"] = new Date();
  //               this.StudentStatus["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
  //               this.update(row);
  //             }
  //           });
  //       }
  //     });
  // }

  // insert(row) {

  //   //debugger;
  //   this.dataservice.postPatch('StudentClasses', this.StudentStatus, 0, 'post')
  //     .subscribe(
  //       (data: any) => {
  //         this.loading = false; this.PageLoading = false;
  //         row.ClassName = this.Classes.filter(c => c.ClassId == data.ClassId)[0].ClassName
  //         row.StudentClassId = data.StudentClassId;
  //         this.StudentStatus.StudentClassId = data.StudentClassId;
  //         row.Action = false;

  //         this.RowsToUpdate--;
  //         if (this.RowsToUpdate == 0) {
  //           this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
  //           this.RowsToUpdate = -1;
  //         }

  //       });
  // }
  // update(row) {

  //   this.dataservice.postPatch('StudentClasses', this.StudentStatus, this.StudentStatus.StudentClassId, 'patch')
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

    this.dataservice.postPatch('StudentStatuses', toUpdate, row.StudentStatureId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.StudentStatusList.findIndex((x:any) => x.StudentStatureId == row.StudentStatureId)
        this.StudentStatusList.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.StudentStatusList);
        this.dataSource.filterPredicate = this.createFilter();
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  onBlur(element) {
    element.Action = true;
  }

  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  SelectedClassCategory = '';
  BindSectionOrSemester() {
    let _classId = this.searchForm.get("searchClassId")?.value;
    let obj = this.Classes.filter(c => c.ClassId == _classId);
    if (obj.length > 0) {
      this.SelectedClassCategory = obj[0].Category.toLowerCase();
    }
  }
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  SaveRow(element) {
    this.RowsToUpdate = 1;
    this.UpdateOrSave(element);
  }
  RowsToUpdate = 0;
  RowCount = 0;
  DataCollection: any = [];

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

              this.StudentStatusData.Active = item.Active;
              this.StudentStatusData.StudentClassId = item.StudentClassId;
              this.StudentStatusData.StatusId = item.StatusId;
              this.StudentStatusData.StudentStatureId = item.StudentStatureId;
              this.StudentStatusData.OrgId = this.LoginUserDetail[0]["orgId"];
              this.StudentStatusData.SubOrgId = this.SubOrgId;
              if (this.StudentStatusData.StudentStatureId == 0) {
                this.StudentStatusData["CreatedDate"] = new Date();
                this.StudentStatusData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
                delete this.StudentStatusData["UpdatedDate"];
                delete this.StudentStatusData["UpdatedBy"];
                ////console.log('to insert', this.StudentStatus)
                this.insert(item);
              }
              else {
                delete this.StudentStatusData["CreatedDate"];
                delete this.StudentStatusData["CreatedBy"];
                this.StudentStatusData["UpdatedDate"] = new Date();
                this.StudentStatusData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
                this.update(item);
              }
            });
          }
        }
      });
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch('StudentStatures', this.StudentStatusData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.StudentStatureId = data.StudentStatureId;
          row.Action = false;
          this.RowsToUpdate--;
          if (this.RowsToUpdate == 0) {
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.RowsToUpdate = -1;
          }

        });
  }
  update(row) {

    this.dataservice.postPatch('StudentStatures', this.StudentStatusData, this.StudentStatusData.StudentClassId, 'patch')
      .subscribe(
        (data: any) => {
          let itemupdated: any = this.StudentStatusList.filter(s => s.StudentClassId == row.StudentClassId)
          itemupdated[0].Action = false;
          this.RowsToUpdate--;

          if (this.RowsToUpdate == 0) {

            this.loading = false; this.PageLoading = false;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        }, error => {
          var msg = globalconstants.formatError(error);
          this.contentservice.openSnackBar(msg, globalconstants.ActionText, globalconstants.RedBackground);
          this.loading = false;
        });
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
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.StudentStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTSTATUS);
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
export interface IStudentStatus {
  PID: number;
  StudentName: string;
  StudentStatureId: number;
  StudentClassId: number;
  ClassName: string;
  Semester: string;
  RollNo: string;
  StatusId: number;
  Active: number;
  Action: boolean
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}