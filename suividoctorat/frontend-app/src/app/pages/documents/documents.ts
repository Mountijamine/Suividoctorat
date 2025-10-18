import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../components/toast/toast';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'documents-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './documents.html',
  styles: [
    `
    .wrap{ max-width:1200px; margin:1.25rem auto; padding:1rem }
    .header{ display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem }
    .title { margin:0; font-size:1.5rem }
    .subtitle { margin:0; color:#6b7280 }
    .search-bar{ display:flex; gap:0.75rem; align-items:center; margin:0.75rem 0 }
    .search-input input{ padding:0.6rem 0.8rem; border-radius:8px; border:1px solid #eef2f7; width:360px }
    .btn-primary{ background:linear-gradient(90deg,#111,#111); color:#fff; padding:0.6rem 0.9rem; border-radius:8px; border:0 }
  .layout{ display:grid; grid-template-columns:380px 1fr; gap:1rem }
    .filters-card{ background:#fff; padding:1rem; border-radius:12px; box-shadow:0 8px 20px rgba(2,6,23,0.06); box-sizing:border-box }
  .filters { position:relative }
  .filters-card { position:sticky; top:20px; max-height:calc(100vh - 40px); overflow:auto; overflow-x:hidden; padding-bottom:16px }
  /* make inputs/selects/buttons inside sidebar fit and not overflow */
  .filters-card input, .filters-card select, .filters-card button { width:100%; box-sizing:border-box }
  .filters-card .types { max-width:100%; overflow:auto }
    .filters-header h3{ display:flex; align-items:center; gap:8px }
  /* neutral header, no decorative icon */
  .btn-mobile-toggle{ display:none }
    @media (max-width: 900px){
      .layout{ grid-template-columns:1fr }
      .filters { order:-1 }
      .filters-card{ position:relative; max-height:none }
      .content { max-height:none; overflow:visible }
      .btn-mobile-toggle{ display:inline-flex; padding:0.45rem 0.6rem; border-radius:8px; border:1px solid #e6eef8; background:#fff }
    }
  /* make the main content scroll independently so filters stay visible while browsing docs */
  .content { max-height: calc(100vh - 140px); overflow:auto; padding-right:8px }
    .filters-header{ display:flex; justify-content:space-between; align-items:center }
    .filter-section{ margin-top:0.75rem }
    .types{ display:flex; flex-direction:column; gap:0.35rem; max-height:300px; overflow:auto }
    .type-item{ display:flex; gap:0.5rem; align-items:center }
    .type-item.active{ font-weight:700 }
    .content{ }
    .meta-top{ color:#6b7280; margin-bottom:0.5rem }
  .cards{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:1rem }
    .card{ background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 8px 20px rgba(2,6,23,0.06); display:flex; flex-direction:column }
  .card-media{ position:relative; height:160px; background:#f8fafc; display:flex; align-items:center; justify-content:center; overflow:hidden }
  .card-media img{ width:100%; height:100%; object-fit:cover; display:block }
  .placeholder{ width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f8fafc }
  .placeholder-icon{ width:100%; height:100%; display:flex; align-items:center; justify-content:center }
  .placeholder-icon svg{ width:100%; height:100%; object-fit:cover; max-width:120px; max-height:96px }
    .media-overlay{ position:absolute; bottom:8px; left:8px; right:8px; display:flex; gap:8px; opacity:0; transition:opacity 160ms }
    .card:hover .media-overlay{ opacity:1 }
  .media-overlay button{ background:#fff; border:1px solid #e6eef8; padding:0.4rem 0.6rem; border-radius:8px; color:#111827; cursor:pointer; display:inline-flex; gap:8px; align-items:center; font-weight:600 }
  .media-overlay button:hover{ background:#f8fafc }
    .card-body{ padding:0.9rem; display:flex; flex-direction:column; gap:0.5rem }
    .card-head{ display:flex; justify-content:space-between; align-items:flex-start }
    .card-title{ font-weight:700 }
    .card-type{
      display:inline-block;
      background:#f3f4f6;          /* soft neutral gray */
      color:#111827;               /* charcoal text */
      padding:0.28rem 0.6rem;
      border-radius:999px;
      font-size:12px;
      font-weight:600;
      text-transform:none;
      letter-spacing:0.2px;
      max-width:120px;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
      border:1px solid rgba(15,23,42,0.04);
    }
  .card-menu{ display:flex; gap:8px; align-items:center }
  .card-menu .top-actions{ display:flex; gap:6px; align-items:center; margin-right:6px }
  .card-note{ color:#6b7280; font-size:13px; margin-top:4px }
    .card-meta{ display:flex; justify-content:space-between; color:#6b7280; font-size:13px }
    .card-actions{ display:flex; gap:0.5rem; margin-top:0.5rem }
  .btn-ghost{ background:transparent; border:1px solid #e6eef8; padding:0.45rem 0.6rem; border-radius:8px; cursor:pointer }
  .btn-ghost:hover{ background:#f8fafc }
    .btn-danger{ background:#ef4444; color:#fff; border:0; padding:0.45rem 0.6rem; border-radius:8px }
  .btn-danger:hover{ filter:brightness(0.95) }
  .btn-top{ padding:0.35rem 0.45rem; font-size:13px }
  /* filters card buttons hover polish */
  .filters-card .btn-primary{ transition:transform 120ms ease, box-shadow 140ms ease }
  .filters-card .btn-primary:hover{ transform:translateY(-3px); box-shadow:0 8px 20px rgba(2,6,23,0.06) }
  .filters-card .btn-outline{ border:1px solid #e6eef8; background:transparent; border-radius:8px; transition:background 120ms, transform 120ms }
  .filters-card .btn-outline:hover{ background:#f8fafc; transform:translateY(-2px) }
    .pager{ display:flex; justify-content:center; gap:0.75rem; margin-top:1rem; align-items:center }
      .pager-btn{ background:#fff; border:1px solid #e6eef8; padding:0.5rem 0.75rem; border-radius:8px; cursor:pointer; font-weight:600 }
      .pager-btn:hover{ transform:translateY(-2px); box-shadow:0 6px 18px rgba(2,6,23,0.06) }
      .pager-btn[disabled]{ opacity:0.55; cursor:not-allowed; transform:none; box-shadow:none }
      .pager-info{ padding:0.45rem 0.7rem; border-radius:8px; background:#fff; border:1px solid #eef2f7; color:#374151 }
    `]
})
export class DocumentsPage {
  docs = signal<any[]>([]);
  total = signal(0);
  page = signal(0);
  size = signal(6);
  query = signal('');
  filterType = signal('all');
  categories = signal<string[]>([]);
  selected = signal<Record<string, boolean>>({});
  // mobile: controls whether sidebar (filters) is visible
  sidebarOpen = signal(false);

  isDesktop(){ try{ return window.innerWidth > 900; } catch(e){ return true; } }

  constructor(private http: HttpClient,
              private route: ActivatedRoute,
              private router: Router,
              private ts: ToastService,
              public auth: AuthService){
    // listen to query params so page is bookmarkable/shareable
    this.route.queryParams.subscribe(q => {
      const p = parseInt(q['page'] || '0', 10) || 0;
      const s = parseInt(q['size'] || String(this.size()), 10) || this.size();
      this.page.set(p);
      this.size.set(s);
      this.query.set(q['q'] || '');
  // server expects 'category' param; keep local key as filterType but read 'category' from URL
      this.filterType.set(q['category'] || q['type'] || 'all');
      // only call load when authenticated to avoid 403
      if (this.auth.isLoggedIn()) this.load();
    });

    // also load when the user logs in while on the page (react to signal)
    effect(() => {
      const logged = this.auth.isLoggedIn();
      if (logged) {
        // load categories once when logged in
        this.loadCategories();
        this.load();
      } else { this.docs.set([]); this.total.set(0); this.categories.set([]); }
    });
  }

  // image error handler: replace broken src with local placeholder
  onImageError(e: any){
    try{
      (e.target as HTMLImageElement).src = 'assets/doc-placeholder.jpg';
    }catch(e){ }
  }

  private loadCategories(){
    this.http.get<any>('/api/candidat/documents/categories').subscribe({
      next: (res) => {
        const cats = Array.isArray(res?.categories) ? res.categories : (res?.categories || []);
        // ensure unique and sorted presentation
  const uniq = Array.from(new Set((cats as string[]).map((c:string) => (c||'').trim()).filter(Boolean)));
  this.categories.set(uniq as string[]);
      },
      error: (err) => { console.debug('Could not load categories', err); this.categories.set([]); }
    });
  }

  load(){
    const params: any = { page: String(this.page()), size: String(this.size()) };
    if (this.query()) params.q = this.query();
    if (this.filterType() && this.filterType() !== 'all') params.category = this.filterType();
    // call candidate REST API (server exposes /api/candidat/documents)
    this.http.get('/api/candidat/documents', { params }).subscribe({
  next: (res:any) => {
        // backend returns a Page-like shape: { content: [...], totalElements: N, totalPages: M, number: page }
        if (Array.isArray(res)) {
          // normalize docs array
          const normalized = (res as any[]).map(d => this.normalizeDoc(d));
          this.docs.set(normalized);
          this.total.set(res.length);
        } else if (res && res.content) {
          const normalized = (res.content || []).map((d:any) => this.normalizeDoc(d));
          this.docs.set(normalized || []);
          this.total.set(res.totalElements || (res.content || []).length || 0);
          // synchronize page from server if provided
          if (typeof res.number === 'number') this.page.set(res.number);
        } else {
          const raw = res?.data || [];
          this.docs.set((Array.isArray(raw) ? raw : []).map((d:any) => this.normalizeDoc(d)));
          this.total.set(res?.total || (res?.data||[]).length || 0);
        }
  try { this.ts.success('Documents loaded'); } catch(e){}
      },
      error: (err:any) => {
        console.error('Failed to fetch documents', err);
        this.docs.set([]);
        this.total.set(0);
  try { this.ts.error('Failed to load documents'); } catch(e){}
      }
    });
  }

  // Normalize backend document shape to ensure previewUrl/thumbnail are available where possible
  private normalizeDoc(d:any){
    if (!d) return d;
    const doc = { ...d };
    // common server fields: filename, original_filename, path, url, previewUrl, thumbnail
    // if server returned a filesystem path or filename but no public url, try to construct one
    if (!doc.previewUrl && !doc.thumbnail && !doc.url) {
      const filename = doc.filename || doc.fileName || doc.original_filename || doc.originalFilename || null;
      if (filename) {
        // only create a preview URL for image files (prevent trying to load HTML as an <img>)
        if (/(jpe?g|png|gif|webp|svg)$/i.test(filename)) {
          doc.previewUrl = '/uploads/' + filename;
        }
      }
    }
    return doc;
  }

  // determine if a document should be rendered as an <img>
  isImage(d:any){
    if (!d) return false;
    const src = (d.thumbnail || d.previewUrl || d.url || d.filename || d.originalFilename || d.original_filename || '') as string;
    return !!src && /\.(jpe?g|png|gif|webp|svg)$/i.test(src);
  }

  // fetch all matching documents from the backend by paging through results
  private async fetchAllMatching(): Promise<any[]>{
    const collected: any[] = [];
    const baseParams: any = {};
    if (this.query()) baseParams.q = this.query();
    if (this.filterType() && this.filterType() !== 'all') baseParams.category = this.filterType();
    let page = 0;
    const pageSize = Math.max(100, this.size()); // fetch reasonably large pages
    while (true) {
      const params: any = { ...baseParams, page: String(page), size: String(pageSize) };
      try {
        const res: any = await firstValueFrom(this.http.get('/api/candidat/documents', { params }));
        if (res && Array.isArray(res)) { collected.push(...res); break; }
        if (res && res.content) {
          collected.push(...(res.content || []));
          if (typeof res.totalPages === 'number' && page >= res.totalPages - 1) break;
          page++;
          continue;
        }
        // unknown shape, break
        break;
      } catch (e) {
        console.error('Failed to fetch page for export', e);
        break;
      }
    }
    return collected;
  }

  filtered = computed(() => this.docs().filter(d => {
    const q = this.query().toLowerCase();
    const docType = d.category || d.type || '';
    if (this.filterType() !== 'all' && docType !== this.filterType()) return false;
    if (!q) return true;
    return (d.title || '').toLowerCase().includes(q) || (docType || '').toLowerCase().includes(q);
  }));

  // download document by id using candidate REST download endpoint
  downloadDocument(id: number|string){
    const url = `/api/candidat/documents/download/${id}`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const dlUrl = URL.createObjectURL(blob as Blob);
        const a = document.createElement('a'); a.href = dlUrl; a.download = `document-${id}`; a.click(); URL.revokeObjectURL(dlUrl);
      },
      error: (err) => { console.error('Download failed', err); try{ this.ts.error('Download failed'); }catch(e){} }
    });
  }

  // share: copy a link to clipboard (relative url to download endpoint)
  async shareDocument(id: number|string){
    const href = window.location.origin + `/api/candidat/documents/download/${id}`;
    try{
      await navigator.clipboard.writeText(href);
      try{ this.ts.success('Link copied to clipboard'); }catch(e){}
    } catch(e){
      // fallback: select a temporary input
      const input = document.createElement('input'); input.value = href; document.body.appendChild(input); input.select(); document.execCommand('copy'); document.body.removeChild(input);
      try{ this.ts.success('Link copied to clipboard'); }catch(e){}
    }
  }

  toggle(id:string){ this.selected.update(s => { s[id] = !s[id]; return s; }); }

  // helper to open document in a new tab/window
  async openDocument(id: number|string){
    // Open a blank window immediately to preserve user gesture (avoid popup blockers)
    const blank = window.open('', '_blank');
    const url = '/api/candidat/documents/download/' + id;
    if (!blank) {
      // if popup blocked, fall back to navigating to the endpoint in current tab
      try { window.location.href = url; } catch(e){ console.warn('Could not open document', e); }
      return;
    }
    try{
      // request full response so we can read Content-Type header
      const resp: any = await firstValueFrom(this.http.get(url, { responseType: 'blob', observe: 'response' as 'response' }));
      const blob = resp?.body as Blob;
      const contentType = (resp && resp.headers && resp.headers.get) ? resp.headers.get('content-type') || blob?.type || '' : (blob?.type || '');
      let toOpen = blob;
      if (blob && contentType && (!blob.type || blob.type === '')) {
        try { toOpen = new Blob([blob], { type: contentType }); } catch(e) { /* ignore */ }
      }
      const dlUrl = URL.createObjectURL(toOpen as Blob);

      // Build a simple viewer page in the opened window that embeds the blob URL inline
      const safeUrl = dlUrl; // blob URLs are safe here
      const lower = (contentType || '').toLowerCase();
      let viewerHtml = `<!doctype html><html><head><title>Preview</title><meta name=viewport content='width=device-width,initial-scale=1'></head><body style='margin:0; background:#111827; color:#fff; height:100vh;'>`;
      // top bar with a close button (user can also use browser controls)
      viewerHtml += `<div style='display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#0f1724;color:#fff;font-family:system-ui;box-shadow:0 2px 8px rgba(0,0,0,0.4)'>`;
      viewerHtml += `<div>Preview</div><div><button onclick='window.close()' style='padding:6px 10px;border-radius:6px;border:0;background:#111827;color:#fff;cursor:pointer'>Close</button></div></div>`;

      if (lower.startsWith('image/')) {
        viewerHtml += `<div style='display:flex;align-items:center;justify-content:center;height:calc(100vh - 52px);'><img src="${safeUrl}" style='max-width:100%;max-height:100%;object-fit:contain' alt='preview'/></div>`;
      } else if (lower.includes('pdf')) {
        viewerHtml += `<iframe src="${safeUrl}" style='width:100%;height:calc(100vh - 52px);border:0'></iframe>`;
      } else if (lower.startsWith('text/') || lower.includes('json') || lower.includes('xml')) {
        // for text, fetch as text inside the new window for nicer display
        try {
          const text = await toOpen.text();
          const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
          viewerHtml += `<pre style='padding:1rem;white-space:pre-wrap;word-break:break-word; height:calc(100vh - 52px); overflow:auto; background:#0b1220;color:#e6eef8'>${escaped}</pre>`;
        } catch(e){
          viewerHtml += `<iframe src="${safeUrl}" style='width:100%;height:calc(100vh - 52px);border:0'></iframe>`;
        }
      } else {
        // generic fallback: embed in iframe which often displays or lets user save
        viewerHtml += `<iframe src="${safeUrl}" style='width:100%;height:calc(100vh - 52px);border:0'></iframe>`;
      }

      viewerHtml += '</body></html>';

      try{
        blank.document.open();
        blank.document.write(viewerHtml);
        blank.document.close();
      } catch(e){
        // last resort: navigate the blank window to the blob URL
        try{ blank.location.href = safeUrl; } catch(err){ window.open(safeUrl, '_blank'); }
      }

      // revoke after a delay so the new window has time to use the blob
      setTimeout(() => { try{ URL.revokeObjectURL(dlUrl); }catch(e){} }, 45000);
    } catch(err:any){
      console.error('Could not open document', err);
      try{ this.ts.error('Could not open document'); }catch(e){}
      try{ blank.close(); }catch(e){}
    }
  }

  // select a filter type from template
  selectType(c: string){ this.filterType.set(c); this.setPage(0); }

  // navigate to add document page or to login with redirect when not authenticated
  gotoAdd(){
    if (this.auth.isLoggedIn && this.auth.isLoggedIn()){
      this.router.navigate(['/documents','add']);
    } else {
      try { this.router.navigate(['/auth/login'], { queryParams: { redirect: '/documents/add' } }); } catch(e){ this.router.navigate(['/auth/login']); }
    }
  }

  exportCSV(){
    (async () => {
      const sel = Object.entries(this.selected()).filter(([k,v]) => v).map(([k]) => k);
      // if user selected rows, do local export
      if (sel.length > 0) {
        const set = new Set(sel.map(s => String(s)));
        const rowsData = this.docs().filter(d => set.has(String(d.id)));
        if (!rowsData || rowsData.length === 0) { alert('No data to export'); return; }
        const rows = rowsData.map(d => ({ id: d.id, title: d.title || d.originalFilename || '', category: d.category || d.type || '', uploadedAt: d.uploadedAt || d.date || '' }));
        const csv = [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).map(v=>`"${String(v||'')?.replace(/"/g,'""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'documents.csv'; a.click(); URL.revokeObjectURL(url);
        return;
      }

      // No selection: prefer server-side export for large sets
      // First get totalElements for current filters by requesting page=0,size=1
      const params: any = { page: '0', size: '1' };
      if (this.query()) params.q = this.query();
      if (this.filterType() && this.filterType() !== 'all') params.category = this.filterType();
      try {
        const sres: any = await firstValueFrom(this.http.get('/api/candidat/documents', { params }));
        const total = (sres && sres.totalElements) ? sres.totalElements : 0;
        const MAX_CONFIRM = 500;
        if (total > MAX_CONFIRM) {
          if (!confirm(`Export will include ${total} rows. This may take a while. Continue?`)) return;
        }
        // trigger server-side export
        const qparams: any = {};
        if (this.query()) qparams.q = this.query();
        if (this.filterType() && this.filterType() !== 'all') qparams.category = this.filterType();
        const url = '/api/candidat/documents/export' + (Object.keys(qparams).length ? '?' + new URLSearchParams(qparams).toString() : '');
        const resp = await firstValueFrom(this.http.get(url, { responseType: 'blob' }));
        const blob = new Blob([resp], { type: 'text/csv' });
        const dlUrl = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = dlUrl; a.download = 'documents_export.csv'; a.click(); URL.revokeObjectURL(dlUrl);
      } catch (e:any) {
        console.error('Server export failed, falling back to client export', e);
  try { this.ts.error('Server export failed, using client-side export'); } catch(e){}
        // fallback to fetching everything client-side
        const rowsData = await this.fetchAllMatching();
        if (!rowsData || rowsData.length === 0) { alert('No data to export'); return; }
        const rows = rowsData.map(d => ({ id: d.id, title: d.title || d.originalFilename || '', category: d.category || d.type || '', uploadedAt: d.uploadedAt || d.date || '' }));
        const csv = [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).map(v=>`"${String(v||'')?.replace(/"/g,'""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url2 = URL.createObjectURL(blob);
        const a2 = document.createElement('a'); a2.href = url2; a2.download = 'documents.csv'; a2.click(); URL.revokeObjectURL(url2);
      }
    })();
  }

  goto(p: number){ if (p < 0) p = 0; if (p > Math.ceil(this.total()/this.size())-1) p = Math.ceil(this.total()/this.size())-1; this.page.set(p); this.load(); }

  // helper to change page and update URL
  setPage(p: number){ this.page.set(p); this.router.navigate([], { queryParams: { page: p, size: this.size(), q: this.query(), category: this.filterType() } }); }

  totalPages(){ return Math.max(1, Math.ceil(this.total()/this.size())); }
}
