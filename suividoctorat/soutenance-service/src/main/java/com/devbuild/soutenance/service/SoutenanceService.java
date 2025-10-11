package com.devbuild.soutenance.service;

import com.devbuild.soutenance.dto.*;
import com.devbuild.soutenance.model.*;
import com.devbuild.soutenance.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing defense requests
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SoutenanceService {

    private final SoutenanceRepository soutenanceRepository;
    private final DocumentRepository documentRepository;
    private final JuryRepository juryRepository;
    private final PrerequisRepository prerequisRepository;
    private final DocumentStorageService documentStorageService;
    private final PdfGenerationService pdfGenerationService;
    private final NotificationService notificationService;
    private final SoutenanceMapper mapper;

    /**
     * Create a new defense request
     */
    public SoutenanceResponseDTO createSoutenance(SoutenanceRequestDTO requestDTO) {
        log.info("Creating new defense request for doctorant ID: {}", requestDTO.getDoctorantId());

        // Check if student already has an active defense request
        List<Soutenance.StatutSoutenance> activeStatuts = Arrays.asList(
            Soutenance.StatutSoutenance.SOUMISE,
            Soutenance.StatutSoutenance.VALIDEE,
            Soutenance.StatutSoutenance.AUTORISEE,
            Soutenance.StatutSoutenance.PLANIFIEE
        );

        if (soutenanceRepository.existsByDoctorantIdAndStatutIn(requestDTO.getDoctorantId(), activeStatuts)) {
            throw new IllegalStateException("Le doctorant a déjà une demande de soutenance en cours");
        }

        // Create soutenance entity
        Soutenance soutenance = mapper.toEntity(requestDTO);
        soutenance.setStatut(Soutenance.StatutSoutenance.SOUMISE);

        // Create and validate prerequis
        Prerequis prerequis = mapper.toEntity(requestDTO.getPrerequis());
        prerequis.validateAll();
        prerequis.setSoutenance(soutenance);
        soutenance.setPrerequis(prerequis);

        // Validate prerequisites before submission
        if (!prerequis.isValid()) {
            throw new IllegalStateException("Les prérequis ne sont pas satisfaits: " + prerequis.getValidationSummary());
        }

        // Save soutenance
        Soutenance savedSoutenance = soutenanceRepository.save(soutenance);

        // Send notification to director
        notificationService.notifyDirecteurNewDemande(savedSoutenance);

        log.info("Defense request created successfully with ID: {}", savedSoutenance.getId());
        return mapper.toDTO(savedSoutenance);
    }

    /**
     * Get defense by ID
     */
    @Transactional(readOnly = true)
    public SoutenanceResponseDTO getSoutenanceById(Long id) {
        Soutenance soutenance = soutenanceRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new EntityNotFoundException("Soutenance non trouvée avec l'ID: " + id));
        return mapper.toDTO(soutenance);
    }

    /**
     * Get all defenses for a student
     */
    @Transactional(readOnly = true)
    public List<SoutenanceResponseDTO> getSoutenancesByDoctorant(Long doctorantId) {
        List<Soutenance> soutenances = soutenanceRepository.findByDoctorantId(doctorantId);
        return soutenances.stream()
            .map(mapper::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get all defenses for a director
     */
    @Transactional(readOnly = true)
    public List<SoutenanceResponseDTO> getSoutenancesByDirecteur(Long directeurId) {
        List<Soutenance> soutenances = soutenanceRepository.findByDirecteurId(directeurId);
        return soutenances.stream()
            .map(mapper::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get all defenses by status
     */
    @Transactional(readOnly = true)
    public List<SoutenanceResponseDTO> getSoutenancesByStatut(Soutenance.StatutSoutenance statut) {
        List<Soutenance> soutenances = soutenanceRepository.findByStatut(statut);
        return soutenances.stream()
            .map(mapper::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Upload document for defense
     */
    public DocumentDTO uploadDocument(Long soutenanceId, Document.TypeDocument type, MultipartFile file) {
        log.info("Uploading document type {} for soutenance ID: {}", type, soutenanceId);

        Soutenance soutenance = soutenanceRepository.findById(soutenanceId)
            .orElseThrow(() -> new EntityNotFoundException("Soutenance non trouvée avec l'ID: " + soutenanceId));

        // Validate file format (PDF only)
        if (!file.getContentType().equals("application/pdf") && !file.getOriginalFilename().endsWith(".pdf")) {
            throw new IllegalArgumentException("Seuls les fichiers PDF sont acceptés");
        }

        // Store file
        String filePath = documentStorageService.storeFile(file, soutenanceId, type);

        // Create or update document
        Document document = documentRepository.findBySoutenanceIdAndType(soutenanceId, type)
            .orElse(new Document());

        document.setType(type);
        document.setNomFichier(file.getOriginalFilename());
        document.setCheminFichier(filePath);
        document.setTailleFichier(file.getSize());
        document.setFormatFichier(file.getContentType());
        document.setValide(true);
        document.setSoutenance(soutenance);

        Document savedDocument = documentRepository.save(document);

        // Update prerequis document validation
        updateDocumentValidation(soutenanceId);

        log.info("Document uploaded successfully with ID: {}", savedDocument.getId());
        return mapper.toDTO(savedDocument);
    }

    /**
     * Validate or reject defense by director
     */
    public SoutenanceResponseDTO validerParDirecteur(Long soutenanceId, ValidationDirecteurDTO validationDTO) {
        log.info("Director validating defense ID: {} with action: {}", soutenanceId, validationDTO.getAction());

        Soutenance soutenance = soutenanceRepository.findById(soutenanceId)
            .orElseThrow(() -> new EntityNotFoundException("Soutenance non trouvée avec l'ID: " + soutenanceId));

        if (!soutenance.canValidate()) {
            throw new IllegalStateException("Cette demande ne peut pas être validée dans son état actuel");
        }

        if ("VALIDER".equalsIgnoreCase(validationDTO.getAction())) {
            // Validate jury is provided
            if (validationDTO.getJury() == null) {
                throw new IllegalArgumentException("Le jury doit être proposé lors de la validation");
            }

            // Create jury
            Jury jury = mapper.toEntity(validationDTO.getJury());
            jury.setSoutenance(soutenance);
            soutenance.setJury(jury);

            soutenance.setStatut(Soutenance.StatutSoutenance.VALIDEE);
            soutenance.setDateValidationDirecteur(LocalDateTime.now());
            soutenance.setCommentaireDirecteur(validationDTO.getCommentaire());

            // Send notification to admin
            notificationService.notifyAdminValidationDirecteur(soutenance);

        } else if ("REJETER".equalsIgnoreCase(validationDTO.getAction())) {
            soutenance.setStatut(Soutenance.StatutSoutenance.REJETEE);
            soutenance.setCommentaireDirecteur(validationDTO.getCommentaire());

            // Send notification to student
            notificationService.notifyDoctorantRejet(soutenance);
        } else {
            throw new IllegalArgumentException("Action invalide: " + validationDTO.getAction());
        }

        Soutenance savedSoutenance = soutenanceRepository.save(soutenance);
        log.info("Defense validated/rejected successfully");
        return mapper.toDTO(savedSoutenance);
    }

    /**
     * Authorize defense by admin
     */
    public SoutenanceResponseDTO autoriserParAdmin(Long soutenanceId, AutorisationAdminDTO autorisationDTO) {
        log.info("Admin authorizing defense ID: {}", soutenanceId);

        Soutenance soutenance = soutenanceRepository.findById(soutenanceId)
            .orElseThrow(() -> new EntityNotFoundException("Soutenance non trouvée avec l'ID: " + soutenanceId));

        if (!soutenance.canAuthorize()) {
            throw new IllegalStateException("Cette demande ne peut pas être autorisée dans son état actuel");
        }

        // Set defense schedule
        soutenance.setDateDefense(autorisationDTO.getDateDefense());
        soutenance.setHeureDefense(autorisationDTO.getHeureDefense());
        soutenance.setSalleDefense(autorisationDTO.getSalleDefense());
        soutenance.setAdminId(autorisationDTO.getAdminId());
        soutenance.setCommentaireAdmin(autorisationDTO.getCommentaire());
        soutenance.setStatut(Soutenance.StatutSoutenance.AUTORISEE);
        soutenance.setDateAutorisation(LocalDateTime.now());

        Soutenance savedSoutenance = soutenanceRepository.save(soutenance);

        // Generate authorization PDF
        String pdfPath = pdfGenerationService.generateAutorisationPdf(savedSoutenance);
        savedSoutenance.setAutorisationPath(pdfPath);
        soutenanceRepository.save(savedSoutenance);

        // Send notifications
        notificationService.notifyDoctorantAutorisation(savedSoutenance);
        notificationService.notifyDirecteurAutorisation(savedSoutenance);

        log.info("Defense authorized successfully");
        return mapper.toDTO(savedSoutenance);
    }

    /**
     * Update document validation status
     */
    private void updateDocumentValidation(Long soutenanceId) {
        Prerequis prerequis = prerequisRepository.findBySoutenanceId(soutenanceId)
            .orElseThrow(() -> new EntityNotFoundException("Prerequis non trouvés"));

        // Check if all required documents are present
        boolean allDocsPresent = Arrays.stream(Document.TypeDocument.values())
            .filter(type -> type != Document.TypeDocument.AUTORISATION_SOUTENANCE)
            .allMatch(type -> documentRepository.existsBySoutenanceIdAndType(soutenanceId, type));

        prerequis.setDocumentsValide(allDocsPresent);
        prerequisRepository.save(prerequis);
    }

    /**
     * Delete defense (only if not yet validated)
     */
    public void deleteSoutenance(Long id) {
        Soutenance soutenance = soutenanceRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Soutenance non trouvée avec l'ID: " + id));

        if (soutenance.getStatut() != Soutenance.StatutSoutenance.SOUMISE) {
            throw new IllegalStateException("Seules les demandes non validées peuvent être supprimées");
        }

        soutenanceRepository.delete(soutenance);
        log.info("Defense deleted successfully: {}", id);
    }
}
