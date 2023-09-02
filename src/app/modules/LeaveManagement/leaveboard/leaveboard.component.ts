import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { LeaveBalanceComponent } from '../LeaveBalance/leavebalance.component';
import { EmployeeLeaveComponent } from '../employee-leave/employee-leave.component';
import { LeavepolicyComponent } from '../leavepolicy/leavepolicy.component';
import { SwUpdate } from '@angular/service-worker';
import { ContentService } from '../../../shared/content.service';
import { globalconstants } from '../../../shared/globalconstant';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { LeavehomeComponent } from '../leavehome/leavehome.component';

@Component({
  selector: 'app-leaveboard',
  templateUrl: './leaveboard.component.html',
  styleUrls: ['./leaveboard.component.scss']
})
export class LeaveboardComponent implements AfterViewInit { 
  PageLoading = true;
  components: any = [
    LeavehomeComponent,
    EmployeeLeaveComponent,
    LeavepolicyComponent,
    LeaveBalanceComponent,
  ];

  tabNames = [
    { 'label': '1Exam Time Table', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Fee Payment Status', 'faIcon': '' },
    { 'label': '1Fee Payment Status', 'faIcon': '' }
  ];

  Permissions =
    {
      ParentPermission: '',
      ExamTimeTablePermission: '',
      ExamResultPermission: '',
    };
  LoginUserDetail :any[]= [];
  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;
  constructor(private servicework: SwUpdate,
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private contentservice: ContentService,
  ) {
  }

  public ngAfterViewInit(): void {

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employeeleave.EMPLOYEELEAVE)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;

    }

    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employeeleave.LEAVEHOME)
    var comindx = this.components.indexOf(LeavehomeComponent);
    this.AddRemoveComponent(perObj, comindx);
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employeeleave.LEAVEPOLICY)
    var comindx = this.components.indexOf(LeavepolicyComponent);
    this.AddRemoveComponent(perObj, comindx);
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employeeleave.LEAVEBALANCE)
    var comindx = this.components.indexOf(LeaveBalanceComponent);
    this.AddRemoveComponent(perObj, comindx);
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employeeleave.EMPLOYEELEAVE)
    var comindx = this.components.indexOf(EmployeeLeaveComponent);
    this.AddRemoveComponent(perObj, comindx);
    
    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
    //console.log('this.Permissions.ParentPermission', this.Permissions.ParentPermission);
    if (this.Permissions.ParentPermission != 'deny') {
      setTimeout(() => {
        this.renderComponent(0);
      }, 1000);
      this.cdr.detectChanges();
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
    const component = this.viewContainer.createComponent(this.components[index]);

    //ClassprerequisiteComponent this.componentFactoryResolver.resolveComponentFactory
  }
  AddRemoveComponent(perObj, comindx) {
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

