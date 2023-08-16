import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import {SwUpdate} from '@angular/service-worker';
@Component({
  selector: 'app-organizationpayment',
  templateUrl: 'organizationpayment.component.html',
  styleUrls: ['organizationpayment.component.scss']
})
export class OrganizationpaymentComponent implements OnInit { PageLoading=true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  Applications :any[]= [];
  Organizations :any[]= [];
  Currencies :any[]= [];
  PaymentModes :any[]= [];
  OrganizationPaymentListName = "OrganizationPayments";
  OrganizationPaymentList :any[]= [];
  Plans :any[]= [];
  CustomerPlans :any[]= [];
  dataSource: MatTableDataSource<IOrganizationPayment>;
  allMasterData :any[]= [];
  PagePermission = '';
  SubOrgId=0;
  OrganizationPaymentData = {
    OrganizationPaymentId: 0,
    OrgId: 0,SubOrgId: 0,
    OrganizationPlanId: 0,
    PaidMonths: 0,
    PaymentDate: new Date(),
    Amount: 0,
    PaymentMode: 0,
    Active: 1
  };
  OrgId = 0;
  UserId = '';
  displayedColumns = [
    "OrganizationPaymentId",
    "PlanName",
    "AmountPerMonth",
    "PaidMonths",
    "PaymentMode",
    "Amount",
    "PaymentDate",
    //"Active",
    "Action"
  ];
  Permission = '';
  SelectedApplicationId = 0;
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
      searchOrganization: [0]
    });
    this.dataSource = new MatTableDataSource<IOrganizationPayment>([]);
    this.PageLoad();
  }

  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail.length == 0) {
      this.UserId = localStorage.getItem("userId")!;
      this.OrgId = +localStorage.getItem("orgId")!;
    }
    else {
     
      this.UserId = this.LoginUserDetail[0]["userId"];
      this.OrgId = this.LoginUserDetail[0]["orgId"];
      this.SubOrgId= this.tokenStorage.getSubOrgId()!;

      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.ORGANIZATIONPAYMENT);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission == 'deny') {
        this.loading = false; this.PageLoading=false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);

        this.GetPaymentModes();
        this.GetOrganizations();
        this.GetCustomerPlan();

      }
    }
  }
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }
  login() {
    this.nav.navigate(['auth/login']);
  }
  AddNew() {
    var orgId = this.searchForm.get("searchOrganization")?.value
    if (orgId == 0) {
      this.loading = false; this.PageLoading=false;
      this.contentservice.openSnackBar("Please select customer.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var customDetail = this.CustomerPlans.filter((f:any) => f.OrgId == orgId);
    var AmountPerMonth = 0;
    var PlanId = 0;
    var PlanName = '';
    if (customDetail.length > 0) {
      PlanName = customDetail[0].PlanName;
      PlanId = customDetail[0].CustomerPlanId;
      AmountPerMonth = customDetail[0].AmountPerMonth;
    }
    var newdata = {
      "OrganizationPaymentId": 0,
      "OrganizationPlanId": PlanId,
      "PlanName": PlanName,
      "AmountPerMonth": AmountPerMonth,
      "PaidMonths": 0,
      "Amount": 0,
      "PaymentDate": new Date(),
      "Active": 1,
      "Action": true,
      "OrgId": 0,
      "PaymentStatus": '',
      "PaymentMode": 0
    }
    this.OrganizationPaymentList=[];
    this.OrganizationPaymentList.push(newdata);
    this.dataSource = new MatTableDataSource<IOrganizationPayment>(this.OrganizationPaymentList);
    this.dataSource.paginator = this.paginator;
  }
  UpdateOrSave(row) {

    if (row.PaidMonths == 0) {
      this.contentservice.openSnackBar("Please payment for enter no. of months.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading=false;
      row.Action = true;
      return;
    }
    if (row.PaymentMode == 0) {
      this.contentservice.openSnackBar("Please select payment mode.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading=false;
      row.Action = true;
      return;
    }
    var _searchOrgId = this.searchForm.get("searchOrganization")?.value;
    this.OrganizationPaymentData.OrganizationPaymentId = row.OrganizationPaymentId;
    this.OrganizationPaymentData.OrganizationPlanId = row.OrganizationPlanId;
    this.OrganizationPaymentData.PaidMonths = row.PaidMonths;
    this.OrganizationPaymentData.Amount = row.Amount;
    this.OrganizationPaymentData.PaymentMode = row.PaymentMode;
    this.OrganizationPaymentData.Active = row.Active;
    this.OrganizationPaymentData.OrgId = _searchOrgId;//this.LoginUserDetail[0]["orgId"];
    this.OrganizationPaymentData.SubOrgId = this.SubOrgId;//this.LoginUserDetail[0]["orgId"];
    this.OrganizationPaymentData.PaymentDate = row.PaymentDate
    if (this.OrganizationPaymentData.OrganizationPaymentId == 0) {
      this.OrganizationPaymentData["CreatedDate"] = new Date();
      this.OrganizationPaymentData["CreatedBy"] = this.UserId;
      this.OrganizationPaymentData["UpdatedDate"] = new Date();
      delete this.OrganizationPaymentData["UpdatedBy"];
      this.insert(row);
    }
    else {
      delete this.OrganizationPaymentData["CreatedDate"];
      delete this.OrganizationPaymentData["CreatedBy"];
      this.OrganizationPaymentData["UpdatedDate"] = new Date();
      this.OrganizationPaymentData["UpdatedBy"] = this.UserId;
      this.update(row);
    }
  }
  insert(row) {

    debugger;
    this.dataservice.postPatch(this.OrganizationPaymentListName, this.OrganizationPaymentData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.OrganizationPaymentId = data.OrganizationPaymentId;
          row.Action = false;
          
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }, error => {
          this.contentservice.openSnackBar("error occured. Please contact administrator.", globalconstants.ActionText, globalconstants.RedBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.OrganizationPaymentListName, this.OrganizationPaymentData, this.OrganizationPaymentData.OrganizationPaymentId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading=false;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  GetPaymentModes() {
    this.contentservice.GetParentZeroMasters()
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Applications = this.tokenStorage.getPermittedApplications();
        var globalAdminId = this.Applications.filter((f:any) => f.appShortName.toLowerCase() == 'globaladmin')[0].applicationId;
        var PaymentModeParentId = this.allMasterData.filter((f:any) => f.MasterDataName.toLowerCase() == globalconstants.MasterDefinitions.schoolapps.PAYMENTSTATUS)[0].MasterDataId;
        
        this.contentservice.GetDropDownDataFromDB(PaymentModeParentId, this.FilterOrgSubOrg, globalAdminId, 1)
          .subscribe((data: any) => {
            this.PaymentModes = [...data.value];
            this.loading = false; this.PageLoading=false;
            console.log("dd",this.PaymentModes)
          });
      })
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

        if (this.LoginUserDetail[0]["org"] != 'TTP') {
          this.searchForm.patchValue({ "searchOrganization": this.OrgId });
          this.searchForm.controls["searchOrganization"].disable();
          this.GetOrganizationPayment();
        }
      })
  }
  GetCustomerPlan() {
    let list: List = new List();
    list.fields = [
      "CustomerPlanId",
      "PlanId",
      "LoginUserCount",
      "PersonOrItemCount",
      "Formula",
      "AmountPerMonth",
      "OrgId",
      "Active"
    ];
    list.PageName = "CustomerPlans";
    list.lookupFields = ["Plan($select=PlanId,Title)"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.CustomerPlans = data.value.map(m => {
          m.PlanName = m.Plan.Title;
          return m;
        });
        this.loading = false; this.PageLoading=false;
        //      this.GetOrganizationPayment();
      })
  }
  GetOrganizationPayment() {
    debugger;
    this.OrganizationPaymentList = [];
    //var orgIdSearchstr = ' and OrgId eq ' + localStorage.getItem("orgId");// + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    var _searchOrgId = this.searchForm.get("searchOrganization")?.value;
    if (_searchOrgId == 0) {
      this.contentservice.openSnackBar("Please select organization", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;

    

    if (_searchOrgId > 0)
      filterstr += " and OrgId eq " + _searchOrgId;

    let list: List = new List();
    list.fields = [
      "OrganizationPaymentId",
      "OrgId",
      "OrganizationPlanId",
      "AmountPerMonth",
      "PaidMonths",
      "PaymentDate",
      "Amount",
      "PaymentMode",
      "Active"
    ];
    list.PageName = this.OrganizationPaymentListName;
    //list.orderBy = "OrganizationPaymentId desc"
    //list.lookupFields :any[]= [];
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //var customerapp;
        this.OrganizationPaymentList = data.value.map(x => {
          var customerplanobj = this.CustomerPlans.filter((f:any) => f.CustomerPlanId == x.OrganizationPlanId);
          if (customerplanobj.length > 0) {
            x.PlanName = customerplanobj[0].PlanName;
            //x.AmountPerMonth = //customerplanobj[0].AmountPerMonth;
            x.PaymentStatus = this.PaymentModes.filter((f:any) => f.MasterDataId == x.PaymentMode)[0].MasterDataName;
          }
          return x;
        });

        if (this.OrganizationPaymentList.length == 0)
          this.contentservice.openSnackBar("No record found!", globalconstants.ActionText, globalconstants.RedBackground);

          this.OrganizationPaymentList =this.OrganizationPaymentList.sort((a,b)=>b.OrganizationPaymentId- a.OrganizationPaymentId);
        this.dataSource = new MatTableDataSource<any>(this.OrganizationPaymentList.sort((a, b) => new Date(b.PaymentDate).getTime() - new Date(a.PaymentDate).getTime()));
        this.dataSource.paginator = this.paginator;
        this.loading = false; this.PageLoading=false;
      })
  }
  GetPlan() {
    let list: List = new List();
    list.fields = [
      "PlanId",
      "Title",
      "Description"
    ];
    list.PageName = "Plans";
    list.filter = ["Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Plans = [...data.value];
        this.loading = false; this.PageLoading=false;

      })
  }

  onBlur(element) {
    debugger;
    if (element.OrganizationPaymentId > 0) {
      element.Action = true;
      element.Amount = element["AmountPerMonth"] * element.PaidMonths;
    }
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
export interface IOrganizationPayment {
  OrganizationPaymentId: number;
  OrgId: number;SubOrgId: number;
  OrganizationPlanId: number;
  PaidMonths: number;
  PaymentDate: Date;
  Amount: number;
  PaymentMode: number;
  Active: number;

}

