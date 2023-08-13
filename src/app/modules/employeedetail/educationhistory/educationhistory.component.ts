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
  selector: 'app-educationhistory',
  templateUrl: './educationhistory.component.html',
  styleUrls: ['./educationhistory.component.scss']
})
export class EducationhistoryComponent implements OnInit { 
  PageLoading=true;
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
  EmployeeEducationHistoryListName = 'EmployeeEducationHistories';
  Applications :any[]= [];
  loading = false;
  SelectedBatchId = 0;SubOrgId = 0;
  EmployeeEducationHistoryList: IEducationHistory[]= [];
  filteredOptions: Observable<IEducationHistory[]>;
  dataSource: MatTableDataSource<IEducationHistory>;
  allMasterData :any[]= [];
  EmployeeEducationHistory :any[]= [];
  Permission = 'deny';
  SelectedApplicationId=0;
  EmployeeId = 0;
  EmployeeEducationHistoryData = {
    EmployeeEducationHistoryId: 0,
    CourseName: '',
    FromYear: 0,
    ToYear: 0,
    PercentageObtained: 0,
    BoardName: '',
    Active: 0,
    EmployeeId: 0,
    OrgId: 0,
    SubOrgId: 0
  };
  displayedColumns = [
    "EmployeeEducationHistoryId",
    "CourseName",
    "FromYear",
    "ToYear",
    "PercentageObtained",
    "BoardName",
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
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.EmployeeId = +this.tokenStorage.getEmployeeId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.EDUCATIONHISTORY)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {

        this.GetMasterData();
      }
    }
  }

  AddNew() {

    var newdata = {
      EmployeeEducationHistoryId: 0,
      CourseName: '',
      FromYear: 0,
      ToYear: 0,
      PercentageObtained: 0,
      BoardName: '',      
      Active: 0,
      Action: false
    };
    this.EmployeeEducationHistoryList = [];
    this.EmployeeEducationHistoryList.push(newdata);
    this.dataSource = new MatTableDataSource<IEducationHistory>(this.EmployeeEducationHistoryList);
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
    let checkFilterString = "CourseName eq '" + row.CourseName + "' and EmployeeId eq " + this.EmployeeId

    if (row.EmployeeEducationHistoryId > 0)
      checkFilterString += " and EmployeeEducationHistoryId ne " + row.EmployeeEducationHistoryId;
    let list: List = new List();
    list.fields = ["EmployeeEducationHistoryId"];
    list.PageName = this.EmployeeEducationHistoryListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.EmployeeEducationHistoryData.EmployeeEducationHistoryId = row.EmployeeEducationHistoryId;
          this.EmployeeEducationHistoryData.Active = row.Active;
          this.EmployeeEducationHistoryData.BoardName = row.BoardName;
          this.EmployeeEducationHistoryData.EmployeeId = this.EmployeeId;
          this.EmployeeEducationHistoryData.CourseName = row.CourseName;
          this.EmployeeEducationHistoryData.FromYear = row.FromYear;
          this.EmployeeEducationHistoryData.ToYear = row.ToYear;
          this.EmployeeEducationHistoryData.PercentageObtained = row.PercentageObtained;
          this.EmployeeEducationHistoryData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.EmployeeEducationHistoryData.SubOrgId = this.SubOrgId;

          if (this.EmployeeEducationHistoryData.EmployeeEducationHistoryId == 0) {
            this.EmployeeEducationHistoryData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.EmployeeEducationHistoryData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmployeeEducationHistoryData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            delete this.EmployeeEducationHistoryData["UpdatedBy"];
            //console.log('this.EmployeeEducationHistoryData', this.EmployeeEducationHistoryData)
            this.insert(row);
          }
          else {
            delete this.EmployeeEducationHistoryData["CreatedDate"];
            delete this.EmployeeEducationHistoryData["CreatedBy"];
            this.EmployeeEducationHistoryData["UpdatedDate"] = new Date();
            this.EmployeeEducationHistoryData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.EmployeeEducationHistoryListName, this.EmployeeEducationHistoryData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmployeeEducationHistoryId = data.EmployeeEducationHistoryId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.EmployeeEducationHistoryListName, this.EmployeeEducationHistoryData, this.EmployeeEducationHistoryData.EmployeeEducationHistoryId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetEmployeeEducationHistory() {
    debugger;

    this.loading = true;
    let filterStr = 'EmployeeId eq ' + this.EmployeeId

    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.EmployeeEducationHistoryListName;
    list.filter = [filterStr];
    this.EmployeeEducationHistoryList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.EmployeeEducationHistoryList = [...data.value];
        }
        this.dataSource = new MatTableDataSource<IEducationHistory>(this.EmployeeEducationHistoryList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SubOrgId, this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.FamilyRelationship = this.getDropDownData(globalconstants.MasterDefinitions.employee.FAMILYRELATIONSHIP);
        this.EmployeeEducationHistory = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEESKILL);
        this.GetEmployeeEducationHistory();
        this.loading = false; this.PageLoading=false;        
      });
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
export interface IEducationHistory {
  EmployeeEducationHistoryId: number;
  CourseName: string;
  FromYear: number;
  ToYear: number;
  PercentageObtained: number;
  BoardName: string;
  Active: number;
  Action: boolean;
}

