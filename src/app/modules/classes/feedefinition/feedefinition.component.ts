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
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-feedefinition',
  templateUrl: './feedefinition.component.html',
  styleUrls: ['./feedefinition.component.scss']
})
export class FeeDefinitionComponent implements OnInit {
    PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


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
  FeeDefinitionListName = 'FeeDefinitions';
  Applications = [];
  loading = false;
  SelectedBatchId = 0;SubOrgId = 0;
  FilterOrgSubOrgBatchId='';
  FilterOrgSubOrg='';
  FeeDefinitionList: IFeeDefinition[] = [];
  filteredOptions: Observable<IFeeDefinition[]>;
  dataSource: MatTableDataSource<IFeeDefinition>;
  allMasterData = [];
  FeeDefinitions = [];
  FeeCategories = [];
  Permission = 'deny';
  ExamId = 0;
  FeeDefinitionData = {
    FeeDefinitionId: 0,
    FeeName: '',
    Description: '',
    FeeCategoryId: 0,
    FeeSubCategoryId: 0,
    AmountEditable: 0,
    OrgId: 0,SubOrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    "FeeDefinitionId",
    "FeeName",
    "Description",
    "FeeCategoryId",
    "FeeSubCategoryId",
    "AmountEditable",
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
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.FEEDEFINITION)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);

      }
      else {
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.GetMasterData();
        this.GetFeeDefinitions();

      }
    }
  }

  AddNew() {

    var newdata = {
      FeeDefinitionId: 0,
      FeeName: '',
      Description: '',
      FeeCategoryId: 0,
      FeeSubCategoryId: 0,
      FeeSubCategories: [],
      AmountEditable: 0,
      OrgId: 0,SubOrgId: 0,
      BatchId: 0,
      Active: 0,
      Action: true
    };
    this.FeeDefinitionList = [];
    this.FeeDefinitionList.push(newdata);
    this.dataSource = new MatTableDataSource<IFeeDefinition>(this.FeeDefinitionList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  onBlur(element) {
    element.Action = true;
  }
  updateAmountEditable(row, value) {
    row.Action = true;
    row.AmountEditable = value.checked ? 1 : 0;
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
  UpdateOrSave(row: IFeeDefinition) {

    //debugger;
    this.loading = true;
    let checkFilterString = this.FilterOrgSubOrg + " and FeeName eq '" + row.FeeName + "'" +
      " and FeeCategoryId eq " + row.FeeCategoryId +
      " and FeeSubCategoryId eq " + row.FeeSubCategoryId;

    if (row.FeeCategoryId == 0) {
      this.contentservice.openSnackBar("Please select Fee Category.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading = false;
      row.Action = false;
      return;
    }
    if (row.FeeName == '') {
      this.contentservice.openSnackBar("Please enter fee name.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading = false;
      row.Action = false;
      return;
    }
    if (row.FeeDefinitionId > 0)
      checkFilterString += " and FeeDefinitionId ne " + row.FeeDefinitionId;


    let list: List = new List();
    list.fields = ["FeeDefinitionId"];
    list.PageName = this.FeeDefinitionListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.FeeDefinitionData.FeeDefinitionId = row.FeeDefinitionId;
          this.FeeDefinitionData.FeeName = row.FeeName.trim();
          this.FeeDefinitionData.Description = row.Description;
          this.FeeDefinitionData.FeeCategoryId = row.FeeCategoryId;
          this.FeeDefinitionData.FeeSubCategoryId = row.FeeSubCategoryId;
          this.FeeDefinitionData.AmountEditable = row.AmountEditable;
          this.FeeDefinitionData.Active = row.Active;
          this.FeeDefinitionData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.FeeDefinitionData.SubOrgId = this.SubOrgId;
          this.FeeDefinitionData.BatchId = this.SelectedBatchId;

          this.FeeDefinitionData.Active = row.Active;
          ////console.log('exam slot', this.FeeDefinitionData)

          if (this.FeeDefinitionData.FeeDefinitionId == 0) {
            this.FeeDefinitionData["CreatedDate"] = new Date();
            this.FeeDefinitionData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.FeeDefinitionData["UpdatedDate"] = new Date();
            delete this.FeeDefinitionData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.FeeDefinitionData["CreatedDate"];
            delete this.FeeDefinitionData["CreatedBy"];
            this.FeeDefinitionData["UpdatedDate"] = new Date();
            this.FeeDefinitionData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  GetSubCategory(row) {
    row.FeeSubCategories = this.allMasterData.filter(f => f.ParentId == row.FeeCategoryId);
    row.Action = true;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.FeeDefinitionListName, this.FeeDefinitionData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.FeeDefinitionId = data.FeeDefinitionId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.FeeDefinitionListName, this.FeeDefinitionData, this.FeeDefinitionData.FeeDefinitionId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetFeeDefinitions() {
    debugger;

    this.loading = true;
    let filterStr = this.FilterOrgSubOrg;
    // var _searchClassName = this.searchForm.get("searchClassName").value;
    // if (_searchClassName > 0) {
    //   filterStr += ' and FeeDefinitionId eq ' + _searchClassName;
    // }
    let list: List = new List();
    list.fields = [
      "FeeDefinitionId",
      "FeeName",
      "Description",
      "FeeCategoryId",
      "FeeSubCategoryId",
      "AmountEditable",
      "OrgId",
      "BatchId",
      "Active"
    ];

    list.PageName = this.FeeDefinitionListName;
    list.filter = [filterStr];
    this.FeeDefinitionList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.FeeDefinitionList = data.value.map(m => {
            m.FeeSubCategories = this.allMasterData.filter(f => f.ParentId == m.FeeCategoryId);
            return m;
          });

        }
        //console.log('this.FeeDefinitionList',this.FeeDefinitionList)
        this.dataSource = new MatTableDataSource<IFeeDefinition>(this.FeeDefinitionList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();

    //this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);
    this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
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
export interface IFeeDefinition {
  FeeDefinitionId: number;
  FeeName: string;
  Description: string;
  FeeCategoryId: number;
  FeeSubCategoryId: number;
  AmountEditable: number;
  OrgId: number;SubOrgId: number;
  BatchId: number;
  Active: number;
  Action: boolean;
}

