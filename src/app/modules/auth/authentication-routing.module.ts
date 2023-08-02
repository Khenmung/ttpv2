import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerPlansComponent } from '../control/customerplans/customerplans.component';
import { AuthHomeComponent } from './authhome/authhome.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ConfirmemailComponent } from './confirmemail/confirmemail.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { AboutttpComponent } from './aboutttp/aboutttp.component';
//import { SelectappsComponent } from './selectapps/selectapps.component';

const routes: Routes = [
  {
    path: '', component: AuthHomeComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'aboutttp', component: AboutttpComponent },
      { path: 'changepassword', component: ChangePasswordComponent },
      { path: 'signup', component: RegisterComponent },
      { path: 'selectplan', component: CustomerPlansComponent },            
      { path: 'forgot', component: ForgotpasswordComponent },      
      { path: 'reset', component: ResetpasswordComponent },
      { path: 'confirmemail/:id/:code', component: ConfirmemailComponent },            
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
export const AuthComponents = [
  AuthHomeComponent,
  ChangePasswordComponent,
  LoginComponent,
  ProfileComponent,
  RegisterComponent,
  AuthHomeComponent,
  ConfirmemailComponent,
  ForgotpasswordComponent,
  ResetpasswordComponent
]
