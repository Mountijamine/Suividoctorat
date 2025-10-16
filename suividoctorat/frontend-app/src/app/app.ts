import { Component, computed, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="app-root">
      <header style="background:#fff; border-bottom:1px solid #eef2f7; padding:0.5rem 1rem;">
        <div style="max-width:1200px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:1rem">
          <div style="display:flex; align-items:center; gap:1rem">
            <a href="#/" style="font-weight:700; color:#0f172a; text-decoration:none">Portail Doctorat</a>
            <nav style="display:flex; gap:0.5rem; align-items:center">
              <a routerLink="/" style="color:#374151; text-decoration:none; padding:0.4rem 0.6rem; border-radius:6px">Tableau de bord</a>
              <a routerLink="/auth" style="color:#374151; text-decoration:none; padding:0.4rem 0.6rem; border-radius:6px">Inscription</a>
              <a routerLink="/" style="color:#374151; text-decoration:none; padding:0.4rem 0.6rem; border-radius:6px">Soutenance</a>
              <a routerLink="/" style="color:#374151; text-decoration:none; padding:0.4rem 0.6rem; border-radius:6px">Documents</a>
              <ng-container *ngIf="(role() || '').toLowerCase().includes('admin')">
                <a routerLink="/admin" style="color:#374151; text-decoration:none; padding:0.4rem 0.6rem; border-radius:6px">Admin</a>
              </ng-container>
            </nav>
          </div>
          <div style="display:flex; align-items:center; gap:1rem">
            <ng-container *ngIf="isLoggedIn()">
              <a routerLink="/dashboard" style="background:linear-gradient(90deg,#7c3aed,#06b6d4); color:#fff; padding:0.4rem 0.8rem; border-radius:8px; text-decoration:none">Mon espace</a>
              <button (click)="logout()" style="background:transparent; border:0; cursor:pointer; color:#ef4444">Se déconnecter</button>
            </ng-container>
            <ng-container *ngIf="!isLoggedIn()">
              <a routerLink="/auth" style="padding:0.4rem 0.8rem; border-radius:8px; text-decoration:none; color:#0f172a">Se connecter</a>
            </ng-container>
          </div>
        </div>
      </header>

      <div style="min-height:calc(100vh - 64px)">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`.app-root { font-family: Inter, Arial, Helvetica, sans-serif; min-height: 100vh; margin:0; } a { cursor:pointer }`]
})

export class App {
  isLoggedIn = signal(!!localStorage.getItem('auth_token'));
  role = signal<string | null>(localStorage.getItem('auth_role'));

  constructor(private router: Router) {}

  ngOnInit(){
    try { const r = localStorage.getItem('auth_role'); this.role.set(r); this.isLoggedIn.set(!!localStorage.getItem('auth_token')); } catch(e) { }
  }

  logout(){
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    this.isLoggedIn.set(false);
    this.role.set(null);
    this.router.navigate(['/auth']);
  }
}
