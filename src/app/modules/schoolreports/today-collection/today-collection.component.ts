import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from '../../../shared/content.service';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { IStudent } from '../../admission/AssignStudentClass/Assignstudentclassdashboard.component';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-today-collection',
  templateUrl: './today-collection.component.html',
  styleUrls: ['./today-collection.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TodayCollectionComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  allRowsExpanded: boolean = false;
  expandedElement: any;
  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  Defaultvalue = 0;
  loading = false;
  allMasterData: any[] = [];
  FeeDefinitions: any[] = [];
  FeeCategories: any[] = [];
  Classes: any[] = [];
  Batches: any[] = [];
  Sections: any[] = [];
  Students: any[] = [];
  GroupByPaymentType: any[] = [];
  ELEMENT_DATA: any[] = [];
  GrandTotalAmount = 0;
  CancelledAmount = 0;
  PaymentTypes: any[] = [];
  DisplayColumns = [
    "PID",
    "ReceiptNo",
    "ReceiptDate",
    "Name",
    //"ClassName",
    "PaymentType",
    "ReceivedBy",
    "Status",
    "TotalAmount"
  ]
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  SelectedApplicationId = 0;
  Permission = 'deny';
  DateWiseCollection: any[] = [];
  HeadsWiseCollection: any[] = [];
  LoginUserDetail: any[] = [];
  dataSource: MatTableDataSource<ITodayReceipt>;
  SearchForm: UntypedFormGroup;
  ErrorMessage: string = '';
  SelectedBatchId = 0; SubOrgId = 0;
  filteredOptions: Observable<IStudent[]>;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private dataservice: NaomitsuService,
    private formatdate: DatePipe,
    private fb: UntypedFormBuilder,
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
    this.SearchForm = this.fb.group({
      searchClassId: [0],
      searchStudentName: [0],
      FromDate: [new Date(), Validators.required],
      ToDate: [new Date(), Validators.required],
      searchReportType: ['', Validators.required],
    })
    this.filteredOptions = this.SearchForm.get("searchStudentName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      )!;
    this.PageLoad();
  }
  PageLoad() {
    debugger;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.DATEWISECOLLECTION);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
          if (data.value) this.Classes = [...data.value]; else this.Classes = [...data];
          this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
          this.GetMasterData();
        });

        this.GetEmployees();
      }
    }
  }
  Employees: any[] = [];
  GetEmployees() {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "EmpEmployeeId",
      "FirstName",
      "ShortName",
      "UserId"
    ];

    list.PageName = "EmpEmployees";
    list.filter = [this.FilterOrgSubOrg]
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Employees = [...data.value];
        this.PageLoading = false;
        this.loading = false;
      })

  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  public toggle() {
    this.allRowsExpanded = !this.allRowsExpanded;
    this.expandedElement = null;
  }
  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
  }
  AddMinutes(date, minutes) {
    const mydate = Date.parse(date) - minutes * 60 * 100;
    //date.setMinutes(date.getMinutes() + minutes);

    return new Date(mydate).toISOString();
  }
  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  GetStudentFeePaymentDetails() {
    debugger;
    this.ErrorMessage = '';
    let fromDate = this.SearchForm.get("FromDate")?.value;
    let toDate = new Date(this.SearchForm.get("ToDate")?.value);
    let _classId = this.SearchForm.get("searchClassId")?.value;
    let _studentClassId = this.SearchForm.get("searchStudentName")?.value.StudentClassId;
    let filterstring = this.FilterOrgSubOrg;
    this.loading = true;
    //filterstring = " eq 1" 
    toDate.setDate(toDate.getDate() + 1);
    filterstring += " and ReceiptDate ge " + this.formatdate.transform(fromDate, 'yyyy-MM-dd') +
      " and ReceiptDate lt " + this.formatdate.transform(toDate, 'yyyy-MM-dd');



    if (_studentClassId > 0)
      filterstring += " and StudentClassId eq " + _studentClassId;
    if (_classId > 0) {
      filterstring += " and ClassId eq " + _classId;
    }

    let list: List = new List();
    list.fields = [
      'ReceiptDate',
      'ReceiptNo',
      'StudentClassId',
      'TotalAmount',
      'PaymentTypeId',
      'BatchId',
      'Active',
      'CreatedBy'
    ];
    list.PageName = "StudentFeeReceipts";
    list.lookupFields = [
      //"AccountingVouchers($filter=ClassFeeId gt 0 and FeeReceiptId gt 0;$select=FeeReceiptId,LedgerId,ClassFeeId,Amount;$expand=ClassFee($select=FeeDefinitionId;$expand=FeeDefinition($select=FeeName,FeeCategoryId))),StudentClass($select=StudentId,ClassId;$expand=Student($select=FirstName,LastName),Class($select=ClassName))"
      "AccountingVouchers($filter=ClassFeeId gt 0 and FeeReceiptId gt 0;$select=FeeReceiptId,LedgerId,ClassFeeId,Amount;$expand=ClassFee($select=FeeDefinitionId;$expand=FeeDefinition($select=FeeName,FeeCategoryId)))"
    ]
    //,StudentClass($select=StudentId,ClassId;$expand=Student($select=FirstName,LastName),Class($select=ClassName))"
    list.filter = [filterstring];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        ////console.log('paymentd ata', data.value);
        var result: any[] = [];
        var _students: any[] = [];
        this.CategoryTotal = 0;
        if (_classId > 0)
          _students = this.Students.filter((s: any) => s.StudentClasses && s.StudentClasses.length > 0 && s.StudentClasses.findIndex(d => d.ClassId == _classId) > -1);
        else
          _students = [...this.Students];
        //console.log("data.value", data.value)
        data.value.forEach(db => {
          var obj = this.Employees.filter(e => e.UserId == db.CreatedBy);
          if (obj.length > 0)
            db.ReceivedBy = obj[0].ShortName;

          var studcls = _students.filter((s: any) => s.StudentClasses && s.StudentClasses.length > 0 && s.StudentClasses.findIndex(d => d.StudentClassId == db.StudentClassId) > -1);
          if (studcls.length > 0) {
            let _receiptdate = new Date(db.ReceiptDate);
            const _hours = _receiptdate.getHours();
            const _mins = _receiptdate.getMinutes();
            const _offSet = new Date(db.ReceiptDate).getTimezoneOffset();
            const offsetHours = Math.round(_offSet / 60);
            const offsetMins = _offSet % 60;
            _receiptdate.setMinutes(_mins - offsetMins);
            _receiptdate.setHours(_hours - offsetHours);


            // let newDate = new Date(new Date(db.ReceiptDate).setHours( (_offSet*60*60));
            //console.log("db.ReceiptDate",db.ReceiptDate);
            //console.log("getTimezoneOffset",_offSet);
            // db.ReceiptDate = new Date(db.ReceiptDate).to.toLocaleTimeString();//  this.AddMinutes(_receiptdate,_offSet);

            db.ReceiptDate = _receiptdate;
            db.StudentClasses = studcls;
            db.PID = studcls[0].PID;

          }
          result.push(db);
          //return db;
        });


        var activebill = result.filter((f: any) => f.Active == 1).sort((a, b) => a.BatchId - b.BatchId);
        this.GrandTotalAmount = 0;//activebill.reduce((acc, current) => acc + current.TotalAmount, 0);
        result.forEach(t => {
          this.GrandTotalAmount += t.AccountingVouchers.reduce((acc, current) => acc + current.Amount, 0);
        })
        //console.log("activebill", activebill)
        var cancelledBill = result.filter((f: any) => f.Active == 0)
        cancelledBill.forEach(t => {
          this.CancelledAmount += t.AccountingVouchers.reduce((acc, current) => acc + current.Amount, 0);
        })

        this.GrandTotalAmount = this.GrandTotalAmount - this.CancelledAmount;

        this.DateWiseCollection = result.map(d => {
          var pm = this.PaymentTypes.filter(p => p.MasterDataId == d.PaymentTypeId);
          var _paymentType = '';
          if (pm.length > 0)
            _paymentType = pm[0].MasterDataName;
          //var _lastname = d.StudentClass.Student.LastName == null ? '' : " " + d.StudentClass.Student.LastName;
          if (d.StudentClasses) {
            d.Name = d.StudentClasses[0].Name;
            d.ClassName = d.StudentClasses[0].ClassName
          }
          d.PaymentType = _paymentType;
          d.Status = d.Active == 0 ? 'Cancelled' : 'Active';
          //d.ReceiptDate = this.datepipe.transform(d.ReceiptDate,'dd/MM/yyyy') 
          //d.FeeName = this.FeeDefinitions.filter((f:any)=>f.FeeDefinitionId == d.AccountingVouchers[0].ClassFeeId)[0].FeeName;
          return d;
        })

        var groupbyPaymentType = alasql("Select PaymentType, Sum(TotalAmount) TotalAmount,BatchId,Status from ? group by PaymentType,BatchId,Status order by Status,BatchId", [this.DateWiseCollection]);
        this.HeadsWiseCollection = [];

        activebill.forEach(d => {
          d.AccountingVouchers.forEach((v, indx) => {
            var _feeCategoryName = '';
            if (v.ClassFee) {
              var _feeCategoryId = v.ClassFee.FeeDefinition.FeeCategoryId;
              var objCategory = this.FeeCategories.find((f: any) => f.MasterDataId == _feeCategoryId)
              if (objCategory)
                _feeCategoryName = objCategory.MasterDataName;


              //this.GroupByPaymentType.push(item);

              //var _lastname = d.StudentClass.Student.LastName == null ? '' : " " + d.StudentClass.Student.LastName;
              this.HeadsWiseCollection.push({
                ClassFeeId: v.ClassFeeId,
                Amount: v.Amount,
                PaymentType: this.PaymentTypes.filter(p => p.MasterDataId == d.PaymentTypeId)[0].MasterDataName,
                Student: d.StudentClasses ? d.StudentClasses[0].Name : '', //d.StudentClass.Student.FirstName + _lastname,
                //ClassName: d.StudentClass.Class.ClassName,
                Batch: this.Batches.find(b => b.BatchId == d.BatchId).BatchName,
                ClassName: d.ClassName,
                FeeCategoryId: _feeCategoryId,
                FeeCategory: _feeCategoryName,
              })
            }
          })
          return d.AccountingVouchers;
        })
        let _currentBatch = '', _currentTotal = 0;
        this.HeadsWiseCollection = alasql("select FeeCategory,Sum(Amount) Amount,Batch from ? group by FeeCategory,Batch", [this.HeadsWiseCollection]);
        ////console.log('this.HeadsWiseCollection', this.HeadsWiseCollection)
        this.HeadsWiseCollection.forEach((item, indx1) => {
          if (_currentBatch !== item.Batch && _currentBatch !== '') {
            this.HeadsWiseCollection[indx1 - 1].BatchTotal = _currentTotal;
            let noOfPreviousBatchObj = this.HeadsWiseCollection.filter(n => n.Batch == _currentBatch);
            if (noOfPreviousBatchObj.length > 1)
              this.HeadsWiseCollection[indx1 - 1].Batch = '';

            this.CategoryTotal += _currentTotal;
            _currentTotal = item.Amount;

            if (indx1 === this.HeadsWiseCollection.length - 1) {
              this.CategoryTotal += _currentTotal;
              item.BatchTotal = _currentTotal;
              item.Batch = '';
            }
          }
          else if (indx1 === this.HeadsWiseCollection.length - 1) {
            _currentTotal += item.Amount;
            this.CategoryTotal += _currentTotal;
            item.BatchTotal = _currentTotal;
            let noOfPreviousBatchObj = this.HeadsWiseCollection.filter(n => n.Batch == _currentBatch);
            if (noOfPreviousBatchObj.length > 1)
              item.Batch = '';
            else
              item.Batch = item.Batch;

          }
          else {
            _currentTotal += item.Amount;
            item.BatchTotal = '';
            // if (_currentBatch !== '')
            //   item.Batch = '';
          }
          _currentBatch = item.Batch;
        })

        let _currentBatchId = 0;
        _currentTotal = 0;
        groupbyPaymentType.forEach((item, indx) => {
          let _batch = this.Batches.find(b => b.BatchId == item.BatchId);
          // if (_batch)
          //   item.Batch = _batch.BatchName;
          //same batchid last loop
          if (_currentBatchId !== item.BatchId && _currentBatchId !== 0) {
            this.GroupByPaymentType[this.GroupByPaymentType.length - 1].BatchTotal = _currentTotal;
            let _previousbatch = this.Batches.find(b => b.BatchId == groupbyPaymentType[indx - 1].BatchId);
            this.GroupByPaymentType[this.GroupByPaymentType.length - 1].Batch = _previousbatch.BatchName;
            item.BatchTotal = '';
            item.Batch = _batch.BatchName;
            _currentTotal = item.TotalAmount;
            if (indx === groupbyPaymentType.length - 1) {
              item.BatchTotal = _currentTotal;
            }
            // else
            //   item.Batch = '';

          }
          //last loop
          else if (indx === groupbyPaymentType.length - 1) {
            item.BatchTotal = _currentTotal;
            let noOfPreviousBatchObj = groupbyPaymentType.filter(n => n.Batch == _batch.BatchName);
            if (noOfPreviousBatchObj.length > 1)
              item.Batch = '';
            else
              item.Batch = _batch.BatchName;
            // if (_currentBatchId !== item.BatchId && _currentBatchId !== 0)
            //   item.Batch = _batch.BatchName;
            // else
            //   item.Batch = '';
          }
          else {
            _currentTotal += item.TotalAmount;
            item.BatchTotal = '';
            item.Batch = _batch.BatchName;
          }
          _currentBatchId = item.BatchId;
          this.GroupByPaymentType.push(item);
        })
        //console.log("this.HeadsWiseCollection", this.HeadsWiseCollection)
        if (this.DateWiseCollection.length == 0)
          this.contentservice.openSnackBar("No collection found.", globalconstants.ActionText, globalconstants.RedBackground);

        const rows: any[] = [];
        this.DateWiseCollection.forEach(element => rows.push(element, { detailRow: true, element }));
        ////console.log("rows", rows)
        this.dataSource = new MatTableDataSource(rows);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
        this.PageLoading = false;
        this.Reload = false;
      })
  }
  Reload = true;
  CategoryTotal = 0;
  toFloat(r) {
    return parseFloat(r);
  }
  datechange() {
    this.Reload = true;
    this.DateWiseCollection = [];
    this.dataSource = new MatTableDataSource(this.DateWiseCollection);
    this.HeadsWiseCollection = [];
    this.GroupByPaymentType = [];
    this.GrandTotalAmount = 0;
    this.CancelledAmount = 0;
  }
  GetMasterData() {
    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.shareddata.CurrentFeeDefinitions.subscribe((f: any) => {
      this.FeeDefinitions = [...f];
      if (this.FeeDefinitions.length == 0) {
        this.contentservice.GetFeeDefinitions(this.FilterOrgSubOrg, 1).subscribe((d: any) => {
          this.FeeDefinitions = [...d.value];
        })
      }
    })
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.PaymentTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.FEEPAYMENTTYPE);
    this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);

    //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.Batches = this.tokenStorage.getBatches()!;
    this.GetStudents();

  }
  GetStudents() {


    var _students: any = this.tokenStorage.getStudents()!;
    _students.forEach(studentcls => {
      //var matchstudent = _filteredStudents.filter(stud => stud.StudentId == studentcls.StudentId)
      if (studentcls.StudentClasses && studentcls.StudentClasses.length > 0) {
        var _classNameobj = this.Classes.filter(c => c.ClassId == studentcls.StudentClasses[0].ClassId);
        var _className = '';
        if (_classNameobj.length > 0)
          _className = _classNameobj[0].ClassName;

        var _Section = '';
        var _sectionobj = this.Sections.filter((f: any) => f.MasterDataId == studentcls.StudentClasses[0].SectionId);
        if (_sectionobj.length > 0)
          _Section = _sectionobj[0].MasterDataName;
        var _lastname = studentcls.LastName == null ? '' : " " + studentcls.LastName;
        var _RollNo = studentcls.StudentClasses[0].RollNo;
        var _name = studentcls.FirstName + _lastname;
        var _fullDescription = _name + "-" + _className + "-" + _Section + "-" + _RollNo;

        studentcls.StudentClassId = studentcls.StudentClasses[0].StudentClassId;
        //StudentId: studentcls.StudentId,
        studentcls.ClassName = _className;
        studentcls.Name = _fullDescription;
        this.Students.push(studentcls);
      }
    })
    //}
    this.loading = false; this.PageLoading = false;
    //})
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
    // let IdObj = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    // })
    // var Id = 0;
    // if (IdObj.length > 0) {
    //   Id = IdObj[0].MasterDataId;
    //   return this.allMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   });
    // }
    // else
    //   return [];
  }
}
export interface ITodayReceipt {
  "SlNo": number,
  "FeeName": string,
  "TotalAmount": string,
}