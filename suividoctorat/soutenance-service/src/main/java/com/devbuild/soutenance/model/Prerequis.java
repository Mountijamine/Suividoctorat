package com.devbuild.soutenance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing the prerequisites validation for a PhD defense
 */
@Entity
@Table(name = "prerequis")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prerequis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soutenance_id", nullable = false)
    private Soutenance soutenance;

    @Column(name = "nombre_articles_q1_q2", nullable = false)
    private Integer nombreArticlesQ1Q2 = 0;

    @Column(name = "nombre_conferences", nullable = false)
    private Integer nombreConferences = 0;

    @Column(name = "heures_formation", nullable = false)
    private Integer heuresFormation = 0;

    @Column(name = "articles_valide", nullable = false)
    private Boolean articlesValide = false;

    @Column(name = "conferences_valide", nullable = false)
    private Boolean conferencesValide = false;

    @Column(name = "formation_valide", nullable = false)
    private Boolean formationValide = false;

    @Column(name = "documents_valide", nullable = false)
    private Boolean documentsValide = false;

    @Column(columnDefinition = "TEXT")
    private String remarques;

    @UpdateTimestamp
    @Column(name = "date_verification")
    private LocalDateTime dateVerification;

    // Constants for validation
    private static final int MIN_ARTICLES_Q1_Q2 = 2;
    private static final int MIN_CONFERENCES = 2;
    private static final int MIN_HEURES_FORMATION = 200;

    // Validation methods
    public void validateArticles() {
        this.articlesValide = nombreArticlesQ1Q2 >= MIN_ARTICLES_Q1_Q2;
    }

    public void validateConferences() {
        this.conferencesValide = nombreConferences >= MIN_CONFERENCES;
    }

    public void validateFormation() {
        this.formationValide = heuresFormation >= MIN_HEURES_FORMATION;
    }

    public void validateAll() {
        validateArticles();
        validateConferences();
        validateFormation();
    }

    public boolean isValid() {
        return articlesValide && conferencesValide && formationValide && documentsValide;
    }

    public String getValidationSummary() {
        StringBuilder summary = new StringBuilder();
        
        if (!articlesValide) {
            summary.append(String.format("Articles: %d/%d (manque %d). ", 
                nombreArticlesQ1Q2, MIN_ARTICLES_Q1_Q2, MIN_ARTICLES_Q1_Q2 - nombreArticlesQ1Q2));
        }
        
        if (!conferencesValide) {
            summary.append(String.format("Conférences: %d/%d (manque %d). ", 
                nombreConferences, MIN_CONFERENCES, MIN_CONFERENCES - nombreConferences));
        }
        
        if (!formationValide) {
            summary.append(String.format("Formation: %dh/%dh (manque %dh). ", 
                heuresFormation, MIN_HEURES_FORMATION, MIN_HEURES_FORMATION - heuresFormation));
        }
        
        if (!documentsValide) {
            summary.append("Documents incomplets. ");
        }
        
        return summary.length() > 0 ? summary.toString() : "Tous les prérequis sont validés.";
    }
}
