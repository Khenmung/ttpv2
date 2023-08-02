import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
@Component({
  selector: 'app-PlanFeature',
  templateUrl: './planfeature.component.html',
  styleUrls: ['./planfeature.component.scss']
})
export class PlanFeatureComponent implements OnInit {
    PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SubOrgId = 0;
  PlanFeatureListName = 'PlanFeatures';
  loading = false;
  SelectedBatchId = 0;
  SelectedApplicationId = 0;
  RowToUpdateCount = -1;
  Topfeatures = [];
  Plans = [];
  Features = [];
  SelectedFeatures = [];
  PlanFeatureList: IPlanFeature[] = [];
  filteredOptions: Observable<IPlanFeature[]>;
  dataSource: MatTableDataSource<IPlanFeature>;
  allMasterData = [];
  PlanFeatures = [];
  Applications = [];
  FeeCategories = [];
  Permission = 'deny';
  PlanFeatureData = {
    PlanFeatureId: 0,
    PlanId: 0,
    //ParentId: 0,
    PageId: 0,
    ApplicationId: 0,
    Active: 0
  };
  displayedColumns = [
    "PlanFeatureId",
    "FeatureName",
    "Active",
    "Action"
  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

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
      searchApplicationId: [0],
      searchPlanId: [0],
      searchTopfeatureId: [0]
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.PLANFEATURE)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.GetPlans();
        this.GetMasterData();

      }
    }
  }

  // AddNew() {

  //   var newdata = {
  //     PlanFeatureId: 0,
  //     PlanId: 0,
  //     FeatureId: 0,
  //     FeatureName: '',
  //     ParentId: 0,

  //     Active: 0,
  //     Action: false
  //   };
  //   this.PlanFeatureList = [];
  //   this.PlanFeatureList.push(newdata);
  //   this.dataSource = new MatTableDataSource<IPlanFeature>(this.PlanFeatureList);
  //   this.dataSource.paginator = this.paginator;
  //   this.dataSource.sort = this.sort;
  // }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  SaveAll() {

    var toUpdate = this.PlanFeatureList.filter(f => f.Action);
    this.RowToUpdateCount = toUpdate.length;
    this.loading = true;
    toUpdate.forEach(element => {
      this.RowToUpdateCount--;
      this.UpdateOrSave(element);
    });
    if (toUpdate.length == 0) {
      this.loading = false;
    }

  }
  SaveRow(row) {
    this.RowToUpdateCount = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row: IPlanFeature) {

    //debugger;
    this.loading = true;

    if (row.PlanId == 0) {
      this.contentservice.openSnackBar("Please enter PlanFeature name.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading = false;
      row.Action = false;
      return;
    }
    let checkFilterString = "PageId eq " + row.PageId +
      " and PlanId eq " + this.searchForm.get("searchPlanId").value +
      " and ApplicationId eq " + row.ApplicationId +
      " and Active eq 1"

    if (row.PlanFeatureId > 0)
      checkFilterString += " and PlanFeatureId ne " + row.PlanFeatureId;


    let list: List = new List();
    list.fields = ["PlanFeatureId"];
    list.PageName = this.PlanFeatureListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.PlanFeatureData.PlanFeatureId = row.PlanFeatureId;
          this.PlanFeatureData.PlanId = row.PlanId;
          this.PlanFeatureData.PageId = row.PageId;
          //this.PlanFeatureData.ParentId = row.ParentId;
          this.PlanFeatureData.ApplicationId = row.ApplicationId;
          this.PlanFeatureData.Active = row.Active;
          ////console.log("PlanFeaturedata", this.PlanFeatureData)
          if (this.PlanFeatureData.PlanFeatureId == 0) {
            this.insert(row);
          }
          else {
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
    this.dataservice.postPatch(this.PlanFeatureListName, this.PlanFeatureData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.PlanFeatureId = data.PlanFeatureId;
          row.Action = false;
          if (this.RowToUpdateCount == 0) {
            this.RowToUpdateCount = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse()
          }
        });
  }
  update(row) {

    this.dataservice.postPatch(this.PlanFeatureListName, this.PlanFeatureData, this.PlanFeatureData.PlanFeatureId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          if (this.RowToUpdateCount == 0) {
            this.RowToUpdateCount = -1;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse();
          }
        });
  }
  checkall(value) {

    if (value.checked) {
      this.PlanFeatureList.forEach(record => {
        record.Active = 1;
        record.Action = true;
      });
    }
    else {
      this.PlanFeatureList.forEach(record => {
        record.Active = 0;
        record.Action = true;
      });
    }
  }
  GetPlans() {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "PlanId",
      "Title",
      "Description",
      "Logic"
    ];

    list.PageName = "Plans";
    list.filter = ["Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Plans = [...data.value];
      })
  }
  GetTopFeature() {
    var ApplicationId = this.searchForm.get("searchApplicationId").value;
    this.GetFeatures(ApplicationId).subscribe((d: any) => {
      this.Features = [...d.value];
      this.Topfeatures = this.Features.filter(f => f.ParentId == 0);
      this.loading = false; this.PageLoading = false;
    });
  }
  GetFeatures(appId) {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "PageId",
      "PageTitle",
      "ParentId"
    ];

    list.PageName = "Pages";
    list.filter = ["Active eq 1 and ApplicationId eq " + appId];
    return this.dataservice.get(list)
    // .subscribe((data: any) => {
    //   this.Features = [...data.value];
    // })
  }
  GetPlanFeature() {

    debugger;
    var _PlanId = this.searchForm.get("searchPlanId").value;

    if (_PlanId == 0) {
      this.contentservice.openSnackBar("Please select plan.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _applicationId = this.searchForm.get("searchApplicationId").value;
    if (_applicationId == 0) {
      this.contentservice.openSnackBar("Please select application.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;

    let list: List = new List();
    list.fields = [
      "PlanFeatureId",
      "PlanId",
      "PageId",
      //"ParentId",
      "ApplicationId",
      "Active"
    ];

    list.PageName = this.PlanFeatureListName;
    list.filter = ["ApplicationId eq " + _applicationId + " and PlanId eq " + _PlanId];
    this.PlanFeatureList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _ParentId = 0;
        if (this.searchForm.get("searchTopfeatureId").value > 0)
          _ParentId = this.searchForm.get("searchTopfeatureId").value;

        this.SelectedFeatures = this.Features.filter(f => f.ParentId == _ParentId);
        this.SelectedFeatures.forEach(f => {

          var existing = data.value.filter(d => d.PageId == f.PageId);
          if (existing.length > 0) {
            existing.forEach(x => {
              x.ParentId = _ParentId;
              x.FeatureName = f.PageTitle;
              x.Action = false;
              this.PlanFeatureList.push(x);
            })
          }
          else {
            this.PlanFeatureList.push(
              {
                PlanFeatureId: 0,
                PlanId: _PlanId,
                PageId: f.PageId,
                //ParentId: _ParentId,
                FeatureName: f.PageTitle,
                ApplicationId: this.searchForm.get("searchApplicationId").value,
                Active: 0,
                Action: false
              });
          }
        })
        if (this.PlanFeatureList.length == 0) {
          this.contentservice.openSnackBar("No record found.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.PlanFeatureList.sort((a, b) => b.Active - a.Active);
        this.dataSource = new MatTableDataSource<IPlanFeature>(this.PlanFeatureList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }

  GetMasterData() {
    var globaladminId = this.contentservice.GetPermittedAppId("globaladmin");
    var ids = globaladminId + "," + this.SelectedApplicationId
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SubOrgId, ids)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);
        var _ParentId = this.allMasterData.filter(f => f.MasterDataName.toLowerCase() == 'application')[0].MasterDataId;
        //this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);
        var FilterOrgSubOrg = "OrgId eq 0 and SubOrgId eq 0";
        this.contentservice.GetDropDownDataFromDB(_ParentId, FilterOrgSubOrg, 0, 1)
          .subscribe((data: any) => {
            this.Applications = [...data.value];
          });
        this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
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
export interface IPlanFeature {
  PlanFeatureId: number;
  PlanId: number;
  PageId: number;
  FeatureName: string;
  //ParentId: number;
  ApplicationId: number;
  Active: number;
  Action: boolean;
}



