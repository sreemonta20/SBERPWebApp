import { DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';

import {
  HashLocationStrategy,
  LocationStrategy
} from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import {
  AuthReqInterceptor,
  EncryptDecryptAuthInterceptor,
} from '@app/core/interceptor';
import { SessionStorageService } from '@app/core/services';
import { JwtModule } from '@auth0/angular-jwt';
import {
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface
} from 'ngx-perfect-scrollbar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

export function tokenGetter() { 
  return sessionStorage.getItem("access_token"); 
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right', // Change the position as needed
    }),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["localhost:5001","localhost:39842","localhost:7101","localhost:5043","localhost:44360"],
        disallowedRoutes: []
      }
    })
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    SessionStorageService,
    Title,
    provideHttpClient(
      withInterceptors([
        AuthReqInterceptor,
        EncryptDecryptAuthInterceptor,
      ])
    ),
    DatePipe
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
