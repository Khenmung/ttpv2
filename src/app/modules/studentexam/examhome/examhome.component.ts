import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-examhome',
  templateUrl: './examhome.component.html',
  styleUrls: ['./examhome.component.scss']
})
export class ExamhomeComponent implements OnInit { PageLoading=true;

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

}
