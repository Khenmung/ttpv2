import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subscription } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../_services/auth.service';
import { TokenStorageService } from '../../../_services/token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  PageLoading = true;
  jwtHelper = new JwtHelperService();
  userInfo :any[]= [];
  loading = false;
  Organizations :any[]= [];
  Departments :any[]= [];
  Applications :any[]= [];
  Locations :any[]= [];
  Roles :any[]= [];
  ApplicationFeatures :any[]= [];
  loginForm: UntypedFormGroup;
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  UserDetail :any[]= [];
  RoleFilter = '';
  username: string = '';
  mediaSub: Subscription;
  deviceXs: boolean;
  password;
  show = false;
  IsSubmitted = false;
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  constructor(
    private authService: AuthService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private route: Router,
    private mediaObserver: MediaObserver,
    private fb: UntypedFormBuilder,
    private contentservice: ContentService
  ) { }
  LoginUserDetail:any=[];
  ngOnInit(): void {

    this.password = 'password';
    // //this.mediaSub = this.mediaObserver.asObservable.subscribe((result: MediaChange) => {
    //   this.deviceXs = result.mqAlias === "xs" ? true : false;
    //   //////console.log("authlogin",this.deviceXs);
    // });
    var username = this.tokenStorage.getUser();
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })

    debugger;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //if (this.tokenStorage.getToken()) {
    if (this.LoginUserDetail.length > 0 && this.LoginUserDetail[0].org!='TTP') {
      this.isLoggedIn = true;
      this.route.navigate(['/dashboard']);
    }

  }
  onSubmit(): void {
    this.IsSubmitted = true;
    this.username = this.loginForm.get("username")?.value;
    var password = this.loginForm.get("password")?.value;
    debugger;
    if (this.username.length == 0) {
      this.contentservice.openSnackBar("Please enter user name", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (password.length == 0) {
      this.contentservice.openSnackBar("Please enter password", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    this.authService.login(this.username, password).subscribe(
      data => {

        this.tokenStorage.saveToken(data.Token);
        this.tokenStorage.saveRefreshToken(data.refreshToken);
        this.tokenStorage.saveUser(data);

        const decodedUser = this.jwtHelper.decodeToken(data.Token);
        this.userInfo = JSON.parse(JSON.stringify(decodedUser));

        localStorage.setItem('orgId', decodedUser.orgId);
        localStorage.setItem('subOrgId', this.userInfo["subOrgId"]);
        localStorage.setItem('userId', decodedUser.Id);
        localStorage.setItem('planId', decodedUser.planId);
        localStorage.setItem('username', decodedUser.username);
        localStorage.setItem('email', decodedUser.email);
        localStorage.setItem('employeeId', decodedUser.employeeId);
        localStorage.setItem('studentId', decodedUser.studentId);
        localStorage.setItem('role', decodedUser.role);
        localStorage.setItem('customerPlanId', decodedUser.customerPlanId);
        localStorage.setItem('loggedTime',new Date().getDate() +"");
        this.tokenStorage.saveSubOrgId(this.userInfo["subOrgId"]);
        this.FilterOrgSubOrg = "OrgId eq " + localStorage.getItem("orgId") + " and SubOrgId eq " + localStorage.getItem("subOrgId");// globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        //this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);

        //if PlanId is zero, redirect to select plan.
        if (+decodedUser.planId == 0 && decodedUser.role.toLowerCase() == 'admin')
          this.route.navigate(['/auth/selectplan']);
        else {
          //  localStorage.setItem('userInfo',decodedUser);
          this.isLoginFailed = false;
          this.isLoggedIn = true;
          //this.roles = this.tokenStorage.getUser().roles;
          this.GetApplicationRoleUser();
          //this.reloadPage();
        }
      },
      err => {
        debugger;
        this.loading = false; this.PageLoading = false;
        //this.errorMessage = '';
        if (err.error.Messages)
          this.errorMessage = globalconstants.formatError(err.error.Messages);
        else if (err.error.Errors) {
          this.errorMessage = globalconstants.formatError(err.error.Errors);
        }
      
        this.contentservice.openSnackBar(this.errorMessage, globalconstants.ActionText, globalconstants.RedBackground);
        this.isLoginFailed = true;
      }
    );
    this.IsSubmitted = false;
  }

  reloadPage(): void {
    window.location.reload();
  }
  GetApplicationRoleUser() {

    debugger;
    let list: List = new List();
    list.fields = [
      'UserId',
      'RoleId',
      'OrgId',
      'Active'
    ];

    list.PageName = "RoleUsers";
    list.lookupFields = ["Org($select=OrganizationId,OrganizationName,LogoPath,Active)"];

    list.filter = ["OrgId eq " + localStorage.getItem("orgId") + " and SubOrgId eq " + localStorage.getItem("subOrgId") +
     " and Active eq 1 and UserId eq '" + localStorage.getItem("userId") + "'"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //////console.log("data", data)
        if (data.value.length > 0) {
          if (data.value[0].Org.Active == 1)
            this.GetMasterData(data.value);
          else {
            this.contentservice.openSnackBar("User's Organization not active!, Please contact your administrator!", globalconstants.ActionText, globalconstants.RedBackground);
          }
        }
        else {
          //if no roleuser data present redirect to select apps.
          //this.route.navigate(["/auth/selectplan"]);
          this.contentservice.openSnackBar("No role user defined.",globalconstants.ActionText,globalconstants.RedBackground);
        }
      })
  }

  GetMasterData(UserRole) {
    debugger;
    //this.Applications = this.tokenStorage.getPermittedApplications();

    this.contentservice.GetParentZeroMasters().subscribe((data: any) => {
      var TopMasters = [...data.value];
      var countryparentId = TopMasters.filter((f:any) => f.MasterDataName.toLowerCase() == 'application')[0].MasterDataId;
      var appId = TopMasters.filter((f:any) => f.MasterDataName.toLowerCase() == 'application')[0].ApplicationId;
      var filterorgsuborg = 'OrgId eq 0 and SubOrgId eq 0';
      this.contentservice.GetDropDownDataFromDB(countryparentId, filterorgsuborg, 0)
        .subscribe((data: any) => {
          this.Applications = [...data.value];
          var commonappId = this.Applications.filter((f:any) => f.MasterDataName.toLowerCase() == 'common')[0].MasterDataId;
          var roleparentId = TopMasters.filter((f:any) => f.MasterDataName.toLowerCase() == 'role')[0].MasterDataId;
          this.contentservice.GetDropDownDataFromDB(roleparentId, this.FilterOrgSubOrg, commonappId)
            .subscribe((data: any) => {
              this.Roles = [...data.value];


              this.RoleFilter = ' and (RoleId eq 0';
              var __organization = '';
              if (UserRole[0].OrgId != null)
                __organization = UserRole[0].Org.OrganizationName;

              this.UserDetail = [{
                employeeId: this.userInfo["employeeId"],
                userId: this.userInfo["Id"],
                userName: this.userInfo["email"],
                email: this.userInfo["email"],
                subOrgId: this.userInfo["subOrgId"],
                orgId: UserRole[0].OrgId,
                org: __organization,
                planId: localStorage.getItem("planId"),
                customerPlanId: localStorage.getItem("customerPlanId"),
                logoPath: globalconstants.apiUrl + "/uploads/" + __organization + "/organization logo/" + UserRole[0].Org.LogoPath,
                RoleUsers: UserRole.map(roleuser => {
                  if (roleuser.Active == 1 && roleuser.RoleId != null) {
                    this.RoleFilter += ' or RoleId eq ' + roleuser.RoleId
                    var _role = '';
                    if (this.Roles.length > 0 && roleuser.RoleId != null)
                      var _roleobj:any = this.Roles.filter(a => a.MasterDataId == roleuser.RoleId)
                    if (_roleobj.length > 0) {
                      _role = _roleobj[0].MasterDataName;
                    }
                    else {
                      this.contentservice.openSnackBar("No matching role found.", globalconstants.ActionText, globalconstants.RedBackground);
                    }
                    return {
                      roleId: roleuser.RoleId,
                      role: _role,

                    }
                  }
                  else
                    return false;
                })
              }]

              //login detail is save even though roles are not defined.
              //so that user can continue their settings.
              this.tokenStorage.saveUserdetail(this.UserDetail);
              if (this.RoleFilter.length > 0)
                this.RoleFilter += ')';
              //this.tokenStorage.saveCheckEqualBatchId
              //this.GetCustomFeature();
              this.GetApplicationRolesPermission();
            })
        })
    })
  }

  get f() {
    return this.loginForm.controls;
  }
  visibility = 'visibility';
  showhidePassword() {

    if (this.password === 'password') {
      this.password = 'text';
      this.show = true;
      this.visibility = 'visibility';
    } else {
      this.password = 'password';
      this.show = false;
      this.visibility = 'visibility_off';
    }

  }

  GetApplicationRolesPermission() {

    let list: List = new List();
    list.fields = [
      'PlanFeatureId',
      'RoleId',
      'PermissionId',
      'Active'
    ];

    list.PageName = "ApplicationFeatureRolesPerms";
    list.lookupFields = ["PlanFeature($select=PageId,Active,PlanId;$expand=Page($select=Active,PageTitle,label,link,faIcon,ApplicationId,ParentId))"]

    list.filter = [this.FilterOrgSubOrg + this.RoleFilter + " and PlanId eq "+ localStorage.getItem("planId") +" and Active eq 1"];
    // and PlanId eq "+ localStorage.getItem("planId") +" 
    debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        ////console.log("all",data.value)
        var _allPermission :any[]= [];
        data.value.forEach(m => {
          if (m.PlanFeature.Page.Active == 1 && m.PlanFeature.Active == 1 && m.PlanFeature.PlanId == localStorage.getItem("planId")) {
            _allPermission.push(m);
          }
        })

        //console.log("all permission", _allPermission)
        if (_allPermission.length > 0) {

          var _applicationName = '';
          var _appShortName = '';
          this.UserDetail[0]["applicationRolePermission"] = [];
          _allPermission.forEach(item => {
            var appObj = this.Applications.filter((f:any) => f.MasterDataId == item.PlanFeature.Page.ApplicationId);
            _applicationName = '';
            _appShortName = '';
            //only active application's features will be available. 
            if (appObj.length > 0) {
              _applicationName = appObj[0].Description;
              _appShortName = appObj[0].MasterDataName;

              var _permission = '';
              //console.log("item.PlanFeature.Page.PageTitle",item.PlanFeature.Page.PageTitle + "-----" + item.PermissionId)
              if (item.PermissionId != null)
                _permission = globalconstants.PERMISSIONTYPES.filter(a => a.val == item.PermissionId)[0].type
              this.UserDetail[0]["applicationRolePermission"].push({
                'planId':item.PlanFeature.PlanId,
                'pageId': item.PlanFeature.PageId,
                'applicationFeature': item.PlanFeature.Page.PageTitle,//_applicationFeature,
                'roleId': item.RoleId,
                'permissionId': item.PermissionId,
                'permission': _permission,
                'applicationName': _applicationName,
                'applicationId': item.PlanFeature.Page.ApplicationId,
                'appShortName': _appShortName,
                'faIcon': item.PlanFeature.Page.faIcon,
                'label': item.PlanFeature.Page.label,
                'link': item.PlanFeature.Page.link
              });
            }
          });
          this.loading = false; this.PageLoading = false;
          this.tokenStorage.saveUserdetail(this.UserDetail);
          this.isLoginFailed = false;
          this.isLoggedIn = true;
          this.username = this.tokenStorage.getUser();
          var gotoUrl = this.tokenStorage.getRedirectUrl();
          if (gotoUrl.length == 0)
            gotoUrl = '/dashboard';
          this.route.navigate([gotoUrl]);
        }
        else {
          this.contentservice.openSnackBar("Initial minimal settings must be done.", globalconstants.ActionText, globalconstants.RedBackground);
          this.route.navigate(['edu/setting']);
        }
      })
  }
  GetApplicationFeatures() {

    let list: List = new List();
    list.fields = [
      'PageId',
      'PageTitle',
      'label',
      'ApplicationId'
    ];

    list.PageName = "Pages";
    list.filter = ["Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.ApplicationFeatures = [...data.value];

        }
      })
  }
  // getDropDownData(dropdowntype) {
  //   let Ids = this.allMasterData.filter((item, indx) => {
  //     return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
  //   })
  //   if (Ids.length > 0) {
  //     let Id = Ids[0].MasterDataId;
  //     return this.allMasterData.filter((item, index) => {
  //       return item.ParentId == Id
  //     });
  //   }
  //   else
  //     return [];
  // }
  gotohome() {
    this.route.navigate(['/dashboard']);
  }

}