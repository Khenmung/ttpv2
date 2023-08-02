import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { AchievementandpointComponent } from './achievementandpoint/achievementandpoint.component';
import { CertificateconfigComponent } from './certificateconfig/certificateconfig.component';
import { GenerateCertificateComponent } from './generatecertificate/generatecertificate.component';
import { GroupactivityComponent } from './groupactivity/groupactivity.component';
import { GroupactivityparticipantComponent } from './groupactivityparticipant/groupactivityparticipant.component';
import { GrouppointComponent } from './grouppoint/grouppoint.component';
import { StudentActivityComponent } from './StudentActivity/studentactivity.component';
import { StudentactivityboardComponent } from './studentactivityboard/studentactivityboard.component';
import { StudentactivityhomeComponent } from './studentactivityhome/studentactivityhome.component';
import { StudentfamilynfriendComponent } from './studentfamilynfriend/studentfamilynfriend.component';
import { StudentDocumentComponent } from './uploadstudentdocument/uploadstudentdoc.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,canActivate:[AuthGuard],
    children: [
      { path: '', component: StudentactivityboardComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentactivityRoutingModule { }
export const StudentActivityComponents=[
  StudentActivityComponent,
  GenerateCertificateComponent,
  StudentDocumentComponent,
  StudentactivityhomeComponent,
  StudentactivityboardComponent,
  StudentfamilynfriendComponent,
  GroupactivityComponent,
  GroupactivityparticipantComponent, 
  GrouppointComponent,
  AchievementandpointComponent,
  CertificateconfigComponent
]
