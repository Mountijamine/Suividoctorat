import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="nav-left">
        <div class="brand">
          <div class="brand-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 3L3 9v8c0 7.732 5.076 13 13 13s13-5.268 13-13V9L16 3z" fill="currentColor" opacity="0.15"/>
              <path d="M16 3L3 9v8c0 7.732 5.076 13 13 13s13-5.268 13-13V9L16 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 11v7m0 3h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="brand-text">Admin Dashboard</span>
        </div>
      </div>

      <div class="nav-center">
        <div class="search-container">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input type="search" placeholder="Search..." aria-label="Search" class="search-input" />
        </div>
      </div>

      <div class="nav-right">
        <button class="icon-button" title="Toggle theme" aria-label="Toggle dark mode" (click)="toggleTheme()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <button class="icon-button" title="Change language" aria-label="Language selector" (click)="changeLanguage()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
            <a routerLink="/admin" class="dropdown-item" (click)="closeProfileMenu()">Gérer le système</a>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" (click)="logout()">Se déconnecter</button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host { --navbar-height:64px; --color-primary:#1e40af; --color-bg:#ffffff; --color-border:#e5e7eb; --color-text:#111827; --color-text-secondary:#6b7280; --color-hover:#f3f4f6; --shadow:0 1px 3px 0 rgba(0,0,0,0.1); display:block }
    .navbar{ position:sticky; top:0; z-index:50; display:flex; align-items:center; justify-content:space-between; gap:1.5rem; height:var(--navbar-height); padding:0 1.5rem; background:var(--color-bg); border-bottom:1px solid var(--color-border); box-shadow:var(--shadow) }
    .nav-left{ display:flex; align-items:center; gap:1rem; flex-shrink:0 }
    .brand{ display:flex; align-items:center; gap:0.625rem; user-select:none }
    .brand-icon{ display:flex; align-items:center; justify-content:center; width:32px; height:32px; color:var(--color-primary) }
    .brand-text{ font-size:1.125rem; font-weight:600; color:var(--color-text); letter-spacing:-0.01em }
    .nav-center{ flex:1; display:flex; justify-content:center; max-width:600px; margin:0 auto }
    .search-container{ position:relative; width:100%; max-width:500px; display:flex; align-items:center; gap:0.75rem; padding:0 1rem; background:var(--color-hover); border:1px solid var(--color-border); border-radius:24px; transition:all 0.2s }
    .search-container:focus-within{ background:var(--color-bg); border-color:var(--color-primary); box-shadow:0 0 0 3px rgba(30,64,175,0.1) }
    .search-icon{ flex-shrink:0; color:var(--color-text-secondary); transition:all 0.2s }
    .search-container:focus-within .search-icon{ color:var(--color-primary) }
    .search-input{ flex:1; height:40px; padding:0; border:none; background:transparent; color:var(--color-text); font-size:0.9375rem; outline:none }
    .search-input::placeholder{ color:var(--color-text-secondary) }
    .nav-right{ display:flex; align-items:center; gap:0.5rem; flex-shrink:0 }
    .icon-button{ display:flex; align-items:center; justify-content:center; width:40px; height:40px; padding:0; border:none; background:transparent; color:var(--color-text); border-radius:50%; cursor:pointer; transition:all 0.2s }
    .icon-button:hover{ background:var(--color-hover) }
    .profile-button{ display:flex; align-items:center; justify-content:center; width:36px; height:36px; padding:0; border:2px solid var(--color-border); background:var(--color-hover); border-radius:50%; cursor:pointer; overflow:hidden; transition:all 0.2s }
    .profile-button:hover{ border-color:var(--color-primary); transform:scale(1.05) }
    .profile-image{ width:100%; height:100%; object-fit:cover; display:block }
    .profile-initials{ width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:0.875rem; font-weight:600; color:#fff; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); user-select:none }
    .profile-dropdown{ position:fixed; top:0; left:0; right:0; bottom:0; z-index:100 }
    .dropdown-overlay{ position:absolute; top:0; left:0; right:0; bottom:0; background:transparent }
    .dropdown-content{ position:absolute; top:70px; right:1.5rem; width:200px; background:var(--color-bg); border:1px solid var(--color-border); border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.15); overflow:hidden; animation:dropdown-appear 0.2s ease }
    @keyframes dropdown-appear{ from{ opacity:0; transform:translateY(-8px) } to{ opacity:1; transform:translateY(0) } }
    .dropdown-item{ display:flex; align-items:center; gap:0.75rem; width:100%; padding:0.875rem 1.25rem; border:none; background:transparent; color:var(--color-text); font-size:0.9375rem; text-align:left; text-decoration:none; cursor:pointer; transition:all 0.2s }
    .dropdown-item:hover{ background:var(--color-hover) }
    .dropdown-divider{ height:1px; background:var(--color-border); margin:0 }
    @media (max-width:768px){ .navbar{ padding:0 1rem; gap:1rem } .brand-text{ display:none } .nav-center{ max-width:none } }
  `]
})
export class AdminNavbarComponent implements OnInit {
  profileImage: string | null = null;
  userInitials = 'A';
  showProfileMenu = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    try {
      this.auth.getProfile().subscribe({
        next: (profile: any) => {
          this.profileImage = profile?.avatar || null;
          const name = profile?.firstName || profile?.name || '';
          const email = profile?.email || '';
          this.userInitials = name ? name.substring(0, 2).toUpperCase() : (email ? email.substring(0, 2).toUpperCase() : 'A');
        },
        error: () => { this.profileImage = null; }
      });
    } catch (e) {}
  }

  toggleTheme() {
    try {
      document.body.classList.toggle('dark');
      localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    } catch (e) {}
  }

  changeLanguage() {
    try {
      const lang = localStorage.getItem('lang') || 'fr';
      const newLang = lang === 'fr' ? 'en' : 'fr';
      localStorage.setItem('lang', newLang);
      console.log('[AdminNavbar] Language:', newLang);
    } catch (e) {}
  }

  toggleProfileMenu() { this.showProfileMenu = !this.showProfileMenu; }
  closeProfileMenu() { this.showProfileMenu = false; }

  logout() {
    this.auth.logout();
    this.closeProfileMenu();
    this.router.navigate(['/auth']);
  }
}
