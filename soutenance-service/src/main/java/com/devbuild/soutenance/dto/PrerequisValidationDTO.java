package com.devbuild.soutenance.dto;

import lombok.Data;

@Data
public class PrerequisValidationDTO {
    private String adminEmail;
    private Boolean valide;
    private String commentaires;
}
