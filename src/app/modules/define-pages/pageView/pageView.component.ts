import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';  
import { Router, ActivatedRoute, Params } from '@angular/router';  
import { ContentService } from '../../../shared/content.service';  

@Component({  
  selector: 'app-pageView',  
  templateUrl: './pageView.component.html',  
  styleUrls: ['./pageView.component.scss']  
})  

export class pageViewComponent implements OnInit { PageLoading=true;  
  res: any;  
  Title: any;  
  content: any;  
  constructor(private servicework: SwUpdate, private route: ActivatedRoute,private contentservice:ContentService) { }  
  ngOnInit() {  
  let Id = this.route.snapshot.queryParams["Id"]  
  this.GetcontentById(Id);  
  }  
  GetcontentById(Id:any)  
  {  
     this.contentservice.GetcontentById(Id).subscribe((data: any)=>{  
       this.res=data.value[0];  
       this.Title=this.res.PageHeader  
       this.content=this.res.PageBody  
       ////console.log(this.res);  
    });  
  }  
}  