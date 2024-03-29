import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { NaomitsuService } from '../../../../shared/databaseService';
import { globalconstants } from '../../../../shared/globalconstant';
import { List } from '../../../../shared/interface';
import { SharedataService } from '../../../../shared/sharedata.service';
import alasql from 'alasql';
import { evaluate } from 'mathjs';
import { FeereceiptComponent } from '../feereceipt/feereceipt.component';
import { ContentService } from '../../../../shared/content.service';
import { map, startWith } from 'rxjs/operators';
import { SwUpdate } from '@angular/service-worker';
import * as moment from 'moment';
import { StyleSheet } from "aphrodite";
@Component({
  selector: 'app-addstudentfeepayment',
  templateUrl: './addstudentfeepayment.component.html',
  styleUrls: ['./addstudentfeepayment.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AddstudentfeepaymentComponent implements OnInit {
  PageLoading = true;
  @ViewChild(FeereceiptComponent) receipt: FeereceiptComponent;
  AccountingLedgerTrialBalanceListName = 'AccountingLedgerTrialBalances';
  AccountingVoucherListName = 'AccountingVouchers';
  FeeReceiptListName = 'StudentFeeReceipts';
  StudentFeeLedgerName = 'Student Fee';
  Permission = 'deny';
  DiscountText = 'Discount';
  DiscountAmount = 0;
  selectedIndex = 0;
  loading = false;
  Balance = 0;
  NewDataCount = 0;
  TotalAmount = 0;
  exceptionColumns: boolean;
  //isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  PaymentTypes: any[] = [];
  FeeCategories: any[] = [];
  Remarks: any = [];
  OffLineReceiptNo = '';
  CashAmount = 0;
  PaymentTypeId = 0;
  TuitionFeeLedgerId = 0;
  GeneralLedgerAccountId = 0;
  GeneralLedgerAccounts: any[] = [];
  expandedElement: any;
  CurrentRow: any = {};
  FeePayable = true;
  filteredOptions: Observable<string[]>;
  SelectedBatchId = 0; SubOrgId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  NoOfBillItems = 0;
  studentInfoTodisplay = {
    StudentFeeReceiptId: 0,
    PID: 0,
    BatchId: 0,
    AdmissionNo: 0,
    RollNo: 0,
    StudentFeeType: '',
    StudentName: '',
    StudentClassName: '',
    FeeTypeId: 0,
    FeeType: '',
    FromMonth: 0,
    ToMonth: 0,
    Formula: '',
    StudentId: 0,
    ClassId: 0,
    SectionId: 0,
    SemesterId: 0,
    SectionName: '',
    Semester: '',
    PayAmount: 0,
    StudentClassId: 0,
    ReceiptNo: 0,
    ReceiptDate: new Date(),
    Remarks: ''
  }
  FeePayment: {
    StudentFeeReceipt: {},
    LedgerAccount: any[],
    AccountingVoucher: any[]
  } = {
      StudentFeeReceipt: {},
      LedgerAccount: [],
      AccountingVoucher: []
    };
  ReceiptHeading: any[] = [];
  SelectedApplicationId = 0;
  OriginalAmountForCalc = 0;
  VariableObjList: any[] = [];
  Months: any[] = [];
  StudentName = '';
  LoginUserDetail: any[] = [];
  Semesters: any[] = [];
  Sections: any[] = [];
  FeeDefinitions: any[] = [];
  Classes: any[] = [];
  Batches: any[] = [];
  Locations: any[] = [];
  AccountNature: any[] = [];
  AccountGroup: any[] = [];
  StudentClassFees: any[] = [];
  FeeTypes: any[] = [];
  //AccountingLedgerTrialBalanceListName = 'AccountingLedgerTrialBalances';
  ELEMENT_DATA: ILedger[] = [];
  ExistingStudentLedgerList: any[] = [];
  StudentLedgerList: ILedger[];
  Students: any[];
  dataSource: MatTableDataSource<ILedger>;
  billdataSource: MatTableDataSource<any>;
  allMasterData: any[] = [];
  PaymentName = '';
  MonthlyDueDetail: any[] = [];
  CurrentTotalAmount = 0;
  StudentReceiptData = {
    StudentFeeReceiptId: 0,
    StudentClassId: 0,
    ClassId: 0,
    SectionId: 0,
    SemesterId: 0,
    TotalAmount: 0,
    Balance: 0,
    ReceiptNo: 0,
    PaymentTypeId: 0,
    AdjustedAccountId: 0,
    OffLineReceiptNo: '',
    ReceiptDate: new Date(),
    Discount: 0,
    BatchId: 0,
    OrgId: 0,
    SubOrgId: 0,
    CreatedBy: '',
    CreatedDate: new Date(),
    Active: 1,
    Ledgerdata: [],
    AccountingVouchers: []
  }
  AccountingVoucherData = {
    Month: 0,
    AccountingVoucherId: 0,
    DocDate: new Date(),
    PostingDate: new Date(),
    Reference: '',
    LedgerId: 0,
    GeneralLedgerAccountId: 0,
    FeeReceiptId: 0,
    DebitCreditId: 0,
    Amount: 0,
    ClassFeeId: 0,
    ShortText: '',
    OrgId: 0,
    SubOrgId: 0,
    Active: 1
  }
  StudentLedgerData: any = {
    LedgerId: 0,
    StudentClassId: 0,
    ClassId: 0,
    SemesterId: 0,
    SectionId: 0,
    Month: 0,
    MonthDisplay: 0,
    TotalCredit: 0,
    Balance: 0,
    BatchId: 0,
    OrgId: 0,
    SubOrgId: 0,
    Active: 1
  };

  displayedColumns = [
    //'SlNo1',
    'MonthName',
    'BaseAmount1',
    'TotalDebit',
    'TotalCredit',
    'Balance1',
    'Action'
  ];
  billDisplayedColumns = [
    'SlNo',
    'FeeName',
    'BaseAmount',
    'Amount',
    'Balance',
    'Action'
  ]
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private fb: UntypedFormBuilder,
    private nav: Router,
    private datepipe: DatePipe,
    private shareddata: SharedataService) { }
  filteredLedgerAccounts: Observable<IGeneralLedger[]>;
  paymentform: UntypedFormGroup;
  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.paymentform = this.fb.group({
      GeneralLedgerAccountId: [0]
    })
    this.filteredLedgerAccounts = this.paymentform.get("GeneralLedgerAccountId")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.GeneralLedgerName),
        map(Name => Name ? this._filter(Name) : this.GeneralLedgerAccounts.slice())
      )!;
    this.PageLoad();
  }
  private _filter(name: string): IGeneralLedger[] {

    const filterValue = name.toLowerCase();
    return this.GeneralLedgerAccounts.filter(option => option.GeneralLedgerName.toLowerCase().includes(filterValue));

  }
  displayFn(user: IGeneralLedger): string {
    return user && user.GeneralLedgerName ? user.GeneralLedgerName : '';
  }
  getGeneralAccounts() {
    this.contentservice.GetGeneralAccounts(this.FilterOrgSubOrg, 1, '')
      .subscribe((data: any) => {
        this.GeneralLedgerAccounts = [...data.value];
      })
  }
  setPaymentType() {
    debugger;
    //this.PaymentTypeId = this.paymentform.get("GeneralLedgerAccountId")?.value;

    var obj = this.PaymentTypes.filter((f: any) => f.MasterDataId == this.PaymentTypeId)
    if (obj.length > 0)
      this.PaymentName = obj[0].MasterDataName.toLowerCase();

  }
  detail() {
    if (this.studentInfoTodisplay.StudentId > 0)
      this.nav.navigate(['/edu/addstudent/' + this.studentInfoTodisplay.StudentId]);
  }
  admission() {
    this.nav.navigate(['/edu/admission']);
  }
  PageLoad() {
    debugger;
    this.loading = true;
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.FEEPAYMENT);
    if (perObj.length > 0) {
      this.Permission = perObj[0].permission;
    }
    if (this.Permission != 'deny') {
      this.TotalAmount = 0;
      this.Balance = 0;
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      this.MonthlyDueDetail = [];
      this.billdataSource = new MatTableDataSource<any>(this.MonthlyDueDetail);
      this.Months = this.contentservice.GetSessionFormattedMonths();
      this.LoginUserDetail = this.tokenStorage.getUserDetail();
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.studentInfoTodisplay.StudentId = this.tokenStorage.getStudentId()!;
      var _currentStudent: any;
      this.Students = this.tokenStorage.getStudents()!;
      this.CustomerHeading = [];
      if (this.Students.length > 0) {
        _currentStudent = this.Students.find((s: any) => s.StudentId == this.studentInfoTodisplay.StudentId)
        this.CustomerHeading.push({ Text: _currentStudent.FirstName, 'Description': '' });
        this.CustomerHeading.push({ Text: _currentStudent.PresentAddress, 'Description': '' });
      }
      this.studentInfoTodisplay.StudentClassId = this.tokenStorage.getStudentClassId()!;
      this.shareddata.CurrentStudentName.subscribe(fy => (this.StudentName = fy));

      this.Batches = this.tokenStorage.getBatches()!;
      this.shareddata.CurrentLocation.subscribe(fy => (this.Locations = fy));
      this.shareddata.CurrentFeeType.subscribe(fy => (this.FeeTypes = fy));
      this.shareddata.CurrentSection.subscribe(fy => (this.Sections = fy));
      var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
        if (data.value) this.Classes = [...data.value]; else this.Classes = [...data];
        this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
        this.GetMasterData();
      });
      this.GetStudentClass();
      this.getGeneralAccounts();
    }
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
    }

  }
  onBlur(row) {
    debugger;
    if (row.Amount == '' || row.Amount == null) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter amount.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else if (isNaN(row.Amount)) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter numeric only for amount.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    row.Amount = row.Amount == null ? 0 : +row.Amount;
    if (row.BaseAmountForCalc > 0)
      row.Balance = row.BaseAmountForCalc - +row.Amount;
    this.calculateTotal();
  }
  public calculateTotal() {
    debugger;
    if (this.MonthlyDueDetail.length > 0) {
      var _discountRemoved = this.MonthlyDueDetail.filter((f: any) => f.FeeName != this.DiscountText);
      this.TotalAmount = +_discountRemoved.reduce((accum, curr) => accum + +curr.Amount, 0).toFixed(2);

      this.Balance = _discountRemoved.reduce((accum, curr) => accum + +curr.Balance, 0);
      //this.Balance = this.OriginalAmountForCalc - this.TotalAmount;
      if (this.Balance < 0)
        this.Balance = 0;
    }
    else {
      this.TotalAmount = 0;
      this.Balance = 0;
    }
    return this.TotalAmount;
  }
  // getGeneralLedgers() {
  //   let list: List = new List();
  //   list.fields = [
  //     "GeneralLedgerId",
  //     "GeneralLedgerName",
  //     "AccountNatureId",
  //     "AccountGroupId"];
  //   list.PageName = "GeneralLedgers";
  //   list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.GeneralLedgers = [...data.value];
  //     })
  // }
  logourl = '';
  CustomerHeading: any[] = [];
  GetMasterData() {
    debugger;
    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Remarks = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARK1);
    //this.shareddata.CurrentFeeDefinitions.subscribe((f: any) => {
    //  this.FeeDefinitions = [...f];
    //  if (this.FeeDefinitions.length == 0) {
    this.contentservice.GetFeeDefinitions(this.FilterOrgSubOrg, 1).subscribe((d: any) => {
      this.FeeDefinitions = [...d.value];
      this.FeeDefinitions.forEach(feedefn => {
        var indx = this.Months.findIndex(m => m.MonthName == feedefn.FeeName);
        if (indx == -1)
          this.Months.push({ "MonthName": feedefn.FeeName, "val": feedefn.FeeDefinitionId });
      })
    })
    //  }
    //})
    this.Batches = this.tokenStorage.getBatches()!;;
    this.Locations = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.LOCATION);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.shareddata.CurrentFeeType.subscribe(f => this.FeeTypes = f);
    this.AccountNature = this.getDropDownData(globalconstants.MasterDefinitions.accounting.ACCOUNTNATURE);
    this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
    this.PaymentTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.FEEPAYMENTTYPE);
    this.PaymentTypeId = this.PaymentTypes.find(p => p.MasterDataName.toLowerCase() == "cash").MasterDataId;
    this.ReceiptHeading = this.getDropDownData(globalconstants.MasterDefinitions.school.RECEIPTHEADING);

    var imgobj = this.ReceiptHeading.find((f: any) => f.MasterDataName == 'img');
    if (imgobj) {
      this.logourl = imgobj.Description;
    }
    this.ReceiptHeading = this.ReceiptHeading.filter(m => m.MasterDataName.toLowerCase() != 'img');
    this.ReceiptHeading.forEach(f => {
      f.MasterDataName = f.MasterDataName.replaceAll("''", "'");
      f.Description = f.Description ? JSON.parse("{" + f.Description + "}") : ''
    })
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
  getAccountingVoucher(pLedgerId) {

    //using the records for keeping track of balance which has feereceiptid=0
    let filterstr = this.FilterOrgSubOrg +
      " and FeeReceiptId eq 0 and LedgerId eq " + pLedgerId + " and Balance gt 0 and Active eq 1";
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "AccountingVoucherId",
      "LedgerId",
      "FeeReceiptId",
      "ShortText",
      "Reference",
      "BaseAmount",
      "Amount",
      "Balance",
      "Month",
      "ClassFeeId"
    ];
    list.PageName = this.AccountingVoucherListName;
    list.filter = [filterstr];
    return this.dataservice.get(list);
  }
  StudentAllFeeTypes: any = [];
  GetStudentClass() {
    debugger;
    if (!this.studentInfoTodisplay.StudentClassId) {
      this.contentservice.openSnackBar("Please define class for this student.", globalconstants.ActionText, globalconstants.RedBackground);
      this.nav.navigate(["/edu"]);
    }
    else {
      this.contentservice.getStudentClassWithFeeType(this.FilterOrgSubOrgBatchId, 0, 0, 0, this.studentInfoTodisplay.StudentClassId, 0)

        .subscribe((data: any) => {
          debugger;
          if (data.value.length > 0) {
            if (data.value[0].StudentFeeTypes.length == 0) {
              this.contentservice.openSnackBar("Fee Type not yet defined.", globalconstants.ActionText, globalconstants.RedBackground);
              //this.snackbar.open("Fee type not yet defined.",'Dimiss',{duration:10000});
              this.loading = false;
              this.PageLoading = false;
            }
            else {
              this.StudentAllFeeTypes = [];
              let _studdetail: any = this.Students.filter((s: any) => s.StudentId == data.value[0].StudentId)
              var _lastname = _studdetail[0].LastName ? " " + _studdetail[0].LastName : "";
              this.studentInfoTodisplay.AdmissionNo = data.value[0].AdmissionNo;
              this.studentInfoTodisplay.PID = _studdetail[0].PID;
              this.studentInfoTodisplay.ClassId = data.value[0].ClassId;
              this.studentInfoTodisplay.SectionId = data.value[0].SectionId;
              this.studentInfoTodisplay.SemesterId = data.value[0].SemesterId;

              this.studentInfoTodisplay.RollNo = data.value[0].RollNo;
              this.studentInfoTodisplay.StudentName = _studdetail[0].FirstName + _lastname;

              this.studentInfoTodisplay.Remarks = _studdetail[0].Remarks;
              data.value[0].StudentFeeTypes.forEach(item => {
                this.StudentAllFeeTypes.push({
                  FeeTypeId: item.FeeType.FeeTypeId,
                  FeeType: item.FeeType.FeeTypeName,
                  Formula: item.FeeType.Formula,
                  IsCurrent: item.IsCurrent,
                  FromMonth: item.FromMonth,
                  ToMonth: item.ToMonth
                })
              })
              this.StudentAllFeeTypes = this.StudentAllFeeTypes.sort((a, b) => b.FromMonth - a.FromMonth);
              let objfeetype = this.StudentAllFeeTypes.find(c => c.IsCurrent)
              if (objfeetype)
                this.studentInfoTodisplay.StudentFeeType = objfeetype.FeeType;
              else
                this.studentInfoTodisplay.StudentFeeType = this.StudentAllFeeTypes[0].FeeType;



              var _sectionName = '';
              var objsection = this.Sections.find(cls => cls.MasterDataId == data.value[0].SectionId)
              if (objsection)
                _sectionName = objsection.MasterDataName;

              this.studentInfoTodisplay.SectionName = _sectionName;
              var _semesterName = '';
              var objsemester = this.Semesters.find(cls => cls.MasterDataId == data.value[0].SemesterId)
              if (objsemester)
                _semesterName = objsemester.MasterDataName;

              this.studentInfoTodisplay.Semester = _semesterName;

              var clsObj = this.Classes.find(cls => cls.ClassId == this.studentInfoTodisplay.ClassId)
              if (clsObj)
                this.studentInfoTodisplay.StudentClassName = clsObj.ClassName;


              // var feeObj = this.FeeTypes.find((f: any) => {
              //   return f.FeeTypeId == this.studentInfoTodisplay.FeeTypeId
              // })
              // if (feeObj)
              //   this.studentInfoTodisplay.StudentFeeType = feeObj.FeeTypeName;
              this.StudentAllFeeTypes.forEach(f => {
                f.Formula = this.ApplyVariables(f.Formula);
              })
              //this.studentInfoTodisplay.Formula = this.ApplyVariables(this.studentInfoTodisplay.Formula);
              this.VariableObjList.push(this.studentInfoTodisplay);
              this.GetStudentFeePayment();
            }
          }
          else {
            this.contentservice.openSnackBar("No class defined for this student!", globalconstants.ActionText, globalconstants.RedBackground);

          }

        })
    }
  }
  GetStudentFeePayment() {
    debugger;

    if (this.studentInfoTodisplay.StudentId == 0) {
      this.nav.navigate(["/edu"]);
    }
    else {

      let list: List = new List();
      list.fields = [
        "LedgerId",
        "StudentClassId",
        "Month",
        "MonthDisplay",
        "BaseAmount",
        "GeneralLedgerId",
        "TotalDebit",
        "TotalCredit",
        "Balance",
        "OrgId",
        "BatchId",
        "Active"]
      list.PageName = this.AccountingLedgerTrialBalanceListName;
      //list.lookupFields = ["StudentClass", "PaymentDetails"];
      list.filter = ["StudentClassId eq " + this.studentInfoTodisplay.StudentClassId + " and Active eq 1"];
      //list.orderBy = "ParentId";

      this.dataservice.get(list)
        .subscribe((data: any) => {
          //debugger;

          this.ExistingStudentLedgerList = [...data.value];

          this.GetClassFee();

        });
    }
  }

  GetClassFee() {
    debugger;
    if (!this.studentInfoTodisplay.ClassId || this.SelectedBatchId == 0) {
      //this.alert.error('Invalid Id', this.optionsNoAutoClose);
      this.contentservice.openSnackBar("Invalid Id", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let filterstr = this.FilterOrgSubOrgBatchId + " and ClassId eq " + this.studentInfoTodisplay.ClassId;// + " and Active eq 1";

    let list: List = new List();
    list.fields = [
      "ClassFeeId",
      "FeeDefinitionId",
      "ClassId",
      "SectionId",
      "SemesterId",
      "Amount",
      "BatchId",
      "Month",
      "MonthDisplay",
      "Active",
      "LocationId",
      "PaymentOrder"
    ];
    list.PageName = "ClassFees";
    list.lookupFields = ["FeeDefinition($select=FeeCategoryId,FeeSubCategoryId,FeeName,AmountEditable)"];
    //list.orderBy = "Month";
    list.filter = [filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;

        if (data.value.length > 0) {
          let result: any[] = [];
          result = data.value.filter((f: any) => f.SectionId == this.studentInfoTodisplay.SectionId
            && f.SemesterId == this.studentInfoTodisplay.SemesterId);
          if (result.length == 0) {
            result = [...data.value];
          }
          result = result.sort((a, b) => a.MonthDisplay - b.MonthDisplay);
          let _sectionName = '', _semesterName = '', remark1 = '', remark2 = '';
          let _sectionObj = this.Sections.find(cat => cat.MasterDataId == this.studentInfoTodisplay.SectionId);
          if (_sectionObj)
            _sectionName = _sectionObj.MasterDataName;

          let _semesterObj = this.Semesters.find(cat => cat.MasterDataId == this.studentInfoTodisplay.SemesterId);
          if (_semesterObj) {
            _semesterName = _semesterObj.MasterDataName;
          }
          let _className = ''
          let clsobj = this.Classes.find(c => c.ClassId == this.studentInfoTodisplay.ClassId);
          if (clsobj)
            _className = clsobj.ClassName;
          let _student = this.Students.find(s => s.StudentId === this.studentInfoTodisplay.StudentId);
          if (_student) {
            remark1 = _student.Remark1;
            remark2 = _student.Remark2;
          }
          this.StudentClassFees = result.map(studclsfee => {
            //f.FeeName = this.FeeDefinitions.filter(n => n.FeeDefinitionId == f.FeeDefinitionId)[0].FeeName;
            var catObj = this.FeeCategories.find(cat => cat.MasterDataId == studclsfee.FeeDefinition.FeeCategoryId);
            var subcatObj = this.allMasterData.find(cat => cat.MasterDataId == studclsfee.FeeDefinition.FeeSubCategoryId);

            var catName = '';
            if (catObj)
              catName = catObj.MasterDataName
            var subcatName = '';
            if (subcatObj)
              subcatName = subcatObj.MasterDataName
            studclsfee.ClassName = _className;
            studclsfee.FeeCategoryId = studclsfee.FeeDefinition.FeeCategoryId;
            studclsfee.FeeCategory = catName;
            studclsfee.FeeSubCategory = subcatName;
            studclsfee.FeeName = studclsfee.FeeDefinition.FeeName;
            studclsfee.Section = _sectionName;
            studclsfee.Semester = _semesterName;
            studclsfee.Remark1 = remark1;
            studclsfee.Remark2 = remark2;
            studclsfee.AmountEditable = studclsfee.FeeDefinition.AmountEditable;
            if (studclsfee.MonthDisplay == 0)
              studclsfee.MonthName = studclsfee.FeeName;
            else {
              let _monthObj = this.Months.find(m => m.val == studclsfee.MonthDisplay)
              if (_monthObj)
                studclsfee.MonthName = _monthObj.MonthName;
              else
                studclsfee.MonthName = '';
            }
            return studclsfee;
          }).sort((a, b) => a.FeeCategoryId - b.FeeCategoryId);

          let itemcount = 1;
          this.StudentLedgerList = [];
          this.StudentClassFees.forEach((studentClassFee) => {
            //either class fee is active or already paid are shown.
            let existing = this.ExistingStudentLedgerList.filter(fromdb => fromdb.MonthDisplay == studentClassFee.MonthDisplay
              && (studentClassFee.Active == 1 || fromdb.TotalDebit > fromdb.Balance))
            existing = existing.filter(level2 => !(level2.BaseAmount > 0 && level2.Balance == 0 && level2.TotalCredit == 0 && level2.TotalDebit == 0))
            if (existing.length > 0) {
              var alreadyAdded = this.StudentLedgerList.filter((f: any) => f.MonthDisplay == studentClassFee.MonthDisplay)
              if (alreadyAdded.length == 0)
                existing.forEach(exitem => {
                  //itemcount += 1;
                  this.StudentLedgerList.push({
                    SlNo1: itemcount++,
                    LedgerId: exitem.LedgerId,
                    StudentClassId: exitem.StudentClassId,
                    Month: exitem.Month,
                    MonthDisplay: exitem.MonthDisplay,
                    BaseAmount1: exitem.BaseAmount,
                    TotalDebit: exitem.TotalDebit,
                    TotalCredit: +exitem.TotalCredit,
                    GeneralLedgerId: exitem.GeneralLedgerId,
                    Balance1: exitem.Balance,
                    MonthName: studentClassFee.MonthName,
                    FeeCategory: studentClassFee.FeeCategory,
                    FeeSubCategory: studentClassFee.FeeSubCategory,
                    PaymentOrder: studentClassFee.PaymentOrder,
                    BatchId: exitem.BatchId,
                    Action: false
                  })
                })
            }

          })
        }
        else {
          this.StudentLedgerList = [];
          this.contentservice.openSnackBar("Fees not defined for this class", globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.StudentLedgerList = this.StudentLedgerList.filter((f: any) => f.MonthName != 'Discount')
        this.StudentLedgerList.forEach(d => {
          if (d.TotalDebit == 0) {
            d.TotalCredit = 0;
            d.Balance1 = 0;

          }
        })
        this.StudentLedgerList.sort((a, b) => a.PaymentOrder - b.PaymentOrder);
        ////console.log("this.StudentLedgerList", this.StudentLedgerList)
        this.dataSource = new MatTableDataSource<ILedger>(this.StudentLedgerList);
        this.loading = false;
        this.PageLoading = false;
      })
  }
  ApplyVariables(formula) {
    var filledVar = formula;
    //console.log("formula", formula)
    //console.log("this.VariableObjList", this.VariableObjList);
    this.VariableObjList.forEach(m => {
      Object.keys(m).forEach(f => {
        if (filledVar.includes(f)) {
          if (typeof m[f] != 'number')
            filledVar = filledVar.replaceAll("[" + f + "]", "'" + m[f] + "'");
          else
            filledVar = filledVar.replaceAll("[" + f + "]", m[f]);
        }
      });
    })
    return filledVar;
  }
  PrintTypeThermal = true;
  SetPrintType(event) {
    this.PrintTypeThermal = event.checked;
  }
  SelectRow(row, event) {
    debugger;
    var _newCount = 0;
    if (event.checked || row.BaseAmount1 == 0) {
      var previousBalanceMonthObj = this.StudentLedgerList.filter((f: any) => f.MonthDisplay < row.MonthDisplay && +f.Balance1 > 0);
      var MonthSelected: any[] = [];

      //checking if previous balance exist
      if (previousBalanceMonthObj.length > 0) {
        MonthSelected = this.MonthlyDueDetail.filter((f: any) => f.MonthDisplay == previousBalanceMonthObj[0].MonthDisplay)
        if (MonthSelected.length == 0 && this.MonthlyDueDetail.length > 0)//means not selected yet
        {
          row.Action = false;
          this.contentservice.openSnackBar("Previous balance must be cleared first.", globalconstants.ActionText, globalconstants.RedBackground);
          return;
        }
      }
      row.Action = true;
      var DiscountrowIndxToDelete = this.MonthlyDueDetail.findIndex(f => f.FeeName == this.DiscountText);
      if (DiscountrowIndxToDelete > -1)
        this.MonthlyDueDetail.splice(DiscountrowIndxToDelete, 1);

      //var _generalAccountObj = this.GeneralLedgerAccounts.filter((f:any) => f.StudentClassId == this.studentInfoTodisplay.StudentClassId)
      var _generalAccountObj = this.GeneralLedgerAccounts.filter((f: any) => f.GeneralLedgerName.toLowerCase() == "tuition fee")

      if (_generalAccountObj.length > 0)
        this.TuitionFeeLedgerId = _generalAccountObj[0].GeneralLedgerId;
      // .GeneralLedgerAccountId =_discountAccountId;

      //this means balance payment
      if (row.TotalDebit > 0 && row.TotalDebit != row.Balance1) {
        this.getAccountingVoucher(row.LedgerId).subscribe((data: any) => {
          ////console.log("data.value", data.value);
          let latestReceipt = data.value.sort((a, b) => b.AccountingVoucherId - a.AccountingVoucherId);
          if (latestReceipt.length > 0)
          //latestReceipt.forEach((accVoucher, indx) => 
          {
            var _feeName = '';
            var obj = this.StudentClassFees.find((f: any) => f.ClassFeeId == latestReceipt[0].ClassFeeId);
            if (obj) {

              _feeName = obj.FeeName;

              this.MonthlyDueDetail.push({
                SlNo: 1,
                AccountingVoucherId: latestReceipt[0].AccountingVoucherId,
                PostingDate: latestReceipt[0].PostingDate,
                Reference: latestReceipt[0].Reference,
                LedgerId: row.LedgerId,
                GeneralLedgerAccountId: this.TuitionFeeLedgerId,
                Debit: false,
                BaseAmount: latestReceipt[0].Balance,
                FeeName: _feeName,
                FeeCategory: obj.FeeCategory,
                FeeSubCategory: obj.FeeSubCategory,
                BaseAmountForCalc: latestReceipt[0].Balance,
                FeeAmount: latestReceipt[0].Amount,
                Amount: latestReceipt[0].Balance,
                Balance: 0,
                PaymentOrder: obj.PaymentOrder,
                MonthDisplay: latestReceipt[0].Month,
                //MonthDisplay: latestReceipt[0].MonthDisplay,
                ClassFeeId: latestReceipt[0].ClassFeeId,
                AmountEditable: obj.AmountEditable,
                ShortText: '',
                BalancePayment: true,
                OrgId: this.LoginUserDetail[0]["orgId"],
                SubOrgId: this.SubOrgId,
                Active: 1,
                Action: true
              })
            }//if (obj.length > 0) {
          }//data.value.forEac

          this.miscelenous();
          // this.loading = false; this.PageLoading = false;
          // ////console.log("this.MonthlyDueDetail", this.MonthlyDueDetail);
          // this.billdataSource = new MatTableDataSource<IPaymentDetail>(this.MonthlyDueDetail);
          // this.calculateTotal();
        })//this.getAccountingVoucher(
      }
      else {
        var SelectedMonthFees = this.StudentClassFees.filter((f: any) => (f.MonthDisplay == row.MonthDisplay || f.MonthDisplay == 0)
          && f.Active == 1);
        debugger;
        SelectedMonthFees = SelectedMonthFees.sort((a, b) => b.MonthDisplay - a.MonthDisplay);
        var AmountAfterFormulaApplied = 0;
        //console.log("SelectedMonthFees",SelectedMonthFees);

        SelectedMonthFees.forEach((f, indx) => {

          this.VariableObjList.push(f);
          // var withoutTaxOrDiscount = this.MonthlyDueDetail.filter(x => x.FeeName != 'Discount' && x.FeeCategory != 'Tax')
          // this.CurrentTotalAmount = withoutTaxOrDiscount.reduce((acc, current) => acc + current.Amount, 0);
          this.CurrentTotalAmount = globalconstants.getCurrentTotalAmount(this.MonthlyDueDetail);
          //var myFormula = this.studentInfoTodisplay.Formula.replaceAll("[CurrentTotalAmount]", this.CurrentTotalAmount + "");
          let _feeTypeForthisMonth = this.StudentAllFeeTypes.find(ft => f.Month >= ft.FromMonth && f.Month <= ft.ToMonth);
          if (!_feeTypeForthisMonth)
            _feeTypeForthisMonth = this.StudentAllFeeTypes.find(ft => ft.FromMonth == 0 && ft.ToMonth == 0);

          if (!_feeTypeForthisMonth) {
            this.contentservice.openSnackBar("Fee type not defined.", globalconstants.ActionText, globalconstants.RedBackground);
            return;
          }
          var formula = this.ApplyVariables(_feeTypeForthisMonth.Formula);
          this.VariableObjList.splice(this.VariableObjList.indexOf(f), 1);
          AmountAfterFormulaApplied = evaluate(formula).toFixed(2);
          if (f.FeeName.includes('%')) {
            AmountAfterFormulaApplied = +(this.CurrentTotalAmount * (AmountAfterFormulaApplied / 100)).toFixed(2);
          }
          //AmountAfterFormulaApplied = +AmountAfterFormulaApplied.toFixed(2);
          //   f.Amount = AmountAfterFormulaApplied;
          var alreadyadded = this.MonthlyDueDetail.find(x => x.FeeName == f.FeeName)
          if (alreadyadded) {
            alreadyadded.Amount += +AmountAfterFormulaApplied
          }
          else {
            _newCount += 1;
            this.MonthlyDueDetail.push({
              SlNo: _newCount,
              AccountingVoucherId: 0,
              PostingDate: new Date(),
              Reference: row.Reference,
              LedgerId: row.LedgerId,
              GeneralLedgerAccountId: this.TuitionFeeLedgerId,
              Debit: false,
              FeeName: f.FeeName,
              FeeCategory: f.FeeCategory,
              FeeSubCategory: f.FeeSubCategory,
              FeeAmount: f.Amount,
              BaseAmount: f.Amount,
              PaymentOrder: f.PaymentOrder,
              BaseAmountForCalc: +AmountAfterFormulaApplied,
              Amount: +AmountAfterFormulaApplied < 0 ? 0 : +AmountAfterFormulaApplied,
              BalancePayment: false,
              Balance: 0,
              Month: row.Month,
              MonthDisplay: row.MonthDisplay,
              ClassFeeId: f.ClassFeeId,
              AmountEditable: f.AmountEditable,
              ShortText: '',
              OrgId: this.LoginUserDetail[0]["orgId"],
              SubOrgId: this.SubOrgId,
              Active: 1,
              Action: true
            })
          }
        })
        //this.MonthlyDueDetail = this.MonthlyDueDetail.sort((a, b) => a.PaymentOrder - b.PaymentOrder)
        ////console.log("this.MonthlyDueDetail", this.MonthlyDueDetail)
        this.miscelenous();
      }//if (row.TotalDebit>0 && row.TotalDebit != row.Balance) 
      this.MonthlyDueDetail = this.MonthlyDueDetail.filter(f => f.FeeName != '');
      if (row.BaseAmount == 0)
        event.checked = false;
    }
    else {
      //debugger;
      _newCount--;
      var toDelete = this.MonthlyDueDetail.filter((f: any) => f.MonthDisplay == row.MonthDisplay && f.FeeName != 'Discount');
      toDelete.forEach(d => {
        var indx = this.MonthlyDueDetail.indexOf(d);
        this.MonthlyDueDetail.splice(indx, 1);
      })
      //  this.calculateTotal();
      row.Action = false;
      this.loading = false;
      this.miscelenous();
    }
  }
  remove(row) {
    debugger;
    var toDelete = this.MonthlyDueDetail.filter((f: any) => f.SlNo == row.SlNo && f.FeeName != 'Discount');
    toDelete.forEach(d => {
      var indx = this.MonthlyDueDetail.indexOf(d);
      this.MonthlyDueDetail.splice(indx, 1);
    })
    //  this.calculateTotal();
    row.Action = false;
    this.loading = false;
    this.miscelenous();
    this.calculateTotal();
  }
  miscelenous() {

    //calculating discount amount
    var _rowWithoutDiscount = this.MonthlyDueDetail.filter((f: any) => f.FeeName != 'Discount' && !f.FeeName.includes('%'));
    this.DiscountAmount = _rowWithoutDiscount.reduce((accum, curr) => accum + (curr.BaseAmount - +curr.Amount), 0);
    var _discountAccountId = 0;
    var _obj = this.GeneralLedgerAccounts.find((f: any) => f.GeneralLedgerName == this.DiscountText + " Allowed")
    if (_obj)
      _discountAccountId = _obj.GeneralLedgerId;

    var DiscountRow = this.MonthlyDueDetail.find((f: any) => f.FeeName == this.DiscountText);

    if (!DiscountRow && this.DiscountAmount > 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please define discount in feedefinition.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      if (this.DiscountAmount > 0) {

        DiscountRow.BaseAmount = this.DiscountAmount;
        DiscountRow.Debit = true;
        DiscountRow.SlNo = +100;
        DiscountRow.StudentClassId = this.studentInfoTodisplay.StudentClassId;
        DiscountRow.GeneralLedgerAccountId = _discountAccountId;
      }
      else {
        //if discount amount is equal to zero, remove discount row.
        var discountRowToDelete = this.MonthlyDueDetail.filter((f: any) => f.FeeName == this.DiscountText);
        for (let row = 0; row < discountRowToDelete.length; row++) {
          var indx = this.MonthlyDueDetail.findIndex(x => x.FeeName == this.DiscountText);
          this.MonthlyDueDetail.splice(indx, 1);
        }
      }
    }


    //this.MonthlyDueDetail = this.MonthlyDueDetail.sort((a, b) => a.Amount - b.Amount);
    //this.MonthlyDueDetail = this.MonthlyDueDetail.sort((a, b) => a.PaymentOrder - b.PaymentOrder);
    //console.log("this.MonthlyDueDetail ", this.MonthlyDueDetail)
    this.MonthlyDueDetail.forEach((row, indx) => {
      row.SlNo = indx + 1;
    });
    this.calculateTotal();
    this.loading = false;
    this.PageLoading = false;
    this.billdataSource = new MatTableDataSource<IPaymentDetail>(this.MonthlyDueDetail);
  }
  billpayment() {
    debugger;
    var error: any[] = [];

    //checking within selected items
    this.StudentLedgerData.LedgerId = 0;
    var sortedbyMonth = this.MonthlyDueDetail.sort((a, b) => a.SlNo - b.SlNo);

    for (var i = 0; i < sortedbyMonth.length; i++) {
      if (sortedbyMonth[i].Balance > 0) {

        //f.Amount != 0 means paying some amount
        //f.BaseAmount!=0 means, dont check which amount are not set ex. misc.
        var Unpaid = sortedbyMonth.filter((f: any) => f.BaseAmount != 0 && f.Amount != 0 && f.SlNo > sortedbyMonth[i].SlNo)
        if (Unpaid.length > 0) {
          error.push({ "FeeName": sortedbyMonth[i].FeeName, "Next": Unpaid[0].FeeName });
          break;
        }
      }
    }
    //ends checking within selected items

    //checking between months
    var _currentPaymentOrder = Math.max.apply(Math, this.MonthlyDueDetail.map(function (o) { return o.PaymentOrder; }));
    var previousBalanceMonthObj: any[] = [];
    previousBalanceMonthObj = this.StudentLedgerList.filter((f: any) => f.PaymentOrder > 0 && f.PaymentOrder < _currentPaymentOrder && +f.Balance1 > 0);
    var MonthSelected: any[] = [];
    if (previousBalanceMonthObj.length > 0) {
      previousBalanceMonthObj.forEach(p => {
        MonthSelected = this.MonthlyDueDetail.filter((f: any) => f.MonthDisplay == p.MonthDisplay)
        if (MonthSelected.length == 0)//means not selected yet
          error.push({ "FeeName": p.MonthName, "Next": '' });
      })
    }
    //ends checking between months

    if (this.PaymentTypeId == 0) {
      this.contentservice.openSnackBar("Please select payment type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (error.length > 0) {
      this.contentservice.openSnackBar("Previous " + error[0].FeeName + " must be cleared first before paying " + error[0].Next + ".", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      var howmanymonthSelected = alasql("select Month,COUNT(Month) as [Count] from ? GROUP BY Month", [this.MonthlyDueDetail]);
      //var monthgreaterthanOne = howmanymonthSelected.filter((f:any)=>f.Count>1);

      if (howmanymonthSelected.length > 1 && this.Balance > 0) {
        this.contentservice.openSnackBar("Previous balance must be cleared first before the next month fee payment.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
      else {
        this.loading = true;
        this.UpdateOrSave();
      }
    }

  }
  UpdateOrSave() {
    debugger;

    if (this.StudentLedgerData.LedgerId == 0)
      this.insert();
    else
      this.update();

  }
  SetReference(rowtxt) {
    debugger;
    var reference = '';
    if (rowtxt.length > 0) {
      var matches = rowtxt.replaceAll(' ', '').substr(0, 10) //.match(/\b(\w)/g);
      reference = matches.join('') + moment(new Date()).format('YYYYMMDDHHmmss');
    }
    return reference;
  }
  insert() {
    debugger;
    var list = new List();
    list.fields = ["ReceiptNo"];
    list.PageName = this.FeeReceiptListName;
    var _adjustedAccountId = this.paymentform.get("GeneralLedgerAccountId")?.value.GeneralLedgerId
    if (!_adjustedAccountId)
      _adjustedAccountId = 0;

    this.studentInfoTodisplay.ReceiptNo = this.StudentReceiptData.ReceiptNo;
    this.StudentReceiptData.StudentFeeReceiptId = 0;
    this.StudentReceiptData.TotalAmount = +this.TotalAmount;
    this.StudentReceiptData.PaymentTypeId = +this.PaymentTypeId;
    this.StudentReceiptData.BatchId = this.SelectedBatchId;
    this.StudentReceiptData.OrgId = this.LoginUserDetail[0]["orgId"];
    this.StudentReceiptData.SubOrgId = this.SubOrgId;
    this.StudentReceiptData.StudentClassId = this.studentInfoTodisplay.StudentClassId;
    this.StudentReceiptData.ClassId = this.studentInfoTodisplay.ClassId;
    this.StudentReceiptData.SectionId = this.studentInfoTodisplay.SectionId;
    this.StudentReceiptData.SemesterId = this.studentInfoTodisplay.SemesterId;
    this.StudentReceiptData.AdjustedAccountId = _adjustedAccountId;

    this.StudentReceiptData.Balance = this.Balance;
    this.StudentReceiptData.Active = 1;
    this.StudentReceiptData.OffLineReceiptNo = this.OffLineReceiptNo;
    this.StudentReceiptData.Discount = 0;
    this.StudentReceiptData.CreatedBy = this.LoginUserDetail[0]["userId"];
    //this.StudentReceiptData.CreatedDate = new Date();

    this.FeePayment.StudentFeeReceipt = this.StudentReceiptData;
    //console.log("this.StudentReceiptData", this.StudentReceiptData)
    var SelectedMonths = this.StudentLedgerList.filter((f: any) => f.Action)
    //this.FeePayment.LedgerAccount["AccountingVoucher"] :any[]= [];
    this.FeePayment.AccountingVoucher = [];
    this.FeePayment.LedgerAccount = [];
    SelectedMonths.forEach(selectedMonthrowFromLedger => {
      var monthPayAmount = this.MonthlyDueDetail.filter((f: any) => f.MonthDisplay == selectedMonthrowFromLedger.MonthDisplay)
      var monthAmountFromClassFee = monthPayAmount.reduce((acc, item) => {
        return acc + item.Amount;
      }, 0)

      this.StudentLedgerData.LedgerId = selectedMonthrowFromLedger.LedgerId;
      this.StudentLedgerData.Active = 1;
      //this.StudentLedgerData.GeneralLedgerId = 0;//StudentFeeLedgerNameId;// row.AccountGroupId;
      this.StudentLedgerData.BatchId = this.SelectedBatchId;
      this.StudentLedgerData.ClassId = this.studentInfoTodisplay.ClassId;
      this.StudentLedgerData.SemesterId = this.studentInfoTodisplay.SemesterId;
      this.StudentLedgerData.SectionId = this.studentInfoTodisplay.SectionId;

      this.StudentLedgerData.Balance = this.Balance;
      this.StudentLedgerData.Month = selectedMonthrowFromLedger.Month;
      this.StudentLedgerData.MonthDisplay = selectedMonthrowFromLedger.MonthDisplay;
      this.StudentLedgerData.StudentClassId = selectedMonthrowFromLedger.StudentClassId;
      this.StudentLedgerData.OrgId = this.LoginUserDetail[0]["orgId"];
      this.StudentLedgerData.SubOrgId = this.SubOrgId;
      this.StudentLedgerData.TotalCredit = monthAmountFromClassFee;

      this.FeePayment.LedgerAccount.push(JSON.parse(JSON.stringify(this.StudentLedgerData)));

      var monthPaydetail = this.MonthlyDueDetail.filter((f: any) => f.MonthDisplay == selectedMonthrowFromLedger.MonthDisplay)

      var _AccountReceivableId = 0;
      var _obj = this.GeneralLedgerAccounts.filter((f: any) => f.GeneralLedgerName == "Account Receivable");
      if (_obj.length > 0)
        _AccountReceivableId = _obj[0].GeneralLedgerId;
      monthPaydetail.forEach((paydetail) => {

        //amounteditable is used in middle ware.
        if (paydetail.ShortText.length == 0 && paydetail.AmountEditable != 1) {
          paydetail.ShortText = "Empty";
          paydetail.Reference = "NotAmountEditable";
        }

        paydetail.LedgerId = selectedMonthrowFromLedger.LedgerId;
        this.FeePayment.AccountingVoucher.push(
          {
            "AccountingVoucherId": paydetail.AccountingVoucherId,
            "Month": paydetail.MonthDisplay,
            "ClassFeeId": paydetail.ClassFeeId,
            "BaseAmount": paydetail.BaseAmount,
            "Amount": paydetail.Amount,
            "Balance": paydetail.Balance,
            "FeeReceiptId": 0,
            "Debit": paydetail.Debit,
            "GeneralLedgerAccountId": paydetail.GeneralLedgerAccountId,
            "LedgerId": selectedMonthrowFromLedger.LedgerId,
            "ShortText": paydetail.ShortText,
            "Reference": '',
            "Active": 1,
            "OrgId": this.LoginUserDetail[0]["orgId"],
            "SubOrgId": this.SubOrgId,
            "CreatedDate": this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
            "DocDate": this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
            "PostingDate": this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
            "CreatedBy": this.LoginUserDetail[0]["userId"],
          });

        if (paydetail.Balance > 0) {
          //account receivable
          this.FeePayment.AccountingVoucher.push(
            {
              "AccountingVoucherId": 0,
              "ClassFeeId": 0,
              "BaseAmount": paydetail.Balance,
              "Amount": paydetail.Balance,
              "Month": paydetail.MonthDisplay,
              "Balance": 0,
              "FeeReceiptId": 0,
              "Debit": paydetail.BalancePayment ? false : true,
              "GeneralLedgerAccountId": _AccountReceivableId,
              "LedgerId": 0,
              "Reference": paydetail.Reference,
              "ShortText": paydetail.ShortText,
              "Active": 1,
              "OrgId": this.LoginUserDetail[0]["orgId"],
              "SubOrgId": this.SubOrgId,
              "CreatedDate": this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
              "DocDate": this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
              "PostingDate": this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
              "CreatedBy": this.LoginUserDetail[0]["userId"],
            });
        }
        ////console.log("this.FeePayment.AccountingVoucher", this.FeePayment);
      });
    })

    ////console.log("this.FeePayment", this.FeePayment);
    this.dataservice.postPatch(this.FeeReceiptListName, this.FeePayment, 0, 'post')
      .subscribe((data: any) => {
        this.StudentReceiptData.StudentFeeReceiptId = data.StudentFeeReceiptId;
        this.loading = false; this.PageLoading = false;
        this.MonthlyDueDetail = [];
        this.billdataSource = new MatTableDataSource();

        let studIndex = this.Students.findIndex(s => s.StudentId == this.studentInfoTodisplay.StudentId);
        this.Students[studIndex].StudentClasses[0].Admitted = true;
        this.tokenStorage.saveStudents(this.Students);
        this.contentservice.openSnackBar("Payment done successfully!", globalconstants.ActionText, globalconstants.BlueBackground);
        this.tabChanged(1);
      })
  }
  update() {

    this.dataservice.postPatch(this.AccountingLedgerTrialBalanceListName, this.StudentLedgerData, this.StudentLedgerData.LedgerId, 'patch')
      .subscribe(
        (data: any) => {
          // let paymentdetail = {
          //   PaymentAmt: this.studentInfoTodisplay.PayAmount.toString(),
          //   PaymentDate: new Date(),
          //   ParentId: this.StudentFeePaymentData.StudentFeeId,
          //   ClassFeeId: +this.StudentFeePaymentData.ClassFeeId
          // }

        });
  }

  pad(num: number, size: number): string {
    let s = num + "";
    var year = (new Date().getFullYear() + '').substr(2, 2)
    while (s.length < size - 2) s = "0" + s;
    return year + s;
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  Receipt() {
    this.nav.navigate(['/edu/printreceipt/' + this.studentInfoTodisplay.StudentId]);
  }


  back() {
    this.nav.navigate(['/edu']);
  }
  validate(value) {
    value = "";
  }
  enableAction(element, amount) {
    //debugger;
    if (amount.length == 0)
      element.Pay = 0.00;
    else
      element.Pay = amount;

    this.studentInfoTodisplay.PayAmount = element.Pay;

  }
  tabChanged(tabChangeEvent: number) {
    this.selectedIndex = tabChangeEvent;
    this.navigateTab(this.selectedIndex);
    //   ////console.log('tab selected: ' + tabChangeEvent);
  }
  public nextStep() {
    this.selectedIndex += 1;
    this.navigateTab(this.selectedIndex);
  }

  public previousStep() {
    this.selectedIndex -= 1;
    this.navigateTab(this.selectedIndex);
  }
  navigateTab(indx) {
    switch (indx) {
      case 0:
        this.PageLoad();
        break;
      case 1:
        this.receipt.PageLoad();
        break;
      default:
        this.PageLoad();
        break;
    }
  }
}
//////////////////////////////////////////////
//}
export interface ILedger {
  SlNo1: number,
  LedgerId: number;
  StudentClassId: number;
  Month: number;
  MonthDisplay: number;
  MonthName: string;
  FeeCategory: string;
  FeeSubCategory: string;
  GeneralLedgerId: number;
  BaseAmount1: number;
  TotalDebit: number;
  TotalCredit: number;
  Balance1: number;
  PaymentOrder: number;
  BatchId: number;
  Action: boolean;
}
export interface IPaymentDetail {
  PaymentId: number;
  PaymentAmt: number;
  PaymentDate: Date;
  ParentId: number;
  ClassFeeId: number;
  OrgId: number; SubOrgId: number;
  Active: number;
}
export interface IGeneralLedger {
  GeneralLedgerId: number;
  GeneralLedgerName: string;
  AccountNatureId: number;
  AccountGroupId: number;
  AccountSubGroupId: number;
  StudentClassId: number;
  EmployeeId: number;
}

