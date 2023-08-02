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
  selector: 'app-examclassgroup',
  templateUrl: './examclassgroup.component.html',
  styleUrls: ['./examclassgroup.component.scss']
})
export class ExamclassgroupComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paging: MatPaginator;
  ClassGroups = [];
  //SubjectCategory = [];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ExamClassGroupMapListName = 'ExamClassGroupMaps';
  Applications = [];
  loading = false;
  SelectedBatchId = 0; SubOrgId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  ExamClassGroupMapList: IExamClassGroupMap[] = [];
  filteredOptions: Observable<IExamClassGroupMap[]>;
  dataSource: MatTableDataSource<IExamClassGroupMap>;
  allMasterData = [];
  ExamClassGroupMap = [];
  Permission = 'deny';
  Classes = [];
  //ExamStatus = [];
  Exams = [];
  ExamClassGroupMapData = {
    ExamClassGroupMapId: 0,
    ExamId: 0,
    ClassGroupId: 0,
    OrgId: 0, SubOrgId: 0,
    Active: false
  };
  displayedColumns = [
    "ExamClassGroupMapId",
    "GroupName",
    "Active",
    "Action"
  ];
  ExamNames = [];
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
      searchCopyExamId: [0],
      searchExamId: [0],
    });
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
      //this.contentservice.GetOrgExpiry(this.LoginUserDetail);
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
      this.SubOrgId = +this.tokenStorage.getSubOrgId();
      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.EXAMCLASSGROUPMAP);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu'])
      }
      else {

        this.GetMasterData();
        this.Getclassgroups();
      }
    }
  }

  // AddNew() {

  //   var newdata = {
  //     ExamClassGroupMapId: 0,
  //     ExamId: this.searchForm.get("searchExamId").value,
  //     Active: 0,
  //     Action: false
  //   };
  //   this.ExamClassGroupMapList = [];
  //   this.ExamClassGroupMapList.push(newdata);
  //   this.dataSource = new MatTableDataSource<IExamClassGroupMap>(this.ExamClassGroupMapList);
  //   this.dataSource.paginator = this.paging;
  // }
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
  ClearData() {
    this.ExamClassGroupMapList = [];
    this.dataSource = new MatTableDataSource<IExamClassGroupMap>(this.ExamClassGroupMapList);
  }
  UpdateOrSave(row) {
    this.ToUpdateCount = 1;
    //debugger;
    this.loading = true;
    if (row.ClassGroupId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class group.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.ExamId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select Exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }


    let checkFilterString = this.FilterOrgSubOrg +
      " and ClassGroupId eq " + row.ClassGroupId +
      " and ExamId eq " + row.ExamId;

    if (row.ExamClassGroupMapId > 0)
      checkFilterString += " and ExamClassGroupMapId ne " + row.ExamClassGroupMapId;
    let list: List = new List();
    list.fields = ["ExamClassGroupMapId"];
    list.PageName = this.ExamClassGroupMapListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.ExamClassGroupMapData.ExamClassGroupMapId = row.ExamClassGroupMapId;
          this.ExamClassGroupMapData.Active = row.Active;
          this.ExamClassGroupMapData.ExamId = row.ExamId;
          this.ExamClassGroupMapData.ClassGroupId = row.ClassGroupId;
          this.ExamClassGroupMapData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ExamClassGroupMapData.SubOrgId = this.SubOrgId;
          //console.log("this.ExamClassGroupMapData", this.ExamClassGroupMapData);
          if (this.ExamClassGroupMapData.ExamClassGroupMapId == 0) {
            this.ExamClassGroupMapData["CreatedDate"] = new Date();
            this.ExamClassGroupMapData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ExamClassGroupMapData["UpdatedDate"] = new Date();
            delete this.ExamClassGroupMapData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ExamClassGroupMapData["CreatedDate"];
            delete this.ExamClassGroupMapData["CreatedBy"];
            this.ExamClassGroupMapData["UpdatedDate"] = new Date();
            this.ExamClassGroupMapData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.ExamClassGroupMapListName, this.ExamClassGroupMapData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ExamClassGroupMapId = data.ExamClassGroupMapId;
          row.GradeName = globalconstants.decodeSpecialChars(row.GradeName);
          row.Action = false;
          this.ToUpdateCount--;
          if (this.ToUpdateCount == 0) {
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse()
          }
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ExamClassGroupMapListName, this.ExamClassGroupMapData, this.ExamClassGroupMapData.ExamClassGroupMapId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          row.GradeName = globalconstants.decodeSpecialChars(row.GradeName);
          this.ToUpdateCount--;
          if (this.ToUpdateCount == 0) {
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse();
          }
        });
  }
  ClassGroupMappings = [];
  GetclassgroupMappings() {
    this.contentservice.GetClassGroupMappings(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassGroupMappings = data.value.map(m => {
            let filtered: any = this.ClassGroups.filter((g: any) => g.ClassGroupId == m.ClassGroupId);
            if (filtered.length > 0)
              m.GroupName = filtered[0].GroupName;
            return m;
          });
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
      });
  }
  Getclassgroups() {
    this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassGroups = [...data.value];
          this.GetclassgroupMappings();
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
      });
  }
  DatafromotherexamMSG = '';
  CopyFromOtherExam() {
    debugger;
    var _copyFromExamId = this.searchForm.get("searchCopyExamId").value;
    var _examId = this.searchForm.get("searchExamId").value;
    if (_copyFromExamId == 0) {
      this.contentservice.openSnackBar("Please select exam to copy from.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam for which to define student grade.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.GetExamClassGroupMap();
  }
  ExamReleased = 0;
  GetExamClassGroupMap() {

    this.loading = true;
    let filterStr = this.FilterOrgSubOrg;
    //" and BatchId eq " + this.SelectedBatchId;

    var _examId = this.searchForm.get("searchExamId").value;
    //var _ClassGroupId = this.searchForm.get("searchClassGroupId").value;
    if (_examId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      var examObj = this.Exams.filter(e => e.ExamId == _examId)
      var _examName = '';
      if (examObj.length > 0) {
        _examName = examObj[0].ExamName;
        this.ExamReleased = examObj[0].ReleaseResult;
      }
      else
        this.ExamReleased = 0;


      filterStr += ' and ExamId eq ' + _examId;
    }

    let list: List = new List();
    list.fields = [
      "ExamClassGroupMapId",
      "ExamId",
      "ClassGroupId",
      //"ClassGroupMappingId",
      "Active"];

    list.PageName = this.ExamClassGroupMapListName;
    list.filter = [filterStr];
    this.ExamClassGroupMapList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.ExamClassGroupMapList = [];
        this.ClassGroups.forEach(c => {
          var existing = data.value.filter(d => d.ClassGroupId == c.ClassGroupId)
          if (existing.length > 0) {
            existing.forEach(ex => {
              ex.GroupName = c.GroupName;
              ex.Action = false;
              ex.Sort = ex.Active ? 1 : 0;
              this.ExamClassGroupMapList.push(ex);
            })
          }
          else {
            this.ExamClassGroupMapList.push({
              ExamClassGroupMapId: 0,
              ExamId: _examId,
              GroupName: c.GroupName,
              ClassGroupId: c.ClassGroupId,
              ClassGroupMappingId: c.ClassGroupMappingId,
              Active: false,
              Sort: 0,
              Action: false
            })
          }
        })

        if (this.ExamClassGroupMapList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        this.ExamClassGroupMapList = this.ExamClassGroupMapList.sort((a, b) => b.Sort - a.Sort || b.ExamClassGroupMapId - a.ExamClassGroupMapId)
        this.dataSource = new MatTableDataSource<IExamClassGroupMap>(this.ExamClassGroupMapList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });
  }
  SelectAll(event) {
    //var event ={checked:true}
    this.ExamClassGroupMapList.forEach(element => {
      element.Active = event.checked;
      element.Action = true;
    })
  }
  ToUpdateCount = 0;
  SaveAll() {
    debugger;
    var toUpdate = this.ExamClassGroupMapList.filter(all => all.Action)
    this.ToUpdateCount = toUpdate.length;
    toUpdate.forEach(item => {
      this.UpdateOrSave(item);
    })
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      this.Classes = [...data.value];
      this.loading = false; this.PageLoading = false;
    });
    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId, 2)
      .subscribe((data: any) => {
        //this.Exams = [...data.value];
        this.Exams = [];
        data.value.forEach(e => {
          //var _examName = '';
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId && n.Active == 1)
          if (obj.length > 0) {
            //_examName = obj[0].MasterDataName
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId,
              StartDate: e.StartDate,
              EndDate: e.EndDate,
              AttendanceStartDate: e.AttendanceStartDate,
              Sequence: obj[0].Sequence,
              ReleaseResult: e.ReleaseResult
            })
          }
        })
      })
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }
}
export interface IExamClassGroupMap {
  ExamClassGroupMapId: number;
  ExamId: number;
  GroupName: string;
  ClassGroupId: number;
  ClassGroupMappingId: number;
  Active: boolean;
  Sort: number;
  Action: boolean;
}

