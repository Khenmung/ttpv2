import { AfterViewInit, ChangeDetectorRef, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AbsentListComponent } from '../absentlist/absentlist.component';
import { AttendancepercentComponent } from '../attendancepercent/attendancepercent.component';
import { AttendanceCountComponent } from '../attendancecount/attendancecount.component';
import { StudentAttendanceComponent } from '../studentattendance/studentattendance.component';
//import { TeacherAttendanceComponent } from '../../EmployeeAttendance/employeeattendance/employeeattendance.component';
import { DefaulterComponent } from '../defaulter/defaulter.component';
import { StudentattendancereportComponent } from '../studentattendancereport/studentattendancereport.component';

@Component({
  selector: 'app-attendanceboard',
  templateUrl: './attendanceboard.component.html',
  styleUrls: ['./attendanceboard.component.scss']
})
export class AttendanceboardComponent implements AfterViewInit {

  components: any = [
    StudentAttendanceComponent,
    StudentattendancereportComponent,
    AttendanceCountComponent,
    AbsentListComponent,
    DefaulterComponent,
    AttendancepercentComponent
  ];
  SelectedAppName = '';
  tabNames = [
    { label: 'Attendance', faIcon: '' },
    { label: 'Attendance', faIcon: '' },
    { label: 'Attendance', faIcon: '' },
    { label: 'Attendance', faIcon: '' },
    { label: 'Attendance', faIcon: '' },
    { label: 'Attendance', faIcon: '' },
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
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.ATTENDANCE)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;

    }

    if (this.SelectedAppName.toLowerCase() == 'education management') {
      
      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.STUDENTATTENDANCE)
      var comindx = this.components.indexOf(StudentAttendanceComponent);
      this.AddRemoveComponent(perObj, comindx);

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.ATTENANCELIST)
      var comindx = this.components.indexOf(AbsentListComponent);
      this.AddRemoveComponent(perObj, comindx);

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.ATTENANCEPERCENT)
      var comindx = this.components.indexOf(AttendancepercentComponent);
      this.AddRemoveComponent(perObj, comindx);

      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.ATTENANCECOUNT)
      var comindx = this.components.indexOf(AttendanceCountComponent);
      this.AddRemoveComponent(perObj, comindx);
      
      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.DEFAULTER)
      var comindx = this.components.indexOf(DefaulterComponent);
      this.AddRemoveComponent(perObj, comindx);
  
      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.ATTENDANCEREPORT)
      var comindx = this.components.indexOf(StudentattendancereportComponent);
      this.AddRemoveComponent(perObj, comindx);

    }
    else if (this.SelectedAppName.toLowerCase() == 'employee management') {
      var comindx = this.components.indexOf(StudentAttendanceComponent);
      if (comindx > -1) {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }
      var comindx = this.components.indexOf(AbsentListComponent);
      if (comindx > -1) {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }
      var comindx = this.components.indexOf(AttendancepercentComponent);
      if (comindx > -1) {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }
      var comindx = this.components.indexOf(AttendanceCountComponent);
      if (comindx > -1) {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }
      var comindx = this.components.indexOf(DefaulterComponent);
      if (comindx > -1) {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }

      // perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.TEACHERATTENDANCE)
      // var comindx = this.components.indexOf(TeacherAttendanceComponent);
      // this.AddRemoveComponent(perObj, comindx);
    }


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
