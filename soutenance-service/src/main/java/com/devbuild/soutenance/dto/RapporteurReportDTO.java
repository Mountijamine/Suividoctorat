package com.devbuild.soutenance.dto;

import lombok.Data;

@Data
public class RapporteurReportDTO {
    private Long membreJuryId;
    private Boolean rapportFavorable;
    private String commentaires;
}
