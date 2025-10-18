import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './profile.html',
  styles: [
    `
    .avatar-edit { position:absolute; right:0; bottom:0; width:36px; height:36px; border-radius:999px; background:rgba(0,0,0,0.6); color:#fff; display:inline-flex; align-items:center; justify-content:center; cursor:pointer }
    .avatar-edit input{ position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer }
    .label{ display:block; font-size:12px; color:#374151; margin-bottom:6px; font-weight:600 }
    .input{ width:100%; padding:0.6rem 0.75rem; border-radius:8px; border:1px solid #e6eef8; background:#fff }
    @media (max-width:800px){ .grid-cols-2{ grid-template-columns:1fr !important } }
    `
  ]
})
export class ProfilePage {
  profile: any = null;
  avatarUrl: string | null = null;
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
      this.auth.getProfile().subscribe({ next: (res:any) => { this.profile = this.normalizeProfile(res || {}); this.avatarUrl = this.profile.avatar || '/assets/default-avatar.svg'; }, error: (err:any) => { if (err && (err.status === 401 || err.status === 403)) { this.auth.logout(); try{ this.ts.error('Session expired, please sign in again'); }catch(e){} } this.profile = {}; } });
    } catch(e) {
      // fallback
      this.http.get('/api/me').subscribe({ next: (res:any) => { this.profile = this.normalizeProfile(res || {}); this.avatarUrl = this.profile.avatar || '/assets/default-avatar.svg'; }, error: (err:any) => { if (err && (err.status === 401 || err.status === 403)) { this.auth.logout(); try{ this.ts.error('Session expired, please sign in again'); }catch(e){} } this.profile = {}; } });
    }

    // mock some data if not present
    this.stats = [ { label: 'Publications', current: 3, required: 4 }, { label: 'Formations', current: 180, required: 200 }, { label: 'Conferences', current: 2, required: 2 } ];
    this.quickLinks = [ { icon: '📄', label: 'Mes Documents', count: 12, color: '#3b82f6' }, { icon: '⬆', label: 'Soumettre Dossier', count: null, color: '#059669' } ];
    this.recentActivity = [ { date: '2024-10-10', action: 'Document validé', description: 'Rapport Q3' } ];
    this.documents = [ { name: 'Attestation Inscription 2024-2025', date: '2024-09-15', size: '245 KB' } ];
  }

  onAvatar(e: any){
    const fl: FileList | null = e?.target?.files || null;
    if (!fl || fl.length === 0) return;
    const f = fl[0];
    const url = URL.createObjectURL(f);
    this.avatarUrl = url;
    // upload to server
    const fd = new FormData(); fd.append('avatar', f, f.name);
    this.http.post('/api/candidat/profile/avatar', fd).subscribe({ next: (res:any) => { if (res?.avatar) { this.avatarUrl = res.avatar; this.profile.avatar = res.avatar; try{ this.ts.success('Avatar updated'); }catch(e){} } }, error: (err) => { console.error('Avatar upload failed', err); try{ this.ts.error('Avatar upload failed'); }catch(e){} } });
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

  onAction(link:any){ if (link.label === 'Mes Documents') this.router.navigate(['/documents']); }

  download(doc:any){ /* stub */ }
}
