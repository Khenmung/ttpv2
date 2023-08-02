import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { globalconstants } from 'src/app/shared/globalconstant';
import { ContentService } from 'src/app/shared/content.service';
import { IMessage, List } from 'src/app/shared/interface';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-contactdashboard',
  templateUrl: './contactdashboard.component.html',
  styleUrls: ['./contactdashboard.component.scss']
})
export class ContactdashboardComponent implements OnInit { PageLoading=true;
  loading=false;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  DATA: IMessage[] = [];
  messageDetail: IMessage;
  columns: Array<any>;
  title: string;
  Id: number;
  query: string;//displayedColumns: Array<any>;
  list: List;

  displayedColumns = [];// ['id', 'name', 'progress', 'color'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  selection = new SelectionModel<IMessage>(true, []);
  constructor(private servicework: SwUpdate,private dataservice: NaomitsuService,
    private navigate: Router,
    private contentservice: ContentService,
    private tokenStorage:TokenStorageService) {
    this.list = new List();
  }
  ngOnInit() {
    this.checklogin();
    this.getDetails();
  }
  checklogin() {
    let token = this.tokenStorage.getToken();

    if (token == null) {
      this.contentservice.openSnackBar("Access denied! login required.",globalconstants.ActionText,globalconstants.RedBackground);
      this.navigate.navigate(['/home']);
    }
  }
  getDetails() {

    this.list.fields = ["*"];
    //this.list.lookupFields = ["Messages"];
    this.list.PageName = "Messages";
    //this.list.filter=['IsTemplate eq 1'];
    this.list.orderBy = "MessageId desc";
    const columns = ["MessageId", "Name", "Email", "Subject", "MessageBody", "Active", "Action"];

    this.dataservice.get(this.list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.DATA = data.value

          this.columns = columns.map(column => {
            return {
              columnDef: column,
              header: column,
              cell: (element: any) => `${element[column] ? element[column] : ``}`
            };
          });
          let SelectedArr = [];
          SelectedArr = this.DATA.filter(key => key.Active === 1)

          ////console.log("DATA",this.DATA);  
          this.displayedColumns = this.columns.map(c => c.columnDef);
          this.dataSource = new MatTableDataSource(this.DATA);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.selection = new SelectionModel<IMessage>(true, SelectedArr);
          //   });
        }
      },
        error => console.log(error)
      );
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

  view(MessageId) {
    this.navigate.navigate(['/home/message/' + MessageId]);
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
  updateActive(element, event) {


    let checked = this.selection.toggle(element);
    let messageDetail ={
      Active: event.checked == true ? 1 : 0,
      CreatedDate: new Date()
    } 
    // this.DATA.filter(item => { return item.MessageId == element.MessageId })
    //   .map(item => {
    //     return {
    //       // Name: item.Name,
    //       // Email: item.Email,
    //       // Subject: item.Subject,
    //       // MessageBody: item.MessageBody,
    //       Active: event.checked == true ? 1 : 0,
    //       CreatedDate: new Date()
    //     }
    //   })[0];
    //   //console.log(element.MessageId);
    this.dataservice.postPatch('Messages', messageDetail, element.MessageId, 'patch')
      .subscribe(
        (data: any) => {
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        })
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
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

