import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  /* request card layout */
  .requests-grid { display:flex; flex-direction:column; gap:0.75rem }
  .req-card { display:flex; gap:1rem; align-items:flex-start; padding:0.9rem; border-radius:10px; background:#fff; box-shadow:0 8px 20px rgba(2,6,23,0.03); border:1px solid #f3f4f6 }
  .req-media { display:flex; flex-direction:column; gap:0.5rem; width:120px }
  .thumb { width:120px; height:84px; border-radius:8px; overflow:hidden; background:#f8fafc; border:1px solid #eef2f7; display:flex; align-items:center; justify-content:center }
  .thumb img{ width:100%; height:100%; object-fit:cover; display:block; cursor:pointer }
  .req-body { flex:1; min-width:0 }
  .req-title { font-weight:700; color:#0f172a; margin-bottom:0.15rem }
  .req-meta { color:#6b7280; font-size:0.92rem; margin-bottom:0.4rem }
  .req-actions { display:flex; gap:0.5rem; align-items:center }
  .req-note { font-size:0.9rem; color:#475569 }
  .req-left { display:flex; gap:0.75rem; align-items:center }
  .req-thumb { width:84px; height:56px; border-radius:6px; background:#f8fafc; overflow:hidden; display:flex; align-items:center; justify-content:center; border:1px solid #eef2f7 }
  .req-thumb img{ max-width:100%; max-height:100%; object-fit:cover; cursor:pointer }
  .req-detail { max-width:720px }
    @media (max-width:600px){ .header{ flex-direction:column; align-items:flex-start } }
  `]
})
export class AdminDashboard {
  users = signal<Array<any>>([]);
  loading = signal(false);
  requests = signal<Array<any>>([]);
  requestsError = signal<string | null>(null);
  requestCounts = signal<Record<string, number>>({} as any);
  expandedUsers = signal<Record<number, boolean>>({} as any);
  // view: 'users' | 'requests'
  view = signal<'users'|'requests'>('users');

  // modal state for approve/reject confirmation
  modalVisible = signal(false);
  modalAction: 'approve'|'reject'|null = null;
  modalRequest: any = null;
  // modalMessage used by template via ngModel, keep as plain property
  modalMessage: string = '';
  modalLoading = signal(false);
  modalNotify: boolean = false;

  constructor(private http: HttpClient) {
    this.fetchUsers();
  }

  fetchUsers(){
    this.loading.set(true);
    // ensure backend can read JWT from cookie if Authorization header is missing
    try { const t = localStorage.getItem('auth_token'); if (t) { document.cookie = 'JWT=' + t + ';path=/'; } } catch(e) {}

    this.http.get('/gestion-auth-service/api/admin/users').subscribe({
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
  // ensure cookie fallback so TokenFilter can authenticate if Authorization header was not attached
  try { const t2 = localStorage.getItem('auth_token'); if (t2) { document.cookie = 'JWT=' + t2 + ';path=/'; } } catch(e) {}

  this.http.get('/gestion-auth-service/api/auth/role-requests', { observe: 'response' as any }).subscribe({ next: (resp:any) => {
      const res = resp.body;
      const arr = Array.isArray(res) ? res : (res?.data || []);
      this.requests.set(arr);
      this.requestsError.set(null);
      // compute counts per user
      const counts: Record<string, number> = {};
      for (const r of arr) {
        const id = r.user?.id || r.userId || 'unknown';
        counts[id] = (counts[id] || 0) + 1;
      }
      this.requestCounts.set(counts);
    }, error: (err:any) => {
      console.error('[AdminDashboard] failed to fetch role-requests', err);
      const msg = err?.status ? (`${err.status} ${err.statusText || ''}`) : 'Network error';
      this.requestsError.set(msg + (err?.error && typeof err.error === 'string' ? (': ' + err.error) : ''));
      this.requests.set([]);
      this.requestCounts.set({} as any);
    } });
  }

  initials(u:any){ return ((u.firstName||'')[0] || '') + ((u.lastName||'')[0] || '') }

  toggleUserRequests(u:any){
    const map = { ...(this.expandedUsers() || {}) };
    map[u.id] = !map[u.id];
    this.expandedUsers.set(map);
  }

  // Helpers to extract front/back image URLs from a request object.
  getFrontUrl(r: any): string | null {
    if (!r) return null;
    // common fields returned by backend
    return r.frontIdUrl || r.frontUrl || (r.files && r.files.find((f: any) => f.field === 'frontId')?.url) || null;
  }

  getBackUrl(r: any): string | null {
    if (!r) return null;
    return r.backIdUrl || r.backUrl || (r.files && r.files.find((f: any) => f.field === 'backId')?.url) || null;
  }

  // Open a file/url in a new tab (used by image thumbnails)
  openFile(url: string | null | undefined){
    if (!url) return;
    try { window.open(url, '_blank'); } catch(e){ console.warn('openFile failed', e); }
  }

  // Return requests for a given user id
  getRequestsForUser(userId: number){
    const all = this.requests() || [];
    return all.filter(r => {
      const rid = (r.user && r.user.id) ? r.user.id : (r.userId || null);
      return rid === userId;
    });
  }

  // open confirmation modal for approve/reject
  openConfirm(r: any, action: 'approve'|'reject'){
    this.modalRequest = r;
    this.modalAction = action;
    this.modalMessage = '';
    this.modalNotify = false;
    this.modalVisible.set(true);
  }

  // confirm modal action
  confirmModal(){
    if (!this.modalRequest || !this.modalAction) return;
    const id = this.modalRequest.id;
    this.modalLoading.set(true);
  const payload = { reason: this.modalMessage, notifyByEmail: this.modalNotify };
  // set cookie fallback before calling approve/reject so backend TokenFilter can authenticate
  try { const t3 = localStorage.getItem('auth_token'); if (t3) { document.cookie = 'JWT=' + t3 + ';path=/'; } } catch(e) {}
  const call = this.http.post(`/gestion-auth-service/api/auth/role-requests/${id}/${this.modalAction}`, payload);
    call.subscribe({ next: () => {
      // optional message
      const msg = this.modalMessage;
      if (msg && msg.trim().length > 0){
        this.http.post(`/gestion-auth-service/api/auth/role-requests/${id}/message`, { message: msg }).subscribe({ next: () => {}, error: () => {} });
      }
      this.modalLoading.set(false);
      this.modalVisible.set(false);
      this.modalAction = null;
      this.modalRequest = null;
      this.fetchUsers();
    }, error: () => { this.modalLoading.set(false); alert('Operation failed'); } });
  }

  cancelModal(){ this.modalVisible.set(false); this.modalAction = null; this.modalRequest = null; this.modalMessage = ''; }

  // compatibility methods used in template
  approveRequest(r: any){ this.openConfirm(r, 'approve'); }
  rejectRequest(r: any){ this.openConfirm(r, 'reject'); }

  sendMessage(r: any){
    const m = prompt('Message to ' + (r.user?.email || 'user') + ':');
    if (!m) return;
    this.http.post(`/gestion-auth-service/api/auth/role-requests/${r.id}/message`, { message: m }).subscribe({ next: () => { alert('Message sent'); }, error: () => { alert('Failed to send message'); } });
  }
}
