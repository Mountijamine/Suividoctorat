package com.devbuild.inscription.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctorants")
public class Doctorant {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String prenom;
	private String nom;
	private String email;
	private LocalDate dateNaissance;
	private String adresse;
	private String telephone;

	@OneToMany(mappedBy = "doctorant", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<DossierInscription> dossiers = new ArrayList<>();

	public Doctorant() {
	}

	public Doctorant(String prenom, String nom, String email) {
		this.prenom = prenom;
		this.nom = nom;
		this.email = email;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getPrenom() {
		return prenom;
	}

	public void setPrenom(String prenom) {
		this.prenom = prenom;
	}

	public String getNom() {
		return nom;
	}

	public void setNom(String nom) {
		this.nom = nom;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public LocalDate getDateNaissance() {
		return dateNaissance;
	}

	public void setDateNaissance(LocalDate dateNaissance) {
		this.dateNaissance = dateNaissance;
	}

	public String getAdresse() {
		return adresse;
	}

	public void setAdresse(String adresse) {
		this.adresse = adresse;
	}

	public String getTelephone() {
		return telephone;
	}

	public void setTelephone(String telephone) {
		this.telephone = telephone;
	}

	public List<DossierInscription> getDossiers() {
		return dossiers;
	}

	public void setDossiers(List<DossierInscription> dossiers) {
		this.dossiers = dossiers;
	}

	public void addDossier(DossierInscription dossier) {
		dossiers.add(dossier);
		dossier.setDoctorant(this);
	}

	public void removeDossier(DossierInscription dossier) {
		dossiers.remove(dossier);
		dossier.setDoctorant(null);
	}

	@Override
	public String toString() {
		return "Doctorant{" +
				"id=" + id +
				", prenom='" + prenom + '\'' +
				", nom='" + nom + '\'' +
				", email='" + email + '\'' +
				'}';
	}

}
