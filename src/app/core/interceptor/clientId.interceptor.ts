import { HttpRequest, HttpHandlerFn, HttpInterceptorFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const ClientIdInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  let clientId = localStorage.getItem('sberp.clientId');
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem('sberp.clientId', clientId);
  }

  const cloned = req.clone({
    setHeaders: { ClientId: clientId }
  });

  return next(cloned);
};