import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SwUpdate } from '@angular/service-worker';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss']
})
export class ReceiptComponent implements OnInit {

  PageLoading = true;
  @Input("BillDetail") BillDetail: any[];
  @Input("StudentClass") studentInfoTodisplay: any;
  @Input("OffLineReceiptNo") OffLineReceiptNo: any;
  @Input("StudentClassFees") StudentClassFees: any;
  @ViewChild(MatSort) sort: MatSort;

  loading = false;
  CancelReceiptMode = false;
  LoginUserDetail = [];
  BillStatus = 0;
  CurrentBatchId = 0;
  ReceiptHeading = [];
  NewReceipt = true;
  Saved = false;
  PaymentIds = [];
  Sections = [];
  FeeDefinitions = [];
  Classes = [];
  Batches = [];
  Locations = [];
  clickPaymentDetails = [];
  ELEMENT_DATA: IStudentFeePaymentReceipt[];
  StudentFeeReceiptListName = 'StudentFeeReceipts';
  FeeReceipt = [];
  StudentFeePaymentList: any[];
  Students: string[];
  dataSource: MatTableDataSource<any>;
  dataReceiptSource: MatTableDataSource<IReceipt>;
  allMasterData = [];
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
  //FilterOrgSubOrgBatchId = '';
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
    'MonthName',
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
      //this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.FilterOrgSubOrg = "OrgId eq 1 and SubOrgId eq " + globalconstants.globalAdminBillingSubOrgId;
      this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
        this.Classes = [...data.value];
        var obj = this.Classes.filter(f => f.ClassId == this.studentInfoTodisplay.ClassId)
        if (obj.length > 0)
          this.studentInfoTodisplay.StudentClassName = obj[0].ClassName;
      })
      //this.shareddata.CurrentBatch.subscribe(lo => (this.Batches = lo));
      this.Batches = this.tokenStorage.getBatches();
      this.shareddata.CurrentSection.subscribe(pr => (this.Sections = pr));

      //this.studentInfoTodisplay.AdmissionNo = this.tokenStorage.getStudentId();
      //this.studentInfoTodisplay.StudentId = this.tokenStorage.getStudentId();
      //this.SubOrgId = this.tokenStorage.getSubOrgId();
      //this.studentInfoTodisplay.StudentClassId = this.tokenStorage.getStudentClassId();
      //this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
      //this.studentInfoTodisplay.OffLineReceiptNo = this.OffLineReceiptNo;
      //this.studentInfoTodisplay.currentbatchId = this.SelectedBatchId;
     
      this.studentInfoTodisplay.StudentClassId = localStorage.getItem("TempStudentClassId");
      console.log("studentclassid",this.studentInfoTodisplay.StudentClassId);
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
    this.clickPaymentDetails = this.StudentFeePaymentList.filter(f => f.FeeReceiptId == row.StudentFeeReceiptId);
    this.studentInfoTodisplay.StudentFeeReceiptId = row.StudentFeeReceiptId;
    this.studentInfoTodisplay.ReceiptNo = row.ReceiptNo;
    this.studentInfoTodisplay.OffLineReceiptNo = row.OffLineReceiptNo;
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
            //this.CreateInvoice(this.studentInfoTodisplay.StudentClassId);
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

  GetEmployees() {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "EmpEmployeeId",
      "FirstName",
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
  Employees = [];
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
    //list.lookupFields = ["AccountingVouchers($filter=FeeReceiptId eq 0 and LedgerId gt 0 and ClassFeeId gt 0;$select=Reference,BaseAmount,Balance,AccountingVoucherId,ShortText,LedgerId,FeeReceiptId,Amount,ClassFeeId)"];
    list.lookupFields = ["AccountingVouchers($filter=FeeReceiptId gt 0 and LedgerId gt 0 and ClassFeeId gt 0;$select=Reference,BaseAmount,Balance,AccountingVoucherId,ShortText,LedgerId,FeeReceiptId,Amount,ClassFeeId)"];
    list.filter = ["StudentClassId eq " + this.studentInfoTodisplay.StudentClassId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeReceipt = [...data.value];
        this.StudentFeePaymentList = [];
        this.FeeReceipt.forEach(f => {

          var received = this.Employees.filter(e => e.UserId == f.CreatedBy);
          if (received.length > 0)
            f.ReceivedBy = received[0].FirstName;
          else
            f.ReceivedBy = '';

          f.AccountingVouchers.forEach(k => {
            var _ShortText = '';

            var feeObj = this.StudentClassFees.filter(f => f.ClassFeeId == k.ClassFeeId);
            if (feeObj.length > 0) {
              if (k.ShortText && k.ShortText.length > 0 && feeObj[0].AmountEditable) {
                _ShortText = " (" + k.ShortText + ")"
              }
              k.FeeName = feeObj[0].MonthName + _ShortText;
              if (k.FeeName == 'Discount')
                k.indx = 1
              else
                k.indx = 0
            }
            else
              k.FeeName = '';


            //k.BaseAmount = k.BaseAmount;
            this.StudentFeePaymentList.push(k)
          })
          var paymentobj = this.PaymentTypes.filter(p => p.MasterDataId == f.PaymentTypeId);
          if (paymentobj.length > 0) {
            f.PaymentType = paymentobj[0].MasterDataName;
          }
        })
        this.calculateTotal();
        console.log("this.StudentClassFees", this.StudentClassFees)
        this.StudentFeePaymentList = this.StudentFeePaymentList.sort((a, b) => a.indx - b.indx);
        this.dataReceiptSource = new MatTableDataSource<any>(this.FeeReceipt);
        this.dataReceiptSource.sort = this.sort;
        var latestReceipt = this.FeeReceipt.sort((a, b) => b.ReceiptNo - a.ReceiptNo);
        if (latestReceipt.length > 0)
          this.viewDetail(latestReceipt[0]);

        this.loading = false; this.PageLoading = false;

      })
  }
  PaymentTypes = [];
  FeeCategories = [];
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
    this.contentservice.GetCommonMasterData(1, globalconstants.globalAdminBillingSubOrgId, 198).subscribe((data: any) => {
      this.allMasterData = [...data.value];

      this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
      this.ReceiptHeading = this.getDropDownData(globalconstants.MasterDefinitions.school.RECEIPTHEADING);

      this.ReceiptHeading.forEach(f => {
        f.Description = f.Description ? JSON.parse("{" + f.Description + "}") : ''
      })
      //console.log("this.ReceiptHeading",this.ReceiptHeading);
      this.PaymentTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.FEEPAYMENTTYPE);
      this.loading = false; this.PageLoading = false;
    });

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
