import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ContentService } from '../../../shared/content.service';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { environment } from '../../../../environments/environment';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { FileUploadService } from '../../../shared/upload.service';
import { IStudent } from '../StudentActivity/studentactivity.component';
import { ConfirmDialogComponent } from '../../../shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'upload-student-document',
  templateUrl: './uploadstudentdoc.component.html',
  styleUrls: ['./uploadstudentdoc.component.scss']
})
export class StudentDocumentComponent implements OnInit {
  PageLoading = true;
  loading = false;
  filteredStudents: Observable<IStudent[]>;
  Permission = '';
  FilterOrgnBatchId = '';
  FilterOrgIdOnly = '';
  formdata: FormData;
  selectedFile: any;
  StudentId: number = 0;
  SelectedApplicationId = 0;
  StudentClassId: number = 0;
  StudentDocuments: any[] = [];
  Edit: boolean;
  SelectedBatchId = 0; SubOrgId = 0;
  allMasterData: any[] = [];
  DocumentTypes: any[] = [];
  Batches: any[] = [];
  LoginUserDetail: any[] = [];
  Students: any[] = [];
  StudentClasses: any[] = [];
  Classes: any[] = [];
  Sections: any[] = [];
  EnableUploadButton = false;
  uploadForm: UntypedFormGroup;
  public files: NgxFileDropEntry[] = [];
  UploadDisplayedColumns = [
    //"FileId",
    "UpdatedFileFolderName",
    "DocType",
    "UploadDate",
    "Action"
  ]
  documentUploadSource: MatTableDataSource<IUploadDoc>;
  constructor(
    private servicework: SwUpdate,
    private contentservice: ContentService,
    private fileUploadService: FileUploadService,
    private dialog: MatDialog,
    private dataservice: NaomitsuService,
    private fb: UntypedFormBuilder,
    private tokenStorage: TokenStorageService,

  ) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.uploadForm = this.fb.group({
      searchStudentName: [''],
      BatchId: [0],
      DocTypeId: [0, Validators.required]
    })
    this.filteredStudents = this.uploadForm.get("searchStudentName")?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      )!;
    debugger;
    //this.StudentClassId = this.tokenStorage.getStudentClassId()!;

    // if (this.StudentClassId == 0) {
    //   this.contentservice.openSnackBar("Student Class Id not found.",globalconstants.ActionText,globalconstants.RedBackground);
    //   // setTimeout(() => {
    //   //   this.nav.navigate(['/edu']);  
    //   // }, 2000);      
    // }
    // else {
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SPECIALFEATURE.DOCUMENT);
    if (perObj.length > 0)
      this.Permission = perObj[0].permission;
    if (this.Permission != 'deny') {
      this.StudentId = this.tokenStorage.getStudentId()!;;
      this.LoginUserDetail = this.tokenStorage.getUserDetail();
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
      this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      this.FilterOrgnBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
      this.FilterOrgIdOnly = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
      this.PageLoad();
    }
    //}
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  PageLoad() {
    var filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
    this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
      if(data.value) this.Classes = [...data.value]; else this.Classes = [...data];
      this.Classes = this.Classes.sort((a,b)=>a.Sequence - b.Sequence);
      this.GetMasterData();
    });

  }
  enableUpload(event) {
    if (event.value > 0) {
      this.EnableUploadButton = true;
    }
  }
  get f() {
    return this.uploadForm.controls;
  }
  uploadchange(files) {
    if (files.length === 0)
      return;
    debugger;
    this.selectedFile = files[0];
    var allowedFiles = ["image/jpeg", "image/gif", "image/jpg", "image/png", "text/plain", "application/vnd.ms-excel", "application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    //var regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedFiles.join('|') + ")$");
    var mimeType = files[0].type;
    //if (mimeType.match(/image\/*/) == null) {
    //  if (!regex.test(mimeType.toLowerCase())) {
    if (allowedFiles.indexOf(mimeType) == -1) {
      this.contentservice.openSnackBar("The file type is not supported.", globalconstants.ActionText, globalconstants.RedBackground);
      this.selectedFile = undefined;
      return;
    }
    if (this.selectedFile.size > 1000000) {
      this.loading = false; this.PageLoading = false;
      this.selectedFile = undefined;
      this.contentservice.openSnackBar("File size should be less than 1mb", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
  }
  uploadFile() {

    if (this.uploadForm.get("searchStudentName")?.value == '') {
      this.loading = false;
      this.contentservice.openSnackBar('Please select student!', globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.selectedFile.length == 0) {
      this.contentservice.openSnackBar('Please select a file!', globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.uploadForm.get("DocTypeId")?.value == 0) {
      this.contentservice.openSnackBar("Please select document type!", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    debugger;
    let error: boolean = false;
    this.loading = true;
    this.StudentId = this.uploadForm.get("searchStudentName")?.value.StudentId;
    this.StudentClassId = this.uploadForm.get("searchStudentName")?.value.StudentClassId;
    if (this.selectedFile) {
      this.formdata = new FormData();
      this.formdata.append("batchId", this.SelectedBatchId.toString());
      this.formdata.append("fileOrPhoto", "0");
      this.formdata.append("folderName", "StudentDocuments/" + this.SelectedBatchId.toString());
      this.formdata.append("parentId", "-1");
      this.formdata.append("description", "StudentDocuments");
      this.formdata.append("categoryId", "0");
      this.formdata.append("orgName", this.LoginUserDetail[0]["org"]);
      this.formdata.append("orgId", this.LoginUserDetail[0]["orgId"]);
      this.formdata.append("subOrgId", this.SubOrgId + "");
      this.formdata.append("pageId", "0");

      if (this.StudentId != null && this.StudentId != 0)
        this.formdata.append("studentId", this.StudentId + "");
      this.formdata.append("studentClassId", this.StudentClassId.toString());
      this.formdata.append("docTypeId", this.uploadForm.get("DocTypeId")?.value);
      //////console.log('this.uploadForm.get("DocTypeId")?.value")',this.uploadForm.get("DocTypeId")?.value);
      this.formdata.append("image", this.selectedFile, this.selectedFile.name);
      this.uploadImage();
    }
  }
  uploadImage() {

    //this.formData.append("Image", <File>base64ToFile(this.croppedImage),this.fileName);
    this.fileUploadService.postFiles(this.formdata).subscribe(res => {
      this.loading = false;
      this.contentservice.openSnackBar("File uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
      this.Edit = false;
    });
  }
  GetDocuments() {
    debugger;
    let filterstr = this.FilterOrgnBatchId;

    var _docTypeId = this.uploadForm.get("DocTypeId")?.value;
    if (_docTypeId == 0) {
      this.contentservice.openSnackBar("Please select document type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    var _studentClassId = this.uploadForm.get("searchStudentName")?.value.StudentClassId;
    if (_studentClassId == 0) {
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    filterstr += " and StudentClassId eq " + _studentClassId;
    filterstr += " and DocTypeId eq " + _docTypeId;

    let list: List = new List();
    this.StudentDocuments = [];
    list.fields = [
      "FileId",
      "FileName",
      "UpdatedFileFolderName",
      "UploadDate",
      "DocTypeId"];
    list.PageName = "StorageFnPs";
    list.filter = [filterstr + " and Active eq 1"];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          var _doctypeobj;
          var _doctypeName = "";

          data.value.forEach(doc => {
            _doctypeobj = this.DocumentTypes.filter(t => t.MasterDataId == doc.DocTypeId);
            if (_doctypeobj.length > 0) {
              _doctypeName = _doctypeobj[0].MasterDataName;
              this.StudentDocuments.push({
                FileId: doc.FileId,
                UpdatedFileFolderName: doc.UpdatedFileFolderName,
                UploadDate: doc.UploadDate,
                DocType: _doctypeName,
                path: globalconstants.apiUrl + "/Uploads/" + this.LoginUserDetail[0]["org"] + "/StudentDocuments/" + this.SelectedBatchId.toString() + "/" + doc.FileName
              });
            }
          })

          //////console.log("studentdocuments",this.StudentDocuments)
        }
        if (this.StudentDocuments.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        this.documentUploadSource = new MatTableDataSource<IUploadDoc>(this.StudentDocuments);
      });

  }
  softDelete(row) {

    this.openDialog(row)
  }
  openDialog(row) {
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
        debugger;
        if (confirmed) {
          this.UpdateAsDeleted(row);
        }
      });
  }

  UpdateAsDeleted(row) {
    debugger;
    let toUpdate = {
      FileId: row.FileId,
      Active: 0,
      Deleted: true
      //UpdatedDate: new Date()
    }
    //console.log("toupdate", toUpdate)
    this.dataservice.postPatch('StorageFnPs', toUpdate, row.FileId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.StudentDocuments.findIndex(x => x.FileId == row.FileId)
        this.StudentDocuments.splice(idx, 1);
        this.documentUploadSource = new MatTableDataSource<any>(this.StudentDocuments);
        this.documentUploadSource.filterPredicate = this.createFilter();
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.MasterDataName.toLowerCase().indexOf(searchTerms.MasterDataName) !== -1
    }
    return filterFunction;
  }
  ClearData() {
    this.StudentDocuments = [];
    this.documentUploadSource = new MatTableDataSource<IUploadDoc>(this.StudentDocuments);
  }
  pageview(path) {
    window.open(path, "_blank");
    return;
  }
  GetMasterData() {
    debugger;
    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.DocumentTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTDOCUMENTTYPE);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Batches = this.tokenStorage.getBatches()!;;
    this.GetStudentClasses();

  }
  GetStudentClasses() {
    //debugger;
    var filterOrgIdNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
    //filterOrgIdNBatchId += " and IsCurrent eq true";
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
  GetStudents() {
    this.loading = true;
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
    //debugger;
    //this.Students = [...data.value];
    //  ////console.log('data.value', data.value);
    var _students = this.tokenStorage.getStudents()!;
    if (_students.length > 0) {

      //var _students = [...data.value];
      _students.map(student => {
        var _RollNo = '';
        var _name = '';
        var _className = '';
        var _section = '';
        var _studentClassId = 0;
        var studentclassobj = this.StudentClasses.filter((f: any) => f.StudentId == student["StudentId"]);
        if (studentclassobj.length > 0) {
          _studentClassId = studentclassobj[0].StudentClassId;
          var _classNameobj = this.Classes.filter(c => c.ClassId == studentclassobj[0].ClassId);

          if (_classNameobj.length > 0)
            _className = _classNameobj[0].ClassName;
          var _SectionObj = this.Sections.filter((f: any) => f.MasterDataId == studentclassobj[0].SectionId)

          if (_SectionObj.length > 0)
            _section = _SectionObj[0].MasterDataName;
          _RollNo = studentclassobj[0].RollNo == null ? '' : studentclassobj[0].RollNo;

          //student["ContactNo"] = student["ContactNo"] == null ? '' : student["ContactNo"];
          var _lastname = student["LastName"] == null || student["LastName"] == '' ? '' : " " + student["LastName"];
          _name = student["FirstName"] + _lastname;
          var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo;
          this.Students.push({
            StudentClassId: _studentClassId,
            StudentId: student["StudentId"],
            Name: _fullDescription,
            FatherName: student["FatherName"],
            MotherName: student["MotherName"]
          })
        }
      })
    }
    this.loading = false;
    this.PageLoading = false;
    //})
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
export interface IUploadDoc {
  FileId: number;
  UpdatedFileFolderName: string;
  UploadDate: Date;
  DocType: string;
  Active: boolean
}