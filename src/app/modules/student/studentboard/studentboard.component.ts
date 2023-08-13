import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from '../../../shared/content.service';
import { globalconstants } from '../../../shared/globalconstant';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { AddstudentclassComponent } from '../addstudentclass/addstudentclass.component';
import { StudentattendancereportComponent } from '../studentattendancereport/studentattendancereport.component';
import { studentprimaryinfoComponent } from '../studentprimaryinfo/studentprimaryinfo.component';
import { StudentprogressreportComponent } from '../studentprogressreport/studentprogressreport.component';
import { Router } from '@angular/router';
import { StudentviewComponent } from '../studentview/studentview.component';
import { SidenavService } from '../../../shared/sidenav.service';
import { ConnectionService } from 'ng-connection-service';

@Component({
  selector: 'app-studentboard',
  templateUrl: './studentboard.component.html',
  styleUrls: ['./studentboard.component.scss']
})
export class StudentboardComponent implements AfterViewInit {
  

  components:any = [
    studentprimaryinfoComponent,
    AddstudentclassComponent,
    StudentattendancereportComponent,
    //StudentprogressreportComponent,
    StudentviewComponent
  ];

  tabNames = [
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
  ];
  //tabNames = ["Subject Type","Subject Detail","Subject Mark Component", "Class Student", "Student Subject"];
  Permissions =
    {
      ParentPermission: '',
      DataDownloadPermission: '',
      DataUploadPermission: ''
    };
  StudentId = 0;
  StudentName = '';
  LoginUserDetail :any[]= [];
  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;
  isConnected:boolean = true;
  noInternetConnection: boolean;
  constructor(
    private sidenav: SidenavService,
    private cdr: ChangeDetectorRef,
    private nav: Router,
    private contentservice: ContentService,
    private connectionService: ConnectionService,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService) {
   
    this.connectionService.monitor().subscribe(isConnected => {
      debugger;
      this.isConnected = isConnected.hasInternetAccess;
      if (this.isConnected) {
        this.contentservice.openSnackBar("No internet connection.",globalconstants.ActionText,globalconstants.RedBackground);
        //this.noInternetConnection = false;
      }
      else {
        this.noInternetConnection = true;
       
      }
    })
    this.StudentId = tokenStorage.getStudentId()!;
  }
  toggleRightSidenav() {
    //console.log("this.sidenav",this.sidenav.)
    this.sidenav.toggle();
   
 }
 FeePaymentPermission='';
  public ngAfterViewInit(): void {
    debugger
    this.shareddata.CurrentStudentName.subscribe(s => (this.StudentName = s));
    //console.log("StudentName",this.StudentName);
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.STUDENT)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;
    }
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.FEEPAYMENT);
      if (perObj.length > 0) {
        this.FeePaymentPermission = perObj[0].permission;
      }
    this.GenerateComponent(globalconstants.Pages.edu.STUDENT.STUDENTDETAIL)
    this.GenerateComponent(globalconstants.Pages.edu.STUDENT.STUDENTCLASS)
    this.GenerateComponent(globalconstants.Pages.edu.STUDENT.ATTENDANCEREPORT)
    //this.GenerateComponent(globalconstants.Pages.edu.STUDENT.PROGRESSREPORT)
    this.GenerateComponent(globalconstants.Pages.edu.STUDENT.STUDENTVIEW)

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
    }, 1000);

  }
  selectedIndex = 0;


  private renderComponent(index: number): any {
    //
    this.viewContainer.createComponent(this.components[index]);
  }
  GenerateComponent(featureName) {

    var perObj = globalconstants.getPermission(this.tokenStorage, featureName)
    var comindx = 0;
    switch (featureName) {
      case globalconstants.Pages.edu.STUDENT.STUDENTDETAIL:
        comindx = this.components.indexOf(studentprimaryinfoComponent);
        break;
      case globalconstants.Pages.edu.STUDENT.STUDENTCLASS:
        comindx = this.components.indexOf(AddstudentclassComponent);
        break;
      case globalconstants.Pages.edu.STUDENT.ATTENDANCEREPORT:
        comindx = this.components.indexOf(StudentattendancereportComponent);
        break;
      case globalconstants.Pages.edu.STUDENT.PROGRESSREPORT:
        comindx = this.components.indexOf(StudentprogressreportComponent);
        break;
      case globalconstants.Pages.edu.STUDENT.STUDENTVIEW:
        comindx = this.components.indexOf(StudentviewComponent);
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
  fee() {
    this.nav.navigate(['/edu/feepayment'])
    //http://localhost:4200/#/edu/addstudent/1044
  }
  
  back() {
    this.nav.navigate(['/edu']);
  }
}
