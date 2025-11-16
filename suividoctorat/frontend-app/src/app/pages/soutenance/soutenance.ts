import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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

@Component({
  selector: 'soutenance-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soutenance.html',
  styleUrls: ['./soutenance.css']
})
export class SoutenancePage implements OnInit {
  private apiUrl = 'http://localhost:8096/api/soutenance';
  
  demandes = signal<DemandeSoutenance[]>([]);
  selectedDemande = signal<DemandeSoutenance | null>(null);
  prerequis = signal<Prerequis | null>(null);
  juryMembers = signal<MembreJury[]>([]);
  
  currentView = signal<'list' | 'create' | 'detail'>('list');
  userRole = signal<string>('');
  userEmail = signal<string>('');
  
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
  
  prerequisForm = {
    nombrePublications: 0,
    creditsFormation: 0
  };
  
  loading = signal(false);
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}
  
  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth'], { queryParams: { sessionExpired: 1 } });
      return;
    }
    
    // Get email from token
    const token = this.authService.getToken();
    if (token) {
      const payload = this.parseJwt(token);
      this.userEmail.set(payload?.sub || payload?.email || '');
    }
    
    const role = this.authService.role() || '';
    this.userRole.set(role);
    
    // Restrict access to ROLE_ENCADRANT only
    if (role !== 'ROLE_ENCADRANT') {
      this.toastService.error('Accès réservé aux encadrants');
      this.router.navigate(['/']);
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
      const role = this.userRole();
      const email = this.userEmail();
      
      console.log('[Soutenance] Loading demandes - Role:', role, 'Email:', email);
      
      let params: any = {};
      if (role === 'ROLE_ENCADRANT') {
        params.role = 'directeur';
        params.email = email;
      }
      
      console.log('[Soutenance] API URL:', `${this.apiUrl}/demandes`, 'Params:', params);
      
      const data = await this.http.get<DemandeSoutenance[]>(`${this.apiUrl}/demandes`, { params }).toPromise();
      console.log('[Soutenance] Received data:', data);
      this.demandes.set(data || []);
    } catch (error: any) {
      console.error('[Soutenance] Error loading demandes:', error);
      this.toastService.error(error?.error?.error || 'Erreur de chargement');
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
      this.toastService.success('Demande créée avec succès');
      this.currentView.set('list');
      await this.loadDemandes();
      
      // Reset form
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
  }
  
  async loadPrerequisAndJury(demandeId: number) {
    try {
      const [prereq, jury] = await Promise.all([
        this.http.get<Prerequis>(`${this.apiUrl}/demandes/${demandeId}/prerequis`).toPromise(),
        this.http.get<MembreJury[]>(`${this.apiUrl}/demandes/${demandeId}/jury`).toPromise()
      ]);
      
      this.prerequis.set(prereq || null);
      this.juryMembers.set(jury || []);
      
      if (prereq) {
        this.prerequisForm.nombrePublications = prereq.nombrePublications;
        this.prerequisForm.creditsFormation = prereq.creditsFormation;
      }
    } catch (error) {
      console.error('Error loading details', error);
    }
  }
  
  async updatePrerequisDoctorant() {
    const demande = this.selectedDemande();
    if (!demande) return;
    
    this.loading.set(true);
    try {
      const updated = await this.http.put<Prerequis>(
        `${this.apiUrl}/demandes/${demande.id}/prerequis`,
        this.prerequisForm
      ).toPromise();
      
      this.prerequis.set(updated || null);
      this.toastService.success('Prérequis mis à jour');
    } catch (error: any) {
      this.toastService.error(error?.error?.error || 'Erreur de mise à jour');
    } finally {
      this.loading.set(false);
    }
  }
  
  async submitDemande() {
    const demande = this.selectedDemande();
    if (!demande) return;
    
    if (!confirm('Êtes-vous sûr de vouloir soumettre cette demande ?')) return;
    
    this.loading.set(true);
    try {
      const updated = await this.http.post<DemandeSoutenance>(
        `${this.apiUrl}/demandes/${demande.id}/submit`,
        { doctorantEmail: this.userEmail() }
      ).toPromise();
      
      this.selectedDemande.set(updated || null);
      this.toastService.success('Demande soumise avec succès');
      await this.loadDemandes();
    } catch (error: any) {
      this.toastService.show(error?.error?.error || 'Erreur de soumission', 'error');
    } finally {
      this.loading.set(false);
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
      
      // Reset form
      this.newMembre = {
        nom: '',
        prenom: '',
        email: '',
        etablissement: '',
        grade: '',
        role: 'EXAMINATEUR'
      };
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
      this.toastService.show(error?.error?.error || 'Erreur de soumission', 'error');
    } finally {
      this.loading.set(false);
    }
  }
  
  async validatePrerequisAdmin(valide: boolean) {
    const demande = this.selectedDemande();
    if (!demande) return;
    
    const commentaires = prompt(valide ? 'Commentaires (optionnel)' : 'Raison du refus');
    
    this.loading.set(true);
    try {
      const updated = await this.http.post<Prerequis>(
        `${this.apiUrl}/demandes/${demande.id}/prerequis/validate`,
        {
          adminEmail: this.userEmail(),
          valide,
          commentaires
        }
      ).toPromise();
      
      this.prerequis.set(updated || null);
      this.toastService.success(`Prérequis ${valide ? 'validés' : 'refusés'}`);
      await this.loadDemandes();
    } catch (error: any) {
      this.toastService.error(error?.error?.error || 'Erreur de validation');
    } finally {
      this.loading.set(false);
    }
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
  
  goBack() {
    this.currentView.set('list');
    this.selectedDemande.set(null);
  }
  
  showCreateForm() {
    this.currentView.set('create');
  }
  
  canEdit(): boolean {
    const demande = this.selectedDemande();
    if (!demande) return false;
    
    const role = this.userRole();
    const email = this.userEmail();
    
    if (role === 'ROLE_DOCTORANT' && demande.doctorantEmail === email) {
      return demande.statut === 'BROUILLON';
    }
    
    if (role === 'ROLE_ENCADRANT' && demande.directeurEmail === email) {
      return ['PREREQUIS_VALIDES', 'EN_ATTENTE_JURY'].includes(demande.statut);
    }
    
    if (role === 'ROLE_ADMIN' || role === 'ROLE_PERSONNEL') {
      return true;
    }
    
    return false;
  }
}
