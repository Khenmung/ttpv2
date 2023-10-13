import { AfterViewInit, ChangeDetectorRef, Component,  ViewChild, ViewContainerRef } from '@angular/core';
import { ClassSubjectDetailComponent } from '../classsubjectdetail/classsubjectdetail.component';
import { StudentSubjectMarkCompComponent } from '../student-subject-mark-comp/student-subject-mark-comp.component';
import { studentsubjectdashboardComponent } from '../studentsubjectdashboard/studentsubjectdashboard.component';
import { SubjectTypesComponent } from '../subject-types/subject-types.component';
import { globalconstants } from '../../../shared/globalconstant';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { ContentService } from '../../../shared/content.service';
import { StudentSubjectReportComponent } from '../studentsubjectreport/studentsubjectreport.component';
import { SubjectcomponentComponent } from '../subjectcomponent/subjectcomponent.component';


@Component({
  selector: 'app-subjectboard',
  templateUrl: './subjectboard.component.html',
  styleUrls: ['./subjectboard.component.scss']
})
export class SubjectBoardComponent implements AfterViewInit {

  components:any = [
    SubjectTypesComponent,
    ClassSubjectDetailComponent,
    SubjectcomponentComponent,
    StudentSubjectMarkCompComponent,
    studentsubjectdashboardComponent,
    StudentSubjectReportComponent,
    
  ];

  tabNames = [
    { "label": "Subject Type", "faIcon": '' },
    { "label": "Subject Detail", "faIcon": '' },
    { "label": "Exam Subject Component", "faIcon": '' },
    { "label": "Student Subject", "faIcon": '' },
    { "label": "example", "faIcon": '' },
    { "label": "example", "faIcon": '' },
  ];
  Permissions =
    {
      ParentPermission: '',
      SubjectTypePermission: '',
      SubjectDetailPermission: '',
      SubjectMarkComponentPermission: '',
      ClassStudentPermission: '',
      StudentSubjectPermission: '',
      SubjectComponent: ''
    };

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    ) {
  }

  public ngAfterViewInit(): void {

    debugger;
    var LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(LoginUserDetail);

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.SUBJECT)
    if (perObj.length > 0)
      this.Permissions.ParentPermission = perObj[0].permission;

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.SUBJECTTYPE)
    var comindx = this.components.indexOf(SubjectTypesComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.CLASSSUBJECTDETAIL)
    comindx = this.components.indexOf(ClassSubjectDetailComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.SUBJECTMARKCOMPONENT)
    comindx = this.components.indexOf(StudentSubjectMarkCompComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.STUDENTSUBJECT)
    comindx = this.components.indexOf(studentsubjectdashboardComponent);
    this.GetComponents(perObj, comindx)
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.STUDENTSUBJECTREPORT)
    comindx = this.components.indexOf(StudentSubjectReportComponent);
    this.GetComponents(perObj, comindx)
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.SUBJECTCOMPONENT)
    comindx = this.components.indexOf(SubjectcomponentComponent);
    this.GetComponents(perObj, comindx)
    

    


    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);

    if (this.Permissions.ParentPermission != 'deny') {
      setTimeout(() => {
        this.renderComponent(0);
      }, 1000);
      this.cdr.detectChanges();
    }
  }

  public tabChange(index: number) {
    //    ////console.log("index", index)
    setTimeout(() => {
      this.renderComponent(index);
    }, 1000);

  }
  selectedIndex = 0;


  private renderComponent(index: number): any {
    
    this.viewContainer.createComponent(this.components[index]);
    //ClassprerequisiteComponent this.componentFactoryResolver.resolveComponentFactory
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
}

// OnInit { PageLoading=true;
//   @ViewChild(SubjectTypesComponent) subjecttypes: SubjectTypesComponent;
//   @ViewChild(StudentSubjectMarkCompComponent) subjectmarkComponent: StudentSubjectMarkCompComponent;
//   @ViewChild(SubjectDetailComponent) subjectdetail: SubjectDetailComponent;
//   @ViewChild(studentsubjectdashboardComponent) studentsubject: studentsubjectdashboardComponent;
//   @ViewChild(AssignStudentclassdashboardComponent) studentclass: AssignStudentclassdashboardComponent;
//   @ViewChild(ClassperiodComponent) Classperiod: ClassperiodComponent;
//   selectedIndex = 0;
//   constructor(private servicework: SwUpdate,) { }

//   ngOnInit(): void {
    
//     setTimeout(() => {
//       this.navigateTab(0)  
//     }, 100);

//   }
//   tabChanged(tabChangeEvent: number) {
//     this.selectedIndex = tabChangeEvent;
//     this.navigateTab(this.selectedIndex);
//     //   ////console.log('tab selected: ' + tabChangeEvent);
//   }
//   public nextStep() {
//     this.selectedIndex += 1;
//     this.navigateTab(this.selectedIndex);
//   }

//   public previousStep() {
//     this.selectedIndex -= 1;
//     this.navigateTab(this.selectedIndex);
//   }
//   navigateTab(indx) {
//     //debugger;
//     switch (indx) {
//       case 0:
//         this.subjecttypes.PageLoad();
//         break;
//       case 1:
//         this.subjectdetail.PageLoad();
//         break;
//       case 2:
//         this.subjectmarkComponent.PageLoad();
//         break;
//       case 3:
//         this.studentclass.PageLoad();
//         break;
//       case 4:
//         this.studentsubject.PageLoad();
//         break;
//       case 5:
//         this.Classperiod.PageLoad();
//         break;
//       default:
//         this.subjecttypes.PageLoad();
//         break;
//     }
//   }
// }
