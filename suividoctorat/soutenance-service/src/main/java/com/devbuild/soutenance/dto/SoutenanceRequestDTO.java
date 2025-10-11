package com.devbuild.soutenance.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for creating a new defense request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SoutenanceRequestDTO {

    @NotBlank(message = "Le sujet est obligatoire")
    @Size(min = 10, max = 500, message = "Le sujet doit contenir entre 10 et 500 caractères")
    private String sujet;

    @NotBlank(message = "Le titre de la thèse est obligatoire")
    @Size(min = 10, max = 500, message = "Le titre doit contenir entre 10 et 500 caractères")
    private String titreThese;

    @NotNull(message = "La date souhaitée est obligatoire")
    @Future(message = "La date souhaitée doit être dans le futur")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateSouhaitee;

    @NotNull(message = "L'ID du doctorant est obligatoire")
    private Long doctorantId;

    @NotBlank(message = "Le nom du doctorant est obligatoire")
    private String doctorantNom;

    @NotBlank(message = "Le prénom du doctorant est obligatoire")
    private String doctorantPrenom;

    @NotBlank(message = "L'email du doctorant est obligatoire")
    @Email(message = "L'email du doctorant doit être valide")
    private String doctorantEmail;

    @NotNull(message = "L'ID du directeur est obligatoire")
    private Long directeurId;

    @NotBlank(message = "Le nom du directeur est obligatoire")
    private String directeurNom;

    @NotBlank(message = "L'email du directeur est obligatoire")
    @Email(message = "L'email du directeur doit être valide")
    private String directeurEmail;

    @NotNull(message = "Les prérequis sont obligatoires")
    private PrerequisDTO prerequis;
}
