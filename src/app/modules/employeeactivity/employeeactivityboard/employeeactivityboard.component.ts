import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { EmployeeactivityComponent } from '../employeeactivity/employeeactivity.component';

@Component({
  selector: 'app-employeeactivityboard',
  templateUrl: './employeeactivityboard.component.html',
  styleUrls: ['./employeeactivityboard.component.scss']
})
export class EmployeeactivityboardComponent implements AfterViewInit {
  components:any = [
    EmployeeactivityComponent
  ];

  tabNames = [
    { "label": "khat peuhpeuh", "faIcon": '' },
  ];
  //tabNames = ["Subject Type","Subject Detail","Subject Mark Component", "Class Student", "Student Subject"];
  Permissions =
    {
      ParentPermission: '',
      DataDownloadPermission: '',
      DataUploadPermission: ''
    };
  StudentName = '';
  LoginUserDetail = [];
  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(private servicework: SwUpdate,
    private cdr: ChangeDetectorRef,
    private nav: Router,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService) {
  }

  public ngAfterViewInit(): void {
    debugger
    this.shareddata.CurrentStudentName.subscribe(s => (this.StudentName = s));
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employeeactivity.EMPLOYEEACTIVITY)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;
    }

    this.GenerateComponent(globalconstants.Pages.emp.employeeactivity.EMPLOYEEACTIVITY)

    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
    if (this.Permissions.ParentPermission != 'deny') {
      setTimeout(() => {
        this.renderComponent(0);
      }, 1000);
      this.cdr.detectChanges();
    }
  }

  public tabChange(index: number) {
    setTimeout(() => {
      this.renderComponent(index);
    }, 750);

  }
  selectedIndex = 0;


  private renderComponent(index: number): any {
    
    this.viewContainer.createComponent(this.components[index]);
  }
  GenerateComponent(featureName) {

    var perObj = globalconstants.getPermission(this.tokenStorage, featureName)
    var comindx = 0;
    switch (featureName) {
      case globalconstants.Pages.emp.employeeactivity.EMPLOYEEACTIVITY:
        comindx = this.components.indexOf(EmployeeactivityComponent);
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
  back() {
    this.nav.navigate(['/edu'])
  }
}