import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { TokenStorageService } from '../../../_services/token-storage.service';
//import { TokenStorageService } from '../_services/token-storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit { PageLoading=true;
  currentUser: any;

  constructor(private servicework: SwUpdate,private token: TokenStorageService) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.currentUser = this.token.getUser();
  }
}
