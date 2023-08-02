import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SwUpdate } from '@angular/service-worker';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import * as moment from 'moment';

@Component({
  selector: 'app-news-nevent',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {
    PageLoading = true;
  @ViewChild(MatPaginator) paging: MatPaginator;

  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  EventsListName = 'Events';
  Applications = [];
  loading = false;
  SelectedBatchId = 0; SubOrgId = 0;
  FilterOrgSubOrgBatchId='';
  FilterOrgSubOrg='';
  EventsList: IEvent[] = [];
  filteredOptions: Observable<IEvent[]>;
  dataSource: MatTableDataSource<IEvent>;
  allMasterData = [];
  Events = [];
  Permission = 'deny';
  EmployeeId = 0;
  EventsData = {
    EventId: 0,
    EventName: '',
    Description: '',
    EventStartDate: new Date(),
    EventEndDate: new Date(),
    Venue: '',
    BatchId: 0,
    OrgId: 0,SubOrgId: 0,
    Active: 0,
    Broadcasted: 0
  };
  displayedColumns = [
    "EventId",
    "EventName",
    "Description",
    "EventStartDate",
    "EventEndDate",
    "Venue",
    "Active",
    "Action"
  ];
  SelectedApplicationId = 0;
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    public datepipe: DatePipe,
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
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.EmployeeId = +this.tokenStorage.getEmployeeId();
    this.SubOrgId = this.tokenStorage.getSubOrgId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.misc.EVENT);
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
  checkLength(control, len) {
    debugger;
    if (control.value.length > len) // 5 is your maxlength
      control.value = '';
  }
  AddNew() {

    var newdata = {
      EventId: 0,
      EventName: '',
      Description: '',
      EventStartDate: new Date(),
      EventEndDate: new Date(),
      Venue: '',
      OrgId: 0,SubOrgId: 0,
      Active: 0,
      Broadcasted: 0,
      Action: false
    };
    this.EventsList = [];
    this.EventsList.push(newdata);
    this.dataSource = new MatTableDataSource<IEvent>(this.EventsList);
    this.dataSource.paginator = this.paging;
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
    let checkFilterString = this.FilterOrgSubOrgBatchId + " and EventName eq '" + row.EventName + "'";
    checkFilterString += " and EventStartDate eq " + moment(row.EventStartDate).format('YYYY-MM-DD');
    if (row.EventId > 0)
      checkFilterString += " and EventId ne " + row.EventId;
    let list: List = new List();
    list.fields = ["EventId"];
    list.PageName = this.EventsListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.EventsData.EventId = row.EventId;
          this.EventsData.Active = row.Active;
          this.EventsData.EventName = row.EventName;
          this.EventsData.Description = row.Description;
          this.EventsData.EventStartDate = row.EventStartDate;
          this.EventsData.EventEndDate = row.EventEndDate;
          this.EventsData.BatchId = this.SelectedBatchId;
          this.EventsData.Broadcasted = 0;
          this.EventsData.Venue = row.Venue;
          this.EventsData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.EventsData.SubOrgId = this.SubOrgId;

          if (this.EventsData.EventId == 0) {
            this.EventsData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.EventsData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EventsData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            delete this.EventsData["UpdatedBy"];
            //console.log('this.EventsData', this.EventsData)
            this.insert(row);
          }
          else {
            delete this.EventsData["CreatedDate"];
            delete this.EventsData["CreatedBy"];
            this.EventsData["UpdatedDate"] = new Date();
            this.EventsData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            console.log('this.EventsData', this.EventsData)
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
    this.dataservice.postPatch(this.EventsListName, this.EventsData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EventId = data.EventId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.EventsListName, this.EventsData, this.EventsData.EventId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetEvents() {
    debugger;

    this.loading = true;
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";

    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.EventsListName;
    list.filter = [filterStr];
    this.EventsList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.EventsList = data.value.map(m => {
            //m.EventStartDate = moment(m.EventStartDate).format('DD/MM/YYYY');
            //m.EventEndDate = moment(m.EventEndDate).format('DD/MM/YYYY');
            return m;
          })
        }
        this.dataSource = new MatTableDataSource<IEvent>(this.EventsList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SubOrgId, this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.FamilyRelationship = this.getDropDownData(globalconstants.MasterDefinitions.employee.FAMILYRELATIONSHIP);
        this.Events = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEESKILL);
        this.GetEvents();
        this.loading = false; this.PageLoading = false;
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
export interface IEvent {
  EventId: number;
  EventName: string;
  Description: string;
  EventStartDate: Date;
  EventEndDate: Date;
  Venue: string;
  OrgId: number;SubOrgId: number;
  Active: number;
  Broadcasted: number;
  Action: boolean;
}

