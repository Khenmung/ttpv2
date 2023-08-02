import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { StudentDatadumpComponent } from './studentdatadump/studentdatadump.component';
import { ExcelDataManagementComponent } from './excel-data-management/excel-data-management.component';
import { GeneralReportboardComponent } from './generalreportboard/generalreportboard.component';
import { GetreportComponent } from './getreport/getreport.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [{
      path: "", component: GeneralReportboardComponent
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralreportRoutingModule { }
export const GeneralreportComponents = [
  GeneralReportboardComponent,
  GetreportComponent,
  ExcelDataManagementComponent,
  StudentDatadumpComponent
];
