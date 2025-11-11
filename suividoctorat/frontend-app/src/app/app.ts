import { Component, computed, signal } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  template: `
    <div class="app-root">
      <!-- Hide header for users with role 'user' who need to select their profile -->
      <header class="app-header" *ngIf="showNavbar()">
        <div class="bar">
          <div class="left">
            <a class="brand" href="#/">Portail Doctorat</a>
          </div>

          <button class="hamburger" (click)="navOpen.set(!navOpen())" aria-label="Menu">☰</button>

          <nav class="nav-links" [class.open]="navOpen()">
            <a [routerLink]="getCandidatLink()" (click)="closeNav()">Tableau de bord</a>
            <a routerLink="/auth" (click)="closeNav()" *ngIf="!isLoggedIn()">Inscription</a>
            <a routerLink="/soutenance" (click)="closeNav()" *ngIf="isCandidat()">Soutenance</a>
            <ng-container *ngIf="isCandidat()">
              <a routerLink="/candidat/documents" (click)="closeNav()">Documents</a>
            </ng-container>
            <ng-container *ngIf="isAdmin()">
              <a routerLink="/admin" (click)="closeNav()">Admin</a>
            </ng-container>
          </nav>

          <div class="right">
            <ng-container *ngIf="isLoggedIn()">
              <a [routerLink]="getProfileLink()" class="profile-link" (click)="closeNav()" style="display:flex; align-items:center; gap:0.5rem; text-decoration:none">
                <img *ngIf="profile?.avatar" [src]="profile.avatar" alt="avatar" style="width:32px; height:32px; border-radius:999px; object-fit:cover; border:2px solid #fff" />
                <span class="cta">Mon espace</span>
              </a>
              <button (click)="logout()" class="logout">Se déconnecter</button>
            </ng-container>
            <ng-container *ngIf="!isLoggedIn()">
              <a routerLink="/auth" class="cta" (click)="closeNav()">Se connecter</a>
            </ng-container>
          </div>
        </div>
      </header>

      <div [style.min-height]="showNavbar() ? 'calc(100vh - 64px)' : '100vh'">
        <router-outlet></router-outlet>
      </div>
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
    // clear expired token at startup
    try { if (this.auth.logoutIfExpired()) { try{ this.router.navigate(['/auth'], { queryParams: { sessionExpired: '1' } }); }catch(e){} } } catch(e){}
    // attempt to load profile for header avatar/name
    try {
      this.auth.getProfile().subscribe({ next: (res:any) => { this.profile = res || null; }, error: () => { this.profile = null; } });
    } catch(e) { this.profile = null; }
  }

  // Helper methods for navbar visibility and role-based routing
  showNavbar(): boolean {
    const r = (this.role() || '').toLowerCase();
    // Hide navbar for users with role 'user' - they should only see profile-selection
    if (r === 'user' || r === '' || r === 'null' || r === 'undefined') {
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
