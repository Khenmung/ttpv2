import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss']
})
export class FamilyComponent implements OnInit {
    PageLoading = true;

  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  SelectedApplicationId = 0;
  EmployeeFamilyListName = 'EmployeeFamilies';
  Applications = [];
  loading = false;
  SelectedBatchId = 0;SubOrgId = 0;
  EmployeeFamilyList: IFamily[] = [];
  filteredOptions: Observable<IFamily[]>;
  dataSource: MatTableDataSource<IFamily>;
  allMasterData = [];
  EmployeeFamilys = [];
  FamilyRelationship = [];
  Genders = [];
  Permission = 'deny';
  EmployeeId = 0;
  EmployeeFamilyData = {
    EmployeeFamilyId: 0,
    EmployeeId: 0,
    FamilyRelationShipId: 0,
    FullName: '',
    Age: 0,
    Gender: 0,
    OrgId: 0,SubOrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "EmployeeFamilyId",
    "FullName",
    "Age",
    "Gender",
    "FamilyRelationShipId",
    "Active",
    "Action"
  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private nav: Router,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    //debugger;
    this.searchForm = this.fb.group({
      searchClassName: [0]
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.EmployeeId = +this.tokenStorage.getEmployeeId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.FAMILY)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

      }
      else {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.GetMasterData();
      }
    }
  }

  AddNew() {

    var newdata = {
      EmployeeFamilyId: 0,
      EmployeeId: 0,
      FamilyRelationShipId: 0,
      FullName: '',
      Age: 0,
      Gender: 0,
      Active: 0,
      Action: true
    };
    this.EmployeeFamilyList = [];
    this.EmployeeFamilyList.push(newdata);
    this.dataSource = new MatTableDataSource<IFamily>(this.EmployeeFamilyList);
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = "FamilyRelationShipId eq " + row.FamilyRelationShipId

    if (row.EmployeeFamilyId > 0)
      checkFilterString += " and EmployeeFamilyId ne " + row.EmployeeFamilyId;
    let list: List = new List();
    list.fields = ["EmployeeFamilyId"];
    list.PageName = this.EmployeeFamilyListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.EmployeeFamilyData.EmployeeFamilyId = row.EmployeeFamilyId;
          this.EmployeeFamilyData.Active = row.Active;
          this.EmployeeFamilyData.Age = row.Age;
          this.EmployeeFamilyData.EmployeeId = this.EmployeeId;
          this.EmployeeFamilyData.FamilyRelationShipId = row.FamilyRelationShipId;
          this.EmployeeFamilyData.FullName = row.FullName;
          this.EmployeeFamilyData.Gender = row.Gender;
          this.EmployeeFamilyData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.EmployeeFamilyData.SubOrgId = this.SubOrgId;

          if (this.EmployeeFamilyData.EmployeeFamilyId == 0) {
            this.EmployeeFamilyData["CreatedDate"] = new Date();
            this.EmployeeFamilyData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmployeeFamilyData["UpdatedDate"] = new Date();
            delete this.EmployeeFamilyData["UpdatedBy"];
            //console.log('this.EmployeeFamilyData',this.EmployeeFamilyData)
            this.insert(row);
          }
          else {
            delete this.EmployeeFamilyData["CreatedDate"];
            delete this.EmployeeFamilyData["CreatedBy"];
            this.EmployeeFamilyData["UpdatedDate"] = new Date();
            this.EmployeeFamilyData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.EmployeeFamilyListName, this.EmployeeFamilyData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmployeeFamilyId = data.EmployeeFamilyId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.EmployeeFamilyListName, this.EmployeeFamilyData, this.EmployeeFamilyData.EmployeeFamilyId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetEmployeeFamilys() {
    debugger;

    this.loading = true;
    let filterStr = 'EmployeeId eq ' + this.EmployeeId;
    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.EmployeeFamilyListName;
    list.filter = [filterStr];
    this.EmployeeFamilyList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.EmployeeFamilyList = [...data.value];
        }
        this.dataSource = new MatTableDataSource<IFamily>(this.EmployeeFamilyList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.FamilyRelationship = this.getDropDownData(globalconstants.MasterDefinitions.employee.FAMILYRELATIONSHIP);
    this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.employee.GENDER);
    if (this.EmployeeId > 0)
      this.GetEmployeeFamilys();
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
}
export interface IFamily {
  EmployeeFamilyId: number;
  EmployeeId: number;
  FamilyRelationShipId: number;
  FullName: string;
  Age: number;
  Gender: number;
  Action: boolean;
}
export interface IApplication {
  ApplicationId: number;
  ApplicationName: string;
}
