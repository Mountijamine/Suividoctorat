import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidatNavbarComponent } from '../../../components/navbar/candidat-navbar';

@Component({
  selector: 'soutenances-page',
  standalone: true,
  imports: [CommonModule, CandidatNavbarComponent],
  template: `
    <candidat-navbar></candidat-navbar>
    <div style="min-height: 100vh; background: #fafafa; padding: 2rem;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="background: white; border-radius: 12px; padding: 3rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="font-size: 2rem; font-weight: 600; color: #111827; margin-bottom: 1rem;">Soutenances</h1>
          <p style="color: #6b7280; font-size: 1rem;">Gérez vos soutenances de thèse ici.</p>
          <p style="color: #9ca3af; font-size: 0.875rem; margin-top: 1.5rem;">Cette page est en cours de développement.</p>
        </div>
      </div>
    </div>
  `
})
export class SoutenancesPage {}
