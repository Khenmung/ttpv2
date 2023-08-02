import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { reportshomeComponent } from '../schoolreports/reportshome/reportshome.component';
import { TodayCollectionComponent } from '../schoolreports/today-collection/today-collection.component';
import { FeecollectionreportComponent } from '../schoolreports/feecollectionreport/feecollectionreport.component';
import { ReportboardComponent } from './reportboard/reportboard.component';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { ExamtimetableComponent } from '../schoolreports/examtimetable/examtimetable.component';
import { ChartReportComponent } from './chartreport/chartreport.component';
import { ResultComponent } from './result/result.component';
import { StudentprofilereportComponent } from './studentprofilereport/studentprofilereport.component';
import { PrintprogressreportComponent } from './printprogressreport/printprogressreport.component';

const routes: Routes = [{
  path: '', component: HomeComponent,
  children: [
    { path: '', component: ReportboardComponent },
    { path: 'collectionreport', component: TodayCollectionComponent },
    { path: 'feepaymentreport', component: FeecollectionreportComponent },

  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolReportsRoutingModule { }
export const SchoolReportsComponents = [
  reportshomeComponent,
  TodayCollectionComponent,
  FeecollectionreportComponent,
  ReportboardComponent,
  ExamtimetableComponent,
  ChartReportComponent,
  ResultComponent,
  StudentprofilereportComponent,
  PrintprogressreportComponent
 
]