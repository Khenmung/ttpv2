import { Component, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import * as _ from 'lodash';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-searchstudentfeetype',
  templateUrl: './searchstudentfeetype.component.html',
  styleUrls: ['./searchstudentfeetype.component.scss']
})
export class SearchstudentfeetypeComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
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
    Discount: 0,
    Active: 0,
    IsCurrent: false,
    OrgId: 0,
    SubOrgId: 0,
    BatchId: 0
  };
  displayedColumns = [
    // 'ClassId',
    'Student',
    'ClassName',
    'FeeType',
    'FromMonth',
    'ToMonth',
    'Discount',
    //'Active',
  ];
  Classes: any[] = [];
  StudentClass: any = [];
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Students: any = [];
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private dialog: MatDialog,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      searchFeetypeId: [0],
      searchClassId: [0]
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
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.Admission.SEARCHSTUDENTFEETYPE);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu']);
      }
      else {
        debugger;
        //this.StudentClassId = this.tokenStorage.getStudentClassId()!;
        this.Months = this.contentservice.GetSessionFormattedMonths();
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.Students = this.tokenStorage.getStudents()!;
        this.contentservice.GetClasses(this.FilterOrgSubOrg)
          .subscribe((data: any) => {
            if (data.value) this.Classes = [...data.value]; else this.Classes = [...data];
            this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
          })
        this.GetMasterData();
        this.GetFeeTypes();
        this.loading = false; this.PageLoading = false;
      }
    }
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
    let filterStr = this.FilterOrgSubOrgBatchId;// 'BatchId eq '+ this.SelectedBatchId;
    let _FeeTypeId = this.searchForm.get("searchFeetypeId")?.value;
    if (!_FeeTypeId) {
      this.contentservice.openSnackBar("Please select fee type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      filterStr += " and FeeTypeId eq " + _FeeTypeId;
    }

    this.loading = true;
    // let list: List = new List();
    // list.fields = [
    //   'StudentFeeTypeId',
    //   'FeeTypeId',
    //   'StudentClassId',
    //   'FromMonth',
    //   'ToMonth',
    //   'Discount',
    //   'IsCurrent',
    //   'Active'
    // ];

    // list.PageName = this.StudentFeeTypeListName;
    // list.filter = [filterStr];
    // this.StudentFeeTypeList = [];
    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    debugger;
    //  ////console.log('data.value', data.value);
    // let _flattenStudents: any = _.flattenDepth(this.Students, 3);
    let _feeTypeStudents = this.Students.filter(stud => stud.StudentClasses.length > 0
      && stud.StudentClasses[0].StudentFeeTypes.find(ft => ft.FeeTypeId == _FeeTypeId));
    let _flattenStudents = _.flatMap(_feeTypeStudents, ({ PID, FirstName, LastName, StudentClassId, ClassId, Section, Semester, RollNo, StudentClasses }) =>
      _.map(StudentClasses, StudentClass => ({ PID, FirstName, LastName, StudentClassId, ClassId, Section, Semester, RollNo, ...StudentClass }))
    );
    _flattenStudents = _.flatMap(_flattenStudents, ({ PID, FirstName, LastName, StudentClassId, ClassId, Section, Semester, RollNo, StudentFeeTypes }) =>
      _.map(StudentFeeTypes, StudentFeeType => ({ PID, FirstName, LastName, StudentClassId, ClassId, Section, Semester, RollNo, ...StudentFeeType }))
    );
    this.StudentFeeTypeList = [];


    let _fromMonth = '', _toMonth = '';

    let _students = _flattenStudents.filter(s => s.FeeTypeId == _FeeTypeId);
    if (_students.length > 0) {
      _students.forEach(item => {
        let toobj = this.Months.find(m => m.val == item.ToMonth)
        if (toobj)
          _toMonth = toobj.MonthName;
        let fromobj = this.Months.find(m => m.val == item.FromMonth)
        if (fromobj)
          _fromMonth = fromobj.MonthName;

        item.LastName = item.LastName ? " " + item.LastName : '';
        item.RollNo = item.RollNo ? " " + item.RollNo : '';
        item.FromMonth = _fromMonth;
        item.ToMonth = _toMonth;
        item.Discount = item.Discount;
        item.Student = item.PID + "-" + item.FirstName + item.LastName + item.Section + item.Semester;
        item.FeeType = this.FeeTypeList.find(f => f.FeeTypeId == _FeeTypeId).FeeTypeName;
        item.ClassName = this.Classes.find(c => c.ClassId == item.ClassId).ClassName;
        this.StudentFeeTypeList.push(item);
      })
    }
    else {
      this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
    }
    //this.StudentFeeTypeList = this.StudentFeeTypeList.sort((a, b) => b.Active == a.Active);
    this.dataSource = new MatTableDataSource<any>(this.StudentFeeTypeList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loading = false;
    this.PageLoading = false;

    //});

  }
  CategoryName = '';
  SetLabel() {
    debugger;
    let _classId = this.searchForm.get("searchClassId")?.value;
    let _currentClassIndex = this.Classes.findIndex(s => s.ClassId == _classId);
    let _previousClassName = '', _sameClassName;
    if (_currentClassIndex > 0)
      _previousClassName = this.Classes[_currentClassIndex - 1].ClassName;
    _sameClassName = this.Classes[_currentClassIndex].ClassName;

    var _categoryObj = this.Classes.filter(c => c.ClassId == _classId)
    //var _category = ''
    if (_categoryObj.length > 0)
      this.CategoryName = _categoryObj[0].Category.toLowerCase();

    if (this.CategoryName == 'high school')
      this.displayedColumns = [
        'StudentName',
        'ClassId',
        'RollNo',
        'Remarks',
        'Active',
        'Action'
      ];
    else
      this.displayedColumns = [
        'StudentName',
        'ClassId',
        'SemesterId',
        'RollNo',
        'Remarks',
        'Active',
        'Action'
      ];
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
      'Active'
    ];

    list.PageName = this.FeeTypeListName;
    list.filter = [filterStr];
    this.FeeTypeList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.FeeTypeList = [...data.value];
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.FeeTypeList = this.FeeTypeList.sort((a, b) => b.Active - a.Active);

      });

  }

}
export interface IStudentFeeType {
  StudentFeeTypeId: number;
  FeeTypeId: number;
  StudentClassId: number,
  FromMonth: number;
  ToMonth: number;
  Discount: number;
  IsCurrent: boolean;
  Active: boolean;
  Action: boolean;
}