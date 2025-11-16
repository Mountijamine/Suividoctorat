package com.devbuild.soutenance.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_soutenance")
@Data
public class DocumentSoutenance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "demande_id", nullable = false)
    private DemandeSoutenance demande;
    
    @Column(nullable = false)
    private String nomFichier;
    
    @Column(nullable = false)
    private String cheminFichier;
    
    @Column(nullable = false)
    private String typeDocument; // DEMANDE_MANUSCRITE, RAPPORT_THESE, ANTI_PLAGIAT, etc.
    
    private Long tailleFichier;
    
    private String typeContenu; // MIME type
    
    private LocalDateTime dateUpload;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @PrePersist
    protected void onCreate() {
        dateUpload = LocalDateTime.now();
    }
}
