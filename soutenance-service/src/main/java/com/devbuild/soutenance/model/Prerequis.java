package com.devbuild.soutenance.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "prerequis")
@Data
public class Prerequis {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "demande_id", nullable = false)
    @JsonBackReference("demande-prerequis")
    private DemandeSoutenance demande;
    
    // Publications
    private Integer nombrePublications = 0;
    
    private Integer nombrePublicationsRequises = 2;
    
    private Boolean publicationsValides = false;
    
    // Formation credits
    private Integer creditsFormation = 0;
    
    private Integer creditsFormationRequis = 30;
    
    private Boolean creditsValides = false;
    
    // Required documents checklist
    private Boolean demandeManuscrite = false;
    
    private Boolean rapportThese = false;
    
    private Boolean rapportAntiPlagiat = false;
    
    private Boolean rapportPublications = false;
    
    private Boolean attestationsFormation = false;
    
    private Boolean autorisationSoutenance = false;
    
    // Validation
    private Boolean prerequisValides = false;
    
    private String valideParAdmin;
    
    private java.time.LocalDateTime dateValidation;
    
    @Column(columnDefinition = "TEXT")
    private String commentaires;
}
