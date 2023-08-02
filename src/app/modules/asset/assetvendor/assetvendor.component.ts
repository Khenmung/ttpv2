import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-assetvendor',
  templateUrl: './assetvendor.component.html',
  styleUrls: ['./assetvendor.component.scss']
})
export class AssetVendorComponent implements OnInit {
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
  FilterOrgSubOrg = '';
  loading = false;
  Category = [];
  AchievementAndPointList: any[] = [];
  SelectedBatchId = 0;SubOrgId = 0;
  dataSource: MatTableDataSource<any>;
  allMasterData = [];
  AchievementAndPointData = {
    AchievementAndPointId: 0,
    Rank: '',
    CategoryId: 0,
    Points: 0,
    Active: 0,
    OrgId: 0
  };
  AchievementAndPointForUpdate = [];
  displayedColumns = [
    "AchievementAndPointId",
    "Rank",
    "CategoryId",
    "Points",
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
      searchCategoryId: [0]
    });

    this.ClassId = this.tokenStorage.getClassId();
    this.PageLoad();

  }
  // private _filter(name: string): IStudent[] {

  //   const filterValue = name.toLowerCase();
  //   return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  // }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  //StudentGroups = [];
  //StudentClubs = [];
  //StudentHouses = [];
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

        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.LoginUserDetail[0]['orgId']);
        this.GetMasterData();
        // if (this.Classes.length == 0) {
        //   var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        //  this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
        //     this.Classes = [...data.value];
        //     this.loading = false;
        //     this.PageLoading = false;
        //   });
        // }

        //this.GetStudentClasses();
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
    if (row.Rank.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter rank.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
    let checkFilterString =this.FilterOrgSubOrg + " and CategoryId eq " + row.CategoryId + " and Rank eq '" + row.Rank + "'"
    this.RowsToUpdate = 0;

    if (row.AchievementAndPointId > 0)
      checkFilterString += " and AchievementAndPointId ne " + row.AchievementAndPointId;
    //checkFilterString += " and " + this.FilterOrgSubOrg;
    let list: List = new List();
    list.fields = ["AchievementAndPointId"];
    list.PageName = "AchievementAndPoints";
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

          this.AchievementAndPointForUpdate = [];;
          this.AchievementAndPointForUpdate.push(
            {
              AchievementAndPointId: row.AchievementAndPointId,
              Rank: row.Rank,
              CategoryId: row.CategoryId,
              Points: row.Points,
              OrgId: this.LoginUserDetail[0]['orgId'],
              Active: row.Active
            });

          if (this.AchievementAndPointForUpdate[0].AchievementAndPointId == 0) {
            this.AchievementAndPointForUpdate[0]["CreatedDate"] = new Date();
            this.AchievementAndPointForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.AchievementAndPointForUpdate[0]["UpdatedDate"];
            delete this.AchievementAndPointForUpdate[0]["UpdatedBy"];
            this.insert(row);
          }
          else {
            //console.log("this.AchievementAndPointForUpdate[0] update", this.AchievementAndPointForUpdate[0])
            this.AchievementAndPointForUpdate[0]["UpdatedDate"] = new Date();
            this.AchievementAndPointForUpdate[0]["UpdatedBy"];
            delete this.AchievementAndPointForUpdate[0]["CreatedDate"];
            delete this.AchievementAndPointForUpdate[0]["CreatedBy"];
            this.insert(row);
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
    console.log("this.AchievementAndPointForUpdate", this.AchievementAndPointForUpdate)
    this.dataservice.postPatch('AchievementAndPoints', this.AchievementAndPointForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.AchievementAndPointId = data.AchievementAndPointId;
          row.Action = false;
          if (this.RowsToUpdate == 0) {
            this.RowsToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse();
          }
        }, error => {
          this.loadingFalse();
          console.log("error on AchievementAndPoint insert", error);
        });
  }
  update(row) {
    console.log("updating", this.AchievementAndPointForUpdate[0]);
    this.dataservice.postPatch('AchievementAndPoints', this.AchievementAndPointForUpdate[0], this.AchievementAndPointForUpdate[0].AchievementAndPointId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          //console.log("data update", data.value);
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }

  GetAchievementAndPoint() {
    debugger;
    var filterStr = this.FilterOrgSubOrg;// "OrgId eq " + this.LoginUserDetail[0]["orgId"];
    var _categoryId = this.searchForm.get("searchCategoryId").value;
    if (_categoryId > 0) {
      filterStr += " and CategoryId eq " + _categoryId;
    }
    this.loading = true;
    this.AchievementAndPointList = [];

    let list: List = new List();
    list.fields = [
      "AchievementAndPointId",
      "Rank",
      "CategoryId",
      "Points",
      "Active",
    ];

    list.PageName = "AchievementAndPoints";
    list.filter = [filterStr];
    this.AchievementAndPointList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _subCategory = [];
        this.AchievementAndPointList = data.value.map(m => {
          m.Action = false;
          return m;
        })

        if (this.AchievementAndPointList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<IAchievementAndPoint>(this.AchievementAndPointList);
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
    this.Category = this.getDropDownData(globalconstants.MasterDefinitions.school.POINTSCATEGORY);
    this.PageLoading = false;
    this.loading = false;

  }

  AddNew() {
    debugger;
    var newdata = {
      AchievementAndPointId: 0,
      Rank: '',
      CategoryId: 0,
      Points: 0,
      Active: false,
      Action: false
    };
    this.AchievementAndPointList = [];
    this.AchievementAndPointList.push(newdata);
    this.dataSource = new MatTableDataSource<IAchievementAndPoint>(this.AchievementAndPointList);
  }
  onBlur(row) {
    row.Action = true;
  }
  UpdateActive(row, event) {
    row.Active = event.checked;
    row.Action = true;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);

  }


}
export interface IAchievementAndPoint {
  AchievementAndPointId: number;
  Rank: string;
  CategoryId: number;
  Points: number;
  Active: number;
  Action: boolean;
}
export interface IStudent {
  GroupId: number;
  StudentId: number;
  Name: string;
}




