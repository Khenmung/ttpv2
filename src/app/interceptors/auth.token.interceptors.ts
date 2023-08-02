import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { switchMap, map, flatMap, take } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SharedataService } from '../shared/sharedata.service';
@Injectable()
export class AuthTokenInterceptors implements HttpInterceptor {
  jwtHelper = new JwtHelperService();
  constructor(private authService: AuthService,
    private shareddata:SharedataService
    ) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.url.indexOf('/RefreshToken') > -1) {
      return next.handle(req);
    }
    const access_token = JSON.parse(localStorage.getItem('access_token'));
    //debugger;
    if (access_token && access_token !='null') {
      const expiration = localStorage.getItem('expiration');
      if (Date.now() < Number(expiration) * 1000) {
        const transformedReq = req.clone({
          headers: req.headers.set('Authorization', `bearer ${access_token}`),
        });
        return next.handle(transformedReq);
      }
      const payload = {
        Token: access_token,
        RefreshToken: localStorage.getItem('refresh_token'),
      };
      return this.authService.CallAPI("RefreshToken",payload).pipe(
        switchMap((newTokens: any) => {
          localStorage.setItem('access_token', newTokens.token);
          localStorage.setItem('refresh_token', newTokens.refreshToken);
          const decodedUser = this.jwtHelper.decodeToken(
            newTokens.token
          );
          localStorage.setItem('expiration', decodedUser.exp);
          localStorage.setItem('userInfo',decodedUser);
          const transformedReq = req.clone({
            headers: req.headers.set(
              'Authorization',
              `bearer ${newTokens.token}`
            ),
          });
          return next.handle(transformedReq);
        })
      );
    } else {
      return next.handle(req);
    }
  }
}
