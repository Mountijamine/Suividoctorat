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
  private parseJwt(token: string | null){ 
    if (!token) return null; 
    try { 
      const parts = token.split('.'); 
      if (parts.length < 2) return null; 
      const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/'))); 
      return payload; 
    } catch(e){ 
      console.error('[AuthService] Failed to parse JWT:', e);
      return null; 
    } 
  }

  isTokenExpired(): boolean {
    const t = this.getToken(); 
    if (!t) {
      console.log('[AuthService] No token found');
      return true; 
    }
    const p = this.parseJwt(t); 
    if (!p) {
      console.log('[AuthService] Failed to parse token');
      return true; 
    }
    if (!p.exp) {
      console.log('[AuthService] Token has no expiration claim');
      return true; 
    }
    const now = Math.floor(Date.now() / 1000); 
    const isExpired = p.exp < now;
    console.log('[AuthService] Token expiration check - exp:', new Date(p.exp * 1000), 'now:', new Date(now * 1000), 'expired:', isExpired);
    return isExpired;
  }

  // call at app startup to clear expired token
  logoutIfExpired(){ try { if (this.isTokenExpired()) { this.setAuth(null, null); return true; } } catch(e){} return false; }

  signup(payload: any): Observable<any> {
    return this.http.post('/gestion-auth-service/api/auth/signup', payload);
  }

  // set the user's role immediately (for candidat selection)
  updateRole(role: string){
    // try an authenticated endpoint; backend should accept { role }
    return this.http.patch('/gestion-auth-service/api/auth/role', { role }).pipe(
      tap((res: any) => {
        // Backend returns a refreshed token and roles; update local storage and signals
        const token = res?.token || this.getToken();
        let newRole: string | null = null;
        try {
          const roles = res?.roles || (res?.roles instanceof Array ? res.roles : null);
          if (roles && Array.isArray(roles) && roles.length > 0) newRole = roles[0];
          else if (res?.role) newRole = res.role;
        } catch (e) { newRole = role; }
        this.setAuth(token || null, newRole || role);
      })
    );
  }

  // request elevated role - sent to admins for approval
  // Accept optional http options so callers can request progress events for large uploads
  requestRole(payload: any, options?: any){
    // payload should contain role and any extra fields
    return this.http.post('/gestion-auth-service/api/auth/role-requests', payload, options || {});
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

  // send a fresh verification code (when user triggers resend)
  sendVerificationCode(email: string): Observable<any> {
    return this.http.post('/gestion-auth-service/api/auth/send-verification-code', { email });
  }

  // verify a code (user enters code from email)
  verifyCode(email: string, code: string): Observable<any> {
    return this.http.post('/gestion-auth-service/api/auth/verify-code', { email, code });
  }

  // confirm via token (link click)
  confirmEmail(token: string): Observable<any> {
    return this.http.get('/gestion-auth-service/api/auth/confirm', { params: { token } });
  }

  // Request password reset: send reset link to email
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post('/gestion-auth-service/api/auth/password-reset/request', { email });
  }

  // Confirm password reset: consume token and set new password
  confirmPasswordReset(token: string, password: string, confirmPassword: string): Observable<any> {
    return this.http.post('/gestion-auth-service/api/auth/password-reset/confirm', { token, password, confirmPassword });
  }

  // Confirm password reset using code + email (alternative)
  confirmPasswordResetWithCode(email: string, code: string, password: string, confirmPassword: string): Observable<any> {
    return this.http.post('/gestion-auth-service/api/auth/password-reset/confirm', { email, code, password, confirmPassword });
  }

  // Change password for logged in user
  changePassword(oldPassword: string, newPassword: string, confirmNewPassword: string): Observable<any> {
    return this.http.post('/gestion-auth-service/api/auth/change-password', { oldPassword, newPassword, confirmNewPassword });
  }

  // Send a notification email via backend proxy (keeps internal secret hidden)
  sendNotification(payload: any) {
    return this.http.post('/gestion-auth-service/api/auth/notify/email', payload);
  }

  setAuth(token: string | null, role: string | null){
    try { 
      if (token) {
        localStorage.setItem('auth_token', token); 
        console.log('[AuthService] Token saved to localStorage');
      } else {
        localStorage.removeItem('auth_token'); 
        console.log('[AuthService] Token removed from localStorage');
      }
    } catch(e) { console.error('[AuthService] Failed to save token:', e); }
    try { 
      if (role) {
        localStorage.setItem('auth_role', role); 
        console.log('[AuthService] Role saved:', role);
      } else {
        localStorage.removeItem('auth_role'); 
      }
    } catch(e) {}
    this.isLoggedIn.set(!!token);
    this.role.set(role);
    // synchronize cookie fallback whenever auth changes
    try { this.setCookieFallback(token); } catch(e) {}
  }

  logout(){ this.setAuth(null, null); }

  getProfile(){ return this.http.get('/gestion-auth-service/api/auth/me'); }

  // fetch current user's role requests
  getMyRoleRequests(){ return this.http.get<any[]>('/gestion-auth-service/api/auth/role-requests/mine'); }

  // cancel a pending role request (by id)
  cancelRoleRequest(id: number){ return this.http.post('/gestion-auth-service/api/auth/role-requests/' + id + '/cancel', {}); }

  getToken(): string | null { return localStorage.getItem('auth_token'); }

  // central cookie fallback: when token is set/cleared update JWT cookie so backend TokenFilter
  // can authenticate requests even if Authorization header is missing (single place only).
  public setCookieFallback(token: string | null) {
    try {
      if (token) {
        // set cookie for root path; HttpOnly not possible from JS but backend accepts cookie named JWT
        document.cookie = 'JWT=' + token + ';path=/';
      } else {
        // delete cookie
        document.cookie = 'JWT=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    } catch (e) { /* ignore in environments without document */ }
  }
}
