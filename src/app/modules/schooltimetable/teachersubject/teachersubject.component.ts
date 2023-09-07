import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-teachersubject',
  templateUrl: './teachersubject.component.html',
  styleUrls: ['./teachersubject.component.scss']
})
export class TeachersubjectComponent implements OnInit {
  PageLoading = false;
  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  LoginUserDetail:any[]= [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  TeacherSubjectListName = "TeacherSubjects";
  Permission = '';
  SelectedApplicationId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  StandardFilterWithPreviousBatchId = '';
  PreviousBatchId = 0;
  loading = false;
  WorkAccounts :any[]= [];
  Teachers :any[]= [];
  Classes :any[]= [];
  Subjects :any[]= [];
  SubjectTypes :any[]= [];
  CurrentBatchId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  CheckBatchIDForEdit = 1;
  DataCountToSave = -1;
  Batches :any[]= [];
  ClassSubjects :any[]= [];
  TeacherSubjectList: ITeacherSubject[]= [];
  dataSource: MatTableDataSource<ITeacherSubject>;
  allMasterData :any[]= [];
  searchForm = this.fb.group({
    searchClassId: [0],
    searchEmployeeId: [0],
    searchSectionId:[0],
    searchSemesterId:[0]
  });
  SelectedClassCategory = '';
  Defaultvalue = 0;
  Semesters :any[]= [];
  ClassCategory :any[]= [];
  Sections :any[]= [];
  TeacherSubjectId = 0;
  TeacherSubjectData = {
    TeacherSubjectId: 0,
    ClassSubjectId: 0,
    EmployeeId: 0,
    OrgId: 0, SubOrgId: 0,
    Active: 1
  };
  displayedColumns = [
    'TeacherSubjectId',
    'EmployeeId',
    'ClassSubjectId',
    'ClsName',
    'Active',
    'Action'
  ];
  filteredOptions: any;
  Students: any;
  nameFilter = new UntypedFormControl('');
  filterValues = {
    SubjectName: ''
  };
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private shareddata: SharedataService,
    private dialog: MatDialog
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
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.nameFilter.valueChanges
        .subscribe(
          name => {
            this.filterValues.SubjectName = name;
            this.dataSource.filter = JSON.stringify(this.filterValues);
          }
        )
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.CLASSSUBJECTDETAIL);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission == 'deny') {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.StandardFilterWithPreviousBatchId = globalconstants.getOrgSubOrgFilterWithPreviousBatchId(this.tokenStorage);
        this.shareddata.CurrentSubjects.subscribe(r => this.Subjects = r);
        this.GetMasterData();

      }
    }
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.SubjectName.toLowerCase().indexOf(searchTerms.SubjectName) !== -1
    }
    return filterFunction;
  }
  GetSessionFormattedMonths() {
    var _sessionStartEnd = {
      StartDate: new Date(),
      EndDate: new Date()
    };
    var Months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
    var monthArray :any[]= [];
    //setTimeout(() => {

    this.shareddata.CurrentSelectedBatchStartEnd$.subscribe((b: any) => {

      if (b.length != 0) {
        _sessionStartEnd = { ...b };
        ////console.log('b',b)
        var _Year = new Date(_sessionStartEnd.StartDate).getFullYear();
        var startMonth = new Date(_sessionStartEnd.StartDate).getMonth();

        for (var month = 0; month < 12; month++, startMonth++) {
          monthArray.push({
            MonthName: Months[startMonth] + " " + _Year,
            val: _Year + startMonth.toString().padStart(2, "0")
          })
          if (startMonth == 11) {
            startMonth = -1;
            _Year += 1;
          }
        }
      }
    });
    return monthArray;
  }

  ClearData() {
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    if (_classId > 0)
      this.TempClassSubject = globalconstants.getStrictFilteredClassSubjects(this.ClassSubjects, _classId, _sectionId, _semesterId);
    else
      this.TempClassSubject = [...this.ClassSubjects];

    this.TeacherSubjectList = [];
    this.dataSource = new MatTableDataSource<any>(this.TeacherSubjectList);
  }
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  GetSelectedClassSubjects() {
    debugger;
    let _classId = this.searchForm.get("searchClassId")?.value;
    let obj = this.Classes.filter(c => c.ClassId == _classId);
    if (obj.length > 0) {
      this.SelectedClassCategory = obj[0].Category.toLowerCase();
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();

  }
  GetTeacherSubjectId(event) {
    this.TeacherSubjectId = event;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "";
    this.TeacherSubjectList = [];
    this.dataSource = new MatTableDataSource<any>(this.TeacherSubjectList);
    this.GetTeacherSubject();
  }

  View(element) {
    // //debugger;
    // this.TeacherSubjectId = element.TeacherSubjectId;
    // this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    // setTimeout(() => {
    //   this.TeacherSubjectAdd.PageLoad();
    // }, 50);
  }

  addnew() {
    let toadd = {
      TeacherSubjectId: 0,
      EmployeeId: 0,
      ClassSubjectId: 0,
      Active: 1,
      Action: false
    };
    this.TeacherSubjectList.push(toadd);
    this.dataSource = new MatTableDataSource<ITeacherSubject>(this.TeacherSubjectList);

  }
  // CopyFromPreviousBatch() {
  //   //console.log("here ", this.PreviousBatchId)
  //   this.PreviousBatchId = +this.tokenStorage.getPreviousBatchId()!;
  //   if (this.PreviousBatchId == -1)
  //     this.contentservice.openSnackBar("Previous batch not defined.",globalconstants.ActionText,globalconstants.RedBackground);
  //   else
  //     this.GetTeacherSubject(1)
  // }
  GetTeacherSubject() {
    let filterStr = '';//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    //debugger;
    this.loading = true;

    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _employeeId = this.searchForm.get("searchEmployeeId")?.value;
    if (_classId == 0 && _employeeId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class/course or teacher", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    filterStr = this.FilterOrgSubOrg;
    if (_employeeId > 0) {
      filterStr += ' and EmployeeId eq ' + _employeeId
    }


    if (filterStr.length == 0) {
      this.loading = false;
      this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let list: List = new List();
    list.fields = [
      'TeacherSubjectId',
      'ClassSubjectId',
      'EmployeeId',
      'Active',
    ];

    list.PageName = this.TeacherSubjectListName;
    //list.lookupFields = ["ClassSubject($select=ClassSubjectId,ClassId,SubjectId)"];
    list.filter = [filterStr];
    this.TeacherSubjectList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _classSubject :any[]= [];
        if (_classId > 0)
          _classSubject = globalconstants.getStrictFilteredClassSubjects(this.ClassSubjects,_classId,_sectionId,_semesterId);
        else
          _classSubject = [...this.ClassSubjects];

        debugger;
        data.value.forEach(teachersubject => {
          var objClsSubject = _classSubject.filter(clssubject => clssubject.ClassSubjectId == teachersubject.ClassSubjectId)
          if (objClsSubject.length > 0) {
            teachersubject["ClsName"] = objClsSubject[0]["ClsName"];
            this.TeacherSubjectList.push(teachersubject);
          }

        })
        if (this.TeacherSubjectList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        this.TeacherSubjectList.sort((a, b) => b.Active - a.Active);
        //console.log("TeacherSubjectList", this.TeacherSubjectList);
        //console.log("TeacherSubjectList", this.TeacherSubjectList);
        this.dataSource = new MatTableDataSource<ITeacherSubject>(this.TeacherSubjectList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = this.createFilter();
        this.loading = false; this.PageLoading = false;
      });
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      //searchSubjectId: 0,

      //searchBatchId: this.SelectedBatchId
    });
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;

  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('TeacherSubjects', toupdate, element.TeacherSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  updateSelectHowMany(row) {
    //debugger;
    row.SelectHowMany = this.SubjectTypes.filter((f:any) => f.SubjectTypeId == row.SubjectTypeId)[0].SelectHowMany;
    row.Action = true;
  }
  SaveAll() {
    this.DataCountToSave = this.TeacherSubjectList.length;
    var toUpdate = this.TeacherSubjectList.filter((f:any) => f.Action);
    toUpdate.forEach(row => {
      this.DataCountToSave--;
      this.UpdateOrSave(row);
    })
  }

  UpdateOrSave(row) {
    this.DataCountToSave = 0;
    //debugger;
    this.loading = true;
    ////console.log("row.TeacherId", row.TeacherId);
    if (row.EmployeeId == 0) {
      this.contentservice.openSnackBar("Please select teacher.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      return;
    }
    if (row.ClassSubjectId == 0) {
      this.contentservice.openSnackBar("Please select subject.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      return;
    }
    let checkFilterString = this.FilterOrgSubOrg + " and ClassSubjectId eq " + row.ClassSubjectId +
      " and EmployeeId eq " + row.EmployeeId;


    if (row.TeacherSubjectId > 0)
      checkFilterString += " and TeacherSubjectId ne " + row.TeacherSubjectId;

    let list: List = new List();
    list.fields = ["TeacherSubjectId"];
    list.PageName = this.TeacherSubjectListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
          row.Ative = 0;
          return;
        }
        else {

          this.TeacherSubjectData.Active = row.Active;
          this.TeacherSubjectData.TeacherSubjectId = row.TeacherSubjectId;
          this.TeacherSubjectData.ClassSubjectId = row.ClassSubjectId;
          this.TeacherSubjectData.EmployeeId = row.EmployeeId;
          this.TeacherSubjectData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.TeacherSubjectData.SubOrgId = this.SubOrgId;
          if (this.TeacherSubjectData.TeacherSubjectId == 0) {
            this.TeacherSubjectData["CreatedDate"] = new Date();
            this.TeacherSubjectData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.TeacherSubjectData["UpdatedDate"];
            delete this.TeacherSubjectData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.TeacherSubjectData["CreatedDate"];
            delete this.TeacherSubjectData["CreatedBy"];
            this.TeacherSubjectData["UpdatedDate"] = new Date();
            this.TeacherSubjectData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });

  }

  insert(row) {

    //console.log('this.TeacherSubjectData', this.TeacherSubjectData)
    //debugger;
    this.dataservice.postPatch('TeacherSubjects', this.TeacherSubjectData, 0, 'post')
      .subscribe(
        (data: any) => {

          row.Action = false;
          row.TeacherSubjectId = data.TeacherSubjectId;
          if (this.DataCountToSave == 0) {
            this.loading = false; this.PageLoading = false;
            this.DataCountToSave = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  update(row) {

    this.dataservice.postPatch('TeacherSubjects', this.TeacherSubjectData, this.TeacherSubjectData.TeacherSubjectId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          if (this.DataCountToSave == 0) {
            this.loading = false; this.PageLoading = false;
            this.DataCountToSave = -1;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  GetSubjectTypes() {

    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = ["SubjectTypeId", "SubjectTypeName", "SelectHowMany"];
    list.PageName = "SubjectTypes";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SubjectTypes = [...data.value];
        this.shareddata.ChangeSubjectTypes(this.SubjectTypes);

      })
  }
  GetClassSubject() {
    debugger;
    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
      'SectionId',
      'SemesterId',
    ];

    list.PageName = "ClassSubjects";
    //list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    this.ClassSubjects = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.ClassSubjects = [];
        data.value.forEach(item => {
          var _subjectName = '';
          var _className = this.Classes.filter((f:any) => f.ClassId == item.ClassId)[0].ClassName;
          var objsubject = this.Subjects.filter((f:any) => f.MasterDataId == item.SubjectId)
          if (objsubject.length > 0) {
            _subjectName = objsubject[0].MasterDataName;

            this.ClassSubjects.push({
              ClassSubjectId: item.ClassSubjectId,
              ClassSubject: _className + "-" + _subjectName,
              ClassId: item.ClassId,
              SectionId: item.SectionId,
              SemesterId: item.SemesterId,
              ClsName: _className
            });
          }
        })
        //console.log("this.ClassSubjects", this.ClassSubjects)
      })
  }
  TempClassSubject :any[]= [];

  GetTeachers() {

    var _WorkAccount = this.WorkAccounts.filter((f:any) => f.MasterDataName.toLowerCase() == "teaching");
    var _workAccountId = 0;
    if (_WorkAccount.length > 0)
      _workAccountId = _WorkAccount[0].MasterDataId;

    let list: List = new List();

    list.fields = ["WorkAccountId"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["Employee($select=EmpEmployeeId", "FirstName", "LastName)"]
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1 and WorkAccountId eq " + _workAccountId];
    //list.orderBy = "ParentId";
    this.Teachers = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.filter((f:any) => {
          this.Teachers.push({
            TeacherId: f.Employee.EmpEmployeeId,
            TeacherName: f.Employee.FirstName + " " + f.Employee.LastName
          })
        })

      })
  }
  TeachingEmployees :any[]= [];
  GetTeachingEmployees() {

    var _WorkAccount = this.WorkAccounts.filter((f:any) => f.MasterDataName.toLowerCase() == "teaching");
    var _workAccountId = 0;
    if (_WorkAccount.length > 0)
      _workAccountId = _WorkAccount[0].MasterDataId;

    let list: List = new List();

    list.fields = ["EmpEmployeeId", "FirstName", "LastName"];
    list.PageName = "EmpEmployees";
    //list.lookupFields = ["Employee($select=EmpEmployeeId", "FirstName", "LastName)"]
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1 and WorkAccountId eq " + _workAccountId];
    //list.orderBy = "ParentId";
    this.Teachers = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.filter((f:any) => {
          this.TeachingEmployees.push({
            TeacherId: f.Employee.EmpEmployeeId,
            TeacherName: f.Employee.FirstName + " " + f.Employee.LastName
          })
        })

      })
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.Batches = this.tokenStorage.getBatches()!;;
    this.shareddata.ChangeSubjects(this.Subjects);
    this.GetTeachers();
    //this.GetTeachingEmployees();
    //var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    //       this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
    //   this.Classes = [...data.value];
    //   this.GetClassSubject();
    // });
    this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
      data.value.forEach(m => {
        let obj = this.ClassCategory.filter((f:any) => f.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Category = obj[0].MasterDataName.toLowerCase();
         this.Classes.push(m);
        }
      });
      this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
      this.GetClassSubject();
    });
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
  Delete(row) {

    this.openDialog(row)
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
      UpdatedDate: new Date()
    }

    this.dataservice.postPatch(this.TeacherSubjectListName, toUpdate, row.TeacherSubjectId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false;
        this.PageLoading = false;
        var idx = this.TeacherSubjectList.findIndex(x => x.TeacherSubjectId == row.TeacherSubjectId)
        this.TeacherSubjectList.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.TeacherSubjectList);
        this.dataSource.filterPredicate = this.createFilter();
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }

}
export interface ITeacherSubject {
  TeacherSubjectId: number;
  ClassSubjectId: number;
  EmployeeId: number;
  Active: number;
  Action: boolean;
}
export interface ITeachers {
  TeacherId: number;
  TeacherName: string;
}
