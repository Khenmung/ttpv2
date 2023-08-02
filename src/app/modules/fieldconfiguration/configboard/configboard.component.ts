import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { UserconfigreportnameComponent } from '../userconfigreportname/userconfigreportname.component';
import { UserReportConfigColumnsComponent } from '../userreportconfigColumns/userreportconfigcolumns.component';

@Component({
  selector: 'app-configboard',
  templateUrl: './configboard.component.html',
  styleUrls: ['./configboard.component.scss']
})
export class ConfigboardComponent implements AfterViewInit {

  components:any = [  
  UserconfigreportnameComponent,
  UserReportConfigColumnsComponent,
];

tabNames = [
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
  LoginUserDetail =[];
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
  debugger
  this.LoginUserDetail =  this.tokenStorage.getUserDetail();
  this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
  var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORTCONFIGURATION.REPORTCONFIGURATION)
  if (perObj.length > 0) {
    this.Permissions.ParentPermission = perObj[0].permission;  
  }
  
  this.GenerateComponent(globalconstants.Pages.edu.REPORTCONFIGURATION.REPORTNAME)
  this.GenerateComponent(globalconstants.Pages.edu.REPORTCONFIGURATION.REPORTCOLUMN)
  
  this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
  if (this.Permissions.ParentPermission != 'deny') {
    this.renderComponent(0);
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
GenerateComponent(featureName){
  
  var perObj = globalconstants.getPermission(this.tokenStorage, featureName)
  var comindx =0;
  switch(featureName)
  {
    case globalconstants.Pages.edu.REPORTCONFIGURATION.REPORTNAME:
      comindx =this.components.indexOf(UserconfigreportnameComponent);
      break;
    case globalconstants.Pages.edu.REPORTCONFIGURATION.REPORTCOLUMN:
      comindx =this.components.indexOf(UserReportConfigColumnsComponent);
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