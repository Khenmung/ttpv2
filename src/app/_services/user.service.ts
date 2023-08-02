import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { globalconstants } from '../shared/globalconstant';
import { environment } from 'src/environments/environment';

//const API_URL = 'http://localhost:8070/api/';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  API_URL = globalconstants.apiUrl + "/api/"
  constructor(private http: HttpClient) { }

  getPublicContent(): Observable<any> {
    return this.http.get(this.API_URL + 'all', { responseType: 'text' });
  }

  getUserBoard(): Observable<any> {
    return this.http.get(this.API_URL + 'user', { responseType: 'text' });
  }

  getModeratorBoard(): Observable<any> {
    return this.http.get(this.API_URL + 'mod', { responseType: 'text' });
  }

  getAdminBoard(): Observable<any> {
    return this.http.get(this.API_URL + 'admin', { responseType: 'text' });
  }
}