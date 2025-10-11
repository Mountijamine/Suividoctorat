package com.devbuild.inscription.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "campagnes_inscription")
public class CampagneInscription {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String nom;
	private LocalDate dateOuverture;
	private LocalDate dateFermeture;
	private boolean active = true;

	@OneToMany(mappedBy = "campagne", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<DossierInscription> dossiers = new ArrayList<>();

	public CampagneInscription() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNom() {
		return nom;
	}

	public void setNom(String nom) {
		this.nom = nom;
	}

	public LocalDate getDateOuverture() {
		return dateOuverture;
	}

	public void setDateOuverture(LocalDate dateOuverture) {
		this.dateOuverture = dateOuverture;
	}

	public LocalDate getDateFermeture() {
		return dateFermeture;
	}

	public void setDateFermeture(LocalDate dateFermeture) {
		this.dateFermeture = dateFermeture;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public List<DossierInscription> getDossiers() {
		return dossiers;
	}

	public void setDossiers(List<DossierInscription> dossiers) {
		this.dossiers = dossiers;
	}

	public void addDossier(DossierInscription dossier) {
		dossiers.add(dossier);
		dossier.setCampagne(this);
	}

	public void removeDossier(DossierInscription dossier) {
		dossiers.remove(dossier);
		dossier.setCampagne(null);
	}

}
