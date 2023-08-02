import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { CKEditorModule } from 'ckeditor4-angular';

import { MaterialModule } from '../../shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedhomepageModule } from '../sharedhomepage.module';
//import { AlbumsModule } from '../photogallery/albums/albums.module';
import { DefinePagesComponents, DefinePagesRoutingModule } from './define-pages-routing.module';

@NgModule({
  declarations: [DefinePagesComponents],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    SharedhomepageModule,
    RouterModule,
    FlexLayoutModule,
    DefinePagesRoutingModule
  ],
  exports: [DefinePagesComponents]
})
export class DefinePagesModule { }
