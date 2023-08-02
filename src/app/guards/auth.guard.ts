import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SharedataService } from '../shared/sharedata.service';
import { AuthService } from '../_services/auth.service';
import { TokenStorageService } from '../_services/token-storage.service';

@Injectable()
export class AuthGuard implements CanActivate{
    constructor(
        private token:TokenStorageService,
        private shareddata:SharedataService,
        private authService:AuthService,
        private router:Router){}
    canActivate(
        route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot)
        : boolean 
        | UrlTree 
        | Observable<boolean 
        | UrlTree> 
        | Promise<boolean 
        | UrlTree> {
        var userData; 
        var LoginUserDetail = this.token.getUserDetail();
        //debugger;
        if(LoginUserDetail!=null){ // sub represents user id value
            return true;
            // if(state.url.indexOf("/auth/login") != -1){
            //     // loggin user trying to access login page
            //     this.router.navigate(["/dashboard"]);
            //     return false;
            // }
            // else{
            //     return true;
            // }
        }else{
            if(state.url.indexOf("/auth/login") == -1){
                // not logged in users only navigate to login page
                this.router.navigate(["/auth/login"]);
                return false;
            }
            else{
                return true;
            }
        }    
    }

}