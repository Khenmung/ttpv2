import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
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
  selector: 'app-planandmasteritem',
  templateUrl: './planandmasteritem.component.html',
  styleUrls: ['./planandmasteritem.component.scss']
})
export class PlanandmasteritemComponent implements OnInit {
    PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  PlanAndMasterItemListName = 'PlanAndMasterItems';
  loading = false;
  SelectedBatchId = 0; SubOrgId = 0;
  SelectedApplicationId = 0;
  RowToUpdateCount = -1;
  TopMasterItems = [];
  Plans = [];
  MasterItems = [];
  SelectedMasterItems = [];
  PlanAndMasterItemList: IPlanMasterItem[] = [];
  filteredOptions: Observable<IPlanMasterItem[]>;
  dataSource: MatTableDataSource<IPlanMasterItem>;
  allMasterData = [];
  PlanAndMasterItems = [];
  Applications = [];
  FeeCategories = [];
  Permission = 'deny';
  PlanAndMasterItemData = {
    PlanAndMasterDataId: 0,
    PlanId: 0,
    MasterDataId: 0,
    ApplicationId: 0,
    Active: 0
  };
  displayedColumns = [
    "PlanAndMasterDataId",
    "MasterItemName",
    "Active",
    "Action"
  ];
  nameFilter = new UntypedFormControl('');
  filterValues = {
    MasterItemName: ''
  };
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private nav: Router,
    private fb: UntypedFormBuilder
  ) {
  }

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
      searchPlanId: [0]
    });

    this.nameFilter.valueChanges
      .subscribe(
        name => {
          this.filterValues.MasterItemName = name;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    if (this.LoginUserDetail.length == 0)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.PLANANDMASTERDATA)
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
  //     PlanAndMasterItemId: 0,
  //     PlanId: 0,
  //     FeatureId: 0,
  //     FeatureName: '',
  //     ParentId: 0,

  //     Active: 0,
  //     Action: false
  //   };
  //   this.PlanAndMasterItemList = [];
  //   this.PlanAndMasterItemList.push(newdata);
  //   this.dataSource = new MatTableDataSource<IPlanAndMasterItem>(this.PlanAndMasterItemList);
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

    var toUpdate = this.PlanAndMasterItemList.filter(f => f.Action);
    this.RowToUpdateCount = toUpdate.length;
    this.loading = true;
    toUpdate.forEach(element => {
      this.RowToUpdateCount--;
      this.UpdateOrSave(element);
    });

  }
  SaveRow(row) {
    this.RowToUpdateCount = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row: IPlanMasterItem) {

    //debugger;
    this.loading = true;

    if (row.PlanId == 0) {
      this.contentservice.openSnackBar("Please select plan name.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading = false;
      row.Action = false;
      return;
    }
    let checkFilterString = "PlanId eq " + row.PlanId + " and MasterDataId eq " + row.MasterDataId +
      " and ApplicationId eq " + row.ApplicationId;

    if (row.PlanAndMasterDataId > 0)
      checkFilterString += " and PlanAndMasterDataId ne " + row.PlanAndMasterDataId;


    let list: List = new List();
    list.fields = ["PlanAndMasterDataId"];
    list.PageName = this.PlanAndMasterItemListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.PlanAndMasterItemData.PlanAndMasterDataId = row.PlanAndMasterDataId;
          this.PlanAndMasterItemData.PlanId = row.PlanId;
          this.PlanAndMasterItemData.MasterDataId = row.MasterDataId;
          this.PlanAndMasterItemData.ApplicationId = row.ApplicationId;
          this.PlanAndMasterItemData.Active = row.Active;

          if (this.PlanAndMasterItemData.PlanAndMasterDataId == 0) {
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
    this.dataservice.postPatch(this.PlanAndMasterItemListName, this.PlanAndMasterItemData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.PlanAndMasterDataId = data.PlanAndMasterDataId;
          row.Action = false;
          if (this.RowToUpdateCount == 0) {
            this.RowToUpdateCount = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse()
          }
        });
  }
  update(row) {

    this.dataservice.postPatch(this.PlanAndMasterItemListName, this.PlanAndMasterItemData, this.PlanAndMasterItemData.PlanAndMasterDataId, 'patch')
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
      this.PlanAndMasterItemList.forEach(record => {
        record.Active = 1;
        record.Action = true;
      });
    }
    else {
      this.PlanAndMasterItemList.forEach(record => {
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
    debugger;
    this.ClearDisplay();
    var ApplicationId = this.searchForm.get("searchApplicationId").value;
    this.GetMasterItems(ApplicationId).subscribe((d: any) => {

      this.MasterItems = [...d.value];
      this.TopMasterItems = this.MasterItems.filter(f => f.ParentId == 0);
      this.loading = false; this.PageLoading = false;
    }, error => console.error);
  }
  GetMasterItems(appId) {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "MasterDataId",
      "MasterDataName",
      "ParentId"
    ];

    list.PageName = "MasterItems";
    list.filter = ["ParentId eq 0 and Active eq 1 and ApplicationId eq " + appId];
    //list.limitTo =100;
    return this.dataservice.get(list)
    // .subscribe((data: any) => {
    //   this.MasterItems = [...data.value];
    // })
  }
  GetPlanAndMasterItem() {
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
      "PlanAndMasterDataId",
      "PlanId",
      "MasterDataId",
      "ApplicationId",
      "Active"
    ];

    list.PageName = this.PlanAndMasterItemListName;
    list.lookupFields = ["Plan($select=PlanId,Title;$filter=Active eq 1)", "MasterData($filter=Active eq 1;$select=MasterDataId,ApplicationId)"];

    list.filter = ["ApplicationId eq " + _applicationId + " and PlanId eq " + _PlanId];
    this.PlanAndMasterItemList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _ParentId = 0;
        // if (this.searchForm.get("searchTopfeatureId").value > 0)
        //   _ParentId = this.searchForm.get("searchTopfeatureId").value;
        this.SelectedMasterItems = this.MasterItems.filter(f => f.ParentId == _ParentId);
        this.SelectedMasterItems.forEach(f => {

          var existing = data.value.filter(d => d.MasterDataId == f.MasterDataId);
          if (existing.length > 0) {
            existing[0].ParentId = _ParentId;
            existing[0].MasterItemName = f.MasterDataName;
            existing[0].Action = false;
            this.PlanAndMasterItemList.push(existing[0]);
          }
          else {

            this.PlanAndMasterItemList.push(
              {
                PlanAndMasterDataId: 0,
                PlanId: _PlanId,
                MasterDataId: f.MasterDataId,
                MasterItemName: f.MasterDataName,
                ApplicationId: _applicationId,
                Active: 0,
                Action: false
              });
          }
        })
        if (this.PlanAndMasterItemList.length == 0) {
          this.contentservice.openSnackBar("No record found.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.PlanAndMasterItemList.sort((a, b) => b.Active - a.Active);
        this.dataSource = new MatTableDataSource<IPlanMasterItem>(this.PlanAndMasterItemList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = this.createFilter();
        this.loadingFalse();
      });

  }
  ClearDisplay() {
    this.PlanAndMasterItemList = [];
    this.dataSource = new MatTableDataSource(this.PlanAndMasterItemList);
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.MasterItemName.toLowerCase().indexOf(searchTerms.MasterItemName) !== -1
      // && data.id.toString().toLowerCase().indexOf(searchTerms.id) !== -1
      // && data.colour.toLowerCase().indexOf(searchTerms.colour) !== -1
      // && data.pet.toLowerCase().indexOf(searchTerms.pet) !== -1;
    }
    return filterFunction;
  }
  GetMasterData() {
    var globalAdminId = this.contentservice.GetPermittedAppId("globaladmin");
    var Ids = globalAdminId + "," + this.SelectedApplicationId
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SubOrgId, Ids)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
        var FilterOrgSubOrg = "OrgId eq 0 and SubOrgId eq 0";
        var applicationId = this.allMasterData.filter(m => m.MasterDataName.toLowerCase() == "application")[0].MasterDataId;
        this.contentservice.GetDropDownDataFromDB(applicationId, FilterOrgSubOrg, 0, 1)
          .subscribe((data: any) => {
            this.Applications = [...data.value];
          })

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
export interface IPlanMasterItem {
  PlanAndMasterDataId: number;
  PlanId: number;
  MasterDataId: number;
  MasterItemName: string;
  ApplicationId: number;
  Active: number;
  Action: boolean;
}




