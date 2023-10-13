import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ContentService } from '../../../../shared/content.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { NaomitsuService } from '../../../../shared/databaseService';
import { globalconstants } from '../../../../shared/globalconstant';
import { List } from '../../../../shared/interface';
import { SharedataService } from '../../../../shared/sharedata.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-feereceipt',
  templateUrl: './feereceipt.component.html',
  styleUrls: ['./feereceipt.component.scss'],
})
export class FeereceiptComponent implements OnInit {
  PageLoading = true;
  @Input("BillDetail") BillDetail: any[];
  @Input("StudentClass") studentInfoTodisplay: any;
  @Input("OffLineReceiptNo") OffLineReceiptNo: any;
  @Input("StudentClassFees") StudentClassFees: any;
  @ViewChild(MatSort) sort: MatSort;
  Defaultvalue = 0;
  loading = false;
  CancelReceiptMode = false;
  LoginUserDetail: any[] = [];
  BillStatus = 0;
  CurrentBatchId = 0;
  ReceiptHeading: any[] = [];
  NewReceipt = true;
  Saved = false;
  PaymentIds: any[] = [];
  Sections: any[] = [];
  FeeDefinitions: any[] = [];
  Classes: any[] = [];
  Batches: any[] = [];
  Locations: any[] = [];
  clickPaymentDetails: any[] = [];
  ELEMENT_DATA: IStudentFeePaymentReceipt[];
  StudentFeeReceiptListName = 'StudentFeeReceipts';
  FeeReceipt: any[] = [];
  StudentFeePaymentList: any[];
  Students: string[];
  dataSource: MatTableDataSource<any>;
  dataReceiptSource: MatTableDataSource<IReceipt>;
  allMasterData: any[] = [];
  SelectedBatchId = 0;
  SubOrgId = 0;
  searchForm = new UntypedFormGroup({
    StudentId: new UntypedFormControl(0),
  });
  StudentFeePaymentData = {
    StudentId: 0,
    StudentFeeId: 0,
    StudentClassId: 0,
    ClassFeeId: 0,
    FeeAmount: 0,
    PaidAmt: "0.00",
    BalanceAmt: "0.00",
    PaymentDate: new Date(),
    Batch: 0,
    Remarks: '',
    Active: 1
  };
  Permission = '';
  OriginalAmountForCalc = 0;
  TotalAmount = 0;
  Balance = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  constructor(private servicework: SwUpdate, private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private shareddata: SharedataService,
    private contentservice: ContentService) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })

  }

  public calculateTotal() {

    if (this.BillDetail.length > 0) {
      this.TotalAmount = this.BillDetail.reduce((accum, curr) => accum + curr.Amount, 0);
      this.OriginalAmountForCalc = this.BillDetail.reduce((accum, curr) => accum + curr.BaseAmountForCalc, 0);
      this.Balance = this.OriginalAmountForCalc - this.TotalAmount;
    }

    return this.TotalAmount;
  }
  displayedColumns = [
    'index',
    'FeeName',
    'BaseAmount',
    'Amount',
    'Balance'
  ];
  ReceiptDisplayedColumns = [
    'ReceiptNo',
    'ReceiptDate',
    'TotalAmount',
    'PaymentType',
    'Active'
  ]
  CompanyName = '';
  PageLoad() {
    debugger;
    this.loading = true;
    //this.calculateTotal();
    //this.dataSource = new MatTableDataSource<any>(this.BillDetail);
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.FEEPAYMENT);
    if (perObj.length > 0) {
      this.Permission = perObj[0].permission;
    }
    if (this.Permission != 'deny') {
      this.TotalAmount = 0;
      this.Balance = 0;
      this.CompanyName = this.tokenStorage.getCompanyName()!;
      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
        this.Classes = [...data.value];
        this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
        var obj = this.Classes.filter((f: any) => f.ClassId == this.studentInfoTodisplay.ClassId)
        if (obj.length > 0)
          this.studentInfoTodisplay.StudentClassName = obj[0].ClassName;
      })
      //this.shareddata.CurrentBatch.subscribe(lo => (this.Batches = lo));
      this.Batches = this.tokenStorage.getBatches()!;;
      this.shareddata.CurrentSection.subscribe(pr => (this.Sections = pr));

      //this.studentInfoTodisplay.AdmissionNo = this.tokenStorage.getStudentId()!;;
      this.studentInfoTodisplay.StudentId = this.tokenStorage.getStudentId()!;;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.studentInfoTodisplay.StudentClassId = this.tokenStorage.getStudentClassId()!;
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.studentInfoTodisplay.OffLineReceiptNo = this.OffLineReceiptNo;
      this.studentInfoTodisplay.currentbatchId = this.SelectedBatchId;

      this.shareddata.CurrentFeeDefinitions.subscribe(b => (this.FeeDefinitions = b));
      debugger;
      this.GetMasterData();
      this.GetEmployees();

    }
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
    }
  }
  ReceivedBy = '';
  viewDetail(row) {
    debugger;
    this.ReceivedBy = row.ReceivedBy;
    this.clickPaymentDetails = this.StudentFeePaymentList.filter((f: any) => f.FeeReceiptId == row.StudentFeeReceiptId)
      .sort((a, b) => a.PaymentOrder - b.PaymentOrder);
    ////console.log("PaymentOrder", this.clickPaymentDetails)
    this.studentInfoTodisplay.StudentFeeReceiptId = row.StudentFeeReceiptId;
    this.studentInfoTodisplay.ReceiptNo = row.ReceiptNo;
    this.studentInfoTodisplay.OffLineReceiptNo = row.OffLineReceiptNo;
    this.studentInfoTodisplay.ReceiptDate = row.ReceiptDate;
    this.PaymentType = row.PaymentType;
    this.TotalAmount = row.TotalAmount;
    this.Balance = row.Balance == null ? 0 : row.Balance;
    this.BillStatus = row.Active;
    this.dataSource = new MatTableDataSource<any>(this.clickPaymentDetails);
  }
  CancelReceipt() {
    //debugger;
    this.loading = true;
    let receipt = {
      Active: 0
    }
    setTimeout(() => {

      this.dataservice.postPatch(this.StudentFeeReceiptListName, receipt, this.studentInfoTodisplay.StudentFeeReceiptId, 'patch')
        .subscribe(
          (data: any) => {
            this.loading = false; this.PageLoading = false;
            this.TotalAmount = 0;
            this.Balance = 0;
            this.CreateInvoice(this.studentInfoTodisplay.ClassId, this.studentInfoTodisplay.SemesterId, this.studentInfoTodisplay.SectionId, this.studentInfoTodisplay.StudentClassId, this.studentInfoTodisplay.FeeTypeId);
            // this.contentservice.openSnackBar("Receipt cancelled successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
            // this.CancelReceiptMode = false;
            // this.BillDetail = [];
            // this.dataSource = new MatTableDataSource<any>(this.BillDetail);
          });
    }, 500)
  }
  edit() {
    this.CancelReceiptMode = true;

  }
  done() {
    this.CancelReceiptMode = false;

  }
  CreateInvoice(pClassId, pSemesterId, pSectionId, pStudentClassId, pFeeTypeId) {
    debugger;
    this.loading = true;

    this.contentservice.GetClassFeeWithFeeDefinition(this.FilterOrgSubOrgBatchId, 0, pClassId)//,pSemesterId,pSectionId)
      .subscribe((datacls: any) => {

        var _clsfeeWithDefinitions: any = [];
        let items = datacls.value.filter(m => m.FeeDefinition.Active == 1 && m.SemesterId == pSemesterId && m.SectionId == pSectionId);
        if (items.length == 0) {
          _clsfeeWithDefinitions = datacls.value.filter(m => m.FeeDefinition.Active == 1);
        }
        else
          _clsfeeWithDefinitions = [...items];

        this.contentservice.getStudentClassWithFeeType(this.FilterOrgSubOrgBatchId, pClassId, pSemesterId, pSectionId, pStudentClassId, pFeeTypeId)
          .subscribe((data: any) => {
            var studentfeedetail: any[] = [];
            data.value.forEach(studcls => {
              var _feeName = '';
              var objClassFee = _clsfeeWithDefinitions.filter(def => def.ClassId == studcls.ClassId);
              var _className = '';
              var obj = this.Classes.filter(c => c.ClassId == studcls.ClassId);
              if (obj.length > 0)
                _className = obj[0].ClassName;

              objClassFee.forEach(clsfee => {
                var _category = '';
                var _subCategory = '';

                var objcat = this.FeeCategories.filter((f: any) => f.MasterDataId == clsfee.FeeDefinition.FeeCategoryId);
                if (objcat.length > 0)
                  _category = objcat[0].MasterDataName;

                var objsubcat = this.FeeCategories.filter((f: any) => f.MasterDataId == clsfee.FeeDefinition.FeeSubCategoryId);
                if (objsubcat.length > 0)
                  _subCategory = objsubcat[0].MasterDataName;

                var _formula = studcls.FeeType.Active == 1 ? studcls.FeeType.Formula : '';

                if (_formula.length > 0) {
                  _feeName = clsfee.FeeDefinition.FeeName;
                  studentfeedetail.push({
                    Month: clsfee.Month,
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
                    ClassName: _className
                  });
                }

              })
            })
            if (this.SubOrgId == 0) {
              this.contentservice.openSnackBar("SubOrgId cannot be zero.", globalconstants.ActionText, globalconstants.RedBackground);
              return;
            }
            else {
              ////console.log("studentfeedetailxxxx", studentfeedetail)
              this.contentservice.createInvoice(studentfeedetail, this.SelectedBatchId, this.LoginUserDetail[0]["orgId"], this.SubOrgId)
                .subscribe((data: any) => {
                  this.loading = false;

                  this.CancelReceiptMode = false;
                  this.BillDetail = [];
                  this.dataSource = new MatTableDataSource<any>(this.BillDetail);

                  var cancelledrow = this.FeeReceipt.filter(r => r.StudentFeeReceiptId == this.studentInfoTodisplay.StudentFeeReceiptId)
                  if (cancelledrow.length > 0)
                    cancelledrow[0].Active = 0;
                  this.dataReceiptSource = new MatTableDataSource(this.FeeReceipt);
                  this.contentservice.openSnackBar("Receipt cancelled successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
                  //    this.contentservice.openSnackBar("Invoice created successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
                },
                  error => {
                    this.loading = false;
                    //console.log("create invoice error", error);
                    this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage, globalconstants.ActionText, globalconstants.RedBackground);
                  })
            }
          })
      });

  }
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
        this.GetBills();
      })

  }
  Employees: any[] = [];
  PaymentType = '';
  GetBills() {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "StudentFeeReceiptId",
      "StudentClassId",
      "TotalAmount",
      "Balance",
      "ReceiptNo",
      "OffLineReceiptNo",
      "PaymentTypeId",
      "ReceiptDate",
      "Discount",
      "Active",
      "CreatedBy"
    ];

    list.PageName = "StudentFeeReceipts";
    // FeeReceiptId =0 means for balance updating purpose. LedgerId =0 means accounting purpose.
    list.lookupFields = ["AccountingVouchers($filter=FeeReceiptId gt 0 and LedgerId gt 0;$select=Reference,BaseAmount,Balance,AccountingVoucherId,ShortText,LedgerId,FeeReceiptId,Amount,ClassFeeId)"];
    list.filter = ["StudentClassId eq " + this.studentInfoTodisplay.StudentClassId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.FeeReceipt = [...data.value];
        this.StudentFeePaymentList = [];

        this.FeeReceipt.forEach(f => {

          var received = this.Employees.filter(e => e.UserId == f.CreatedBy);
          if (received.length > 0)
            f.ReceivedBy = received[0].ShortName;
          else
            f.ReceivedBy = '';

          f.AccountingVouchers.forEach(k => {
            var _ShortText = '';

            var feeObj = this.StudentClassFees.filter((f: any) => f.ClassFeeId == k.ClassFeeId);
            if (feeObj.length > 0) {
              if (k.ShortText && k.ShortText.length > 0 && feeObj[0].AmountEditable) {
                _ShortText = " (" + k.ShortText + ")"
              }
              k.FeeName = feeObj[0].FeeName + _ShortText;
              if (k.FeeName == 'Discount')
                k.indx = 1
              else
                k.indx = 0
              k.PaymentOrder = feeObj[0].PaymentOrder;
              this.StudentFeePaymentList.push(k);
            }
            // else
            //   k.FeeName = '';


            //k.BaseAmount = k.BaseAmount;
            //this.StudentFeePaymentList.push(k)
          })
          var paymentobj = this.PaymentTypes.filter(p => p.MasterDataId == f.PaymentTypeId);
          if (paymentobj.length > 0) {
            f.PaymentType = paymentobj[0].MasterDataName;
          }
        })
        this.calculateTotal();
        ////console.log("this.FeeReceipt", this.FeeReceipt)
        // this.FeeReceipt =this.FeeReceipt.filter(f=>f.FeeName!='');
        this.StudentFeePaymentList = this.StudentFeePaymentList.sort((a, b) => a.indx - b.indx);
        this.dataReceiptSource = new MatTableDataSource<any>(this.FeeReceipt);
        this.dataReceiptSource.sort = this.sort;
        var latestReceipt = this.FeeReceipt.sort((a, b) => b.ReceiptNo - a.ReceiptNo);
        if (latestReceipt.length > 0)
          this.viewDetail(latestReceipt[0]);

        this.loading = false; this.PageLoading = false;

      })
  }
  PaymentTypes: any[] = [];
  FeeCategories: any[] = [];
  GetMasterData() {
    this.loading = true;
    // let list: List = new List();
    // list.fields = [
    //   "MasterDataId",
    //   "MasterDataName",
    //   "Logic",
    //   "ParentId",
    //   "Description"];
    // list.PageName = "MasterItems";
    // list.filter = ["Active eq 1 and (MasterDataName eq 'Receipt Heading' or OrgId eq "+this.LoginUserDetail[0]["orgId"] + ")"];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    //debugger;
    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
    this.ReceiptHeading = this.getDropDownData(globalconstants.MasterDefinitions.school.RECEIPTHEADING);

    this.ReceiptHeading.forEach(f => {
      f.Description = f.Description ? JSON.parse("{" + f.Description + "}") : ''
    })
    ////console.log("this.ReceiptHeading",this.ReceiptHeading);
    this.PaymentTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.FEEPAYMENTTYPE);
    this.loading = false; this.PageLoading = false;
    //});

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
}
export interface IStudentFeePaymentReceipt {
  StudentReceiptId: number;
  Amount: number;
  OfflineReceiptNo: string;
  ReceiptDate: Date;
  StudentClassId: number;
  SlNo: number;
  FeeName: string;
}
export interface IReceipt {
  StudentReceiptId: number;
  TotalAmount: number;
  OffLineReceiptNo: string;
  ReceiptDate: Date;
  Active: number;
  Action: string;
}
