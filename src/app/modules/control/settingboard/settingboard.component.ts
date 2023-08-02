import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AddMasterDataComponent } from '../add-master-data/add-master-data.component';
import { roleuserdashboardComponent } from '../roleuser/roleuserdashboard/roleuserdashboard.component';
import { AppuserdashboardComponent } from '../users/appuserdashboard/appuserdashboard.component';
import { RoleAppPermissiondashboardComponent } from '../roleapppermission/RoleAppPermissiondashboard/RoleAppPermissiondashboard.component';
import { BatchdashboardComponent } from '../batchdashboard/batchdashboard.component';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ContentService } from 'src/app/shared/content.service';
import { OrganizationComponent } from '../organization/organization.component';
import { CustomerPlansComponent } from '../customerplans/customerplans.component';
import { CustomfeaturerolepermissionComponent } from '../customfeaturerolepermission/customfeaturerolepermission.component';
import { InvoiceComponent } from '../invoice/invoice.component';

@Component({
  selector: 'app-signup',
  templateUrl: './settingboard.component.html',
  styleUrls: ['./settingboard.component.scss']
})
export class settingboardComponent implements AfterViewInit {
  components:any = [
    AddMasterDataComponent,
    AppuserdashboardComponent,
    roleuserdashboardComponent,
    RoleAppPermissiondashboardComponent,
    BatchdashboardComponent,
    OrganizationComponent,
    CustomerPlansComponent,
    CustomfeaturerolepermissionComponent,
    //InvoiceComponent
  ];

  tabNames = [
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "Khat peuhpeuh", "faIcon": '' },
    { "label": "Khat peuhpeuh", "faIcon": '' },
    { "label": "Khat peuhpeuh", "faIcon": '' },
    { "label": "Khat peuhpeuh", "faIcon": '' },
  ];
  LoginUserDetail = [];
  Permissions =
    {
      ParentPermission: '',
      DataDownloadPermission: '',
      DataUploadPermission: ''
    };

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;
  AppName = '';
  constructor(
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private contentservice: ContentService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public ngAfterViewInit(): void {
    debugger
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    var SelectedApplicationId = this.tokenStorage.getSelectedAPPId();
    var selectedApp = this.tokenStorage.getPermittedApplications().filter(f => f.applicationId == SelectedApplicationId);
    if (selectedApp.length > 0)
      this.AppName = selectedApp[0].appShortName
    //this.AppName ='common'

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.INITIALSETTING)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;

    }
    //this.Permissions.ParentPermission ='rwd';

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.MASTERS)
    var comindx = this.components.indexOf(AddMasterDataComponent);
    this.GetComponents(perObj, comindx);
    if (this.AppName.toLowerCase() != 'common') {
      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.BATCHDASHBOARD)
      var comindx = this.components.indexOf(BatchdashboardComponent);
      this.GetComponents(perObj, comindx);

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.USERS)
      var comindx = this.components.indexOf(AppuserdashboardComponent);
      this.GetComponents(perObj, comindx);

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.ROLEUSER)
      var comindx = this.components.indexOf(roleuserdashboardComponent);
      this.GetComponents(perObj, comindx);

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.APPLICATIONFEATUREPERMISSION)
      var comindx = this.components.indexOf(RoleAppPermissiondashboardComponent);
      this.GetComponents(perObj, comindx);

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.ORGANIZATION);
      var comindx = this.components.indexOf(OrganizationComponent);
      this.GetComponents(perObj, comindx);

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.MYPLAN);
      var comindx = this.components.indexOf(CustomerPlansComponent);
      this.GetComponents(perObj, comindx);
      
      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.CUSTOMFEATUREPERMISSION);
      var comindx = this.components.indexOf(CustomfeaturerolepermissionComponent);
      this.GetComponents(perObj, comindx);
      
      // perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.INVOICENRECEIPT);
      // var comindx = this.components.indexOf(InvoiceComponent);
      // this.GetComponents(perObj, comindx);
    }
    else {
      var comindx = this.components.indexOf(BatchdashboardComponent);
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
      comindx = this.components.indexOf(AppuserdashboardComponent);
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
      comindx = this.components.indexOf(roleuserdashboardComponent);
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
      // comindx = this.components.indexOf(RoleAppPermissiondashboardComponent);
      // this.components.splice(comindx, 1);
      // this.tabNames.splice(comindx, 1);
      comindx = this.components.indexOf(OrganizationComponent);
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);

      comindx = this.components.indexOf(CustomerPlansComponent);
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
      
      comindx = this.components.indexOf(CustomfeaturerolepermissionComponent);
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.APPLICATIONFEATUREPERMISSION);
      var comindx = this.components.indexOf(RoleAppPermissiondashboardComponent);
      this.GetComponents(perObj, comindx);
    }
    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
    if (this.Permissions.ParentPermission != 'deny' && this.Permissions.ParentPermission != '') {
      setTimeout(() => {
        this.renderComponent(0);
      }, 1000)
      this.cdr.detectChanges();
    }
  }

  public tabChange(index: number) {
    setTimeout(() => {
      this.renderComponent(index);
    }, 1000);

  }
  selectedIndex = 0;


  private renderComponent(index: number): any {
    
    this.viewContainer.createComponent(this.components[index]);
  }
  GetComponents(perObj, comindx) {
    if (perObj.length > 0) {
      if (perObj[0].permission == 'deny') {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }
      else {
        this.tabNames[comindx].faIcon = perObj[0].faIcon;
        this.tabNames[comindx].label = perObj[0].label;
      }
    }
    else {
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
    }
  }
}
