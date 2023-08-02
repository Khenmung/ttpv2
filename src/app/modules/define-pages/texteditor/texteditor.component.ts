import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators, NgForm, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NaomitsuService } from '../../../shared/databaseService';
import { List, IPage } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { FileUploadService } from 'src/app/shared/upload.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { ContentService } from 'src/app/shared/content.service';

import { SwUpdate } from '@angular/service-worker';

@Component({

  selector: 'app-text-editor',

  templateUrl: './texteditor.component.html',

  styleUrls: ['./texteditor.component.scss']

})

export class TextEditorComponent implements OnInit {
  PageLoading = true;
  OneMB = 1048576;
  processing = false;
  Edit = false;
  imageCount = 0;
  message: string;
  imgURL: any = '';
  selectedFile: any;
  //Albums: any;
  errorMessage = '';
  formdata: FormData;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  PageDetail = {
    PageId: 0,
    PageTitle: '',
    ParentId: 0,
    FullPath: '',
    PhotoPath: '',
    CurrentVersion: 0,
    UpdateDate: new Date(),
    IsTemplate: 1,
    HasSubmenu: 1,
    Module: 1,
    label: '',
    link: '',
    Active: 1
  };
  PublishOrDraft: number = 0;
  PageDetailForm = this.fb.group({
    PhotoPath: [''],
    PageTitle: ['', [Validators.required, Validators.maxLength(50)]],
    ParentId: [0],
    PageBody: [''],
    PageHistoryId: [0],
    Published: [0],
    HasSubmenu: [false],
    PageId: [0],
    link: [''],
  });
  PageHistory = {
    PageHistoryId: 0,
    PageBody: '',
    Version: 0,
    ParentPageId: 0,
    Published: 0,
    UpdateDate: new Date(),
    CreatedDate: new Date()
  }
  selected: number = 0;
  PageGroups: any;
  Id: number = 0;
  PageHistoryId: number = 0;
  name = 'ng2-ckeditor';
  ckeConfig: any;
  mycontent: string = '';
  log: string = ''
  res: any;
  loading = false;
  constructor(private servicework: SwUpdate,
    private fb: UntypedFormBuilder,
    private naomitsuService: NaomitsuService,
    private router: Router,
    private ar: ActivatedRoute,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,
    private fileUploadService: FileUploadService,) {
    //this.PageDetail =[];
  }

  get f() { return this.PageDetailForm.controls; }

  ngOnInit() {
    this.loading = true;
    debugger;
    this.checklogin();
    this.GetLatestPage
    //this.GetParentPage();
    //debugger;
    this.ar.queryParamMap
      .subscribe((params) => {
        this.Id = this.ar.snapshot.params.id;

        if (this.Id != undefined) {
          this.GetLatestPage(this.Id);
        }
        else
          this.PageLoading = false;
        this.ckeConfig = {
          allowedContent: false,
          extraPlugins: 'divarea',
          forcePasteAsPlainText: false,
          removeButtons: 'About',
          scayt_autoStartup: true,
          autoGrow_onStartup: true,
          autoGrow_minHeight: 500,
          autoGrow_maxHeight: 600
        };

      });
  }
  ngAfterViewInit() {
    //this.loading = false; this.PageLoading=false;
  }
  preview(files) {
    if (files.length === 0)
      return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }
    this.selectedFile = files[0];
    //console.log('image size',this.selectedFile.size);

    if (this.selectedFile.size > this.OneMB) {
      this.contentservice.openSnackBar('Image size is too big! Please try to upload image size less than 1mb', globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.selectedFile.size
    var reader = new FileReader();
    this.imageCount = files.length;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    }
  }
  edit() {
    this.Edit = true;
  }
  delete() {
    let pageData = {
      UpdateDate: new Date(),
      PhotoPath: ""
    }
    this.processing = true;
    this.naomitsuService.postPatch('Pages', pageData, this.Id, 'patch')
      .subscribe(
        (data: any) => {
          this.imgURL = "";
          this.contentservice.openSnackBar("Photo deleted successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
          this.processing = false;
        });
  }
  uploadFile() {
    let error: boolean = false;
    this.processing = true;
    this.formdata = new FormData();
    this.formdata.append("description", "Page photo");
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "PagePhoto");
    this.formdata.append("parentId", "-1");

    if (this.Id != null || this.Id != 0)
      this.formdata.append("PageId", this.Id.toString());
    this.formdata.append("image", this.selectedFile, this.selectedFile.name);
    this.uploadImage();
  }

  uploadImage() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    //this.formData.append("Image", <File>base64ToFile(this.croppedImage),this.fileName);
    this.fileUploadService.postFile(this.formdata).subscribe(res => {
      //let filename = this.selectedFile.name.substring(0,10).replace(' ','-').
      this.PageDetailForm.patchValue({ "PhotoPath": res });
      ////console.log('res',res);
      this.contentservice.openSnackBar("Files Uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
      this.imageCount = 0;
      this.Edit = false;
      this.processing = false;
    });
  }

  dashboard() {
    this.router.navigate(['/home/pages']);
  }

  GetLatestPage(ppId: number) {

    let list: List = new List();
    list.fields = ["PageHistoryId", "PageBody", "Version",
      "Published"];
    list.PageName = "PageHistories";
    list.lookupFields = ["Page($select=PhotoPath,PageTitle,link,HasSubmenu)"];
    list.filter = ["ParentPageId eq " + ppId];
    list.orderBy = "PageHistoryId desc";
    list.limitTo = 1;
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          if (data.value[0].Page.PhotoPath == null || data.value[0].Page.PhotoPath == "")
            this.imgURL = "";
          else
            this.imgURL = globalconstants.apiUrl + "/Image/PagePhoto/" + data.value[0].Page.PhotoPath

          this.PageDetailForm.patchValue({
            PhotoPath: data.value[0].Page.PhotoPath,
            PageTitle: data.value[0].Page.PageTitle,
            ParentId: +this.ar.snapshot.queryParams.pgid,
            PageBody: data.value[0].PageBody,
            PageHistoryId: data.value[0].PageHistoryId,
            Version: data.value[0].Version,
            Published: data.value[0].Published,
            HasSubmenu: data.value[0].Page.HasSubmenu,
            link: data.value[0].Page.link,
            PageId: ppId
          });
          //this.selected = this.ar.snapshot.queryParams.pgid;          
          //this.PageDetailForm.controls.PageGroupId.patchValue(this.ar.snapshot.queryParams.pgid);
        }
        this.loading = false;
        this.PageLoading = false;
      });
  }
  checklogin() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    let token = this.tokenStorage.getToken();

    if (token == null) {
      this.contentservice.openSnackBar("Access denied! login required.", globalconstants.ActionText, globalconstants.BlueBackground);
      this.router.navigate(['/home']);
    }
  }
  onSaveAsDraft() {
    this.PublishOrDraft = 0;
    this.loading = true;
    this.onSave();
  }
  onSubmit() {
    this.PublishOrDraft = 1;
    this.onSave();
  }
  onSave() {
    //debugger;
    ////console.log('to update', this.PageDetailForm.value)
    if (this.Id == undefined) {
      this.insert();
    }
    else {
      //if save as draft is clicked & the latest is published.
      if (this.PageDetailForm.get("Published").value == 1 && this.PublishOrDraft == 0)
        this.insert();
      else
        this.Update();
    }
  }
  insert() {
    let active = 1;
    let duplicate = [];
    if (this.Id == undefined) {
      duplicate = this.PageGroups.filter(ele => {
        return ele.ParentId == this.PageDetailForm.value.ParentId
          && ele.PageTitle == this.PageDetailForm.value.PageTitle
      })
      if (this.PublishOrDraft == 0)
        active = 0;
    }
    if (duplicate.length > 0) {
      this.contentservice.openSnackBar('There is already a page named ' + this.PageDetailForm.value.PageTitle, globalconstants.ActionText, globalconstants.RedBackground);
    }
    else {
      let PageTitle = this.PageDetailForm.get("PageTitle").value;
      this.PageDetail.PageTitle = PageTitle;// .get("PageTitle").value;
      this.PageDetail.label = PageTitle;
      this.PageDetail.link = this.PageDetailForm.get("link").value;
      this.PageDetail.ParentId = this.PageDetailForm.get("ParentId").value;
      this.PageDetail.FullPath = this.PageDetailForm.get("ParentId").value == 0 ? PageTitle : this.PageGroups.filter(g => g.PageId == this.PageDetailForm.get("ParentId").value)[0].FullPath + ' > ' + PageTitle;
      this.PageDetail.Active = active;
      this.PageDetail.CurrentVersion = 1;
      this.PageDetail.UpdateDate = new Date();
      this.PageDetail.PhotoPath = this.PageDetailForm.get("PhotoPath").value;
      this.PageDetail.HasSubmenu = this.PageDetailForm.get("HasSubmenu").value == true ? 1 : 0;
      let mode: 'patch' | 'post' = 'post';

      //if save as draft the Pages should be updated but histories to be inserted.
      if (this.Id != undefined) {
        mode = 'patch'
        this.PageDetail.PageId = this.Id;
      }
      else {
        mode = 'post';
        this.PageDetail.PageId = 0;
      }
      this.naomitsuService.postPatch('Pages', this.PageDetail, this.PageDetail.PageId, mode)
        .subscribe(
          (page: any) => {
            let pageId = page == null ? this.PageDetail.PageId : page.PageId;

            this.PageHistory.PageHistoryId = this.PageDetailForm.get("PageHistoryId").value;
            this.PageHistory.PageBody = this.PageDetailForm.get("PageBody").value;
            this.PageHistory.CreatedDate = new Date();
            this.PageHistory.UpdateDate = new Date();
            this.PageHistory.Published = this.PublishOrDraft;
            this.PageHistory.Version = 1;
            this.PageHistory.ParentPageId = pageId;
            this.naomitsuService.postPatch('PageHistories', this.PageHistory, 0, 'post')
              .subscribe(
                (history: any) => {
                  this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
                  //debugger;
                  if (this.PublishOrDraft == 1) {
                    if (this.PageDetailForm.value.PageTitle.toUpperCase().includes("NEWS"))
                      this.PageDetail.link = '/home/about/' + this.Id + "/" + pageId;
                    else
                      this.PageDetail.link = '/home/display/' + history.PageHistoryId + "/" + pageId;

                    delete this.PageDetail.PageId;
                    this.naomitsuService.postPatch('Pages', this.PageDetail, pageId, 'patch')
                      .subscribe(
                        (data: any) => {
                          this.loading = false; this.PageLoading = false;
                        }, (error) => {
                          this.loading = false; this.PageLoading = false;
                          //console.log(error);
                        })
                  }
                  this.router.navigate(['/home/pages']);
                }, (error) => {
                  //console.log('update histories', error);
                });
          },
          (error) => {
            //console.log('update pages', error);
          });
    }
  }
  Update() {
    let duplicate = this.PageGroups.filter(ele => {
      return ele.ParentId == this.PageDetailForm.value.ParentId
        && ele.PageTitle == this.PageDetailForm.value.PageTitle
        && ele.PageId != this.Id

    })
    if (duplicate.length > 0) {
      this.contentservice.openSnackBar('There is already a page named ' + this.PageDetailForm.value.PageTitle, globalconstants.ActionText, globalconstants.RedBackground);
    }
    else {
      this.PageDetailForm.patchValue(
        {
          PageLeft: "",
          PageRight: "",
          PageFooter: "",
          Published: this.PublishOrDraft
        });

      this.PageDetail.PageTitle = this.PageDetailForm.value.PageTitle;// .get("PageTitle").value;
      this.PageDetail.label = this.PageDetailForm.value.PageTitle;
      //debugger;
      this.PageDetail.HasSubmenu = this.PageDetailForm.value.HasSubmenu == true ? 1 : 0;

      ///if it has no sub menu, link has to be defined only when it is published.
      if (this.PublishOrDraft == 1) {
        if (this.PageDetailForm.value.PageTitle.toUpperCase().includes("NEWS"))
          this.PageDetail.link = '/home/about/' + this.Id + "/" + this.Id;
        else
          this.PageDetail.link = '/home/display/' + this.PageDetailForm.get("PageHistoryId").value + "/" + this.Id;
      }
      else
        this.PageDetail.link = this.PageDetailForm.value.link;
      ////console.log('this.PageDetailForm.value.ParentId', this.PageDetailForm.value.ParentId);
      let FullPath = '';
      if (this.PageDetailForm.value.ParentId == 0)
        FullPath = this.PageDetailForm.value.PageTitle;
      else
        FullPath = this.PageGroups.filter(g => g.PageId == this.PageDetailForm.value.ParentId)[0].FullPath + ' > ' + this.PageDetailForm.value.PageTitle;

      this.PageDetail.ParentId = this.PageDetailForm.value.ParentId;//").value;
      this.PageDetail.FullPath = FullPath;
      this.PageDetail.PhotoPath = this.PageDetailForm.get("PhotoPath").value;
      this.PageDetail.Active = 1;
      this.PageDetail.CurrentVersion = this.PageHistory.Version + 1;
      this.PageDetail.UpdateDate = new Date();
      delete this.PageDetail.PageId;
      this.naomitsuService.postPatch('Pages', this.PageDetail, this.Id, 'patch')
        .subscribe(
          (data: any) => {
            this.PageHistory.PageHistoryId = this.PageDetailForm.get("PageHistoryId").value;
            this.PageHistory.PageBody = this.PageDetailForm.get("PageBody").value;
            this.PageHistory.CreatedDate = new Date();
            this.PageHistory.UpdateDate = new Date();
            this.PageHistory.Published = this.PublishOrDraft;
            this.PageHistory.Version = this.PageHistory.Version + 1;
            this.PageHistory.ParentPageId = this.Id;

            this.naomitsuService.postPatch('PageHistories', this.PageHistory, this.PageHistory.PageHistoryId, 'patch')
              .subscribe(
                (data: any) => {
                  this.loading = false; this.PageLoading = false;
                  this.contentservice.openSnackBar("Data updated Successfully", globalconstants.ActionText, globalconstants.BlueBackground);
                  this.router.navigate(['/home/pages']);
                });
          });
    }
  }
  GetParentPage() {
    let list: List = new List();
    list.fields = ["PageId", "PageTitle", "ParentId", "link", "FullPath"];
    list.PageName = "Pages";
    list.filter = ["Active eq 1"];
    list.orderBy = "ParentId";

    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        this.PageGroups = data.value;
        ////console.log(this.PageGroups);
      });

  }

}