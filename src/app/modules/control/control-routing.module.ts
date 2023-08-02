import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { roleappAddComponent } from './roleapppermission/roleappadd/roleappadd.component';
import { RoleAppPermissiondashboardComponent } from './roleapppermission/RoleAppPermissiondashboard/RoleAppPermissiondashboard.component';
import { roleuserdashboardComponent } from './roleuser/roleuserdashboard/roleuserdashboard.component';
import { settingboardComponent } from './settingboard/settingboard.component';
import { userComponent } from './users/appuser/user.component';
import { AppuserdashboardComponent } from './users/appuserdashboard/appuserdashboard.component';
import { ControlhomeComponent } from './controlhome/controlhome.component';
import { BatchdashboardComponent } from './batchdashboard/batchdashboard.component';
import { AddMasterDataComponent } from './add-master-data/add-master-data.component';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { OrganizationComponent } from './organization/organization.component';
import { SingleorganizationComponent } from './singleorganization/singleorganization.component';
import { CustomerPlansComponent } from './customerplans/customerplans.component';
import { CustomfeaturerolepermissionComponent } from './customfeaturerolepermission/customfeaturerolepermission.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { ReceiptComponent } from './receipt/receipt.component';
import { ContactdashboardComponent } from './contact/contactdashboard/contactdashboard.component';
import { ContactComponent } from './contact/addMessage/contact.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      { path: '', component: settingboardComponent },
      { path: 'setting', component: settingboardComponent },
      { path: 'appuser', component: userComponent },
      { path: 'appuserdashboard', component: AppuserdashboardComponent },
      { path: 'messages', component: ContactdashboardComponent },
      { path: 'addmessage', component: ContactComponent },
      { path: 'message/:id', component: ContactComponent },
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminsettingsRoutingModule { }
export const settingsComponent = [
  userComponent,
  AppuserdashboardComponent,
  roleuserdashboardComponent,
  settingboardComponent,
  roleappAddComponent,
  RoleAppPermissiondashboardComponent,
  ControlhomeComponent,
  BatchdashboardComponent,
  AddMasterDataComponent,
  OrganizationComponent,
  SingleorganizationComponent,
  CustomerPlansComponent,
  CustomfeaturerolepermissionComponent,
  InvoiceComponent,
  ReceiptComponent,
  ContactdashboardComponent,
  ContactComponent
]
