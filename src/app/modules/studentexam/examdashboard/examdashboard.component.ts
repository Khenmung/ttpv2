import { AfterViewInit, ChangeDetectorRef, Component,  
  ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from '../../../shared/content.service';
import { globalconstants } from '../../../shared/globalconstant';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { ExamsComponent } from '../exams/exams.component';
import { ExamslotComponent } from '../examslot/examslot.component';
import { ExamSubjectMarkEntryComponent } from '../examsubjectmarkentry/examsubjectmarkentry.component';
import { VerifyResultsComponent } from '../verifyresults/verifyresults.component';
import { SlotnclasssubjectComponent } from '../slotnclasssubject/slotnclasssubject.component';
import { StudentgradeComponent } from '../studentgrade/studentgrade.component';
import { VerifyresultstatusComponent } from '../verifyresultstatus/verifyresultstatus.component';
import { ExamncalculateComponent } from '../examncalculate/examncalculate.component';
import {SwUpdate} from '@angular/service-worker';
import { ExammarkconfigComponent } from '../exammarkconfig/exammarkconfig.component';
import { ExamclassgroupComponent } from '../examclassgroup/examclassgroup.component';

@Component({
  selector: 'app-examdashboard',
  templateUrl: './examdashboard.component.html',
  styleUrls: ['./examdashboard.component.scss']
})

export class ExamdashboardComponent implements AfterViewInit {

  components:any = [
    ExamsComponent,
    ExamclassgroupComponent,
    StudentgradeComponent,
    ExammarkconfigComponent,
    ExamncalculateComponent,    
    ExamSubjectMarkEntryComponent,
    VerifyResultsComponent,
    //VerifyresultstatusComponent,
    ExamslotComponent,
    SlotnclasssubjectComponent,
        
  ];

  tabNames = [
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "Exam And Class Group", "faIcon": '' },
    { "label": "Student Grade Formula", "faIcon": '' },
    { "label": "Exam Config", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
   // { "label": "khat peuhpeuh", "faIcon": '' }
  ];
  //tabNames = ["Subject Type","Subject Detail","Subject Mark Component", "Class Student", "Student Subject"];
  Permissions =
    {
      ParentPermission: '',
      DataDownloadPermission: '',
      DataUploadPermission: ''
    };
  LoginUserDetail :any[]= [];
  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(private servicework: SwUpdate,
    private cdr: ChangeDetectorRef,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService
    ) {
  }

  public ngAfterViewInit(): void {
    debugger
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //this.contentservice.GetOrgExpiry(this.LoginUserDetail);
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.EXAM)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;
    }

    this.GenerateComponent(globalconstants.Pages.edu.EXAM.EXAM)
    this.GenerateComponent(globalconstants.Pages.edu.EXAM.EXAMSLOT)
    this.GenerateComponent(globalconstants.Pages.edu.EXAM.ExamMarkEntry)
    this.GenerateComponent(globalconstants.Pages.edu.EXAM.SLOTNCLASSSUBJECT)
    this.GenerateComponent(globalconstants.Pages.edu.EXAM.VERIFYRESULT)
    this.GenerateComponent(globalconstants.Pages.edu.EXAM.STUDENTGRADE)
    //this.GenerateComponent(globalconstants.Pages.edu.EXAM.VERIFYRESULTSTATUS)
    this.GenerateComponent(globalconstants.Pages.edu.EXAM.EXAMNCALCULATE)
    this.GenerateComponent(globalconstants.Pages.edu.EXAM.EXAMMARKCONFIG)
    this.GenerateComponent(globalconstants.Pages.edu.EXAM.EXAMCLASSGROUPMAP)

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
    this.viewContainer.clear();
    this.viewContainer.createComponent(this.components[index]);
  }
  GenerateComponent(featureName) {

    var perObj = globalconstants.getPermission(this.tokenStorage, featureName)
    var comindx = 0;
    switch (featureName) {
      case globalconstants.Pages.edu.EXAM.EXAM:
        comindx = this.components.indexOf(ExamsComponent);
        break;
      case globalconstants.Pages.edu.EXAM.EXAMSLOT:
        comindx = this.components.indexOf(ExamslotComponent);
        break;
      case globalconstants.Pages.edu.EXAM.ExamMarkEntry:
        comindx = this.components.indexOf(ExamSubjectMarkEntryComponent);
        break;
      case globalconstants.Pages.edu.EXAM.SLOTNCLASSSUBJECT:
        comindx = this.components.indexOf(SlotnclasssubjectComponent);
        break;
      case globalconstants.Pages.edu.EXAM.VERIFYRESULT:
        comindx = this.components.indexOf(VerifyResultsComponent);
        break;
      case globalconstants.Pages.edu.EXAM.STUDENTGRADE:
        comindx = this.components.indexOf(StudentgradeComponent);
        break;
      case globalconstants.Pages.edu.EXAM.VERIFYRESULTSTATUS:
        comindx = this.components.indexOf(VerifyresultstatusComponent);
        break;
      case globalconstants.Pages.edu.EXAM.EXAMNCALCULATE:
        comindx = this.components.indexOf(ExamncalculateComponent);
        break;
      case globalconstants.Pages.edu.EXAM.EXAMMARKCONFIG:
        comindx = this.components.indexOf(ExammarkconfigComponent);
        break;
      case globalconstants.Pages.edu.EXAM.EXAMCLASSGROUPMAP:
        comindx = this.components.indexOf(ExamclassgroupComponent);
        break;
      default:
        comindx = this.components.indexOf(ExamsComponent);
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
//   tabNames = [
//     { 'label': 'Exam', 'faIcon': '' },
//     { 'label': 'Exam Slot', 'faIcon': '' },
//     { 'label': 'Exam Result Entry', 'faIcon': '' },
//     { 'label': 'Slot n Class Subject', 'faIcon': '' },
//     { 'label': 'Student Activity', 'faIcon': '' }
//   ];

//   Permissions =
//     {
//       ParentPermission: '',
//       ExamTimeTablePermission: '',
//       ExamResultPermission: '',
//       FeeCollectionPermission: '',
//       DatewisePermission: ''
//     };

//   @ViewChild('container', { read: ViewContainerRef, static: false })
//   public viewContainer: ViewContainerRef;

//   constructor(private servicework: SwUpdate,
//     private cdr: ChangeDetectorRef,
//     private tokenStorage: TokenStorageService,
//     private shareddata: SharedataService,
//     private componentFactoryResolver: ComponentFactoryResolver) {
//   }

//   public ngAfterViewInit(): void {
//     debugger;
//     var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.EXAM)
//     if (perObj.length > 0) {
//       this.Permissions.ParentPermission = perObj[0].permission;

//     }

//     perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.EXAM)
//     var comindx = this.components.indexOf(ExamsComponent);
//     if (perObj.length > 0) {
//       if (perObj[0].permission == 'deny') {
//         this.components.splice(comindx, 1);
//         this.tabNames.splice(comindx, 1);
//       }
//       else {
//         this.tabNames[comindx].faIcon = perObj[0].faIcon;
//         this.tabNames[comindx].label = perObj[0].label;
//       }
//     }
//     else {
//       this.components.splice(comindx, 1);
//       this.tabNames.splice(comindx, 1);
//     }

//     perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.EXAMSLOT)
//     var comindx = this.components.indexOf(ExamslotComponent);
//     if (perObj.length > 0) {
//       if (perObj[0].permission == 'deny') {
//         this.components.splice(comindx, 1);
//         this.tabNames.splice(comindx, 1);
//       }
//       else {
//         this.tabNames[comindx].faIcon = perObj[0].faIcon;
//         this.tabNames[comindx].label = perObj[0].label;
//       }
//     }
//     else {
//       this.components.splice(comindx, 1);
//       this.tabNames.splice(comindx, 1);
//     }

//     perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.SLOTNCLASSSUBJECT)
//     var comindx = this.components.indexOf(SlotnclasssubjectComponent);
//     if (perObj.length > 0) {
//       if (perObj[0].permission == 'deny') {
//         this.components.splice(comindx, 1);
//         this.tabNames.splice(comindx, 1);
//       }
//       else {
//         this.tabNames[comindx].faIcon = perObj[0].faIcon;
//         this.tabNames[comindx].label = perObj[0].label;
//       }
//     }
//     else {
//       this.components.splice(comindx, 1);
//       this.tabNames.splice(comindx, 1);
//     }
//     perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.EXAMSTUDENTSUBJECTRESULT)
//     var comindx = this.components.indexOf(ExamstudentsubjectresultComponent);
//     if (perObj.length > 0) {
//       if (perObj[0].permission == 'deny') {
//         this.components.splice(comindx, 1);
//         this.tabNames.splice(comindx, 1);
//       }
//       else {
//         this.tabNames[comindx].faIcon = perObj[0].faIcon;
//         this.tabNames[comindx].label = perObj[0].label;
//       }
//     }
//     else {
//       this.components.splice(comindx, 1);
//       this.tabNames.splice(comindx, 1);
//     }

//     perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.STUDENTACTIVITY)
//     var comindx = this.components.indexOf(StudentactivityComponent);
//     if (perObj.length > 0) {
//       if (perObj[0].permission == 'deny') {
//         this.components.splice(comindx, 1);
//         this.tabNames.splice(comindx, 1);
//       }
//       else {
//         this.tabNames[comindx].faIcon = perObj[0].faIcon;
//         this.tabNames[comindx].label = perObj[0].label;
//       }
//     }
//     else {
//       this.components.splice(comindx, 1);
//       this.tabNames.splice(comindx, 1);
//     }
//     this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);

//     if (this.Permissions.ParentPermission != 'deny') {
//       this.renderComponent(0);
//       this.cdr.detectChanges();
//     }
//   }

//   public tabChange(index: number) {
//     //    //console.log("index", index)
//     setTimeout(() => {
//       this.renderComponent(index);
//     }, 1000);

//   }
//   selectedIndex = 0;


//   private renderComponent(index: number): any {
//     
//     this.viewContainer.createComponent(this.components[index]);
//     //ClassprerequisiteComponent this.componentFactoryResolver.resolveComponentFactory
//   }
// }
