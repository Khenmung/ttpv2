import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-certificateconfig',
  templateUrl: './certificateconfig.component.html',
  styleUrls: ['./certificateconfig.component.scss']
})
export class CertificateconfigComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  RowsToUpdate = -1;
  EvaluationStarted = false;
  EvaluationSubmitted = false;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  ClassId = 0;
  Permission = '';
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  //Category = [];
  CertificateConfigList: any[] = [];
  SelectedBatchId = 0;SubOrgId = 0;
  dataSource: MatTableDataSource<any>;
  allMasterData = [];
  CertificateConfigData = {
    CertificateConfigId: 0,
    Title: '',
    Description: '',
    ParentId: 0,
    Sequence: 0,
    Confidential: false,
    Active: false,
    OrgId: 0
  };
  filteredMaster: any = [];
  CertificateConfigForUpdate = [];
  StudentVariableNames = [];
  displayedColumns = [
    "CertificateConfigId",
    "Title",
    "Description",
    "ParentId",
    "Sequence",
    "Confidential",
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
    debugger;

    this.searchForm = this.fb.group({
      searchTitleId: [0]
    });
    this.filteredMaster = this.searchForm.get("searchTitleId").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.MasterDataName),
        map(Name => Name ? this._filter(Name) : this.AllCertificateConfig.slice())
      );
    this.ClassId = this.tokenStorage.getClassId();
    this.PageLoad();

  }
  private _filter(name: string): ICertificateConfig[] {

    const filterValue = name.toLowerCase();
    return this.AllCertificateConfig.filter(option => option.Title.toLowerCase().includes(filterValue));

  }
  displayFn(master: ICertificateConfig): string {
    return master && master.Title ? master.Title : '';
  }
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EXECUTEEVALUATION)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        //this.GroupId = this.tokenStorage.getGroupId();
        this.StudentVariableNames = globalconstants.MasterDefinitions.StudentVariableName;
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetMasterData();
        this.GetAllCertificateConfig();
      }
    }
  }

  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          // this.GetApplicationRoles();
          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }


  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    if (row.Title.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter title.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.Description.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter description.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.ParentId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select parent.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
    let checkFilterString = this.FilterOrgSubOrg + " and Title eq '" + row.Title + "' and ParentId eq " + row.ParentId
    this.RowsToUpdate = 0;

    if (row.CertificateConfigId > 0)
      checkFilterString += " and CertificateConfigId ne " + row.CertificateConfigId;
    let list: List = new List();
    list.fields = ["CertificateConfigId"];
    list.PageName = "CertificateConfigs";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.CertificateConfigForUpdate = [];;
          this.CertificateConfigForUpdate.push(
            {
              CertificateConfigId: row.CertificateConfigId,
              Title: row.Title,
              ParentId: row.ParentId,
              Sequence: row.Sequence,
              Description: row.Description,
              Confidential: row.Confidential,
              OrgId: this.LoginUserDetail[0]['orgId'],
              Active: row.Active
            });

          if (this.CertificateConfigForUpdate[0].CertificateConfigId == 0) {
            this.CertificateConfigForUpdate[0]["CreatedDate"] = new Date();
            this.CertificateConfigForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.CertificateConfigForUpdate[0]["UpdatedDate"];
            delete this.CertificateConfigForUpdate[0]["UpdatedBy"];
            //console.log('dddd',this.CertificateConfigForUpdate[0])
            this.insert(row);
          }
          else {
            //console.log("this.CertificateConfigForUpdate[0] update", this.CertificateConfigForUpdate[0])
            this.CertificateConfigForUpdate[0]["UpdatedDate"] = new Date();
            this.CertificateConfigForUpdate[0]["UpdatedBy"];
            delete this.CertificateConfigForUpdate[0]["CreatedDate"];
            delete this.CertificateConfigForUpdate[0]["CreatedBy"];
            this.update(row);
          }
        }
      }, error => {
        this.loadingFalse();
        this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage, globalconstants.ActionText, globalconstants.RedBackground);
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {
    console.log("this.CertificateConfigForUpdate", this.CertificateConfigForUpdate)
    this.dataservice.postPatch('CertificateConfigs', this.CertificateConfigForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.CertificateConfigId = data.CertificateConfigId;
          row.Action = false;
          if (this.RowsToUpdate == 0) {
            this.RowsToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse();
          }
        }, error => {
          this.loadingFalse();
          console.log("error on CertificateConfig insert", error);
        });
  }
  update(row) {
    console.log("updating", this.CertificateConfigForUpdate[0]);
    this.dataservice.postPatch('CertificateConfigs', this.CertificateConfigForUpdate[0], this.CertificateConfigForUpdate[0].CertificateConfigId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          //console.log("data update", data.value);
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  AllCertificateConfig = [];
  TopCertificateConfig = [];
  GetAllCertificateConfig() {
    debugger;
    var filterStr = "Active eq true and (OrgId eq 0 or (" + this.FilterOrgSubOrg + "))";
    this.loading = true;
    this.CertificateConfigList = [];

    let list: List = new List();
    list.fields = [
      "CertificateConfigId",
      "Title",
      "ParentId",
      "Sequence",
      "Description",
      "Confidential",
      "Active",
    ];

    list.PageName = "CertificateConfigs";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AllCertificateConfig = [...data.value];
        var _certificatetypeId = this.AllCertificateConfig.filter(f => f.Title.toLowerCase() == 'certificate type')[0].CertificateConfigId;
        this.TopCertificateConfig = this.AllCertificateConfig.filter(a => a.ParentId == _certificatetypeId);
        this.loadingFalse();
      });
  }
  cleardata() {
    this.CertificateConfigList = [];
    this.dataSource = new MatTableDataSource(this.CertificateConfigList);
  }
  GetCertificateConfig() {
    debugger;
    var filterStr = this.FilterOrgSubOrg;// "OrgId eq " + this.LoginUserDetail[0]["orgId"];
    var _searchCertificateConfigId = this.searchForm.get("searchTitleId").value.CertificateConfigId;
    if (_searchCertificateConfigId > 0) {
      filterStr += " and ParentId eq " + _searchCertificateConfigId;
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select title", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    this.CertificateConfigList = [];

    let list: List = new List();
    list.fields = [
      "CertificateConfigId",
      "Title",
      "ParentId",
      "Sequence",
      "Description",
      "Confidential",
      "Active",
    ];

    list.PageName = "CertificateConfigs";
    list.filter = [filterStr];
    this.CertificateConfigList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _subCategory = [];
        this.CertificateConfigList = data.value.map(m => {
          m.Action = false;
          return m;
        })

        if (this.CertificateConfigList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.CertificateConfigList = this.CertificateConfigList.sort((a, b) => a.Sequence - b.Sequence);
        this.dataSource = new MatTableDataSource<ICertificateConfig>(this.CertificateConfigList);
        this.dataSource.paginator = this.paginator;
        this.loadingFalse();
      });

  }
  SelectSubCategory(row, event) {
    if (row.CategoryId > 0)
      row.SubCategories = this.allMasterData.filter(f => f.ParentId == row.CategoryId);
    else
      row.SubCategories = [];
    this.onBlur(row);
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    //this.Category = this.getDropDownData(globalconstants.MasterDefinitions.school.POINTSCATEGORY);
    this.PageLoading = false;
    this.loading = false;
  }

  AddNew() {
    debugger;
    var newdata = {
      CertificateConfigId: 0,
      Title: '',
      ParentId: 0,
      Description: '',
      Sequence: 0,
      Confidential: false,
      Active: false,
      Action: false
    };
    this.CertificateConfigList = [];
    this.CertificateConfigList.push(newdata);
    this.dataSource = new MatTableDataSource<ICertificateConfig>(this.CertificateConfigList);
  }
  onBlur(row) {
    row.Action = true;
  }
  UpdateActive(row, event) {
    row.Active = event.checked;
    row.Action = true;
  }
  UpdateConfidential(row, event) {
    row.Confidential = event.checked;
    row.Action = true;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);

  }


}
export interface ICertificateConfig {
  CertificateConfigId: number;
  Title: string;
  Description: string;
  ParentId: number;
  Sequence: number;
  Confidential: boolean;
  Active: boolean;
  Action: boolean;
}
export interface IStudent {
  GroupId: number;
  StudentId: number;
  Name: string;
}



