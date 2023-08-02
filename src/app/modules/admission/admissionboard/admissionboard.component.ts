import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AssignStudentclassdashboardComponent } from '../AssignStudentClass/Assignstudentclassdashboard.component';
import { PromoteclassComponent } from '../promoteclass/promoteclass.component';

@Component({
  selector: 'app-admissionboard',
  templateUrl: './admissionboard.component.html',
  styleUrls: ['./admissionboard.component.scss']
})
export class AdmissionboardComponent implements AfterViewInit {

  components:any = [
    PromoteclassComponent,
    AssignStudentclassdashboardComponent
  
  ];

  tabNames = [
    { "label": "Subject Type", "faIcon": '' },
    { "label": "Subject Detail", "faIcon": '' }   
  ];
  Permissions =
    {
      AdmissionPermission: '',
      AssignStudentClass: ''
    };

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService
    ) {
  }

  public ngAfterViewInit(): void {

    debugger;
    var LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(LoginUserDetail);

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.Admission.ADMISSION);
    if (perObj.length > 0)
      this.Permissions.AdmissionPermission = perObj[0].permission;

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.Admission.AssignClass)
    var comindx = this.components.indexOf(AssignStudentclassdashboardComponent);
    this.GetComponents(perObj, comindx)    
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.Admission.PROMOTESTUDENT)
    comindx = this.components.indexOf(PromoteclassComponent);
    this.GetComponents(perObj, comindx)

    this.shareddata.ChangePermissionAtParent(this.Permissions.AdmissionPermission);

    if (this.Permissions.AdmissionPermission != 'deny') {
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

