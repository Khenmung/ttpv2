import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
// import { ContactComponent } from '../contact/addMessage/contact.component';
// import { ContactdashboardComponent } from '../contact/contactdashboard/contactdashboard.component';
import { NewsdashboardComponent } from './newsdashboard/newsdashboard.component';
import { DisplaypageComponent } from './displaypage/displaypage.component';
import { pageDashboardComponent } from './pageDashboard/pageDashboard.component';
import { pageViewComponent } from './pageView/pageView.component';
import { TextEditorComponent } from './texteditor/texteditor.component';
import { PagesboardComponent } from './pagesboard/pagesboard.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [
      { path: '', component: PagesboardComponent },
      { path: 'editor', component: TextEditorComponent },
      { path: 'page/:id', component: TextEditorComponent },
      { path: 'display/:phid/:pid', component: DisplaypageComponent },      
      { path: 'pages/:id', component: pageDashboardComponent },
      { path: 'pages', component: pageDashboardComponent },      
      { path: 'details', component: pageViewComponent },
      // { path: 'messages', component: ContactdashboardComponent },
      // { path: 'addmessage', component: ContactComponent },
      // { path: 'message/:id', component: ContactComponent },
      { path: 'about/:parentid', component: NewsdashboardComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DefinePagesRoutingModule { }
export const DefinePagesComponents = [
  TextEditorComponent,
  PagesboardComponent,
  pageDashboardComponent,
  pageViewComponent,
  DisplaypageComponent,
  // ContactdashboardComponent,
  // ContactComponent,
  NewsdashboardComponent
]
