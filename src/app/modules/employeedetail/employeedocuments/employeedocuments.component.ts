import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { FileUploadService } from '../../../shared/upload.service';
import { TokenStorageService } from '../../../_services/token-storage.service';

@Component({
  selector: 'app-employeedocuments',
  templateUrl: './employeedocuments.component.html',
  styleUrls: ['./employeedocuments.component.scss']
})
export class EmployeedocumentsComponent implements OnInit {
  PageLoading = true;
  loading = false;
  SelectedApplicationId = 0;
  Permission = '';
  FilterOrgSubOrgIdBatchId = '';
  FilterOrgSubOrgIdOnly = '';
  formdata: FormData;
  selectedFile: any;
  EmployeeId: number = 0;
  SubOrgId: number = 0;
  StudentDocuments: any[] = [];
  Edit: boolean;
  SelectedBatchId = 0;
  allMasterData: any[] = [];
  DocumentTypes: any[] = [];
  Batches: any[] = [];
  LoginUserDetail: any[] = [];
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
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private fileUploadService: FileUploadService,
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
      searchDocTypeId: [0, Validators.required]
    })
    debugger;
    this.EmployeeId = this.tokenStorage.getEmployeeId()!;
    this.SubOrgId = +this.tokenStorage.getSubOrgId()!;

    if (this.EmployeeId == 0) {

      this.contentservice.openSnackBar("Please define employee first.", globalconstants.ActionText, globalconstants.RedBackground);
      //this.nav.navigate(['/employee/info']);
    }
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.emp.employee.DOCUMENT);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        //this.StudentId = this.tokenStorage.getStudentId()!;;
        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
        this.LoginUserDetail = this.tokenStorage.getUserDetail();
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
        this.FilterOrgSubOrgIdBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.FilterOrgSubOrgIdOnly = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.PageLoad();
      }
    }
  }
  PageLoad() {
    this.GetMasterData();

  }
  get f() {
    return this.uploadForm.controls;
  }
  uploadchange(files) {
    if (files.length === 0)
      return;
    this.selectedFile = files[0];
    if (this.selectedFile) {
      var mimeType = this.selectedFile.type;
      //if (mimeType.match(/image\/*/) == null) {
      var extensions = ["image/png", "image/jpg", "image/jpeg", "image/gif", "text/plain", "application/vnd.ms-excel", "application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      if (extensions.indexOf(mimeType) == -1) {
        this.contentservice.openSnackBar("The file type is not supported.", globalconstants.ActionText, globalconstants.RedBackground);
        this.selectedFile = undefined;
        return;
      }
      if (this.selectedFile.size > 1000000) {
        this.loading = false; this.PageLoading = false;
        this.selectedFile = [];
        this.contentservice.openSnackBar("File size should be less than 1mb", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }

    }
    else
      this.selectedFile = [];
  }
  uploadFile() {

    if (this.selectedFile.length == 0) {
      this.contentservice.openSnackBar('Please select a file!', globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.uploadForm.get("DocTypeId")?.value == 0) {
      this.contentservice.openSnackBar('Please select document type!', globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //this.selectedFile = files[0];


    debugger;
    let error: boolean = false;
    this.formdata = new FormData();
    this.formdata.append("batchId", this.SelectedBatchId.toString());
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "EmployeeDocuments/" + this.SelectedBatchId.toString());
    this.formdata.append("parentId", "-1");
    this.formdata.append("description", "");
    this.formdata.append("orgName", this.LoginUserDetail[0]["org"]);
    this.formdata.append("orgId", this.LoginUserDetail[0]["orgId"]);
    this.formdata.append("subOrgId", this.SubOrgId + "");
    this.formdata.append("pageId", "0");
    this.formdata.append("studentId", "0");
    this.formdata.append("employeeId", this.EmployeeId.toString());
    this.formdata.append("docTypeId", this.uploadForm.get("DocTypeId")?.value);
    this.formdata.append("image", this.selectedFile, this.selectedFile.name);
    this.uploadImage();

  }
  uploadImage() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.fileUploadService.postFiles(this.formdata).subscribe(res => {
      this.contentservice.openSnackBar("File uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
      this.Edit = false;
    });
  }
  GetDocuments() {

    let _docTypeId = this.uploadForm.get("searchDocTypeId")?.value;
    let filterstr = this.FilterOrgSubOrgIdOnly;
    filterstr += " and EmployeeId eq " + this.EmployeeId
    if (_docTypeId > 0) {
      filterstr += " and DocTypeId eq " + _docTypeId
    }

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
                path: globalconstants.apiUrl + "/Uploads/" + this.LoginUserDetail[0]["org"] + "/EmployeeDocuments/" + doc.FileName
              });
            }
          })
          this.documentUploadSource = new MatTableDataSource<IUploadDoc>(this.StudentDocuments);
          //////console.log("studentdocuments",this.StudentDocuments)
        }
      });

  }
  pageview(path) {
    window.open(path, "_blank");
    return;
  }
  GetMasterData() {
  //   this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SubOrgId, this.SelectedApplicationId)
  //     .subscribe((data: any) => {
        this.allMasterData =this.tokenStorage.getMasterData()!;// [...data.value];
        this.DocumentTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.DOCUMENTTYPE);
        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.school.BATCH);
        //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.Batches = this.tokenStorage.getBatches()!;;
       // this.GetDocuments();
    //  });

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
