import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-confirmemail',
  templateUrl: './confirmemail.component.html',
  styleUrls: ['./confirmemail.component.scss']
})
export class ConfirmemailComponent implements OnInit { PageLoading=true;
  userId = '';
  code = '';
  loading = false;
  constructor(private servicework: SwUpdate,
    private route: Router,
    private aroute: ActivatedRoute,
    private authservice: AuthService,
    private contentservice: ContentService
  ) {

  }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    //this.aroute.queryParamMap.subscribe(qparam => {
    this.loading = true;

    this.aroute.paramMap.subscribe(params => {
      this.code =  params.get("code");
      this.userId = params.get("id");
      var payload = { "code": this.code, "userId": this.userId };
      this.authservice.CallAPI(payload, 'ConfirmEmail').subscribe((data: any) => {
        console.log("confirmemail data",data)
        localStorage.setItem("orgId", data.OrgId);
        localStorage.setItem("userId", data.Id);
        this.contentservice.openSnackBar("Email confirmation success! Please select your plan.", globalconstants.ActionText, globalconstants.BlueBackground);
        this.route.navigate(['/auth/selectplan']);
        this.loading = false; this.PageLoading=false;
      },
        err => {
          this.contentservice.openSnackBar("Email confirmation fail", globalconstants.ActionText, globalconstants.RedBackground);
          console.log("confirm email error", err);
          this.loading = false; this.PageLoading=false;
        });
    })

  }
}
