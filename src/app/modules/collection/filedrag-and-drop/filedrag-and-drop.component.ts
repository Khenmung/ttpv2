import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { FileUploadService } from '../../../shared/upload.service';
import { TokenStorageService } from '../../../_services/token-storage.service';

@Component({
  selector: 'app-filedrag-and-drop',
  templateUrl: './filedrag-and-drop.component.html',
  styleUrls: ['./filedrag-and-drop.component.scss']
})
export class FiledragAndDropComponent implements OnInit {
  PageLoading = true;
  loading = false;
  Processing = false;
  Requestsize = 0;
  Albums: any[];
  errorMessage = '';
  formdata: FormData;
  folderForm = new UntypedFormGroup({
    folderName: new UntypedFormControl(''),
    FileId: new UntypedFormControl(0),
    parentId: new UntypedFormControl(0)

  });
  FilterOrgSubOrgBatchId='';
  FilterOrgSubOrg='';
  LoginUserDetail = [];
  constructor(private servicework: SwUpdate,
    private fileUploadService: FileUploadService,
    private naomitsuService: NaomitsuService,
    private route: Router,
    private tokenStorage: TokenStorageService,
    private contentservice: ContentService) { }
  Permission = '';
  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail.length != 0) {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.COLLECTION.UPLOADIMAGE);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.FilterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId= globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.formdata = new FormData();
        this.getAlbums();
      }
    }
  }
  checklogin() {

    let token = this.tokenStorage.getToken();

    if (token == null) {
      this.contentservice.openSnackBar("Access denied! login required.", globalconstants.ActionText, globalconstants.RedBackground);
      this.route.navigate(['/home']);
    }
  }
  public files: NgxFileDropEntry[] = [];

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    ////console.log('this.files', this.files)
    //debugger;
    this.Processing = true;
    for (const droppedFile of files) {

      //20971520
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          if (this.Requestsize + file.size > globalconstants.RequestLimit) {
            let mb = (globalconstants.RequestLimit / (1024 * 1024)).toFixed(2);
            this.contentservice.openSnackBar('File upload limit is ${mb}mb!', globalconstants.ActionText, globalconstants.RedBackground);
            return;
          }
          this.Requestsize += file.size
          // Here you can access the real file
          ////console.log(droppedFile.relativePath, file);
          if (file.type.includes("image") || file.type == "application/pdf" ||
            file.type == "application/vnd.ms-excel" ||
            file.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            //this.filesForDisplayOnly.push(file);
            this.formdata.append(droppedFile.fileEntry.name, file, droppedFile.fileEntry.name)
          }
          else
            this.errorMessage = "Only pdf/images/excel/word are allowed to upload.";

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        ////console.log(droppedFile.relativePath, fileEntry);
      }
    }
    if (this.errorMessage.length > 0)
      this.contentservice.openSnackBar(this.errorMessage, globalconstants.ActionText, globalconstants.RedBackground);
    this.Processing = false;
    ////console.log('this.formdata',this.filesForDisplayOnly);
  }
  Upload() {

    if (this.Requestsize > globalconstants.RequestLimit) {
      this.contentservice.openSnackBar("File upload limit is 20mb!", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let error: boolean = false;
    //debugger;

    let selectedAlbum = this.folderForm.get("folderName").value;
    let selectedAlbumId = this.folderForm.get("parentId").value;
    ////console.log(this.Albums);//alert(selectedAlbum);
    if (this.files.length < 1) {
      error = true;
      this.contentservice.openSnackBar("No image to upload", globalconstants.ActionText, globalconstants.RedBackground);
    }

    if (selectedAlbum == '' && selectedAlbumId == 0) {
      error = true;
      this.contentservice.openSnackBar("Please enter folder or select existing folder", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      if (selectedAlbumId != 0) {
        selectedAlbum = this.Albums.filter(item => item.FileId == selectedAlbumId)[0].UpdatedFileFolderName;
      }

      this.formdata.append("folderName", selectedAlbum);
      this.formdata.append("FileId", selectedAlbumId);
      //if ()
      this.formdata.append("parentId", this.folderForm.get("parentId") != null ? this.folderForm.get("parentId").value : "0");
      this.formdata.append("description", "");
      this.formdata.append("fileOrPhoto", "0");
      let filteredAlbum: any[] = [];
      if (this.Albums.length > 0) {
        filteredAlbum = this.Albums.filter(item => {
          return item.UpdatableName == selectedAlbum
        }
        );
      }
      this.uploadFile();


    }
  }
  imagePath: string;
  message: string;
  imgURL: any = '';
  selectedFile: any;
  preview(files) {
    if (files.length === 0)
      return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }
    debugger;
    this.selectedFile = files[0];
    console.log("this.selectedFile.size", this.selectedFile.size)
    if (this.selectedFile.size > 2000000) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Image size should be less than 2mb", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    }
  }
  uploadFile() {
    debugger;
    let error: boolean = false;
    if (this.selectedFile == undefined) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select a file.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _folderName = this.folderForm.get("folderName").value;
    var _parentId = this.folderForm.get("parentId").value;
    var _existingFolder = '';
    if (_parentId > 0)
      _existingFolder = this.Albums.filter(a => a.FileId == _parentId)[0].UpdatedFileFolderName

    if (_folderName.length == 0)//only if folder name is empty
      _folderName = _existingFolder;
    if (_folderName.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter folder name.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.formdata = new FormData();
    this.formdata.append("description", "album");
    this.formdata.append("fileOrPhoto", "1");
    //this.formdata.append("FileOrFolder", "1");
    this.formdata.append("folderName", _folderName);
    this.formdata.append("parentId",_parentId);

    this.formdata.append("batchId", "0");
    this.formdata.append("orgName", this.LoginUserDetail[0]["org"]);
    this.formdata.append("subOrgId", this.tokenStorage.getSubOrgId()+"");
    this.formdata.append("orgId", this.LoginUserDetail[0]["subOrgId"]);
    this.formdata.append("pageId", "0");

    this.formdata.append("studentId", "0");
    this.formdata.append("studentClassId", "0");
    this.formdata.append("questionId", "0");
    this.formdata.append("docTypeId", "0");

    this.formdata.append("image", this.selectedFile, this.selectedFile.name);
    this.loading = true;
    
    this.uploadImage();
  }

  uploadImage() {

    this.loading = true;
    this.fileUploadService.postFiles(this.formdata).subscribe(res => {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Files uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
    });
  }
  // uploadFile() {
  //   ////console.log('form dasta',this.formdata);
  //   this.Processing = true;
  //   this.uploadService.postFiles(this.formdata).subscribe(res => {
  //     ////console.log("Upload complete");
  //     this.contentservice.openSnackBar("Files Uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
  //     this.formdata = null;
  //     this.files = [];
  //     this.getAlbums();
  //     this.Processing = false;
  //     this.route.navigate(['/home/managefile']);

  //   });
  // }
  getAlbums() {
    let list: List = new List();
    list.fields = ["FileId", "UpdatedFileFolderName"];
    list.PageName = "StorageFnPs";
    list.filter = [this.FilterOrgSubOrg + 
    " and Active eq 1 and FileOrFolder eq 1"];

    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        this.Albums = [...data.value];
      });
  }
  public fileOver(event) {
    ////console.log(event);
  }

  public fileLeave(event) {
    ////console.log(event);
  }
}
