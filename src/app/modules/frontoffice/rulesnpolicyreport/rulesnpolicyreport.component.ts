import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-rulesnpolicyreport',
  templateUrl: './rulesnpolicyreport.component.html',
  styleUrls: ['./rulesnpolicyreport.component.scss']
})
export class RulesnpolicyreportComponent implements OnInit {
  @ViewChild(MatPaginator) paging: MatPaginator;
  RulesOrPolicyTypes = [];
  PageLoading = false;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  RulesOrPolicyListName = 'RulesOrPolicies';
  RulesOrPolicyDisplayTypes = [];
  Applications = [];
  ckeConfig: any;
  loading = false;
  SelectedBatchId = 0;SubOrgId = 0;
  FilterOrgSubOrg='';
  FilterOrgSubOrgBatchId='';
  RulesOrPolicyList: IRulesOrPolicy[] = [];
  filteredOptions: Observable<IRulesOrPolicy[]>;
  dataSource: MatTableDataSource<IRulesOrPolicy>;
  allMasterData = [];
  PageCategory = [];
  RulesOrPolicySubCategory = [];
  Permission = 'deny';
  RulesOrPolicyData = {
    RulesOrPolicyId: 0,
    Title: '',
    Description: '',
    OrgId: 0,SubOrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "RulesOrPolicyId",
    "Description",
    "RulesOrPolicyCategoryId",
    "RuleOrPolicyTypeId",
    "Sequence",
    "Active",
    "Action"
  ];
  DetailText = '';
  SelectedApplicationId = 0;
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
      searchId: [0],
      Description: [''],
      Title: [''],
      RulesOrPolicyId: [0],
      Active: [true]
      // searchSubCategoryId: [0]
    });
    this.searchForm.get("RulesOrPolicyId").disable();
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //this.EmployeeId = +this.tokenStorage.getEmployeeId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.misc.RULESORPOLICYREPORT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu'])
      }
      else {
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.ckeConfig = {
          allowedContent: false,
          extraPlugins: 'divarea',
          forcePasteAsPlainText: false,
          removeButtons: 'About',
          scayt_autoStartup: true,
          autoGrow_onStartup: true,
          autoGrow_minHeight: 500,
          autoGrow_maxHeight: 600
        };

        this.GetMasterData();
        this.GetRulesOrPolicys();
      }
    }
  }

  AddNew() {

    this.searchForm.patchValue({
      RulesOrPolicyId: 0,
      Title: '',
      Description: '',
      Active: 0,
      Action: false
    });
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave() {

    debugger;
    this.loading = true;
    var _title = this.searchForm.get("Title").value;
    var _description = this.searchForm.get("Description").value;
    var _rulesOrPolicyId = this.searchForm.get("RulesOrPolicyId").value;
    var _active = this.searchForm.get("Active").value;
    let checkFilterString = this.FilterOrgSubOrg + " and Title eq '" + globalconstants.encodeSpecialChars(_title) +"'";
    if (_title.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter title.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_description.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter page detail.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    if (_rulesOrPolicyId > 0)
      checkFilterString += " and RulesOrPolicyId ne " + _rulesOrPolicyId;
    let list: List = new List();
    list.fields = ["RulesOrPolicyId"];
    list.PageName = this.RulesOrPolicyListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          var _desc = _description.replaceAll('"', "'")
          this.RulesOrPolicyData.RulesOrPolicyId = _rulesOrPolicyId;
          this.RulesOrPolicyData.Active = _active;
          this.RulesOrPolicyData.Description = globalconstants.encodeSpecialChars(_desc);
          this.RulesOrPolicyData.Title = _title;
          this.RulesOrPolicyData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.RulesOrPolicyData.SubOrgId = this.SubOrgId;

          if (_rulesOrPolicyId == 0) {
            this.RulesOrPolicyData["CreatedDate"] = new Date();
            this.RulesOrPolicyData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.RulesOrPolicyData["UpdatedDate"] = new Date();
            delete this.RulesOrPolicyData["UpdatedBy"];
            console.log("rules", this.RulesOrPolicyData)
            this.insert();
          }
          else {
            delete this.RulesOrPolicyData["CreatedDate"];
            delete this.RulesOrPolicyData["CreatedBy"];
            this.RulesOrPolicyData["UpdatedDate"] = new Date();
            this.RulesOrPolicyData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update();
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert() {

    //debugger;
    this.dataservice.postPatch(this.RulesOrPolicyListName, this.RulesOrPolicyData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.searchForm.patchValue({ "RulesOrPolicyId": data.RulesOrPolicyId });
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update() {

    this.dataservice.postPatch(this.RulesOrPolicyListName, this.RulesOrPolicyData, this.RulesOrPolicyData.RulesOrPolicyId, 'patch')
      .subscribe(
        (data: any) => {
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  FileNames = [];
  GetRulesOrPolicys() {
    debugger;
    let filterStr = this.FilterOrgSubOrg + " and Active eq true";
    var _fields = ["RulesOrPolicyId", "Title"];

    this.loading = true;
    let list: List = new List();
    list.fields = _fields;

    list.PageName = this.RulesOrPolicyListName;
    list.filter = [filterStr];
    this.FileNames = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FileNames = [...data.value];

        this.dataSource = new MatTableDataSource<IRulesOrPolicy>(this.RulesOrPolicyList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });

  }
  GetRulesOrPolicy() {
    debugger;
    let filterStr = this.FilterOrgSubOrg + " and Active eq true";
    var _searchId = this.searchForm.get("searchId").value;
    //var _searchSubCategoryId = this.searchForm.get("searchSubCategoryId").value;
    var _fields = ["RulesOrPolicyId", "Title", "Description"];
    if (_searchId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select title.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else
      filterStr += ' and RulesOrPolicyId eq ' + _searchId;

    this.loading = true;
    let list: List = new List();
    list.fields = _fields;

    list.PageName = this.RulesOrPolicyListName;
    list.filter = [filterStr];
    this.RulesOrPolicyList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.RulesOrPolicyList = [...data.value];
          // .map(map => {
          //   map.Description = globalconstants.decodeSpecialChars(map.Description);
          //   return map;

          // })
          this.DetailText = globalconstants.decodeSpecialChars(this.RulesOrPolicyList[0].Description);
        }
        this.loadingFalse();
      });

  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.PageCategory = this.getDropDownData(globalconstants.MasterDefinitions.common.PAGECATEGORY)
    this.RulesOrPolicyDisplayTypes = this.getDropDownData(globalconstants.MasterDefinitions.common.RULEORPOLICYCATEGORYDISPLAYTYPE)

    //this.GetRulesOrPolicy();
    this.loading = false; this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);

  }
}
export interface IRulesOrPolicy {
  RulesOrPolicyId: number;
  Title: string;
  Description: string;
  Action: boolean;
}


