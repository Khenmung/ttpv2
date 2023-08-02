import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import {SwUpdate} from '@angular/service-worker';
@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss']
})
export class PlansComponent implements OnInit { PageLoading=true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  
  PlanListName = 'Plans';
  loading = false;
  SelectedApplicationId=0;
  SelectedBatchId = 0;SubOrgId = 0;
  PlanList: IPlan[] = [];
  filteredOptions: Observable<IPlan[]>;
  dataSource: MatTableDataSource<IPlan>;
  allMasterData = [];
  Plans = [];
  FeeCategories = [];
  Permission = 'deny';
  ExamId = 0;
  PlanData = {
    PlanId: 0,
    Title: '',
    Description: '',
    Sequence:0,
    Logic:'',
    PCPM: 0,
    MinPrice: 0,
    MinCount: 0,
    Active: 0
  };
  displayedColumns = [
    "PlanId",
    "Title",
    "Description",
    "Sequence",
    "Logic",
    "PCPM",
    "MinPrice",
    "MinCount",
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
    // this.searchForm = this.fb.group({
    //   searchClassName: [0]
    // });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.PLAN)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu'])
      }
      else {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.GetMasterData();
        this.GetPlans();

      }
    }
  }

  AddNew() {

    var newdata = {
      "PlanId": 0,
      "Title": '',
      "Description": '',
      "Sequence":0,
      "Logic":'',
      "PCPM":0,
      "MinPrice":0,
      "MinCount":0,
      "Active": 0,
      "Action": false
    };
    this.PlanList = [];
    this.PlanList.push(newdata);
    this.dataSource = new MatTableDataSource<IPlan>(this.PlanList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
  UpdateOrSave(row: IPlan) {

    //debugger;
    this.loading = true;
    let checkFilterString = "Title eq '" + row.Title + "'"

    if (row.Title == '') {
      this.contentservice.openSnackBar("Please enter plan name.",globalconstants.ActionText,globalconstants.RedBackground);
      this.loading = false; this.PageLoading=false;
      row.Action = false;
      return;
    }
    if (row.PlanId > 0)
      checkFilterString += " and PlanId ne " + row.PlanId;


    let list: List = new List();
    list.fields = ["PlanId"];
    list.PageName = this.PlanListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.PlanData.PlanId = row.PlanId;
          this.PlanData.Title = row.Title;
          this.PlanData.Description = row.Description;
          this.PlanData.Sequence = row.Sequence;
          this.PlanData.Logic = row.Logic;
          this.PlanData.PCPM = +row.PCPM;
          this.PlanData.MinPrice = +row.MinPrice;
          this.PlanData.MinCount = +row.MinCount;
          this.PlanData.Active = row.Active;
          ////console.log("plandata", this.PlanData)
          if (this.PlanData.PlanId == 0) {
            this.insert(row);
          }
          else {
            // delete this.PlanData["CreatedDate"];
            // delete this.PlanData["CreatedBy"];
            // this.PlanData["UpdatedDate"] = new Date();
            // this.PlanData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.PlanListName, this.PlanData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.PlanId = data.PlanId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.PlanListName, this.PlanData, this.PlanData.PlanId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetPlans() {
    debugger;

    this.loading = true;
    let list: List = new List();
    list.fields = [
      "PlanId",
      "Title",
      "Description",
      "Sequence",
      "Logic",
      "PCPM",
      "MinCount",
      "MinPrice",
      "Active"
    ];

    list.PageName = this.PlanListName;
    //list.filter = ["Active eq 1"];
    this.PlanList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.PlanList = data.value.map(m=>{
            m.Action=false;
            return m;
          });
        }
        this.PlanList =this.PlanList.sort((a,b)=>a.Sequence - b.Sequence);
        this.dataSource = new MatTableDataSource<IPlan>(this.PlanList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SubOrgId, this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);
        this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
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
export interface IPlan {
  PlanId: number;
  Title: string;
  Description: string;
  Sequence:number;
  Logic:string;
  PCPM: number;
  MinPrice: number;
  MinCount: number;
  Active: number;
  Action: boolean;
}


