import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { FileUploadService } from '../../../shared/upload.service'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { List } from '../../../shared/interface';
import { NaomitsuService } from '../../../shared/databaseService'
import { Router } from '@angular/router';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { globalconstants } from '../../../shared/globalconstant';
import { ContentService } from 'src/app/shared/content.service';
@Component({
  selector: 'app-file-drag-and-drop',
  templateUrl: './imgDragAndDrop.html',
  styleUrls: ['./imgDragAndDrop.scss'],
})
export class ImgDragAndDropComponent implements OnInit { PageLoading=true;
  loading=false;
  options = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  Processing=false;
  Albums: any[];
  title = 'Dropzone';
  files: File[] = [];
  formData: FormData;
  uploadedImage: File;
  errorMessage = '';
  Requestsize = 0;
  constructor(private servicework: SwUpdate,
    private naomitsuService: NaomitsuService,
    
    private uploadService: FileUploadService,
    private contentservice: ContentService,
    private route: Router,
    //private ng2ImgMax: Ng2ImgMaxService,
    private tokenStorage: TokenStorageService
  ) { }
  dragdropForm = new UntypedFormGroup({
    UpdatedFileFolderName: new UntypedFormControl(''),
    parentId: new UntypedFormControl(0),

  });
  ngOnInit() {
    this.checklogin();
    this.getAlbums();
  }
  checklogin() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    let token = this.tokenStorage.getToken();

    if (token == null) {
      this.contentservice.openSnackBar("Access denied! login required.", globalconstants.ActionText,globalconstants.RedBackground);
      this.route.navigate(['/home']);
    }
  }
  onSelect(event) {
    //debugger;
    this.files.push(...event.addedFiles);

    this.formData = new FormData();
    this.errorMessage = '';
    this.Processing =true;
    let resultCount=0;
    for (var i = 0; i < this.files.length; i++) {
      this.Requestsize += this.files[i].size;
      if (this.Requestsize + this.files[i].size > globalconstants.RequestLimit) {
        this.contentservice.openSnackBar('File upload limit is 20mb! File size is : ' + (this.Requestsize/(1024*1024)).toFixed(2) + 'mb',globalconstants.ActionText,globalconstants.BlueBackground)
        
        break;
      }
    //   this.ng2ImgMax.resizeImage(this.files[i], 2500, 1000)
    //     .subscribe(result => {
    //       resultCount +=1;
    //       this.uploadedImage = result;
    //       this.formData.append(result.name, this.uploadedImage, result.name);
    //       if(resultCount+1 >= this.files.length)
    //       {
    //         this.Processing =false;
    //       }
    //     },
    //       error => {
    //         this.Processing =false;
    //         this.alert.error(error.reason,this.options);
    //         //this.files.splice(i,1);
    //         this.errorMessage += error.reason;
    //         ////console.log('error:', error);
    //      })
    }
    
    //console.log('request', this.Requestsize)
  }
  // onImageChange(event) {
  //   let image = event.target.files[0];

  //   this.ng2ImgMax.compressImage(image, 0.075).subscribe(
  //     result => {
  //       this.uploadedImage = new File([result], result.name);
  //       //this.getImagePreview(this.uploadedImage);
  //     },
  //     error => {
  //       //console.log('😢 Oh no!', error);
  //     }
  //   );
  // }
  Upload() {
    //debugger;
    if (this.Requestsize > globalconstants.RequestLimit) {
      this.contentservice.openSnackBar("File upload limit is 20mb!", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if (this.files.length > 15) {
      this.contentservice.openSnackBar("File count exceeded the maximum of 15",globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    else if (this.errorMessage.length > 0) {
      return;
    }
    let error: boolean = false;
    let selectedAlbum = this.dragdropForm.get("UpdatedFileFolderName").value;
    let selectedAlbumId = this.dragdropForm.get("parentId").value;
    if (this.files.length < 1) {
      error = true;
      //this.alert.warn("No image to upload", this.options);
      this.contentservice.openSnackBar("No image to upload",globalconstants.ActionText,globalconstants.RedBackground);
    }

    if (selectedAlbum == '' && selectedAlbumId == 0) {
      error = true;
      this.contentservice.openSnackBar("Please enter album or existing album",globalconstants.ActionText,globalconstants.RedBackground);
    }
    else {
      if (selectedAlbumId != 0) {
        selectedAlbum = this.Albums.filter(item => item.FileId == selectedAlbumId)[0].UpdatedFileFolderName;
      }
      this.formData.append("fileOrPhoto", "1");
      this.formData.append("description", "");
      this.formData.append("folderName", selectedAlbum);
      this.formData.append("parentId", selectedAlbumId);
      ////console.log('formdata',this.formData);
      let filteredAlbum: any[] = [];
      if (this.Albums.length > 0) {
        filteredAlbum = this.Albums.filter(item => {
          return item.UpdatedFolder == selectedAlbum
        }
        );
      }
      this.uploadFile();

    }
  }
  uploadFile() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.uploadService.postFiles(this.formData).subscribe(res => {
      ////console.log("Upload complete");
      this.contentservice.openSnackBar("Files Uploaded successfully.", globalconstants.ActionText,globalconstants.RedBackground);
      this.formData = null;
      this.files = [];
      this.getAlbums();
      this.route.navigate(['/home/managefile']);
      //this.messages.push("Upload complete");
      //album.value=null;
      //image.value =null;
    });
  }
  onRemove(event) {

    this.files.splice(this.files.indexOf(event), 1);
    this.Requestsize -= event.size;
    this.contentservice.openSnackBar('File size: ' + (this.Requestsize/(1024*1024)).toFixed(2) + 'mb', globalconstants.ActionText,globalconstants.RedBackground);

  }

  getAlbums() {
    let list: List = new List();
    list.fields = ["FileId", "UpdatedFileFolderName"];
    list.PageName = "StorageFnPs";
    list.filter = ["Active eq 1 and FileOrFolder eq 1 and FileOrPhoto eq 1"];
    //debugger;
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.Albums = [...data.value];
        }
        else
          this.Albums = [];
      });
  }

}
