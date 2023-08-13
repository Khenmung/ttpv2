import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { globalconstants } from '../../../shared/globalconstant';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { AuthService } from '../../../_services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit { PageLoading=true;
  loading = false;
  LoginUserDetail :any[]= [];
  changepwdForm: UntypedFormGroup;
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  mediaSub: Subscription;
  deviceXs: boolean;
  SelectedApplicationName='';
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  constructor(private servicework: SwUpdate,
    private authService: AuthService,
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

    if (this.LoginUserDetail.length == 0)
      this.route.navigate(['/auth/login']);
    else {
      //this.SelectedApplicationName = this.tokenService.gets
      this.changepwdForm = this.fb.group({
        ConfirmPassword: ['', [Validators.required, Validators.minLength(6)]],
        OldPassword: ['', [Validators.required, Validators.minLength(6)]],
        NewPassword: ['', [Validators.required, Validators.minLength(6)]]
      });
    }
  }
  gotohome() {
    this.route.navigate(['/dashboard']);
  }
  get f() {
    return this.changepwdForm.controls;
  }
  onSubmit(): void {
    var ConfirmPassword = this.changepwdForm.get("ConfirmPassword")?.value;
    var OldPassword = this.changepwdForm.get("OldPassword")?.value;
    var NewPassword = this.changepwdForm.get("NewPassword")?.value;
    var payload = {
      'UserId': this.LoginUserDetail[0]["userId"],
      'OldPassword': OldPassword,
      'NewPassword': NewPassword,
      'ConfirmPassword': ConfirmPassword
    }
    debugger;
    this.authService.CallAPI(payload,'ChangePassword').subscribe(
      (data: any) => {
        ////console.log(data);
        this.isSuccessful = true;
        this.contentservice.openSnackBar("Password changed.",globalconstants.ActionText,globalconstants.BlueBackground);
        this.tokenService.signOut();
        this.route.navigate(['/auth/login']);
      },
      err => {
        if (err.error) {
          var modelState = err.error.errors ?err.error.errors:err.error.Errors?err.error.Errors:"";
          this.errorMessage = '';
          //THE CODE BLOCK below IS IMPORTANT WHEN EXTRACTING MODEL STATE IN JQUERY/JAVASCRIPT
          for (var key in modelState) {
            if (modelState.hasOwnProperty(key)) {
              this.errorMessage += (this.errorMessage == "" ? "" : this.errorMessage + "<br/>") + modelState[key];
              //errors.push(modelState[key]);//list of error messages in an array
            }
          }

          this.isSignUpFailed = true;
          //console.log(err.error)
        }
      }
    );
  }
  visibility = 'visibility';
  password='password';
  show=false;
  showhidePassword() {

    if (this.password === 'password') {
      this.password = 'text';
      this.show = true;
      this.visibility = 'visibility';
    } else {
      this.password = 'password';
      this.show = false;
      this.visibility = 'visibility_off';
    }

  }
}