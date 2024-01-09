import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from '../shared/components/home/home.component';
import { HeaderComponent } from '../shared/components/header/header.component';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { AlertComponent } from '../shared/components/alert/alert.component';
import { MaterialModule } from '../shared/material/material.module';
import { RouterModule } from '@angular/router';
import { RightComponent } from '../shared/components/right/right.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MyFilterPipe } from '../shared/FilterPipe';

const sharedHomeComponent = [
  HomeComponent,
  HeaderComponent,
  SidebarComponent,
  FooterComponent,
  AlertComponent,
  RightComponent,
  MyFilterPipe
]

@NgModule({
  declarations: [
    sharedHomeComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    FlexLayoutModule,
    ReactiveFormsModule
  ],
  exports: [
    sharedHomeComponent
  ]
})
export class SharedhomepageModule { }
