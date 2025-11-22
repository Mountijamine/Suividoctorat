package com.devbuild.soutenance.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "membre_jury")
@Data
public class MembreJury {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "demande_id", nullable = false)
    @JsonBackReference("demande-jury")
    private DemandeSoutenance demande;
    
    @Column(nullable = false)
    private String nom;
    
    @Column(nullable = false)
    private String prenom;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String etablissement;
    
    private String grade;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleJury role;
    
    // For rapporteurs
    private Boolean rapportSoumis = false;
    
    private Boolean rapportFavorable = false;
    
    private String cheminRapport;
    
    private java.time.LocalDateTime dateRapport;
    
    @Column(columnDefinition = "TEXT")
    private String commentaires;
}
