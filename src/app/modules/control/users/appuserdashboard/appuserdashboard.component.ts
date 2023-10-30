//import { DatePipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { ContentService } from '../../../../shared/content.service';
import { NaomitsuService } from '../../../../shared/databaseService';
import { globalconstants } from '../../../../shared/globalconstant';
import { List } from '../../../../shared/interface';
import { SharedataService } from '../../../../shared/sharedata.service';
import { AuthService } from '../../../../_services/auth.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';

@Component({
  selector: 'app-appuserdashboard',
  templateUrl: './appuserdashboard.component.html',
  styleUrls: ['./appuserdashboard.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AppuserdashboardComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("container") container: ElementRef;
  @ViewChild("table") mattable;
  loading = false;
  errorMessage = '';
  Permission = '';
  Users: IUser[]= [];
  filteredOptions: Observable<IUser[]>;
  FilterOrgSubOrg = '';
  allMasterData :any[]= [];
  Organizations :any[]= [];
  Departments :any[]= [];
  Locations :any[]= [];
  Roles :any[]= [];
  LoginDetail :any[]= [];
  UserDetail :any[]= [];
  Classes :any[]= [];
  RoleUserList :any[]= [];
  OrgIdAndBatchIdFilter = '';
  SelectedApplicationId = 0;
  SubOrgId = 0;
  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any;
  datasource: MatTableDataSource<IAppUser>;
  displayedColumns = [
    'FirstName',
    'EmailAddress',
    //'PhoneNumber',
    'ValidFrom',
    //'ValidTo',
    'Active',
    'Action'
  ]
  AppUsersData = {
    Id: '',
    UserName: '',
    Email: '',
    PhoneNumber: '',
    OrganizationName: '',
    RoleName: '',
    Password: '',
    ValidTo: new Date(),
    Active: 1,
  }

  EducationManagement = 'education management';
  EmployeeManagement = 'employee management';
  RoleName = '';
  Password = '';
  UserId = 0;
  AppUsers :any[]= [];
  UserTypes :any[]= [];
  SelectedApplicationName = '';
  searchForm: UntypedFormGroup;
  constructor(
    private contentservice: ContentService,
    private shareddata: SharedataService,
    private fb: UntypedFormBuilder,
    private route: Router,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,
    private authservice: AuthService,
    private dialog: MatDialog
  ) { }
  ngOnInit() {
    this.searchForm = this.fb.group({
      searchUserName: [''],
      searchClassId: [0]
    })
    this.filteredOptions = this.searchForm.get("searchUserName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.FirstName),
        map(FirstName => FirstName ? this._filter(FirstName) : this.Users.slice())
      )!;
    this.OrgIdAndBatchIdFilter = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    this.PageLoad();
  }
  private _filter(FirstName: string): IUser[] {

    const filterValue = FirstName.toLowerCase();
    return this.Users.filter(option => option.FirstName.toLowerCase().includes(filterValue));

  }
  displayFn(user: IUser): string {
    return user && user.FirstName ? user.FirstName : '';
  }
  PageLoad() {
    debugger;
    this.loading = true;

    this.LoginDetail = this.tokenStorage.getUserDetail();
    if (this.LoginDetail == null || this.LoginDetail.length == 0)
      this.route.navigate(['/auth/login']);
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.APPLICATIONFEATUREPERMISSION);
    if (perObj.length > 0)
      this.Permission = perObj[0].permission;
    if (this.Permission != 'deny') {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.SelectedApplicationName = this.tokenStorage.getSelectedAppName()!;
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
        if(data.value) this.Classes = [...data.value]; else this.Classes = [...data];
        this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
      });
      this.GetMasterData();
    }

  }

  GetMasterData() {

    // this.contentservice.GetCommonMasterData(this.LoginDetail[0]["orgId"], this.SubOrgId, this.SelectedApplicationId)
    //   .subscribe((data: any) => {
        this.allMasterData =this.tokenStorage.getMasterData()!;// [...data.value];
        this.Roles = this.getDropDownData(globalconstants.MasterDefinitions.common.ROLE);
        this.UserTypes = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.USERTYPE);
        this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.DEPARTMENT);
        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.LOCATION);
        this.shareddata.ChangeRoles(this.Roles);
        this.shareddata.ChangeDepartment(this.Departments);
        this.shareddata.ChangeLocation(this.Locations);
        this.shareddata.CurrentOrganization.subscribe(o => this.Organizations = o);
        this.shareddata.CurrentDepartment.subscribe(d => this.Departments = d);
        this.shareddata.CurrentLocation.subscribe(l => this.Locations = l);
        this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
          this.Classes = [...data.value.sort((a, b) => a.Sequence - b.Sequence)];
          if (this.SelectedApplicationName.toLowerCase() == this.EducationManagement) {
            this.RoleName = 'Student';
            this.Password = 'Student@1234';
            this.GetStudents();
            //this.GetEmployees();
          }
          else if (this.SelectedApplicationName.toLowerCase() == this.EmployeeManagement) {
            this.RoleName = 'Employee'
            this.Password = 'Employee@1234';
            this.GetEmployees();
          }
          this.loading = false;
          this.PageLoading = false;
        })

        //this.GetRoleUser();
    //  });
  }
  OnClassSelected() {

    if (this.SelectedApplicationName.toLowerCase() == this.EducationManagement) {
      var _classId = this.searchForm.get("searchClassId")?.value;
      if (_classId == 0) {
        this.loading = false;
        this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    
      this.GetStudents();
    }
    else if (this.SelectedApplicationName.toLowerCase() == this.EmployeeManagement) {
      this.GetEmployees();
    }
    this.ClearData();
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

  search() {

  }
  SetUser(value) {
    this.UserId = value;
    this.container.nativeElement.style.backgroundColor = "";
    this.mattable._elementRef.nativeElement.style.backgroundColor = "";
  }
  view(element) {
    //////console.log('this.mattable', this.mattable);
    this.UserId = element.UserId;
    this.container.nativeElement.style.backgroundColor = "grey";
    this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
  }
  GetUsers() {

    let list: List = new List();
    list.fields = [
      'Id',
      'UserName',
      'Email',
      'Active'
    ];

    list.PageName = "AuthManagement";
    list.filter = [this.FilterOrgSubOrg];
    this.authservice.get(list)
      .subscribe((data: any) => {
        this.Users = [];

        this.UserDetail.forEach(userdetail => {
          if (userdetail.EmailAddress != null) {
            var existinglogin = data.filter((f:any) => f.Email.toLowerCase() == userdetail.EmailAddress.toLowerCase());
            if (existinglogin.length > 0) {
              this.Users.push(
                {
                  Id: existinglogin[0].Id,
                  UserName: existinglogin[0].UserName,
                  FirstName: userdetail.FirstName,
                  Email: existinglogin[0].Email,
                  Active: existinglogin[0].Active
                }
              )
            }
            else {
              this.Users.push(
                {
                  Id: '',
                  UserName: userdetail.FirstName.replaceAll(' ', ''),
                  FirstName: userdetail.FirstName,
                  Email: userdetail.EmailAddress,
                  Active: 0
                }
              )
            }
          }
          // data.forEach(userdetail => {
          //   var existinglogin = this.Users.filter((f:any) => f.Email.toLowerCase() == userdetail.Email.toLowerCase());
          //   if (existinglogin.length == 0) {
          //     this.Users.push(
          //       {
          //         Id: userdetail.Id,
          //         UserName: userdetail.UserName,
          //         Email: userdetail.Email,
          //         Active: userdetail.Active
          //       }
          //     )
          //   }
          // })
        })
        this.loading = false; this.PageLoading = false;
      })
  }
  onBlur(row) {
    debugger;
    row.Action = true;
  }
  GetRoleUsers() {
    debugger;
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "RoleId",
      "UserId"
    ];
    list.PageName = "RoleUsers";
    list.filter = ["Active eq 1 and " + this.OrgIdAndBatchIdFilter];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.RoleUserList = data.value.map(f => {
          f.RoleName = this.Roles.filter(r => r.MasterDataId == f.RoleId)[0].MasterDataName;
          return f;
        })
      })
  }
  GetEmployees() {
    debugger;
    this.loading = true;
    //let filterStr = " and OrgId eq " + this.LoginDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
      "EmpEmployeeId",
      "FirstName",
      "LastName",
      "EmailAddress",
    ];
    list.PageName = "EmpEmployees";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1 and EmailAddress ne ''"];
    this.UserDetail = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        data.value.forEach(employee => {
          var _lastname = employee.LastName == null ? '' : " " + employee.LastName;
          employee.LastName = _lastname;
          employee.FullName = employee.FirstName + _lastname;
          this.UserDetail.push(employee);
          //}
        })
        this.GetUsers()
      });
  }
  GetStudents() {
    debugger;
    this.loading = true;
    var _classId = this.searchForm.get("searchClassId")?.value;
    let filterStr = " and ClassId eq " + _classId;

    // let list: List = new List();
    // list.fields = [
    //   "StudentClassId",
    //   "ClassId",
    //   "RollNo",
    //   "SectionId",
    //   "OrgId"
    // ];
    // list.PageName = "StudentClasses";
    // //list.lookupFields = ["Student($select=ContactNo,UserId,StudentId,FirstName,LastName,EmailAddress)"];
    // list.filter = [this.OrgIdAndBatchIdFilter + " and Active eq 1" + filterStr];
    // this.UserDetail = [];
    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    debugger;
    var _students: any = this.tokenStorage.getStudents()!;
    this.UserDetail = [];
    //_students = _students.filter(student => data.value.findIndex(fi => fi.StudentId == student.StudentId) > -1);
    _students = _students.filter(student => student.StudentClasses.findIndex(e => e.ClassId == _classId) > -1);

    _students.forEach(student => {

      var _lastname = student.LastName == null ? '' : " " + student.LastName;
      //var matchstudcls = data.value.filter(d => d.StudentId == student.StudentId);
      
      if (student.EmailAddress != null && student.EmailAddress.length > 0) {
        student.ClassName = this.Classes.filter(c => c.ClassId == student.StudentClasses[0].ClassId)[0].ClassName;
        student.EmailAddress = student.EmailAddress;
        student.FullName = student.FirstName + _lastname;
        student.FirstName = student.FirstName.replaceAll(' ', '');
        student.ContactNo = student.ContactNo;
        this.UserDetail.push(student);
      }
    })
    this.GetUsers()
    //});
  }
  GetAppUsers() {
    // this.authservice.CallAPI("","SendSMS").subscribe((data:any)=>{
    //   //console.log("res",data);
    // })

    //this.contentservice.openSnackBar(this.authservice.CallAPI("","SendSMS"),)
    debugger;
    this.loading = true;
    let filterStr = this.FilterOrgSubOrg;// "OrgId eq " + this.LoginDetail[0]["orgId"];
    var searchObj = this.searchForm.get("searchUserName")?.value;
    if (searchObj != "") {
      filterStr += " and Email eq '" + searchObj.Email + "'";
    }

    // var _userTypeId = 0;
    // if (this.SelectedApplicationName.toLowerCase() == this.EducationManagement)
    //   _userTypeId = this.UserTypes.filter((f:any) => f.MasterDataName.toLowerCase() == 'student')[0].MasterDataId;
    // else if (this.SelectedApplicationName.toLowerCase() == this.EmployeeManagement)
    //   _userTypeId = this.UserTypes.filter((f:any) => f.MasterDataName.toLowerCase() == 'employee')[0].MasterDataId;

    // filterStr += " and UserTypeId eq " + _userTypeId;

    let list: List = new List();
    list.fields = [
      "Id",
      "UserName",
      "Email",
      "PhoneNumber",
      "OrgId",
      "ValidFrom",
      "ValidTo",
      "UserTypeId",
      "Active",
    ];
    list.PageName = "AuthManagement";
    list.filter = [filterStr];

    this.authservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.AppUsers = [];
        //var _UserName ='';
        if (data.length > 0) {

          this.UserDetail.forEach(filteredstudent => {
            if (filteredstudent.EmailAddress) {
              var exist = data.filter(d => d.Email.toLowerCase() == filteredstudent.EmailAddress.toLowerCase());
              if (exist.length > 0) {
                this.AppUsers.push({
                  "Id": exist[0].Id,
                  "UserName": exist[0].UserName,
                  "FirstName": filteredstudent.FirstName,
                  "EmailAddress": exist[0].Email,
                  "PhoneNumber": exist[0].PhoneNumber,
                  "OrgId": exist[0].OrgId,
                  "ValidFrom": exist[0].ValidFrom,
                  "ValidTo": exist[0].ValidTo,
                  "Active": exist[0].Active,
                  "Action": false
                });
              }
            }
          })
        }
        else {
          var newlogin = this.UserDetail.filter((f:any) => f.EmailAddress == searchObj.Email);
          var today = new Date();
          newlogin.forEach(login => {

            this.AppUsers.push({
              "Id": "",
              "UserName": login.FirstName.replaceAll(' ', ''),
              "FirstName": login.FirstName,
              "EmailAddress": login.EmailAddress,
              "PhoneNumber": login.ContactNo,
              "OrgId": login.OrgId,
              "ValidFrom": today,
              "ValidTo": today.setDate(today.getDate() + 30),
              "Active": 0,
              "Action": false
            });
          });
        }
        ////console.log("this.AppUsers", this.AppUsers)
        if (this.AppUsers.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.datasource = new MatTableDataSource<IAppUser>(this.AppUsers);
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      }, err => {
        debugger;
        this.loading = false; this.PageLoading = false;
        this.errorMessage = '';
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
            for (var key1 in modelState[key])
              this.errorMessage += (this.errorMessage == "" ? "" : this.errorMessage + "<br/>") + modelState[key][key1];
            //errors.push(modelState[key]);//list of error messages in an array
          }
        }
        this.contentservice.openSnackBar(this.errorMessage, globalconstants.ActionText, globalconstants.RedBackground);
      });

  }
  ClearData() {
    this.AppUsers = [];
    this.datasource = new MatTableDataSource<IAppUser>(this.AppUsers);
  }
  Delete(row) {

    this.openDialog(row)
  }
  openDialog(row) {
    debugger;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Save',
          cancel: 'No'
        }
      }
    });

    dialogRef.afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.UpdateAsDeleted(row);
        }
      });
  }
  UpdateAsDeleted(row) {
    debugger;
    let toUpdate = {
      Id: row.Id,
      UserName: row.UserName,
      Email: row.Email,
      Active: 0,
      UpdatedDate: new Date()
    }
    this.authservice.CallAPI(toUpdate, 'UpdateUser')
      //this.dataservice.postPatch('MasterItems', toUpdate, row.MasterDataId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  updateActive(row, value) {
    row.Active = value.checked ? 1 : 0;
    row.Action = true;
  }

  onSave(row): void {
    this.errorMessage = '';
    //debugger;
    var userDetail = {
      ConfirmPassword: row.ConfirmPassword,
      Email: row.Email,
      Password: row.Password,
      Username: row.UserName,
      OrganizationName: this.LoginDetail[0]['org'],
      ContactNo: row.ContactNo
    }
    this.authservice.CallAPI(userDetail, 'Register').subscribe(
      data => {
        //this.AddAppUsers()
        this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
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
          if (modelState.hasOwnProperty(key) && key == 'errors') {
            this.errorMessage += (this.errorMessage == "" ? "" : this.errorMessage + "<br/>") + modelState[key];
            //errors.push(modelState[key]);//list of error messages in an array
          }
        }

      }
    );
  }
  // Delete(row) {
  //   this.contentservice.openDialog({},0)
  //     .subscribe((confirmed: boolean) => {
  //       if (confirmed) {
  //         this.contentservice.SoftDelete('AuthManagement',{}, row.MasterDataId)
  //           .subscribe((data: any) => {
  //             row.Action = false;
  //             this.loading = false; this.PageLoading=false;
  //             var idx = this.AppUsers.findIndex(x => x.MasterDataId == row.MasterDataId)
  //             this.AppUsers.splice(idx, 1);
  //             this.datasource = new MatTableDataSource<any>(this.AppUsers);
  //             this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
  //           },
  //             err => {
  //               this.contentservice.openSnackBar("error in data deletion: " + err, globalconstants.ActionText, globalconstants.RedBackground);
  //             }
  //           )
  //       }

  //     });
  // }
  UpdateOrSave(row) {
    //debugger;

    let ErrorMessage = '';
    // if (this.AppUsersForm.get("ContactNo")?.value == 0) {
    //   ErrorMessage += "Please select contact.<br>";
    // }
    if (row.UserName.length == 0) {
      ErrorMessage += "Name is required.\n";
    }
    if (row.EmailAddress.length == 0) {
      ErrorMessage += "Email is required.\n";
    }

    if (ErrorMessage.length > 0) {
      //this.contentservice.openSnackBar(errorMessage,globalconstants.ActionText,globalconstants.RedBackground);
      this.contentservice.openSnackBar(ErrorMessage, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    this.AppUsersData.Active = row.Active;
    this.AppUsersData.Id = row.Id;
    this.AppUsersData.UserName = row.EmailAddress;
    this.AppUsersData.Email = row.EmailAddress;
    this.AppUsersData.PhoneNumber = row.PhoneNumber;
    this.AppUsersData.OrganizationName = this.LoginDetail[0]['org'];
    this.AppUsersData.RoleName = this.RoleName;
    this.AppUsersData.Password = this.Password;

    this.AppUsersData.ValidTo = new Date(row.ValidTo);
    ////console.log('this.AppUsersData', this.AppUsersData)
    if (row.Id == '')
      this.insert(row);
    else {
      this.update(row);
    }

  }
  tabChanged($event) {

  }
  insert(row) {

    //debugger;
    this.authservice.CallAPI(this.AppUsersData, 'Register')
      .subscribe(
        (data: any) => {
          row.Action = false;
          row.Id = data.UserId;
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        }, err => {
          debugger;
          this.loading = false; this.PageLoading = false;
          this.errorMessage = '';
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
              for (var key1 in modelState[key])
                this.errorMessage += (this.errorMessage == "" ? "" : this.errorMessage + "<br/>") + modelState[key][key1];
              //errors.push(modelState[key]);//list of error messages in an array
            }
          }
          this.contentservice.openSnackBar(this.errorMessage, globalconstants.ActionText, globalconstants.RedBackground);
        });

  }
  update(row) {

    this.authservice.CallAPI(this.AppUsersData, 'UpdateUser')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground)
        });
  }
}
export interface IAppUser {
  Id: string;
  UserName: string;
  Email: string;
  PhoneNumber: string;
  ValidFrom: Date;
  ValidTo: Date;
  OrgName: string;
  UserTypeId: number;
  Active: number;
}
export interface IUser {
  Id: string;
  UserName: string;
  FirstName: string;
  Email: string;
  Active: number;
  //Action:boolean;
}