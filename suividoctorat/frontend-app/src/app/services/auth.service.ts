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

  // helper: check if stored token is expired (JWT exp claim)
  private parseJwt(token: string | null){ if (!token) return null; try { const parts = token.split('.'); if (parts.length < 2) return null; const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/'))); return payload; } catch(e){ return null; } }

  isTokenExpired(): boolean {
    const t = this.getToken(); if (!t) return true; const p = this.parseJwt(t); if (!p) return true; if (!p.exp) return true; const now = Math.floor(Date.now() / 1000); return p.exp <= now; }

  // call at app startup to clear expired token
  logoutIfExpired(){ try { if (this.isTokenExpired()) { this.setAuth(null, null); return true; } } catch(e){} return false; }

  signup(payload: any): Observable<any> {
    return this.http.post('/gestion-auth-service/api/auth/signup', payload);
  }

  // set the user's role immediately (for candidat selection)
  updateRole(role: string){
    // try an authenticated endpoint; backend should accept { role }
    try { return this.http.patch('/gestion-auth-service/api/auth/role', { role }); } catch(e:any){ throw e; }
  }

  // request elevated role - sent to admins for approval
  requestRole(payload: any){
    // payload should contain role and any extra fields
    return this.http.post('/gestion-auth-service/api/auth/role-requests', payload);
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post('/gestion-auth-service/api/auth/login', credentials).pipe(
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

  getProfile(){ return this.http.get('/gestion-auth-service/api/auth/me'); }

  getToken(): string | null { return localStorage.getItem('auth_token'); }
}
