import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // public reactive signals for app components to read
  isLoggedIn = signal<boolean>(!!localStorage.getItem('auth_token'));
  role = signal<string | null>(localStorage.getItem('auth_role'));

  constructor(private http: HttpClient) {}

  signup(payload: any): Observable<any> {
    return this.http.post('/api/auth/signup', payload);
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post('/api/auth/login', credentials).pipe(
      tap((res: any) => {
        const token = res?.token;
        let role = res?.user?.role || res?.role || null;
        if (!role && token) {
          try {
            const parts = token.split('.');
            if (parts.length >= 2) {
              const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
              role = payload.role || payload.roles || payload.authority || payload.authorities || null;
              if (Array.isArray(role) && role.length > 0) role = role[0];
            }
          } catch (e) { /* ignore */ }
        }
        this.setAuth(token || null, role || null);
      })
    );
  }

  setAuth(token: string | null, role: string | null){
    try { if (token) localStorage.setItem('auth_token', token); else localStorage.removeItem('auth_token'); } catch(e) {}
    try { if (role) localStorage.setItem('auth_role', role); else localStorage.removeItem('auth_role'); } catch(e) {}
    this.isLoggedIn.set(!!token);
    this.role.set(role);
  }

  logout(){ this.setAuth(null, null); }

  getProfile(){ return this.http.get('/api/auth/me'); }

  getToken(): string | null { return localStorage.getItem('auth_token'); }
}
