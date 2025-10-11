package com.devbuild.inscription.model;

import com.devbuild.inscription.model.enums.StatutDossier;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dossiers_inscription")
public class DossierInscription {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "doctorant_id")
	private Doctorant doctorant;

	private String sujetThese;
	private String directeurThese;
	private String coDirecteur;
	private String laboratoire;

	private LocalDateTime dateSoumission;

	@Enumerated(EnumType.STRING)
	private StatutDossier statut = StatutDossier.EN_ATTENTE;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "campagne_id")
	private CampagneInscription campagne;

	@OneToMany(mappedBy = "dossier", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<PieceJointe> pieces = new ArrayList<>();

	private boolean reinscription = false;

	// Opinion and validation fields
	private String avisDirecteur; // e.g., "Favorable" / "Défavorable" or free text
	private LocalDateTime dateAvisDirecteur;

	private String avisAdmin; // administrative validation notes
	private LocalDateTime dateValidationAdmin;

	public DossierInscription() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Doctorant getDoctorant() {
		return doctorant;
	}

	public void setDoctorant(Doctorant doctorant) {
		this.doctorant = doctorant;
	}

	public String getSujetThese() {
		return sujetThese;
	}

	public void setSujetThese(String sujetThese) {
		this.sujetThese = sujetThese;
	}

	public String getDirecteurThese() {
		return directeurThese;
	}

	public void setDirecteurThese(String directeurThese) {
		this.directeurThese = directeurThese;
	}

	public String getCoDirecteur() {
		return coDirecteur;
	}

	public void setCoDirecteur(String coDirecteur) {
		this.coDirecteur = coDirecteur;
	}

	public String getLaboratoire() {
		return laboratoire;
	}

	public void setLaboratoire(String laboratoire) {
		this.laboratoire = laboratoire;
	}

	public LocalDateTime getDateSoumission() {
		return dateSoumission;
	}

	public void setDateSoumission(LocalDateTime dateSoumission) {
		this.dateSoumission = dateSoumission;
	}

	public StatutDossier getStatut() {
		return statut;
	}

	public void setStatut(StatutDossier statut) {
		this.statut = statut;
	}

	public CampagneInscription getCampagne() {
		return campagne;
	}

	public void setCampagne(CampagneInscription campagne) {
		this.campagne = campagne;
	}

	public List<PieceJointe> getPieces() {
		return pieces;
	}

	public void setPieces(List<PieceJointe> pieces) {
		this.pieces = pieces;
	}

	public void addPiece(PieceJointe piece) {
		pieces.add(piece);
		piece.setDossier(this);
	}

	public void removePiece(PieceJointe piece) {
		pieces.remove(piece);
		piece.setDossier(null);
	}

	public boolean isReinscription() {
		return reinscription;
	}

	public void setReinscription(boolean reinscription) {
		this.reinscription = reinscription;
	}

	public String getAvisDirecteur() {
		return avisDirecteur;
	}

	public void setAvisDirecteur(String avisDirecteur) {
		this.avisDirecteur = avisDirecteur;
	}

	public LocalDateTime getDateAvisDirecteur() {
		return dateAvisDirecteur;
	}

	public void setDateAvisDirecteur(LocalDateTime dateAvisDirecteur) {
		this.dateAvisDirecteur = dateAvisDirecteur;
	}

	public String getAvisAdmin() {
		return avisAdmin;
	}

	public void setAvisAdmin(String avisAdmin) {
		this.avisAdmin = avisAdmin;
	}

	public LocalDateTime getDateValidationAdmin() {
		return dateValidationAdmin;
	}

	public void setDateValidationAdmin(LocalDateTime dateValidationAdmin) {
		this.dateValidationAdmin = dateValidationAdmin;
	}

}
