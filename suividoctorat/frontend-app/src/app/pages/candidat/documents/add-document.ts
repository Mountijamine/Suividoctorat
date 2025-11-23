import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ToastService } from '../../../services/toast.service';
import { CandidatNavbarComponent } from '../../../components/navbar/candidat-navbar';

@Component({
  selector: 'add-document',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule, CandidatNavbarComponent],
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
    /* file input/button styling */
    .file-input{ display:flex; gap:0.5rem; align-items:center }
  .btn-file{ background:linear-gradient(90deg,#111,#111); color:#fff; padding:0.8rem 1.1rem; border-radius:10px; border:0; cursor:pointer; font-weight:700; box-shadow:0 8px 24px rgba(2,6,23,0.08) }
  .btn-file:hover{ transform:translateY(-3px) }
    .file-name{ color:#374151; font-size:0.95rem; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
    /* preview text content */
    .preview-text{ padding:0.75rem; max-height:220px; overflow:auto; background:#0b1220; color:#e6eef8; border-radius:6px; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace }
  /* modern dropzone look */
  .file-drop{ display:flex; gap:12px; align-items:center; border:1px dashed #e6eef8; padding:0.85rem; border-radius:10px; background:linear-gradient(180deg,#ffffff,#fbfdff); box-shadow:inset 0 1px 0 rgba(255,255,255,0.6) }
  .file-drop .drop-icon{ font-size:22px; color:#7c93b2 }
  .file-drop .drop-text{ color:#6b7280 }
  .file-drop .drop-title{ font-weight:600; color:#111827 }
  .file-drop .drop-sub{ color:#6b7280; font-size:0.95rem }
  .file-drop .drop-actions{ margin-left:auto; display:flex; gap:8px; align-items:center }
  .btn-file{ background:transparent; color:#111827; padding:0.5rem 0.7rem; border-radius:8px; border:1px solid #e6eef8; cursor:pointer; font-weight:600 }
  .btn-file:hover{ background:#f8fafc }
    .file-drop.drag-active{ border-color:#7c3aed; background:linear-gradient(180deg,#fbfbff,#f7f0ff); box-shadow:0 8px 30px rgba(124,58,237,0.08) }
    .file-drop{ width:100%; box-sizing:border-box; overflow:hidden; max-width:100% }
    /* allow left column to shrink properly inside a flex container (width:0 enables min-width behavior) */
    .file-drop-left{ display:flex; gap:12px; align-items:center; min-width:0; flex:1 1 0%; width:0 }
    /* filename must not grow container; ensure it truncates and respects parent's width */
    .file-drop-left .file-name{ display:block; width:100%; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
      /* make sure any filename or metadata inside previews truncate and don't expand flex items */
      .single-preview .trunc, .other-meta.trunc, .grid-item .trunc { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:100%; }
      /* enforce min-width:0 on preview grid items so long children don't force expansion */
      .columns-stretch .right-panel, .columns-stretch .left-panel, .columns-stretch .right-panel > * { min-width:0 }
    /* Make sure action area doesn't shrink and stays at right */
    .drop-actions{ margin-left:auto; display:flex; gap:8px; align-items:center; flex:0 0 auto }
    .trunc{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:block }
    .file-count{ margin-left:6px; color:#6b7280; font-size:0.95rem }
    .drop-actions{ margin-left:auto; display:flex; gap:8px; align-items:center }
    .drop-title{ font-weight:700 }
    .drop-sub{ color:#6b7280; font-size:0.95rem }
  .columns-stretch{ display:flex; align-items:stretch; gap:1.25rem; background:#fff; border-radius:12px; padding:12px; box-shadow:0 8px 24px rgba(2,6,23,0.06) }
  .preview-full{ width:100%; height:100%; display:flex; align-items:center; justify-content:center }
  /* make inner panels transparent so the outer card shows as single block */
  .columns-stretch > div { background:transparent; box-shadow:none }
  .columns-stretch > div { display:flex; flex-direction:column }
  .left-panel{ flex:1.2 }
  .right-panel{ flex:0 0 440px; position:relative }
  /* single large preview styling */
  .single-preview{ flex:1; display:flex; align-items:center; justify-content:center; width:100%; height:100% }
  .single-preview img, .single-preview object, .single-preview iframe{ width:100%; height:100%; border-radius:12px }
  .file-icon{ width:64px; height:64px; display:block; margin:auto }
  .other-file .other-meta{ margin-top:8px; color:#374151; font-size:0.95rem }
  .other-file .other-meta{ max-width:92%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
  .truncated-note{ margin-top:8px; color:#6b7280; font-size:0.9rem }
  /* responsive: stack columns on small screens */
  @media (max-width: 900px){
    .columns-stretch{ flex-direction:column; padding:8px }
    .right-panel{ flex:0 0 auto; width:100% }
    .single-preview{ height:240px }
    .file-name{ max-width:320px }
  }
  .preview-close{ position:absolute; top:10px; right:10px; width:36px; height:36px; border-radius:999px; border:0; background:rgba(0,0,0,0.55); color:#fff; z-index:30; display:inline-flex; align-items:center; justify-content:center; cursor:pointer }
  .preview-close:hover{ transform:scale(1.06); box-shadow:0 8px 20px rgba(0,0,0,0.18) }
  .preview-full img{ width:100%; height:100%; object-fit:cover; border-radius:12px }
  .btn-save{ flex:1; background:#111; color:#fff; border:0; padding:0.9rem; border-radius:8px; cursor:pointer; font-weight:700; display:inline-flex; align-items:center; justify-content:center }
  .btn-save:hover{ transform:translateY(-3px); box-shadow:0 12px 30px rgba(2,6,23,0.12) }
  .btn-cancel{ padding:0.9rem 1rem; border-radius:8px; border:1px solid #e6eef8; background:#fff; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; text-decoration:none; color:#111827; min-width:110px; font-weight:600; transition:background 140ms, transform 120ms, box-shadow 160ms }
  .btn-cancel:hover{ background:#f8fafc; transform:translateY(-2px); box-shadow:0 8px 18px rgba(2,6,23,0.06) }
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
  previews: Array<{ url: string | null, urlSafe?: any, type: 'image'|'pdf'|'other'|'none'|'text', name?: string, content?: string, ext?: string, truncated?: boolean, deferred?: boolean }> = [];
  // keep legacy single-preview properties for simple checks
  previewUrl: string | null = null;
  previewType: 'image'|'pdf'|'other'|'none'|'text' = 'none';
  uploading = false;
  progress = 0;
  error: string | null = null;
  dragActive = false;

  constructor(private http: HttpClient, private router: Router, private ts: ToastService, private sanitizer: DomSanitizer) {}

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

  // create previews for images/pdf/text and show a thumbnail grid for multiple files
  async onFile(e: any){
    const fl: FileList | null = e?.target?.files || e?.dataTransfer?.files || null;
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
    // helper to get extension
    const getExt = (name: string) => {
      const m = (name || '').split('.');
      return m.length > 1 ? m[m.length-1].toLowerCase() : '';
    };

  const imageExts = new Set(['jpg','jpeg','png','gif','webp','svg']);
  const textExts = new Set(['txt','md','json','xml','js','ts','jsx','tsx','css']);
  const officeExts = new Set(['doc','docx','xls','xlsx','ppt','pptx']);
  // extensions we intentionally defer previewing until the user requests it
  const DEFER_TEXT_EXTS = new Set(['html','htm','csv','log','sql']);
  const PREVIEW_TEXT_MAX = 200 * 1024; // preview only first 200KB of text files to avoid blocking

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
      const ext = getExt(f.name);
      // If the extension is in the defer-list, do not read or create object URLs yet — show a lightweight placeholder
      if (DEFER_TEXT_EXTS.has(ext)) {
        this.previews.push({ url: null, type: 'text', name: f.name, ext, deferred: true });
        continue;
      }
      // images by extension or mime
      if (imageExts.has(ext) || t.startsWith('image/')) {
        const u = URL.createObjectURL(f);
        this.previews.push({ url: u, type: 'image', name: f.name, ext });
      } else if (ext === 'pdf' || t === 'application/pdf'){
        const u = URL.createObjectURL(f);
        const safe = this.sanitizer.bypassSecurityTrustResourceUrl(u);
        this.previews.push({ url: u, urlSafe: safe, type: 'pdf', name: f.name, ext });
      } else if (textExts.has(ext) || t.startsWith('text/') || t.includes('json') || t.includes('xml')){
        // read text/code content for inline preview (escape in template)
        try{
          // if file is big, only read a slice to avoid blocking/huge memory usage
          let truncated = false;
          let txt = '';
          if (f.size > PREVIEW_TEXT_MAX) {
            const slice = f.slice(0, PREVIEW_TEXT_MAX);
            txt = await slice.text();
            truncated = true;
          } else {
            txt = await f.text();
          }
          this.previews.push({ url: null, type: 'text', name: f.name, content: txt, ext, truncated });
        }catch(e){
          this.previews.push({ url: null, type: 'other', name: f.name, ext });
        }
      } else {
        // unknown/binary: do not attempt to preview, show filename only
        this.previews.push({ url: null, type: 'other', name: f.name, ext });
      }
    }
    // legacy single preview mapping (first preview)
    if (this.previews.length > 0) {
      this.previewUrl = this.previews[0].url;
      this.previewType = this.previews[0].type;
    } else { this.previewUrl = null; this.previewType = 'none'; }
  }

  // Return a small inline SVG data-uri for common extensions to avoid extra asset files
  getIconForExt(ext?: string | undefined): string {
    const e = (ext || '').toLowerCase();
    const icons: Record<string, string> = {
      pdf: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><rect fill="%23E53E3E" width="24" height="24" rx="3"/><text x="12" y="16" font-size="10" font-family="Arial" font-weight="700" fill="white" text-anchor="middle">PDF</text></svg>',
      docx: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><rect fill="%23007ACC" width="24" height="24" rx="3"/><text x="12" y="16" font-size="9" font-family="Arial" font-weight="700" fill="white" text-anchor="middle">DOCX</text></svg>',
      doc: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><rect fill="%23007ACC" width="24" height="24" rx="3"/><text x="12" y="16" font-size="9" font-family="Arial" font-weight="700" fill="white" text-anchor="middle">DOC</text></svg>',
      zip: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><rect fill="%23000000" width="24" height="24" rx="3"/><text x="12" y="16" font-size="9" font-family="Arial" font-weight="700" fill="white" text-anchor="middle">ZIP</text></svg>',
      xls: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><rect fill="%2300A859" width="24" height="24" rx="3"/><text x="12" y="16" font-size="9" font-family="Arial" font-weight="700" fill="white" text-anchor="middle">XLS</text></svg>',
      ppt: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><rect fill="%23D97B00" width="24" height="24" rx="3"/><text x="12" y="16" font-size="8.5" font-family="Arial" font-weight="700" fill="white" text-anchor="middle">PPT</text></svg>',
      default: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><rect fill="%238B8B8B" width="24" height="24" rx="3"/><path d="M6 4h9l5 5v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="%23fff" opacity="0.15"/></svg>'
    };
    return icons[e] || icons['default'];
  }

  // Load full text preview for a truncated text preview (reads the whole file)
  async loadFullTextPreview(p: { name?: string, ext?: string, type?: string, content?: string, truncated?: boolean }){
    // find file by name
    const f = this.files.find(x => x.name === p.name);
    if (!f) return;
    try{
      const full = await f.text();
      p.content = full;
      p.truncated = false;
    }catch(e){
      // keep truncated state and optionally show an error
      console.error('Could not load full preview', e);
    }
  }

  // Load deferred preview (for HTML/CSV/etc) on user demand. This reads a slice for large files.
  async loadDeferredPreview(p: { name?: string | undefined, ext?: string | undefined, deferred?: boolean, type?: string, content?: string, truncated?: boolean, url?: string | null, urlSafe?: any }){
    if (!p || !p.name) return;
    const f = this.files.find(x => x.name === p.name);
    if (!f) return;
    // mark not deferred while loading
    p.deferred = false;
    const PREVIEW_TEXT_MAX = 1024 * 200;
    try{
      if ((f.type && f.type.startsWith('image/')) || /jpe?g|png|gif|webp|svg/i.test((p.ext||'') as string)){
        const u = URL.createObjectURL(f);
        p.url = u; p.type = 'image'; p.ext = p.ext || (f.name.split('.').pop() || '');
      } else if ((p.ext || '').toLowerCase() === 'pdf' || f.type === 'application/pdf'){
        const u = URL.createObjectURL(f);
        p.url = u; p.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(u); p.type = 'pdf';
      } else if ((f.type && f.type.startsWith('text/')) || /txt|md|json|xml|html|htm|csv|log|sql/i.test(p.ext||'')){
        let truncated = false;
        let txt = '';
        if (f.size > PREVIEW_TEXT_MAX) {
          txt = await f.slice(0, PREVIEW_TEXT_MAX).text();
          truncated = true;
        } else {
          txt = await f.text();
        }
        p.content = txt; p.truncated = truncated; p.type = 'text';
      } else {
        // unknown, leave as other
        p.type = 'other';
      }
    }catch(e){
      console.error('Failed to load deferred preview', e);
      p.deferred = true; // revert
    }
  }

  // drag/drop handlers
  onDragOver(e: DragEvent){
    e.preventDefault();
    try{ (e.dataTransfer as any).dropEffect = 'copy'; }catch(e){}
  }

  onDrop(e: DragEvent){
    e.preventDefault();
    const dt = e.dataTransfer;
    if (!dt) return;
    // create a synthetic event shape expected by onFile
    this.dragActive = false;
    this.onFile({ target: { files: dt.files } });
  }

  onDragEnter(e: DragEvent){
    e.preventDefault();
    this.dragActive = true;
  }

  onDragLeave(e: DragEvent){
    e.preventDefault();
    // only clear when leaving the drop zone entirely
    this.dragActive = false;
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
          this.uploading = false; this.progress = 100; this.router.navigate(['/candidat/documents']);
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
