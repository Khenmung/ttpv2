import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-roleappAdd',
  templateUrl: './roleappAdd.component.html',
  styleUrls: ['./roleappAdd.component.scss']
})
export class roleappAddComponent implements OnInit { PageLoading=true;
  @Output() OutAppRoleId = new EventEmitter();
  @Output() CallParentPageFunction = new EventEmitter();
  @Input("AppRoleId") AppRoleId: number;
  FilterOrgSubOrg='';
  loading =false;
  allMasterData = [];
  AppRoles = [];
  Roles = [];
  Applications = [];
  Permissions=[];
  //Users = [];
  AppRoleData = {
    PermissionId: 0,
    ApplicationId:0,
    RoleId: 0,
    ApplicationRoleId: 0,
    OrgId: 0,SubOrgId: 0,
    DepartmentId:0,
    LocationId:0,
    CreatedDate:new Date(),
    CreatedBy:0,
    UpdatedDate:new Date(),
    UpdatedBy:0,
    Active: 1
  };
  UserDetail = [];
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private shareddata: SharedataService,
    private dataservice: NaomitsuService,
    private route: Router,
    
    private fb: UntypedFormBuilder,
    private tokenStorage: TokenStorageService
  ) {

  }

  AppRoleForm = this.fb.group({
    ApplicationRoleId: [0],
    PermissionId:[0, Validators.required],
    ApplicationId: [0, Validators.required],
    RoleId: [0, Validators.required],
    Active: [1, Validators.required],
  })

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
      
  }
  PageLoad(){
    //debugger;
    this.loading =true;
    this.UserDetail = this.tokenStorage.getUserDetail();
    if (this.UserDetail == null) {
      this.route.navigate(['auth/login']);
      //return;
    }
    this.FilterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.Applications = this.tokenStorage.getPermittedApplications();
    this.shareddata.CurrentRoles.subscribe(r => this.Roles = r);
    this.Permissions = globalconstants.PERMISSIONTYPES;
    this.GetAppRole();
  }

  back() {
      this.OutAppRoleId.emit(0);
  }
  get f() {
    return this.AppRoleForm.controls;
  }

  GetAppRole() {

    let list: List = new List();
    list.fields = ["ApplicationRoleId", "ApplicationId","RoleId","PermissionId","Active"];
    list.PageName = "ApplicationRoles";
    list.filter = ["Active eq 1 and ApplicationRoleId eq " + this.AppRoleId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
      //  //console.log('roleuser', data);
        data.value.forEach(element => {
          this.AppRoleForm.patchValue({
            ApplicationRoleId: element.ApplicationRoleId,
            PermissionId: element.PermissionId,
            RoleId: element.RoleId,
            ApplicationId:element.ApplicationId,
            Active: element.Active
          })
        });          
        });
        this.loading =false;
  }

  UpdateOrSave() {

    if(this.AppRoleForm.get("ApplicationId").value ==0)
    {
      this.contentservice.openSnackBar("Please select application.",globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if(this.AppRoleForm.get("RoleId").value ==0)
    {
      this.contentservice.openSnackBar("Please select role",globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if(this.AppRoleForm.get("PermissionId").value ==0)
    {
      this.contentservice.openSnackBar("Please select permission",globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    
    let checkFilterString = this.FilterOrgSubOrg + " and Active eq 1 " +
      " and RoleId eq " + this.AppRoleForm.get("RoleId").value +
      " and ApplicationId eq " + this.AppRoleForm.get("ApplicationId").value //+
      //" and OrgId eq " + this.UserDetail[0]["orgId"];

    if (this.AppRoleData.ApplicationRoleId > 0)
      checkFilterString += " and ApplicationRoleId ne " + this.AppRoleData.ApplicationRoleId;

    let list: List = new List();
    list.fields = ["ApplicationRoleId"];
    list.PageName = "ApplicationRoles";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          ////console.log(this.UserDetail);
          this.AppRoleData.Active = this.AppRoleForm.get("Active").value==true?1:0;
          this.AppRoleData.ApplicationRoleId = this.AppRoleForm.get("ApplicationRoleId").value;
          this.AppRoleData.ApplicationId = this.AppRoleForm.get("ApplicationId").value;
          this.AppRoleData.RoleId = this.AppRoleForm.get("RoleId").value;
          this.AppRoleData.PermissionId = this.AppRoleForm.get("PermissionId").value;
          this.AppRoleData.OrgId = this.UserDetail[0]["orgId"];
          this.AppRoleData.SubOrgId = this.tokenStorage.getSubOrgId();
          this.AppRoleData.DepartmentId=0;
          this.AppRoleData.LocationId=0;
          this.AppRoleData.CreatedDate=new Date();
          this.AppRoleData.CreatedBy=this.UserDetail[0].userId;
          this.AppRoleData.UpdatedDate=new Date();
          this.AppRoleData.UpdatedBy=this.UserDetail[0].userId;
          //console.log('data',this.AppRoleData);
          if (this.AppRoleData.ApplicationRoleId == 0) {
            this.insert();
          }
          else {
            this.update();
          }
          this.OutAppRoleId.emit(0);
          this.CallParentPageFunction.emit();
        }        
      });
  }

  insert() {

    //debugger;
    this.dataservice.postPatch('ApplicationRoles', this.AppRoleData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update() {

    this.dataservice.postPatch('ApplicationRoles', this.AppRoleData, this.AppRoleData.ApplicationRoleId, 'patch')
      .subscribe(
        (data: any) => {
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }
}
