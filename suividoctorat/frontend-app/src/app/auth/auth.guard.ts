import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // Prefer server-side validation if available, otherwise fallback to local check
    return this.auth.validateToken().pipe(
      map(valid => {
        if (!valid) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      }),
      catchError(() =>
        this.auth.isAuthenticated().pipe(
          map(isAuth => {
            if (!isAuth) {
              this.router.navigate(['/login']);
              return false;
            }
            return true;
          })
        )
      )
    );
  }
}
