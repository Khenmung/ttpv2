//import { DatePipe, DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
//import alasql from 'alasql';
import { evaluate } from 'mathjs';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/internal/operators/startWith';
import { map } from 'rxjs/operators';
import { IStudent } from '../../../modules/admission/AssignStudentClass/Assignstudentclassdashboard.component';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
//import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
//import { SwUpdate } from '@angular/service-worker';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-generatecertificate',
  templateUrl: './generatecertificate.component.html',
  styleUrls: ['./generatecertificate.component.scss']
})
export class GenerateCertificateComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("printSection") printSection: ElementRef;
  Defaultvalue=0;
  PageLoading = true;
  backgroundimage = '';
  loading = false;
  LoginUserDetail :any[]= [];
  Permission = '';
  rowCount = 0;
  ExamStudentSubjectResult: IExamStudentSubjectResult[]= [];
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  SelectedBatchId = 0; SubOrgId = 0;
  DisplayColumn :any[]= [];
  GeneratedCertificatelist :any[]= [];
  AttendanceStatus :any[]= [];
  SubjectMarkComponents :any[]= [];
  MarkComponents :any[]= [];
  StudentGrades :any[]= [];
  StudentForVariables :any[]= [];
  FeePaidLastMonth = 0;
  AchievementAndPoints :any[]= [];
  PointCategory :any[]= [];
  Students :any[]= [];
  Genders :any[]= [];
  Classes :any[]= [];
  ClassGroups :any[]= [];
  Subjects :any[]= [];
  Sections :any[]= [];
  ExamStatuses :any[]= [];
  ExamNames :any[]= [];
  Exams :any[]= [];
  Batches :any[]= [];
  Houses :any[]= [];
  City :any[]= [];
  State :any[]= [];
  Country :any[]= [];
  BloodGroup :any[]= [];
  Category :any[]= [];
  Religion :any[]= [];
  ReasonForLeaving :any[]= [];
  CertificateElements :any[]= [];
  CertificateTypes :any[]= [];
  StudentSubjects :any[]= [];
  CommonStyles :any[]= [];
  CommonHeader :any[]= [];
  CommonFooter :any[]= [];
  Organization :any[]= [];
  StudentAttendanceList :any[]= [];
  StudentClasses :any[]= [];
  dataSource: MatTableDataSource<any>;
  ActivityResultDataSource: MatTableDataSource<any>;
  allMasterData :any[]= [];
  //studentSearchForm: FormGroup;
  filteredStudents: Observable<IStudent[]>;
  //filteredOptions: Observable<IStudent[]>;
  AttendanceStatusSum = 0;
  ExamId = 0;
  StudentClassId = 0;
  SelectedApplicationId = 0;
  ExamStudentSubjectResultData = {
    ExamStudentSubjectResultId: 0,
    ExamId: 0,
    StudentClassSubjectId: 0,
    ClassSubjectMarkComponentId: 0,
    Marks: 0,
    ExamStatus: 0,
    OrgId: 0, SubOrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    'Description',
  ];
  searchForm: UntypedFormGroup;
  constructor(
    //private servicework: SwUpdate,
    //@Inject(DOCUMENT) private document: Document,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    //private route: ActivatedRoute,
    private nav: Router,
    //private shareddata: SharedataService,
    //private datepipe: DatePipe,
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
    //this.loadTheme();
    //debugger;
    this.searchForm = this.fb.group({
      searchExamId: [0],
      searchClassId: [0],
      searchStudentGroupId: [0],
      searchActivityId: [0],
      searchCategoryId: [0],
      searchSubCategoryId: [0],
      searchStudentName: [''],
      searchSessionId: [0],
      searchCertificateTypeId: [0]
    });
    this.filteredStudents = this.searchForm.get("searchStudentName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      )!;
    this.PageLoad();
  }
  loadTheme(strStyle: string) {
    //const headEl = this.document.getElementsByTagName("head")[0];
    //const headEl = this.document.getElementsByTagName("head")[0];
    const headEl = window.document.getElementsByTagName("head")[0];
    const styleEl = window.document.createElement('style');
    styleEl.innerText = strStyle;
    headEl.appendChild(styleEl);
    //////console.log('dd', styleEl)
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
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.StudentClassId = +this.tokenStorage.getStudentClassId()!;
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SPECIALFEATURE.GENERATECERTIFICATE);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

      if (this.Permission != 'deny') {
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
          if(data.value) this.Classes = [...data.value]; else this.Classes = [...data];
          this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
        });

        this.GetMasterData();
        //var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        // this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
        //   if(data.value) this.Classes = [...data.value]; else this.Classes = [...data];
        // });
        this.GetAllCertificateConfig();
      }
      else {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
    }
  }


  GetStudentAndGenerateCerts() {
    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = this.FilterOrgSubOrgBatchId;// + ' and Active eq 1';
    let list: List = new List();

    if (this.StudentClassId == 0) {
      list.fields = [
        "StudentClassId",
        "ClassId",
        "StudentId"
      ];
    }
    else {

      filterstr += " and StudentClassId eq " + this.StudentClassId;
      list.fields = [
        "StudentClassId",
        "ClassId",
        "SectionId",
        "RollNo",
        "AdmissionDate",
        "AdmissionNo",
        "StudentId",
        "BatchId",
        "HouseId"
      ];
    }
    list.PageName = "StudentClasses";
    if (this.StudentClassId == 0) {
      list.lookupFields = ["Student($select=FirstName,LastName)"];
    }
    else
      list.lookupFields = [
        "Student($select=FirstName,LastName," +
        "FatherName,MotherName,Gender,PermanentAddress," +
        "PresentAddress," +
        "WhatsAppNumber," +
        "DOB," +
        "Bloodgroup," +
        "Category," +
        "BankAccountNo," +
        "IFSCCode," +
        "MICRNo," +
        "AdhaarNo," +
        "Religion," +
        "PersonalNo," +
        "HouseId," +
        "AlternateContact," +
        "EmailAddress," +
        "LastSchoolPercentage," +
        "TransferFromSchool," +
        "TransferFromSchoolBoard," +
        "RemarkId," +
        "FatherOccupation," +
        "FatherContactNo," +
        "MotherContactNo," +
        "MotherOccupation," +
        "NameOfContactPerson," +
        "RelationWithContactPerson," +
        "ContactPersonContactNo," +
        "ReasonForLeavingId)"];
    list.filter = [filterstr];

    this.dataservice.get(list).subscribe((data: any) => {
      if (this.StudentClassId == 0) {
        this.Students = data.value.map(d => {
          var _lastName = d.Student.LastName == null ? '' : d.Student.LastName;
          d.Name = d.Student.FirstName + " " + _lastName;
          return {
            StudentId: d.StudentId,
            Name: d.Name,
            StudentClassId: d.StudentClassId
          }
        });
        this.loading = false; this.PageLoading = false;
      }
      else {
        //////console.log('data.value',data.value)
        debugger;
        this.StudentForVariables = [];
        var _groupName = '', _activityName = '', _activityCategory = '', _activitySubCategory = '', _activitySession = '', _Rank = '';
        if (this.SelectedActivity.length > 0) {
          _groupName = this.SelectedActivity[0].GroupName;
          _activityName = this.SelectedActivity[0].SportsName;
          _activityCategory = this.SelectedActivity[0].Category;
          _activitySubCategory = this.SelectedActivity[0].SubCategory;
          _activitySession = this.SelectedActivity[0].Session;
          _Rank = this.SelectedActivity[0].Rank;
        }

        data.value.forEach(d => {

          var _studentClass = '';
          var classObj = this.Classes.filter(c => c.ClassId == d.ClassId);
          if (classObj.length > 0)
            _studentClass = classObj[0].ClassName
          var _section = d.SectionId == null ? '' : "-" + this.Sections.filter(c => c.MasterDataId == d.SectionId)[0].MasterDataName;
          var _gender = d.Student.Gender == null ? '' : this.Genders.filter(c => c.MasterDataId == d.Student.Gender)[0].MasterDataName;
          var _bloodgroup = d.Student.Bloodgroup == null ? '' : this.BloodGroup.filter(c => c.MasterDataId == d.Student.Bloodgroup)[0].MasterDataName;
          var _category = d.Student.Category == null ? '' : this.Category.filter(c => c.MasterDataId == d.Student.Category)[0].MasterDataName;
          var _religion = d.Student.Religion == null ? '' : this.Religion.filter(c => c.MasterDataId == d.Student.Religion)[0].MasterDataName;
          var _reasonobj = d.Student.ReasonForLeavingId == null ? '' : this.ReasonForLeaving.filter(c => c.MasterDataId == d.Student.ReasonForLeavingId)
          var _reason = '';
          if (_reasonobj.length > 0)
            _reason = _reasonobj[0].MasterDataName;
          var _batch = this.Batches.filter(c => c.BatchId == d.BatchId)[0].BatchName;
          var _house = '';
          var objhouse = this.Houses.filter(c => c.MasterDataId == d.Student.HouseId);
          if (objhouse.length > 0)
            _house = objhouse[0].MasterDataName;
          var _lastname = d.Student.LastName == null || d.Student.LastName == '' ? '' : " " + d.Student.LastName;
          this.StudentForVariables.push(
            { name: "ToDay", val: moment(new Date()).format('DD/MM/YYYY') },
            { name: "StudentClass", val: _studentClass + _section },
            { name: "Section", val: _section },
            { name: "RollNo", val: d.RollNo },
            { name: "AdmissionNo", val: d.AdmissionNo },
            { name: "AdmissionDate", val: moment(d.AdmissionDate).format('DD/MM/YYYY') },
            { name: "StudentName", val: d.Student.FirstName + _lastname },
            { name: "FatherName", val: d.Student.FatherName },
            { name: "MotherName", val: d.Student.MotherName },
            { name: "Gender", val: _gender },
            { name: "PermanentAddress", val: d.Student.PermanentAddress },
            { name: "PresentAddress", val: d.Student.PresentAddress },
            { name: "WhatsAppNumber", val: d.Student.WhatsAppNumber },
            { name: "PinCode", val: d.Student.Pincode },
            { name: "DOB", val: moment(d.Student.DOB).format('DD/MM/YYYY') },
            { name: "BloodGroup", val: _bloodgroup },
            { name: "Category", val: _category },
            { name: "BankAccountNo", val: d.Student.BankAccountNo },
            { name: "IFSCCode", val: d.Student.IFSCCode },
            { name: "MICRNo", val: d.Student.MICRNo },
            { name: "AdhaarNo", val: d.Student.AdhaarNo },
            { name: "Religion", val: _religion },
            { name: "PersonalNo", val: d.Student.PersonalNo },
            { name: "AlternateContact", val: d.Student.AlternateContact },
            { name: "EmailAddress", val: d.Student.EmailAddress },
            { name: "LastSchoolPercentage", val: d.Student.LastSchoolPercentage },
            { name: "TransferFromSchool", val: d.Student.TransferFromSchool },
            { name: "TransferFromSchoolBoard", val: d.Student.TransferFromSchoolBoard },
            { name: "FatherOccupation", val: d.Student.FatherOccupation },
            { name: "FatherContactNo", val: d.Student.FatherContactNo },
            { name: "MotherContactNo", val: d.Student.MotherContactNo },
            { name: "MotherOccupation", val: d.Student.MotherOccupation },
            { name: "NameOfContactPerson", val: d.Student.NameOfContactPerson },
            { name: "RelationWithContactPerson", val: d.Student.RelationWithContactPerson },
            { name: "ContactPersonContactNo", val: d.Student.ContactPersonContactNo },
            { name: "ReasonForLeaving", val: _reason },
            { name: "Batch", val: _batch },
            { name: "House", val: _house },
            { name: "GroupName", val: _groupName },
            { name: "ActivityName", val: _activityName },
            { name: "ActivityCategory", val: _activityCategory },
            { name: "ActivitySubCategory", val: _activitySubCategory },
            { name: "ActivitySession", val: _activitySession },
            { name: "Secured", val: _Rank }
          )
        })

        this.StudentForVariables.push(
          { name: "FeePaidTill", val: this.FeePaidLastMonth },
          { name: "Attendance", val: this.AttendanceStatusSum }
        )
        this.Organization[0].forEach(o => {
          this.StudentForVariables.push({ "name": o.name, val: o.val });
        })
        var examId = this.searchForm.get("searchExamId")?.value;
        var examName = '';
        if (examId > 0)
          examName = this.Exams.filter(z => z.ExamId == examId)[0].ExamName;

        this.ExamStudentResults.forEach(e => {
          this.StudentForVariables.push({
            "name": e.FirstCol, val: e[examName]
          })
        })

        ////console.log('this.StudentForVariables',this.StudentForVariables);
        this.GenerateCertificate();

      }

    });

  }
  clearData() {

  }
  // GetExams() {

  //   var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

  //   let list: List = new List();

  //   list.fields = [
  //     "ExamId", "ExamNameId", "ClassGroupId",
  //     "StartDate", "EndDate",
  //     "ReleaseResult", "AttendanceStartDate"];
  //   list.PageName = "Exams";
  //   list.filter = ["Active eq 1 " + orgIdSearchstr];
  //   //list.orderBy = "ParentId";

  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       this.Exams = [];
  //       data.value.forEach(e => {
  //         //var _examName = '';
  //         var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId && n.Active == 1)
  //         if (obj.length > 0) {
  //           //_examName = obj[0].MasterDataName
  //           this.Exams.push({
  //             ExamId: e.ExamId,
  //             ExamName: obj[0].MasterDataName,
  //             ClassGroupId: e.ClassGroupId,
  //             StartDate: e.StartDate,
  //             EndDate: e.EndDate,
  //             AttendanceStartDate: e.AttendanceStartDate,
  //             //AttendanceModeId: e.AttendanceModeId,
  //             Sequence: obj[0].Sequence,
  //             ReleaseResult: e.ReleaseResult
  //           })
  //         }
  //       })
  //       this.Exams = this.Exams.sort((a, b) => a.Sequence - b.Sequence);
  //     })
  // }
  ExamStudentResults :any[]= [];
  DisplayColumns = [
    "FirstCol"
  ];
  GetExamGrandTotal() {
    debugger;
    let filterStr = this.FilterOrgSubOrg + ' and Active eq 1';
    var _examId = this.searchForm.get("searchExamId")?.value;

    filterStr += ' and StudentClassId eq ' + this.StudentClassId;
    filterStr += ' and ExamId eq ' + _examId;

    let list: List = new List();
    list.fields = [
      "ExamId",
      "StudentClassId",
      "TotalMarks",
      "MarkPercent",
      "Attendance",
      "ClassStrength",
      "Division",
      "Rank",
      "Active"
    ];

    list.PageName = "ExamStudentResults";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ExamStudentResults = [];
        this.ExamStudentResults.push(
          { "FirstCol": "Grand Total" },
          { "FirstCol": "Percentage (%)" },
          { "FirstCol": "Division" },
          { "FirstCol": "Rank" },
          { "FirstCol": "Attendance" },
          { "FirstCol": "Class Strength" });
        var ToInclude = [
          { "ColumnName": "TotalMarks", "Display": "Grand Total" },
          { "ColumnName": "MarkPercent", "Display": "Percentage (%)" },
          { "ColumnName": "Division", "Display": "Division" },
          { "ColumnName": "Rank", "Display": "Rank" },
          { "ColumnName": "Attendance", "Display": "Attendance" },
          { "ColumnName": "ClassStrength", "Display": "Class Strength" }
        ]

        data.value.forEach(eachexam => {
          var _ExamName = '';
          var obj = this.Exams.filter(exam => exam.ExamId == eachexam.ExamId);
          if (obj.length > 0) {
            _ExamName = obj[0].ExamName;
            eachexam.ExamName = _ExamName;
            if (this.DisplayColumns.indexOf(_ExamName) == -1)
              this.DisplayColumns.push(_ExamName);
            Object.keys(eachexam).forEach(col => {
              var objcolumn = ToInclude.filter(include => include.ColumnName == col);
              if (objcolumn.length > 0) {
                var resultrow = this.ExamStudentResults.filter((f:any) => f.FirstCol == objcolumn[0].Display)
                resultrow[0][_ExamName] = eachexam[objcolumn[0].ColumnName]
              }
            })
          }
        })
      });
  }
  StyleStr = '';
  CertificateDescription = '';
  GenerateCertificate() {
    debugger;
    this.CertificateDescription = '';
    var _certificateBody = JSON.parse(JSON.stringify(this.AllCertificateConfig.filter(a => a.ParentId == this.searchForm.get("searchCertificateTypeId")?.value)));
    if (_certificateBody.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Certificate not defined!", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.backgroundimage = '';
    for (var i = 0; i < _certificateBody.length; i++) {
      if (_certificateBody[i].Title.toLowerCase() == "background-image") {
        this.backgroundimage = _certificateBody[i].Description;
        _certificateBody.splice(i, 1);
        i--;
      }
      if (_certificateBody[i].Title.toLowerCase() == "style") {
        this.StyleStr += _certificateBody[i].Description;
        _certificateBody.splice(i, 1);
        i--;
      }
    }

    var certificateavailable = true;
    var _certificateFormula = JSON.parse(JSON.stringify(this.AllCertificateConfig.filter(a => a.CertificateConfigId == this.searchForm.get("searchCertificateTypeId")?.value)));
    if (_certificateFormula.length > 0) {
      for (var i = 0; i < _certificateFormula.length; i++) {
        if (_certificateFormula[i].Logic != undefined && _certificateFormula[i].Logic.length > 0) {
          this.StudentForVariables.forEach(s => {
            if (_certificateFormula[i].Logic.includes('[' + s.name.trim() + ']'))
              _certificateFormula[i].Logic = _certificateFormula[i].Logic.replaceAll('[' + s.name.trim() + ']', s.val);
          });
          if (!evaluate(_certificateFormula[i].Logic)) {
            certificateavailable = false;
            break;
          }
        }
      }
      if (!certificateavailable) {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(_certificateFormula[0].MasterDataName + " not available for this student.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }
    if (this.backgroundimage.indexOf('http') == -1) {
      this.backgroundimage = 'assets/images/certificatebackground.jpg';
    }
    //////console.log("_certificateBody",_certificateBody);
    // this.Organization[0].forEach(orgdet => {
    //   header.Description = header.Description.replaceAll("[" + orgdet.name + "]", orgdet.val);
    // })
    debugger;
    _certificateBody.forEach(c => {
      this.StudentForVariables.forEach(s => {
        if (c.Description.includes('[' + s.name.trim() + ']'))
          c.Description = c.Description.replaceAll('[' + s.name.trim() + ']', s.val);
        c.Description = c.Description.replaceAll("[" + this.Organization[0].name + "]", this.Organization[0].val);
      });
    })
    _certificateBody = _certificateBody.sort((a, b) => a.Sequence - b.Sequence);

    this.CertificateElements = [
      ...this.CommonHeader,
      ..._certificateBody,
      ...this.CommonFooter
    ];


    this.CertificateElements.forEach(f => {
      f.Logic = f.Logic == null ? '' : f.Logic;
      this.StyleStr += f.Logic
      this.CertificateDescription += f.Description;
    })

    //this.CertificateDescription ="<div style='margin-left:350px'>"+this.CertificateDescription+"</div>";

    this.CommonStyles.forEach(s => {
      this.StyleStr += s.Description;
    });
    //this.styleStrUse ="{"+ styleStr.split('{').join(':{').split('}').join('},') + "}";
    ////console.log("this.styleStr.toString()", styleStr)

    this.loadTheme(this.StyleStr);

    //this.dataSource = new MatTableDataSource<any>(this.CertificateElements);
    this.loading = false;
    this.PageLoading = false;
  }

  GetGeneratedCertificate() {
    debugger;
    var filterstr = this.FilterOrgSubOrg + ' and Active eq true';
    var _studentId = this.searchForm.get("searchStudentName")?.value.StudentId;
    var _studentClassId = this.searchForm.get("searchStudentName")?.value.StudentClassId;
    var _certificationTypeId = this.searchForm.get("searchCertificateTypeId")?.value;

    if (_certificationTypeId == undefined || _certificationTypeId == 0) {
      this.contentservice.openSnackBar("Please select certificate type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      filterstr += " and CertificateTypeId eq " + _certificationTypeId
    }
    if (_studentClassId != undefined)
      filterstr += " and StudentId eq " + _studentId + " and StudentClassId eq " + _studentClassId;

    if (this.SportsCertificate)
      this.DisplayColumn = ["StudentName", "CertificateType", "ActivityName", "Category", "SubCategory", "Session"];
    else
      this.DisplayColumn = ["StudentName", "CertificateType"];

    this.SportsResultList = [];
    this.ActivityResultDataSource = new MatTableDataSource<any>(this.SportsResultList);

    let list: List = new List();
    list.fields = [
      'GeneratedCertificateId',
      'StudentId',
      'StudentClassId',
      'ActivityId',
      'CategoryId',
      'SubCategoryId',
      'SessionId',
      'CertificateTypeId',
      'IssuedDate'
    ];
    list.PageName = "GeneratedCertificates";
    list.filter = [filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.GeneratedCertificatelist = [];
        data.value.forEach(d => {
          var _studentObj = this.Students.filter((s:any) => s.StudentClassId == d.StudentClassId);
          if (_studentObj.length > 0) {
            d.StudentName = _studentObj[0].Name;
          }
          else
            d.StudentName = '';

          var _certificateTypeObj = this.CertificateTypes.filter(a => a.MasterDataId == d.CertificateTypeId);
          if (_certificateTypeObj.length > 0)
            d.CertificateType = _certificateTypeObj[0].MasterDataName;

          var _activityNameObj = this.ActivityNames.filter(a => a.MasterDataId == d.ActivityId);
          if (_activityNameObj.length > 0)
            d.ActivityName = _activityNameObj[0].MasterDataName;


          var _categoryObj = this.ActivityCategory.filter(a => a.MasterDataId == d.CategoryId);
          if (_categoryObj.length > 0)
            d.Category = _categoryObj[0].MasterDataName;

          var _subCategoryObj = this.allMasterData.filter(a => a.MasterDataId == d.SubCategoryId);
          if (_subCategoryObj.length > 0)
            d.SubCategory = _subCategoryObj[0].MasterDataName;

          var _sessionObj = this.ActivitySessions.filter(a => a.MasterDataId == d.SessionId);
          if (_sessionObj.length > 0)
            d.Session = _sessionObj[0].MasterDataName;
          d.IssuedDate = moment(d.IssuedDate).format('DD-MM-YYYY');
          this.GeneratedCertificatelist.push(d);
        })

        if (this.GeneratedCertificatelist.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        if (this.DisplayColumn.indexOf('IssuedDate') == -1) {
          this.DisplayColumn.push('IssuedDate');
        }
        this.dataSource = new MatTableDataSource<any>(this.GeneratedCertificatelist);
        this.dataSource.paginator = this.paginator;
        this.loading = false;
        this.PageLoading = false;
      })

  }
  SelectedActivity :any[]= [];
  View(row) {
    row.Action = false;
    this.SelectedActivity = [];
    this.SelectedActivity.push(row);
    this.CertificateDescription = '';
    this.StyleStr = '';
    this.GetStudentAttendance();
  }
  Save() {
    debugger;
    //var _studentObj = this.searchForm.get("searchStudentName")?.value
    //var _studentclassId = this.SelectedActivity[0].StudentClassId;
    //var _studentId = this.SelectedActivity[0].StudentId;
    var _studentId = this.searchForm.get("searchStudentName")?.value.StudentId;
    var _studentclassId = this.searchForm.get("searchStudentName")?.value.StudentClassId;

    //var _searchStudentGroupId = this.searchForm.get("searchStudentGroupId")?.value;
    var _certificateTypeId = this.searchForm.get("searchCertificateTypeId")?.value;
    var _SportsNameId = this.SelectedActivity[0].SportsNameId;
    var _categoryId = this.SelectedActivity[0].CategoryId;
    var _subCategoryId = this.SelectedActivity[0].SubCategoryId;
    var _SessionId = this.SelectedActivity[0].SessionId;

    if (_studentclassId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    if (this.SportsCertificate) {
      if (this.SelectedActivity[0].SportsNameId == 0) {
        this.contentservice.openSnackBar("Please select activity.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }

    if (_certificateTypeId == 0) {
      this.contentservice.openSnackBar("Please select certificate type.", globalconstants.ActionText, globalconstants.RedBackground);
    }
    let checkFilterString = "Active eq true and OrgId eq " + this.LoginUserDetail[0]["orgId"];
    checkFilterString += " and CertificateTypeId eq " + _certificateTypeId;
    checkFilterString += " and StudentId eq " + _studentId + " and StudentClassId eq " + _studentclassId;

    let list: List = new List();
    list.fields = ["StudentClassId"];
    list.PageName = "GeneratedCertificates";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          var insertCertificate = {
            GeneratedCertificateId: 0,
            Active: true,
            StudentId: _studentId,
            StudentClassId: _studentclassId,
            CategoryId: _categoryId,
            SubCategoryId: _subCategoryId,
            CertificateTypeId: _certificateTypeId,
            ActivityId: _SportsNameId,
            SessionId: _SessionId,
            OrgId: this.LoginUserDetail[0]["orgId"],
            SubOrgId: this.SubOrgId,
            IssuedDate: new Date(),
            CreatedDate: new Date(),
            CreatedBy: this.LoginUserDetail[0]["userId"],
            UpdatedDate: new Date()
          }
          //          //console.log("lskjd", insertCertificate);
          this.insert(insertCertificate);
        }
      });
  }
  insert(data) {

    //debugger;
    this.dataservice.postPatch("GeneratedCertificates", data, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  // print() {
  //   var printContents = document.getElementById('printSection').innerHTML;
  //   var originalContents = document.body.innerHTML;

  //   document.body.innerHTML = printContents;

  //   window.print();

  //   document.body.innerHTML = originalContents;

  // }
  SelectedCertificateType = '';
  CheckType() {
    debugger;
    var _certificateId = this.searchForm.get("searchCertificateTypeId")?.value;
    var obj = this.CertificateTypes.filter((f:any) => f.CertificateConfigId == _certificateId);
    if (obj.length > 0)
      this.SelectedCertificateType = obj[0].Title.toLowerCase()
    if (obj.length > 0 && (obj[0].Title.toLowerCase() == 'sports certificate' || obj[0].Title.toLowerCase() == 'moments certificate')) {
      this.SportsCertificate = true;
    }
    else
      this.SportsCertificate = false;
    this.ClearData();
  }
  SetCategory() {
    var _activityId = this.searchForm.get("searchActivityId")?.value;
    this.ActivityCategory = this.allMasterData.filter((f:any) => f.ParentId == _activityId);
    this.ClearData();
  }
  SetSubCategory() {
    var _categoryId = this.searchForm.get("searchCategoryId")?.value;
    this.ActivitySubCategory = this.allMasterData.filter((f:any) => f.ParentId == _categoryId);
    this.ClearData();
  }
  SportsCertificate = false;
  ActivitySubCategory :any[]= [];
  ActivityCategory :any[]= [];
  ActivityNames :any[]= [];
  ActivitySessions :any[]= [];
  StudentClubs :any[]= [];
  StudentGroups :any[]= [];
  Groups :any[]= [];
  AttendancePresentId=0;
  AttendanceAbsentId=0;
  GetMasterData() {
    debugger;
    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
    this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
    this.PointCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.POINTSCATEGORY);
    this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions.common.ATTENDANCESTATUS);
    this.AttendancePresentId = this.AttendanceStatus.filter((f:any)=>f.MasterDataName.toLowerCase()=='present')[0].MasterDataId;
    this.AttendanceAbsentId = this.AttendanceStatus.filter((f:any)=>f.MasterDataName.toLowerCase()=='absent')[0].MasterDataId;
    this.StudentClubs = this.getDropDownData(globalconstants.MasterDefinitions.school.CLUBS);
    this.StudentGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGROUP);
    //this.StudentGroups = [...this.StudentClubs, ...this.Houses, ...this.StudentGroups];

    // this.Groups.push({
    //   name: "Club",
    //   disable: true,
    //   group: this.StudentClubs
    // },
    //   {
    //     name: "House",
    //     disable: true,
    //     group: this.Houses
    //   },
    //   {
    //     name: "Student Group",
    //     disable: true,
    //     group: this.StudentGroups
    //   }
    // )
    this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
    this.BloodGroup = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
    this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
    this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
    this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);

    //this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP);
    this.StudentGrades = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);


    this.ActivityNames = this.getDropDownData(globalconstants.MasterDefinitions.common.ACTIVITYNAME);
    this.ActivitySessions = this.getDropDownData(globalconstants.MasterDefinitions.common.ACTIVITYSESSION);
    this.ActivityCategory = this.getDropDownData(globalconstants.MasterDefinitions.common.ACTIVITYCATEGORY);
    this.GetPoints();
    //this.shareddata.ChangeBatch(this.Batches);
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClassGroups(filterOrgSubOrg)
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      });
    this.Batches = this.tokenStorage.getBatches()!;
    //this.GetStudentClasses();
    this.GetOrganization();
    //this.GetTotalAttendance();
    this.GetExams();
  }
  ClearData() {
    this.SportsResultList = [];
    this.ActivityResultDataSource = new MatTableDataSource<any>(this.SportsResultList);
    this.CertificateElements = [];
    this.dataSource = new MatTableDataSource<any>(this.CertificateElements);
  }
  GetStudentClasses() {
    debugger;
    var filterOrgIdNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);

    var _classId = this.searchForm.get("searchClassId")?.value;
    if (_classId > 0)
      filterOrgIdNBatchId += " and ClassId eq " + this.searchForm.get("searchClassId")?.value;
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //filterOrgIdNBatchId += " and IsCurrent eq true";
    this.loading = true;
    this.Students = [];
    let list: List = new List();
    list.fields = ["StudentClassId,StudentId,ClassId,RollNo,SectionId,SemesterId"];
    list.PageName = "StudentClasses";
    list.lookupFields = ["Student($select=StudentId,FirstName,LastName,FatherName,MotherName,PersonalNo,FatherContactNo,MotherContactNo)"]
    list.filter = [filterOrgIdNBatchId];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.StudentClasses = [...data.value];
        data.value.forEach(student => {
          var _RollNo = '';
          var _name = '';
          var _className = '';
          var _section = '';
          //var _studentClassId = 0;
          //var studentclassobj = this.StudentClasses.filter((f:any) => f.StudentId == student.StudentId);
          //if (studentclassobj.length > 0) {
          //_studentClassId = studentclassobj[0].StudentClassId;
          var _classNameobj = this.Classes.filter(c => c.ClassId == _classId);

          if (_classNameobj.length > 0)
            _className = _classNameobj[0].ClassName;
          var _SectionObj = this.Sections.filter((f:any) => f.MasterDataId == student.SectionId)

          if (_SectionObj.length > 0)
            _section = _SectionObj[0].MasterDataName;
          _RollNo = student.RollNo == null ? '' : student.RollNo;

          student.PersonalNo = student.Student.PersonalNo == null ? '' : student.Student.PersonalNo;
          var _lastname = student.Student.LastName == null || student.Student.LastName == '' ? '' : " " + student.Student.LastName;
          _name = student.Student.FirstName + _lastname;
          var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo;
          this.Students.push({
            StudentClassId: student.StudentClassId,
            StudentId: student.StudentId,
            Name: _fullDescription,
            FatherName: student.Student.FatherName,
            MotherName: student.Student.MotherName
          });
          //}
        })
        this.loading = false;
      })
  }
  GetStudents() {
    this.loading = true;
    // var extrafilter = ''
    // let list: List = new List();
    // list.fields = [
    //   'StudentId',
    //   'FirstName',
    //   'LastName',
    //   'FatherName',
    //   'MotherName',
    //   'ContactNo',
    //   'FatherContactNo',
    //   'MotherContactNo'
    // ];
    // list.PageName = "Students";

    // var standardfilter = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    // list.filter = [standardfilter];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    debugger;
    //this.Students = [...data.value];
    //  ////console.log('data.value', data.value);
    this.Students = [];
    var _students: any = this.tokenStorage.getStudents()!;
    if (_students.length > 0) {

      //var _students = [...data.value];

      _students.forEach(student => {
        var _RollNo = '';
        var _name = '';
        var _className = '';
        var _section = '';
        var _studentClassId = 0;
        var studentclassobj = this.StudentClasses.filter((f:any) => f.StudentId == student.StudentId);
        if (studentclassobj.length > 0) {
          _studentClassId = studentclassobj[0].StudentClassId;
          var _classNameobj = this.Classes.filter(c => c.ClassId == studentclassobj[0].ClassId);

          if (_classNameobj.length > 0)
            _className = _classNameobj[0].ClassName;
          var _SectionObj = this.Sections.filter((f:any) => f.MasterDataId == studentclassobj[0].SectionId)

          if (_SectionObj.length > 0)
            _section = _SectionObj[0].MasterDataName;
          _RollNo = studentclassobj[0].RollNo == null ? '' : studentclassobj[0].RollNo;

          student.PersonalNo = student.PersonalNo == null ? '' : student.PersonalNo;
          var _lastname = student.LastName == null || student.LastName == '' ? '' : " " + student.LastName;
          _name = student.FirstName + _lastname;
          var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo + "-" + student.PersonalNo;
          this.Students.push({
            StudentClassId: _studentClassId,
            StudentId: student.StudentId,
            Name: _fullDescription,
            FatherName: student.FatherName,
            MotherName: student.MotherName
          });
        }
      })
    }
    this.loading = false;
    this.PageLoading = false;
    //})
  }
  SportsResultList :any[]= [];
  ActivityDisplayColumn = ["GroupName", "SportsName", "Category", "SubCategory", "Session", "Action"];
  GetSportsResult() {
    debugger;
    var filterStr = this.FilterOrgSubOrg + " and Active eq 1";
    var _searchStudentGroupId = this.searchForm.get("searchStudentGroupId")?.value;
    var _studentclassId = this.searchForm.get("searchStudentName")?.value.StudentClassId;
    var _SportsNameId = this.searchForm.get("searchActivityId")?.value;
    var _categoryId = this.searchForm.get("searchCategoryId")?.value;
    var _subCategoryId = this.searchForm.get("searchSubCategoryId")?.value;
    var _SessionId = this.searchForm.get("searchSessionId")?.value;

    if (_studentclassId == undefined) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    if (_studentclassId != undefined && _searchStudentGroupId > 0) {
      filterStr += " and (StudentClassId eq " + _studentclassId + " or GroupId eq " + _searchStudentGroupId + ")";
    }
    else if (_searchStudentGroupId == 0) {
      filterStr += " and StudentClassId eq " + _studentclassId;
    }

    // if(_searchStudentGroupId == 0)
    // {
    //   this.loading=false;
    //   this.contentservice.openSnackBar("Please select student group.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    if (_SportsNameId > 0) {
      filterStr += " and SportsNameId eq " + _SportsNameId;
    }
    // if (_SessionId == 0) {
    //   this.loading = false;
    //   this.contentservice.openSnackBar("Please select session.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    if (_SessionId > 0) {
      filterStr += " and SessionId eq " + _SessionId;
    }
    if (_searchStudentGroupId > 0) {
      filterStr += " and GroupId eq " + _searchStudentGroupId;
    }

    if (_categoryId > 0) {
      filterStr += " and CategoryId eq " + _categoryId;
    }
    if (_subCategoryId > 0) {
      filterStr += " and SubCategoryId eq " + _subCategoryId;
    }

    this.loading = true;
    this.SportsResultList = [];

    let list: List = new List();
    list.fields = [
      "SportResultId",
      "StudentClassId",
      "GroupId",
      "RankId",
      "Achievement",
      "SportsNameId",
      "CategoryId",
      "SubCategoryId",
      "AchievementDate",
      "SessionId",
      "Active"
    ];

    list.PageName = "SportResults";
    list.filter = [filterStr];
    this.SportsResultList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.map(m => {

          var objGroup = this.Houses.filter(h => h.MasterDataId == m.GroupId);
          // this.Groups.forEach(f => {
          //   f.group.forEach(g => {
          //     if (g.MasterDataId == m.GroupId)
          //       objGroup.push(g);
          //   })
          // });

          if (objGroup.length > 0)
            m.GroupName = objGroup[0].MasterDataName;
          else
            m.GroupName = '';

          //activitynames contains only active one. if not active then dont display it.
          var obj = this.ActivityNames.filter((f:any) => f.MasterDataId == m.SportsNameId);
          if (obj.length > 0) {
            m.SportsName = obj[0].MasterDataName;

            var objCategory = this.allMasterData.filter((f:any) => f.MasterDataId == m.CategoryId);
            if (objCategory.length > 0)
              m.Category = objCategory[0].MasterDataName;
            else
              m.Category = '';

            var objSubCategory = this.allMasterData.filter((f:any) => f.MasterDataId == m.SubCategoryId);
            if (objSubCategory.length > 0) {
              m.SubCategory = objSubCategory[0].MasterDataName;
            }
            else
              m.SubCategory = '';

            var objSession = this.allMasterData.filter((f:any) => f.MasterDataId == m.SessionId);
            if (objSession.length > 0) {
              m.Session = objSession[0].MasterDataName;
            }
            else
              m.Session = '';
            if (m.RankId > 0)
              m.Rank = this.AchievementAndPoints.filter(a => a.AchievementAndPointId == m.RankId)[0].Rank;
            m.Achievement = globalconstants.decodeSpecialChars(m.Achievement);
            m.Action = false;
            this.SportsResultList.push(m);
          }
        });
        if (this.SportsResultList.length == 0) {
          this.loading = false;
          this.contentservice.openSnackBar("No activity record found for this student.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.ActivityResultDataSource = new MatTableDataSource<any>(this.SportsResultList);
        }
        this.loading = false;

      });

  }
  AllCertificateConfig :any[]= [];
  GetAllCertificateConfig() {
    debugger;
    var filterStr = "Active eq true and (OrgId eq 0 or (" + this.FilterOrgSubOrg + "))";
    this.loading = true;
    this.AllCertificateConfig = [];

    let list: List = new List();
    list.fields = [
      "CertificateConfigId",
      "Title",
      "ParentId",
      "Sequence",
      "Logic",
      "Description",
      "Active",
    ];

    list.PageName = "CertificateConfigs";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AllCertificateConfig = [...data.value];
        this.CertificateTypes = this.getCertificateDropDown(globalconstants.MasterDefinitions.school.CERTIFICATETYPE);
        this.CommonStyles = this.getCertificateDropDown(globalconstants.MasterDefinitions.school.COMMONSTYLE);
        this.CommonHeader = this.getCertificateDropDown(globalconstants.MasterDefinitions.school.COMMONHEADER);
        this.CommonFooter = this.getCertificateDropDown(globalconstants.MasterDefinitions.school.COMMONFOOTER);
        this.CommonHeader.sort((a, b) => a.Sequence - b.Sequence)
        this.CommonFooter.sort((a, b) => a.Sequence - b.Sequence)
      });
  }
  GetCertificates() {
    debugger;
    var _studentClassId = this.searchForm.get("searchStudentName")?.value.StudentClassId;
    if (_studentClassId > 0) {
      this.StudentClassId = _studentClassId;
    }
    else {
      this.contentservice.openSnackBar("Please select student!", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    if (this.SelectedCertificateType.toLowerCase() == 'provisional certificate' || this.SelectedCertificateType.toLowerCase() == 'transfer certificate') {
      var _examId = this.searchForm.get("searchExamId")?.value;
      if (_examId == 0) {
        this.loading = false;
        this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }
    if (this.searchForm.get("searchCertificateTypeId")?.value == 0) {
      this.contentservice.openSnackBar("Please select certificate type!", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    this.StyleStr = '';
    if (this.SportsCertificate) {

      this.GetSportsResult()

    }
    else {
      this.GetExamGrandTotal();
      this.GetStudentAttendance();
    }

  }
  GetOrganization() {

    let list: List = new List();
    list.fields = [
      "OrganizationId",
      "OrganizationName",
      "LogoPath",
      "Address",
      "CityId",
      "StateId",
      "CountryId",
      "WebSite",
      "Contact",
      "RegistrationNo",
      "ValidFrom",
      "ValidTo"

    ];
    list.PageName = "Organizations";
    list.filter = ["OrganizationId eq " + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((org: any) => {
        this.Organization = org.value.map(m => {
          //m.CountryName = '';
          var countryObj = this.allMasterData.filter((f:any) => f.MasterDataId == m.CountryId);
          if (countryObj.length > 0)
            m.Country = countryObj[0].MasterDataName;

          var stateObj = this.allMasterData.filter((f:any) => f.MasterDataId == m.StateId);
          if (stateObj.length > 0)
            m.State = stateObj[0].MasterDataName;

          var cityObj = this.allMasterData.filter((f:any) => f.MasterDataId == m.CityId);
          if (cityObj.length > 0)
            m.City = cityObj[0].MasterDataName;

          return [{
            name: "OrganizationId", val: m.OrganizationId
          }, {
            name: "Organization", val: m.OrganizationName
          }, {
            name: "LogoPath", val: m.LogoPath
          }, {
            name: "Address", val: m.Address
          }, {
            name: "City", val: m.City
          }, {
            name: "State", val: m.State
          }, {
            name: "Country", val: m.Country
          }, {
            name: "Contact", val: m.Contact
          }, {
            name: "RegistrationNo", val: m.RegistrationNo == null ? '' : m.RegistrationNo
          }, {
            name: "ValidFrom", val: m.ValidFrom
          }, {
            name: "ValidTo", val: m.ValidTo
          },
          {
            name: "WebSite", val: m.WebSite == null ? '' : m.WebSite
          },
          {
            name: "ToDay", val: moment(new Date()).format("DD/MM/YYYY")
          }
          ]
        })
        ////console.log("this.Organization",this.Organization);
        ////console.log("this.CommonHeader.",this.CommonHeader);

        this.CommonHeader.forEach(header => {
          this.Organization[0].forEach(orgdet => {
            header.Description = header.Description.replaceAll("[" + orgdet.name + "]", orgdet.val);
          })
        })
        this.CommonFooter.forEach(footer => {
          this.Organization[0].forEach(orgdet => {
            footer.Description = footer.Description.replaceAll("[" + orgdet.name + "]", orgdet.val);
          })
        })
        this.loading = false; this.PageLoading = false;
      });
  }
  print(): void {

    var str = `.container{
      position: relative;
      display: flex;
      justify-content: center;
      margin:0px;
      padding: 0px;

    }
    img { border: 0; }

     .container img{
       width: 100%;
      
     }`;
    this.StyleStr += str;

    let printContents, popupWin;
    printContents = this.printSection.nativeElement.innerHTML; // document.getElementById('print-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>
          <style>${this.StyleStr}
          </style>
        </head>
    <body style='margin:0px;padding:0px' onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
  }

  GetStudentAttendance() {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "AttendanceId",
      "StudentClassId",
      "AttendanceStatusId"
    ];
    list.PageName = "Attendances";
    //list.lookupFields = ["StudentClass($select=RollNo,SectionId;$expand=Student($select=FirstName,LastName))"];
    list.filter = [this.FilterOrgSubOrgBatchId + " and StudentClassId eq " + this.StudentClassId];

    this.dataservice.get(list)
      .subscribe((attendance: any) => {
        this.StudentAttendanceList = [...attendance.value]
        //var groupbyPresentAbsent = alasql("select count(1) from ? where AttendanceStatusId = "+this.AttendancePresentId+" group by AttendanceStatusId",
        //  [this.StudentAttendanceList])
        var count = this.StudentAttendanceList.filter((f:any)=>f.AttendanceStatusId ==this.AttendancePresentId);
        //if (groupbyPresentAbsent.length > 0)
          this.AttendanceStatusSum = count.length;// groupbyPresentAbsent[0].Total;

        this.getPaymentStatus();
      });
  }
  GetPoints() {
    //debugger;
    var filterOrgId = "Active eq true and OrgId eq " + this.LoginUserDetail[0]['orgId'];

    let list: List = new List();
    list.fields = ["AchievementAndPointId,Rank,CategoryId,Points,Active"];
    list.PageName = "AchievementAndPoints";
    list.filter = [filterOrgId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(f => {
          var obj = this.PointCategory.filter(a => a.MasterDataId == f.CategoryId);
          if (obj.length > 0) {
            f.Category = obj[0].MasterDataName
            this.AchievementAndPoints.push(f);
          }
        })
      })
  }
  getPaymentStatus() {

    let list: List = new List();
    list.fields = [
      "LedgerId",
      "MonthDisplay"
    ];
    list.PageName = "AccountingLedgerTrialBalances";
    list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      " and StudentClassId eq " + this.StudentClassId + " and BatchId eq " + this.SelectedBatchId];
    list.limitTo = 1;
    list.orderBy = "Month Desc";
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.FeePaidLastMonth = data.value[0].MonthDisplay;
        }
        this.GetStudentAndGenerateCerts();
      });
  }
  GetExams() {

    this.contentservice.GetExams(this.FilterOrgSubOrgBatchId, 1)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.map(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId
            })
        })
      })
  }
  UpdateStudentCertificates() {
    ////console.log("hi")
  }
  getCertificateDropDown(dropdowntype) {
    var dropdownValues :any[]= [];
    var drp = this.AllCertificateConfig.filter((f:any) => f.Title.toLowerCase() == dropdowntype.toLowerCase())
    if (drp.length > 0) {
      dropdownValues = this.AllCertificateConfig.filter((f:any) => f.ParentId == drp[0].CertificateConfigId)
    }
    return dropdownValues;

  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);

  }

}
export interface IExamStudentSubjectResult {
  ExamStudentSubjectResultId: number;
  ExamId: number;
  StudentClassSubjectId: number;
  Student: string;
  ClassSubjectMarkComponentId: number;
  SubjectMarkComponent: string;
  FullMark: number;
  PassMark: number;
  Marks: number;
  ExamStatus: number;
  Active: number;
  Action: boolean;
}

