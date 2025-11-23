import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CandidatNavbarComponent } from '../../../components/navbar/candidat-navbar';

@Component({
  selector: 'dashboard-page',
  standalone: true,
  imports: [CommonModule, CandidatNavbarComponent, RouterModule],
  templateUrl: './dashboard.html',
  styles: [`
    .dash { padding:2rem; max-width:1300px; margin:0 auto; }
    
    /* Hero section */
    .hero { position:relative; display:flex; justify-content:space-between; align-items:center; gap:2rem; background-image:url('/assets/candidat-banner.png'); background-size:cover; background-position:center; color:#fff; padding:2rem 2.5rem; border-radius:16px; box-shadow:0 8px 32px rgba(0,0,0,0.25); margin-bottom:2rem; overflow:hidden; min-height:220px }
    .hero-backdrop { position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(2px); z-index:1 }
    .hero-content { flex:1; position:relative; z-index:2 }
    .welcome { font-size:1.75rem; font-weight:700; margin-bottom:0.5rem; text-shadow:0 2px 8px rgba(0,0,0,0.3) }
    .subtitle { font-size:1.05rem; opacity:0.95; margin-bottom:0.4rem; text-shadow:0 2px 8px rgba(0,0,0,0.3) }
    .meta { font-size:0.95rem; opacity:0.85; text-shadow:0 2px 8px rgba(0,0,0,0.3) }
    
    /* Progress circle */
    .progress-circle { position:relative; width:120px; height:120px; flex-shrink:0; z-index:2 }
    .circle-svg { width:100%; height:100%; transform:rotate(-90deg) }
    .circle-bg { fill:none; stroke:rgba(255,255,255,0.2); stroke-width:8 }
    .circle-progress { fill:none; stroke:#fff; stroke-width:8; stroke-linecap:round; stroke-dasharray:339; transition:stroke-dashoffset 0.5s ease }
    .progress-text { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center }
    .progress-value { font-size:1.5rem; font-weight:700; line-height:1; text-shadow:0 2px 8px rgba(0,0,0,0.3) }
    .progress-label { font-size:0.8rem; opacity:0.9; margin-top:4px; text-shadow:0 2px 8px rgba(0,0,0,0.3) }
    
    /* Quick actions */
    .quick-actions { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; margin-bottom:2rem }
    .quick-link { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.75rem; padding:1.5rem; background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.06); border:1px solid #f3f4f6; text-decoration:none; color:#0f172a; transition:all 0.2s }
    .quick-link:hover { transform:translateY(-4px); box-shadow:0 8px 24px rgba(0,0,0,0.12); border-color:#667eea }
    .quick-link .icon { width:48px; height:48px; border-radius:12px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; display:flex; align-items:center; justify-content:center }
    .link-label { font-weight:600; font-size:0.95rem }
    
    /* Stats grid */
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:1.5rem; margin-bottom:2rem }
    .stat-card { background:#fff; border-radius:12px; padding:1.5rem; box-shadow:0 2px 12px rgba(0,0,0,0.06); border:1px solid #f3f4f6; display:flex; gap:1rem; transition:all 0.2s }
    .stat-card:hover { box-shadow:0 8px 24px rgba(0,0,0,0.1) }
    .stat-icon { width:56px; height:56px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0 }
    .stat-content { flex:1; min-width:0 }
    .stat-label { font-size:0.9rem; color:#6b7280; font-weight:600; margin-bottom:0.5rem }
    .stat-value { font-size:1.25rem; font-weight:700; margin-bottom:0.75rem }
    .stat-detail { margin-top:0.75rem }
    .progress-bar { height:8px; background:#f1f5f9; border-radius:999px; overflow:hidden; margin-bottom:0.5rem }
    .progress-fill { height:100%; background:linear-gradient(90deg,#667eea,#764ba2); border-radius:999px; transition:width 0.3s }
    .stat-sub { font-size:0.85rem; color:#6b7280 }
    
    /* Prerequisites */
    .prereq-grid { display:flex; gap:1rem; margin-top:0.75rem; flex-wrap:wrap }
    .prereq-grid > div { flex:1; min-width:80px }
    .prereq-label { font-size:0.8rem; color:#6b7280; margin-bottom:0.25rem }
    .prereq-value { font-size:1.1rem; font-weight:700; color:#0f172a }
    
    /* Deadlines */
    .deadline-list { display:flex; flex-direction:column; gap:0.75rem; margin-top:0.75rem }
    .deadline-item { display:flex; justify-content:space-between; align-items:center; gap:0.5rem }
    .deadline-text { font-size:0.9rem; color:#374151; flex:1 }
    .badge { padding:0.35rem 0.75rem; border-radius:999px; font-size:0.8rem; font-weight:600; white-space:nowrap }
    .badge-urgent { background:#ef4444; color:#fff }
    .badge-dark { background:#0f172a; color:#fff }
    
    /* Activities */
    .activities { background:#fff; border-radius:12px; padding:1.5rem; box-shadow:0 2px 12px rgba(0,0,0,0.06); border:1px solid #f3f4f6 }
    .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem }
    .section-header h3 { margin:0; font-size:1.1rem; font-weight:700 }
    .view-all { background:transparent; border:1px solid #e6eef8; padding:0.5rem 1rem; border-radius:8px; font-size:0.875rem; font-weight:600; color:#475569; cursor:pointer; transition:all 0.2s }
    .view-all:hover { background:#f8fafc; border-color:#cbd5e1 }
    .activity-list { display:flex; flex-direction:column; gap:1rem }
    .activity-item { display:flex; gap:1rem; align-items:flex-start; position:relative }
    .activity-dot { width:12px; height:12px; border-radius:50%; background:linear-gradient(135deg,#667eea,#764ba2); flex-shrink:0; margin-top:0.25rem; position:relative; z-index:1 }
    .activity-item:not(:last-child) .activity-dot::after { content:''; position:absolute; top:12px; left:50%; transform:translateX(-50%); width:2px; height:32px; background:#e6eef8 }
    .activity-content { flex:1; min-width:0 }
    .activity-title { font-weight:600; color:#0f172a; margin-bottom:0.25rem }
    .activity-time { font-size:0.85rem; color:#6b7280 }
    
    @media (max-width:900px){
      .dash { padding:1rem }
      .hero { flex-direction:column; align-items:flex-start; padding:1.5rem }
      .progress-circle { width:100px; height:100px }
      .stats-grid { grid-template-columns:1fr }
      .quick-actions { grid-template-columns:repeat(auto-fit,minmax(140px,1fr)) }
    }
  `]
})
export class DashboardPage {
  // simple signals to simulate data until backend is integrated
  name = signal('Marie Dubois');
  year = signal('Année 2 de votre doctorat en informatique et Intelligence Artificielle');
  director = signal('Prof. Jean Martin');
  startDate = signal('Septembre 2023');
  progress = signal(67);

  recent = signal<Array<{ title: string; when: string }>>([
    { title: 'Rapport de thèse soumis', when: 'Il y a 2 jours' },
    { title: "Réunion avec directeur de thèse", when: 'Il y a 1 semaine' },
    { title: 'Formation complétée: Méthodologie de recherche', when: 'Il y a 2 semaines' },
    { title: 'Article accepté - Journal of AI Research', when: 'Il y a 1 mois' }
  ]);

  constructor(private router: Router) {}

  title(){ return this.name(); }
}
