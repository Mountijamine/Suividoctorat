import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EncadrantNavbarComponent } from '../../components/navbar/encadrant-navbar';

interface DemandeSoutenance {
  id: number;
  doctorantNom: string;
  doctorantPrenom: string;
  titre: string;
  statut: string;
  dateCreation: string;
  dateSoumission?: string;
  dateSoutenance?: string;
  specialite?: string;
  directeurEmail?: string;
  coDirecteurEmail?: string;
}

@Component({
  selector: 'app-encadrant-dashboard-premium',
  standalone: true,
  imports: [CommonModule, EncadrantNavbarComponent],
  templateUrl: './encadrant-dashboard-premium.html',
  styleUrls: ['./encadrant-dashboard-premium.scss']
})
export class EncadrantDashboardPremiumPage implements OnInit {
  demandes = signal<DemandeSoutenance[]>([]);
  loading = signal(true);
  userEmail = signal('');
  userName = signal('');

  totalDoctorants = signal(0);
  pendingActions = signal(0);
  upcomingSoutenances = signal(0);
  completedDefenses = signal(0);
  recentActivity = signal<any[]>([]);

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (user: any) => {
        if (user) {
          this.userEmail.set(user.email || '');
          this.userName.set(`${user.prenom} ${user.nom}`);
        }
        this.loadDashboardData();
      },
      error: () => {
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData() {
    this.loading.set(true);
    const email = this.userEmail();
    
    this.http.get<DemandeSoutenance[]>(`http://localhost:8096/api/soutenance/demandes`, {
      params: { role: 'directeur', email }
    }).subscribe({
      next: (data) => {
        this.demandes.set(data);
        this.calculateStatistics(data);
        this.generateRecentActivity(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.loading.set(false);
      }
    });
  }

  calculateStatistics(demandes: DemandeSoutenance[]) {
    const uniqueDoctorants = new Set(demandes.map(d => `${d.doctorantNom} ${d.doctorantPrenom}`));
    this.totalDoctorants.set(uniqueDoctorants.size);

    const pending = demandes.filter(d => 
      d.statut === 'SOUMISE' || d.statut === 'EN_VERIFICATION' || d.statut === 'JURY_PROPOSE'
    ).length;
    this.pendingActions.set(pending);

    const upcoming = demandes.filter(d => 
      d.statut === 'PLANIFIEE' || d.statut === 'AUTORISEE'
    ).length;
    this.upcomingSoutenances.set(upcoming);

    const completed = demandes.filter(d => d.statut === 'TERMINEE').length;
    this.completedDefenses.set(completed);
  }

  generateRecentActivity(demandes: DemandeSoutenance[]) {
    const sorted = [...demandes]
      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
      .slice(0, 8);
    
    this.recentActivity.set(sorted.map(d => ({
      doctorant: `${d.doctorantPrenom} ${d.doctorantNom}`,
      action: this.getActionText(d.statut),
      date: d.dateCreation,
      status: d.statut
    })));
  }

  getActionText(statut: string): string {
    const actions: Record<string, string> = {
      'BROUILLON': 'Demande en préparation',
      'SOUMISE': 'Nouvelle demande soumise',
      'EN_VERIFICATION': 'Vérification en cours',
      'PREREQUIS_VALIDES': 'Prérequis validés',
      'EN_ATTENTE_JURY': 'En attente du jury',
      'JURY_PROPOSE': 'Jury proposé - Action requise',
      'AUTORISEE': 'Soutenance autorisée',
      'PLANIFIEE': 'Soutenance planifiée',
      'TERMINEE': 'Soutenance terminée',
      'REJETEE': 'Demande rejetée'
    };
    return actions[statut] || statut;
  }

  getStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'BROUILLON': 'Brouillon',
      'SOUMISE': 'Soumise',
      'EN_VERIFICATION': 'Vérification',
      'PREREQUIS_VALIDES': 'Validée',
      'EN_ATTENTE_JURY': 'Attente Jury',
      'JURY_PROPOSE': 'Jury Proposé',
      'AUTORISEE': 'Autorisée',
      'PLANIFIEE': 'Planifiée',
      'TERMINEE': 'Terminée',
      'REJETEE': 'Rejetée'
    };
    return labels[statut] || statut;
  }

  viewDemande(id: number) {
    this.router.navigate(['/soutenance'], { queryParams: { id, view: 'detail' } });
  }

  goToSoutenance() {
    this.router.navigate(['/soutenance']);
  }

  getCurrentDate(): string {
    return new Date().getDate().toString();
  }

  getCurrentMonth(): string {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[new Date().getMonth()];
  }

  getCurrentYear(): string {
    return new Date().getFullYear().toString();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
