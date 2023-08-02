import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
    PageLoading = true;
  loading = false;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  SuccessMessage = '';
  title: string;
  Id: number = 0;
  ContactForm = new UntypedFormGroup({
    Name: new UntypedFormControl("", [Validators.required, Validators.maxLength(25)]),
    Email: new UntypedFormControl("", [Validators.required, Validators.email, Validators.maxLength(25)]),
    Subject: new UntypedFormControl("", [Validators.required, Validators.maxLength(25)]),
    MessageBody: new UntypedFormControl("", [Validators.required, Validators.maxLength(250)]),
    CreatedDate: new UntypedFormControl(new Date()),
    Active: new UntypedFormControl(1),
    MessageId: new UntypedFormControl(0),
    OrgId: new UntypedFormControl(0),
    SubOrgId: new UntypedFormControl(0)
  });

  constructor(private servicework: SwUpdate, private naomitsuService: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private route: Router,
    private activeUrl: ActivatedRoute) {
    this.activeUrl.paramMap.subscribe(params => {
      this.Id = +params.get("id");
      ////console.log("id",this.Id);
    })
  }
  LoginUserDetail = [];
  SubOrgId = 0;
  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail.length != 0) {
      // this.UserId = this.LoginUserDetail[0]["userId"];
      // this.OrgId = this.LoginUserDetail[0]["orgId"];
      this.SubOrgId = this.tokenStorage.getSubOrgId();
    }
    if (this.Id > 0) {
      this.title = "Message";
      this.GetContactEntry();
    }
    else
      this.title = "Contact Us";

  }
  get f() { return this.ContactForm.controls; }

  onSubmit() {
    this.insert();
  }

  updateAsRead() {

    let messageDetail = {
      Active: 1,
      CreatedDate: new Date()
    }
    this.naomitsuService.postPatch('Messages', messageDetail, this.Id, 'patch')
      .subscribe(
        (data: any) => {
          //this.contentservice.openSnackBar("Message updated!", this.options);
        })
  }
  insert() {
    debugger;
    if(this.LoginUserDetail)
    {
      this.ContactForm.patchValue({"OrgId":this.LoginUserDetail[0]["orgId"]})
      this.ContactForm.patchValue({"SubOrgId":this.LoginUserDetail[0]["subOrgId"]})
    }
    else
    {
      this.ContactForm.patchValue({"OrgId":0})
      this.ContactForm.patchValue({"SubOrgId":0})
    }
    this.naomitsuService.postPatch('Messages', this.ContactForm.value, 0, 'post')
      .subscribe(
        (data: any) => {
          //this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.SuccessMessage = "We have received your message! Thank you for contacting us.";
          //this.route.navigate(["/home"]);
        },
        (error) => {
          //console.log('messages page', error);
        });
  }
  GetContactEntry() {
    let list: List = new List();
    list.fields = ["MessageId", "Name", "Email", "Subject", "MessageBody", "Active", "CreatedDate"];
    list.PageName = "Messages";
    list.filter = ["MessageId eq " + this.Id];
    //list.orderBy = "MessageId desc";
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        this.ContactForm.setValue(data.value[0]);
        this.updateAsRead();
      });

  }
  back() {
    this.route.navigate(['/home/messages']);
  }

}
