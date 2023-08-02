import { AfterViewInit, ChangeDetectorRef, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { StudentDatadumpComponent } from '../studentdatadump/studentdatadump.component';
import { ExcelDataManagementComponent } from '../excel-data-management/excel-data-management.component';

@Component({
  selector: 'app-generalreportboard',
  templateUrl: './generalreportboard.component.html',
  styleUrls: ['./generalreportboard.component.scss']
})
export class GeneralReportboardComponent implements AfterViewInit {
  components: any = [
    StudentDatadumpComponent,
    ExcelDataManagementComponent
  ];

  tabNames = [
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "Subject Detail", "faIcon": '' }
  ];
  //tabNames = ["Subject Type","Subject Detail","Subject Mark Component", "Class Student", "Student Subject"];
  Permissions =
    {
      ParentPermission: '',
      DataDownloadPermission: '',
      DataUploadPermission: ''
    };

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;
  LoginUserDetail = [];
  constructor(
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private contentservice: ContentService,
    private shareddata: SharedataService,
  ) {
    this.SelectedAppName = this.tokenStorage.getSelectedAppName();
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
  }
  SelectedAppName = '';
  public ngAfterViewInit(): void {
    debugger


    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.DATA.DATA)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;
    }
    if (this.SelectedAppName.toLowerCase() == 'education management') {
      perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.DATA.DOWNLOAD)
      var comindx = this.components.indexOf(StudentDatadumpComponent);
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
    else {
      var comindx = this.components.indexOf(StudentDatadumpComponent);
      if (comindx > -1) {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }
    }
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.DATA.UPLOAD)
    var comindx = this.components.indexOf(ExcelDataManagementComponent);
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

    this.viewContainer.createComponent(this.components[index]);
  }
}
