// demande-soutenance-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SoutenanceService } from '../../services/soutenance.service';
import { SoutenanceRequest } from '../../models/soutenance.model';
import { TypeDocument, TYPE_DOCUMENT_LABELS } from '../../models/document.model';
import { PREREQUIS_REQUIREMENTS } from '../../models/prerequis.model';

@Component({
  selector: 'app-demande-soutenance-form',
  templateUrl: './demande-soutenance-form.component.html',
  styleUrls: ['./demande-soutenance-form.component.scss']
})
export class DemandeSoutenanceFormComponent implements OnInit {
  soutenanceForm!: FormGroup;
  documentTypes = Object.values(TypeDocument).filter(t => t !== TypeDocument.AUTORISATION_SOUTENANCE);
  typeDocumentLabels = TYPE_DOCUMENT_LABELS;
  prerequisRequirements = PREREQUIS_REQUIREMENTS;
  uploadedFiles: Map<TypeDocument, File> = new Map();
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private soutenanceService: SoutenanceService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.soutenanceForm = this.fb.group({
      sujet: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      titreThese: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      dateSouhaitee: ['', Validators.required],
      doctorantId: [1001, Validators.required], // Should come from auth service
      doctorantNom: ['', Validators.required],
      doctorantPrenom: ['', Validators.required],
      doctorantEmail: ['', [Validators.required, Validators.email]],
      directeurId: [2001, Validators.required], // Should come from selection
      directeurNom: ['', Validators.required],
      directeurEmail: ['', [Validators.required, Validators.email]],
      prerequis: this.fb.group({
        nombreArticlesQ1Q2: [0, [Validators.required, Validators.min(0)]],
        nombreConferences: [0, [Validators.required, Validators.min(0)]],
        heuresFormation: [0, [Validators.required, Validators.min(0)]]
      })
    });
  }

  onFileSelected(type: TypeDocument, event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Validate PDF format
      if (file.type !== 'application/pdf') {
        this.snackBar.open('Seuls les fichiers PDF sont acceptés', 'Fermer', { duration: 3000 });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('La taille du fichier ne doit pas dépasser 10MB', 'Fermer', { duration: 3000 });
        return;
      }

      this.uploadedFiles.set(type, file);
      this.snackBar.open(`Fichier ${file.name} sélectionné`, 'OK', { duration: 2000 });
    }
  }

  isPrerequisValid(): boolean {
    const prerequis = this.soutenanceForm.get('prerequis')?.value;
    return (
      prerequis.nombreArticlesQ1Q2 >= this.prerequisRequirements.MIN_ARTICLES &&
      prerequis.nombreConferences >= this.prerequisRequirements.MIN_CONFERENCES &&
      prerequis.heuresFormation >= this.prerequisRequirements.MIN_HEURES_FORMATION &&
      this.allDocumentsUploaded()
    );
  }

  allDocumentsUploaded(): boolean {
    return this.documentTypes.every(type => this.uploadedFiles.has(type));
  }

  getPrerequisValidationMessage(): string {
    const prerequis = this.soutenanceForm.get('prerequis')?.value;
    const messages: string[] = [];

    if (prerequis.nombreArticlesQ1Q2 < this.prerequisRequirements.MIN_ARTICLES) {
      messages.push(`Articles: ${prerequis.nombreArticlesQ1Q2}/${this.prerequisRequirements.MIN_ARTICLES}`);
    }
    if (prerequis.nombreConferences < this.prerequisRequirements.MIN_CONFERENCES) {
      messages.push(`Conférences: ${prerequis.nombreConferences}/${this.prerequisRequirements.MIN_CONFERENCES}`);
    }
    if (prerequis.heuresFormation < this.prerequisRequirements.MIN_HEURES_FORMATION) {
      messages.push(`Formation: ${prerequis.heuresFormation}h/${this.prerequisRequirements.MIN_HEURES_FORMATION}h`);
    }
    if (!this.allDocumentsUploaded()) {
      messages.push('Documents manquants');
    }

    return messages.length > 0 ? messages.join(', ') : 'Tous les prérequis sont satisfaits';
  }

  onSubmit(): void {
    if (this.soutenanceForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 3000 });
      return;
    }

    if (!this.isPrerequisValid()) {
      this.snackBar.open('Les prérequis ne sont pas satisfaits', 'Fermer', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    const request: SoutenanceRequest = this.soutenanceForm.value;

    this.soutenanceService.createSoutenance(request).subscribe({
      next: (soutenance) => {
        this.snackBar.open('Demande de soutenance créée avec succès', 'OK', { duration: 3000 });
        
        // Upload documents
        this.uploadDocuments(soutenance.id!);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.snackBar.open(
          error.error?.message || 'Erreur lors de la création de la demande',
          'Fermer',
          { duration: 5000 }
        );
      }
    });
  }

  private uploadDocuments(soutenanceId: number): void {
    const uploads: Promise<any>[] = [];

    this.uploadedFiles.forEach((file, type) => {
      uploads.push(
        this.soutenanceService.uploadDocument(soutenanceId, type, file).toPromise()
      );
    });

    Promise.all(uploads)
      .then(() => {
        this.isSubmitting = false;
        this.snackBar.open('Documents uploadés avec succès', 'OK', { duration: 3000 });
        this.router.navigate(['/soutenance/dashboard']);
      })
      .catch((error) => {
        this.isSubmitting = false;
        this.snackBar.open('Erreur lors de l\'upload des documents', 'Fermer', { duration: 5000 });
      });
  }

  onCancel(): void {
    this.router.navigate(['/soutenance/dashboard']);
  }
}
