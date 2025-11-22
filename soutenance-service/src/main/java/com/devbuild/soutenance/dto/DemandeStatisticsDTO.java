package com.devbuild.soutenance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DemandeStatisticsDTO {
    private Long totalDemandes;
    private Long demandesBrouillon;
    private Long demandesSoumises;
    private Long demandesEnVerification;
    private Long demandesPrerequisValides;
    private Long demandesEnAttenteJury;
    private Long demandesJuryPropose;
    private Long demandesEnAttenteRapports;
    private Long demandesRapportsFavorables;
    private Long demandesAutorisees;
    private Long demandesPlanifiees;
    private Long demandesTerminees;
    private Long demandesRejetees;
    private Map<String, Long> demandesByStatut;
}
