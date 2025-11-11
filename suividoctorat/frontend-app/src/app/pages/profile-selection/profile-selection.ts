import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'profile-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-selection.html',
  styles: [
    `
  /* full-screen split layout (compact) */
  .wrap{ min-height:100vh; display:flex; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial }

  /* left side - dark gradient */
  .left-panel{ width:50%; background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%); padding:2rem; display:flex; flex-direction:column; justify-content:space-between }

  .left-header{ margin-bottom:2.5rem }
  .step-badge{ display:inline-block; padding:0.35rem 0.75rem; background:rgba(255,255,255,0.08); border-radius:9999px; margin-bottom:1rem }
  .step-badge span{ font-size:0.7rem; font-weight:500; color:rgba(255,255,255,0.85); letter-spacing:0.08em; text-transform:uppercase }
  .left-title{ font-size:2rem; font-weight:700; color:white; margin-bottom:0.75rem; line-height:1.15 }
  .left-subtitle{ font-size:0.95rem; color:#94a3b8 }

  .roles-grid{ display:flex; flex-direction:column; gap:0.75rem }
  .role-card{ position:relative; padding:1.25rem; border-radius:0.75rem; cursor:pointer; transition:all 0.22s ease; border:1.5px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03) }
  .role-card:hover{ background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.14) }
  .role-card.selected{ background:rgba(255,255,255,0.12); border-color:rgba(255,255,255,0.28); box-shadow:0 12px 20px -6px rgba(0,0,0,0.08) }
  .role-header{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem }
  .role-title{ font-size:1.05rem; font-weight:600; color:white; padding-right:0.75rem }
  .role-tag{ padding:0.2rem 0.6rem; border-radius:9999px; font-size:0.72rem; font-weight:500; white-space:nowrap }
  .role-tag.selected{ background:white; color:#0f172a }
  .role-tag.default{ background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.75) }
  .role-desc{ color:#cbd5e1; line-height:1.45; font-size:0.92rem }
  .role-indicator{ position:absolute; top:1.25rem; right:1.25rem; width:0.5rem; height:0.5rem; background:white; border-radius:50%; box-shadow:0 0 0 2px rgba(255,255,255,0.18) }

  .left-footer{ padding-top:1rem; border-top:1px solid rgba(255,255,255,0.06) }
  .left-footer p{ font-size:0.8rem; color:#94a3b8 }

  /* right side - white form */
  .right-panel{ width:50%; background:white; padding:2rem; overflow-y:auto }
  .right-content{ max-width:34rem }

  .right-header{ margin-bottom:1.6rem }
  .right-title{ font-size:1.25rem; font-weight:700; color:#0f172a; margin-bottom:0.5rem }
  .right-subtitle{ color:#64748b; font-size:0.9rem }
  .right-logo{ display:flex; align-items:center; justify-content:center; width:64px; height:64px; background:#f8fafc; border-radius:8px; box-shadow:0 6px 18px rgba(2,6,23,0.04) }
  .right-illustration{ display:flex; justify-content:center; margin-top:1rem }
  .right-illustration svg{ width:220px; max-width:100%; height:auto; opacity:0.95; filter:drop-shadow(0 8px 18px rgba(2,6,23,0.06)) }

  .form-section{ margin-bottom:1.25rem }
  .form-label{ display:block; font-size:0.8rem; font-weight:600; color:#0f172a; margin-bottom:0.5rem }
  .form-input{ width:100%; padding:0.75rem 1rem; border-radius:0.6rem; border:1.5px solid #e6eef8; background:white; transition:all 0.15s ease; font-size:0.9rem; color:#0f172a }
  .form-input:focus{ outline:none; border-color:#0f172a; box-shadow:0 0 0 3px rgba(15,23,42,0.06) }
  .form-input::placeholder{ color:#94a3b8 }

  /* file upload grid */
  .file-grid{ display:grid; grid-template-columns:1fr 1fr; gap:1.25rem }
  .file-upload{ position:relative; display:flex; flex-direction:column; gap:0.5rem }
  .file-label{ font-size:0.75rem; font-weight:600; color:#334155; margin-bottom:0.25rem; text-transform:uppercase; letter-spacing:0.06em }

  /* drop area used in templates (.file-drop) */
  /* fixed-width upload area so long filenames don't expand the layout */
  .file-drop{ display:flex; gap:0.75rem; align-items:center; padding:0.5rem; border-radius:0.75rem; border:1.5px dashed #e2e8f0; background:#fbfdff; cursor:pointer; transition:all 0.18s ease; width:260px; box-sizing:border-box }
  .file-drop:hover{ border-color:#94a3b8; background:#f8fafc }
  .file-drop .preview-box{ width:72px; height:48px; background:#f1f5f9; border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden; flex:0 0 72px }
  .file-drop .preview-box img{ width:100%; height:100%; object-fit:cover; display:block }

  .file-meta{ display:flex; flex-direction:column; gap:0.35rem; min-width:0; overflow:hidden }
  /* ensure filename never expands container: fixed single-line ellipsis */
  .file-name{ font-size:0.88rem; color:#475569; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:140px }
  .file-controls{ display:flex; gap:0.5rem; align-items:center }

  .btn-outline{ padding:0.5rem 0.75rem; border-radius:8px; border:1px solid #e6eef8; background:white; font-weight:600; color:#475569; cursor:pointer }
  .btn-outline:hover{ background:#f8fafc }

  .icon-btn{ border:0; background:transparent; width:36px; height:36px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; color:#334155 }
  .icon-btn:hover{ background:#f1f5f9 }
  .icon-btn svg{ width:18px; height:18px; display:block }

  /* small success state */
  .file-success-icon{ width:34px; height:34px; background:#0f172a; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-right:6px }
  .file-success-icon span{ color:white; font-size:0.95rem; font-weight:700 }
  .file-success-name{ font-size:0.85rem; color:#64748b; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap }

    /* privacy notice */
    .privacy-notice{ background:#f8fafc; border-radius:0.75rem; padding:1.5rem; border:1px solid #e2e8f0; margin-bottom:2rem }
    .privacy-notice p{ font-size:0.875rem; color:#475569; line-height:1.6 }

    /* actions */
    .form-actions{ display:flex; justify-content:space-between; align-items:center; padding-top:2rem }
    .btn-secondary{ padding:0.75rem 2rem; color:#475569; font-weight:600; transition:color 0.2s ease }
    .btn-secondary:hover{ color:#0f172a }
    .btn-primary{ padding:1rem 2.5rem; background:#0f172a; color:white; border-radius:0.75rem; font-weight:600; border:0; cursor:pointer; transition:all 0.2s ease; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05) }
    .btn-primary:hover{ background:#1e293b; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04) }
    .btn-primary:disabled{ opacity:0.4; cursor:not-allowed; box-shadow:none }
    .btn-primary:disabled:hover{ background:#0f172a; box-shadow:none }

    /* responsive */
    @media (max-width:1024px){ .wrap{ flex-direction:column } .left-panel,.right-panel{ width:100%; padding:2rem } .left-title{ font-size:2.5rem } .right-content{ max-width:none } }
    `]
})
export class ProfileSelectionPage implements OnDestroy {
  // allow optional user illustration image (place file at assets/images/profile-illustration.png)
  illustrationPath = 'assets/images/profile-illustration.png';
  showIllustration = true;

  onIllustrationError(){
    // hide the img element so the inline SVG fallback is shown
    try { this.showIllustration = false; } catch(e){}
  }
  selected = signal<string | null>(null);
  sending = signal(false);
  showForm = signal(false);
  awaiting = signal(false);
  // pending request info
  pendingRequest: any = null;
  pendingCreatedAt: number | null = null;
  pendingExpiresAt: number | null = null;
  remainingLabel = signal('');
  private _countdownTimer: any = null;
  private _pollTimer: any = null;
  cancelWindowMs = 5 * 60 * 1000; // 5 minutes
  canCancel = signal(false);

  // fields collected for director/admin requests
  extra: any = { affiliation: '', justification: '', frontIdFile: null as File | null, backIdFile: null as File | null };
  // admin-specific fields
  extraAdmin: any = { username: '', province: '', frontIdFile: null as File | null, backIdFile: null as File | null };
  // previews
  extraPreview: any = { frontUrl: '', backUrl: '' };
  extraAdminPreview: any = { frontUrl: '', backUrl: '' };
  // drag state
  dragActiveFront = signal(false);
  dragActiveBack = signal(false);

  // validation rules
  maxFileSize = 5 * 1024 * 1024; // 5MB
  allowedTypes = ['image/jpeg', 'image/png'];

  validateFile(file: File){
    if (!this.allowedTypes.includes(file.type)) return { ok: false, msg: 'Type de fichier non supporté (jpg/png seulement)' };
    if (file.size > this.maxFileSize) return { ok: false, msg: 'Fichier trop volumineux (max 5MB)' };
    return { ok: true };
  }

  onDragOver(e: DragEvent, which: 'front'|'back'){
    e.preventDefault(); e.stopPropagation(); if (which === 'front') this.dragActiveFront.set(true); else this.dragActiveBack.set(true);
  }

  onDragLeave(e: DragEvent, which: 'front'|'back'){
    e.preventDefault(); e.stopPropagation(); if (which === 'front') this.dragActiveFront.set(false); else this.dragActiveBack.set(false);
  }

  onDrop(e: DragEvent, which: 'front'|'back'){
    e.preventDefault(); e.stopPropagation(); if (which === 'front') this.dragActiveFront.set(false); else this.dragActiveBack.set(false);
    const dt = e.dataTransfer; if (!dt) return; const fl = dt.files; if (!fl || fl.length === 0) return; const f = fl[0];
    const v = this.validateFile(f); if (!v.ok){ alert(v.msg); return; }
    // reuse existing logic: create a synthetic event
    const fake = { target: { files: fl } } as any;
    this.handleFile(fake, which);
  }

  clearFile(which: 'front'|'back'){
    const role = this.selected();
    if (role === 'admin'){
      if (which === 'front') { this.extraAdmin.frontIdFile = null; this.extraAdminPreview.frontUrl = ''; }
      else { this.extraAdmin.backIdFile = null; this.extraAdminPreview.backUrl = ''; }
    } else if (role === 'directeur'){
      if (which === 'front') { this.extra.frontIdFile = null; this.extraPreview.frontUrl = ''; }
      else { this.extra.backIdFile = null; this.extraPreview.backUrl = ''; }
    }
  }

  viewFile(which: 'front'|'back'){
    const role = this.selected();
    const url = role === 'admin' ? (which === 'front' ? this.extraAdminPreview.frontUrl : this.extraAdminPreview.backUrl) : (which === 'front' ? this.extraPreview.frontUrl : this.extraPreview.backUrl);
    if (url) window.open(url, '_blank');
  }

  constructor(private auth: AuthService, public router: Router) {
    // Ensure user is logged in
    if (!this.auth.isLoggedIn || !this.auth.isLoggedIn()) {
      console.warn('User not logged in, redirecting to auth');
      this.router.navigate(['/auth']);
    }
    // check if there's an existing pending request for this user
    try { this.checkPendingRequests(); } catch(e){}
  }

  ngOnDestroy(): void {
    if (this._countdownTimer) clearInterval(this._countdownTimer);
    if (this._pollTimer) clearInterval(this._pollTimer);
  }

  // check if user already has pending requests (call on init and after submit)
  checkPendingRequests(){
    try {
      this.auth.getMyRoleRequests().subscribe({ next: (list:any[]) => {
        if (!list || list.length === 0) { this.pendingRequest = null; this.awaiting.set(false); return; }
        // find most recent pending request
        const pending = list.find(r => r.status === 'PENDING') || null;
        if (pending){
          this.pendingRequest = pending;
          this.awaiting.set(true);
          try { this.pendingCreatedAt = new Date(pending.createdAt).getTime(); this.pendingExpiresAt = this.pendingCreatedAt + 48*3600*1000; } catch(e){ this.pendingCreatedAt = Date.now(); this.pendingExpiresAt = Date.now() + 48*3600*1000; }
          this.startCountdown();
          this.startPollingForApproval();
        } else {
          this.pendingRequest = null; this.awaiting.set(false);
          if (this._countdownTimer) { clearInterval(this._countdownTimer); this._countdownTimer = null; }
          if (this._pollTimer) { clearInterval(this._pollTimer); this._pollTimer = null; }
        }
      }, error: (err) => { console.warn('checkPendingRequests error', err); } });
    } catch(e){ console.warn('checkPendingRequests exception', e); }
  }

  startCountdown(){
    if (this._countdownTimer) clearInterval(this._countdownTimer);
    const update = () => {
      if (!this.pendingExpiresAt) { this.remainingLabel.set(''); return; }
  const now = Date.now();
  const ms = this.pendingExpiresAt - now;
      if (ms <= 0){ this.remainingLabel.set('expired'); clearInterval(this._countdownTimer); this._countdownTimer = null; return; }
      const hours = Math.floor(ms / (1000*60*60));
      const mins = Math.floor((ms % (1000*60*60)) / (1000*60));
      this.remainingLabel.set(`${hours}h ${mins}m`);
  // update cancel window flag
  this.canCancel.set(this.pendingCreatedAt != null && (now - (this.pendingCreatedAt || 0)) <= this.cancelWindowMs);
    };
    update();
    this._countdownTimer = setInterval(update, 60*1000);
  }

  startPollingForApproval(){
    if (this._pollTimer) clearInterval(this._pollTimer);
    // poll every 30s
    const poll = () => {
      try { this.auth.getMyRoleRequests().subscribe({ next: (list:any[]) => {
        const pending = list.find(r => r.status === 'PENDING') || null;
        const approved = list.find(r => r.status === 'APPROVED') || null;
        if (approved){
          // approved: navigate to home or reload
          this.awaiting.set(false);
          if (this._countdownTimer) clearInterval(this._countdownTimer);
          if (this._pollTimer) clearInterval(this._pollTimer);
          try { window.location.href = '/'; } catch(e) { try { this.router.navigate(['/']); } catch(ee){} }
        } else if (!pending){
          // no pending anymore
          this.awaiting.set(false);
            this.canCancel.set(false);
          if (this._countdownTimer) clearInterval(this._countdownTimer);
          if (this._pollTimer) clearInterval(this._pollTimer);
        }
      }, error: (err) => { console.warn('poll error', err); } }); } catch(e){}
    };
    poll();
    this._pollTimer = setInterval(poll, 30*1000);
  }

  cancelPendingRequest(){
    if (!this.pendingRequest || !this.pendingRequest.id) return;
    const id = this.pendingRequest.id;
    this.sending.set(true);
    this.auth.cancelRoleRequest(id).subscribe({ next: (res:any) => {
      this.sending.set(false);
      this.awaiting.set(false);
      this.pendingRequest = null;
      this.pendingCreatedAt = null; this.pendingExpiresAt = null;
      this.remainingLabel.set(''); this.canCancel.set(false);
      if (this._countdownTimer) { clearInterval(this._countdownTimer); this._countdownTimer = null; }
      if (this._pollTimer) { clearInterval(this._pollTimer); this._pollTimer = null; }
      alert(res?.message || 'Demande annulée');
    }, error: (err:any) => { this.sending.set(false); console.error('Cancel request error', err); const msg = err?.error?.message || err?.message || 'Erreur'; alert('Impossible d\'annuler: ' + msg); } });
  }

  // Selecting a card simply marks it visually selected.
  // For candidat: shows immediate confirmation button
  // For others: shows the form
  choose(id: string){
    try {
      const currentRole = this.auth.role ? this.auth.role() : null;
      if (currentRole && currentRole !== 'ROLE_USER' && currentRole !== 'USER'){
        alert('Vous avez déjà un rôle attribué et ne pouvez pas en choisir un nouveau.');
        return;
      }
    } catch(e){}
    this.selected.set(id);
    // For candidat, don't show form - just show confirmation button
    // For others, show the form
    if (id !== 'candidat') {
      this.showForm.set(true);
    } else {
      this.showForm.set(false);
    }
  }

  // Called by the Confirm button: perform the chosen action.
  confirmSelection(){
    const id = this.selected();
    if (!id) return;

    if (id === 'candidat') {
      // client-side guard: ensure token present and not expired before calling the API
      const token = this.auth.getToken();
      if (!token || this.auth.isTokenExpired()) {
        // provide a helpful message and redirect to login so user can re-authenticate
        alert('Votre session a expiré ou vous n\'êtes pas connecté·e. Veuillez vous reconnecter.');
        try { this.auth.logout(); } catch(e){}
        try { this.router.navigate(['/auth']); } catch(e){}
        return;
      }

      // set role and navigate to candidat dashboard
      this.sending.set(true);
      // ensure backend can read JWT from cookie as a fallback (TokenFilter checks cookie named JWT)
      try { const t = this.auth.getToken(); if (t) { document.cookie = 'JWT=' + t + '; path=/'; } } catch (e) {}

      this.auth.updateRole('candidat').subscribe({ 
        next: (res) => {
          console.log('Role update successful:', res);
          this.sending.set(false);
          try{ this.router.navigate(['/candidat/dashboard']); } catch(e){ console.error('Navigation error:', e); }
        }, 
        error: (err) => { 
          console.error('Role update error:', err);
          this.sending.set(false); 
          const msg = err?.error?.message || err?.message || 'Erreur lors de la mise à jour du rôle';
          alert(msg); 
        } 
      });
    } else {
      // open small form to collect extra data and submit a role-request
      this.showForm.set(true);
    }
  }

  handleFile(event: any, which: 'front' | 'back'){
    const fl: FileList | null = event?.target?.files || null;
    if (!fl || fl.length === 0) return;
    const f = fl[0];
    const role = this.selected();
    if (role === 'admin'){
      if (which === 'front') this.extraAdmin.frontIdFile = f; else this.extraAdmin.backIdFile = f;
      // preview
      try { const url = URL.createObjectURL(f); if (which === 'front') this.extraAdminPreview.frontUrl = url; else this.extraAdminPreview.backUrl = url; } catch(e){}
    } else if (role === 'directeur'){
      if (which === 'front') this.extra.frontIdFile = f; else this.extra.backIdFile = f;
      try { const url = URL.createObjectURL(f); if (which === 'front') this.extraPreview.frontUrl = url; else this.extraPreview.backUrl = url; } catch(e){}
    }
  }

  submitRequest(){
    const role = this.selected();
    if (!role) return;
    this.sending.set(true);

    if (role === 'admin'){
      // validate admin required fields
      if (!this.extraAdmin.username || !this.extraAdmin.province || !this.extraAdmin.frontIdFile || !this.extraAdmin.backIdFile){
        this.sending.set(false);
        alert('Veuillez fournir un nom d\'utilisateur, la province et les deux photos de la carte d\'identité.');
        return;
      }
  const fd = new FormData();
  fd.append('role', 'admin');
  fd.append('username', this.extraAdmin.username);
  fd.append('province', this.extraAdmin.province);
  fd.append('frontId', this.extraAdmin.frontIdFile as Blob, (this.extraAdmin.frontIdFile as File).name);
  fd.append('backId', this.extraAdmin.backIdFile as Blob, (this.extraAdmin.backIdFile as File).name);
      // debug: log FormData entries (files will be File objects)
      try { for (const e of fd.entries()) { console.log('[role-request] form entry:', e[0], e[1]); } } catch(e){}
  // ensure backend can read JWT from cookie as a fallback (TokenFilter checks cookie named JWT)
  try { const t = this.auth.getToken(); if (t) { document.cookie = 'JWT=' + t + '; path=/'; console.log('[role-request] set JWT cookie fallback'); } } catch(e){}
  // send with progress events so we can observe upload progress and low-level errors
  this.auth.requestRole(fd, { reportProgress: true, observe: 'events' as const }).subscribe({ next: (event:any) => {
        // log events to help diagnose network/proxy problems
        console.log('[role-request] event:', event);
        if (event && event.type === HttpEventType.UploadProgress) {
          const pct = event.total ? Math.round((event.loaded / event.total) * 100) : null;
          console.log('[role-request] upload progress:', pct, '%');
        }
        if (event && event.type === HttpEventType.Response) {
          // final response
          this.sending.set(false);
          this.showForm.set(false);
          this.awaiting.set(true);
          try { this.checkPendingRequests(); } catch(e){}
        }
      }, error: (err:any) => { this.sending.set(false); console.error('Role request error (admin):', err); const serverMsg = err?.message || err?.error || JSON.stringify(err);
        // ProgressEvent or low-level network error will often be a ProgressEvent without status
        const status = err && err.status ? err.status : (err instanceof ProgressEvent ? 'network' : 'unknown');
        alert('Impossible d\'envoyer la demande. Statut: ' + status + '\n' + (serverMsg || '[no server message]'));
      }});
      return;
    }

    if (role === 'directeur'){
      // validate director required fields
      if (!this.extra.affiliation || !this.extra.frontIdFile || !this.extra.backIdFile){
        this.sending.set(false);
        alert('Veuillez fournir l\'affiliation et les deux photos de la carte d\'identité.');
        return;
      }
    const fd = new FormData();
  // backend Role enum uses ROLE_ENCADRANT for thesis supervisors
  fd.append('role', 'encadrant');
    fd.append('affiliation', this.extra.affiliation);
    fd.append('justification', this.extra.justification || '');
    fd.append('frontId', this.extra.frontIdFile as Blob, (this.extra.frontIdFile as File).name);
    fd.append('backId', this.extra.backIdFile as Blob, (this.extra.backIdFile as File).name);
    // debug: log FormData entries
    try { for (const e of fd.entries()) { console.log('[role-request] form entry:', e[0], e[1]); } } catch(e){}
  // ensure backend can read JWT from cookie as a fallback (TokenFilter checks cookie named JWT)
  try { const t = this.auth.getToken(); if (t) { document.cookie = 'JWT=' + t + '; path=/'; console.log('[role-request] set JWT cookie fallback'); } } catch(e){}
  // send with progress events
  this.auth.requestRole(fd, { reportProgress: true, observe: 'events' as const }).subscribe({ next: (event:any) => {
      console.log('[role-request] event (directeur):', event);
      if (event && event.type === HttpEventType.UploadProgress) {
        const pct = event.total ? Math.round((event.loaded / event.total) * 100) : null;
        console.log('[role-request] upload progress (directeur):', pct, '%');
      }
      if (event && event.type === HttpEventType.Response) {
        this.sending.set(false); this.showForm.set(false); this.awaiting.set(true);
        try { this.checkPendingRequests(); } catch(e){}
      }
    }, error: (err:any) => { this.sending.set(false); console.error('Role request error (directeur):', err); const serverMsg = err?.message || err?.error || JSON.stringify(err); const status = err && err.status ? err.status : (err instanceof ProgressEvent ? 'network' : 'unknown'); alert('Impossible d\'envoyer la demande. Statut: ' + status + '\n' + (serverMsg || '[no server message]')); } });
      return;
    }

    // other roles: send JSON
    const payload = { role, ...this.extra };
    this.auth.requestRole(payload).subscribe({ next: () => {
      this.sending.set(false);
      this.showForm.set(false);
      this.awaiting.set(true);
      try { this.checkPendingRequests(); } catch(e){}
    }, error: (err:any) => { this.sending.set(false); console.error('Role request error (other role):', err); const serverMsg = err?.error?.message || err?.error || err?.message || JSON.stringify(err); alert('Impossible d\'envoyer la demande. Statut: ' + (err?.status || 'unknown') + '\n' + serverMsg); } });
  }

  getCurrentFile(which: 'front' | 'back'): File | null {
    const role = this.selected();
    if (role === 'admin') {
      return which === 'front' ? this.extraAdmin.frontIdFile : this.extraAdmin.backIdFile;
    } else if (role === 'directeur') {
      return which === 'front' ? this.extra.frontIdFile : this.extra.backIdFile;
    }
    return null;
  }

  isFormValid(): boolean {
    const role = this.selected();
    if (role === 'directeur') {
      return !!(this.extra.affiliation && this.extra.frontIdFile && this.extra.backIdFile);
    } else if (role === 'admin') {
      return !!(this.extraAdmin.username && this.extraAdmin.province && this.extraAdmin.frontIdFile && this.extraAdmin.backIdFile);
    }
    return false;
  }
}
