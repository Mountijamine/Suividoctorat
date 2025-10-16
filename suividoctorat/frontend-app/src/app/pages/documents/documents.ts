import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../components/toast/toast';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'documents-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink],
  templateUrl: './documents.html',
  styles: [
    `
    .wrap{ max-width:1200px; margin:1.25rem auto; padding:1rem }
    .tools{ display:flex; gap:0.5rem; align-items:center; justify-content:space-between }
    .grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:1rem; margin-top:1rem }
    .doc-card{ background:#fff; border-radius:12px; padding:1rem; box-shadow:0 8px 20px rgba(2,6,23,0.06); display:flex; flex-direction:column; gap:0.5rem }
    .meta{ display:flex; justify-content:space-between; gap:0.5rem; align-items:center }
    .badge{ background:#eef2ff; color:#1e40af; padding:0.25rem 0.5rem; border-radius:999px; font-weight:600 }
    .actions{ margin-top:auto; display:flex; gap:0.5rem }
    `]
})
export class DocumentsPage {
  docs = signal<any[]>([]);
  total = signal(0);
  page = signal(0);
  size = signal(6);
  query = signal('');
  filterType = signal('all');
  selected = signal<Record<string, boolean>>({});

  constructor(private http: HttpClient,
              private route: ActivatedRoute,
              private router: Router,
              private ts: ToastService,
              private auth: AuthService){
    // listen to query params so page is bookmarkable/shareable
    this.route.queryParams.subscribe(q => {
      const p = parseInt(q['page'] || '0', 10) || 0;
      const s = parseInt(q['size'] || String(this.size()), 10) || this.size();
      this.page.set(p);
      this.size.set(s);
      this.query.set(q['q'] || '');
      this.filterType.set(q['type'] || 'all');
      // only call load when authenticated to avoid 403
      if (this.auth.isLoggedIn()) this.load();
    });

    // also load when the user logs in while on the page (react to signal)
    effect(() => {
      const logged = this.auth.isLoggedIn();
      if (logged) this.load(); else { this.docs.set([]); this.total.set(0); }
    });
  }

  load(){
    const params: any = { page: String(this.page()), size: String(this.size()) };
    if (this.query()) params.q = this.query();
    if (this.filterType() && this.filterType() !== 'all') params.type = this.filterType();
    // call candidate REST API (server exposes /api/candidat/documents)
    this.http.get('/api/candidat/documents', { params }).subscribe({
      next: (res:any) => {
        // backend returns a Page-like shape: { content: [...], totalElements: N, totalPages: M, number: page }
        if (Array.isArray(res)) {
          this.docs.set(res);
          this.total.set(res.length);
        } else if (res && res.content) {
          this.docs.set(res.content || []);
          this.total.set(res.totalElements || (res.content || []).length || 0);
          // synchronize page from server if provided
          if (typeof res.number === 'number') this.page.set(res.number);
        } else {
          this.docs.set(res?.data || []);
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
    if (this.filterType() !== 'all' && d.type !== this.filterType()) return false;
    if (!q) return true;
    return (d.title || '').toLowerCase().includes(q) || (d.type || '').toLowerCase().includes(q);
  }));

  toggle(id:string){ this.selected.update(s => { s[id] = !s[id]; return s; }); }

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
  setPage(p: number){ this.page.set(p); this.router.navigate([], { queryParams: { page: p, size: this.size(), q: this.query(), type: this.filterType() } }); }

  totalPages(){ return Math.max(1, Math.ceil(this.total()/this.size())); }
}
