import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-classclassgroup',
  templateUrl: './classgroup.component.html',
  styleUrls: ['./classgroup.component.scss']
})
export class ClassgroupComponent implements OnInit {
  PageLoading = true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  //IscurrentBatchSelect = 1;
  classgroupListName = 'ClassGroups';
  Applications = [];
  Permission = '';
  loading = false;
  SelectedApplicationId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  ClassGroupType = [];
  SelectedBatchId = 0; SubOrgId = 0;
  classgroupList: IClassgroup[] = [];
  filteredOptions: Observable<IClassgroup[]>;
  dataSource: MatTableDataSource<IClassgroup>;
  allMasterData = [];
  ClassMasters = [];
  classgroupData = {
    ClassGroupId: 0,
    GroupName: '',
    ClassGroupTypeId: 0,
    BatchId: 0,
    OrgId: 0, SubOrgId: 0,
    Active: 0,
    //Deleted: 0
  };
  displayedColumns = [
    "ClassGroupId",
    "GroupName",
    "ClassGroupTypeId",
    "Active",
    "Action"
  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private dialog: MatDialog,
    private nav: Router,
    private fb: UntypedFormBuilder
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
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      //this.IscurrentBatchSelect = +this.tokenStorage.getCheckEqualBatchId();
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSGROUP);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu']);
      }
      else if (this.ClassMasters.length == 0) {
        this.GetMasterData();
        this.Getclassgroups();

        this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
          this.ClassMasters = [...data.value];
          this.loading = false;
          this.PageLoading = false;
        })
      }
      this.loading = false; this.PageLoading = false;

    }
  }
  AddNew() {

    // if (this.searchForm.get("searchClassId").value == 0) {
    //   this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText,globalconstants.RedBackground);
    //   return;
    // }

    var newdata = {
      ClassGroupId: 0,
      GroupName: '',
      ClassGroupTypeId: 0,
      OrgId: 0, SubOrgId: 0,
      Active: 0,
      Action: false
    };
    this.classgroupList = [];
    this.classgroupList.push(newdata);
    this.dataSource = new MatTableDataSource<IClassgroup>(this.classgroupList);
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

    this.dataservice.postPatch('ClassGroups', toUpdate, row.ClassGroupId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.classgroupList.findIndex(x => x.ClassGroupId == row.ClassGroupId);
        this.classgroupList.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.classgroupList);
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

    if (row.ClassGroupTypeId == 0) {
      this.contentservice.openSnackBar("Please select class group type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    let checkFilterString = this.FilterOrgSubOrg + " and GroupName eq '" + row.GroupName + "'"

    if (row.ClassGroupId > 0)
      checkFilterString += " and ClassGroupId ne " + row.ClassGroupId;
    let list: List = new List();
    list.fields = ["ClassGroupId"];
    list.PageName = this.classgroupListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.classgroupData.ClassGroupId = row.ClassGroupId;
          this.classgroupData.GroupName = row.GroupName;
          this.classgroupData.ClassGroupTypeId = row.ClassGroupTypeId;
          this.classgroupData.BatchId = this.SelectedBatchId;
          this.classgroupData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.classgroupData.SubOrgId = this.SubOrgId;
          //this.classgroupData.Deleted = 0;
          this.classgroupData.Active = row.Active;

          if (this.classgroupData.ClassGroupId == 0) {
            this.classgroupData["CreatedDate"] = new Date();
            this.classgroupData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.classgroupData["UpdatedDate"] = new Date();
            delete this.classgroupData["UpdatedBy"];
            console.log("this.classgroupData", this.classgroupData)
            this.insert(row);
          }
          else {
            delete this.classgroupData["CreatedDate"];
            delete this.classgroupData["CreatedBy"];
            this.classgroupData["UpdatedDate"] = new Date();
            this.classgroupData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.classgroupListName, this.classgroupData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ClassGroupId = data.ClassGroupId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.classgroupListName, this.classgroupData, this.classgroupData.ClassGroupId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  Getclassgroups() {
    //debugger;

    this.loading = true;
    let filterStr = this.FilterOrgSubOrg;// 'OrgId eq ' + this.LoginUserDetail[0]['orgId']; // BatchId eq  + this.SelectedBatchId
    let list: List = new List();
    list.fields = [
      "ClassGroupId",
      "GroupName",
      "ClassGroupTypeId",
      "Active"
    ];

    list.PageName = this.classgroupListName;
    list.filter = [filterStr];
    this.classgroupList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.classgroupList = [...data.value];
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<IClassgroup>(this.classgroupList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.ClassGroupType = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUPTYPE)
    this.loading = false; this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);

  }
}
export interface IClassgroup {
  ClassGroupId: number;
  GroupName: string;
  ClassGroupTypeId: number;
  Active: number;
  Action: boolean;
}





