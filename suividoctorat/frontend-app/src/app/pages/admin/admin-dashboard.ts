import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './admin-dashboard.html',
  styles: [
    `
    .wrap { max-width:1200px; margin:1.5rem auto; padding:1rem }
    .header { display:flex; justify-content:space-between; align-items:center; gap:1rem }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; margin-top:1rem }
    .user-card { background:#fff; border-radius:12px; padding:1rem; box-shadow:0 8px 24px rgba(2,6,23,0.06); display:flex; flex-direction:column; gap:0.5rem }
    .avatar { width:48px; height:48px; border-radius:999px; background:linear-gradient(90deg,#7c3aed,#06b6d4); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700 }
    .meta { display:flex; gap:0.75rem; align-items:center }
    .role { font-size:0.85rem; color:#6b7280 }
    .actions { margin-top:auto; display:flex; gap:0.5rem }
    .btn { padding:0.4rem 0.6rem; border-radius:8px; border:0; cursor:pointer }
    .btn.outline{ background:transparent; border:1px solid #e6eef8 }
    @media (max-width:600px){ .header{ flex-direction:column; align-items:flex-start } }
  `]
})
export class AdminDashboard {
  users = signal<Array<any>>([]);
  loading = signal(false);

  constructor(private http: HttpClient) {
    this.fetchUsers();
  }

  fetchUsers(){
    this.loading.set(true);
    this.http.get('/api/admin/users').subscribe({
      next: (res:any) => { this.users.set(Array.isArray(res) ? res : (res?.data || [])); this.loading.set(false); },
      error: () => {
        // fallback mock data
        this.users.set([
          { id:1, firstName:'Marie', lastName:'Dubois', email:'marie@example.com', role:'candidat' },
          { id:2, firstName:'Jean', lastName:'Martin', email:'jean@example.com', role:'directeur' },
          { id:3, firstName:'Alice', lastName:'Durand', email:'alice@example.com', role:'candidat' }
        ]);
        this.loading.set(false);
      }
    });
  }

  initials(u:any){ return ((u.firstName||'')[0] || '') + ((u.lastName||'')[0] || '') }
}
