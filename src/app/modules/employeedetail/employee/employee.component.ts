import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { FileUploadService } from '../../../shared/upload.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {
  PageLoading = true;
  ShortNameDuplicate = '';
  EmployeeCodeDuplicate = '';
  Edited:boolean = false;
  FilterOrgSubOrg='';
  Defaultvalue=0;
  SelectedApplicationId = 0;
  LoginUserDetail :any[]= [];
  EmployeeLeaving = false;
  EmployeeName = '';
  selectedIndex: number = 0;
  imagePath: string;
  message: string;
  imgURL: any;
  selectedFile: any;
  Albums: any;
  errorMessage = '';
  formdata: FormData;
  EmployeeId = 0;
  loading = false;
  WorkNature :any[]= [];
  WorkAccounts :any[]= [];
  Designations :any[]= [];
  Departments :any[]= [];
  MaritalStatus :any[]= [];
  EmploymentStatus :any[]= [];
  EmploymentTypes :any[]= [];
  PresentState :any[]= [];
  PresentCity :any[]= [];
  PermanentState :any[]= [];
  PermanentCity :any[]= [];
  Grades :any[]= [];
  Genders :any[]= [];
  Category :any[]= [];
  Country :any[]= [];
  Bloodgroup :any[]= [];
  Religion :any[]= [];
  PrimaryContact :any[]= [];
  Location :any[]= [];
  allMasterData :any[]= [];
  ReasonForLeaving :any[]= [];
  EmployeeData :any[]= [];
  CountryId = 0;
  LocationId = 0;
  PrimaryContactDefaultId = 0;
  PrimaryContactOtherId = 0;
  displayContactPerson = false;
  Permission = '';
  EmployeeForm: UntypedFormGroup;

  public files: NgxFileDropEntry[]= [];
  @ViewChild(ImageCropperComponent, { static: true }) imageCropper: ImageCropperComponent;

  preview(files) {
    if (files.length === 0)
      return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }
    this.selectedFile = files[0];
    if (this.selectedFile.size > 120000) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Image size should be less than 100kb", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    }
  }
  uploadFile() {
    debugger;
    let error: boolean = false;
    this.loading = true;
    this.formdata = new FormData();
    this.formdata.append("description", "Passport photo of Employee");
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "EmployeePhoto");
    this.formdata.append("parentId", "-1");

    this.formdata.append("batchId", "0");
    this.formdata.append("orgName", this.LoginUserDetail[0]["org"]);
    this.formdata.append("orgId", this.LoginUserDetail[0]["orgId"]);
    this.formdata.append("subOrgId", this.tokenService.getSubOrgId()+"");
    this.formdata.append("pageId", "0");

    if (this.EmployeeId != null && this.EmployeeId != 0)
      this.formdata.append("EmployeeId", this.EmployeeId + "");
    //this.formdata.append("EmployeeClassId", this.EmployeeClassId.toString());
    this.formdata.append("docTypeId", "0");

    this.formdata.append("image", this.selectedFile, this.selectedFile.name);
    this.uploadImage();
  }

  uploadImage() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.fileUploadService.postFiles(this.formdata).subscribe(res => {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Files Uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground)

      this.Edited = false;
    });
  }

  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private route: Router,
    private fb: UntypedFormBuilder,
    private fileUploadService: FileUploadService,
    private shareddata: SharedataService,
    private tokenService: TokenStorageService,

  ) {

    this.shareddata.CurrentMasterData.subscribe(message => (this.allMasterData = message));
    this.shareddata.CurrentBloodgroup.subscribe(bg => (this.Bloodgroup == bg));
    this.shareddata.CurrentCategory.subscribe(cat => (this.Category = cat));
    this.shareddata.CurrentReligion.subscribe(re => (this.Religion = re));
    this.shareddata.CurrentLocation.subscribe(lo => (this.Location = lo));
    this.shareddata.CurrentBloodgroup.subscribe(bg => (this.Bloodgroup = bg));

    this.EmployeeForm = this.fb.group({
      ShortName: [''],
      FirstName: ['', [Validators.required]],
      LastName: [''],
      FatherName: ['', [Validators.required]],
      MotherName: [''],
      Gender: [0, [Validators.required]],
      DOB: ['', [Validators.required]],
      DOJ: ['', [Validators.required]],
      Bloodgroup: [0, [Validators.required]],
      Category: [0, [Validators.required]],
      Religion: [0, [Validators.required]],
      AdhaarNo: [''],
      BankAccountNo: [''],
      IFSCcode: [''],
      MICRNo: [''],
      PhotoPath: [''],
      ContactNo: [''],
      WhatsappNo: [''],
      AlternateContactNo: [''],
      EmailAddress: [''],
      EmergencyContactNo: [''],
      EmploymentStatus: [0],
      EmploymentType: [0],
      ConfirmationDate: [''],
      NoticePeriodDays: [0],
      ProbationPeriodDays: [0],
      PAN: [''],
      PassportNo: [''],
      AadharNo: [''],
      MaritalStatus: [0],
      MarriedDate: [''],
      PFAccountNo: [''],
      Nature: [0],
      EmployeeCode: [''],
      Active: [1, [Validators.required]],
      Remarks: [''],
      PresentAddress: [''],
      PermanentAddress: [''],
      PresentAddressCity: [0],
      PresentAddressState: [0],
      PresentAddressCountry: [0],
      PermanentAddressCity: [0],
      PermanentAddressState: [0],
      PermanentAddressCountry: [0],
      PresentAddressPincode: [''],
      PermanentAddressPincode: [''],
      Department: [0, Validators.required],
      Designation: [0, Validators.required],
      WorkAccount: [0, Validators.required],
      EmpGrade: [0, Validators.required],
      IDMark: ['']
    });
    //}
  }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    debugger;
    this.LoginUserDetail = this.tokenService.getUserDetail();
    this.EmployeeId = this.tokenService.getEmployeeId()!;
    this.SelectedApplicationId = +this.tokenService.getSelectedAPPId()!;

    //if (this.EmployeeId > 0) {
    if (this.LoginUserDetail.length > 0) {
      var perObj = globalconstants.getPermission(this.tokenService, globalconstants.Pages.emp.employee.EMPLOYEEDETAIL);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission == 'deny') {
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {
        this.Edited=false;
        this.FilterOrgSubOrg=globalconstants.getOrgSubOrgFilter(this.tokenService);
        this.getFields('Employee Module');
        if (this.EmployeeId > 0)
          this.GetEmployee();
        this.GetMasterData();
      }
    }
  }
  @ViewChildren("allTabs") allTabs: QueryList<any>

  ngAfterViewInit() {
  }

  get f() { return this.EmployeeForm.controls }

  OnBlur() {
    this.Edited = true;
  }

  tabChanged(tabChangeEvent: number) {
    this.selectedIndex = tabChangeEvent;
    this.navigateTab(this.selectedIndex);
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
  }
  back() {
    this.route.navigate(['/employee']);
  }
  deActivate(event) {
    if (!event.checked)
      this.EmployeeLeaving = true;
    else {
      this.EmployeeLeaving = false;
      this.EmployeeForm.patchValue({ ReasonForLeavingId: this.ReasonForLeaving.filter(r => r.MasterDataName.toLowerCase() == 'active')[0].MasterDataId });
    }
  }
  ColumnsOfSelectedReports :any[]= [];
  getFields(pModuleName) {
    this.contentservice.getSelectedReportColumn(this.FilterOrgSubOrg, this.SelectedApplicationId)
      .subscribe((data: any) => {
        var _baseReportId = 0;
        if (data.value.length > 0) {
          _baseReportId = data.value.filter((f:any) => f.ReportName == 'Reports' && f.ParentId == 0)[0].ReportConfigItemId;
          var _studentModuleObj = data.value.filter((f:any) => f.ReportName == pModuleName && f.ParentId == _baseReportId)
          var _studentModuleId = 0;
          if (_studentModuleObj.length > 0) {
            _studentModuleId = _studentModuleObj[0].ReportConfigItemId;
          }

          var _orgStudentModuleObj = data.value.filter((f:any) => f.ParentId == _studentModuleId && f.OrgId > 0);
          var _orgStudentModuleId = 0;
          if (_orgStudentModuleObj.length > 0) {
            _orgStudentModuleId = _orgStudentModuleObj[0].ReportConfigItemId;
          }

          this.ColumnsOfSelectedReports = data.value.filter((f:any) => f.ParentId == _orgStudentModuleId)

        }

      })
  }
  GetMasterData() {

    this.allMasterData = this.tokenService.getMasterData()!;
    this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEGENDER);
    this.Country = this.getDropDownData(globalconstants.MasterDefinitions.common.COUNTRY);
    this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
    this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
    this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
    this.Location = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.LOCATION);
    this.MaritalStatus = this.getDropDownData(globalconstants.MasterDefinitions.employee.MARITALSTATUS);
    this.WorkNature = this.getDropDownData(globalconstants.MasterDefinitions.employee.NATURE);
    this.EmploymentTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYMENTTYPE);
    this.EmploymentStatus = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYMENTSTATUS);
    this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.employee.DEPARTMENT);
    this.Grades = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEGRADE);
    this.Designations = this.getDropDownData(globalconstants.MasterDefinitions.employee.DESIGNATION);
    this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
    this.loading = false;
    this.PageLoading = false;

  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenService, this.allMasterData);
    // let Ids = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    // });
    // if (Ids.length > 0) {
    //   var Id = Ids[0].MasterDataId;
    //   return this.allMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   });
    // }
    // else
    //   return [];
  }
  displayContact(event) {
    if (event.value == this.PrimaryContactOtherId) {
      this.displayContactPerson = true;
    }
    else {
      this.displayContactPerson = false;
    }

  }
  UpdateOrSave() {
    debugger;
    this.loading = true;
    //setTimeout(()=>{
    var errorMessage = '';
    var _MandatoryColumns = this.ColumnsOfSelectedReports.filter((f:any) => f.Active == 1);
    if (_MandatoryColumns.length > 0) {
      for (var i = 0; i < _MandatoryColumns.length; i++) {
        const formControl = this.EmployeeForm.get(_MandatoryColumns[i].ReportName);
        if (formControl) {
          if (formControl.value == undefined
            || formControl.value == null
            || formControl.value.length == 0
            || formControl.value == 0) {
            errorMessage += _MandatoryColumns[i].ReportName + " is required.\n";
          }
        }
        else {
          this.contentservice.openSnackBar("Invalid field name: " + _MandatoryColumns[i].ReportName, globalconstants.ActionText, globalconstants.RedBackground);
          break;
        }
      }
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Mandatory fields not defined.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    // if (this.EmployeeForm.get("FirstName")?.value == '') {
    //   errorMessage += "First name is required.<br>";
    //   return;
    // }
    // if (this.EmployeeForm.get("FatherName")?.value == '') {
    //   errorMessage += "Father name is required.<br>";

    // }
    // if (this.EmployeeForm.get("DOB")?.value == '') {
    //   errorMessage += "DOB is required.<br>";
    // }
    // if (this.EmployeeForm.get("DOJ")?.value == '') {
    //   errorMessage += "DOJ is required.<br>";
    // }
    // if (this.EmployeeForm.get("DepartmentId")?.value == 0) {
    //   errorMessage += "Department is required.<br>";
    // }
    // if (this.EmployeeForm.get("DesignationId")?.value == 0) {
    //   errorMessage += "Designation is required.<br>";

    // }
    // if (this.EmployeeForm.get("EmpGradeId")?.value == 0) {
    //   errorMessage += "Grade is required.<br>";

    // }
    // if (this.EmployeeForm.get("WorkAccountId")?.value == 0) {
    //   errorMessage += "Work Account is required.<br>";
    // }
    if (errorMessage.length > 0) {
      this.contentservice.openSnackBar(errorMessage, globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading = false;
      return;
    }
    this.loading = true;
    var _active = this.EmployeeForm.get("Active")?.value;
    var _email = this.EmployeeForm.get("EmailAddress")?.value;
    if (_email.length > 0) {
      var checkduppayload = { 'Id': this.EmployeeId, 'Email': _email }
      this.contentservice.CheckEmailDuplicate(checkduppayload)
        .subscribe((data: any) => {
          if (data) {
            this.loading = false; this.PageLoading = false;
            this.contentservice.openSnackBar("Email already in use.", globalconstants.ActionText, globalconstants.RedBackground);
            return;
          }
        });
    }
    this.EmployeeData = [{
      EmpEmployeeId: this.EmployeeId,
      ShortName: this.EmployeeForm.get("ShortName")?.value,
      FirstName: this.EmployeeForm.get("FirstName")?.value,
      LastName: this.EmployeeForm.get("LastName")?.value,
      FatherName: this.EmployeeForm.get("FatherName")?.value,
      MotherName: this.EmployeeForm.get("MotherName")?.value,
      GenderId: this.EmployeeForm.get("Gender")?.value,
      DOB: new Date(this.EmployeeForm.get("DOB")?.value),
      DOJ: new Date(this.EmployeeForm.get("DOJ")?.value),
      BloodgroupId: this.EmployeeForm.get("Bloodgroup")?.value,
      CategoryId: this.EmployeeForm.get("Category")?.value,
      BankAccountNo: this.EmployeeForm.get("BankAccountNo")?.value,
      IFSCcode: this.EmployeeForm.get("IFSCcode")?.value,
      MICRNo: this.EmployeeForm.get("MICRNo")?.value,
      AdhaarNo: this.EmployeeForm.get("AdhaarNo")?.value,
      PhotoPath: this.EmployeeForm.get("PhotoPath")?.value,
      ReligionId: this.EmployeeForm.get("Religion")?.value,
      ContactNo: this.EmployeeForm.get("ContactNo")?.value,
      WhatsappNo: this.EmployeeForm.get("WhatsappNo")?.value,
      AlternateContactNo: this.EmployeeForm.get("AlternateContactNo")?.value,
      EmailAddress: this.EmployeeForm.get("EmailAddress")?.value,
      EmergencyContactNo: this.EmployeeForm.get("EmergencyContactNo")?.value,
      EmploymentStatusId: this.EmployeeForm.get("EmploymentStatus")?.value,
      EmploymentTypeId: this.EmployeeForm.get("EmploymentType")?.value,
      ConfirmationDate: this.EmployeeForm.get("ConfirmationDate")?.value,
      NoticePeriodDays: this.EmployeeForm.get("NoticePeriodDays")?.value,
      ProbationPeriodDays: this.EmployeeForm.get("ProbationPeriodDays")?.value,
      PAN: this.EmployeeForm.get("PAN")?.value,
      PassportNo: this.EmployeeForm.get("PassportNo")?.value,
      MaritalStatusId: this.EmployeeForm.get("MaritalStatus")?.value,
      MarriedDate: new Date(this.EmployeeForm.get("MarriedDate")?.value),
      PFAccountNo: this.EmployeeForm.get("PFAccountNo")?.value,
      NatureId: this.EmployeeForm.get("Nature")?.value,
      EmployeeCode: this.EmployeeForm.get("EmployeeCode")?.value,
      Active: _active ? 1 : 0,
      Remarks: this.EmployeeForm.get("Remarks")?.value,
      PresentAddress: this.EmployeeForm.get("PresentAddress")?.value,
      PresentAddressCityId: this.EmployeeForm.get("PresentAddressCity")?.value,
      PresentAddressStateId: this.EmployeeForm.get("PresentAddressState")?.value,
      PresentAddressCountryId: this.EmployeeForm.get("PresentAddressCountry")?.value,
      PermanentAddressCityId: this.EmployeeForm.get("PermanentAddressCity")?.value,
      PresentAddressPincode: this.EmployeeForm.get("PresentAddressPincode")?.value,
      PermanentAddressPincode: this.EmployeeForm.get("PermanentAddressPincode")?.value,
      PermanentAddressStateId: this.EmployeeForm.get("PermanentAddressState")?.value,
      PermanentAddressCountryId: this.EmployeeForm.get("PermanentAddressCountry")?.value,
      PermanentAddress: this.EmployeeForm.get("PermanentAddress")?.value,
      DepartmentId: this.EmployeeForm.get("Department")?.value,
      DesignationId: this.EmployeeForm.get("Designation")?.value,
      WorkAccountId: this.EmployeeForm.get("WorkAccount")?.value,
      EmpGradeId: this.EmployeeForm.get("EmpGrade")?.value,
      OrgId: this.LoginUserDetail[0]["orgId"],
      SubOrgId: this.tokenService.getSubOrgId(),
      IDMark: this.EmployeeForm.get("IDMark")?.value
    }]

    if (this.EmployeeData["MarriedDate"] == "") {
      delete this.EmployeeData["MarriedDate"];
    }
    if (this.EmployeeData["ConfirmationDate"] == "") {
      delete this.EmployeeData["ConfirmationDate"];
    }
    var filterstr = this.FilterOrgSubOrg;// "OrgId eq " + this.LoginUserDetail[0]["orgId"];
    var _employeeCode = this.EmployeeForm.get("EmployeeCode")?.value;

    var _employeeCodefilter = '';
    if (_employeeCode.length > 0) {
      _employeeCodefilter += "EmployeeCode eq '" + _employeeCode + "'"
    }

    if (this.EmployeeId > 0) {
      filterstr += " and EmpEmployeeId ne " + this.EmployeeId;
    }

    var _shortName = this.EmployeeForm.get("ShortName")?.value;
    var _shortNamefilter = '';
    if (_shortName.length > 0)
      _shortNamefilter = "ShortName eq '" + _shortName + "'"

    if (_shortNamefilter.length > 0 && _employeeCodefilter.length > 0) {
      filterstr += " and (" + _shortNamefilter + " or " + _employeeCodefilter + ")";
    }
    else if (_shortNamefilter.length == 0 && _employeeCodefilter.length > 0) {
      filterstr += " and " + _employeeCodefilter;
    }
    else if (_shortNamefilter.length > 0 && _employeeCodefilter.length == 0) {
      filterstr += " and " + _shortNamefilter;
    }
    let list: List = new List();
    list.fields = ["EmpEmployeeId"];
    list.PageName = "EmpEmployees";
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar("Employee code or short name already exists!", globalconstants.ActionText, globalconstants.RedBackground);
          return;
        }
        else {
          if (this.EmployeeId == 0)
            this.save();
          else
            this.update();
        }
      })

  }
  CheckDuplicate(fieldName) {
    debugger;
    var filterstr = this.FilterOrgSubOrg;// "OrgId eq " + this.LoginUserDetail[0]["orgId"];
    //var _employeeCode = this.EmployeeForm.get("EmployeeCode")?.value;
    if (this.EmployeeId > 0) {
      filterstr += " and EmpEmployeeId ne " + this.EmployeeId
    }
    var _checkvalue = this.EmployeeForm.get(fieldName)?.value;
    if (_checkvalue.length == 0)
      return;

    filterstr += " and " + fieldName + " eq '" + _checkvalue + "'"
    this.ShortNameDuplicate = '';
    this.EmployeeCodeDuplicate = '';
    let list: List = new List();
    list.fields = ["EmpEmployeeId"];
    list.PageName = "EmpEmployees";
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          if (fieldName == 'EmployeeCode')
            this.EmployeeCodeDuplicate = "Employee code already exists. Please try another.";
          else if (fieldName == 'ShortName')
            this.ShortNameDuplicate = "Short name already exists. Please try another.";
        }
        else {
          this.ShortNameDuplicate = '';
          this.EmployeeCodeDuplicate = '';
          this.OnBlur()
        }

      });
  }
  save() {
//console.log("this.EmployeeData",this.EmployeeData)
    this.dataservice.postPatch('EmpEmployees', this.EmployeeData, 0, 'post')
      .subscribe((result: any) => {
        //debugger;
        if (result != undefined) {
          this.Edited = false;
          this.EmployeeId = result.EmpEmployeeId;
          this.EmployeeForm.patchValue({
            EmployeeId: result.EmpEmployeeId
          })
          this.loading = false; this.PageLoading = false;
          this.GetEmployee();
          this.contentservice.openSnackBar("Employee's data saved successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
        }
      }, error => {
        this.Edited = false;
        this.loading = false; this.PageLoading = false;
        console.log(error)
      })
  }
  update() {
    this.dataservice.postPatch('EmpEmployees', this.EmployeeData[0], this.EmployeeId, 'patch')
      .subscribe((result: any) => {
        this.loading = false; this.PageLoading = false;
        this.Edited = false;
        this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
      }, error => {
        this.loading = false; this.PageLoading = false;
        this.Edited = false;
        this.contentservice.openSnackBar("Issue, Please contact your administrator.", globalconstants.ActionText, globalconstants.RedBackground);
        throw error;
      })
  }
  adjustDateForTimeOffset(dateToAdjust) {
    //////console.log(dateToAdjust)
    var offsetMs = dateToAdjust.getTimezoneOffset() * 60000;
    return new Date(dateToAdjust.getTime() - offsetMs);
  }
  SelectPresentState(value) {
    debugger;
    var commonId = this.contentservice.GetPermittedAppId('common');
    this.contentservice.GetDropDownDataFromDB(value, this.FilterOrgSubOrg, commonId)
      .subscribe((data: any) => {
        this.PresentState = [...data.value];
        this.Edited = true;
      })
  }
  SelectPresentCity(value) {
    var commonId = this.contentservice.GetPermittedAppId('common');
    this.contentservice.GetDropDownDataFromDB(value, this.FilterOrgSubOrg, commonId)
      .subscribe((data: any) => {
        this.PresentCity = [...data.value];
        this.Edited = true;
      })
  }
  SelectPermanentState(value) {
    var commonId = this.contentservice.GetPermittedAppId('common');
    this.contentservice.GetDropDownDataFromDB(value, this.FilterOrgSubOrg, commonId)
      .subscribe((data: any) => {
        this.PermanentState = [...data.value];
        this.Edited = true;
      })
  }
  SelectPermanentCity(value) {
    var commonId = this.contentservice.GetPermittedAppId('common');
    this.contentservice.GetDropDownDataFromDB(value, this.FilterOrgSubOrg, commonId)
      .subscribe((data: any) => {
        this.PermanentCity = [...data.value];
        this.Edited = true;
      })
  }
  GetEmployee() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["*"];
    list.PageName = "EmpEmployees";
    list.lookupFields = ["StorageFnPs($select=FileId,FileName;$filter=EmployeeId eq " + this.EmployeeId + ")"]
    list.filter = ["EmpEmployeeId eq " + this.EmployeeId];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          data.value.forEach(stud => {
            this.SelectPresentState(stud.PresentAddressCountryId);
            this.SelectPresentCity(stud.PresentAddressStateId);
            this.SelectPermanentState(stud.PermanentAddressCountryId);
            this.SelectPermanentCity(stud.PermanentAddressStateId);

            this.EmployeeId = stud.EmpEmployeeId;
            stud.EmployeeCode = stud.EmployeeCode == null ? '' : stud.EmployeeCode;
            var _lastname = stud.LastName == null ? '' : " " + stud.LastName;
            let EmployeeName = stud.EmployeeCode + ' ' + stud.FirstName + _lastname;
            this.shareddata.ChangeEmployeeName(EmployeeName);
            this.tokenService.saveEmployeeId(stud.EmpEmployeeId);

            this.EmployeeForm.patchValue({
              "ShortName": stud.ShortName,
              "FirstName": stud.FirstName,
              "LastName": stud.LastName,
              "FatherName": stud.FatherName,
              "MotherName": stud.MotherName,
              "Gender": stud.GenderId,
              "DOB": stud.DOB,
              "DOJ": new Date(stud.DOJ),
              "Bloodgroup": stud.BloodgroupId,
              "Category": stud.CategoryId,
              "BankAccountNo": stud.BankAccountNo,
              "IFSCcode": stud.IFSCcode,
              "MICRNo": stud.MICRNo,
              "AdhaarNo": stud.AdhaarNo,
              "PhotoPath": stud.PhotoPath,
              "Religion": stud.ReligionId,
              "ContactNo": stud.ContactNo,
              "WhatsappNo": stud.WhatsappNo,
              "AlternateContactNo": stud.AlternateContactNo,
              "EmailAddress": stud.EmailAddress,
              "EmergencyContactNo": stud.EmergencyContactNo,
              "EmploymentStatus": stud.EmploymentStatusId,
              "EmploymentType": stud.EmploymentTypeId,
              "ConfirmationDate": stud.ConfirmationDate,
              "NoticePeriodDays": stud.NoticePeriodDays,
              "ProbationPeriodDays": stud.ProbationPeriodDays,
              "PAN": stud.PAN,
              "PassportNo": stud.PassportNo,
              "AadharNo": stud.AadharNo,
              "MaritalStatus": stud.MaritalStatusId,
              "MarriedDate": stud.MarriedDate,
              "PFAccountNo": stud.PFAccountNo,
              "Nature": stud.NatureId,
              "EmployeeCode": stud.EmployeeCode,
              "Active": stud.Active,
              "Remarks": stud.Remarks,
              "PresentAddress": stud.PresentAddress,
              "PresentAddressCity": stud.PresentAddressCityId,
              "PresentAddressState": stud.PresentAddressStateId,
              "PresentAddressCountry": stud.PresentAddressCountryId,
              "PermanentAddress": stud.PermanentAddress,
              "PermanentAddressCity": stud.PermanentAddressCityId,
              "PermanentAddressState": stud.PermanentAddressStateId,
              "PermanentAddressCountry": stud.PermanentAddressCountryId,
              "PresentAddressPincode": stud.PresentAddressPincode,
              "PermanentAddressPincode": stud.PermanentAddressPincode,
              "Department": stud.DepartmentId,
              "Designation": stud.DesignationId,
              "EmpGrade": stud.EmpGradeId,
              "WorkAccount": stud.WorkAccountId,
              "IDMark": stud.IDMark
            });
            // if (this.EmployeeForm.get("EmailAddress")?.value != "") {
            //   this.EmployeeForm.get("EmailAddress").disable();
            // }
            if (stud.PrimaryContactFatherOrMother == this.PrimaryContactOtherId)
              this.displayContactPerson = true;
            else
              this.displayContactPerson = false;
            if (stud.StorageFnPs.length > 0) {
              var fileNames = stud.StorageFnPs.sort((a, b) => b.FileId - a.FileId);
              this.imgURL = globalconstants.apiUrl + "/Uploads/" + this.LoginUserDetail[0]["org"] +
                "/EmployeePhoto/" + fileNames[0].FileName;
            }
            else if (this.EmployeeId > 0)
              this.imgURL = 'assets/images/emptyimageholder.jpg';
          })
        }
        else {
          this.contentservice.openSnackBar("No data found.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.loading = false; this.PageLoading = false;
      }, error => {
        this.loading = false; this.PageLoading = false;
        console.error(error);
      });
  }
}

