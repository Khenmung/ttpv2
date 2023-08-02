import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { globalconstants } from '../shared/globalconstant';
import { TokenStorageService } from './token-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SharedataService } from '../shared/sharedata.service';
import { List } from '../shared/interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AuthService implements OnInit { 
  PageLoading=true;
  //userInfo = new BehaviorSubject(null);
  jwtHelper = new JwtHelperService();
  httpOptions:{headers:{"Content-Type":"application/json"}};
  AUTH_API: string = '';//'http://localhost:8070/';
  constructor(private http: HttpClient,
    private shareddata:SharedataService,
    private token:TokenStorageService) {
    this.AUTH_API = globalconstants.apiUrl;
    this.loadUserInfo();
  }

ngOnInit(): void {
    
  //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  //Add 'implements OnInit' to the class.
  

}
  login(myusername: string, mypassword: string): Observable<any> {
    let val = {
      "email":  myusername,      
      "password": mypassword
    }
    if (val && val.email && val.password) {
     
      return this.http.post(this.AUTH_API + '/api/AuthManagement/login',val,this.httpOptions)
      
    }
    return of(false);
    //return this.http.post(this.AUTH_API + '/api/AuthManagement/login', val);

  }

  // register(userDetail): Observable<any> {
  //   return this.http.post(this.AUTH_API + '/api/AuthManagement/Register',userDetail
  //   , this.httpOptions);
  // }
  // RefreshToken(tokenrequest): Observable<any> {
  //   return this.http.post(this.AUTH_API + '/api/AuthManagement/RefreshToken',tokenrequest
  //   , this.httpOptions);
  // }
  // changePassword(payload): Observable<any> {    
  //   return this.http.post(this.AUTH_API + '/api/AuthManagement/ChangePassword',payload, this.httpOptions);
  // }
  // forgotPassword(payload): Observable<any> {    
  //   return this.http.post(this.AUTH_API + '/api/AuthManagement/ForgotPassword',payload, this.httpOptions);
  // }
  // resetPassword(payload): Observable<any> {    
  //   return this.http.post(this.AUTH_API + '/api/AuthManagement/ResetPassword',payload, this.httpOptions);
  // }
  CallAPI(payload,actionName):Observable<any>{
    return this.http.post(this.AUTH_API + '/api/AuthManagement/'+ actionName,payload, this.httpOptions);
  }
  loadUserInfo() {
    let userdata; 
    this.shareddata.CurrentUserInfo.subscribe(s=>userdata=s);
    if (!userdata) {

      const access_token = localStorage.getItem('access_token');
      if (access_token) {
        userdata = this.jwtHelper.decodeToken(access_token);
       this.shareddata.ChangeUserInfo(userdata);
       }
    }
  }
  // confirmEmail(payload){
  //   return this.http.post(this.AUTH_API + "/api/AuthManagement/ConfirmEmail/",payload);
  // }
  // callRefershToken(payload){
  //   return this.http.post(this.AUTH_API + "/api/AuthManagement/RefreshToken",payload);
  // }
  // edit(payload,userId){
  //   return this.http.patch(this.AUTH_API + "/api/AuthManagement/" + userId,payload);
  // }
  get<returnType>(list: List): Observable<returnType> {

      var url;
      url = this.AUTH_API + "/api/" + list.PageName + "?$select=" + list.fields.toString();
      //url = "/odata/" + list.PageName + "?$select=" + list.fields.toString();
      if (list.hasOwnProperty('lookupFields') && list.lookupFields.toString().length > 0) {
        url += "&$expand=" + list.lookupFields.toString();
      }
      if (list.hasOwnProperty('filter') && list.filter && list.filter.toString().length > 0) {
        url += "&$filter=" + list.filter;
      }
      if (list.hasOwnProperty('groupby') && list.groupby && list.groupby.toString().length > 0) {
        url += "&$groupby=" + list.groupby;
      }
      if (list.hasOwnProperty('limitTo') && list.limitTo > 0) {
        url += "&$top=" + list.limitTo.toString();
      }
      if (list.hasOwnProperty('orderBy') && list.orderBy) {
        url += "&$orderby=" + list.orderBy.toString();
      }
      //console.log("GetListItems URL: " + url);
  
      var req = {
        method: 'GET',
        cache: false,
        url: url,
        headers: {
          "Accept": "application/json; odata=verbose",
        }
      }
    return this.http["get"](url) as Observable<returnType>;
    }
  
}
