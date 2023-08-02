import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
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
  selector: 'app-examncalculate',
  templateUrl: './examncalculate.component.html',
  styleUrls: ['./examncalculate.component.scss']
})
export class ExamncalculateComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paging: MatPaginator;
  ClassGroups = [];
  //SubjectCategory = [];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ExamNCalculateListName = 'ExamNCalculates';
  Applications = [];
  loading = false;
  SelectedBatchId = 0;SubOrgId = 0;
  FilterOrgSubOrg='';
  FilterOrgSubOrgBatchId='';
  ExamNCalculateList: IExamNCalculate[] = [];
  filteredOptions: Observable<IExamNCalculate[]>;
  dataSource: MatTableDataSource<IExamNCalculate>;
  allMasterData = [];
  ExamNCalculate = [];
  Permission = 'deny';
  Classes = [];
  ExamStatus = [];
  ExamNCalculateData = {
    ExamNCalculateId: 0,
    ExamId: 0,
    CalculateResultPropertyId: 0,
    OrgId: 0,SubOrgId: 0,
    Active: false
  };
  MonthYears = [];
  displayedColumns = [
    "ExamNCalculateId",
    "PropertyName",
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
      searchExamId: [0]
    });
    this.PageLoad();
  }
  Exams = [];
  ExamNames = [];
  PageLoad() {

    debugger;
    this.loading = true;
    this.MonthYears = this.contentservice.GetSessionFormattedMonths();
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //this.EmployeeId = +this.tokenStorage.getEmployeeId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.EXAMNCALCULATE);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu'])
      }
      else {
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetMasterData();
        this.Getclassgroups();
      }
    }
  }

  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    debugger;
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
  UpdateOrSave(row) {

    debugger;
    this.loading = true;

    if (row.ExamId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let checkFilterString = this.FilterOrgSubOrg + " and ExamId eq " + row.ExamId +
      " and CalculateResultPropertyId eq " + row.CalculateResultPropertyId

    if (row.ExamNCalculateId > 0)
      checkFilterString += " and ExamNCalculateId ne " + row.ExamNCalculateId;
    let list: List = new List();
    list.fields = ["ExamNCalculateId"];
    list.PageName = this.ExamNCalculateListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.ExamNCalculateData.ExamNCalculateId = row.ExamNCalculateId;
          this.ExamNCalculateData.Active = row.Active;
          this.ExamNCalculateData.ExamId = this.searchForm.get("searchExamId").value;
          this.ExamNCalculateData.CalculateResultPropertyId = row.CalculateResultPropertyId;
          this.ExamNCalculateData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ExamNCalculateData.SubOrgId = this.SubOrgId;

          //console.log("this.ExamNCalculateData", this.ExamNCalculateData);
          if (this.ExamNCalculateData.ExamNCalculateId == 0) {
            this.ExamNCalculateData["CreatedDate"] = new Date();
            this.ExamNCalculateData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ExamNCalculateData["UpdatedDate"] = new Date();
            delete this.ExamNCalculateData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ExamNCalculateData["CreatedDate"];
            delete this.ExamNCalculateData["CreatedBy"];
            this.ExamNCalculateData["UpdatedDate"] = new Date();
            this.ExamNCalculateData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.ExamNCalculateListName, this.ExamNCalculateData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ExamNCalculateId = data.ExamNCalculateId;
          row.Action = false;
          if (this.RowsToUpdate == 0) {
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse()
          }
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ExamNCalculateListName, this.ExamNCalculateData, this.ExamNCalculateData.ExamNCalculateId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          if (this.RowsToUpdate == 0) {
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse();
          }
        });
  }
  Getclassgroups() {
    var filterOrgSubOrg=globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroups(filterOrgSubOrg)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassGroups = [...data.value];
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
      });
  }
  ExamReleaseResult = true;
  GetExamNCalculate() {
    debugger;
    this.loading = true;
    let filterStr = this.FilterOrgSubOrg;

    var _examId = this.searchForm.get("searchExamId").value;

    if (_examId > 0) {
      filterStr += " and ExamId eq " + _examId;
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //var ExamReleaseResult =true; 
    var examObj = this.Exams.filter(f => f.ExamId == _examId);
    if (examObj.length > 0) {
      this.ExamReleaseResult = examObj[0].ReleaseResult == 1 ? true : false;
    }
    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.ExamNCalculateListName;
    list.filter = [filterStr];
    this.ExamNCalculateList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.ExamNCalculateList = [];
        this.ExamResultProperties.forEach(f => {

          var objExisting = data.value.filter(c => c.CalculateResultPropertyId == f.MasterDataId);
          if (objExisting.length > 0) {
            this.ExamNCalculateList.push({
              ExamNCalculateId: objExisting[0].ExamNCalculateId,
              ExamId: objExisting[0].ExamId,
              CalculateResultPropertyId: objExisting[0].CalculateResultPropertyId,
              PropertyName: f.MasterDataName,
              Action: false,
              Active: objExisting[0].Active
            })

          } // f.ClassName = objExisting[0].ClassName;
          else {
            this.ExamNCalculateList.push({
              ExamNCalculateId: 0,
              ExamId: _examId,
              PropertyName: f.MasterDataName,
              CalculateResultPropertyId: f.MasterDataId,
              Action: false,
              Active: false
            })
          }
        });

        this.dataSource = new MatTableDataSource<IExamNCalculate>(this.ExamNCalculateList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });
  }
  ClearData()
  {
    this.ExamNCalculateList =[];
    this.dataSource = new MatTableDataSource<IExamNCalculate>(this.ExamNCalculateList);
  }
  RowsToUpdate = 0;
  SaveAll() {
    var toupdate = this.ExamNCalculateList.filter(f => f.Action);
    this.RowsToUpdate = toupdate.length;
    toupdate.forEach(f => {
      this.RowsToUpdate--;
      this.UpdateOrSave(f);
    })
  }
  SelectAll(event) {
    debugger;
    this.ExamNCalculateList.forEach(f => {
      f.Active = event.checked;
      f.Action = true;
    })
  }
  ExamResultProperties = [];
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.ExamStatus = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS)
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME)
    this.ExamResultProperties = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMRESULTPROPERTY)

    var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      this.Classes = [...data.value];
      this.loading = false; this.PageLoading = false;
    });
    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId,2)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.forEach(f => {
          var obj = this.ExamNames.filter(e => e.MasterDataId == f.ExamNameId);
          if (obj.length > 0) {
            f.ExamName = obj[0].MasterDataName;
            this.Exams.push(f);
          }

        })
      })
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }
}
export interface IExamNCalculate {
  ExamNCalculateId: number;
  ExamId: number;
  CalculateResultPropertyId: number;
  PropertyName: string;
  Active: boolean;
  Action: boolean;
}
