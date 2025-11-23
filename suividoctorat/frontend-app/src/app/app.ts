import { Component, computed, signal } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
   <!-- remove the <header ...> ... </header> block entirely -->

<div [style.min-height]="'100vh'">
  <router-outlet></router-outlet>
</div>
  `,
  styles: [`
    .app-root { font-family: Inter, Arial, Helvetica, sans-serif; min-height: 100vh; margin:0; }
    a { cursor:pointer }
    .app-header { background:#fff; border-bottom:1px solid #eef2f7; }
    .bar { max-width:1200px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:0.5rem 1rem }
    .brand { font-weight:700; color:#0f172a; text-decoration:none }
    .nav-links { display:flex; gap:0.5rem; align-items:center }
    .nav-links a { color:#374151; text-decoration:none; padding:0.4rem 0.6rem; border-radius:6px }
    .right { display:flex; gap:1rem; align-items:center }
    .cta { background:linear-gradient(90deg,#7c3aed,#06b6d4); color:#fff; padding:0.4rem 0.8rem; border-radius:8px; text-decoration:none }
    .logout { background:transparent; border:0; cursor:pointer; color:#ef4444 }
    .hamburger { display:none; background:transparent; border:0; font-size:1.25rem; cursor:pointer }

    /* Mobile styles */
    @media (max-width: 800px){
      .nav-links { display:none; position:absolute; left:0; right:0; top:56px; background:#fff; flex-direction:column; padding:1rem; box-shadow:0 8px 24px rgba(2,6,23,0.08) }
      .nav-links.open { display:flex }
      .hamburger { display:block }
      .bar { position:relative }
      .right { gap:0.5rem }
    }
  `]
})

export class App {
  // placeholders; actual references are set in constructor
  isLoggedIn: any;
  role: any;
  profile: any = null;
  navOpen = signal(false);

  constructor(private router: Router, public auth: AuthService) {
    this.isLoggedIn = this.auth.isLoggedIn;
    this.role = this.auth.role;
    
    // Log auth state on app initialization
    const token = this.auth.getToken();
    console.log('[App] Initializing - Token present:', !!token);
    console.log('[App] Initializing - Token value:', token ? token.substring(0, 20) + '...' : 'null');
    console.log('[App] Initializing - Role:', this.role());
    console.log('[App] Initializing - isLoggedIn signal:', this.isLoggedIn());
    
    // clear expired token at startup
    try { 
      if (this.auth.logoutIfExpired()) { 
        console.log('[App] Token was expired — cleared token (no redirect)');
        // Do not redirect to /auth automatically on startup; keep landing page public.
      } 
    } catch(e){
      console.error('[App] Error checking token expiration:', e);
    }
    
    // attempt to load profile for header avatar/name (only if logged in)
    if (this.isLoggedIn() && token) {
      console.log('[App] Attempting to load profile...');
      try {
        this.auth.getProfile().subscribe({ 
          next: (res:any) => { 
            this.profile = res || null; 
            console.log('[App] Profile loaded successfully:', res);
          }, 
          error: (err) => { 
            this.profile = null; 
            console.error('[App] Failed to load profile - Status:', err?.status, 'Message:', err?.message);
            console.error('[App] Error details:', err);
          } 
        });
      } catch(e) { 
        this.profile = null; 
        console.error('[App] Exception loading profile:', e);
      }
    } else {
      console.log('[App] Skipping profile load - not logged in');
    }
  }

  // Helper methods for navbar visibility and role-based routing
  showNavbar(): boolean {
    const r = (this.role() || '').toLowerCase();
    // Hide navbar for users with role 'user' - they should only see profile-selection
    // Also hide for candidat - they have their own Gmail-style navbar
    if (r === 'user' || r === '' || r === 'null' || r === 'undefined' || r.includes('candidat')) {
      return false;
    }
    return true;
  }

  isCandidat(): boolean {
    const r = (this.role() || '').toLowerCase();
    return r.includes('candidat');
  }

  isAdmin(): boolean {
    const r = (this.role() || '').toLowerCase();
    return r.includes('admin');
  }

  getCandidatLink(): string {
    return this.isCandidat() ? '/candidat/dashboard' : '/';
  }

  getProfileLink(): string {
    const r = (this.role() || '').toLowerCase();
    if (r.includes('candidat')) return '/candidat/profile';
    if (r.includes('admin')) return '/admin';
    return '/profile-selection';
  }

  logout(){
    this.auth.logout();
    this.navOpen.set(false);
    this.router.navigate(['/auth']);
  }

  closeNav(){ this.navOpen.set(false); }
}
