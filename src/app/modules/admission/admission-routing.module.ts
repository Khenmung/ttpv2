import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../../shared/components/home/home.component';
import { AdmissionboardComponent } from './admissionboard/admissionboard.component';
import { AssignStudentclassdashboardComponent } from './AssignStudentClass/Assignstudentclassdashboard.component';
import { PromoteclassComponent } from './promoteclass/promoteclass.component';
import { StudenthistoryComponent } from './studenthistory/studenthistory.component';
import { StudentDatadumpComponent } from './studentdatadump/studentdatadump.component';
import { ExcelDataManagementComponent } from './excel-data-management/excel-data-management.component';
import { AdmissionWithdrawnComponent } from './admissionwithdrawn/admissionwithdrawn.component';

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
  AssignStudentclassdashboardComponent,
  AdmissionWithdrawnComponent,
  StudenthistoryComponent,
  StudentDatadumpComponent,
  ExcelDataManagementComponent
]
