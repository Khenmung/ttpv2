import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../../shared/components/home/home.component';
import { ClassEvaluationComponent } from './classevaluation/classevaluation.component';
import { ClassEvaluationOptionComponent } from './classevaluationoption/classevaluationoption.component';
import { EvaluationExamMapComponent } from './evaluationexammap/EvaluationExamMap.component';
import { EvaluationboardComponent } from './evaluationboard/evaluationboard.component';
import { EvaluationMasterComponent } from './evaluationmaster/evaluationmaster.component';
import { EMarkComponent } from './e-mark/e-mark.component';
import { QuestionnexamComponent } from './questionnexam/questionnexam.component';
import { EvaluationstatusComponent } from './evaluationstatus/evaluationstatus.component';
import { ECheckComponent } from './e-check/e-check.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [
      {
        path: "", component: EvaluationboardComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EvaluationRoutingModule { }
export const EvaluationComponents = [
  ClassEvaluationComponent,
  ClassEvaluationOptionComponent,
  EvaluationExamMapComponent,
  EvaluationboardComponent,
  EvaluationMasterComponent,
  EMarkComponent,
  QuestionnexamComponent,
  EvaluationstatusComponent,
  ECheckComponent
];

