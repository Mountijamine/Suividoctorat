package com.devbuild.soutenance.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "demande_soutenance")
@Data
public class DemandeSoutenance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String doctorantEmail;
    
    @Column(nullable = false)
    private String directeurEmail;
    
    @Column(nullable = false)
    private String titreThese;
    
    @Column(columnDefinition = "TEXT")
    private String resume;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutDemande statut = StatutDemande.BROUILLON;
    
    private LocalDateTime dateCreation;
    
    private LocalDateTime dateSoumission;
    
    private LocalDateTime dateAutorisation;
    
    // Defense scheduling
    private LocalDateTime dateSoutenance;
    
    private String lieuSoutenance;
    
    // Prerequisites
    @OneToOne(mappedBy = "demande", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("demande-prerequis")
    private Prerequis prerequis;
    
    // Jury members
    @OneToMany(mappedBy = "demande", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("demande-jury")
    private List<MembreJury> membresJury = new ArrayList<>();
    
    // Documents submitted
    @OneToMany(mappedBy = "demande", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("demande-documents")
    private List<DocumentSoutenance> documents = new ArrayList<>();
    
    // Comments and notes
    @Column(columnDefinition = "TEXT")
    private String commentairesAdmin;
    
    @Column(columnDefinition = "TEXT")
    private String raisonRejet;
    
    private String validePar;
    
    private String rejeteePar;
    
    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
