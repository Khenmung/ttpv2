import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { AdmissionboardComponent } from './admissionboard/admissionboard.component';
import { AssignStudentclassdashboardComponent } from './AssignStudentClass/Assignstudentclassdashboard.component';
import { PromoteclassComponent } from './promoteclass/promoteclass.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      {
        path: '', component: AdmissionboardComponent,//runGuardsAndResolvers:'always'
      },

    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdmissionRoutingModule { }
export const AdmissionComponents = [
  PromoteclassComponent,
  AdmissionboardComponent,
  AssignStudentclassdashboardComponent
]
