package com.devbuild.soutenance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing documents uploaded for the defense request
 */
@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeDocument type;

    @Column(nullable = false, name = "nom_fichier")
    private String nomFichier;

    @Column(nullable = false, name = "chemin_fichier")
    private String cheminFichier;

    @Column(name = "taille_fichier")
    private Long tailleFichier;

    @Column(name = "format_fichier")
    private String formatFichier;

    @Column(nullable = false)
    private Boolean valide = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soutenance_id", nullable = false)
    private Soutenance soutenance;

    @CreationTimestamp
    @Column(name = "date_upload", nullable = false, updatable = false)
    private LocalDateTime dateUpload;

    // Enum for document types
    public enum TypeDocument {
        DEMANDE_MANUSCRITE("Demande manuscrite"),
        RAPPORT_THESE("Rapport de thèse"),
        RAPPORT_ANTI_PLAGIAT("Rapport anti-plagiat"),
        PUBLICATIONS_COMMUNICATIONS("Publications et communications"),
        ATTESTATIONS_FORMATION("Attestations de formation"),
        AUTORISATION_SOUTENANCE("Autorisation de soutenance");

        private final String label;

        TypeDocument(String label) {
            this.label = label;
        }

        public String getLabel() {
            return label;
        }
    }

    public boolean isPdf() {
        return "application/pdf".equals(formatFichier) || 
               nomFichier != null && nomFichier.toLowerCase().endsWith(".pdf");
    }
}
