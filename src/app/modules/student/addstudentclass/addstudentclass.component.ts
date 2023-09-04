import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ContentService } from '../../../shared/content.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-addstudentclass',
  templateUrl: './addstudentclass.component.html',
  styleUrls: ['./addstudentclass.component.scss']
})
export class AddstudentclassComponent implements OnInit {
  PageLoading = true;
  loading = false;
  breakpoint = 0;
  Defaultvalue = 0;
  SaveDisable = false;
  StudentId = 0;
  StudentClassId = 0;
  CurrentClassId = 0;
  SelectedBatchId = 0; SubOrgId = 0;
  FilterOrgSubOrgBatchId = '';
  filterOrgSubOrg = '';
  invalidId = false;
  allMasterData: any[] = [];
  //Students: any[] = [];
  Classes: any[] = [];
  Houses: any[] = [];
  Sections: any[] = [];
  FeeType: any[] = [];
  dataSource: MatTableDataSource<any>;
  Semesters: any[] = [];
  NewItem = false;
  //studentclassForm: UntypedFormGroup;
  StudentName = '';
  SelectedApplicationId = 0;
  LoginUserDetail: any[] = [];
  FeeCategories: any[] = [];
  FeeTypePermission = '';
  studentclassData = {
    StudentClassId: 0,
    StudentId: 0,
    ClassId: 0,
    SectionId: 0,
    RollNo: '',
    BatchId: 0,
    FeeTypeId: 0,
    SemesterId: 0,
    AdmissionNo: '',
    AdmissionDate: new Date(),
    Remarks: '',
    IsCurrent: false,
    Promoted: 0,
    Active: 1,
    OrgId: 0,
    SubOrgId: 0
  }
  displayedColumns = [
    "StudentClassId",
    "ClassId",
    "SectionId",
    "SemesterId",
    "RollNo",
    "AdmissionDate",
    "Remarks",
    "FeeTypeId",
    "IsCurrent",
    "Active",
    "Action"
  ]
  Permission = '';
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private aRoute: ActivatedRoute,
    private nav: Router,
    private fb: UntypedFormBuilder,
    private shareddata: SharedataService) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 3;
    //var today = new Date();
    // this.studentclassForm = this.fb.group({
    //   AdmissionNo: [''],
    //   StudentName: [{ value: this.StudentName, disabled: true }],
    //   ClassId: [0, [Validators.required]],
    //   SemesterId: [0],
    //   SectionId: [0],
    //   RollNo: [''],
    //   FeeTypeId: [0],
    //   Remarks: [''],
    //   AdmissionDate: [today],
    //   Active: [1],
    // });
    this.PageLoad();
  }
  PageLoad() {
    debugger;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail.length == 0)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.STUDENTCLASS);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission == 'deny') {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {

        var feetypePer = globalconstants.getPermission(this.tokenStorage, globalconstants.FeaturePermission.FeeTypeDD);
        if (feetypePer.length > 0) {
          this.FeeTypePermission = feetypePer[0].permission;
        }


        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);


        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;

        this.shareddata.CurrentFeeType.subscribe(t => this.FeeType = t);
        //if (this.FeeType.length == 0)
        this.GetFeeTypes();
        this.shareddata.CurrentSection.subscribe(t => this.Sections = t);
        this.shareddata.CurrentHouse.subscribe(t => this.Houses = t);
        this.StudentId = this.tokenStorage.getStudentId()!;;
        this.StudentClassId = this.tokenStorage.getStudentClassId()!;
        this.shareddata.CurrentStudentName.subscribe(name => this.StudentName = name);
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;

        this.GetMasterData();
        //this.GetStudentClass();
      }
    }
  }
  //get f() { return this.studentclassForm.controls }
  ClassCategory: any[] = [];
  GetMasterData() {
    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
    this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
    this.Semesters = this.getDropDownData(globalconstants.MasterDefinitions.school.SEMESTER);
    this.ClassCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSCATEGORY);
    this.contentservice.GetClasses(this.filterOrgSubOrg).subscribe((data: any) => {
      this.Classes = data.value.map(m => {
        m.Category = '';
        var obj = this.ClassCategory.filter((f: any) => f.MasterDataId == m.CategoryId)
        if (obj.length > 0)
          m.Category = obj[0].MasterDataName.toLowerCase();
        return m;
      })
    });
    this.aRoute.paramMap.subscribe(param => {
      this.GetStudentClass();
    })
  }
  StudentChange(event) {
    if (this.StudentId == event.value) {
      this.SaveDisable = false;
    }
    else
      this.SaveDisable = true;

    //this.Id = event.value;
    this.GetStudentClass();

  }
  GetFeeTypes() {
    debugger;
    this.loading = true;
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula", "Confidential"];
    list.PageName = "SchoolFeeTypes";
    list.filter = [this.filterOrgSubOrg + " and Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        // this.FeeType = [...data.value];
        this.FeeType = this.getDropDownDataFeeType(data.value);
        // if (this.FeeTypePermission.length > 0 && !this.FeeTypePermission.includes("rw"))
        //   this.studentclassForm.get("FeeTypeId").disable();
        this.shareddata.ChangeFeeType(this.FeeType);
        this.loading = false; this.PageLoading = false;
      })
  }
  StudentClassList: any[] = [];
  addnew() {
    this.NewItem = true;
    this.StudentClassList = [];
    var newitem = {
      StudentClassId: 0,
      ClassId: this.CurrentClassId,
      SectionId: 0,
      RollNo: '',
      FeeTypeId: 0,
      FeeType: '',
      SemesterId: 0,
      AdmissionNo: '',
      AdmissionDate: new Date(),
      Remarks: '',
      Promoted: 0,
      IsCurrent: false,
      Active: 1,
    }
    this.StudentClassList.push(newitem);
    this.dataSource = new MatTableDataSource<any>(this.StudentClassList);
  }

  GetStudentClass() {
    debugger;
    this.NewItem = false;
    if (this.StudentId > 0 && this.StudentClassId > 0) {
      let filterWithOrgAndBatchId = ''
      if (this.SelectedClassCategory == globalconstants.CategoryCollege)
        filterWithOrgAndBatchId = this.filterOrgSubOrg + " and BatchId le " + this.SelectedBatchId;
      else
        filterWithOrgAndBatchId = this.filterOrgSubOrg + " and BatchId eq " + this.SelectedBatchId;
      let list: List = new List();
      list.fields = [
        "StudentClassId", "ClassId",
        "StudentId", "RollNo", "SectionId", "AdmissionNo", "SemesterId",
        "BatchId", "FeeTypeId", "IsCurrent",
        "AdmissionDate", "Remarks", "Active"];
      list.PageName = "StudentClasses";
      list.filter = [filterWithOrgAndBatchId + " and StudentId eq " + this.StudentId]// + " and IsCurrent eq true"];

      this.dataservice.get(list)
        .subscribe((data: any) => {
          if (data.value.length > 0) {
            var studentcls = data.value.map(m => {
              var admissiondate = moment(m.AdmissionDate).isBefore("1970-01-01");
              m.AdmissionDate = admissiondate ? moment() : data.value[0].AdmissionDate;

              let obj = this.FeeType.filter(f => f.FeeTypeId == m.FeeTypeId);
              if (obj.length > 0)
                m.FeeType = obj[0].FeeTypeName;
              m.Action = false;
              return m;
            });
            studentcls = studentcls.sort((a, b) => b.StudentClassId - a.StudentClassId);
            if (studentcls[0].ClassId > 0) {
              this.CurrentClassId = studentcls[0].ClassId;
              let obj = this.Classes.filter((f: any) => f.ClassId == studentcls[0].ClassId);
              if (obj.length > 0)
                this.SelectedClassCategory = obj[0].Category.toLowerCase();
            }
            this.dataSource = new MatTableDataSource<any>(studentcls);
          }
          else {
            this.contentservice.openSnackBar("Class yet to be defined for this student", globalconstants.ActionText, globalconstants.RedBackground);
          }
          this.loading = false;
          this.PageLoading = false;
        });
    }
    else {
      this.loading = false;
      this.PageLoading = false;
    }
  }
  enableAction(element) {
    element.Action = true;
    let obj = this.FeeType.filter(f => f.FeeTypeId == element.FeeTypeId);
    if (obj.length > 0) {
      element.FeeType = obj[0].FeeTypeName;
    }

  }
  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 3;
  }
  back() {
    this.nav.navigate(['/edu']);
  }
  UpdateOrSave(row) {
    debugger;
    let ErrorMessage = '';

    if (row.ClassId == 0) {
      ErrorMessage += "Please select class.<br>";
    }
    // if (this.studentclassForm.get("RollNo")?.value == null) {
    //   ErrorMessage += "Roll no. is required.<br>";
    // }
    // if (this.studentclassForm.get("SectionId")?.value == 0) {
    //   ErrorMessage += "Please select Section.<br>";
    // }
    if (row.FeeTypeId == 0) {
      ErrorMessage += "Please select Fee Type.<br>";
    }
    if (row.AdmissionDate == 0) {
      ErrorMessage += "Admission date is required.<br>";
    }
    if (ErrorMessage.length > 0) {
      this.contentservice.openSnackBar(ErrorMessage, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      //var _classId = this.studentclassForm.get("ClassId")?.value;
      var ClassStrength = 0;
      if (row.ClassId > 0) {
        this.contentservice.GetStudentClassCount(this.filterOrgSubOrg, row.ClassId, 0, 0, this.SelectedBatchId)
          .subscribe((data: any) => {
            ClassStrength = data.value.length;
            ClassStrength += 1;
            var _batchName = this.tokenStorage.getSelectedBatchName()!;
            var _admissionNo = row.AdmissionNo;
            var _year = _batchName.split('-')[0].trim();
            this.loading = true;
            this.studentclassData.Active = row.Active ? 1 : 0;
            this.studentclassData.BatchId = this.SelectedBatchId;
            this.studentclassData.ClassId = row.ClassId;
            this.studentclassData.RollNo = row.RollNo;
            this.studentclassData.SectionId = row.SectionId;
            this.studentclassData.SemesterId = !row.SemesterId ? 0 : row.SemesterId;
            this.studentclassData.FeeTypeId = row.FeeTypeId;
            this.studentclassData.AdmissionNo = _admissionNo;// ?_year + ClassStrength : _admissionNo;
            this.studentclassData.Remarks = row.Remarks;
            this.studentclassData.AdmissionDate = row.AdmissionDate;
            this.studentclassData.OrgId = this.LoginUserDetail[0]["orgId"];
            this.studentclassData.SubOrgId = this.SubOrgId;
            this.studentclassData.StudentId = this.StudentId;
            this.studentclassData.StudentClassId = row.StudentClassId;
            this.studentclassData.IsCurrent = row.IsCurrent;
            console.log("this.studentclassData", this.studentclassData)
            if (this.studentclassData.StudentClassId == 0) {
              this.StudentClassId = 0;
              this.studentclassData.AdmissionNo = _year + ClassStrength;
              this.insert(row);
            }
            else {
              this.update(row);
            }
          })
      }
    }
  }
  updateIsCurrent(row, element) {
    row.IsCurrent = element.checked;
    row.Action = true;
  }
  updateActive(row, element) {
    row.Active = element.checked;
    row.Action = true;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch('StudentClasses', this.studentclassData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.loading = false; this.PageLoading = false;
          this.StudentClassId = data.StudentClassId;
          row.AdmissionNo = this.studentclassData.AdmissionNo;
          this.studentclassData.StudentClassId = this.StudentClassId;

          this.tokenStorage.saveStudentClassId(this.StudentClassId + "")
          let _Students: any = this.tokenStorage.getStudents()!;
          let temp = _Students.filter(s => s.StudentId == this.studentclassData.StudentId);
          if (temp.length > 0) {
            temp[0].StudentClasses.push(this.studentclassData);
            this.tokenStorage.saveStudents(_Students);
          }
          this.CreateInvoice(row);
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }, error => {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.formatError(error), globalconstants.ActionText, globalconstants.RedBackground);
        });

  }
  update(row) {

    this.dataservice.postPatch('StudentClasses', this.studentclassData, this.studentclassData.StudentClassId, 'patch')
      .subscribe((data: any) => {
        this.CreateInvoice(row);
        row.AdmissionNo = this.studentclassData.AdmissionNo;
        row.Action = false;
        let _Students: any = this.tokenStorage.getStudents()!;
        let temp = _Students.filter(s => s.StudentId == this.studentclassData.StudentId);
        if (temp.length > 0) {
          let studcls = temp[0].StudentClasses.filter(c => c.StudentClassId == this.studentclassData.StudentClassId)
          if (studcls.length > 0) {
            studcls[0].Active = this.studentclassData.Active;
            studcls[0].RollNo = this.studentclassData.RollNo;
            studcls[0].SectionId = this.studentclassData.SectionId;
            studcls[0].SemesterId = this.studentclassData.SemesterId;
            studcls[0].FeeTypeId = this.studentclassData.FeeTypeId;
            studcls[0].Remarks = this.studentclassData.Remarks;
            studcls[0].AdmissionDate = this.studentclassData.AdmissionDate;
            studcls[0].IsCurrent = this.studentclassData.IsCurrent;
            this.tokenStorage.saveStudents(_Students);
          }
        }
      }, error => {
        var msg = globalconstants.formatError(error);
        this.contentservice.openSnackBar(msg, globalconstants.ActionText, globalconstants.RedBackground);
        this.loading = false;
      });
  }
  CreateInvoice(row) {
    debugger;
    this.loading = true;
    this.contentservice.GetClassFeeWithFeeDefinition(this.FilterOrgSubOrgBatchId, 0, row.ClassId)//, row.SemesterId, row.SectionId)
      .subscribe((datacls: any) => {

        // var _clsfeeWithDefinitions = datacls.value.filter(m => m.FeeDefinition.Active == 1);
        var objClassFee = datacls.value.filter(def => def.FeeDefinition.Active == 1 
          && def.ClassId == row.ClassId
          && def.SemesterId == row.SemesterId
          && def.SectionId == row.SectionId);
        if (objClassFee.length == 0) {
          objClassFee = datacls.value.filter(def => def.FeeDefinition.Active == 1 && def.ClassId == row.ClassId);
        }
        this.contentservice.getStudentClassWithFeeType(this.FilterOrgSubOrgBatchId, row.ClassId, row.SemesterId, row.SectionId, this.StudentClassId, 0)
          .subscribe((data: any) => {
            var studentfeedetail: any[] = [];
            data.value.forEach(studcls => {
              var _feeName = '';

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
                    ClassId: studcls.ClassId,
                    SectionId: studcls.SectionId,
                    SemesterId: studcls.SemesterId,
                    RollNo: studcls.RollNo
                  });
                }

              })
            })
            // console.log("studentfeedetailxxxx",studentfeedetail)
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
  getCollegeCategory() {
    return globalconstants.CategoryCollege;
  }
  getHighSchoolCategory() {
    return globalconstants.CategoryHighSchool;
  }
  SelectedClassCategory = '';
  SetClassCategory(row) {
    debugger;
    this.SelectedClassCategory = '';
    if (row.ClassId > 0) {
      let obj = this.Classes.filter((f: any) => f.ClassId == row.ClassId);
      if (obj.length > 0)
        this.SelectedClassCategory = obj[0].Category.toLowerCase();
    }
    // if (this.SelectedClassCategory == globalconstants.CategoryCollege) {
    //   this.displayedColumns = [
    //     "StudentClassId",
    //     "ClassId",
    //     "SemesterId",
    //     "RollNo",        
    //     "AdmissionDate",
    //     "FeeTypeId",
    //     "IsCurrent",
    //     "Remarks",
    //     "Active",
    //     "Action"
    //   ]
    // }
    // else if (this.SelectedClassCategory == globalconstants.CategoryHighSchool) {
    //   this.displayedColumns = [
    //     "StudentClassId",
    //     "ClassId",
    //     "SectionId",
    //     "RollNo",       
    //     "AdmissionDate",
    //     "FeeTypeId",
    //     "IsCurrent",
    //     "Remarks",
    //     "Active",
    //     "Action"
    //   ]
    // }
    row.SectionId = 0;
    row.SemesterId = 0;
  }
  getDropDownDataFeeType(feeType) {
    return this.contentservice.getDropDownDataFeeType(this.tokenStorage, feeType);
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
}
