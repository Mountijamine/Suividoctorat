// document.model.ts
export interface Document {
  id?: number;
  type: TypeDocument;
  nomFichier: string;
  cheminFichier: string;
  tailleFichier: number;
  formatFichier: string;
  valide: boolean;
  dateUpload?: string;
}

export enum TypeDocument {
  DEMANDE_MANUSCRITE = 'DEMANDE_MANUSCRITE',
  RAPPORT_THESE = 'RAPPORT_THESE',
  RAPPORT_ANTI_PLAGIAT = 'RAPPORT_ANTI_PLAGIAT',
  PUBLICATIONS_COMMUNICATIONS = 'PUBLICATIONS_COMMUNICATIONS',
  ATTESTATIONS_FORMATION = 'ATTESTATIONS_FORMATION',
  AUTORISATION_SOUTENANCE = 'AUTORISATION_SOUTENANCE'
}

export const TYPE_DOCUMENT_LABELS: Record<TypeDocument, string> = {
  [TypeDocument.DEMANDE_MANUSCRITE]: 'Demande manuscrite',
  [TypeDocument.RAPPORT_THESE]: 'Rapport de thèse',
  [TypeDocument.RAPPORT_ANTI_PLAGIAT]: 'Rapport anti-plagiat',
  [TypeDocument.PUBLICATIONS_COMMUNICATIONS]: 'Publications et communications',
  [TypeDocument.ATTESTATIONS_FORMATION]: 'Attestations de formation',
  [TypeDocument.AUTORISATION_SOUTENANCE]: 'Autorisation de soutenance'
};
