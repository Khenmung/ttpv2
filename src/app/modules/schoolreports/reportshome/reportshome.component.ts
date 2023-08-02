import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-reportshome',
  templateUrl: './reportshome.component.html',
  styleUrls: ['./reportshome.component.scss']
})
export class reportshomeComponent implements OnInit { PageLoading=true;
  openSideBar =true;
  constructor(private servicework: SwUpdate,) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
  }
  sideBarToggler(){
    this.openSideBar =!this.openSideBar;
  }
}
