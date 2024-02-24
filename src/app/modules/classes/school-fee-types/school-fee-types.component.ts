import { Component, OnInit, ViewChild } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../..//shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-school-fee-types',
  templateUrl: './school-fee-types.component.html',
  styleUrls: ['./school-fee-types.component.scss']
})
export class SchoolFeeTypesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  PageLoading = true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  FeeTypeListName = 'SchoolFeeTypes';
  Applications: any[] = [];
  loading = false;
  FeeTypeList: IFeeType[] = [];
  filteredOptions: Observable<IFeeType[]>;
  dataSource: MatTableDataSource<IFeeType>;
  Permission = 'deny';
  SelectedBatchId = 0; SubOrgId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  allMasterData: any[] = [];
  FeeCategories: any[] = [];
  FeeTypeData = {
    FeeTypeId: 0,
    FeeTypeName: '',
    Description: '',
    Formula: '',
    DefaultType: 0,
    Confidential: false,
    Active: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0
  };
  displayedColumns = [
    'FeeTypeId',
    'FeeTypeName',
    'Description',
    'Formula',
    'DefaultType',
    'Confidential',
    'Active',
    'Action'
  ];
  Classes: any[] = [];
  Students: any[] = [];
  SelectedApplicationId = 0;
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      searchFeeTypeName: ['']
    });
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.FEETYPE);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu']);
      }
      else {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);

        this.contentservice.GetClasses(this.FilterOrgSubOrg)
          .subscribe((data: any) => {
            if (data.value) this.Classes = [...data.value]; else this.Classes = [...data];
            this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
          })
        this.GetMasterData();
        this.GetStudents();
        this.loading = false; this.PageLoading = false;
      }
    }
  }
  AddNew() {
    var newdata = {
      FeeTypeId: 0,
      FeeTypeName: '',
      Description: '',
      Formula: '',
      FeeCategory: '',
      FeeSubCategory: '',
      DefaultType: 0,
      Confidential: false,
      Active: 0,
      Action: true
    };
    this.FeeTypeList = [];
    this.FeeTypeList.push(newdata);
    this.dataSource = new MatTableDataSource<IFeeType>(this.FeeTypeList);
  }
  GetStudents() {

    var _students: any = this.tokenStorage.getStudents()!;
    _students = _students.filter(a => a.Active == 1);
    this.Students = _students.map(student => {
      var _lastName = student.LastName == '' ? '' : '-' + student.LastName;
      return {
        StudentId: student.StudentId,
        Name: student.PID + '-' + student.FirstName + _lastName,
        Remark1: student.Remark1,
        Remark2: student.Remark2,
      }
    })

    this.loading = false;
    this.PageLoading = false;
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
  }
  updateDefaultType(row, value) {
    row.Action = true;
    row.DefaultType = value.checked ? 1 : 0;
  }
  updateConfidential(row, value) {
    row.Action = true;
    row.Confidential = value.checked;
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    let checkFilterString = this.FilterOrgSubOrgBatchId + " and FeeTypeName eq '" + row.FeeTypeName + "'";

    if (row.FeeTypeId > 0)
      checkFilterString += " and FeeTypeId ne " + row.FeeTypeId;
    let list: List = new List();
    list.fields = ["FeeTypeId"];
    list.PageName = this.FeeTypeListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.FeeTypeData.FeeTypeId = row.FeeTypeId;
          this.FeeTypeData.FeeTypeName = row.FeeTypeName;
          this.FeeTypeData.Active = row.Active;
          this.FeeTypeData.Description = row.Description;
          this.FeeTypeData.Formula = row.Formula;
          this.FeeTypeData.DefaultType = row.DefaultType;
          this.FeeTypeData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.FeeTypeData.SubOrgId = this.SubOrgId;
          this.FeeTypeData.Confidential = row.Confidential;
          this.FeeTypeData.BatchId = this.SelectedBatchId;
          if (this.FeeTypeData.FeeTypeId == 0) {
            this.FeeTypeData["CreatedDate"] = new Date();
            this.FeeTypeData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.FeeTypeData["UpdatedDate"] = new Date();
            delete this.FeeTypeData["UpdatedBy"];
            //////console.log('exam slot', this.SlotNClassSubjectData)
            this.insert(row);
          }
          else {
            delete this.FeeTypeData["CreatedDate"];
            delete this.FeeTypeData["CreatedBy"];
            this.FeeTypeData["UpdatedDate"] = new Date();
            this.FeeTypeData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      }
      );
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {

    debugger;
    this.dataservice.postPatch(this.FeeTypeListName, this.FeeTypeData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.FeeTypeId = data.FeeTypeId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.GetFeeTypes();
          this.loadingFalse()

        },
        err => {
          this.loading = false;
          this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.formatError(err), globalconstants.ActionText, globalconstants.RedBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.FeeTypeListName, this.FeeTypeData, this.FeeTypeData.FeeTypeId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.CreateInvoice();
        },
        err => {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.formatError(err), globalconstants.ActionText, globalconstants.RedBackground);
        });
  }
  CreateInvoice() {
    debugger;
    this.loading = true;

    this.contentservice.GetClassFeeWithFeeDefinition(this.FilterOrgSubOrgBatchId, 0, 0, 0)
      .subscribe((datacls: any) => {

        var _clsfeeWithDefinitions: any = datacls.value.filter(m => m.FeeDefinition.Active == 1);

        this.contentservice.getStudentClassWithFeeType(this.FilterOrgSubOrgBatchId, 0, 0, 0, 0, this.FeeTypeData.FeeTypeId)
          .subscribe((data: any) => {
            var studentfeedetail: any[] = [];
            var _className = '';
            var _semesterName = '';
            var _sectionName = '';
            data.value.forEach(studcls => {
              _className = '';
              _semesterName = '';
              _sectionName = '';
              var clsObj = this.Classes.filter((f: any) => f.ClassId == studcls.ClassId);
              if (clsObj.length > 0)
                _className = clsObj[0].ClassName;


              var objcls = this.Classes.filter((f: any) => f.ClassId == studcls.ClassId);
              if (objcls.length > 0)
                _className = objcls[0].ClassName;

              var objsemester = this.Semesters.filter((f: any) => f.MasterDataId == studcls.SemesterId);
              if (objsemester.length > 0)
                _semesterName = objsemester[0].MasterDataName;

              var objsection = this.Sections.filter((f: any) => f.ClassId == studcls.SectionId);
              if (objsection.length > 0)
                _sectionName = objsection[0].MasterDataName;

              var _feeName = '', _remark1 = '', _remark2 = '';
              var objClassFee = _clsfeeWithDefinitions.filter(def => def.ClassId == studcls.ClassId);
              let _currentStudent = this.Students.filter(s => s.StudentId === studcls.StudentId);
              if (_currentStudent.length > 0) {
                _remark1 = _currentStudent[0].Remark1;
                _remark2 = _currentStudent[0].Remark2;
              }
              var _category = '';
              var _subCategory = '';
              objClassFee.forEach(clsfee => {
                _category = '';
                _subCategory = '';

                var objcat: any[] = this.FeeCategories.filter((f: any) => f.MasterDataId == clsfee.FeeDefinition.FeeCategoryId);
                if (objcat.length > 0)
                  _category = objcat[0].MasterDataName;

                var objsubcat: any[] = this.FeeCategories.filter((f: any) => f.MasterDataId == clsfee.FeeDefinition.FeeSubCategoryId);
                if (objsubcat.length > 0)
                  _subCategory = objsubcat[0].MasterDataName;

                var _formula = studcls.StudentFeeTypes[0].FeeType.Formula;// == 1 ? studcls.FeeType.Formula : '';

                if (_formula.length > 0) {
                  _feeName = clsfee.FeeDefinition.FeeName;
                  studentfeedetail.push({
                    Month: clsfee.Month,
                    MonthDisplay: clsfee.MonthDisplay,
                    Amount: clsfee.Amount,
                    Formula: _formula,
                    FeeName: _feeName,
                    StudentClassId: studcls.StudentClassId,
                    FeeCategory: _category,
                    FeeSubCategory: _subCategory,
                    FeeTypeId: studcls.FeeTypeId,
                    ClassId: studcls.ClassId,
                    SemesterId: studcls.SemesterId,
                    SectionId: studcls.SectionId,
                    RollNo: studcls.RollNo,
                    ClassName: _className,
                    Semester: _semesterName,
                    Section: _sectionName,
                    Remark1: _remark1,
                    Remark2: _remark2
                  });
                }

              })
            })
            // //console.log("studentfeedetailxxxx",studentfeedetail)
            this.contentservice.createInvoice(studentfeedetail, this.SelectedBatchId, this.LoginUserDetail[0]["orgId"], this.SubOrgId)
              .subscribe((data: any) => {
                this.loading = false;
                this.contentservice.openSnackBar("Invoice created successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
              },
                error => {
                  this.loading = false;
                  //console.log("create invoice error", error);
                  this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage, globalconstants.ActionText, globalconstants.RedBackground);
                })
          })
      });

  }
  Sections: any = [];
  Semesters: any = [];
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY)
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER)
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION)
    this.loading = false; this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }
  GetFeeTypes() {
    //debugger;
    // if (this.searchForm.get("searchFeeTypeName")?.value.length < 3)
    // {
    //   this.contentservice.openSnackBar("Please enter atleast 3 characters.",this.optionAutoClose);
    //   return;
    // }  
    this.loading = true;
    let filterStr = this.FilterOrgSubOrgBatchId;// 'BatchId eq '+ this.SelectedBatchId;
    if (this.searchForm.get("searchFeeTypeName")!.value.length != 0)
      filterStr += " and contains(FeeTypeName,'" + this.searchForm.get("searchFeeTypeName")!.value + "')";


    let list: List = new List();
    list.fields = [
      'FeeTypeId',
      'FeeTypeName',
      'Description',
      'Formula',
      'DefaultType',
      'Confidential',
      'Active'
    ];

    list.PageName = this.FeeTypeListName;
    list.filter = [filterStr];
    this.FeeTypeList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  ////console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.FeeTypeList = [...data.value];
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.FeeTypeList = this.FeeTypeList.sort((a, b) => b.Active - a.Active);
        this.dataSource = new MatTableDataSource<IFeeType>(this.FeeTypeList);
        this.dataSource.paginator = this.paginator;
        this.loadingFalse();

      });

  }

  // getDropDownData(dropdowntype) {
  //   let Id = 0;
  //   let Ids = this.allMasterData.filter((item, indx) => {
  //     return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
  //   })
  //   if (Ids.length > 0) {
  //     Id = Ids[0].MasterDataId;
  //     return this.allMasterData.filter((item, index) => {
  //       return item.ParentId == Id
  //     })
  //   }
  //   else
  //     return [];

  // }
}
export interface IFeeType {
  FeeTypeId: number;
  FeeTypeName: string;
  Description: string;
  Formula: string;
  Confidential: boolean;
  FeeCategory: string;
  FeeSubCategory: string;
  Active: number;
  Action: boolean;
}
