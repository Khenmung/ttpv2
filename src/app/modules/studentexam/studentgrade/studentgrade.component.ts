import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
@Component({
  selector: 'app-studentgrade',
  templateUrl: './studentgrade.component.html',
  styleUrls: ['./studentgrade.component.scss']
})
export class StudentgradeComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paging: MatPaginator;
  Defaultvalue=0;
  ClassGroups :any[]= [];
  SubjectCategory :any[]= [];
  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  StudentGradeListName = 'StudentGrades';
  Applications :any[]= [];
  loading = false;
  SelectedBatchId = 0; SubOrgId = 0;
  StudentGradeList: IStudentGrade[]= [];
  filteredOptions: Observable<IStudentGrade[]>;
  dataSource: MatTableDataSource<IStudentGrade>;
  allMasterData :any[]= [];
  StudentGrade :any[]= [];
  Permission = 'deny';
  Classes :any[]= [];
  ExamStatus :any[]= [];
  Exams :any[]= [];
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  StudentGradeData = {
    StudentGradeId: 0,
    ExamId: 0,
    GradeName: '',
    Formula: '',
    ClassGroupId: 0,
    SubjectCategoryId: 0,
    GradeStatusId: 0,
    Sequence: 0,
    Points: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    "StudentGradeId",
    "GradeName",
    "Points",
    "Formula",
    "ClassGroupId",
    "SubjectCategoryId",
    "Sequence",
    "Active",
    "Action"
  ];
  ExamClassGroups :any[]= [];
  ExamNames :any[]= [];
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
      searchCopyFromExamId: [0],
      searchClassGroupId: [0],
      searchCopyFromClassGroupId: [0],
      searchSubjectCategoryId: [0]
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //this.EmployeeId = +this.tokenStorage.getEmployeeId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.STUDENTGRADE);
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

  AddNew() {

    var newdata = {
      StudentGradeId: 0,
      ExamId: this.searchForm.get("searchExamId")?.value,
      GradeName: '',
      Formula: '',
      ClassGroupId: this.searchForm.get("searchClassGroupId")?.value,
      SubjectCategoryId: this.searchForm.get("searchSubjectCategoryId")?.value,
      GradeStatusId: 0,
      Sequence: 0,
      Points: 0,
      Active: 0,
      Action: false
    };
    this.StudentGradeList = [];
    this.StudentGradeList.push(newdata);
    this.dataSource = new MatTableDataSource<IStudentGrade>(this.StudentGradeList);
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

    row.GradeName = globalconstants.encodeSpecialChars(row.GradeName);
    if (row.Sequence > 250) {
      this.loading = false;
      this.contentservice.openSnackBar("Sequence should not be greater than 250.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.Points > 250) {
      this.loading = false;
      this.contentservice.openSnackBar("Points should not be greater than 250.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    let checkFilterString = this.FilterOrgSubOrg + " and GradeName eq '" + row.GradeName +
      "' and ClassGroupId eq " + row.ClassGroupId +
      " and ExamId eq " + row.ExamId;

    if (row.SubjectCategoryId == null || row.SubjectCategoryId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select subject category.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    checkFilterString += " and SubjectCategoryId eq " + row.SubjectCategoryId

    //+ " and BatchId eq " + this.SelectedBatchId;

    if (row.StudentGradeId > 0)
      checkFilterString += " and StudentGradeId ne " + row.StudentGradeId;
    let list: List = new List();
    list.fields = ["StudentGradeId"];
    list.PageName = this.StudentGradeListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.StudentGradeData.StudentGradeId = row.StudentGradeId;
          this.StudentGradeData.Active = row.Active;
          this.StudentGradeData.ExamId = row.ExamId;
          this.StudentGradeData.GradeName = row.GradeName;
          this.StudentGradeData.ClassGroupId = row.ClassGroupId;
          this.StudentGradeData.SubjectCategoryId = row.SubjectCategoryId;
          this.StudentGradeData.GradeStatusId = row.GradeStatusId;
          this.StudentGradeData.Formula = row.Formula;
          this.StudentGradeData.Sequence = row.Sequence;
          this.StudentGradeData.Points = row.Points;
          this.StudentGradeData.BatchId = this.SelectedBatchId;
          this.StudentGradeData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.StudentGradeData.SubOrgId = this.SubOrgId;
          ////console.log("this.StudentGradeData", this.StudentGradeData);
          if (this.StudentGradeData.StudentGradeId == 0) {
            this.StudentGradeData["CreatedDate"] = new Date();
            this.StudentGradeData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.StudentGradeData["UpdatedDate"] = new Date();
            delete this.StudentGradeData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.StudentGradeData["CreatedDate"];
            delete this.StudentGradeData["CreatedBy"];
            this.StudentGradeData["UpdatedDate"] = new Date();
            this.StudentGradeData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.StudentGradeListName, this.StudentGradeData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.StudentGradeId = data.StudentGradeId;
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

    this.dataservice.postPatch(this.StudentGradeListName, this.StudentGradeData, this.StudentGradeData.StudentGradeId, 'patch')
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
  Getclassgroups() {
    this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassGroups = [...data.value];

        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
      });
  }
  DatafromotherexamMSG = '';
  CopyFromOtherExam() {
    debugger;
    var _copyFromExamId = this.searchForm.get("searchCopyFromExamId")?.value;
    var _copyFromClassGroupId = this.searchForm.get("searchCopyFromClassGroupId")?.value;
    var _examId = this.searchForm.get("searchExamId")?.value;
    if (_copyFromExamId == 0) {
      this.contentservice.openSnackBar("Please select exam to copy from.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_copyFromClassGroupId == 0) {
      this.contentservice.openSnackBar("Please select class group to copy from.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_examId == 0) {
      this.contentservice.openSnackBar("Please select exam for which to define student grade.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.GetStudentGrade(_copyFromExamId, _copyFromClassGroupId);
  }
  ExamReleased = 0;
  FilteredClassGroup :any[]= [];
  FilteredCopyFromClassGroup :any[]= [];
  ShowCopyBlock = false;
  ShowHide() {
    this.ShowCopyBlock = !this.ShowCopyBlock;
  }
  SelectClassGroup() {
    var _examId = this.searchForm.get("searchExamId")?.value;
    this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg, _examId)
      .subscribe((data: any) => {
        this.ExamClassGroups = data.value.map(e => {
          e.GroupName = "";
          var _group = this.ClassGroups.filter(c => c.ClassGroupId == e.ClassGroupId)
          if (_group.length > 0)
            e.GroupName = _group[0].GroupName;
          return e;
        })
        this.FilteredClassGroup = this.ExamClassGroups.filter(e => e.ExamId == _examId);
      })

    this.EnableCopyButton();
    this.ClearData();

  }
  SelectCopyFromClassGroup() {
    debugger;
    var _examId = this.searchForm.get("searchCopyFromExamId")?.value;
    this.contentservice.GetExamClassGroup(this.FilterOrgSubOrg, _examId)
      .subscribe((data: any) => {
        this.ExamClassGroups = data.value.map(e => {
          e.GroupName = this.ClassGroups.filter(c => c.ClassGroupId == e.ClassGroupId)[0].GroupName;
          return e;
        })

        this.FilteredCopyFromClassGroup = this.ExamClassGroups.filter(e => e.ExamId == _examId);
      })

  }
  GetStudentGrade(pCopyFromExamId, pCoyFromClassGroupId) {

    this.loading = true;
    let filterStr = this.FilterOrgSubOrg;
    //" and BatchId eq " + this.SelectedBatchId;

    var _examId = this.searchForm.get("searchExamId")?.value;
    var _ClassGroupId = this.searchForm.get("searchClassGroupId")?.value;
    var _SubjectCategoryId = this.searchForm.get("searchSubjectCategoryId")?.value;
    if (pCopyFromExamId == 0 && _examId == 0) {
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

      if (pCopyFromExamId == 0 && _ClassGroupId == 0) {
        this.loading = false;
        this.contentservice.openSnackBar("Please select class group.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
      else if (pCopyFromExamId > 0 && pCoyFromClassGroupId == 0) {
        this.loading = false;
        this.contentservice.openSnackBar("Please select class group to copy from.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }

      if (pCopyFromExamId > 0) {
        this.DatafromotherexamMSG = "Data from '" + _examName + "'";
        filterStr += ' and (ExamId eq ' + pCopyFromExamId + ' or ExamId eq ' + _examId + ')';
        filterStr += " and ClassGroupId eq " + pCoyFromClassGroupId;
      } else {
        filterStr += ' and ExamId eq ' + _examId;
        filterStr += " and ClassGroupId eq " + _ClassGroupId;
      }
    }


    if (_SubjectCategoryId > 0) {
      filterStr += " and SubjectCategoryId eq " + _SubjectCategoryId;
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select subject category.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let list: List = new List();
    list.fields = [
      "StudentGradeId",
      "ExamId",
      "GradeName",
      "Formula",
      "SubjectCategoryId",
      "GradeStatusId",
      "ClassGroupId",
      "Sequence",
      "Points",
      "Active"];

    list.PageName = this.StudentGradeListName;
    list.filter = [filterStr];
    this.StudentGradeList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          var _CopyFromExam :any[]= [];
          var _SelectedExam = data.value.filter(d => d.ExamId == _examId);
          if (pCopyFromExamId > 0) {
            _CopyFromExam = data.value.filter(d => d.ExamId == pCopyFromExamId);
            this.StudentGradeList = _CopyFromExam.map(f => {
              f.GradeName = globalconstants.decodeSpecialChars(f.GradeName);
              //convert all examid to _examId
              f.ExamId = _examId;

              var existingstudentgrade = _SelectedExam.filter((s:any) => s.ClassGroupId == _ClassGroupId && s.SubjectCategoryId == _SubjectCategoryId);
              if (existingstudentgrade.length > 0) {
                f.StudentGradeId = existingstudentgrade[0].StudentGradeId;
              }
              else {
                f.StudentGradeId = 0;
                f.Active = 0;
              }
              f.ClassGroupId =_ClassGroupId;
              return f;
            });
          }
          else
            this.StudentGradeList = data.value.map(d => {
              d.GradeName = globalconstants.decodeSpecialChars(d.GradeName);
              d.ClassGroupId =_ClassGroupId;
              return d;
            });
          this.StudentGradeList = this.StudentGradeList.sort((a, b) => a.Sequence - b.Sequence);
        }

        if (this.StudentGradeList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        this.dataSource = new MatTableDataSource<IStudentGrade>(this.StudentGradeList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });
  }
  ClearData() {
    this.StudentGradeList = [];
    this.dataSource = new MatTableDataSource<IStudentGrade>(this.StudentGradeList);
  }
  EnableCopy = false;
  EnableCopyButton() {

    var _examId = this.searchForm.get("searchExamId")?.value;
    var _ClassGroupId = this.searchForm.get("searchClassGroupId")?.value;
    var _SubjectCategoryId = this.searchForm.get("searchSubjectCategoryId")?.value;
    if (_examId > 0 && _ClassGroupId > 0 && _SubjectCategoryId > 0)
      this.EnableCopy = true;
    else
      this.EnableCopy = false;
    this.ClearData();
  }
  SelectAll(event) {
    //var event ={checked:true}
    this.StudentGradeList.forEach(element => {
      element.Active = 1;
      element.Action = true;
    })
  }
  ToUpdateCount = 0;
  SaveAll() {
    debugger;
    var toUpdate = this.StudentGradeList.filter(all => all.Action)
    this.ToUpdateCount = toUpdate.length;
    toUpdate.forEach(item => {
      this.UpdateOrSave(item);
    })
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY)
    this.ExamStatus = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    //this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP)
    //var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
      if(data.value) this.Classes = [...data.value]; else this.Classes = [...data];
      this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
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
export interface IStudentGrade {
  StudentGradeId: number;
  GradeName: string;
  Formula: string;
  SubjectCategoryId: number;
  GradeStatusId: number;
  ClassGroupId: number;
  Sequence: number;
  Points: number;
  Active: number;
  Action: boolean;
}
