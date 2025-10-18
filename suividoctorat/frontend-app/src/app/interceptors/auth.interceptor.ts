import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('auth_token');
    try { console.debug('[AuthInterceptor] url=', req.url, ' tokenPresent=', !!token); } catch(e){}
    let outReq = req;
    if (token) {
      outReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
    return next.handle(outReq).pipe(
      catchError((err:any) => {
        try {
          const router = this.injector.get(Router);
          const auth = this.injector.get(AuthService);
          // if token expired or unauthorized, clear auth and redirect to login
          if (err && (err.status === 401 || err.status === 403)){
            console.warn('[AuthInterceptor] response status', err.status, '— logging out');
            auth.setAuth(null, null);
            try{ router.navigate(['/auth'], { queryParams: { sessionExpired: '1' } }); } catch(e){}
          }
        } catch(e){}
        return throwError(() => err);
      })
    );
  }
}
