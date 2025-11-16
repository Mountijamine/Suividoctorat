package com.devbuild.soutenance.service;

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
        DemandeSoutenance demande = new DemandeSoutenance();
        demande.setDoctorantEmail(doctorantEmail);
        demande.setDirecteurEmail(directeurEmail);
        demande.setTitreThese(titreThese);
        demande.setResume(resume);
        demande.setStatut(StatutDemande.BROUILLON);
        
        demande = demandeRepository.save(demande);
        
        // Create associated prerequis
        Prerequis prerequis = new Prerequis();
        prerequis.setDemande(demande);
        prerequisRepository.save(prerequis);
        
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
        return demandeRepository.findAll();
    }
    
    // Get requests by doctorant
    public List<DemandeSoutenance> getDemandesByDoctorant(String email) {
        return demandeRepository.findByDoctorantEmail(email);
    }
    
    // Get requests by directeur
    public List<DemandeSoutenance> getDemandesByDirecteur(String email) {
        return demandeRepository.findByDirecteurEmail(email);
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
}
