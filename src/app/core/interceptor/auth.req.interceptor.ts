// import {
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest,
// } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { SessionConstants } from '../constants/common.constants';
// import { SessionStorageService } from '../services/session.service';
// import { DataResponse, User, UserResponse } from '@app/core/class';
// import { CommonService } from '../services';

// @Injectable()
// export class AuthReqInterceptor implements HttpInterceptor {
//   public accessToken: any = null;
//   public loggedInUser: UserResponse = new UserResponse();
//   constructor(
//     public sessionService: SessionStorageService,
//     public commonService: CommonService
//   ) {}
//   intercept(
//     req: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     try {

//       const hasAuthorizationHeader = req.headers.has('Authorization');
//       if (!hasAuthorizationHeader) {
//         this.commonService.loggedInUser$.subscribe((loggedInUser) => {
//           this.loggedInUser = loggedInUser;
//         });

//         if (this.commonService.isValid(this.loggedInUser)) {
//           this.accessToken = this.loggedInUser.access_token;
//           if (this.commonService.isValid(this.accessToken)) {
//             return next.handle(
//               req.clone({
//                 setHeaders: { Authorization: `Bearer ${this.accessToken}` },
//               })
//             );
//           } else {
//             return next.handle(req);
//           }
//         } else {
//           return next.handle(req);
//         }
//       }
//     } catch (err) {
//       return next.handle(req);
//     }
//   }
// }

///---------------------------------------------current-------------------------------------------------
// import {
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest,

// } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { SessionConstants } from '../constants/common.constants';
// import { SessionStorageService } from '../services/session.service';
// import { DataResponse, User, UserResponse } from '@app/core/class';
// import { CommonService } from '../services';

// @Injectable()
// export class AuthReqInterceptor implements HttpInterceptor {
//   public accessToken: any = null;
//   public loggedInUser: UserResponse = new UserResponse();
//   constructor(
//     public sessionService: SessionStorageService,
//     public commonService: CommonService
//   ) {}
//   intercept(
//     req: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     try {

//       const hasAuthorizationHeader = req.headers.has('Authorization');
//       if (!hasAuthorizationHeader) {
//         this.commonService.loggedInUser$.subscribe((loggedInUser) => {
//           this.loggedInUser = loggedInUser;
//         });

//         if (this.commonService.isValid(this.loggedInUser)) {
//           this.accessToken = this.loggedInUser.access_token;
//           if (this.commonService.isValid(this.accessToken)) {
//             return next.handle(
//               req.clone({
//                 setHeaders: { Authorization: `Bearer ${this.accessToken}` },
//               })
//             );
//           } else {
//             return next.handle(req);
//           }
//         } else {
//           return next.handle(req);
//         }
//       }
//     } catch (err) {
//       return next.handle(req);
//     }
//   }
// }


// import { inject } from '@angular/core';
// import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { CommonService } from '../services/common.service';
// import { SessionStorageService } from '../services/session.service';
// import { DataResponse, User, UserResponse } from '@app/core/class';

// export const AuthReqInterceptor: HttpInterceptorFn = (
//   req: HttpRequest<any>,
//   next: HttpHandlerFn
// ): Observable<HttpEvent<any>> => {
//   const commonService = inject(CommonService);
//   const sessionService = inject(SessionStorageService);

//   try {
//     debugger
//     let accessToken: string | null = null;
//     let loggedInUser: UserResponse = new UserResponse();
//     const hasAuthorizationHeader = req.headers.has('Authorization');
//       if (!hasAuthorizationHeader) {
//         debugger
//         commonService.loggedInUser$.subscribe((loggedInUser) => {
//           debugger
//           loggedInUser = loggedInUser;
//         });
//         debugger
//         if (commonService.isValid(loggedInUser)) {
//           console.log(loggedInUser);
//           accessToken = loggedInUser.access_token;
//           if (commonService.isValid(accessToken)) {
//             console.log('Access token: '+accessToken);
//             return next(
//               req.clone({
//                 setHeaders: { Authorization: `Bearer ${accessToken}` },
//               })
//             );
//           } else {
//             return next(req);
//           }
//         } else {
//           return next(req);
//         }
//       }
//   } catch (err) {
//     console.error('Error in AuthReqInterceptor:', err);
//     return next(req);
//   }

// };


import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonService } from '../services/common.service';
import { SessionStorageService } from '../services/session.service';

export const AuthReqInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const commonService = inject(CommonService);
  const sessionService = inject(SessionStorageService);

  try {
    // Check if the request already has an Authorization header
    if (req.headers.has('Authorization')) {
      return next(req);
    }

    // Retrieve the logged-in user from session storage
    const loggedInUser = sessionService.get('loggedInUser');

    if (commonService.isValid(loggedInUser)) {
      const accessToken = loggedInUser?.access_token;
      
      if (commonService.isValid(accessToken)) {
        console.log('Access token:', accessToken);

        // Clone the request and add the Authorization header
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        return next(clonedRequest);
      }
    }

    // Proceed without modification if no valid token is found
    return next(req);
  } catch (err) {
    console.error('Error in AuthReqInterceptor:', err);
    return next(req);
  }
};