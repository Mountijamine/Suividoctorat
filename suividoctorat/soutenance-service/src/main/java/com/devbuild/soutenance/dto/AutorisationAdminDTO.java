package com.devbuild.soutenance.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO for admin authorization
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AutorisationAdminDTO {

    @NotNull(message = "L'ID de l'administrateur est obligatoire")
    private Long adminId;

    @NotNull(message = "La date de soutenance est obligatoire")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDefense;

    @NotNull(message = "L'heure de soutenance est obligatoire")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime heureDefense;

    @NotBlank(message = "La salle de soutenance est obligatoire")
    private String salleDefense;

    private String commentaire;
}
