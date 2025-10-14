import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginResp { token?: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = '/api';
  private tokenKey = 'jwt';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResp> {
    const body = { email, password };
    return this.http.post<LoginResp>(`${this.api}/auth/login`, body).pipe(
      tap(res => {
        if ((res as any).token) {
          localStorage.setItem(this.tokenKey, (res as any).token);
        }
      })
    );
  }

  signup(payload: any): Observable<any> {
    return this.http.post(`${this.api}/auth/signup`, payload);
  }

  logout() { localStorage.removeItem(this.tokenKey); }
  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  isAuthenticated(): Observable<boolean> { return of(!!this.getToken()); }

  // Optional: call backend to validate token. Not all backends expose this; it's best-effort.
  validateToken(): Observable<boolean> {
    return this.http.get<boolean>(`${this.api}/auth/validate`);
  }
}
