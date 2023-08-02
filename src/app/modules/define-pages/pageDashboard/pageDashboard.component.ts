import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IPage, List } from '../../../shared/interface';
import { NaomitsuService } from '../../../shared/databaseService';
import { SelectionModel } from '@angular/cdk/collections';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { DialogService } from '../../../shared/dialog.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { ContentService } from 'src/app/shared/content.service';

@Component({
  selector: 'app-pagecontent',
  templateUrl: './pageDashboard.component.html',
  styleUrls: ['./pageDashboard.component.scss'],
  //providers: [ConfirmationService, MessageService]
})
export class pageDashboardComponent implements OnInit { PageLoading=true;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };

  ParentPages: [{ PageId, PageTitle }];
  PageDetail: IPage;
  //SelectedData:PageDetail[] = [];
  DATA: IPage[] = [];
  loading = false;
  columns: Array<any>;
  title: string;
  Id: number;
  query: string;//displayedColumns: Array<any>;
  list: List;

  displayedColumns = [];// ['id', 'name', 'progress', 'color'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  selection = new SelectionModel<IPage>(true, []);

  ngOnInit() {
    this.checklogin();
    this.route.paramMap.subscribe(params => {
      this.Id = +params.get("parentid");
    })
    this.GetParentPage(this.Id);
  }
  getDetails(parentId) {
    //debugger;
    this.list.fields = ["PageId", "PageTitle", "ParentId", "PageHistories/PageHistoryId", "PageHistories/Published", "PageHistories/Version", "Active"];
    this.list.PageName = "Pages";
    this.list.lookupFields = ["PageHistories"];
    this.list.filter = ['Active eq 1 and Module eq 1 and IsTemplate eq 1' + (parentId == 0 ? '' : " and ParentId eq " + parentId)];
    this.list.orderBy = "PageId desc";
    const columns = ["PageId", "PageTitle", "ParentPage", "ParentId", "Published", "Action"];

    this.naomitsuService
      .get<IPage[]>(this.list)
      .subscribe({
        next: (arrPage: IPage[]) => {
          ////console.log('arrpage', arrPage);
          this.DATA=[];
          let arr = [];
          Object.keys(arrPage).map(function (key) {
            arr.push({ [key]: arrPage[key] })
            return arr;
          });

          arr[1].value.forEach((ele, key) => {

            let pPage = this.ParentPages.filter(page => { return page.PageId === ele.ParentId });
            this.DATA.push({
              PageId: ele.PageId,
              PageTitle: ele.PageTitle,
              ParentId: ele.ParentId,
              ParentPage: pPage.length > 0 ? pPage[0].PageTitle : '',
              Active: ele.Active,
              Published: this.getmax(ele.PageHistories),
              Action: ""
            })
          });
          //debugger;
          this.columns = columns.map(column => {
            return {
              columnDef: column,
              header: column,
              cell: (element: any) => `${element[column] ? element[column] : ``}`
            };
          });
          let SelectedArr = [];
          SelectedArr = this.DATA.filter(key => key.Active === 1)


          this.displayedColumns = this.columns.map(c => c.columnDef);
          this.dataSource = new MatTableDataSource(this.DATA);//.sort((n1,n2)=>n1.Published-n2.Published));
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.selection = new SelectionModel<IPage>(true, SelectedArr);
          //   });
        },
        error: console.error
      });
    this.loading = false; this.PageLoading=false;
  }
  constructor(private servicework: SwUpdate,private naomitsuService: NaomitsuService,
    private navigate: Router,
    private route: ActivatedRoute,
    //private shareddata: SharedataService,
    private tokenStorage: TokenStorageService,
    private contentservice: ContentService,
    private dialog: DialogService,
    //private messageService: MessageService
    ) {
    this.list = new List();
  }
  getmax(pageHistory): number {
    let phid = 0;
    if (pageHistory.length > 1) {
      phid = pageHistory.filter(item => {
        return item.PageHistoryId == pageHistory.reduce((prev, current) => (prev.PageHistoryId > current.PageHistoryId) ? prev.PageHistoryId : current.PageHistoryId)
      })[0].Published;
    }
    else if (pageHistory.length == 1)
      phid = pageHistory[0].Published;

    return phid;
  }

  /**
   * Set the paginator and sort after the view init since this component will
   * be able to query its view for the initialized paginator and sort.
   */
  ngAfterViewInit() {
    // if (this.paginator != undefined) {
    //   this.dataSource.paginator = this.paginator;
    //   this.dataSource.sort = this.sort;
    // }
  }
  checklogin() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    let token = this.tokenStorage.getToken();

    if (token == null) {
      this.contentservice.openSnackBar("Access denied! login required.", globalconstants.ActionText,globalconstants.RedBackground);
      this.navigate.navigate(['/home']);
    }
  }
  createpage() {
    this.navigate.navigate(['/home/editor']);
  }
  view(pageId, pageTitle, parentId) {

    this.navigate.navigate(['/home/page/' + pageId], { queryParams: { pgid: parentId, pid: pageId, ptitle: pageTitle } });
  }

  createNew() {
    this.navigate.navigate(['/home/pages/']);
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  del(element, value) {
    value.stopPropagation();
    let confirmYesNo: Boolean = false;
    // if (value.length == 0 || value.length > 50) {
    //   this.contentservice.openSnackBar("Character should not be empty or less than 50!");
    //   return;
    // }
    this.dialog.openConfirmDialog("Are you sure you want to delete all photos in ${value} album?")
      .afterClosed().subscribe(res => {
        confirmYesNo = res;
        if (confirmYesNo) {
          //this.uploadImage();
          let PageDetail = {
            UpdateDate: new Date(),
            Active: 0
          };
          //let checked = this.selection.toggle(element);
          ////console.log('checked',checked);
          //PageDetail.Active = event.checked == true ? 1 : 0;
          PageDetail.UpdateDate = new Date();
          this.naomitsuService.postPatch('Pages', PageDetail, element.PageId, 'patch')
            .subscribe(
              (data: any) => {
                this.getDetails(0);
                this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
              })
        }
      });
  }
  updateActive(element, event) {
    let PageDetail = {
      UpdateDate: new Date(),
      Active: 1
    };
    let checked = this.selection.toggle(element);
    ////console.log('checked',checked);
    PageDetail.Active = event.checked == true ? 1 : 0;
    PageDetail.UpdateDate = new Date();
    this.naomitsuService.postPatch('Pages', PageDetail, element.PageId, 'patch')
      .subscribe(
        (data: any) => {
          //alert('data updated.')
        })
  }
  // confirm(event: Event, element, value) {
  //   //debugger;
  //   try {
  //     this.confirmationService.confirm({
  //       target: event.target,
  //       message: 'Album already exists! Do you want to add to existing album?',
  //       icon: 'pi pi-exclamation-triangle',
  //       accept: () => {
  //         this.updateActive(element, value)
  //         this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Added to existing album.' });
  //       },
  //       reject: () => {
  //         this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Image not added' });
  //       }
  //     });
  //   } catch ({ error }) {
  //     //console.log(error)
  //   }
  // }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  GetParentPage(parentId) {
    let list: List = new List();
    list.fields = ["PageId", "PageTitle"];
    list.PageName = "Pages";
    if (parentId == undefined)
      list.filter = ["Active eq 1 and ParentId eq 0 and Module eq 1"];
    else
      list.filter = ["Active eq 1 and ParentId eq " + parentId + ' and Module eq 1'];
    this.loading = true;
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        this.ParentPages = data.value;
        ////console.log("parent pages", this.ParentPages);

        this.getDetails(parentId);
        //return data.value;

      });

  }
}

function flatten(data) {
  var result = {};
  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (var i = 0, l = cur.length; i < l; i++)
        recurse(cur[i], prop + "[" + i + "]");
      if (l == 0)
        result[prop] = [];
    } else {
      var isEmpty = true;
      for (var p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + "." + p : p);
      }
      if (isEmpty && prop)
        result[prop] = {};
    }
  }
  recurse(data, "");
  return result;
}

