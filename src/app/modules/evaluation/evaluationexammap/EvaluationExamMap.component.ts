import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { EventEmitter } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import alasql from 'alasql';

@Component({
  selector: 'app-EvaluationExamMap',
  templateUrl: './EvaluationExamMap.component.html',
  styleUrls: ['./EvaluationExamMap.component.scss']
})
export class EvaluationExamMapComponent implements OnInit {
  PageLoading = true;
  @Output() NotifyParent: EventEmitter<number> = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  EvaluationUpdatable: any = null;
  EvaluationMasterId = 0;
  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  EvaluationExamMapList: IEvaluationExamMap[]= [];
  //ExamModes :any[]= [];
  ExamNames :any[]= [];
  Sessions :any[]= [];
  SelectedBatchId = 0; SubOrgId = 0;
  //SelectedClassSubjects :any[]= [];
  //ClassGroups :any[]= [];
  ClassGroupMappings :any[]= [];
  //ClassSubjects :any[]= [];
  Classes :any[]= [];
  RatingOptions :any[]= [];
  filteredOptions: Observable<IEvaluationExamMap[]>;
  dataSource: MatTableDataSource<IEvaluationExamMap>;
  allMasterData :any[]= [];
  EvaluationNames :any[]= [];
  Exams :any[]= [];
  EvaluationExamMapData = {
    EvaluationExamMapId: 0,
    //ClassGroupId: 0,
    //ClassSubjectId: 0,
    EvaluationMasterId: 0,
    ExamId: 0,
    OrgId: 0, SubOrgId: 0,
    Active: 0,
  };
  EvaluationExamMapForUpdate :any[]= [];
  displayedColumns = [
    'EvaluationExamMapId',
    'EvaluationName',
    //'ClassGroupId',
    'ExamId',
    //'ClassSubjectId',
    'Active',
    'Action'
  ];
  ClassGroups :any[]= [];
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
    this.StudentClassId = this.tokenStorage.getStudentClassId()!;
    this.searchForm = this.fb.group({
      searchEvaluationMasterId: [0],
      searchClassGroupId: [0],
      searchExamId: [0]
    })
    this.PageLoad();
  }

  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  PassParent(value: number) {
    debugger;
    this.NotifyParent.emit(value);

  }
  ExamClassGroups :any[]= [];
  PageLoad() {
    debugger;
    //console.log("EvaluationUpdatable", this.EvaluationUpdatable)
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EvaluationExamMap)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetEvaluationNames();
        this.GetMasterData();
        if (this.Classes.length == 0) {
          this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
            this.Classes = [...data.value];
            this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
          });
        }

        this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
          .subscribe((data: any) => {
            this.ClassGroups = [...data.value];
          });
        this.contentservice.GetClassGroupMapping(this.FilterOrgSubOrg, 1)
          .subscribe((data: any) => {
            this.ClassGroupMappings = [...data.value];
            this.loading = false;
            this.PageLoading = false;
          })
        this.GetEvaluationExamMap();
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
          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  // GetClassSubjects() {
  //   let list = new List();
  //   list.PageName = "ClassSubjects";
  //   list.fields = ["ClassSubjectId,ClassId,SubjectId"];
  //   list.lookupFields = ["Class($select=ClassId,ClassName)"];
  //   list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.ClassSubjects = data.value.map(m => {
  //         var _subjectname = "";
  //         var subjectobj = this.allMasterData.filter((f:any) => f.MasterDataId == m.SubjectId);
  //         if (subjectobj.length > 0)
  //           _subjectname = subjectobj[0].MasterDataName;
  //         m.ClassSubject = _subjectname;

  //         return m;

  //       });
  //     });
  // }
  // viewchild(row) {
  //   this.EvaluationExamMapId = row.EvaluationExamMapId;
  // }
  AddNew() {
    var _EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId")?.value
    var newItem = {
      EvaluationExamMapId: 0,
      //ClassGroupId: 0,
      //ClassSubjectId: 0,
      ExamId: 0,
      EvaluationMasterId: _EvaluationMasterId,
      EvaluationName: this.EvaluationNames.filter((f:any) => f.EvaluationMasterId == _EvaluationMasterId)[0].EvaluationName,
      Active: false,
      Deleted: "false",
      Action: false
    }
    this.EvaluationExamMapList = [];
    this.EvaluationExamMapList.push(newItem);
    this.dataSource = new MatTableDataSource(this.EvaluationExamMapList);
    this.getClassGroupForExam();
  }
  ClearData() {
    this.EvaluationExamMapList = [];
    this.dataSource = new MatTableDataSource(this.EvaluationExamMapList);
  }
  UpdateOrSave(row) {
    debugger;
    var _EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId")?.value;

    this.loading = true;
    let checkFilterString = this.FilterOrgSubOrg + " and Active eq true";
    if (!this.EvaluationUpdatable) {

      if (row.ExamId > 0)
        checkFilterString += " and ExamId eq " + row.ExamId;
      else if(row.Active==1) {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar("Please select evaluation session or examination.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }

    //if (_EvaluationMasterId > 0)
      checkFilterString += " and EvaluationMasterId eq " + row.EvaluationMasterId;
    // else {
    //   this.loading = false; this.PageLoading = false;
    //   this.contentservice.openSnackBar("Please select evaluation.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    if (row.EvaluationExamMapId > 0)
      checkFilterString += " and EvaluationExamMapId ne " + row.EvaluationExamMapId;
    let list: List = new List();
    list.fields = ["EvaluationExamMapId"];
    list.PageName = "EvaluationExamMaps";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
          this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
          this.EvaluationExamMapForUpdate = [];
          this.EvaluationExamMapForUpdate.push(
            {
              EvaluationExamMapId: row.EvaluationExamMapId,
              ExamId: row.ExamId == null ? 0 : row.ExamId,
              EvaluationMasterId: row.EvaluationMasterId,
              Active: row.Active,
              Deleted: false,
              OrgId: this.LoginUserDetail[0]["orgId"],
              SubOrgId: this.SubOrgId
            });

          ////console.log("for udpate",this.EvaluationExamMapForUpdate[0])
          if (this.EvaluationExamMapForUpdate[0].EvaluationExamMapId == 0) {
            this.EvaluationExamMapForUpdate[0]["CreatedDate"] = new Date();
            this.EvaluationExamMapForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EvaluationExamMapForUpdate[0]["UpdatedDate"] = new Date();
            delete this.EvaluationExamMapForUpdate[0]["UpdatedBy"];
            delete this.EvaluationExamMapForUpdate[0]["SubCategories"];
            ////console.log("inserting1", this.EvaluationExamMapForUpdate);
            this.insert(row);
          }
          else {
            delete this.EvaluationExamMapForUpdate[0]["CreatedDate"];
            this.EvaluationExamMapForUpdate[0]["UpdatedDate"] = new Date();
            delete this.EvaluationExamMapForUpdate[0]["CreatedBy"];
            delete this.EvaluationExamMapForUpdate[0]["SubCategories"];
            delete this.EvaluationExamMapForUpdate[0]["UpdatedBy"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {
    ////console.log("inserting",this.EvaluationExamMapForUpdate);
    //debugger;
    this.dataservice.postPatch('EvaluationExamMaps', this.EvaluationExamMapForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.EvaluationExamMapId = data.EvaluationExamMapId;
          row.Action = false;
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {
    ////console.log("updating",this.EvaluationExamMapForUpdate);
    this.dataservice.postPatch('EvaluationExamMaps', this.EvaluationExamMapForUpdate[0], this.EvaluationExamMapForUpdate[0].EvaluationExamMapId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        },error=>{
          this.loadingFalse();
          this.contentservice.openSnackBar(globalconstants.formatError(error),globalconstants.ActionText,globalconstants.RedBackground);
        });
  }
  GetEvaluationNames() {
    //debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    let filterStr = this.FilterOrgSubOrg + " and Active eq true";// and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
      'EvaluationMasterId',
      'EvaluationName',
      'Description',
      'ClassGroupId',
      'Duration',
      'DisplayResult',
      'AppendAnswer',
      'ProvideCertificate',
      'Confidential',
      'FullMark',
      'PassMark',
      'Active'
    ];

    list.PageName = "EvaluationMasters";

    list.filter = [filterStr];
    this.EvaluationNames = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          var result = data.value.map(d => {
            d.EvaluationName = globalconstants.decodeSpecialChars(d.EvaluationName);
            return d;
          })
          this.EvaluationNames = this.contentservice.getConfidentialData(this.tokenStorage, result, "EvaluationName");

        }
        this.loadingFalse();
      });

  }
  SelectedClassGroupExam :any[]= [];
  SelectEvaluation() {
    debugger;

    this.getClassGroupForExam();
    this.ClearData();
  }
  getClassGroupForExam() {
    var _searchClassGroupId = this.searchForm.get("searchClassGroupId")?.value;
    var _classesForSelectedClassGroup = this.ClassGroupMappings.filter(m => m.ClassGroupId == _searchClassGroupId);
    var allGroupsForAllTheSelectedClasses = this.ClassGroupMappings.filter(g => _classesForSelectedClassGroup.filter(i => i.ClassId == g.ClassId).length > 0)
    let distinctClassGroupIds= alasql("select distinct ClassGroupId from ?",[allGroupsForAllTheSelectedClasses])
    this.EvaluationMasterForClassGroup = this.EvaluationNames.filter(d => distinctClassGroupIds.map(e=>e.ClassGroupId).indexOf(d.ClassGroupId)>-1)
    var _searchExamId = this.searchForm.get("searchExamId")?.value;
    this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg, _searchExamId)
      .subscribe((data: any) => {
        this.ExamClassGroups = [...data.value];
        var examIdsforselectedclsgroup = this.ExamClassGroups.filter(examclsgroup => examclsgroup.ClassGroupId == _searchClassGroupId);
        this.SelectedClassGroupExam = this.Exams.filter((f:any) => examIdsforselectedclsgroup.findIndex(i => i.ExamId == f.ExamId) > -1);
      });
  }
  EvaluationExamMap :any[]= [];
  GetEvaluationExamMap() {
    var filterStr = 'OrgId eq ' + this.LoginUserDetail[0]['orgId']
    let list: List = new List();
    list.fields = [
      'EvaluationExamMapId',
      'ExamId',
      'EvaluationMasterId',
      'Active',
    ];

    list.PageName = "EvaluationExamMaps";
    list.filter = [filterStr];
    this.EvaluationExamMap = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.EvaluationExamMap = [...data.value];

      })
  }
  EvaluationMasterForClassGroup :any[]= [];

  GetEvaluationExamMapList() {
    debugger;
    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    //let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    //var _classGroupId = this.searchForm.get("searchClassGroupId")?.value;
    //var _subjectId = this.searchForm.get("searchSubjectId")?.value;
    var _EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId")?.value;

    var _searchClassGroupId = this.searchForm.get("searchClassGroupId")?.value;


    if (_searchClassGroupId == 0) {
      this.loading = false;
      this.PageLoading = false;
      this.contentservice.openSnackBar("Please select class group.", globalconstants.ActionText, globalconstants.BlueBackground);
      return;
    }
    var _evaluationMappedForSelectedClassGroup :any[]= [];
    if (_EvaluationMasterId > 0) {
      _evaluationMappedForSelectedClassGroup = JSON.parse(JSON.stringify(this.EvaluationMasterForClassGroup.filter(e => e.EvaluationMasterId == _EvaluationMasterId)))
    }
     else {
      _evaluationMappedForSelectedClassGroup = JSON.parse(JSON.stringify(this.EvaluationMasterForClassGroup));
     }
      //   this.loading = false;
    //   this.PageLoading = false;
    //   this.contentservice.openSnackBar("Please select evaluation type.", globalconstants.ActionText, globalconstants.BlueBackground);
    //   return;
    // }
    //  filterStr += " and EvaluationMasterId eq " + _EvaluationMasterId;

    // if (_searchExamId > 0)
    //   filterStr += " and ExamId eq " + _searchExamId;

    let list: List = new List();

    if (_evaluationMappedForSelectedClassGroup.length > 0) {
      var _evaluationExamMapForSelectedEval = this.EvaluationExamMap.filter((f:any) => {
        return _evaluationMappedForSelectedClassGroup.map(e => e.EvaluationMasterId).indexOf(f.EvaluationMasterId)>-1
      });
      //var _filter = this.FilterOrgSubOrg;// "OrgId eq " + this.LoginUserDetail[0]["orgId"];
      // var subfilter = '';
      // _evaluationExamMapForSelectedEval.forEach((mapdata, indx) => {
      //   subfilter += 'EvaluationExamMapId eq ' + mapdata.EvaluationExamMapId
      //   if (indx < _evaluationExamMapForSelectedEval.length - 1)
      //     subfilter += " or "
      //   else
      //     subfilter += ")"
      // })
      // if (subfilter.length == 0) {
      //   this.contentservice.openSnackBar("No exam mapping found.", globalconstants.ActionText, globalconstants.BlueBackground);
      //   this.loading = false;
      // }
      // else {
      //   _filter += " and (" + subfilter;
      //   list.fields = ['EvaluationExamMapId'];
      //   list.PageName = "StudentEvaluationResults";
      //   list.filter = [_filter];
      //   this.dataservice.get(list)
      //     .subscribe((useddata: any) => {
            this.EvaluationExamMapList = _evaluationExamMapForSelectedEval.map(item => {
              item["EvaluationName"] = this.EvaluationNames.filter((f:any) => f.EvaluationMasterId == item.EvaluationMasterId)[0].EvaluationName
              //item["AlreadyUsed"] = useddata.value.filter((f:any) => f.EvaluationExamMapId == item.EvaluationExamMapId).length > 0;
              item.Action = false;
              return item;
            })
            this.dataSource = new MatTableDataSource<IEvaluationExamMap>(this.EvaluationExamMapList);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.loadingFalse();
          //})
      //}
    }
    else {
      this.loadingFalse();
      this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
      this.dataSource = new MatTableDataSource<IEvaluationExamMap>(this.EvaluationExamMapList);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    // }
    // else {
    //   this.loadingFalse();
    //   this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
    //   this.dataSource = new MatTableDataSource<IEvaluationExamMap>(this.EvaluationExamMapList);
    //   this.dataSource.paginator = this.paginator;
    //   this.dataSource.sort = this.sort;
    // }


    //this.loading = false;
    //  });

  }
  GetExams() {
    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId, 2)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.map(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0) {
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId,
              AttendanceStartDate: e.AttendanceStartDate
            })
          }
        })
        this.loading = false; this.PageLoading = false;
      })
    //this.Exams =
    // //var _gradingExamModeId = this.ExamModes.filter((f:any) => f.MasterDataName.toLowerCase() == globalconstants.ExamGrading.toLowerCase())[0].MasterDataId;
    // var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] +
    //   ' and BatchId eq ' + this.SelectedBatchId
    // //  ' and ExamModeId eq ' + _gradingExamModeId;

    // let list: List = new List();

    // list.fields = ["ExamId", "ExamNameId","ClassGroupId"];
    // list.PageName = "Exams";
    // list.filter = ["Active eq 1 " + orgIdSearchstr];

    // this.dataservice.get(list)
    // .subscribe((data: any) => {
    //   this.Exams = data.value.map(e => {
    //     var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
    //     if (obj.length > 0) {
    //       this.Exams.push({
    //         ExamId: e.ExamId,
    //         ExamName: obj[0].MasterDataName,
    //         ClassGroupId:obj[0].ClassGroupId
    //       })
    //     }
    //   })
    //   this.loading = false; this.PageLoading = false;
    // })
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    //this.ExamModes = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMMODE);
    this.GetExams();
    this.loading = false; this.PageLoading = false;
  }
  onBlur(row) {
    row.Action = true;
  }

  GetEvaluationMasterId() {
    this.EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId")?.value;
    this.EvaluationUpdatable = this.EvaluationNames.filter((f:any) => f.EvaluationMasterId == this.EvaluationMasterId)[0].AppendAnswer;
    ////console.log("EvaluationUpdatable", this.EvaluationUpdatable);
    this.ClearData();
  }
  UpdateActive(row, event) {
    row.Active = event.checked;
    row.Action = true;
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

export interface IEvaluationExamMap {
  EvaluationExamMapId: number;
  ExamId: number;
  //ClassGroupId: number;
  //ClassSubjectId: number;
  EvaluationMasterId: number;
  Active: boolean;
  Deleted: string;
  Action: boolean;
}

export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}

