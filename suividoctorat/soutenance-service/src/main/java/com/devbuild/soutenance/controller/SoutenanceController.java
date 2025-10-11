package com.devbuild.soutenance.controller;

import com.devbuild.soutenance.dto.*;
import com.devbuild.soutenance.model.Document;
import com.devbuild.soutenance.model.Soutenance;
import com.devbuild.soutenance.service.SoutenanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST Controller for managing defense requests (soutenances)
 */
@RestController
@RequestMapping("/api/soutenances")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Soutenance", description = "API de gestion des soutenances de thèse")
@CrossOrigin(origins = "*")
public class SoutenanceController {

    private final SoutenanceService soutenanceService;

    @Operation(summary = "Créer une nouvelle demande de soutenance")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Demande créée avec succès",
            content = @Content(schema = @Schema(implementation = SoutenanceResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "409", description = "Le doctorant a déjà une demande en cours")
    })
    @PostMapping
    public ResponseEntity<SoutenanceResponseDTO> createSoutenance(
            @Valid @RequestBody SoutenanceRequestDTO requestDTO) {
        log.info("POST /api/soutenances - Creating new defense request");
        SoutenanceResponseDTO response = soutenanceService.createSoutenance(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Récupérer une soutenance par son ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Soutenance trouvée",
            content = @Content(schema = @Schema(implementation = SoutenanceResponseDTO.class))),
        @ApiResponse(responseCode = "404", description = "Soutenance non trouvée")
    })
    @GetMapping("/{id}")
    public ResponseEntity<SoutenanceResponseDTO> getSoutenanceById(
            @Parameter(description = "ID de la soutenance") @PathVariable Long id) {
        log.info("GET /api/soutenances/{} - Getting defense by ID", id);
        SoutenanceResponseDTO response = soutenanceService.getSoutenanceById(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Récupérer toutes les soutenances d'un doctorant")
    @ApiResponse(responseCode = "200", description = "Liste des soutenances")
    @GetMapping("/doctorant/{doctorantId}")
    public ResponseEntity<List<SoutenanceResponseDTO>> getSoutenancesByDoctorant(
            @Parameter(description = "ID du doctorant") @PathVariable Long doctorantId) {
        log.info("GET /api/soutenances/doctorant/{} - Getting defenses by student", doctorantId);
        List<SoutenanceResponseDTO> responses = soutenanceService.getSoutenancesByDoctorant(doctorantId);
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Récupérer toutes les soutenances d'un directeur")
    @ApiResponse(responseCode = "200", description = "Liste des soutenances")
    @GetMapping("/directeur/{directeurId}")
    public ResponseEntity<List<SoutenanceResponseDTO>> getSoutenancesByDirecteur(
            @Parameter(description = "ID du directeur") @PathVariable Long directeurId) {
        log.info("GET /api/soutenances/directeur/{} - Getting defenses by director", directeurId);
        List<SoutenanceResponseDTO> responses = soutenanceService.getSoutenancesByDirecteur(directeurId);
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Récupérer toutes les soutenances par statut")
    @ApiResponse(responseCode = "200", description = "Liste des soutenances")
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<SoutenanceResponseDTO>> getSoutenancesByStatut(
            @Parameter(description = "Statut de la soutenance") @PathVariable Soutenance.StatutSoutenance statut) {
        log.info("GET /api/soutenances/statut/{} - Getting defenses by status", statut);
        List<SoutenanceResponseDTO> responses = soutenanceService.getSoutenancesByStatut(statut);
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Uploader un document pour une soutenance")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Document uploadé avec succès",
            content = @Content(schema = @Schema(implementation = DocumentDTO.class))),
        @ApiResponse(responseCode = "400", description = "Fichier invalide (seuls les PDF sont acceptés)"),
        @ApiResponse(responseCode = "404", description = "Soutenance non trouvée")
    })
    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDTO> uploadDocument(
            @Parameter(description = "ID de la soutenance") @PathVariable Long id,
            @Parameter(description = "Type de document") @RequestParam Document.TypeDocument type,
            @Parameter(description = "Fichier PDF") @RequestParam("file") MultipartFile file) {
        log.info("POST /api/soutenances/{}/documents - Uploading document type: {}", id, type);
        DocumentDTO response = soutenanceService.uploadDocument(id, type, file);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Valider ou rejeter une soutenance (Directeur)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Validation effectuée avec succès",
            content = @Content(schema = @Schema(implementation = SoutenanceResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Données invalides ou action non autorisée"),
        @ApiResponse(responseCode = "404", description = "Soutenance non trouvée")
    })
    @PutMapping("/{id}/valider")
    public ResponseEntity<SoutenanceResponseDTO> validerParDirecteur(
            @Parameter(description = "ID de la soutenance") @PathVariable Long id,
            @Valid @RequestBody ValidationDirecteurDTO validationDTO) {
        log.info("PUT /api/soutenances/{}/valider - Director validation with action: {}", 
            id, validationDTO.getAction());
        SoutenanceResponseDTO response = soutenanceService.validerParDirecteur(id, validationDTO);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Autoriser une soutenance et planifier la date (Admin)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Autorisation accordée avec succès",
            content = @Content(schema = @Schema(implementation = SoutenanceResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Données invalides ou action non autorisée"),
        @ApiResponse(responseCode = "404", description = "Soutenance non trouvée")
    })
    @PutMapping("/{id}/autoriser")
    public ResponseEntity<SoutenanceResponseDTO> autoriserParAdmin(
            @Parameter(description = "ID de la soutenance") @PathVariable Long id,
            @Valid @RequestBody AutorisationAdminDTO autorisationDTO) {
        log.info("PUT /api/soutenances/{}/autoriser - Admin authorization", id);
        SoutenanceResponseDTO response = soutenanceService.autoriserParAdmin(id, autorisationDTO);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Supprimer une soutenance (uniquement si non validée)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Soutenance supprimée avec succès"),
        @ApiResponse(responseCode = "400", description = "La soutenance ne peut pas être supprimée"),
        @ApiResponse(responseCode = "404", description = "Soutenance non trouvée")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSoutenance(
            @Parameter(description = "ID de la soutenance") @PathVariable Long id) {
        log.info("DELETE /api/soutenances/{} - Deleting defense", id);
        soutenanceService.deleteSoutenance(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Health check de l'API")
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Soutenance API is running");
    }
}
