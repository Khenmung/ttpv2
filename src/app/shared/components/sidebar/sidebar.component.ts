import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { NaomitsuService } from '../../databaseService';
import { List } from '../../interface';
import { SharedataService } from '../../sharedata.service';
//import {} from './menu'
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
    PageLoading = true;
  //@Output() openLeftMenu1:new EventEmitter();
  SelectedBatchId = 0; SubOrgId = 0;
  LoginUserDetail = [];
  sideMenu = [];
  collapse = false;
  SelectedApplicationId = 0;
  MenuData = [];
  constructor(
    private dataservice: NaomitsuService,
    private shareddata: SharedataService,
    private tokenStorage: TokenStorageService,
    private route: Router) { }

  ngOnInit(): void {
    debugger;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
    // this.shareddata.CurrentPagesData.subscribe((data:any)=>{
    //   this.MenuData =[...data];
    // })
    //if (this.SelectedApplicationId != 0 && this.SelectedBatchId != 0)//this.SelectedApplicationId != 0 && this.SelectedBatchId != 0)
    this.sideMenu = this.tokenStorage.getMenuData();
    if (this.sideMenu.length == 0)
      this.GetMenuData();

  }
  open() {

  }
  toggleSidebar() {
    this.collapse = !this.collapse;
  }
  GetMenuData() {
    debugger;
    //let containAdmin = window.location.href.toLowerCase().indexOf('admin');
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
      //this.sideMenu = [...data.value];
      data.value.forEach(m => {
        permission = this.LoginUserDetail[0]["applicationRolePermission"].filter(r => r.applicationFeature.toLowerCase().trim() == m.Page.PageTitle.toLowerCase().trim()
        && m.Page.ParentId == 0)
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
        console.log("inside sidebar")
        this.tokenStorage.saveMenuData(this.sideMenu)
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


