import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-CourseYearsemester',
  templateUrl: './CourseYearsemester.component.html',
  styleUrls: ['./CourseYearsemester.component.scss']
})
export class CourseYearsemesterComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paging: MatPaginator;
  CourseYears = [];
  Semesters = [];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  CourseYearSemesterListName = 'CourseYearSemester';
  Applications = [];
  loading = false;
  SelectedBatchId = 0; SubOrgId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  CourseYearSemesterList: IClassYearSemester[] = [];
  filteredOptions: Observable<IClassYearSemester[]>;
  dataSource: MatTableDataSource<IClassYearSemester>;
  allMasterData = [];
  //ClassGroupMapping = [];
  Permission = 'deny';
  Classes = [];
  CourseYearSemesterData = {
    CourseYearSemesterId: 0,
    ClassId: 0,
    SemesterId: 0,
    CourseYearId:0,
    OrgId: 0, 
    SubOrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    "CourseYearSemesterId",
    "ClassId",
    "CourseYearId",
    "SemesterId",
    "Active",
    "Action"
  ];
  SelectedApplicationId = 0;
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private datepipe: DatePipe,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    //debugger;
    this.searchForm = this.fb.group({
      searchClassId: [0]
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //this.EmployeeId = +this.tokenStorage.getEmployeeId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
      this.SubOrgId = this.tokenStorage.getSubOrgId();
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSGROUPING);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu'])
      }
      else {

        this.GetMasterData();
        this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
          this.Classes = [...data.value];
        });
      }
    }
  }

  AddNew() {

    var newdata = {
      CourseYearSemesterId: 0,
      ClassId: 0,
      CourseYearId:0,
      SemesterId: 0,
      Active: 0,
      Action: false
    };
    this.CourseYearSemesterList = [];
    this.CourseYearSemesterList.push(newdata);
    this.dataSource = new MatTableDataSource<IClassYearSemester>(this.CourseYearSemesterList);
    this.dataSource.paginator = this.paging;
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
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

    this.dataservice.postPatch(this.CourseYearSemesterListName, toUpdate, row.CourseYearSemesterId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.CourseYearSemesterList.findIndex(x => x.CourseYearSemesterId == row.CourseYearSemesterId);
        this.CourseYearSemesterList.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.CourseYearSemesterList);
        //this.dataSource.filterPredicate = this.createFilter();
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  ClearData(){
    this.CourseYearSemesterList =[];
    this.dataSource = new MatTableDataSource<any>(this.CourseYearSemesterList);
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
    let checkFilterString = this.FilterOrgSubOrg + " and ClassId eq " + row.ClassId +
      " and SemesterId eq " + row.SemesterId +
      " and CourseYearId eq " + row.CourseYearId

    if (row.CourseYearSemesterId > 0)
      checkFilterString += " and CourseYearSemesterId ne " + row.CourseYearSemesterId;
    let list: List = new List();
    list.fields = ["CourseYearSemesterId"];
    list.PageName = this.CourseYearSemesterListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.CourseYearSemesterData.CourseYearSemesterId = row.CourseYearSemesterId;
          this.CourseYearSemesterData.Active = row.Active;
          this.CourseYearSemesterData.ClassId = row.ClassId;
          this.CourseYearSemesterData.SemesterId = row.SemesterId;
          this.CourseYearSemesterData.CourseYearId = row.CourseYearId;
          this.CourseYearSemesterData.BatchId = this.SelectedBatchId;
          this.CourseYearSemesterData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.CourseYearSemesterData.SubOrgId = this.SubOrgId;
          //console.log("this.CourseYearSemesterData", this.CourseYearSemesterData)
          if (this.CourseYearSemesterData.CourseYearSemesterId == 0) {
            this.CourseYearSemesterData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.CourseYearSemesterData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.CourseYearSemesterData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            delete this.CourseYearSemesterData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.CourseYearSemesterData["CreatedDate"];
            delete this.CourseYearSemesterData["CreatedBy"];
            this.CourseYearSemesterData["UpdatedDate"] = new Date();
            this.CourseYearSemesterData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.CourseYearSemesterListName, this.CourseYearSemesterData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.CourseYearSemesterId = data.CourseYearSemesterId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.CourseYearSemesterListName, this.CourseYearSemesterData, this.CourseYearSemesterData.CourseYearSemesterId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  
  GetCourseYearSemester() {
    debugger;

    this.loading = true;
    let filterStr = this.FilterOrgSubOrg;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"]
    //  " and BatchId eq " + this.SelectedBatchId;

    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      filterStr += " and ClassId eq " + _classId;
    }

    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.CourseYearSemesterListName;
    list.filter = [filterStr];
    this.CourseYearSemesterList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.CourseYearSemesterList = [...data.value];
        }
        if (this.CourseYearSemesterList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        this.dataSource = new MatTableDataSource<IClassYearSemester>(this.CourseYearSemesterList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.CourseYears = this.getDropDownData(globalconstants.MasterDefinitions.school.COURSEYEAR)
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER)
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      this.Classes = [...data.value];
      this.loading = false; this.PageLoading = false;
    });

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
export interface IClassYearSemester {
  CourseYearSemesterId: number;
  ClassId: number;
  CourseYearId:number;
  SemesterId: number;
  Active: number;
  Action: boolean;
}


