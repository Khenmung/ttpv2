import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { CustomerPlansComponent } from '../control/customerplans/customerplans.component';
import { GlobaladminboardComponent } from './globaladminboard/globaladminboard.component';
import { MenuConfigComponent } from './menu-config/menu-config.component';
import { PlansComponent } from './plans/plans.component';
import { PlanFeatureComponent } from './planfeature/planfeature.component';
import { AdminrolepermissionComponent } from './adminrolepermission/adminrolepermission.component';
import { PlanandmasteritemComponent } from './planandmasteritem/planandmasteritem.component';
import { OrganizationpaymentComponent } from './organizationpayment/organizationpayment.component';
import { CustomerPlanFeatureComponent } from './customerplanfeature/customerplanfeature.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      { path: '', component: GlobaladminboardComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GlobaladminInitialRoutingModule { }
export const GlobalAdminInitialComponents = [
  //CustomerPlansComponent,
  GlobaladminboardComponent,
  MenuConfigComponent,
  PlansComponent,
  PlanFeatureComponent,
  AdminrolepermissionComponent,
  PlanandmasteritemComponent,
  OrganizationpaymentComponent,
  CustomerPlanFeatureComponent
]