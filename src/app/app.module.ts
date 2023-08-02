import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './shared/material/material.module';
import { AuthService } from './_services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { authInterceptorProviders } from './_helpers/auth.interceptor';
import { NgChartsModule } from 'ng2-charts';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { environment } from '../environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';
import { SidenavService } from './shared/sidenav.service';

@NgModule({
  declarations: [
    AppComponent,
    NotfoundComponent
  ],
  imports: [
    //ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    MaterialModule,
    NgChartsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    
  ],
  exports: [
    NotfoundComponent
  ],
  providers: [
    SidenavService,
    DatePipe,
    authInterceptorProviders,
    //SharedataService,
    AuthService, 
    AuthGuard,
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
    { provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  // providers: [
  //   {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
  // ],
  bootstrap: [AppComponent],

})
export class AppModule { }