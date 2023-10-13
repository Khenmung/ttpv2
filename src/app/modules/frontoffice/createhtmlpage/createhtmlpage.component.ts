import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from '../../../shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';
import { FileUploadService } from '../../../shared/upload.service';

@Component({
  selector: 'app-createhtmlpage',
  templateUrl: './createhtmlpage.component.html',
  styleUrls: ['./createhtmlpage.component.scss']
})
export class CreatehtmlpageComponent implements OnInit {

  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );

  }

  public config = {
    placeholder: 'Type the content here!',
    toolbar: {
      items: [
        'exportPDF', 'exportWord', '|',
        'findAndReplace', 'selectAll', '|',
        'heading', '|',
        'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'removeFormat', '|',
        'bulletedList', 'numberedList', 'todoList', '|',
        'outdent', 'indent', '|',
        'undo', 'redo',
        '-',
        'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'highlight', '|',
        'alignment', '|',
        'link', 'insertImage', 'blockQuote', 'insertTable', 'mediaEmbed', 'codeBlock', 'htmlEmbed', '|',
        'specialCharacters', 'horizontalLine', 'pageBreak', '|',
        'textPartLanguage', '|',
        'sourceEditing'
      ],
      shouldNotGroupWhenFull: true
    },
    // plugins:[
    //   AutoImage
    // ],
    // Changing the language of the interface requires loading the language file using the <script> tag.
    // language: 'es',
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true
      }
    },
    // plugins:[
    //   ImageInsert
    // ],
    // https://ckeditor.com/docs/ckeditor5/latest/features/headings.html#configuration
    heading: {
      options: [
        // { model: 'heading', title: 'heading', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
        { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
        { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
      ]
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/editor-placeholder.html#using-the-editor-configuration
    //placeholder: 'Welcome to CKEditor 5!',
    // https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-family-feature
    fontFamily: {
      options: [
        'default',
        'Arial, Helvetica, sans-serif',
        'Courier New, Courier, monospace',
        'Georgia, serif',
        'Lucida Sans Unicode, Lucida Grande, sans-serif',
        'Tahoma, Geneva, sans-serif',
        'Times New Roman, Times, serif',
        'Trebuchet MS, Helvetica, sans-serif',
        'Verdana, Geneva, sans-serif',
        '"Kama",cursive'
      ],
      supportAllValues: true
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-size-feature
    fontSize: {
      options: [10, 12, 14, 'default', 18, 20, 22],
      supportAllValues: true
    },
    // Be careful with the setting below. It instructs CKEditor to accept ALL HTML markup.
    // https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html#enabling-all-html-features
    htmlSupport: {
      allow: [
        {
          name: /.*/,
          attributes: true,
          classes: true,
          styles: true
        }
      ]
    },
    // Be careful with enabling previews
    // https://ckeditor.com/docs/ckeditor5/latest/features/html-embed.html#content-previews
    htmlEmbed: {
      showPreviews: true
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/link.html#custom-link-attributes-decorators
    link: {
      decorators: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
        toggleDownloadable: {
          mode: 'manual',
          label: 'Downloadable',
          attributes: {
            download: 'file'
          }
        }
      }
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html#configuration
    mention: {
      feeds: [
        {
          marker: '@',
          feed: [
            '@apple', '@bears', '@brownie', '@cake', '@cake', '@candy', '@canes', '@chocolate', '@cookie', '@cotton', '@cream',
            '@cupcake', '@danish', '@donut', '@dragée', '@fruitcake', '@gingerbread', '@gummi', '@ice', '@jelly-o',
            '@liquorice', '@macaroon', '@marzipan', '@oat', '@pie', '@plum', '@pudding', '@sesame', '@snaps', '@soufflé',
            '@sugar', '@sweet', '@topping', '@wafer'
          ],
          minimumCharacters: 1
        }
      ]
    },
    // The "super-build" contains more premium features that require additional configuration, disable them below.
    // Do not turn them on unless you read the documentation and know how to configure them and setup the editor.
    removePlugins: [
      // These two are commercial, but you can try them out without registering to a trial.
      // 'ExportPdf',
      // 'ExportWord',
      'CKBox',
      //'CKFinder',
      //'EasyImage',
      // This sample uses the Base64UploadAdapter to handle image uploads as it requires no configuration.
      // https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/base64-upload-adapter.html
      // Storing images as Base64 is usually a very bad idea.
      // Replace it on production website with other solutions:
      // https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html
      // 'Base64UploadAdapter',
      'RealTimeCollaborativeComments',
      'RealTimeCollaborativeTrackChanges',
      'RealTimeCollaborativeRevisionHistory',
      'PresenceList',
      'Comments',
      'TrackChanges',
      'TrackChangesData',
      'RevisionHistory',
      'Pagination',
      'WProofreader',
      // Careful, with the Mathtype plugin CKEditor will not load when loading this sample
      // from a local file system (file://) - load this site via HTTP server if you enable MathType
      'MathType'
    ]

    ////////////////////////////
  }

  @ViewChild(MatPaginator) paging: MatPaginator;


  // DecoupledEditor
  //     .create(document.querySelector( '.document-editor__editable' ), {
  //         cloudServices: {
  //             ....
  //         }
  //     } )
  //     .then( editor => {
  //         const toolbarContainer = document.querySelector( '.document-editor__toolbar' );

  //         toolbarContainer.appendChild( editor.ui.view.toolbar.element );

  //         window.editor = editor;
  //     } )
  //     .catch( err => {
  //         console.error( err );
  //     } );

  ///////////////////
  AddNewMode = false;
  RulesOrPolicyTypes :any[]= [];
  PageLoading = false;
  LoginUserDetail:any[]= [];
  CurrentRow: any = {};
  RulesOrPolicyListName = 'RulesOrPolicies';
  RulesOrPolicyDisplayTypes :any[]= [];
  Applications :any[]= [];
  ckeConfig: any;
  loading = false;
  FilterOrgSubOrg='';
  SelectedBatchId = 0;SubOrgId = 0;
  RulesOrPolicyList: IRulesOrPolicy[]= [];
  filteredOptions: Observable<IRulesOrPolicy[]>;
  dataSource: MatTableDataSource<IRulesOrPolicy>;
  allMasterData :any[]= [];
  PageCategory :any[]= [];
  RulesOrPolicySubCategory :any[]= [];
  Permission = 'deny';
  RulesOrPolicyData = {
    RulesOrPolicyId: 0,
    CategoryId: 0,
    Title: '',
    Description: '',
    OrgId: 0,SubOrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "RulesOrPolicyId",
    "Description",
    "RulesOrPolicyCategoryId",
    "RuleOrPolicyTypeId",
    "Sequence",
    "Active",
    "Action"
  ];
  SelectedApplicationId = 0;
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private nav: Router,
    private fileUploadService: FileUploadService,
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
      searchId: [0],
      EditorDescription: [''],
      Title: [''],
      RulesOrPolicyId: [0],
      searchCategoryId: [0],
      Active: [true]
      // searchSubCategoryId: [0]
    });
    this.searchForm.get("RulesOrPolicyId")?.disable();
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    //this.EmployeeId = +this.tokenStorage.getEmployeeId()!;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId()!;
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId()!;
        this.SubOrgId = +this.tokenStorage.getSubOrgId()!;
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.misc.CREATEHTMLPAGE);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu'])
      }
      else {
        
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        //this.ckeConfig = {};
        this.ckeConfig = {
          allowedContent: false,
          extraPlugins: 'divarea',
          forcePasteAsPlainText: false,
          removeButtons: 'About',
          scayt_autoStartup: true,
          autoGrow_onStartup: true,
          autoGrow_minHeight: 500,
          autoGrow_maxHeight: 600,
          font_names: "Arial;Times New Roman;Verdana;'Kalam', cursive;",
          contentsCss: 'https://fonts.googleapis.com/css2?family=Kalam:wght@300&display=swap'
        };

        this.GetMasterData();
        this.GetRulesOrPolicys();
      }
    }
  }
  formdata: FormData;
  selectedFile: any;

  uploadFile(loader) {
    debugger;
    let error: boolean = false;
    this.loading = true;
    if (loader.file == undefined) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select a file.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.formdata = new FormData();
    this.formdata.append("description", "document image");
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "document image");
    this.formdata.append("parentId", "-1");

    this.formdata.append("batchId", "0");
    this.formdata.append("orgName", this.LoginUserDetail[0]["org"]);
    this.formdata.append("orgId", this.LoginUserDetail[0]["orgId"]);
    this.formdata.append("subOrgId", this.SubOrgId+"");
    this.formdata.append("pageId", "0");

    this.formdata.append("studentId", "0");
    this.formdata.append("studentClassId", "0");
    this.formdata.append("questionId", "0");
    this.formdata.append("docTypeId", "0");

    this.formdata.append("image", loader.file, loader.file.name);
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

      //this.Edit = false;
    });
  }
  AddNew() {
    this.AddNewMode = true;
    this.searchForm.patchValue({
      RulesOrPolicyId: 0,
      CategoryId: 0,
      Title: '',
      EditorDescription: '',
      Active: 0,
      Action: false
    });
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave() {

    debugger;
    this.loading = true;
    var _title = this.searchForm.get("Title")?.value;
    var _description = this.searchForm.get("EditorDescription")?.value;
    var _categoryId = this.searchForm.get("searchCategoryId")?.value;
    var _rulesOrPolicyId = this.searchForm.get("RulesOrPolicyId")?.value;
    var _active = this.searchForm.get("Active")?.value;
    let checkFilterString = this.FilterOrgSubOrg + " and Title eq '" + globalconstants.encodeSpecialChars(_title) + "'";
    if (_title.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter title.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_description.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter page detail.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_categoryId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select category.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    checkFilterString += " and CategoryId eq " + _categoryId

    if (_rulesOrPolicyId > 0)
      checkFilterString += " and RulesOrPolicyId ne " + _rulesOrPolicyId;
    let list: List = new List();
    list.fields = ["RulesOrPolicyId"];
    list.PageName = this.RulesOrPolicyListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          var _desc = _description.replaceAll('"', "'")
          this.RulesOrPolicyData.RulesOrPolicyId = _rulesOrPolicyId;
          this.RulesOrPolicyData.CategoryId = _categoryId;
          this.RulesOrPolicyData.Active = _active;
          this.RulesOrPolicyData.Description = _desc;
          this.RulesOrPolicyData.Title = _title;
          this.RulesOrPolicyData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.RulesOrPolicyData.SubOrgId = this.SubOrgId;

          if (_rulesOrPolicyId == 0) {
            this.RulesOrPolicyData["CreatedDate"] = new Date();
            this.RulesOrPolicyData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.RulesOrPolicyData["UpdatedDate"] = new Date();
            delete this.RulesOrPolicyData["UpdatedBy"];
            //console.log("rules", this.RulesOrPolicyData)
            this.insert();
          }
          else {
            delete this.RulesOrPolicyData["CreatedDate"];
            delete this.RulesOrPolicyData["CreatedBy"];
            this.RulesOrPolicyData["UpdatedDate"] = new Date();
            this.RulesOrPolicyData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update();
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert() {

    //debugger;
    this.dataservice.postPatch(this.RulesOrPolicyListName, this.RulesOrPolicyData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.AddNewMode = false;
          this.searchForm.patchValue({ "RulesOrPolicyId": data.RulesOrPolicyId });
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update() {

    this.dataservice.postPatch(this.RulesOrPolicyListName, this.RulesOrPolicyData, this.RulesOrPolicyData.RulesOrPolicyId, 'patch')
      .subscribe(
        (data: any) => {
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  FileNames :any[]= [];
  GetRulesOrPolicys() {
    debugger;
    let filterStr = this.FilterOrgSubOrg;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var _fields = ["CategoryId", "RulesOrPolicyId", "Title"];

    this.loading = true;
    let list: List = new List();
    list.fields = _fields;

    list.PageName = this.RulesOrPolicyListName;
    list.filter = [filterStr];
    this.FileNames = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FileNames = [...data.value];

        //this.dataSource = new MatTableDataSource<IRulesOrPolicy>(this.RulesOrPolicyList);
        //this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });

  }
  FilteredFileNames :any[]= [];
  FilterTitle() {
    debugger;
    var searchCategoryId = this.searchForm.get("searchCategoryId")?.value;
    this.FilteredFileNames = this.FileNames.filter((f:any) => f.CategoryId == searchCategoryId);
  }
  GetRulesOrPolicy() {
    debugger;
    let filterStr = this.FilterOrgSubOrg;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var _searchId = this.searchForm.get("searchId")?.value;
    //var _searchSubCategoryId = this.searchForm.get("searchSubCategoryId")?.value;
    var _fields = ["RulesOrPolicyId", "CategoryId", "Title", "Description"];
    if (_searchId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select title.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else
      filterStr += ' and RulesOrPolicyId eq ' + _searchId;

    this.loading = true;
    let list: List = new List();
    list.fields = _fields;

    list.PageName = this.RulesOrPolicyListName;
    list.filter = [filterStr];
    this.RulesOrPolicyList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.RulesOrPolicyList = data.value.map(map => {
            map.Description = globalconstants.decodeSpecialChars(map.Description);
            return map;

          })
          //console.log("dsfsalj", this.RulesOrPolicyList);
          this.searchForm.patchValue({ "RulesOrPolicyId": this.RulesOrPolicyList[0].RulesOrPolicyId,
           "Title": this.RulesOrPolicyList[0].Title, "EditorDescription": this.RulesOrPolicyList[0].Description })
        }
        this.loadingFalse();
      });

  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData()!;
    this.PageCategory = this.getDropDownData(globalconstants.MasterDefinitions.common.PAGECATEGORY)
    this.RulesOrPolicyDisplayTypes = this.getDropDownData(globalconstants.MasterDefinitions.common.RULEORPOLICYCATEGORYDISPLAYTYPE)

    //this.GetRulesOrPolicy();
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
export interface IRulesOrPolicy {
  RulesOrPolicyId: number;
  CategoryId: number;
  Title: string;
  Description: string;
  Action: boolean;
}
export class UploadAdapter {
  private loader;
  constructor(loader: any) {
    this.loader = loader;
    //console.log(this.readThis(loader.file));
  }

  public upload(): Promise<any> {
    //"data:image/png;base64,"+ btoa(binaryString) 
    return this.readThis(this.loader.file);
  }

  readThis(file: File): Promise<any> {
    //console.log(file)
    let imagePromise: Promise<any> = new Promise((resolve, reject) => {
      var myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        let image = myReader.result;
        //console.log(image);
        resolve(0);
        return { default: "data:image/png;base64," + image };

      }
      myReader.readAsDataURL(file);
    });
    return imagePromise;
  }

}


