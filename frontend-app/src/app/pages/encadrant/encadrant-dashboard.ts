import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { EncadrantNavbarComponent } from '../../components/navbar/encadrant-navbar';
import { ToastService } from '../../services/toast.service';

interface DemandeSoutenance {
  id: number;
  doctorantEmail: string;
  directeurEmail: string;
  titreThese: string;
  resume: string;
  statut: string;
  dateCreation: string;
  dateSoumission?: string;
  dateAutorisation?: string;
  dateSoutenance?: string;
  lieuSoutenance?: string;
  membresJury?: any[];
}

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

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🎓</div>
          <div class="stat-content">
            <div class="stat-value">{{ demandes().length }}</div>
            <div class="stat-label">Demandes de soutenance</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-value">{{ getPendingCount() }}</div>
            <div class="stat-label">En attente</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ getAuthorizedCount() }}</div>
            <div class="stat-label">Autorisées</div>
          </div>
        </div>
      </div>

      <!-- Soutenance Demands List -->
      <div class="section">
        <div class="section-header">
          <h2>Mes demandes de soutenance</h2>
          <button class="btn-primary" (click)="navigateToSoutenances()">
            Nouvelle demande
          </button>
        </div>

        <div *ngIf="loading()" class="loading">
          Chargement des demandes...
        </div>

        <div *ngIf="!loading() && demandes().length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>Aucune demande de soutenance</h3>
          <p>Vous n'avez pas encore de demandes de soutenance enregistrées.</p>
          <button class="btn-primary" (click)="navigateToSoutenances()">
            Créer une demande
          </button>
        </div>

        <div *ngIf="!loading() && demandes().length > 0" class="demands-list">
          <div *ngFor="let demande of demandes()" class="demand-card" (click)="viewDemande(demande)">
            <div class="demand-header">
              <h3>{{ demande.titreThese }}</h3>
              <span class="status-badge" [class]="'status-' + demande.statut.toLowerCase()">
                {{ getStatutLabel(demande.statut) }}
              </span>
            </div>
            
            <div class="demand-info">
              <div class="info-row">
                <span class="label">Doctorant:</span>
                <span class="value">{{ demande.doctorantEmail }}</span>
              </div>
              <div class="info-row">
                <span class="label">Date de création:</span>
                <span class="value">{{ formatDate(demande.dateCreation) }}</span>
              </div>
              <div class="info-row" *ngIf="demande.membresJury && demande.membresJury.length > 0">
                <span class="label">Jury:</span>
                <span class="value">{{ demande.membresJury.length }} membre(s)</span>
              </div>
            </div>
            
            <div class="demand-footer" *ngIf="demande.resume">
              <p class="resume">{{ getTruncatedResume(demande.resume) }}</p>
            </div>
          </div>
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2.5rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
    }

    .stat-label {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .section {
      margin-top: 2rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover {
      background: #1d4ed8;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .demands-list {
      display: grid;
      gap: 1rem;
    }

    .demand-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .demand-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .demand-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .demand-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
      flex: 1;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .status-brouillon {
      background: #f3f4f6;
      color: #4b5563;
    }

    .status-soumise {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-en_verification {
      background: #fef3c7;
      color: #92400e;
    }

    .status-prerequis_valides {
      background: #d1fae5;
      color: #065f46;
    }

    .status-jury_propose {
      background: #e0e7ff;
      color: #3730a3;
    }

    .status-autorisee {
      background: #d1fae5;
      color: #065f46;
    }

    .status-rejetee {
      background: #fee2e2;
      color: #991b1b;
    }

    .demand-info {
      display: grid;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .info-row {
      display: flex;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .info-row .label {
      color: #6b7280;
      font-weight: 500;
    }

    .info-row .value {
      color: #111827;
    }

    .demand-footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 1rem;
    }

    .resume {
      color: #6b7280;
      font-size: 0.875rem;
      margin: 0;
      line-height: 1.5;
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
  private apiUrl = 'http://localhost:8096/api/soutenance';
  
  demandes = signal<DemandeSoutenance[]>([]);
  loading = signal(false);
  userEmail = signal<string>('');

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
    private toastService: ToastService
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
      return;
    }

    const token = this.auth.getToken();
    console.log('[EncadrantDashboard] Token exists:', !!token);
    
    if (token) {
      const payload = this.parseJwt(token);
      console.log('[EncadrantDashboard] Token payload:', payload);
      const email = payload?.sub || payload?.email || '';
      this.userEmail.set(email);
      console.log('[EncadrantDashboard] User email set to:', email);
    }

    if (!this.userEmail()) {
      console.error('[EncadrantDashboard] No email found in token');
      this.toastService.error('Email utilisateur introuvable. Veuillez vous reconnecter.');
      this.router.navigate(['/auth']);
      return;
    }

    this.loadDemandes();
  }

  private parseJwt(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch(e) {
      return null;
    }
  }

  async loadDemandes() {
    this.loading.set(true);
    try {
      const email = this.userEmail();
      console.log('[EncadrantDashboard] Loading demandes for:', email);
      
      if (!email) {
        throw new Error('Email utilisateur manquant');
      }
      
      const params = {
        role: 'directeur',
        email: email
      };
      
      const fullUrl = `${this.apiUrl}/demandes?role=${params.role}&email=${params.email}`;
      console.log('[EncadrantDashboard] Full API URL:', fullUrl);
      console.log('[EncadrantDashboard] Making request...');
      
      const data = await this.http.get<DemandeSoutenance[]>(`${this.apiUrl}/demandes`, { params }).toPromise();
      console.log('[EncadrantDashboard] SUCCESS! Received demandes:', data);
      console.log('[EncadrantDashboard] Number of demandes:', data?.length || 0);
      this.demandes.set(data || []);
      
      if (!data || data.length === 0) {
        console.log('[EncadrantDashboard] No demandes found for this encadrant');
        this.toastService.error('Aucune demande trouvée pour cet encadrant.');
      }
    } catch (error: any) {
      console.error('[EncadrantDashboard] ===== ERROR DETAILS =====');
      console.error('[EncadrantDashboard] Error object:', error);
      console.error('[EncadrantDashboard] Error name:', error?.name);
      console.error('[EncadrantDashboard] Error status:', error?.status);
      console.error('[EncadrantDashboard] Error statusText:', error?.statusText);
      console.error('[EncadrantDashboard] Error message:', error?.message);
      console.error('[EncadrantDashboard] Error url:', error?.url);
      console.error('[EncadrantDashboard] Error error:', error?.error);
      console.error('[EncadrantDashboard] Error headers:', error?.headers);
      console.error('[EncadrantDashboard] ========================');
      
      // Initialize empty array on error so UI still works
      this.demandes.set([]);
      
      // Show user-friendly error message
      if (error?.status === 0 || !error?.status) {
        console.error('[EncadrantDashboard] Network error - CORS or connectivity issue');
        this.toastService.error('Erreur de connexion au service. Vérifiez la console pour plus de détails.');
      } else if (error?.status === 401) {
        this.toastService.error('Session expirée. Veuillez vous reconnecter.');
        this.router.navigate(['/auth']);
      } else if (error?.status === 403) {
        this.toastService.error('Accès refusé. Vérifiez vos permissions.');
      } else if (error?.status === 404) {
        this.toastService.error('Endpoint non trouvé. Vérifiez la configuration du backend.');
      } else {
        this.toastService.error(error?.error?.error || error?.message || 'Erreur de chargement des demandes');
      }
    } finally {
      this.loading.set(false);
    }
  }

  viewDemande(demande: DemandeSoutenance) {
    this.router.navigate(['/soutenance'], { 
      queryParams: { demandeId: demande.id } 
    });
  }

  navigateToSoutenances(): void {
    this.router.navigate(['/soutenance']);
  }

  getPendingCount(): number {
    return this.demandes().filter(d => 
      ['BROUILLON', 'SOUMISE', 'EN_VERIFICATION', 'PREREQUIS_VALIDES', 'EN_ATTENTE_JURY', 'JURY_PROPOSE'].includes(d.statut)
    ).length;
  }

  getAuthorizedCount(): number {
    return this.demandes().filter(d => 
      ['AUTORISEE', 'PLANIFIEE', 'TERMINEE'].includes(d.statut)
    ).length;
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'BROUILLON': 'Brouillon',
      'SOUMISE': 'Soumise',
      'EN_VERIFICATION': 'En vérification',
      'PREREQUIS_VALIDES': 'Prérequis validés',
      'EN_ATTENTE_JURY': 'En attente jury',
      'JURY_PROPOSE': 'Jury proposé',
      'EN_ATTENTE_RAPPORTS': 'En attente rapports',
      'RAPPORTS_FAVORABLES': 'Rapports favorables',
      'AUTORISEE': 'Autorisée',
      'PLANIFIEE': 'Planifiée',
      'TERMINEE': 'Terminée',
      'REJETEE': 'Rejetée'
    };
    return labels[statut] || statut;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getTruncatedResume(resume: string): string {
    if (!resume) return '';
    return resume.length > 150 ? resume.substring(0, 150) + '...' : resume;
  }
}
