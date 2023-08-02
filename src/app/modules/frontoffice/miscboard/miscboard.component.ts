import { AfterViewInit, ChangeDetectorRef, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { DemoComponent } from '../calendar/calendar.component';
import { EventComponent } from '../event/event.component';
import { HolidayComponent } from '../holiday/holiday.component';
import { NoOfStudentComponent } from '../no-of-student/no-of-student.component';
import { CreatehtmlpageComponent } from '../createhtmlpage/createhtmlpage.component';
import { SwUpdate } from '@angular/service-worker';
import { RulesnpolicyreportComponent } from '../rulesnpolicyreport/rulesnpolicyreport.component';

@Component({
  selector: 'app-miscboard',
  templateUrl: './miscboard.component.html',
  styleUrls: ['./miscboard.component.scss']
})
export class MiscboardComponent implements AfterViewInit {

  components: any = [
    NoOfStudentComponent,
    DemoComponent,
    EventComponent,
    HolidayComponent,
    CreatehtmlpageComponent,
    RulesnpolicyreportComponent
  ];

  tabNames = [
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
  ];
  Permissions =
    {
      ParentPermission: '',
      DataDownloadPermission: '',
      DataUploadPermission: ''
    };
  LoginUserDetail = [];
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
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.misc.FRONTOFFICE)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;
    }

    this.GenerateComponent(globalconstants.Pages.common.misc.CALENDAR)
    this.GenerateComponent(globalconstants.Pages.common.misc.HOLIDAY)
    this.GenerateComponent(globalconstants.Pages.common.misc.EVENT)
    this.GenerateComponent(globalconstants.Pages.common.misc.NOOFSTUDENT)
    this.GenerateComponent(globalconstants.Pages.common.misc.CREATEHTMLPAGE)
    this.GenerateComponent(globalconstants.Pages.common.misc.RULESORPOLICYREPORT)
    //this.GenerateComponent(globalconstants.Pages.edu.CLASSCOURSE.PREREQUISITE)

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
  GenerateComponent(featureName) {

    var perObj = globalconstants.getPermission(this.tokenStorage, featureName)
    var comindx = 0;
    switch (featureName) {
      case globalconstants.Pages.common.misc.CALENDAR:
        comindx = this.components.indexOf(DemoComponent);
        break;
      case globalconstants.Pages.common.misc.EVENT:
        comindx = this.components.indexOf(EventComponent);
        break;
      case globalconstants.Pages.common.misc.HOLIDAY:
        comindx = this.components.indexOf(HolidayComponent);
        break;
      case globalconstants.Pages.common.misc.NOOFSTUDENT:
        comindx = this.components.indexOf(NoOfStudentComponent);
        break;
      case globalconstants.Pages.common.misc.CREATEHTMLPAGE:
        comindx = this.components.indexOf(CreatehtmlpageComponent);
        break;
      case globalconstants.Pages.common.misc.RULESORPOLICYREPORT:
        comindx = this.components.indexOf(RulesnpolicyreportComponent);
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

