import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MenuConfigComponent } from '../menu-config/menu-config.component';
import { CustomerPlansComponent } from '../../control/customerplans/customerplans.component';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { PlansComponent } from '../plans/plans.component';
import { ContentService } from 'src/app/shared/content.service';
import { PlanFeatureComponent } from '../planfeature/planfeature.component';
import { AdminrolepermissionComponent } from '../adminrolepermission/adminrolepermission.component';
import { PlanandmasteritemComponent } from '../planandmasteritem/planandmasteritem.component';
import { OrganizationpaymentComponent } from '../organizationpayment/organizationpayment.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerPlanFeatureComponent } from '../customerplanfeature/customerplanfeature.component';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-globaladminboard',
  templateUrl: './globaladminboard.component.html',
  styleUrls: ['./globaladminboard.component.scss']
})
export class GlobaladminboardComponent implements AfterViewInit {

  components:any = [
    OrganizationpaymentComponent,
    MenuConfigComponent,
    PlansComponent,
    PlanFeatureComponent,
    PlanandmasteritemComponent,
    AdminrolepermissionComponent,
    CustomerPlansComponent,
    CustomerPlanFeatureComponent
  ];
  LoginUserDetail = [];
  tabNames = [
    { 'label': 'Plan', 'faIcon': '' },
    { 'label': 'Plan Feature', 'faIcon': '' },
    { 'label': 'Plan n Master', 'faIcon': '' },
    { 'label': "Customer's Plan", 'faIcon': '' },
    { 'label': 'menu config', 'faIcon': '' },
    { 'label': 'Admin Role Permission', 'faIcon': '' },
    { 'label': 'Organization payment', 'faIcon': '' },
    { 'label': 'Organization payment', 'faIcon': '' },
  ];

  Permissions =
    {
      ParentPermission: '',
      PlanPermission: '',
      PlanNMasterPermission: '',
      CustomerAppsPermission: '',
      MenuConfigPermission: '',
      RoleFeaturePermission: '',
      PaymentPermission: ''
    };

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(private servicework: SwUpdate,
    private cdr: ChangeDetectorRef,
    private route: Router,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private contentservice: ContentService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public ngAfterViewInit(): void {
    debugger
    this.LoginUserDetail = this.tokenStorage.getUserDetail();

    if (this.LoginUserDetail[0]['org'] != 'TTP') {
      this.contentservice.openSnackBar("Access denied", globalconstants.ActionText, globalconstants.RedBackground);
      this.route.navigate(['/dashboard']);
    }
    else {
      this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.GLOBALADMIN)
      if (perObj.length > 0) {
        this.Permissions.ParentPermission = perObj[0].permission;

      }

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.PLAN)
      var comindx = this.components.indexOf(PlansComponent);
      this.GetComponents(perObj, comindx)

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.PLANFEATURE)
      var comindx = this.components.indexOf(PlanFeatureComponent);
      this.GetComponents(perObj, comindx)

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.PLANANDMASTERDATA)
      var comindx = this.components.indexOf(PlanandmasteritemComponent);
      this.GetComponents(perObj, comindx)

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.ADMINROLEFEATURE)
      var comindx = this.components.indexOf(AdminrolepermissionComponent);
      this.GetComponents(perObj, comindx)

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.CUSTOMERPLAN)
      var comindx = this.components.indexOf(CustomerPlansComponent);
      this.GetComponents(perObj, comindx)

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.MENUCONFIG)
      var comindx = this.components.indexOf(MenuConfigComponent);
      this.GetComponents(perObj, comindx)

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.ORGANIZATIONPAYMENT)
      var comindx = this.components.indexOf(OrganizationpaymentComponent);
      this.GetComponents(perObj, comindx)

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.CUSTOMERPLANFEATURE)
      var comindx = this.components.indexOf(CustomerPlanFeatureComponent);
      this.GetComponents(perObj, comindx)

      this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
      setTimeout(() => {
        this.renderComponent(0);
      }, 1000);
      this.cdr.detectChanges();
    }
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
  public tabChange(index: number) {
    //    //console.log("index", index)
    setTimeout(() => {
      this.renderComponent(index);
    }, 1000);

  }
  selectedIndex = 0;


  private renderComponent(index: number): any {
    //
    this.viewContainer.createComponent(this.components[index]);
    //ClassprerequisiteComponent this.componentFactoryResolver.resolveComponentFactory
  }
}

