import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit,
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';
import { Subject } from 'rxjs';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { List } from '../../../shared/interface';
import { NaomitsuService } from '../../../shared/databaseService';
import { TokenStorageService } from '../../../_services/token-storage.service';
import * as moment from 'moment';
import { globalconstants } from '../../../shared/globalconstant';
import { SwUpdate } from '@angular/service-worker';
import { MatTableDataSource } from '@angular/material/table';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'mwl-demo-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./calendar.component.scss'],
  styles: [
    `
      h3 {
        margin: 0 0 10px;
      }

      pre {
        background-color: #f5f5f5;
        padding: 15px;
      }
    `,
  ],

  templateUrl: 'calendar.component.html',
})
export class CalendarComponent implements OnInit {
  PageLoading = true;
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  LoginUserDetail: any[] = [];
  events: CalendarEvent[];
  EventList: any[] = [];
  HolidayList: any[] = [];
  EventsListName = 'Events';
  HolidayListName = 'Holidays';
  view: CalendarView = CalendarView.Month;
  FilterOrgSubOrgBatchId = '';
  FilterOrgSubOrg = '';
  CalendarView = CalendarView;
  //CalendarView.setOption('height', 700);
  //refresh: Subject<any> = new Subject();
  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };
  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  SelectedBatchId = 0; SubOrgId = 0;
  loading = false;
  refresh = new Subject<void>();
  CalendarList: any[] = [];
  activeDayIsOpen: boolean = true;
  Permission = '';
  constructor(
    private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private tokenservice: TokenStorageService
  ) {
    this.LoginUserDetail = this.tokenservice.getUserDetail();
    this.SelectedBatchId = +this.tokenservice.getSelectedBatchId()!;
    this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenservice);
    this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenservice);

  }
  HolidayDataSource: MatTableDataSource<any>;
  EventDataSource: MatTableDataSource<any>;
  HolidayDisplayedColumns = ['Title', 'StartDate', 'EndDate']
  EventDisplayedColumns = ['EventName', 'EventStartDate', 'EventEndDate']
  ngOnInit(): void {
    debugger;
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    //console.log("events", this.events);
    var perObj = globalconstants.getPermission(this.tokenservice, globalconstants.Pages.common.misc.CALENDAR);
    if (perObj.length > 0) {
      this.Permission = perObj[0].permission;
    }
    ////console.log('this.Permission', this.Permission)
    if (this.Permission != 'deny') {
      this.PageLoading = true;
      this.GetEvents();
    }
  }
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    //debugger;
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    //debugger;
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    //this.modalData = { event, action };
    //this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      },
    ];
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
  GetEvents() {
    //debugger;
    this.loading = true;
    let filterStr = this.FilterOrgSubOrgBatchId + " and Active eq 1";

    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.EventsListName;
    list.filter = [filterStr];
    this.events = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.EventDataSource = new MatTableDataSource(data.value);
          data.value.forEach(e => {
            this.events.push(
              {
                //id: e.EventId,
                title: e.EventName + ", " + moment(e.EventStartDate).format('ddd') + ", " + e.Venue,
                start: new Date(e.EventStartDate),
                end: new Date(e.EventEndDate),
                color: colors.red,
                actions: this.actions,
                allDay: true,
                resizable: {
                  beforeStart: true,
                  afterEnd: true,
                },
                draggable: true,
              }
            );
          })
        }
        list.PageName = "Holidays";
        list.filter = [filterStr];
        this.dataservice.get(list)
          .subscribe((holiday: any) => {
            if (holiday.value.length > 0) {
              this.HolidayDataSource = new MatTableDataSource(holiday.value);
              holiday.value.forEach(e => {
                this.events.push(
                  {
                    title: e.Title + ", " + moment(e.StartDate).format('ddd'),
                    start: new Date(e.StartDate),
                    end: new Date(e.EndDate),
                    color: colors.blue,
                    actions: this.actions,
                    allDay: true,
                    resizable: {
                      beforeStart: true,
                      afterEnd: true,
                    },
                    draggable: true,
                  }
                );
              })
              this.events = this.events.sort((a, b) => {
                return a.start.getTime() - b.start.getTime();
              })
              this.refresh.next();
            }
            this.PageLoading = false;
          });
        //console.log("events",this.events);
        ///this.activeDayIsOpen = false;
        //this.dayClicked({date:new Date(),events:[]});    
      });
  }
}
// import { Component, OnInit } from '@angular/core';
//import { SwUpdate } from '@angular/service-worker';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import { CalendarOptions } from '@fullcalendar/angular';
// import { NaomitsuService } from '../../../shared/databaseService';
// import { List } from '../../../shared/interface';
// import { TokenStorageService } from '../../../_services/token-storage.service';
// import { ContentService } from '../../../shared/content.service';


// @Component({
//   selector: 'app-calendar',
//   templateUrl: './calendar.component.html',
//   styleUrls: ['./calendar.component.scss']
// })
// export class CalendarComponent implements OnInit { PageLoading=true;
//   loading = false;
//   LoginUserDetail :any[]= [];
//   EventList :any[]= [];
//   EventsListName = 'Events';
//   HolidayListName = 'Holidays';
//   CalendarList :any[]= [];
//   SelectedBatchId=0;
//   calendarOptions: CalendarOptions;
//   constructor(private servicework: SwUpdate,
//     private contentservice: ContentService,
//     private dataservice: NaomitsuService,
//     private tokenService: TokenStorageService) { }

//   ngOnInit(): void {
// this.servicework.activateUpdate().then(() => {
//   this.servicework.checkForUpdate().then((value) => {
//     if (value) {
//       location.reload();
//     }
//   })
// })
//     this.LoginUserDetail = this.tokenService.getUserDetail();
//     this.SelectedBatchId =  +this.tokenService.getSelectedBatchId();
//     this.GetHoliday();
//   }
//   GetHoliday() {
//     debugger;

//     this.loading = true;
//     let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

//     let list: List = new List();
//     list.fields = ["HolidayId,Title,StartDate,EndDate"];

//     list.PageName = this.HolidayListName;
//     list.filter = [filterStr];
//     this.CalendarList :any[]= [];
//     this.dataservice.get(list)
//       .subscribe((data: any) => {
//         //debugger;
//         if (data.value.length > 0) {
//           data.value.forEach(m => {
//             this.CalendarList.push(
//               {
//                 Id: m.HolidayId,
//                 title: m.Title,
//                 start: m.StartDate
//               }
//             )
//           });
//         }
//         this.GetEvents();
//         this.loading = false; this.PageLoading=false;
//       });

//   }
// GetEvents() {
//   debugger;

//   this.loading = true;
//   let filterStr = 'Active eq 1 and (' + this.FilterOrgSubOrg +") and BatchId eq " + this.SelectedBatchId;

//   let list: List = new List();
//   list.fields = ["*"];

//   list.PageName = this.EventsListName;
//   list.filter = [filterStr];
//   this.EventList :any[]= [];
//   this.dataservice.get(list)
//     .subscribe((data: any) => {
//       if (data.value.length > 0) {
//         data.value.forEach(e => {
//           this.CalendarList.push(
//             {
//               Id: e.EventId,
//               title: e.EventName,
//               start: e.EventStartDate,
//               end: e.EventEndDate
//             }
//           );
//         })
//         this.calendarOptions = {

//           contentHeight: 450,
//           plugins: [timeGridPlugin],
//           editable: true,
//           headerToolbar: {
//             left: 'dayGridMonth,timeGridWeek,timeGridDay',
//             center: 'title',
//             right: 'prevYear,prev,next,nextYear'
//           },
//           eventTextColor: '#ECECEC',
//           dayMaxEvents: true,
//           selectable: true,
//           eventMouseEnter: (event) => this.eventMouseOver(event),
//           initialView: 'timeGridWeek',
//           dateClick: this.handleDateClick.bind(this), // bind is important!
//           events: this.CalendarList

//         };
//       }
//     });

// }
//   handleDateClick(arg) {
//     //console.log("arg",arg)
//     //alert('date click! ' + arg)
//   }

//   eventMouseOver(value) {
//     //debugger;
//    // value.el.innerHTML

//     //console.log("mouseover",value.detail)
//     //this.contentservice.openSnackBar(value, globalconstants.ActionText, globalconstants.BlueBackground);
//   }
//   TimeGridView() {
//     this.calendarOptions = {
//       editable: true,
//       // headerToolbar: {
//       //     left: 'prev,next today',
//       //     center: 'title',
//       //     //right: 'month,agendaWeek,agendaDay,listMonth'
//       // },
//       dayMaxEvents: true,
//       selectable: true,
//       //slotEventOverlap: false,
//       //eventMouseEnter: (event) => this.eventMouseOver(event),        
//       initialView: 'timeGridWeek',
//       dateClick: this.handleDateClick.bind(this), // bind is important!
//       events: [
//         { title: 'event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1', date: '2021-11-27' },
//         { title: 'event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1', date: '2021-11-27' },
//         { title: 'event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1', date: '2021-11-27' },
//         { title: 'event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1', date: '2021-11-27' },
//         { title: 'event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1', date: '2021-11-27' },
//         { title: 'event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1', date: '2021-11-27' },
//         { title: 'event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1', date: '2021-11-27' },
//         { title: 'event zz', date: '2021-11-27' },
//         { title: 'event 2', date: '2021-11-30' }
//       ]
//     };

//   }
// }
