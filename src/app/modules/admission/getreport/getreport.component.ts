import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-getreport',
  templateUrl: './getreport.component.html',
  styleUrls: ['./getreport.component.scss']
})
export class GetreportComponent implements OnInit {
  PageLoading = true;
  Defaultvalue=0;
  

  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private datepipe: DatePipe,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private nav: Router,
    private fb: UntypedFormBuilder
  ) {

  }

  ngOnInit(): void {
  }

CurrentStudents:any=[];
PreviousStudents:any=[];
  PageLoad() {
    this.CurrentStudents = this.tokenStorage.getStudents();
    this.PreviousStudents = this.tokenStorage.getPreviousBatchStudents();
  }
  
}







