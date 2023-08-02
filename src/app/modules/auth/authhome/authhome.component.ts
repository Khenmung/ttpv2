import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { UserService } from '../../../_services/user.service';
import { SharedataService } from '../../../shared/sharedata.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
@Component({
  selector: 'app-home',
  templateUrl: './authhome.component.html',
  styleUrls: ['./authhome.component.scss']
})
export class AuthHomeComponent implements OnInit { PageLoading=true;
  content?: string;
  mediaSub: Subscription;
  deviceXs: boolean;

  constructor(private servicework: SwUpdate,
    private userService: UserService,
    private shareddata: SharedataService,
    private dataservice: NaomitsuService,
    private mediaObserver: MediaObserver) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.mediaSub = this.mediaObserver.asObservable().subscribe((result: MediaChange[]) => {
      this.deviceXs = result[0].mqAlias === "xs" ? true : false;
      ////console.log("auth",this.deviceXs);
    });
  }
  
}