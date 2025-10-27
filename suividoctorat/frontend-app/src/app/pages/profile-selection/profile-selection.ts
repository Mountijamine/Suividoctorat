import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'profile-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './profile-selection.html',
  styles: [
    `
    .wrap{ max-width:1100px; margin:2rem auto; padding:1rem }
    .header .title{ font-size:1.25rem; margin:0 }
    .header .subtitle{ color:#6b7280; margin-top:0.25rem }
    .layout{ display:flex; gap:1rem; align-items:flex-start }
    .left-panel{ flex:1; background:transparent }
    .right-panel{ width:440px }
  .banner{ width:100%; height:140px; object-fit:cover; border-radius:12px; display:block }
  .banner-wrap{ width:100% }
    .card-option{ background:#fff; border-radius:10px; padding:0.9rem; box-shadow:0 8px 20px rgba(2,6,23,0.06); cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:transform .18s ease, box-shadow .18s ease }
    .card-option:hover{ transform:translateY(-4px); box-shadow:0 18px 40px rgba(2,6,23,0.08) }
    .card-option.selected{ border:2px solid #e6eef8; box-shadow:0 20px 50px rgba(2,6,23,0.08) }
    .card-option .meta{ color:#374151 }
    .arrow{ font-size:18px; color:#9ca3af }
    .label{ display:block; font-weight:600; margin-bottom:6px }
    .input{ width:100%; padding:0.6rem; border-radius:8px; border:1px solid #e6eef8; background:#fff }
  .form-box.outline{ border:1px solid #e6eef8; padding:1rem; border-radius:10px; background:#fff }
  .file-drop{ border-radius:8px; padding:0.4rem }
  .file-drop:hover{ background:#fbfdff }
    .btn-primary{ background:linear-gradient(90deg,#3b82f6 0%,#06b6d4 100%); color:#fff; padding:0.6rem 0.9rem; border-radius:8px; border:0 }
    .btn-outline{ background:transparent; border:1px solid #e6eef8; padding:0.5rem 0.75rem; border-radius:8px }
    .form-box{ background:#fff; padding:1rem; border-radius:10px; box-shadow:0 10px 30px rgba(2,6,23,0.06) }
    .muted{ color:#6b7280 }
    @media (max-width:940px){ .layout{ flex-direction:column } .right-panel{ width:100% } }
    `]
})
export class ProfileSelectionPage {
  selected = signal<string | null>(null);
  sending = signal(false);
  showForm = signal(false);
  awaiting = signal(false);

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

  constructor(private auth: AuthService, private router: Router) {}

  choose(id: string){
    this.selected.set(id);
    if (id === 'candidat') {
      // immediately set role and navigate to candidat dashboard
      this.sending.set(true);
      this.auth.updateRole('candidat').subscribe({ next: () => {
        this.sending.set(false);
        try{ this.router.navigate(['/candidat/dashboard']); } catch(e){}
      }, error: () => { this.sending.set(false); alert('Erreur lors de la mise à jour du rôle'); } });
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
      this.auth.requestRole(fd).subscribe({ next: () => { this.sending.set(false); this.showForm.set(false); this.awaiting.set(true); }, error: () => { this.sending.set(false); alert('Impossible d\'envoyer la demande.'); } });
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
      fd.append('role', 'directeur');
      fd.append('affiliation', this.extra.affiliation);
      fd.append('justification', this.extra.justification || '');
      fd.append('frontId', this.extra.frontIdFile as Blob, (this.extra.frontIdFile as File).name);
      fd.append('backId', this.extra.backIdFile as Blob, (this.extra.backIdFile as File).name);
      this.auth.requestRole(fd).subscribe({ next: () => { this.sending.set(false); this.showForm.set(false); this.awaiting.set(true); }, error: () => { this.sending.set(false); alert('Impossible d\'envoyer la demande.'); } });
      return;
    }

    // other roles: send JSON
    const payload = { role, ...this.extra };
    this.auth.requestRole(payload).subscribe({ next: () => {
      this.sending.set(false);
      this.showForm.set(false);
      this.awaiting.set(true);
    }, error: () => { this.sending.set(false); alert('Impossible d\'envoyer la demande.'); } });
  }
}
