import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';

@Component({
  selector: 'app-workhistory',
  templateUrl: './workhistory.component.html',
  styleUrls: ['./workhistory.component.scss']
})
export class WorkhistoryComponent implements OnInit { PageLoading=true;

  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  EmployeeWorkHistoryListName = 'EmpWorkHistories';
  Applications :any[]= [];
  loading = false;
  SelectedBatchId = 0;SubOrgId = 0;
  EmployeeWorkHistoryList: IWorkHistory[]= [];
  filteredOptions: Observable<IWorkHistory[]>;
  dataSource: MatTableDataSource<IWorkHistory>;
  allMasterData :any[]= [];
  EmployeeWorkHistory :any[]= [];
  Permission = 'deny';
  EmployeeId = 0;
  SelectedApplicationId=0;
  EmployeeWorkHistoryData = {
    EmpWorkHistoryId: 0,
    OrganizationName: '',
    Designation: '',
    Responsibility: '',
    EmployeeId:0,
    FromDate: new Date(),
    ToDate: new Date(),
    Active: 1,
    OrgId: 0,SubOrgId: 0,
  };
  displayedColumns = [
    "EmpWorkHistoryId",
    "OrganizationName",
    "Designation",
    "Responsibility",
    "FromDate",
    "ToDate",
    "Active",
    "Action"
  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private datepipe: DatePipe,
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
    this.EmployeeId = +this.tokenStorage.getEmployeeId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.WORKHISTORY)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.GetEmployeeWorkHistory();
      }
    }
  }

  AddNew() {

    var newdata = {
      EmpWorkHistoryId: 0,
      OrganizationName: '',
      Designation: '',
      Responsibility: '',
      FromDate: new Date(),
      ToDate: new Date(),
      Active: 0,
      Action: false
    };
    this.EmployeeWorkHistoryList = [];
    this.EmployeeWorkHistoryList.push(newdata);
    this.dataSource = new MatTableDataSource<IWorkHistory>(this.EmployeeWorkHistoryList);
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

          this.contentservice.openSnackBar(globalconstants.DeletedMessage,globalconstants.ActionText,globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = "OrganizationName eq '" + row.OrganizationName + "' and EmployeeId eq " + this.EmployeeId

    if (row.EmpWorkHistoryId > 0)
      checkFilterString += " and EmpWorkHistoryId ne " + row.EmpWorkHistoryId;
    let list: List = new List();
    list.fields = ["EmpWorkHistoryId"];
    list.PageName = this.EmployeeWorkHistoryListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.EmployeeWorkHistoryData.EmpWorkHistoryId = row.EmpWorkHistoryId;
          this.EmployeeWorkHistoryData.Active = row.Active;
          this.EmployeeWorkHistoryData.OrganizationName = row.OrganizationName;
          this.EmployeeWorkHistoryData.EmployeeId = this.EmployeeId;
          this.EmployeeWorkHistoryData.Designation = row.Designation;
          this.EmployeeWorkHistoryData.Responsibility = row.Responsibility;
          this.EmployeeWorkHistoryData.FromDate = row.FromDate;
          this.EmployeeWorkHistoryData.ToDate = row.ToDate;
          this.EmployeeWorkHistoryData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.EmployeeWorkHistoryData.SubOrgId = this.SubOrgId;

          if (this.EmployeeWorkHistoryData.EmpWorkHistoryId == 0) {
            this.EmployeeWorkHistoryData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.EmployeeWorkHistoryData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmployeeWorkHistoryData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            delete this.EmployeeWorkHistoryData["UpdatedBy"];
            //console.log('this.EmployeeWorkHistoryData', this.EmployeeWorkHistoryData)
            this.insert(row);
          }
          else {
            delete this.EmployeeWorkHistoryData["CreatedDate"];
            delete this.EmployeeWorkHistoryData["CreatedBy"];
            this.EmployeeWorkHistoryData["UpdatedDate"] = new Date();
            this.EmployeeWorkHistoryData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading=false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.EmployeeWorkHistoryListName, this.EmployeeWorkHistoryData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmpWorkHistoryId = data.EmpWorkHistoryId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.EmployeeWorkHistoryListName, this.EmployeeWorkHistoryData, this.EmployeeWorkHistoryData.EmpWorkHistoryId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetEmployeeWorkHistory() {
    debugger;

    this.loading = true;
    let filterStr = 'EmployeeId eq ' + this.EmployeeId

    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.EmployeeWorkHistoryListName;
    list.filter = [filterStr];
    this.EmployeeWorkHistoryList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.EmployeeWorkHistoryList = [...data.value];
        }
        this.dataSource = new MatTableDataSource<IWorkHistory>(this.EmployeeWorkHistoryList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    // this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SubOrgId,this.SelectedApplicationId)
    //   .subscribe((data: any) => {
        this.allMasterData =this.tokenStorage.getMasterData()!;// [...data.value];
        //this.FamilyRelationship = this.getDropDownData(globalconstants.MasterDefinitions.employee.FAMILYRELATIONSHIP);
        this.EmployeeWorkHistory = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEESKILL);
        this.GetEmployeeWorkHistory();
        this.loading = false; this.PageLoading=false;
     // });
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
export interface IWorkHistory {
  EmpWorkHistoryId: number;
  OrganizationName: string;
  Designation: string;
  Responsibility: string;
  FromDate: Date;
  ToDate: Date;
  Active: number;
  Action: boolean;
}

