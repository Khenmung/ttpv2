import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { NaomitsuService } from '../../databaseService';
import { globalconstants } from '../../globalconstant';
import { List } from '../../interface';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.scss']
})
export class LandingpageComponent implements OnInit { 
  loading=false;
  PageLoading=true;
  images=[];
  constructor(private servicework: SwUpdate,private route:Router,
    private naomitsuService:NaomitsuService,
    private dataStorage:TokenStorageService) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
  }
  getRandomDisplayPhotoes() {
    let list: List = new List();
    list.fields = ["FileId", "FileName", "ParentId"];
    list.PageName = "StorageFnPs";
    list.filter = ['Active eq 1 and FileOrPhoto eq 0'];//  eq ' + this.searchForm.get("FilesNPhoto").value];
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        //this.images =
        let RandomImagesParentId = data.value.filter(image => {
          return image.FileName.toLowerCase() == "random images"
        });
        if (RandomImagesParentId.length > 0) {
          this.images = data.value.filter(rimg => rimg.ParentId == RandomImagesParentId[0].FileId)
            .map(element => {
              return globalconstants.apiUrl + "/Image/random images/" + element.FileName

            });
          this.dataStorage.saveRandomImages(this.images);
          //this.AssignImageUrl(photoPath);
        }
      })
  }
  home()
  {
    this.route.navigate(['/home/display/0/0']);
  }
}
