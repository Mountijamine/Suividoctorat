import { Component, OnInit, signal } from '@angular/core';
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
  selector: 'encadrant-dashboard-modern',
  standalone: true,
  imports: [CommonModule, EncadrantNavbarComponent],
  templateUrl: './encadrant-dashboard-modern.html',
  styleUrls: ['./encadrant-dashboard-modern.scss']
})
export class EncadrantDashboardModernPage implements OnInit {
  private apiUrl = 'http://localhost:8096/api/soutenance';
  
  demandes = signal<DemandeSoutenance[]>([]);
  loading = signal(false);
  userEmail = signal<string>('');
  userName = signal<string>('Encadrant');

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
      this.router.navigate(['/']);
      return;
    }

    const token = this.auth.getToken();
    if (token) {
      const payload = this.parseJwt(token);
      const email = payload?.sub || payload?.email || '';
      this.userEmail.set(email);
      
      // Extract name from email
      const name = email.split('@')[0].split('.').map((s: string) => 
        s.charAt(0).toUpperCase() + s.slice(1)
      ).join(' ');
      this.userName.set(name);
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
      const params = {
        role: 'directeur',
        email: email
      };
      
      const data = await this.http.get<DemandeSoutenance[]>(`${this.apiUrl}/demandes`, { params }).toPromise();
      this.demandes.set(data || []);
    } catch (error: any) {
      console.error('[EncadrantDashboard] Error:', error);
      this.demandes.set([]);
      
      if (error?.status === 0) {
        this.toastService.error('Service de soutenance non disponible');
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

  getTotalDoctorants(): number {
    // Unique doctorants
    const uniqueEmails = new Set(this.demandes().map(d => d.doctorantEmail));
    return uniqueEmails.size;
  }

  getPendingActions(): number {
    return this.demandes().filter(d => 
      ['PREREQUIS_VALIDES', 'EN_ATTENTE_JURY'].includes(d.statut)
    ).length;
  }

  getUpcomingDefenses(): number {
    return this.demandes().filter(d => 
      d.dateSoutenance && new Date(d.dateSoutenance) > new Date()
    ).length;
  }

  getAuthorizedCount(): number {
    return this.demandes().filter(d => 
      ['AUTORISEE', 'PLANIFIEE'].includes(d.statut)
    ).length;
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'BROUILLON': 'Brouillon',
      'SOUMISE': 'Soumise',
      'EN_VERIFICATION': 'Vérification',
      'PREREQUIS_VALIDES': 'Prérequis OK',
      'EN_ATTENTE_JURY': 'En attente jury',
      'JURY_PROPOSE': 'Jury proposé',
      'EN_ATTENTE_RAPPORTS': 'Attente rapports',
      'RAPPORTS_FAVORABLES': 'Rapports OK',
      'AUTORISEE': 'Autorisée',
      'PLANIFIEE': 'Planifiée',
      'TERMINEE': 'Terminée',
      'REJETEE': 'Rejetée'
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const classes: Record<string, string> = {
      'BROUILLON': 'draft',
      'SOUMISE': 'submitted',
      'EN_VERIFICATION': 'pending',
      'PREREQUIS_VALIDES': 'validated',
      'EN_ATTENTE_JURY': 'waiting',
      'JURY_PROPOSE': 'proposed',
      'EN_ATTENTE_RAPPORTS': 'waiting',
      'RAPPORTS_FAVORABLES': 'favorable',
      'AUTORISEE': 'authorized',
      'PLANIFIEE': 'planned',
      'TERMINEE': 'completed',
      'REJETEE': 'rejected'
    };
    return classes[statut] || 'default';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getTruncatedText(text: string, maxLength: number = 100): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getProgressPercentage(demande: DemandeSoutenance): number {
    const statusProgress: Record<string, number> = {
      'BROUILLON': 10,
      'SOUMISE': 20,
      'EN_VERIFICATION': 30,
      'PREREQUIS_VALIDES': 40,
      'EN_ATTENTE_JURY': 50,
      'JURY_PROPOSE': 60,
      'EN_ATTENTE_RAPPORTS': 70,
      'RAPPORTS_FAVORABLES': 80,
      'AUTORISEE': 90,
      'PLANIFIEE': 95,
      'TERMINEE': 100,
      'REJETEE': 0
    };
    return statusProgress[demande.statut] || 0;
  }

  getDoctorantsByStatus(status: string): DemandeSoutenance[] {
    return this.demandes().filter(d => d.statut === status);
  }

  getNextDeadlines(): DemandeSoutenance[] {
    return this.demandes()
      .filter(d => d.dateSoutenance)
      .sort((a, b) => new Date(a.dateSoutenance!).getTime() - new Date(b.dateSoutenance!).getTime())
      .slice(0, 3);
  }
}
