import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ContentService } from '../../../shared/content.service';
import { globalconstants } from '../../../shared/globalconstant';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { List } from '../../../shared/interface';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-dashboardclassfee',
  templateUrl: './dashboardclassfee.component.html',
  styleUrls: ['./dashboardclassfee.component.scss']
})

export class DashboardclassfeeComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  loading = false;
  InvoiceCreated = false;
  Defaultvalue = 0;
  SelectedMonth = 0;
  Months: any[] = [];
  VariableObjList: any[] = [];
  LedgerData: any[] = [];
  ClassCategory: any[] = [];
  FeeDefinitionListName = 'FeeDefinitions';
  DataCountToUpdate = -1;
  LoginUserDetail: any[] = [];
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  StandardFilterWithPreviousBatchId = '';
  CurrentBatch = '';
  CurrentBatchId = 0;
  SelectedApplicationId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  PreviousBatchId = 0;
  FeeDefinitions: any[] = [];
  Classes: any[] = [];
  Sections: any[] = [];
  Semesters: any[] = [];
  Batches: any[] = [];
  Selectzero = 0;
  Permission = 'deny';
  DataToSaveInLoop: any[] = [];
  ClassStatuses: any[] = [];
  ELEMENT_DATA: Element[] = [];
  dataSource: MatTableDataSource<Element>;
  allMasterData: any[] = [];
  FeeCategories: any[] = [];
  searchForm: any;
  CurrentMonthYear = '';
  classFeeData = {
    ClassFeeId: 0,
    FeeDefinitionId: 0,
    ClassId: 0,
    SectionId: 0,
    SemesterId: 0,
    Rate: 0,
    Quantity: 1,
    Amount: 0,
    BatchId: 0,
    Month: 0,
    PaymentOrder: 0,
    OrgId: 0,
    SubOrgId: 0,
    Active: 0,
    LocationId: 0
  };
  //matcher = new TouchedErrorStateMatcher();
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,
    private route: Router,
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

    this.searchForm = this.fb.group({
      searchClassId: [0],
      searchMonth: [0],
      searchSectionId: [0],
      searchSemesterId: [0]
      //FeeDefinitionId: [0],

    });
    this.PageLoad();
  }
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    var check = moment();

    var month = check.format('M');
    //var day = check.format('D');
    var year = check.format('YYYY');
    if (month.length == 1) {
      month = "0" + month;
    }
    this.CurrentMonthYear = year + "" + month;

    if (this.LoginUserDetail == null || this.LoginUserDetail.length == 0)
      this.route.navigate(['auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSFEE);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

      this.Months = this.contentservice.GetSessionFormattedMonths();
      //console.log("this.Months",this.Months);

      if (this.Permission == 'deny') {
      }
      else {
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        if (+this.tokenStorage.getPreviousBatchId()! > 0)
          this.StandardFilterWithPreviousBatchId = globalconstants.getOrgSubOrgFilterWithPreviousBatchId(this.tokenStorage)

        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        //console.log("this.SelectedBatchId",this.SelectedBatchId);
        this.PreviousBatchId = +this.tokenStorage.getPreviousBatchId()!;
        if (this.SelectedBatchId == 0) {
          //this.contentservice.openSnackBar("Current batch not defined in master!", this.options);
          this.route.navigate(['/admin']);
          this.loading = false; this.PageLoading = false;
        }
        else {
          this.searchForm.patchValue({ Batch: this.SelectedBatchId });
          this.contentservice.GetFeeDefinitions(this.FilterOrgSubOrg, 0).subscribe((d: any) => {
            this.FeeDefinitions = [...d.value];
          })
          this.GetMasterData();
          // if (this.Classes.length == 0) {

          //}
        }
      }
    }
  }
  displayedColumns = [
    'ClassFeeId',
    'FeeName',
    'Rate',
    'Quantity',
    'Amount',
    'Month',
    'PaymentOrder',
    'Active',
    'Action'];
  updateActive(row, value) {
    if (value.checked)
      row.Active = 1;
    else
      row.Active = 0;
    row.Action = true;
  }
  SelectAll(value) {

    if (value.checked) {
      this.ELEMENT_DATA.forEach(s => {
        s.Active = 1;
        s.Action = true;
      })
    }
    else {
      this.ELEMENT_DATA.forEach(s => {
        s.Active = 0;
        s.Action = true;
      })
    }
    this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort;
  }
  onBlur(element) {
    element.Action = true;
  }
  CategoryName = '';
  ChangeClass(element) {
    debugger;
    var _categoryObj = this.Classes.filter(c => c.ClassId == element.value);
    //var _category = ''
    if (_categoryObj.length > 0)
      this.CategoryName = _categoryObj[0].Category.toLowerCase();
    this.searchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();
  }
  ClearData() {
    this.ELEMENT_DATA = [];
    this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
  }
  CreateInvoice() {
    debugger;
    var _classId = this.searchForm.get("searchClassId")?.value;
    var _semesterId = this.searchForm.get("searchSemesterId")?.value;
    var _sectionId = this.searchForm.get("searchSectionId")?.value;
    //var _selectedMonth = this.searchForm.get("searchMonth")?.value;
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select a class.", globalconstants.ActionText, globalconstants.RedBackground);
    }
    // else if (_selectedMonth == 0) {
    //   this.contentservice.openSnackBar("Please select a class.", globalconstants.ActionText, globalconstants.RedBackground);
    // }
    else {
      this.loading = true;
      this.contentservice.GetClassFeeWithFeeDefinition(this.FilterOrgSubOrgBatchId, 0, _classId)//, _semesterId, _sectionId)
        .subscribe((datacls: any) => {

          //var _clsfeeWithDefinitions = datacls.value.filter(m => m.FeeDefinition.Active == 1);
          var _clsfeeWithDefinitions: any = [];
          let items = datacls.value.filter(m => m.FeeDefinition.Active == 1 && m.SemesterId == _semesterId
            && m.SectionId == _sectionId);
          if (items.length == 0) {
            _clsfeeWithDefinitions = datacls.value.filter(m => m.FeeDefinition.Active == 1);
          }
          else
            _clsfeeWithDefinitions = [...items];
          
          this.contentservice.getStudentClassWithFeeType(this.FilterOrgSubOrgBatchId, _classId, _semesterId, _sectionId, 0, 0)
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
                      SectionId: studcls.SectionId,
                      RollNo: studcls.RollNo,
                      ClassName: _className
                    });
                  }

                })
              })
              //console.log("studentfeedetailxxxx", studentfeedetail)
              this.contentservice.createInvoice(studentfeedetail, this.SelectedBatchId, this.LoginUserDetail[0]["orgId"], this.SubOrgId)
                .subscribe((data: any) => {
                  this.loading = false;
                  this.contentservice.openSnackBar("Invoice created successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
                },
                  error => {
                    this.loading = false;
                    console.log("create invoice error", error);
                    this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage, globalconstants.ActionText, globalconstants.RedBackground);
                  })
            })
        });
    }
  }
  ApplyVariables(formula) {
    var filledVar = formula;
    this.VariableObjList.forEach(stud => {
      Object.keys(stud).forEach(studproperty => {
        //var prop =studproperty.toLowerCase()
        if (filledVar.includes(studproperty)) {
          if (typeof stud[studproperty] != 'number')
            filledVar = filledVar.replaceAll("[" + studproperty + "]", "'" + stud[studproperty] + "'");
          else
            filledVar = filledVar.replaceAll("[" + studproperty + "]", stud[studproperty]);
        }
      });
    })
    return filledVar;
  }
  SaveAll() {
    this.loading = true;
    this.DataToSaveInLoop = this.ELEMENT_DATA.filter((f: any) => f.Action);
    this.DataCountToUpdate = this.DataToSaveInLoop.length;
    this.DataToSaveInLoop.forEach((record) => {
      this.DataCountToUpdate--
      this.UpdateOrSave(record);
    })
  }
  GetSessionFormattedMonths() {
    var _sessionStartEnd = {
      StartDate: new Date(),
      EndDate: new Date()
    };
    var Months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
    var monthArray: any[] = [];
    var selectedBatch = this.tokenStorage.getSelectedBatchStartEnd()!;
    var b = JSON.parse(selectedBatch);
    debugger;
    if (b.length != 0) {
      _sessionStartEnd = { ...b };
      var _Year = new Date(_sessionStartEnd.StartDate).getFullYear();
      var startMonth = new Date(_sessionStartEnd.StartDate).getMonth();

      for (var month = 0; month < 12; month++, startMonth++) {
        monthArray.push({
          MonthName: Months[startMonth] + " " + _Year,
          val: _Year + startMonth.toString().padStart(2, "0")
        })
        if (startMonth == 11) {
          startMonth = -1;
          _Year += 1;
        }
      }
    }
    return monthArray;
  }

  Save(row) {
    this.DataCountToUpdate = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {
    debugger;
    var objDiscount = this.ELEMENT_DATA.filter((f: any) => f.FeeName == 'Discount');
    if (objDiscount.length == 0) {
      this.contentservice.openSnackBar("Discount should be activated and saved.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.Amount < 0) {
      row.Action = false;
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Amount can not be minus.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else if (row.Amount > 100000) {
      row.Action = false;
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Amount should be smaller than 100,000.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (!row.Quantity) {
      row.Quantity = 1;
      row.Amount = row.Rate;
    }
    // if(!row.Month)
    // {
    //   row.Action = false;
    //   this.loading = false; this.PageLoading = false;
    //   this.contentservice.openSnackBar("Please select Month Year.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    this.loading = true;

    let checkFilterString = this.FilterOrgSubOrgBatchId +
      " and FeeDefinitionId eq " + row.FeeDefinitionId +
      " and ClassId eq " + row.ClassId +
      " and SemesterId eq " + row.SemesterId +
      " and SectionId eq " + row.SectionId;


    if (row.Month > 0)
      checkFilterString += " and Month eq " + row.Month

    if (row.ClassFeeId > 0)
      checkFilterString += " and ClassFeeId ne " + row.ClassFeeId;

    let list: List = new List();
    list.fields = ["ClassFeeId"];
    list.PageName = "ClassFees";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar("Record already exists!", globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.classFeeData.Active = row.Active;
          this.classFeeData.Amount = row.Amount;
          this.classFeeData.Rate = row.Rate;
          this.classFeeData.Quantity = row.Quantity;
          this.classFeeData.BatchId = row.BatchId;
          this.classFeeData.ClassFeeId = row.ClassFeeId;
          this.classFeeData.ClassId = row.ClassId;
          this.classFeeData.SectionId = row.SectionId;
          this.classFeeData.SemesterId = row.SemesterId;
          this.classFeeData.FeeDefinitionId = row.FeeDefinitionId;
          this.classFeeData.LocationId = +row.LocationId;
          this.classFeeData.PaymentOrder = row.PaymentOrder;
          this.classFeeData.Month = row.Month;
          this.classFeeData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.classFeeData.SubOrgId = this.SubOrgId;
          if (objDiscount[0].ClassFeeId == 0) {
            var insert: any[] = [];
            insert.push({
              Active: 1,
              Amount: objDiscount[0].Amount,
              BatchId: objDiscount[0].BatchId,
              ClassFeeId: objDiscount[0].ClassFeeId,
              ClassId: objDiscount[0].ClassId,
              FeeDefinitionId: objDiscount[0].FeeDefinitionId,
              LocationId: 0,
              PaymentOrder: objDiscount[0].PaymentOrder,
              Month: objDiscount[0].Month,
              OrgId: this.LoginUserDetail[0]["orgId"],
              SubOrgId: this.SubOrgId
            })
            this.insert(objDiscount[0], insert[0]);
          }
          //console.log("dataclassfee", this.classFeeData);
          if (this.classFeeData.ClassFeeId == 0)
            this.insert(row, this.classFeeData);
          else
            this.update(row);
        }
      });
  }

  insert(row, item) {

    //debugger;
    this.dataservice.postPatch('ClassFees', item, 0, 'post')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.loading = false; this.PageLoading = false;
          row.ClassFeeId = data.ClassFeeId;
          item.ClassFeeId = data.ClassFeeId;
          if (this.DataCountToUpdate == 0) {
            this.DataCountToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });

  }
  update(row) {

    this.dataservice.postPatch('ClassFees', this.classFeeData, this.classFeeData.ClassFeeId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.loading = false; this.PageLoading = false;
          if (this.DataCountToUpdate == 0) {
            this.DataCountToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }

        });
  }
  GetDistinctClassFee() {
    let list: List = new List();
    list.fields = ["ClassId"];
    list.PageName = "ClassFees";
    //list.groupby = "ClassId";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          const unique = [...new Set(data.value.map(item => {
            return item.ClassId
          }))];
          this.ClassStatuses = this.Classes.map(cls => {
            let isdefined = unique.filter(definedcls => {
              return definedcls == cls.ClassId;
            });
            if (isdefined.length == 0)
              return {
                "className": cls.ClassName,
                "Done": false
              }
            else
              return {
                "className": cls.ClassName,
                "Done": true
              }
          })
          ////console.log('classes', this.ClassStatuses);         
        }
        this.loading = false;
        this.PageLoading = false;
      })
  }
  DataFromPreviousBatch = ''
  CopyFromPreviousBatch() {
    if (this.PreviousBatchId == -1)
      this.contentservice.openSnackBar("Previous batch not defined.", globalconstants.ActionText, globalconstants.RedBackground);
    else {

      this.GetClassFee(this.StandardFilterWithPreviousBatchId, 1)
    }
  }

  GetClassFee(OrgIdAndbatchId, previousbatch) {
    debugger;
    let _classId = this.searchForm.get("searchClassId")?.value;
    let _sectionId = this.searchForm.get("searchSectionId")?.value;
    let _semesterId = this.searchForm.get("searchSemesterId")?.value;

    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class/course.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    let filterstr = " and ClassId eq " + _classId;
    //if (_semesterId) query should be specific to class,semesterid,sectionid
    filterstr += " and SemesterId eq " + _semesterId;
    filterstr += " and SectionId eq " + _sectionId;

    this.SelectedMonth = this.searchForm.get("searchMonth")?.value;
    if (this.SelectedMonth > 0)
      filterstr += " and Month eq " + this.SelectedMonth;

    let list: List = new List();
    list.fields = [
      "ClassFeeId",
      "FeeDefinitionId",
      "ClassId",
      "SectionId",
      "SemesterId",
      "Amount",
      "Rate",
      "Quantity",
      "Month",
      "BatchId",
      "Active",
      "PaymentOrder"];
    list.PageName = "ClassFees";
    list.filter = [OrgIdAndbatchId + filterstr];
    this.ELEMENT_DATA = [];
    this.dataSource = new MatTableDataSource<Element>(this.ELEMENT_DATA);
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _classFee = [...data.value];

        if (previousbatch == 1) {
          this.DataFromPreviousBatch = 'Data From Previous Batch'
          if (_classFee.length == 0) {
            this.contentservice.openSnackBar("No data from previous batch.", globalconstants.ActionText, globalconstants.RedBackground);
            this.loading = false; this.PageLoading = false;
            return;
          }
          list.filter = [this.FilterOrgSubOrgBatchId + filterstr];
          this.dataservice.get(list)
            .subscribe((existingclsfee: any) => {
              _classFee = data.value.filter((f: any) => existingclsfee.value.filter(g => g.FeeDefinitionId == f.FeeDefinitionId).length == 0)
              this.ProcessClassFee(_classFee, previousbatch)
            })
        }
        else {
          this.DataFromPreviousBatch = '';
          this.ProcessClassFee(_classFee, previousbatch)
        }

      });
  }
  ProcessClassFee(classFee, previousbatch) {
    debugger;
    let _classId = this.searchForm.get("searchClassId")?.value;
    let _sectionId = this.searchForm.get("searchSectionId")?.value;
    let _semesterId = this.searchForm.get("searchSemesterId")?.value;
    if (classFee.length > 0) {
      this.FeeDefinitions.forEach((mainFeeName, indx) => {
        var indx = this.Months.findIndex(m => m.MonthName == mainFeeName.FeeName);
        if (indx == -1)
          this.Months.push({ "MonthName": mainFeeName.FeeName, "val": mainFeeName.FeeDefinitionId });

        let existing = classFee.filter(fromdb => fromdb.FeeDefinitionId == mainFeeName.FeeDefinitionId)
        if (existing.length > 0) {
          existing.forEach(ex => {
            ex.SlNo = indx + 1;
            ex.FeeName = mainFeeName.FeeName;
            ex.Action = false;
            ex.ClassId = _classId;
            ex.ClassFeeId = (previousbatch == 1 ? 0 : ex.ClassFeeId);
            ex.Active = (previousbatch == 1 ? 0 : ex.Active);
            ex.Month = (previousbatch == 1 ? 0 : ex.Month);
            ex.BatchId = this.SelectedBatchId;
            this.ELEMENT_DATA.push(ex);
          })
        }
        else if (previousbatch == 0 && this.SelectedMonth == 0)
          this.ELEMENT_DATA.push({
            "SlNo": indx + 1,
            "ClassFeeId": 0,
            "FeeDefinitionId": mainFeeName.FeeDefinitionId,
            "ClassId": _classId,
            "SectionId": _sectionId,
            "SemesterId": _semesterId,
            "FeeName": mainFeeName.FeeName,
            "Amount": 0,
            "Month": 0,
            "PaymentOrder": 0,
            "BatchId": this.SelectedBatchId,// this.Batches[0].MasterDataId,
            "Active": mainFeeName.FeeName.toLowerCase() == 'discount' ? 1 : 0,
            "Action": false
          });
      })
    }
    else if (previousbatch == 0 && this.SelectedMonth == 0) {

      this.ELEMENT_DATA = this.FeeDefinitions.map((fee, indx) => {
        var indx = this.Months.findIndex(m => m.MonthName == fee.FeeName);
        if (indx == -1)
          this.Months.push({ "MonthName": fee.FeeName, "val": fee.FeeDefinitionId });

        return {
          "SlNo": indx + 1,
          "ClassFeeId": 0,
          "FeeDefinitionId": fee.FeeDefinitionId,
          "ClassId": _classId,
          "SectionId": _sectionId,
          "SemesterId": _semesterId,
          "FeeName": fee.FeeName,
          "Amount": 0,
          "Month": 0,
          "PaymentOrder": 0,
          "BatchId": this.SelectedBatchId,
          "Active": 0,
          "Action": false
        }
      });

    }
    //this.ELEMENT_DATA =
    //console.log("this.CurrentMonthYear", this.CurrentMonthYear);
    this.ELEMENT_DATA.sort((a, b) => b.Active - a.Active);
    console.log("this.ELEMENT_DATA", this.ELEMENT_DATA);
    this.dataSource = new MatTableDataSource<Element>(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loading = false; this.PageLoading = false;
  }

  updateEnable(row, value) {
    row.Action = true;
    row.Status = value.checked;
  }
  updateRecurring(row, event) {
    row.Action = true;
    if (event.checked)
      row.Recurring = 1;
    else
      row.Recurring = 0;
  }
  updateAmount(row, value) {
    // if(row.Rate>0 && row.Quantity>0)
    // {
    row.Amount = row.Rate * row.Quantity;
    //}
    row.Action = true;
    // row.Amount = value;
  }
  UpdateActive(row, value) {
    row.Action = true;
  }
  updatePaymentOrder(row, value) {

    row.Action = true;

    //row.PaymentOrder = value;
  }
  enableAction(row, value) {
    row.Action = true;
    row.Active = !row.Active;
    //let amount = +value;
    if (Number.isNaN(value))
      value = 0;
    row.Amount = parseFloat(value);
    ////console.log('from change', row);
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;

    this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);

    this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      this.Classes = data.value.map(m => {
        m.Category = '';
        var obj = this.ClassCategory.filter(c => c.MasterDataId == m.CategoryId);
        if (obj.length > 0)
          m.Category = obj[0].MasterDataName.toLowerCase();
        return m;
      })
      //[...data.value];
      //this.GetMasterData();
      this.GetDistinctClassFee();
    });


  }

  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
    // let Id = 0;
    // let Ids = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    // })
    // if (Ids.length > 0) {
    //   Id = Ids[0].MasterDataId;
    //   return this.allMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   })
    // }
    // else
    //   return [];

  }

}
export interface Element {
  SlNo: number;
  ClassFeeId: number;
  FeeDefinitionId: number;
  ClassId: number;
  SectionId: number;
  SemesterId: number;
  Amount: any;
  Month: number;
  PaymentOrder: number,
  BatchId: number;
  Active: number;
  FeeName: string;
  Action: boolean;
}
