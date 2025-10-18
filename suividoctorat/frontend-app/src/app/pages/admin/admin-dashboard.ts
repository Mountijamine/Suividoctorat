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
    .requests { margin-top:1rem; background:#fff; padding:0.75rem; border-radius:10px }
    .req { display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0; border-bottom:1px solid #f3f4f6 }
    .req:last-child{ border-bottom:0 }
    @media (max-width:600px){ .header{ flex-direction:column; align-items:flex-start } }
  `]
})
export class AdminDashboard {
  users = signal<Array<any>>([]);
  loading = signal(false);
  requests = signal<Array<any>>([]);

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

    // fetch pending role requests
    this.http.get('/api/auth/role-requests').subscribe({ next: (res:any) => { this.requests.set(Array.isArray(res) ? res : (res?.data || [])); }, error: () => { this.requests.set([]); } });
  }

  initials(u:any){ return ((u.firstName||'')[0] || '') + ((u.lastName||'')[0] || '') }

  approveRequest(r: any){
    this.http.post(`/api/auth/role-requests/${r.id}/approve`, {}).subscribe({ next: () => { this.fetchUsers(); }, error: () => { alert('Failed to approve'); } });
  }

  rejectRequest(r: any){
    this.http.post(`/api/auth/role-requests/${r.id}/reject`, {}).subscribe({ next: () => { this.fetchUsers(); }, error: () => { alert('Failed to reject'); } });
  }
}
