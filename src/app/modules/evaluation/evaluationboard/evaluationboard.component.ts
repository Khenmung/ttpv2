import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from '../../../shared/content.service';
import { globalconstants } from '../../../shared/globalconstant';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { ClassEvaluationComponent } from '../classevaluation/classevaluation.component';
import { EvaluationExamMapComponent } from '../evaluationexammap/EvaluationExamMap.component';
import { EvaluationMasterComponent } from '../evaluationmaster/evaluationmaster.component';
import { EMarkComponent } from '../e-mark/e-mark.component';
import { EvaluationBulkComponent } from '../evaluationbulk/evaluationbulk.component';
import { ECheckComponent } from '../e-check/e-check.component';
import { EPerformComponent } from '../e-perform/e-perform.component';

@Component({
  selector: 'app-evaluationboard',
  templateUrl: './evaluationboard.component.html',
  styleUrls: ['./evaluationboard.component.scss']
})
export class EvaluationboardComponent implements AfterViewInit {

  components: any = [
    EvaluationMasterComponent,
    ClassEvaluationComponent,
    EvaluationExamMapComponent,
    EPerformComponent,
    EvaluationBulkComponent,
    ECheckComponent,
    EMarkComponent    
  ];

  tabNames = [
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' }
  ];

  Permissions =
    {
      ParentPermission: '',
      ClassEvaluationPermission: '',
      // EvaluationOptionPermission: '',
      // EvaluationExamPermission: '',
    };
  LoginUserDetail :any[]= [];
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

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EVALUATION)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;
    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EPERFORM);
    var comindx = this.components.indexOf(EPerformComponent);
    this.AddRemoveComponent(perObj, comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EVALUATIONMASTER);
    var comindx = this.components.indexOf(EvaluationMasterComponent);
    this.AddRemoveComponent(perObj, comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EVALUATIONQUESTIONNAIRE)
    var comindx = this.components.indexOf(ClassEvaluationComponent);
    this.AddRemoveComponent(perObj, comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EvaluationExamMap)
    var comindx = this.components.indexOf(EvaluationExamMapComponent);
    this.AddRemoveComponent(perObj, comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.ECHECK)
    var comindx = this.components.indexOf(ECheckComponent);
    this.AddRemoveComponent(perObj, comindx);
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EMARK)
    var comindx = this.components.indexOf(EMarkComponent);
    this.AddRemoveComponent(perObj, comindx);
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EBulk)
    var comindx = this.components.indexOf(EvaluationBulkComponent);
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
    //    ////console.log("index", index)
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