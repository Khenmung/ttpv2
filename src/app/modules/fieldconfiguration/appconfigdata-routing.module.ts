import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { ConfigboardComponent } from './configboard/configboard.component';
import { UserconfigreportnameComponent } from './userconfigreportname/userconfigreportname.component';
import { UserReportConfigColumnsComponent } from './userreportconfigColumns/userreportconfigcolumns.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [
      {
        path: "", component: ConfigboardComponent

      }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppconfigdataRoutingModule { }
export const AppConfigComponents = [
  UserReportConfigColumnsComponent,
  UserconfigreportnameComponent,
  ConfigboardComponent,
  
];
