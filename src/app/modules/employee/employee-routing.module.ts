import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UploademployeeComponent } from './uploademployee/uploademployee.component';
import { DownloademployeeComponent } from './downloademployee/downloademployee.component';
import { HomeComponent } from '../../shared/components/home/home.component';
import { EmployeedataBoardComponent } from './employeedataboard/employeedataboard.component';

const routes: Routes = [{
  path: '', component: HomeComponent,
  children: [
    { path: '', component: EmployeedataBoardComponent },

  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
export const EmployeeDataComponents = [
  UploademployeeComponent,
  DownloademployeeComponent,
  EmployeedataBoardComponent
]