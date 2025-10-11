package com.devbuild.soutenance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for director validation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidationDirecteurDTO {

    @NotBlank(message = "L'action de validation est obligatoire")
    private String action; // "VALIDER" or "REJETER"

    private String commentaire;
    private JuryDTO jury;
}
