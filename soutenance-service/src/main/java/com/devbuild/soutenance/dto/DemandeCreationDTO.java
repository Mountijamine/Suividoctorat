package com.devbuild.soutenance.dto;

import lombok.Data;

@Data
public class DemandeCreationDTO {
    private String doctorantEmail;
    private String directeurEmail;
    private String titreThese;
    private String resume;
}
