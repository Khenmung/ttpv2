import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { List } from './interface';
import { globalconstants } from './globalconstant';
import { environment } from 'src/environments/environment';

//import { isNull } from 'util';

interface QueryParams {
  [key: string]: string | number;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}


@Injectable({
  providedIn: 'root'
})
export class NaomitsuService {
  private readonly END_POINT: string; // usually get this from enviroment !!
  constructor(private http: HttpClient) {
    this.END_POINT = globalconstants.apiUrl;// 'http://localhost:8070';
  }

  /**
   *
   * * the user here can pass the return type
   *      e.g : this.serviec.getRemove<_TYPE_>(....)
   * * if the user dose not provide an id this will just get all
   * resources for a specific route
   * * this will work on get and delete request with query params filtering
   */
  get<returnType>(list: List): Observable<returnType> {

    var url;
    url = this.END_POINT + "/odata/" + list.PageName + "?$select=" + list.fields.toString();
    //url = "/odata/" + list.PageName + "?$select=" + list.fields.toString();
    if (list.hasOwnProperty('lookupFields') && list.lookupFields.toString().length > 0) {
      url += "&$expand=" + list.lookupFields.toString();
    }
    if (list.hasOwnProperty('filter') && list.filter && list.filter.toString().length > 0) {
      url += "&$filter=" + list.filter + " and Deleted eq false";
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
    // if (list.hasOwnProperty('apply') && list.orderBy) {
    //   url += "&$apply=" + list.apply.toString();
    // }
    
    console.log("GetListItems URL: " + url);

    var req = {
      method: 'GET',
      cache: false,
      url: url,
      headers: {
        "Accept": "application/json; odata=verbose",
        //"Authorization": "Bearer " + AccessToken
      }
    }

    //const cfqu = this.correctFormatForQueryUrl(qp);
    return this.http["get"](url) as Observable<returnType>;
    //  `${this.END_POINT}/${route}${id ? '/' + id : ''}${cfqu}`
    //) as Observable<returnType>;
  }

  /**
   * this method will patch or post to any route
   * you choose
   */
  postPatch<returnType>(
    model: string,
    data: any,
    id: number = null,
    method: string = 'post'//'post' | 'patch' | 'delete' = 'post'
  ): Observable<returnType> {
    //const cfqu = this.correctFormatForQueryUrl(qp);
    //Config.ServiceBaseURL + '/odata/' + model + '/(' + id + ')',
    ////console.log('hh',`${this.END_POINT}/odata/${model}${id ? '(' + id + ')': ''}`);
    return this.http[method](
      `${this.END_POINT}/odata/${model}${id ? '(' + id + ')' : ''}`,
      data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    ) as Observable<returnType>;
  }
  postFile(caption: string, fileToUpload: File) {
    const endpoint = `${this.END_POINT}/odata/saveimage`; //"http://localhost:8070/PhotoGalleryAPI"
    const formdata: FormData = new FormData();
    formdata.append("Image", fileToUpload, fileToUpload.name);
    formdata.append("ImageCaption", caption);
    return this.http.post(endpoint, formdata);


  }
  //https://localhost:44380/api/PhotoGalleryAPI/?imageData=testok
  /**
   * In the return we will attach the '?' if the user provides a query params
   * and if the user provides a null we do not need to map the array to
   * anything, we just simply returns ''.
   * if there qp dose has some keys an values
   * e.g
   * const z = {userId: 1, name: 'rowad'} then
   * this method will return ["userId=1", "name=rowad"]
   */
  private correctFormatForQueryUrl(qp: QueryParams): string {
    if (qp === null) {
      return '';
    }
    const qpAsStr = this.mapQueryParamsToUrl(qp);
    return qpAsStr.length === 0 ? '' : `?${qpAsStr.join('&')}`;
  }

  /**
   * e.g :
   * const z = {userId: 1, name: 'rowad'} then
   * this method will return ["userId=1", "name=rowad"]
   */
  private mapQueryParamsToUrl(qp: QueryParams): Array<string> {
    return Object.keys(qp).map((key: string) => {
      return `${key}=${qp[key]}`;
    });
  }

}
