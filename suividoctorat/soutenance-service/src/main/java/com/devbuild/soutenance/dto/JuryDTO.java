package com.devbuild.soutenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for jury information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JuryDTO {

    private Long id;

    @NotBlank(message = "Le nom du président est obligatoire")
    private String presidentNom;

    @NotBlank(message = "L'email du président est obligatoire")
    private String presidentEmail;

    @NotBlank(message = "L'institution du président est obligatoire")
    private String presidentInstitution;

    @NotEmpty(message = "Au moins 2 rapporteurs sont requis")
    private List<MembreJuryDTO> rapporteurs;

    @NotEmpty(message = "Au moins 2 examinateurs sont requis")
    private List<MembreJuryDTO> examinateurs;

    private String commentaires;
    private Boolean valide;
    private Boolean isComplete;
}
