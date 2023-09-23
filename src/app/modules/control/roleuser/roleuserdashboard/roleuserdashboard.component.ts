import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NaomitsuService } from '../../../../shared/databaseService';
import { globalconstants } from '../../../../shared/globalconstant';
import { List } from '../../../../shared/interface';
import { SharedataService } from '../../../../shared/sharedata.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { map, startWith } from 'rxjs/operators';
import { AuthService } from '../../../../_services/auth.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ContentService } from '../../../../shared/content.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-roleuserdashboard',
  templateUrl: './roleuserdashboard.component.html',
  styleUrls: ['./roleuserdashboard.component.scss']
})
export class roleuserdashboardComponent implements OnInit {
  PageLoading = true;
  @ViewChild("table") mattable;
  @ViewChild("container") container: ElementRef;
  //@ViewChild(roleuseraddComponent, { static: false }) roleuseradd: roleuseraddComponent;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  loading = false;
  LoginUserDetail:any[]= [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  FeePayable = true;
  Defaultvalue=0;
  SelectedApplicationId = 0;
  Departments :any[]= [];
  Locations :any[]= [];
  Applications :any[]= [];
  Roles :any[]= [];
  RolesTemp :any[]= [];
  Users: IUser[]= [];
  filteredOptions: Observable<IUser[]>;
  RoleUserList: IRoleUsers[];
  dataSource: MatTableDataSource<IRoleUsers>;
  allMasterData :any[]= [];
  searchForm = this.fb.group({
    searchUserName: [''],
    searchRoleId: [0]
  });
  Permission = '';
  SelectedBatchId = 0;SubOrgId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  RoleUserId = 0;
  RoleUserData = {
    UserId: '',
    RoleUserId: 0,
    RoleId: 0,
    BatchId: 0,
    OrgId: 0,
    SubOrgId: 0,    
    Active: 1
  };
  displayedColumns = [
    'User',
    'RoleId',
    'Active',
    'Action'
  ];
  currentRoute = '';
  constructor(private servicework: SwUpdate, private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private authservice: AuthService,
    private nav: Router,
    private shareddata: SharedataService,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder) {
  }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.filteredOptions = this.searchForm.get("searchUserName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.UserName),
        map(UserName => UserName ? this._filter(UserName) : this.Users.slice())
      )!;
    //this.shareddata.CurrentSelectedBatchId.subscribe(s => this.SelectedBatchId = s);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.PageLoad();
  }
  private _filter(name: string): IUser[] {

    const filterValue = name.toLowerCase();
    return this.Users.filter(option => option.UserName.toLowerCase().includes(filterValue));

  }
  displayFn(user: IUser): string {
    return user && user.UserName ? user.UserName : '';
  }
  PageLoad() {
    //debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null || this.LoginUserDetail.length == 0) {

      this.tokenStorage.saveRedirectionUrl(window.location.pathname);
      this.nav.navigate(['/auth/login']);
    }
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.ROLEUSER);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.GetMasterData();
      }
    }

  }
  GetRoleUserId(event) {
    this.RoleUserId = event;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "";
    this.container.nativeElement.style.backgroundColor = "";
    this.GetRoleUser();
  }

  View(element) {
    this.RoleUserId = element.RoleUserId;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    this.container.nativeElement.style.backgroundColor = "grey";
    // setTimeout(() => {
    //   this.roleuseradd.PageLoad();
    // }, 50);

  }

  addnew() {
    var newdata = {
      RoleUserId: 0,
      UserId: this.searchForm.get("searchUserName")?.value.Id,
      User: this.searchForm.get("searchUserName")?.value.UserName,
      RoleId: 0,
      Role: '',
      Active: 0
    }
    this.RoleUserList.push(newdata);
    this.dataSource = new MatTableDataSource<IRoleUsers>(this.RoleUserList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ClearData() {
    this.RoleUserList = [];
    this.dataSource = new MatTableDataSource<IRoleUsers>(this.RoleUserList);
  }
  // removeadmin() {
  //   this.RolesTemp = this.Roles.filter((f:any) => f.MasterDataName != 'Admin');

  // }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Roles = this.getDropDownData(globalconstants.MasterDefinitions.common.ROLE);
    this.RolesTemp = [...this.Roles];
    this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.DEPARTMENT);
    this.Locations = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.LOCATION);

    this.shareddata.ChangeRoles(this.Roles);
    this.Applications = this.tokenStorage.getPermittedApplications();
    this.shareddata.ChangeDepartment(this.Departments);
    this.shareddata.ChangeLocation(this.Locations);
    this.GetUsers();
    this.loading = false; this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
    // let Id = 0;
    // let Ids = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    // })
    // if (Ids.length > 0) {
    //   Id = Ids[0].MasterDataId;
    //   return this.allMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   })
    // }
    // else
    //   return [];

  }
  GetUsers() {

    ////console.log(this.LoginUserDetail);

    let list: List = new List();
    list.fields = [
      'Id',
      'UserName',
      'Email'
    ];

    list.PageName = "AuthManagement";
    list.filter = [this.FilterOrgSubOrg];
    this.RoleUserList = [];

    this.authservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        if (data.length > 0) {
          this.Users = [...data];
        }
      })
  }
  GetRoleUser() {

    var filterstr = '';
    if (this.searchForm.get("searchUserName")?.value.Id != undefined)
      filterstr = " and UserId eq '" + this.searchForm.get("searchUserName")?.value.Id + "'"
    if (this.searchForm.get("searchRoleId")?.value > 0)
      filterstr = " and RoleId eq " + this.searchForm.get("searchRoleId")?.value

    this.loading = true;
    let list: List = new List();
    list.fields = [
      'RoleUserId',
      'UserId',
      'RoleId',
      'Active'];

    list.PageName = "RoleUsers";
    list.filter = [this.FilterOrgSubOrg  + filterstr];
    this.RoleUserList = [];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  //console.log('data.value', data.value);
        //var filteredUsers = data.value.filter(d => d.UserId == this.searchForm.get("searchUserName")?.value.ApplicationUserId)
        if (data.value.length > 0) {

          data.value.forEach(item => {
            var _roleName = '';
            var roleobj = this.Roles.filter(a => a.MasterDataId == item.RoleId);
            if (roleobj.length > 0)
              _roleName = roleobj[0].MasterDataName;

            var validuser = this.Users.filter(u => u.Id == item.UserId)
            //if (validuser.length > 0)
            validuser.forEach(v => {
              this.RoleUserList.push({
                RoleUserId: item.RoleUserId,
                UserId: item.UserId,
                User: v.Email,
                RoleId: item.RoleId,
                Role: _roleName,
                Active: item.Active
              });
            })
          });
        }
        else if (this.searchForm.get("searchUserName")?.value.Id != undefined) {
          this.RoleUserList.push({
            RoleUserId: 0,
            UserId: this.searchForm.get("searchUserName")?.value.Id,
            User: this.searchForm.get("searchUserName")?.value.UserName,
            RoleId: 0,
            Role: '',
            Active: 0
          })
          //this.contentservice.openSnackBar("No user role has been defined!",globalconstants.ActionText,globalconstants.RedBackground);
        }
        if (this.RoleUserList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<IRoleUsers>(this.RoleUserList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      });
  }

  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
  }
  onBlur(row) {

    var _selectedRoleObj = this.Roles.filter((f:any) => f.MasterDataId == row.RoleId);

    if (_selectedRoleObj.length > 0) {
      if (_selectedRoleObj[0].MasterDataName == 'Admin')
        this.contentservice.openSnackBar("Admin can not be assigned.", globalconstants.ActionText, globalconstants.RedBackground);
      else
        row.Action = true;
    }
  }

  UpdateOrSave(row) {

    //debugger;
    this.loading = true;

    if (row.RoleId == 0) {
      this.contentservice.openSnackBar("Please select role", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.CurrentBatch == 1 && row.Active == 0) {
      this.contentservice.openSnackBar("Current batch should be active!", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let checkFilterString = this.FilterOrgSubOrg + " and UserId eq '" + row.UserId + "' and RoleId eq " + row.RoleId;

    if (row.RoleUserId > 0)
      checkFilterString += " and RoleUserId ne " + row.RoleUserId;

    let list: List = new List();
    list.fields = ["RoleUserId"];
    list.PageName = "RoleUsers";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
          row.Ative = 0;
          this.loading = false; this.PageLoading = false;
          return;
        }
        else {

          this.RoleUserData.Active = row.Active;
          this.RoleUserData.RoleUserId = row.RoleUserId;
          this.RoleUserData.RoleId = row.RoleId;
          this.RoleUserData.UserId = row.UserId;
          this.RoleUserData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.RoleUserData.SubOrgId = this.SubOrgId;
          this.RoleUserData.BatchId = this.SelectedBatchId;
          if (this.RoleUserData.RoleUserId == 0) {
            this.RoleUserData["CreatedDate"] = new Date();
            this.RoleUserData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.RoleUserData["UpdatedDate"];
            delete this.RoleUserData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.RoleUserData["CreatedDate"];
            delete this.RoleUserData["CreatedBy"];
            this.RoleUserData["UpdatedDate"] = new Date();
            this.RoleUserData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('RoleUsers', this.RoleUserData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.RoleUserId = data.RoleUserId;
          this.loading = false; this.PageLoading = false;

          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch('RoleUsers', this.RoleUserData, this.RoleUserData.RoleUserId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

}
export interface IBatches {
  BatchId: number;
  BatchName: string;
  CurrentBatch: number;
  OrgId: number;SubOrgId: number;
  Active;
}

export interface IRoleUsers {

  RoleUserId: number;
  UserId: string;
  User: string;
  RoleId: number;
  Role: string;
  Active;
}
export interface IUser {
  Id: string;
  UserName: string;
  Email: string;
}

