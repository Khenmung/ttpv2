import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotogalleryComponents, PhotogalleryRoutingModule } from './photogallery-routing.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { NgxPhotoEditorModule } from 'ngx-photo-editor';
import { NgxFileDropModule } from 'ngx-file-drop';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [PhotogalleryComponents],
  imports: [
    CommonModule,
    NgbModule,
    PhotogalleryRoutingModule,
    ClipboardModule,
    SharedhomepageModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxPhotoEditorModule,
    NgxFileDropModule,
    NgxDropzoneModule,
    ImageCropperModule,
    FlexLayoutModule,
    SharedModule
  ],
  exports:[PhotogalleryComponents]
})
export class PhotogalleryModule { }
