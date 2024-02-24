import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { TableUtil } from '../../../shared/TableUtil';
import { TokenStorageService } from '../../../_services/token-storage.service';
import * as XLSX from 'xlsx';
import { SwUpdate } from '@angular/service-worker';
import * as moment from 'moment';

@Component({
  selector: 'app-studentdatadump',
  templateUrl: './studentdatadump.component.html',
  styleUrls: ['./studentdatadump.component.scss']
})
export class StudentDatadumpComponent implements OnInit {
  PageLoading = true;
  @ViewChild("table") tableRef: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  Defaultvalue = 0;
  loading = false;
  FilterOrgSubOrgNBatchId = '';
  FilterOrgSubOrg = '';
  //filterBatchIdNOrgId = '';
  ELEMENT_DATA: IStudent[] = [];
  dataSource: MatTableDataSource<IStudent>;
  displayedColumns: any[] = [];
  allMasterData: any[] = [];
  Students: any[] = [];
  Genders: any[] = [];
  Classes: any[] = [];
  Batches: any[] = [];
  Bloodgroup: any[] = [];
  Category: any[] = [];
  Religion: any[] = [];
  States = []
  Remarks: any[] = [];
  PrimaryContact: any[] = [];
  Location: any[] = [];
  LanguageSubjUpper: any[] = [];
  LanguageSubjLower: any[] = [];
  FeeType: any[] = [];
  FeeDefinitions: any[] = [];
  Sections: any[] = [];
  Semesters: any[] = [];
  Houses: any[] = [];
  StudentClasses: any[] = [];
  UploadTypes: any[] = [];
  ReasonForLeaving: any[] = [];
  Siblings: any[] = [];
  AdmissionStatus: any[] = [];
  Clubs: any[] = [];
  SelectedApplicationId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  SelectedBatchStudentIDRollNo: any[] = [];
  StudentClassId = 0;
  StudentId = 0;
  StudentFamilyNFriendList: any[] = [];
  studentSearchForm: UntypedFormGroup;
  filteredStudents: Observable<IStudent[]>;
  filteredFathers: Observable<IStudent[]>;
  filteredMothers: Observable<IStudent[]>;
  LoginUserDetail;
  FeePaymentPermission = '';
  ClassGroups: any[] = [];
  ClassGroupMapping: any[] = [];
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private route: Router,

    private fb: UntypedFormBuilder,
    private shareddata: SharedataService,
    private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })

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
      //var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.SEARCHSTUDENT);
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.FilterOrgSubOrgNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.studentSearchForm = this.fb.group({
        searchRemarkId: [0],
        searchClassId: [0],
      })
      this.contentservice.GetClassGroups(this.FilterOrgSubOrg)
        .subscribe((data: any) => {
          this.ClassGroups = [...data.value];
          this.contentservice.GetClassGroupMapping(this.FilterOrgSubOrg, 1)
            .subscribe((data: any) => {
              this.ClassGroupMapping = data.value.map(f => {
                f.ClassName = f.Class.ClassName;
                f.GroupName = this.ClassGroups.filter(g => g.ClassGroupId == f.ClassGroupId)[0].GroupName;
                return f;
              });
            })
        });



      this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
        if (data.value) this.Classes = [...data.value]; else this.Classes = [...data];
        this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
      });


      this.GetMasterData();
      this.GetFeeTypes();
      if (+localStorage.getItem('studentId')! > 0) {
        this.GetSibling();
      }
    }
    //this.GetStudents();
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  private _filterF(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.FatherName.toLowerCase().includes(filterValue));

  }
  private _filterM(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.MotherName.toLowerCase().includes(filterValue));

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
  Groups: any[] = [];
  GetMasterData() {
    // this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SubOrgId, this.SelectedApplicationId)
    //   .subscribe((data: any) => {

    //this.shareddata.ChangeMasterData(data.value);
    this.allMasterData = this.tokenStorage.getMasterData()!;// [...data.value];

    this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
    this.shareddata.ChangeReasonForLeaving(this.ReasonForLeaving);

    //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.Batches = this.tokenStorage.getBatches()!;
    this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
    this.shareddata.ChangeCategory(this.Category);

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
    this.Clubs = this.getDropDownData(globalconstants.MasterDefinitions.school.CLUBS);
    this.AdmissionStatus = this.getDropDownData(globalconstants.MasterDefinitions.school.ADMISSIONSTATUS);
    this.shareddata.ChangeBloodgroup(this.Bloodgroup);

    this.LanguageSubjUpper = this.getDropDownData(globalconstants.MasterDefinitions.school.LANGUAGESUBJECTUPPERCLS);
    this.shareddata.ChangeLanguageSubjectUpper(this.LanguageSubjUpper);

    this.LanguageSubjLower = this.getDropDownData(globalconstants.MasterDefinitions.school.LANGUAGESUBJECTLOWERCLS);
    this.shareddata.ChangeLanguageSubjectLower(this.LanguageSubjLower);
    this.Remarks = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARK1);
    this.contentservice.GetFeeDefinitions(this.FilterOrgSubOrg, 1).subscribe((f: any) => {
      this.FeeDefinitions = [...f.value];
      this.shareddata.ChangeFeeDefinition(this.FeeDefinitions);
    });

    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.shareddata.ChangeSection(this.Sections);

    this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
    this.Clubs.forEach(c => {
      c.type = 'ClubId'
    })
    this.Houses.forEach(h => {
      h.type = 'HouseId'
    })
    this.Remarks.forEach(h => {
      h.type = 'RemarkId'
    })
    this.Groups.push(
      {
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

    this.shareddata.ChangeHouse(this.Houses);

    this.UploadTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.UPLOADTYPE);
    this.shareddata.ChangeUploadType(this.UploadTypes);

    this.loading = false; this.PageLoading = false;
    //this.getSelectedBatchStudentIDRollNo();
    this.GetStudentClasses();

    // });

  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
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
  fee(id) {
    this.route.navigate(['/edu/addstudentfeepayment/' + id]);
  }
  class(id) {
    this.route.navigate(['/edu/addstudentcls/' + id]);
  }
  view(element) {
    debugger;
    this.generateDetail(element);
    var _ClassId = 0;
    if (element.StudentClasses.length > 0) {
      this.StudentClassId = element.StudentClasses[0].StudentClassId;
      _ClassId = element.StudentClasses[0].ClassId;
    }

    this.StudentId = element.StudentId;

    this.tokenStorage.saveStudentClassId(this.StudentClassId + "");
    this.tokenStorage.saveClassId(_ClassId + "");
    this.tokenStorage.saveStudentId(this.StudentId + "");

    this.route.navigate(['/edu/addstudent/' + element.StudentId]);
  }
  feepayment(element) {
    this.generateDetail(element);
    this.route.navigate(['/edu/feepayment']);
  }
  generateDetail(element) {
    let StudentName = element.PID + ' ' + element.Name + ' ' + element.FatherName + ' ' + element.MotherName + ',';

    let studentclass = this.SelectedBatchStudentIDRollNo.filter(sid => sid.StudentId == element.StudentId);
    if (studentclass.length > 0) {
      var _clsName = '';
      var objcls = this.Classes.filter((f: any) => f.ClassId == studentclass[0].ClassId);
      if (objcls.length > 0)
        _clsName = objcls[0].ClassName

      var _sectionName = '';
      var sectionObj = this.Sections.filter((f: any) => f.MasterDataId == studentclass[0].SectionId)
      if (sectionObj.length > 0)
        _sectionName = sectionObj[0].MasterDataName;
      this.StudentClassId = studentclass[0].StudentClassId
      StudentName += "\n " + _clsName + "-" + _sectionName;
    }

    this.shareddata.ChangeStudentName(StudentName);

    //this.shareddata.ChangeStudentClassId(this.StudentClassId);
    this.tokenStorage.saveStudentClassId(this.StudentClassId.toString());
    this.tokenStorage.saveStudentId(element.StudentId);
    //this.shareddata.ChangeStudentId(element.StudentId);

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
    if (this.ELEMENT_DATA.length > 0) {
      const datatoExport: Partial<IStudentDownload>[] = this.ELEMENT_DATA;
      TableUtil.exportArrayToExcel(datatoExport, "StudentInfoDump");
    }
  }
  getSelectedBatchStudentIDRollNo() {
    let list: List = new List();
    list.fields = ["StudentId", "RollNo", "SectionId", "StudentClassId", "ClassId", "SemesterId"];
    list.PageName = "StudentClasses";
    list.filter = [this.FilterOrgSubOrgNBatchId + " and IsCurrent eq true"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.SelectedBatchStudentIDRollNo = [...data.value];

        }
      })
  }
  GetFeeTypes() {
    debugger;
    this.loading = true;
    //var filter = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
    list.PageName = "SchoolFeeTypes";
    list.filter = [this.FilterOrgSubOrgNBatchId + " and Active eq 1"];

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
    //let checkFilterString = '';//"OrgId eq " + this.LoginUserDetail[0]["orgId"] + ' and Batch eq ' + 
    var _ClassId = this.studentSearchForm.get("searchClassId")?.value;
    //var _classes = this.ClassGroupMapping.filter(c => c.ClassGroupId == _ClassGroupId);

    var _remarkId = this.studentSearchForm.get("searchRemarkId")?.value;

    if (_remarkId == 0 && _ClassId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter atleast one parameter.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    // if (_classes.length > 2) {
    //   this.loading = false;
    //   this.PageLoading = false;
    //   this.contentservice.openSnackBar("Class group should not contains more than 2 classes for this download.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }

    var classfilter = '';
    // if (_classes.length > 0) {
    //   _classes.forEach(c => {
    //     if (classfilter.length == 0)
    //       classfilter += '(ClassId eq ' + c.ClassId
    //     else
    //       classfilter += ' or ClassId eq ' + c.ClassId
    //   })
    // }
    if (_ClassId > 0)
      classfilter = "ClassId eq " + _ClassId;

    if (classfilter.length > 0)
      classfilter += " and BatchId eq " + this.SelectedBatchId
    else
      classfilter = "BatchId eq " + this.SelectedBatchId;
    classfilter += " and IsCurrent eq true";
    let list: List = new List();
    list.PageName = "StudentClasses";
    list.fields = ["Remarks,StudentClassId,HouseId,BatchId,ClassId,RollNo,FeeTypeId,Remarks,SectionId,SemesterId,Admitted"];
    list.lookupFields = ["Student($select=*),StudentFeeTypes($filter=IsCurrent eq true and Active eq true;$select=FeeTypeId)"];

    list.filter = [this.FilterOrgSubOrg + " and " + classfilter];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //////console.log(data.value);
        if (data.value.length > 0) {
          var formattedData: any[] = [];
          //formattedData = [...data.value];
          debugger;
          data.value.filter(sc => {
            let reason = this.ReasonForLeaving.filter(r => r.MasterDataId == sc.Student.ReasonForLeavingId)
            if (sc.StudentFeeTypes.length > 0) {
              var obj = this.FeeType.find((f: any) => f.FeeTypeId == sc.StudentFeeTypes[0].FeeTypeId);
              if (obj) {
                sc.FeeType = obj.FeeTypeName
              }
              else
                sc.FeeType = '';


            }
            else
              sc.FeeType = '';
            delete sc.StudentFeeTypes;
            delete sc.ReasonForLeavingId;
            sc.Notes = sc.Remarks;
            sc.ReasonForLeaving = reason.length > 0 ? reason[0].MasterDataName : '';
            formattedData.push(sc);
            //}
          });
          this.ELEMENT_DATA = formattedData.map(element => {


            var _lastname = element.Student.LastName == null ? '' : " " + element.Student.LastName;
            element.Name = element.Student.FirstName + _lastname;
            if (element.RemarkId > 0) {
              var obj = this.Remarks.filter((f: any) => f.MasterDataId == element.Student.RemarkId);
              if (obj.length > 0)
                element.Remarks = obj[0].MasterDataName;
              else
                element.Remarks = '';
            }
            else
              element.Remarks = '';

            delete element.RemarkId;
            delete element.SubOrgId //= this.SubOrgId;

            if (element.SectionId > 0) {
              let SectionFilter = this.Sections.filter(g => g.MasterDataId == element.SectionId);
              if (SectionFilter.length == 0)
                element.Section = '';
              else
                element.Section = SectionFilter[0].MasterDataName;
            }
            else
              element.Section = '';
            delete element.SectionId;

            if (element.SemesterId > 0) {
              let SemesterFilter = this.Semesters.filter(g => g.MasterDataId == element.SemesterId);
              if (SemesterFilter.length == 0)
                element.Semester = '';
              else
                element.Semester = SemesterFilter[0].MasterDataName;
            }
            else
              element.Semester = '';
            delete element.SemesterId;

            var clsobj = this.Classes.filter(cls => cls.ClassId == element.ClassId);
            if (clsobj.length > 0)
              element.ClassName = clsobj[0].ClassName;
            else
              element.ClassName = '';
            //element.RollNo = element.RollNo;
            //element.StudentClassId = element.StudentClassId;
            //})
            //delete element.ClassId;
            //}

            /////////////////
            if (element.Student.GenderId > 0) {
              let GenderFilter = this.Genders.filter(g => g.MasterDataId == element.Student.GenderId);
              if (GenderFilter.length == 0)
                element.Gender = '';
              else
                element.Gender = GenderFilter[0].MasterDataName;
            }
            else
              element.Student.Gender = '';
            delete element.Student.GenderId;
            if (element.Student.HouseId > 0) {
              let houseFilter = this.Houses.filter(g => g.MasterDataId == element.Student.HouseId);
              if (houseFilter.length == 0)
                element.House = '';
              else
                element.House = houseFilter[0].MasterDataName;
            }
            else
              element.House = '';
            delete element.Student.HouseId;

            if (element.Student.BloodgroupId > 0) {
              let BloodgroupFilter = this.Bloodgroup.filter(g => g.MasterDataId == element.Student.BloodgroupId);
              if (BloodgroupFilter.length == 0)
                element.Bloodgroup = '';
              else
                element.Bloodgroup = BloodgroupFilter[0].MasterDataName;
            }
            else
              element.Bloodgroup = '';
            delete element.Student.BloodgroupId;



            if (element.Student.CategoryId > 0) {
              let Categoryfilter = this.Category.filter(g => g.MasterDataId == element.Student.CategoryId);
              if (Categoryfilter.length == 0)
                element.Category = '';
              else
                element.Category = Categoryfilter[0].MasterDataName;
            }
            else
              element.Category = '';
            delete element.Student.CategoryId;

            if (element.Student.ReligionId > 0) {
              let ReligionFilter = this.Religion.filter(g => g.MasterDataId == element.Student.ReligionId);
              if (ReligionFilter.length == 0)
                element.Religion = '';
              else
                element.Religion = ReligionFilter[0].MasterDataName;
            }
            else
              element.Religion = '';
            delete element.Student.ReligionId;

            if (element.Student.AdmissionStatusId > 0) {
              let AdmissionStatusFilter = this.AdmissionStatus.filter(g => g.MasterDataId == element.Student.AdmissionStatusId);
              if (AdmissionStatusFilter.length == 0)
                element.AdmissionStatus = '';
              else
                element.AdmissionStatus = AdmissionStatusFilter[0].MasterDataName;
            }
            else
              element.AdmissionStatus = '';
            delete element.AdmissionStatusId;

            if (element.Student.PrimaryContactFatherOrMother > 0) {
              let PrimaryContactFatherOrMotherFilter = this.PrimaryContact.filter(g => g.MasterDataId == element.Student.PrimaryContactFatherOrMother);
              if (PrimaryContactFatherOrMotherFilter.length == 0)
                element.PrimaryContactFatherOrMother = ''
              else
                element.PrimaryContactFatherOrMother = PrimaryContactFatherOrMotherFilter[0].MasterDataName;
            }
            else
              element.PrimaryContactFatherOrMother = '';

            if (element.Student.ClassAdmissionSought > 0) {
              let ClassAdmissionSoughtFilter = this.Classes.filter(g => g.ClassId == element.Student.ClassAdmissionSought);
              if (ClassAdmissionSoughtFilter.length == 0)
                element.ClassAdmissionSought = '';
              else
                element.ClassAdmissionSought = ClassAdmissionSoughtFilter[0].ClassName;
            }
            else
              element.ClassAdmissionSought = '';


            if (element.Student.ClubId > 0) {
              let ClubObj = this.Clubs.filter(g => g.MasterDataId == element.Student.ClubId);
              if (ClubObj.length == 0)
                element.Club = '';
              else
                element.Club = ClubObj[0].MasterDataName;
            }
            else
              element.Club = '';
            delete element.Student.ClubId;

            // if (element.HouseId >0) {
            //   let houseObj = this.Houses.filter(g => g.MasterDataId == element.HouseId);
            //   if (houseObj.length == 0)
            //   element.House ='';
            //   else
            //     element.House = houseObj[0].MasterDataName;
            // }
            // else
            //   element.House = '';

            if (element.Student.RemarkId > 0) {
              let remarkObj = this.Remarks.filter(g => g.MasterDataId == element.Student.RemarkId);
              if (remarkObj.length == 0)
                element.Remarks = '';
              else
                element.Remarks = remarkObj[0].MasterDataName;
            }
            else
              element.RemarkId = '';
            delete element.Student.RemarkId;

            if (element.Student.PermanentAddressCountryId > 0) {
              let CountryObj = this.allMasterData.filter(g => g.MasterDataName.toLowerCase() == element.Student.PermanentAddressCountryId);
              if (CountryObj.length == 0)
                element.PermanentAddressCountry = '';
              else {
                element.PermanentAddressCountry = CountryObj[0].MasterDataName;
                if (element.Student.PermanentAddressStateId > 0) {
                  let stateObj = this.allMasterData.filter(g => g.MasterDataId == element.Student.PermanentAddressStateId
                    && g.ParentId == element.Student.PermanentAddressCountryId);
                  if (stateObj.length == 0)
                    element.PermanentAddressState = '';
                  else {
                    element.PermanentAddressState = stateObj[0].MasterDataName;
                    if (element.Student.PermanentAddressCityId > 0) {
                      let CityObj = this.allMasterData.filter(g => g.MasterDataId == element.Student.PermanentAddressCityId
                        && g.ParentId == element.Student.PermanentAddressStateId);
                      if (CityObj.length == 0)
                        element.PermanentAddressCity = '';
                      else
                        element.PermanentAddressCity = CityObj[0].MasterDataName;
                    }
                    else
                      element.PermanentAddressCity = '';
                  }
                }
                else {
                  element.PermanentAddressState = '';
                  element.PermanentAddressCity = '';
                }
              }
            }
            else {
              element.PermanentAddressCountry = '';
              element.PermanentAddressState = '';
              element.PermanentAddressCity = '';

            }
            delete element.Student.PermanentAddressCountryId;
            delete element.Student.PermanentAddressStateId;
            delete element.Student.PermanentAddressCityId;

            if (element.Student.PresentAddressCountryId > 0) {
              let CountryObj = this.allMasterData.filter(g => g.MasterDataId == element.Student.PresentAddressCountryId);
              if (CountryObj.length == 0)
                element.PresentAddressCountry = '';
              else {
                element.PresentAddressCountry = CountryObj[0].MasterDataName;
                if (element.Student.PresentAddressStateId > 0) {
                  let stateObj = this.allMasterData.filter(g => g.MasterDataId == element.Student.PresentAddressStateId
                    && g.ParentId == element.Student.PresentAddressCountryId);
                  if (stateObj.length == 0)
                    element.PresentAddressState = '';
                  else {
                    element.PresentAddressState = stateObj[0].MasterDataName;
                    if (element.Student.PresentAddressCityId > 0) {
                      let CityObj = this.allMasterData.filter(g => g.MasterDataId == element.Student.PresentAddressCityId
                        && g.ParentId == element.Student.PresentAddressStateId);
                      if (CityObj.length == 0)
                        element.PresentAddressCity = '';
                      else
                        element.PresentAddressCity = CityObj[0].MasterDataName;
                    }
                    else
                      element.PresentAddressCity = '';
                  }
                }
                else {
                  element.PresentAddressState = '';
                  element.PresentAddressCity = '';
                }
              }
            }
            else {
              element.PresentAddressCountry = '';
              element.PresentAddressState = '';
              element.PresentAddressCity = '';
            }
            if (element.Student.AdmissionDate) {
              element.AdmissionDate = moment(element.Student.AdmissionDate).format('DD/MM/YYYY');
            }
            if (element.Student.CreatedDate) {
              element.CreatedDate = moment(element.Student.CreatedDate).format('DD/MM/YYYY');
            }
            if (element.Student.UpdatedDate) {
              element.UpdatedDate = moment(element.Student.UpdatedDate).format('DD/MM/YYYY');
            }
            if (element.Student.DOB) {
              element.DOB = moment(element.Student.DOB).format('DD/MM/YYYY');
            }
            var batch = this.Batches.filter(b => b.BatchId == element.BatchId);
            if (batch.length > 0) {
              element.Batch = batch[0].BatchName;
            }
            Object.keys(element.Student).forEach(o => {
              if (!element[o])
                element[o] = element.Student[o];
            })
            delete element.Student;
            delete element.HouseId;
            delete element.SectionId;
            delete element.ClassId;
            delete element.BatchId;
            delete element.userId;
            delete element.OrgId;
            delete element.SubOrgId;
            delete element.Deleted;
            delete element.FeeTypeId;
            delete element.ReasonForLeavingId;
            delete element.AdmissionStatusId;
            delete element.Remark2Id;
            delete element.SemesterId;

            ///////////////


            return element;
          })
          //this.ELEMENT_DATA.
          ////console.log("this.ELEMENT_DATA", this.ELEMENT_DATA);
          if (this.ELEMENT_DATA.length == 0) {
            this.loading = false;
            this.PageLoading = false;
            this.ELEMENT_DATA = [];
            this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
            return;
          }
        }
        else {
          this.loading = false;
          this.PageLoading = false;
          this.ELEMENT_DATA = [];
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
          return;
        }
        var nottoinclude = ['StudentClasses', 'CreatedBy', 'UpdatedBy', 'StudentFeeTypes']
        Object.keys(this.ELEMENT_DATA[0]).forEach(studproperty => {
          if (!this.displayedColumns.includes(studproperty) && !nottoinclude.includes(studproperty)) {
            this.displayedColumns.push(studproperty);
          }
        })
        this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
        this.dataSource.paginator = this.paginator;
        //this.exportArray();
        this.loading = false;
        this.PageLoading = false;
      });

  }
  GetStudentClasses() {
    //debugger;
    var filterOrgIdNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    filterOrgIdNBatchId += " and IsCurrent eq true";
    let list: List = new List();
    list.fields = ["StudentClassId,StudentId,ClassId,RollNo,SectionId,SemesterId"];
    list.PageName = "StudentClasses";
    list.filter = [filterOrgIdNBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentClasses = [...data.value];
        this.GetStudents();
      })
  }
  GetSibling() {

    var _studentId = localStorage.getItem('studentId');
    var StudentFamilyNFriendListName = 'StudentFamilyNFriends';
    var filterStr = 'Active eq 1 and StudentId eq ' + _studentId;
    let list: List = new List();
    list.fields = [
      'StudentFamilyNFriendId',
      'StudentId',
      'SiblingId',
      'Name',
      'ContactNo',
      'RelationshipId',
      'Active',
      'RemarkId'
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
    this.loading = true;

    var _students: any = this.tokenStorage.getStudents()!;

    this.Students = _students.map(student => {
      var _RollNo = '';
      var _name = '';
      var _className = '';
      var _section = '';
      var _studentClassId = 0;
      var studentclassobj = this.StudentClasses.filter((f: any) => f.StudentId == student.StudentId);
      if (studentclassobj.length > 0) {
        _studentClassId = studentclassobj[0].StudentClassId;
        var _classNameobj = this.Classes.filter(c => c.ClassId == studentclassobj[0].ClassId);

        if (_classNameobj.length > 0)
          _className = _classNameobj[0].ClassName;
        var _SectionObj = this.Sections.filter((f: any) => f.MasterDataId == studentclassobj[0].SectionId)

        if (_SectionObj.length > 0)
          _section = _SectionObj[0].MasterDataName;
        _RollNo = studentclassobj[0].RollNo == null ? '' : studentclassobj[0].RollNo;
      }
      student.PersonalNo = student.PersonalNo == null ? '' : student.PersonalNo;
      var _lastname = student.LastName == null ? '' : " " + student.LastName;
      _name = student.FirstName + _lastname;
      var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo + "-" + student.PersonalNo;
      return {
        StudentClassId: _studentClassId,
        StudentId: student.StudentId,
        Name: _fullDescription,
        FatherName: student.FatherName,
        MotherName: student.MotherName
      }
    })
    this.loading = false;
    this.PageLoading = false;
  }

}
export interface IStudent {
  StudentId: number;
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
  Semester: string;
}


