// soutenance.model.ts
export interface Soutenance {
  id?: number;
  sujet: string;
  titreThese: string;
  dateSouhaitee: string;
  dateDefense?: string;
  heureDefense?: string;
  salleDefense?: string;
  doctorantId: number;
  doctorantNom: string;
  doctorantPrenom: string;
  doctorantEmail: string;
  directeurId: number;
  directeurNom: string;
  directeurEmail: string;
  adminId?: number;
  statut: StatutSoutenance;
  commentaireDirecteur?: string;
  commentaireAdmin?: string;
  autorisationPath?: string;
  documents?: Document[];
  jury?: Jury;
  prerequis?: Prerequis;
  dateCreation?: string;
  dateModification?: string;
  dateValidationDirecteur?: string;
  dateAutorisation?: string;
  canSubmit?: boolean;
  canValidate?: boolean;
  canAuthorize?: boolean;
}

export enum StatutSoutenance {
  SOUMISE = 'SOUMISE',
  VALIDEE = 'VALIDEE',
  REJETEE = 'REJETEE',
  AUTORISEE = 'AUTORISEE',
  PLANIFIEE = 'PLANIFIEE',
  TERMINEE = 'TERMINEE'
}

export interface SoutenanceRequest {
  sujet: string;
  titreThese: string;
  dateSouhaitee: string;
  doctorantId: number;
  doctorantNom: string;
  doctorantPrenom: string;
  doctorantEmail: string;
  directeurId: number;
  directeurNom: string;
  directeurEmail: string;
  prerequis: Prerequis;
}
