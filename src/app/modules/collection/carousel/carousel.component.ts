import { Component, OnInit, VERSION } from '@angular/core';
import { NgbCarouselConfig } from "@ng-bootstrap/ng-bootstrap";
import { List } from '../../../shared/interface';
import { NaomitsuService } from '../../../shared/databaseService'
import { ActivatedRoute, Router } from '@angular/router';
import { globalconstants } from '../../../shared/globalconstant';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'carousel, [carousel]',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  providers: [NgbCarouselConfig]
})

export class CarouselComponent implements OnInit {
    PageLoading = true;

  selectedAlbum: string;
  selectedAlbumId: number;
  loading = true;
  unique = [];
  Albums: any[];
  name = "Angular " + VERSION.major;
  error = "";
  folderHierarachy = 'Image/';
  images = [
    {
      PhotoId: 0,
      PhotoPath: "",
      Description: "",
      UpdatableName: ""
    }
  ];// [100, 500, 700, 800, 807].map(n => `https://picsum.photos/id/${n}/900/500`);

  constructor(private servicework: SwUpdate, private config: NgbCarouselConfig,
    private dataservice: NaomitsuService,
    private route: ActivatedRoute,
    private nav: Router) {
    // customize default values of carousels used by this component tree
    config.interval = 3000;
    config.keyboard = true;
    config.pauseOnHover = false;
    config.animation = true;
    this.route.paramMap.subscribe(item => {
      this.selectedAlbumId = +this.route.snapshot.queryParamMap.get('fileId');//item.get('AlbumId')
      ////console.log('this.selectedAlbum',item);
    })

  }

  ngOnInit() {
    this.getPhotoes();
  }

  getPhotoes() {

    let list: List = new List();
    list.fields = ["FileId", "FileName", "Description", "UpdatedFileFolderName", "ParentId"];
    //list.lookupFields = ["Album"];
    list.PageName = "StorageFnPs";
    list.filter = ["Active eq 1 and FileOrPhoto eq 1 and (FileOrFolder eq 1 or ParentId eq " + this.selectedAlbumId + " or FileId eq " + this.selectedAlbumId + ")"];
    list.orderBy = "UploadDate desc";
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        ////debugger;
        if (data.value.length > 0) {
          var browsePath = '';

          var obj = data.value.filter(item => {
            return item.FileId == this.selectedAlbumId
          })
          if (obj.length > 0)
            this.selectedAlbum = obj[0].UpdatedFileFolderName;
          this.Albums = [...data.value];
          this.getNestedFolders(this.selectedAlbumId);
          this.images = data.value.filter(item => {
            return item.ParentId == this.selectedAlbumId
          })
            .map(item => {
              //browsePath =globalconstants.apiUrl + "/Image/" + item.Album.AlbumName+ "/" + item.PhotoPath;
              browsePath = globalconstants.apiUrl + "/" + this.folderHierarachy + item.FileName;
              return {
                PhotoPath: browsePath,
                Description: item.Description
              }
            });
          //   if (data.value.length == 1)
          //   //this.config.animation=false;
          //   this.selectedAlbum = data.value[0].UpdatedFileFolderName;// this.images[0].Album.AlbumName;
          // ////console.log('this.images',this.images)
        }
        else
          this.error = "No image to display";
        // setTimeout(() => {
        this.loading = false; this.PageLoading = false;
      })
  }
  getNestedFolders(fileId) {
    let ParentItem = this.Albums.filter(item => item.FileId == fileId);
    //debugger;
    while (ParentItem.length > 0) {
      this.folderHierarachy += ParentItem[0].FileName + "/";
      ParentItem = this.Albums.filter(item => item.FileId == ParentItem[0].ParentId)
    }
  }
  getAlbums() {

    let list: List = new List();
    list.fields = ["FileId", "FileName", "UpdatedFileFolderName", "FileOrFolder", "UploadDate", "ParentId", "Active"];
    list.PageName = "StorageFnPs";
    list.filter = ['Active eq 1 and FileOrFolder eq 1 and FileOrPhoto eq 1'];// + this.searchForm.get("FilesNPhoto").value];
    list.orderBy = "UploadDate desc";
    //list.limitTo =10;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Albums = [...data.value]
      })
  }
  enlargeImg(element) {
    element.style.transform = "scale(1.5)";
    // Animation effect 
    element.style.transition = "transform 0.25s ease";
  }
  back() {
    this.nav.navigate(["/home/browsephoto"]);
  }

}