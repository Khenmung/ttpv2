import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { globalconstants } from '../../globalconstant';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  

 
  PageLoading = true;
  @Input() deviceXs: boolean;
  @Output() toggleSideBarForme: EventEmitter<any> = new EventEmitter();
  scrollTop = 0;
  hideNav = false;

  CompanyName = '';
  loading: false;
  userName: string = '';
  logoPath = '';
  loggedIn: boolean;
  OrganizationName = '';
  SelectedApplicationName = '';
  SelectedBatchName = '';
  LoginUserDetails :any[]= [];
  SubOrgId = 0;
  constructor(
    private route: Router,
    private tokenStorage: TokenStorageService
  ) {
  }

  ngOnInit(): void {
    debugger;
    
    this.LoginUserDetails = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetails.length == 0) {
      this.loggedIn = false;
      this.logoPath = "assets/images/ttplogo1.png"
      //this.route.navigate(["/auth/login"]);
    }
    else {
      this.loggedIn = true;
      this.userName = localStorage.getItem('email')!;
      this.logoPath = this.LoginUserDetails[0].logoPath;
      if (this.logoPath == undefined) {
        this.logoPath = "assets/images/ttplogo1.png"
      }
      this.OrganizationName = this.LoginUserDetails[0].org
      var SelectedApplicationId = this.tokenStorage.getSelectedAPPId();
      this.CompanyName = this.tokenStorage.getCompanyName()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.SelectedApplicationName = '';

      var PermittedApplications = this.tokenStorage.getPermittedApplications();
      if (PermittedApplications != '') {
        var apps = PermittedApplications.filter((f:any) => f.applicationId == SelectedApplicationId)

        if (apps.length > 0) {

          this.SelectedBatchName = this.tokenStorage.getSelectedBatchName()!;
          this.SelectedApplicationName = apps[0].applicationName + (this.SelectedBatchName == '' ? '' : ' - ' + this.SelectedBatchName)
        }
      }
    }
  }

  //   private scrollChangeCallback: () => void;
  // currentPosition: any;
  // startPosition: number;

  // ngAfterViewInit() {
  //   this.scrollChangeCallback = () => this.onContentScrolled(event);
  //   window.addEventListener('scroll', this.scrollChangeCallback, true);
  // }

  //  onContentScrolled(e) {
  //   this.startPosition = e.srcElement.scrollTop;
  //   let scroll = e.srcElement.scrollTop;
  //   if (scroll > this.currentPosition) {
  //     console.log("down")
  //   } else {
  //     console.log("up")
  //   }
  //   this.currentPosition = scroll;
  // }

  // ngOnDestroy() {
  //   window.removeEventListener('scroll', this.scrollChangeCallback, true);
  // }
  features(){
    this.route.navigate(["/auth/aboutttp"]);
  }

  changepassword() {
    this.route.navigate(["/auth/changepassword"]);
  }
  gotoLogin() {
    this.route.navigate(["/auth/login"]);
  }
  createlogin() {
    this.route.navigate(["/auth/signup"]);
  }
  addUser() {
    this.route.navigate(["/auth/signup"]);
  }
  logout() {
    //debugger;
    this.tokenStorage.signOut();
    this.route.navigate(['/auth/login']);
  }
  contactus() {
    this.route.navigate(["/edu/setting/addmessage"]);
  }
  home() {
    this.route.navigate(["/home/"]);
  }
  // newsNEvents() {
  //   this.route.navigate(['/home/about/' + this.NewsNEventPageId]);
  // }
  goto(page) {
    this.route.navigate(['/' + page]);
  }

}
