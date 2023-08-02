import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-singleorganization',
  templateUrl: './singleorganization.component.html',
  styleUrls: ['./singleorganization.component.scss']
})
export class SingleorganizationComponent implements OnInit { PageLoading=true;

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
