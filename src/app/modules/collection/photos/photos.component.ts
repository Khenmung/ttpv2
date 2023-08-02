import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ActivatedRoute, Router } from '@angular/router';
import { NaomitsuService } from '../../../shared/databaseService';
import { DialogService } from '../../../shared/dialog.service';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { globalconstants } from '../../../shared/globalconstant';
import { ContentService } from 'src/app/shared/content.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.scss']
})
export class PhotosComponent implements OnInit { PageLoading=true;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  selectedAlbum: string;
  selectedAlbumId: number;
  loading = true;
  error = '';
  title = '';
  images = [
    {
      PhotoId: 0,
      PhotoPath: "",
      Description: "",
      UpdatableName: "",
      ImagePath:""
    }
  ];
  constructor(private servicework: SwUpdate,private dataservice: NaomitsuService,
    private route: ActivatedRoute,
    private nav: Router,
    private contentservice: ContentService,
    private dialog: DialogService,
    private tokenStorage:TokenStorageService) {
    this.route.paramMap.subscribe(item => {
      this.selectedAlbumId = +this.route.snapshot.queryParamMap.get('AlbumId');//item.get('AlbumId')
      ////console.log('this.selectedAlbum',item);
    })
  }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.checklogin();
    this.getPhotos();
  }
  checklogin() {
    let options = {
        autoClose: true,
        keepAfterRouteChange: true
    };
    let token = this.tokenStorage.getToken();

    if (token == null) {
        this.contentservice.openSnackBar("Access denied! login required.",globalconstants.ActionText,globalconstants.RedBackground);
        this.nav.navigate(['/home']);
    }
}
  getPhotos() {
    let list: List = new List();
    list.fields = ["PhotoId", "PhotoPath", "Description", "Album/UpdatableName", "Album/AlbumName"];
    list.lookupFields = ["Album"];
    list.PageName = "PhotoGalleries";
    list.filter = ["Active eq 1 and AlbumId eq " + this.selectedAlbumId];
    list.orderBy = "UploadDate desc";
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          //debugger;
          var browsePath = '';
          this.images = data.value.map(item => {
            browsePath = globalconstants.apiUrl + "/Image/" + item.Album.AlbumName + "/" + item.PhotoPath;
            return {
              PhotoId:item.PhotoId,
              PhotoPath: browsePath,
              ImagePath:item.PhotoPath,
              Description: item.Description
            }
          });

          this.selectedAlbum = data.value[0].Album.UpdatableName;// this.images[0].Album.AlbumName;
          this.title = this.selectedAlbum;
          ////console.log('this.images',this.images)
        }
        else
          this.error = "No image to display";
        this.loading = false; this.PageLoading=false;
        //setTimeout(()=>{this.loading=false},3000); 
      })


  }
  display(albumId)
  {
    this.nav.navigate(["/home/photos"],{queryParams:{"photoId":albumId}});
  }
  Update(event,button, photoPath) {
    //console.log('button._elementRef.nativeElement.id',button);
    event.stopPropagation();
    let confirmYesNo: Boolean = false;
    this.dialog.openConfirmDialog("Are you sure you want to delete this photo?")
      .afterClosed().subscribe(res => {
        confirmYesNo = res;
        if (confirmYesNo) {
          //this.uploadImage();
          let albumtoUpdate = {
            PhotoPath: photoPath,
            Description:button._elementRef.nativeElement.name,
            Active: 0,
            AlbumId:this.selectedAlbumId,
            UploadDate: new Date()
          }
          ////console.log('albumtoUpdate',albumtoUpdate);
          this.dataservice.postPatch('PhotoGalleries', albumtoUpdate, button._elementRef.nativeElement.id, 'patch')
            .subscribe(res => {

              this.images.splice(this.images.findIndex((item)=>{item.PhotoId==button._elementRef.nativeElement.id}),1);
              this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
            },
              error => console.log(error));

        }
      });
  }
  back(){
    this.nav.navigate(["/home/managefile"]);    
  }

}
