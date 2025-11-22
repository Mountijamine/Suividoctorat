package com.devbuild.soutenance.model;

public enum StatutDemande {
    BROUILLON,           // Draft - doctorant is still preparing
    SOUMISE,             // Submitted by doctorant
    EN_VERIFICATION,     // Administration checking prerequisites
    PREREQUIS_VALIDES,  // Prerequisites validated
    EN_ATTENTE_JURY,     // Waiting for jury proposal from directeur
    JURY_PROPOSE,        // Jury proposed by directeur
    EN_ATTENTE_RAPPORTS, // Waiting for rapporteur reports
    RAPPORTS_FAVORABLES, // Favorable reports received
    AUTORISEE,           // Defense authorized
    PLANIFIEE,           // Defense scheduled
    TERMINEE,            // Defense completed
    REJETEE              // Rejected
}
