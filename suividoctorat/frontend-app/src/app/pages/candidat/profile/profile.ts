import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastService } from '../../../services/toast.service';
import { CandidatNavbarComponent } from '../../../components/navbar/candidat-navbar';

@Component({
  selector: 'profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, CandidatNavbarComponent],
  templateUrl: './profile.html',
  styles: [
    `
    /* Page layout helpers */
    :host { display: block; min-height: 100vh; background: #fafafa; }
    :root{ --zinc-50:#fafafa; --zinc-100:#f3f4f6; --zinc-200:#e6e9ee; --zinc-300:#d1d5db; --zinc-500:#6b7280; --zinc-600:#4b5563; --zinc-700:#374151; --zinc-900:#0f172a; --blue-50:#eff6ff; --blue-100:#dbeafe; --blue-600:#2563eb; --blue-700:#1d4ed8; --green-50:#f0fdf4; --green-600:#16a34a; --orange-50:#fff7ed; --orange-600:#ea580c; --red-50:#fef2f2; --red-600:#dc2626; }

    .min-h-screen { min-height: 100vh; }
    .max-w-7xl { max-width: 1100px; }
    .mx-auto { margin-left:auto; margin-right:auto; }
    .px-6 { padding-left:1.5rem; padding-right:1.5rem; }
    .py-8 { padding-top:2rem; padding-bottom:2rem; }
    .py-6 { padding-top:1.5rem; padding-bottom:1.5rem; }
    .py-4 { padding-top:1rem; padding-bottom:1rem; }
    .py-3 { padding-top:0.75rem; padding-bottom:0.75rem; }
    .py-2 { padding-top:0.5rem; padding-bottom:0.5rem; }
    .py-1 { padding-top:0.25rem; padding-bottom:0.25rem; }
    .px-4 { padding-left:1rem; padding-right:1rem; }
    .px-3 { padding-left:0.75rem; padding-right:0.75rem; }
    .px-2 { padding-left:0.5rem; padding-right:0.5rem; }
    .p-8 { padding:2rem; }
    .p-6 { padding:1.5rem; }
    .p-4 { padding:1rem; }
    .p-3 { padding:0.75rem; }
    .p-2 { padding:0.5rem; }
    .mb-6 { margin-bottom:1.5rem; }
    .mb-4 { margin-bottom:1rem; }
    .mb-3 { margin-bottom:0.75rem; }
    .mb-2 { margin-bottom:0.5rem; }
    .mb-1 { margin-bottom:0.25rem; }

    /* simple flex / grid helpers */
    .flex { display:flex; }
    .inline-flex { display:inline-flex; }
    .items-start { align-items:flex-start; }
    .items-center { align-items:center; }
    .justify-between { justify-content:space-between; }
    .justify-center { justify-content:center; }
    .flex-1 { flex:1 1 0%; }
    .gap-6 { gap:1.5rem; }
    .gap-4 { gap:1rem; }
    .gap-3 { gap:0.75rem; }
    .gap-2 { gap:0.5rem; }
    .space-y-6 > * + * { margin-top:1.5rem; }
    .space-y-4 > * + * { margin-top:1rem; }
    .space-y-3 > * + * { margin-top:0.75rem; }

    .grid { display:grid; }
    .grid-cols-1 { grid-template-columns: 1fr; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0,1fr)); }
    .col-span-2 { grid-column: span 2 / span 2; }
    .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0,1fr)); }
    .lg\:col-span-1 { grid-column: span 1 / span 1; }
    .lg\:col-span-2 { grid-column: span 2 / span 2; }

    /* spacing helpers for buttons/blocks */
    .w-full { width:100%; }
    .w-32 { width:8rem; }
    .h-32 { height:8rem; }
    .w-10 { width:2.5rem; }
    .h-10 { height:2.5rem; }
    .h-2 { height:0.5rem; }

    /* borders / rounding / shadows */
    .border-4 { border-width:4px; }
    .border { border-width:1px; }
    .border-zinc-100 { border-color:var(--zinc-100); }
    .border-zinc-300 { border-color:var(--zinc-300); }
    .border-b { border-bottom-width:1px; }
    .rounded-full { border-radius:9999px; }
    .rounded-lg { border-radius:12px; }
    .rounded { border-radius:8px; }
    .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06); }
    .shadow { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
    .hover\:shadow-md:hover { box-shadow: 0 4px 12px rgba(15,23,42,0.1); }

    /* background and text colors */
    .bg-white { background-color: #ffffff; }
    .bg-zinc-50 { background-color: var(--zinc-50); }
    .bg-zinc-100 { background-color: var(--zinc-100); }
    .bg-zinc-200 { background-color: var(--zinc-200); }
    .bg-blue-50 { background-color: var(--blue-50); }
    .bg-blue-100 { background-color: var(--blue-100); }
    .bg-blue-600 { background-color: var(--blue-600); }
    .bg-blue-700 { background-color: var(--blue-700); }
    .bg-green-100 { background-color:#d1fae5; }
    .bg-orange-100 { background-color:#ffedd5; }
    .bg-red-100 { background-color:#fee2e2; }
    .hover\:bg-zinc-50:hover { background-color: var(--zinc-50); }
    .hover\:bg-blue-700:hover { background-color: var(--blue-700); }

    .text-zinc-900 { color: var(--zinc-900); }
    .text-zinc-700 { color: var(--zinc-700); }
    .text-zinc-600 { color: var(--zinc-600); }
    .text-zinc-500 { color: var(--zinc-500); }
    .text-blue-600 { color: var(--blue-600); }
    .text-blue-700 { color:#1d4ed8; }
    .text-green-600 { color:#16a34a; }
    .text-orange-600 { color:#ea580c; }
    .text-red-600 { color:#dc2626; }
    .text-white { color:#fff; }
    .hover\:text-blue-700:hover { color:var(--blue-700); }
    .text-sm { font-size:0.875rem; }
    .text-xs { font-size:0.75rem; }
    .text-base { font-size:1rem; line-height:1.5rem; }
    .text-lg { font-size:1.125rem; line-height:1.75rem; }
    .text-xl { font-size:1.25rem; line-height:1.75rem; }
    .text-2xl { font-size:1.5rem; line-height:2rem; }
    .text-3xl { font-size:1.875rem; line-height:2.25rem; }
    .text-4xl { font-size:2.25rem; line-height:2.5rem; }

    .font-medium { font-weight:500; }
    .font-semibold { font-weight:600; }

    .object-cover { object-fit: cover; }

    /* avatar edit button */
    .avatar-edit { position:absolute; right:0; bottom:0; width:36px; height:36px; border-radius:999px; background:rgba(0,0,0,0.6); color:#fff; display:inline-flex; align-items:center; justify-content:center; cursor:pointer }
    .avatar-edit input{ position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer }

    /* Avatar initials - navbar and profile */
    .profile-initials, .dropdown-avatar-initials { display:flex; align-items:center; justify-content:center; border-radius:50%; color:#fff; font-weight:700; }
    .profile-initials { width:36px; height:36px; font-size:0.875rem; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); }
    .dropdown-avatar-initials { width:72px; height:72px; font-size:1.75rem; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); }

    /* Form labels and inputs follow theme */
    .label{ display:block; font-size:12px; color:var(--zinc-700); margin-bottom:6px; font-weight:600 }
    .input{ width:100%; padding:0.6rem 0.75rem; border-radius:8px; border:1px solid var(--zinc-200); background:#fff; box-shadow: 0 1px 2px rgba(16,24,40,0.02); font-size:0.9375rem; }
    .input:focus { outline:none; border-color:var(--blue-600); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

    /* buttons */
    button { border:none; cursor:pointer; font-family:inherit; }
    .btn { display:inline-flex; align-items:center; justify-content:center; gap:0.5rem; padding:0.625rem 1.25rem; font-size:0.9375rem; font-weight:500; border-radius:8px; transition:all 0.15s ease; }
    .btn-primary { background:var(--blue-600); color:#fff; }
    .btn-primary:hover { background:var(--blue-700); transform:translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
    .btn-secondary { background:#fff; color:var(--zinc-700); border:1px solid var(--zinc-300); }
    .btn-secondary:hover { background:var(--zinc-50); }

    /* small helpers */
    .inline { display:inline-block; }
    .relative { position:relative; }
    .text-left { text-align:left; }
    .transition-colors { transition: background-color .15s ease, color .15s ease; }
    .cursor-pointer { cursor:pointer; }

    /* dropdown/profile panel */
    .dropdown-content { min-width: 240px; max-width:320px; background:#fff; border-radius:10px; box-shadow: 0 10px 30px rgba(2,6,23,0.12); overflow:hidden; }
    .dropdown-header { display:flex; flex-direction:column; align-items:center; gap:0.75rem; padding:1.25rem; text-align:center }
    .dropdown-email{ font-size:0.95rem; color:var(--zinc-900); }

    /* make profile image crisp */
    img.rounded-full, .dropdown-avatar, .profile-image { border-radius:999px; display:block }

    /* responsive adjustments */
    @media (max-width:800px){ .grid-cols-2{ grid-template-columns:1fr !important } .flex-1 { width:100%; } }
    @media (max-width:480px){ .avatar-edit{ width:32px; height:32px } }
    `
  ]
})
export class ProfilePage {
  profile: any = null;
  profileImage: string | null = null;
  userInitials: string = '';
  editMode = false;
  stats = [] as any[];
  quickLinks = [] as any[];
  recentActivity = [] as any[];
  documents = [] as any[];

  constructor(private auth: AuthService, private http: HttpClient, private router: Router, private ts: ToastService){
    this.loadProfile();
  }

  loadProfile(){
    // try to fetch profile from auth service
    try {
      this.auth.getProfile().subscribe({ 
        next: (res:any) => { 
          this.profile = this.normalizeProfile(res || {}); 
          this.profileImage = this.profile.avatar || null;
          this.userInitials = this.generateInitials(
            this.profile.firstName && this.profile.lastName ? `${this.profile.firstName} ${this.profile.lastName}` : null,
            this.profile.email
          );
        }, 
        error: (err:any) => { 
          if (err && (err.status === 401 || err.status === 403)) { 
            this.auth.logout(); 
            try{ this.ts.error('Session expired, please sign in again'); }catch(e){} 
          } 
          this.profile = {}; 
        } 
      });
    } catch(e) {
      // fallback
      this.http.get('/api/me').subscribe({ 
        next: (res:any) => { 
          this.profile = this.normalizeProfile(res || {}); 
          this.profileImage = this.profile.avatar || null;
          this.userInitials = this.generateInitials(
            this.profile.firstName && this.profile.lastName ? `${this.profile.firstName} ${this.profile.lastName}` : null,
            this.profile.email
          );
        }, 
        error: (err:any) => { 
          if (err && (err.status === 401 || err.status === 403)) { 
            this.auth.logout(); 
            try{ this.ts.error('Session expired, please sign in again'); }catch(e){} 
          } 
          this.profile = {}; 
        } 
      });
    }

    // Defaults (no mock data): stats start at 0 and will be populated later
    this.stats = [ { label: 'Publications', current: 0, required: 4 }, { label: 'Formations', current: 0, required: 200 }, { label: 'Conferences', current: 0, required: 2 } ];
    this.quickLinks = [ { icon: '📄', label: 'Mes Documents', count: null, color: '#3b82f6' }, { icon: '⬆', label: 'Soumettre Dossier', count: null, color: '#059669' } ];
    this.recentActivity = [];
    this.documents = [];

    // Load latest documents for the candidate and derive recent activity from them
    this.fetchRecentDocuments();
  }

  fetchRecentDocuments() {
    // fetch latest 5 documents for the user
    this.http.get<any>('/api/candidat/documents?page=0&size=5').subscribe({ next: (res:any) => {
      try {
        const content = res?.content || [];
        // map documents to shape used by template
        this.documents = content.map((d:any) => ({
          id: d.id,
          name: d.title || d.originalFilename || 'Document',
          date: d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : '',
          size: d.contentType || ''
        }));
        // derive simple recent activity from documents (most recent uploads)
        this.recentActivity = content.map((d:any) => ({ date: d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : '', action: 'Document envoyé', description: d.title || d.originalFilename || '' }));
      } catch(e) { this.documents = []; this.recentActivity = []; }
    }, error: (err:any) => {
      // silently ignore; keep arrays empty
      this.documents = [];
      this.recentActivity = [];
    } });
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
    return 'U';
  }

  onAvatar(e: any){
    const fl: FileList | null = e?.target?.files || null;
    if (!fl || fl.length === 0) return;
    const f = fl[0];
    const url = URL.createObjectURL(f);
    this.profileImage = url;
    // upload to server
    const fd = new FormData(); fd.append('avatar', f, f.name);
    this.http.post('/api/candidat/profile/avatar', fd).subscribe({ 
      next: (res:any) => { 
        if (res?.avatar) { 
          this.profileImage = res.avatar; 
          this.profile.avatar = res.avatar; 
          try{ this.ts.success('Avatar updated'); }catch(e){} 
        } 
      }, 
      error: (err) => { 
        console.error('Avatar upload failed', err); 
        try{ this.ts.error('Avatar upload failed'); }catch(e){} 
      } 
    });
  }

  // normalize backend shapes to common keys used by the template
  normalizeProfile(raw: any){
    // unwrap possible containers
    if (!raw) return {};
    if (raw.user) raw = raw.user;
    if (raw.data) raw = raw.data;
    const p: any = {};
    p.firstName = raw.firstName || raw.firstname || raw.givenName || raw.given_name || raw.first_name || raw.name || '';
    p.lastName = raw.lastName || raw.lastname || raw.familyName || raw.family_name || raw.last_name || '';
    p.email = raw.email || raw.mail || '';
    p.phone = raw.phone || raw.telephone || raw.phoneNumber || raw.phone_number || '';
    p.address = raw.address || raw.location || raw.adresse || '';
    p.enrollmentDate = raw.enrollmentDate || raw.enrolledAt || raw.enrollment_date || raw.enrolled_at || raw.createdAt || '';
    p.thesisTitle = raw.thesisTitle || raw.thesis_title || raw.subject || '';
    p.thesisDirector = raw.thesisDirector || raw.director || raw.supervisor || '';
    p.laboratory = raw.laboratory || raw.lab || raw.institution || '';
    p.role = raw.role || raw.roles || (raw.authorities && raw.authorities[0]) || '';
    // Normalize role to a single, human-friendly string (strip ROLE_ prefix)
    try {
      let roleVal: any = p.role;
      if (Array.isArray(roleVal)) {
        roleVal = roleVal.length > 0 ? roleVal[0] : '';
      } else if (roleVal instanceof Set) {
        const arr = Array.from(roleVal as Set<any>);
        roleVal = arr.length > 0 ? arr[0] : '';
      } else if (typeof roleVal === 'object' && roleVal !== null) {
        // fall back to string conversion for unexpected shapes
        roleVal = String(roleVal);
      }
      if (typeof roleVal === 'string') {
        roleVal = roleVal.replace(/^ROLE_/i, '');
        roleVal = roleVal.toLowerCase();
      }
      p.role = roleVal || '';
    } catch (e) { p.role = p.role || ''; }
    p.avatar = raw.avatar || raw.avatarUrl || raw.avatar_url || null;
    return p;
  }

  saveProfile(){
    if (!this.profile) return;
    const payload = { ...this.profile };
    // try to PUT to profile endpoint
    this.http.put('/api/auth/me', payload).subscribe({ next: (res:any) => { try{ this.ts.success('Profile saved'); }catch(e){} this.editMode = false; }, error: (err) => { console.error('Save failed', err); try{ this.ts.error('Failed to save profile'); }catch(e){} } });
  }

  getProgressColor(cur:number, req:number){ const p = Math.round((cur/req) * 100); if (p >= 100) return 'text-green-600'; if (p >= 75) return 'text-orange-600'; return 'text-red-600'; }

  onAction(link:any){ if (link.label === 'Mes Documents') this.router.navigate(['/candidat/documents']); }

  download(doc:any){ /* stub */ }
}
