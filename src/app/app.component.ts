import { Component, OnDestroy, OnInit } from '@angular/core';
import { TokenStorageService } from './_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { ConnectionService } from 'ng-connection-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'school';
  private roles: string[] = [];
  isLoggedIn = false;
  showAdminBoard = false;
  showModeratorBoard = false;
  username?: string;
 
  constructor(
    private tokenStorageService: TokenStorageService,
    private servicework: SwUpdate
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
    this.isLoggedIn = !!this.tokenStorageService.getToken();

  }
  ngOnDestroy() {

  }

  logout(): void {
    this.tokenStorageService.signOut();
    window.location.reload();
  }

}
