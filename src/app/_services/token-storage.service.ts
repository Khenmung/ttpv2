import { Injectable } from '@angular/core';
const RANDOMIMAGE_KEY = 'random-images';
const TOKEN_KEY = 'auth-token';
const REFRESHTOKEN_KEY = 'refresh-token';
const USER_KEY = 'auth-user';
const USER_DETAIL = 'userdetail';
const REDIRECT_URL = 'redirecturl';
const SELECTEDBATCHID = 'selectedbatchid';
const SELECTEDAPPID = 'selectedappid';
const CHECKBATCHID = 'checkbatchid'
const NEXTBATCHID = 'nextbatchid';
const PREVIOUSBATCHID = 'previousbatchid';
const PERMITTED_APPS = 'Permitted_Apps';
const CURRENTBATCHSTARTEND = 'CurrentBatchStartEnd';
const SELECTEDBATCHSTARTEND = 'SelectedBatchStartEnd';
const STUDENTID = 'StudentId';
const PID = 'PID';
const CLASSID = 'ClassId';
const STUDENTCLASSID = 'StudentClassId';
const EMPLOYEEID = 'employeeId';
const ROLEFILTER = 'rolefilter';
const SELECTEDBATCHNAME = 'selectedbatchname';
const CURRENTBATCHID = 'currentbatchid';
const SELECTEDAPPNAME = 'selectedappname';
const BATCHES = 'batches';
const CUSTOM_FEATURE = 'customfeatures';
const STUDENTSEARCH = 'studentsearch';
const STUDENTS = 'students';
const MENUDATA = 'menudata';
const MASTERDATA = 'masterdata';
const SubOrgId = 'SubOrgId';
const COMPANYNAME ='CompanyName';
@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor() { }

  signOut(): void {
    var username = localStorage.getItem("username");
    localStorage.clear();
    localStorage.setItem("username", username);
  }


  public saveRandomImages(images: any): void {
    localStorage.removeItem(RANDOMIMAGE_KEY);
    localStorage.setItem(RANDOMIMAGE_KEY, JSON.stringify(images));
  }
  public getImages(): any | null {
    let images = localStorage.getItem(RANDOMIMAGE_KEY);
    if (images) {
      return JSON.parse(JSON.stringify(images));
    }
    return "";
  }
  public saveMenuData(token: any): void {
    localStorage.removeItem(MENUDATA);
    localStorage.setItem(MENUDATA, JSON.stringify(token));
  }
  public getMenuData(): object[] | null {
    // var batch = localStorage.getItem(MENUDATA);
    // console.log("tokenstorgage", batch)
    
    return JSON.parse(localStorage.getItem(MENUDATA) || "[]");
  }
  public saveBatches(token: any): void {
    localStorage.removeItem(BATCHES);
    localStorage.setItem(BATCHES, JSON.stringify(token));
  }
  public getBatches(): object[] | null {
    var batch = localStorage.getItem(BATCHES);
    if (batch) {
      return JSON.parse(batch);
    }
    return [{}];

  }
  public saveMasterData(token: any): void {
    localStorage.removeItem(MASTERDATA);
    localStorage.setItem(MASTERDATA, JSON.stringify(token));
  }
  public getMasterData(): object[] | null {
    var master = localStorage.getItem(MASTERDATA);
    if (master) {
      return JSON.parse(master);
    }
    return [{}];

  }
  public saveStudents(token: any): void {
    localStorage.removeItem(STUDENTS);
    localStorage.setItem(STUDENTS, JSON.stringify(token));
  }
  public getStudents(): object[] | null {
    var students = localStorage.getItem(STUDENTS);
    if (students) {
      return JSON.parse(students);
    }
    return [{}];

  }
  public saveStudentSearch(token: any): void {
    localStorage.removeItem(STUDENTSEARCH);
    localStorage.setItem(STUDENTSEARCH, JSON.stringify(token));
  }
  public getStudentSearch(): object[] | null {
    var batch = localStorage.getItem(STUDENTSEARCH);
    if (batch) {
      return JSON.parse(batch);
    }
    return [{}];

  }
  public saveCurrentBatchStartEnd(token: any): void {
    localStorage.removeItem(CURRENTBATCHSTARTEND);
    localStorage.setItem(CURRENTBATCHSTARTEND, JSON.stringify(token));
  }
  public saveSelectedBatchStartEnd(token: any): void {
    localStorage.removeItem(SELECTEDBATCHSTARTEND);
    localStorage.setItem(SELECTEDBATCHSTARTEND, JSON.stringify(token));
  }
  public saveNextBatchId(token: string): void {
    localStorage.removeItem(NEXTBATCHID);
    localStorage.setItem(NEXTBATCHID, token);
  }
  public saveSelectedBatchName(token: string): void {
    localStorage.removeItem(SELECTEDBATCHNAME);
    localStorage.setItem(SELECTEDBATCHNAME, token);
  }
  public saveCompanyName(token: string): void {
    localStorage.removeItem(COMPANYNAME);
    localStorage.setItem(COMPANYNAME, token);
  }
  public getCompanyName(): string | null {
    return localStorage.getItem(COMPANYNAME);
  }
  public getSelectedBatchName(): string | null {
    return localStorage.getItem(SELECTEDBATCHNAME);
  }
  public getSelectedAppName(): string | null {
    return localStorage.getItem(SELECTEDAPPNAME);
  }
  public getNextBatchId(): string | null {
    return localStorage.getItem(NEXTBATCHID);
  }
  public savePreviousBatchId(token: string): void {
    localStorage.removeItem(PREVIOUSBATCHID);
    localStorage.setItem(PREVIOUSBATCHID, token);
  }
  public getPreviousBatchId(): string | null {
    return localStorage.getItem(PREVIOUSBATCHID);
  }

  public saveRefreshToken(RefreshToken: string): void {
    localStorage.removeItem(REFRESHTOKEN_KEY);
    localStorage.setItem(REFRESHTOKEN_KEY, RefreshToken);
  }
  public saveToken(token: string): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);
  }
  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
  public getRefreshToken(): string | null {
    return localStorage.getItem(REFRESHTOKEN_KEY);
  }
  public getInCurrentBatch(): string | null {
    return localStorage.getItem(CHECKBATCHID);
  }
  public saveInCurrentBatch(token: string): void {
    localStorage.removeItem(CHECKBATCHID);
    localStorage.setItem(CHECKBATCHID, token);
  }
  public saveRoleFilter(token: string): void {
    localStorage.removeItem(ROLEFILTER);
    localStorage.setItem(ROLEFILTER, token);
  }
  public saveStudentClassId(token: string): void {
    localStorage.removeItem(STUDENTCLASSID);
    localStorage.setItem(STUDENTCLASSID, token);
  }
  public saveClassId(token: string): void {
    localStorage.removeItem(CLASSID);
    localStorage.setItem(CLASSID, token);
  }
  public saveStudentId(token: string): void {
    localStorage.removeItem(STUDENTID);
    localStorage.setItem(STUDENTID, token);
  }
  public savePID(token: string): void {
    localStorage.removeItem(PID);
    localStorage.setItem(PID, token);
  }
  public saveEmployeeId(token: string): void {
    localStorage.removeItem(EMPLOYEEID);
    localStorage.setItem(EMPLOYEEID, token);
  }
  public getEmployeeId(): number | null {
    return +localStorage.getItem(EMPLOYEEID);
  }
  public getCurrentBatchStartEnd(): string | null {
    var batch = localStorage.getItem(CURRENTBATCHSTARTEND);
    if (batch) {
      return JSON.parse(JSON.stringify(batch));
    }
    return "";

  }
  public getRoleFilter(): string | null {
    var _rolefilter = localStorage.getItem(ROLEFILTER);
    if (_rolefilter) {
      return JSON.parse(JSON.stringify(_rolefilter));
    }
    return "";
  }

  public getSelectedBatchStartEnd(): string | null {
    var batch = localStorage.getItem(SELECTEDBATCHSTARTEND);
    if (batch) {
      return JSON.parse(JSON.stringify(batch));
    }
    return "";
  }
 
  public getPID(): number | null {
    return +localStorage.getItem(PID);
  }
  public getStudentId(): number | null {
    return +localStorage.getItem(STUDENTID);
  }
  public getStudentClassId(): number | null {
    return +localStorage.getItem(STUDENTCLASSID);
  }
  public getClassId(): number | null {
    return +localStorage.getItem(CLASSID);
  }
  public saveSelectedAppId(token: string): void {
    localStorage.removeItem(SELECTEDAPPID);
    localStorage.setItem(SELECTEDAPPID, token);
  }
  public getSubOrgId(): number | null {
    return +localStorage.getItem(SubOrgId);
  }
  public saveSubOrgId(token: string): void {
    localStorage.removeItem(SubOrgId);
    localStorage.setItem(SubOrgId, token);
  }
  public saveSelectedAppName(token: string): void {
    localStorage.removeItem(SELECTEDAPPNAME);
    localStorage.setItem(SELECTEDAPPNAME, token);
  }
  public getSelectedAPPId(): string | null {
    return localStorage.getItem(SELECTEDAPPID);
  }
  public saveSelectedBatchId(token: string): void {
    localStorage.removeItem(SELECTEDBATCHID);
    localStorage.setItem(SELECTEDBATCHID, token);
  }
  public getSelectedBatchId(): string | null {
    return localStorage.getItem(SELECTEDBATCHID);
  }
  public saveCurrentBatchId(token: string): void {
    localStorage.removeItem(CURRENTBATCHID);
    localStorage.setItem(CURRENTBATCHID, token);
  }
  public getCurrentBatchId(): string | null {
    return localStorage.getItem(CURRENTBATCHID);
  }
  public saveUser(user: any): void {
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  public saveUserdetail(userdetail: any): void {
    localStorage.removeItem(USER_DETAIL);
    localStorage.setItem(USER_DETAIL, JSON.stringify(userdetail));
  }
  public saveCustomFeature(customfeature: any): void {
    localStorage.removeItem(CUSTOM_FEATURE);
    localStorage.setItem(CUSTOM_FEATURE, JSON.stringify(customfeature));
  }
  public savePermittedApplications(perApp: any): void {
    localStorage.removeItem(PERMITTED_APPS);
    localStorage.setItem(PERMITTED_APPS, JSON.stringify(perApp));
  }
  public saveRedirectionUrl(url: any): void {
    localStorage.removeItem(REDIRECT_URL);
    localStorage.setItem(REDIRECT_URL, JSON.stringify(url));
  }
  public getPermittedApplications(): any {
    const permittedApps = localStorage.getItem(PERMITTED_APPS);
    if (permittedApps) {
      return JSON.parse(permittedApps);
    }
    return "";
  }
  public getRedirectUrl(): any {
    const redirecturl = localStorage.getItem(REDIRECT_URL);
    if (redirecturl) {
      localStorage.removeItem(REDIRECT_URL)
      return JSON.parse(redirecturl);
    }
    return "";
  }
  public getUserDetail(): any {
    const userdetail = localStorage.getItem(USER_DETAIL);
    if (userdetail) {
      return JSON.parse(userdetail);
    }

    return "";
  }
  public getCustomFeature(): any {
    const customfeature = localStorage.getItem(CUSTOM_FEATURE);
    if (customfeature) {
      return JSON.parse(customfeature);
    }

    return "";
  }
  public getUser(): any {
    const user = localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }

    return "";
  }
}