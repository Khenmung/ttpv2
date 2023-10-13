import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { IStudent } from '../../student/searchstudent/searchstudent.component';

@Component({
  selector: 'app-studentfamilynfriend',
  templateUrl: './studentfamilynfriend.component.html',
  styleUrls: ['./studentfamilynfriend.component.scss']
})
export class StudentfamilynfriendComponent implements OnInit {
  PageLoading = true;

  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  StudentFamilyNFriendListName = 'StudentFamilyNFriends';
  Applications: any[] = [];
  loading = false;
  SelectedBatchId = 0; SubOrgId = 0;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  StudentFamilyNFriendList: IStudentFamilyNFriends[] = [];
  filteredOptions: Observable<IStudentFamilyNFriends[]>;
  dataSource: MatTableDataSource<IStudentFamilyNFriends>;
  dataSourceSiblings: MatTableDataSource<any>;
  allMasterData: any[] = [];
  StudentFamilyNFriends: any[] = [];
  FamilyRelationship: any[] = [];
  Genders: any[] = [];
  Permission = 'deny';
  Classes: any[] = [];
  Sections: any[] = [];
  StudentId = 0;
  Students: any[] = [];
  StudentClasses: any[] = [];
  FeeType: any[] = [];
  filteredStudents: Observable<IStudent[]>;
  filteredSiblings: Observable<IStudent[]>;
  StudentFamilyNFriendData = {
    StudentFamilyNFriendId: 0,
    StudentId: 0,
    ParentStudentId: 0,
    Name: '',
    ContactNo: '',
    RelationshipId: 0,
    Active: 0,
    Deleted: false,
    Remarks: '',
    OrgId: 0, SubOrgId: 0,
  };
  displayedColumns = [
    'SiblingName',
    'ContactNo',
    'RelationshipId',
    'FeeType',
    'FeeTypeRemarks',
    'Remarks',
    'Active',
    'Action'
  ];
  searchForm: UntypedFormGroup;
  filteredFathers: Observable<IStudent[]>;
  filteredMothers: Observable<IStudent[]>;
  UniqueFathers: any[] = [];
  UniqueMothers: any[] = [];
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
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
    //debugger;
    this.searchForm = this.fb.group({
      FatherName: [0],
      MotherName: [0],
      searchContactNo: [''],
      searchStudentName: [''],
      searchSiblings: [''],
      searchRelationshipId: [''],
      searchOtherSiblingorFriend: ['']
    });
    this.filteredStudents = this.searchForm.get("searchStudentName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      )!;
    this.filteredSiblings = this.searchForm.get("searchSiblings")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      )!;
    this.filteredFathers = this.searchForm.get("FatherName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.FatherName),
        map(Name => Name ? this._filterF(Name) : this.Students.slice())
      )!;
    this.filteredMothers = this.searchForm.get("MotherName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.MotherName),
        map(Name => Name ? this._filterM(Name) : this.Students.slice())
      )!;

    this.PageLoad();

  }

  private _filterF(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    //const unique = [...new Set(this.Students.map((item) => item.FatherName))];
    //return unique;
    return this.Students.filter(option => option.FatherName.toLowerCase().includes(filterValue));

  }
  private _filterM(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.MotherName.toLowerCase().includes(filterValue));

  }
  displayFnF(stud: IStudent): string {
    return stud && stud.FatherName ? stud.FatherName : '';
  }
  displayFnM(stud: IStudent): string {
    return stud && stud.MotherName ? stud.MotherName : '';
  }
  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.StudentId = +this.tokenStorage.getStudentId()!;;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SPECIALFEATURE.SIBLINGSNFRIENDS)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.GetFeeTypes();
        this.GetMasterData();

      }
    }
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  displayFnS(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  // filterStates(name: string) {
  //   return name && this.states.filter(
  //     state => state.name.toLowerCase().includes(name?.toLowerCase())
  //   ) || this.states;
  // }
  AddNew() {
    debugger;
    if (this.searchForm.get("searchStudentName")?.value == '') {
      this.loading = false;
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var siblingNamefromOthers = this.searchForm.get("searchOtherSiblingorFriend")?.value;
    if (this.searchForm.get("searchSiblings")?.value == '' && siblingNamefromOthers == '') {
      this.loading = false;
      this.contentservice.openSnackBar("Please select siblings or friend.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    // if (siblingNamefromOthers.length > 0 && this.searchForm.get("searchContactNo")?.value == '') {
    //   this.loading = false;
    //   this.contentservice.openSnackBar("Please enter contact number..", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    var _relationship = 0;
    if (this.searchForm.get("searchRelationshipId")?.value != '') {
      _relationship = this.searchForm.get("searchRelationshipId")?.value;
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select relationship.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    var siblingorfriendName = '';
    if (this.searchForm.get("searchSiblings")?.value.Name == undefined)
      siblingorfriendName = this.searchForm.get("searchOtherSiblingorFriend")?.value;
    else
      siblingorfriendName = this.searchForm.get("searchSiblings")?.value.Name;
    var Id = this.searchForm.get("searchStudentName")?.value.ParentStudentId;
    var _ParentId = 0
    if (Id == 0) {
      _ParentId = this.searchForm.get("searchStudentName")?.value.StudentId;
    }
    else
      _ParentId = Id;

    var newdata = {
      StudentFamilyNFriendId: 0,
      StudentId: this.searchForm.get("searchSiblings")?.value.StudentId,
      ParentStudentId: _ParentId,
      SiblingName: siblingorfriendName,
      Name: this.searchForm.get("searchOtherSiblingorFriend")?.value,
      ContactNo: this.searchForm.get("searchContactNo")?.value,
      RelationshipId: _relationship,
      Remarks: '',
      Active: 0,
      Action: false
    };
    this.StudentFamilyNFriendList = [];
    this.StudentFamilyNFriendList.push(newdata);
    this.dataSource = new MatTableDataSource<IStudentFamilyNFriends>(this.StudentFamilyNFriendList);
  }
  ClearData() {
    this.StudentFamilyNFriendList = [];
    this.dataSource = new MatTableDataSource<IStudentFamilyNFriends>(this.StudentFamilyNFriendList);
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    debugger;
    if (this.searchForm.get("searchStudentName")?.value == '') {
      this.loading = false;
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      this.StudentId = this.searchForm.get("searchStudentName")?.value.StudentId
    }

    this.loading = true;
    if (row.Name.length == 0 && row.SiblingName == '') {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter name or select name.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.RelationshipId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select relationship..", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //var relationship = this.FamilyRelationship.filter((f:any) => f.MasterDataId == row.RelationshipId)[0].MasterDataName;
    // if (relationship.toLowerCase() == 'friend' && row.ContactNo.length == 0) {
    //   this.loading = false; this.PageLoading = false;
    //   this.contentservice.openSnackBar("Please enter friend's contact no..", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }

    let checkFilterString = "";// "StudentFamilyNFriendId eq " + row.StudentFamilyNFriendId
    if (row.StudentId > 0)
      checkFilterString += ' ParentStudentId eq ' + row.ParentStudentId + ' and StudentId eq ' + row.StudentId;
    else if (row.Name.length > 0)
      checkFilterString += " ParentStudentId eq " + row.ParentStudentId + " and Name eq '" + row.Name + "'";

    if (row.StudentFamilyNFriendId > 0)
      checkFilterString += " and StudentFamilyNFriendId ne " + row.StudentFamilyNFriendId;
    let list: List = new List();
    list.fields = ["StudentFamilyNFriendId"];
    list.PageName = this.StudentFamilyNFriendListName;
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
          var studentIdObj = this.Students.filter((s: any) => s.Name == row.SiblingName)
          var _studentId = 0;
          if (studentIdObj.length > 0)
            _studentId = studentIdObj[0].StudentId;

          this.StudentFamilyNFriendData.StudentFamilyNFriendId = row.StudentFamilyNFriendId;
          this.StudentFamilyNFriendData.Active = row.Active;
          this.StudentFamilyNFriendData.ContactNo = row.ContactNo;
          this.StudentFamilyNFriendData.StudentId = row.StudentId;
          this.StudentFamilyNFriendData.RelationshipId = row.RelationshipId;
          this.StudentFamilyNFriendData.ParentStudentId = row.ParentStudentId;
          this.StudentFamilyNFriendData.Name = row.Name;
          this.StudentFamilyNFriendData.Remarks = row.Remarks;
          this.StudentFamilyNFriendData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.StudentFamilyNFriendData.SubOrgId = this.SubOrgId;

          if (this.StudentFamilyNFriendData.StudentFamilyNFriendId == 0) {
            this.StudentFamilyNFriendData["CreatedDate"] = new Date();
            this.StudentFamilyNFriendData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.StudentFamilyNFriendData["UpdatedDate"] = new Date();
            delete this.StudentFamilyNFriendData["UpdatedBy"];

            this.insert(row);
          }
          else {
            delete this.StudentFamilyNFriendData["CreatedDate"];
            delete this.StudentFamilyNFriendData["CreatedBy"];
            this.StudentFamilyNFriendData["UpdatedDate"] = new Date();
            this.StudentFamilyNFriendData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            //console.log('this.StudentFamilyNFriendData', this.StudentFamilyNFriendData)
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.StudentFamilyNFriendListName, this.StudentFamilyNFriendData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.StudentFamilyNFriendId = data.StudentFamilyNFriendId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.StudentFamilyNFriendListName, this.StudentFamilyNFriendData, this.StudentFamilyNFriendData.StudentFamilyNFriendId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetStudentFamilyNFriends() {
    debugger;
    var _ParentStudentId = this.searchForm.get("searchStudentName")?.value.ParentStudentId;
    var _fatherName = this.searchForm.get("FatherName")?.value.FatherName;
    var _motherName = this.searchForm.get("MotherName")?.value.MotherName;
    if (_ParentStudentId == undefined && _fatherName == undefined && _motherName == undefined) {
      this.contentservice.openSnackBar("Please select student or father or mother.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _fatherMotherFilter = "";
    //this.StudentId = _studentId;

    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]['orgId']
    if (_ParentStudentId != undefined && _ParentStudentId > 0)
      filterStr += ' and ParentStudentId eq ' + _ParentStudentId;
    else
      filterStr += ' and ParentStudentId eq ' + this.searchForm.get("searchStudentName")?.value.StudentId;

    if (_fatherName != undefined)
      _fatherMotherFilter += " and FatherName eq '" + _fatherName + "'";
    if (_motherName != undefined)
      _fatherMotherFilter += " and MotherName eq '" + _motherName + "'";
    if (_fatherMotherFilter.length > 0 && _ParentStudentId == undefined) {
      this.GetStudentFromCache();
    }
    else {
      this.dataSourceSiblings = new MatTableDataSource();

      var _RelationshipId = this.searchForm.get("searchRelationshipId")?.value;
      if (_RelationshipId > 0)
        filterStr += ' and RelationshipId eq ' + _RelationshipId;

      this.loading = true;

      let list: List = new List();
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
      list.filter = [filterStr];
      this.StudentFamilyNFriendList = [];
      this.dataservice.get(list)
        .subscribe((data: any) => {
          //debugger;
          if (data.value.length > 0) {
            this.StudentFamilyNFriendList = data.value.map(m => {
              if (m.StudentId > 0) {
                var obj = this.Students.filter((f: any) => f.StudentId == m.StudentId);
                if (obj.length > 0) {
                  m.SiblingName = obj[0].Name;
                  m.FeeType = obj[0].FeeType;
                  m.FeeTypeRemarks = obj[0].Remarks;
                }
              }
              else
                m.SiblingName = m.Name;
              return m;
            });
          }
          if (this.StudentFamilyNFriendList.length == 0) {
            this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          this.dataSource = new MatTableDataSource<IStudentFamilyNFriends>(this.StudentFamilyNFriendList);
          this.loadingFalse();
        });
    }
  }
  siblingsColumns: any[] = [];
  GetStudentFromCache() {
    debugger;
    this.siblingsColumns = ["Name", "FatherName", "MotherName", "ContactNo", "FeeType", "Remarks"]
    this.StudentFamilyNFriendList = [];
    var _fatherName = this.searchForm.get("FatherName")?.value.FatherName;
    var _motherName = this.searchForm.get("MotherName")?.value.MotherName;
    var _students: any = this.tokenStorage.getStudents()!;
    if (_fatherName != undefined && _motherName != undefined)
      _students = _students.filter((f: any) => f.FatherName == _fatherName && f.MotherName == _motherName);
    else if (_motherName != undefined && _fatherName == undefined)
      _students = _students.filter((f: any) => f.MotherName == _motherName);
    else if (_motherName == undefined && _fatherName != undefined)
      _students = _students.filter((f: any) => f.FatherName == _fatherName);
    var result: any[] = [];
    _students.forEach(student => {
      var _RollNo = '';
      var _name = '';
      var _className = '';
      var _section = '';
      var _feeType = '';
      var _remarks = '';
      var _studentClassId = 0;
      //ar studentclassobj = this.StudentClasses.filter((f:any) => f.StudentId == student.StudentId);
      if (student.StudentClasses.length > 0) {
        _studentClassId = student.StudentClasses[0].StudentClassId;

        var feetypeobj = this.FeeType.filter((f: any) => f.FeeTypeId == student.StudentClasses[0].FeeTypeId)
        if (feetypeobj.length > 0)
          _feeType = feetypeobj[0].FeeTypeName;

        _remarks = student.StudentClasses[0].Remarks;
        var _classNameobj = this.Classes.filter(c => c.ClassId == student.StudentClasses[0].ClassId);

        if (_classNameobj.length > 0)
          _className = _classNameobj[0].ClassName;
        var _SectionObj = this.Sections.filter((f: any) => f.MasterDataId == student.StudentClasses[0].SectionId)

        if (_SectionObj.length > 0)
          _section = _SectionObj[0].MasterDataName;

        _RollNo = student.StudentClasses[0].RollNo;
        var _lastname = student.LastName == null || student.LastName == '' ? '' : " " + student.LastName;
        _name = student.FirstName + _lastname;
        var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo// + "-" + student.ContactNo;

        result.push({
          StudentClassId: _studentClassId,
          StudentId: student.StudentId,
          Name: _fullDescription,
          FatherName: student.FatherName,
          MotherName: student.MotherName,
          ContactNo: student.ContactNo,
          FeeType: _feeType,
          Remarks: _remarks
        });
        if (result.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        this.dataSourceSiblings = new MatTableDataSource(result);
        this.loadingFalse();
      }
    });
  }
  GetStudentClasses() {
    debugger;
    var filterOrgIdNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    filterOrgIdNBatchId += " and IsCurrent eq true";
    let list: List = new List();
    list.fields = ["StudentClassId,StudentId,ClassId,RollNo,SectionId,SemesterId,Remarks,FeeTypeId"];
    list.PageName = "StudentClasses";
    list.filter = [filterOrgIdNBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentClasses = [...data.value];
        this.GetStudents();
      })
  }
  GetStudents() {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      // 'StudentId',
      // 'FirstName',
      // 'LastName',
      // 'FatherName',
      // 'MotherName',
      // 'ContactNo',
      // 'FatherContactNo',
      'ParentStudentId',
      //'MotherContactNo'
    ];

    list.PageName = "StudentFamilyNFriends";
    //list.lookupFields = ["StudentFamilyNFriends($select=ParentStudentId)"];

    list.filter = [this.FilterOrgSubOrg];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //if (data.value.length > 0) {
        var _students: any = this.tokenStorage.getStudents()!;
        _students.forEach(student => {
          var _RollNo = '';
          var _name = '';
          var _className = '';
          var _section = '';
          var _feeType = '';
          var _remarks = '';
          var _studentClassId = 0;
          var siblingnfrients = data.value.filter(d => d.StudentId == student.StudentId)
          var studentclassobj = this.StudentClasses.filter((f: any) => f.StudentId == student.StudentId);
          if (studentclassobj.length > 0) {
            _studentClassId = studentclassobj[0].StudentClassId;

            var feetypeobj = this.FeeType.filter((f: any) => f.FeeTypeId == studentclassobj[0].FeeTypeId)
            if (feetypeobj.length > 0)
              _feeType = feetypeobj[0].FeeTypeName;

            _remarks = studentclassobj[0].Remarks;
            var _classNameobj = this.Classes.filter(c => c.ClassId == studentclassobj[0].ClassId);

            if (_classNameobj.length > 0)
              _className = _classNameobj[0].ClassName;
            var _SectionObj = this.Sections.filter((f: any) => f.MasterDataId == studentclassobj[0].SectionId)

            if (_SectionObj.length > 0)
              _section = _SectionObj[0].MasterDataName;

            _RollNo = studentclassobj[0].RollNo;
            var _lastname = student.LastName == null || student.LastName == '' ? '' : " " + student.LastName;
            _name = student.FirstName + _lastname;
            var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo// + "-" + student.ContactNo;
            var _ParentId = siblingnfrients.length > 0 ? siblingnfrients[0].ParentStudentId : 0;
            this.Students.push({
              StudentClassId: _studentClassId,
              StudentId: student.StudentId,
              Name: _fullDescription,
              FatherName: student.FatherName,
              MotherName: student.MotherName,
              ParentStudentId: _ParentId,
              FeeType: _feeType,
              Remarks: _remarks
            });
          }
        })
        this.Students = this.Students.sort((a, b) => a.Name - b.Name);
        //this.UniqueFathers = [...new Set(this.Students.map((item) => item.FatherName))];
        //this.UniqueMothers = [...new Set(this.Students.map((item) => item.MotherName))];

        //}
        this.loading = false; this.PageLoading = false;
      })
  }
  GetFeeTypes() {
    debugger;
    this.loading = true;
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
    list.PageName = "SchoolFeeTypes";
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeType = [...data.value];
        this.loading = false; this.PageLoading = false;
      })
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.FamilyRelationship = this.getDropDownData(globalconstants.MasterDefinitions.school.SIBLINGSNFRIENDSRELATIONSHIP);
    this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      this.Classes = [...data.value];
      this.Classes = this.Classes.sort((a, b) => a.Sequence - b.Sequence);
      this.GetStudentClasses();
    });

    this.loading = false; this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
    // let Id = 0;
    // let Ids = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    // })
    // if (Ids.length > 0) {
    //   Id = Ids[0].MasterDataId;
    //   return this.allMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   })
    // }
    // else
    //   return [];

  }
}
export interface IStudentFamilyNFriends {
  StudentFamilyNFriendId: number;
  StudentId: number;
  ParentStudentId: number;
  Name: string;
  ContactNo: string;
  RelationshipId: number;
  Active: number;
  Remarks: string;
  Action: boolean;
}
export interface IApplication {
  ApplicationId: number;
  ApplicationName: string;
}
export interface IStudents {
  StudentId: number;
  FirstName: string;
  LastName: string;
  ContactNo: string;
  FatherName: string;
  MotherName: string;
}

