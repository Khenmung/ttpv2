import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-evaluationstatus',
  templateUrl: './evaluationstatus.component.html',
  styleUrls: ['./evaluationstatus.component.scss']
})
export class EvaluationstatusComponent implements OnInit {

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
