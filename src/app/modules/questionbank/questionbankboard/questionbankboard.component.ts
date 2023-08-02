import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { QuestionComponent } from '../question/question.component';
import { QuestionandexamComponent } from '../questionandexam/questionandexam.component';
import { QuestionandexamreportComponent } from '../questionandexamreport/questionandexamreport.component';
import { SyllabusComponent } from '../syllabus/syllabus.component';

@Component({
  selector: 'app-questionbankboard',
  templateUrl: './questionbankboard.component.html',
  styleUrls: ['./questionbankboard.component.scss']
})
export class QuestionbankboardComponent implements AfterViewInit {

  components: any = [
    SyllabusComponent,
    QuestionComponent,
    QuestionandexamComponent,
    QuestionandexamreportComponent
  ];

  tabNames = [
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
  ];

  Permissions =
    {
      ParentPermission: '',
      ClassEvaluationPermission: '',
      // EvaluationOptionPermission: '',
      // EvaluationExamPermission: '',
    };
  LoginUserDetail = [];
  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;
  Loaded = false;
  constructor(
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private contentservice: ContentService,
  ) {
  }

  public ngAfterViewInit(): void {
    debugger;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.QUESTIONBANK.QUESTIONBANK)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;
    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.QUESTIONBANK.QUESTION);
    var comindx = this.components.indexOf(QuestionComponent);
    this.AddRemoveComponent(perObj, comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.QUESTIONBANK.SYLLABUS);
    var comindx = this.components.indexOf(SyllabusComponent);
    this.AddRemoveComponent(perObj, comindx);
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.QUESTIONBANK.QUESTIONANDEXAM);
    var comindx = this.components.indexOf(QuestionandexamComponent);
    this.AddRemoveComponent(perObj, comindx);
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.QUESTIONBANK.QUESTIONANDEXAMREPORT);
    var comindx = this.components.indexOf(QuestionandexamreportComponent);
    this.AddRemoveComponent(perObj, comindx);

    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
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
    const component = this.viewContainer.createComponent(this.components[index]);

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

