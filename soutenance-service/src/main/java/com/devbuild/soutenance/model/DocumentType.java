package com.devbuild.soutenance.model;

public class DocumentType {
    public static final String DEMANDE_MANUSCRITE = "DEMANDE_MANUSCRITE";
    public static final String RAPPORT_THESE = "RAPPORT_THESE";
    public static final String ANTI_PLAGIAT = "ANTI_PLAGIAT";
    public static final String RAPPORT_PUBLICATIONS = "RAPPORT_PUBLICATIONS";
    public static final String ATTESTATIONS_FORMATION = "ATTESTATIONS_FORMATION";
    public static final String AUTORISATION_SOUTENANCE = "AUTORISATION_SOUTENANCE";
    
    private DocumentType() {
        // Utility class
    }
    
    public static boolean isValid(String type) {
        return DEMANDE_MANUSCRITE.equals(type) ||
               RAPPORT_THESE.equals(type) ||
               ANTI_PLAGIAT.equals(type) ||
               RAPPORT_PUBLICATIONS.equals(type) ||
               ATTESTATIONS_FORMATION.equals(type) ||
               AUTORISATION_SOUTENANCE.equals(type);
    }
}
