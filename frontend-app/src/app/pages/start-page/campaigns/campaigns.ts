import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PublicNavbarComponent } from '../../../components/navbar/public-navbar';
import { CandidatNavbarComponent } from '../../../components/navbar/candidat-navbar';
import { AuthService } from '../../../services/auth.service';

interface Campaign {
  id: string;
  title: string;
  description: string;
  university: string;
  universityLogo: string;
  bannerUrl: string;
  location: string;
  domain: string;
  deadline: Date;
  status: 'open' | 'closing-soon' | 'closed';
  positions: number;
  duration: number;
  funding: boolean;
  fundingAmount?: string;
  tags: string[];
  createdAt: Date;
}

@Component({
  selector: 'campaigns-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PublicNavbarComponent, CandidatNavbarComponent],
  templateUrl: './campaigns.html',
  styles: [`
    :host { display:block; background:#f8fafc; color:#0f172a; min-height:100vh; font-family:'Inter', sans-serif; }
    :host-context(.dark) { background:#0f172a; color:#f1f5f9; }

    .campaigns-shell { max-width:1440px; margin:0 auto; padding:0 1.5rem 3rem; }

    /* Hero */
    /* reduced top spacing so campaigns aligns visually with start page */
    .campaigns-hero { padding:2.25rem 0 1.5rem; text-align:center; background:radial-gradient(circle at center, rgba(37,99,235,0.05) 0%, transparent 70%); }
    .hero-inner { max-width:800px; margin:0 auto; }
    .hero-title { font-size:3.5rem; font-weight:800; margin:0 0 1rem; letter-spacing:-.03em; background:linear-gradient(135deg, #1e293b 0%, #334155 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    :host-context(.dark) .hero-title { background:linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .hero-sub { font-size:1.25rem; color:#64748b; margin:0 0 2rem; line-height:1.6; }
    :host-context(.dark) .hero-sub { color:#94a3b8; }
    .hero-actions { display:flex; justify-content:center; gap:1rem; }

    /* Controls */
    /* slightly tighter controls bar to reduce visual height */
    .campaigns-controls { position:sticky; top:0; z-index:30; background:rgba(248,250,252,0.8); backdrop-filter:blur(16px); padding:0.5rem 0; border-bottom:1px solid rgba(226,232,240,0.6); margin-bottom:1rem; }
    :host-context(.dark) .campaigns-controls { background:rgba(15,23,42,0.8); border-color:rgba(51,65,85,0.6); }
    .controls-row { display:flex; gap:1rem; flex-wrap:wrap; align-items:center; justify-content:space-between; }
    .control { display:flex; align-items:center; background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:0 1rem; height:48px; font-size:.9rem; transition:.2s; box-shadow:0 1px 2px rgba(0,0,0,0.05); }
    .control:focus-within { border-color:#2563eb; ring:2px solid rgba(37,99,235,0.1); }
    :host-context(.dark) .control { background:#1e293b; border-color:#334155; }
    .control.search { flex:1; min-width:300px; }
    .control.search input { width:100%; border:none; background:transparent; outline:none; margin-left:.75rem; font-size:.95rem; color:#0f172a; }
    :host-context(.dark) .control.search input { color:#f1f5f9; }
    .control.select select { border:none; background:transparent; outline:none; font-weight:600; color:#334155; cursor:pointer; }
    :host-context(.dark) .control.select select { color:#e2e8f0; }

    /* Multi select */
    .control.multi { position:relative; cursor:pointer; }
    .multi-trigger { display:flex; align-items:center; gap:.75rem; background:transparent; border:none; font-weight:600; color:#334155; font-size:.9rem; }
    :host-context(.dark) .multi-trigger { color:#e2e8f0; }
    .multi-panel { position:absolute; top:56px; left:0; width:280px; background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:1rem; box-shadow:0 20px 40px -5px rgba(0,0,0,0.1); z-index:40; }
    :host-context(.dark) .multi-panel { background:#1e293b; border-color:#334155; }
    .multi-options { max-height:200px; overflow-y:auto; display:grid; gap:.5rem; margin-bottom:1rem; }
    .chk { display:flex; align-items:center; gap:.5rem; padding:.25rem; border-radius:6px; cursor:pointer; transition:.1s; }
    .chk:hover { background:#f1f5f9; }
    :host-context(.dark) .chk:hover { background:#334155; }
    .multi-actions { display:flex; justify-content:flex-end; gap:.5rem; }

    /* Stats Strip */
    .stats-strip { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1.5rem; margin-bottom:3rem; }
    .stat-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:1.25rem; display:flex; align-items:center; gap:1rem; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); transition:.3s; }
    .stat-card:hover { transform:translateY(-2px); box-shadow:0 10px 15px -3px rgba(0,0,0,0.08); }
    :host-context(.dark) .stat-card { background:#1e293b; border-color:#334155; }
    .stat-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .stat-icon.total { background:#eff6ff; color:#2563eb; }
    .stat-icon.visible { background:#f0fdf4; color:#16a34a; }
    .stat-icon.fav { background:#fff1f2; color:#e11d48; }
    .stat-icon.applied { background:#f5f3ff; color:#7c3aed; }
    :host-context(.dark) .stat-icon.total { background:rgba(37,99,235,0.2); }
    :host-context(.dark) .stat-icon.visible { background:rgba(22,163,74,0.2); }
    :host-context(.dark) .stat-icon.fav { background:rgba(225,29,72,0.2); }
    :host-context(.dark) .stat-icon.applied { background:rgba(124,58,237,0.2); }
    .stat-val { font-size:1.5rem; font-weight:800; line-height:1; margin-bottom:.25rem; }
    .stat-label { font-size:.75rem; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.05em; }

    /* Grid */
    .campaign-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(360px, 1fr)); gap:2rem; }
    .campaign-card { background:#fff; border:1px solid #e2e8f0; border-radius:20px; overflow:hidden; transition:all .3s cubic-bezier(0.4, 0, 0.2, 1); display:flex; flex-direction:column; position:relative; }
    .campaign-card:hover { transform:translateY(-6px); box-shadow:0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); border-color:#cbd5e1; }
    :host-context(.dark) .campaign-card { background:#1e293b; border-color:#334155; }

    .card-header { position:relative; height:180px; }
    .banner-wrapper { height:100%; width:100%; position:relative; overflow:hidden; }
    .banner { width:100%; height:100%; object-fit:cover; transition:transform .7s ease; }
    .campaign-card:hover .banner { transform:scale(1.08); }
    .overlay-gradient { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%); opacity:0.6; }
    
    .status-badge { position:absolute; top:12px; right:12px; padding:.35rem .75rem; border-radius:100px; font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#fff; backdrop-filter:blur(4px); box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; }
    .st-open { background:rgba(22,163,74,0.9); }
    .st-closing-soon { background:rgba(234,88,12,0.9); }
    .st-closed { background:rgba(100,116,139,0.9); }

    .fav-btn { position:absolute; top:12px; left:12px; width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,0.9); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.2s; z-index:2; color:#94a3b8; box-shadow:0 2px 4px rgba(0,0,0,0.1); }
    .fav-btn:hover { transform:scale(1.1); }
    .fav-btn.active { color:#e11d48; background:#fff; }
    :host-context(.dark) .fav-btn { background:rgba(30,41,59,0.9); }

    .logo-box { position:absolute; bottom:-24px; left:1.5rem; width:64px; height:64px; background:#fff; border-radius:16px; padding:4px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); z-index:10; display:flex; align-items:center; justify-content:center; border:2px solid #fff; }
    :host-context(.dark) .logo-box { background:#1e293b; border-color:#1e293b; }
    .logo-box img { max-width:100%; max-height:100%; object-fit:contain; border-radius:12px; }

    .card-body { padding:2rem 1.5rem 1.5rem; flex:1; display:flex; flex-direction:column; }
    .uni-name { display:flex; align-items:center; gap:.5rem; font-size:.8rem; font-weight:600; color:#64748b; margin-bottom:.5rem; }
    .card-title { font-size:1.25rem; font-weight:700; line-height:1.4; margin:0 0 1rem; color:#0f172a; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; height:2.8em; }
    :host-context(.dark) .card-title { color:#f8fafc; }

    .card-tags { display:flex; flex-wrap:wrap; gap:.5rem; margin-bottom:1.5rem; }
    .tag { background:#f1f5f9; color:#475569; padding:.25rem .6rem; border-radius:6px; font-size:.7rem; font-weight:600; }
    .tag.more { background:#e2e8f0; color:#64748b; }
    :host-context(.dark) .tag { background:#334155; color:#cbd5e1; }

    .meta-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem; padding-top:1rem; border-top:1px solid #e2e8f0; margin-top:auto; }
    :host-context(.dark) .meta-grid { border-color:#334155; }
    .meta-item { display:flex; flex-direction:column; gap:.25rem; }
    .meta-item .label { font-size:.65rem; text-transform:uppercase; color:#94a3b8; font-weight:600; letter-spacing:.05em; }
    .meta-item .value { font-size:.85rem; font-weight:600; color:#334155; }
    .meta-item .value.urgent { color:#dc2626; }
    .meta-item .value.highlight { color:#2563eb; }
    :host-context(.dark) .meta-item .value { color:#e2e8f0; }

    .card-footer { padding:1rem 1.5rem 1.5rem; display:flex; gap:1rem; }
    .btn-apply { flex:1; background:#2563eb; color:#fff; border:none; padding:.75rem; border-radius:10px; font-weight:600; font-size:.9rem; cursor:pointer; transition:.2s; box-shadow:0 4px 6px -1px rgba(37,99,235,0.2); }
    .btn-apply:hover:not(:disabled) { background:#1d4ed8; transform:translateY(-1px); box-shadow:0 6px 8px -1px rgba(37,99,235,0.3); }
    .btn-apply:disabled { background:#94a3b8; cursor:not-allowed; box-shadow:none; }
    
    .btn-details { flex:1; background:#fff; color:#334155; border:1px solid #cbd5e1; padding:.75rem; border-radius:10px; font-weight:600; font-size:.9rem; cursor:pointer; transition:.2s; }
    .btn-details:hover { border-color:#94a3b8; background:#f8fafc; }
    :host-context(.dark) .btn-details { background:#0f172a; border-color:#334155; color:#e2e8f0; }
    :host-context(.dark) .btn-details:hover { background:#1e293b; }

    /* Buttons General */
    .btn-primary { background:#2563eb; color:#fff; border:none; padding:.75rem 1.5rem; border-radius:10px; font-weight:600; cursor:pointer; transition:.2s; }
    .btn-primary:hover { background:#1d4ed8; }
    .btn-outline { background:transparent; border:1px solid #cbd5e1; color:#334155; padding:.75rem 1.5rem; border-radius:10px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:.5rem; transition:.2s; }
    .btn-outline:hover { border-color:#94a3b8; background:#f8fafc; }

    .load-more { text-align:center; margin-top:3rem; }
    .btn-load { background:#fff; border:1px solid #e2e8f0; padding:1rem 2.5rem; border-radius:12px; font-weight:600; color:#334155; cursor:pointer; transition:.2s; box-shadow:0 1px 2px rgba(0,0,0,0.05); }
    .btn-load:hover { border-color:#cbd5e1; transform:translateY(-1px); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); }

    /* Responsive */
    @media (max-width: 1024px) {
      .campaign-grid { grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); }
    }
    @media (max-width: 768px) {
      .hero-title { font-size:2.5rem; }
      .controls-row { flex-direction:column; align-items:stretch; }
      .control.search { min-width:auto; }
      .stats-strip { grid-template-columns:1fr 1fr; }
    }
  `]
})
export class CampaignsPage implements OnInit {
  campaigns: Campaign[] = [];
  filteredCampaigns: Campaign[] = [];
  visibleCampaigns: Campaign[] = [];

  // Filters & state
  searchQuery = '';
  selectedDomains: string[] = [];
  allDomains: string[] = [];
  showDomains = false;
  filterStatus: 'all' | 'open' | 'closing-soon' | 'closed' = 'all';
  sortKey: 'relevance' | 'deadline' | 'positions' | 'recent' = 'relevance';
  showFavorites = false;

  favorites = new Set<string>();
  appliedCampaignIds = new Set<string>();

  totalCampaigns = 0;
  pageSize = 9;

  constructor(private http: HttpClient, private router: Router, public auth: AuthService) {}

  get isLoggedIn(): boolean { return this.auth.isLoggedIn ? this.auth.isLoggedIn() : false; }

  ngOnInit(): void {
    this.loadFavorites();
    this.loadCampaigns();
    document.addEventListener('click', () => this.showDomains = false);
  }

  loadCampaigns(): void {
    // Mock dataset (extendable)
    this.campaigns = [
      { id: '1', title: 'Intelligence Artificielle et Apprentissage Profond', description: 'Recherche avancée en IA avec focus sur réseaux de neurones profonds & RL.', university: 'Université Mohammed V', universityLogo: 'https://via.placeholder.com/80x80/3b82f6/ffffff?text=UM5', bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop', location: 'Rabat, Maroc', domain: 'Informatique', deadline: new Date('2025-03-15'), status: 'open', positions: 3, duration: 3, funding: true, fundingAmount: '30,000 MAD/an', tags: ['Deep Learning','RL','Python'], createdAt: new Date('2025-01-05') },
      { id: '2', title: 'Médecine de Précision et Génomique', description: 'Programme doctoral en médecine personnalisée utilisant des approches génomiques modernes.', university: 'Université Hassan II Casablanca', universityLogo: 'https://via.placeholder.com/80x80/10b981/ffffff?text=UH2', bannerUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=400&fit=crop', location: 'Casablanca, Maroc', domain: 'Médecine', deadline: new Date('2025-02-28'), status: 'closing-soon', positions: 2, duration: 4, funding: true, fundingAmount: '35,000 MAD/an', tags: ['Génomique','Bioinfo'], createdAt: new Date('2025-01-10') },
      { id: '3', title: 'Énergies Renouvelables et Développement Durable', description: 'Recherche solaire et éolienne adaptée au contexte africain. Projet financé UE.', university: 'Université Cadi Ayyad', universityLogo: 'https://via.placeholder.com/80x80/f59e0b/ffffff?text=UCA', bannerUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=400&fit=crop', location: 'Marrakech, Maroc', domain: 'Ingénierie', deadline: new Date('2025-04-01'), status: 'open', positions: 4, duration: 3, funding: true, fundingAmount: '28,000 MAD/an', tags: ['Solar','Wind','Sustainability'], createdAt: new Date('2025-01-02') },
      { id: '4', title: 'Neurosciences Cognitives et Comportementales', description: 'Mémoire et apprentissage avec accès à imagerie cérébrale avancée.', university: 'Université Ibn Tofail', universityLogo: 'https://via.placeholder.com/80x80/8b5cf6/ffffff?text=UIT', bannerUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop', location: 'Kénitra, Maroc', domain: 'Sciences', deadline: new Date('2025-01-31'), status: 'closed', positions: 1, duration: 4, funding: false, tags: ['Neuro','Cognition'], createdAt: new Date('2024-12-28') },
      { id: '5', title: 'Histoire et Patrimoine Culturel du Maghreb', description: 'Programme interdisciplinaire: histoire, archéologie, anthropologie culturelle.', university: 'Université Sidi Mohamed Ben Abdellah', universityLogo: 'https://via.placeholder.com/80x80/ec4899/ffffff?text=USMBA', bannerUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=400&fit=crop', location: 'Fès, Maroc', domain: 'Sciences Humaines', deadline: new Date('2025-03-20'), status: 'open', positions: 2, duration: 3, funding: true, fundingAmount: '25,000 MAD/an', tags: ['Patrimoine','Terrain'], createdAt: new Date('2025-01-08') },
      { id: '6', title: 'Cybersécurité et Cryptographie Quantique', description: 'Sécurité informatique post-quantique avec partenariats industriels actifs.', university: 'ENSIAS - Université Mohammed V', universityLogo: 'https://via.placeholder.com/80x80/06b6d4/ffffff?text=ENSIAS', bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop', location: 'Rabat, Maroc', domain: 'Informatique', deadline: new Date('2025-03-10'), status: 'closing-soon', positions: 2, duration: 3, funding: true, fundingAmount: '32,000 MAD/an', tags: ['Security','Quantum','Crypto'], createdAt: new Date('2025-01-12') },
      { id: '7', title: 'Systèmes Distribués Résilients', description: 'Tolérance aux fautes, consensus avancé, performance cloud-native.', university: 'Université Abdelmalek Essaâdi', universityLogo: 'https://via.placeholder.com/80x80/2563eb/ffffff?text=UAE', bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop', location: 'Tétouan, Maroc', domain: 'Informatique', deadline: new Date('2025-02-18'), status: 'open', positions: 3, duration: 3, funding: true, fundingAmount: '30,000 MAD/an', tags: ['Distributed','Fault-Tolerance'], createdAt: new Date('2025-01-09') },
      { id: '8', title: 'Analyse de Données Climatiques', description: 'Modélisation climatique, séries temporelles & impacts régionaux.', university: 'Université Mohammed Premier', universityLogo: 'https://via.placeholder.com/80x80/84cc16/ffffff?text=UMP', bannerUrl: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=800&h=400&fit=crop', location: 'Oujda, Maroc', domain: 'Sciences', deadline: new Date('2025-03-05'), status: 'open', positions: 2, duration: 4, funding: true, fundingAmount: '27,000 MAD/an', tags: ['Climate','Data','Modeling'], createdAt: new Date('2025-01-07') }
    ];

    this.allDomains = Array.from(new Set(this.campaigns.map(c => c.domain))).sort();
    this.totalCampaigns = this.campaigns.length;
    this.applyFilters();
  }

  applyFilters(): void {
    let list = this.campaigns.slice();

    // Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.university.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }

    // Domains multi-select
    if (this.selectedDomains.length) {
      list = list.filter(c => this.selectedDomains.includes(c.domain));
    }

    // Status
    if (this.filterStatus !== 'all') {
      list = list.filter(c => c.status === this.filterStatus);
    }

    // Favorites
    if (this.showFavorites) {
      list = list.filter(c => this.favorites.has(c.id));
    }

    this.filteredCampaigns = list;
    this.sortCampaigns(false);
  }

  sortCampaigns(apply = true): void {
    const key = this.sortKey;
    const arr = apply ? this.filteredCampaigns : this.filteredCampaigns;
    arr.sort((a,b) => {
      switch (key) {
        case 'deadline': return a.deadline.getTime() - b.deadline.getTime();
        case 'positions': return b.positions - a.positions;
        case 'recent': return b.createdAt.getTime() - a.createdAt.getTime();
        default: return a.title.localeCompare(b.title);
      }
    });
    this.resetPagination();
  }

  resetPagination(): void {
    this.visibleCampaigns = this.filteredCampaigns.slice(0, this.pageSize);
  }

  loadMore(): void {
    const next = this.visibleCampaigns.length + this.pageSize;
    this.visibleCampaigns = this.filteredCampaigns.slice(0, next);
  }

  toggleDomains(): void { this.showDomains = !this.showDomains; }
  toggleDomain(domain: string, checked: boolean): void {
    if (checked) { if (!this.selectedDomains.includes(domain)) this.selectedDomains.push(domain); }
    else { this.selectedDomains = this.selectedDomains.filter(d => d !== domain); }
  }
  clearDomains(): void { this.selectedDomains = []; }

  toggleFavorite(id: string): void {
    if (this.favorites.has(id)) this.favorites.delete(id); else this.favorites.add(id);
    this.saveFavorites();
    if (this.showFavorites) this.applyFilters();
  }
  isFavorite(id: string): boolean { return this.favorites.has(id); }

  saveFavorites(): void { try { localStorage.setItem('campaign_favorites', JSON.stringify(Array.from(this.favorites))); } catch {} }
  loadFavorites(): void {
    try { const raw = localStorage.getItem('campaign_favorites'); if (raw) this.favorites = new Set(JSON.parse(raw)); } catch {}
  }

  applyToCampaign(c: Campaign): void {
    if (c.status === 'closed' || this.hasApplied(c.id)) return;
    this.appliedCampaignIds.add(c.id);
    alert('Application submitted: ' + c.title);
  }
  hasApplied(id: string): boolean { return this.appliedCampaignIds.has(id); }

  viewDetails(c: Campaign): void {
    // Placeholder navigation – would link to a dedicated details page
    this.router.navigate(['/campaigns'], { queryParams: { id: c.id } });
  }

  getStatusLabel(status: string): string {
    return ({ 'open':'Ouverte','closing-soon':'Clôture bientôt','closed':'Fermée' } as any)[status] || status;
  }

  isClosingSoon(deadline: Date): boolean {
    const diff = deadline.getTime() - Date.now();
    const days = diff / 86400000;
    return days <= 7 && days > 0;
  }

  daysLeft(deadline: Date): number {
    const d = Math.ceil((deadline.getTime() - Date.now()) / 86400000);
    return d < 0 ? 0 : d;
  }

  trackById(_: number, c: Campaign) { return c.id; }

  refresh(): void { this.loadCampaigns(); }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedDomains = [];
    this.filterStatus = 'all';
    this.sortKey = 'relevance';
    this.showFavorites = false;
    this.applyFilters();
  }

  onImgError(e: any): void { try { e.target.style.visibility = 'hidden'; } catch {} }
}
