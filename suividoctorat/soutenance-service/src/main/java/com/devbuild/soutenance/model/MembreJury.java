package com.devbuild.soutenance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a jury member (rapporteur or examinateur)
 */
@Entity
@Table(name = "membres_jury")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MembreJury {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String institution;

    @Column(nullable = false)
    private String grade;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_role", nullable = false)
    private RoleJury typeRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jury_id", nullable = false)
    private Jury jury;

    @Column(name = "rapport_path")
    private String rapportPath;

    @Column(name = "rapport_favorable")
    private Boolean rapportFavorable;

    public enum RoleJury {
        RAPPORTEUR,
        EXAMINATEUR
    }
}
