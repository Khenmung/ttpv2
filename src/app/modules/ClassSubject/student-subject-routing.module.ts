import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassSubjectDetailComponent } from './classsubjectdetail/classsubjectdetail.component';
import { StudentSubjectMarkCompComponent } from './student-subject-mark-comp/student-subject-mark-comp.component';
import { studentsubjectdashboardComponent } from './studentsubjectdashboard/studentsubjectdashboard.component';
import { SubjectTypesComponent } from './subject-types/subject-types.component';
import { SubjectBoardComponent } from './subjectboard/subjectboard.component';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { StudentSubjectReportComponent } from './studentsubjectreport/studentsubjectreport.component';
import { SubjectcomponentComponent } from './subjectcomponent/subjectcomponent.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      {
        path: '', component: SubjectBoardComponent,//runGuardsAndResolvers:'always'
      },
      { path: 'studentsubject', component: studentsubjectdashboardComponent },
      { path: 'subjecttypes', component: SubjectTypesComponent },
      { path: 'components', component: StudentSubjectMarkCompComponent },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentSubjectRoutingModule { }
export const StudentSubjectComponents = [
  ClassSubjectDetailComponent,
  studentsubjectdashboardComponent,
  SubjectTypesComponent,
  StudentSubjectMarkCompComponent,
  SubjectBoardComponent,
  StudentSubjectReportComponent,
  SubjectcomponentComponent
]
