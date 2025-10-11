package com.devbuild.inscription.model;

import jakarta.persistence.*;


import java.time.LocalDateTime;

@Entity
@Table(name = "pieces_jointes")
public class PieceJointe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomFichier;
    private String typeMime;
    private long taille;
    private String cheminStockage; // path or URL to the stored file
    private LocalDateTime dateTeleversement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id")
    private DossierInscription dossier;

    public PieceJointe() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomFichier() {
        return nomFichier;
    }

    public void setNomFichier(String nomFichier) {
        this.nomFichier = nomFichier;
    }

    public String getTypeMime() {
        return typeMime;
    }

    public void setTypeMime(String typeMime) {
        this.typeMime = typeMime;
    }

    public long getTaille() {
        return taille;
    }

    public void setTaille(long taille) {
        this.taille = taille;
    }

    public String getCheminStockage() {
        return cheminStockage;
    }

    public void setCheminStockage(String cheminStockage) {
        this.cheminStockage = cheminStockage;
    }

    public LocalDateTime getDateTeleversement() {
        return dateTeleversement;
    }

    public void setDateTeleversement(LocalDateTime dateTeleversement) {
        this.dateTeleversement = dateTeleversement;
    }

    public DossierInscription getDossier() {
        return dossier;
    }

    public void setDossier(DossierInscription dossier) {
        this.dossier = dossier;
    }

}
