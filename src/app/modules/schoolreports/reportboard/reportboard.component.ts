import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ExamtimetableComponent } from '../examtimetable/examtimetable.component';
import { FeecollectionreportComponent } from '../feecollectionreport/feecollectionreport.component';
import { ChartReportComponent } from '../chartreport/chartreport.component';
import { ResultComponent } from '../result/result.component';
import { TodayCollectionComponent } from '../today-collection/today-collection.component';
import { StudentprofilereportComponent } from '../studentprofilereport/studentprofilereport.component';

import {SwUpdate} from '@angular/service-worker';
import { PrintprogressreportComponent } from '../printprogressreport/printprogressreport.component';
@Component({
  selector: 'app-reportboard',
  templateUrl: './reportboard.component.html',
  styleUrls: ['./reportboard.component.scss']
})
export class ReportboardComponent implements AfterViewInit {

  components:any = [
    TodayCollectionComponent,
    FeecollectionreportComponent,
    ChartReportComponent,
    ResultComponent,
    ExamtimetableComponent,
    StudentprofilereportComponent,
    PrintprogressreportComponent
  ];

  tabNames = [
    { 'label': '1Exam Time Table', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Fee Payment Status', 'faIcon': '' },
    { 'label': '1Date Wise Collection', 'faIcon': '' },
    { 'label': '1Date Wise Collection', 'faIcon': '' },
    { 'label': '1Date Wise Collection', 'faIcon': '' },
    { 'label': '1Date Wise Collection', 'faIcon': '' }
  ];

  Permissions =
    {
      ParentPermission: '',
      ExamTimeTablePermission: '',
      ExamResultPermission: '',
      FeeCollectionPermission: '',
      DatewisePermission: '',
      ChartPermission: '',
      StudentProfileReportPermission: '',
      PrintProgressReportPermission: '',
    };
  LoginUserDetail = [];
  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(private servicework: SwUpdate,
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private contentservice: ContentService,
    ) {
  }

  public ngAfterViewInit(): void {

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.REPORT)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;

    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.EXAMTIMETABLE)
    var comindx = this.components.indexOf(ExamtimetableComponent);
    this.AddRemoveComponent(perObj, comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.RESULT)
    var comindx = this.components.indexOf(ResultComponent);
    this.AddRemoveComponent(perObj, comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.FEEPAYMENTSTATUS)
    var comindx = this.components.indexOf(FeecollectionreportComponent);
    this.AddRemoveComponent(perObj, comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.CHARTREPORT)
    var comindx = this.components.indexOf(ChartReportComponent);
    this.AddRemoveComponent(perObj, comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.DATEWISECOLLECTION)
    var comindx = this.components.indexOf(TodayCollectionComponent);
    this.AddRemoveComponent(perObj, comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.STUDENTPROFILEREPORT)
    var comindx = this.components.indexOf(StudentprofilereportComponent);
    this.AddRemoveComponent(perObj, comindx);
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.PRINTPROGRESSREPORT)
    var comindx = this.components.indexOf(PrintprogressreportComponent);
    this.AddRemoveComponent(perObj, comindx);


    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
    //console.log('this.Permissions.ParentPermission', this.Permissions.ParentPermission);
    if (this.Permissions.ParentPermission != 'deny') {
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
    //
    const component =this.viewContainer.createComponent(this.components[index]);
    
    //ClassprerequisiteComponent this.componentFactoryResolver.resolveComponentFactory
  }
  AddRemoveComponent(perObj, comindx) {
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
