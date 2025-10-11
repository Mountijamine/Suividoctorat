// prerequis.model.ts
export interface Prerequis {
  nombreArticlesQ1Q2: number;
  nombreConferences: number;
  heuresFormation: number;
  articlesValide?: boolean;
  conferencesValide?: boolean;
  formationValide?: boolean;
  documentsValide?: boolean;
  remarques?: string;
  isValid?: boolean;
  validationSummary?: string;
}

export const PREREQUIS_REQUIREMENTS = {
  MIN_ARTICLES: 2,
  MIN_CONFERENCES: 2,
  MIN_HEURES_FORMATION: 200
};
