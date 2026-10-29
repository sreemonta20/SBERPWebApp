// import { inject } from '@angular/core';
// import {
//   HttpRequest,
//   HttpHandlerFn,
//   HttpEvent,
//   HttpInterceptorFn,
// } from '@angular/common/http';
// import { from, Observable, switchMap, of } from 'rxjs';
// import { CommonService } from '@app/core/services/index';

// let accessToken = '';

// export const AuthReqInterceptor: HttpInterceptorFn = (
//   req: HttpRequest<any>,
//   next: HttpHandlerFn
// ): Observable<HttpEvent<any>> => {
//   const commonService = inject(CommonService);

//   try {
//     const hasAuthorizationHeader = req.headers.has('Authorization');

//     if (!hasAuthorizationHeader) {
//       commonService.GetAccessToken().subscribe((access_token) => {
//         accessToken = access_token;
//       });

//       if (commonService.isValid(accessToken)) {
//         const clonedRequest = req.clone({
//           setHeaders: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         });
//         return next(clonedRequest);
//       }
//     }
//   } catch (err) {
//     console.error('Auth interceptor error:', err);
//   }

//   return next(req);
// };
// auth.req.interceptor.ts
import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';

import { CommonService } from '../services/common.service';
import { AuthService } from '../services/auth.service';

// Anonymous auth endpoints, in lower case: they are compared with the lower-cased request URL.
const LOGIN_URL = '/gateway/auth/authenticateuser';
const REFRESH_URL = '/gateway/auth/refreshtoken';
const REVOKE_URL = '/gateway/auth/revoke';

// helper: add Authorization header if we have a token
function addAuthHeader(
  req: HttpRequest<any>,
  token: string | null | undefined
): HttpRequest<any> {
  if (!token) {
    return req;
  }

  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Adds the access token to every API call. When a call fails because the access token expired
 * (401 + "Token-Expired" header from the gateway / service), the token is refreshed once and the
 * call is retried. Refreshing is single-flight in AuthService: the server rotates the refresh
 * token, so parallel refreshes would present an already used token and end the session.
 * Any other 401 (token revoked, user signed out elsewhere) logs the user out.
 */
export const AuthReqInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const commonService = inject(CommonService);
  const authService = inject(AuthService);

  const lowerUrl = req.url.toLowerCase();

  // login / refresh: no token, and never a refresh because of them
  if (lowerUrl.includes(LOGIN_URL) || lowerUrl.includes(REFRESH_URL)) {
    return next(req);
  }

  return commonService.GetAccessToken().pipe(
    take(1),
    switchMap((accessToken) => {
      const authReq = addAuthHeader(req, accessToken);

      // logout: send the access token so the server blacklists it, but do not refresh for it
      if (lowerUrl.includes(REVOKE_URL)) {
        return next(authReq);
      }

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status !== 401) {
            return throwError(() => error);
          }

          const isTokenExpired =
            error.headers?.get('Token-Expired') === 'true' ||
            error.error?.error === 'invalid_token';

          if (!isTokenExpired) {
            authService.logout();
            return throwError(() => error);
          }

          return from(authService.getFreshAccessToken(accessToken)).pipe(
            switchMap((newAccessToken) => {
              if (!newAccessToken) {
                authService.logout();
                return throwError(() => error);
              }
              return next(addAuthHeader(req, newAccessToken));
            })
          );
        })
      );
    })
  );
};
