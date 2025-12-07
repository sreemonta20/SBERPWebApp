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
import {
  BehaviorSubject,
  Observable,
  throwError,
  combineLatest,
  from
} from 'rxjs';
import {
  catchError,
  filter,
  switchMap,
  take
} from 'rxjs/operators';

import { CommonService } from '../services/common.service';      // adjust if needed
import { AuthService } from '../services/auth.service';          // adjust if needed
import { RefreshTokenRequest } from '@app/core/class';

// ---- global flags to coordinate refresh ----
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

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

export const AuthReqInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const commonService = inject(CommonService);
  const authService = inject(AuthService);

  // Don’t attach tokens / refresh on auth endpoints themselves
  const lowerUrl = req.url.toLowerCase();
  const isAuthUrl =
    lowerUrl.includes('/Auth/authenticateUser') ||
    lowerUrl.includes('/Auth/refreshToken') ||
    lowerUrl.includes('/Auth/revoke');

  if (isAuthUrl) {
    return next(req);
  }

  // Get current access + refresh tokens (one-time emission)
  return combineLatest([
    commonService.GetAccessToken(),
    commonService.GetRefreshToken()
  ]).pipe(
    take(1),
    switchMap(([accessToken, refreshToken]) => {
      debugger
      console.log(accessToken);
      console.log(refreshToken);
      const authReq = addAuthHeader(req, accessToken);

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          debugger
          // If it’s not 401, just propagate
          console.log(error.status);
          if (error.status !== 401) { 
            return throwError(() => error);
          }
          debugger
          // Check if this 401 is due to an expired token
          console.log(error.headers?.get('Token-Expired'));
          const tokenExpiredHeader = error.headers?.get('Token-Expired') ?? '';
          const isTokenExpired =
            tokenExpiredHeader === 'true' ||
            error.error?.error === 'invalid_token';

          if (!isTokenExpired || !refreshToken) {
            // No refresh token or not an expiry -> logout
            authService.logout();
            return throwError(() => error);
          }

          // ---- handle refresh flow ----
          if (!isRefreshing) {
            isRefreshing = true;
            refreshTokenSubject.next(null);

            const refreshReq: RefreshTokenRequest = {
              Access_Token: accessToken,
              Refresh_Token: refreshToken
            };

            // Use your existing async refresh method (it updates CommonService)
            return from(authService.refreshTokenAsync(refreshReq)).pipe(
              switchMap((success: boolean) => {
                isRefreshing = false;

                if (!success) {
                  authService.logout();
                  return throwError(() => error);
                }

                // Wait for CommonService to publish the new access token
                return commonService.GetAccessToken().pipe(
                  take(1),
                  switchMap((newAccessToken) => {
                    refreshTokenSubject.next(newAccessToken);
                    const retryReq = addAuthHeader(req, newAccessToken);
                    return next(retryReq);
                  })
                );
              }),
              catchError((refreshErr) => {
                isRefreshing = false;
                authService.logout();
                return throwError(() => refreshErr);
              })
            );
          } else {
            // A refresh is already in progress: wait for it to complete
            return refreshTokenSubject.pipe(
              filter((token) => token != null),
              take(1),
              switchMap((newToken) => {
                const retryReq = addAuthHeader(req, newToken);
                return next(retryReq);
              })
            );
          }
        })
      );
    })
  );
};
