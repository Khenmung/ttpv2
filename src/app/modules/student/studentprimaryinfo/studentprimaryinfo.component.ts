import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { ImageCropperComponent } from 'ngx-image-cropper';

import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { FileUploadService } from '../../../shared/upload.service';
import { AddstudentclassComponent } from '../addstudentclass/addstudentclass.component';
import { AddstudentfeepaymentComponent } from '../studentfeepayment/addstudentfeepayment/addstudentfeepayment.component';
import { FeereceiptComponent } from '../studentfeepayment/feereceipt/feereceipt.component';
import { SharedataService } from '../../../shared/sharedata.service';
import { ContentService } from '../../../shared/content.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY } from 'rxjs';
@Component({
  selector: 'app-studentprimaryinfo',
  templateUrl: './studentprimaryinfo.component.html',
  styleUrls: ['./studentprimaryinfo.component.scss']
})
export class studentprimaryinfoComponent implements OnInit {
  PageLoading = true;
  @ViewChild(AddstudentclassComponent) studentClass: AddstudentclassComponent;
  @ViewChild(AddstudentfeepaymentComponent) studentFeePayment: AddstudentfeepaymentComponent;
  @ViewChild(FeereceiptComponent) feeReceipt: FeereceiptComponent;
  Edit = false;
  Defaultvalue = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  SelectedApplicationId = 0;
  LoginUserDetail: any[] = [];
  StudentLeaving = false;
  StudentName = '';
  StudentClassId = 0;
  selectedIndex: number = 0;
  imagePath: string;
  message: string;
  imgURL: any;
  selectedFile: any;
  Albums: any;
  errorMessage = '';
  formdata: FormData;
  StudentId = 0;
  loading = false;
  Classes: any[] = [];
  Clubs: any[] = [];
  Genders: any[] = [];
  Category: any[] = [];
  Bloodgroup: any[] = [];
  Religion: any[] = [];
  MaxPID = 0;
  Permission = '';
  PrimaryContact: any[] = [];
  Location: any[] = [];
  allMasterData: any[] = [];
  ReasonForLeaving: any[] = [];
  studentData: any[] = [];
  AdmissionStatuses: any[] = [];
  ColumnsOfSelectedReports: any[] = [];
  CountryId = 0;
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  PrimaryContactDefaultId = 0;
  PrimaryContactOtherId = 0;
  displayContactPerson = false;
  Houses: any[] = [];
  //Remarks: any[] = [];
  studentForm: UntypedFormGroup;
  Edited = false;
  StudentActivatePermission = '';
  public files: NgxFileDropEntry[] = [];
  @ViewChild(ImageCropperComponent, { static: true }) imageCropper: ImageCropperComponent;

  preview(files) {
    if (files.length === 0)
      return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }
    debugger;
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
    if (this.selectedFile == undefined) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select a file.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.formdata = new FormData();
    this.formdata.append("description", "Passport photo of student");
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "StudentPhoto");
    this.formdata.append("parentId", "-1");

    this.formdata.append("batchId", "0");
    this.formdata.append("orgName", this.LoginUserDetail[0]["org"]);
    this.formdata.append("orgId", this.LoginUserDetail[0]["orgId"]);
    this.formdata.append("subOrgId", this.SubOrgId + "");
    this.formdata.append("pageId", "0");

    if (this.StudentId != null && this.StudentId != 0)
      this.formdata.append("studentId", this.StudentId + "");
    this.formdata.append("studentClassId", this.StudentClassId.toString());
    this.formdata.append("questionId", "0");
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
      this.contentservice.openSnackBar("Files uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);

      this.Edit = false;
    });
  }

  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private route: Router,
    private fb: UntypedFormBuilder,
    private fileUploadService: FileUploadService,
    private shareddata: SharedataService,
    private tokenStorage: TokenStorageService,
    private dialog: MatDialog

  ) {
    //this.shareddata.CurrentGenders.subscribe(genders => (this.Genders = genders));
    //if (this.Genders.length == 0)
    //  this.route.navigate(["/edu"]);
    //else {


  }
  FeePaymentPermission = '';
  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.imgURL = '';
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail.length == 0)
      this.route.navigate(['/auth/login'])
    else {
      var perStudentActivate = globalconstants.getPermission(this.tokenStorage, globalconstants.FeaturePermission.ACTIVATESTUDENT);
      if (perStudentActivate.length > 0) {
        this.StudentActivatePermission = perStudentActivate[0].permission;
        //this.tabNames
      }
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.STUDENTDETAIL);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
        //this.tabNames
      }

      if (this.Permission != 'deny') {
        this.studentForm = this.fb.group({
          ReasonForLeaving: [0],
          StudentId: [0],
          FirstName: ['', [Validators.required]],
          LastName: [''],
          FatherName: [''],
          FatherOccupation: [''],
          MotherName: [''],
          MotherOccupation: [''],
          Gender: [0, [Validators.required]],
          PresentAddress: ['', [Validators.required]],
          PermanentAddress: ['', [Validators.required]],
          DOB: [new Date(), [Validators.required]],
          Bloodgroup: [0, [Validators.required]],
          Category: [0, [Validators.required]],
          ClassAdmissionSought: [0, [Validators.required]],
          Religion: [0, [Validators.required]],
          AccountHolderName: [''],
          BankAccountNo: [''],
          IFSCCode: [''],
          MICRNo: [''],
          AdhaarNo: [''],
          Photo: [''],
          PersonalNo: ['', [Validators.required]],
          WhatsAppNumber: [''],
          FatherContactNo: [''],
          MotherContactNo: [''],
          PrimaryContactFatherOrMother: [0],
          NameOfContactPerson: [''],
          RelationWithContactPerson: [''],
          ContactPersonContactNo: [''],
          AlternateContact: [''],
          EmailAddress: [''],
          LastSchoolPercentage: [''],
          TransferFromSchool: [''],
          TransferFromSchoolBoard: [''],
          Club: [0],
          AdmissionStatus: [0],
          AdmissionDate: [new Date()],
          House: [0],
          RemarkId: [0],
          Remark2Id: [0],
          Notes: [''],
          IdentificationMark: [''],
          BoardRegistrationNo: [''],
          Weight: [''],
          Height: [''],
          Active: [1]
        });
        this.PID = this.tokenStorage.getPID()!;
        this.StudentId = this.tokenStorage.getStudentId()!;
        this.StudentClassId = this.tokenStorage.getStudentClassId()!;
        var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.FEEPAYMENT);
        if (perObj.length > 0) {
          this.FeePaymentPermission = perObj[0].permission;
        }
        ////console.log("this.FeePaymentPermission ", this.FeePaymentPermission);
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.getFields('Student Module');
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.GetMasterData();

      }
    }
  }
  @ViewChildren("allTabs") allTabs: QueryList<any>

  ngAfterViewInit() {
    //////console.log('total tabs: ' + this.allTabs.first._tabs.length);
  }

  get f() { return this.studentForm.controls }

  edit() {
    this.Edit = true;
  }

  tabChanged(tabChangeEvent: number) {
    this.selectedIndex = tabChangeEvent;
    this.navigateTab(this.selectedIndex);
    //   ////console.log('tab selected: ' + tabChangeEvent);
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
    switch (indx) {
      case 4:
        this.studentClass.PageLoad();
        break;

    }
  }
  back() {
    this.route.navigate(['/edu']);
  }
  deActivate(event) {
    debugger;
    if (this.StudentActivatePermission != "deny" && this.StudentActivatePermission != "read") {
      if (!event.checked)
        this.StudentLeaving = true;
      else {
        this.StudentLeaving = false;
        this.studentForm.patchValue({ ReasonForLeavingId: this.ReasonForLeaving.filter(r => r.MasterDataName.toLowerCase() == 'active')[0].MasterDataId });
      }
      this.OnBlur();
    }
  }
  feepayment() {
    this.generateDetail();
    //this.SaveIds();
    this.route.navigate(['/edu/feepayment']);
  }
  Delete(StudentId) {

    this.openDialog(StudentId)
  }
  openDialog(StudentId) {
    debugger;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Save',
          cancel: 'No'
        }
      }
    });

    dialogRef.afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.UpdateAsDeleted(StudentId);
        }
      });
  }

  UpdateAsDeleted(StudentId) {
    debugger;
    let toUpdate = {
      StudentId: StudentId,
      BatchId: this.SelectedBatchId,
      OrgId: this.LoginUserDetail[0]['orgId'],
      SubOrgId: this.SubOrgId,
      Active: 0,
      Deleted: true,
      UpdatedDate: new Date()
    }

    this.dataservice.postPatch('Students', toUpdate, StudentId, 'patch')
      .subscribe(res => {
        //row.Action = false;
        this.loading = false; this.PageLoading = false;
        this.Students = this.tokenStorage.getStudents()!;
        var indx = this.Students.findIndex(s => s.StudentId == StudentId);
        if (indx > -1)
          this.Students.splice(indx, 1);
        this.tokenStorage.saveStudents(this.Students);
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        setTimeout(() => {
          this.route.navigate(['/dashboard'])
        }, 2000);
      });
  }
  generateDetail() {
    let StudentName = this.PID + ' ' + this.studentForm.get("FirstName")?.value +
      this.studentForm.get("LastName")?.value + ',' + this.studentForm.get("FatherName")?.value + ', ' +
      this.studentForm.get("MotherName")?.value + ', ';

    let studentclass = this.Students.filter(sid => sid.StudentId == this.StudentId);
    if (studentclass.length > 0) {
      var _clsName = '', rollNo = '';
      var objcls = this.Classes.filter((f: any) => f.ClassId == studentclass[0].ClassId);
      if (objcls.length > 0)
        _clsName = objcls[0].ClassName
      rollNo = studentclass[0].RollNo ? studentclass[0].RollNo : '';
      var _sectionName = '';
      var sectionObj = this.Sections.filter((f: any) => f.MasterDataId == studentclass[0].SectionId)
      if (sectionObj.length > 0)
        _sectionName = "-" + sectionObj[0].MasterDataName;
      var _semesterName = '';
      var semesterObj = this.Semesters.filter((f: any) => f.MasterDataId == studentclass[0].SemesterId)
      if (semesterObj.length > 0)
        _semesterName = "-" + semesterObj[0].MasterDataName;
      this.StudentClassId = studentclass[0].StudentClassId
      StudentName += "-" + _clsName + _semesterName + _sectionName + "-" + rollNo;
    }

    this.shareddata.ChangeStudentName(StudentName);

    //this.shareddata.ChangeStudentClassId(this.StudentClassId);
    // this.tokenStorage.saveStudentClassId(this.StudentClassId.toString());
    // this.tokenStorage.saveStudentId(element.StudentId);
    //this.shareddata.ChangeStudentId(element.StudentId);

  }
  Sections: any[] = [];
  Semesters: any[] = [];
  Remark2: any[] = [];
  Remark1: any[] = [];
  FeeCategories: any = [];
  GetMasterData() {
    // this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SubOrgId, this.SelectedApplicationId)
    //   .subscribe((data: any) => {
    //////console.log(data.value);
    this.allMasterData = this.tokenStorage.getMasterData()!;// [...data.value];
    this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
    this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
    this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
    this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
    this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions.school.PRIMARYCONTACT);
    this.Clubs = this.getDropDownData(globalconstants.MasterDefinitions.school.CLUBS);
    this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
    this.Remark1 = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARK1);
    this.Remark2 = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARK2);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.AdmissionStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.ADMISSIONSTATUS);
    this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);

    this.Location = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.LOCATION);
    this.PrimaryContactDefaultId = this.PrimaryContact.filter(contact => contact.MasterDataName.toLowerCase() == "father")[0].MasterDataId;
    this.PrimaryContactOtherId = this.PrimaryContact.filter(contact => contact.MasterDataName.toLowerCase() == "other")[0].MasterDataId;
    this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
    if (this.Genders.length > 0)
      this.studentForm.patchValue({ Gender: this.Genders[0].MasterDataId });

    if (this.Bloodgroup.length > 0)
      this.studentForm.patchValue({ Bloodgroup: this.Bloodgroup[0].MasterDataId });
    // if (this.Category.length > 0)
    //   this.studentForm.patchValue({ Category: this.Category[0].MasterDataId });
    var _admissionStatus = this.AdmissionStatuses.filter(r => r.MasterDataName.toLowerCase() == "admitted");

    //var _religion = this.Religion.filter(r => r.MasterDataName.toLowerCase() == "christian");
    //if (_religion.length > 0)
    //  this.studentForm.patchValue({ Religion: _religion[0].MasterDataId });

    if (_admissionStatus.length == 0) {
      this.contentservice.openSnackBar("'Admitted' must be defined for admission status.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      this.PageLoading = false;
    }
    else {
      this.studentForm.patchValue({ AdmissionStatus: _admissionStatus[0].MasterDataId });
      this.studentForm.patchValue({ PrimaryContactFatherOrMother: this.PrimaryContactDefaultId });
      this.studentForm.patchValue({ ReasonForLeavingId: this.ReasonForLeaving.filter(r => r.MasterDataName.toLowerCase() == 'active')[0].MasterDataId });
      var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
        if (data.value) this.Classes = [...data.value]; else this.Classes = [...data];
        this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
        if (this.Classes.length == 0) {
          this.contentservice.openSnackBar("Please define classes first.", globalconstants.ActionText, globalconstants.RedBackground);
          this.loading = false;
          this.PageLoading = false;
        }
        else {
          //this.studentForm.patchValue({ ClassAdmissionSought: this.Classes[0].ClassId });
          if (this.StudentId > 0)
            this.GetStudentClassPhoto();
          //this.GetStudent();
          this.loading = false;
          this.PageLoading = false;
        }
      });
    }
    //});

  }
  GetStudentClassPhoto() {
    //var source = [this.GetStudent(), this.GetStudentClass(), this.GetPhoto()];
    //var source = [this.GetStudent(), this.GetPhoto()];
    //forkJoin(source)
    this.GetPhoto()
      .subscribe((all: any) => {
        //var _student = all[0].value;
        this.Students = this.tokenStorage.getStudents()!;
        var stud = this.Students.find(s => s.StudentId === this.StudentId);
        //var _studentclass;// = all[1].value;

        var _photo = all.value;
        if (stud) {
          //var _studentclass = this.Students.filter(s => s.StudentId == this.StudentId)[0].StudentClasses;
          var _studentclass = stud.StudentClasses;

          this.SetStudentClassForStore(stud, _studentclass);
          //_student.forEach(stud => {
          var _lastname = stud.LastName == null || stud.LastName == '' ? '' : " " + stud.LastName;
          var fatherName = stud.FatherName ? stud.FatherName : '';
          var motherName = stud.MotherName ? stud.MotherName : '';
          let StudentName = stud.PID + ' ' + stud.FirstName + _lastname + ' ' + fatherName +
            ' ' + motherName + ", ";

          if (_studentclass && _studentclass.length > 0) {
            var _sectionName = '', _semesterName = '', _className = '', _rollNo = '';
            _rollNo = _studentclass[0].RollNo ? _studentclass[0].RollNo : '';
            if (_studentclass[0].SectionId > 0)
              _sectionName = "-" + this.Sections.find((s: any) => s.MasterDataId == _studentclass[0].SectionId).MasterDataName;
            if (_studentclass[0].SemesterId > 0)
              _semesterName = "-" + this.Semesters.find((s: any) => s.MasterDataId == _studentclass[0].SemesterId).MasterDataName;
            _className = this.Classes.find(c => c.ClassId == _studentclass[0].ClassId).ClassName;
            StudentName += _className + _semesterName + _sectionName + "-" + _rollNo;
            this.StudentClassId = _studentclass[0].StudentClassId;
            this.tokenStorage.saveStudentClassId(this.StudentClassId + "");
          }

          this.PID = stud.PID;
          this.shareddata.ChangeStudentName(StudentName);
          this.studentForm.patchValue({
            StudentId: stud.StudentId,
            FirstName: stud.FirstName,
            LastName: _lastname,
            FatherName: stud.FatherName,
            MotherName: stud.MotherName,
            FatherOccupation: stud.FatherOccupation,
            MotherOccupation: stud.MotherOccupation,
            PresentAddress: stud.PresentAddress,
            PermanentAddress: stud.PermanentAddress,
            DOB: new Date(stud.DOB),//this.formatdate.transform(stud.DOB,'dd/MM/yyyy'),
            Gender: stud.GenderId,
            Bloodgroup: stud.BloodgroupId,
            Category: stud.CategoryId,
            Religion: stud.ReligionId,
            AccountHolderName: stud.AccountHolderName,
            BankAccountNo: stud.BankAccountNo,
            IFSCCode: stud.IFSCCode,
            MICRNo: stud.MICRNo,
            AdhaarNo: stud.AdhaarNo,
            Photo: stud.Photo,
            PersonalNo: stud.PersonalNo,
            WhatsAppNumber: stud.WhatsAppNumber,
            FatherContactNo: stud.FatherContactNo,
            MotherContactNo: stud.MotherContactNo,
            PrimaryContactFatherOrMother: stud.PrimaryContactFatherOrMother,
            NameOfContactPerson: stud.NameOfContactPerson,
            RelationWithContactPerson: stud.RelationWithContactPerson,
            ContactPersonContactNo: stud.ContactPersonContactNo,
            AlternateContact: stud.AlternateContact,
            EmailAddress: stud.EmailAddress,
            LastSchoolPercentage: stud.LastSchoolPercentage,
            ClassAdmissionSought: stud.ClassAdmissionSought,
            TransferFromSchool: stud.TransferFromSchool,
            TransferFromSchoolBoard: stud.TransferFromSchoolBoard,
            Club: stud.ClubId,
            House: stud.HouseId,
            AdmissionStatus: stud.AdmissionStatusId,
            AdmissionDate: stud.AdmissionDate,
            RemarkId: stud.RemarkId,
            Remark2Id: stud.Remark2Id,
            Notes: stud.Notes,
            Active: stud.Active,
            ReasonForLeaving: stud.ReasonForLeavingId,
            IdentificationMark: stud.IdentificationMark,
            BoardRegistrationNo: stud.BoardRegistrationNo,
            Weight: stud.Weight,
            Height: stud.Height
          })

          if (stud.PrimaryContactFatherOrMother == this.PrimaryContactOtherId)
            this.displayContactPerson = true;
          else
            this.displayContactPerson = false;
          if (_photo.length > 0) {
            var fileNames = _photo.sort((a, b) => b.FileId - a.FileId)
            this.imgURL = globalconstants.apiUrl + "/Uploads/" + this.LoginUserDetail[0]["org"] +
              "/StudentPhoto/" + fileNames[0].FileName;
          }
          else if (this.StudentId > 0)
            this.imgURL = 'assets/images/emptyimageholder.jpg'
          //})
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);

        }
        this.loading = false;
        this.PageLoading = false;
      },
        err => {
          //console.log("error", err)
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
  displayContact(event) {
    if (event.value == this.PrimaryContactOtherId) {
      this.displayContactPerson = true;
    }
    else {
      this.displayContactPerson = false;
    }

  }
  OnBlur() {
    this.Edited = true;
  }
  ErrorMessage = '';
  UpdateOrSave() {
    debugger;
    var _MandatoryColumns = this.ColumnsOfSelectedReports.filter((f: any) => f.Active == 1);
    this.ErrorMessage = '';
    _MandatoryColumns.forEach(b => {
      if (this.studentForm.get(b.ReportName)?.value == undefined
        || this.studentForm.get(b.ReportName)?.value == null
        || this.studentForm.get(b.ReportName)?.value.length == 0
        || this.studentForm.get(b.ReportName)?.value == 0) {
        this.ErrorMessage += b.ReportName + " is required.\n";
      }
    })


    if (this.ErrorMessage.length > 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar(this.ErrorMessage, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    var _email = this.studentForm.get("EmailAddress")?.value;
    if (_email != null && _email.length > 0) {
      var checkduppayload = { 'Id': this.StudentId, 'Email': _email }
      this.contentservice.CheckEmailDuplicate(checkduppayload)
        .subscribe((data: any) => {
          if (data) {
            this.loading = false; this.PageLoading = false;
            this.contentservice.openSnackBar("Email already in use.", globalconstants.ActionText, globalconstants.RedBackground);
            return;
          }
        });
    }
    this.studentData = [];
    var _genderId = this.studentForm.get("Gender")?.value;
    if (!_genderId)
      _genderId = 0;
    this.studentData.push({
      StudentId: this.StudentId,
      FirstName: this.studentForm.get("FirstName")?.value ? this.studentForm.get("FirstName")?.value.trim() : '',
      LastName: this.studentForm.get("LastName")?.value ? this.studentForm.get("LastName")?.value.trim() : '',
      FatherName: this.studentForm.get("FatherName")?.value ? this.studentForm.get("FatherName")?.value.trim() : '',
      FatherOccupation: this.studentForm.get("FatherOccupation")?.value,
      MotherName: this.studentForm.get("MotherName")?.value ? this.studentForm.get("MotherName")?.value.trim() : '',
      MotherOccupation: this.studentForm.get("MotherOccupation")?.value,
      GenderId: _genderId,
      PermanentAddress: this.studentForm.get("PermanentAddress")?.value,
      PresentAddress: this.studentForm.get("PresentAddress")?.value,
      DOB: this.studentForm.get("DOB")?.value,// this.adjustDateForTimeOffset(new Date(this.studentForm.get("DOB")?.value)),
      BloodgroupId: this.studentForm.get("Bloodgroup")?.value,
      CategoryId: this.studentForm.get("Category")?.value,
      AccountHolderName: this.studentForm.get("AccountHolderName")?.value,
      BankAccountNo: this.studentForm.get("BankAccountNo")?.value,
      IFSCCode: this.studentForm.get("IFSCCode")?.value,
      MICRNo: this.studentForm.get("MICRNo")?.value,
      AdhaarNo: this.studentForm.get("AdhaarNo")?.value,
      Photo: this.studentForm.get("Photo")?.value,
      ReligionId: this.studentForm.get("Religion")?.value,
      PersonalNo: this.studentForm.get("PersonalNo")?.value,
      WhatsAppNumber: this.studentForm.get("WhatsAppNumber")?.value,
      FatherContactNo: this.studentForm.get("FatherContactNo")?.value,
      MotherContactNo: this.studentForm.get("MotherContactNo")?.value,
      PrimaryContactFatherOrMother: this.studentForm.get("PrimaryContactFatherOrMother")?.value,
      NameOfContactPerson: this.studentForm.get("NameOfContactPerson")?.value,
      RelationWithContactPerson: this.studentForm.get("RelationWithContactPerson")?.value,
      ContactPersonContactNo: this.studentForm.get("ContactPersonContactNo")?.value,
      AlternateContact: this.studentForm.get("AlternateContact")?.value,
      ClassAdmissionSought: this.studentForm.get("ClassAdmissionSought")?.value,
      LastSchoolPercentage: this.studentForm.get("LastSchoolPercentage")?.value,
      TransferFromSchool: this.studentForm.get("TransferFromSchool")?.value,
      TransferFromSchoolBoard: this.studentForm.get("TransferFromSchoolBoard")?.value,
      ClubId: this.studentForm.get("Club")?.value,
      HouseId: this.studentForm.get("House")?.value,
      RemarkId: this.studentForm.get("RemarkId")?.value,
      Remark2Id: this.studentForm.get("Remark2Id")?.value,
      AdmissionStatusId: this.studentForm.get("AdmissionStatus")?.value,
      AdmissionDate: this.studentForm.get("AdmissionDate")?.value,// this.adjustDateForTimeOffset(new Date(this.studentForm.get("AdmissionDate")?.value)),
      Notes: this.studentForm.get("Notes")?.value,
      EmailAddress: _email,
      Active: this.studentForm.get("Active")?.value == true ? 1 : 0,
      ReasonForLeavingId: this.studentForm.get("ReasonForLeaving")?.value,
      OrgId: this.LoginUserDetail[0]["orgId"],
      SubOrgId: this.SubOrgId,
      IdentificationMark: this.studentForm.get("IdentificationMark")?.value,
      BoardRegistrationNo: this.studentForm.get("BoardRegistrationNo")?.value,
      Height: this.studentForm.get("Height")?.value,
      Weight: this.studentForm.get("Weight")?.value,
      PID: this.PID
    });
    //debugger;
    //console.log("studentData", this.studentData)
    if (this.studentForm.get("StudentId")?.value == 0) {
      this.studentData[0].SectionId = 0;
      this.studentData[0].SemesterId = 0;
      this.save();
    }
    else {
      this.update();
    }

  }
  PID = 0;
  save() {
    debugger;
    this.studentForm.patchValue({ AlternateContact: "" });
    this.contentservice.GetStudentMaxPID(this.FilterOrgSubOrg).subscribe((data: any) => {
      var _MaxPID = 1;
      if (data.value.length > 0) {
        _MaxPID = +data.value[0].PID + 1;
      }
      this.studentData[0].PID = _MaxPID;
      this.studentData[0].BatchId = this.SelectedBatchId;
      this.dataservice.postPatch('Students', this.studentData, 0, 'post')
        .subscribe((result: any) => {
          debugger;
          if (result != undefined) {
            this.studentForm.patchValue({
              StudentId: result.StudentId
            })

            this.PID = result.PID;
            this.StudentId = result.StudentId;
            this.studentData[0].StudentId = this.StudentId;
            this.studentData[0].StudentClassId = result.StudentClassId;
            // if (result != null && result.UserId != "")
            //   this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            // else
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

            this.StudentClassId = result.StudentClassId;
            this.loading = false; this.PageLoading = false;
            this.tokenStorage.savePID(this.PID + "")
            this.tokenStorage.saveStudentId(this.StudentId + "")
            this.tokenStorage.saveStudentClassId(this.StudentClassId + "");

            let _student: any[] = this.tokenStorage.getStudents()!;
            this.studentData[0]["StudentClasses"] = [];
            let _studCls = {
              StudentClassId: this.StudentClassId,
              StudentId: this.StudentId,
              ClassId: result.ClassId,
              SectionId: result.SectionId,
              SemesterId: result.SemesterId,
              FeeTypeId: result.FeeTypeId,
              RollNo: result.RollNo,
              Active: result.Active,
              BatchId: result.BatchId,
              AdmissionDate: result.AdmissionDate,
              Remarks: result.Remarks
            }
            this.studentData[0]["StudentClasses"].push(_studCls);
            _student?.push(this.studentData[0]);
            this.tokenStorage.saveStudents(_student);

            this.CreateInvoice(_studCls);
            //this.GetStudentClassPhoto();
            this.Edited = false;

          }

        }, error => {
          //console.log("student insert", error)
          var errormsg = globalconstants.formatError(error);
          this.loading = false;
          this.contentservice.openSnackBar(errormsg, globalconstants.ActionText, globalconstants.RedBackground);
        })
    })
  }

  update() {
    //////console.log('student', this.studentForm.value)
    this.dataservice.postPatch('Students', this.studentData[0], this.StudentId, 'patch')
      .subscribe((result: any) => {
        this.loading = false; this.PageLoading = false;
        this.Edited = false;
        this.GetStudentClassPhoto();
        debugger;
        let _student: any[] = this.tokenStorage.getStudents()!;

        //let indx = _student.findIndex(f => f.StudentId === this.StudentId);
        let _stud = _student.find(f => f.StudentId === this.StudentId);
        let studcls = JSON.parse(JSON.stringify(_stud.StudentClasses));

        //_student.splice(indx, 1);

        if (this.studentData[0].RemarkId) {
          var _remark1obj = this.Remark1.filter((f: any) => f.MasterDataId == this.studentData[0].RemarkId);
          if (_remark1obj.length > 0)
            this.studentData[0].Remark1 = _remark1obj[0].MasterDataName;
        }
        if (this.studentData[0].Remark2Id) {
          var _remark2obj = this.Remark2.filter((f: any) => f.MasterDataId == this.studentData[0].Remark2Id);
          if (_remark2obj.length > 0)
            this.studentData[0].Remark2 = _remark2obj[0].MasterDataName;
        }
        this.studentData[0].StudentClasses = studcls;
        let indx = _student.findIndex(f => f.StudentId === this.StudentId);
        if (indx > -1)
          _student[indx] = JSON.parse(JSON.stringify(this.studentData[0]));
        else {
          this.contentservice.openSnackBar("StudentId index not found in Students", globalconstants.ActionText, globalconstants.RedBackground);
          return;
        }
        //_stud = JSON.parse(JSON.stringify(this.studentData[0]));
        // _stud[0].StudentClasses = studcls;
        //_student.push(this.studentData[0]);
        this.tokenStorage.saveStudents(_student);
        //console.log("after", _student.filter(f => f.StudentId == this.StudentId))
        if (result != null && result.UserId != "") {
          this.contentservice.openSnackBar(globalconstants.UserLoginCreated, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        else
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      }, error => {
        this.loading = false;
        console.log("student update", error);
      })
  }

  getErrorMessage(pickerInput: string): string {
    if (!pickerInput || pickerInput === '') {
      return 'Please choose a date.';
    }
    return globalconstants.isMyDateFormat(pickerInput);
  }
  CreateInvoice(row) {
    debugger;
    this.loading = true;
    this.contentservice.GetClassFeeWithFeeDefinition(this.FilterOrgSubOrgBatchId, row.ClassId)//, row.SemesterId, row.SectionId)
      .subscribe((datacls: any) => {

        // var _clsfeeWithDefinitions = datacls.value.filter(m => m.FeeDefinition.Active == 1);
        var objClassFee = datacls.value.filter(def => def.FeeDefinition.Active == 1
          && def.ClassId == row.ClassId
          && def.SemesterId == row.SemesterId
          && def.SectionId == row.SectionId);
        if (objClassFee.length == 0) {
          objClassFee = datacls.value.filter(def => def.FeeDefinition.Active == 1 && def.ClassId == row.ClassId);
        }
        this.contentservice.getStudentClassWithFeeType(this.FilterOrgSubOrgBatchId, row.ClassId, row.SemesterId, row.SectionId, row.StudentClassId, 0)
          .subscribe((data: any) => {
            var studentfeedetail: any[] = [];
            let _Students: any = this.tokenStorage.getStudents()!;
            var _feeName = '', _remark1 = '', _remark2 = '';
            var _category = '';
            var _subCategory = '';
            var _className = '';
            var _semesterName = '';
            var _sectionName = '';
            let _studentAllFeeTypes: any = [];
            let _feeObj;
            var _formula = '';
            let _feeTypeId = 0;
            data.value.forEach(studcls => {
              _feeName = ''; _remark1 = ''; _remark2 = '';
              let _currentStudent = _Students.find(s => s.StudentId === studcls.StudentId);
              if (_currentStudent) {
                _remark1 = _currentStudent.Remark1;
                _remark2 = _currentStudent.Remark2;
              }
              _studentAllFeeTypes = [];
              studcls.StudentFeeTypes.forEach(item => {
                _studentAllFeeTypes.push(
                  {
                    FeeTypeId: item.FeeTypeId,
                    FeeName: item.FeeType.FeeTypeName,
                    Formula: item.FeeType.Formula,
                    FromMonth: item.FromMonth,
                    ToMonth: item.ToMonth,
                    Discount: item.Discount
                  })
              })
              objClassFee.forEach(clsfee => {
                _category = '';
                _subCategory = '';
                _className = '';
                _semesterName = '';
                _sectionName = '';
                _formula = '';
                _feeTypeId = 0;

                var objcls = this.Classes.find((f: any) => f.ClassId == studcls.ClassId);
                if (objcls)
                  _className = objcls.ClassName;

                var objsemester = this.Semesters.find((f: any) => f.MasterDataId == studcls.SemesterId);
                if (objsemester)
                  _semesterName = objsemester.MasterDataName;

                var objsection = this.Sections.find((f: any) => f.ClassId == studcls.SectionId);
                if (objsection)
                  _sectionName = objsection.MasterDataName;

                var objcat = this.FeeCategories.find((f: any) => f.MasterDataId == clsfee.FeeDefinition.FeeCategoryId);
                if (objcat)
                  _category = objcat.MasterDataName;

                var objsubcat = this.FeeCategories.find((f: any) => f.MasterDataId == clsfee.FeeDefinition.FeeSubCategoryId);
                if (objsubcat)
                  _subCategory = objsubcat.MasterDataName;

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
                    SectionId: studcls.SectionId,
                    SemesterId: studcls.SemesterId,
                    ClassName: _className,
                    Section: _sectionName,
                    Semester: _semesterName,
                    RollNo: studcls.RollNo,
                    Remark1: _remark1,
                    Remark2: _remark2
                  });
                }

              })
            })
            // //console.log("studentfeedetailxxxx",studentfeedetail)
            this.contentservice.createInvoice(studentfeedetail, this.SelectedBatchId, this.LoginUserDetail[0]["orgId"], this.SubOrgId)
              .subscribe((data: any) => {
                this.loading = false;
                this.contentservice.openSnackBar("Invoice created successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
              },
                error => {
                  this.loading = false;
                  //console.log("create invoice error", error);
                  this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage, globalconstants.ActionText, globalconstants.RedBackground);
                })
          })
      });

  }
  // CreateInvoice() {
  //   this.contentservice.getInvoice(+this.LoginUserDetail[0]["orgId"], this.SubOrgId, this.SelectedBatchId, this.StudentClassId, 0, 0, 0)
  //     .subscribe((data: any) => {

  //       this.contentservice.createInvoice(data, this.SelectedBatchId, this.LoginUserDetail[0]["orgId"], this.SubOrgId)
  //         .subscribe((data: any) => {
  //           //this.loading = false; this.PageLoading=false;
  //           //this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
  //         },
  //           error => {
  //             this.loading = false;
  //             //console.log("error in createInvoice", error);
  //           })
  //     },
  //       error => {
  //         this.loading = false;
  //         //console.log("error in getinvoice", error);
  //       })
  // }
  adjustDateForTimeOffset(dateToAdjust: Date) {
    //////console.log(dateToAdjust)
    if (dateToAdjust) {
      var offsetMs = dateToAdjust.getTimezoneOffset() * 60000;
      return new Date(dateToAdjust.getTime() - offsetMs);
    }
    else
      return EMPTY;
  }
  getFields(pModuleName) {
    this.contentservice.getSelectedReportColumn(this.FilterOrgSubOrg, this.SelectedApplicationId)
      .subscribe((data: any) => {
        debugger;
        var _baseReportId = 0;
        if (data.value.length > 0) {
          _baseReportId = data.value.filter((f: any) => f.ReportName == 'Reports' && f.ParentId == 0)[0].ReportConfigItemId;
          var _studentModuleObj = data.value.filter((f: any) => f.ReportName == pModuleName && f.ParentId == _baseReportId)
          var _studentModuleId = 0;
          if (_studentModuleObj.length > 0) {
            _studentModuleId = _studentModuleObj[0].ReportConfigItemId;
          }

          var _orgStudentModuleObj = data.value.filter((f: any) => f.ParentId == _studentModuleId
            && f.SubOrgId == this.SubOrgId && f.OrgId == this.LoginUserDetail[0]["orgId"] && f.Active == 1);
          var _orgStudentModuleId = 0;
          if (_orgStudentModuleObj.length > 0) {
            _orgStudentModuleId = _orgStudentModuleObj[0].ReportConfigItemId;
          }

          this.ColumnsOfSelectedReports = data.value.filter((f: any) => f.ParentId == _orgStudentModuleId
            && f.SubOrgId == this.SubOrgId && f.OrgId == this.LoginUserDetail[0]["orgId"])

        }

      })
  }
  GetPhoto() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["FileId,FileName"];
    list.filter = ["StudentId eq " + this.StudentId];// + " and BatchId eq " + this.SelectedBatchId];
    list.PageName = "StorageFnPs"
    return this.dataservice.get(list);
  }
  GetStudentClass() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["ClassId,RollNo,SectionId,StudentClassId,StudentId,SemesterId"];
    list.filter = ["StudentId eq " + this.StudentId + " and IsCurrent eq true and BatchId eq " + this.SelectedBatchId];
    list.PageName = "StudentClasses";
    return this.dataservice.get(list);

    //list.lookupFields = ["StudentClasses($filter=BatchId eq " + this.SelectedBatchId + ";$select=ClassId,RollNo,SectionId,StudentClassId,StudentId),StorageFnPs($select=FileId,FileName;$filter=StudentId eq " + this.StudentId + ")"]
  }
  GetStudent() {

    //debugger;
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "PID",
      "StudentId",
      "FirstName",
      "LastName",
      "FatherName",
      "FatherOccupation",
      "MotherName",
      "MotherOccupation",
      "GenderId",
      "PermanentAddress",
      "PresentAddress",
      "DOB",
      "BloodgroupId",
      "CategoryId",
      "AccountHolderName",
      "BankAccountNo",
      "IFSCCode",
      "MICRNo",
      "AdhaarNo",
      "Photo",
      "ReligionId",
      "PersonalNo",
      "WhatsAppNumber",
      "FatherContactNo",
      "MotherContactNo",
      "PrimaryContactFatherOrMother",
      "NameOfContactPerson",
      "RelationWithContactPerson",
      "ContactPersonContactNo",
      "AlternateContact",
      "ClassAdmissionSought",
      "LastSchoolPercentage",
      "TransferFromSchool",
      "TransferFromSchoolBoard",
      "ClubId",
      "HouseId",
      "RemarkId",
      "Remark2Id",
      "AdmissionStatusId",
      "AdmissionDate",
      "Notes",
      "EmailAddress",
      "Active",
      "ReasonForLeavingId",
      "IdentificationMark",
      "BoardRegistrationNo",
      "Height",
      "Weight"
    ];//"StudentId", "Name", "FatherName", "MotherName", "FatherContactNo", "MotherContactNo", "Active"];
    list.PageName = "Students";
    list.filter = ["StudentId eq " + this.StudentId];

    debugger;
    return this.dataservice.get(list);


  }
  Students: any[] = [];
  SetStudentClassForStore(stud, studclass) {

    let _student: any = {
      'StudentId': stud.StudentId,
      'FirstName': stud.FirstName,
      'LastName': stud.LastName,
      'FatherName': stud.FatherName,
      'MotherName': stud.MotherName,
      'PersonalNo': stud.PersonalNo,
      'FatherContactNo': stud.FatherContactNo,
      'MotherContactNo': stud.MotherContactNo,
      "PID": stud.PID,
      "Active": stud.Active,
      "RemarkId": stud.RemarkId,
      "Remark2Id": stud.Remark2Id,
      "GenderId": stud.GenderId,
      "HouseId": stud.HouseId,
      "EmailAddress": stud.EmailAddress,
      "UserId": stud.UserId,
      "ReasonForLeavingId": stud.ReasonForLeavingId,
      "AdmissionStatusId": stud.AdmissionStatusId,
      StudentClasses: studclass
    };
    var _classNameobj: any = [];
    var _className = '', _class;

    //_student.forEach((d: any) => {
    _classNameobj = [];
    _className = ''; _class = '';
    var studcls = _student.StudentClasses.find((f: any) => f.StudentId == _student.StudentId);
    if (studcls) {
      _classNameobj = this.Classes.find(c => c.ClassId == studcls.ClassId);
      if (_classNameobj) {
        _className = _classNameobj.ClassName;
        _class = "-" + _classNameobj.ClassName;
      }
      var _Section = '', _sectionName = '';
      var _sectionobj = this.Sections.find((f: any) => f.MasterDataId == studcls.SectionId);
      if (_sectionobj) {
        _sectionName = _sectionobj.MasterDataName;
        _Section = "-" + _sectionobj.MasterDataName;
      }
      var _Semester = '', _semesterName = '';
      var _semesterobj = this.Semesters.find((f: any) => f.MasterDataId == studcls.SemesterId);
      if (_semesterobj) {
        _semesterName = _semesterobj.MasterDataName;
        _Semester = "-" + _semesterobj.MasterDataName;
      }
      var _lastname = _student.LastName == null ? '' : " " + _student.LastName;
      var _RollNo = "-" + studcls.RollNo;
      var _name = _student.FirstName + _lastname;
      var _fullDescription = _name + "-" + _class + _Semester + _Section + _RollNo;
      _student.StudentClassId = studcls.StudentClassId;
      _student.Name = _fullDescription;
      _student.ClassName = _className;
      _student.Section = _sectionName;
      _student.Semester = _semesterName;
      _student.StudentClasses = studcls;
      //this.Students.push(d);
    }
    // })

    var count = this.Students.find(s => s.StudentId == _student.StudentId);
    if (!count) {
      this.Students.push(_student);
      this.tokenStorage.saveStudents(this.Students);
    }
  }

}
