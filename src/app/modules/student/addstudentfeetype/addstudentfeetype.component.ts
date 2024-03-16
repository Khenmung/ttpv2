import { Component, ViewChild } from "@angular/core";
import { UntypedFormGroup, UntypedFormBuilder } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { SwUpdate } from "@angular/service-worker";
import { Observable } from "rxjs";
import { TokenStorageService } from "../../../_services/token-storage.service";
import { ContentService } from "../../../shared/content.service";
import { NaomitsuService } from "../../../shared/databaseService";
import { globalconstants } from "../../../shared/globalconstant";
import { List } from "../../../shared/interface";

@Component({
  selector: 'app-addstudentfeetype',
  templateUrl: './addstudentfeetype.component.html',
  styleUrls: ['./addstudentfeetype.component.scss']
})
export class AddStudentFeetypeComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  PageLoading = true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  FeeTypeListName = 'SchoolFeeTypes';
  StudentFeeTypeListName = 'StudentFeeTypes';
  Applications: any[] = [];
  loading = false;
  StudentFeeTypeList: IStudentFeeType[] = [];
  filteredOptions: Observable<IStudentFeeType[]>;
  dataSource: MatTableDataSource<IStudentFeeType>;
  Permission = 'deny';
  SelectedBatchId = 0; SubOrgId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  allMasterData: any[] = [];
  FeeCategories: any[] = [];
  StudentFeeTypeData = {
    StudentFeeTypeId: 0,
    FeeTypeId: 0,
    StudentClassId: 0,
    FromMonth: 0,
    ToMonth: 0,
    Active: 0,
    IsCurrent: false,
    OrgId: 0,
    SubOrgId: 0,
    BatchId: 0
  };
  displayedColumns = [
    'StudentFeeTypeId',
    'FeeTypeId',
    'FromMonth',
    'ToMonth',
    //'IsCurrent',
    'Active',
    'Action'
  ];
  Classes: any[] = [];
  StudentClass: any = [];
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Students: any = [];
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
  Months: any = [];
  Defaultvalue = 0;
  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.STUDENTFEETYPE);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu']);
      }
      else {
        debugger;
        this.StudentClassId = this.tokenStorage.getStudentClassId()!;
        this.Months = this.contentservice.GetSessionFormattedMonths();
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
        this.GetStudentClass();
        this.GetFeeTypes();
        this.loading = false; this.PageLoading = false;
      }
    }
  }
  AddNew() {
    var newdata = {
      StudentFeeTypeId: 0,
      FeeTypeId: 0,
      FromMonth: 0,
      ToMonth: 0,
      StudentClassId: this.StudentClassId,
      Active: false,
      IsCurrent: false,
      Action: true
    };
    //this.StudentFeeTypeList = [];
    this.StudentFeeTypeList.push(newdata);
    this.dataSource = new MatTableDataSource<IStudentFeeType>(this.StudentFeeTypeList);
  }
  GetStudentClass() {
    debugger;
    var _students: any = this.tokenStorage.getStudents()!;
    let studcls = _students.find(a => a.StudentClasses.length > 0 && a.StudentClasses[0].StudentClassId == this.StudentClassId)
    this.StudentClass = studcls.StudentClasses[0];
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    debugger;
    row.Action = true;
    row.Active = value.checked;
  }
  enableSave(row) {
    row.Action = true;
  }
  updateIsCurrent(row, value) {
    row.Action = true;
    row.IsCurrent = value.checked;
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
    let _defaultFeeType = this.StudentFeeTypeList.find(f => f.FromMonth == 0 && f.ToMonth == 0);
    if (!_defaultFeeType) {
      this.contentservice.openSnackBar("Default fee type's month should not be edited.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let overlapped = false;
    let _test = this.StudentFeeTypeList.filter(f => f.FromMonth != 0 && f.ToMonth != 0);
    for (let outer = 0; outer < _test.length; outer++) {
      let overlap = _test.find((inner, indx) => inner.FromMonth >= _test[outer].FromMonth
        && inner.FromMonth <= _test[outer].ToMonth && indx != outer)
      if (overlap) {
        overlapped = true;
        break;
      }
    }
    if (overlapped) {
      this.contentservice.openSnackBar("Months should not be overlapped.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    let checkFilterString = this.FilterOrgSubOrgBatchId + " and FeeTypeId eq " + row.FeeTypeId +
      " and StudentClassId eq " + this.StudentClassId;

    if (row.StudentFeeTypeId > 0)
      checkFilterString += " and StudentFeeTypeId ne " + row.StudentFeeTypeId;
    let list: List = new List();
    list.fields = ["StudentFeeTypeId"];
    list.PageName = this.StudentFeeTypeListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.StudentFeeTypeData.StudentFeeTypeId = row.StudentFeeTypeId;
          this.StudentFeeTypeData.FeeTypeId = row.FeeTypeId;
          this.StudentFeeTypeData.StudentClassId = row.StudentClassId;
          this.StudentFeeTypeData.FromMonth = row.FromMonth;
          this.StudentFeeTypeData.ToMonth = row.ToMonth;
          this.StudentFeeTypeData.IsCurrent = row.IsCurrent;
          this.StudentFeeTypeData.Active = row.Active;
          this.StudentFeeTypeData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.StudentFeeTypeData.SubOrgId = this.SubOrgId;
          this.StudentFeeTypeData.BatchId = this.SelectedBatchId;
          if (this.StudentFeeTypeData.StudentFeeTypeId == 0) {
            this.StudentFeeTypeData["CreatedDate"] = new Date();
            this.StudentFeeTypeData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.StudentFeeTypeData["UpdatedDate"] = new Date();
            delete this.StudentFeeTypeData["UpdatedBy"];
            console.log("log", this.StudentFeeTypeData)
            this.insert(row);
          }
          else {
            delete this.StudentFeeTypeData["CreatedDate"];
            delete this.StudentFeeTypeData["CreatedBy"];
            this.StudentFeeTypeData["UpdatedDate"] = new Date();
            this.StudentFeeTypeData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.StudentFeeTypeListName, this.StudentFeeTypeData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.StudentClass.fromMonth = this.StudentFeeTypeData.FromMonth;
          this.StudentClass.toMonth = this.StudentFeeTypeData.ToMonth;
          row.StudentFeeTypeId = data.StudentFeeTypeId;
          let _students: any = this.tokenStorage.getStudents()!;
          let indx = _students?.findIndex((s: any) => s.StudentClasses.length > 0 && s.StudentClasses[0].StudentClassId == this.StudentFeeTypeData.StudentClassId);
          if (indx > -1)
            _students[indx].StudentClasses[0].StudentFeeTypes.push(JSON.parse(JSON.stringify(this.StudentFeeTypeData)));

          this.tokenStorage.saveStudents(_students);
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.GetStudentFeeTypes();
          this.CreateInvoice(this.StudentClass);
          this.loadingFalse()

        },
        err => {
          this.loading = false;
          this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.formatError(err), globalconstants.ActionText, globalconstants.RedBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.StudentFeeTypeListName, this.StudentFeeTypeData, this.StudentFeeTypeData.StudentFeeTypeId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.StudentClass.fromMonth = this.StudentFeeTypeData.FromMonth;
          this.StudentClass.toMonth = this.StudentFeeTypeData.ToMonth;
          let _students: any = this.tokenStorage.getStudents()!;

          let indx = _students?.findIndex((s: any) => s.StudentClasses.length > 0 && s.StudentClasses[0].StudentClassId == this.StudentFeeTypeData.StudentClassId);
          if (indx > -1) {
            let feetypeIndx = _students[indx].StudentClasses[0].StudentFeeTypes.findIndex(t => t.StudentFeeTypeId == this.StudentFeeTypeData.StudentFeeTypeId);
            if (feetypeIndx > 0)
              _students[indx].StudentClasses[0].StudentFeeTypes[feetypeIndx] = JSON.parse(JSON.stringify(this.StudentFeeTypeData));
          }
          this.tokenStorage.saveStudents(_students);
          this.CreateInvoice(this.StudentClass);
        },
        err => {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.formatError(err), globalconstants.ActionText, globalconstants.RedBackground);
        });
  }
  CreateInvoice(row) {
    debugger;
    this.loading = true;
    this.contentservice.GetClassFeeWithFeeDefinition(this.FilterOrgSubOrgBatchId, row.ClassId, row.fromMonth, row.toMonth)//, row.SemesterId, row.SectionId)
      .subscribe((datacls: any) => {

        // var _clsfeeWithDefinitions = datacls.value.filter(m => m.FeeDefinition.Active == 1);
        var objClassFee = datacls.value.filter(def => def.FeeDefinition.Active == 1
          && def.ClassId == row.ClassId
          && def.SemesterId == row.SemesterId
          && def.SectionId == row.SectionId);
        if (objClassFee.length == 0) {
          objClassFee = datacls.value.filter(def => def.FeeDefinition.Active == 1 && def.ClassId == row.ClassId);
        }
        this.contentservice.getStudentClassWithFeeType(this.FilterOrgSubOrgBatchId, row.ClassId, row.SemesterId, row.SectionId, this.StudentClassId, 0)
          .subscribe((data: any) => {
            var studentfeedetail: any[] = [];
            let _Students: any = this.tokenStorage.getStudents()!;
            var _feeName = '', _remark1 = '', _remark2 = '';
            let _studentAllFeeTypes: any = [];
            var _category = '';
            var _subCategory = '';
            var _className = '';
            var _semesterName = '';
            var _sectionName = '';
            let _formula = '';
            let objcls, objsemester, objsection, objcat, objsubcat, _feeObj;
            data.value.forEach(studcls => {
              let _currentStudent = _Students.find(s => s.StudentId === studcls.StudentId);
              _feeName = ''; _remark1 = ''; _remark2 = '';
              if (_currentStudent) {
                _remark1 = _currentStudent.Remark1;
                _remark2 = _currentStudent.Remark2;
              }
              studcls.StudentFeeTypes.forEach(item => {
                _studentAllFeeTypes.push(
                  {
                    FeeTypeId: item.FeeTypeId,
                    FeeName: item.FeeType.FeeTypeName,
                    Formula: item.FeeType.Formula,
                    FromMonth: item.FromMonth,
                    ToMonth: item.ToMonth
                  })
              })

              _studentAllFeeTypes = _studentAllFeeTypes.sort((a, b) => b.FromMonth - a.FromMonth);

              objClassFee.forEach(clsfee => {
                _category = '';
                _subCategory = '';
                _className = '';
                _semesterName = '';
                _sectionName = '';

                objcls = this.Classes.find((f: any) => f.ClassId == studcls.ClassId);
                if (objcls)
                  _className = objcls.ClassName;

                objsemester = this.Semesters.find((f: any) => f.MasterDataId == studcls.SemesterId);
                if (objsemester)
                  _semesterName = objsemester.MasterDataName;

                objsection = this.Sections.find((f: any) => f.ClassId == studcls.SectionId);
                if (objsection)
                  _sectionName = objsection.MasterDataName;

                objcat = this.FeeCategories.find((f: any) => f.MasterDataId == clsfee.FeeDefinition.FeeCategoryId);
                if (objcat)
                  _category = objcat.MasterDataName;

                objsubcat = this.FeeCategories.find((f: any) => f.MasterDataId == clsfee.FeeDefinition.FeeSubCategoryId);
                if (objsubcat)
                  _subCategory = objsubcat.MasterDataName;

                _feeObj = _studentAllFeeTypes.find(ft => clsfee.Month >= ft.FromMonth && clsfee.Month <= ft.ToMonth);
                if (!_feeObj) {
                  _feeObj = _studentAllFeeTypes.find(ft => ft.FromMonth == 0 && ft.ToMonth == 0);
                }

                _formula = _feeObj.Formula;

                if (_formula) {
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
                    SectionId: studcls.SectionId,
                    SemesterId: studcls.SemesterId,
                    ClassName: _className,
                    Section: _sectionName,
                    Semester: _semesterName,
                    RollNo: studcls.RollNo,
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
    this.loading = false;
    this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }
  GetStudentFeeTypes() {
    //debugger;
    // if (this.searchForm.get("searchFeeTypeName")?.value.length < 3)
    // {
    //   this.contentservice.openSnackBar("Please enter atleast 3 characters.",this.optionAutoClose);
    //   return;
    // }  
    this.loading = true;
    let filterStr = this.FilterOrgSubOrgBatchId;// 'BatchId eq '+ this.SelectedBatchId;
    filterStr += " and StudentClassId eq " + this.StudentClassId;


    let list: List = new List();
    list.fields = [
      'StudentFeeTypeId',
      'FeeTypeId',
      'StudentClassId',
      'FromMonth',
      'ToMonth',
      'IsCurrent',
      'Active'
    ];

    list.PageName = this.StudentFeeTypeListName;
    list.filter = [filterStr];
    this.StudentFeeTypeList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  ////console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.StudentFeeTypeList = [...data.value];
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        //this.StudentFeeTypeList = this.StudentFeeTypeList.sort((a, b) => b.Active == a.Active);
        this.dataSource = new MatTableDataSource<IStudentFeeType>(this.StudentFeeTypeList);
        this.dataSource.paginator = this.paginator;
        this.loadingFalse();

      });

  }
  FeeTypeList: any = [];
  GetFeeTypes() {
    //debugger;
    this.loading = true;
    let filterStr = this.FilterOrgSubOrgBatchId;// 'BatchId eq '+ this.SelectedBatchId;

    let list: List = new List();
    list.fields = [
      'FeeTypeId',
      'FeeTypeName',
      'Formula',
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
        this.GetStudentFeeTypes();

      });

  }

}
export interface IStudentFeeType {
  StudentFeeTypeId: number;
  FeeTypeId: number;
  StudentClassId: number,
  FromMonth: number;
  ToMonth: number;
  IsCurrent: boolean;
  Active: boolean;
  Action: boolean;
}

