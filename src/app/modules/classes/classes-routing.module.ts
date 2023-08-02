import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { ClassboardComponent } from './classboard/classboard.component';
import { ClassdetailComponent } from './classdetail/classdetail.component';
import { ClassgroupComponent } from './classgroup/classgroup.component';
import { ClassgroupmappingComponent } from './classgroupmapping/classgroupmapping.component';
import { ClassmasterdashboardComponent } from './classsmastermapping/classmasterdashboard.component';
import { CourseYearsemesterComponent } from './courseyearsemester/courseyearsemester.component';
import { DashboardclassfeeComponent } from './dashboardclassfee/dashboardclassfee.component';
import { FeeDefinitionComponent } from './feedefinition/feedefinition.component';
import { SchoolFeeTypesComponent } from './school-fee-types/school-fee-types.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      { path: '', component: ClassboardComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ClassesRoutingModule { }
export const ClassesComponents = [
  ClassdetailComponent,
  DashboardclassfeeComponent,
  ClassboardComponent,
  ClassmasterdashboardComponent,
  SchoolFeeTypesComponent,
  FeeDefinitionComponent ,
  ClassgroupComponent,
  ClassgroupmappingComponent,
  CourseYearsemesterComponent
]
