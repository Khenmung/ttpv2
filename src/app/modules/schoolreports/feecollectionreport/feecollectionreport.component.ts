import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { Observable, forkJoin } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from '../../../shared/content.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { IStudent } from '../../admission/AssignStudentClass/Assignstudentclassdashboard.component';
import { SwUpdate } from '@angular/service-worker';
import { TableUtil } from '../../../shared/TableUtil';

@Component({
  selector: 'app-feecollectionreport',
  templateUrl: './feecollectionreport.component.html',
  styleUrls: ['./feecollectionreport.component.scss']
})
export class FeecollectionreportComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  loading = false;
  Defaultvalue = 0;
  SelectedApplicationId = 0;
  Permission = 'deny';
  LoginUserDetail: any[] = [];
  TotalPaidStudentCount = 0;
  TotalUnPaidStudentCount = 0;
  allMasterData: any[] = [];
  DropdownFeeDefinitions: any[] = [];
  FeeDefinitions: any[] = [];
  Classes: any[] = [];
  Batches: any[] = [];
  Sections: any[] = [];
  Months: any[] = [];
  ELEMENT_DATA: any[] = [];
  StudentDetail: any[] = [];
  TotalAmount = 0;
  CurrentBatch: string = '';
  //StudentStatuses:any=[];
  Students: any[] = [];
  DisplayColumns = [
    "StudentStatureId",
    "PID",
    "Name",
    "ClassRollNoSection",
    "RollNo",
    "StatusId",
    "Active",
    "Action"

  ]
  UnpaidDisplayColumns = [
    "SlNo",
    "Name",
    "ClassRollNoSection",
    "RollNo",
    "StatusId",
    "Active",
    "Action"

  ]
  filteredOptions: Observable<IStudent[]>;
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  SelectedBatchId = 0; SubOrgId = 0;
  dataSource: MatTableDataSource<ITodayReceipt>;
  UnpaidDataSource: MatTableDataSource<INotPaidStudent>;
  searchForm: UntypedFormGroup;
  ErrorMessage: string = '';
  StudentStatuses: any = [];
  StudentStatusList: any = [];
  StudentStatusData = {
    StudentStatureId: 0,
    StudentClassId: 0,
    ClassId: 0,
    SectionId: 0,
    SemesterId: 0,
    StatusId: 0,
    Active: 0,
    Deleted: false,
    OrgId: 0,
    SubOrgId: 0,
    BatchId:0
  };
  //alert: any;
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder,

    private shareddata: SharedataService,
    private tokenStorage: TokenStorageService,
    private nav: Router
  ) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.FEEPAYMENTSTATUS);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      //      ////console.log('this.Permission', this.Permission)
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.shareddata.CurrentFeeDefinitions.subscribe(c => (this.FeeDefinitions = c));
        //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.Batches = this.tokenStorage.getBatches()!;
        //this.shareddata.CurrentSection.subscribe(c => (this.Sections = c));

        this.GetMasterData();

        var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
          let result: any[] = [];
          if (data.value)
            result = [...data.value];
          else
            result = [...data];
          result.forEach(m => {
            let obj = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId);
            if (obj.length > 0) {
              m.Category = obj[0].MasterDataName.toLowerCase();
              this.Classes.push(m);
            }
          });
          this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
        });
        this.contentservice.GetClassFeeWithFeeDefinition(this.FilterOrgSubOrgBatchId, 0, 0)
          .subscribe((data: any) => {
            this.Months = [];
            data.value.forEach((d: any) => {
              this.Months.push({ Month: d.Month, FeeName: d.FeeDefinition.FeeName })
              return d;
            })
            this.Months = alasql("select distinct Month,FeeName from ?", [this.Months]);
            //console.log('this.month', this.Months)
          })

        this.searchForm = this.fb.group({
          searchStudentName: [0],
          searchClassId: [0],
          searchSectionId: [0],
          searchSemesterId: [0],
          searchMonth: [0],
          PaidNotPaid: [''],
          searchStatusId: [0]
        })

        this.filteredOptions = this.searchForm.get("searchStudentName")?.valueChanges
          .pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : value.Name),
            map(Name => Name ? this._filter(Name) : this.Students.slice())
          )!;
      }
      this.PageLoad();
    }
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  PageLoad() {
    debugger;
    this.Months = this.contentservice.GetSessionFormattedMonths();
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    //this.GetMasterData();
    this.GetStudents();
  }
  get f() {
    return this.searchForm.controls;
  }
  exportArray() {
    if (this.ELEMENT_DATA.length > 0) {
      const datatoExport: any[] = this.ELEMENT_DATA;
      TableUtil.exportArrayToExcel(datatoExport, "feepaymentstatus");
    }
  }

  GetStudentFeePaymentReport() {
    debugger;
    this.ErrorMessage = '';
    let filterstring = this.FilterOrgSubOrgBatchId;

    var selectedMonth = this.searchForm.get("searchMonth")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _selectedClassId = this.searchForm.get("searchClassId")?.value;
    var paidNotPaid = this.searchForm.get("PaidNotPaid")?.value;
    //var studentclassId = this.searchForm.get("searchStudentName")?.value.StudentClassId;
    var nestedFilter = '';
    if (paidNotPaid == '') {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select paid or not paid option.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (selectedMonth == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select month.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    
    this.loading = true;
    if (paidNotPaid == 'NotPaid')
      //nestedFilter = "$filter=TotalCredit gt 0 and Balance gt 0 and Month eq " + selectedMonth + ";";
      nestedFilter = " and TotalDebit gt 0 and Balance gt 0 and Month eq " + selectedMonth + " and Active eq 1";
    else
      nestedFilter = " and TotalDebit gt 0 and Balance eq 0 and Month eq " + selectedMonth;

    if (_selectedClassId) {
      filterstring += ' and ClassId eq ' + _selectedClassId;
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    // if(!_sectionId && !_semesterId)
    // {
    //   this.loading = false;
    //   this.contentservice.openSnackBar("Please select semester/section.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    if (_semesterId)
      filterstring += ' and SemsterId eq ' + _semesterId;
    if (_sectionId)
      filterstring += ' and SectionId eq ' + _sectionId;

    let list: List = new List();
    list.fields = [
      //'ClassId,RollNo,SectionId,StudentClassId,SemesterId,StudentId'
      "StudentClassId,Month,TotalDebit,Balance"
    ];
    list.PageName = "AccountingLedgerTrialBalances";
    //StudentClassId','Month','TotalDebit','Balance'

    //list.lookupFields = ["AccountingLedgerTrialBalances(" + nestedFilter + "$select=StudentClassId,Month,TotalDebit,Balance)"];
    list.filter = [filterstring + nestedFilter];
    this.ELEMENT_DATA = [];
    this.dataSource = new MatTableDataSource<ITodayReceipt>(this.ELEMENT_DATA);

    forkJoin(this.dataservice.get(list), this.getStudentStatures())
      .subscribe((data: any) => {
        //debugger;
        var result: any[] = [];
        if (data[0].value.length > 0) {
          //this.TotalStudentCount = data.value.length;
          var _className = '';
          var _sectionName = '';

          data[0].value.forEach((item, indx) => {
            _className = '';
            _sectionName = '';
            let stud = this.Students.filter(f => f.StudentClassId == item.StudentClassId)
            if (stud.length > 0) {
              item.Name = stud[0].Name;
              item.ClassId = stud[0].ClassId;
              item.SemesterId = stud[0].SemesterId;
              item.SectionId = stud[0].SectionId;
              item.RollNo = stud[0].RollNo;
              item.PID = stud[0].PID;
              var clsobj = this.Classes.filter(c => c.ClassId == item.ClassId)
              if (clsobj.length > 0) {
                _className = clsobj[0].ClassName
                var sectionObj = this.Sections.filter((s: any) => s.MasterDataId == item.SectionId)
                if (sectionObj.length > 0)
                  _sectionName = sectionObj[0].MasterDataName
                //var _lastname = item.Student.LastName == null ? '' : " " + item.Student.LastName;
                result.push({
                  Name: item.Name,
                  ClassRollNoSection: _className + '-' + _sectionName,
                  StudentClassId: item.StudentClassId,
                  RollNo: item.RollNo,
                  Section: _sectionName,
                  SectionId: item.SectionId,
                  SemesterId: item.SemesterId,
                  ClassId: item.ClassId,
                  Month: item.Month,
                  Sequence: clsobj[0].Sequence,
                  PID: item.PID
                })
              }
            }
          });
          debugger;
          //result =result.sort((a,b)=>a.Sequence - b.Sequence);
          let str = "select PID,Name,ClassRollNoSection,ClassId,SemesterId,SectionId,StudentClassId,RollNo,Sequence,Section," +
            "MAX(Month) month from ? " +
            "group by PID,Name,Sequence,ClassRollNoSection,Section,RollNo,ClassId,SemesterId,SectionId,StudentClassId"
          this.ELEMENT_DATA = alasql(str, [result]);
          // if (paidNotPaid == 'NotPaid')
          //   this.ELEMENT_DATA = this.ELEMENT_DATA.filter((f: any) => f.month == 0); //.sort((a, b) => a.month - b.month)
          // else
          //   this.ELEMENT_DATA = this.ELEMENT_DATA.filter((f: any) => f.month > 0); //.sort((a, b) => a.month - b.month)
          this.loading = false;
          this.PageLoading = false;
          var _StatusId = this.searchForm.get("searchStatusId")?.value;
          this.TotalPaidStudentCount = this.ELEMENT_DATA.length;
          if (this.ELEMENT_DATA.length == 0) {
            this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
          }

          this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a, b) => a.Sequence - b.Sequence || a.Section.localeCompare(b.Section) || a.RollNo - b.RollNo);
          //if (data[1].value.length > 0) {
          this.ELEMENT_DATA.forEach(item => {
            let studentstatus = data[1].value.filter(d => d.StudentClassId == item.StudentClassId
              && d.StatusId == (_StatusId ? _StatusId : d.StatusId));
            if (studentstatus.length > 0) {
              item.Active = studentstatus[0].Active;
              item.StudentStatureId = studentstatus[0].StudentStatureId;
              item.StatusId = studentstatus[0].StatusId;
            }
            else if (!_StatusId) {
              item.Active = false;
              item.StudentStatureId = 0;
              item.StatusId = 0;
            }
          })
          //}
          this.dataSource = new MatTableDataSource<ITodayReceipt>(this.ELEMENT_DATA);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
          this.loading = false; this.PageLoading = false;
          this.dataSource = new MatTableDataSource<ITodayReceipt>(this.ELEMENT_DATA);
          this.dataSource.paginator = this.paginator;
        }
        this.loading = false;
        this.PageLoading = false;

      })
  }
  UpdateActive(row, event) {
    row.Active = event.checked;
    row.Action = true;
  }
  UpdateStatus(row) {
    row.Action = true;
  }
  getStudentStatures() {
debugger;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    var _StatusId = this.searchForm.get("searchStatusId")?.value;
    let filterstr = this.FilterOrgSubOrg;
    filterstr += " and ClassId eq " + _classId;
    if (_semesterId)
      filterstr += " and SemesterId eq " + _semesterId;
    if (_sectionId)
      filterstr += " and SectionId eq " + _sectionId;
    if (_StatusId)
      filterstr += " and StatusId eq " + _StatusId;

    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'ClassId',
      'StudentStatureId',
      'StatusId',
      'SectionId',
      'SemesterId',
      'Active'
    ];
    list.PageName = "StudentStatures";
    list.filter = [filterstr];
    return this.dataservice.get(list);
    // .subscribe((data: any) => {
    // })
  }
  getStudentClasses() {
    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'ClassId',
      'RollNo',
      'SectionId'
    ];
    list.PageName = "StudentClasses";
    list.lookupFields = ["Student($select=FirstName,LastName)"];
    list.filter = ["IsCurrent eq true and Active eq 1 and Batch eq " + this.SelectedBatchId];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        let paid;
        this.StudentDetail = [];
        if (data.value.length > 0) {
          data.value.forEach((item, indx) => {
            paid = this.ELEMENT_DATA.filter(paidlist => {
              paidlist.StudentClassId != item.StudentClassId
            })
            if (paid.length == 0) {
              var _lastname = item.Student.LastName == null ? '' : " " + item.Student.LastName;
              this.StudentDetail.push({
                SlNo: indx + 1,
                Name: item.Student.FirstName + _lastname,
                RollNo: item.RollNo,
                ClassRollNoSection: this.Classes.filter(c => c.ClassId == item.ClassId)[0].ClassName + ' - ' + this.Sections.filter(c => c.MasterDataId == item.SectionId)[0].MasterDataName,
              });
            }
          });
          this.TotalUnPaidStudentCount = this.StudentDetail.length;
          this.UnpaidDataSource = new MatTableDataSource<INotPaidStudent>(this.StudentDetail);
        }
      });
  }
  Save(row) {
    this.DataToUpdate = 1;
    this.StudentStatusList = [];
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    var _classId = this.searchForm.get("searchClassId")?.value;
    //var _StatusId = this.searchForm.get("searchStatusId")?.value;
    let checkFilterString = this.FilterOrgSubOrg;
    if (_classId) {
      checkFilterString += " and ClassId eq " + _classId;
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    checkFilterString += " and StudentClassId eq " + row.StudentClassId;

    if (row.StatusId > 0) {
      checkFilterString += " and StatusId eq " + row.StatusId;
    }
    //checkFilterString += " and Active eq true";

    if (row.StudentStatureId > 0)
      checkFilterString += " and StudentStatureId ne " + row.StudentStatureId;

    let list: List = new List();
    list.fields = ["StudentStatureId"];
    list.PageName = "StudentStatures";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.PageLoading = false;
          //row.EvaluationSubmitted = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
          this.SubOrgId = +this.tokenStorage.getSubOrgId()!;

          this.StudentStatusData =
          {
            StudentStatureId: row.StudentStatureId,
            StudentClassId: row.StudentClassId,
            ClassId: row.ClassId,
            SectionId: row.SectionId,
            SemesterId: row.SemesterId,
            StatusId: row.StatusId,
            Active: row.Active,
            Deleted: false,
            OrgId: this.LoginUserDetail[0]["orgId"],
            SubOrgId: this.SubOrgId,
            BatchId:this.SelectedBatchId
          };

          if (this.StudentStatusData.StudentStatureId == 0) {
            this.StudentStatusData["CreatedDate"] = new Date();
            this.StudentStatusData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.StudentStatusData["UpdatedDate"];
            delete this.StudentStatusData["UpdatedBy"];
            this.StudentStatusList.push(this.StudentStatusData)
            ////console.log("this.StudentEvaluationForUpdate[0] insert", this.StudentEvaluationForUpdate[0])
            this.insert(row);
          }
          else {
            ////console.log("this.StudentEvaluationForUpdate[0] update", this.StudentEvaluationForUpdate[0])
            this.StudentStatusList.push(this.StudentStatusData)
            this.StudentStatusData["UpdatedDate"] = new Date();
            this.StudentStatusData["UpdatedBy"];
            delete this.StudentStatusData["CreatedDate"];
            delete this.StudentStatusData["CreatedBy"];
            this.update(row);
          }
          
          // if (this.DataToUpdate == this.StudentStatusList.length) {
          //   //console.log("this.StudentEvaluationForUpdate[0] insert", this.StudentEvaluationForUpdate)
          //   this.insert(row);
          // }

        }
      });
  }
  DataToUpdate = 0;
  saveall() {
    this.StudentStatusList = [];
    let toupdate = this.ELEMENT_DATA.filter(c => c.Active);
    this.DataToUpdate = toupdate.length;
    toupdate.forEach(item => {
      this.UpdateOrSave(item);
    })
  }
  loadingFalse() {
    this.loading = false;
    this.PageLoading = false;
  }
  insert(row) {
    console.log("this.StudentStatusList",this.StudentStatusList);
    this.dataservice.postPatch('StudentStatures', this.StudentStatusList[0], 0, 'post')
      .subscribe(
        (data: any) => {

          row.StudentStatureId = data.StudentStatureId;
          row.Action = false;
          this.loadingFalse();
          this.contentservice.openSnackBar("Data Saved successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
        },
        error => {

          this.loadingFalse();
          //console.log("error on student evaluation insert", error);
        });
  }
  update(row) {
    ////console.log("updating",this.StudentEvaluationForUpdate);
    this.dataservice.postPatch('StudentStatures', this.StudentStatusList[0], this.StudentStatusList[0].StudentStatureId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetMasterData() {
    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.StudentStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTSTATUS);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);

  }
  SelectedClassCategory = '';
  ClassCategory: any[] = [];
  Semesters: any[] = [];
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  BindSectionSemester() {
    let _classId = this.searchForm.get("searchClassId")?.value;
    let obj = this.Classes.filter(c => c.ClassId == _classId);
    if (obj.length > 0) {
      this.SelectedClassCategory = obj[0].Category.toLowerCase();
    }
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();
  }
  ClearData() {
    this.ELEMENT_DATA = [];
    this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
    this.StudentStatusList = [];
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
    // let Id = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    // })[0].MasterDataId;
    // return this.allMasterData.filter((item, index) => {
    //   return item.ParentId == Id
    // });
  }
  GetStudents() {

    var _students: any = this.tokenStorage.getStudents()!;
    //var _filteredStudents = _students.filter((s: any) => data.value.findIndex(fi => fi.StudentId == s.StudentId) > -1)
    var _filteredStudents = _students.filter((s: any) => s.StudentClasses && s.StudentClasses.length > 0);
    this.Students = [];
    _filteredStudents.forEach(studentcls => {
      //var matchstudent = _filteredStudents.filter(stud => stud.StudentId == studentcls.StudentId)
      //if (matchstudent.length > 0) {
      var _classNameobj = this.Classes.filter(c => c.ClassId == studentcls.ClassId);
      var _className = '';
      if (_classNameobj.length > 0)
        _className = _classNameobj[0].ClassName;

      var _Section = '';
      var _sectionobj = this.Sections.filter((f: any) => f.MasterDataId == studentcls.SectionId);
      if (_sectionobj.length > 0)
        _Section = _sectionobj[0].MasterDataName;

      //var _RollNo = studentcls.RollNo;
      ////console.log('matchstudent[0].LastName', matchstudent[0].LastName)
      var _lastname = studentcls.LastName ? " " + studentcls.LastName : '';
      var _name = studentcls.FirstName + _lastname;
      //var _fullDescription = _name //+ " - " + _RollNo;//_className + " - " + _Section + " - " + _RollNo;
      this.Students.push({
        StudentClassId: studentcls.StudentClassId,
        StudentId: studentcls.StudentId,
        SectionId: studentcls.StudentClasses[0].SectionId,
        SemesterId: studentcls.StudentClasses[0].SemesterId,
        RollNo: studentcls.StudentClasses[0].RollNo,
        ClassId: studentcls.StudentClasses[0].ClassId,
        PID: studentcls.PID,
        Name: _name
      })
      //}
      //})
      //}
      this.loading = false; this.PageLoading = false;
    })
  }
}
export interface ITodayReceipt {
  "SlNo": number,
  "Name": string,
  "ClassRollNoSection": string,
  "RollNo": number,
  "PaymentDate": number,
  "Month": number,
  "MonthName": string
}
export interface INotPaidStudent {
  "SlNo": number,
  "Name": string,
  "RollNo": number;
  "ClassRollNoSection": string
}
