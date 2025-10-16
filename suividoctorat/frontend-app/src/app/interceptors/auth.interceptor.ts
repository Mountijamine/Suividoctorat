import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('auth_token');
    // DEBUG: log token presence and request url (temporary)
    try { console.debug('[AuthInterceptor] url=', req.url, ' tokenPresent=', !!token); } catch(e){}
    if (token) {
      const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      try { console.debug('[AuthInterceptor] attaching Authorization header for', req.url); } catch(e){}
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}
