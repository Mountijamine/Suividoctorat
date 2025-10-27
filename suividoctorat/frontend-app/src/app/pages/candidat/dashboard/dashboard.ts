import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styles: [`
    .dash { padding:2rem; max-width:1200px; margin:1.5rem auto; }
    .hero { display:flex; justify-content:space-between; gap:1rem; background:linear-gradient(90deg,#5b21b6,#06b6d4); color:#fff; padding:1.25rem 1.5rem; border-radius:10px }
    .hero h2{ margin:0; font-size:1.5rem }
    .hero p{ margin:0.2rem 0 0 0; opacity:0.9 }

    .grid { display:grid; grid-template-columns: repeat(3,1fr); gap:1rem; margin-top:1rem }
    .card { background:#fff; border-radius:10px; padding:1rem; box-shadow:0 6px 18px rgba(2,6,23,0.06); }
    .card h3{ margin:0 0 0.5rem 0 }
    .progress { height:10px; background:#f1f5f9; border-radius:999px; overflow:hidden }
    .progress .bar{ height:100%; background:linear-gradient(90deg,#7c3aed,#06b6d4); }

    .recent { margin-top:1rem }
    .recent .item { padding:0.75rem 1rem; background:#fff; border-radius:8px; margin-bottom:0.6rem; box-shadow:0 4px 12px rgba(2,6,23,0.04) }

    @media (max-width:900px){ .grid{ grid-template-columns:1fr; } .hero{flex-direction:column; align-items:flex-start} }
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
