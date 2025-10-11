// soutenance.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Soutenance, SoutenanceRequest, StatutSoutenance } from '../models/soutenance.model';
import { Document, TypeDocument } from '../models/document.model';
import { ValidationDirecteur, AutorisationAdmin } from '../models/jury.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SoutenanceService {
  private apiUrl = `${environment.apiUrl}/soutenances`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new defense request
   */
  createSoutenance(request: SoutenanceRequest): Observable<Soutenance> {
    return this.http.post<Soutenance>(this.apiUrl, request);
  }

  /**
   * Get defense by ID
   */
  getSoutenanceById(id: number): Observable<Soutenance> {
    return this.http.get<Soutenance>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get all defenses for a student
   */
  getSoutenancesByDoctorant(doctorantId: number): Observable<Soutenance[]> {
    return this.http.get<Soutenance[]>(`${this.apiUrl}/doctorant/${doctorantId}`);
  }

  /**
   * Get all defenses for a director
   */
  getSoutenancesByDirecteur(directeurId: number): Observable<Soutenance[]> {
    return this.http.get<Soutenance[]>(`${this.apiUrl}/directeur/${directeurId}`);
  }

  /**
   * Get defenses by status
   */
  getSoutenancesByStatut(statut: StatutSoutenance): Observable<Soutenance[]> {
    return this.http.get<Soutenance[]>(`${this.apiUrl}/statut/${statut}`);
  }

  /**
   * Upload document for defense
   */
  uploadDocument(soutenanceId: number, type: TypeDocument, file: File): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http.post<Document>(
      `${this.apiUrl}/${soutenanceId}/documents`,
      formData
    );
  }

  /**
   * Validate or reject defense (Director)
   */
  validerParDirecteur(id: number, validation: ValidationDirecteur): Observable<Soutenance> {
    return this.http.put<Soutenance>(`${this.apiUrl}/${id}/valider`, validation);
  }

  /**
   * Authorize defense (Admin)
   */
  autoriserParAdmin(id: number, autorisation: AutorisationAdmin): Observable<Soutenance> {
    return this.http.put<Soutenance>(`${this.apiUrl}/${id}/autoriser`, autorisation);
  }

  /**
   * Delete defense
   */
  deleteSoutenance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get status label in French
   */
  getStatutLabel(statut: StatutSoutenance): string {
    const labels: Record<StatutSoutenance, string> = {
      [StatutSoutenance.SOUMISE]: 'Soumise',
      [StatutSoutenance.VALIDEE]: 'Validée',
      [StatutSoutenance.REJETEE]: 'Rejetée',
      [StatutSoutenance.AUTORISEE]: 'Autorisée',
      [StatutSoutenance.PLANIFIEE]: 'Planifiée',
      [StatutSoutenance.TERMINEE]: 'Terminée'
    };
    return labels[statut];
  }

  /**
   * Get status color for UI
   */
  getStatutColor(statut: StatutSoutenance): string {
    const colors: Record<StatutSoutenance, string> = {
      [StatutSoutenance.SOUMISE]: 'primary',
      [StatutSoutenance.VALIDEE]: 'accent',
      [StatutSoutenance.REJETEE]: 'warn',
      [StatutSoutenance.AUTORISEE]: 'success',
      [StatutSoutenance.PLANIFIEE]: 'success',
      [StatutSoutenance.TERMINEE]: 'basic'
    };
    return colors[statut];
  }
}
