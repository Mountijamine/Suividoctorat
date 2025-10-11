package com.devbuild.soutenance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a PhD defense request (Demande de soutenance)
 */
@Entity
@Table(name = "soutenances")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Soutenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sujet;

    @Column(nullable = false, name = "titre_these")
    private String titreThese;

    @Column(nullable = false, name = "date_souhaitee")
    private LocalDate dateSouhaitee;

    @Column(name = "date_defense")
    private LocalDate dateDefense;

    @Column(name = "heure_defense")
    private LocalTime heureDefense;

    @Column(name = "salle_defense")
    private String salleDefense;

    @Column(nullable = false, name = "doctorant_id")
    private Long doctorantId;

    @Column(name = "doctorant_nom")
    private String doctorantNom;

    @Column(name = "doctorant_prenom")
    private String doctorantPrenom;

    @Column(name = "doctorant_email")
    private String doctorantEmail;

    @Column(nullable = false, name = "directeur_id")
    private Long directeurId;

    @Column(name = "directeur_nom")
    private String directeurNom;

    @Column(name = "directeur_email")
    private String directeurEmail;

    @Column(name = "admin_id")
    private Long adminId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutSoutenance statut = StatutSoutenance.SOUMISE;

    @Column(name = "commentaire_directeur", columnDefinition = "TEXT")
    private String commentaireDirecteur;

    @Column(name = "commentaire_admin", columnDefinition = "TEXT")
    private String commentaireAdmin;

    @Column(name = "autorisation_path")
    private String autorisationPath;

    @OneToMany(mappedBy = "soutenance", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Document> documents = new ArrayList<>();

    @OneToOne(mappedBy = "soutenance", cascade = CascadeType.ALL, orphanRemoval = true)
    private Jury jury;

    @OneToOne(mappedBy = "soutenance", cascade = CascadeType.ALL, orphanRemoval = true)
    private Prerequis prerequis;

    @CreationTimestamp
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @UpdateTimestamp
    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @Column(name = "date_validation_directeur")
    private LocalDateTime dateValidationDirecteur;

    @Column(name = "date_autorisation")
    private LocalDateTime dateAutorisation;

    // Enum for defense status
    public enum StatutSoutenance {
        SOUMISE,           // Submitted by student
        VALIDEE,           // Validated by director
        REJETEE,           // Rejected by director
        AUTORISEE,         // Authorized by admin
        PLANIFIEE,         // Defense scheduled
        TERMINEE           // Defense completed
    }

    // Helper methods
    public void addDocument(Document document) {
        documents.add(document);
        document.setSoutenance(this);
    }

    public void removeDocument(Document document) {
        documents.remove(document);
        document.setSoutenance(null);
    }

    public boolean isPrerequisValid() {
        return prerequis != null && prerequis.isValid();
    }

    public boolean canSubmit() {
        return isPrerequisValid() && statut == StatutSoutenance.SOUMISE;
    }

    public boolean canValidate() {
        return statut == StatutSoutenance.SOUMISE;
    }

    public boolean canAuthorize() {
        return statut == StatutSoutenance.VALIDEE;
    }
}
