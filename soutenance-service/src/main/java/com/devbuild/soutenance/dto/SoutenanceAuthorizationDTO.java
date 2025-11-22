package com.devbuild.soutenance.dto;

import lombok.Data;

@Data
public class SoutenanceAuthorizationDTO {
    private String adminEmail;
    private String dateSoutenance; // ISO format
    private String lieu;
}
