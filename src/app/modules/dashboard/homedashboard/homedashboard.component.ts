import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-homedashboard',
  templateUrl: './homedashboard.component.html',
  styleUrls: ['./homedashboard.component.scss']
})
export class HomeDashboardComponent implements OnInit {
  @ViewChild('overlay') myoverlay: ElementRef;
  ngAfterViewInit() {
    this.Loading();
    this.LoadingFalse();
  }
  Loading() {
    this.loading = true;
    this.PageLoading = true;
    //this.myoverlay.nativeElement.className = "overlay";
  }
  LoadingFalse() {
    this.loading = false;
    this.PageLoading = false;
    //this.myoverlay.nativeElement.className = "";
  }
  PageLoading = true;
  loading = false;
  searchForm: UntypedFormGroup;
  NewsNEventPageId = 0;
  MenuData: any[] = [];
  toggle: boolean = false;
  userName: string = '';
  loggedIn: boolean;
  LoginUserDetail: any;
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  SubOrgId = 0;
  SelectedAppId = 0;
  filterOrgSubOrgBatchId = '';
  filterOrgSubOrg = '';
  RedirectionText = '';
  Batches: any[] = [];
  PermittedApplications: any[] = [];
  SelectedAppName = '';
  CustomFeatures: any[] = [];
  constructor(private servicework: SwUpdate,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private fb: UntypedFormBuilder,
    private route: Router,
    private dataservice: NaomitsuService,
    private http: HttpClient,
    private contentservice: ContentService

  ) { }
  Role = '';
  Roles: any[] = [];
  Submitted = false;
  Permission = '';
  ngOnInit(): void {
    debugger;
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    this.CheckBrowser();
    this.searchForm = this.fb.group({
      searchApplicationId: [0],
      searchBatchId: [0],
      searchSubOrgId: [0]
    })
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    ////console.log("HOme dashboard init")
    ////console.log('role',this.Role);
    //localStorage.setItem('loggedTime','10/11/2023');
    let loggedin = +localStorage.getItem('loggedTime')!;
    //var loggedTime = new Date(loggedin);
    var loggedInDiff = new Date().getDate() - loggedin;
    //_today.setHours(0, 0, 0, 0);
    if (loggedInDiff !== 0) {
      this.tokenStorage.signOut();
      this.route.navigate(['/auth/login']);
    }
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.FeaturePermission.MULTIPLEBATCH);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      // if (this.Permission == 'deny') {

      //   //this.nav.navigate(['/edu'])
      // }
      this.loading = true;
      this.Role = this.LoginUserDetail[0]['RoleUsers'][0]['role'];
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.CheckLocalStorage();
      //this.GetCustomerPlans
      this.GetOrganization()
        .subscribe((data: any) => {
          if (data.value.length > 0) {
            var _validTo = new Date(data.value[0].ValidTo);//
            _validTo.setHours(0, 0, 0, 0);

            var _roleName = this.LoginUserDetail[0]['RoleUsers'][0].role;
            //const diffTime = Math.abs(date2 - date1);
            //const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            var _today = new Date();
            _today.setHours(0, 0, 0, 0);
            const diffTime = Math.abs(_validTo.getTime() - _today.getTime());
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            ////console.log("diffDays", diffDays)
            var alertDate = localStorage.getItem("alertdate");
            var todaystring = moment(new Date()).format('DD-MM-YYYY')

            // var days = new Date(_validTo) - new Date(_today);
            if (diffDays < 0) {
              this.tokenStorage.signOut();
              this.contentservice.openSnackBar("Login expired! Please contact administrator.", globalconstants.ActionText, globalconstants.RedBackground);
              //setTimeout(() => {
              this.route.navigate(['/auth/login'])
              //}, 3000);
            }
            else if (diffDays < 6 && alertDate != todaystring && _roleName.toLowerCase() == 'admin') {
              localStorage.setItem("alertdate", todaystring);
              var msg = '';
              if (diffDays == 0)
                msg = "Your plan is expiring today";
              else if (diffDays == 1)
                msg = "Your plan is expiring tommorrow.";
              else
                msg = "Your plan is expiring within " + diffDays + " days. i.e on " + moment(_validTo).format('DD/MM/YYYY');
              this.contentservice.openSnackBar(msg, globalconstants.ActionText, globalconstants.GreenBackground);
            }
            //else {
            debugger;
            this.Loading();
            this.userName = localStorage.getItem('username')!;
            var PermittedApps = this.LoginUserDetail[0]["applicationRolePermission"];

            if (PermittedApps.length == 0 && _roleName.toLowerCase() == 'admin') {
              this.route.navigate(["/auth/selectplan"]);
            }
            else {

              var _UniquePermittedApplications = PermittedApps.filter((v, i, a) => a.findIndex(t => (t.applicationId === v.applicationId)) === i)
              if (_roleName.toLowerCase() != 'admin')
                this.PermittedApplications = _UniquePermittedApplications.filter((f: any) => f.applicationName.toLowerCase() != 'common panel');
              else
                this.PermittedApplications = [..._UniquePermittedApplications];

              if (this.PermittedApplications.length == 0) {
                this.contentservice.openSnackBar("No permitted application found.", globalconstants.ActionText, globalconstants.RedBackground);
                this.tokenStorage.signOut();
                //this.route.navigate(['/auth/login']);
              }
              else {
                this.tokenStorage.savePermittedApplications(_UniquePermittedApplications);
                if (this.userName === undefined || this.userName === null || this.userName == '')
                  this.loggedIn = false;
                else
                  this.loggedIn = true;
                //this.shareddata.CurrentPagesData.subscribe(m => (this.MenuData = m))
                this.shareddata.CurrentNewsNEventId.subscribe(n => (this.NewsNEventPageId = n));
                this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
                this.filterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
                this.filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);

                this.getBatches();

              }
            }
            //}
          }
          this.LoadingFalse();
          //this.PageLoading = false;
        });

    }

  }
  /* 
 * function body that test if storage is available
 * returns true if localStorage is available and false if it's not
 */
  lsTest() {
    var test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* 
  * execute Test and run our custom script 
  */
  CheckLocalStorage() {
    if (this.lsTest()) {
      //console.log('localStorage where used'); // log
    } else {
      this.contentservice.openSnackBar("Browser does not support this application.", globalconstants.ActionText, globalconstants.RedBackground);
      document.cookie = "name=1; expires=Mon, 28 Mar 2016 12:00:00 UTC";
      //console.log('Cookie where used'); // log
    }
  }
  sideMenu: any[] = [];
  GetMenuData(pSelectedAppId) {
    debugger;
    //let containAdmin = window.location.href.toLowerCase().indexOf('admin');
    let strFilter = '';
    ////console.log("in dashboard")
    strFilter = "PlanId eq " + this.LoginUserDetail[0]["planId"] + " and ApplicationId eq " + pSelectedAppId + " and Active eq 1";

    let list: List = new List();
    list.fields = [
      "PlanFeatureId",
      "PlanId",
      "PageId",
      "ApplicationId"
    ];
    this.sideMenu = [];
    list.PageName = "PlanFeatures";
    list.lookupFields = ["Page($select=PageId,PageTitle,label,faIcon,link,ParentId,HasSubmenu,UpdateDate,DisplayOrder)"];
    //list.orderBy = "DisplayOrder";
    list.filter = [strFilter];
    let _permission;
    this.dataservice.get(list).subscribe((data: any) => {

      this.sideMenu = [];
      data.value.forEach(m => {
        if (m.Page.PageTitle == "Pages") {
          debugger;
        }
        _permission = this.LoginUserDetail[0]["applicationRolePermission"].filter(r => r.applicationFeature.toLowerCase().trim() == m.Page.PageTitle.toLowerCase().trim()
          && r.applicationId == pSelectedAppId && m.Page.ParentId == 0)
        if (_permission.length > 0 && _permission[0].permission != 'deny') {
          m.PageId = m.Page.PageId;
          m.PageTitle = m.Page.PageTitle;
          m.label = m.Page.label;
          m.faIcon = m.Page.faIcon;
          m.link = m.Page.link;
          m.ParentId = m.Page.ParentId;
          m.HasSubmenu = m.Page.HasSubmenu;
          m.DisplayOrder = m.Page.DisplayOrder;
          this.sideMenu.push(m);
        }
      })

      this.sideMenu = this.sideMenu.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
      this.tokenStorage.saveMenuData(this.sideMenu);

      let NewsNEvents = this.sideMenu.filter(item => {
        return item.label.toUpperCase() == 'NEWS N EVENTS'
      })
      if (NewsNEvents.length > 0) {
        this.shareddata.ChangeNewsNEventId(NewsNEvents[0].PageId);
      }

      var appName = location.pathname.split('/')[1];
      if (appName.length > 0) {


        //this.shareddata.ChangePageData(this.sideMenu);
        // this.tokenStorage.saveMenuData(this.sideMenu) 
      }
      // this.tokenStorage.saveMenuData(this.sideMenu) 

    });


  }
  CustomerPlansList: any[] = [];
  GetCustomerPlans() {

    this.CustomerPlansList = [];
    var filterstr = 'Active eq 1';

    let list: List = new List();
    list.fields = [
      "CustomerPlanId",
      "PlanId",
      "OrgId",
      "SubOrgId"
    ];
    list.PageName = "CustomerPlans";
    //list.lookupFields :any[]= [];
    list.filter = [filterstr];
    return this.dataservice.get(list);

  }
  SubOrgChange() {
    debugger;
    this.Loading();
    var _SubOrg = this.searchForm.get("searchSubOrgId")?.value;

    var _customerPlanId = 0;
    if (_SubOrg.MasterDataName.toLowerCase() != 'primary')
      _customerPlanId = this.LoginUserDetail[0]["customerPlanId"];

    if (!_SubOrg.CustomerPlanId) {
      var CustomerPlansData = {
        CustomerPlanId: _customerPlanId,
        PlanId: this.LoginUserDetail[0]["planId"],
        AmountPerMonth: 0,
        Formula: '',
        LoginUserCount: 0,
        PersonOrItemCount: 0,
        Active: 1,
        OrgId: this.LoginUserDetail[0]["orgId"],
        SubOrgId: _SubOrg.MasterDataId,
        CreatedDate: new Date(),
        UpdatedDate: new Date(),
        CreatedBy: this.LoginUserDetail[0]["userId"]
      }

      this.dataservice.postPatch("CustomerPlans", CustomerPlansData, 0, 'post')
        .subscribe(
          (data: any) => {
            this.LoadingFalse();
            this.ValueChanged = true;
            //this.tokenStorage.saveSubOrgId(_SubOrg.SubOrgId);
          }, error => {
            this.contentservice.openSnackBar("error occured. Please contact administrator.", globalconstants.ActionText, globalconstants.RedBackground);
            //console.log("customerplan insert error:", error.error);
          });
    }
    else {
      //this.tokenStorage.saveSubOrgId(_SubOrg.SubOrgId);
      this.LoadingFalse();
      this.ValueChanged = true;
    }
    //this.tokenStorage.saveMenuData([]);

  }
  GetOrganization() {
    this.Loading();
    let list: List = new List();
    list.fields = ["OrganizationId", "OrganizationName", "ValidTo", "ValidFrom"];
    list.PageName = "Organizations";
    list.filter = ["Active eq 1 and OrganizationId eq " + this.LoginUserDetail[0]["orgId"]];
    //debugger;
    return this.dataservice.get(list)

  }
  ValueChanged = false;
  ChangeApplication() {
    debugger;
    this.Loading();
    var SelectedAppId = this.searchForm.get("searchApplicationId")?.value;
    this.SelectedAppName = this.PermittedApplications.filter((f: any) => f.applicationId == SelectedAppId)[0].applicationName
    this.ValueChanged = true;
    if (SelectedAppId > 0) {
      this.tokenStorage.saveMenuData([]);
      var selectedApp = this.PermittedApplications.filter(a => a.applicationId == SelectedAppId);
      this.SelectedAppName = selectedApp[0].applicationName;
      this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]['orgId'], this.SubOrgId, SelectedAppId)
        .subscribe((data: any) => {
          this.tokenStorage.saveMasterData([...data.value]);
          this.allMasterData = [...data.value];
          this.Roles = this.getDropDownData(globalconstants.MasterDefinitions.common.ROLE);

          let _obj = this.Roles.find(r => r.MasterDataId == this.LoginUserDetail[0]["RoleUsers"][0].roleId);
          if (_obj && _obj.Description)
            this.RedirectionText = _obj.Description;

          this.SubOrganization = this.getDropDownData(globalconstants.MasterDefinitions.common.COMPANY)
          this.SubOrganization.forEach(s => {
            var ex = this.CustomerPlansList.find(c => c.SubOrgId == s.MasterDataId);
            if (ex)
              s.CustomerPlanId = ex.CustomerPlanId;
            else
              s.CustomerPlanId = 0;
          })
          var _orgSubOrg = this.SubOrganization.find((f: any) => f.MasterDataId == this.SubOrgId);
          this.searchForm.patchValue({ "searchSubOrgId": _orgSubOrg });
          this.LoadingFalse();
        });
    }

  }
  CheckBrowser() {
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    if (!isChrome)
      this.contentservice.openSnackBar("Safari browser detected. Some functions might not work. Chrome is recommended for this application.", globalconstants.ActionText, globalconstants.RedBackground);
    // if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
    //   alert('Opera');
    // } else if (navigator.userAgent.indexOf("Edg") != -1) {
    //   alert('Edge');
    // } else if (navigator.userAgent.indexOf("Chrome") != -1) {
    //   alert('Chrome');
    //} else 
    //if (navigator.userAgent.indexOf("Safari") > -1) //{
    //  this.contentservice.openSnackBar("Safari browser detected. Some functions might not work. Chrome is recommended for this application.",globalconstants.ActionText,globalconstants.RedBackground);
    // } else if (navigator.userAgent.indexOf("Firefox") != -1) {
    //   alert('Firefox');
    // } else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) //IF IE > 10
    // {
    //   alert('IE');
    // } else {
    //   alert('unknown');
    // }
  }
  changebatch() {
    this.ValueChanged = true;
  }
  submit() {
    this.Submitted = true;
    this.SelectedBatchId = this.searchForm.get("searchBatchId")?.value;
    var SelectedAppId = this.searchForm.get("searchApplicationId")?.value;
    var SubOrg = this.searchForm.get("searchSubOrgId")?.value;
    var _SubOrgId = SubOrg.MasterDataId;
    if (!_SubOrgId || _SubOrgId == 0) {
      this.contentservice.openSnackBar("Please select company.", globalconstants.ActionText, globalconstants.RedBackground);
      this.LoadingFalse();
      return;
    }
    this.PageLoading = true;
    this.SubOrgId = _SubOrgId;
    this.tokenStorage.saveSubOrgId(_SubOrgId);
    this.tokenStorage.saveCompanyName(SubOrg.MasterDataName);

    if (this.SelectedBatchId > 0)
      this.SaveBatchIds(this.SelectedBatchId);
    else {
      this.LoadingFalse(); this.PageLoading = false;
      this.contentservice.openSnackBar("Please select batch.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    if (SelectedAppId > 0) {
      this.Loading();
      this.SelectedAppId = SelectedAppId;
      this.tokenStorage.saveSelectedAppId(SelectedAppId);
      var selectedApp = this.PermittedApplications.filter(a => a.applicationId == SelectedAppId);

      //this line is added because when batch is not defined for new user, selected batch name is null.
      if (this.Batches.length > 0) {
        var _batchName = this.Batches.find((f: any) => f.BatchId == this.SelectedBatchId).BatchName;
        this.tokenStorage.saveSelectedBatchName(_batchName)
      }
      else
        this.tokenStorage.saveSelectedBatchName('');
      // this.tokenStorage.saveSubOrgId(_SubOrgId);
      // this.SubOrgId = _SubOrgId;
      //////for local storage
      this.filterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);

      this.GetMenuData(SelectedAppId);
      // if (selectedApp[0].applicationName.toLowerCase() == 'education management')
      //   this.GetStudentClass(SelectedAppId, selectedApp[0]);
      // else
      this.tokenStorage.saveSelectedAppName(selectedApp[0].applicationName);
      //this.GetMasterData(SelectedAppId);
      this.GetFeatureAndStudentDetail(SelectedAppId, selectedApp[0]);
    }
    else {
      this.LoadingFalse();
      this.PageLoading = false;
      this.contentservice.openSnackBar("Please select application.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
  }

  allMasterData: any[] = [];
  SubOrganization: any[] = [];
  Semesters: any[] = [];
  Sections: any[] = [];
  Classes: any[] = [];
  Remark1: any[] = [];
  Remark2: any[] = [];
  // GetMasterData(SelectedAppId) {
  //   return this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]['orgId'], this.SubOrgId, SelectedAppId)

  // }
  GetFeatureAndStudentDetail(SelectedAppId, selectedApp) {

    debugger;
    this.contentservice.GetCustomFeature(SelectedAppId, this.LoginUserDetail[0]["RoleUsers"][0].roleId, this.SubOrgId, this.LoginUserDetail[0]['orgId'])
      .subscribe((data: any) => {
        data.value.forEach(item => {
          var feature = this.LoginUserDetail[0]['applicationRolePermission'].filter((f: any) => f.applicationFeature == item.CustomFeature.CustomFeatureName)
          if (feature.length == 0) {
            this.LoginUserDetail[0]['applicationRolePermission'].push({
              'planFeatureId': 0,
              'applicationFeature': item.CustomFeature.CustomFeatureName,//_applicationFeature,
              'roleId': item.RoleId,
              'permissionId': item.PermissionId,
              'permission': globalconstants.PERMISSIONTYPES.find((f: any) => f.val == item.PermissionId)!.type,
              'applicationName': selectedApp.applicationName,
              'applicationId': item.ApplicationId,
              'appShortName': selectedApp.appShortName,
              'faIcon': '',
              'label': '',
              'link': ''
            })
          }
        });
        this.tokenStorage.saveUserdetail(this.LoginUserDetail);
        this.tokenStorage.saveCustomFeature(data.value);
        this.SelectedAppName = selectedApp.applicationName;

        if (this.SelectedAppName && this.SelectedAppName.toLowerCase() == 'education management') {
          this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
          this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
          this.Remark1 = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARK1);
          this.Remark2 = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARK2);
          this.contentservice.GetClasses(this.filterOrgSubOrg, 0).subscribe((data: any) => {
            if (data.value) this.Classes = [...data.value]; else this.Classes = [...data];
            this.tokenStorage.saveAllClasses(this.Classes);
            this.GetTeacherAndClasses('edu')
          });
          // let obj = { appShortName: 'edu', applicationName: this.SelectedAppName };
          // //if selected batch is current batch.
          // if (this.CurrentBatchId == this.SelectedBatchId)
          //   this.GetStudentAndClassesWithForkJoin(obj.appShortName);//this.GetStudents(obj);
          // else
          //   this.GetClassJoinStudent(obj.appShortName);
        }
        else {
          if (this.Submitted)
          //this.route.navigate(['/', selectedApp.appShortName]);
          {
            if (this.RedirectionText.length == 0)
              this.RedirectionText = selectedApp.appShortName;
            this.route.navigateByUrl("/" + this.RedirectionText);
          }

        }
      });
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }
  SaveBatchIds(selectedBatchId) {
    debugger;
    var _SelectedBatch = this.Batches.find(b => b.BatchId == selectedBatchId);
    var SelectedBatchName = ''
    if (_SelectedBatch) {
      SelectedBatchName = _SelectedBatch.BatchName;
    }

    if (_SelectedBatch) {
      //this.shareddata.ChangeSelectedBatchStartEnd({ 'StartDate': _SelectedBatch[0].StartDate, 'EndDate': _SelectedBatch[0].EndDate });
      this.tokenStorage.saveSelectedBatchStartEnd(
        { 'StartDate': _SelectedBatch.StartDate, 'EndDate': _SelectedBatch.EndDate });
    }
    //this is for disabling all save button if old batch is selected. 
    if (selectedBatchId >= this.CurrentBatchId)
      this.tokenStorage.saveInCurrentBatch("1");
    else
      this.tokenStorage.saveInCurrentBatch("0");

    this.tokenStorage.saveSelectedBatchId(selectedBatchId);
    this.tokenStorage.saveSelectedBatchName(SelectedBatchName);

    this.generateBatchIds(selectedBatchId);
  }
  generateBatchIds(SelectedbatchId) {
    debugger;
    this.Batches = this.Batches.sort((a, b) => new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime());
    var previousBatchIndex = this.Batches.map(d => d.BatchId).indexOf(SelectedbatchId) - 1;
    var _previousBatchId = -1;
    if (previousBatchIndex > -1) {
      _previousBatchId = this.Batches[previousBatchIndex]["BatchId"];
    }

    this.tokenStorage.savePreviousBatchId(_previousBatchId.toString())
    var nextBatchIndex = this.Batches.map(d => d.BatchId).indexOf(SelectedbatchId) + 1;
    var _nextBatchId = -1;
    if (this.Batches.length > nextBatchIndex) {
      _nextBatchId = this.Batches[nextBatchIndex]["BatchId"];
    }
    this.tokenStorage.saveNextBatchId(_nextBatchId.toString());
  }
  Houses: any = [];
  getBatches() {

    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SelectedAppId = +this.tokenStorage.getSelectedAPPId()!;
    this.SelectedAppName = this.tokenStorage.getSelectedAppName()!;
    var currentbatchfilter = '';
    if (this.Role != 'Admin' && (this.Permission == '' || this.Permission == 'deny'))
      currentbatchfilter = ' and CurrentBatch eq 1';

    var list = new List();
    list.fields = [
      "BatchId",
      "BatchName",
      "StartDate",
      "EndDate",
      "CurrentBatch",
      "Active"];
    list.PageName = "Batches";
    var filterBatch = "OrgId eq " + this.LoginUserDetail[0]["orgId"];
    list.filter = [filterBatch + " and Active eq 1" + currentbatchfilter];
    this.dataservice.get(list).subscribe((data: any) => {
      this.Batches = [...data.value];
      this.tokenStorage.saveBatches(this.Batches)
      var _currentBatchId = 0;
      var current = this.Batches.filter(b => b.CurrentBatch == 1);
      if (current.length > 0) {
        _currentBatchId = current[0].BatchId;
        this.tokenStorage.saveCurrentBatchId(_currentBatchId + "");
        this.CurrentBatchId = _currentBatchId;
      }

      this.searchForm.patchValue({ searchBatchId: this.SelectedBatchId });
      this.searchForm.patchValue({ searchApplicationId: this.SelectedAppId });
      this.shareddata.ChangeCurrentBatchId(this.CurrentBatchId);
      if (this.SelectedBatchId > 0)
        this.generateBatchIds(this.SelectedBatchId);
      ////////////
      //this.GetCustomerPlans()
      //  .subscribe((data: any) => {
      //    this.CustomerPlansList = [...data.value];
      // this.getDropdownFromDB(globalconstants.CompanyParentId, globalconstants.CommonPanelID)
      //   .subscribe((data: any) => {
      //     this.SubOrganization = [...data.value];
      //     var selectedItem = this.SubOrganization.filter((s:any) => s.MasterDataId == this.SubOrgId);
      //     this.searchForm.patchValue({ "searchSubOrgId": selectedItem[0] });
      //   })

      if (this.SelectedAppId > 0) {
        this.allMasterData = this.tokenStorage.getMasterData()!;
        if (this.allMasterData.length > 0) {

          this.Roles = this.getDropDownData(globalconstants.MasterDefinitions.common.ROLE);

          let _obj = this.Roles.find(r => r.MasterDataId == this.LoginUserDetail[0]["RoleUsers"][0].roleId);
          if (_obj && _obj.Description)
            this.RedirectionText = _obj.Description;

          this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
          this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
          this.SubOrganization = this.getDropDownData(globalconstants.MasterDefinitions.common.COMPANY)
          var selectedItem = this.SubOrganization.filter((s: any) => s.MasterDataId == this.SubOrgId);
          this.searchForm.patchValue({ "searchSubOrgId": selectedItem[0] });

          if (this.SelectedAppName && this.SelectedAppName.toLowerCase() == 'education management') {

            //this.Classes = this.tokenStorage.getClasses()!;

            let refresh = 0;
            //if (this.Classes.length === 0) {
            refresh = 1;
            this.contentservice.GetClasses(this.filterOrgSubOrg, refresh).subscribe((data: any) => {
              if (data.value) this.Classes = [...data.value]; else this.Classes = [...data];
              //this.tokenStorage.saveClasses(this.Classes);

              //let obj = { appShortName: 'edu', applicationName: this.SelectedAppName };
              this.GetTeacherAndClasses('edu');
              // if (this.CurrentBatchId == this.SelectedBatchId)
              //   this.GetStudentAndClassesWithForkJoin(obj.appShortName);//this.GetStudents(obj);
              // else
              //   this.GetClassJoinStudent(obj.appShortName);
            });
            // }
          }

        }

        this.GetMenuData(this.SelectedAppId);
      }

      this.LoadingFalse(); this.PageLoading = false;
    });
  }

  compareWith(option, value): boolean {
    return option.MasterDataId === value.MasterDataId;
  }
  Students: any[] = [];
  StudentClasses: any[] = [];
  GetClassJoinStudent(appShortName) {
    //var filterOrgSubOrgBatchId =globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    //  this.FilterOrgSubOrg +
    //   " and BatchId eq " + this.SelectedBatchId ;
    let list: List = new List();
    list.fields = [
      "StudentClassId,StudentId,ClassId,SectionId,SemesterId,RollNo,FeeTypeId,Remarks,Active,Admitted"
    ];
    if (this.LoginUserDetail[0]['RoleUsers'][0].role.toLowerCase() == 'student') {
      this.filterOrgSubOrgBatchId += " and StudentId eq " + localStorage.getItem("studentId");
    }
    this.filterOrgSubOrgBatchId += this.GetEmployeeClassIds();
    this.filterOrgSubOrgBatchId +=" and Active eq 1";
    list.PageName = "StudentClasses";
    list.lookupFields = ["StudentFeeTypes($select=StudentFeeTypeId,FeeTypeId,FromMonth,ToMonth,Discount,Active),Student($select=PID," +
      "StudentId," +
      "FirstName," +
      "LastName," +
      "FatherName," +
      "FatherOccupation," +
      "MotherName," +
      "MotherOccupation," +
      "GenderId," +
      "PermanentAddress," +
      "PresentAddress," +
      "DOB," +
      "BloodgroupId," +
      "CategoryId," +
      "AccountHolderName," +
      "BankAccountNo," +
      "IFSCCode," +
      "MICRNo," +
      "AdhaarNo," +
      "Photo," +
      "ReligionId," +
      "PersonalNo," +
      "WhatsAppNumber," +
      "FatherContactNo," +
      "MotherContactNo," +
      "PrimaryContactFatherOrMother," +
      "NameOfContactPerson," +
      "RelationWithContactPerson," +
      "ContactPersonContactNo," +
      "AlternateContact," +
      "ClassAdmissionSought," +
      "LastSchoolPercentage," +
      "TransferFromSchool," +
      "TransferFromSchoolBoard," +
      "ClubId," +
      "HouseId," +
      "RemarkId," +
      "Remark2Id," +
      "AdmissionStatusId," +
      "AdmissionDate," +
      "Notes," +
      "EmailAddress," +
      "Active," +
      "ReasonForLeavingId," +
      "IdentificationMark," +
      "BoardRegistrationNo," +
      "Height," +
      "Weight,Deleted)"];

    list.filter = [this.filterOrgSubOrgBatchId];
    this.Loading();
    //this.PageLoading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        let result = data.value.filter(s => s.Student.Deleted == false);
        this.Students = [];
        var _classNameobj;
        var _className = '';
        var _studentClassId = 0;
        var _remark1 = '';
        var _remark2 = '';
        var _Section = '';
        var _semester = '';
        var _lastname = '';
        var _name = '';
        let newStudents:any=[];
        for (let i = 0; i < result.length; i++) {

          // result.forEach(d => {
          // var studcls = '{';
          // Object.keys(d).forEach(c => {
          //   studcls += '"' + c + '":"' + d[c] + '",';
          // });
          // studcls = studcls.substring(0, studcls.length - 1) + "}";
          

          let stud = JSON.parse(JSON.stringify(result[i].Student));
          newStudents.push(stud);

          let feetypes = JSON.parse(JSON.stringify(result[i].StudentFeeTypes));
          
          delete result[i].Student;
          delete result[i].StudentFeeTypes;

          let cls =  JSON.parse(JSON.stringify(result[i]));
          newStudents[i].StudentClasses =[];
          newStudents[i].StudentClasses.push(cls);
          newStudents[i].StudentClasses[0].StudentFeeTypes =feetypes;        
          
          // Object.keys(stud).forEach(s => {
          //   result[i][s] = stud[s];
          // })

          _classNameobj;
          _className = '';
          _studentClassId = 0;
          //if (d.StudentClasses.length > 0) {
          _classNameobj = this.Classes.find(c => c.ClassId == newStudents[i].StudentClasses[0].ClassId);
          if (_classNameobj)
            _className = _classNameobj.ClassName;

          _remark1 = '';
          _remark2 = '';
          if (newStudents[i].RemarkId) {
            var _remarkObj = this.Remark1.find((f: any) => f.MasterDataId == newStudents[i].RemarkId);
            if (_remarkObj)
              _remark1 = _remarkObj.MasterDataName;
          }
          if (newStudents[i].Remark2Id) {
            var _remark2Obj = this.Remark2.find((f: any) => f.MasterDataId == newStudents[i].Remark2Id);
            if (_remark2Obj)
              _remark2 = _remark2Obj.MasterDataName;
          }
          _Section = '';
          var _sectionobj = this.Sections.find((f: any) => f.MasterDataId == newStudents[i].StudentClasses[0].SectionId);
          if (_sectionobj)
            _Section = _sectionobj.MasterDataName;
          _semester = '';
          var _semesterobj = this.Semesters.find((f: any) => f.MasterDataId == newStudents[i].StudentClasses[0].SemesterId);
          if (_semesterobj)
            _semester = _semesterobj.MasterDataName;

          //var _RollNo = d.StudentClasses[0].RollNo;
          _studentClassId = newStudents[i].StudentClasses[0].StudentClassId;
          //}
          _lastname = newStudents[i].LastName == null ? '' : " " + newStudents[i].LastName;

          _name = newStudents[i].FirstName + _lastname;
          //var _fullDescription = _name + "-" + _className + "-" + _Section + "-" + _RollNo;

          newStudents[i].RollNo = newStudents[i].StudentClasses[0].RollNo;
          newStudents[i].Name = _name;
          newStudents[i].ClassName = _className;
          newStudents[i].Section = _Section;
          newStudents[i].Semester = _semester;
          newStudents[i].Remark1 = _remark1;
          newStudents[i].Remark2 = _remark2;
          newStudents[i].StudentClassId = _studentClassId;
          this.Students.push(newStudents[i]);
          // });
        }
        this.tokenStorage.saveStudents(this.Students);
        ////console.log("previous students", this.Students);
        this.LoadingFalse();
        this.PageLoading = false;
        if (this.Submitted) {
          if (this.RedirectionText.length == 0)
            this.RedirectionText = appShortName;
          this.route.navigateByUrl("/" + this.RedirectionText);
        }
      })
  }
  getDropdownFromDB(pParentId, pAppId) {
    var filterOrg = "";
    if (globalconstants.CompanyParentId == pParentId)
      filterOrg = "OrgId eq " + this.LoginUserDetail[0]["orgId"];
    else
      filterOrg = "OrgId eq " + this.LoginUserDetail[0]["orgId"] + " and SubOrgId eq " + this.LoginUserDetail[0]["subOrgId"];

    return this.contentservice.GetDropDownDataFromDB(pParentId, filterOrg, pAppId)
  }
  GetStudentAndClassesWithForkJoin(appShortName) {
    var sources = [this.GetStudents(), this.GetBatchAndCurrentSameStudentClasses()];
    forkJoin(sources)
      .subscribe((data: any) => {
        var _students = data[0].value;
        var __studentClasses = data[1].value;
        if (this.LoginUserDetail[0]['RoleUsers'][0].role.toLowerCase() == 'student')
          this.tokenStorage.saveClassId(__studentClasses[0].ClassId);
        //let _studentWithClass = _students.map((item, i) => Object.assign({}, item, __studentClasses[i]));
        ////console.log("_studentWithClass",_studentWithClass)
        var _classNameobj: any = {};
        var _className = '';
        var _house = '';
        var _Section = '';
        let _remark1 = '';
        let _remark2 = '';
        var _semester = '';
        var _studentClassId = 0;
        _students.forEach(d => {
          _classNameobj = {};
          _className = '';
          _studentClassId = 0;
          _house = '';
          var studcls = __studentClasses.filter((f: any) => f.StudentId == d.StudentId);
          if (studcls.length > 0) {
            if (studcls[0].StudentFeeTypes && studcls[0].StudentFeeTypes.length > 0)
              studcls[0].FeeTypeId = studcls[0].StudentFeeTypes[0].FeeTypeId;

            _classNameobj = this.Classes.find(c => c.ClassId == studcls[0].ClassId);
            if (_classNameobj)
              _className = _classNameobj.ClassName;


            var _sectionobj = this.Sections.find((f: any) => f.MasterDataId == studcls[0].SectionId);
            if (_sectionobj)
              _Section = _sectionobj.MasterDataName;
            var _semesterobj = this.Semesters.find((f: any) => f.MasterDataId == studcls[0].SemesterId);
            if (_semesterobj)
              _semester = _semesterobj.MasterDataName;
            if (d.RemarkId) {
              var _remark1obj = this.Remark1.find((f: any) => f.MasterDataId == d.RemarkId);
              if (_remark1obj)
                _remark1 = _remark1obj.MasterDataName;
            }
            if (d.Remark2Id) {
              var _remark2obj = this.Remark2.find((f: any) => f.MasterDataId == d.Remark2Id);
              if (_remark2obj)
                _remark2 = _remark2obj.MasterDataName;
            }
            //var _RollNo = studcls[0].RollNo;
            _studentClassId = studcls[0].StudentClassId;
          }
          else
            studcls = [];

          var _lastname = d.LastName == null ? '' : " " + d.LastName;
          //this.House
          var _name = d.FirstName + _lastname;
          //var _fullDescription = _name + "-" + _className + "-" + _Section + "-" + _RollNo;
          d.StudentClassId = _studentClassId;
          d.Name = _name;
          d.ClassName = _className;
          d.Section = _Section;
          d.Semester = _semester;
          d.StudentClasses = studcls;
          d.Remark1 = _remark1;
          d.Remark2 = _remark2;

          let obj = this.Houses.find(h => h.MasterDataId == d.HouseId)
          if (obj)
            d.House = obj.MasterDataName
          else
            d.House = '';
          this.Students.push(d);

        })
        debugger;
        this.tokenStorage.saveStudents(this.Students);
        //this.GetMasterData(SelectedAppId, selectedApp);
        this.LoadingFalse();
        //this.PageLoading = false;
        if (this.Submitted) {
          if (this.RedirectionText.length == 0)
            this.RedirectionText = appShortName;
          //this.route.navigate(['/', appShortName]);
          this.route.navigateByUrl("/" + this.RedirectionText);
        }
      })
  }
  GetBatchAndCurrentSameStudentClasses() {
    let list: List = new List();
    list.fields = [
      "StudentClassId,StudentId,HouseId,BatchId,ClassId,SectionId,SemesterId,RollNo,FeeTypeId,Remarks,Active,Admitted"
    ];
    list.PageName = "StudentClasses";
    list.lookupFields = ["StudentFeeTypes($filter=Active eq true;$select=StudentFeeTypeId,FeeTypeId,FromMonth,ToMonth,Discount,Active)"]

    if (this.LoginUserDetail[0]['RoleUsers'][0].role.toLowerCase() == 'student') {
      this.filterOrgSubOrgBatchId += " and StudentId eq " + localStorage.getItem("studentId");
    }

    this.filterOrgSubOrgBatchId += this.GetEmployeeClassIds();
    this.filterOrgSubOrgBatchId += " and IsCurrent eq true and Active eq 1";

    list.filter = [this.filterOrgSubOrgBatchId];
    this.Loading();
    this.PageLoading = true;
    return this.dataservice.get(list);
  }
  GetEmployeeClassIds() {
    let filter = '';
    this.EmployeeClassList.forEach(item => {
      if (filter.length == 0)
        filter = " and (ClassId eq " + item;
      else
        filter += " or ClassId eq " + item;
    })
    if (filter.length > 0)
      filter += ")"
    return filter;
  }
  GetStudents() {
    //var filterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    let filterstr = this.filterOrgSubOrgBatchId;
    this.Students = [];
    let list: List = new List();
    list.fields = [
      "PID",
      "StudentId",
      "FirstName",
      "LastName",
      "FatherName",
      "FatherOccupation",
      "MotherName",
      "MotherOccupation",
      "GenderId",
      "PermanentAddress",
      "PresentAddress",
      "DOB",
      "BloodgroupId",
      "CategoryId",
      "AccountHolderName",
      "BankAccountNo",
      "IFSCCode",
      "MICRNo",
      "AdhaarNo",
      "Photo",
      "ReligionId",
      "PersonalNo",
      "WhatsAppNumber",
      "FatherContactNo",
      "MotherContactNo",
      "PrimaryContactFatherOrMother",
      "NameOfContactPerson",
      "RelationWithContactPerson",
      "ContactPersonContactNo",
      "AlternateContact",
      "ClassAdmissionSought",
      "LastSchoolPercentage",
      "TransferFromSchool",
      "TransferFromSchoolBoard",
      "ClubId",
      "HouseId",
      "RemarkId",
      "Remark2Id",
      "AdmissionStatusId",
      "AdmissionDate",
      "Notes",
      "EmailAddress",
      "Active",
      "ReasonForLeavingId",
      "IdentificationMark",
      "BoardRegistrationNo",
      "Height",
      "Weight"
    ];
    list.PageName = "Students";
    if (this.LoginUserDetail[0]['RoleUsers'][0].role.toLowerCase() == 'student') {
      filterstr += " and StudentId eq " + localStorage.getItem("studentId");
    }
    filterstr += this.GetEmployeeClassIds();
    filterstr += " and Active eq 1";
    list.filter = [filterstr];
    this.Loading();
    this.PageLoading = true;
    return this.dataservice.get(list);

  }
  EmployeeClassList: any = [];
  GetTeacherAndClasses(appShortName) {
    let filterStr = '';//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    //debugger;
    this.loading = true;

    let _employeeId = this.LoginUserDetail[0].employeeId;
    this.EmployeeClassList = this.tokenStorage.getEmployeeClasses();
    if (this.EmployeeClassList.length > 0) {
      this.GetStudentsAndClasses(appShortName);
    }
    else {

      filterStr = this.filterOrgSubOrgBatchId;
      if (_employeeId > 0) {
        filterStr += ' and EmployeeId eq ' + _employeeId
      }
      filterStr += " and Active eq 1";
      let list: List = new List();
      list.fields = [
        'TeacherSubjectId',
        'ClassSubjectId',
      ];

      list.PageName = "TeacherSubjects";
      list.lookupFields = ["ClassSubject($select=ClassId,Active)"]
      list.filter = [filterStr];

      this.dataservice.get(list)
        .subscribe((data: any) => {
          data.value.forEach(d => {
            if (this.EmployeeClassList.indexOf(d.ClassSubject.ClassId) == -1 && d.ClassSubject.Active == 1)
              this.EmployeeClassList.push(d.ClassSubject.ClassId);
          })

          this.Classes = this.Classes.filter(c => this.EmployeeClassList.indexOf(c.ClassId) > -1);
          this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
          this.tokenStorage.saveClasses(this.Classes);
          this.tokenStorage.saveEmployeeClasses(this.EmployeeClassList);

          this.GetStudentsAndClasses(appShortName);

        })
    }
  }
  GetStudentsAndClasses(appShortName) {
    if (this.CurrentBatchId == this.SelectedBatchId)
      this.GetStudentAndClassesWithForkJoin(appShortName);//this.GetStudents(obj);
    else
      this.GetClassJoinStudent(appShortName);
  }
  sendmessage() {
    var api = "https://graph.facebook.com/v15.0/107273275514184/messages";
    var data = { "messaging_product": "whatsapp", "to": "918974098031", "type": "template", "template": { "name": "hello_world", "language": { "code": "en_US" } } }

    // var data = {
    //   "phone": "918974098031",
    //   "body": "WhatsApp API on Chat API from TTP again"
    // }
    this.http.post(api, data).subscribe((data: any) => {
      ////console.log("messagereturn",data);
    });
  }
}
