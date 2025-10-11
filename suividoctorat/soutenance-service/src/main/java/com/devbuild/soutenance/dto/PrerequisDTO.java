package com.devbuild.soutenance.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for prerequisites validation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrerequisDTO {

    @NotNull(message = "Le nombre d'articles est obligatoire")
    @Min(value = 0, message = "Le nombre d'articles doit être positif")
    private Integer nombreArticlesQ1Q2;

    @NotNull(message = "Le nombre de conférences est obligatoire")
    @Min(value = 0, message = "Le nombre de conférences doit être positif")
    private Integer nombreConferences;

    @NotNull(message = "Le nombre d'heures de formation est obligatoire")
    @Min(value = 0, message = "Le nombre d'heures doit être positif")
    private Integer heuresFormation;

    private Boolean articlesValide;
    private Boolean conferencesValide;
    private Boolean formationValide;
    private Boolean documentsValide;
    private String remarques;
    private Boolean isValid;
    private String validationSummary;
}
