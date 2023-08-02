import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NaomitsuService } from '../../../shared/databaseService';
import { List } from '../../../shared/interface';
//import { DialogService } from '../../../shared/dialog.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { globalconstants } from '../../../shared/globalconstant';
import { MatTableDataSource } from '@angular/material/table';
import { ContentService } from 'src/app/shared/content.service';
//import { environment } from 'src/environments/environment';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ConfirmDialogComponent } from 'src/app/shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss']
})
export class AlbumsComponent implements OnInit {
  LoginUserDetail: any[] = [];
  PageLoading = true;
  @ViewChild('button') button: ElementRef;
  FileOrImage: number = 1;
  activeSkill() {
    (<any>this.button).color = 'accent';
  }
  filteredAlbum: Observable<IAlbum[]>;
  dataSource: MatTableDataSource<IAlbum>;
  displayedColumns = ["UpdatedFileFolderName", "UploadDate", "Copy", "View"]
  ParentId = 0;
  folderHierarachy: string = 'Image/';
  folderDisplayHierachy: string = 'Image/';
  title: string = '';
  loading: boolean = false;
  error: string = '';
  searchForm:UntypedFormGroup;
  
  images: any[];
  Albums: any[] = [];
  AllAlbums: any[]=[];
  unique: any[];
  selectedAlbum: string;
  oldvalue: string;
  absoluteurl = '';
  
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private route: Router,
    private contentservice: ContentService,
    private dialog: MatDialog,
    private tokenStorage: TokenStorageService,
    private fb: UntypedFormBuilder
    //private globalconstants
  ) {
    //this.absoluteurl =window.location.origin;
  }
  Permission = '';
  ngOnInit() {
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail.length != 0) {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.COLLECTION.ALBUM);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.searchForm = this.fb.group(
          {
            UpdatedFileFolderName: [''],
            parentId: [0]
          }
        );
        this.filteredAlbum = this.searchForm.get("UpdatedFileFolderName").valueChanges
          .pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : value.UpdatedFileFolderName),
            map(Name => Name ? this._filter(Name) : this.AllAlbums.slice())
          );
        //this.checklogin();
        this.getAlbums();
      }
    }
  }
  private _filter(name: string): IAlbum[] {

    const filterValue = name.toLowerCase();
    return this.AllAlbums.filter(option => option.UpdatedFileFolderName.toLowerCase().includes(filterValue));

  }
  applyFilter(strFilter) {
    if (strFilter.length > 2)
      this.Albums = [...this.AllAlbums.filter(item => { return item.UpdatedFileFolderName.includes(strFilter) || item.UploadDate.toString().includes(strFilter) })];
    else if (strFilter.length == 0) {
      this.Albums == this.AllAlbums.filter((item, indx) => {
        return indx < 10;
      });
    }
  }
  checklogin() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    let token = this.tokenStorage.getToken();

    if (token == null) {
      this.contentservice.openSnackBar("Access denied! login required.", globalconstants.ActionText, globalconstants.RedBackground);
      this.route.navigate(['/home']);
    }
  }
  getAlbums() {
    debugger;
    let list: List = new List();
    list.fields = ["FileId", "FileName", "UpdatedFileFolderName", "FileOrFolder", "UploadDate", "ParentId", "Active"];
    list.PageName = "StorageFnPs";
    list.filter = ['FileOrFolder eq 1 and OrgId eq ' + this.LoginUserDetail[0]['orgId'] + ' and Active eq 1'];// and FileOrPhoto eq ' + this.searchForm.get("FilesNPhoto").value];
    list.orderBy = "UploadDate desc";
    //list.limitTo =10;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AllAlbums = [...data.value];
        this.PageLoading = false;
      })
  }
  displayFn(user: IAlbum): string {
    return user && user.UpdatedFileFolderName ? user.UpdatedFileFolderName : '';
  }
  getNestedFolders(parentId) {
    let ParentItem = this.AllAlbums.filter(item => item.FileId == parentId);
    //debugger;
    while (ParentItem.length > 0) {
      this.folderHierarachy += ParentItem[0].FileName + "/";
      this.folderDisplayHierachy += ParentItem[0].UpdatedFileFolderName + "/";
      ParentItem = this.AllAlbums.filter(item => item.FileId == ParentItem[0].ParentId)
    }
  }
  message() {
    this.contentservice.openSnackBar("url copied", globalconstants.ActionText, globalconstants.BlueBackground);
  }
  getFiles(album, mode) {
    debugger;
    let folderSearch = '';
    var _folderName = this.searchForm.get("UpdatedFileFolderName").value.UpdatedFileFolderName;
    if (album != undefined) {
      if (album.FileOrFolder == 0 && mode == 'open') {
        //let folderHierarachy='Image/';
        //this.getNestedFolders(album.ParentId);
        //let url = globalconstants.apiUrl + "/" + folderHierarachy + album.FileName;

        window.open(album.FilePath, "_blank");
        return;
      }
      
      if (album.FileId == undefined && _folderName == "") {
        this.contentservice.openSnackBar("Please enter folder name to search", globalconstants.ActionText, globalconstants.BlueBackground);
        return;
      }

      if (album.FileId != undefined)
        folderSearch = " and ParentId eq " + album.FileId;
      else if (album.FileId == undefined && _folderName != "")
        folderSearch = " and UpdatedFileFolderName eq '" + _folderName + "'";
    }
    else if (_folderName != '') {
      folderSearch = " and UpdatedFileFolderName eq '" + _folderName + "'";
    }
    else {
      return;
    }
    let list: List = new List();
    list.fields = ["FileId", "FileName", "FileOrFolder", "Description", "ParentId", "UpdatedFileFolderName", "UploadDate"];
    list.PageName = "StorageFnPs";
    list.filter = ["Active eq 1" + folderSearch];
    list.orderBy = "UploadDate desc";
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          //debugger;
          var browsePath = '';
          this.Albums = data.value.map(item => {
            this.folderHierarachy = 'Uploads/'+this.LoginUserDetail[0]['org']+ '/';
            this.folderDisplayHierachy = 'Uploads/'+this.LoginUserDetail[0]['org']+ '/';
            this.getNestedFolders(item.ParentId);

            if (this.folderHierarachy.length > 0)
              browsePath = globalconstants.apiUrl + "/" + this.folderHierarachy + item.FileName;
            return {
              FileId: item.FileId,
              FilePath: browsePath,
              DisplayPath: globalconstants.apiUrl + "/" + this.folderDisplayHierachy + item.FileName,
              imgURL:globalconstants.apiUrl + "/" + this.folderHierarachy + item.FileName,
              FileName: item.FileName,
              Description: item.Description,
              UploadDate: item.UploadDate,
              FileOrFolder: item.FileOrFolder,
              ParentId: item.ParentId,
              UpdatedFileFolderName: item.UpdatedFileFolderName,
              Copy: '',
              View: ''
            }
          });
          this.error = '';
          this.selectedAlbum = data.value[0].UpdatedFileFolderName;// this.images[0].Album.AlbumName;
          this.title = this.selectedAlbum;
          //this.AllAlbums =[...this.Albums];
        }
        else {
          this.error = "No file/folder found.";
          this.Albums = [];
        }
        this.dataSource = new MatTableDataSource<IAlbum>(this.Albums);
        this.loading = false;
        this.PageLoading = false;
        //setTimeout(()=>{this.loading=false},3000); 
      })
  }
  // updateActive(value, album) {
  //   this.dialog.openConfirmDialog("Are you sure you want to delete File/Folder " + value._elementRef.nativeElement.name + "?")
  //     .afterClosed().subscribe(res => {

  //       if (res) {
  //         let albumtoUpdate = {
  //           UpdatedFileFolderName: value._elementRef.nativeElement.name,
  //           Active: value.checked == true ? 1 : 0,
  //           UploadDate: new Date()
  //         }

  //         this.dataservice.postPatch('StorageFnPs', albumtoUpdate, value._elementRef.nativeElement.id, 'patch')
  //           .subscribe(res => {
  //             this.getFiles(album, "");
  //             this.contentservice.openSnackBar("File/Folder deleted successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
  //             //console.lothisg(res);
  //           });
  //       }
  //     });
  // }

  selected(event) {
    ////console.log('event',event)
    this.selectedAlbum = event.target.value;
    //    //console.log('this.selectedAlbum', this.selectedAlbum)
    // let tempImages = this.Albums.filter((item)=>{
    //   return item.Album == this.selectedAlbum
    // })
    // this.images = tempImages.map(item=> {return item.PhotoPath});
  }
  getoldvalue(value: string) {
    this.oldvalue = value;
    //  //console.log('old value', this.oldvalue);
  }
  //////////////
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
      FileId:row.FileId,
      Active: 0,
      Deleted: true
      //UpdatedDate: new Date()
    }
    console.log("toupdate",toUpdate)
    this.dataservice.postPatch('StorageFnPs', toUpdate, row.FileId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false; this.PageLoading = false;
        var idx = this.Albums.findIndex(x => x.FileId == row.FileId)
        this.Albums.splice(idx, 1);
        this.dataSource = new MatTableDataSource<any>(this.Albums);
        this.dataSource.filterPredicate = this.createFilter();
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
  //////////////
  updateAlbum(value) {
    debugger;
    ////console.log(value);
    //value.stopPropagation();
    if (this.oldvalue == value)
      return;
    let confirmYesNo: Boolean = false;
    if (value.length == 0 || value.length > 50) {
      this.contentservice.openSnackBar("Character should not be empty or less than 50!", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let albumtoUpdate = {
      UpdatedFileFolderName: value,
      Active: 1,
      UploadDate: new Date()
    }

    let selectedAlbumId = this.Albums.filter(item => {
      return item.UpdatedFileFolderName == this.oldvalue
    })[0].FileId;

    this.dataservice.postPatch('StorageFnPs', albumtoUpdate, selectedAlbumId, 'patch')
      .subscribe(res => {
        this.contentservice.openSnackBar("File/Folder name updated!", globalconstants.ActionText, globalconstants.BlueBackground);
      });
  }
  display(albumId) {
    this.route.navigate(["/home/photos"], { queryParams: { "AlbumId": albumId } });
  }
  
}
export interface IAlbum {
  FileId: number;
  FileOrFolder: number;
  UpdatedFileFolderName: string;
  UploadDate: Date;
  FilePath: string;

}
