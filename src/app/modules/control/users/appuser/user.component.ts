import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class userComponent implements OnInit { PageLoading=true;
loading=false;
  @Input("UserId") UserId:number;
@Output() UserIdOutput=new EventEmitter();

title ='';
  breakpoint = 0;
  SaveDisable = false;
  allMasterData = [];
  AppUsers = [];
  Departments=[];
  Locations=[];
  AppUsersForm: UntypedFormGroup;
  AppUsersData = {
    ApplicationUserId: 0,
    UserName: '',
    EmailAddress: 0,
    Address: 0,
    ContactNo: '',
    ValidFrom: Date,
    ValidTo: Date,
    OrgId: 0,SubOrgId: 0,
    DepartmentId: 0,
    LocationId: 0,
    ManagerId: 0,
    Remarks: '',
    CreatedDate: new Date(),
    UpdatedDate: new Date(),
    CreatedBy: 0,
    UpdatedBy: 0,
    Active: 1,
  }
  selectedIndex = 0;
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private contentservice: ContentService,
    private tokenStorage:TokenStorageService,
    private fb: UntypedFormBuilder,
    private sharedData: SharedataService) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 3;
    ////console.log('breakpoint',this.breakpoint);
    this.title=this.UserId>0?'Update Detail':'Add User';
    var date = new Date();
    var validto = date.setDate(date.getDate() + globalconstants.TrialPeriod);
    this.AppUsersForm = this.fb.group({
      ApplicationUserId: [0],
      UserName: ['', [Validators.required]],
      EmailAddress: ['', [Validators.required]],
      Address: [''],
      ContactNo: ['', [Validators.required]],
      ValidFrom: [new Date()],
      ValidTo: [validto],
      OrgId: [0],
      DepartmentId: [null],
      LocationId: [null],
      ManagerId: [null],
      Remarks: [''],
      Active: [1],
    });
    this.sharedData.CurrentLocation.subscribe(d => this.Locations = d);
    this.sharedData.CurrentDepartment.subscribe(d => this.Departments = d);

    this.GetAppUsers();
  }
  PageLoad() {
    ////debugger;
    //this.GetAppUsers();
  }
  get f() { return this.AppUsersForm.controls }


  GetAppUsers() {

    var filterstr = '';
    if (this.UserId > 0) {
      filterstr = ' and ApplicationUserId eq ' + this.UserId;
    }
    else
      return;

    let list: List = new List();
    list.fields = ["*"];
    list.PageName = "AppUsers";
    list.filter = ["Active eq 1" + filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.AppUsers = [...data.value];
          this.AppUsers.forEach(item => {
            this.AppUsersForm.patchValue({
              ApplicationUserId: item.ApplicationUserId,
              UserName: item.UserName,
              EmailAddress: item.EmailAddress,
              Address: item.Address,
              ContactNo: item.ContactNo,
              ValidFrom: item.ValidFrom,
              ValidTo: item.ValidTo,
              OrgId: item.OrgId,
              DepartmentId: item.DepartmentId,
              LocationId: item.LocationId,
              ManagerId: item.ManagerId,
              Remarks: item.Remarks,
              Active: item.Active
            })
          });
        }
        else
          this.contentservice.openSnackBar("Problem fetching app users",globalconstants.ActionText,globalconstants.RedBackground);
      });

  }
  checkDuplicate(value) {
    var today = new Date();

    let list: List = new List();
    list.fields = ["ApplicationUserId"];
    list.PageName = "AppUsers";
    list.filter = ["EmailAddress eq '" + value + "' and Active eq 1"];

    this.dataservice.get(list)
      .subscribe(
        (data: any) => {
               if(data.value.length>0)
               {
                 this.AppUsersForm.get("Email").setErrors({'duplicate':true})
               }                     
        })
  }
  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 3;
  }
  back() {
    this.UserIdOutput.emit(0);
    
    //this.nav.navigate(['/admin/dashboardstudent']);
  }
  UpdateOrSave() {
    //debugger;

    let ErrorMessage = '';

    // if (this.AppUsersForm.get("ContactNo").value == 0) {
    //   ErrorMessage += "Please select contact.<br>";
    // }
    if (this.AppUsersForm.get("UserName").value == 0) {
      ErrorMessage += "User name is required.<br>";
    }
    if (this.AppUsersForm.get("EmailAddress").value == 0) {
      ErrorMessage += "Please enter email Id.<br>";
    }

    if (ErrorMessage.length > 0) {
      this.contentservice.openSnackBar(ErrorMessage,globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    else {
      this.AppUsersData.Active = 1;
      this.AppUsersData.UserName = this.AppUsersForm.get("UserName").value;
      this.AppUsersData.EmailAddress = this.AppUsersForm.get("EmailAddress").value;
      this.AppUsersData.Address = this.AppUsersForm.get("Address").value;
      this.AppUsersData.ContactNo = this.AppUsersForm.get("ContactNo").value;
      this.AppUsersData.ValidFrom = this.AppUsersForm.get("ValidFrom").value;
      this.AppUsersData.ValidTo = this.AppUsersForm.get("ValidTo").value;
      if (this.UserId == 0)
        this.AppUsersData.OrgId = null;//this.AppUsersForm.get("OrgId").value;
      else
        this.AppUsersData.OrgId = this.AppUsersForm.get("OrgId").value;
      
        this.AppUsersData.DepartmentId = this.AppUsersForm.get("DepartmentId").value;
      this.AppUsersData.LocationId = this.AppUsersForm.get("LocationId").value;
      this.AppUsersData.ManagerId = this.AppUsersForm.get("ManagerId").value;
      this.AppUsersData.Remarks = this.AppUsersForm.get("Remarks").value;
      this.AppUsersData.CreatedBy = 0;
      this.AppUsersData.UpdatedBy = 0;
      this.AppUsersData.ApplicationUserId = this.UserId;
      //debugger;
      if (this.UserId == 0)
        this.insert();
      else {
        this.update();
      }
      
    }
  }
  tabChanged($event) {

  }
  insert() {

    //debugger;
    this.dataservice.postPatch('AppUsers', this.AppUsersData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.UserIdOutput.emit(0);
          this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          //this.router.navigate(['/home/pages']);
      
        });

  }
  update() {

    this.dataservice.postPatch('AppUsers', this.AppUsersData, this.UserId, 'patch')
      .subscribe(
        (data: any) => {
          this.UserIdOutput.emit(0);
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText,globalconstants.BlueBackground);
          //this.router.navigate(['/home/pages']);
        });
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
    // let Id = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    // })[0].MasterDataId;
    // return this.allMasterData.filter((item, index) => {
    //   return item.ParentId == Id
    // });
  }
}
