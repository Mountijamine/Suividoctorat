import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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
  commentairesAdmin?: string;
  raisonRejet?: string;
}

interface Prerequis {
  id: number;
  nombrePublications: number;
  nombrePublicationsRequises: number;
  publicationsValides: boolean;
  creditsFormation: number;
  creditsFormationRequis: number;
  creditsValides: boolean;
  demandeManuscrite: boolean;
  rapportThese: boolean;
  rapportAntiPlagiat: boolean;
  rapportPublications: boolean;
  attestationsFormation: boolean;
  autorisationSoutenance: boolean;
  prerequisValides: boolean;
  commentaires?: string;
}

interface MembreJury {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  etablissement: string;
  grade: string;
  role: string;
  rapportSoumis?: boolean;
  rapportFavorable?: boolean;
}

interface TimelineStep {
  number: number;
  title: string;
  description: string;
  duration: string;
  actor: string;
  icon: string;
  status: 'completed' | 'active' | 'pending';
}

@Component({
  selector: 'soutenance-modern',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soutenance-modern.html',
  styleUrls: ['./soutenance-modern.scss']
})
export class SoutenanceModernPage implements OnInit {
  private apiUrl = 'http://localhost:8096/api/soutenance';
  
  demandes = signal<DemandeSoutenance[]>([]);
  selectedDemande = signal<DemandeSoutenance | null>(null);
  prerequis = signal<Prerequis | null>(null);
  juryMembers = signal<MembreJury[]>([]);
  
  currentView = signal<'list' | 'create' | 'detail' | 'info'>('info');
  userRole = signal<string>('');
  userEmail = signal<string>('');
  showJuryForm = signal<boolean>(false);
  
  // Form data
  newDemande = {
    doctorantEmail: '',
    directeurEmail: '',
    titreThese: '',
    resume: ''
  };
  
  newMembre: MembreJury = {
    nom: '',
    prenom: '',
    email: '',
    etablissement: '',
    grade: '',
    role: 'EXAMINATEUR'
  };
  
  loading = signal(false);
  
  // Timeline steps
  timelineSteps: TimelineStep[] = [
    {
      number: 1,
      title: 'Dépôt du Manuscrit',
      description: 'Soumission du manuscrit de thèse, résumé et titre',
      duration: 'Immédiat',
      actor: 'Doctorant',
      icon: 'document',
      status: 'completed'
    },
    {
      number: 2,
      title: 'Vérification Administrative',
      description: 'Contrôle des prérequis: publications (min 2), crédits (30), rapport anti-plagiat',
      duration: '5-7 jours',
      actor: 'Service Doctoral',
      icon: 'check',
      status: 'active'
    },
    {
      number: 3,
      title: 'Proposition du Jury',
      description: 'Composition proposée par le directeur: minimum 2 rapporteurs externes',
      duration: '7-10 jours',
      actor: 'Directeur de thèse',
      icon: 'users',
      status: 'pending'
    },
    {
      number: 4,
      title: 'Validation du Jury',
      description: 'Examen de la composition et vérification des qualifications',
      duration: '3-5 jours',
      actor: 'École Doctorale',
      icon: 'badge-check',
      status: 'pending'
    },
    {
      number: 5,
      title: 'Rapports de Pré-soutenance',
      description: 'Lecture du manuscrit et rédaction des rapports par les rapporteurs',
      duration: '4-6 semaines',
      actor: 'Rapporteurs',
      icon: 'document-report',
      status: 'pending'
    },
    {
      number: 6,
      title: 'Planification',
      description: 'Choix de la date, réservation de l\'amphithéâtre et envoi des invitations',
      duration: '2-3 semaines',
      actor: 'Service Doctoral',
      icon: 'calendar',
      status: 'pending'
    },
    {
      number: 7,
      title: 'Soutenance Publique',
      description: 'Présentation (45 min), questions du jury (1h-1h30), délibération (30 min)',
      duration: '1 journée',
      actor: 'Tous',
      icon: 'academic-cap',
      status: 'pending'
    },
    {
      number: 8,
      title: 'Dépôt Version Corrigée',
      description: 'Intégration des corrections et dépôt à la bibliothèque universitaire',
      duration: '3 mois max',
      actor: 'Nouveau docteur',
      icon: 'check-circle',
      status: 'pending'
    }
  ];
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth'], { queryParams: { sessionExpired: 1 } });
      return;
    }
    
    const token = this.authService.getToken();
    if (token) {
      const payload = this.parseJwt(token);
      this.userEmail.set(payload?.sub || payload?.email || '');
    }
    
    const role = this.authService.role() || '';
    this.userRole.set(role);
    
    if (role !== 'ROLE_ENCADRANT') {
      this.toastService.error('Accès réservé aux encadrants uniquement');
      this.router.navigate(['/']);
      return;
    }
    
    this.loadDemandes().then(() => {
      this.route.queryParams.subscribe(params => {
        const demandeId = params['demandeId'];
        if (demandeId) {
          const demande = this.demandes().find(d => d.id === parseInt(demandeId));
          if (demande) {
            this.viewDemande(demande);
          }
        }
      });
    });
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
      const params = {
        role: 'directeur',
        email: this.userEmail()
      };
      
      const data = await this.http.get<DemandeSoutenance[]>(`${this.apiUrl}/demandes`, { params }).toPromise();
      this.demandes.set(data || []);
    } catch (error: any) {
      console.error('[Soutenance] Error:', error);
      this.demandes.set([]);
    } finally {
      this.loading.set(false);
    }
  }
  
  async createDemande() {
    if (!this.newDemande.titreThese || !this.newDemande.doctorantEmail) {
      this.toastService.error('Veuillez remplir tous les champs requis');
      return;
    }

    this.loading.set(true);
    try {
      this.newDemande.directeurEmail = this.userEmail();

      const demande = await this.http.post<DemandeSoutenance>(`${this.apiUrl}/demandes`, this.newDemande).toPromise();

      if (!demande || !demande.id) {
        this.toastService.error('La création a échoué');
        await this.loadDemandes();
        return;
      }

      this.toastService.success('Demande créée avec succès');
      await this.loadDemandes();
      this.selectedDemande.set(demande);
      this.currentView.set('detail');
      await this.loadPrerequisAndJury(demande.id);

      this.newDemande = {
        doctorantEmail: '',
        directeurEmail: '',
        titreThese: '',
        resume: ''
      };
    } catch (error: any) {
      this.toastService.error(error?.error?.error || 'Erreur de création');
    } finally {
      this.loading.set(false);
    }
  }
  
  async viewDemande(demande: DemandeSoutenance) {
    this.selectedDemande.set(demande);
    this.currentView.set('detail');
    await this.loadPrerequisAndJury(demande.id);
    this.updateTimelineStatus(demande);
  }
  
  async loadPrerequisAndJury(demandeId: number) {
    try {
      const [prereq, jury] = await Promise.all([
        this.http.get<Prerequis>(`${this.apiUrl}/demandes/${demandeId}/prerequis`).toPromise(),
        this.http.get<MembreJury[]>(`${this.apiUrl}/demandes/${demandeId}/jury`).toPromise()
      ]);
      
      this.prerequis.set(prereq || null);
      this.juryMembers.set(jury || []);
    } catch (error) {
      console.error('Error loading details', error);
    }
  }
  
  async addJuryMember() {
    const demande = this.selectedDemande();
    if (!demande) return;
    
    if (!this.newMembre.nom || !this.newMembre.prenom || !this.newMembre.email) {
      this.toastService.error('Veuillez remplir tous les champs requis');
      return;
    }
    
    this.loading.set(true);
    try {
      const membre = await this.http.post<MembreJury>(
        `${this.apiUrl}/demandes/${demande.id}/jury`,
        this.newMembre
      ).toPromise();
      
      const currentMembers = this.juryMembers();
      this.juryMembers.set([...currentMembers, membre!]);
      this.toastService.success('Membre du jury ajouté');
      await this.loadDemandes();
      
      this.newMembre = {
        nom: '',
        prenom: '',
        email: '',
        etablissement: '',
        grade: '',
        role: 'EXAMINATEUR'
      };
      this.showJuryForm.set(false);
    } catch (error: any) {
      this.toastService.error(error?.error?.error || 'Erreur d\'ajout');
    } finally {
      this.loading.set(false);
    }
  }
  
  async submitJuryProposal() {
    const demande = this.selectedDemande();
    if (!demande) return;
    
    if (!confirm('Êtes-vous sûr de vouloir soumettre la composition du jury ?')) return;
    
    this.loading.set(true);
    try {
      const updated = await this.http.post<DemandeSoutenance>(
        `${this.apiUrl}/demandes/${demande.id}/jury/submit`,
        { directeurEmail: this.userEmail() }
      ).toPromise();
      
      this.selectedDemande.set(updated || null);
      this.toastService.success('Composition du jury soumise');
      await this.loadDemandes();
    } catch (error: any) {
      this.toastService.error(error?.error?.error || 'Erreur de soumission');
    } finally {
      this.loading.set(false);
    }
  }
  
  updateTimelineStatus(demande: DemandeSoutenance) {
    const statusMap: Record<string, number> = {
      'BROUILLON': 1,
      'SOUMISE': 2,
      'EN_VERIFICATION': 2,
      'PREREQUIS_VALIDES': 3,
      'EN_ATTENTE_JURY': 3,
      'JURY_PROPOSE': 4,
      'EN_ATTENTE_RAPPORTS': 5,
      'RAPPORTS_FAVORABLES': 6,
      'AUTORISEE': 6,
      'PLANIFIEE': 7,
      'TERMINEE': 8
    };
    
    const currentStep = statusMap[demande.statut] || 1;
    
    this.timelineSteps = this.timelineSteps.map((step, index) => ({
      ...step,
      status: index < currentStep - 1 ? 'completed' : 
              index === currentStep - 1 ? 'active' : 'pending'
    }));
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
  
  getRoleJuryLabel(role: string): string {
    const labels: Record<string, string> = {
      'RAPPORTEUR': 'Rapporteur',
      'EXAMINATEUR': 'Examinateur',
      'PRESIDENT': 'Président'
    };
    return labels[role] || role;
  }
  
  getRoleIcon(role: string): string {
    return role === 'RAPPORTEUR' ? '📋' : role === 'PRESIDENT' ? '⭐' : '👤';
  }
  
  goBack() {
    if (this.currentView() === 'detail') {
      this.currentView.set('list');
      this.selectedDemande.set(null);
      this.loadDemandes();
    } else {
      this.currentView.set('info');
    }
  }
  
  showCreateForm() {
    this.currentView.set('create');
  }
  
  showListView() {
    this.currentView.set('list');
    this.loadDemandes();
  }
  
  showInfoView() {
    this.currentView.set('info');
  }
  
  toggleJuryForm() {
    this.showJuryForm.set(!this.showJuryForm());
  }
  
  getDocumentIcon(docType: string): string {
    const icons: Record<string, string> = {
      'demandeManuscrite': '📝',
      'rapportThese': '📄',
      'rapportAntiPlagiat': '🔍',
      'rapportPublications': '📚',
      'attestationsFormation': '🎓',
      'autorisationSoutenance': '✅'
    };
    return icons[docType] || '📄';
  }
  
  getProgressPercentage(): number {
    const prereq = this.prerequis();
    if (!prereq) return 0;
    
    let completed = 0;
    let total = 8;
    
    if (prereq.publicationsValides) completed++;
    if (prereq.creditsValides) completed++;
    if (prereq.demandeManuscrite) completed++;
    if (prereq.rapportThese) completed++;
    if (prereq.rapportAntiPlagiat) completed++;
    if (prereq.rapportPublications) completed++;
    if (prereq.attestationsFormation) completed++;
    if (prereq.autorisationSoutenance) completed++;
    
    return Math.round((completed / total) * 100);
  }
}
