import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-studentactivityhome',
  templateUrl: './studentactivityhome.component.html',
  styleUrls: ['./studentactivityhome.component.scss']
})
export class StudentactivityhomeComponent implements OnInit {

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
