package com.devbuild.soutenance.dto;

import com.devbuild.soutenance.model.Soutenance;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * DTO for defense response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SoutenanceResponseDTO {

    private Long id;
    private String sujet;
    private String titreThese;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateSouhaitee;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDefense;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime heureDefense;
    
    private String salleDefense;
    private Long doctorantId;
    private String doctorantNom;
    private String doctorantPrenom;
    private String doctorantEmail;
    private Long directeurId;
    private String directeurNom;
    private String directeurEmail;
    private Long adminId;
    private Soutenance.StatutSoutenance statut;
    private String commentaireDirecteur;
    private String commentaireAdmin;
    private String autorisationPath;
    
    private List<DocumentDTO> documents;
    private JuryDTO jury;
    private PrerequisDTO prerequis;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateCreation;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateModification;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateValidationDirecteur;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateAutorisation;

    private Boolean canSubmit;
    private Boolean canValidate;
    private Boolean canAuthorize;
}
