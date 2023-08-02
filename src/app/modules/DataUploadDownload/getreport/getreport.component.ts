import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatSelectionList } from '@angular/material/list';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { TableUtil } from '../../../shared/TableUtil';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-getreport',
  templateUrl: './getreport.component.html',
  styleUrls: ['./getreport.component.scss']
})
export class GetreportComponent implements OnInit {
  PageLoading = true;

  @ViewChild('searchval') selectionList: MatSelectionList;
  @ViewChild("table") tableRef: ElementRef;
  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }

  @ViewChild(MatSort, { static: false })
  set sort(value: MatSort) {
    this.dataSource.sort = value;
  }

  private searchedItems: Array<any> = [];
  SelectedReport = '';
  NestedColumnSearch = false;
  SearchDropdownValue = [];
  BaseReportId = 0;
  ParentId = 0;
  Permission = '';
  DisplayColumns = [];
  FeeTypes = [];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ColumnsOfSelectedReports = [];
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  loading = false;
  ReportName = '';
  BaseReportName = '';
  searchCondition1;
  searchConditionText = [];
  AvailableReportNames = [];
  MyAppReportNames = [];
  Applications = [];
  ReportNames = [];
  Classes = [];
  Sections = [];
  Students = [];
  Semesters=[];
  SchoolGenders = [];
  ActivityCategory = [];
  SelectedBatchId = 0;SubOrgId = 0;
  ReportConfigItemListName = "ReportConfigItems";

  SelectedApplicationId = 0;
  ReportConfigItemList = [];
  dataSource: MatTableDataSource<IReportConfigItem>;
  NestedfilterKeyValue = [];
  filterKeyValue = [];
  AllMasterData = [];
  PagePermission = '';
  FilterColumns = [];
  FilterConditions = [];

  FilterCriteria = [];
  DropdownData = [];
  ReportConfigItemData = {
    ReportConfigItemId: 0,
    ReportName: '',
    DisplayName: '',
    ParentId: 0,
    Formula: '',
    ColumnSequence: 0,
    ApplicationId: 0,
    TableNames: '',
    OrgId: 0,SubOrgId: 0,
    UserId: '',
    Active: 0
  };
  ApplicationName = '';
  searchForm: UntypedFormGroup;

  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private datepipe: DatePipe,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private nav: Router,
    private fb: UntypedFormBuilder
  ) {

  }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    //debugger;
    this.searchForm = this.fb.group({
      searchReportName: [0],
      searchFilterColumn: [0],
      searchCondition: [''],
      searchCriteria: ['']
    });
    this.FilterConditions = [
      { "text": "equal", "val": "eq" },
      { "text": "not equal", "val": "ne" },
      { "text": "greater than", "val": "gt" },
      { "text": "less than", "val": "lt" },
      { "text": "greater than n equal", "val": "ge" },
      { "text": "less than n equal", "val": "le" },
      { "text": "like", "val": "substringof" }
    ];
    this.dataSource = new MatTableDataSource([]);
    this.Applications = this.tokenStorage.getPermittedApplications();
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();

    this.PageLoad();
    //this.cdr.detectChanges();
  }

  applyFilter(filterValue) {
    debugger;
    if (filterValue.target.value)
      return;

    var filterstr = filterValue.target.value.trim();
    filterstr = filterstr.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterstr;
  }


  PageLoad() {
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.DATA.DOWNLOAD);
    if (perObj.length > 0) {
      this.Permission = perObj[0].permission;
    }
    ////console.log('this.Permission', this.Permission)
    if (this.Permission != 'deny') {

      this.ApplicationName = this.LoginUserDetail[0]["org"];
      this.GetFeeTypes();
      this.GetBaseReportId();
      this.GetMasterData();
      this.FilterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.FilterOrgSubOrgBatchId= globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
          this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
        this.Classes = [...data.value];
      })
    }
  }
  updateActive(row, value) {
    debugger;
    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }

  UpdateOrSave(row) {

    //debugger;
    var AvailableReportId = this.searchForm.get("searchAvailableReportName").value;
    var MyReportNameId = this.searchForm.get("searchReportName").value;

    if (AvailableReportId == 0) {
      this.contentservice.openSnackBar("Please select available report name", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (MyReportNameId == 0) {
      this.contentservice.openSnackBar("Please select my report name", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    let checkFilterString = this.FilterOrgSubOrg + " and ReportName eq '" + row.ReportName + "'" +
      " and ApplicationId eq " + row.ApplicationId + 
      " and ParentId eq " + MyReportNameId;

    if (row.ReportConfigItemId > 0)
      checkFilterString += " and ReportConfigItemId ne " + row.ReportConfigItemId;

    this.loading = true;
    let list: List = new List();
    list.fields = ["*"];
    list.PageName = this.ReportConfigItemListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.ReportConfigItemData.ReportConfigItemId = row.ReportConfigItemId;
          this.ReportConfigItemData.ApplicationId = row.ApplicationId;
          this.ReportConfigItemData.DisplayName = row.DisplayName;
          this.ReportConfigItemData.ColumnSequence = row.ColumnSequence;
          this.ReportConfigItemData.Formula = row.Formula;
          this.ReportConfigItemData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ReportConfigItemData.SubOrgId = this.SubOrgId;
          this.ReportConfigItemData.ParentId = MyReportNameId;
          this.ReportConfigItemData.UserId = row.UserId;
          this.ReportConfigItemData.Active = row.Active;
          this.ReportConfigItemData.ReportName = row.ReportName;
          this.ReportConfigItemData.TableNames = row.TableNames;

          ////console.log('data', this.ReportConfigItemData);

          if (this.ReportConfigItemData.ReportConfigItemId == 0) {
            this.ReportConfigItemData["CreatedDate"] = new Date();
            this.ReportConfigItemData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ReportConfigItemData["UpdatedDate"] = new Date();
            delete this.ReportConfigItemData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ReportConfigItemData["CreatedDate"];
            delete this.ReportConfigItemData["CreatedBy"];
            this.ReportConfigItemData["UpdatedDate"] = new Date();
            this.ReportConfigItemData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.ReportConfigItemListName, this.ReportConfigItemData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ReportConfigItemId = data.ReportConfigItemId;
          row.Action = false;
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ReportConfigItemListName, this.ReportConfigItemData, this.ReportConfigItemData.ReportConfigItemId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  IfStudentActivityMethods() {
    var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      this.Classes = [...data.value];
    })
    this.GetStudents();
  }
  GetMasterData() {

    this.AllMasterData = this.tokenStorage.getMasterData();
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.SchoolGenders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
    this.ActivityCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
    this.loading = false; this.PageLoading = false;
  }

  ReSequence(editedrow) {
    //debugger;
    var diff = 0;
    if (editedrow.Sequence != editedrow.OldSequence) {

      if (editedrow.Sequence > editedrow.OldSequence) {
        var filteredData = this.ReportConfigItemList.filter(currentrow => currentrow.MasterDataId != editedrow.MasterDataId
          && currentrow.Sequence > editedrow.OldSequence
          && currentrow.Sequence <= editedrow.Sequence)

        filteredData.forEach(currentrow => {

          currentrow.Sequence -= 1;
          currentrow.OldSequence -= 1;
          currentrow.Action = true;

        });
      }
      else if (editedrow.Sequence < editedrow.OldSequence) {
        var filteredData = this.ReportConfigItemList.filter(currentrow => currentrow.MasterDataId != editedrow.MasterDataId
          && currentrow.Sequence >= editedrow.Sequence
          && currentrow.Sequence < editedrow.OldSequence)

        filteredData.forEach(currentrow => {
          currentrow.Sequence += 1;
          currentrow.OldSequence += 1;
          currentrow.Action = true;
        })
      }
      editedrow.Action = true;
      editedrow.OldSequence = editedrow.Sequence;
      this.ReportConfigItemList.sort((a, b) => a.Sequence - b.Sequence);
      this.dataSource = new MatTableDataSource<IReportConfigItem>(this.ReportConfigItemList);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }
  get f() {
    return this.searchForm.controls;
  }

  GetBaseReportId() {

    let list: List = new List();
    list.fields = [
      "ReportConfigItemId"
    ]
    list.PageName = this.ReportConfigItemListName;
    list.filter = ["Active eq 1 and ReportName eq 'Reports' and OrgId eq 0"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.BaseReportId = data.value[0].ReportConfigItemId;
          this.GetReportNames();
        }
        else {
          this.contentservice.openSnackBar("Base report Id not found!", globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.loading = false; this.PageLoading = false;
      });
  }
  GetReportNames() {

    let list: List = new List();
    list.fields = [
      "ReportConfigItemId",
      "ReportName",
      "DisplayName",
      "ParentId",
      "ApplicationId",
      "TableNames",
      "OrgId",
      "UserId",
      "Active"]
    list.PageName = this.ReportConfigItemListName;
    list.filter = ["Active eq 1 and ApplicationId eq " + this.SelectedApplicationId +
      " and (ParentId eq " + this.BaseReportId +
      " or OrgId eq 0 or ("+this.FilterOrgSubOrg + "))"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ReportNames = data.value.map(reportname => {
          reportname.DisplayName = reportname.DisplayName == null ? reportname.ReportName : reportname.DisplayName;
          return reportname;
        });
        //console.log("this.ReportNames", this.ReportNames)
        this.GetMyReportNames();
        this.loading = false; this.PageLoading = false;
      });
  }
  GetMyReportNames() {
    debugger;
    this.ReportConfigItemList = [];
    this.AvailableReportNames = this.ReportNames.filter(a => a.ParentId == this.BaseReportId);
    //console.log("this.AvailableReportNames", this.AvailableReportNames);
    //this.SelectedReportBase =this.AvailableReportNames.filter(f=>f.ReportName.toLowerCase()=='student report')
    this.AvailableReportNames.forEach(r => {
      var temp = this.ReportNames.filter(p => p.ParentId == r.ReportConfigItemId && p.OrgId != 0)
      if (temp.length > 0) {
        temp.forEach(report => {
          this.MyAppReportNames.push(report)
        });
      }
    })
  }

  GetFilterColumn() {
    debugger;
    this.FilterColumns = this.ReportNames.filter(f => f.ParentId == this.searchForm.get("searchReportName").value);
    //var selectedObj = this.MyAppReportNames.filter(f => f.ReportConfigItemId == this.searchForm.get("searchReportName").value);
    var obj = this.ReportNames.filter(f => f.ReportConfigItemId == this.searchForm.get("searchReportName").value)
    if (obj.length > 0) {
      var _parentId = obj[0].ParentId
      this.BaseReportName = this.ReportNames.filter(f => f.ReportConfigItemId == _parentId)[0].ReportName;
      switch (this.BaseReportName) {
        case "Student Activity":
          this.IfStudentActivityMethods();
          break;
      }
    }
  }
  FillDropDown() {
    var _ParentId = 0;

    this.DropdownData = this.AllMasterData.filter(f => f.ParentId == _ParentId);
  }
  getSelectedReportColumn() {

    debugger;
    var MyReportNameId = this.searchForm.get("searchReportName").value;

    if (MyReportNameId == 0) {
      this.contentservice.openSnackBar("Please select report name", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
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
      "UserId",
      "Active"]
    list.PageName = this.ReportConfigItemListName;
    list.filter = ["Active eq 1 and ParentId eq " + MyReportNameId];
    this.searchedItems = [];
    this.ReportConfigItemList = [];
    this.dataSource = new MatTableDataSource(this.ReportConfigItemList);

    this.dataservice.get(list)
      .subscribe((data: any) => {

        var SelectedReport = this.MyAppReportNames.filter(m => m.ReportConfigItemId == MyReportNameId);
        var _ParentId = 0;
        if (SelectedReport.length > 0) {
          this.ReportName = SelectedReport[0].ReportName;
          // to get table name of parent report;
          _ParentId = SelectedReport[0].ParentId;
        }
        var baseReportColumns = this.ReportNames.filter(f => f.ParentId == _ParentId && f.OrgId == 0);
        //console.log("baseReportColumns", baseReportColumns)
        var _tableNames = this.AvailableReportNames.filter(m => m.ReportConfigItemId == _ParentId)[0].TableNames.split(',');
        //var _baseColumns = this.ReportNames.filter(f=>f.ParentId == _ParentId && f.OrgId ==0)
        this.ColumnsOfSelectedReports = data.value.map(m => {
          var obj = baseReportColumns.filter(f => f.ReportName == m.ReportName);
          if (obj.length > 0)
            m.TableNames = obj[0].TableNames;
          return m;
        })

        var list = new List();
        list.PageName = _tableNames[0];

        if (_tableNames.length == 0) {
          this.contentservice.openSnackBar("Table name not present!", globalconstants.ActionText, globalconstants.RedBackground);
          return;
        }

        //lookup fields generation
        list.PageName = _tableNames[0];
        list.lookupFields = [];
        for (var i = 1; i < _tableNames.length; i++) {
          list.lookupFields.push(_tableNames[i])
        }
        //console.log("ColumnsOfSelectedReports", this.ColumnsOfSelectedReports)
        // filter whose tablenames column are empty
        var fitleredNotNestedColumns = this.ColumnsOfSelectedReports.filter(f => f.TableNames == '');
        var filteredNestedColumns = this.ColumnsOfSelectedReports.filter(f => f.TableNames != '');

        list.fields = fitleredNotNestedColumns.map(m => {
          return m.ReportName;
        });

        //if filter contains nested column remove it
        var nestedColumnFilterList = [];
        filteredNestedColumns.forEach(f => {
          var filterOnNestedcolumn = this.FilterCriteria.filter(g => g.includes(f.ReportName))
          if (filterOnNestedcolumn.length > 0) {
            nestedColumnFilterList.push(filterOnNestedcolumn[0]);
            const indx = this.FilterCriteria.indexOf(filterOnNestedcolumn[0]);
            this.FilterCriteria.splice(indx, 1);
          }
        })
        //

        var filter = this.FilterCriteria.join(" and ")
        if (filter.length > 0)
          filter += " and ";
        ////console.log('filter str', filter);

        list.filter = [this.FilterOrgSubOrg + filter];

        this.dataservice.get(list)
          .subscribe((data: any) => {
            var result = [...data.value];
            // data.value.map(res=>{
            //       res.StudentClasses = res.StudentClasses.filter(f=>f.BatchId == this.SelectedBatchId);
            //       return res;
            // });
            //console.log("result",result)
            //debugger;
            //var whereDisplayNameNotEmpty = this.ColumnsOfSelectedReports.filter(f => f.DisplayName.length > 0)
            var colTem = [];
            var formatedResult = [];
            this.ColumnsOfSelectedReports.forEach(c => {
              if (c.DisplayName == null || c.DisplayName.length == 0)
                c.DisplayName = c.ReportName;

              formatedResult = result.map(m => {
                if (m[c.ReportName] === undefined) {
                  var nestedvalue = this.traverse(m, c.TableNames, '');
                  m[c.DisplayName] = this.ReportwiseSetDropDownValue(c.ReportName, nestedvalue);
                }
                else {
                  if (c.ReportName.indexOf('Date') > -1)
                    m[c.DisplayName] = this.datepipe.transform(m[c.ReportName], 'dd/MM/yyyy');
                  else if (c.ReportName.indexOf('Id') > -1) {
                    m[c.DisplayName] = this.ReportwiseSetDropDownValue(c.ReportName, m[c.ReportName]);
                  }
                  else {
                    m[c.DisplayName] = m[c.ReportName];

                  }
                }
                var coldata = { "col": c.DisplayName, "sequence": c.ColumnSequence };
                if (!this.ItemExists(colTem, c.DisplayName))
                  colTem.push(coldata)
                return m;
              })
            })
            this.searchedItems = [];
            this.NestedfilterKeyValue.forEach(search => {
              this.searchRecursive(formatedResult, search);
            })
            if (this.NestedfilterKeyValue.length == 0) {
              this.searchedItems = formatedResult;
            }

            this.NestedfilterKeyValue = [];
            this.ReportConfigItemList = this.searchedItems;
            this.DisplayColumns = colTem.sort((a, b) => {
              return a.sequence - b.sequence;
            }).map(m => {
              return m.col
            });

            if (this.ReportConfigItemList.length == 0) {
              this.contentservice.openSnackBar("No record matching search criteria found!", globalconstants.ActionText, globalconstants.RedBackground);
            }
            this.dataSource = new MatTableDataSource(this.ReportConfigItemList);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.loading = false; this.PageLoading = false;
          })


      });
  }
  ReportwiseSetDropDownValue(colName, IdValue) {
    var returnvalue = '';
    debugger;
    switch (this.BaseReportName) {
      case "Student Report":
        switch (colName) {
          case "StudentId":
            var obj = this.Students.filter(s => s.StudentId == IdValue)
            if (obj.length > 0)
              returnvalue = obj[0].Name;
            break;
          case "ClassId":
            var obj = this.Classes.filter(s => s.ClassId == IdValue)
            if (obj.length > 0)
              returnvalue = obj[0].ClassName;
            break;
          case "GenderId":
            var obj = this.SchoolGenders.filter(s => s.MasterDataId == IdValue)
            if (obj.length > 0)
              returnvalue = obj[0].MasterDataName;
            break;
          case "SectionId":
            var obj = this.Sections.filter(s => s.MasterDataId == IdValue)
            if (obj.length > 0)
              returnvalue = obj[0].MasterDataName;
            break;
          case "FeeTypeId":
            var obj = this.FeeTypes.filter(s => s.FeeTypeId == IdValue)
            if (obj.length > 0)
              returnvalue = obj[0].FeeTypeName;
            break;
          default:
            returnvalue = IdValue;
            break;
        }
        break;
      default:
        returnvalue = IdValue;
        break;
    }
    return returnvalue;
  }
  GetDropDownId(colName, TextValue) {
    var returnvalue = 0;
    debugger;
    switch (this.BaseReportName) {
      case "Student Report":
        switch (colName) {
          case "StudentId":
            var obj = this.Students.filter(s => s.Name.toLowerCase() == TextValue.toLowerCase())
            if (obj.length > 0)
              returnvalue = obj[0].StudentId;
            break;
          case "ClassId":
            var obj = this.Classes.filter(s => s.ClassName.toLowerCase() == TextValue.toLowerCase())
            if (obj.length > 0)
              returnvalue = obj[0].ClassId;
            break;
          case "GenderId":
            var obj = this.SchoolGenders.filter(s => s.MasterDataName.toLowerCase() == TextValue.toLowerCase())
            if (obj.length > 0)
              returnvalue = obj[0].MasterDataId;
            break;
          case "SectionId":
            var obj = this.Sections.filter(s => s.MasterDataName.toLowerCase() == TextValue.toLowerCase())
            if (obj.length > 0)
              returnvalue = obj[0].MasterDataId;
            break;
          case "FeeTypeId":
            var obj = this.FeeTypes.filter(s => s.FeeTypeName.toLowerCase() == TextValue.toLowerCase())
            if (obj.length > 0)
              returnvalue = obj[0].FeeTypeId;
            break;
          default:
            returnvalue = 0;
            break;
        }
        break;
      default:
        returnvalue = 0;
        break;
    }
    return returnvalue;
  }
  searchRecursive(arr, searchcondition) {
    let lowerCaseName = '';
    if (isNaN(searchcondition.value))
      searchcondition.value = searchcondition.value.toLowerCase()

    if (arr[searchcondition.columnname]) {
      lowerCaseName = arr[searchcondition.columnname].toLowerCase();

      if (this.checkcondition(searchcondition.condition, lowerCaseName, searchcondition.value)) {
        this.searchedItems.push(arr);
      }
    }
    else {
      debugger;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i][searchcondition.columnname]) {
          lowerCaseName = arr[i][searchcondition.columnname].toString().toLowerCase();
          if (this.checkcondition(searchcondition.condition, lowerCaseName, searchcondition.value)) {
            this.searchedItems.push(arr[i]);
          }
        }
        else {
          Object.keys(arr[i]).some(item => {
            if (Array.isArray(arr[i][item]) && arr[i][item].length > 0)
              this.searchRecursive(arr[i][item], searchcondition);
          })
        }
      }
    }
    return this.searchedItems;
  }
  checkcondition(condition, firstval, secondval) {
    switch (condition) {
      case "eq":
        return firstval == secondval;
        break;
      case "ne":
        return firstval != secondval;
        break;
      case "lt":
        return firstval < secondval;
        break;
      case "gt":
        return firstval > secondval;
        break;
      case "le":
        return firstval <= secondval;
        break;
      case "ge":
        return firstval >= secondval;;
        break;
      case "like":
        return firstval.includes(secondval);
        break;
      default:
        return firstval == secondval;

    }
  }
  RemoveSearchFilter() {
    var selected: string[] = this.selectionList.selectedOptions.selected.map(s => s.value)
    var diff = this.FilterCriteria.filter(el => !selected.includes(el))
    this.FilterCriteria = diff
  }

  traverse(model, path, def) {

    path = path || '';
    model = model || {};
    def = typeof def === 'undefined' ? '' : def;
    var parts = path.split('.');

    if (parts.length == 1) {
      return model[parts[0]];
    }
    else if (parts.length == 2) {
      var arraySplit = parts[0].split('[0]');
      if (arraySplit.length > 1)
        if (model[arraySplit[0]].length > 0)
          return model[arraySplit[0]][0][parts[1]];
        else
          return "";
      else
        return model[parts[0]][parts[1]];
    }
    else if (parts.length == 3) {
      var arraySplit = parts[0].split('[0]');
      if (arraySplit.length > 1)
        if (model[arraySplit[0]].length > 0)
          return model[arraySplit[0]][0][parts[1]][parts[2]];
        else
          return "";
      else
        return model[parts[0]][parts[1]][parts[2]];
    }
  }
  GetFeeTypes() {
    debugger;
    this.loading = true;
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
    list.PageName = "SchoolFeeTypes";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeTypes = [...data.value];
        this.loading = false; this.PageLoading = false;
      })
  }
  ItemExists(obj, colname) {
    return obj.some((el) => {
      return el.col === colname;
    });
  }
  checkIfNestedColumnSearch(columnName) {
    var nestedcolumn = this.FilterColumns.filter(f => f.ReportName == columnName && f.TableNames.length > 0)
    if (nestedcolumn.length > 0) {
      {
        switch (columnName) {
          case "":
            this.SearchDropdownValue = this.getDropDownData('');
        }

        this.NestedColumnSearch = true;
      }
    }
    else
      this.NestedColumnSearch = false;

  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.AllMasterData);
    // let Id = 0;
    // let Ids = this.AllMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    // })
    // if (Ids.length > 0) {
    //   Id = Ids[0].MasterDataId;
    //   return this.AllMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   })
    // }
    // else
    //   return [];

  }
  GetStudents() {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "StudentClassId,StudentId,ClassId,RollNo,SectionId,SemesterId"
    ];
    list.PageName = "StudentClasses";
    list.filter = [this.FilterOrgSubOrgBatchId + " and IsCurrent eq true"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          var _students: any = this.tokenStorage.getStudents();
          _students = _students.filter(stud => data.value.findIndex(fi => fi.StudentId == stud.StudentId) > -1)

          this.Students = _students.map(student => {
            var _RollNo = '';
            var _name = '';
            var _className = '';
            var _section = '';
            var _studentClassId = 0;
            var matchstudentcls = data.value.filter(d => d.StudentId == student.StudentId);

            if (matchstudentcls.length > 0) {
              _studentClassId = matchstudentcls[0].StudentClassId;
              var _classNameobj = this.Classes.filter(c => c.ClassId == matchstudentcls[0].ClassId);

              if (_classNameobj.length > 0)
                _className = _classNameobj[0].ClassName;
             
                var _SectionObj = this.Sections.filter(f => f.MasterDataId == matchstudentcls[0].SectionId)
              if (_SectionObj.length > 0)
                _section = "-"+_SectionObj[0].MasterDataName;
                
                var _SemesterObj = this.Semesters.filter(f => f.MasterDataId == matchstudentcls[0].SemesterId)
              if (_SemesterObj.length > 0)
                _section += "-"+ _SemesterObj[0].MasterDataName;

              _RollNo = matchstudentcls[0].RollNo;
            }
            var _lastname = student.LastName == null || student.LastName == '' ? '' : " " + student.LastName;
            _name = student.FirstName + _lastname;
            var _fullDescription = _name + "-" + _className + _section + "-" + _RollNo //+ "-" + student.ContactNo;
            return {
              StudentClassId: _studentClassId,
              StudentId: student.StudentId,
              Name: _fullDescription,
              FatherName: student.FatherName + "-" + student.FatherContactNo,
              MotherName: student.MotherName + "-" + student.MotherContactNo,
            }
          })
        }
        this.loading = false; this.PageLoading = false;
      })
  }
  AddSearchFilter() {
    debugger;
    var columnName = this.searchForm.get("searchFilterColumn").value;
    var condition = this.searchForm.get("searchCondition").value;
    var value = this.searchForm.get("searchCriteria").value;

    var filtertext = '';

    //if the selected column is a nested column
    var nestedcolumn = this.FilterColumns.filter(f => f.ReportName == columnName && f.TableNames.length > 0)
    if (nestedcolumn.length > 0 || columnName.substr(columnName.length - 2) == 'Id') {
      var _Id = this.GetDropDownId(columnName, value);
      filtertext = columnName + " " + condition + " " + _Id;
      this.NestedfilterKeyValue.push({ "columnname": columnName, "condition": condition, "value": _Id })
    }
    else {
      this.filterKeyValue.push({ "columnname": columnName, "condition": condition, "value": value })
      filtertext = columnName + " " + condition + " '" + value + "'";
    }
    this.FilterCriteria.push(filtertext);

  }

  onNgModelChange(event) {
    debugger;
    this.searchCondition1 = event.option[0].value;
    //console.log('dd', this.searchCondition1);
  }
  ExportToExcel() {
    const datatoExport: Partial<any>[] = [...this.ReportConfigItemList];
    TableUtil.exportArrayToExcel(datatoExport, this.ReportName);
  }

}
export interface IReportConfigItem {
  ReportConfigItemId: number;
  ReportName: string;
  DisplayName: string;
  ParentId: number;
  Formula: string;
  ColumnSequence: number;
  ApplicationId: number;
  TableNames: string;
  OrgId: number;SubOrgId: number;
  UserId: string;
  Active: number;
  CreatedBy: string;
  CreatedDate: Date;
  UpdatedBy: string;
  UpdatedDate: Date;

}







