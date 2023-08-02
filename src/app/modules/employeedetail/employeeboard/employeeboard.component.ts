import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { EducationhistoryComponent } from '../educationhistory/educationhistory.component';
import { EmployeeComponent } from '../employee/employee.component';
import { EmployeeactivityComponent } from '../../employeeactivity/employeeactivity/employeeactivity.component';
import { EmployeedocumentsComponent } from '../employeedocuments/employeedocuments.component';
import { EmployeeskillComponent } from '../employeeskill/employeeskill.component';
import { FamilyComponent } from '../family/family.component';
import { GradehistoryComponent } from '../gradehistory/gradehistory.component';
import { WorkhistoryComponent } from '../workhistory/workhistory.component';

@Component({
  selector: 'app-employeeboard',
  templateUrl: './employeeboard.component.html',
  styleUrls: ['./employeeboard.component.scss']
})
export class EmployeeboardComponent implements AfterViewInit {
  components:any = [
    EmployeeComponent,
    EmployeedocumentsComponent,
    FamilyComponent,
    EducationhistoryComponent,
    WorkhistoryComponent,
    EmployeeskillComponent,
    GradehistoryComponent,
    EmployeeactivityComponent
  ];

  tabNames = [
    { "label": "Employee", "faIcon": '' },
    { "label": "Document", "faIcon": '' },
    { "label": "Family", "faIcon": '' },
    { "label": "Education History", "faIcon": '' },
    { "label": "Work History", "faIcon": '' },
    { "label": "Employee Skill", "faIcon": '' },
    { "label": "Employement History", "faIcon": '' },
    { "label": "Employement Activity", "faIcon": '' }
  ];
  EmployeeName = '';
  Permissions =
    {
      ParentPermission: '',
      DataDownloadPermission: '',
      DataUploadPermission: ''
    };
  LoginUserDetail = [];
  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private nav: Router,
    private cdr: ChangeDetectorRef,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    ) {
  }

  public ngAfterViewInit(): void {
    debugger
    this.shareddata.CurrentEmployeeName.subscribe(s => (this.EmployeeName = s));
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.EMPLOYEE)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;
    }

    this.GenerateComponent(globalconstants.Pages.emp.employee.EMPLOYEEDETAIL)
    this.GenerateComponent(globalconstants.Pages.emp.employee.EDUCATIONHISTORY)
    this.GenerateComponent(globalconstants.Pages.emp.employee.FAMILY)
    this.GenerateComponent(globalconstants.Pages.emp.employee.WORKHISTORY)
    this.GenerateComponent(globalconstants.Pages.emp.employee.DOCUMENT)
    this.GenerateComponent(globalconstants.Pages.emp.employee.EMPLOYEESKILL)
    this.GenerateComponent(globalconstants.Pages.emp.employee.EMPLOYMENTHISTORY)
    this.GenerateComponent(globalconstants.Pages.emp.employee.EMPLOYEEPROFILE)

    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
    if (this.Permissions.ParentPermission != 'deny') {
      setTimeout(() => {
        this.renderComponent(0);
      }, 1000);
      this.cdr.detectChanges();
    }
  }
  back() {
    this.nav.navigate(["/employee"]);
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
  GenerateComponent(featureName) {

    var perObj = globalconstants.getPermission(this.tokenStorage, featureName)
    var comindx = -1;
    switch (featureName) {
      case globalconstants.Pages.emp.employee.EMPLOYEEDETAIL:
        comindx = this.components.indexOf(EmployeeComponent);
        break;
      case globalconstants.Pages.emp.employee.DOCUMENT:
        comindx = this.components.indexOf(EmployeedocumentsComponent);
        break;
      case globalconstants.Pages.emp.employee.FAMILY:
        comindx = this.components.indexOf(FamilyComponent);
        break;
      case globalconstants.Pages.emp.employee.EMPLOYEESKILL:
        comindx = this.components.indexOf(EmployeeskillComponent);
        break;
      case globalconstants.Pages.emp.employee.EDUCATIONHISTORY:
        comindx = this.components.indexOf(EducationhistoryComponent);
        break;
      case globalconstants.Pages.emp.employee.WORKHISTORY:
        comindx = this.components.indexOf(WorkhistoryComponent);
        break;
      case globalconstants.Pages.emp.employee.EMPLOYMENTHISTORY:
        comindx = this.components.indexOf(GradehistoryComponent);
        break;
      case globalconstants.Pages.emp.employee.EMPLOYEEPROFILE:
        comindx = this.components.indexOf(EmployeeactivityComponent);
        break;
      default:
        comindx = -1;
        break;
    }

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
