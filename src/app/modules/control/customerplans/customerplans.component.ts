import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { evaluate } from 'mathjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-customerplans',
  templateUrl: './customerplans.component.html',
  styleUrls: ['./customerplans.component.scss']
})
export class CustomerPlansComponent implements OnInit { PageLoading=true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  StandardFilterWithBatchId = '';
  PlanSelected=false;
  loading = false;
  Applications = [];
  CustomerPlanFeatures = [];
  Organizations = [];
  Currencies = [];
  CustomerPlansListName = "CustomerPlans";
  CustomerPlansList = [];
  Plans = [];
  SubOrgId=0;
  dataSource: MatTableDataSource<ICustomerPlans>;
  allMasterData = [];
  PagePermission = '';
  CustomerPlanId = 0;
  CustomerPlansData = {
    CustomerPlanId: 0,
    PlanId: 0,
    LoginUserCount: 0,
    PersonOrItemCount: 0,
    Formula: '',
    AmountPerMonth: 0,
    OrgId: 0,
    SubOrgId: 0,
    Active: 0,
  };
  OrgId = 0;
  Org = '';
  UserId = '';
  displayedColumns = [
    "PlanName",
    "Description",
    "PCPM",
    "PersonOrItemCount",
    "AmountPerMonth",
    "Action"
  ];
  SelectedApplicationId = 0;
  SelectedCustomer = '';
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private contentservice: ContentService,
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
      searchCustomerId: [0]
    });
    this.dataSource = new MatTableDataSource<ICustomerPlans>([]);
    this.PageLoad();
  }

  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail.length != 0) {
      this.UserId = this.LoginUserDetail[0]["userId"];
      this.OrgId = this.LoginUserDetail[0]["orgId"];
      this.SubOrgId = this.tokenStorage.getSubOrgId();
      
      if (this.LoginUserDetail[0]['org'].toLowerCase() == 'ttp') {
        this.displayedColumns = [
          "PlanName",
          'Description',
          "PCPM",
          "MinCount",
          "MinPrice",
          "LoginUserCount",
          "PersonOrItemCount",
          "Formula",
          "AmountPerMonth",
          "Active",
          "Action"
        ]
      }
    }
    else {
      this.UserId = localStorage.getItem("userId");
      this.OrgId = +localStorage.getItem("orgId");
      this.SubOrgId = +localStorage.getItem("subOrgId");

    }
    this.GetOrganizations();
    this.GetCustomerPlanFeatures();

  }
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }
  login() {
    this.nav.navigate(['auth/login']);
  }
  ClearData(){
    this.CustomerPlansList =[];
    this.dataSource = new MatTableDataSource<any>(this.CustomerPlansList);
  }
  UpdateOrSave(row) {

    if (row.PersonOrItemCount == 0) {
      this.contentservice.openSnackBar("Please enter no. of students", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading=true;
    //there will be only one row for a customer;
    this.CustomerPlansData.CustomerPlanId = this.CustomerPlanId;
    
    this.CustomerPlansData.PlanId = row.PlanId;
    this.CustomerPlansData.AmountPerMonth = row.AmountPerMonth;
    this.CustomerPlansData.Formula = row.Formula;
    this.CustomerPlansData.LoginUserCount = row.LoginUserCount;
    this.CustomerPlansData.PersonOrItemCount = row.PersonOrItemCount;
    this.CustomerPlansData.Active = 1;
    this.CustomerPlansData.OrgId = this.OrgId;//this.LoginUserDetail[0]["orgId"];
    this.CustomerPlansData.SubOrgId = this.SubOrgId;//this.LoginUserDetail[0]["orgId"];

    //console.log('data', this.CustomerPlansData);
    if (this.CustomerPlansData.CustomerPlanId == 0) {
      this.CustomerPlansData["CreatedDate"] = new Date();
      this.CustomerPlansData["CreatedBy"] = this.UserId;
      this.CustomerPlansData["UpdatedDate"] = new Date();
      delete this.CustomerPlansData["UpdatedBy"];
      this.insert(row);
    }
    else {
      delete this.CustomerPlansData["CreatedDate"];
      delete this.CustomerPlansData["CreatedBy"];
      this.CustomerPlansData["UpdatedDate"] = new Date();
      this.CustomerPlansData["UpdatedBy"] = this.UserId;
      this.update(row);
    }
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch(this.CustomerPlansListName, this.CustomerPlansData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.CustomerPlanId = data.CustomerPlanId;
          this.PlanSelected=true;
          this.GetCustomerPlans();
          row.Action = false;
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.nav.navigate(['/auth/login']);
        }, error => {
          this.contentservice.openSnackBar("error occured. Please contact administrator.", globalconstants.ActionText, globalconstants.RedBackground);
          console.log("customerplan insert error:", error.error);
        });
  }
  logout() {
    //debugger;
    this.tokenStorage.signOut();
    this.nav.navigate(['/auth/login']);
  }
  update(row) {

    this.dataservice.postPatch(this.CustomerPlansListName, this.CustomerPlansData, this.CustomerPlansData.CustomerPlanId, 'patch')
      .subscribe(
        (data: any) => {
          this.PlanSelected=true;
          //this.GetCustomerPlans();
          this.loading = false; this.PageLoading=false;
          row.Action = false;
          this.contentservice.openSnackBar("Plan updated successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
          this.logout();
        },
        err => {
          this.loading = false; this.PageLoading=false;
          var modelState;
          var errmsg = '';
          if (err.error.ModelState != null)
            modelState = JSON.parse(JSON.stringify(err.error.ModelState));
          else if (err.error != null)
            modelState = JSON.parse(JSON.stringify(err.error));
          else
            modelState = JSON.parse(JSON.stringify(err));

          //THE CODE BLOCK below IS IMPORTANT WHEN EXTRACTING MODEL STATE IN JQUERY/JAVASCRIPT
          for (var key in modelState) {
            if (modelState.hasOwnProperty(key) && key.toLowerCase() == 'errors') {
              for (var key1 in modelState[key])
                errmsg += (errmsg == "" ? "" : errmsg + "<br/>") + modelState[key][key1];
              //errors.push(modelState[key]);//list of error messages in an array
            }
          }
          this.contentservice.openSnackBar(errmsg, globalconstants.ActionText, globalconstants.RedBackground);
          this.GetCustomerPlans();
        });
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
        this.searchForm.patchValue({ "searchCustomerId": this.OrgId });
        this.Org = this.Organizations.filter(f => f.OrganizationId == this.OrgId)[0].OrganizationName;
        this.GetPlan();
      })
  }
  GetCustomerPlanFeatures() {
    let list: List = new List();
    list.fields = [
      "PlanId",
      "FeatureName",
      "Active"
    ];
    list.PageName = "CustomerPlanFeatures";
    list.filter = ["Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.CustomerPlanFeatures = [...data.value];
        this.loading = false; this.PageLoading=false;
      })
  }
  GetPlan() {
    let list: List = new List();
    list.fields = [
      "PlanId",
      "Title",
      "Description",
      "Sequence",
      "Logic",
      "PCPM",
      "MinCount",
      "MinPrice",
      "Active"
    ];
    list.PageName = "Plans";
    list.filter = ["Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Plans = [...data.value];
        this.loading = false; this.PageLoading=false;
        this.GetCustomerPlans();
      })
  }
  GetCustomerPlans() {

    this.CustomerPlansList = [];
    var filterstr = '';
    if (this.searchForm.get("searchCustomerId").value == 0) {
      this.contentservice.openSnackBar("Please select organization", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;

    var _searchCustomerId = this.searchForm.get("searchCustomerId").value;
    this.SelectedCustomer = this.Organizations.filter(f => f.OrganizationId == _searchCustomerId)[0].OrganizationName;
    if (_searchCustomerId > 0)
      filterstr += " OrgId eq " + _searchCustomerId;

    let list: List = new List();
    list.fields = [
      "CustomerPlanId",
      "PlanId",
      "LoginUserCount",
      "PersonOrItemCount",
      "Formula",
      "AmountPerMonth",
      "Active",

    ];
    list.PageName = this.CustomerPlansListName;
    //list.lookupFields = [];
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //var customerapp;
        this.Plans.forEach(p => {
          //customerapp = {};  
          var d = data.value.filter(db => db.PlanId == p.PlanId);
          if (d.length > 0) {
            if (d[0].Active == 1)
              this.CustomerPlanId = d[0].CustomerPlanId

            this.CustomerPlansList.push({
              "AmountPerMonth": d[0].AmountPerMonth,
              "CurrencyId": p.CurrencyId,
              "CustomerPlanId": d[0].CustomerPlanId,
              "PlanId": d[0].PlanId,
              "Sequence":p.Sequence,
              "PlanName": p.Title,
              "Logic": p.Logic == null ? '' : p.Logic,
              "Formula": d[0].Formula,
              "LoginUserCount": d[0].LoginUserCount,
              "PersonOrItemCount": d[0].PersonOrItemCount,
              "MinCount": p.MinCount,
              "Features": this.CustomerPlanFeatures.filter(f => f.PlanId == p.PlanId),
              "MinPrice": p.MinPrice,
              "PCPM": p.PCPM,
              "Description": p.Description,
              "Active": d[0].Active,
              "Action":true
            });
          }
          else {
            this.CustomerPlansList.push({
              "AmountPerMonth": 0,
              "CustomerPlanId": 0,
              "PlanId": p.PlanId,
              "PlanName": p.Title,
              "Sequence":p.Sequence,
              "Logic": p.Logic == null ? '' : p.Logic,
              "Formula": '',
              "LoginUserCount": 0,
              "PersonOrItemCount": 0,
              "MinCount": p.MinCount,
              "MinPrice": p.MinPrice,
              "PCPM": p.PCPM,
              "Description": p.Description,
              "Features": this.CustomerPlanFeatures.filter(f => f.PlanId == p.PlanId),
              "Active": 0,
              "Action":true
            });
          }
        })
        if (this.Org.toLowerCase() != 'ttp') {
          this.CustomerPlansList = this.CustomerPlansList.filter(f => f.PlanName.toLowerCase() != 'delux');
        }
        this.CustomerPlansList = this.CustomerPlansList.sort((a,b)=>a.Sequence - b.Sequence);
        //console.log("customer list", this.CustomerPlansList)
        this.dataSource = new MatTableDataSource<any>(this.CustomerPlansList);
        this.loading = false; this.PageLoading=false;
      })
  }


  onBlur(element) {
    debugger;
    element.Action = true;
    var formula = element.Formula == '' ? element.Logic : element.Formula;
    Object.keys(element).forEach(prop => {
      if (formula.includes('[' + prop + ']') && prop != 'Description')
        formula = formula.replaceAll('[' + prop + ']', element[prop]);
    })
    element["AmountPerMonth"] = evaluate(formula);
  }

  // GetMasterData() {

  //   this.contentservice.GetCommonMasterData(this.OrgId, this.SelectedApplicationId)
  //     .subscribe((data: any) => {
  //       this.allMasterData = [...data.value];
  //       this.Currencies = this.getDropDownData(globalconstants.MasterDefinitions.common.CURRENCY);
  //       this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);
  //       this.loading = false; this.PageLoading=false;
  //     });
  // }

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
export interface ICustomerPlans {
  CustomerPlanId?: number;
  PlanId?: number;
  LoginUserCount?: number;
  PersonOrItemCount?: number;
  Formula?: string;
  AmountPerMonth?: number;
  PCPM?: number,
  MinCount?: number,
  MinPrice?: number,
  CurrencyId?: number,
  Description?: string;
  Currency?: string;
  OrgId?: number;
  Active?: number;
}








