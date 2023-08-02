import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-customerinvoicecomponents',
  templateUrl: './customerinvoicecomponents.component.html',
  styleUrls: ['./customerinvoicecomponents.component.scss']
})
export class CustomerinvoicecomponentsComponent implements OnInit { PageLoading=true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SubOrgId=0;
  StandardFilterWithBatchId = '';
  loading = false;
  Organizations = [];
  Applications = [];
  InvoiceComponents = [];
  CustomerInvoiceComponentListName = "CustomerInvoiceComponents";
  CustomerInvoiceComponentList = [];
  dataSource: MatTableDataSource<ICustomerInvoiceComponent>;
  allMasterData = [];
  PagePermission = '';
  CustomerInvoiceComponentData = {
    CustomerInvoiceComponentId: 0,
    CustomerId: 0,
    InvoiceComponentId: 0,
    Formula: '',
    OrgId: 0,SubOrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "InvoiceComponentName",
    "ApplicationName",
    "Logic",
    "Formula",
    "Active",
    "Action"
  ];
  SelectedApplicationId=0;
  searchForm: UntypedFormGroup;
  constructor(
    private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private contentservice: ContentService,
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
      searchOrgId: [0],
      searchApplicationId: [0]
    });
    this.dataSource = new MatTableDataSource<ICustomerInvoiceComponent>([]);
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      this.SubOrgId = this.tokenStorage.getSubOrgId();
      this.GetMasterData();
      this.GetOrganizations();
    }
  }
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }

  UpdateOrSave(row) {

    this.loading = true;

    this.CustomerInvoiceComponentData.CustomerInvoiceComponentId = row.CustomerInvoiceComponentId;
    this.CustomerInvoiceComponentData.CustomerId = row.CustomerId;
    this.CustomerInvoiceComponentData.Formula = row.Formula;
    this.CustomerInvoiceComponentData.InvoiceComponentId = row.InvoiceComponentId;
    this.CustomerInvoiceComponentData.Active = row.Active;
    this.CustomerInvoiceComponentData.OrgId = this.LoginUserDetail[0]["orgId"];
    this.CustomerInvoiceComponentData.SubOrgId = this.SubOrgId;

    //console.log('data', this.CustomerInvoiceComponentData);
    if (this.CustomerInvoiceComponentData.CustomerInvoiceComponentId == 0) {
      this.CustomerInvoiceComponentData["CreatedDate"] = new Date();
      this.CustomerInvoiceComponentData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
      this.CustomerInvoiceComponentData["UpdatedDate"] = new Date();
      delete this.CustomerInvoiceComponentData["UpdatedBy"];
      ////console.log('exam slot', this.SchoolClassPeriodListData)
      this.insert(row);
    }
    else {
      delete this.CustomerInvoiceComponentData["CreatedDate"];
      delete this.CustomerInvoiceComponentData["CreatedBy"];
      this.CustomerInvoiceComponentData["UpdatedDate"] = new Date();
      this.CustomerInvoiceComponentData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
      this.update(row);
    }
    //}
    //});
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.CustomerInvoiceComponentListName, this.CustomerInvoiceComponentData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.CustomerInvoiceComponentId = data.CustomerInvoiceComponentId;
          row.Action = false;
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.CustomerInvoiceComponentListName, this.CustomerInvoiceComponentData, this.CustomerInvoiceComponentData.CustomerInvoiceComponentId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }

  GetCustomerInvoiceComponent() {
    var FilterOrgSubOrg=globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.CustomerInvoiceComponentList = [];
    var filterstr = ' and Active eq 1 ';

    if (_searchOrgId == 0) {
      this.contentservice.openSnackBar("Please select organization.", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }

    this.loading = true;

    var _searchApplicationId = 0;

    if (this.searchForm.get("searchApplicationId").value > 0) {
      _searchApplicationId = this.searchForm.get("searchApplicationId").value;
      filterstr += " and ApplicationId eq " + _searchApplicationId;
    }

    var _searchOrgId = this.searchForm.get("searchOrgId").value;



    filterstr += " and CustomerId eq " + _searchOrgId;

    let list: List = new List();
    list.fields = [
      "CustomerInvoiceComponentId",
      "CustomerId",
      "ApplicationId",
      "InvoiceComponentId",
      "Formula",
      "Active"
    ];
    list.PageName = this.CustomerInvoiceComponentListName;
    list.filter = [FilterOrgSubOrg + filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _appName = '';
        if (_searchApplicationId > 0)
          _appName = this.Applications.filter(f => f.MasterDataId == _searchApplicationId)[0].MasterDataName;

        this.InvoiceComponents.forEach(a => {
          var existing = data.value.filter(f => f.InvoiceComponentId == a.MasterDataId);
          if (existing.length > 0) {
            var _existingAppName = '';
            if (existing[0].ApplicationId > 0)
              _existingAppName = this.Applications.filter(f => f.MasterDataId == existing[0].ApplicationId)[0].MasterDataName;

            existing[0].Action = false;
            existing[0].Logic = a.Logic;
            existing[0].InvoiceComponentName = a.Description;
            existing[0].ApplicationName = _existingAppName;
            this.CustomerInvoiceComponentList.push(existing[0]);
          }
          else {

            this.CustomerInvoiceComponentList.push({
              "CustomerInvoiceComponentId": 0,
              "CustomerId": _searchOrgId,
              "ApplicationId": _searchApplicationId,
              "InvoiceComponentId": a.MasterDataId,
              "InvoiceComponentName": a.MasterDataName,
              "ApplicationName": _appName,
              "Logic": a.Logic,
              "Formula": '',
              "Active": 0,
              "Action": false
            })
          }
          this.dataSource = new MatTableDataSource<any>(this.CustomerInvoiceComponentList);
          this.loading = false; this.PageLoading=false;
        })
      })
  }


  onBlur(element) {
    element.Action = true;
  }
  GetOrganizations() {

    let list: List = new List();
    list.fields = [
      "OrganizationId",
      "OrganizationName"
    ];
    list.PageName = "Organizations";
    list.filter = ["Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Organizations = [...data.value];
      })
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SubOrgId,this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.InvoiceComponents = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.INVOICECOMPONENT);
        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.bang);

        // this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASS);
        // this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        // this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        // this.shareddata.ChangeBatch(this.Batches);
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
export interface ICustomerInvoiceComponent {
  CustomerInvoiceComponentId: number;
  CustomerId: number;
  ApplicationId: number;
  InvoiceComponentId: number;
  Formula: '';
  OrgId: number;SubOrgId: number;
  Active: number;

}






