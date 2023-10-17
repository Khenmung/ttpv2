import { Component, OnInit, ViewChild } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { List } from '../../../shared/interface';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { ContentService } from '../../../shared/content.service';
import { DatePipe } from '@angular/common';
import { employee } from './employee';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StudentActivity } from './StudentActivity';
import { MatTableDataSource } from '@angular/material/table';
import { TableUtil } from '../../../shared/TableUtil';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-excel-data-management',
  templateUrl: './excel-data-management.component.html',
  styleUrls: ['./excel-data-management.component.scss']
})
export class ExcelDataManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  PageLoading = true;
  ReadyForUpload = false;
  constructor(private servicework: SwUpdate,
    private snackbar: MatSnackBar,
    private datepipe: DatePipe,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private fb: UntypedFormBuilder,
    private shareddata: SharedataService,
    private tokenStorage: TokenStorageService,
    private employee: employee,
    private studentActivity: StudentActivity,
  ) {

  }
  SelectedApplicationName = '';
  SubOrgId: number = 0;
  NoOfStudent = 0;
  NoOfStudentInPlan = 0;
  UploadType = {
    CLASSROLLNOMAPPING: 'student class upload',
    STUDENTDATA: 'student upload',
    STUDENTPROFILE: 'student profile',
    EMPLOYEEDETAIL: 'employee upload'
  }
  SelectedApplicationId = 0;
  FilterOrgSubOrgNBatchId = '';
  FilterOrgSubOrg = '';
  ClassEvaluations: any[] = [];
  loading = false;
  SelectedBatchId = 0;
  loginDetail: any[] = [];
  Permission = '';
  ColumnsOfSelectedReports: any[] = [];
  ReportConfigItemListName = "ReportConfigItems";
  DuplicateDisplayCol: any = [];
  ngOnInit() {
    //this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
    //this.GetMasterData();
    this.loading = true;
    this.loginDetail = this.tokenStorage.getUserDetail();
    this.shareddata.CurrentGenders.subscribe(c => (this.Genders = c));
    this.shareddata.CurrentBloodgroup.subscribe(c => (this.Bloodgroup = c));
    this.shareddata.CurrentCategory.subscribe(c => (this.Category = c));
    this.shareddata.CurrentReligion.subscribe(c => (this.Religion = c));
    this.shareddata.CurrentStates.subscribe(c => (this.States = c));
    this.shareddata.CurrentPrimaryContact.subscribe(c => (this.PrimaryContact = c));
    this.shareddata.CurrentLocation.subscribe(c => (this.Location = c));


    this.Batches = this.tokenStorage.getBatches()!;;
    //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.shareddata.CurrentSection.subscribe(c => (this.Sections = c));
    this.shareddata.CurrentUploadType.subscribe(c => (this.UploadTypes = c));
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
    this.shareddata.CurrentFeeType.subscribe(b => this.FeeTypes = b);

    this.uploadForm = this.fb.group({
      UploadTypeId: [0, [Validators.required]],
      inputFile: ['']
    })
    this.FilterOrgSubOrgNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);

    this.PageLoad();
  }
  PageLoad() {
    debugger;
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.Admission.UPLOAD);
    if (perObj.length > 0)
      this.Permission = perObj[0].permission;
    if (this.Permission == 'deny') {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
    }
    else {
      var PermittedApplications = this.tokenStorage.getPermittedApplications();
      var apps = PermittedApplications.filter((f: any) => f.applicationId == this.SelectedApplicationId)
      if (apps.length > 0) {
        this.SelectedApplicationName = apps[0].appShortName;
      }
      this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
        this.Classes = [...data.value];
        this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);

      });


      this.GetMasterData();
      this.GetAllStudents();

      //else
      // if (this.SelectedApplicationName == 'edu') {
      //   this.GetStudents();
      //   this.GetStudentsInPlan();
      // }
    }
  }
  clearall() {
    this.uploadForm = this.fb.group({
      UploadTypeId: [0, [Validators.required]],
      inputFile: ['']
    })
  }
  ErrorMessage = '';
  CurrentBatchStudentList: any[] = [];
  StudentClassList: any[] = [];
  displayedColumns: any[];
  ELEMENT_DATA: any[] = [];
  dataSource: MatTableDataSource<any>;
  cleanDataSource: MatTableDataSource<any>;
  uploadForm: UntypedFormGroup;
  AllMasterData: any[];
  UploadTypes: any[];
  storeData: any;
  csvData: any;
  jsonData: any;
  textData: any;
  htmlData: any;
  fileUploaded: File;
  worksheet: any;
  selectedFile: string;
  Houses: any[] = [];
  Clubs: any[] = [];
  Classes: any[] = [];
  Batches: any[] = [];
  Sections: any[] = [];
  Semesters: any[] = [];
  CourseYears: any[] = [];
  FeeTypes: any[] = [];
  Genders: any[] = [];
  Category: any[] = [];
  Bloodgroup: any[] = [];
  Religion: any[] = [];
  EmployeeTypes: any[] = [];
  States: any[] = [];
  Country: any[] = [];
  AdmissionStatuses: any[] = [];
  PrimaryContact: any[] = [];
  Location: any[] = [];
  Remarks: any[] = [];
  ActivityCategory: any[] = [];
  ActivitySubCategory: any[] = [];
  PrimaryContactFatherOrMother: any[] = [];
  EmployeeStatus: any[] = [];
  MaritalStatus: any[] = [];
  Departments: any[] = [];
  EmployeeGrades: any[] = [];
  Designations: any[] = [];
  WorkNatures: any[] = [];
  WorkAccounts: any[] = [];
  studentData: any[];
  SelectedUploadtype = '';

  onselectchange(event) {
    debugger;
    //    ////console.log('event', event);
    this.SelectedUploadtype = this.UploadTypes.filter(item => item.MasterDataId == event.value)[0].MasterDataName

    if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.CLASSROLLNOMAPPING)) {
      this.displayedColumns = ["StudentId", "Class", "Section", "RollNo"];
    }
    else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.EMPLOYEEDETAIL)) {
      this.getFields('Employee Module');
    }
    else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.STUDENTDATA)) {
      this.getFields('Student Module');
      this.displayedColumns = [
        "StudentId",
        "FirstName",
        "LastName",
        "FatherName",
        "MotherName",
        "Gender",
        "PermanentAddress",
        "PresentAddress",
        "WhatsAppNumber",
        "PermanentAddressCity",
        "PermanentAddressPincode",
        "PermanentAddressState",
        "PermanentAddressCountry",
        "PresentAddressCity",
        "PresentAddressState",
        "PresentAddressCountry",
        "DOB",
        "Bloodgroup",
        "Category",
        "AccountHolderName",
        "BankAccountNo",
        "IFSCCode",
        "MICRNo",
        "AdhaarNo",
        "Photo",
        "Religion",
        "PersonalNo",
        "AlternateContact",
        "EmailAddress",
        "ClassAdmissionSought",
        "LastSchoolPercentage",
        "TransferFromSchool",
        "TransferFromSchoolBoard",
        "Remarks",
        "FatherOccupation",
        "FatherContactNo",
        "MotherContactNo",
        "MotherOccupation",
        "PrimaryContactFatherOrMother",
        "NameOfContactPerson",
        "RelationWithContactPerson",
        "ContactPersonContactNo",
        "Active",
        "StudentDeclaration",
        "ParentDeclaration",
        "LocationId",
        "ReasonForLeavingId",
        "Club",
        "House",
        "Remarks",
        "BoardRegistrationNo",
        "IdentificationMark"
      ];
    }
    //this.clear();
    //  this.readExcel();
    //    this.uploadedFile(event);
  }
  getFields(pModuleName) {
    this.contentservice.getSelectedReportColumn(this.FilterOrgSubOrg, this.SelectedApplicationId)
      .subscribe((data: any) => {
        var _baseReportId = 0;
        if (data.value.length > 0) {
          _baseReportId = data.value.filter((f: any) => f.ReportName == 'Reports' && f.ParentId == 0)[0].ReportConfigItemId;
          var _studentModuleObj = data.value.filter((f: any) => f.ReportName == pModuleName && f.ParentId == _baseReportId)
          var _studentModuleId = 0;
          if (_studentModuleObj.length > 0) {
            _studentModuleId = _studentModuleObj[0].ReportConfigItemId;
          }

          var _orgStudentModuleObj = data.value.filter((f: any) => f.ParentId == _studentModuleId && f.OrgId != 0 && f.Active == 1);
          var _orgStudentModuleId = 0;
          if (_orgStudentModuleObj.length > 0) {
            _orgStudentModuleId = _orgStudentModuleObj[0].ReportConfigItemId;
          }

          this.ColumnsOfSelectedReports = data.value.filter((f: any) => f.ParentId == _orgStudentModuleId)

        }

      })
  }
  browseOnChange(event) {
    this.fileUploaded = event.target.files[0];
    this.selectedFile = this.fileUploaded.name;
    this.readExcel();
  }
  readExcel() {
    debugger;

    let readFile = new FileReader();
    this.ErrorMessage = '';
    readFile.onload = (e) => {
      let _storeData: any = readFile.result;
      //var _rowCount = this.storeData.length;
      // if (_rowCount > globalconstants.RowUploadLimit) {
      //   this.storeData.slice(globalconstants.RowUploadLimit);
      // }
      this.ELEMENT_DATA = [];
      var data = new Uint8Array(_storeData);
      //////console.log('data',data)
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      this.worksheet = workbook.Sheets[first_sheet_name];
      this.jsonData = XLSX.utils.sheet_to_json(this.worksheet, { raw: false });
      if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.CLASSROLLNOMAPPING))
        this.ValidateStudentClassData();
      else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.STUDENTDATA)) {
        this.ValidateStudentData();
      }
      else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.STUDENTPROFILE)) {
        this.ValidateStudentActivity();
      }
      else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.EMPLOYEEDETAIL)) {
        this.ValidateEmployeeData();
      }
      if (this.ErrorMessage.length == 0 && !this.SelectedUploadtype.toLowerCase().includes(this.UploadType.STUDENTPROFILE)) {
        this.ReadyForUpload = true;
        this.snackbar.open("Data is ready for upload. Please click on file upload button.", globalconstants.ActionText,
          globalconstants.BlueBackground);
      }
    }
    //this.dataSource = new MatTableDataSource<any>(this.jsonData);
    readFile.readAsArrayBuffer(this.fileUploaded);


  }

  ValidateEmployeeData() {
    debugger;
    this.ErrorMessage = '';
    this.jsonData.map((element, indx) => {

      element.Active = +element.Active;
      element.EmpEmployeeId = +element.EmpEmployeeId;
      element.NoticePeriodDays = +element.NoticePeriodDays;
      element.ProbationPeriodDays = +element.ProbationPeriodDays;

      var _MandatoryColumns = this.ColumnsOfSelectedReports.filter((f: any) => f.Active == 1);

      _MandatoryColumns.forEach((b: any) => {
        if (element[b.ReportName] == undefined || element[b.ReportName] == null || element[b.ReportName].length == 0) {
          //_MadatoryField = b.ReportName;
          this.ErrorMessage += b.ReportName + " is required at row " + indx + ".<br>";
        }
      })
      if (element.WorkAccount != '') {

        var workaccountobj: any = this.WorkAccounts.filter((f: any) => f.MasterDataName.toLowerCase() == element.WorkAccount.toLowerCase())
        if (workaccountobj.length > 0) {
          element.WorkAccountId = workaccountobj[0].MasterDataId;
        }
        else
          this.ErrorMessage += 'Invalid work account at row ' + indx + '.\n';
      }
      else
        element.WorkAccountId = 0;


      if (element.Gender != '') {
        var Genderobj: any = this.Genders.filter((f: any) => f.MasterDataName.toLowerCase() == element.Gender.toLowerCase())
        if (Genderobj.length > 0) {
          element.GenderId = Genderobj[0].MasterDataId;
        }
        else
          this.ErrorMessage += 'Invalid gender at row ' + indx + '.\n';
      }
      else
        element.GenderId = 0;


      if (element.Bloodgroup != '') {
        var bloodgroupobj: any = this.Bloodgroup.filter((f: any) => f.MasterDataName.toLowerCase() == element.Bloodgroup.toLowerCase())
        if (bloodgroupobj.length == 0)
          this.ErrorMessage += 'Invalid blood group at row ' + indx + '.\n';
        else
          element.BloodgroupId = bloodgroupobj[0].MasterDataId;
      }
      else
        element.BloodgroupId = 0;

      if (element.Category != '') {
        var categoryobj: any = this.Category.filter((f: any) => f.MasterDataName.toLowerCase() == element.Category.toLowerCase())
        if (categoryobj.length == 0)
          this.ErrorMessage += 'Invalid category at row ' + indx + '.\n';
        else
          element.CategoryId = categoryobj[0].MasterDataId;
      }
      else
        element.CategoryId = 0;

      if (element.EmploymentStatus != '') {
        var EmploymentStatusIdobj: any = this.EmployeeStatus.filter((f: any) => f.MasterDataName.toLowerCase() == element.EmploymentStatus.toLowerCase())
        if (EmploymentStatusIdobj.length == 0)
          this.ErrorMessage += 'Invalid employee status at row ' + indx + '.\n';
        else
          element.EmploymentStatusId = EmploymentStatusIdobj[0].MasterDataId;
      }
      else
        element.EmploymentStatusId = 0;

      if (element.Religion != '') {
        var ReligionIdobj: any = this.Religion.filter((f: any) => f.MasterDataName.toLowerCase() == element.Religion.toLowerCase())
        if (ReligionIdobj.length == 0)
          this.ErrorMessage += 'Invalid religion at row ' + indx + '.\n';
        else
          element.ReligionId = ReligionIdobj[0].MasterDataId;
      }
      else
        element.ReligionId = 0;

      if (element.EmploymentType != '') {
        var EmploymentTypeIdobj: any = this.EmployeeTypes.filter((f: any) => f.MasterDataName.toLowerCase() == element.EmploymentType.toLowerCase())
        if (EmploymentTypeIdobj.length == 0)
          this.ErrorMessage += 'Invalid employment type at row ' + indx + '.\n';
        else
          element.EmploymentTypeId = EmploymentTypeIdobj[0].MasterDataId;
      }
      else
        element.EmploymentTypeId = 0;

      if (element.MaritalStatus != '') {
        var MaritalStatusobj: any = this.MaritalStatus.filter((f: any) => f.MasterDataName.toLowerCase() == element.MaritalStatus.toLowerCase())
        if (MaritalStatusobj.length == 0)
          this.ErrorMessage += 'Invalid marital status at row ' + indx + '.\n';
        else
          element.MaritalStatusId = MaritalStatusobj[0].MasterDataId;
      }
      else
        element.MaritalStatusId = 0;

      if (element.Nature != '') {
        var Natureobj: any = this.WorkNatures.filter((f: any) => f.MasterDataName.toLowerCase() == element.Nature.toLowerCase())
        if (Natureobj.length == 0)
          this.ErrorMessage += 'Invalid work nature at row ' + indx + '.\n';
        else
          element.NatureId = Natureobj[0].MasterDataId;
      }
      else
        element.NatureId = 0;


      if (element.PermanentAddressCountry != '') {
        var PermanentAddressCountryIdobj: any = this.Country.filter((f: any) => f.MasterDataName.toLowerCase() == element.PermanentAddressCountry.toLowerCase())
        if (PermanentAddressCountryIdobj.length == 0)
          this.ErrorMessage += 'Invalid permament country at row ' + indx + '.\n';
        else {
          element.PermanentAddressCountryId = PermanentAddressCountryIdobj[0].MasterDataId;
          if (element.PermanentAddressState != '') {
            var PermanentAddressStateobj = this.AllMasterData.filter((f: any) => f.ParentId == element.PermanentAddressCountryId)
            if (PermanentAddressStateobj.length > 0) {
              var listOfStates = PermanentAddressStateobj.filter((f: any) => f.MasterDataName.toLowerCase() == element.PermanentAddressState.toLowerCase());
              if (listOfStates.length == 0)
                this.ErrorMessage += 'Invalid permament state at row ' + indx + '.\n';
              else {
                element.PermanentAddressStateId = +listOfStates[0].MasterDataId;
                if (element.PermanentAddressCity != '') {
                  var ListPermanentAddressCityobj = this.AllMasterData.filter((f: any) => f.ParentId == element.PermanentAddressStateId)
                  if (ListPermanentAddressCityobj.length > 0) {
                    var CityObj = ListPermanentAddressCityobj.filter((f: any) => f.MasterDataName.toLowerCase() == element.PermanentAddressCity.toLowerCase());
                    if (CityObj.length == 0)
                      this.ErrorMessage += 'Invalid permament city at row ' + indx + '.\n';
                    else
                      element.PermanentAddressCityId = +CityObj[0].MasterDataId;
                  }
                }
                else {
                  element.PermanentAddressCityId = 0;
                }
              }
            }
          }
          else {
            element.PermanentAddressStateId = 0;
            element.PermanentAddressCityId = 0;
          }
        }
      }
      else {
        element.PermanentAddressCountryId = 0;
        element.PermanentAddressStateId = 0;
        element.PermanentAddressCityId = 0;
      }
      if (element.PresentAddressCountry != '') {
        var PresentAddressCountryIdobj: any = this.Country.filter((f: any) => f.MasterDataName.toLowerCase() == element.PresentAddressCountry.toLowerCase())
        if (PresentAddressCountryIdobj.length == 0)
          this.ErrorMessage += 'Invalid present country at row ' + indx + '.\n';
        else {
          element.PresentAddressCountryId = +PresentAddressCountryIdobj[0].MasterDataId;
          if (element.PresentAddressState != '') {
            var PresentAddressStateobj = this.AllMasterData.filter((f: any) => f.ParentId == element.PresentAddressCountryId)
            if (PresentAddressStateobj.length > 0) {
              var listOfStates = PresentAddressStateobj.filter((f: any) => f.MasterDataName.toLowerCase() == element.PresentAddressState.toLowerCase());
              if (listOfStates.length == 0)
                this.ErrorMessage += 'Invalid present state at row ' + indx + '.\n';
              else {
                element.PresentAddressStateId = +listOfStates[0].MasterDataId;
                if (element.PresentAddressCity != '') {
                  var ListPresentAddressCityobj = this.AllMasterData.filter((f: any) => f.ParentId == element.PresentAddressStateId)
                  if (ListPresentAddressCityobj.length > 0) {
                    var CityObj = ListPresentAddressCityobj.filter((f: any) => f.MasterDataName.toLowerCase() == element.PresentAddressCity.toLowerCase());
                    if (CityObj.length == 0)
                      this.ErrorMessage += 'Invalid present city at row ' + indx + '.\n';
                    else
                      element.PresentAddressCityId = +CityObj[0].MasterDataId;
                  }
                  else
                    element.PresentAddressCityId = 0;
                }
                else {
                  element.PermanentAddressCityId = 0;
                }
              }
            }
          }
          else {
            element.PermanentAddressStateId = 0;
            element.PermanentAddressCityId = 0;
          }
        }
      }
      else {
        element.PermanentAddressCountryId = 0;
        element.PermanentAddressStateId = 0;
        element.PermanentAddressCityId = 0;
      }
      if (element.Department != '') {
        var DepartmentIdobj: any = this.Departments.filter((f: any) => f.MasterDataName.toLowerCase() == element.Department.toLowerCase())
        if (DepartmentIdobj.length == 0)
          this.ErrorMessage += 'Invalid department at row ' + indx + '.\n';
        else
          element.DepartmentId = DepartmentIdobj[0].MasterDataId;
      }
      else
        element.DepartmentId = 0;

      if (element.Designation != '') {
        var DesignationIdobj: any = this.Designations.filter((f: any) => f.MasterDataName.toLowerCase() == element.Designation.toLowerCase())
        if (DesignationIdobj.length == 0)
          this.ErrorMessage += 'Invalid designation at row ' + indx + '.\n';
        else
          element.DesignationId = DesignationIdobj[0].MasterDataId;
      }
      else
        element.DesignationId = 0;

      if (element.EmpGrade != '') {
        var EmpGradeIdobj: any = this.EmployeeGrades.filter((f: any) => f.MasterDataName.toLowerCase() == element.EmpGrade.toLowerCase())
        if (EmpGradeIdobj.length == 0)
          this.ErrorMessage += 'Invalid grade at row ' + indx + '.\n';
        else
          element.EmpGradeId = EmpGradeIdobj[0].MasterDataId;
      }
      else
        element.EmpGradeId = 0;

      if (Number.isNaN(element.NoticePeriodDays))
        element.NoticePeriodDays = 0;
      //  this.ErrorMessage += 'NoticePeriodDays at row ' + indx + ' must be numeric.\n';
      //else


      if (Number.isNaN(element.ProbationPeriodDays))
        element.ProbationPeriodDays = 0;
      // this.ErrorMessage += 'ProbationPeriodDays at row ' + indx + ' must be numeric.\n';
      // else
      //   element.ProbationPeriodDays = 0;

      if (element.DOB && isNaN(Date.parse(element.DOB)))
        this.ErrorMessage += 'Invalid DOB at row ' + indx;
      // else if (element.DOB )
      //   element.DOB = new Date(element.DOB).toISOString();


      if (element.DOJ && isNaN(Date.parse(element.DOJ)))
        this.ErrorMessage += 'Invalid DOJ at row ' + indx + ":" + element.DOJ + "; ";
      // else if (element.DOJ )
      //   element.DOJ = new Date(element.DOJ).toISOString();

      if (element.ConfirmationDate && !isNaN(Date.parse(element.ConfirmationDate)))
        this.ErrorMessage += 'Invalid ConfirmationDate at row ' + indx;
      // else if (element.ConfirmationDate )
      //   element.ConfirmationDate = new Date(element.ConfirmationDate).toISOString();

      if (element.MarriedDate && !isNaN(Date.parse(element.MarriedDate)))
        this.ErrorMessage += 'Invalid MarriedDate at row ' + indx;
      // else if (element.MarriedDate )
      //   element.MarriedDate = new Date(element.MarriedDate).toISOString();

      if (element.ShortName && element.ShortName.length > 10)
        this.ErrorMessage += 'ShortName must be less than 11 characters at row ' + indx + '.\n';
      if (element.FirstName && element.FirstName.length > 30)
        this.ErrorMessage += 'FirstName must be less than 31 characters at row ' + indx + '.\n';
      if (element.LastName && element.LastName.length > 30)
        this.ErrorMessage += 'LastName must be less than 31 characters at row ' + indx + '.\n';

      if (element.MotherName && element.MotherName.length > 30)
        this.ErrorMessage += 'MotherName must be less than 31 characters at row ' + indx + '.\n';
      if (element.FatherName && element.FatherName.length > 30)
        this.ErrorMessage += 'FatherName must be less than 31 characters at row ' + indx + '.\n';
      if (element.MICRNo && element.MICRNo.length > 20)
        this.ErrorMessage += 'MICRNo must be less than 21 characters at row ' + indx + '.\n';

      if (element.BankAccountNo && element.BankAccountNo.length > 20)
        this.ErrorMessage += 'BankAccountNo must be less than 21 characters at row ' + indx + '.\n';
      if (element.IFSCCode && element.IFSCcode.length > 15)
        this.ErrorMessage += 'IFSCcode must be less than 16 characters at row ' + indx + '.\n';
      if (element.MICRNo && element.MICRNo.length > 20)
        this.ErrorMessage += 'MICRNo must be less than 21 characters at row ' + indx + '.\n';

      if (element.AdhaarNo && element.AdhaarNo.length > 15)
        this.ErrorMessage += 'AdhaarNo must be less than 16 characters at row ' + indx + '.\n';
      if (element.PhotoPath && element.PhotoPath.length > 50)
        this.ErrorMessage += 'PhotoPath must be less than 51 characters at row ' + indx + '.\n';
      if (element.PersonalNo && element.PersonalNo.length > 50)
        this.ErrorMessage += 'PersonalNo must be less than 51 characters at row ' + indx + '.\n';
      if (element.WhatsappNo && element.WhatsappNo.length > 30)
        this.ErrorMessage += 'WhatsappNo must be less than 31 characters at row ' + indx + '.\n';
      if (element.AlternateContactNo && element.AlternateContactNo.length > 30)
        this.ErrorMessage += 'AlternateContactNo should be less than 31 characters at row ' + indx + '.\n';


      if (element.EmailAddress && element.EmailAddress.length > 50)
        this.ErrorMessage += 'EmailAddress must be less than 51 characters at row ' + indx + '.\n';
      else if (element.EmailAddress == undefined)
        element.EmailAddress = '';

      if (element.EmergencyContactNo && element.EmergencyContactNo.length > 30)
        this.ErrorMessage += 'EmergencyContactNo must be less than 31 characters at row ' + indx + '.\n';
      else if (element.EmergencyContactNo == undefined)
        element.EmergencyContactNo = ''

      if (element.PassportNo && element.PassportNo.length > 12)
        this.ErrorMessage += 'PassportNo must be less than 13 characters at row ' + indx + '.\n';
      else if (element.PassportNo == undefined)
        element.PassportNo = ''

      if (element.PAN && element.PAN.length > 12)
        this.ErrorMessage += 'PAN must be less 13 characters than 12 at row ' + indx + '.\n';
      else if (element.PAN == undefined)
        element.PAN = ''

      if (element.PFAccountNo && element.PFAccountNo.length > 20)
        this.ErrorMessage += 'PFAccountNo must be less 21 characters at row ' + indx + '.\n';
      else if (element.PFAccountNo == undefined)
        element.PFAccountNo = '';

      if (element["Remarks"] == undefined) {
        element["Remarks"] = '';
      }
      if (element["Remarks"] && element.Remarks.length > 250)
        this.ErrorMessage += 'Remarks must be less 250 characters at row ' + indx + '.\n';
      if (element.PresentAddress.length > 256)
        this.ErrorMessage += 'PresentAddress must be less 257 characters at row ' + indx + '.\n';
      else if (element.PresentAddress == undefined)
        element.PresentAddress = '';

      if (element.PermanentAddress.length > 256)
        this.ErrorMessage += 'PermanentAddress must be less 257 characters at row ' + indx + '.\n';
      else if (element.PermanentAddress == undefined)
        element.PermanentAddress = '';

      if (element.PresentAddressPincode.length > 10)
        this.ErrorMessage += 'PresentAddressPincode must be less 11 characters at row ' + indx + '.\n';
      else if (element.PresentAddressPincode == undefined)
        element.PresentAddressPincode = '';

      if (element.PermanentAddressPincode.length > 10)
        this.ErrorMessage += 'PermanentAddressPincode must be less 11 characters at row ' + indx + '.\n';
      else if (element.PermanentAddressPincode == undefined)
        element.PermanentAddressPincode = '';
      if (element.IDMark.length > 100)
        this.ErrorMessage += 'Identification Mark must be less 100 characters at row ' + indx + '.\n';
      else if (element.IDMark == undefined)
        element.IDMark = '';

      element.OrgId = this.loginDetail[0]["orgId"];
      element.SubOrgId = this.SubOrgId;

      var _nonManadatory: any = this.ColumnsOfSelectedReports.filter((f: any) => f.Active == 0);
      _nonManadatory.forEach(f => {
        if (element[f.ReportName] == undefined || element[f.ReportName] == null) {
          element[f.ReportName] = '';
        }
        else if (Number.isNaN(element[f.ReportName])) {
          element[f.ReportName] = 0;
        }
      })

      if (this.ErrorMessage.length == 0)
        this.ELEMENT_DATA.push(element);
    });
    // //console.log("this.ELEMENT_DATA", this.ELEMENT_DATA)
  }
  // DateCheck(datestr){
  //     var strArray = datestr.split('/');
  //     if(strArray.length>0)
  //     {
  //       if(strArray[0]<)
  //     }
  // }
  ValidateStudentActivity() {
    debugger;
    let slno: any = 0;
    this.ErrorMessage = '';
    this.GetClassEvaluations()
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassEvaluations = [...data.value];

          this.jsonData.map((element, indx) => {
            slno = parseInt(indx) + 1;

            var _ratingId = element.RatingId;
            var _detail = element.Detail;

            if (element.ClassEvaluationId == 0) {
              this.ErrorMessage += "ClassEvaluationId cannot be blank or zero at row " + slno + ": " + element.ClassEvaluationId + "<br>";
            }
            else {
              var checkexist = this.ClassEvaluations.filter((f: any) => f.ClassEvaluationId == element.ClassEvaluationId);
              if (checkexist.length == 0)
                this.ErrorMessage += "ClassEvaluationId is not valid at row " + slno + ": " + element.ClassEvaluationId + "<br>";

            }
            if (_ratingId == 0 && _detail == '')
              this.ErrorMessage += "Either rating or detail should be entered at row " + slno + ".<br>";

            let StudentClsFilter: any = this.StudentClassList.filter((g: any) => g.StudentId == element.StudentId);
            if (StudentClsFilter.length == 0)
              this.ErrorMessage += "Invalid StudentId at row " + slno + ":" + element.StudentId + "<br>";
            else
              element.StudentClassId = StudentClsFilter[0].StudentClassId;
            element.CreatedDate = element.ActivityDate;
            element.OrgId = this.loginDetail[0]["orgId"];
            element.SubOrgId = this.SubOrgId;
            this.ELEMENT_DATA.push(element);
            //}
          })
        }
        else {
          this.contentservice.openSnackBar("No class evaluation found.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        if (this.ErrorMessage.length > 0)
          this.snackbar.open("Data is ready for upload. Please click on file upload button.", globalconstants.ActionText,
            globalconstants.BlueBackground);
        this.loading = false; this.PageLoading = false;
      })
  }
  ValidateStudentClassData() {
    debugger;
    let slno: any = 0;
    this.ErrorMessage = '';
    this.jsonData.forEach((element, indx) => {
      slno = parseInt(indx) + 1;

      let studentFilter: any = this.AllStudents.filter((g: any) => g.PID == element.PID);
      if (studentFilter.length == 0)
        this.ErrorMessage += "Invalid PID at row " + slno + ":" + element.PID + "<br>";
      if (element.Section) {
        let sectionFilter: any = this.Sections.filter((g: any) => g.MasterDataName.toUpperCase() == element.Section.trim().toUpperCase());
        if (sectionFilter.length == 0)
          this.ErrorMessage += "Invalid section at row " + slno + ":" + element.Section + "<br>";
        else {
          element.Section = sectionFilter[0].MasterDataId;
        }
      }
      else
        element.Section = 0;

      if (element.Semester) {
        let semesterFilter: any = this.Semesters.filter((g: any) => g.MasterDataName.toUpperCase() == element.Semester.trim().toUpperCase());
        if (semesterFilter.length == 0)
          this.ErrorMessage += "Invalid semester at row " + slno + ":" + element.Semester + "<br>";
        else {
          element.SemesterId = semesterFilter[0].MasterDataId;
        }
      }
      else
        element.SemesterId = 0;

      // if (element.CourseYear) {
      //   let CourseYearFilter = this.CourseYears.filter((g:any)=> g.MasterDataName.toUpperCase() == element.CourseYear.trim().toUpperCase());
      //   if (CourseYearFilter.length == 0)
      //     this.ErrorMessage += "Invalid Course Year at row " + slno + ":" + element.CourseYear + "<br>";
      //   else {
      //     element.CourseYearId = CourseYearFilter[0].MasterDataId;
      //   }
      // }
      // else
      //   element.CourseYearId = 0;

      let classFilter: any = this.Classes.filter((g: any) => g.ClassName == element.ClassName);
      if (classFilter.length == 0)
        this.ErrorMessage += "Invalid Class at row " + slno + ":" + element.ClassName + "<br>";
      else
        element.ClassId = classFilter[0].ClassId;

      var _studentclass: any = this.StudentClassList.filter((f: any) => f.StudentId == studentFilter[0].StudentId);
      if (_studentclass.length > 0)
        element.StudentClassId = _studentclass[0].StudentClassId
      else
        element.StudentClassId = 0;

      var _FeeTypeId = 0;
      var _regularFeeTypeIds: any = this.FeeTypes.filter((f: any) => f.FeeTypeName.toLowerCase() == 'regular');
      if (_regularFeeTypeIds.length > 0)
        _FeeTypeId = _regularFeeTypeIds[0].FeeTypeId;

      if (element.FeeType) {
        var _existingFeeTypeObj: any = this.FeeTypes.filter((f: any) => f.FeeTypeName.toLowerCase() == element.FeeType.toLowerCase());
        if (_existingFeeTypeObj.length > 0) {
          _FeeTypeId = _existingFeeTypeObj[0].FeeTypeId;
        }
      }


      if (this.ErrorMessage.length == 0) {
        if (element.StudentClassId > 0) {
          //if studentclassid already exist, dont update classid,FeeTypeId
          this.ELEMENT_DATA.push({
            StudentId: +studentFilter[0].StudentId,
            SectionId: element.Section,
            RollNo: element.RollNo ? element.RollNo : '',
            SemesterId: element.SemesterId,
            IsCurrent: true,
            StudentClassId: element.StudentClassId,
            BatchId: this.SelectedBatchId,
            OrgId: this.loginDetail[0]["orgId"],
            SubOrgId: this.SubOrgId
          });
        }
        else {

          this.ELEMENT_DATA.push({
            StudentId: +studentFilter[0].StudentId,
            ClassId: element.ClassId,
            SectionId: element.Section,
            RollNo: element.RollNo ? element.RollNo : '',
            StudentClassId: element.StudentClassId,
            SemesterId: element.SemesterId,
            IsCurrent: true,
            FeeTypeId: _FeeTypeId,
            BatchId: this.SelectedBatchId,
            OrgId: this.loginDetail[0]["orgId"],
            SubOrgId: this.SubOrgId,
            Active: 1
          });
        }
      }
    });
    //////console.log('this.ELEMENT_DATA', this.ELEMENT_DATA);
  }
  exportArray() {
    if (this.AlreadyExistStudent.length > 0) {
      const datatoExport: Partial<any>[] = this.AlreadyExistStudent;
      TableUtil.exportArrayToExcel(datatoExport, "StudentclassForUpload");
    }
  }
  NewStudentExportArray() {
    if (this.ELEMENT_DATA.length > 0) {
      const datatoExport: Partial<any>[] = this.ELEMENT_DATA;
      TableUtil.exportArrayToExcel(datatoExport, "NewStudentForUpload");
    }
  }
  AlreadyExistStudent: any = [];
  CleanDisplayCol: any = [];
  ValidateStudentData() {
    let slno: any = 0;
    debugger;

    this.AlreadyExistStudent = [];
    this.jsonData.forEach((element, indx) => {
      slno = parseInt(indx) + 1;
      element.FirstName = element.FirstName.trim();
      element.FatherName = element.FatherName ? element.FatherName.trim() : '';
      element.MotherName = element.MotherName ? element.MotherName.trim() : '';
      element.LastName = element.LastName ? element.LastName.trim() : '';

      if (isNaN(new Date(element.DOB).getTime())) {
        this.ErrorMessage += "Invalid date at row : " + indx;
      }

      if (element.CreatedDate && element.CreatedDate != '')
        element.CreatedDate = new Date(element.CreatedDate);
      else
        element.CreatedDate = new Date();
      if (element.UpdatedDate && element.UpdatedDate != '')
        element.UpdatedDate = new Date(element.UpdatedDate);
      else
        element.UpdatedDate = new Date();

      var _MadatoryField = ''
      var _MandatoryColumns = this.ColumnsOfSelectedReports.filter((f: any) => f.Active == 1);

      _MandatoryColumns.forEach((b: any) => {
        if (!element[b.ReportName]) {// == undefined || element[b.ReportName] == null || element[b.ReportName].length == 0) {
          //_MadatoryField = b.ReportName;
          this.ErrorMessage += b.ReportName + " is required at row " + slno + ".<br>";
        }
      })

      // if (_MadatoryField.length > 0)
      //   this.ErrorMessage += _MadatoryField + " is required at row " + slno + ".<br>";

      //debugger;
      if (element.Gender) {
        let GenderFilter: any = this.Genders.filter((g: any) => g.MasterDataName.toLowerCase() == element.Gender.toLowerCase());
        if (GenderFilter.length == 0)
          this.ErrorMessage += "Invalid Gender at row " + slno + ":" + element.Gender + "<br>";
        else
          element.GenderId = GenderFilter[0].MasterDataId;
      }
      else
        element.GenderId = 0;

      if (element.House) {
        let houseFilter: any = this.Houses.filter((g: any) => g.MasterDataName.toLowerCase() == element.House.toLowerCase());
        if (houseFilter.length == 0)
          this.ErrorMessage += "Invalid House at row " + slno + ":" + element.House + "<br>";
        else
          element.HouseId = houseFilter[0].MasterDataId;
      }
      else
        element.HouseId = 0;

      if (element.Bloodgroup) {
        let BloodgroupFilter: any = this.Bloodgroup.filter((g: any) => g.MasterDataName.toLowerCase() == element.Bloodgroup.toLowerCase());
        if (BloodgroupFilter.length == 0)
          this.ErrorMessage += "Invalid Bloodgroup at row " + slno + ":" + element.Bloodgroup + "<br>";
        else
          element.BloodgroupId = BloodgroupFilter[0].MasterDataId;
      }
      else
        element.BloodgroupId = 0;

      if (element.Section) {
        let SectionFilter: any = this.Sections.filter((g: any) => g.MasterDataName.toLowerCase() == element.Section.toLowerCase());
        if (SectionFilter.length == 0)
          this.ErrorMessage += "Invalid Section at row " + slno + ":" + element.Section + "<br>";
        else
          element.SectionId = SectionFilter[0].MasterDataId;
      }
      else
        element.SectionId = 0;

      if (element.Semester) {
        let semesterFilter: any = this.Semesters.filter((g: any) => g.MasterDataName.toUpperCase() == element.Semester.trim().toUpperCase());
        if (semesterFilter.length == 0)
          this.ErrorMessage += "Invalid semester at row " + slno + ":" + element.Semester + "<br>";
        else {
          element.SemesterId = semesterFilter[0].MasterDataId;
        }
      }
      else
        element.SemesterId = 0;

      // if (element.FeeType) {
      //   let FeeTypeFilter: any = this.FeeTypes.filter((g: any) => g.FeeTypeName.toUpperCase() == element.FeeType.trim().toUpperCase());
      //   if (FeeTypeFilter.length == 0)
      //     this.ErrorMessage += "Invalid Fee Type at row " + slno + ":" + element.FeeType + "<br>";
      //   else {
      //     element.FeeTypeId = FeeTypeFilter[0].FeeTypeId;
      //   }
      // }
      // else
      //   element.FeeTypeId = 0;

      if (element.Category) {
        let Categoryfilter: any = this.Category.filter((g: any) => g.MasterDataName.toLowerCase() == element.Category.toLowerCase());
        if (Categoryfilter.length == 0)
          this.ErrorMessage += "Invalid Category at row " + slno + ":" + element.Category + "<br>";
        else
          element.CategoryId = Categoryfilter[0].MasterDataId;
      }
      else
        element.CategoryId = 0;

      if (element.Religion) {
        let ReligionFilter: any = this.Religion.filter((g: any) => g.MasterDataName.toLowerCase() == element.Religion.toLowerCase());
        if (ReligionFilter.length == 0)
          this.ErrorMessage += "Invalid Religion at row " + slno + ":" + element.Religion + "<br>";
        else
          element.ReligionId = ReligionFilter[0].MasterDataId;
      }
      else
        element.ReligionId = 0;

      if (element.AdmissionStatus) {
        let AdmissionStatusFilter: any = this.AdmissionStatuses.filter((g: any) => g.MasterDataName.toLowerCase() == element.AdmissionStatus.toLowerCase());
        if (AdmissionStatusFilter.length == 0)
          this.ErrorMessage += "Invalid admission status at row " + slno + ":" + element.AdmissionStatus + "<br>";
        else
          element.AdmissionStatusId = AdmissionStatusFilter[0].MasterDataId;
      }
      else
        element.AdmissionStatusId = 0;

      if (element.PrimaryContactFatherOrMother) {
        let PrimaryContactFatherOrMotherFilter: any = this.PrimaryContact.filter((g: any) => g.MasterDataName.toLowerCase() == element.PrimaryContactFatherOrMother.toLowerCase());
        if (PrimaryContactFatherOrMotherFilter.length == 0)
          this.ErrorMessage += "Invalid PrimaryContactFatherOrMother at row " + slno + ":" + element.PrimaryContactFatherOrMother + "<br>";
        else
          element.PrimaryContactFatherOrMother = PrimaryContactFatherOrMotherFilter[0].MasterDataId;
      }
      else
        element.PrimaryContactFatherOrMother = 0;

      if (element.ClassAdmissionSought) {
        let ClassAdmissionSoughtFilter = this.Classes.filter((g: any) => g.ClassName.toLowerCase() == element.ClassAdmissionSought.toLowerCase());
        if (ClassAdmissionSoughtFilter.length == 0)
          this.ErrorMessage += "Invalid ClassAdmissionSought at row " + slno + ":" + element.ClassAdmissionSought + "<br>";
        else
          element.ClassAdmissionSought = ClassAdmissionSoughtFilter[0].ClassId;
      }
      else
        element.ClassAdmissionSought = 0;


      if (element.Club) {
        let ClubObj: any = this.Clubs.filter((g: any) => g.MasterDataName.toLowerCase() == element.Club.toLowerCase());
        if (ClubObj.length == 0)
          this.ErrorMessage += "Invalid Club at row " + slno + ":" + element.Club + "<br>";
        else
          element.ClubId = ClubObj[0].MasterDataId;
      }
      else
        element.ClubId = 0;

      if (element.House) {
        let houseObj: any = this.Houses.filter((g: any) => g.MasterDataName.toLowerCase() == element.House.toLowerCase());
        if (houseObj.length == 0)
          this.ErrorMessage += "Invalid house at row " + slno + ":" + element.House + "<br>";
        else
          element.HouseId = houseObj[0].MasterDataId;
      }
      else
        element.HouseId = 0;

      if (element.Remarks) {
        let remarkObj: any = this.Remarks.filter((g: any) => g.MasterDataName.toLowerCase() == element.Remarks.toLowerCase());
        if (remarkObj.length == 0)
          this.ErrorMessage += "Invalid remark at row " + slno + ":" + element.Remarks + "<br>";
        else
          element.RemarkId = remarkObj[0].MasterDataId;
      }
      else
        element.RemarkId = 0;
      debugger;
      if (element.PermanentAddressCountry) {
        let CountryObj = this.AllMasterData.filter((g: any) => g.MasterDataName.toLowerCase() == element.PermanentAddressCountry.toLowerCase());
        if (CountryObj.length == 0)
          this.ErrorMessage += "Invalid country at row " + slno + ":" + element.PermanentAddressCountry + "<br>";
        else {
          element.PermanentAddressCountryId = CountryObj[0].MasterDataId;
          if (element.PermanentAddressState) {
            let stateObj = this.AllMasterData.filter((g: any) => g.MasterDataName.toLowerCase() == element.PermanentAddressState.toLowerCase()
              && g.ParentId == element.PermanentAddressCountryId);
            if (stateObj.length == 0)
              this.ErrorMessage += "Invalid state at row " + slno + ":" + element.PermanentAddressState + "<br>";
            else {
              element.PermanentAddressStateId = stateObj[0].MasterDataId;
              if (element.PermanentAddressCity) {
                let CityObj = this.AllMasterData.filter((g: any) => g.MasterDataName.toLowerCase() == element.PermanentAddressCity.toLowerCase()
                  && g.ParentId == element.PermanentAddressStateId);
                if (CityObj.length == 0)
                  this.ErrorMessage += "Invalid city at row " + slno + ":" + element.PermanentAddressCity + "<br>";
                else
                  element.PermanentAddressCityId = CityObj[0].MasterDataId;
              }
              else
                element.PermanentAddressCityId = 0;
            }
          }
          else {
            element.PermanentAddressStateId = 0;
            element.PermanentAddressCityId = 0;
          }
        }
      }
      else {
        element.PermanentAddressCountryId = 0;
        element.PermanentAddressStateId = 0;
        element.PermanentAddressCityId = 0;

      }
      if (element.PresentAddressCountry) {
        let CountryObj = this.AllMasterData.filter((g: any) => g.MasterDataName.toLowerCase() == element.PresentAddressCountry.toLowerCase());
        if (CountryObj.length == 0)
          this.ErrorMessage += "Invalid country at row " + slno + ":" + element.PresentAddressCountry + "<br>";
        else {
          element.PresentAddressCountryId = CountryObj[0].MasterDataId;
          if (element.PresentAddressState) {
            let stateObj = this.AllMasterData.filter((g: any) => g.MasterDataName.toLowerCase() == element.PresentAddressState.toLowerCase()
              && g.ParentId == element.PresentAddressCountryId);
            if (stateObj.length == 0)
              this.ErrorMessage += "Invalid state at row " + slno + ":" + element.PresentAddressState + "<br>";
            else {
              element.PresentAddressStateId = stateObj[0].MasterDataId;
              if (element.PresentAddressCity) {
                let CityObj = this.AllMasterData.filter((g: any) => g.MasterDataName.toLowerCase() == element.PresentAddressCity.toLowerCase()
                  && g.ParentId == element.PresentAddressStateId);
                if (CityObj.length == 0)
                  this.ErrorMessage += "Invalid city at row " + slno + ":" + element.PresentAddressCity + "<br>";
                else
                  element.PresentAddressCityId = CityObj[0].MasterDataId;
              }
              else
                element.PresentAddressCityId = 0;
            }
          }
          else {
            element.PresentAddressStateId = 0;
            element.PresentAddressCityId = 0;
          }
        }
      }
      else {
        element.PresentAddressCountryId = 0;
        element.PresentAddressStateId = 0;
        element.PresentAddressCityId = 0;
      }


      if (element.PersonalNo && element.PersonalNo.length > 32) {
        this.ErrorMessage += 'Contact no length is more than 32 characters.';
      }
      if (element.FirstName && element.FirstName.length > 50) {
        this.ErrorMessage += 'Firstname should not be greater than 50 characters.';
      }
      if (element.LastName && element.LastName.length > 50) {
        this.ErrorMessage += 'LastName should not be greater than 50 characters.';
      }
      if (element.FatherName && element.FatherName.length > 50) {
        this.ErrorMessage += 'FatherName should not be greater than 50 characters.';
      }
      if (element.MotherName && element.MotherName.length > 50) {
        this.ErrorMessage += 'MotherName should not be greater than 50 characters.';
      }
      if (element.PermanentAddress && element.PermanentAddress.length > 250) {
        this.ErrorMessage += 'PermanentAddress should not be greater than 250 characters.';
      }
      if (element.PresentAddress && element.PresentAddress.length > 250) {
        this.ErrorMessage += 'PresentAddress should not be greater than 250 characters.';
      }
      if (element.WhatsAppNumber && element.WhatsAppNumber.length > 15) {
        this.ErrorMessage += 'WhatsAppNumber should not be greater than 15 characters.';
      }
      if (element.PermanentAddressPincode && element.PermanentAddressPincode.length > 15) {
        this.ErrorMessage += 'PermanentAddressPincode should not be greater than 10 characters.';
      }
      if (element.BankAccountNo && element.BankAccountNo.length > 30) {
        this.ErrorMessage += 'BankAccountNo should not be greater than 30 characters.';
      }
      if (element.IFSCCode && element.IFSCCode.length > 30) {
        this.ErrorMessage += 'IFSCCode should not be greater than 30 characters.';
      }

      if (element.MICRNo && element.MICRNo.length > 30) {
        this.ErrorMessage += 'MICRNo should not be greater than 30 characters.';
      }
      if (!element.AdhaarNo)
        element.AdhaarNo = '';
      if (!element.AdmissionNo)
        element.AdmissionNo = '';
      if (!element.BoardRegistrationNo)
        element.BoardRegistrationNo = '';

      if (element.AdhaarNo && element.AdhaarNo.length > 15) {
        this.ErrorMessage += 'AdhaarNo should not be greater than 15 characters.';
      }
      if (element.Photo && element.Photo.length > 50) {
        this.ErrorMessage += 'Photo should not be greater than 50 characters.';
      }
      if (element.AlternateContact && element.AlternateContact.length > 32) {
        this.ErrorMessage += 'AlternateContact should not be greater than 32 characters.';
      }
      if (element.EmailAddress && element.EmailAddress.length > 50) {
        this.ErrorMessage += 'EmailAddress should not be greater than 50 characters.';
      }
      if (element.BoardRegistrationNo && element.BoardRegistrationNo.length > 15) {
        this.ErrorMessage += 'Board Registration No. should not be greater than 15 characters.';
      }
      if (element.LastSchoolPercentage && element.LastSchoolPercentage.length > 10) {
        this.ErrorMessage += 'LastSchoolPercentage should not be greater than 10 characters.';
      }

      if (element.TransferFromSchool && element.TransferFromSchool.length > 100) {
        this.ErrorMessage += 'TransferFromSchool should not be greater than 100 characters.';
      }
      if (element.TransferFromSchoolBoard && element.TransferFromSchoolBoard.length > 100) {
        this.ErrorMessage += 'TransferFromSchoolBoard should not be greater than 100 characters.';
      }
      if (element.FatherOccupation && element.FatherOccupation.length > 100) {
        this.ErrorMessage += 'FatherOccupation should not be greater than 100 characters.';
      }
      if (element.FatherContactNo && element.FatherContactNo.length > 20) {
        this.ErrorMessage += 'FatherContactNo should not be greater than 20 characters.';
      }
      if (element.MotherContactNo && element.MotherContactNo.length > 20) {
        this.ErrorMessage += 'MotherContactNo should not be greater than 20 characters.';
      }
      if (element.NameOfContactPerson && element.NameOfContactPerson.length > 30) {
        this.ErrorMessage += 'NameOfContactPerson should not be greater than 30 characters.';
      }
      if (element.RelationWithContactPerson && element.RelationWithContactPerson.length > 30) {
        this.ErrorMessage += 'RelationWithContactPerson should not be greater than 30 characters.';
      }
      if (element.ContactPersonContactNo && element.ContactPersonContactNo.length > 20) {
        this.ErrorMessage += 'ContactPersonContactNo should not be greater than 20 characters.';
      }
      if (element.RollNo && element.RollNo.length > 30) {
        this.ErrorMessage += 'RollNo should not be greater than 30 characters.';
      }
      if (element.AdmissionNo && element.AdmissionNo.length > 15) {
        this.ErrorMessage += 'AdmissionNo should not be greater than 15 characters.';
      }
      if (element.Active == undefined) {
        element.Active = 1;
      }

      element.StudentId = +element.StudentId;

      element.OrgId = this.loginDetail[0]["orgId"];
      element.SubOrgId = this.SubOrgId;
      element.BatchId = this.SelectedBatchId;

      var _nonManadatory: any = this.ColumnsOfSelectedReports.filter((f: any) => f.Active == 0);
      _nonManadatory.forEach(f => {
        if (element[f.ReportName] == undefined || element[f.ReportName] == null) {
          element[f.ReportName] = '';
        }
        else if (Number.isNaN(element[f.ReportName])) {
          element[f.ReportName] = 0;
        }
      })
      /////////////feetype  
      var _FeeTypeId = 0;
      var _regularFeeTypeIds: any = this.FeeTypes.filter((f: any) => f.FeeTypeName.toLowerCase() == 'regular');
      if (_regularFeeTypeIds.length > 0)
        _FeeTypeId = _regularFeeTypeIds[0].FeeTypeId;

      if (element.FeeType) {
        var _existingFeeTypeObj: any = this.FeeTypes.filter((f: any) => f.FeeTypeName.toLowerCase() == element.FeeType.toLowerCase());
        if (_existingFeeTypeObj.length > 0) {
          _FeeTypeId = _existingFeeTypeObj[0].FeeTypeId;
        }
      }
      element.FeeTypeId = _FeeTypeId;
      /////end feetype

      let existingstudent: any = this.AllStudents?.filter((s: any) => s.FirstName.toLowerCase() == element.FirstName.toLowerCase()
      && s.FatherName.toLowerCase() == element.FatherName.toLowerCase())
      if (existingstudent?.length > 0) {

        let currentStud = this.CurrentBatchStudentList.filter(f => f.StudentClasses
          && f.StudentClasses.length > 0
          && f.StudentClasses[0].ClassId == element.ClassID);
        if (currentStud.length > 0)
          element.StudentClassId = currentStud[0].StudentClasses[0].StudentClassId;
        else
          element.StudentClassId = 0;

        if (element.StudentClassId > 0) {
          //if studentclassid already exist, dont update classid,FeeTypeId
          this.AlreadyExistStudent.push({
            Name: element.FirstName.trim() + " " + element.LastName.trim(),
            FatherName: element.FatherName,
            MotherName: element.MotherName,
            PID: existingstudent[0].PID,
            StudentId: +existingstudent[0].StudentId,
            SectionId: element.SectionId,
            RollNo: element.RollNo ? element.RollNo : '',
            SemesterId: element.SemesterId,
            IsCurrent: true,
            StudentClassId: element.StudentClassId,
            BatchId: this.SelectedBatchId,
            OrgId: this.loginDetail[0]["orgId"],
            SubOrgId: this.SubOrgId
          });
        }
        else {

          this.AlreadyExistStudent.push({
            Name: element.FirstName.trim(),
            LastName: element.LastName.trim(),
            FatherName: element.FatherName,
            MotherName: element.MotherName,
            PID: existingstudent[0].PID,
            StudentId: +existingstudent[0].StudentId,
            ClassId: element.ClassAdmissionSought,
            SectionId: element.SectionId,
            RollNo: element.RollNo ? element.RollNo : '',
            StudentClassId: element.StudentClassId,
            SemesterId: element.SemesterId,
            IsCurrent: true,
            FeeTypeId: _FeeTypeId,
            BatchId: this.SelectedBatchId,
            OrgId: this.loginDetail[0]["orgId"],
            SubOrgId: this.SubOrgId,
            Active: 1
          });
        }
      }
      else
        this.ELEMENT_DATA.push(element);

    });
    this.DuplicateDisplayCol = [
      "PID",
      "Name",
      "FatherName",
      "MotherName"
    ]
    this.CleanDisplayCol = [
      "PID",
      "FirstName",
      "FatherName",
      "MotherName"
    ]
    this.dataSource = new MatTableDataSource(this.AlreadyExistStudent);

    this.cleanDataSource = new MatTableDataSource(this.ELEMENT_DATA);

  }
  UploadStudentClass() {
    this.SelectedUploadtype = "student class upload";
    let studentCls: any = [];

    // this.AlreadyExistStudent.push({
    //   Name: element.FirstName.trim(),
    //   LastName: element.LastName.trim(),
    //   FatherName: element.FatherName,
    //   MotherName: element.MotherName,
    //   PID: existingstudent[0].PID,
    //   StudentId: +existingstudent[0].StudentId,
    //   ClassId: element.ClassId,
    //   SectionId: element.SectionId,
    //   RollNo: element.RollNo ? element.RollNo : '',
    //   StudentClassId: element.StudentClassId,
    //   SemesterId: element.SemesterId,
    //   IsCurrent: true,
    //   FeeTypeId: _FeeTypeId,
    //   BatchId: this.SelectedBatchId,
    //   OrgId: this.loginDetail[0]["orgId"],
    //   SubOrgId: this.SubOrgId,
    //   Active: 1
    // });

    this.AlreadyExistStudent.forEach(item => {
      if (item.StudentClassId == 0) {
        studentCls.push({
          StudentId: item.StudentId,
          ClassId: item.ClassId,
          SectionId: item.SectionId,
          SemesterId: item.SemesterId,
          RollNo: item.RollNo,
          StudentClassId: item.StudentClassId,
          IsCurrent: true,
          FeeTypeId: item.FeeTypeId,
          BatchId: this.SelectedBatchId,
          OrgId: this.loginDetail[0]["orgId"],
          SubOrgId: this.SubOrgId,
          Active: 1
        })
      }
      else {
        studentCls.push({
          StudentId: item.StudentId,
          SectionId: item.SectionId,
          SemesterId: item.SemesterId,
          RollNo: item.RollNo,
          StudentClassId: item.StudentClassId,
          IsCurrent: true,
          BatchId: this.SelectedBatchId,
          OrgId: this.loginDetail[0]["orgId"],
          SubOrgId: this.SubOrgId,
          Active: 1
        })
      }
    })
    //console.log("studentCls", studentCls);
    this.readAsJson(studentCls);
  }
  UploadNewStudent() {
    this.SelectedUploadtype = "student upload";
    //console.log("this.ELEMENT_DATA", this.ELEMENT_DATA)
    this.readAsJson(this.ELEMENT_DATA)
  }
  clear() {
    this.uploadForm.reset();
  }
  readAsCSV() {
    this.csvData = XLSX.utils.sheet_to_csv(this.worksheet);
    const data: Blob = new Blob([this.csvData], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "CSVFile" + new Date().getTime() + '.csv');
  }
  toUpdate = 0;
  ErrorCount = 0;
  readAsJson(dataToUpload) {
    try {
      this.loading = true;
      this.toUpdate = dataToUpload.length;
      if (this.ErrorMessage.length == 0) {

        if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.CLASSROLLNOMAPPING)) {
          var noOfStudent = dataToUpload.length;
          if (noOfStudent > 300) {
            this.loading = false;
            this.contentservice.openSnackBar("Max. no. of students is 300.", globalconstants.ActionText, globalconstants.RedBackground);
            return;
          }
          else {
            dataToUpload.forEach((element, indx) => {
              this.toUpdate -= 1;
              this.studentData = [];
              if (!element["Active"])
                element["Active"] = 0;

              if (element.StudentClassId > 0) {
                element.UpdatedDate = new Date();
                element.UpdatedBy = this.loginDetail[0]["userId"];
                element.Promoted = 0;
                element.Active = 1;
                element.Deleted = false;
                //delete element.PID;
                this.studentData.push(element);
                this.updateStudentClass();
              }
              else {
                element.CreatedDate = new Date();
                element.CreatedBy = this.loginDetail[0]["userId"];
                element.Promoted = 0;
                this.studentData.push(element);
                ////console.log("student insert",this.studentData)
                this.saveStudentClass();
              }
            });
          }
        }
        else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.STUDENTDATA)) {
          this.save(dataToUpload);
        }
        else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.EMPLOYEEDETAIL)) {
          this.employee.save(this.ELEMENT_DATA)
            .subscribe((result: any) => {
              this.loading = false;
              this.PageLoading = false;
              this.ELEMENT_DATA = [];
              this.ReadyForUpload = false;
              this.contentservice.openSnackBar("Data uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
            }, error => {
              this.contentservice.openSnackBar("Error occured. Please contact your administrator.", globalconstants.ActionText, globalconstants.RedBackground);
              this.ReadyForUpload = false;
              console.log(error)
            });
        }
        else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.STUDENTPROFILE)) {
          this.studentActivity.save(this.ELEMENT_DATA);
        }
      }
    }
    catch (ex) {
      ////console.log("something went wrong: ", ex);
    }
  }
  readAsHTML() {
    this.htmlData = XLSX.utils.sheet_to_html(this.worksheet);
    const data: Blob = new Blob([this.htmlData], { type: "text/html;charset=utf-8;" });
    FileSaver.saveAs(data, "HtmlFile" + new Date().getTime() + '.html');
  }
  readAsText() {
    this.textData = XLSX.utils.sheet_to_txt(this.worksheet);
    const data: Blob = new Blob([this.textData], { type: 'text/plain;charset=utf-8;' });
    FileSaver.saveAs(data, "TextFile" + new Date().getTime() + '.txt');
  }

  save(dataToUpload) {
    var toInsert: any = [];
    this.loading = true;
    this.contentservice.GetStudentMaxPID(this.FilterOrgSubOrg)
      .subscribe((data: any) => {
        var _MaxPID = 1;
        if (data.value.length > 0) {
          _MaxPID = data.value[0].PID + 1;
        }
        debugger;
        //var UploadedStudent = this.NoOfStudent + dataToUpload.length;
        if (dataToUpload.length > globalconstants.RowUploadLimit) {
          dataToUpload.splice(globalconstants.RowUploadLimit);
        }
        // else if (this.NoOfStudent + this.ELEMENT_DATA.length > this.NoOfStudentInPlan) {
        //   this.loading = false;
        //   this.contentservice.openSnackBar("No. of student exceeded no. of students in the plan.", globalconstants.ActionText, globalconstants.RedBackground);
        //   return;

        // }


        dataToUpload.forEach(row => {
          toInsert.push({
            "PID": _MaxPID++,
            "StudentId": row["StudentId"],
            "AdhaarNo": row["AdhaarNo"],
            "Active": +row["Active"],
            "AlternateContact": row["AlternateContact"],
            "BankAccountNo": row["BankAccountNo"],
            "BloodgroupId": +row["BloodgroupId"],
            "CategoryId": +row["CategoryId"],
            "GenderId": +row["GenderId"],
            "ClassAdmissionSought": +row["ClassAdmissionSought"],
            "PersonalNo": row["PersonalNo"],
            "ContactPersonContactNo": row["ContactPersonContactNo"],
            "DOB": this.datepipe.transform(row["DOB"], 'yyyy/MM/dd'),
            "EmailAddress": row["EmailAddress"],
            "FatherContactNo": row["FatherContactNo"],
            "FatherName": row["FatherName"],
            "FatherOccupation": row["FatherOccupation"],
            "FirstName": row["FirstName"],
            "IFSCCode": row["IFSCCode"],
            "LastName": row["LastName"],
            "LastSchoolPercentage": row["LastSchoolPercentage"],
            "LocationId": +row["LocationId"],
            "MICRNo": row["MICRNo"],
            "MotherContactNo": row["MotherContactNo"],
            "MotherName": row["MotherName"],
            "MotherOccupation": row["MotherOccupation"],
            "NameOfContactPerson": row["NameOfContactPerson"],
            "OrgId": +row["OrgId"],
            "SubOrgId": +row["SubOrgId"],
            "ParentDeclaration": +row["ParentDeclaration"],
            "PermanentAddress": row["PermanentAddress"],
            "PermanentAddressCityId": +row["PermanentAddressCityId"],
            "PermanentAddressCountryId": +row["PermanentAddressCountryId"],
            "PermanentAddressPincode": row["PermanentAddressPincode"],
            "PermanentAddressStateId": +row["PermanentAddressStateId"],
            "Photo": row["Photo"],
            "PresentAddress": row["PresentAddress"],
            "PresentAddressCityId": +row["PresentAddressCityId"],
            "PresentAddressCountryId": +row["PresentAddressCountryId"],
            "PresentAddressStateId": +row["PresentAddressStateId"],
            "PrimaryContactFatherOrMother": +row["PrimaryContactFatherOrMother"],
            "ReasonForLeavingId": +(row["ReasonForLeavingId"]?row["ReasonForLeavingId"]:0),
            "RelationWithContactPerson": row["RelationWithContactPerson"],
            "ReligionId": +row["ReligionId"],
            "StudentDeclaration": +row["StudentDeclaration"],
            "TransferFromSchool": row["TransferFromSchool"],
            "TransferFromSchoolBoard": row["TransferFromSchoolBoard"],
            "UpdatedBy": this.loginDetail[0]["userId"],
            "UpdatedDate": this.datepipe.transform(row["UpdatedDate"], 'yyyy/MM/dd'),
            "CreatedBy": row["CreatedBy"],
            "CreatedDate": this.datepipe.transform(row["CreatedDate"], 'yyyy/MM/dd'),
            "WhatsAppNumber": row["WhatsAppNumber"],
            "ClubId": +row["ClubId"],
            "HouseId": +row["HouseId"],
            "AdmissionStatusId": +row["AdmissionStatusId"],
            "AdmissionDate": row["AdmissionDate"],
            "BatchId": +row["BatchId"],
            "RemarkId": +row["RemarkId"],
            "IdentificationMark": row["IdentificationMark"],
            "BoardRegistrationNo": row["BoardRegistrationNo"],
            "Weight": +row["Weight"],
            "Height": +row["Height"],
            "SemesterId": +row["SemesterId"],
            "SectionId": +row["SectionId"],
            "FeeTypeId": +row["FeeTypeId"],
            "RollNo": row["RollNo"],
            "AdmissionNo": row["AdmissionNo"],
            "Notes": row["Notes"],
          });
        });

        console.log("toInsert", toInsert)
        this.dataservice.postPatch('Students', toInsert, 0, 'post')
          .subscribe((result: any) => {
            this.loading = false; this.PageLoading = false;
            this.ReadyForUpload = false;
            // let _students = this.tokenStorage.getStudents()!;
            // toInsert.forEach(newstud=>{
            //   _students.push(newstud)
            // })
            this.ELEMENT_DATA = [];
            this.contentservice.openSnackBar("Data uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
          }, error => {
            console.log("error from student upload:", error);
            this.ReadyForUpload = false;
            this.loading = false;
            this.ErrorMessage = "Something went wrong. Please contact your administrator.";
            this.contentservice.openSnackBar(this.ErrorMessage, globalconstants.ActionText, globalconstants.RedBackground);
          })
      });
  }
  updateStudentClass() {
    ////console.log("update", this.studentData);
    this.dataservice.postPatch('StudentClasses', this.studentData[0], this.studentData[0].StudentClassId, 'patch')
      .subscribe((result: any) => {
        if (this.toUpdate == 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
      }, error => console.log(error))
  }
  saveStudentClass() {
    debugger;
    ////console.log('student class to save', this.studentData[0])
    this.dataservice.postPatch('StudentClasses', this.studentData[0], 0, 'post')
      .subscribe((result: any) => {
        ////console.log('inserted');
        let _students: any = this.tokenStorage.getStudents()!;
        let currentstud = _students.filter((stud: any) => stud.StudentId == this.studentData[0].StudentId)
        if (currentstud.length > 0) {
          _students.StudentClasses[0] = this.studentData[0];
        }
        if (this.toUpdate == 0 && this.ErrorCount == 0) {
          this.tokenStorage.saveStudents(_students);
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loading = false;
        }
        else if (this.toUpdate == 0 && this.ErrorCount > 0) {
          this.contentservice.openSnackBar("Some items are not added due to error.", globalconstants.ActionText, globalconstants.BlueBackground);
          this.loading = false;
        }
      },
        error => {
          console.log(error);
          this.loading = false;
          var errmsg = globalconstants.formatError(error);
          this.contentservice.openSnackBar(errmsg, globalconstants.ActionText, globalconstants.BlueBackground);
          this.ErrorCount += 1;

        })
  }
  GetStudentClasses() {
    //select only current batch student class but students are from any batch
    // this.FilterOrgSubOrgNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    // this.FilterOrgSubOrgNBatchId += " and IsCurrent eq true";
    // let list: List = new List();
    // list.fields = ["StudentId", "StudentClassId", "ClassId"];
    // list.PageName = "StudentClasses";
    // list.filter = [this.FilterOrgSubOrgNBatchId + " and Active eq 1"];
    // //list.orderBy = "ParentId";

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {

    //     if (data.value.length > 0) {
    this.StudentClassList = [];

    this.CurrentBatchStudentList.forEach(s => {

      if (s.StudentClasses && s.StudentClasses.length > 0)
        this.StudentClassList.push(s.StudentClasses[0]);

    })
    // }
    // else {
    //   this.contentservice.openSnackBar("No class student found.", globalconstants.ActionText, globalconstants.RedBackground);
    // }

    this.loading = false; this.PageLoading = false;
    //})
  }

  GetClassEvaluations() {
    //this.filterOrgIdNBatchId = globalconstants.gt.getOrgSubOrgBatchIdFilter(this.tokenStorage);

    let list: List = new List();
    list.fields = ["ClassEvaluationId", "Description", "ClassId"];
    list.PageName = "ClassEvaluations";
    list.filter = ["Active eq 1 and OrgId eq " + this.loginDetail[0]['orgId']];
    //list.orderBy = "ParentId";

    return this.dataservice.get(list);

  }
  GetStudentsInPlan() {

    let list: List = new List();
    list.fields = ["*"];
    list.PageName = "CustomerPlans";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.StudentInPlan = [...data.value];
        if (data.value.length)
          this.NoOfStudentInPlan = data.value[0].PersonOrItemCount;
        else
          this.contentservice.openSnackBar("No. Of Student is zero", globalconstants.ActionText, globalconstants.RedBackground);
        ////console.log("this.NoOfStudentInPlan",this.NoOfStudentInPlan)

      })
  }
  GetStudents() {

    // let list: List = new List();
    // list.fields = ["PID,StudentId", "FirstName", "LastName", "Active"];
    // list.PageName = "Students";
    // list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];
    // //list.orderBy = "ParentId";

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    //     this.StudentList = [...data.value];// 
    let _students = this.tokenStorage.getStudents()!;

    //this.StudentList = _students.filter((s: any) => s.Active == 1);
    this.CurrentBatchStudentList = _students.sort((a: any, b: any) => a.ParentId - b.ParentId);
    this.NoOfStudent = this.CurrentBatchStudentList.length;
    this.GetStudentClasses();

    //   })
  }
  AllStudents: any = [];
  GetAllStudents() {
    //var filterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    this.AllStudents = [];
    let list: List = new List();
    list.fields = [
      'StudentId',
      'FirstName',
      'LastName',
      'FatherName',
      'MotherName',
      "PID"
    ];
    list.PageName = "Students";
    if (this.loginDetail[0]['RoleUsers'][0].role.toLowerCase() == 'student') {
      this.FilterOrgSubOrg += " and StudentId eq " + localStorage.getItem("studentId");
    }
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];
    this.PageLoading = true;
    this.dataservice.get(list).subscribe((data: any) => {
      this.AllStudents = data.value.map(m => {
        m.FirstName = m.FirstName.trim()
        return m;
      })
    })

  }
  GetFeeTypes() {
    debugger;
    this.loading = true;
    //var filter = globalconstants.getOrgSubOrgBatchIdFilter(this.token);
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
    list.PageName = "SchoolFeeTypes";
    list.filter = ["Active eq 1 and OrgId eq " + this.loginDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeTypes = [...data.value];
        this.shareddata.ChangeFeeType(this.FeeTypes);
        this.loading = false; this.PageLoading = false;
      })
  }
  GetMasterData() {
    //this.contentservice.GetCommonMasterData(this.loginDetail[0]["orgId"], this.SubOrgId, this.SelectedApplicationId)
    //  .subscribe((data: any) => {
    //var SelectedApplicationName = '';
    this.AllMasterData = this.tokenStorage.getMasterData()!;// [...data.value];

    this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
    this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
    this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
    //this.States = this.getDropDownData(globalconstants.MasterDefinitions.common.STATE);
    if (this.SelectedApplicationName == 'edu') {
      this.AdmissionStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.ADMISSIONSTATUS);
      this.UploadTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.UPLOADTYPE);
      this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
      this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions.school.PRIMARYCONTACT);
      this.Location = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.LOCATION);
      this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
      this.Clubs = this.getDropDownData(globalconstants.MasterDefinitions.school.CLUBS);
      this.Remarks = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARKS);
      this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
      this.ActivityCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
      this.GetStudents();
      this.GetStudentsInPlan();
      this.GetFeeTypes();
    }
    else if (this.SelectedApplicationName == 'employee') {
      this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.employee.GENDER);

      this.UploadTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEUPLOADTYPE);
      this.ActivityCategory = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEPROFILECATEGORY);
      this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.employee.DEPARTMENT);
      this.Designations = this.getDropDownData(globalconstants.MasterDefinitions.employee.DESIGNATION);
      this.EmployeeGrades = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEGRADE);
      this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
      this.EmployeeStatus = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYMENTSTATUS);
      this.EmployeeTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYMENTTYPE);
      this.MaritalStatus = this.getDropDownData(globalconstants.MasterDefinitions.employee.MARITALSTATUS);
      this.WorkNatures = this.getDropDownData(globalconstants.MasterDefinitions.employee.NATURE);
      this.Country = this.getDropDownData(globalconstants.MasterDefinitions.common.COUNTRY);

    }
    //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.Batches = this.tokenStorage.getBatches()!;;
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
    this.loading = false;
    this.PageLoading = false;

    //});

  }

  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.AllMasterData);
    // let Id = this.AllMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    // })[0].MasterDataId;
    // return this.AllMasterData.filter((item, index) => {
    //   return item.ParentId == Id
    // });
  }
}
