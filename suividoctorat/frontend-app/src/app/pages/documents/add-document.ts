import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'add-document',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './add-document.html',
  styles: [
    `
    .wrap { max-width:720px; margin:1.25rem auto; padding:1rem }
    .field { margin-bottom:0.75rem }
    .segmented { display:flex; border-radius:10px; overflow:hidden; border:1px solid #e6eef8 }
  .segmented button { flex:1; padding:0.6rem 0.9rem; background:transparent; border:0; cursor:pointer; font-weight:600; transition: background-color 160ms ease, transform 140ms ease, box-shadow 160ms ease }
  .segmented button:hover { background:#f8fafc; transform:translateY(-1px); box-shadow:0 6px 14px rgba(2,6,23,0.04) }
  .segmented button.active { background:linear-gradient(90deg,#111,#111); color:#fff; box-shadow:0 8px 18px rgba(2,6,23,0.08) }
  .segmented button:not(.active) { background:#fff; color:#111 }
  /* preview container tweaks */
    .preview-wrap { position:relative; width:100%; }
    .preview-clear { position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.6); color:#fff; border:0; width:36px; height:36px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer }
    .preview-remove { display:none; margin-top:8px; background:transparent; border:0; color:#6b7280; cursor:pointer; font-weight:600 }
    /* fade in preview */
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px) } to { opacity:1; transform: translateY(0) } }
    .preview-wrap.fade-in { animation: fadeIn 220ms ease both }
    /* responsive: hide clear floating button on small screens and show remove button */
    @media (max-width: 640px) {
      .preview-clear { transform: translateX(120%); opacity:0; pointer-events:none }
      .preview-remove { display:inline-flex }
    }
    .muted { color:#6b7280; margin-top:-6px; margin-bottom:12px }
    `
  ]
})
export class AddDocumentPage {
  title = '';
  type = 'rapport';
  categories: string[] = [];
  useCustom = false; // when true, user types free-form category
  note = '';
  // files selected by the user (UI supports previewing multiple files). The server upload still posts the first file.
  files: File[] = [];
  file: File | null = null;
  previews: Array<{ url: string | null, type: 'image'|'pdf'|'other'|'none', name?: string }> = [];
  // keep legacy single-preview properties for simple checks
  previewUrl: string | null = null;
  previewType: 'image'|'pdf'|'other'|'none' = 'none';
  uploading = false;
  progress = 0;
  error: string | null = null;

  constructor(private http: HttpClient, private router: Router, private ts: ToastService) {}

  ngOnInit(): void {
    // fetch existing categories for this user
    this.http.get<any>('/api/candidat/documents/categories').subscribe({
      next: (res) => { try { this.categories = res?.categories || []; if (this.categories.length === 0) this.categories = ['rapport','attestation','publication']; } catch(e){} },
      error: (err) => { console.debug('Could not load categories', err); this.categories = ['rapport','attestation','publication']; }
    });
  }

  // allow keyboard switching for the segmented control (left/right)
  segmentedKeydown(e: KeyboardEvent){
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
      e.preventDefault();
      this.useCustom = !this.useCustom;
    }
  }

  // create previews for images/pdf and show a thumbnail grid for multiple files
  onFile(e: any){
    const fl: FileList | null = e?.target?.files || null;
    if (!fl || fl.length === 0) {
      this.files = []; this.file = null; this.previews = []; this.previewUrl = null; this.previewType = 'none';
      return;
    }
    // revoke previous previews
    for (const p of this.previews) if (p.url) try{ URL.revokeObjectURL(p.url); }catch(e){}
    this.files = Array.from(fl as FileList);
    this.file = this.files[0] || null; // continue to upload first file on submit
    this.previews = [];
    const MAX_PREVIEWS = 8;
    const LARGE_BYTES = 5 * 1024 * 1024; // 5 MB confirmation threshold
    for (let i = 0; i < this.files.length && i < MAX_PREVIEWS; i++){
      const f = this.files[i];
      // if file is large, ask before previewing
      if (f.size > LARGE_BYTES) {
        const human = Math.round(f.size / 1024 / 1024 * 10) / 10;
        if (!confirm(`File "${f.name}" is ${human} MB — previewing may be slow. Continue previewing this file?`)){
          this.previews.push({ url: null, type: 'other', name: f.name });
          continue;
        }
      }
      const t = f.type || '';
      if (t.startsWith('image/')) {
        const u = URL.createObjectURL(f);
        this.previews.push({ url: u, type: 'image', name: f.name });
      } else if (t === 'application/pdf'){
        const u = URL.createObjectURL(f);
        this.previews.push({ url: u, type: 'pdf', name: f.name });
      } else {
        this.previews.push({ url: null, type: 'other', name: f.name });
      }
    }
    // legacy single preview mapping (first preview)
    if (this.previews.length > 0) {
      this.previewUrl = this.previews[0].url;
      this.previewType = this.previews[0].type;
    } else { this.previewUrl = null; this.previewType = 'none'; }
  }

  submit(){
    this.error = null;
    if (!this.title || !this.file) { this.error = 'Title and file required'; return; }
    const fd = new FormData();
    fd.append('title', this.title);
    // backend expects 'category' param name
  fd.append('category', this.useCustom ? this.type : this.type);
  fd.append('file', this.file as Blob, this.file!.name);
  fd.append('note', this.note || '');
  this.uploading = true; this.progress = 0;
    // POST to candidate REST upload endpoint
    this.http.post('/api/candidat/documents/upload', fd, { reportProgress:true, observe: 'events' }).subscribe({
      next: (ev: HttpEvent<any>) => {
        if (ev.type === HttpEventType.UploadProgress && ev.total) {
          this.progress = Math.round(100 * (ev.loaded / ev.total));
        } else if (ev.type === HttpEventType.Response) {
          this.uploading = false; this.progress = 100; this.router.navigate(['/documents']);
          try { this.ts.success('Upload successful'); } catch(e){}
        }
      },
      error: (err) => { this.uploading = false; this.error = err?.error?.message || 'Upload failed'; console.error('Upload failed', err); try{ this.ts.error(this.error || 'Upload failed'); }catch(e){} }
    });
  }

  ngOnDestroy(): void {
    if (this.previewUrl) { URL.revokeObjectURL(this.previewUrl); this.previewUrl = null; }
  }

  clearPreview(){
    for (const p of this.previews) if (p.url) try{ URL.revokeObjectURL(p.url); }catch(e){}
    this.previews = [];
    this.previewUrl = null; this.previewType = 'none'; this.files = []; this.file = null;
    // clear the file input element if present
    try { const el = document.querySelector('input[type=file]') as HTMLInputElement | null; if (el) el.value = ''; } catch(e){}
  }

  clearThumbnail(idx: number){
    const p = this.previews[idx];
    if (p && p.url) try{ URL.revokeObjectURL(p.url); }catch(e){}
    this.previews.splice(idx, 1);
    this.files.splice(idx, 1);
    if (this.previews.length > 0) { this.previewUrl = this.previews[0].url; this.previewType = this.previews[0].type; this.file = this.files[0] || null; }
    else { this.previewUrl = null; this.previewType = 'none'; this.file = null; }
  }
}
