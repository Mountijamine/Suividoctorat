package com.devbuild.soutenance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing the jury for a PhD defense
 */
@Entity
@Table(name = "jurys")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Jury {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soutenance_id", nullable = false)
    private Soutenance soutenance;

    @Column(name = "president_nom")
    private String presidentNom;

    @Column(name = "president_email")
    private String presidentEmail;

    @Column(name = "president_institution")
    private String presidentInstitution;

    @OneToMany(mappedBy = "jury", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MembreJury> rapporteurs = new ArrayList<>();

    @OneToMany(mappedBy = "jury", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MembreJury> examinateurs = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String commentaires;

    @Column(nullable = false)
    private Boolean valide = false;

    // Helper methods
    public void addRapporteur(MembreJury rapporteur) {
        rapporteur.setTypeRole(MembreJury.RoleJury.RAPPORTEUR);
        rapporteurs.add(rapporteur);
        rapporteur.setJury(this);
    }

    public void addExaminateur(MembreJury examinateur) {
        examinateur.setTypeRole(MembreJury.RoleJury.EXAMINATEUR);
        examinateurs.add(examinateur);
        examinateur.setJury(this);
    }

    public boolean isComplete() {
        return presidentNom != null && !presidentNom.isEmpty() &&
               rapporteurs.size() >= 2 &&
               examinateurs.size() >= 2;
    }
}
