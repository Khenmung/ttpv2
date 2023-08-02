import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { EmpComponentsComponent } from '../emp-components/emp-components.component';
import { EmployeeSalaryComponentComponent } from '../employee-salary-component/employee-salary-component.component';
import { employeesalaryComponents } from '../employee-salary-routing.module';
import { SalaryslipComponent } from '../salaryslip/salaryslip.component';
import { VariableConfigComponent } from '../variable-config/variable-config.component';

@Component({
  selector: 'app-empmanagementboard',
  templateUrl: './empmanagementboard.component.html',
  styleUrls: ['./empmanagementboard.component.scss']
})
export class EmpmanagementboardComponent implements AfterViewInit {
  PageLoading = true;
  components: any = [
    VariableConfigComponent,
    EmpComponentsComponent,
    EmployeeSalaryComponentComponent,
    SalaryslipComponent
  ];

  tabNames = [
    { 'label': '1Exam Time Table', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Fee Payment Status', 'faIcon': '' },
    { 'label': '1Fee Payment Status', 'faIcon': '' },
  ];

  Permissions =
    {
      ParentPermission: '',
      ExamTimeTablePermission: '',
      ExamResultPermission: '',
    };
  LoginUserDetail = [];
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

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.EMPLOYEE)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;

    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.VARIABLECONFIG)
    var comindx = this.components.indexOf(VariableConfigComponent);
    this.AddRemoveComponent(perObj, comindx);
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.SALARYCOMPONENTS)
    var comindx = this.components.indexOf(EmpComponentsComponent);
    this.AddRemoveComponent(perObj, comindx);
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.EMPSALARYCOMPONENTS)
    var comindx = this.components.indexOf(EmployeeSalaryComponentComponent);
    this.AddRemoveComponent(perObj, comindx);
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.SALARYSLIP)
    var comindx = this.components.indexOf(SalaryslipComponent);
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


