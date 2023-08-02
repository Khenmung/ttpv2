import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { QuestionComponent } from './question/question.component';
import { QuestionandexamComponent } from './questionandexam/questionandexam.component';
import { QuestionandexamreportComponent } from './questionandexamreport/questionandexamreport.component';
import { QuestionbankboardComponent } from './questionbankboard/questionbankboard.component';
import { SyllabusComponent } from './syllabus/syllabus.component';

const routes: Routes =[
  {
    path: "", component: HomeComponent,
    children: [
      {
        path: "", component: QuestionbankboardComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuestionbankRoutingModule { }
export const QuestionBankComponents=[
  SyllabusComponent,
  QuestionComponent,
  QuestionbankboardComponent,
  QuestionandexamComponent,  
  QuestionandexamreportComponent      
];
