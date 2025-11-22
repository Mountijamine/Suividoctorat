import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EncadrantNavbarComponent } from '../../components/navbar/encadrant-navbar';

interface DemandeSoutenance {
  id: number;
  doctorantEmail: string;
  directeurEmail: string;
  titreThese: string;
  resume: string;
  statut: string;
  dateCreation: string;
  dateSoumission?: string;
  dateSoutenance?: string;
  dateAutorisation?: string;
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
  valideParAdmin?: string;
  dateValidation?: string;
  commentaires?: string;
}

interface MembreJury {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  grade?: string;
  etablissement?: string;
  avisRendu?: boolean;
  avisFavorable?: boolean;
}

@Component({
  selector: 'app-soutenance-premium',
  standalone: true,
  imports: [CommonModule, FormsModule, EncadrantNavbarComponent],
  templateUrl: './soutenance-premium.html',
  styleUrls: ['./soutenance-premium.scss']
})
export class SoutenancePremiumPage implements OnInit {
  currentView = signal<'list' | 'create' | 'detail'>('list');
  demandes = signal<DemandeSoutenance[]>([]);
  selectedDemande = signal<DemandeSoutenance | null>(null);
  loading = signal(false);
  userEmail = signal('');
  userName = signal('');

  newDemande = {
    titre: '',
    resume: '',
    specialite: '',
    directeurEmail: '',
    coDirecteurEmail: ''
  };

  prerequis = signal<Prerequis | null>(null);
  juryMembers = signal<MembreJury[]>([]);
  showJuryForm = signal(false);
  
  newMember = {
    nom: '',
    prenom: '',
    email: '',
    role: 'EXAMINATEUR',
    grade: '',
    etablissement: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (user: any) => {
        if (user) {
          this.userEmail.set(user.email || '');
          this.userName.set(`${user.prenom} ${user.nom}`);
          console.log('User profile loaded:', { email: this.userEmail(), name: this.userName() });
          
          // Load demandes after profile is loaded
          this.route.queryParams.subscribe(params => {
            if (params['id'] && params['view'] === 'detail') {
              this.loadDemandeDetail(params['id']);
            } else {
              this.loadDemandes();
            }
          });
        }
      },
      error: (err) => {
        console.error('Error loading profile:', err);
      }
    });
  }

  loadDemandes() {
    this.loading.set(true);
    const email = this.userEmail();
    
    if (!email) {
      console.error('Cannot load demandes: user email not available');
      this.loading.set(false);
      return;
    }
    
    console.log('Loading all demandes (no role filter) for email:', email);
    
    // Try loading all demandes first to see what's in the database
    this.http.get<DemandeSoutenance[]>(`http://localhost:8096/api/soutenance/demandes`).subscribe({
      next: (data) => {
        console.log('All demandes loaded:', data);
        console.log('Total count:', data.length);
        
        // Filter on frontend for now to debug
        const filtered = data.filter(d => 
          d.directeurEmail === email || d.doctorantEmail === email
        );
        console.log('Filtered demandes for user:', filtered);
        
        this.demandes.set(data); // Show all for now
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading demandes:', err);
        console.error('Error details:', err.error);
        this.loading.set(false);
      }
    });
  }

  loadDemandeDetail(id: number) {
    this.loading.set(true);
    this.http.get<DemandeSoutenance>(`http://localhost:8096/api/soutenance/demandes/${id}`).subscribe({
      next: (data) => {
        this.selectedDemande.set(data);
        this.currentView.set('detail');
        this.loadPrerequisAndJury(id);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading demande:', err);
        this.loading.set(false);
      }
    });
  }

  loadPrerequisAndJury(demandeId: number) {
    console.log('Loading prerequis and jury for demande:', demandeId);
    
    this.http.get<Prerequis>(`http://localhost:8096/api/soutenance/demandes/${demandeId}/prerequis`).subscribe({
      next: (data) => {
        console.log('Prerequis loaded:', data);
        this.prerequis.set(data);
      },
      error: (err) => {
        console.error('Error loading prerequis:', err);
        console.error('Error details:', err.error);
        this.prerequis.set(null);
      }
    });

    this.http.get<MembreJury[]>(`http://localhost:8096/api/soutenance/demandes/${demandeId}/jury`).subscribe({
      next: (data) => {
        console.log('Jury members loaded:', data);
        console.log('Jury count:', data.length);
        this.juryMembers.set(data);
      },
      error: (err) => {
        console.error('Error loading jury:', err);
        console.error('Error details:', err.error);
        this.juryMembers.set([]);
      }
    });
  }

  createDemande() {
    // Validate required fields
    if (!this.newDemande.titre || !this.newDemande.resume || !this.newDemande.directeurEmail) {
      alert('Veuillez remplir tous les champs obligatoires (titre, résumé, directeur)');
      return;
    }

    if (!this.userEmail()) {
      alert('Erreur: Email utilisateur non disponible. Veuillez vous reconnecter.');
      return;
    }

    // Map frontend fields to backend DTO structure
    const payload = {
      doctorantEmail: this.userEmail(),
      directeurEmail: this.newDemande.directeurEmail,
      titreThese: this.newDemande.titre,
      resume: this.newDemande.resume
    };

    console.log('Creating demande with payload:', payload);

    this.http.post('http://localhost:8096/api/soutenance/demandes', payload).subscribe({
      next: (response) => {
        console.log('Demande created successfully:', response);
        alert('Demande créée avec succès!');
        this.currentView.set('list');
        this.loadDemandes();
        this.resetForm();
      },
      error: (err) => {
        console.error('Error creating demande:', err);
        console.error('Error details:', err.error);
        alert('Erreur lors de la création de la demande: ' + (err.error?.error || err.message));
      }
    });
  }

  addJuryMember() {
    const demandeId = this.selectedDemande()?.id;
    if (!demandeId) {
      alert('Erreur: Aucune demande sélectionnée');
      return;
    }

    // Validate required fields
    if (!this.newMember.nom || !this.newMember.prenom || !this.newMember.email) {
      alert('Veuillez remplir tous les champs obligatoires (nom, prénom, email)');
      return;
    }

    console.log('Adding jury member to demande:', demandeId);
    console.log('Member data:', this.newMember);

    this.http.post(`http://localhost:8096/api/soutenance/demandes/${demandeId}/jury`, this.newMember).subscribe({
      next: (response) => {
        console.log('Jury member added successfully:', response);
        alert('Membre du jury ajouté avec succès!');
        this.loadPrerequisAndJury(demandeId);
        this.showJuryForm.set(false);
        this.resetJuryForm();
      },
      error: (err) => {
        console.error('Error adding jury member:', err);
        console.error('Error details:', err.error);
        alert('Erreur lors de l\'ajout du membre: ' + (err.error?.error || err.message));
      }
    });
  }

  resetForm() {
    this.newDemande = { titre: '', resume: '', specialite: '', directeurEmail: '', coDirecteurEmail: '' };
  }

  resetJuryForm() {
    this.newMember = { nom: '', prenom: '', email: '', role: 'EXAMINATEUR', grade: '', etablissement: '' };
  }

  viewDetail(demande: DemandeSoutenance) {
    this.selectedDemande.set(demande);
    this.currentView.set('detail');
    this.loadPrerequisAndJury(demande.id);
  }
 

  getStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'BROUILLON': 'Brouillon',
      'SOUMISE': 'Soumise',
      'EN_VERIFICATION': 'En Vérification',
      'PREREQUIS_VALIDES': 'Prérequis Validés',
      'EN_ATTENTE_JURY': 'En Attente Jury',
      'JURY_PROPOSE': 'Jury Proposé',
      'AUTORISEE': 'Autorisée',
      'PLANIFIEE': 'Planifiée',
      'TERMINEE': 'Terminée',
      'REJETEE': 'Rejetée'
    };
    return labels[statut] || statut;
  }

  getPrerequisProgress(): number {
    const prereq = this.prerequis();
    if (!prereq) return 0;
    
    // Count how many document fields are completed
    const documents = [
      prereq.demandeManuscrite,
      prereq.rapportThese,
      prereq.rapportAntiPlagiat,
      prereq.rapportPublications,
      prereq.attestationsFormation,
      prereq.autorisationSoutenance
    ];
    
    const completed = documents.filter(d => d === true).length;
    return Math.round((completed / documents.length) * 100);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Non définie';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
