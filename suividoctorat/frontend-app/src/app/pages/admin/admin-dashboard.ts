import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminNavbarComponent } from '../../components/navbar/admin-navbar';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbarComponent],
  templateUrl: './admin-dashboard.html',
  styles: [
    `
    .wrap { max-width:1400px; margin:1.5rem auto; padding:1rem; display:flex; gap:1.5rem }
    .sidebar { width:280px; flex-shrink:0 }
    .main-content { flex:1; min-width:0 }
    .header { display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:1.5rem }
    .filter-card { background:#fff; border-radius:12px; padding:1.25rem; box-shadow:0 2px 8px rgba(0,0,0,0.04); border:1px solid #f3f4f6; margin-bottom:1rem }
    .filter-title { font-weight:700; font-size:0.95rem; color:#0f172a; margin-bottom:1rem }
    .search-box { width:100%; padding:0.65rem; border:1px solid #e6eef8; border-radius:8px; font-size:0.9rem; margin-bottom:0; box-sizing:border-box; display:block }
    .search-box:focus { outline:none; border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.1) }
    .filter-group { margin-bottom:1.25rem }
    .filter-group:last-child { margin-bottom:0 }
    .filter-label { font-size:0.875rem; font-weight:600; color:#374151; margin-bottom:0.5rem; display:block }
    .filter-option { display:flex; align-items:center; gap:0.5rem; padding:0.5rem 0.75rem; border-radius:6px; cursor:pointer; transition:all 0.15s; margin-bottom:0.25rem }
    .filter-option:hover { background:#f8fafc }
    .filter-option.active { background:#eff6ff; color:#1e40af; font-weight:600 }
    .filter-option input[type="radio"] { margin:0; cursor:pointer }
    .horizontal-filters { background:#fff; border-radius:12px; padding:1rem; box-shadow:0 2px 8px rgba(0,0,0,0.04); border:1px solid #f3f4f6; margin-bottom:1rem; display:flex; gap:1rem; align-items:center; flex-wrap:wrap }
    .h-filter-group { display:flex; gap:0.5rem; align-items:center }
    .h-filter-label { font-size:0.875rem; font-weight:600; color:#374151; white-space:nowrap }
    .h-search-box { padding:0.5rem 0.75rem; border:1px solid #e6eef8; border-radius:8px; font-size:0.875rem; min-width:250px; box-sizing:border-box }
    .h-search-box:focus { outline:none; border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.1) }
    .h-filter-btn { padding:0.5rem 1rem; border-radius:8px; border:1px solid #e6eef8; background:#fff; cursor:pointer; font-size:0.875rem; font-weight:500; color:#475569; transition:all 0.2s }
    .h-filter-btn:hover { background:#f8fafc; border-color:#cbd5e1 }
    .h-filter-btn.active { background:#0f172a; color:#fff; border-color:#0f172a }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem; margin-top:1rem }
    .user-card { background:#fff; border-radius:12px; padding:1.25rem; box-shadow:0 2px 8px rgba(0,0,0,0.04); border:1px solid #f3f4f6; display:flex; flex-direction:column; gap:0.75rem; transition:all 0.2s }
    .user-card:hover{ box-shadow:0 8px 24px rgba(2,6,23,0.08); border-color:#e6eef8 }
    .avatar { width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.1rem; flex-shrink:0 }
    .meta { display:flex; gap:0.875rem; align-items:flex-start }
    .role { font-size:0.875rem; color:#6b7280; margin-top:0.2rem }
    .actions { margin-top:auto; display:flex; gap:0.5rem; padding-top:0.5rem; border-top:1px solid #f3f4f6 }
    .btn { padding:0.5rem 0.85rem; border-radius:8px; border:0; cursor:pointer; font-size:0.875rem; font-weight:600; transition:all 0.2s }
    .btn:hover{ transform:translateY(-1px) }
    .btn.outline{ background:transparent; border:1px solid #e6eef8; color:#475569 }
    .btn.outline:hover{ background:#f8fafc; border-color:#cbd5e1 }
    .btn:not(.outline){ background:#0f172a; color:#fff }
    .btn:not(.outline):hover{ background:#1e293b }
  .requests { margin-top:1rem; background:#fff; padding:1rem; border-radius:12px; border:1px solid #f3f4f6; box-shadow:0 2px 8px rgba(0,0,0,0.04) }
  .requests h3{ font-size:1.125rem; font-weight:700; color:#0f172a; margin:0 0 1rem 0 }
  .requests-grid { display:flex; flex-direction:column; gap:1rem }
  .req-card { display:flex; gap:1.25rem; align-items:flex-start; padding:1.25rem; border-radius:12px; background:#fafbfc; border:1px solid #eef2f7; transition:all 0.2s }
  .req-card:hover{ background:#fff; border-color:#d1d5db; box-shadow:0 4px 12px rgba(0,0,0,0.06) }
  .req-media { display:flex; flex-direction:column; gap:0.625rem; width:130px; flex-shrink:0 }
  .thumb { width:130px; height:90px; border-radius:10px; overflow:hidden; background:#fff; border:1px solid #e6eef8; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.04); font-size:0.85rem; color:#9ca3af }
  .thumb img{ width:100%; height:100%; object-fit:cover; display:block; cursor:pointer; transition:transform 0.2s }
  .thumb img:hover{ transform:scale(1.05) }
  .req-body { flex:1; min-width:0 }
  .req-title { font-weight:700; color:#0f172a; margin-bottom:0.3rem; font-size:1.05rem }
  .req-meta { color:#6b7280; font-size:0.9rem; margin-bottom:0.5rem }
  .req-meta strong{ color:#374151 }
  .req-actions { display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap }
  .req-note { font-size:0.9rem; color:#475569; line-height:1.5; background:#fff; padding:0.75rem; border-radius:8px; margin-top:0.5rem }
  .req-note > div{ margin-bottom:0.25rem }
  .req-note strong{ color:#0f172a }
    @media (max-width:900px){ .wrap{ flex-direction:column } .sidebar{ width:100% } .header{ flex-direction:column; align-items:flex-start } .req-card{ flex-direction:column } .req-media{ width:100% } .thumb{ width:100%; max-width:200px } }
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

  // filters for requests
  searchQuery = signal('');
  selectedRole = signal<string>('all');
  selectedStatus = signal<string>('all');
  
  // filters for users
  userSearchQuery = signal('');
  userRoleFilter = signal<string>('all');
  
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
      next: (res:any) => { 
        const allUsers = Array.isArray(res) ? res : (res?.data || []);
        // Filter out admin@local user
        const filteredUsers = allUsers.filter((u: any) => u.email !== 'admin@local');
        this.users.set(filteredUsers); 
        this.loading.set(false); 
      },
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
    // Try multiple possible field names and structures
    if (r.frontIdUrl) return r.frontIdUrl;
    if (r.frontUrl) return r.frontUrl;
    if (r.frontIdPhotoUrl) return r.frontIdPhotoUrl;
    if (r.front_id_url) return r.front_id_url;
    // Check files array
    if (r.files && Array.isArray(r.files)) {
      const frontFile = r.files.find((f: any) => 
        f.field === 'frontId' || f.field === 'front_id' || f.type === 'frontId'
      );
      if (frontFile?.url) return frontFile.url;
      if (frontFile?.path) return frontFile.path;
    }
    // Check direct properties
    if (r.frontIdPhoto) return r.frontIdPhoto;
    console.log('[getFrontUrl] No front URL found for request:', r);
    return null;
  }

  getBackUrl(r: any): string | null {
    if (!r) return null;
    // Try multiple possible field names and structures
    if (r.backIdUrl) return r.backIdUrl;
    if (r.backUrl) return r.backUrl;
    if (r.backIdPhotoUrl) return r.backIdPhotoUrl;
    if (r.back_id_url) return r.back_id_url;
    // Check files array
    if (r.files && Array.isArray(r.files)) {
      const backFile = r.files.find((f: any) => 
        f.field === 'backId' || f.field === 'back_id' || f.type === 'backId'
      );
      if (backFile?.url) return backFile.url;
      if (backFile?.path) return backFile.path;
    }
    // Check direct properties
    if (r.backIdPhoto) return r.backIdPhoto;
    console.log('[getBackUrl] No back URL found for request:', r);
    return null;
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

  // Get filtered requests (exclude cancelled, apply search and role filter)
  filteredRequests() {
    let filtered = this.requests().filter(r => 
      r.status && r.status.toUpperCase() !== 'CANCELLED' && r.status.toUpperCase() !== 'CANCELED'
    );
    
    // Apply role filter
    if (this.selectedRole() !== 'all') {
      filtered = filtered.filter(r => 
        r.requestedRole && r.requestedRole.toLowerCase().includes(this.selectedRole().toLowerCase())
      );
    }
    
    // Apply status filter
    if (this.selectedStatus() !== 'all') {
      filtered = filtered.filter(r => 
        r.status && r.status.toUpperCase() === this.selectedStatus().toUpperCase()
      );
    }
    
    // Apply search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(r => {
        const name = `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.toLowerCase();
        const email = (r.user?.email || '').toLowerCase();
        const role = (r.requestedRole || '').toLowerCase();
        const affiliation = (r.affiliation || '').toLowerCase();
        return name.includes(query) || email.includes(query) || role.includes(query) || affiliation.includes(query);
      });
    }
    
    return filtered;
  }

  // Get filtered users
  filteredUsers() {
    let filtered = this.users();
    
    // Apply role filter
    if (this.userRoleFilter() !== 'all') {
      filtered = filtered.filter(u => 
        u.role && u.role.toLowerCase() === this.userRoleFilter().toLowerCase()
      );
    }
    
    // Apply search query
    const query = this.userSearchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(u => {
        const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        const role = (u.role || '').toLowerCase();
        return name.includes(query) || email.includes(query) || role.includes(query);
      });
    }
    
    return filtered;
  }

  // Get unique roles from requests
  availableRoles() {
    const roles = new Set<string>();
    this.requests().forEach(r => {
      if (r.requestedRole) roles.add(r.requestedRole);
    });
    return Array.from(roles).sort();
  }

  // Get unique roles from users
  availableUserRoles() {
    const roles = new Set<string>();
    this.users().forEach(u => {
      if (u.role) roles.add(u.role);
    });
    return Array.from(roles).sort();
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
