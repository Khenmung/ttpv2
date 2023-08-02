export interface IPage {
    PageId: number;
    PageTitle: string;
    ParentId: number;
    ParentPage: string;
    //PageBody:string;
    Published:number;
    Active: number;
    Action: string;
}
export interface INews {
    NewsId: number;
    Title: string;
    Body:string;
    Date:Date;
    Action: string;
}
export interface IMessage {
    MessageId: number;
    Name: string;
    Email:string;
    Subject: number;
    MessageBody: string;
    Active:number;    
    Action: string;
}
export interface INews {
    NewsId: number;
    Title: string;
    Body:string;
    CreatedDate: Date;    
    Active:number;    
    Action: string;
    PhId:number;
}
export class List {
    PageName: string;
    fields: string[];
    lookupFields: string[];
    limitTo: number;
    filter: string[];
    orderBy: string;
    groupby:string;
    apply:string;

}
export interface PagesForMenu {
    PageId: number;
    //LatestPublishedId: number;
    label: string;
    faIcon: string;
    link: string;
    ParentId: number;
    items: any[];
    HasSubmenu:boolean;
}
export class FileToUpload {
    fileName: string = "";
    fileSize: number = 0;
    fileType: string = "";
    lastModifiedTime: string = "";
    lastModifiedDate: Date = null;
    fileAsBase64: string = "";
  }