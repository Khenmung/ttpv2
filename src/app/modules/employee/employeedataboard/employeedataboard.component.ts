import { ChangeDetectorRef, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { ContentService } from '../../../shared/content.service';
import { globalconstants } from '../../../shared/globalconstant';
import { SharedataService } from '../../../shared/sharedata.service';
import { UploademployeeComponent } from '../uploademployee/uploademployee.component';
import { DownloademployeeComponent } from '../downloademployee/downloademployee.component';

@Component({
  selector: 'app-employeedataboard',
  templateUrl: './employeedataboard.component.html',
  styleUrls: ['./employeedataboard.component.scss']
})
export class EmployeedataBoardComponent {

  components:any = [   
    UploademployeeComponent,
    DownloademployeeComponent  
  ];

  tabNames = [
    { "label": "Subject Type", "faIcon": '' },
    { "label": "Subject Detail", "faIcon": '' },  
  ];
  Permissions =
    {
      EmployeeDataBoard: '',
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

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.Admission.DOWNLOAD)
    let comindx = this.components.indexOf(DownloademployeeComponent);
    this.GetComponents(perObj, comindx)
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.Admission.UPLOAD);
    comindx = this.components.indexOf(UploademployeeComponent);
    this.GetComponents(perObj, comindx)

    if (this.Permissions.EmployeeDataBoard != 'deny') {
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