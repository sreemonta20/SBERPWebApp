import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
} from '@angular/common/http';
import { from, Observable, switchMap, of } from 'rxjs';
import { CommonService } from '@app/core/services/index';

// Track refresh attempts globally to prevent multiple parallel refresh calls
let accessToken = '';

export const AuthReqInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const commonService = inject(CommonService);

  try {
    const hasAuthorizationHeader = req.headers.has('Authorization');

    if (!hasAuthorizationHeader) {
      commonService.GetAccessToken().subscribe((access_token) => {
        accessToken = access_token;
      });

      if (commonService.isValid(accessToken)) {
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        return next(clonedRequest);
      }
    }
  } catch (err) {
    console.error('Auth interceptor error:', err);
  }

  return next(req);
};
