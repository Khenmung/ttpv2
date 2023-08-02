import { AfterViewInit, ChangeDetectorRef, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ClassperiodComponent } from '../classperiod/classperiod.component';
import { DailytimetablereportComponent } from '../dailytimetablereport/dailytimetablereport.component';
import { SchooltimetableComponent } from '../schooltimetable/schooltimetable.component';
import { TeacheroffperiodComponent } from '../teacheroffperiod/teacheroffperiod.component';
import { TeacherperiodComponent } from '../teacherperiod/teacherperiod.component';
import { TeachersubjectComponent } from '../teachersubject/teachersubject.component';

@Component({
  selector: 'app-timetableboard',
  templateUrl: './timetableboard.component.html',
  styleUrls: ['./timetableboard.component.scss']
})
export class TimetableboardComponent implements AfterViewInit {

  components:any = [
    TeachersubjectComponent,
    ClassperiodComponent,   
    SchooltimetableComponent,
    TeacherperiodComponent,
    TeacheroffperiodComponent,
    DailytimetablereportComponent
  ];

  tabNames = [
    { label: 'Class Period', faIcon: '' },
    { label: 'Class time table', faIcon: '' },
    { label: 'Class time table', faIcon: '' },
    { label: 'Class time table', faIcon: '' },
    { label: 'Class time table', faIcon: '' },
    { label: 'Class time table', faIcon: '' }
  ];

  Permissions =
    {
      ParentPermission: '',
      ClassPeriodPermission: '',
      ClassTimeTablePermission: ''
    };
  selectedIndex = 0;
  LoginUserDetail = [];
  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private contentservice: ContentService) {
  }

  public ngAfterViewInit(): void {
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.TIMETABLE.TIMETABLE)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;

    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.TIMETABLE.CLASSPERIOD)
    var comindx = this.components.indexOf(ClassperiodComponent);
    this.addRemovecomponent(perObj,comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.TIMETABLE.CLASSTIMETABLE)
    var comindx = this.components.indexOf(SchooltimetableComponent);
    this.addRemovecomponent(perObj,comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.TIMETABLE.TEACHERSUBJECT)
    var comindx = this.components.indexOf(TeachersubjectComponent);
    this.addRemovecomponent(perObj,comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.TIMETABLE.TEACHERPERIOD)
    var comindx = this.components.indexOf(TeacherperiodComponent);
    this.addRemovecomponent(perObj,comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.TIMETABLE.TEACHEROFFPERIOD)
    var comindx = this.components.indexOf(TeacheroffperiodComponent);
    this.addRemovecomponent(perObj,comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.TIMETABLE.DAILYTIMETABLEREPORT)
    var comindx = this.components.indexOf(DailytimetablereportComponent);
    this.addRemovecomponent(perObj, comindx);

    
    if (this.Permissions.ParentPermission != 'deny') {
      setTimeout(() => {
        this.renderComponent(0);
      }, 1000);
      this.cdr.detectChanges();
    }
  }

  public tabChange(index: number) {
    //console.log("index", index)
    setTimeout(() => {
      this.renderComponent(index);
    }, 1000);

  }
  addRemovecomponent(perObj,comindx){
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


  private renderComponent(index: number): any {
    
    this.viewContainer.createComponent(this.components[index]);
  }
}
