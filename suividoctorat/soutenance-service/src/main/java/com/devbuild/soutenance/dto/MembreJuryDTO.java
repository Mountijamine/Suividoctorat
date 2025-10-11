package com.devbuild.soutenance.dto;

import com.devbuild.soutenance.model.MembreJury;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for jury member information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MembreJuryDTO {

    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    private String email;

    @NotBlank(message = "L'institution est obligatoire")
    private String institution;

    @NotBlank(message = "Le grade est obligatoire")
    private String grade;

    private MembreJury.RoleJury typeRole;
    private String rapportPath;
    private Boolean rapportFavorable;
}
