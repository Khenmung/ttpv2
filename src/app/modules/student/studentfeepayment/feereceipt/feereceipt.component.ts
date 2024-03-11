import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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
import { SheetsRegistry, create } from 'jss';
import preset from "jss-preset-default";


const jss = create(preset());
const styles = {
  singleLine: `
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
    white-space: pre-wrap;
  `,
  printAreaContainer: `
    padding: 8px;
  `,
  fontMono: {
    fontFamily: "monospace"
  },
  textCenter: {
    textAlign: "center"
  },
  textRight: {
    textAlign: "right"
  },
  textLeft: {
    textAlign: "left"
  },
  fontBold: {
    fontWeight: "bold"
  },
  grid5Col: {
    display: "grid",
    columnGap: "5px",
    gridTemplateColumns: "1fr auto auto auto auto"
  },
  gridBorderSolid: `
    border-bottom: 1px solid;
  `,
  gridBorderDashed: `
    border-bottom: 1px dashed;
  `,
  gridBorderDouble: `
    border-bottom: 3px double;
  `,
  gridBorder: `
    grid-column: 1 / -1;
    margin: 4px 0;
  `,
  nowrap: {
    overflow: "hidden",
    textOverflow: "clip",
    whiteSpace: "nowrap"
  },
  colSpan2: {
    gridColumn: "span 2 / span 2"
  },
  maxLine2: {
    maxHeight: "30px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    "-webkit-line-clamp": 2,
    "-webkit-box-orient": "vertical"
  }
};
const sheets = new SheetsRegistry();
const sheet = jss.createStyleSheet(styles);
sheets.add(sheet);
const { classes } = sheet.attach();

@Component({
  selector: 'app-feereceipt',
  templateUrl: './feereceipt.component.html',
  styleUrls: ['./feereceipt.component.scss'],
})
export class FeereceiptComponent implements OnInit {
  @Input()
  width: "58mm";
  classes = classes;

  PageLoading = true;
  @ViewChild('printSection') printSection: ElementRef;
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
  constructor(
    //private printService: PrintService,
    private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private shareddata: SharedataService,
    private contentservice: ContentService) {
    // this.usbPrintDriver = new UsbDriver();
    // this.printService.isConnected.subscribe(result => {
    //   this.status = result;
    //   if (result) {
    //     console.log('Connected to printer!!!');
    //   } else {
    //     console.log('Not connected to printer.');
    //   }
    // });
  }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    //this.requestUsb();
  }
  print(): void {
    const tpm = new ThermalPrinterService(this.width);
    const styles = sheets.toString();
    console.log(this.printSection.nativeElement.innerHTML);
    console.log(styles);
    tpm.setStyles(styles);
    tpm.addEmptyLine();
    tpm.addRawHtml(this.printSection.nativeElement.innerHTML);
    tpm.print();
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
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.FEERECEIPT);
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
        if (data.value) this.Classes = [...data.value]; else this.Classes = [...data];
        this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
        var obj = this.Classes.find((f: any) => f.ClassId == this.studentInfoTodisplay.ClassId)
        if (obj)
          this.studentInfoTodisplay.StudentClassName = obj.ClassName;
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
  TotalInWords: any = '';
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
    // this.TotalInWords = this.inWords(this.TotalAmount);
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

    this.contentservice.GetClassFeeWithFeeDefinition(this.FilterOrgSubOrgBatchId, pClassId)//,pSemesterId,pSectionId)
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
            let _students = this.tokenStorage.getStudents()!;
            var _feeName = '', _remark1 = '', _remark2 = '';
            let _studentAllFeeTypes: any = [];
            var _category = '';
            var _subCategory = '';
            let _feeObj;
            var _formula = '';
            let _feeTypeId = 0;
            data.value.forEach(studcls => {
              _feeName = ''; _remark1 = ''; _remark2 = '';
              _studentAllFeeTypes = [];
              var objClassFee = _clsfeeWithDefinitions.filter(def => def.ClassId == studcls.ClassId);
              var _className = '';
              var obj = this.Classes.filter(c => c.ClassId == studcls.ClassId);
              if (obj.length > 0)
                _className = obj[0].ClassName;
              let _currentStudent: any = _students.find((s: any) => s.StudentId === studcls.StudentId);
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
                    ToMonth: item.ToMonth,
                    Discount:item.Discount
                  })
              })
              objClassFee.forEach(clsfee => {
                _category = '';
                _subCategory = '';
                _formula = '';
                _feeTypeId = 0;
                var objcat = this.FeeCategories.filter((f: any) => f.MasterDataId == clsfee.FeeDefinition.FeeCategoryId);
                if (objcat.length > 0)
                  _category = objcat[0].MasterDataName;

                var objsubcat = this.FeeCategories.filter((f: any) => f.MasterDataId == clsfee.FeeDefinition.FeeSubCategoryId);
                if (objsubcat.length > 0)
                  _subCategory = objsubcat[0].MasterDataName;


                // if (studcls.StudentFeeTypes.length > 0) {
                //   _feeTypeId = studcls.StudentFeeTypes[0].FeeTypeId;
                //   _formula = studcls.StudentFeeTypes[0].FeeType.Formula;
                // }
                _feeObj = _studentAllFeeTypes.find(ft => clsfee.Month >= ft.FromMonth && clsfee.Month <= ft.ToMonth);
                if (!_feeObj) {
                  _feeObj = _studentAllFeeTypes.find(ft => ft.FromMonth == 0 && ft.ToMonth == 0);
                }
                if (_feeObj.Discount > 0)
                  _formula = _feeObj.Formula + "-" + _feeObj.Discount;
                else
                  _formula = _feeObj.Formula;

                _feeTypeId = _feeObj.FeeTypeId;

                if (_formula && _formula.length > 0) {
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
                    FeeTypeId: _feeTypeId,
                    ClassId: studcls.ClassId,
                    SemesterId: studcls.SemesterId,
                    SectionId: studcls.SectionId,
                    RollNo: studcls.RollNo,
                    ClassName: _className,
                    Remark1: _remark1,
                    Remark2: _remark2
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
          })
          var paymentobj = this.PaymentTypes.find(p => p.MasterDataId == f.PaymentTypeId);
          if (paymentobj) {
            f.PaymentType = paymentobj.MasterDataName;
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
  logourl = '';
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
    var imgobj = this.ReceiptHeading.find((f: any) => f.MasterDataName == 'img' && f.Active == 1);
    if (imgobj) {
      this.logourl = imgobj.Description;
    }
    this.ReceiptHeading = this.ReceiptHeading.filter(m => m.MasterDataName.toLowerCase() != 'img');
    this.ReceiptHeading.forEach(f => {
      f.MasterDataName = f.MasterDataName.replaceAll("''", "'");
      f.Description = f.Description ? JSON.parse("{" + f.Description + "}") : ''
    })
    ////console.log("this.ReceiptHeading",this.ReceiptHeading);
    this.PaymentTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.FEEPAYMENTTYPE);
    this.loading = false; this.PageLoading = false;
    //});

  }


  // inWords(num) {
  //   var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  //   var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  //   if ((num = num.toString()).length > 9) return 'overflow';
  //   let n :any = ('000000000' + num).substring(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  //   if (!n) return ''; 
  //   var str = '';
  //   str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
  //   str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
  //   str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
  //   str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
  //   str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
  //   return str;
  // }
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
class ThermalPrinterService {
  printContent = ``;
  cssStyles = ``;

  constructor(private paperWidth: "80mm" | "58mm") { }

  addRawHtml(htmlEl) {
    this.printContent += `\n${htmlEl}`;
  }

  addLine(text) {
    this.addRawHtml(`<p>${text}</p>`);
  }

  addLineWithClassName(className, text) {
    this.addRawHtml(`<p class="${className}">${text}</p>`);
  }

  addEmptyLine() {
    this.addLine(`&nbsp;`);
  }

  addLineCenter(text) {
    this.addLineWithClassName("text-center", text);
  }

  setStyles(cssStyles) {
    this.cssStyles = cssStyles;
  }

  print() {
    const printerWindow = window.open(``, `_blank`)!;
    printerWindow.document.write(`
    <!DOCTYPE html>
    <html>
    
    <head>
      <title>Print</title>
      <style>
        html { padding: 0; margin: 0; width: ${this.paperWidth}; }
        body { margin: 0; }
        ${this.cssStyles}
      </style>
      <script>
        window.onafterprint = event => {
          window.close();
        };
      </script>
    </head>

    <body>
      ${this.printContent}
    </body>
    
    </html>
    
    `);

    printerWindow.document.close();
    printerWindow.focus();
    printerWindow.print();
    // mywindow.close();
  }
}