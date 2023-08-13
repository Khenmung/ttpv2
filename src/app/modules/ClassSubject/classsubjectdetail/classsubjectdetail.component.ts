import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
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
  selector: 'app-classsubjectdetail',
  templateUrl: './classsubjectdetail.component.html',
  styleUrls: ['./classsubjectdetail.component.scss']
})
export class ClassSubjectDetailComponent implements OnInit {
  PageLoading = true;

  // @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  LoginUserDetail:any[]= [];
  exceptionColumns: boolean;
  CurrentRow: any = {};

  ClassSubjectListName = "ClassSubjects";
  Permission = '';
  SelectedApplicationId = 0;
  OrgSubOrgBatchFilter = '';
  OrgSubOrgFilter = '';
  StandardFilterWithBatchId = '';
  StandardFilterWithPreviousBatchId = '';
  PreviousBatchId = 0;
  loading = false;
  WorkAccounts :any[]= [];
  Teachers :any[]= [];
  Classes :any[]= [];
  Semesters :any[]= [];
  Subjects :any[]= [];
  SubjectTypes :any[]= [];
  SubjectCategory :any[]= [];
  CurrentBatchId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  CheckBatchIDForEdit = 1;
  DataCountToSave = -1;
  Batches :any[]= [];
  //WorkAccounts :any[]= [];
  ClassSubjectList: IClassSubject[]= [];
  dataSource: MatTableDataSource<IClassSubject>;
  allMasterData :any[]= [];
  searchForm = this.fb.group({
    searchSemesterId: [0],
    searchClassId: [0],
    searchSectionId: [0]
  });
  ClassSubjectId = 0;

  ClassSubjectData = {
    ClassSubjectId: 0,
    ClassId: 0,
    SectionId: 0,
    SemesterId: 0,
    Credits: 0,
    OrgId: 0,
    SubOrgId: 0,
    SubjectId: 0,
    SubjectTypeId: 0,
    SubjectCategoryId: 0,
    Confidential: 0,
    BatchId: 0,
    Active: 1
  };
  displayedColumns = [
    'SubjectName',
    'SubjectTypeId',
    'SubjectCategoryId',
    'Credits',
    'Confidential',
    'Active',
    'Action'
  ];
  filteredOptions: any;
  Students: any;
  nameFilter = new UntypedFormControl('');
  filterValues = {
    SubjectName: ''
  };
  Sections :any[]= [];
  Defaultvalue = 0;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
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
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.OrgSubOrgBatchFilter = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.OrgSubOrgFilter = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
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
        this.StandardFilterWithBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.StandardFilterWithPreviousBatchId = globalconstants.getOrgSubOrgFilterWithPreviousBatchId(this.tokenStorage);
        this.shareddata.CurrentSubjects.subscribe(r => this.Subjects = r);
        this.GetMasterData();
        this.GetSubjectTypes();
        //if (this.Classes.length == 0) {

        //}
      }
    }
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.SubjectName.toLowerCase().indexOf(searchTerms.SubjectName) !== -1
      // && data.id.toString().toLowerCase().indexOf(searchTerms.id) !== -1
      // && data.colour.toLowerCase().indexOf(searchTerms.colour) !== -1
      // && data.pet.toLowerCase().indexOf(searchTerms.pet) !== -1;
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

  GetClassSubjectId(event) {
    this.ClassSubjectId = event;
    //this.mattable._elementRef.nativeElement.style.backgroundColor = "";
    this.GetClassSubject();
  }

  View(element) {
    // //debugger;
    // this.ClassSubjectId = element.ClassSubjectId;
    // this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    // setTimeout(() => {
    //   this.classSubjectAdd.PageLoad();
    // }, 50);
  }

  addnew() {
    // this.ClassSubjectId = -1;
    // this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    // setTimeout(() => {
    //   this.classSubjectAdd.PageLoad();
    // }, 50);
  }
  // CopyFromPreviousBatch() {
  //   //console.log("here ", this.PreviousBatchId)
  //   this.PreviousBatchId = +this.tokenStorage.getPreviousBatchId()!;
  //   if (this.PreviousBatchId == -1)
  //     this.contentservice.openSnackBar("Previous batch not defined.",globalconstants.ActionText,globalconstants.RedBackground);
  //   else
  //     this.GetClassSubject(1)
  // }

  GetClassSubject() {
    let filterStr = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    //debugger;
    this.loading = true;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    if (_classId > 0)
      filterStr += " and ClassId eq " + _classId;
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select class/course", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if(_sectionId) filterStr += " and SectionId eq " + _sectionId;
    if(_semesterId) filterStr += " and SemesterId eq " + _semesterId;


    //list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] + " and BatchId eq " + this.SelectedBatchId + " and Active eq 1"];
    //filterStr += ' and (' + this.FilterOrgSubOrg +") and BatchId eq " + this.SelectedBatchId;
    //filterStr += " and " + ;
    // if (previousbatch == 1)
    //   filterStr += ' and ' + this.StandardFilterWithPreviousBatchId;
    // else
    //   filterStr += ' and ' + this.StandardFilterWithBatchId;

    if (filterStr.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
      'SectionId',
      'SemesterId',
      'Credits',
      'Confidential',
      'SubjectTypeId',
      'SubjectCategoryId',
      'TeacherId',
      'Active',
    ];

    list.PageName = this.ClassSubjectListName;
    list.lookupFields = ["SubjectType($select=SelectHowMany)"];
    list.filter = [filterStr];
    this.ClassSubjectList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        let classSubjects = data.value.map(item => {

          return {
            ClassSubjectId: item.ClassSubjectId,
            SubjectId: item.SubjectId,
            SubjectTypeId: item.SubjectTypeId,
            Confidential: item.Confidential,
            SubjectCategoryId: item.SubjectCategoryId,
            ClassId: item.ClassId,
            SectionId: item.SectionId,
            SemesterId: item.SemesterId,
            Credits: item.Credits,
            TeacherId: item.TeacherId,
            SelectHowMany: item.SubjectType.SelectHowMany,
            Active: item.Active
          }
        })
        var filteredSubjects = [...this.Subjects];
        // if (this.searchForm.get("searchSubjectId")?.value > 0) {
        //   filteredSubjects = this.Subjects.filter(sf => sf.MasterDataId == this.searchForm.get("searchSubjectId")?.value)
        // }
        filteredSubjects.forEach(s => {
          //this.SubjectTypes.forEach(st => {

          let existing = classSubjects.filter(e => e.SubjectId == s.MasterDataId);
          if (existing.length > 0) {
            this.ClassSubjectList.push({
              //ClassSubjectId: previousbatch==1?0:existing[0].ClassSubjectId,
              ClassSubjectId: existing[0].ClassSubjectId,
              SubjectId: existing[0].SubjectId,
              SubjectName: this.Subjects.filter(c => c.MasterDataId == existing[0].SubjectId)[0].MasterDataName,
              SubjectTypeId: existing[0].SubjectTypeId,
              SubjectCategoryId: existing[0].SubjectCategoryId,
              SelectHowMany: existing[0].SelectHowMany,
              Confidential: existing[0].Confidential,
              TeacherId: existing[0].TeacherId,
              Credits: existing[0].Credits,
              ClassId: existing[0].ClassId,
              SectionId: existing[0].SectionId,
              SemesterId: existing[0].SemesterId,
              Active: existing[0].Active,
              Action: false
            });
          }
          else {

            this.ClassSubjectList.push({
              ClassSubjectId: 0,
              SubjectId: s.MasterDataId,
              SubjectTypeId: 0,
              SubjectCategoryId: 0,
              SelectHowMany: 0,
              Confidential: false,
              Credits: 0,
              ClassId: this.searchForm.get("searchClassId")?.value,
              SectionId: this.searchForm.get("searchSectionId")?.value,
              SemesterId: this.searchForm.get("searchSemesterId")?.value,
              SubjectName: s.MasterDataName,
              TeacherId: 0,
              Active: 0,
              Action: false
            });
          }
          //})
        })
        this.ClassSubjectList.sort((a, b) => b.Active - a.Active);

        this.dataSource = new MatTableDataSource<IClassSubject>(this.ClassSubjectList);
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
  SelectedClassCategory = '';
  BindSemesterSection() {
    let _classId = this.searchForm.get("searchClassId")?.value;
    let obj = this.Classes.filter(c => c.ClassId == _classId);
    if (obj.length > 0) {
      this.SelectedClassCategory = obj[0].Category.toLowerCase();
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();
  }
  ClearData() {
    this.ClassSubjectList = [];
    this.dataSource = new MatTableDataSource<IClassSubject>(this.ClassSubjectList);
  }
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
    // let toupdate = {
    //   //ApplicationId:element.ApplicationId,      
    //   Active: element.Active == 1 ? 0 : 1
    // }
    // this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'patch')
    //   .subscribe(
    //     (data: any) => {
    //       // this.GetApplicationRoles();
    //       this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);

    //     });
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

    this.dataservice.postPatch(this.ClassSubjectListName, toUpdate, row.ClassSubjectId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false;
        this.PageLoading = false;
        var idx = this.ClassSubjectList.findIndex(x => x.ClassSubjectId == row.ClassSubjectId)
        this.ClassSubjectList.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.ClassSubjectList);
        this.dataSource.filterPredicate = this.createFilter();
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  updateSelectHowMany(row) {
    //debugger;
    row.SelectHowMany = this.SubjectTypes.filter((f:any) => f.SubjectTypeId == row.SubjectTypeId)[0].SelectHowMany;
    row.Action = true;
  }
  SaveAll() {
    this.DataCountToSave = this.ClassSubjectList.length;
    var toUpdate = this.ClassSubjectList.filter((f:any) => f.Action);
    toUpdate.forEach(row => {
      this.DataCountToSave--;
      this.UpdateOrSave(row);
    })
  }

  UpdateOrSave(row) {
    this.DataCountToSave = 0;
    //debugger;
    this.loading = true;

    if (row.SubjectTypeId == 0) {
      this.contentservice.openSnackBar("Please select subject type.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading = false;
      return;
    }
    if (row.SubjectCategoryId == 0) {
      this.contentservice.openSnackBar("Please select subject category.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      this.PageLoading = false;
      return;
    }
   
    if (row.Credits > 100) {
      this.contentservice.openSnackBar("Credits can not be greater than 100.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading = false;
      return;
    }

    let checkFilterString = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage) +
      " and ClassId eq " + row.ClassId +
      " and SemesterId eq " + row.SemesterId +
      " and SectionId eq " + row.SectionId +
      " and SubjectId eq " + row.SubjectId + ' and Active eq 1 ';

    if (row.ClassSubjectId > 0)
      checkFilterString += " and ClassSubjectId ne " + row.ClassSubjectId;

    let list: List = new List();
    list.fields = ["ClassSubjectId"];
    list.PageName = this.ClassSubjectListName;
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

          this.ClassSubjectData.Active = row.Active;
          this.ClassSubjectData.ClassSubjectId = row.ClassSubjectId;
          this.ClassSubjectData.ClassId = row.ClassId;
          this.ClassSubjectData.SectionId = row.SectionId;
          this.ClassSubjectData.SemesterId = row.SemesterId;
          this.ClassSubjectData.Credits = row.Credits;
          this.ClassSubjectData.Confidential = row.Confidential == null ? false : row.Confidential;
          this.ClassSubjectData.SubjectId = row.SubjectId;
          this.ClassSubjectData.SubjectTypeId = row.SubjectTypeId;
          this.ClassSubjectData.SubjectCategoryId = row.SubjectCategoryId;
          //      this.ClassSubjectData.TeacherId = row.TeacherId;
          this.ClassSubjectData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ClassSubjectData.SubOrgId = this.SubOrgId;
          this.ClassSubjectData.BatchId = this.SelectedBatchId;
          if (this.ClassSubjectData.ClassSubjectId == 0) {
            this.ClassSubjectData["CreatedDate"] = new Date();
            this.ClassSubjectData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.ClassSubjectData["UpdatedDate"];
            delete this.ClassSubjectData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ClassSubjectData["CreatedDate"];
            delete this.ClassSubjectData["CreatedBy"];
            this.ClassSubjectData["UpdatedDate"] = new Date();
            this.ClassSubjectData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });

  }

  insert(row) {

    //console.log('this.ClassSubjectData', this.ClassSubjectData)
    //debugger;
    this.dataservice.postPatch('ClassSubjects', this.ClassSubjectData, 0, 'post')
      .subscribe(
        (data: any) => {

          row.Action = false;
          row.ClassSubjectId = data.ClassSubjectId;
          if (this.DataCountToSave == 0) {
            this.loading = false; this.PageLoading = false;
            this.DataCountToSave = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  update(row) {

    this.dataservice.postPatch('ClassSubjects', this.ClassSubjectData, this.ClassSubjectData.ClassSubjectId, 'patch')
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

    //var orgIdSearchstr = this.OrgSubOrgFilter;// ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = ["SubjectTypeId", "SubjectTypeName", "SelectHowMany"];
    list.PageName = "SubjectTypes";
    list.filter = [this.OrgSubOrgFilter + " and Active eq 1 "];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SubjectTypes = [...data.value];
        this.shareddata.ChangeSubjectTypes(this.SubjectTypes);

      })
  }
  GetTeachers() {

    //var orgIdSearchstr = this.OrgSubOrgFilter;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var _WorkAccount = this.WorkAccounts.filter((f:any) => f.MasterDataName.toLowerCase() == "teaching");
    var _workAccountId = 0;
    if (_WorkAccount.length > 0)
      _workAccountId = _WorkAccount[0].MasterDataId;

    let list: List = new List();

    list.fields = ["WorkAccountId"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["Employee($select=EmpEmployeeId", "FirstName", "LastName)"]
    list.filter = [this.OrgSubOrgFilter + " and Active eq 1 and WorkAccountId eq " + _workAccountId];
    //list.orderBy = "ParentId";
    this.Teachers = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.filter((f:any) => {
          var _lastname = f.Employee.LastName == null ? '' : " " + f.Employee.LastName;
          this.Teachers.push({
            TeacherId: f.Employee.EmpEmployeeId,
            TeacherName: f.Employee.FirstName + _lastname
          })
        })

      })
  }
  ClassCategory :any[]= [];
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.Batches = this.tokenStorage.getBatches()!;
    //var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClasses(this.OrgSubOrgFilter).subscribe((data: any) => {
      data.value.forEach(m => {
        let obj = this.ClassCategory.filter((f:any) => f.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Category = obj[0].MasterDataName.toLowerCase();
          this.Classes.push(m);
        }
      });
    });
    this.shareddata.ChangeSubjects(this.Subjects);
    //this.shareddata.ChangeBatch(this.Batches);
    this.GetSubjectTypes();
    this.GetTeachers();

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
  updateConfidential(row, value) {
    row.Confidential = value.checked;
    row.Action = true;

  }
}
export interface IClassSubject {
  ClassSubjectId: number;
  ClassId: number;
  SectionId: number;
  SemesterId: number;
  Credits: number;
  SubjectId: number;
  SubjectName: string;
  SubjectTypeId: number;
  SubjectCategoryId: number;
  SelectHowMany: number;
  Confidential: boolean;
  TeacherId: number;
  Active: number;
  Action: boolean;
}
export interface ITeachers {
  TeacherId: number;
  TeacherName: string;
}
