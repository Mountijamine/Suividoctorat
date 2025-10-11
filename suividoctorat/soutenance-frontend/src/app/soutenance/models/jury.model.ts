// jury.model.ts
export interface Jury {
  id?: number;
  presidentNom: string;
  presidentEmail: string;
  presidentInstitution: string;
  rapporteurs: MembreJury[];
  examinateurs: MembreJury[];
  commentaires?: string;
  valide?: boolean;
  isComplete?: boolean;
}

export interface MembreJury {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  institution: string;
  grade: string;
  typeRole?: RoleJury;
  rapportPath?: string;
  rapportFavorable?: boolean;
}

export enum RoleJury {
  RAPPORTEUR = 'RAPPORTEUR',
  EXAMINATEUR = 'EXAMINATEUR'
}

export interface ValidationDirecteur {
  action: 'VALIDER' | 'REJETER';
  commentaire?: string;
  jury?: Jury;
}

export interface AutorisationAdmin {
  adminId: number;
  dateDefense: string;
  heureDefense: string;
  salleDefense: string;
  commentaire?: string;
}
