import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PageDetail } from '../content';
import { globalconstants } from './globalconstant';
import { NaomitsuService } from './databaseService';
import { List } from './interface';
import { TokenStorageService } from '../_services/token-storage.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import alasql from 'alasql';
import { evaluate } from 'mathjs';
import { AuthService } from '../_services/auth.service';
//import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContentService implements OnInit {
  PageLoading = true;
  RoleFilter = '';
  Roles: any[] = [];
  allMasterData: any[] = [];
  Applications: any[] = [];
  UserDetail: any[] = [];
  url: any;
  SelectedApplicationId = 0;
  HostUrl = globalconstants.apiUrl;
  constructor(
    private authservice: AuthService,
    private tokenService: TokenStorageService,
    private http: HttpClient,
    private dataservice: NaomitsuService,
    private snackbar: MatSnackBar,
    //private route: Router,
    //private contentservice:ContentService
  ) { }
  ngOnInit(): void {

    this.SelectedApplicationId = +this.tokenService.getSelectedAPPId()!;

  }
  openSnackBar(message: string, action: string, option: MatSnackBarConfig<any>) {
    this.snackbar.open(message, action, option);
  }
  checkSpecialChar(str) {
    var format = /[!@#$%^&*_+\=\[\]{};:"\\|<>]+/;
    if (format.test(str))
      return true;
    else
      return false;
  }
  AddUpdateContent(pagecontent: any) {
    this.url = globalconstants.apiUrl + '/odata/Pages';
    return this.http.post(this.url, pagecontent);
  }
  GetEmployeeVariable() {
    let list = new List();
    list.fields = globalconstants.MasterDefinitions.EmployeeVariableName;
    list.PageName = "EmpEmployees";
    return this.dataservice.get(list);
  }
  CheckEmailDuplicate(payload) {

    return this.authservice.CallAPI(payload, 'EmailDuplicateCheck');
  }
  GetExams(pOrgSubOrgBatchId, pReleaseResult) {

    var _releaseResult = '';
    if (pReleaseResult === 0 || pReleaseResult === 1) {
      _releaseResult = " and ReleaseResult eq " + pReleaseResult;
    }
    var orgIdSearchstr = pOrgSubOrgBatchId + _releaseResult + " and Active eq 1";

    let list: List = new List();
    list.fields = [
      "ExamId",
      "ExamNameId",
      "ClassGroupId",
      "StartDate",
      "EndDate",
      //"AttendanceModeId", 
      "ReleaseResult",
      "AttendanceStartDate"];
    list.PageName = "Exams";
    list.filter = [orgIdSearchstr];
    return this.dataservice.get(list)

  }
  GetClasses(pOrgSubOrgFilter: string) {
    let list = new List();
    list.fields = ["ClassId,ClassName,Sequence,BatchId,CategoryId,MinStudent,MaxStudent,StartDate,EndDate"];
    list.filter = [pOrgSubOrgFilter + " and Active eq 1"];
    list.PageName = "ClassMasters";
    //list.orderBy = "Sequence";
    return this.dataservice.get(list);
  }
  GetStudentClassCount(pOrgSubOrgId, pClassId, pSectionId, pSemesterId, pBatchId) {
    debugger;
    var _classfilter = '';
    if (pClassId > 0)
      _classfilter = " and ClassId eq " + pClassId;
    _classfilter += " and SemesterId eq " + pSemesterId;
    _classfilter += " and SectionId eq " + pSectionId;
    if (pBatchId > 0)
      _classfilter += " and BatchId eq " + pBatchId + " and IsCurrent eq true and Active eq 1";

    let list: List = new List();
    list.fields = ["StudentClassId"];
    list.PageName = "StudentClasses";
    list.filter = [pOrgSubOrgId + _classfilter];

    return this.dataservice.get(list);

  }
  GetExamClassGroup(pOrgSubOrg, pExamId) {
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    var orgIdSearchstr = pOrgSubOrg + " and Active eq true";
    if (pExamId > 0)
      orgIdSearchstr += " and ExamId eq " + pExamId;

    let list: List = new List();
    list.fields = [
      "ExamClassGroupMapId",
      "ExamId",
      "ClassGroupId",
      //"ClassGroupMappingId"
    ];
    list.PageName = "ExamClassGroupMaps";
    list.filter = [orgIdSearchstr];
    return this.dataservice.get(list)
  }
  GetClassGroups(pOrgSubOrg: string) {

    //let filterStr = 'OrgId eq ' + pOrgId + " and SubOrgId eq " + pSubOrgId; // BatchId eq  + this.SelectedBatchId
    let list: List = new List();
    list.fields = [
      "ClassGroupId",
      "GroupName",
      "ClassGroupTypeId",
      "Active"
    ];

    list.PageName = "ClassGroups";
    list.filter = [pOrgSubOrg];
    return this.dataservice.get(list);
  }
  GetClassGroupMappings(pOrgSubOrg: string) {

    //let filterStr = 'OrgId eq ' + pOrgId + " and SubOrgId eq " + pSubOrgId; // BatchId eq  + this.SelectedBatchId
    let list: List = new List();
    list.fields = [
      "ClassGroupMappingId",
      "ClassId",
      "SectionId",
      "SemesterId",
      "ClassGroupId",
      "Active"
    ];

    list.PageName = "ClassGroupMappings";
    list.filter = [pOrgSubOrg];
    return this.dataservice.get(list);
  }
  GetStudentGrade(pOrgSub) {
    //var orgIdSearchstr = ' and OrgId eq ' + pOrgId
    //student grade is not batch wise
    //+ ' and BatchId eq ' + this.SelectedBatchId;
    let list: List = new List();

    list.fields = ["StudentGradeId,ExamId,GradeName,ClassGroupId,SubjectCategoryId,Formula,Sequence,Points"];
    list.PageName = "StudentGrades";
    list.filter = [pOrgSub + " and Active eq 1"];
    return this.dataservice.get(list)
  }
  GetStudentMaxPID(pOrgSubOrgId) {
    let list: List = new List();
    list.fields = ["PID"];
    list.PageName = "Students";
    list.filter = [pOrgSubOrgId];
    list.limitTo = 1;
    list.orderBy = "PID Desc";

    return this.dataservice.get(list);
  }
  ///semesterid and sectionid is not passed because if record does not exist we need class wise class fee.
  GetClassFeeWithFeeDefinition(pOrgSubOrgBatchIdFilter, pMonth, pClassId) {//, pSemesterId, pSectionId
    var filter = pOrgSubOrgBatchIdFilter + ' and Active eq 1';
    if (pClassId)
      filter += ' and ClassId eq ' + pClassId;

    // filter += ' and SemesterId eq ' + pSemesterId;
    // filter += ' and SectionId eq ' + pSectionId;

    if (pMonth > 0)
      filter += ' and Month eq ' + pMonth;
    else
      filter += ' and Month ge ' + pMonth;

    let list = new List();
    list.fields = ["ClassId", "Active", "Amount", "Month", "FeeDefinitionId", "PaymentOrder", "SectionId", "SemesterId"];
    list.PageName = "ClassFees";
    list.lookupFields = ["FeeDefinition($select=FeeCategoryId,FeeSubCategoryId,FeeName,Active)"];
    list.filter = [filter];
    return this.dataservice.get(list);
  }
  GetFeeDefinitions(pOrgSubOrg, active) {
    //Fee definition is not batch wise.      
    //let filterStr = 'BatchId eq ' + SelectedBatchId + ' and OrgId eq ' + orgId;
    var activefilter = active == 1 ? ' and Active eq 1' : '';
    let filterStr = pOrgSubOrg + activefilter;
    let list: List = new List();
    list.fields = [
      "FeeDefinitionId",
      "FeeName",
      "Description",
      "FeeCategoryId",
      "FeeSubCategoryId",
      "OrgId",
      "BatchId",
      "Active"
    ];

    list.PageName = "FeeDefinitions";
    list.filter = [filterStr];
    return this.dataservice.get(list);
  }
  getSelectedReportColumn(pOrgSubOrg, pSelectedApplicationId) {

    debugger;
    //var MyReportNameId = this.searchForm.get("searchReportName")?.value;

    // if (pModuleName == 0) {
    //   this.contentservice.openSnackBar("Please select report name", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    // this.loading = true;
    let list: List = new List();
    list.fields = [
      "ReportConfigItemId",
      "ReportName",
      "DisplayName",
      "Formula",
      "ParentId",
      "ApplicationId",
      "ColumnSequence",
      "TableNames",
      "OrgId",
      "SubOrgId",
      "UserId",
      "Active"]
    list.PageName = 'ReportConfigItems';
    list.filter = ["(OrgId eq 0 or (" + pOrgSubOrg +
      ")) and (ApplicationId eq 0 or ApplicationId eq " + pSelectedApplicationId + ')'];

    return this.dataservice.get(list)

  }
  GetGeneralAccounts(OrgSubOrg, active, type) {
    var activefilter = active == 1 ? ' and Active eq 1' : '';
    //let filterStr = 'OrgId eq ' + orgId + activefilter;
    let filterStr = OrgSubOrg + activefilter;
    if (type == "employee")
      filterStr += " and (EmployeeId ne 0 && EmployeeId ne null)"
    else if (type == "student")
      filterStr += " and (StudentClassId ne 0 && StudentClassId ne null)"

    let list: List = new List();
    list.fields = [
      "GeneralLedgerId",
      "GeneralLedgerName",
      "AccountNatureId",
      "AccountGroupId",
      "AccountSubGroupId",
      "StudentClassId",
      "EmployeeId"
    ];

    list.PageName = "GeneralLedgers";
    list.filter = [filterStr];
    return this.dataservice.get(list);
  }
  GetClassGroupMapping(pOrgSubOrg: string, active) {
    var activefilter = active == 1 ? ' and Active eq 1' : '';
    let filterStr = pOrgSubOrg + activefilter;
    let list: List = new List();
    list.fields = [
      "ClassGroupMappingId",
      "ClassId",
      "ClassGroupId",
      "SectionId",
      "SemesterId",
      "Active"
    ];

    list.PageName = "ClassGroupMappings";
    list.lookupFields = ["Class($select=ClassName,ClassId),ClassGroup($select=GroupName)"];
    list.filter = [filterStr];
    return this.dataservice.get(list);
  }
  GetEvaluationExamMaps(orgSubOrg, active) {
    var activefilter = active == 1 ? ' and Active eq true' : '';
    let filterStr = orgSubOrg + activefilter;
    let list: List = new List();
    list.fields = [
      'EvaluationExamMapId',
      'ExamId',
      'EvaluationMasterId',
      'Active',
    ];

    list.PageName = "EvaluationExamMaps";
    list.filter = [filterStr];
    return this.dataservice.get(list);
  }
  GetGrades(orgId) {
    let list = new List();
    list.fields = ["*"];
    list.filter = ["Active eq 1 and OrgId eq " + orgId];
    list.PageName = "EmpEmployeeGradeSalHistories";
    return this.dataservice.get(list);
  }
  getMasterText(arr, itemId) {
    var filtered = arr.filter((f: any) => f.MasterDataId == itemId);
    if (filtered.length > 0)
      return filtered[0].MasterDataName;
    else
      return '';
  }
  GetSessionFormattedMonths() {
    var _sessionStartEnd = {
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
    debugger;
    _sessionStartEnd = JSON.parse(this.tokenService.getSelectedBatchStartEnd()!);

    var _StartYear = new Date(_sessionStartEnd["StartDate"]).getFullYear();
    var _EndYear = new Date(_sessionStartEnd["EndDate"]).getFullYear();
    var startMonth = new Date(_sessionStartEnd["StartDate"]).getMonth();
    var noOfMonths = globalconstants.MonthDiff(new Date(_sessionStartEnd["StartDate"]), new Date(_sessionStartEnd["EndDate"]));
    for (var month = 0; month <= noOfMonths; month++, startMonth++) {
      monthArray.push({
        MonthName: Months[startMonth] + " " + _StartYear,
        val: parseInt(_StartYear + startMonth.toString().padStart(2, "0"))
      })
      if (startMonth == 11) {
        startMonth = -1;
        _StartYear = _EndYear;
      }
    }
    return monthArray;
  }

  ReSequence(editedrow, MasterList: any[]) {
    debugger;
    var diff = editedrow.OldSequence - editedrow.DisplayOrder;
    var newDisplayOrder = editedrow.DisplayOrder;
    MasterList = MasterList.sort((a, b) => a.DisplayOrder - b.DisplayOrder)

    if (diff > 0) {
      var indx = -1;
      //search in loop using ">=" since the new sequence may not exist in the list.
      for (var i = 0; i < MasterList.length; i++) {
        if (MasterList[i].OldSequence >= editedrow.DisplayOrder) {
          indx = i;
          break;
        }
      }
      //var indx = this.MasterList.findIndex(x => x.OldSequence == editedrow.Sequence);

      for (var start = indx; start < MasterList.length; start++) {
        newDisplayOrder += 1;
        //if (start != newSequence)
        MasterList[start].DisplayOrder = newDisplayOrder;
        MasterList[start].Action = true;
      }
    }
    else {
      var indx = MasterList.findIndex(x => x.DisplayOrder == editedrow.DisplayOrder);
      for (var start = indx + 1; start < MasterList.length; start++) {
        newDisplayOrder += 1;
        MasterList[start].Sequence = newDisplayOrder;
        MasterList[start].Action = true;
      }
    }


    // editedrow.Action = true;
    editedrow.OldSequence = editedrow.newDisplayOrder;
    MasterList.sort((a, b) => a.newDisplayOrder - b.newDisplayOrder);
    // this.datasource = new MatTableDataSource<IMaster>(this.MasterList);
    // this.datasource.sort = this.sort;
    // this.datasource.paginator = this.paginator;

  }
  GetDropDownDataFromDB(ParentId, pOrgSubOrg, AppIds, activeMaster = 1) {
    //debugger;
    var _active = activeMaster == 0 ? '' : "Active eq 1 and ";
    var applicationparam = '';
    (AppIds + "").split(',').forEach(id => {
      applicationparam += applicationparam == '' ? 'ApplicationId eq ' + id : ' or ApplicationId eq ' + id
    })

    var applicationFilter = '';
    if (ParentId == 0)
      applicationFilter = "(" + applicationparam + ")";
    else
      applicationFilter = pOrgSubOrg + " and (" + applicationparam + ")";

    let list: List = new List();
    list.fields = [
      "MasterDataId", "ParentId",
      "MasterDataName", "Description",
      "Logic", "Sequence",
      "ApplicationId", "Active",
      "Confidential", "SubOrgId", "CustomerPlanId"
    ];
    list.PageName = "MasterItems";
    list.filter = [_active + "ParentId eq " + ParentId + " and " + applicationFilter];// + ") or (OrgId eq " + this.OrgId + " and " + applicationFilter + ")"];
    return this.dataservice.get(list)

  }
  GetDropDownDataWithOrgIdnParent(ParentId, pOrgSubOrg, activeMaster = 1) {
    //debugger;
    var _active = activeMaster == 0 ? '' : "Active eq 1 and ";

    let list: List = new List();
    list.fields = [
      "MasterDataId", "ParentId", "MasterDataName",
      "Description", "Logic", "Sequence",
      "ApplicationId", "Active", "Confidential"
    ];
    list.PageName = "MasterItems";
    list.filter = [_active + "ParentId eq " + ParentId + " and " + pOrgSubOrg];// + ") or (OrgId eq " + this.OrgId + " and " + applicationFilter + ")"];
    return this.dataservice.get(list)

  }
  getDropDownDataFeeType(token, pFeeType) {
    let Permission = '';
    for (var i = 0; i < pFeeType.length; i++) {
      if (pFeeType[i].Confidential) {

        var perObj = globalconstants.getPermission(token, pFeeType[i].FeeTypeName);
        if (perObj.length > 0) {
          Permission = perObj[0].permission;
          if (Permission == 'deny') {
            pFeeType.splice(i, 1);
            i--;
          }
        }
        else {
          pFeeType.splice(i, 1);
          i--;
        }
      }
    }
    return pFeeType;
  }
  getDropDownData(dropdowntype, token, pAllMasterData) {
    let Id = 0;
    let Ids = pAllMasterData.filter((item, indx) => item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase());//globalconstants.GENDER
    let Permission = '';
    if (Ids.length > 0) {
      Id = Ids[0].MasterDataId;
      var dropvalues = pAllMasterData.filter(item => item.ParentId == Id);
      //var confidentialdatalist = dropvalues.filter((f:any) => f.Confidential == 1)
      for (var i = 0; i < dropvalues.length; i++) {
        if (dropvalues[i].Confidential) {

          var perObj = globalconstants.getPermission(token, dropvalues[i].MasterDataName);
          if (perObj.length > 0) {
            Permission = perObj[0].permission;
            if (Permission == 'deny') {
              dropvalues.splice(i, 1);
              i--;
            }
          }
          else {
            dropvalues.splice(i, 1);
            i--;
          }
        }
      }
      dropvalues.forEach(d => {
        d.Sequence = d.Sequence == 0 ? 100 : d.Sequence;
      });
      var result = dropvalues.sort((a, b) => a.Sequence - b.Sequence);
      return result;
    }
    else
      return [];

  }
  getDropDownDataNoConfidentail(dropdowntype, token, pAllMasterData) {
    let Id = 0;
    let Ids = pAllMasterData.filter((item, indx) => item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase());//globalconstants.GENDER
    //let Permission = '';
    if (Ids.length > 0) {
      Id = Ids[0].MasterDataId;
      var dropvalues = pAllMasterData.filter(item => item.ParentId == Id);
      //var confidentialdatalist = dropvalues.filter((f:any) => f.Confidential == 1)
      // for (var i = 0; i < dropvalues.length; i++) {
      //   if (dropvalues[i].Confidential) {

      //     var perObj = globalconstants.getPermission(token, dropvalues[i].MasterDataName);
      //     if (perObj.length > 0) {
      //       Permission = perObj[0].permission;
      //       if (Permission == 'deny') {
      //         dropvalues.splice(i, 1);
      //         i--;
      //       }
      //     }
      //     else {
      //       dropvalues.splice(i, 1);
      //       i--;
      //     }
      //   }
      // }
      dropvalues.forEach(d => {
        d.Sequence = d.Sequence == 0 ? 100 : d.Sequence;
      });
      var result = dropvalues.sort((a, b) => a.Sequence - b.Sequence);
      return result;
    }
    else
      return [];

  }
  getConfidentialData(token, pClassSubject, pColumnName) {
    //let Id = 0;
    //let  = pClassSubject.filter((item, indx) => item.ClassName.toLowerCase() + "-" + item.SubjectName.toLowerCase()== dropdowntype.toLowerCase());//globalconstants.GENDER
    let Permission = '';
    for (var i = 0; i < pClassSubject.length; i++) {

      if (pClassSubject[i].Confidential != null && pClassSubject[i].Confidential) {

        var perObj = globalconstants.getPermission(token, pClassSubject[i][pColumnName])//.ClassSubject);
        if (perObj.length > 0) {
          Permission = perObj[0].permission;
          if (Permission == 'deny') {
            pClassSubject.splice(i, 1);
            i--;
          }
        }
        else {
          pClassSubject.splice(i, 1);
          i--;
        }
      }
      pClassSubject[i].EvaluationName = globalconstants.decodeSpecialChars(pClassSubject[i].EvaluationName);
    }
    return pClassSubject;

  }
  ///////
  // var result = item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();
  // if (item.Confidential == 1) {
  //   var perObj = globalconstants.getPermission(token, dropdowntype)
  //   if (perObj.length > 0) {
  //     Permission = perObj[0].permission;
  //   }
  //   if (Permission != 'deny') {
  //     if (result)
  //       Ids.push(item);
  //   }
  // }
  // else if (result) {
  //   Ids.push(item);
  // }
  /////
  getInvoice(pOrgId, pSubOrgId, pSelectedBatchId, pStudentClassId, pClassId, pSemesterId, pSectionId) {
    //var selectedMonth = this.searchForm.get("searchMonth")?.value;
    var _function = "";
    if (pStudentClassId == 0)
      _function = 'getinvoice';
    else
      _function = 'getInvoiceSingle'
    var OrgIdAndbatchId = {
      StudentClassId: pStudentClassId,
      ClassId: pClassId,
      SemesterId: pSemesterId,
      SectionId: pSectionId,
      OrgId: pOrgId,
      SubOrgId: pSubOrgId,
      BatchId: pSelectedBatchId,
      //Month: pSelectedMonth
    }

    return this.authservice.CallAPI(OrgIdAndbatchId, _function);
  }
  GetStudentUncommonFields(fields, filterOrgSubOrgBatchId, role, studentId) {
    //var filterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    //this.Students = [];
    let list: List = new List();

    // 'StudentId',
    // 'FatherContactNo',
    // 'MotherContactNo',
    // "PID",
    // "EmailAddress",
    // "UserId",
    // "PresentAddress",
    // "DOB"

    list.fields = [fields];
    list.PageName = "Students";
    if (role.toLowerCase() == 'student') {
      filterOrgSubOrgBatchId += " and StudentId eq " + studentId;
    }
    list.filter = [filterOrgSubOrgBatchId];
    return this.dataservice.get(list);

  }
  getStudentClassWithFeeType(pOrgSubOrgBatchId, pClassId, pSemesterId, pSectionId, pStudentClassId, pFeeTypeId) {

    var filterstr = '';
    //new student class is inactive but should be able to pay fee and will become active.
    filterstr = pOrgSubOrgBatchId + " and (Active eq 1 or AdmissionDate lt 1970-01-01)";// + " and Active eq 1";

    if (pStudentClassId > 0)
      filterstr += " and StudentClassId eq " + pStudentClassId;
    if (pClassId)
      filterstr += " and ClassId eq " + pClassId;
    filterstr += " and SemesterId eq " + pSemesterId;
    filterstr += " and SectionId eq " + pSectionId;

    if (pFeeTypeId > 0)
      filterstr += " and FeeTypeId eq " + pFeeTypeId;

    let list: List = new List();
    list.fields = [
      "StudentClassId",
      "StudentId",
      "ClassId",
      "SectionId",
      "SemesterId",
      "FeeTypeId",
      "SectionId",
      "RollNo"];
    list.PageName = "StudentClasses";
    list.lookupFields = ["FeeType($select=Formula,Active)"]
    list.filter = [filterstr];
    return this.dataservice.get(list);

  }
  createInvoice(data, pSelectedBatchId, pOrgId, pSubOrgId) {
    var AmountAfterFormulaApplied = 0;
    var _VariableObjList: any[] = [];
    var _LedgerData: any[] = [];
    //console.log("data", data.filter((f:any) => f.StudentClassId == 3852))
    data.forEach((inv: any) => {
      _VariableObjList.push(inv)
      if (inv.Formula.length > 0) {
        //      if (inv.Month == 202200)
        console.log("inv.Formula", inv.Formula);

        var formula = this.ApplyVariables(inv.Formula, _VariableObjList);
        //  if (inv.Month == 202200)
        //console.log("after applying Formula", formula);
        //after applying, remove again since it is for each student
        _VariableObjList.splice(_VariableObjList.indexOf(inv), 1);
        AmountAfterFormulaApplied = evaluate(formula);
      }
      _LedgerData.push({
        LedgerId: 0,
        Active: 1,
        GeneralLedgerId: 0,
        BatchId: pSelectedBatchId,
        BaseAmount: inv.Amount,
        Balance: AmountAfterFormulaApplied,
        Month: inv.Month,
        StudentClassId: inv.StudentClassId,
        OrgId: pOrgId,
        SubOrgId: pSubOrgId,
        TotalDebit: AmountAfterFormulaApplied,
        TotalCredit: 0,
      });
    });
    var query = "select SUM(BaseAmount) BaseAmount,SUM(TotalCredit) TotalCredit,SUM(TotalDebit) TotalDebit, SUM(Balance) Balance," +
      "StudentClassId,LedgerId, Active, GeneralLedgerId, BatchId, Month, OrgId,SubOrgId " +
      "FROM ? GROUP BY StudentClassId, LedgerId,Active, GeneralLedgerId,BatchId, Month,OrgId,SubOrgId";
    var sumFeeData = alasql(query, [_LedgerData]);
    //console.log("_LedgerData", _LedgerData);
    console.log("sumFeeData", sumFeeData);
    return this.authservice.CallAPI(sumFeeData, 'createinvoice')
  }
  ApplyVariables(formula, pVariableObjList) {
    var filledVar = formula;
    pVariableObjList.forEach(stud => {
      Object.keys(stud).forEach(studproperty => {
        //var prop =studproperty.toLowerCase()
        if (filledVar.includes(studproperty)) {
          if (typeof stud[studproperty] != 'number')
            filledVar = filledVar.replaceAll("[" + studproperty + "]", "'" + stud[studproperty] + "'");
          else {
            filledVar = filledVar.replaceAll("[" + studproperty + "]", stud[studproperty]);
          }
        }
      });
    })
    return filledVar;
  }
  Getcontent(title: string, query: string) {
    //debugger
    this.url = this.HostUrl + '/odata/' + title + '?' + query;
    //this.url = '/odata/' +title + '?' + query;  
    ////console.log(this.url);
    return this.http.get(this.url);//.map(res=>res.json());
    //.pipe(map((res:Response) => res.json()));
    // .pipe(map((res:any)=>{
    //   var data = res.json();
    //   return new (data.PageId, data.PageHeader, data.PageType.PageName,data.Version);
  }

  GetPageTypes() {
    ////debugger  
    this.url = this.HostUrl + '/odata/PageTypes?$filter=Active eq true';
    //this.url = '/odata/PageTypes?$filter=Active eq true';  
    //var filter = ''
    return this.http.get(this.url);
  }
  GetcontentLatest(pageGroupId: number, pageName: string) {
    //debugger
    let filter = "PageName eq '" + pageName + "' and PageNameId eq " + pageGroupId;
    this.url = this.HostUrl + '/odata/Pages?$select=PageId,Version&$orderby=Version desc&$top=1&$filter=' + filter;
    //this.url = '/odata/Pages?$select=PageId,Version&$orderby=Version desc&$top=1&$filter=' + filter;  
    return this.http.get(this.url);
  }
  GetcontentById(Id: number) {
    //debugger
    this.url = this.HostUrl + '/odata/Pages?$filter=PageId eq ' + Id;
    //this.url = '/odata/Pages?$filter=PageId eq ' + Id;  
    return this.http.get(this.url);
  }

  UpdatecontentById(body: PageDetail, key: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    //headers=headers.append('Access-Control-Allow-Origin', '*')  
    this.url = this.HostUrl + '/odata/Pages/(' + key + ')';
    //this.url = '/odata/Pages/(' + key +')';  
    return this.http.patch(this.url, body, httpOptions)
  }
  GetApplicationRoleUser(userdetail) {
    this.UserDetail = [...userdetail];
    let list: List = new List();
    list.fields = [
      'UserId',
      'RoleId',
      'OrgId',
      'Active'
    ];

    list.PageName = "RoleUsers";
    list.lookupFields = ["Org($select=OrganizationId,OrganizationName,LogoPath,Active)"];
    var _subOrgId = +this.tokenService.getSubOrgId()!;
    list.filter = ["Active eq 1 and UserId eq '" + userdetail[0]["userId"] +
      "' and OrgId eq " + userdetail[0]["orgId"] + ' and SubOrgId eq ' + _subOrgId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          if (data.value[0].Org.Active == 1)
            this.GetMasterData(data.value);
          else {
            //console.log("User's Organization not active!, Please contact your administrator!");
          }
        }
      })
  }

  private GetMasterData(UserRole) {
    var applicationtext = globalconstants.MasterDefinitions.schoolapps.bang;
    var roletext = globalconstants.MasterDefinitions.common.ROLE;

    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "Confidential"];
    list.PageName = "MasterItems";
    list.filter = ["MasterDataName eq '" + applicationtext +
      "' or MasterDataName eq '" + roletext + "'"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var Ids = [...data.value];

        if (Ids.length > 0) {
          var ApplicationMasterDataId = Ids.filter((f: any) => f.MasterDataName.toLowerCase() == applicationtext)[0].MasterDataId;
          var RoleMasterDataId = Ids.filter((f: any) => f.MasterDataName.toLowerCase() == roletext)[0].MasterDataId;
          let list: List = new List();
          list.fields = ["MasterDataId,MasterDataName,Description,ParentId,Confidential"];
          list.PageName = "MasterItems";
          list.filter = ["(ParentId eq " + ApplicationMasterDataId + " or ParentId eq " + RoleMasterDataId +
            " or MasterDataId eq " + ApplicationMasterDataId + " or MasterDataId eq " + RoleMasterDataId +
            ") and Active eq 1"];

          this.dataservice.get(list)
            .subscribe((data: any) => {
              ////console.log(data.value);
              //this.shareddata.ChangeMasterData(data.value);
              this.allMasterData = [...data.value];

              this.Applications = this.getDropDownData(applicationtext, this.tokenService, this.allMasterData);

              this.Roles = this.getDropDownData(roletext, this.tokenService, this.allMasterData);

              this.RoleFilter = ' and (RoleId eq 0';
              var __organization = '';
              if (UserRole[0].OrgId != null)
                __organization = UserRole[0].Org.OrganizationName;

              this.UserDetail[0]["RoleUsers"] =
                UserRole.map(roleuser => {
                  if (roleuser.Active == 1 && roleuser.RoleId != null) {
                    this.RoleFilter += ' or RoleId eq ' + roleuser.RoleId
                    var _role = '';
                    if (this.Roles.length > 0 && roleuser.RoleId != null)
                      _role = this.Roles.filter((a: any) => a.MasterDataId == roleuser.RoleId)[0].MasterDataName;
                    return {
                      roleId: roleuser.RoleId,
                      role: _role,
                    }
                  }
                  else
                    return false;
                })

              debugger;
              //login detail is save even though roles are not defined.
              //so that user can continue their settings.
              this.tokenService.saveUserdetail(this.UserDetail);
              if (this.RoleFilter.length > 0)
                this.RoleFilter += ')';
              //this.tokenService.saveCheckEqualBatchId
              this.GetApplicationRolesPermission();
            }, error => {
              console.log("getmasterdata error", error);
              this.tokenService.signOut();
            });
        }
      })
  }
  GetCustomFeature(pSelectedAppId, pRoleId, pSubOrgId, pOrgId) {
    let list: List = new List();
    list.fields = [
      'CustomFeatureId',
      'RoleId',
      'PermissionId',
      'ApplicationId'
    ];
    var _orgSubOrgFilter = "OrgId eq " + pOrgId + " and SubOrgId eq " + pSubOrgId; //globalconstants.getOrgSubOrgFilter(pOrgId,pSubOrgId);
    var _denyPermissionId = globalconstants.PERMISSIONTYPES.filter((f: any) => f.type == 'deny')[0].val;
    list.PageName = "CustomFeatureRolePermissions";
    list.lookupFields = ["CustomFeature($select=CustomFeatureName)"]
    list.filter = [_orgSubOrgFilter + " and ApplicationId eq " + pSelectedAppId + " and RoleId eq " + pRoleId + " and Active eq true"];
    //"PermissionId ne "+ _denyPermissionId+" and
    debugger;
    return this.dataservice.get(list);

  }
  private GetApplicationRolesPermission() {

    let list: List = new List();
    list.fields = [
      'PlanFeatureId',
      'RoleId',
      'PermissionId'
    ];

    list.PageName = "ApplicationFeatureRolesPerms";
    list.lookupFields = ["PlanFeature($filter=Active eq 1;$expand=Page($select=PageTitle,label,link,faIcon,ApplicationId,ParentId))"]
    list.filter = ["Active eq 1 " + this.RoleFilter];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //hilai hi ei.
        var LoginUserDetail = this.tokenService.getUserDetail();
        var planfilteredFeature = data.value.filter((f: any) => f.PlanFeature.PlanId == LoginUserDetail[0]["planId"]);
        if (planfilteredFeature.length > 0) {
          var _applicationName = '';
          var _appShortName = '';
          this.UserDetail[0]["applicationRolePermission"] = [];
          planfilteredFeature.forEach(item => {
            _applicationName = '';
            _appShortName = '';
            var appobj: any[] = this.Applications.filter((f: any) => f.MasterDataId == item.PlanFeature.Page.ApplicationId);
            if (appobj.length > 0) {
              _applicationName = appobj[0].Description;
              _appShortName = appobj[0].MasterDataName

              var _permission = '';
              if (item.PermissionId != null)
                _permission = globalconstants.PERMISSIONTYPES.filter(a => a.val == item.PermissionId)[0].type

              this.UserDetail[0]["applicationRolePermission"].push({
                'planFeatureId': item.PlanFeatureId,
                'applicationFeature': item.PlanFeature.Page.PageTitle,//_applicationFeature,
                'roleId': item.RoleId,
                'permissionId': item.PermissionId,
                'permission': _permission,
                'applicationName': _applicationName,
                'applicationId': item.PlanFeature.Page.ApplicationId,
                'appShortName': _appShortName,
                'faIcon': item.PlanFeature.Page.faIcon,
                'label': item.PlanFeature.Page.label,
                'link': item.PlanFeature.Page.link
              });
            }
          });
          var _customFeature = this.tokenService.getCustomFeature();
          _customFeature.forEach(item => {
            _applicationName = '';
            _appShortName = '';
            var appobj: any[] = this.Applications.filter((f: any) => f.MasterDataId == item.ApplicationId);
            if (appobj.length > 0) {
              _applicationName = appobj[0].Description;
              _appShortName = appobj[0].MasterDataName
            }

            var feature = this.UserDetail[0]['applicationRolePermission'].filter((f: any) => f.applicationFeature == item.CustomFeature.CustomFeatureName)
            if (feature.length == 0) {
              this.UserDetail[0]['applicationRolePermission'].push({
                'planFeatureId': 0,
                'applicationFeature': item.CustomFeature.CustomFeatureName,//_applicationFeature,
                'roleId': item.RoleId,
                'permissionId': item.PermissionId,
                'permission': globalconstants.PERMISSIONTYPES.filter((f: any) => f.val == item.PermissionId)[0].type,
                'applicationName': _applicationName,
                'applicationId': item.ApplicationId,
                'appShortName': _appShortName,
                'faIcon': '',
                'label': '',
                'link': ''
              })
            }
          });
          //          console.log("this.UserDetail", this.UserDetail);
          this.tokenService.saveUserdetail(this.UserDetail);
        }
      })
  }

  // GetOrgExpiry(pLoginUserDetail) {
  //   let list: List = new List();
  //   list.fields = ["OrganizationId", "OrganizationName", "ValidTo", "ValidFrom"];
  //   list.PageName = "Organizations";
  //   list.filter = ["Active eq 1 and OrganizationId eq " + pLoginUserDetail[0]["orgId"]];
  //   //debugger;
  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       if (data.value.length > 0) {
  //         var _validTo = new Date(data.value[0].ValidTo);//
  //         _validTo.setHours(0, 0, 0, 0);
  //         var _today = new Date();//
  //         _today.setHours(0, 0, 0, 0);
  //         var _roleName = pLoginUserDetail[0]['RoleUsers'][0].role;
  //         const diffTime = Math.abs(_validTo.getTime() - _today.getTime());
  //         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //         //console.log("diffDays", diffDays)
  //         var alertDate = localStorage.getItem("alertdate");
  //         var todaystring = moment(new Date()).format('DD-MM-YYYY')

  //         // var days = new Date(_validTo) - new Date(_today);
  //         if (diffDays < 0) {
  //           this.tokenService.signOut();
  //           this.contentservice.openSnackBar("Login expired! Please contact administrator.", globalconstants.ActionText, globalconstants.RedBackground);
  //           //setTimeout(() => {
  //           this.route.navigate(['/auth/login'])
  //           //}, 3000);
  //         }
  //         else if (diffDays < 6 && alertDate != todaystring && _roleName.toLowerCase() == 'admin') {
  //           localStorage.setItem("alertdate", todaystring);
  //           var msg = '';
  //           if (diffDays == 0)
  //             msg = "Your plan is expiring today";
  //           else if (diffDays == 1)
  //             msg = "Your plan is expiring tommorrow.";
  //           else
  //             msg = "Your plan is expiring within " + diffDays + " days. i.e on " + moment(_validTo).format('DD/MM/YYYY');
  //           this.contentservice.openSnackBar(msg, globalconstants.ActionText, globalconstants.GreenBackground);
  //         }
  //       }
  //     })
  // }
  GetPermittedAppId(appShortName) {
    var appId = 0;
    var apps = this.tokenService.getPermittedApplications();
    var commonAppobj = apps.filter((f: any) => f.appShortName == appShortName)
    if (commonAppobj.length > 0)
      appId = commonAppobj[0].applicationId;
    return appId;
  }

  GetCommonMasterData(orgId, SubOrgId, appIds) {

    var applicationparam = '';
    (appIds + "").split(',').forEach(id => {
      applicationparam += ' or ApplicationId eq ' + id
    })

    var commonAppId = this.GetPermittedAppId('common');
    var orgIdSearchstr = '(ApplicationId eq ' + commonAppId + applicationparam + ")" +
      ' and (ParentId eq 0  or (OrgId eq ' + orgId + ' and SubOrgId eq ' + SubOrgId + ')) and Active eq 1 ';

    let list: List = new List();

    list.fields = [
      "MasterDataId",
      "MasterDataName",
      "ParentId",
      "Description",
      "CustomerPlanId",
      "Sequence",
      "Confidential",
      "Active"];
    list.PageName = "MasterItems";
    list.filter = [orgIdSearchstr];
    list.orderBy = "Sequence";

    return this.dataservice.get(list);

  }
  GetParentZeroMasters() {
    let list: List = new List();
    list.fields = [
      "MasterDataId",
      "ParentId",
      "MasterDataName",
      "Description",
      "ApplicationId",
      "Confidential",
      "Active",
      "OrgId"];
    list.PageName = "MasterItems";
    list.filter = ["ParentId eq 0 and Active eq 1"];
    return this.dataservice.get(list);
  }
}
