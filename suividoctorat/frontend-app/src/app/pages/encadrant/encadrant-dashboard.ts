import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EncadrantNavbarComponent } from '../../components/navbar/encadrant-navbar';

@Component({
  selector: 'encadrant-dashboard',
  standalone: true,
  imports: [CommonModule, EncadrantNavbarComponent],
  template: `
    <encadrant-navbar></encadrant-navbar>
    <div class="dashboard-container">
      <div class="welcome-section">
        <h1>Tableau de bord - Encadrant</h1>
        <p>Bienvenue dans votre espace encadrant</p>
      </div>
      
      <div class="cards-grid">
        <div class="card" (click)="navigateToSoutenances()">
          <div class="card-icon">🎓</div>
          <h3>Soutenances</h3>
          <p>Gérer les demandes de soutenance de vos doctorants</p>
        </div>
        
        <div class="card">
          <div class="card-icon">👥</div>
          <h3>Mes Doctorants</h3>
          <p>Liste de vos doctorants encadrés</p>
        </div>
        
        <div class="card">
          <div class="card-icon">📊</div>
          <h3>Statistiques</h3>
          <p>Suivi de l'avancement des thèses</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .welcome-section {
      margin-bottom: 2rem;
    }
    
    .welcome-section h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.5rem;
    }
    
    .welcome-section p {
      color: #6b7280;
      font-size: 1.125rem;
    }
    
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    
    .card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 2rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    
    .card-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.5rem;
    }
    
    .card p {
      color: #6b7280;
      font-size: 0.9375rem;
    }
  `]
})
export class EncadrantDashboardPage implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }
    
    const role = this.auth.role();
    if (role !== 'ROLE_ENCADRANT') {
      console.warn('[EncadrantDashboard] Access denied - role:', role);
      this.router.navigate(['/']);
    }
  }

  navigateToSoutenances(): void {
    this.router.navigate(['/soutenance']);
  }
}
