import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AddMasterDataComponent } from '../../control/add-master-data/add-master-data.component';
//import { CustomerinvoiceComponent } from '../customerinvoice/customerinvoice.component';
import { CustomerinvoicecomponentsComponent } from '../customerinvoicecomponents/customerinvoicecomponents.component';
import { ReportConfigItemComponent } from '../reportconfigitem/reportconfigitem.component';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-invoiceboard',
  templateUrl: './invoiceboard.component.html',
  styleUrls: ['./invoiceboard.component.scss']
})
export class InvoiceboardComponent implements AfterViewInit {

  components:any = [
    ReportConfigItemComponent,
  //  CustomerinvoiceComponent,
    CustomerinvoicecomponentsComponent,
    AddMasterDataComponent
  ];
  LoginUserDetail=[];
  tabNames = [
    { 'label': 'Plan', 'faIcon': '' },
    { 'label': 'Plan Feature', 'faIcon': '' },
    { 'label': "Customer's Plan", 'faIcon': '' },
    { 'label': 'menu config', 'faIcon': '' },
  ];

  Permissions =
    {
      ParentPermission: '',
      PlanPermission: '',
      CustomerAppsPermission: '',
      MenuConfigPermission: '',
    };

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(private servicework: SwUpdate,
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
    
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.GLOBALADMIN)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;

    }

    // perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.CUSTOMERINVOICE)
    // var comindx = this.components.indexOf(CustomerinvoiceComponent);
    // this.GetComponents(perObj,comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.CUSTOMERINVOICECOMPONENT)
    var comindx = this.components.indexOf(CustomerinvoicecomponentsComponent);
    this.GetComponents(perObj,comindx)
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.MASTERDATA)
    var comindx = this.components.indexOf(AddMasterDataComponent);
    this.GetComponents(perObj,comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.REPORTCONIG)
    var comindx = this.components.indexOf(ReportConfigItemComponent);
    this.GetComponents(perObj,comindx)

    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
    //if(1){ //(this.Permissions.ParentPermission != 'deny') {
      this.renderComponent(0);
      this.cdr.detectChanges();
    //}
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
    
    this.viewContainer.createComponent(this.components[index]);
    //ClassprerequisiteComponent this.componentFactoryResolver.resolveComponentFactory
  }
}


