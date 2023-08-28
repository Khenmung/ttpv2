import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-classgroupmapping',
  templateUrl: './classgroupmapping.component.html',
  styleUrls: ['./classgroupmapping.component.scss']
})
export class ClassgroupmappingComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paging: MatPaginator;
  Defaultvalue=0;
  ClassGroupTypes :any[]= [];
  ClassGroups :any[]= [];
  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  ClassGroupMappingListName = 'ClassGroupMappings';
  Applications :any[]= [];
  loading = false;
  SelectedBatchId = 0; SubOrgId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  ClassGroupMappingList: IClassGroupMapping[]= [];
  filteredOptions: Observable<IClassGroupMapping[]>;
  dataSource: MatTableDataSource<IClassGroupMapping>;
  allMasterData :any[]= [];
  ClassGroupMapping :any[]= [];
  Permission = 'deny';
  Classes :any[]= [];
  Semesters :any[]= [];
  Sections :any[]= [];
  ClassGroupMappingData = {
    ClassGroupMappingId: 0,
    ClassId: 0,
    SemesterId: 0,
    SectionId: 0,
    ClassGroupId: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    "ClassGroupMappingId",
    "ClassId",
    "SectionId",
    "SemesterId",
    "ClassGroupId",
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
      searchClassGroupId: [0]
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //this.EmployeeId = +this.tokenStorage.getEmployeeId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
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
        this.Getclassgroups();
      }
    }
  }

  AddNew() {

    var newdata = {
      ClassGroupMappingId: 0,
      ClassId: 0,
      SemesterId: 0,
      SectionId: 0,
      ClassGroupId: 0,
      Active: 0,
      Action: false
    };
    this.ClassGroupMappingList= [];
    this.ClassGroupMappingList.push(newdata);
    this.dataSource = new MatTableDataSource<IClassGroupMapping>(this.ClassGroupMappingList);
    this.dataSource.paginator = this.paging;
  }
  GetCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  GetHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  CategoryName = '';
  BindSemesterSection(row, element) {
    debugger;
    var _categoryObj = this.Classes.filter(c => c.ClassId == element.value);
    //var _category = ''
    if (_categoryObj.length > 0)
      this.CategoryName = _categoryObj[0].Category.toLowerCase();
    row.SectionId = 0;
    row.SemesterId = 0;
    row.Action = true;
    //this.ClearData();
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

    this.dataservice.postPatch('ClassGroupMappings', toUpdate, row.ClassGroupMappingId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.ClassGroupMapping.findIndex(x => x.ClassGroupMappingId == row.ClassGroupMappingId);
        this.ClassGroupMapping.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.ClassGroupMapping);
        this.dataSource.filterPredicate = this.createFilter();
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  ClearData() {
    this.ClassGroupMapping = [];
    this.dataSource = new MatTableDataSource<any>(this.ClassGroupMapping);
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
      " and ClassGroupId eq " + row.ClassGroupId +
      " and SemesterId eq " + row.SemesterId +
      " and SectionId eq " + row.SectionId;


    if (row.ClassGroupMappingId > 0)
      checkFilterString += " and ClassGroupMappingId ne " + row.ClassGroupMappingId;
    let list: List = new List();
    list.fields = ["ClassGroupMappingId"];
    list.PageName = this.ClassGroupMappingListName;
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

          this.ClassGroupMappingData.ClassGroupMappingId = row.ClassGroupMappingId;
          this.ClassGroupMappingData.Active = row.Active;
          this.ClassGroupMappingData.ClassId = row.ClassId;
          this.ClassGroupMappingData.SemesterId = row.SemesterId;
          this.ClassGroupMappingData.SectionId = row.SectionId;
          this.ClassGroupMappingData.ClassGroupId = row.ClassGroupId;
          this.ClassGroupMappingData.BatchId = this.SelectedBatchId;
          this.ClassGroupMappingData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ClassGroupMappingData.SubOrgId = this.SubOrgId;
          //console.log("this.ClassGroupMappingData", this.ClassGroupMappingData)
          if (this.ClassGroupMappingData.ClassGroupMappingId == 0) {
            this.ClassGroupMappingData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.ClassGroupMappingData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ClassGroupMappingData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            delete this.ClassGroupMappingData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ClassGroupMappingData["CreatedDate"];
            delete this.ClassGroupMappingData["CreatedBy"];
            this.ClassGroupMappingData["UpdatedDate"] = new Date();
            this.ClassGroupMappingData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.ClassGroupMappingListName, this.ClassGroupMappingData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ClassGroupMappingId = data.ClassGroupMappingId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ClassGroupMappingListName, this.ClassGroupMappingData, this.ClassGroupMappingData.ClassGroupMappingId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  classgroupList :any[]= [];
  Getclassgroups() {
    this.loading = true;
    this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
        this.loading = false;
      })
    // this.loading = true;
    // let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]['orgId']; // BatchId eq  + this.SelectedBatchId
    // let list: List = new List();
    // list.fields = [
    //   "ClassGroupId",
    //   "GroupName",
    //   "ClassGroupTypeId",
    //   "Active"
    // ];

    // list.PageName = "ClassGroups";
    // list.filter = [filterStr];
    // this.ClassGroups :any[]= [];
    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    //     if (data.value.length > 0) {
    //       this.ClassGroups = [...data.value];
    //     }
    //     else {
    //       this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
    //     }

    //   });

  }
  GetClassGroupMapping() {
    debugger;

    this.loading = true;
    let filterStr = this.FilterOrgSubOrg;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"]
    //  " and BatchId eq " + this.SelectedBatchId;

    var _ClassGroupId = this.searchForm.get("searchClassGroupId")?.value;
    if (_ClassGroupId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select class group.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      filterStr += " and ClassGroupId eq " + _ClassGroupId;
    }

    let list: List = new List();
    list.fields = ["ClassGroupMappingId,ClassId,SectionId,SemesterId,ClassGroupId,Active"];
    list.PageName = this.ClassGroupMappingListName;
    list.filter = [filterStr];
    this.ClassGroupMappingList= [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.ClassGroupMappingList = [...data.value];
        }
        if (this.ClassGroupMappingList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        this.dataSource = new MatTableDataSource<IClassGroupMapping>(this.ClassGroupMappingList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });

  }
  ClassCategory :any[]= [];
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.ClassGroupTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUPTYPE);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      this.Classes = data.value.map(m => {
        m.Category = '';
        var obj = this.ClassCategory.filter(c => c.MasterDataId == m.CategoryId);
        if (obj.length > 0)
          m.Category = obj[0].MasterDataName.toLowerCase();
        return m;
      })
      this.loading = false;
      this.PageLoading = false;
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
export interface IClassGroupMapping {
  ClassGroupMappingId: number;
  ClassId: number;
  SemesterId: number;
  SectionId: number;
  ClassGroupId: number;
  Active: number;
  Action: boolean;
}

