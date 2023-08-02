import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
//import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

import { NaomitsuService } from '../../../shared/databaseService'
import {SwUpdate} from '@angular/service-worker';

//@Pipe({ name: 'safeHtml' })
@Component({

  selector: 'app-displaypage',
  templateUrl: './displaypage.component.html',
  styleUrls: ['./displaypage.component.scss']
})
export class DisplaypageComponent implements OnInit { 
  PageLoading=true;
  images = [];
  Name = {};
  ImgUrl = '';
  loading: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 50;
  GroupId: number;
  pId: number;
  HomePageId: number;
  loop: number = 0;
  ParentPage = "";
  Title: string = "";
  PageBody: string = '';
  ParentLink = '';
  constructor(private servicework: SwUpdate,
    private naomitsuService: NaomitsuService,
    private ar: ActivatedRoute,
    private route: Router,
    private shareddata: SharedataService,
    private dataStorage: TokenStorageService
    //private cdref: ChangeDetectorRef
    //private sanitized: DomSanitizer
  ) {

  }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    ////console.log('window', window.location.href);
    this.loading = true;
    this.GroupId = 0;
    this.ar.queryParamMap.subscribe(params => {
      this.GroupId = +params.get("GroupId");

    });

    //if (this.images.length == 0)
    //  this.getRandomDisplayPhotoes();

    this.ar.paramMap.subscribe(params => {
      this.pId = +params.get("pid");
      this.shareddata.CurrentRandomImages.subscribe(r => {
        this.images = r;
        if (this.images.length == 0)
          this.getRandomDisplayPhotoes(params.get('phid'));
        else
          this.GetLatestPage(params.get('phid'));
      })
    })


  }
  ngAfterContentChecked() {

  }

  back() {
    if (this.GroupId == 0)
      this.route.navigate(['/home']);
    else
      this.route.navigate(['/home/about/' + this.GroupId]);
  }
  GetLatestPage(pHistoryId) {
    //debugger;
    let IdtoDisplay = pHistoryId;
    //let pages: any[];
    let filterstring = '';
    if (pHistoryId == 0)
      filterstring = "Active eq 1 and HomePage eq 1";
    else
      filterstring = "Active eq 1 and PageId eq " + this.pId;

    let list: List = new List();
    list.fields = [
      "link", "PageId", "ParentId", "PhotoPath",
      "PageTitle", "HomePage", "FullPath",
      "PageHistories/PageBody",
      "PageHistories/PageHistoryId",
      "PageHistories/ParentPageId"];
    list.lookupFields = ["PageHistories"];
    list.PageName = "Pages";
    list.filter = [filterstring];
    this.ImgUrl = '';
    this.PageBody ='';
    this.loading =true;
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          let pagetodisplay = [...data.value];
          if (IdtoDisplay == 0) {
            ///home/display/44/87
            IdtoDisplay = +pagetodisplay[0].link.split('/')[3];
          }
          
          this.AssignImageUrl(pagetodisplay[0].PhotoPath);
          
          //for link below title
          this.getParentPageLink(pagetodisplay[0].ParentId);

          this.PageBody = pagetodisplay[0].PageHistories.filter(h => h.PageHistoryId == IdtoDisplay)[0].PageBody;
          //this.ParentPage = pagetodisplay[0].PageTitle;
          this.Title = pagetodisplay[0].PageTitle;
          this.loading = false; this.PageLoading=false;
        }
      })

  }
  AssignImageUrl(photoPath) {
    if (photoPath == "" || photoPath == null)
      this.ImgUrl = this.images[Math.floor(Math.random() * this.images.length)];
    else
      this.ImgUrl = globalconstants.apiUrl + "/Image/PagePhoto/" + photoPath;
  }
  getParentPageLink(ParentId) {
    let Parent;
    this.ParentPage = '';
    this.shareddata.CurrentPagesData.subscribe(p => {
      Parent = p.filter(item => item.PageId == ParentId);
      if (Parent.length > 0) {
        this.ParentLink = Parent[0].link;
        this.ParentPage = Parent[0].label;
      }
    })

  }
  getRandomDisplayPhotoes(PhId) {
    let list: List = new List();
    list.fields = ["FileId", "FileName", "ParentId"];
    list.PageName = "StorageFnPs";
    list.filter = ['Active eq 1 and FileOrPhoto eq 0'];//  eq ' + this.searchForm.get("FilesNPhoto").value];
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        //this.images =
        let RandomImagesParentId = data.value.filter(image => {
          return image.FileName != null && image.FileName.toLowerCase() == "random images"
        });
        if (RandomImagesParentId.length > 0) {
          this.images = data.value.filter(rimg => rimg.ParentId == RandomImagesParentId[0].FileId)
            .map(element => {
              return globalconstants.apiUrl + "/Image/random images/" + element.FileName

            });
          this.shareddata.ChangeRandomImages(this.images);
          this.GetLatestPage(PhId);
        }
      })
  }
  getPageFromHistory(IdtoDisplay) {
    let list: List = new List();
    list.fields = ["PageHistoryId", "PageBody", "Page/PageTitle", "ParentPageId"];
    list.lookupFields = ["Page"];
    list.PageName = "PageHistories";
    list.filter = ["PageHistoryId eq " + IdtoDisplay];
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          ////console.log(data.value[0])
          this.Title = data.value[0].Page.PageTitle;
          this.PageBody = data.value[0].PageBody
          if (this.GroupId > 0)
            this.GetParentPage(this.GroupId);
          else
            this.GetParentPage(data.value[0].ParentPageId);
          this.loop = 0;
        }
        this.loading = false; this.PageLoading=false;
      });
  }
  getHomePageId() {
    let list: List = new List();
    list.fields = ["PageId", "PageTitle", "ParentId"];
    list.PageName = "Pages";
    list.filter = ["Active eq 1 and HomePage eq 1"];
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0)
          this.GroupId = data.value[0].PageId;
      });
  }
  GetParentPage(parentId) {
    let list: List = new List();
    list.fields = ["PageId", "PageTitle", "ParentId"];
    list.PageName = "Pages";
    list.filter = ["Active eq 1 and PageId eq " + parentId];
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0)

          if (this.loop == 0 && data.value[0].ParentId > 0) {
            this.loop = 1
            this.GetParentPage(data.value[0].ParentId)
          }
          else
            this.ParentPage = data.value[0].PageTitle;
      });
  }
}
