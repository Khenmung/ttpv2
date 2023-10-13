import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';

@Component({
  selector: 'app-subjectcomponent',
  templateUrl: './subjectcomponent.component.html',
  styleUrls: ['./subjectcomponent.component.scss']
})
export class SubjectcomponentComponent implements OnInit {
  PageLoading = true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  //IscurrentBatchSelect = 1;
  SubjectComponentListName = 'SubjectComponents';
  Applications: any[] = [];
  Permission = '';
  loading = false;
  SelectedApplicationId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  SubjectComponentType: any[] = [];
  SelectedBatchId = 0; SubOrgId = 0;
  SubjectComponentList: ISubjectComponent[] = [];
  filteredOptions: Observable<ISubjectComponent[]>;
  dataSource: MatTableDataSource<ISubjectComponent>;
  allMasterData: any[] = [];
  //ClassMasters: any[] = [];
  Defaultvalue = 0;
  SubjectComponentData = {
    SubjectComponentId: 0,
    ComponentName: '',
    ClassSubjectId: 0,
    ClassId: 0,
    SectionId: 0,
    SemesterId: 0,
    SubjectId: 0,
    Sequence: 0,
    OrgId: 0,
    SubOrgId: 0,
    Active: 0,
    //Deleted: 0
  };
  displayedColumns = [
    "SubjectComponentId",
    "ComponentName",
    "ClassId",
    "SemesterId",
    "SectionId",
    "ClassSubjectId",
    "Sequence",
    "Active",
    "Action"
  ];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private dialog: MatDialog,
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
      searchClassId: [0],
      searchSemesterId: [0],
      searchSectionId: [0],
      searchClassSubjectId: [0]
    });
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      //this.IscurrentBatchSelect = +this.tokenStorage.getCheckEqualBatchId();
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.SUBJECTCOMPONENT);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      if (this.Permission != 'deny') {
        this.GetMasterData();
        // this.GetSubjectComponents();
        this.GetClassSubject();
        // this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
        //   this.ClassMasters = [...data.value];
        //   this.loading = false;
        //   this.PageLoading = false;
        // })

        this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
          this.Classes = [];
          data.value.forEach(m => {
            let obj = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId);
            if (obj.length > 0) {
              m.Category = obj[0].MasterDataName.toLowerCase();
              this.Classes.push(m);
            }
          });
          this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
        });
      }
      // this.loading = false;
      //  this.PageLoading = false;

    }
  }
  AddNew() {

    // if (this.searchForm.get("searchClassId")?.value == 0) {
    //   this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText,globalconstants.RedBackground);
    //   return;
    // }

    var newdata = {
      SubjectComponentId: 0,
      ComponentName: '',
      ClassSubjectId: 0,
      ClassId: 0,
      SubjectId: 0,
      Sequence: 0,
      OrgId: 0,
      SubOrgId: 0,
      Active: 0,
      Action: false
    };
    this.SubjectComponentList = [];
    this.SubjectComponentList.push(newdata);
    this.dataSource = new MatTableDataSource<ISubjectComponent>(this.SubjectComponentList);
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked;// ? 1 : 0;
  }
  delete(element) {
    this.openDialog(element);
  }
  openDialog(row) {
    //debugger;
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
      Active: false,
      Deleted: true,
      UpdatedDate: new Date()
    }

    this.dataservice.postPatch('SubjectComponents', toUpdate, row.SubjectComponentId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.SubjectComponentList.findIndex(x => x.SubjectComponentId == row.SubjectComponentId);
        this.SubjectComponentList.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.SubjectComponentList);
        this.dataSource.filterPredicate = this.createFilter();
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.GroupName.toLowerCase().indexOf(searchTerms.GroupName) !== -1
    }
    return filterFunction;
  }
  SelectedClassCategory = '';
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  UpdateOrSave(row) {

    if (row.ClassSubjectId == 0) {
      this.contentservice.openSnackBar("Please select subject.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    let checkFilterString = this.FilterOrgSubOrg + " and ComponentName eq '" + row.ComponentName + "'" +
      " and ClassSubjectId eq " + row.ClassSubjectId

    if (row.SubjectComponentId > 0)
      checkFilterString += " and SubjectComponentId ne " + row.SubjectComponentId;
    let list: List = new List();
    list.fields = ["SubjectComponentId"];
    list.PageName = this.SubjectComponentListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          var objClassSubject = this.ClassSubjectList.filter((s: any) => s.ClassSubjectId == row.ClassSubjectId);

          this.SubjectComponentData.SubjectComponentId = row.SubjectComponentId;
          this.SubjectComponentData.ComponentName = row.ComponentName;
          this.SubjectComponentData.ClassSubjectId = row.ClassSubjectId;
          this.SubjectComponentData.ClassId = row.ClassId;
          this.SubjectComponentData.SemesterId = row.SemesterId;
          this.SubjectComponentData.SectionId = row.SectionId;
          this.SubjectComponentData.SubjectId = objClassSubject ? objClassSubject[0].SubjectId : 0;
          this.SubjectComponentData.Sequence = row.Sequence;
          //this.SubjectComponentData.BatchId = this.SelectedBatchId;
          this.SubjectComponentData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.SubjectComponentData.SubOrgId = this.SubOrgId;
          //this.SubjectComponentData.Deleted = 0;
          this.SubjectComponentData.Active = row.Active;

          if (this.SubjectComponentData.SubjectComponentId == 0) {
            this.SubjectComponentData["CreatedDate"] = new Date();
            this.SubjectComponentData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.SubjectComponentData["UpdatedDate"] = new Date();
            delete this.SubjectComponentData["UpdatedBy"];
            //console.log("this.SubjectComponentData", this.SubjectComponentData)
            this.insert(row);
          }
          else {
            delete this.SubjectComponentData["CreatedDate"];
            delete this.SubjectComponentData["CreatedBy"];
            this.SubjectComponentData["UpdatedDate"] = new Date();
            this.SubjectComponentData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.SubjectComponentListName, this.SubjectComponentData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.SubjectComponentId = data.SubjectComponentId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.SubjectComponentListName, this.SubjectComponentData, this.SubjectComponentData.SubjectComponentId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  SelectedClassSubjects: any[] = [];
  SelectClassSubject() {
    debugger;
    this.SelectedClassSubjects = this.ClassSubjectList.filter((f: any) => f.ClassId == this.searchForm.get("searchClassId")?.value
      && f.SubjectType.SelectHowMany > 0);
    let _classId = this.searchForm.get("searchClassId")?.value;
    let obj = this.Classes.filter(c => c.ClassId == _classId);
    if (obj.length > 0) {
      this.SelectedClassCategory = obj[0].Category.toLowerCase();
      if(this.SelectedClassCategory == globalconstants.CategoryCollege)
      {
        this.displayedColumns = [
          "SubjectComponentId",
          "ComponentName",
          "ClassId",
          "SemesterId",
          "ClassSubjectId",
          "Sequence",
          "Active",
          "Action"
        ];
      }
      else if(this.SelectedClassCategory == globalconstants.CategoryHighSchool)
      {
        this.displayedColumns = [
          "SubjectComponentId",
          "ComponentName",
          "ClassId",
          "SectionId",
          "ClassSubjectId",
          "Sequence",
          "Active",
          "Action"
        ];
      }
    }

    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();
    //this.GetSpecificStudentGrades();
  }
  ClearData() {
    this.SubjectComponentList = [];
    this.dataSource = new MatTableDataSource<ISubjectComponent>(this.SubjectComponentList);
  }
  RowSelectClassSubject(row) {
    debugger;
    row.ClassSubjects = this.ClassSubjectList.filter((f: any) => f.ClassId == row.ClassId && f.SubjectType.SelectHowMany > 0);
    //this.GetSpecificStudentGrades();
  }
  GetSubjectComponents() {
    //debugger;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _classSubjectId = this.searchForm.get("searchClassSubjectId")?.value;

    let filterStr = this.FilterOrgSubOrg + " and Active eq true";// 'OrgId eq ' + this.LoginUserDetail[0]['orgId']; // BatchId eq  + this.SelectedBatchId
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_classSubjectId > 0)
      filterStr += " and ClassSubjectId eq " + _classSubjectId;

    filterStr += " and ClassId eq " + _classId;
    filterStr += " and SemesterId eq " + _semesterId;
    filterStr += " and SectionId eq " + _sectionId;

    this.loading = true;
    let list: List = new List();
    list.fields = [
      "SubjectComponentId",
      "ComponentName",
      "ClassSubjectId",
      "ClassId",
      "SemesterId",
      "SectionId",
      "Sequence",
      "SubjectId",
      "Active"
    ];

    list.PageName = this.SubjectComponentListName;
    list.filter = [filterStr];
    this.SubjectComponentList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.SubjectComponentList = data.value.map(r => {
            r.ClassSubjects = this.ClassSubjectList.filter((f: any) => f.ClassId == r.ClassId)
            return r;
          })
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<ISubjectComponent>(this.SubjectComponentList);
        this.loadingFalse();
      });

  }
  ClassSubjectList: any[] = [];
  GetClassSubject() {
    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
      'Active',
    ];
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";
    list.PageName = "ClassSubjects";
    list.lookupFields = ["SubjectType($select=SubjectTypeName,SelectHowMany)"];
    list.filter = [filterStr];
    this.ClassSubjectList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        this.ClassSubjectList = data.value.map(s => {
          s.SubjectName = ''
          var obj = this.Subjects.filter(subj => subj.MasterDataId == s.SubjectId);
          if (obj.length > 0) {
            s.SubjectName = obj[0].MasterDataName;
          }
          return s;
        })
      });
  }
  Subjects: any[] = [];
  Semesters: any[] = [];
  ClassCategory: any[] = [];
  Classes: any[] = [];
  Sections = [];
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;

    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.loading = false; this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);

  }
}
export interface ISubjectComponent {
  SubjectComponentId: number;
  ComponentName: string;
  ClassSubjectId: number;
  ClassId: number;
  SubjectId: number;
  Active: number;
  Action: boolean;
}






