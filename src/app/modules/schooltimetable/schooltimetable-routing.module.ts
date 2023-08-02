import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { ClassperiodComponent } from './classperiod/classperiod.component';
import { DailytimetablereportComponent } from './dailytimetablereport/dailytimetablereport.component';
import { SchooltimetableComponent } from './schooltimetable/schooltimetable.component';
import { TeacheroffperiodComponent } from './teacheroffperiod/teacheroffperiod.component';
import { TeacherperiodComponent } from './teacherperiod/teacherperiod.component';
import { TeachersubjectComponent } from './teachersubject/teachersubject.component';
import { TimetableboardComponent } from './timetableboard/timetableboard.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      { path: '', component: TimetableboardComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchooltimetableRoutingModule { }
export const SchoolTimeTableComponents = [
  SchooltimetableComponent,
  ClassperiodComponent,
  TimetableboardComponent,  
  TeachersubjectComponent,
  TeacherperiodComponent,
  TeacheroffperiodComponent,
  DailytimetablereportComponent
]
