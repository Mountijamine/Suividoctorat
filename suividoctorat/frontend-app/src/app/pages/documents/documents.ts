import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router){
    // listen to query params so page is bookmarkable/shareable
    this.route.queryParams.subscribe(q => {
      const p = parseInt(q['page'] || '0', 10) || 0;
      const s = parseInt(q['size'] || String(this.size()), 10) || this.size();
      this.page.set(p);
      this.size.set(s);
      this.query.set(q['q'] || '');
      this.filterType.set(q['type'] || 'all');
      this.load();
    });
  }

  load(){
    const params: any = { page: String(this.page()), size: String(this.size()) };
    if (this.query()) params.q = this.query();
    if (this.filterType() && this.filterType() !== 'all') params.type = this.filterType();
    this.http.get('/api/documents', { params }).subscribe({
      next: (res:any) => {
        // expected shape: { data: [...], total: 123 }
        if (Array.isArray(res)) { this.docs.set(res); this.total.set(res.length); }
        else { this.docs.set(res?.data || []); this.total.set(res?.total || (res?.data||[]).length || 0); }
      },
      error: (err:any) => {
        console.error('Failed to fetch documents', err);
        // fallback mock
        const mock = [
          { id: 'd1', title: 'Rapport de thèse', type: 'rapport', date: '2025-10-10' },
          { id: 'd2', title: 'Attestation d’inscription', type: 'attestation', date: '2024-09-01' },
          { id: 'd3', title: 'Article accepté', type: 'publication', date: '2025-06-20' }
        ];
        this.docs.set(mock.slice(this.page()*this.size(), (this.page()+1)*this.size()));
        this.total.set(mock.length);
      }
    });
  }

  filtered = computed(() => this.docs().filter(d => {
    const q = this.query().toLowerCase();
    if (this.filterType() !== 'all' && d.type !== this.filterType()) return false;
    if (!q) return true;
    return (d.title || '').toLowerCase().includes(q) || (d.type || '').toLowerCase().includes(q);
  }));

  toggle(id:string){ this.selected.update(s => { s[id] = !s[id]; return s; }); }

  exportCSV(){
    const rows = this.docs().map(d => ({ id: d.id, title: d.title, type: d.type, date: d.date }));
    if (rows.length === 0) return alert('No data to export');
    const csv = [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).map(v=>`"${String(v||'')?.replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'documents.csv'; a.click(); URL.revokeObjectURL(url);
  }

  goto(p: number){ if (p < 0) p = 0; if (p > Math.ceil(this.total()/this.size())-1) p = Math.ceil(this.total()/this.size())-1; this.page.set(p); this.load(); }

  // helper to change page and update URL
  setPage(p: number){ this.page.set(p); this.router.navigate([], { queryParams: { page: p, size: this.size(), q: this.query(), type: this.filterType() } }); }

  totalPages(){ return Math.max(1, Math.ceil(this.total()/this.size())); }
}
