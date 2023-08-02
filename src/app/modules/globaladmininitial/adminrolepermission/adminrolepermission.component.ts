import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';

import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
@Component({
  selector: 'app-adminrolepermission',
  templateUrl: './adminrolepermission.component.html',
  styleUrls: ['./adminrolepermission.component.scss']
})
export class AdminrolepermissionComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  TopMenu = [];
  MasterData = [];
  Roles = [];
  Permissions = [];
  Permission = 'deny';
  Organizations = [];
  ApplicationRoleList = [];
  TopPageFeatures = [];
  DefinedMaster = [];
  NoOfRowsToUpdate = -1;
  PlanFeaturePages = [];
  FilteredPageFeatures = [];
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  oldvalue = '';
  selectedData = '';
  SelectedCustomerPlanId = 0;
  datasource: MatTableDataSource<IApplicationRolePermission>;
  AppRoleData = {
    ApplicationFeatureRoleId: 0,
    PlanFeatureId: 0,
    RoleId: 0,
    PermissionId: 0,
    OrgId: 0,
    SubOrgId: 0,
    Active: 0
  };
  CustomerApps = [];
  SelectedApplicationId = 0;
  ApplicationDataStatus = [];
  SchoolDataStatus = [];
  DisplayColumns = [
    "ApplicationFeatureRoleId",
    "FeatureName",
    "PermissionId",
    "Active",
    "Action"
  ];
  UserDetails = [];

  constructor(private servicework: SwUpdate,
    private fb: UntypedFormBuilder,
    private route: Router,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,

    private contentservice: ContentService,
  ) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })

    this.PageLoad();
  }

  currentPermission = '';
  enableAddNew = false;
  enableTopEdit = false;
  loading: boolean = false;
  error: string = '';
  Applications = [];
  //CustomerApplications = [];
  searchForm = this.fb.group(
    {
      searchCustomerId: [0],
      searchApplicationId: [0],
      PlanFeatureId: [0],
      RoleId: [0]
      //PermissionId: [0]
    })
  PageLoad() {
    debugger;
    this.loading = true;
    this.UserDetails = this.tokenStorage.getUserDetail();
    if (this.UserDetails == null) {
      //this.alert.error('Please login to be able to add masters!', this.optionAutoClose);
      this.contentservice.openSnackBar('Please login to be able to add masters!', globalconstants.ActionText, globalconstants.RedBackground);
      this.route.navigate(['auth/login']);
    }
    else {

      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.ADMINROLEFEATURE);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      //this.Permission='rwd'
      if (this.Permission != 'deny') {
        //this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.Permissions = globalconstants.PERMISSIONTYPES;
        this.GetApplications();
        this.GetOrganizations();
        //this.GetPageFeatures();
      }
    }
  }

  GetApplications() {
    this.contentservice.GetParentZeroMasters()
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.MasterData = [...data.value];
          var applicationId = this.MasterData.filter(m => m.MasterDataName.toLowerCase() == "application")[0].MasterDataId;
          var filterorgsuborg = 'OrgId eq 0 and SubOrgId eq 0';
          this.contentservice.GetDropDownDataFromDB(applicationId, filterorgsuborg, 0)
            .subscribe((data: any) => {
              this.Applications = [...data.value];
            })
          this.loading = false; this.PageLoading = false;
        }
      });
  }

  GetTopMenu() {
    this.TopMenu = this.PlanFeaturePages.filter(f => f.ApplicationId == this.SelectedApplicationId
      && f.ParentId == 0)
    this.TopMenu = this.TopMenu.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
  }
  getCustomersData() {
    debugger;
    //var applicationparentId = this.MasterData.filter(m => m.MasterDataName.toLowerCase() == "application")[0].MasterDataId;
    var RoleId = this.MasterData.filter(m => m.MasterDataName.toLowerCase() == "role")[0].MasterDataId;

    var Org = this.searchForm.get("searchCustomerId").value;
    var appId = this.Applications.filter(m => m.MasterDataName.toLowerCase() == 'common')[0].MasterDataId;
    //debugger;this.

    var filterOrgSubOrg = 'OrgId eq ' + Org.OrganizationId + ' and SubOrgId eq ' + Org.SubOrgId;
    this.contentservice.GetDropDownDataFromDB(RoleId, filterOrgSubOrg, appId)
      .subscribe((data: any) => {
        this.Roles = [...data.value];
        this.Roles = this.Roles.filter(r => r.MasterDataName == "Admin");
      })

  }
  GetOrganizations() {

    let list: List = new List();
    list.fields = [
      "PlanId", "CustomerPlanId"
    ];
    list.PageName = "CustomerPlans";
    list.lookupFields = ["Org($select=OrganizationId,OrganizationName,SubOrgId)"];
    list.filter = ["Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Organizations = data.value.map(f => {
          f.OrganizationId = f.Org.OrganizationId;
          f.OrganizationName = f.Org.OrganizationName;
          f.SubOrgId = f.Org.SubOrgId;
          return f;
        })
      })
  }
  SelectApplication(event) {
    debugger;
    this.EmptyData();
    this.getCustomersData();
    this.SelectedCustomerPlanId = this.Organizations.filter(f => f.OrganizationId == event.value.Org.OrganizationId)[0].PlanId;
    var list = new List();
    list.fields = [
      "ApplicationId"
    ];
    list.PageName = "PlanFeatures";
    //list.lookupFields = "MasterItem($select=MasterDataName)";
    this.CustomerApps = [];
    list.filter = ["Active eq 1 and PlanId eq " + this.SelectedCustomerPlanId];
    this.dataservice.get(list).subscribe((data: any) => {
      debugger;
      var DistinctAppIds = alasql("select distinct ApplicationId from ?", [data.value]);
      var objapp;
      DistinctAppIds.forEach(appid => {
        objapp = this.Applications.filter(a => a.MasterDataId == appid.ApplicationId);
        if (objapp.length > 0) {
          this.CustomerApps.push(objapp[0]);
        }
      })
      this.searchForm.patchValue({ "searchApplicationId": 0 });
    })
  }
  getSettingStatus(data) {
    let defined;

    return Object.keys(data[0]).map(globalcons => {

      defined = this.DefinedMaster.filter(fromdb => {
        return data[0][globalcons].toLowerCase().trim() == fromdb.MasterDataName.toLowerCase().trim();
      });

      if (defined.length > 0) {
        return {
          MasterDataName: data[0][globalcons],
          Done: true
        }
      }
      else {
        return {
          MasterDataName: data[0][globalcons],
          Done: false
        }
      }
    });

  }

  setSelectedApplication(dropdown) {
    this.EmptyData();
    this.SelectedApplicationId = dropdown.value;

    this.GetPageFeatures();
  }
  GetPageFeatures() {
    //debugger;

    let list: List = new List();
    list.fields = [
      "PlanFeatureId",
      "PlanId",
      "PageId",
      "ApplicationId"
    ];
    list.PageName = "PlanFeatures";
    list.lookupFields = ["Page($select=ParentId,label,PageTitle,DisplayOrder)"]
    list.filter = ["PlanId eq " + this.SelectedCustomerPlanId +
      " and Active eq 1 and ApplicationId eq " + this.SelectedApplicationId];
    this.PlanFeaturePages = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.PlanFeaturePages = data.value.map(d => {
            d.ParentId = d.Page.ParentId;
            d.label = d.Page.label;
            d.PageTitle = d.Page.PageTitle;
            d.DisplayOrder = d.Page.DisplayOrder;
            return d;
          });
          this.TopPageFeatures = this.PlanFeaturePages.filter(f => f.ParentId == 0);
        }
        else
          this.PlanFeaturePages = [];
        this.loading = false; this.PageLoading = false;
        console.log("PageFeatures", this.TopPageFeatures)
      })
  }
  FilterPageFeatures() {
    //debugger;
    this.FilteredPageFeatures = this.PlanFeaturePages.filter(f => f.ApplicationId == this.SelectedApplicationId);

  }
  EmptyData() {
    this.ApplicationRoleList = [];
    this.datasource = new MatTableDataSource(this.ApplicationRoleList);
  }
  GetApplicationFeatureRole() {
    debugger;
    var _customer = this.searchForm.get("searchCustomerId").value;
    var _subOrgId = _customer.SubOrgId;
    var _customerId = _customer.Org.OrganizationId;
    if (_customerId == 0) {
      this.contentservice.openSnackBar("Please select customer.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading = false;
      return;
    }

    var rolefilter = '';
    this.SelectedApplicationId = this.searchForm.get("searchApplicationId").value
    if (this.SelectedApplicationId == 0) {
      this.contentservice.openSnackBar("Please select Application", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.EmptyData();
    var _planFeatureId = this.searchForm.get("PlanFeatureId").value;
    var _ParentId = 0;
    if (_planFeatureId > 0) {

      var obj = this.PlanFeaturePages.filter(f => f.PlanFeatureId == _planFeatureId)
      if (obj.length > 0)
        _ParentId = obj[0].PageId;
    }

    //rolefilter += " and ParentId eq " + _ParentId;
    var _roleId = this.searchForm.get("RoleId").value;
    if (_roleId == 0) {
      this.contentservice.openSnackBar("Please select role.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else
      rolefilter += " and RoleId eq " + _roleId;

    let list: List = new List();
    list.fields = [
      "ApplicationFeatureRoleId",
      "PlanFeatureId",
      //"ParentId",
      "RoleId",
      "PermissionId",
      "Active"
    ];
    list.PageName = "ApplicationFeatureRolesPerms";
    //list.lookupFields = ["PlanFeature($select=FeatureId;$expand=Page($select=PageId,PageTitle,label))"];

    list.filter = ["OrgId eq " + _customerId + " and SubOrgId eq " + _subOrgId + rolefilter];
    this.ApplicationRoleList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var ResultedPermittedPageFeatures = [];
        //var _roleId = this.searchForm.get("RoleId").value;
        //var roleFilteredAssigned = data.value.filter(db => db.RoleId == _roleId);
        var filteredFeature = [];
        //if (_ParentId > 0)
        filteredFeature = this.PlanFeaturePages.filter(f => f.ParentId == _ParentId);
        //else
        //  filteredFeature = [...this.PlanFeaturePages];
        // console.log("filteredFeature")
        // console.table(filteredFeature)
        // console.log("data.value")
        // console.table(data.value)

        filteredFeature.forEach(p => {
          if(p.PlanFeatureId==421 || p.PlanFeatureId==393)
              debugger;
          var existing = data.value.filter(r => r.PlanFeatureId == p.PlanFeatureId);
          if (existing.length > 0) {
            existing.forEach(item => {
              ResultedPermittedPageFeatures.push({
                ApplicationFeatureRoleId: item.ApplicationFeatureRoleId,
                PlanFeatureId: item.PlanFeatureId,
                //FeatureId: p.FeatureId,
                FeatureName: p.label,// this.PlanFeaturePages.filter(t => t.PageId == existing[0].PlanFeatureId)[0].Label,
                RoleId: item.RoleId,
                Role: this.Roles.filter(r => r.MasterDataId == item.RoleId)[0].MasterDataName,
                PermissionId: item.PermissionId,
                DisplayOrder: p.DisplayOrder,
                ParentId: p.ParentId,
                Active: item.Active,
                Action: false
              })
            })
          }
          else
            ResultedPermittedPageFeatures.push({
              ApplicationFeatureRoleId: 0,
              PlanFeatureId: p.PlanFeatureId,
              //FeatureId: p.FeatureId,
              FeatureName: p.label,// this.PlanFeaturePages.filter(t => t.PageId == p.PageId)[0].Label,
              RoleId: _roleId,
              DisplayOrder: p.DisplayOrder,
              Role: this.Roles.filter(ir => ir.MasterDataId == _roleId)[0].MasterDataName,
              PermissionId: 1,
              ParentId: p.ParentId,
              Active: 0,
              Action: false
            })
        })
        //const parents = ResultedPermittedPageFeatures.filter(x => !x.ParentId);
        this.ApplicationRoleList = ResultedPermittedPageFeatures.sort((a, b) => a.DisplayOrder - b.DisplayOrder);

        if (this.ApplicationRoleList.length == 0) {
          this.contentservice.openSnackBar("No feature found!", globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.datasource = new MatTableDataSource<IApplicationRolePermission>(this.ApplicationRoleList);
        this.datasource.sort = this.sort;
        this.datasource.paginator = this.paginator;
      });
  }
  checkall(value) {
    this.ApplicationRoleList.forEach(record => {
      if (value.checked) {
        record.Active = 1;
      }
      else
        record.Active = 0;
      record.Action = true;
    })
  }
  // saveall() {
  //   var ToUpdate = this.ApplicationRoleList.filter(f => f.Action);
  //   this.NoOfRowsToUpdate = ToUpdate.length;
  //   ToUpdate.forEach((record, indx) => {
  //     this.NoOfRowsToUpdate--;
  //     this.UpdateOrSave(record);

  //   })
  // }
  get f() { return this.searchForm.controls }
  UpdateSaveButton(element) {
    //debugger;
    element.Action = true;
  }
  updateActive(element, event) {
    element.Action = true;
    element.Active = event.checked == true ? 1 : 0;
  }
  addnew() {
    var newdata = {
      ApplicationFeatureRoleId: 0,
      PlanFeatureId: this.searchForm.get("PlanFeatureId").value,
      FeatureName: this.PlanFeaturePages.filter(t => t.PageId == this.searchForm.get("PlanFeatureId").value)[0].PageTitle,
      RoleId: 0,
      Role: '',
      PermissionId: 0,
      Active: 0,
      Action: true
    }
    this.ApplicationRoleList.push(newdata);
    this.datasource = new MatTableDataSource<IApplicationRolePermission>(this.ApplicationRoleList);
  }
  UpdateAll() {
    var toUpdate = this.ApplicationRoleList.filter(f => f.Action);
    this.NoOfRowsToUpdate = toUpdate.length;
    toUpdate.forEach((a, indx) => {
      this.NoOfRowsToUpdate -= 1;
      this.UpdateOrSave(a);
    })
  }
  Save(row) {
    this.NoOfRowsToUpdate = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    if (row.PermissionId == 0) {
      this.contentservice.openSnackBar("Please select permission", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    let checkFilterString = this.FilterOrgSubOrg + " and Active eq 1 " +
      " and RoleId eq " + row.RoleId +
      " and PlanFeatureId eq " + row.PlanFeatureId;


    if (row.ApplicationFeatureRoleId > 0)
      checkFilterString += " and ApplicationFeatureRoleId ne " + row.ApplicationFeatureRoleId;

    let list: List = new List();
    list.fields = ["ApplicationFeatureRoleId"];
    list.PageName = "ApplicationFeatureRolesPerms";
    list.filter = [checkFilterString];
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
          this.loading = false; this.PageLoading = false;
        }
        else {
          var _ParentId = 0;
          var _planFeatureId = this.searchForm.get("PlanFeatureId").value;
          if (_planFeatureId > 0) {
            var obj = this.TopPageFeatures.filter(t => t.PlanFeatureId == _planFeatureId);
            if (obj.length > 0)
              _ParentId = obj[0].PageId;
          }

          this.AppRoleData.Active = row.Active;
          this.AppRoleData.ApplicationFeatureRoleId = row.ApplicationFeatureRoleId;
          this.AppRoleData.PlanFeatureId = row.PlanFeatureId;
          //this.AppRoleData.ParentId = _ParentId;
          this.AppRoleData.RoleId = row.RoleId;
          this.AppRoleData.PermissionId = row.PermissionId;
          this.AppRoleData.OrgId = this.searchForm.get("searchCustomerId").value.Org.OrganizationId;
          this.AppRoleData.SubOrgId = this.searchForm.get("searchCustomerId").value.SubOrgId;

          //console.log('data', this.AppRoleData);
          if (this.AppRoleData.ApplicationFeatureRoleId == 0) {
            this.AppRoleData["CreatedDate"] = new Date();
            this.AppRoleData["CreatedBy"] = this.UserDetails[0].userId;
            this.AppRoleData["UpdatedDate"] = new Date();
            this.AppRoleData["UpdatedBy"] = this.UserDetails[0].userId;
            this.insert(row);
          }
          else {
            delete this.AppRoleData["CreatedDate"];
            delete this.AppRoleData["CreatedBy"];
            this.AppRoleData["UpdatedDate"] = new Date();
            this.AppRoleData["UpdatedBy"] = this.UserDetails[0].userId;
            this.update(row);
          }
          row.Action = false;
        }
      });

  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('ApplicationFeatureRolesPerms', this.AppRoleData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.ApplicationFeatureRoleId = data.ApplicationFeatureRoleId;
          row.Action = false;
          if (this.NoOfRowsToUpdate == 0) {
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.NoOfRowsToUpdate = -1;
          }
        });
  }
  update(row) {

    this.dataservice.postPatch('ApplicationFeatureRolesPerms', this.AppRoleData, this.AppRoleData.ApplicationFeatureRoleId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.Action = false;
          if (this.NoOfRowsToUpdate == 0) {
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.NoOfRowsToUpdate = -1;
          }
        });
  }
  selected(event) {
    this.selectedData = event.target.value;
  }
  getoldvalue(value: string, row) {
    this.oldvalue = row.MasterDataName;
    //  //console.log('old value', this.oldvalue);
  }

  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.MasterData);
    // let Id = this.MasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    // })[0].MasterDataId;
    // return this.MasterData.filter((item, index) => {
    //   return item.ParentId == Id
    // });
  }
}
export interface IApplicationRolePermission {
  ApplicationFeatureRoleId: number;
  PlanFeatureId: number;
  FeatureName: string;
  RoleId: number;
  Role: string;
  PermissionId: number;
  Active: number;
}
