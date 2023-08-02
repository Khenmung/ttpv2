import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudenthomeComponent } from './studenthome/studenthome.component';
import { studentprimaryinfoComponent } from './studentprimaryinfo/studentprimaryinfo.component';
import { AddstudentclassComponent } from './addstudentclass/addstudentclass.component';
import { searchstudentComponent } from './searchstudent/searchstudent.component';
import { AddstudentfeepaymentComponent } from './studentfeepayment/addstudentfeepayment/addstudentfeepayment.component';
import { FeereceiptComponent } from './studentfeepayment/feereceipt/feereceipt.component';
import { StudentattendancereportComponent } from './studentattendancereport/studentattendancereport.component';
import { StudentboardComponent } from './studentboard/studentboard.component';
import { StudentprogressreportComponent } from './studentprogressreport/studentprogressreport.component';
import { StudentEvaluationComponent } from '../evaluation/studentevaluation/studentevaluation.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { StudentviewComponent } from './studentview/studentview.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,canActivate:[AuthGuard],
    children: [
      { path: '', component: searchstudentComponent },
      { path: 'addstudent/:id', component: StudentboardComponent },
      { path: 'addstudent', component: StudentboardComponent },
      { path: 'view/:id', component: StudentviewComponent },
      { path: 'feepayment', component: AddstudentfeepaymentComponent },      
      { path: 'progressreport', component: StudentprogressreportComponent },      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
export const StudentComponents = [
  StudenthomeComponent,
  studentprimaryinfoComponent,
  AddstudentclassComponent,
  AddstudentfeepaymentComponent,
  searchstudentComponent,
  FeereceiptComponent,
  StudentattendancereportComponent,
  StudentboardComponent,
  StudentprogressreportComponent,
  StudentEvaluationComponent,
  StudentprogressreportComponent,
  StudentviewComponent
]