import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { EmployeeAttendanceComponent } from '../employeeattendance/employeeattendance.component';
import { EmployeeAttendanceReportComponent } from '../employeeattendancereport/employeeattendancereport.component';
//import { EmployeeAttendanceComponent } from '../../employeeattendance/employeeattendance.component';

@Component({
  selector: 'app-employeeattendanceboard',
  templateUrl: './employeeattendanceboard.component.html',
  styleUrls: ['./employeeattendanceboard.component.scss']
})
export class EmployeeattendanceboardComponent implements AfterViewInit {
  components: any = [
    EmployeeAttendanceComponent,
    EmployeeAttendanceReportComponent
  ];
  SelectedAppName = '';
  tabNames = [
    { label: 'Attendance', faIcon: '' },
    { label: 'Attendance', faIcon: '' },
    // { label: 'Attendance', faIcon: '' },
    // { label: 'Attendance', faIcon: '' },
    // { label: 'Attendance', faIcon: '' },
    //  { label: 'Attendance', faIcon: '' },
  ];

  Permissions =
    {
      ParentPermission: '',
      StudentAttendancePermission: '',
      TeacherAttendancePermission: ''
    };
  selectedIndex = 0;

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;
  LoginUserDetail = [];
  constructor(
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private contentservice: ContentService,
  ) {
  }

  public ngAfterViewInit(): void {
    debugger;
    this.SelectedAppName = this.tokenStorage.getSelectedAppName();
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    //console.log("this.SelectedAppName",this.SelectedAppName);
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employeeattendance.EMPLOYEEATTENDANCE)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;

    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employeeattendance.ATTENDANCEREPORT)
    var comindx = this.components.indexOf(EmployeeAttendanceReportComponent);
    this.AddRemoveComponent(perObj,comindx);
    // var comindx = this.components.indexOf(AttendancepercentComponent);
    // if (comindx > -1) {
    //   this.components.splice(comindx, 1);
    //   this.tabNames.splice(comindx, 1);
    // }
    // var comindx = this.components.indexOf(AttendanceCountComponent);
    // if (comindx > -1) {
    //   this.components.splice(comindx, 1);
    //   this.tabNames.splice(comindx, 1);
    // }
    // var comindx = this.components.indexOf(DefaulterComponent);
    // if (comindx > -1) {
    //   this.components.splice(comindx, 1);
    //   this.tabNames.splice(comindx, 1);
    // }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employeeattendance.EMPLOYEEATTENDANCE)
    var comindx = this.components.indexOf(EmployeeAttendanceComponent);
    this.AddRemoveComponent(perObj, comindx);



    if (this.Permissions.ParentPermission != 'deny') {
      setTimeout(() => {
        this.renderComponent(0);
      }, 1000);
      //this.cdr.detectChanges();
    }

  }

  public tabChange(index: number) {
    setTimeout(() => {
      this.renderComponent(index);
    }, 1000);

  }

  AddRemoveComponent(perObj, pcomindx) {

    if (perObj.length > 0) {
      if (perObj[0].permission == 'deny') {
        this.components.splice(pcomindx, 1);
        this.tabNames.splice(pcomindx, 1);
      }
      else {
        this.tabNames[pcomindx].faIcon = perObj[0].faIcon;
        this.tabNames[pcomindx].label = perObj[0].label;
      }
    }
    else {
      this.components.splice(pcomindx, 1);
      this.tabNames.splice(pcomindx, 1);
    }

  }

  private renderComponent(index: number): any {

    this.viewContainer.createComponent(this.components[index]);
  }
}

