import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { globalconstants } from './globalconstant';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'multipart/form-data'
  })
};

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
   API_URL = globalconstants.apiUrl + "/api/uploadimage";
   API_URLs = globalconstants.apiUrl + "/api/Image/uploadimages";
  constructor(private http: HttpClient) { }

  postFile(formData) : Observable<any> {
     return this.http.post(this.API_URL, formData);
  }
  postFiles(formdata:FormData) : Observable<any> {
        return this.http.post(this.API_URLs, formdata);
  }  
}