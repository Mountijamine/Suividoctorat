package com.devbuild.soutenance.service;

import com.devbuild.soutenance.dto.*;
import com.devbuild.soutenance.model.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper between entities and DTOs
 */
@Component
public class SoutenanceMapper {

    public Soutenance toEntity(SoutenanceRequestDTO dto) {
        Soutenance soutenance = new Soutenance();
        soutenance.setSujet(dto.getSujet());
        soutenance.setTitreThese(dto.getTitreThese());
        soutenance.setDateSouhaitee(dto.getDateSouhaitee());
        soutenance.setDoctorantId(dto.getDoctorantId());
        soutenance.setDoctorantNom(dto.getDoctorantNom());
        soutenance.setDoctorantPrenom(dto.getDoctorantPrenom());
        soutenance.setDoctorantEmail(dto.getDoctorantEmail());
        soutenance.setDirecteurId(dto.getDirecteurId());
        soutenance.setDirecteurNom(dto.getDirecteurNom());
        soutenance.setDirecteurEmail(dto.getDirecteurEmail());
        return soutenance;
    }

    public SoutenanceResponseDTO toDTO(Soutenance soutenance) {
        SoutenanceResponseDTO dto = new SoutenanceResponseDTO();
        dto.setId(soutenance.getId());
        dto.setSujet(soutenance.getSujet());
        dto.setTitreThese(soutenance.getTitreThese());
        dto.setDateSouhaitee(soutenance.getDateSouhaitee());
        dto.setDateDefense(soutenance.getDateDefense());
        dto.setHeureDefense(soutenance.getHeureDefense());
        dto.setSalleDefense(soutenance.getSalleDefense());
        dto.setDoctorantId(soutenance.getDoctorantId());
        dto.setDoctorantNom(soutenance.getDoctorantNom());
        dto.setDoctorantPrenom(soutenance.getDoctorantPrenom());
        dto.setDoctorantEmail(soutenance.getDoctorantEmail());
        dto.setDirecteurId(soutenance.getDirecteurId());
        dto.setDirecteurNom(soutenance.getDirecteurNom());
        dto.setDirecteurEmail(soutenance.getDirecteurEmail());
        dto.setAdminId(soutenance.getAdminId());
        dto.setStatut(soutenance.getStatut());
        dto.setCommentaireDirecteur(soutenance.getCommentaireDirecteur());
        dto.setCommentaireAdmin(soutenance.getCommentaireAdmin());
        dto.setAutorisationPath(soutenance.getAutorisationPath());
        dto.setDateCreation(soutenance.getDateCreation());
        dto.setDateModification(soutenance.getDateModification());
        dto.setDateValidationDirecteur(soutenance.getDateValidationDirecteur());
        dto.setDateAutorisation(soutenance.getDateAutorisation());
        dto.setCanSubmit(soutenance.canSubmit());
        dto.setCanValidate(soutenance.canValidate());
        dto.setCanAuthorize(soutenance.canAuthorize());

        if (soutenance.getDocuments() != null) {
            dto.setDocuments(soutenance.getDocuments().stream()
                .map(this::toDTO)
                .collect(Collectors.toList()));
        }

        if (soutenance.getJury() != null) {
            dto.setJury(toDTO(soutenance.getJury()));
        }

        if (soutenance.getPrerequis() != null) {
            dto.setPrerequis(toDTO(soutenance.getPrerequis()));
        }

        return dto;
    }

    public DocumentDTO toDTO(Document document) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(document.getId());
        dto.setType(document.getType());
        dto.setNomFichier(document.getNomFichier());
        dto.setCheminFichier(document.getCheminFichier());
        dto.setTailleFichier(document.getTailleFichier());
        dto.setFormatFichier(document.getFormatFichier());
        dto.setValide(document.getValide());
        dto.setDateUpload(document.getDateUpload());
        return dto;
    }

    public Prerequis toEntity(PrerequisDTO dto) {
        Prerequis prerequis = new Prerequis();
        prerequis.setNombreArticlesQ1Q2(dto.getNombreArticlesQ1Q2());
        prerequis.setNombreConferences(dto.getNombreConferences());
        prerequis.setHeuresFormation(dto.getHeuresFormation());
        prerequis.setRemarques(dto.getRemarques());
        return prerequis;
    }

    public PrerequisDTO toDTO(Prerequis prerequis) {
        PrerequisDTO dto = new PrerequisDTO();
        dto.setNombreArticlesQ1Q2(prerequis.getNombreArticlesQ1Q2());
        dto.setNombreConferences(prerequis.getNombreConferences());
        dto.setHeuresFormation(prerequis.getHeuresFormation());
        dto.setArticlesValide(prerequis.getArticlesValide());
        dto.setConferencesValide(prerequis.getConferencesValide());
        dto.setFormationValide(prerequis.getFormationValide());
        dto.setDocumentsValide(prerequis.getDocumentsValide());
        dto.setRemarques(prerequis.getRemarques());
        dto.setIsValid(prerequis.isValid());
        dto.setValidationSummary(prerequis.getValidationSummary());
        return dto;
    }

    public Jury toEntity(JuryDTO dto) {
        Jury jury = new Jury();
        jury.setPresidentNom(dto.getPresidentNom());
        jury.setPresidentEmail(dto.getPresidentEmail());
        jury.setPresidentInstitution(dto.getPresidentInstitution());
        jury.setCommentaires(dto.getCommentaires());
        jury.setValide(dto.getValide() != null ? dto.getValide() : false);

        if (dto.getRapporteurs() != null) {
            jury.setRapporteurs(dto.getRapporteurs().stream()
                .map(this::toEntity)
                .collect(Collectors.toList()));
            jury.getRapporteurs().forEach(r -> r.setJury(jury));
        }

        if (dto.getExaminateurs() != null) {
            jury.setExaminateurs(dto.getExaminateurs().stream()
                .map(this::toEntity)
                .collect(Collectors.toList()));
            jury.getExaminateurs().forEach(e -> e.setJury(jury));
        }

        return jury;
    }

    public JuryDTO toDTO(Jury jury) {
        JuryDTO dto = new JuryDTO();
        dto.setId(jury.getId());
        dto.setPresidentNom(jury.getPresidentNom());
        dto.setPresidentEmail(jury.getPresidentEmail());
        dto.setPresidentInstitution(jury.getPresidentInstitution());
        dto.setCommentaires(jury.getCommentaires());
        dto.setValide(jury.getValide());
        dto.setIsComplete(jury.isComplete());

        if (jury.getRapporteurs() != null) {
            dto.setRapporteurs(jury.getRapporteurs().stream()
                .map(this::toDTO)
                .collect(Collectors.toList()));
        }

        if (jury.getExaminateurs() != null) {
            dto.setExaminateurs(jury.getExaminateurs().stream()
                .map(this::toDTO)
                .collect(Collectors.toList()));
        }

        return dto;
    }

    public MembreJury toEntity(MembreJuryDTO dto) {
        MembreJury membre = new MembreJury();
        membre.setNom(dto.getNom());
        membre.setPrenom(dto.getPrenom());
        membre.setEmail(dto.getEmail());
        membre.setInstitution(dto.getInstitution());
        membre.setGrade(dto.getGrade());
        membre.setTypeRole(dto.getTypeRole());
        membre.setRapportPath(dto.getRapportPath());
        membre.setRapportFavorable(dto.getRapportFavorable());
        return membre;
    }

    public MembreJuryDTO toDTO(MembreJury membre) {
        MembreJuryDTO dto = new MembreJuryDTO();
        dto.setId(membre.getId());
        dto.setNom(membre.getNom());
        dto.setPrenom(membre.getPrenom());
        dto.setEmail(membre.getEmail());
        dto.setInstitution(membre.getInstitution());
        dto.setGrade(membre.getGrade());
        dto.setTypeRole(membre.getTypeRole());
        dto.setRapportPath(membre.getRapportPath());
        dto.setRapportFavorable(membre.getRapportFavorable());
        return dto;
    }
}
