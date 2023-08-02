import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-right',
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.scss']
})
export class RightComponent implements OnInit { PageLoading=true;
  mediaSub: Subscription;
  deviceXs: boolean;
  constructor(private servicework: SwUpdate,private mediaObserver: MediaObserver) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    // this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
    //   this.deviceXs = result.mqAlias === "xs" ? true : false;
    // });
  }
}
