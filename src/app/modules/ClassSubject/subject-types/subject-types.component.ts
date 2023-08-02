import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from 'src/app/shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-subject-types',
  templateUrl: './subject-types.component.html',
  styleUrls: ['./subject-types.component.scss']
})
export class SubjectTypesComponent implements OnInit {
    PageLoading = true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  CheckBatchIdForEdit = 1;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  Classes = [];
  Subjects = [];
  SubjectTypes: ISubjectType[];
  SelectedBatchId = 0;SubOrgId = 0;
  Batches = [];
  dataSource: MatTableDataSource<ISubjectType>;
  allMasterData = [];
  SelectedApplicationId = 0;
  StandardFilterWithPreviousBatchId = '';
  PreviousBatchId = -1;
  SubjectTypeId = 0;
  SubjectTypeData = {
    SubjectTypeId: 0,
    SubjectTypeName: '',
    OrgId: 0,SubOrgId: 0,
    SelectHowMany: 0,
    Active: 1,
    Deleted: false,
  };
  displayedColumns = [
    'SubjectTypeId',
    'SubjectTypeName',
    'SelectHowMany',
    'Active',
    'Action'
  ];
  Permission = '';
  //IsCurrentBatchSelected = 1;
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private dialog: MatDialog,
    private contentservice: ContentService,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })

    this.PageLoad();

  }

  PageLoad() {

    debugger;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();

    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.SUBJECTTYPE);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        //this.IsCurrentBatchSelected = +this.tokenStorage.getCheckEqualBatchId();
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        if (+this.tokenStorage.getPreviousBatchId() > 0)
          this.StandardFilterWithPreviousBatchId = globalconstants.getOrgSubOrgFilterWithPreviousBatchId(this.tokenStorage)
        this.PreviousBatchId = +this.tokenStorage.getPreviousBatchId();

        this.GetSubjectTypes();
      }//    this.GetMasterData();      
    }
  }
  onBlur(row) {
    row.Action = true;
  }
  // CopyFromPreviousBatch() {
  //   //console.log("here ", this.PreviousBatchId)
  //   if (this.PreviousBatchId == -1)
  //     this.contentservice.openSnackBar("Previous batch not defined.",globalconstants.ActionText,globalconstants.RedBackground);
  //   else
  //     this.GetSubjectTypes(1)
  // }
  addnew() {

    let toadd = {
      SubjectTypeId: 0,
      SubjectTypeName: 'new subject type',
      OrgId: 0,
      SubOrgId: 0,
      SelectHowMany: 0,
      Active: 1,
      Deleted: 0,
      Action: false
    };
    this.SubjectTypes.push(toadd);
    this.dataSource = new MatTableDataSource<ISubjectType>(this.SubjectTypes);

  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
  }
  // delete(element) {
  //   debugger;
  //   this.openDialog(element)
  //   let toupdate = {
  //     Active:0,
  //     Deleted: true,
  //     UpdatedDate:new Date()
  //   }
  //   this.dataservice.postPatch('SubjectTypes', toupdate, element.SubjectTypeId, 'patch')
  //     .subscribe(
  //       (data: any) => {
  //         this.contentservice.openSnackBar(globalconstants.DeletedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
  //       });
  // }
  UpdateOrSave(row) {

    //debugger;

    this.loading = true;
    let checkFilterString = " and SubjectTypeName eq '" + row.SubjectTypeName + "' "


    if (row.SubjectTypeId > 0)
      checkFilterString += " and SubjectTypeId ne " + row.SubjectTypeId;

    //this.StandardFilterWithBatchId += checkFilterString;
    let list: List = new List();
    list.fields = ["SubjectTypeId"];
    list.PageName = "SubjectTypes";
    list.filter = [this.FilterOrgSubOrg + checkFilterString + " and Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.SubjectTypeData.Active = row.Active;
          this.SubjectTypeData.SubjectTypeName = row.SubjectTypeName;
          this.SubjectTypeData.SubjectTypeId = row.SubjectTypeId;
          this.SubjectTypeData.SelectHowMany = row.SelectHowMany;
          this.SubjectTypeData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.SubjectTypeData.SubOrgId = this.SubOrgId;
          this.SubjectTypeData.Deleted = false;
          if (this.SubjectTypeData.SubjectTypeId == 0) {
            this.SubjectTypeData["CreatedDate"] = new Date();
            this.SubjectTypeData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.SubjectTypeData["UpdatedDate"];
            delete this.SubjectTypeData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.SubjectTypeData["CreatedDate"];
            delete this.SubjectTypeData["CreatedBy"];
            this.SubjectTypeData["UpdatedDate"] = new Date();
            this.SubjectTypeData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            //console.log('this', this.SubjectTypeData)
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('SubjectTypes', this.SubjectTypeData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.SubjectTypeId = data.SubjectTypeId;
          row.Action = false;
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch('SubjectTypes', this.SubjectTypeData, this.SubjectTypeData.SubjectTypeId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
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
      Active: 0,
      Deleted: true,
      SubOrgId:this.SubOrgId,
      UpdatedDate: new Date()
    }

    this.dataservice.postPatch('SubjectTypes', toUpdate, row.SubjectTypeId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.SubjectTypes.findIndex(x => x.SubjectTypeId == row.MasterDataId)
        this.SubjectTypes.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.SubjectTypes);
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  GetSubjectTypes() {

    //var orgIdSearchstr = globalconstants.getOrgSubOrgFilter(this.tokenStorage);

    let list: List = new List();

    list.fields = ["SubjectTypeId", "SubjectTypeName", "SelectHowMany", "Active"];
    list.PageName = "SubjectTypes";
    list.filter = [this.FilterOrgSubOrg];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SubjectTypes = data.value.map(m => {
          m.SubjectTypeId = m.SubjectTypeId
          m.Action = false;
          m.Active = m.Active
          return m;
        });
        this.dataSource = new MatTableDataSource<ISubjectType>(this.SubjectTypes);
        this.loading = false; this.PageLoading = false;
      })
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();

    //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.school.BATCH);
    //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.Batches = this.tokenStorage.getBatches()

    //this.shareddata.ChangeBatch(this.Batches);
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
export interface ISubjectType {
  SubjectTypeName: string;
  SelectHowMany: number;
  SubjectTypeId: number;
  OrgId: number;SubOrgId: number;
  Active: number;
}
