import { AfterViewInit, ChangeDetectorRef, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { GenerateCertificateComponent } from '../generatecertificate/generatecertificate.component';
import { StudentActivityComponent } from '../StudentActivity/studentactivity.component';
import { StudentfamilynfriendComponent } from '../studentfamilynfriend/studentfamilynfriend.component';
import { StudentDocumentComponent } from '../uploadstudentdocument/uploadstudentdoc.component';
import {SwUpdate} from '@angular/service-worker';
import { GroupactivityComponent } from '../groupactivity/groupactivity.component';
import { GroupactivityparticipantComponent } from '../groupactivityparticipant/groupactivityparticipant.component';
import { AchievementandpointComponent } from '../achievementandpoint/achievementandpoint.component';
import { GrouppointComponent } from '../grouppoint/grouppoint.component';
import { CertificateconfigComponent } from '../certificateconfig/certificateconfig.component';
@Component({
  selector: 'app-studentactivityboard',
  templateUrl: './studentactivityboard.component.html',
  styleUrls: ['./studentactivityboard.component.scss']
})
export class StudentactivityboardComponent implements AfterViewInit {
  components:any = [
    GenerateCertificateComponent,
    CertificateconfigComponent,
    StudentDocumentComponent,
    StudentActivityComponent,
    StudentfamilynfriendComponent,
    GroupactivityComponent,
    GroupactivityparticipantComponent,
    AchievementandpointComponent,
    GrouppointComponent
  ];

  tabNames = [
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' }
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
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.STUDENT)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;
    }

    this.GenerateComponent(globalconstants.Pages.edu.SPECIALFEATURE.GENERATECERTIFICATE)
    this.GenerateComponent(globalconstants.Pages.edu.SPECIALFEATURE.DOCUMENT)
    this.GenerateComponent(globalconstants.Pages.edu.SPECIALFEATURE.ACTIVITY)
    this.GenerateComponent(globalconstants.Pages.edu.SPECIALFEATURE.SIBLINGSNFRIENDS)
    this.GenerateComponent(globalconstants.Pages.edu.SPECIALFEATURE.STUDENTGROUP)
    this.GenerateComponent(globalconstants.Pages.edu.SPECIALFEATURE.GROUPPARTICIPANT)
    this.GenerateComponent(globalconstants.Pages.edu.SPECIALFEATURE.ACHIEVEMENTNPOINT)
    this.GenerateComponent(globalconstants.Pages.edu.SPECIALFEATURE.GROUPPOINT)
    this.GenerateComponent(globalconstants.Pages.edu.SPECIALFEATURE.CERTIFICATECONFIG)

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
      case globalconstants.Pages.edu.SPECIALFEATURE.GENERATECERTIFICATE:
        comindx = this.components.indexOf(GenerateCertificateComponent);
        break;
      case globalconstants.Pages.edu.SPECIALFEATURE.DOCUMENT:
        comindx = this.components.indexOf(StudentDocumentComponent);
        break;      
      case globalconstants.Pages.edu.SPECIALFEATURE.ACTIVITY:
        comindx = this.components.indexOf(StudentActivityComponent);
        break;
      case globalconstants.Pages.edu.SPECIALFEATURE.SIBLINGSNFRIENDS:
        comindx = this.components.indexOf(StudentfamilynfriendComponent);
        break;
      case globalconstants.Pages.edu.SPECIALFEATURE.STUDENTGROUP:
        comindx = this.components.indexOf(GroupactivityComponent);
        break;
      case globalconstants.Pages.edu.SPECIALFEATURE.GROUPPARTICIPANT:
        comindx = this.components.indexOf(GroupactivityparticipantComponent);
        break;
      case globalconstants.Pages.edu.SPECIALFEATURE.ACHIEVEMENTNPOINT:
        comindx = this.components.indexOf(AchievementandpointComponent);
        break;
      case globalconstants.Pages.edu.SPECIALFEATURE.GROUPPOINT:
        comindx = this.components.indexOf(GrouppointComponent);
        break;
      case globalconstants.Pages.edu.SPECIALFEATURE.CERTIFICATECONFIG:
        comindx = this.components.indexOf(CertificateconfigComponent);
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