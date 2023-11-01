import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { FileUploadService } from '../../../shared/upload.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { AddstudentclassComponent } from '../addstudentclass/addstudentclass.component';
import { AddstudentfeepaymentComponent } from '../studentfeepayment/addstudentfeepayment/addstudentfeepayment.component';
import { FeereceiptComponent } from '../studentfeepayment/feereceipt/feereceipt.component';
import { SwUpdate } from '@angular/service-worker';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-studentview',
  templateUrl: './studentview.component.html',
  styleUrls: ['./studentview.component.scss']
})
export class StudentviewComponent implements OnInit {
  PageLoading = true;
  @ViewChild(AddstudentclassComponent) studentClass: AddstudentclassComponent;
  @ViewChild(AddstudentfeepaymentComponent) studentFeePayment: AddstudentfeepaymentComponent;
  @ViewChild(FeereceiptComponent) feeReceipt: FeereceiptComponent;
  Edit = false;
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
  Sections: any[] = [];
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
  AttendanceStatus: any[] = [];
  AdmissionStatuses: any[] = [];
  ColumnsOfSelectedReports: any[] = [];
  Semesters: any[] = [];
  CourseYears: any[] = [];
  CountryId = 0;
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  PrimaryContactDefaultId = 0;
  PrimaryContactOtherId = 0;
  displayContactPerson = false;
  Houses: any[] = [];
  Remarks: any[] = [];
  studentForm: UntypedFormGroup;
  Edited = false;
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

  constructor(
    //private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private route: Router,
    private fileUploadService: FileUploadService,
    private shareddata: SharedataService,
    private tokenStorage: TokenStorageService,

  ) {

    this.StudentId = this.tokenStorage.getStudentId()!;;
    this.StudentClassId = this.tokenStorage.getStudentClassId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
  }

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
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.STUDENTDETAIL);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
        //this.tabNames
      }
      if (this.Permission != 'deny') {
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.getFields('Student Module');
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        //this.GetEvaluationNames();
        this.GetMasterData();
        this.GetFeeTypes();
        this.GetStudentAttendance();
        this.GetAchievementAndPoint();

        this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
          if (data.value) this.Classes = [...data.value]; else this.Classes = [...data];
          this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
          this.loading = false;
          this.PageLoading = false;
          this.GetStudentClass();
        });

      }
    }
  }
  @ViewChildren("allTabs") allTabs: QueryList<any>

  ngAfterViewInit() {
    //////console.log('total tabs: ' + this.allTabs.first._tabs.length);
  }

  get f() { return this.studentForm.controls }

  edit() {
    this.route.navigate(['/edu/addstudent/' + this.StudentId])
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
    if (!event.checked)
      this.StudentLeaving = true;
    else {
      this.StudentLeaving = false;
      this.studentForm.patchValue({ ReasonForLeavingId: this.ReasonForLeaving.filter(r => r.MasterDataName.toLowerCase() == 'active')[0].MasterDataId });
    }
    this.OnBlur();
  }

  Batches: any[] = [];
  StudentClasses: any[] = [];
  GetStudentClass() {
    debugger;
    // var filterOrgIdNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);

     if (this.StudentId > 0 && this.StudentClassId > 0) {

    //   let list: List = new List();
    //   list.fields = [
    //     "StudentClassId", "ClassId",
    //     "StudentId", "RollNo", "SectionId", "AdmissionNo",
    //     "BatchId", "FeeTypeId", "CourseYearId", "SemesterId",
    //     "AdmissionDate", "Remarks", "Active"];
    //   list.PageName = "StudentClasses";
    //   list.filter = [filterOrgIdNBatchId + " and StudentClassId eq " + this.StudentClassId];

    //   this.dataservice.get(list)
    //     .subscribe((data: any) => {
      let stucls:any = this.tokenStorage.getStudents()!;
      stucls = stucls.filter((s:any)=>s.StudentId == this.StudentId);

          if (stucls.length > 0) {
            var _class = ''
            var _classObj = this.Classes.filter((f: any) => f.ClassId == stucls[0].StudentClasses[0].ClassId);
            if (_classObj.length > 0)
              _class = _classObj[0].ClassName;
            var _semester = ''
            var _semesterObj = this.Semesters.filter((f: any) => f.MasterDataId == stucls[0].StudentClasses[0].SemesterId);
            if (_semesterObj.length > 0)
              _semester = _semesterObj[0].MasterDataName;
            // var _courseYear = ''
            // var _courseYearObj = this.Classes.filter((f:any) => f.MasterDataId == data.value[0].CourseYearId);
            // if (_courseYearObj.length > 0)
            //   _courseYear = _courseYearObj[0].MasterDataName;

            var _section = ''
            var _sectionObj = this.Sections.filter((f: any) => f.MasterDataId == stucls[0].StudentClasses[0].SectionId);
            if (_sectionObj.length > 0)
              _section = _sectionObj[0].MasterDataName;

            var _feeType = ''
            var _feeTypeObj = this.FeeType.filter((f: any) => f.FeeTypeId == stucls[0].StudentClasses[0].FeeTypeId);
            if (_feeTypeObj.length > 0)
              _feeType = _feeTypeObj[0].FeeTypeName;

            var _batch = ''
            this.Batches = this.tokenStorage.getBatches()!;;
            var _batchObj = this.Batches.filter((f: any) => f.BatchId == stucls[0].StudentClasses[0].BatchId);
            if (_batchObj.length > 0)
              _batch = _batchObj[0].BatchName;


            var admissiondate = moment(stucls[0].StudentClasses[0].AdmissionDate).isBefore("1970-01-01")
            this.StudentClasses = [
              { Text: 'Admission No.', Value: stucls[0].StudentClasses[0].AdmissionNo },
              { Text: 'Class', Value: _class },
              { Text: 'Section', Value: _section },
              { Text: 'Semester', Value: _semester },
              // { Text: 'Year', Value: _courseYear },
              { Text: 'Roll No.', Value: stucls[0].StudentClasses[0].RollNo },
              { Text: 'Batch', Value: _batch },
              { Text: 'Fee Type', Value: _feeType },
              { Text: 'Admission Date', Value: admissiondate ? moment() : moment(stucls[0].StudentClasses[0].AdmissionDate).format('DD/MM/YYYY') },
              { Text: 'Remarks', Value: stucls[0].StudentClasses[0].Remarks },
              { Text: 'Active', Value: stucls[0].StudentClasses[0].Active == 1 ? 'Yes' : 'No' }
            ];
          }
          else {
            //var _year = new Date().getFullYear();
            this.StudentClasses = [
              { Text: 'Admission No.', Value: '' },
              { Text: 'Class', Value: '' },
              { Text: 'Section', Value: '' },
              { Text: 'RollNo', Value: '' },
              { Text: 'Semester', Value: '' },
              // { Text: 'Year', Value: '' },
              { Text: 'BatchId', Value: '' },
              { Text: 'Fee Type', Value: '' },
              { Text: 'Admission Date', Value: '' },
              { Text: 'Remarks', Value: '' },
              { Text: 'Active', Value: '' }
            ];
            this.contentservice.openSnackBar("Class yet to be defined for this student", globalconstants.ActionText, globalconstants.RedBackground);
          }
          this.datasourceStudentClassInfo = new MatTableDataSource<any>(this.StudentClasses);
          this.loading = false;
          this.PageLoading = false;
        //});
    }
    else {
      this.loading = false;
      this.PageLoading = false;
    }
  }
  StudentAttendanceList: any[] = [];
  AttendanceStatusSum: any[] = [];
  GetStudentAttendance() {
    debugger;

    let list: List = new List();
    list.fields = [
      "AttendanceId",
      "StudentClassId",
      "AttendanceDate",
      "AttendanceStatusId",
      "ClassSubjectId",
      "Remarks",
      "OrgId",
      "BatchId"
    ];
    list.PageName = "Attendances";
    list.lookupFields = ["StudentClass($select=RollNo,SectionId;$expand=Student($select=FirstName,LastName))"];
    list.filter = [this.FilterOrgSubOrgBatchId + " and StudentClassId eq " + this.StudentClassId];

    this.dataservice.get(list)
      .subscribe((attendance: any) => {
        attendance.value.forEach(att => {
          var _lastname = att.StudentClass.Student.LastName == null || att.StudentClass.Student.LastName == '' ? '' : " " + att.StudentClass.Student.LastName;
          this.StudentAttendanceList.push({
            AttendanceId: att.AttendanceId,
            StudentClassId: att.StudentClassId,
            AttendanceStatusId: att.AttendanceStatusId,
            Remarks: att.Remarks,
            StudentRollNo: att.StudentClass.Student.FirstName + _lastname
          });
        });
        //this.AttendanceStatusSum = alasql("select AttendanceStatusId, count(1) as Total from ? group by AttendanceStatusId",
        //  [this.StudentAttendanceList]);
        if (this.AttendanceStatusSum.length > 0) {
          var _present = 0
          var _absent = 0;
          var _presentObj = this.StudentAttendanceList.filter((f: any) => f.AttendanceStatusId == this.AttendancePresentId)
          //if (_presentObj.length > 0)
          _present = _presentObj.length;

          var _absentObj = this.StudentAttendanceList.filter((f: any) => f.AttendanceStatusId == this.AttendanceAbsentId)
          if (_absentObj.length > 0)
            _absent = _absentObj.length;

          var _AttendanceInfoList: any = [
            { "Text": "Present", Value: _present },
            { "Text": "Absent", Value: _absent }
          ]
        }
        this.datasourceAttendanceInfo = new MatTableDataSource<any>(_AttendanceInfoList);
      })
  }
  SportsResultList: any[] = [];
  ActivityNames: any[] = [];

  DisplayActivity = ["Secured", "Achievement", "SportsNameId", "CategoryId", "AchievementDate"];

  GetSportsResult() {
    debugger;
    var filterStr = "OrgId eq " + this.LoginUserDetail[0]["orgId"] + " and Active eq 1";
    filterStr += " and StudentClassId eq " + this.StudentClassId;

    this.loading = true;
    this.SportsResultList = [];

    let list: List = new List();
    list.fields = [
      "SportResultId",
      "StudentClassId",
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
        data.value.forEach(m => {
          var objachievement = this.AchievementAndPoints.filter(a => a.AchievementAndPointId == m.RankId);
          if (objachievement.length > 0) {
            m.Rank = objachievement[0].Rank;
            var obj = this.ActivityNames.filter((f: any) => f.MasterDataId == m.SportsNameId);
            if (obj.length > 0)
              m.SportsName = obj[0].MasterDataName;
            else
              m.SportsName = '';
            m.SubCategories = this.allMasterData.filter((f: any) => f.ParentId == m.CategoryId);
            m.Achievement = globalconstants.decodeSpecialChars(m.Achievement);
            m.Action = false;
            this.SportsResultList.push(m);
          }
        })

        //this.dataSourceActivity = new MatTableDataSource<any>(this.SportsResultList);

      });

  }
  AchievementAndPoints: any[] = [];
  GetAchievementAndPoint() {
    //debugger;
    var filterOrgId = "OrgId eq " + this.LoginUserDetail[0]['orgId'] + " and Active eq true";

    let list: List = new List();
    list.fields = ["AchievementAndPointId,Rank"];
    list.PageName = "AchievementAndPoints";
    list.filter = [filterOrgId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AchievementAndPoints = [...data.value];
        this.GetSportsResult();
      })
  }
  StudentFamilyNFriendList: any[] = [];
  StudentFamilyNFriendListName = 'StudentFamilyNFriends';

  GetStudentFamilyNFriends() {

    var _ParentStudentId = 0;
    let filterStr = 'StudentId eq ' + this.StudentId + ' and OrgId eq ' + this.LoginUserDetail[0]['orgId']
    let list: List = new List();
    list.fields = [
      'ParentStudentId'
    ];
    list.PageName = this.StudentFamilyNFriendListName;
    list.filter = [filterStr];
    this.StudentFamilyNFriendList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          _ParentStudentId = data.value[0].ParentStudentId;
          filterStr += ' and ParentStudentId eq ' + _ParentStudentId;

          list = new List();
          list.fields = [
            'StudentFamilyNFriendId',
            'StudentId',
            'ParentStudentId',
            'Name',
            'ContactNo',
            'RelationshipId',
            'Active',
            'Remarks'
          ];
          list.orderBy = "RelationshipId";
          list.PageName = this.StudentFamilyNFriendListName;
          list.lookupFields = ["Student($select=FirstName,LastName)"];
          list.filter = [filterStr];
          this.StudentFamilyNFriendList = [];
          this.dataservice.get(list)
            .subscribe((data: any) => {
              //debugger;
              if (data.value.length > 0) {
                this.StudentFamilyNFriendList = data.value.map(m => {
                  var _lastname = m.Student.LastName == null || m.Student.LastName == '' ? '' : " " + m.Student.LastName;
                  if (m.StudentId > 0) {
                    m.SiblingName = m.Student.FirstName + _lastname;
                    // m.FeeType = obj[0].FeeType;
                    // m.FeeTypeRemarks = obj[0].Remarks;
                  }
                  else
                    m.SiblingName = m.Name;
                  return m;
                });
              }
            });
        }
      })

  }
  AttendancePresentId = 0;
  AttendanceAbsentId = 0;
  Remark2: any = [];
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
    this.Remarks = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARK1);
    this.Remark2 = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARK2);
    this.AdmissionStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.ADMISSIONSTATUS);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ActivityNames = this.getDropDownData(globalconstants.MasterDefinitions.common.ACTIVITYNAME);
    this.Location = this.getDropDownData(globalconstants.MasterDefinitions.schoolapps.LOCATION);
    this.PrimaryContactDefaultId = this.PrimaryContact.filter(contact => contact.MasterDataName.toLowerCase() == "father")[0].MasterDataId;
    this.PrimaryContactOtherId = this.PrimaryContact.filter(contact => contact.MasterDataName.toLowerCase() == "other")[0].MasterDataId;
    this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
    this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions.common.ATTENDANCESTATUS);
    this.AttendancePresentId = this.AttendanceStatus.filter((f: any) => f.MasterDataName.toLowerCase() == 'present')[0].MasterDataId;
    this.AttendanceAbsentId = this.AttendanceStatus.filter((f: any) => f.MasterDataName.toLowerCase() == 'absent')[0].MasterDataId;
    
    if (this.StudentId > 0)
      this.GetStudent();

    // });

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
  
  adjustDateForTimeOffset(dateToAdjust) {
    //////console.log(dateToAdjust)
    var offsetMs = dateToAdjust.getTimezoneOffset() * 60000;
    return new Date(dateToAdjust.getTime() - offsetMs);
  }
  FeeType: any[] = [];
  GetFeeTypes() {
    debugger;
    this.loading = true;
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
    list.PageName = "SchoolFeeTypes";
    list.filter = [this.FilterOrgSubOrg + " and Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeType = [...data.value];
      })
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

          var _orgStudentModuleObj = data.value.filter((f: any) => f.ParentId == _studentModuleId
            && f.SubOrgId == this.SubOrgId && f.OrgId == this.LoginUserDetail[0]["orgId"] && f.Active == 1);
          var _orgStudentModuleId = 0;
          if (_orgStudentModuleObj.length > 0) {
            _orgStudentModuleId = _orgStudentModuleObj[0].ReportConfigItemId;
          }

          this.ColumnsOfSelectedReports = data.value.filter((f: any) => f.ParentId == _orgStudentModuleId)

        }

      })
  }

  datasourcePrimaryInfo: MatTableDataSource<any>;
  datasourceContact: MatTableDataSource<any>;
  datasourceAdditionalInfo: MatTableDataSource<any>;
  datasourceBankAccountInfo: MatTableDataSource<any>;
  datasourceStudentClassInfo: MatTableDataSource<any>;
  datasourceAttendanceInfo: MatTableDataSource<any>;
  dataSourceActivity: MatTableDataSource<any>;

  displayedColumns = ["Text", "Value"];
  GetStudent() {
    //debugger;
    this.loading = true;
    let list: List = new List();
    list.fields = ["FileId,FileName"];
    list.PageName = "StorageFnPs";
    //list.lookupFields = ["StudentClasses($filter=BatchId eq " + this.SelectedBatchId + ";$select=StudentClassId,StudentId),StorageFnPs($select=FileId,FileName;$filter=StudentId eq " + this.StudentId + ")"]
    list.filter = ["StudentId eq " + this.StudentId];

    debugger;

    this.dataservice.get(list)
      .subscribe((data: any) => {
        let _student: any = this.tokenStorage.getStudents()!;
        _student = _student.filter((s: any) => s.StudentId == this.StudentId)
        if (_student.length > 0) {
          _student.forEach(stud => {
            stud.StorageFnPs = data.value;
            if (stud.StudentClasses.length > 0) {
              this.StudentClassId = stud.StudentClasses[0].StudentClassId;
              this.tokenStorage.saveStudentClassId(this.StudentClassId + "");
            }
            var _lastname = stud.LastName == null || stud.LastName == '' ? '' : " " + stud.LastName;
            let StudentName = stud.PID + ' ' + stud.FirstName + _lastname + ' ' + stud.FatherName +
              ' ' + stud.MotherName + ',';
            this.shareddata.ChangeStudentName(StudentName);

            var _gender = '';
            var _genderObj = this.Genders.filter((f: any) => f.MasterDataId == stud.GenderId)
            if (_genderObj.length > 0)
              _gender = _genderObj[0].MasterDataName;

            var _religion = '';
            var _religionObj = this.Religion.filter((f: any) => f.MasterDataId == stud.ReligionId)
            if (_religionObj.length > 0)
              _religion = _religionObj[0].MasterDataName;

            var _category = '';
            var _categoryObj = this.Category.filter((f: any) => f.MasterDataId == stud.CategoryId)
            if (_category.length > 0)
              _category = _categoryObj[0].MasterDataName;

            var _bloodGroup = '';
            var _bloodGroupObj = this.Bloodgroup.filter((f: any) => f.MasterDataId == stud.BloodgroupId)
            if (_bloodGroupObj.length > 0)
              _bloodGroup = _bloodGroupObj[0].MasterDataName;

            var _classAdmissionSought = '';
            var _classAdmissionSoughtObj = this.Classes.filter((f: any) => f.ClassId == stud.ClassAdmissionSought)
            if (_classAdmissionSoughtObj.length > 0)
              _classAdmissionSought = _classAdmissionSoughtObj[0].ClassName;

            var _club = '';
            var _clubObj = this.Clubs.filter((f: any) => f.MasterDataId == stud.ClubId)
            if (_clubObj.length > 0)
              _club = _clubObj[0].MasterDataName;

            var _house = '';
            var _houseObj = this.Houses.filter((f: any) => f.MasterDataId == stud.HouseId)
            if (_houseObj.length > 0)
              _house = _houseObj[0].ClassName;

            var _remark = '';
            var _remarkObj = this.Remarks.filter((f: any) => f.MasterDataId == stud.RemarkId)
            if (_remarkObj.length > 0)
              _remark = _remarkObj[0].MasterDataName;
            var _remark2 = '';
            var _remark2Obj = this.Remark2.filter((f: any) => f.MasterDataId == stud.Remark2Id)
            if (_remark2Obj.length > 0)
              _remark2 = _remark2Obj[0].MasterDataName;

            var _admissionStatus = '';
            var _admissionStatusObj = this.AdmissionStatuses.filter((f: any) => f.MasterDataId == stud.AdmissionStatusId)
            if (_admissionStatusObj.length > 0)
              _admissionStatus = _admissionStatusObj[0].MasterDataName;

            var _reasonForLeaving = '';
            var _reasonForLeavingObj = this.ReasonForLeaving.filter((f: any) => f.MasterDataId == stud.ReasonForLeavingId)
            if (_reasonForLeavingObj.length > 0)
              _reasonForLeaving = _reasonForLeavingObj[0].MasterDataName;

            var _primaryContact = '';
            var _primaryContactObj = this.PrimaryContact.filter((f: any) => f.MasterDataId == stud.PrimaryContactFatherOrMother)
            if (_primaryContactObj.length > 0)
              _primaryContact = _primaryContactObj[0].MasterDataName;

            var Primary = [
              { Text: 'PID', Value: stud.PID },
              { Text: 'First Name', Value: stud.FirstName },
              { Text: 'Last Name', Value: stud.LastName },
              { Text: 'Father Name', Value: stud.FatherName },
              { Text: 'Mother Name', Value: stud.MotherName },
              { Text: 'Father Occupation', Value: stud.FatherOccupation },
              { Text: 'Mother Occupation', Value: stud.MotherOccupation },
              { Text: 'Present Address', Value: stud.PresentAddress },
              { Text: 'Permanent Address', Value: stud.PermanentAddress },
              { Text: 'DOB', Value: moment(stud.DOB).format('DD/MM/YYYY') },
              { Text: 'Gender', Value: _gender },
              { Text: 'Blood group', Value: _bloodGroup },
              { Text: 'Category', Value: _category },
              { Text: 'Religion', Value: _religion },

            ];

            var BankAccountInfo = [
              { Text: 'Account Holder Name', Value: stud.AccountHolderName },
              { Text: 'Bank Account No', Value: stud.BankAccountNo },
              { Text: 'IFSC Code', Value: stud.IFSCCode },
              { Text: 'MICR No.', Value: stud.MICRNo },
            ];
            var ContactInfo = [
              { Text: 'Adhaar No.', Value: stud.AdhaarNo },
              { Text: 'Personal No.', Value: stud.PersonalNo },
              { Text: 'WhatsApp Number', Value: stud.WhatsAppNumber },
              { Text: 'Father Contact No.', Value: stud.FatherContactNo },
              { Text: 'Mother Contact No.', Value: stud.MotherContactNo },
              { Text: 'Primary Contact', Value: _primaryContact },
              { Text: 'Name Of Contact Person', Value: stud.NameOfContactPerson },
              { Text: 'Relation With Contact Person', Value: stud.RelationWithContactPerson },
              { Text: "Contact Person's Contact No", Value: stud.ContactPersonContactNo },
              { Text: 'Alternate Contact No.', Value: stud.AlternateContact },
              { Text: 'Email Address', Value: stud.EmailAddress },
            ];
            var additionalInfo = [
              { Text: 'Last School Percentage', Value: stud.LastSchoolPercentage },
              { Text: 'Class Admission Sought', Value: _classAdmissionSought },
              { Text: 'Transfer From School', Value: stud.TransferFromSchool },
              //{ Text: 'Transfer From School Board', Value: stud.TransferFromSchoolBoard },
              { Text: 'Club', Value: _club },
              { Text: 'House', Value: _house },
              { Text: 'Admission Status', Value: _admissionStatus },
              { Text: 'Admission Date', Value: moment(stud.AdmissionDate).format('DD/MM/YYYY') },
              { Text: 'Remark 1', Value: _remark },
              { Text: 'Remark 2', Value: _remark2 },
              { Text: 'Reason For Leaving', Value: _reasonForLeaving },
              { Text: 'Identification Mark', Value: stud.IdentificationMark },
              { Text: 'Weight', Value: stud.Weight },
              { Text: 'Height', Value: stud.Height },
              { Text: 'Notes', Value: stud.Notes },
              { Text: 'Active', Value: stud.Active == 1 ? 'Yes' : 'No' }
            ]
            this.datasourcePrimaryInfo = new MatTableDataSource<any>(Primary);
            this.datasourceContact = new MatTableDataSource<any>(ContactInfo);
            this.datasourceAdditionalInfo = new MatTableDataSource<any>(additionalInfo);
            this.datasourceBankAccountInfo = new MatTableDataSource<any>(BankAccountInfo);

            if (stud.PrimaryContactFatherOrMother == this.PrimaryContactOtherId)
              this.displayContactPerson = true;
            else
              this.displayContactPerson = false;
            if (stud.StorageFnPs.length > 0) {
              var fileNames = stud.StorageFnPs.sort((a, b) => b.FileId - a.FileId)
              this.imgURL = globalconstants.apiUrl + "/Uploads/" + this.LoginUserDetail[0]["org"] +
                "/StudentPhoto/" + fileNames[0].FileName;
            }
            else if (this.StudentId > 0)
              this.imgURL = 'assets/images/emptyimageholder.jpg'

            //this.imgURL = this.sanitizer.bypassSecurityTrustResourceUrl("https://drive.google.com/file/d/1XBTLzqEmJyM91q8-dg7235aIqBDaEjYV/view");
          })
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);

        }
        this.loading = false;
        this.PageLoading = false;
      }
        ,
        err => {
          //console.log("error", err)
        });
  }

}
