// import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { EncryptDecryptService } from '../services/encrypt-decrypt.service';

// @Injectable()
// export class EncryptDecryptAuthInterceptor implements HttpInterceptor {
//     constructor(private encryptDecryptService: EncryptDecryptService, ) {}

//     ExcludeURLList = [
//         '/api/Auth/authenticateUser',
//         '/api/Auth/refreshtoken',
//         '/api/Auth/revoke',
//         '/api/User/createUpdateAppUser',
//         '/api/User/getAllAppUserProfile',
//         '/api/User/getAppUserProfileById',
//         '/api/User/createUpdateAppUserProfile',
//         '/api/User/deleteAppUserProfile',
//         '/api/RoleMenu/getAllAppUserRoles',
//         '/api/RoleMenu/getAllAppUserRolesPagination',
//         '/api/RoleMenu/getAppUserRolesById',
//         '/api/RoleMenu/createUpdateAppUserRole',
//         '/api/RoleMenu/deleteAppUserRole',
//         '/api/RoleMenu/getAllAppUserMenuPagingWithSearch',
//         '/api/RoleMenu/getAllAppUserMenuByUserId',
//         '/api/RoleMenu/getAllParentMenus',
//         '/api/RoleMenu/createUpdateAppUserMenu',
//         '/api/RoleMenu/deleteAppUserMenu',
//         '/api/RoleMenu/getAppUserRoleMenuInitialData',
//         '/api/RoleMenu/getAllAppUserRoleMenusPagingWithSearch'
//     ];
//     intercept(req: HttpRequest < any > , next: HttpHandler): Observable < HttpEvent < any >> {
//         let exludeFound = this.ExcludeURLList.filter(element => {
//             return req.url.includes(element)
//         });
//         if (!(exludeFound && exludeFound.length > 0)) {
//             if (req.method == "GET") {
//                 if (req.url.indexOf("?") > 0) {
//                     let encriptURL = req.url.slice(0, req.url.indexOf("?") + 1) + this.encryptDecryptService.encryptUsingAES256(req.url.slice(req.url.indexOf("?") + 1, req.url.length));
//                     const cloneReq = req.clone({
//                         url: encriptURL
//                     });
//                     return next.handle(cloneReq);
//                 }
//                 return next.handle(req);
//             } else if (req.method == "POST") {

//                 if (req.body || req.body.length > 0) {
//                     return next.handle(req);
//                 }
//                 let data = req.body as FormData;
//                 return next.handle(req);
//             }
//         }
//         return next.handle(req);
//     }
// }

import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EncryptDecryptService } from '../services/encrypt-decrypt.service';

export const EncryptDecryptAuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const encryptDecryptService = inject(EncryptDecryptService);
  let ExcludeURLList: any[] = [
    '/api/v1/Auth/authenticateUser',
    '/api/v1/Auth/getAppUserProfileMenu',
    '/api/v1/Auth/refreshToken',
    '/api/v1/Auth/revoke',
    '/api/v1/RoleMenu/getAllAppUserRoles',
    '/api/v1/RoleMenu/getAllAppUserRolesPagination',
    '/api/v1/RoleMenu/getAppUserRolesById',
    '/api/v1/RoleMenu/createUpdateAppUserRole',
    '/api/v1/RoleMenu/deleteAppUserRole',
    '/api/v1/RoleMenu/getAllAppUserMenuPagingWithSearch',
    '/api/v1/RoleMenu/getAllAppUserMenuByUserId',
    '/api/v1/RoleMenu/createUpdateAppUserMenu',
    '/api/v1/RoleMenu/deleteAppUserMenu',
    '/api/v1/RoleMenu/getAllParentMenus',
    '/api/v1/RoleMenu/getAppUserRoleMenuInitialData',
    '/api/v1/RoleMenu/getMenusByRoleId',
    '/api/v1/RoleMenu/getRoleMenusPagingWithSearch',
    '/api/v1/RoleMenu/saveUpdateRoleMenuBulk',
    '/api/v1/User/createUpdateAppUser',
    '/api/v1/User/getAllAppUserProfilePagingWithSearch',
    '/api/v1/User/getAppUserProfileById',
    '/api/v1/User/createUpdateAppUserProfile',
    '/api/v1/User/deleteAppUserProfile'
  ];
  let exludeFound = ExcludeURLList.filter((element) => {
    return req.url.includes(element);
  });
  if (!(exludeFound && exludeFound.length > 0)) {
    if (req.method == 'GET') {
      if (req.url.indexOf('?') > 0) {
        let encriptURL =
          req.url.slice(0, req.url.indexOf('?') + 1) +
          encryptDecryptService.encryptUsingAES256(
            req.url.slice(req.url.indexOf('?') + 1, req.url.length)
          );
        const cloneReq = req.clone({
          url: encriptURL,
        });
        return next(cloneReq);
      }
      return next(req);
    } else if (req.method == 'POST') {
      if (req.body || req.body.length > 0) {
        return next(req);
      }
      let data = req.body as FormData;
      return next(req);
    }
  }
  return next(req);
};
