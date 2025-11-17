import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'encadrant-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './encadrant-navbar.html',
  styles: [`
    /* ========== CSS Variables ========== */
    :host {
      --navbar-height: 64px;
      --color-primary: #1e40af;
      --color-bg: #ffffff;
      --color-border: #e5e7eb;
      --color-text: #111827;
      --color-text-secondary: #6b7280;
      --color-hover: #f3f4f6;
      --color-active: #e5e7eb;
      --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      --transition: all 0.2s ease;
      display: block;
    }

    /* Dark mode support */
    :host-context(.dark) {
      --color-bg: #1f2937;
      --color-border: #374151;
      --color-text: #f9fafb;
      --color-text-secondary: #9ca3af;
      --color-hover: #374151;
      --color-active: #4b5563;
    }

    /* ========== Navbar Container ========== */
    .navbar {
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      height: var(--navbar-height);
      padding: 0 1.5rem;
      background: var(--color-bg);
      border-bottom: 1px solid var(--color-border);
      box-shadow: var(--shadow);
      transition: var(--transition);
    }

    /* ========== Left Section ========== */
    .nav-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-shrink: 0;
    }

    .menu-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--color-text);
      border-radius: 8px;
      cursor: pointer;
      transition: var(--transition);
    }

    .menu-btn:hover {
      background: var(--color-hover);
    }

    .menu-btn:active {
      background: var(--color-active);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      user-select: none;
    }

    .brand-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      color: var(--color-primary);
    }

    .brand-text {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
      letter-spacing: -0.01em;
    }

    /* ========== Center Section ========== */
    .nav-center {
      flex: 1;
      display: flex;
      justify-content: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .search-container {
      position: relative;
      width: 100%;
      max-width: 500px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0 1rem;
      background: var(--color-hover);
      border: 1px solid var(--color-border);
      border-radius: 24px;
      transition: var(--transition);
    }

    .search-container:focus-within {
      background: var(--color-bg);
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
    }

    .search-icon {
      flex-shrink: 0;
      color: var(--color-text-secondary);
      transition: var(--transition);
    }

    .search-container:focus-within .search-icon {
      color: var(--color-primary);
    }

    .search-input {
      flex: 1;
      height: 40px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--color-text);
      font-size: 0.9375rem;
      outline: none;
    }

    .search-input::placeholder {
      color: var(--color-text-secondary);
    }

    /* ========== Right Section ========== */
    .nav-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .icon-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--color-text);
      border-radius: 50%;
      cursor: pointer;
      transition: var(--transition);
    }

    .icon-button:hover {
      background: var(--color-hover);
    }

    .icon-button:active {
      background: var(--color-active);
      transform: scale(0.95);
    }

    .profile-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      border: 2px solid var(--color-border);
      background: var(--color-hover);
      border-radius: 50%;
      cursor: pointer;
      overflow: hidden;
      transition: var(--transition);
    }

    .profile-button:hover {
      border-color: var(--color-primary);
      transform: scale(1.05);
    }

    .profile-button:active {
      transform: scale(0.95);
    }

    .profile-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .profile-initials {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
      color: #fff;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      user-select: none;
    }

    /* ========== Responsive Design ========== */
    @media (max-width: 768px) {
      .navbar {
        padding: 0 1rem;
        gap: 1rem;
      }

      .brand-text {
        display: none;
      }

      .nav-center {
        max-width: none;
      }

      .search-container {
        max-width: none;
      }
    }

    @media (max-width: 640px) {
      .navbar {
        gap: 0.75rem;
      }

      .nav-left {
        gap: 0.5rem;
      }

      .nav-right {
        gap: 0.25rem;
      }

      .search-container {
        padding: 0 0.75rem;
      }

      .icon-button {
        width: 36px;
        height: 36px;
      }

      .profile-button {
        width: 32px;
        height: 32px;
      }
    }

    /* ========== Accessibility ========== */
    @media (prefers-reduced-motion: reduce) {
      * {
        transition: none !important;
      }
    }

    /* Focus styles for keyboard navigation */
    .menu-btn:focus-visible,
    .icon-button:focus-visible,
    .profile-button:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    .search-input:focus {
      outline: none;
    }

    /* ========== Sidebar ========== */
    .sidebar-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100;
      pointer-events: none;
    }

    .sidebar-container.show {
      pointer-events: auto;
    }

    .sidebar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .sidebar-container.show .sidebar-overlay {
      opacity: 1;
      pointer-events: auto;
    }

    .sidebar {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 280px;
      background: var(--color-bg);
      border-right: 1px solid var(--color-border);
      box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-container.show .sidebar {
      transform: translateX(0);
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--color-border);
      background: var(--color-bg);
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .sidebar-brand-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      color: var(--color-primary);
    }

    .sidebar-brand-text {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
      letter-spacing: -0.01em;
    }

    .sidebar-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--color-text);
      border-radius: 8px;
      cursor: pointer;
      transition: var(--transition);
    }

    .sidebar-close:hover {
      background: var(--color-hover);
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1.5rem;
      color: var(--color-text);
      font-size: 0.9375rem;
      font-weight: 500;
      text-decoration: none;
      transition: var(--transition);
      border-left: 3px solid transparent;
      cursor: pointer;
    }

    .nav-item:hover {
      background: var(--color-hover);
      border-left-color: var(--color-primary);
    }

    .nav-item.active {
      background: var(--color-hover);
      border-left-color: var(--color-primary);
      color: var(--color-primary);
    }

    .nav-item-icon {
      flex-shrink: 0;
      color: var(--color-text-secondary);
      transition: var(--transition);
    }

    .nav-item:hover .nav-item-icon,
    .nav-item.active .nav-item-icon {
      color: var(--color-primary);
    }

    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--color-border);
      background: var(--color-bg);
    }

    .sidebar-user {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--color-hover);
      border-radius: 8px;
    }

    .sidebar-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid var(--color-border);
    }

    .sidebar-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .sidebar-avatar-initials {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
      color: #fff;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .sidebar-user-info {
      flex: 1;
      min-width: 0;
    }

    .sidebar-user-email {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 260px;
      }
    }

    /* ========== Profile Dropdown ========== */
    .profile-dropdown {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100;
    }

    .dropdown-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: transparent;
    }

    .dropdown-content {
      position: absolute;
      top: 70px;
      right: 1.5rem;
      width: 320px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      animation: dropdown-appear 0.2s ease;
    }

    @keyframes dropdown-appear {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem;
      text-align: center;
    }

    .dropdown-avatar-container {
      position: relative;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid var(--color-border);
    }

    .dropdown-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .dropdown-avatar-initials {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      font-weight: 600;
      color: #fff;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      user-select: none;
    }

    .dropdown-user-info {
      width: 100%;
    }

    .dropdown-email {
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--color-text);
      word-break: break-word;
    }

    .dropdown-divider {
      height: 1px;
      background: var(--color-border);
      margin: 0;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.875rem 1.25rem;
      border: none;
      background: transparent;
      color: var(--color-text);
      font-size: 0.9375rem;
      text-align: left;
      text-decoration: none;
      cursor: pointer;
      transition: var(--transition);
    }

    .dropdown-item:hover {
      background: var(--color-hover);
    }

    .dropdown-item svg {
      flex-shrink: 0;
      color: var(--color-text-secondary);
    }

    .dropdown-item span {
      flex: 1;
    }
  `]
})
export class EncadrantNavbarComponent implements OnInit {
  profileImage: string | null = null;
  userEmail: string | null = null;
  userName: string | null = null;
  userInitials: string = '';
  showProfileMenu = false;
  showSidebar = false;

  navItems = [
    { path: '/encadrant/dashboard', icon: 'home', label: 'Tableau de bord' },
    { path: '/soutenance', icon: 'presentation', label: 'Soutenances' },
    { path: '/encadrant/doctorants', icon: 'users', label: 'Mes Doctorants' },
    { path: '/encadrant/profile', icon: 'user', label: 'Profil' }
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    try {
      this.auth.getProfile().subscribe({
        next: (profile: any) => {
          this.profileImage = profile?.avatar || profile?.image || profile?.picture || null;
          this.userEmail = profile?.email || null;
          this.userName = profile?.firstName && profile?.lastName 
            ? `${profile.firstName} ${profile.lastName}` 
            : profile?.name || null;
          this.userInitials = this.generateInitials(this.userName, this.userEmail);
        },
        error: (err) => {
          console.error('[EncadrantNavbar] Failed to load profile:', err);
          this.profileImage = null;
          this.userEmail = null;
          this.userName = null;
          this.userInitials = this.generateInitials(null, this.userEmail);
        }
      });
    } catch (error) {
      console.error('[EncadrantNavbar] Error loading profile:', error);
      this.profileImage = null;
      this.userEmail = null;
      this.userName = null;
      this.userInitials = '?';
    }
  }

  generateInitials(name: string | null, email: string | null): string {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'E';
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.showSidebar = false;
    }
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
    if (this.showSidebar) {
      this.showProfileMenu = false;
    }
  }

  closeSidebar(): void {
    this.showSidebar = false;
  }

  toggleTheme(): void {
    try {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('[EncadrantNavbar] Error toggling theme:', error);
    }
  }

  changeLanguage(): void {
    try {
      const currentLang = localStorage.getItem('language') || 'fr';
      const newLang = currentLang === 'fr' ? 'en' : 'fr';
      localStorage.setItem('language', newLang);
    } catch (error) {
      console.error('[EncadrantNavbar] Error changing language:', error);
    }
  }

  logout(): void {
    try {
      this.auth.logout();
      this.showProfileMenu = false;
      try { this.router.navigate(['/auth/login']); } catch(e) { window.location.href = '/auth/login'; }
    } catch (error) {
      console.error('[EncadrantNavbar] Logout failed:', error);
      try { window.location.href = '/auth/login'; } catch(e) { /* ignore */ }
    }
  }

  onImageError(event: any): void {
    try {
      event.target.style.display = 'none';
    } catch (error) {
      console.error('[EncadrantNavbar] Error handling image error:', error);
    }
  }

  getNavIcon(icon: string): string {
    const icons: Record<string, string> = {
      home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" fill="none"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" stroke-width="2"/>',
      presentation: '<rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/><line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>',
      users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" fill="none"/>',
      user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/>'
    };
    return icons[icon] || '';
  }
}
