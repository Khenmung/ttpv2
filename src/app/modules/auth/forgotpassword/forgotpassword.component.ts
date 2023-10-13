import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { globalconstants } from '../../../shared/globalconstant';
import { AuthService } from '../../../_services/auth.service';
import { TokenStorageService } from '../../../_services/token-storage.service';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.scss']
})
export class ForgotpasswordComponent implements OnInit { PageLoading=true;
  loading = false;
  LoginUserDetail :any[]= [];
  forgotpwdForm: UntypedFormGroup;
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  mediaSub: Subscription;
  deviceXs: boolean;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  constructor(private servicework: SwUpdate,private authService: AuthService,
    private route: Router,
    private mediaObserver: MediaObserver,
    private fb: UntypedFormBuilder,
    private tokenService: TokenStorageService,
    private contentservice: ContentService
  ) { }

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

    this.LoginUserDetail = this.tokenService.getUserDetail();
    if (this.LoginUserDetail == null)
      this.route.navigate(['/auth/login']);
    else {
      this.forgotpwdForm = this.fb.group({
        email: ['', [Validators.required]]
      });
    }
  }
  gotohome() {
    this.route.navigate(['/dashboard']);
  }
  get f() {
    return this.forgotpwdForm.controls;
  }
  onSubmit(): void {
    var email = this.forgotpwdForm.get("email")?.value;    
    var payload = {
      'Email': email
    }
    this.loading=true;
    this.authService.CallAPI(payload,'ForgotPassword').subscribe(
      (data: any) => {
        //////console.log(data);
        this.loading=false;this.PageLoading=false;
        this.isSuccessful = true;
        this.contentservice.openSnackBar("Email sent to your register email address.",globalconstants.ActionText,globalconstants.BlueBackground);        
      },
      err => {
        var modelState;
        if (err.error.ModelState != null)
          modelState = JSON.parse(JSON.stringify(err.error.ModelState));
        else if (err.error != null)
          modelState = JSON.parse(JSON.stringify(err.error));
        else
          modelState = JSON.parse(JSON.stringify(err));

        //THE CODE BLOCK below IS IMPORTANT WHEN EXTRACTING MODEL STATE IN JQUERY/JAVASCRIPT
        for (var key in modelState) {
          if (modelState.hasOwnProperty(key) && key.toLowerCase() == 'errors') {
            for(var key1 in modelState[key])
            this.errorMessage += (this.errorMessage == "" ? "" : this.errorMessage + "<br/>") + modelState[key][key1];
            //errors.push(modelState[key]);//list of error messages in an array
          }
        }
        this.contentservice.openSnackBar(this.errorMessage,globalconstants.ActionText,globalconstants.RedBackground);
        this.isSignUpFailed = true;
        this.loading=false;this.PageLoading=false;
        ////console.log(err.error)
      }
      //err => {      
        // if (err.error) {
        //   var modelState = err.error.errors;
        //   this.errorMessage = '';
        //   //THE CODE BLOCK below IS IMPORTANT WHEN EXTRACTING MODEL STATE IN JQUERY/JAVASCRIPT
        //   for (var key in modelState) {
        //     if (modelState.hasOwnProperty(key)) {
        //       this.errorMessage += (this.errorMessage == "" ? "" : this.errorMessage + "<br/>") + modelState[key];
        //       //errors.push(modelState[key]);//list of error messages in an array
        //     }
        //   }

        //   this.isSignUpFailed = true;
        //   ////console.log(err.error)
        // }
      //}
    );
  }
}
