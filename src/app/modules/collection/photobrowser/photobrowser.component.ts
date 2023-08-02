import { Component, ElementRef, OnInit, VERSION } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { List } from '../../../shared/interface';
import { NaomitsuService } from '../../../shared/databaseService'
import { globalconstants } from '../../../shared/globalconstant';
import { Subscription } from 'rxjs';
import { MediaObserver } from '@angular/flex-layout';
import { ContentService } from 'src/app/shared/content.service';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-photobrowser',
  templateUrl: './photobrowser.component.html',
  styleUrls: ['./photobrowser.component.scss']
})
export class PhotobrowserComponent implements OnInit { PageLoading=true;
  ngVersion: string = VERSION.full;
  matVersion: string = '5.1.0';
  breakpoint: number;
  rowHeight: string;
  //searchForm:FormGroup;
  folderHierarachy: string;
  blueColorScheme = ["#FCE786",
    "#EC7235",
    "#D22D16",
    "#77BFE2",
    "#36A1D4"];
  searchForm = new UntypedFormGroup({
    Album: new UntypedFormControl('', [Validators.required, Validators.maxLength(50)]),
    year: new UntypedFormControl(''),
    radioAlbum: new UntypedFormControl('')
  });
  images: any[];
  Albums: any[];
  AllAlbums: any[];
  Photos: any[];
  unique: any[];
  selectedAlbum: string;
  oldvalue: string;
  loading = false;
  mediaSub: Subscription;
  deviceXs: boolean;

  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private route: Router,
    private contentservice: ContentService,
    private el: ElementRef,
    private mediaObserver: MediaObserver
  ) { }

  ngOnInit() {
    this.mediaSub = this.mediaObserver.asObservable().subscribe((result) => {
      this.deviceXs = result[0].mqAlias === "xs" ? true : false;
    });
    //  this.resize(window.innerWidth);
    this.getAlbums();
    this.searchForm.controls.radioAlbum.setValue('');
  }
  changeColor(indx) {
    let i = indx % 4;
    return this.blueColorScheme[i];
  }
  view(event) {
    ////console.log('this.Albums.length',event)
    //debugger;
    this.selectedAlbum = event;
    // let selectedAlbumId = this.Albums.filter(item => {
    //   return item.UpdatedFileFolderName == this.selectedAlbum
    // })[0].FileId;
    this.route.navigate(["/home/photocarousel"], { queryParams: { fileId: event } });
  }
  applyFilter(strFilter) {
    let count = 0;
    if (strFilter.length > 2)
      this.Albums = [...this.AllAlbums.filter(item => { return item.UpdatedFileFolderName.toLowerCase().includes(strFilter.toLowerCase()) })];
    else if (strFilter.length == 0)
      this.Albums = this.AllAlbums.filter((item, indx) => indx < 10);
    else
      return;
  }
  getAlbums() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["FileId", "FileName", "UpdatedFileFolderName", "UploadDate"];
    list.PageName = "StorageFnPs";
    list.filter = ['Active eq 1 and FileOrFolder eq 1 and FileOrPhoto eq 1'];
    list.orderBy = "UploadDate desc";
    //list.limitTo =10;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //        //console.log(data.value);
        this.Albums = data.value.filter((item, indx) => {
          return indx < 10;
        });
        let minId = Math.min.apply(Math, this.Albums.map(o => o.FileId))
        //let minId = this.Albums.reduce((a, b.FileId)=>Math.min(a.FileId, b.FileId));
        ////console.log('this.Albums', this.Albums)
        ////console.log('minId', minId)
        this.getPhotos(minId);
        this.AllAlbums = data.value;
        this.loading = false; this.PageLoading=false;
      }, error => console.log(error))
  }
  getPhotos(minId) {

    let list: List = new List();
    list.fields = ["FileId", "FileName", "Description", "UpdatedFileFolderName", "ParentId"];
    //list.lookupFields = ["Album"];
    list.PageName = "StorageFnPs";
    list.filter = ["Active eq 1 and FileOrPhoto eq 1 and ParentId ge " + minId];
    list.orderBy = "UploadDate desc";
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        ////debugger;
        let count = 0;
        if (data.value.length > 0) {
          var browsePath = '';
          var width = '150px';
          var cols = 1;
          this.Albums.forEach(album => {
            album.photos =
              data.value.filter(f => {
                return f.ParentId == album.FileId
              })
          });

          this.Albums.forEach((album) => {
            count = album.photos.length;
            width = count > 1 ? '160px' : '320px';
            ////console.log('photo count', count);
            ////console.log('photo width', width);

            album.photos = album.photos.map((photo, indx) => {
              browsePath = globalconstants.apiUrl + "/Image/" + album.FileName + "/" + photo.FileName

              return {
                PhotoId: photo.FileId,
                PhotoPath: browsePath,
                PhotoName: photo.UpdatedFileFolderName,
                Description: photo.Description,
                Width: width,
                Height: width,
                PhotoCount: count
              }
            })
          });
          //count=0;

        }

        ////console.log('album', this.Albums);
        this.loading = false; this.PageLoading=false;
      })
  }

  getNestedFolders(fileId) {
    let ParentItem = this.Albums.filter(item => item.FileId == fileId);
    let fullPath = '';
    while (ParentItem.length > 0) {
      fullPath += ParentItem[0].FileName + "/";
      ParentItem = this.Albums.filter(item => item.FileId == ParentItem[0].ParentId)
    }
    return fullPath;
  }
  // onResize(event) {
  //   this.resize(event.target.innerWidth);
  // }

  resize() {
    if (this.deviceXs) {
      this.breakpoint = 1;
      this.rowHeight = this.el.nativeElement.offsetWidth + ':' + this.el.nativeElement.offsetHeight / 4;
    } else {
      this.breakpoint = 4;
      this.rowHeight = this.el.nativeElement.offsetWidth / 4 + ':' + this.el.nativeElement.offsetHeight;
    }
  }
  selected(event) {
    ////console.log('event',event)
    this.selectedAlbum = event.target.value;
    ////console.log('this.selectedAlbum', this.selectedAlbum)
    // let tempImages = this.Albums.filter((item)=>{
    //   return item.Album == this.selectedAlbum
    // })
    // this.images = tempImages.map(item=> {return item.PhotoPath});
  }
  getoldvalue(value: string) {
    this.oldvalue = value;
    ////console.log('old value', this.oldvalue);
  }
  saveCost(value) {
    if (value.length == 0 || value.length > 50) {
      this.contentservice.openSnackBar("Character should not be empty or less than 50!",globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }

    let albumtoUpdate = {
      UpdatedFileFolderName: value,
      Active: 1,
      UploadDate: new Date()
    }
    let selectedAlbumId = this.Albums.filter(item => {
      return item.UpdatedFileFolderName == this.oldvalue
    })[0].FileId;
    ////console.log('selectedAlbumId', selectedAlbumId);
    this.dataservice.postPatch('StorageFnPs', albumtoUpdate, selectedAlbumId, 'patch')
      .subscribe(res => {
        ////console.log(res);
      });
  }
}
