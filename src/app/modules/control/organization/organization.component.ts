import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { FileUploadService } from 'src/app/shared/upload.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {
    PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  Action = false;
  OrganizationId = 0;
  imagePath: string;
  message: string;
  imgURL: any;
  selectedFile: any;
  formdata: FormData;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  StorageFnPList = [];
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  Applications = [];
  Organizations = [];
  OrganizationListName = "Organizations";
  OrganizationList = [];
  Country = [];
  States = [];
  City = [];
  Plans = [];
  CustomerPlans = [];
  dataSource: MatTableDataSource<IOrganization>;
  allMasterData = [];
  Permission = '';
  OrganizationData = {
    OrganizationId: 0,
    //OrganizationName: '',
    WebSite: '',
    Address: '',
    CityId: 0,
    StateId: 0,
    CountryId: 0,
    RegistrationNo: '',
    Contact: '',
    Active: 0,
    CreatedDate: new Date()
  };
  OrgId = 0;
  UserId = '';
  displayedColumns = [
    "Address",
    "RegistrationNo",
    "CountryId",
    "StateId",
    "CityId",
    "Contact",
    "ValidTo",
    "CreatedDate",
    "Active",
    "Action"
  ];
  TopMasters = [];
  SelectedApplicationId = 0;
  searchForm: UntypedFormGroup;
  LogoPath = '';
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private fileUploadService: FileUploadService,
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
      searchCustomerId: [0],
      Address: [''],
      RegistrationNo: [''],
      CountryId: [0],
      StateId: [0],
      CityId: [0],
      Contact: [0],
      ValidTo: [{ value: new Date(), disabled: true }],
      CreatedDate: [{ value: new Date(), disabled: true }],
      WebSite: [''],
      Active: [0]
    });
    this.dataSource = new MatTableDataSource<IOrganization>([]);
    this.PageLoad();
  }
  get f() {
    return this.searchForm.controls;
  }
  PageLoad() {
    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail.length != 0) {
      this.UserId = this.LoginUserDetail[0]["userId"];
      this.OrgId = this.LoginUserDetail[0]["orgId"];
      //.SubOrgId = this.SubOrgId
    }
    else {
      this.UserId = localStorage.getItem("userId");
      this.OrgId = +localStorage.getItem("orgId");
    }

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.ORGANIZATION)
    if (perObj.length > 0) {
      this.Permission = perObj[0].permission;
    }
    if (this.Permission != 'deny') {
      this.FilterOrgSubOrg =globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.FilterOrgSubOrgBatchId =globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.Applications = this.tokenStorage.getPermittedApplications();
      var commonAppId = this.Applications.filter(f => f.appShortName == 'common')[0].applicationId;
      //var TopMasters=[];
      this.contentservice.GetParentZeroMasters().subscribe((data: any) => {
        this.TopMasters = [...data.value];
        //console.log("this.TopMasters",this.TopMasters)
        var countryparentId = this.TopMasters.filter(f => f.MasterDataName.toLowerCase() == 'country')[0].MasterDataId;
        this.contentservice.GetDropDownDataFromDB(countryparentId, this.FilterOrgSubOrg, commonAppId)
          .subscribe((data: any) => {
            this.Country = [...data.value];
          })
      })
      this.GetOrganization();
      this.GetStorageFnP(0).subscribe((data: any) => {
        this.StorageFnPList = [...data.value];
        this.loading = false;
        this.PageLoading = false;
      })
    }
  }
  //}
  PopulateState(element) {
    var commonAppId = this.Applications.filter(f => f.appShortName == 'common')[0].applicationId;
    this.contentservice.GetDropDownDataFromDB(element.value,this.FilterOrgSubOrg, commonAppId)
      .subscribe((data: any) => {
        this.States = [...data.value];
        this.Action = true;
      })
  }
  PopulateCity(element) {
    var commonAppId = this.Applications.filter(f => f.appShortName == 'common')[0].applicationId;
    this.contentservice.GetDropDownDataFromDB(element.value, this.FilterOrgSubOrg, commonAppId)
      .subscribe((data: any) => {
        this.City = [...data.value];
        this.Action = true;
      })
  }
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }
  login() {
    this.nav.navigate(['auth/login']);
  }

  UpdateOrSave() {

    // if (row.OrganizationName == '') {
    //   this.contentservice.openSnackBar("Please enter organization name.", globalconstants.ActionText, globalconstants.RedBackground);
    //   this.loading = false; this.PageLoading=false;
    //   row.Action = false;
    //   return;
    // }


    this.OrganizationData.OrganizationId = this.OrganizationId;
    //this.OrganizationData.RegistrationNo = row.OrganizationName;
    this.OrganizationData.Address = this.searchForm.get("Address").value;
    this.OrganizationData.CityId = this.searchForm.get("CityId").value;
    this.OrganizationData.StateId = this.searchForm.get("StateId").value;
    this.OrganizationData.RegistrationNo = this.searchForm.get("RegistrationNo").value;
    this.OrganizationData.Active = this.searchForm.get("Active").value;
    this.OrganizationData.CountryId = this.searchForm.get("CountryId").value;
    this.OrganizationData.Contact = this.searchForm.get("Contact").value;
    this.OrganizationData.WebSite = this.searchForm.get("WebSite").value;
    // this.OrganizationData.LogoPath = this.LogoPath// this.searchForm.get("LogoPath").value;
    //this.OrganizationData. = row.LogoPath;

    if (this.OrganizationData.OrganizationId == 0) {
      this.OrganizationData["CreatedDate"] = new Date();
      this.OrganizationData["CreatedBy"] = this.UserId;
      this.OrganizationData["UpdatedDate"] = new Date();
      delete this.OrganizationData["UpdatedBy"];
      this.insert();
    }
    else {
      delete this.OrganizationData["CreatedDate"];
      delete this.OrganizationData["CreatedBy"];
      this.OrganizationData["UpdatedDate"] = new Date();
      this.OrganizationData["UpdatedBy"] = this.UserId;
      this.update();
    }
  }
  insert() {

    debugger;
    this.dataservice.postPatch(this.OrganizationListName, this.OrganizationData, 0, 'post')
      .subscribe(
        (data: any) => {
          // row.OrganizationId = data.OrganizationId;
          // row.Action = false;
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }, error => {
          this.contentservice.openSnackBar("error occured. Please contact administrator.", globalconstants.ActionText, globalconstants.RedBackground);
        });
  }
  update() {

    this.dataservice.postPatch(this.OrganizationListName, this.OrganizationData, this.OrganizationData.OrganizationId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          //row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  GetOrganization() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["OrganizationId", "OrganizationName"];
    list.PageName = "Organizations";
    list.filter = ["Active eq 1"];
    //debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Organizations = [...data.value];
        if (this.LoginUserDetail[0]['org'].toLowerCase() != 'ttp') {
          this.imgURL = this.LoginUserDetail[0].logoPath
          this.searchForm.patchValue({ "searchCustomerId": this.LoginUserDetail[0]['orgId'] });
          var cntrl = this.searchForm.get("searchCustomerId");
          cntrl.disable();
          this.GetOrganizationDetail();
        }
        this.loading = false; this.PageLoading = false;
      });
  }
  GetOrganizationDetail() {
    debugger;
    this.OrganizationList = [];
    var filterstr = '';

    this.loading = true;

    var _searchCustomerId = this.searchForm.get("searchCustomerId").value;

    if (_searchCustomerId > 0)
      filterstr += "OrganizationId eq " + _searchCustomerId;

    let list: List = new List();
    list.fields = [
      "OrganizationId",
      "OrganizationName",
      "LogoPath",
      "Address",
      "CityId",
      "StateId",
      "CountryId",
      "RegistrationNo",
      "WebSite",
      "Contact",
      "ValidFrom",
      "ValidTo",
      "Active",
      "CreatedDate"
    ];
    list.PageName = this.OrganizationListName;
    //list.lookupFields = [];
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //var customerapp;
        //console.log("data.value[0]",data.value[0])
        if (data.value.length > 0) {
          data.value[0].CreatedDate = moment(data.value[0].CreatedDate).format("DD/MM/YYYY")
          data.value[0].ValidTo = moment(data.value[0].ValidTo).format("DD/MM/YYYY")
          this.searchForm.patchValue(data.value[0])
          this.OrganizationId = data.value[0].OrganizationId;
          this.imgURL = globalconstants.apiUrl + "/uploads/" + this.LoginUserDetail[0]["org"] + "/organization logo/" + data.value[0].LogoPath;
          this.contentservice.GetDropDownDataWithOrgIdnParent(data.value[0].CountryId,this.FilterOrgSubOrg)
            .subscribe((data: any) => {
              this.States = [...data.value];
            });
          this.contentservice.GetDropDownDataWithOrgIdnParent(data.value[0].StateId, this.FilterOrgSubOrg)
            .subscribe((data: any) => {
              this.City = [...data.value];
            });
        }
        this.loading = false; this.PageLoading = false;
      })
  }
  preview(files) {
    if (files.length === 0)
      return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }
    debugger;
    this.selectedFile = files[0];
    if (this.selectedFile.size > 80000) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Image size should be less than 80kb", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
      //console.log("imgurl",this.imgURL);
    }
  }
  uploadFile() {
    debugger;
    let error: boolean = false;
    this.loading = true;
    if (this.selectedFile == undefined) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select a file.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _parentId = this.StorageFnPList.filter(f => f.FileName.toLowerCase() == "organization logo")[0].FileId;
    this.formdata = new FormData();
    this.formdata.append("description", "organization logo");
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "organization logo");
    this.formdata.append("parentId", _parentId);

    this.formdata.append("batchId", "0");
    this.formdata.append("orgName", this.LoginUserDetail[0]["org"]);
    this.formdata.append("orgId", this.LoginUserDetail[0]["orgId"]);
    this.formdata.append("subOrgId", this.tokenStorage.getSubOrgId()+"");
    this.formdata.append("pageId", "0");

    this.formdata.append("studentId", "0");
    this.formdata.append("studentClassId", "0");
    this.formdata.append("docTypeId", "0");

    this.formdata.append("image", this.selectedFile, this.selectedFile.name);
    this.uploadImage();
  }
  GetStorageFnP(pParentId) {

    var filterstr = 'Active eq 1 and ParentId eq ' + pParentId;
    let list: List = new List();
    list.fields = ["*"];
    list.PageName = "StorageFnPs";
    //list.lookupFields = [];
    list.filter = [filterstr];
    return this.dataservice.get(list);
  }
  uploadImage() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.fileUploadService.postFiles(this.formdata).subscribe(res => {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Files uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
      this.LogoPath = this.selectedFile.name;
      //this.Edit = false;
    });
  }
  OnBlur() {
    //debugger;
    this.Action = true;
    //element.Amount = element["AmountPerMonth"] * element.PaidMonths;
  }
  deActivate(event) {
    debugger;
    if (event.checked) {
      this.Action = true;
    }
    else {
      this.Action = false;
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
export interface IOrganization {
  OrganizationId: number;
  OrganizationName: string;
  LogoPath: string;
  Address: string;
  CityId: number;
  StateId: number;
  CountryId: number;
  RegistrationNo: string;
  WebSite: string;
  Contact: string;
  ValidFrom: Date;
  ValidTo: Date;
  Active: number;
  ParentId: number;
  MainOrgId: number;SubOrgId: number;
  CreatedDate: Date;
}

