import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { AlbumsComponent } from './albums/albums.component';
import { CarouselComponent } from './carousel/carousel.component';
import { FiledragAndDropComponent } from './filedrag-and-drop/filedrag-and-drop.component';
import { ImgDragAndDropComponent } from './imgDragAndDrop/imgDragAndDrop';
import { PhotobrowserComponent } from './photobrowser/photobrowser.component';
import { PhotofileboardComponent } from './photofileboard/photofileboard.component';
import { PhotosComponent } from './photos/photos.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [
      { path: '', component: PhotofileboardComponent },
      { path: 'photocarousel', component: CarouselComponent },
      { path: 'browsephoto', component: PhotobrowserComponent },
      { path: 'dragdrop', component: ImgDragAndDropComponent },
      { path: 'photos', component: PhotosComponent },
      { path: 'managefile', component: AlbumsComponent },
      { path: 'filedragdrop', component: FiledragAndDropComponent }, 
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhotogalleryRoutingModule { }
export const PhotogalleryComponents = [
  AlbumsComponent,
  CarouselComponent,
  ImgDragAndDropComponent,
  PhotobrowserComponent,
  PhotosComponent,
  FiledragAndDropComponent,
  PhotofileboardComponent
]
