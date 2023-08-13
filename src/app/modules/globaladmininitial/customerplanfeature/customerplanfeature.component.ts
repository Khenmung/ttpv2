import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import {SwUpdate} from '@angular/service-worker';
@Component({
  selector: 'app-customerCustomerPlanFeature',
  templateUrl: './customerplanfeature.component.html',
  styleUrls: ['./customerplanfeature.component.scss']
})
export class CustomerPlanFeatureComponent implements OnInit { PageLoading=true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  CustomerPlanFeatureListName = 'CustomerPlanFeatures';
  loading = false;
  SelectedBatchId = 0;SubOrgId = 0;
  SelectedApplicationId = 0;
  RowToUpdateCount = -1;
  Topfeatures :any[]= [];
  Plans :any[]= [];
  Features :any[]= [];
  SelectedFeatures :any[]= [];
  CustomerPlanFeatureList: ICustomerPlanFeature[]= [];
  filteredOptions: Observable<ICustomerPlanFeature[]>;
  dataSource: MatTableDataSource<ICustomerPlanFeature>;
  FilterOrgSubOrg='';
  FilterOrgSubOrgBatchId='';
  allMasterData :any[]= [];
  CustomerPlanFeatures :any[]= [];
  Applications :any[]= [];
  FeeCategories :any[]= [];
  Permission = 'deny';
  CustomerPlanFeatureData = {
    CustomerPlanFeatureId: 0,
    FeatureName: '',
    PlanId: 0,
    Active: 0
  };
  displayedColumns = [
    "CustomerPlanFeatureId",
    "FeatureName",
    "PlanId",
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
    this.searchForm = this.fb.group({
      searchPlanId: [0],
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    //this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.CUSTOMERPLANFEATURE)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetPlans();
        this.GetMasterData();

      }
    }
  }

  AddNew() {

    var newdata = {
      CustomerPlanFeatureId: 0,
      PlanId: 0,
      FeatureName: '',
      Active: 0,
      Action: false
    };
    this.CustomerPlanFeatureList = [];
    this.CustomerPlanFeatureList.push(newdata);
    this.dataSource = new MatTableDataSource<ICustomerPlanFeature>(this.CustomerPlanFeatureList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
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

    var toUpdate = this.CustomerPlanFeatureList.filter((f:any) => f.Action);
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
  UpdateOrSave(row: ICustomerPlanFeature) {

    //debugger;
    this.loading = true;

    if (row.PlanId == 0) {
      this.contentservice.openSnackBar("Please enter CustomerPlanFeature name.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading=false;
      row.Action = false;
      return;
    }
    let checkFilterString = "FeatureName eq '" + row.FeatureName + "' and PlanId eq " + this.searchForm.get("searchPlanId")?.value

    if (row.CustomerPlanFeatureId > 0)
      checkFilterString += " and CustomerPlanFeatureId ne " + row.CustomerPlanFeatureId;


    let list: List = new List();
    list.fields = ["CustomerPlanFeatureId"];
    list.PageName = this.CustomerPlanFeatureListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.CustomerPlanFeatureData.CustomerPlanFeatureId = row.CustomerPlanFeatureId;
          this.CustomerPlanFeatureData.PlanId = row.PlanId;
          this.CustomerPlanFeatureData.FeatureName = row.FeatureName;
          this.CustomerPlanFeatureData.Active = row.Active;
          if (this.CustomerPlanFeatureData.CustomerPlanFeatureId == 0) {
            this.insert(row);
          }
          else {
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading=false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.CustomerPlanFeatureListName, this.CustomerPlanFeatureData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.CustomerPlanFeatureId = data.CustomerPlanFeatureId;
          row.Action = false;
          if (this.RowToUpdateCount == 0) {
            this.RowToUpdateCount = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse()
          }
        });
  }
  update(row) {

    this.dataservice.postPatch(this.CustomerPlanFeatureListName, this.CustomerPlanFeatureData, this.CustomerPlanFeatureData.CustomerPlanFeatureId, 'patch')
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
      this.CustomerPlanFeatureList.forEach(record => {
        record.Active = 1;
        record.Action = true;
      });
    }
    else {
      this.CustomerPlanFeatureList.forEach(record => {
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
      "Sequence",
      "Logic"
    ];

    list.PageName = "Plans";
    list.filter = ["Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var result = data.value.sort((a,b)=>a.Sequence - b.Sequence);
        this.Plans =[...result];
      })
  }
  GetTopFeature() {
    var ApplicationId = this.searchForm.get("searchApplicationId")?.value;
    this.GetFeatures(ApplicationId).subscribe((d: any) => {
      this.Features = [...d.value];
      this.Topfeatures = this.Features.filter((f:any) => f.ParentId == 0);
      this.loading = false; this.PageLoading=false;
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
  GetCustomerPlanFeature() {

    debugger;
    var _PlanId = this.searchForm.get("searchPlanId")?.value;
    var _filter ="";//"Active eq 1";
    if (_PlanId > 0) {
      _filter += "PlanId eq " + _PlanId
      // this.contentservice.openSnackBar("Please select plan.", globalconstants.ActionText, globalconstants.RedBackground);
      // return;
    }
    
    this.loading = true;

    let list: List = new List();
    list.fields = [
      "CustomerPlanFeatureId",
      "PlanId",
      "FeatureName",
      "Active"
    ];

    list.PageName = this.CustomerPlanFeatureListName;
    list.filter = [_filter];
    this.CustomerPlanFeatureList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        
        this.CustomerPlanFeatureList = data.value.map(d=>{
         var obj =this.Plans.filter((f:any)=>f.PlanId == d.PlanId);
         if(obj.length>0)
          d.PlanName = obj[0].PlanName;
          return d;
        })
        
        if (this.CustomerPlanFeatureList.length == 0) {
          this.contentservice.openSnackBar("No record found.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.CustomerPlanFeatureList.sort((a, b) => b.Active - a.Active || a.PlanId - b.PlanId);
        this.dataSource = new MatTableDataSource<ICustomerPlanFeature>(this.CustomerPlanFeatureList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }

  GetMasterData() {
    var globaladminId = this.contentservice.GetPermittedAppId("globaladmin");
    var ids = globaladminId + "," + this.SelectedApplicationId
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SubOrgId, ids)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.bang);
        var _ParentId = this.allMasterData.filter((f:any) => f.MasterDataName.toLowerCase() == 'application')[0].MasterDataId;
        //this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.bang);
        this.contentservice.GetDropDownDataFromDB(_ParentId, this.FilterOrgSubOrg, 0, 1)
          .subscribe((data: any) => {
            this.Applications = [...data.value];
          });
        this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
        this.loading = false; this.PageLoading=false;
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
export interface ICustomerPlanFeature {
  CustomerPlanFeatureId: number;
  FeatureName: string;
  PlanId: number;
  Active: number;
  Action: boolean;
}



