import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'user-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="nav-left">
        <div class="brand">
          <a routerLink="/" class="brand-text">Portail Doctorat</a>
        </div>
      </div>

      <div class="nav-center" aria-hidden="true">
        <!-- keep small visual center area for consistency with candidat navbar -->
      </div>

      <div class="nav-right">
        <button
          class="icon-button"
          title="Toggle theme"
          aria-label="Toggle dark mode"
          (click)="toggleTheme()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <button
          class="icon-button"
          title="Change language"
          aria-label="Language selector"
          (click)="changeLanguage()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>

        <button class="profile-button" title="Profile" aria-label="User profile" (click)="toggleProfileMenu()">
          <img *ngIf="profileImage" [src]="profileImage" alt="User profile" class="profile-image" (error)="profileImage = null" />
          <div *ngIf="!profileImage" class="profile-initials">{{ userInitials }}</div>
        </button>

        <div class="profile-dropdown" *ngIf="showProfileMenu" (click)="closeProfileMenu()">
          <div class="dropdown-overlay" (click)="closeProfileMenu()"></div>
          <div class="dropdown-content" (click)="$event.stopPropagation()">
            <a routerLink="/profile-selection" class="dropdown-item" (click)="closeProfileMenu()">Choisir votre profil</a>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" (click)="logout()">Se déconnecter</button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      --navbar-height: 64px;
      --color-primary: #1e40af;
      --color-bg: #ffffff;
      --color-border: #e5e7eb;
      --color-text: #111827;
      --color-text-secondary: #6b7280;
      --color-hover: #f3f4f6;
      --shadow: 0 1px 3px 0 rgba(0,0,0,0.06);
      display:block;
    }

    .navbar{
      position:sticky; top:0; z-index:50; display:flex; align-items:center; justify-content:space-between; gap:1rem; height:var(--navbar-height); padding:0 1.25rem; background:var(--color-bg); border-bottom:1px solid var(--color-border); box-shadow:var(--shadow);
    }

    .nav-left { display:flex; align-items:center; gap:1rem; }
    .brand-text { font-size:1.125rem; font-weight:600; color:var(--color-text); text-decoration:none }

    .nav-center{ flex:1; display:flex; justify-content:center; max-width:600px; }

    .nav-right{ display:flex; gap:0.6rem; align-items:center; }

    .btn-primary{ background:linear-gradient(90deg,#111827,#111827); color:#fff; padding:0.55rem 0.85rem; border-radius:8px; border:0; font-weight:600; text-decoration:none }
    .btn-primary:hover{ filter:brightness(0.98) }

    .btn-ghost{ background:transparent; border:1px solid #e6eef8; padding:0.45rem 0.8rem; border-radius:8px; cursor:pointer; color:var(--color-text); font-weight:600 }
    .btn-ghost:hover{ background:var(--color-hover) }

    @media (max-width:768px){ .brand-text{ display:none } .nav-center{ display:none } }

    /* Icon buttons and profile */
    .icon-button{ border:0; background:transparent; width:36px; height:36px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; color:var(--color-text) }
    .icon-button:hover{ background:var(--color-hover) }

    .profile-button{ border:0; background:transparent; width:36px; height:36px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; overflow:hidden }
    .profile-image{ width:32px; height:32px; border-radius:999px; object-fit:cover; border:2px solid #fff }
    .profile-initials{ width:32px; height:32px; border-radius:999px; background:#e6eef8; color:var(--color-text); display:flex; align-items:center; justify-content:center; font-weight:700 }

    .profile-dropdown{ position:relative }
    .profile-dropdown .dropdown-overlay{ position:fixed; inset:0; background:transparent }
    .profile-dropdown .dropdown-content{ position:absolute; right:0; top:48px; min-width:160px; background:var(--color-bg); border:1px solid var(--color-border); border-radius:8px; box-shadow:0 10px 30px rgba(2,6,23,0.08); padding:0.375rem; z-index:60 }
    .dropdown-item{ display:block; padding:0.6rem; color:var(--color-text); text-align:left; width:100%; background:transparent; border:0; cursor:pointer; text-decoration:none }
    .dropdown-item:hover{ background:var(--color-hover) }
    .dropdown-divider{ height:1px; background:var(--color-border); margin:0.35rem 0 }
  `]
})
export class UserNavbarComponent implements OnInit {
  profile: any = null;
  profileImage: string | null = null;
  showProfileMenu = false;
  language = 'fr';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    try {
      if (this.auth.getProfile) {
        this.auth.getProfile().subscribe({
          next: (res: any) => {
            this.profile = res || null;
            this.profileImage = this.profile?.avatar || null;
          },
          error: () => {
            this.profile = null;
            this.profileImage = null;
          }
        });
      }
    } catch (e) {
      this.profile = null;
      this.profileImage = null;
    }

    try {
      const stored = localStorage.getItem('lang');
      if (stored) this.language = stored;
    } catch(e){}
  }

  get userInitials(): string {
    const name = this.profile?.name || this.profile?.firstName || this.profile?.email || '';
    const parts = String(name).split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  toggleTheme() {
    try {
      const root = document.documentElement;
      const isDark = root.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {
      console.warn('[UserNavbar] toggleTheme failed', e);
    }
  }

  changeLanguage() {
    this.language = this.language === 'fr' ? 'en' : 'fr';
    try { localStorage.setItem('lang', this.language); } catch(e){}
    console.log('[UserNavbar] language set to', this.language);
  }

  toggleProfileMenu() { this.showProfileMenu = !this.showProfileMenu; }
  closeProfileMenu() { this.showProfileMenu = false; }

  logout() {
    this.auth.logout();
    this.closeProfileMenu();
    this.router.navigate(['/auth']);
  }
}
