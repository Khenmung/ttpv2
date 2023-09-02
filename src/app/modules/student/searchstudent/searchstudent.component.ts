import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TableUtil } from '../../../shared/TableUtil';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import * as XLSX from 'xlsx';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ContentService } from '../../../shared/content.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-searchstudent',
  templateUrl: './searchstudent.component.html',
  styleUrls: ['./searchstudent.component.scss']
})
export class searchstudentComponent implements OnInit {
  PageLoading = true;
  @ViewChild("table") tableRef: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  loading = false;
  Defaultvalue=0;
  filterOrgIdNBatchId = '';
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  ELEMENT_DATA: IStudent[]=[];
  dataSource: MatTableDataSource<IStudent>;
  displayedColumns = [
    'PID',
    'RollNo',
    'Name',
    'ClassName',
    'FatherName',
    'MotherName',
    'FeeType',
    'Remarks',
    'Active',
    //'ReasonForLeaving',
    'Action'];
  allMasterData :any[]= [];
  Students :any[]= [];
  Genders :any[]= [];
  Classes :any[]= [];
  Batches :any[]= [];
  Bloodgroup :any[]= [];
  Category :any[]= [];
  Religion :any[]= [];
  States = []
  Remarks :any[]= [];
  PrimaryContact :any[]= [];
  Location :any[]= [];
  LanguageSubjUpper :any[]= [];
  LanguageSubjLower :any[]= [];
  FeeType :any[]= [];
  FeeDefinitions :any[]= [];
  Sections :any[]= [];
  Houses :any[]= [];
  StudentClasses :any[]= [];
  UploadTypes :any[]= [];
  ReasonForLeaving :any[]= [];
  Siblings :any[]= [];
  Semesters :any[]= [];
  SelectedApplicationId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  //SelectedBatchStudentIDRollNo :any[]= [];
  Clubs :any[]= [];
  ClassCategory :any[]= [];
  StudentClassId = 0;
  StudentId = 0;
  StudentFamilyNFriendList :any[]= [];
  StudentOfClass :any[]= [];
  studentSearchForm: UntypedFormGroup;
  filteredStudents: Observable<IStudent[]>;
  filteredFathers: Observable<IStudent[]>;
  filteredMothers: Observable<IStudent[]>;
  LoginUserDetail;
  FeePaymentPermission = '';
  StudentsFromCache :any[]= [];
  StudentSearch: any[] = [{
    StudentId: 0,
    ClassId: 0,
    SectionId: 0,
    RemarkId: 0,
    PID: 0,
    AdmissionNo: 0
  }]
  constructor(
    private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private route: Router,
    private fb: UntypedFormBuilder,
    private shareddata: SharedataService,
    private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == "") {
      this.route.navigate(['/auth/login']);
    }
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.FEEPAYMENT);
      if (perObj.length > 0) {
        this.FeePaymentPermission = perObj[0].permission;
      }
      //var perObj = globalconstants.getPermission(this.token, globalconstants.Pages.edu.STUDENT.SEARCHSTUDENT);
      this.ELEMENT_DATA = [];
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.filterOrgIdNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.StudentsFromCache = this.tokenStorage.getStudents()!;
      this.StudentsFromCache =this.AssignNameClassSection(this.StudentsFromCache)
      this.studentSearchForm = this.fb.group({
        searchSectionId: [0],
        searchSemesterId: [0],
        searchRemarkId: [0],
        searchPreviousClassId: [0],
        searchClassId: [0],
        searchPID: [0],
        searchStudentName: [''],
        FatherName: [''],
        MotherName: [''],
        searchAdmissionNo: [0]
      })
      //var searchstudent = this.token.getStudentSearch();
      //if (searchstudent.length > 0)

      this.allMasterData = this.tokenStorage.getMasterData()!;
      this.StudentSearch = this.tokenStorage.getStudentSearch()!;

      //var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      // this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      //   this.Classes = [...data.value];
      this.GetMasterData();

      this.GetFeeTypes();
      if (+localStorage.getItem('studentId')! > 0) {
        this.GetSibling();
      }
      //var _classId = this.studentSearchForm.get("searchClassId")?.value;
      //var _sectionId = this.studentSearchForm.get("searchSectionId")?.value;

    }

    this.filteredStudents = this.studentSearchForm.get("searchStudentName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.StudentsFromCache.slice())
      )!;
    this.filteredFathers = this.studentSearchForm.get("FatherName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.FatherName),
        map(Name => Name ? this._filterF(Name) : this.StudentsFromCache.slice())
      )!;
    this.filteredMothers = this.studentSearchForm.get("MotherName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.MotherName),
        map(Name => Name ? this._filterM(Name) : this.StudentsFromCache.slice())
      )!;
    // this.StudentSearch.forEach(fr=>{
    //   this.studentSearchForm.patchValue({[fr.Text]:fr.Value})
    // })
    //this.GetStudent();
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.StudentsFromCache.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  private _filterF(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    var arr = this.StudentsFromCache.filter(option => option.FatherName.toLowerCase().includes(filterValue));
    return arr;
  }
  private _filterM(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    var arr :any[]= [];
    if (name)
      arr = this.StudentsFromCache.filter(option => option.MotherName.toLowerCase().includes(filterValue));
    return arr;
  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  displayFnF(stud: IStudent): string {
    return stud && stud.FatherName ? stud.FatherName : '';
  }
  displayFnM(stud: IStudent): string {
    return stud && stud.MotherName ? stud.MotherName : '';
  }
  RemoveDuplicates(arr) {
    return arr.filter((item,
      index) => arr.indexOf(item) === index);
  }
  Groups :any[]= [];
  AdmissionStatus :any[]= [];
  GetMasterData() {


    this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
    this.shareddata.ChangeReasonForLeaving(this.ReasonForLeaving);

    //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.Batches = this.tokenStorage.getBatches()!;
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
    this.shareddata.ChangeCategory(this.Category);

    this.AdmissionStatus = this.getDropDownData(globalconstants.MasterDefinitions.school.ADMISSIONSTATUS);

    this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
    this.shareddata.ChangeReligion(this.Religion);

    this.States = this.getDropDownData(globalconstants.MasterDefinitions.common.STATE);
    this.shareddata.ChangeStates(this.States);

    this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions.school.PRIMARYCONTACT);
    this.shareddata.ChangePrimaryContact(this.PrimaryContact);

    this.Location = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.LOCATION);
    this.shareddata.ChangeLocation(this.Location);

    this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
    this.shareddata.ChangeGenders(this.Genders);

    this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
    this.shareddata.ChangeBloodgroup(this.Bloodgroup);

    this.LanguageSubjUpper = this.getDropDownData(globalconstants.MasterDefinitions.school.LANGUAGESUBJECTUPPERCLS);
    this.shareddata.ChangeLanguageSubjectUpper(this.LanguageSubjUpper);

    this.LanguageSubjLower = this.getDropDownData(globalconstants.MasterDefinitions.school.LANGUAGESUBJECTLOWERCLS);
    this.shareddata.ChangeLanguageSubjectLower(this.LanguageSubjLower);
    this.Remarks = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARKS);
    this.contentservice.GetFeeDefinitions(this.FilterOrgSubOrg, 1).subscribe((f: any) => {
      this.FeeDefinitions = [...f.value];
      this.shareddata.ChangeFeeDefinition(this.FeeDefinitions);
    });

    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.shareddata.ChangeSection(this.Sections);
    this.Clubs = this.getDropDownData(globalconstants.MasterDefinitions.school.CLUBS);
    this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
    this.shareddata.ChangeHouse(this.Houses);
    this.Clubs.forEach(c => {
      c.type = 'ClubId'
    })
    this.Houses.forEach(h => {
      h.type = 'HouseId'
    })
    this.Remarks.forEach(h => {
      h.type = 'RemarkId'
    })
    this.Groups.push({
      name: "Club",
      disable: true,
      group: this.Clubs
    },
      {
        name: "House",
        disable: true,
        group: this.Houses
      },
      {
        name: "Remarks",
        disable: true,
        group: this.Remarks
      }
    )
    //console.log("Groups", this.Groups)
    this.UploadTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.UPLOADTYPE);
    this.shareddata.ChangeUploadType(this.UploadTypes);

    this.loading = false; this.PageLoading = false;
    //this.getSelectedBatchStudentIDRollNo();
    this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
      this.Classes = [];
      data.value.map(m => {
        let obj = this.ClassCategory.filter((f:any) => f.MasterDataId == m.CategoryId);
        if (obj.length > 0) {
          m.Category = obj[0].MasterDataName.toLowerCase();
          this.Classes.push(m);
        }
      });
      this.GetStudents();
    });

    //this.GetStudentClasses();
    var searchObj = this.StudentSearch.filter((f:any) => f.Text == 'ClassId');
    if (searchObj.length > 0 && searchObj[0].Value > 0
      && this.LoginUserDetail[0]["RoleUsers"][0].role.toLowerCase() != 'student') {
      this.studentSearchForm.patchValue({ searchClassId: searchObj[0].Value })
      this.BindSemesterSection();
      var searchSectionIdObj = this.StudentSearch.filter((f:any) => f.Text == 'SectionId');
      if (searchSectionIdObj.length > 0 && searchSectionIdObj[0].Value > 0) {
        this.studentSearchForm.patchValue({ searchSectionId: searchSectionIdObj[0].Value })
        this.StudentOfClass = this.Students.filter((f:any) => f.ClassId == searchObj[0].Value && f.SectionId == searchSectionIdObj[0].Value);
      }
      else
        this.StudentOfClass = this.Students.filter((f:any) => f.ClassId == searchObj[0].Value);

      var searchFatherObj = this.StudentSearch.filter((f:any) => f.Text == 'FatherName');
      if (searchFatherObj.length > 0 && searchFatherObj[0].Value > 0) {
        var selectedFatherObj = this.Students.filter((f:any) => f.FatherName.includes(searchFatherObj[0].Value))
        this.studentSearchForm.patchValue({ FatherName: selectedFatherObj[0] })
      }
      var searchMotherObj = this.StudentSearch.filter((f:any) => f.Text == 'MotherName');
      if (searchMotherObj.length > 0 && searchMotherObj[0].Value > 0)
        this.studentSearchForm.patchValue({ MotherName: searchMotherObj[0].Value })
      var searchRemarkIdObj = this.StudentSearch.filter((f:any) => f.Text == 'RemarkId');
      if (searchRemarkIdObj.length > 0 && searchRemarkIdObj[0].Value > 0)
        this.studentSearchForm.patchValue({ searchRemarkId: searchRemarkIdObj[0].Value })
      // if (this.Students.length == 0)

    }

  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);

  }
  fee(id) {
    this.route.navigate(['/edu/addstudentfeepayment/' + id]);
  }
  class(id) {
    this.route.navigate(['/edu/addstudentcls/' + id]);
  }
  view(element) {
    debugger;
    this.generateDetail(element);
    // var _ClassId = 0;
    // if (element.StudentClasses.length > 0) {
    //   this.StudentClassId = element.StudentClasses[0].StudentClassId;
    //   _ClassId = element.StudentClasses[0].ClassId;
    // }

    // this.StudentId = element.StudentId;

    // this.token.saveStudentClassId(this.StudentClassId + "");
    // this.token.saveClassId(_ClassId + "");
    // this.token.saveStudentId(this.StudentId + "");
    this.SaveIds(element);
    this.route.navigate(['/edu/addstudent/' + element.StudentId]);
  }
  progressreport(element) {
    debugger;
    let StudentName = element.Name;
    var _clsName:string = '';
    var _sectionName = '';
    //let studentclass: any = this.SelectedBatchStudentIDRollNo.filter(sid => sid.StudentId == element.StudentId);
    let studentclass: any = this.Students.filter(sid => sid.StudentId == element.StudentId);
    if (studentclass.length > 0) {
      
      var objcls = this.Classes.filter((f:any) => f.ClassId == studentclass[0].ClassId);
      if (objcls.length > 0)
        _clsName = objcls[0].ClassName

      
      var sectionObj = this.Sections.filter((f:any) => f.MasterDataId == studentclass[0].SectionId)
      if (sectionObj.length > 0)
        _sectionName = sectionObj[0].MasterDataName;
      this.StudentClassId = studentclass[0].StudentClassId
      //StudentName += "-" + _clsName + "-" + _sectionName + "-" + studentclass[0].RollNo;
    }
    var StudentDetail = '"StudentName":"' + StudentName + '","ClassName":"' + _clsName + '", "Section":"' + _sectionName + '","RollNo":"' + studentclass[0].RollNo + '"';
    localStorage.setItem("StudentDetail", StudentDetail + "");
    //this.shareddata.ChangeStudentName(StudentName);
    this.tokenStorage.saveStudentClassId(this.StudentClassId + "");
    this.SaveIds(element);
    this.route.navigate(['/edu/progressreport/']);
  }

  BindSemesterSection() {
    this.SelectedClassCategory = '';
    var _classId = this.studentSearchForm.get("searchClassId")?.value;
    if (_classId > 0) {
      let obj = this.Classes.filter((f:any) => f.ClassId == _classId);
      if (obj.length > 0)
        this.SelectedClassCategory = obj[0].Category;
    }
    this.studentSearchForm.patchValue({ "searchSectionId": 0, "searchSemesterId": 0 });
    this.ClearData();
  }
  SelectedClassCategory = '';
  ClearData() {
    this.ELEMENT_DATA = [];
    this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
    var _classId = this.studentSearchForm.get("searchClassId")?.value;
    var _sectionId = this.studentSearchForm.get("searchSectionId")?.value;
    var _semesterId = this.studentSearchForm.get("searchSemesterId")?.value;
    this.StudentOfClass = this.Students.filter((f:any) => f.ClassId == _classId
      && f.SectionId == _sectionId ? _sectionId : f.SectionId
        && f.SemesterId == _semesterId ? _semesterId : f.SemesterId);

  }
  SelectStudent() {
    var _classId = this.studentSearchForm.get("searchClassId")?.value;
    var _sectionId = this.studentSearchForm.get("searchSectionId")?.value;
    var _semesterId = this.studentSearchForm.get("searchSemesterId")?.value;
    this.StudentOfClass = this.Students.filter((f:any) => f.ClassId == _classId
      && f.SectionId == _sectionId ? _sectionId : f.SectionId
        && f.SemesterId == _semesterId ? _semesterId : f.SemesterId);
  }
  feepayment(element) {
    this.generateDetail(element);
    this.SaveIds(element);
    this.route.navigate(['/edu/feepayment']);
  }
  generateDetail(element) {
    let StudentName = element.PID + ' ' + element.Name + ' ' + element.FatherName + ' ' + element.MotherName + ',';

    let studentclass = this.Students.filter(sid => sid.StudentId == element.StudentId);
    if (studentclass.length > 0) {
      var _clsName = '', _rollNo = '';
      _rollNo = studentclass[0].RollNo ? studentclass[0].RollNo : '';
      var objcls = this.Classes.filter((f:any) => f.ClassId == studentclass[0].ClassId);
      if (objcls.length > 0)
        _clsName = objcls[0].ClassName;

      var _sectionName = '';
      var sectionObj = this.Sections.filter((f:any) => f.MasterDataId == studentclass[0].SectionId)
      if (sectionObj.length > 0)
        _sectionName = sectionObj[0].MasterDataName;
      this.StudentClassId = studentclass[0].StudentClassId
      StudentName += "-" + _clsName + "-" + _sectionName + "-" + _rollNo;
    }

    this.shareddata.ChangeStudentName(StudentName);

    //this.shareddata.ChangeStudentClassId(this.StudentClassId);
    this.tokenStorage.saveStudentClassId(this.StudentClassId.toString());
    this.tokenStorage.saveStudentId(element.StudentId);
    //this.shareddata.ChangeStudentId(element.StudentId);

  }
  SaveIds(element) {
    debugger;
    var _ClassId = 0;
    //if (element.StudentClasses.length > 0) {
    if (element.StudentClasses != undefined) {
      this.StudentClassId = element.StudentClassId;
      _ClassId = element.ClassId;
    }

    this.StudentId = element.StudentId;

    this.tokenStorage.saveStudentClassId(this.StudentClassId + "");
    this.tokenStorage.saveClassId(_ClassId + "");
    this.tokenStorage.saveStudentId(this.StudentId + "");

  }
  new() {
    //var url = this.route.url;
    this.tokenStorage.saveStudentId("0");
    this.tokenStorage.saveStudentClassId("0");
    this.shareddata.ChangeStudentName("");
    this.route.navigate(['/edu/addstudent']);
  }
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.tableRef.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'basicinfo.xlsx');
  }
  exportArray() {
    const datatoExport: any[] = this.ELEMENT_DATA.map(x => ({
      StudentId: x.StudentId,
      Name: x.Name,
      FatherName: x.FatherName,
      Class: '',
      RollNo: '',
      Section: '',
      AdmissionDate: null
    }));
    TableUtil.exportArrayToExcel(datatoExport, "ExampleArray");
  }
  // getSelectedBatchStudentIDRollNo() {
  //   let list: List = new List();
  //   list.fields = ["StudentId", "RollNo", "SectionId", "StudentClassId", "ClassId"];
  //   list.PageName = "StudentClasses";
  //   list.filter = [this.filterOrgIdNBatchId];

  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       if (data.value.length > 0) {
  //         this.SelectedBatchStudentIDRollNo = [...data.value];

  //       }
  //     })
  // }

  GetFeeTypes() {
    debugger;
    this.loading = true;
    //var filter = globalconstants.getOrgSubOrgBatchIdFilter(this.token);
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
    list.PageName = "SchoolFeeTypes";
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeType = [...data.value];
        this.shareddata.ChangeFeeType(this.FeeType);
        this.loading = false; this.PageLoading = false;
      })
  }
  GetStudent() {
    debugger;
    this.loading = true;
    let checkFilterString = "";//"OrgId eq " + this.LoginUserDetail[0]["orgId"] + ' and Batch eq ' + 

    var _studentId = 0;
    var objstudent = this.studentSearchForm.get("searchStudentName")?.value;
    if (objstudent.StudentId)
      _studentId = objstudent.StudentId;

    var fatherObj = this.studentSearchForm.get("FatherName")?.value;
    var _fathername = fatherObj.FatherName;

    var motherObj = this.studentSearchForm.get("MotherName")?.value;
    var _mothername = motherObj.MotherName;

    var _ClassId = this.studentSearchForm.get("searchClassId")?.value;
    var _semesterId = this.studentSearchForm.get("searchSemesterId")?.value;
    var _sectionId = this.studentSearchForm.get("searchSectionId")?.value;
    var _remarkId = this.studentSearchForm.get("searchRemarkId")?.value;

    var _PID = this.studentSearchForm.get("searchPID")?.value;
    var _searchAdmissionNo = this.studentSearchForm.get("searchAdmissionNo")?.value;

    // if (_fathername == undefined && _mothername == undefined && _sectionId == 0 && _searchAdmissionNo == 0 && _remarkId == 0
    //   && _ClassId == 0 && _PID == 0 && (_studentId == 0 || objstudent == undefined)) {
    //   this.loading = false; this.PageLoading = false;
    //   this.contentservice.openSnackBar("Please enter atleast one parameter.", globalconstants.ActionText, globalconstants.RedBackground);
    //   this.token.saveStudentSearch([]);
    //   return;
    // }
    this.StudentSearch = [];
    var filteredStudents = JSON.parse(JSON.stringify(this.Students));
    if (_studentId != 0) {
      //this.StudentSearch[0].Name = this.studentSearchForm.get("searchStudentName")?.value.Name;
      checkFilterString += " and StudentId eq " + _studentId;
      filteredStudents = filteredStudents.filter(fromallstud => fromallstud.StudentId == _studentId)
    }
    if (_PID > 0) {
      filteredStudents = filteredStudents.filter(fromallstud => fromallstud.PID == _PID)
      if (filteredStudents.length > 0)
        checkFilterString += " and StudentId eq " + filteredStudents[0].StudentId;
    }
    if (_fathername != undefined) {
      this.StudentSearch.push({ Text: "FatherName", Value: _fathername });
      //checkFilterString += " and FatherName eq '" + _fathername + "'"
      filteredStudents = filteredStudents.filter(fromallstud => fromallstud.FatherName.includes(_fathername))
    }
    if (_mothername != undefined) {
      this.StudentSearch.push({ Text: "MotherName", Value: _mothername });
      //checkFilterString += " and MotherName eq '" + _mothername + "'"
      filteredStudents = filteredStudents.filter(fromallstud => fromallstud.MotherName.includes(_mothername))
    }


    var classfilter = '';
    if (_ClassId > 0) {
      this.StudentSearch.push({ Text: "ClassId", Value: _ClassId });

    }
    if (_semesterId > 0) {
      this.StudentSearch.push({ Text: "SemesterId", Value: _semesterId });
    }

    if (_studentId == 0 && _PID == 0 && !_mothername && !_fathername && _remarkId == 0) {
      if (_ClassId == 0) {
        this.loading = false;
        this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
      else {

        classfilter = ' and ClassId eq ' + _ClassId;
        if (_semesterId > 0)
          classfilter += ' and SemesterId eq ' + _semesterId;
        if (_sectionId > 0)
          classfilter += ' and SectionId eq ' + _sectionId;
          
        classfilter += ' and IsCurrent eq true';

        if (_remarkId > 0) {
          var obj :any[]= [];
          this.Groups.forEach(f => {
            var check = f.group.filter(h => h.MasterDataId == _remarkId);
            if (check.length > 0)
              obj.push(check[0]);
          });
          this.StudentSearch.push({ Text: obj[0].type, Value: _remarkId });
          //checkFilterString += " and " + obj[0].type + " eq " + _remarkId;
          filteredStudents = filteredStudents.filter(fromallstud => fromallstud[obj[0].type] == _remarkId)
        }
      }
    }
    else {
      if (_remarkId > 0) {
        var obj :any[]= [];
        this.Groups.forEach(f => {
          var check = f.group.filter(h => h.MasterDataId == _remarkId);
          if (check.length > 0)
            obj.push(check[0]);
        });
        this.StudentSearch.push({ Text: obj[0].type, Value: _remarkId });
        //checkFilterString += " and " + obj[0].type + " eq " + _remarkId;
        filteredStudents = filteredStudents.filter(fromallstud => fromallstud[obj[0].type] == _remarkId)
      }
    }
    if (_searchAdmissionNo > 0) {
      classfilter += " and AdmissionNo eq '" + _searchAdmissionNo + "'"
    }

    if (_sectionId > 0) {
      this.StudentSearch.push({ Text: "SectionId", Value: _sectionId });

    }
    if (_semesterId > 0) {
      this.StudentSearch.push({ Text: "SemesterId", Value: _semesterId });
    }

    if (this.StudentSearch.length > 0)
      this.tokenStorage.saveStudentSearch(this.StudentSearch);
    else
      this.tokenStorage.saveStudentSearch([]);
    let list: List = new List();

    list.fields = ["StudentId,StudentClassId,HouseId,BatchId,SectionId,ClassId,RollNo,SemesterId,FeeTypeId,Remarks"];

    //list.lookupFields = ["StudentClasses($filter=" + classfilter + "BatchId eq " + this.SelectedBatchId + ";$select=StudentClassId,HouseId,BatchId,SectionId,ClassId,RollNo,FeeTypeId,Remarks)"];
    list.PageName = "StudentClasses";
    var filterstr = this.FilterOrgSubOrgBatchId + classfilter + checkFilterString;
    list.filter = [filterstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        ////console.log(data.value);
        //if (data.value.length > 0) {
        var formattedData :any[]= [];
        if (data.value.length > 0) {
          filteredStudents.forEach(s => {
            var existInCurrentStudentClass = data.value.filter((f:any) => f.StudentId == s.StudentId);
            if (existInCurrentStudentClass.length > 0) {
              s.StudentClasses = existInCurrentStudentClass;
              formattedData.push(s);
            }
          })

          formattedData = formattedData.filter(sc => {
            let reason = this.ReasonForLeaving.filter(r => r.MasterDataId == sc.ReasonForLeavingId)
            if (sc.StudentClasses != undefined && sc.StudentClasses.length > 0) {
              var obj = this.FeeType.filter((f:any) => f.FeeTypeId == sc.StudentClasses[0].FeeTypeId);
              if (obj.length > 0) {
                sc.FeeType = obj[0].FeeTypeName
              }
              else
                sc.FeeType = '';
            }
            else
              sc.FeeType = '';

            sc.ReasonForLeaving = reason.length > 0 ? reason[0].MasterDataName : '';
            return sc;
          });
          this.ELEMENT_DATA = [];
          formattedData.forEach(item => {
            var _lastname = item.LastName == null ? '' : " " + item.LastName;
            item.Name = item.FirstName + _lastname;
            var _remark = '';
            var objremark = this.Remarks.filter((f:any) => f.MasterDataId == item.RemarkId);
            if (objremark.length > 0) {
              _remark = objremark[0].MasterDataName
              item.Remarks = _remark;
            }
            else
              item.Remarks = '';
            // if (item.StudentClasses.length == 0) 
            if (item.StudentClasses == undefined) {
              item.ClassName = '';
            }
            else {
              item.RollNo = item.RollNo;
              var clsobj = this.Classes.filter(cls => {
                return cls.ClassId == item.ClassId
              });
              if (clsobj.length > 0) {
                var objsection = this.Sections.filter((s:any) => s.MasterDataId == item.StudentClasses[0].SectionId);
                if (objsection.length > 0)
                  item.ClassName = clsobj[0].ClassName + "-" + objsection[0].MasterDataName;
                else
                  item.ClassName = clsobj[0].ClassName;
                var objsemester = this.Semesters.filter((s:any) => s.MasterDataId == item.StudentClasses[0].SemesterId);
                if (objsemester.length > 0)
                  item.ClassName = clsobj[0].ClassName + "-" + objsemester[0].MasterDataName;
              }
              else
                item.ClassName = '';
            }
            item.Action = "";
            this.ELEMENT_DATA.push(item);
          })
        }
        //else {
        if (this.ELEMENT_DATA.length == 0)
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        //}
        //console.log("this.ELEMENT_DATA", this.ELEMENT_DATA);
        this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a,b)=>a["RollNo"] - b["RollNo"])
        this.dataSource = new MatTableDataSource<IStudent>(this.ELEMENT_DATA);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;

        // else {
        //   formattedData = [...filteredStudents];
        // }
      });

    //}
  }
  // GetStudentClasses() {
  //   debugger;
  //   var filterOrgIdNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.token);
  //   var _ClassId = this.studentSearchForm.get("searchClassId")?.value;
  //   var _sectionId = this.studentSearchForm.get("searchSectionId")?.value;
  //   //if (_ClassId > 0)
  //   filterOrgIdNBatchId += " and ClassId eq " + _ClassId;
  //   if (_sectionId > 0)
  //     filterOrgIdNBatchId += " and SectionId eq " + _sectionId;

  //   let list: List = new List();
  //   list.fields = ["StudentClassId,StudentId,ClassId,RollNo,SectionId"];
  //   list.PageName = "StudentClasses";
  //   list.filter = [filterOrgIdNBatchId];

  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.StudentClasses = [...data.value];
  //       this.GetStudents();
  //     })
  // }
  GetSibling() {

    var _studentId = localStorage.getItem('studentId');
    var StudentFamilyNFriendListName = 'StudentFamilyNFriends';
    var filterStr = 'Active eq 1 and StudentId eq ' + _studentId;

    let list: List = new List();
    list.fields = [
      'StudentFamilyNFriendId',
      'StudentId',
      'Name',
      'FatherName',
      'MotherName',
      'ContactNo',
      'RelationshipId',
      'ParentStudentId',
      'Active'
      //      'RemarkId'
    ];
    list.PageName = StudentFamilyNFriendListName;
    list.filter = [filterStr];
    //this.StudentFamilyNFriendList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(m => {
          if (m.SiblingId > 0)
            this.Siblings.push(m);
        });
      });
  }
  GetStudents() {
    debugger;
    var _tempStudent :any[]= [];
    if (this.LoginUserDetail[0]["RoleUsers"][0].role.toLowerCase() == 'student') {
      //list.lookupFields = ["StudentFamilyNFriends($select=StudentId,ParentStudentId)"]
      this.studentSearchForm.get("searchClassId")?.disable()
      this.studentSearchForm.get("searchSectionId")?.disable();
      this.studentSearchForm.get("searchSemesterId")?.disable();
      this.studentSearchForm.get("searchRemarkId")?.disable();
      this.studentSearchForm.get("searchAdmissionNo")?.disable();
      this.studentSearchForm.get("searchPID")?.disable();

      var _studentId = localStorage.getItem('studentId');
      if (this.Siblings.length > 0) {
        _tempStudent = this.StudentsFromCache.filter((s:any) => s.StudentId == _studentId || s.ParentStudentId == this.Siblings[0].ParentStudentId)
        //standardfilter += ' and (StudentId eq ' + _studentId + ' or ParentStudentId eq ' + this.Siblings[0].ParentStudentId + ")";
      }
      else {
        _tempStudent = this.StudentsFromCache.filter((s:any) => s.StudentId == _studentId);

      }

    }
    else {
      _tempStudent = [...this.StudentsFromCache]//this.StudentsFromCache.filter(nocls => nocls.StudentClasses.length == 0);
    }

    this.loading = true;
    if (_tempStudent.length > 0) {
      if (this.LoginUserDetail[0]["RoleUsers"][0].role.toLowerCase() == 'student') {
        var _students :any[]= [];
        _tempStudent.forEach(student => {
          if (student.StudentFamilyNFriends) {
            var indx = student.StudentFamilyNFriends.findIndex(sibling => sibling.StudentId == student.StudentId)
            if (indx > -1) {
              _students.push(student);
            }
          }
          else if (student.StudentId == _studentId) {
            _students.push(student);
          }
        })
      }
      else {
        _students = [..._tempStudent];
      }
      var fatherObj = this.studentSearchForm.get("FatherName")?.value;
      var _fathername = fatherObj.FatherName;
      var motherObj = this.studentSearchForm.get("MotherName")?.value;
      var _mothername = motherObj.MotherName;
      // if (this.StudentClasses.length == 0 && _fathername == undefined && _mothername == undefined) {
      //   _students = this.Students.filter((f:any) => f.StudentClasses.length == 0);
      // }
      this.Students= this.AssignNameClassSection(_students);

      //  this.filteredStudents  = this.studentSearchForm.get("searchStudentName")?.valueChanges
      //     .pipe(
      //       startWith(''),
      //       map(value => typeof value === 'string' ? value : value.Name),
      //       map(Name => Name ? this._filter(Name) : this.Students.slice())
      //     );
      // this.filteredFathers = this.studentSearchForm.get("FatherName")?.valueChanges
      //   .pipe(
      //     startWith(''),
      //     map(value => typeof value === 'string' ? value : value.FatherName),
      //     map(Name => Name ? this._filterF(Name) : this.Students.slice())
      //   );
      // this.filteredMothers = this.studentSearchForm.get("MotherName")?.valueChanges
      //   .pipe(
      //     startWith(''),
      //     map(value => typeof value === 'string' ? value : value.MotherName),
      //     map(Name => Name ? this._filterM(Name) : this.Students.slice())
      //   );
    }
    //this.token.saveStudents(this.Students);
    this.loading = false;
    this.PageLoading = false;
    //})
  }
  AssignNameClassSection(pStudents) {
    let _students:any=[];
    pStudents.forEach(student => {
      var _RollNo = '';
      var _name = '';
      var _className = '';
      var _classId = 0;
      var _section = '';
      var _sectionId = 0;
      var _studentClassId = 0;
      var _semesterId = 0;
      var _semester = '';
      //var studentclassobj = this.StudentClasses.filter((f:any) => f.StudentId == student.StudentId);
      //if (studentclassobj.length > 0) {
      if (student.StudentClasses && student.StudentClasses.length > 0) {
        _studentClassId = student.StudentClasses[0].StudentClassId;
        if (student.FirstName && student.FirstName.includes('Bertrand')) {
          debugger;
        }
        var _classNameobj = this.Classes.filter(c => c.ClassId == student.StudentClasses[0].ClassId);
        if (_classNameobj.length > 0)
          _className = _classNameobj[0].ClassName;

        var _SectionObj = this.Sections.filter((f:any) => f.MasterDataId == student.StudentClasses[0].SectionId)
        if (_SectionObj.length > 0)
          _section = _SectionObj[0].MasterDataName;

        var _SemesterObj = this.Semesters.filter((f:any) => f.MasterDataId == student.StudentClasses[0].SemesterId)
        if (_SemesterObj.length > 0)
          _semester = _SemesterObj[0].MasterDataName;

        _RollNo = student.StudentClasses[0].RollNo ? student.StudentClasses[0].RollNo : '';
        _classId = student.StudentClasses[0].ClassId;
        _sectionId = student.StudentClasses[0].SectionId;
        _semesterId = student.StudentClasses[0].SemesterId;
      }
      student.PersonalNo = student.PersonalNo == null ? '' : student.PersonalNo;
      var _lastname = student.LastName ? " " + student.LastName : '';
      _name = student.FirstName + _lastname;
      var _fullDescription = student.PID + "-" + _name + "-" + _className + "-" + _section;
      student.StudentClassId = _studentClassId;
      student.ClassId = _classId;
      student.RollNo = _RollNo;
      student.SectionId = _sectionId;
      student.Name = _fullDescription;
      student.ClassName = _className;
      student.Semester = _semester;
      _students.push(student);

    })
    return _students;
  }

}
export interface IStudent {
  StudentId: number;
  PID: number;
  Name: string;
  FatherName: string;
  MotherName: string;
  FatherContactNo: string;
  MotherContactNo: string;
  Active: boolean;
  Action: boolean;
}
export interface IStudentDownload {
  StudentId: number;
  Name: string;
  FatherName: string;
  AdmissionDate: Date;
  Class: string;
  RollNo: string;
  Section: string;
}


