package com.devbuild.soutenance.service;

import com.devbuild.soutenance.exception.BusinessRuleException;
import com.devbuild.soutenance.exception.ResourceNotFoundException;
import com.devbuild.soutenance.exception.UnauthorizedException;
import com.devbuild.soutenance.model.*;
import com.devbuild.soutenance.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SoutenanceService {
    
    private final DemandeRepository demandeRepository;
    private final PrerequisRepository prerequisRepository;
    private final MembreJuryRepository membreJuryRepository;
    private final DocumentSoutenanceRepository documentRepository;
    private final String uploadDir;
    
    public SoutenanceService(DemandeRepository demandeRepository,
                           PrerequisRepository prerequisRepository,
                           MembreJuryRepository membreJuryRepository,
                           DocumentSoutenanceRepository documentRepository,
                           org.springframework.core.env.Environment env) {
        this.demandeRepository = demandeRepository;
        this.prerequisRepository = prerequisRepository;
        this.membreJuryRepository = membreJuryRepository;
        this.documentRepository = documentRepository;
        this.uploadDir = env.getProperty("app.upload.dir", "./uploads/soutenance");
        
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }
    
    // Create a new defense request
    public DemandeSoutenance createDemande(String doctorantEmail, String directeurEmail, String titreThese, String resume) {
        System.out.println("=== Creating demande ===");
        System.out.println("Doctorant: " + doctorantEmail);
        System.out.println("Directeur: " + directeurEmail);
        System.out.println("Titre: " + titreThese);
        
        DemandeSoutenance demande = new DemandeSoutenance();
        demande.setDoctorantEmail(doctorantEmail);
        demande.setDirecteurEmail(directeurEmail);
        demande.setTitreThese(titreThese);
        demande.setResume(resume);
        demande.setStatut(StatutDemande.BROUILLON);
        demande.setDateCreation(LocalDateTime.now());
        
        System.out.println("Saving demande...");
        demande = demandeRepository.saveAndFlush(demande);
        System.out.println("Demande saved with ID: " + demande.getId());
        
        // Create associated prerequis
        Prerequis prerequis = new Prerequis();
        prerequis.setDemande(demande);
        prerequisRepository.saveAndFlush(prerequis);
        System.out.println("Prerequis created");
        
        return demande;
    }
    
    // Submit defense request
    public DemandeSoutenance submitDemande(Long demandeId, String doctorantEmail) {
        DemandeSoutenance demande = demandeRepository.findByIdAndDoctorantEmail(demandeId, doctorantEmail)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        if (demande.getStatut() != StatutDemande.BROUILLON) {
            throw new RuntimeException("Only draft requests can be submitted");
        }
        
        demande.setStatut(StatutDemande.SOUMISE);
        demande.setDateSoumission(LocalDateTime.now());
        
        return demandeRepository.save(demande);
    }
    
    // Update prerequis
    public Prerequis updatePrerequisDoctorant(Long demandeId, Integer nbPublications, Integer creditsFormation) {
        Prerequis prerequis = prerequisRepository.findByDemandeId(demandeId)
            .orElseThrow(() -> new RuntimeException("Prerequis not found"));
        
        prerequis.setNombrePublications(nbPublications);
        prerequis.setCreditsFormation(creditsFormation);
        
        return prerequisRepository.save(prerequis);
    }
    
    // Admin validates prerequisites
    public Prerequis validatePrerequisByAdmin(Long demandeId, String adminEmail, boolean valide, String commentaires) {
        Prerequis prerequis = prerequisRepository.findByDemandeId(demandeId)
            .orElseThrow(() -> new RuntimeException("Prerequis not found"));
        
        DemandeSoutenance demande = prerequis.getDemande();
        
        // Check publications
        boolean pubsOk = prerequis.getNombrePublications() >= prerequis.getNombrePublicationsRequises();
        prerequis.setPublicationsValides(pubsOk);
        
        // Check credits
        boolean creditsOk = prerequis.getCreditsFormation() >= prerequis.getCreditsFormationRequis();
        prerequis.setCreditsValides(creditsOk);
        
        // Check documents
        boolean docsOk = prerequis.getDemandeManuscrite() && 
                        prerequis.getRapportThese() && 
                        prerequis.getRapportAntiPlagiat() && 
                        prerequis.getRapportPublications() && 
                        prerequis.getAttestationsFormation();
        
        prerequis.setPrerequisValides(valide && pubsOk && creditsOk && docsOk);
        prerequis.setValideParAdmin(adminEmail);
        prerequis.setDateValidation(LocalDateTime.now());
        prerequis.setCommentaires(commentaires);
        
        if (prerequis.getPrerequisValides()) {
            demande.setStatut(StatutDemande.PREREQUIS_VALIDES);
        } else {
            demande.setStatut(StatutDemande.EN_VERIFICATION);
        }
        
        demandeRepository.save(demande);
        return prerequisRepository.save(prerequis);
    }
    
    // Add jury member (by directeur)
    public MembreJury addJuryMember(Long demandeId, MembreJury membre) {
        DemandeSoutenance demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        membre.setDemande(demande);
        return membreJuryRepository.save(membre);
    }
    
    // Submit jury proposal
    public DemandeSoutenance submitJuryProposal(Long demandeId, String directeurEmail) {
        DemandeSoutenance demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        if (!demande.getDirecteurEmail().equals(directeurEmail)) {
            throw new RuntimeException("Only the thesis director can submit jury proposal");
        }
        
        List<MembreJury> membres = membreJuryRepository.findByDemandeId(demandeId);
        if (membres.isEmpty()) {
            throw new RuntimeException("Cannot submit without jury members");
        }
        
        demande.setStatut(StatutDemande.JURY_PROPOSE);
        return demandeRepository.save(demande);
    }
    
    // Authorize defense
    public DemandeSoutenance authorizeSoutenance(Long demandeId, String adminEmail, LocalDateTime dateSoutenance, String lieu) {
        DemandeSoutenance demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        // Check if rapports are favorable
        List<MembreJury> rapporteurs = membreJuryRepository.findByDemandeId(demandeId)
            .stream()
            .filter(m -> m.getRole() == RoleJury.RAPPORTEUR)
            .toList();
        
        boolean allFavorable = rapporteurs.stream()
            .allMatch(r -> r.getRapportSoumis() && r.getRapportFavorable());
        
        if (!allFavorable) {
            throw new RuntimeException("All rapporteur reports must be favorable");
        }
        
        demande.setStatut(StatutDemande.AUTORISEE);
        demande.setDateAutorisation(LocalDateTime.now());
        demande.setDateSoutenance(dateSoutenance);
        demande.setLieuSoutenance(lieu);
        demande.setValidePar(adminEmail);
        
        return demandeRepository.save(demande);
    }
    
    // Upload document
    public DocumentSoutenance uploadDocument(Long demandeId, MultipartFile file, String typeDocument, String description) throws IOException {
        DemandeSoutenance demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir, filename);
        Files.write(path, file.getBytes());
        
        DocumentSoutenance doc = new DocumentSoutenance();
        doc.setDemande(demande);
        doc.setNomFichier(file.getOriginalFilename());
        doc.setCheminFichier(path.toString());
        doc.setTypeDocument(typeDocument);
        doc.setTailleFichier(file.getSize());
        doc.setTypeContenu(file.getContentType());
        doc.setDescription(description);
        
        // Update prerequis checklist
        Prerequis prerequis = prerequisRepository.findByDemandeId(demandeId).orElse(null);
        if (prerequis != null) {
            switch (typeDocument) {
                case "DEMANDE_MANUSCRITE" -> prerequis.setDemandeManuscrite(true);
                case "RAPPORT_THESE" -> prerequis.setRapportThese(true);
                case "ANTI_PLAGIAT" -> prerequis.setRapportAntiPlagiat(true);
                case "RAPPORT_PUBLICATIONS" -> prerequis.setRapportPublications(true);
                case "ATTESTATIONS_FORMATION" -> prerequis.setAttestationsFormation(true);
                case "AUTORISATION_SOUTENANCE" -> prerequis.setAutorisationSoutenance(true);
            }
            prerequisRepository.save(prerequis);
        }
        
        return documentRepository.save(doc);
    }
    
    // Get all requests (for admin)
    public List<DemandeSoutenance> getAllDemandes() {
        return demandeRepository.findAllWithDetails();
    }
    
    // Get requests by doctorant
    public List<DemandeSoutenance> getDemandesByDoctorant(String email) {
        return demandeRepository.findByDoctorantEmail(email);
    }
    
    // Get requests by directeur
    public List<DemandeSoutenance> getDemandesByDirecteur(String email) {
        return demandeRepository.findByDirecteurEmail(email);
    }
    
    // Get requests by jury member
    public List<DemandeSoutenance> getDemandesByJuryMember(String email) {
        return demandeRepository.findByJuryMemberEmail(email);
    }
    
    // Get single request
    public DemandeSoutenance getDemande(Long id) {
        return demandeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
    }
    
    // Get prerequis
    public Prerequis getPrerequisByDemande(Long demandeId) {
        return prerequisRepository.findByDemandeId(demandeId)
            .orElseThrow(() -> new RuntimeException("Prerequis not found"));
    }
    
    // Get jury members
    public List<MembreJury> getJuryMembers(Long demandeId) {
        return membreJuryRepository.findByDemandeId(demandeId);
    }
    
    // Get documents
    public List<DocumentSoutenance> getDocuments(Long demandeId) {
        return documentRepository.findByDemandeId(demandeId);
    }
    
    // Update document checklist
    public Prerequis updateDocumentChecklist(Long demandeId, String docType, boolean checked) {
        Prerequis prerequis = prerequisRepository.findByDemandeId(demandeId)
            .orElseThrow(() -> new RuntimeException("Prerequis not found"));
        
        switch (docType) {
            case "DEMANDE_MANUSCRITE" -> prerequis.setDemandeManuscrite(checked);
            case "RAPPORT_THESE" -> prerequis.setRapportThese(checked);
            case "ANTI_PLAGIAT" -> prerequis.setRapportAntiPlagiat(checked);
            case "RAPPORT_PUBLICATIONS" -> prerequis.setRapportPublications(checked);
            case "ATTESTATIONS_FORMATION" -> prerequis.setAttestationsFormation(checked);
            case "AUTORISATION_SOUTENANCE" -> prerequis.setAutorisationSoutenance(checked);
        }
        
        return prerequisRepository.save(prerequis);
    }
    
    // Reject request
    public DemandeSoutenance rejectDemande(Long demandeId, String adminEmail, String raison) {
        DemandeSoutenance demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        demande.setStatut(StatutDemande.REJETEE);
        demande.setRejeteePar(adminEmail);
        demande.setRaisonRejet(raison);
        
        return demandeRepository.save(demande);
    }
    
    // Submit rapporteur report
    public MembreJury submitRapporteurReport(Long membreJuryId, boolean favorable, String commentaires, MultipartFile rapportFile) throws IOException {
        MembreJury membre = membreJuryRepository.findById(membreJuryId)
            .orElseThrow(() -> new RuntimeException("Jury member not found"));
        
        if (membre.getRole() != RoleJury.RAPPORTEUR) {
            throw new RuntimeException("Only rapporteurs can submit reports");
        }
        
        // Save rapport file if provided
        if (rapportFile != null && !rapportFile.isEmpty()) {
            String filename = UUID.randomUUID() + "_rapport_" + rapportFile.getOriginalFilename();
            Path path = Paths.get(uploadDir, filename);
            Files.write(path, rapportFile.getBytes());
            membre.setCheminRapport(path.toString());
        }
        
        membre.setRapportSoumis(true);
        membre.setRapportFavorable(favorable);
        membre.setCommentaires(commentaires);
        membre.setDateRapport(LocalDateTime.now());
        
        // Check if all rapporteurs have submitted
        DemandeSoutenance demande = membre.getDemande();
        List<MembreJury> rapporteurs = membreJuryRepository.findByDemandeId(demande.getId())
            .stream()
            .filter(m -> m.getRole() == RoleJury.RAPPORTEUR)
            .toList();
        
        boolean allSubmitted = rapporteurs.stream().allMatch(MembreJury::getRapportSoumis);
        boolean allFavorable = rapporteurs.stream()
            .allMatch(r -> r.getRapportSoumis() && r.getRapportFavorable());
        
        if (allSubmitted) {
            if (allFavorable) {
                demande.setStatut(StatutDemande.RAPPORTS_FAVORABLES);
            } else {
                demande.setStatut(StatutDemande.EN_ATTENTE_RAPPORTS);
            }
            demandeRepository.save(demande);
        }
        
        return membreJuryRepository.save(membre);
    }
    
    // Update demande status
    public DemandeSoutenance updateStatut(Long demandeId, StatutDemande newStatut, String email) {
        DemandeSoutenance demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        demande.setStatut(newStatut);
        return demandeRepository.save(demande);
    }
    
    // Admin starts verification
    public DemandeSoutenance startVerification(Long demandeId, String adminEmail) {
        DemandeSoutenance demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        if (demande.getStatut() != StatutDemande.SOUMISE) {
            throw new RuntimeException("Only submitted requests can be verified");
        }
        
        demande.setStatut(StatutDemande.EN_VERIFICATION);
        return demandeRepository.save(demande);
    }
    
    // Request jury proposal from directeur
    public DemandeSoutenance requestJuryProposal(Long demandeId, String adminEmail) {
        DemandeSoutenance demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        if (demande.getStatut() != StatutDemande.PREREQUIS_VALIDES) {
            throw new RuntimeException("Prerequisites must be validated first");
        }
        
        demande.setStatut(StatutDemande.EN_ATTENTE_JURY);
        return demandeRepository.save(demande);
    }
    
    // Admin validates jury
    public DemandeSoutenance validateJury(Long demandeId, String adminEmail) {
        DemandeSoutenance demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        if (demande.getStatut() != StatutDemande.JURY_PROPOSE) {
            throw new RuntimeException("Jury must be proposed first");
        }
        
        List<MembreJury> membres = membreJuryRepository.findByDemandeId(demandeId);
        long nbRapporteurs = membres.stream().filter(m -> m.getRole() == RoleJury.RAPPORTEUR).count();
        
        if (nbRapporteurs < 2) {
            throw new RuntimeException("At least 2 rapporteurs are required");
        }
        
        demande.setStatut(StatutDemande.EN_ATTENTE_RAPPORTS);
        return demandeRepository.save(demande);
    }
    
    // Update demande details
    public DemandeSoutenance updateDemande(Long demandeId, String doctorantEmail, String titreThese, String resume) {
        DemandeSoutenance demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        if (!demande.getDoctorantEmail().equals(doctorantEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (demande.getStatut() != StatutDemande.BROUILLON) {
            throw new RuntimeException("Only draft requests can be edited");
        }
        
        if (titreThese != null) demande.setTitreThese(titreThese);
        if (resume != null) demande.setResume(resume);
        
        return demandeRepository.save(demande);
    }
    
    // Delete demande (only draft)
    public void deleteDemande(Long demandeId, String doctorantEmail) {
        DemandeSoutenance demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        if (!demande.getDoctorantEmail().equals(doctorantEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (demande.getStatut() != StatutDemande.BROUILLON) {
            throw new RuntimeException("Only draft requests can be deleted");
        }
        
        demandeRepository.delete(demande);
    }
    
    // Delete jury member
    public void deleteJuryMember(Long membreId, String directeurEmail) {
        MembreJury membre = membreJuryRepository.findById(membreId)
            .orElseThrow(() -> new RuntimeException("Jury member not found"));
        
        DemandeSoutenance demande = membre.getDemande();
        
        if (!demande.getDirecteurEmail().equals(directeurEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (demande.getStatut() != StatutDemande.EN_ATTENTE_JURY && 
            demande.getStatut() != StatutDemande.PREREQUIS_VALIDES) {
            throw new RuntimeException("Cannot modify jury at this stage");
        }
        
        membreJuryRepository.delete(membre);
    }
    
    // Get statistics
    public java.util.Map<String, Long> getStatistics() {
        List<DemandeSoutenance> all = demandeRepository.findAll();
        
        return java.util.Map.of(
            "total", (long) all.size(),
            "brouillon", all.stream().filter(d -> d.getStatut() == StatutDemande.BROUILLON).count(),
            "soumises", all.stream().filter(d -> d.getStatut() == StatutDemande.SOUMISE).count(),
            "en_verification", all.stream().filter(d -> d.getStatut() == StatutDemande.EN_VERIFICATION).count(),
            "prerequis_valides", all.stream().filter(d -> d.getStatut() == StatutDemande.PREREQUIS_VALIDES).count(),
            "en_attente_jury", all.stream().filter(d -> d.getStatut() == StatutDemande.EN_ATTENTE_JURY).count(),
            "jury_propose", all.stream().filter(d -> d.getStatut() == StatutDemande.JURY_PROPOSE).count(),
            "en_attente_rapports", all.stream().filter(d -> d.getStatut() == StatutDemande.EN_ATTENTE_RAPPORTS).count(),
            "rapports_favorables", all.stream().filter(d -> d.getStatut() == StatutDemande.RAPPORTS_FAVORABLES).count(),
            "autorisees", all.stream().filter(d -> d.getStatut() == StatutDemande.AUTORISEE).count(),
            "planifiees", all.stream().filter(d -> d.getStatut() == StatutDemande.PLANIFIEE).count(),
            "terminees", all.stream().filter(d -> d.getStatut() == StatutDemande.TERMINEE).count(),
            "rejetees", all.stream().filter(d -> d.getStatut() == StatutDemande.REJETEE).count()
        );
    }
    
    // Plan defense (set to PLANIFIEE status)
    public DemandeSoutenance planSoutenance(Long demandeId) {
        DemandeSoutenance demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        if (demande.getStatut() != StatutDemande.AUTORISEE) {
            throw new RuntimeException("Defense must be authorized first");
        }
        
        if (demande.getDateSoutenance() == null || demande.getLieuSoutenance() == null) {
            throw new RuntimeException("Date and location must be set");
        }
        
        demande.setStatut(StatutDemande.PLANIFIEE);
        return demandeRepository.save(demande);
    }
    
    // Mark defense as completed
    public DemandeSoutenance completeSoutenance(Long demandeId, String adminEmail) {
        DemandeSoutenance demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        if (demande.getStatut() != StatutDemande.PLANIFIEE) {
            throw new RuntimeException("Defense must be planned first");
        }
        
        demande.setStatut(StatutDemande.TERMINEE);
        return demandeRepository.save(demande);
    }
}
