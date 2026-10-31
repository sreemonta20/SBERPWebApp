import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EncryptDecryptService } from '../services/encrypt-decrypt.service';

/** Gateway URLs whose query string is sent as plain text. Built once, not on every request. */
const EXCLUDED_URLS: readonly string[] = [
  '/gateway/auth/authenticateUser',
  '/gateway/auth/getAppUserProfileMenu',
  '/gateway/auth/refreshToken',
  '/gateway/auth/revoke',
  '/gateway/rolemenu/getAllAppUserRoles',
  '/gateway/rolemenu/getAllAppUserRolesPagination',
  '/gateway/rolemenu/getAppUserRolesById',
  '/gateway/rolemenu/createUpdateAppUserRole',
  '/gateway/rolemenu/deleteAppUserRole',
  '/gateway/rolemenu/getAllAppUserMenuPagingWithSearch',
  '/gateway/rolemenu/getAllAppUserMenuByUserId',
  '/gateway/rolemenu/createUpdateAppUserMenu',
  '/gateway/rolemenu/deleteAppUserMenu',
  '/gateway/rolemenu/getAllParentMenus',
  '/gateway/rolemenu/getAppUserRoleMenuInitialData',
  '/gateway/rolemenu/saveUpdateRoleMenuBulk',
  '/gateway/rolemenu/getRoleMenusPagingWithSearch',
  '/gateway/user/createUpdateAppUser',
  '/gateway/user/getAllAppUserProfilePagingWithSearch',
  '/gateway/user/getAppUserProfileById',
  '/gateway/user/createUpdateAppUserProfile',
  '/gateway/user/deleteAppUserProfile',
];

/**
 * AES-encrypts the query string of GET requests whose URL carries one (url?a=1&b=2), except for the
 * URLs above. Every other request passes through unchanged.
 * (The old version also had a POST branch that did nothing except read `req.body.length`, which
 * threw a TypeError for a POST without a body.)
 */
export const EncryptDecryptAuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const queryStart = req.url.indexOf('?');
  if (req.method !== 'GET' || queryStart <= 0 || EXCLUDED_URLS.some((url) => req.url.includes(url))) {
    return next(req);
  }

  const encryptDecryptService = inject(EncryptDecryptService);
  const encryptedUrl =
    req.url.slice(0, queryStart + 1) + encryptDecryptService.encryptUsingAES256(req.url.slice(queryStart + 1));
  return next(req.clone({ url: encryptedUrl }));
};
