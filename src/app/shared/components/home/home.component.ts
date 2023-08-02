import { Component, ElementRef, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Subscription } from 'rxjs';
import { MediaObserver } from '@angular/flex-layout'
import { NaomitsuService } from '../../databaseService';
import { SharedataService } from '../../sharedata.service';
import { List } from '../../interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { MatSidenav } from '@angular/material/sidenav';
import { SidenavService } from '../../sidenav.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('sidenav') public sidenav: MatSidenav;
  @ViewChildren('scroller') public scroller;
  displayDiv = true;
  PageLoading = true;
  mediaSub: Subscription;
  deviceXs: boolean;
  mode = 'side';
  contentcls: string;
  sidebarcls: string;
  openSideBar = true;
  //MenuData = [];
  NewsNEventPageId = 0;
  //////////////////////////
  SelectedBatchId = 0; SubOrgId = 0;
  LoginUserDetail = [];
  sideMenu = [];
  opened = true;
  SelectedApplicationId = 0;
  MenuData = [];
  /////////////////////////

  constructor(
    private sidenavService: SidenavService,
    private servicework: SwUpdate,
    private mediaObserver: MediaObserver,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,
    private shareddata: SharedataService,
    private meta: Meta, title: Title

  ) {
    this.meta.addTags([
      { name: 'Description', content: 'ttpsolutions: Online Education Management, Employee Management' },
      { name: 'keywords', content: 'ttpsolutions: Education, School, Employee Management' },
      { name: 'author', content: 'TTP' }
    ])
    title.setTitle('Online Education Management');

  }
  ngAfterViewInit(): void {
    this.sidenavService.setSidenav(this.sidenav);
  }

  ngOnInit(): void {
    debugger;
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })

    this.mediaSub = this.mediaObserver.asObservable().subscribe((result) => {
      ////console.log('result',result);
      this.deviceXs = result[0].mqAlias === "xs" ? true : false;
      if (this.deviceXs) {
        this.openSideBar = false;
        this.mode = "over";
        this.contentcls = 'DeviceXs';
        //this.sidebarcls = 'sidebartop110width100'
      }
      else {
        if (!this.openSideBar)
          this.openSideBar = true;
        this.mode = "side";
        this.contentcls = "NotDeviceXs";
        //this.sidebarcls = "sidebartop65width100";
      }
      ////////////////
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
      this.SubOrgId = this.tokenStorage.getSubOrgId();
      this.LoginUserDetail = this.tokenStorage.getUserDetail();
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      // if (this.SelectedApplicationId > 1)
      this.sideMenu = this.tokenStorage.getMenuData();
      //console.log("home init this.sideMenu", this.sideMenu)
      // console.log("this.scroller.nativeElement.scrollTop", this.scroller)
      // this.scroller._elementRef.onscroll = () => {

      //   let top = this.scroller.nativeElement.scrollTop;

      //   if (top > 0) {               // We scrolled down
      //     this.displayDiv = false;
      //   }
      //   else {
      //     this.displayDiv = true;
      //   }

      // }
    })


  }

  ngOnDestroy() {

    this.mediaSub.unsubscribe();
  }
  busy(event) {

    event.stopPropagation()
  }
  toggleSidebar() {
    this.opened = !this.opened;
  }
  DownFromMenu(value) {
    ////console.log('from menu',value);
    if (this.deviceXs)
      this.openSideBar = !this.openSideBar;
  }
  sideBarToggler() {
    //debugger;
    this.openSideBar = !this.openSideBar;
    ////console.log('this.deviceXs in toggle',this.deviceXs)
    if (!this.openSideBar && this.deviceXs)
      this.contentcls = "DeviceXs";
    else if (this.openSideBar && this.deviceXs)
      this.contentcls = 'OpenAndDeviceXs';
    else
      this.contentcls = "NotDeviceXs";
    //this.ref.detectChanges();

  }
  GetMenuData() {
    debugger;
    //let containAdmin = window.location.href.toLowerCase().indexOf('admin');
    console.log("in home")
    let strFilter = '';
    strFilter = "PlanId eq " + this.LoginUserDetail[0]["planId"] + " and Active eq 1 and ApplicationId eq " + this.SelectedApplicationId;

    let list: List = new List();
    list.fields = [
      "PlanFeatureId",
      "PlanId",
      "PageId",
      "ApplicationId"
    ];

    list.PageName = "PlanFeatures";
    list.lookupFields = ["Page($select=PageId,PageTitle,label,faIcon,link,ParentId,HasSubmenu,UpdateDate,DisplayOrder)"];
    //list.orderBy = "DisplayOrder";
    list.filter = [strFilter];
    var permission;
    this.dataservice.get(list).subscribe((data: any) => {
      this.sideMenu = [];
      data.value.forEach(m => {
        permission = this.LoginUserDetail[0]["applicationRolePermission"].filter(r => r.applicationFeature.toLowerCase().trim() == m.Page.PageTitle.toLowerCase().trim() && m.Page.ParentId == 0)
        if (permission.length > 0 && permission[0].permission != 'deny') {
          m.PageId = m.Page.PageId;
          m.PageTitle = m.Page.PageTitle;
          m.label = m.Page.label;
          m.faIcon = m.Page.faIcon;
          m.link = m.Page.link;
          m.ParentId = m.Page.ParentId;
          m.HasSubmenu = m.Page.HasSubmenu;
          m.DisplayOrder = m.Page.DisplayOrder;
          this.sideMenu.push(m);
        }
      })
      this.sideMenu = this.sideMenu.sort((a, b) => a.DisplayOrder - b.DisplayOrder);

      let NewsNEvents = this.sideMenu.filter(item => {
        return item.label.toUpperCase() == 'NEWS N EVENTS'
      })
      if (NewsNEvents.length > 0) {
        this.shareddata.ChangeNewsNEventId(NewsNEvents[0].PageId);
      }

      var appName = location.pathname.split('/')[1];
      if (appName.length > 0) {
        this.shareddata.ChangePageData(this.sideMenu);
      }
    });


  }

}
export class MenuItem {
  constructor(
    public label: string,
    public link: string,
    public toolTip: string,
    public faIcon: string = ''
  ) { }
}

export const menuList = [
  new MenuItem('Chemistry', 'employee', 'Chemistry class material', 'science'),
  new MenuItem('Biology', 'Biology', 'Biology class material', 'biotech'),
  new MenuItem('Math', 'Math', 'Math class material', 'calculate'),
  new MenuItem('Physics', 'Physics', 'Physics class material', 'flash_on'),
];

