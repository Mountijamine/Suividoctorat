package com.devbuild.soutenance.controller;

import com.devbuild.soutenance.model.*;
import com.devbuild.soutenance.service.SoutenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/soutenance")
@CrossOrigin(origins = "*")
public class SoutenanceController {
    
    private final SoutenanceService soutenanceService;
    
    public SoutenanceController(SoutenanceService soutenanceService) {
        this.soutenanceService = soutenanceService;
    }
    
    // Create new defense request
    @PostMapping("/demandes")
    public ResponseEntity<?> createDemande(@RequestBody Map<String, String> body) {
        try {
            String doctorantEmail = body.get("doctorantEmail");
            String directeurEmail = body.get("directeurEmail");
            String titreThese = body.get("titreThese");
            String resume = body.get("resume");
            
            DemandeSoutenance demande = soutenanceService.createDemande(doctorantEmail, directeurEmail, titreThese, resume);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Submit defense request
    @PostMapping("/demandes/{id}/submit")
    public ResponseEntity<?> submitDemande(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String doctorantEmail = body.get("doctorantEmail");
            DemandeSoutenance demande = soutenanceService.submitDemande(id, doctorantEmail);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get all requests (admin)
    @GetMapping("/demandes")
    public ResponseEntity<?> getAllDemandes(@RequestParam(required = false) String role,
                                           @RequestParam(required = false) String email) {
        try {
            List<DemandeSoutenance> demandes;
            
            if ("doctorant".equals(role) && email != null) {
                demandes = soutenanceService.getDemandesByDoctorant(email);
            } else if ("directeur".equals(role) && email != null) {
                demandes = soutenanceService.getDemandesByDirecteur(email);
            } else if ("jury".equals(role) && email != null) {
                demandes = soutenanceService.getDemandesByJuryMember(email);
            } else {
                demandes = soutenanceService.getAllDemandes();
            }
            
            return ResponseEntity.ok(demandes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get single request
    @GetMapping("/demandes/{id}")
    public ResponseEntity<?> getDemande(@PathVariable Long id) {
        try {
            DemandeSoutenance demande = soutenanceService.getDemande(id);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Update prerequis (doctorant)
    @PutMapping("/demandes/{id}/prerequis")
    public ResponseEntity<?> updatePrerequisDoctorant(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        try {
            Integer nbPublications = body.get("nombrePublications");
            Integer creditsFormation = body.get("creditsFormation");
            
            Prerequis prerequis = soutenanceService.updatePrerequisDoctorant(id, nbPublications, creditsFormation);
            return ResponseEntity.ok(prerequis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get prerequis
    @GetMapping("/demandes/{id}/prerequis")
    public ResponseEntity<?> getPrerequisByDemande(@PathVariable Long id) {
        try {
            Prerequis prerequis = soutenanceService.getPrerequisByDemande(id);
            return ResponseEntity.ok(prerequis);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Validate prerequis (admin)
    @PostMapping("/demandes/{id}/prerequis/validate")
    public ResponseEntity<?> validatePrerequisByAdmin(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            String adminEmail = (String) body.get("adminEmail");
            Boolean valide = (Boolean) body.get("valide");
            String commentaires = (String) body.get("commentaires");
            
            Prerequis prerequis = soutenanceService.validatePrerequisByAdmin(id, adminEmail, valide, commentaires);
            return ResponseEntity.ok(prerequis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Update document checklist
    @PostMapping("/demandes/{id}/prerequis/documents")
    public ResponseEntity<?> updateDocumentChecklist(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            String docType = (String) body.get("documentType");
            Boolean checked = (Boolean) body.get("checked");
            
            Prerequis prerequis = soutenanceService.updateDocumentChecklist(id, docType, checked);
            return ResponseEntity.ok(prerequis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Add jury member
    @PostMapping("/demandes/{id}/jury")
    public ResponseEntity<?> addJuryMember(@PathVariable Long id, @RequestBody MembreJury membre) {
        try {
            MembreJury saved = soutenanceService.addJuryMember(id, membre);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get jury members
    @GetMapping("/demandes/{id}/jury")
    public ResponseEntity<?> getJuryMembers(@PathVariable Long id) {
        try {
            List<MembreJury> membres = soutenanceService.getJuryMembers(id);
            return ResponseEntity.ok(membres);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Submit jury proposal
    @PostMapping("/demandes/{id}/jury/submit")
    public ResponseEntity<?> submitJuryProposal(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String directeurEmail = body.get("directeurEmail");
            DemandeSoutenance demande = soutenanceService.submitJuryProposal(id, directeurEmail);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Upload document
    @PostMapping("/demandes/{id}/documents")
    public ResponseEntity<?> uploadDocument(@PathVariable Long id,
                                           @RequestParam("file") MultipartFile file,
                                           @RequestParam("typeDocument") String typeDocument,
                                           @RequestParam(value = "description", required = false) String description) {
        try {
            DocumentSoutenance doc = soutenanceService.uploadDocument(id, file, typeDocument, description);
            return ResponseEntity.ok(doc);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get documents
    @GetMapping("/demandes/{id}/documents")
    public ResponseEntity<?> getDocuments(@PathVariable Long id) {
        try {
            List<DocumentSoutenance> documents = soutenanceService.getDocuments(id);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Authorize defense
    @PostMapping("/demandes/{id}/authorize")
    public ResponseEntity<?> authorizeSoutenance(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            String adminEmail = (String) body.get("adminEmail");
            String dateSoutenanceStr = (String) body.get("dateSoutenance");
            String lieu = (String) body.get("lieu");
            
            LocalDateTime dateSoutenance = LocalDateTime.parse(dateSoutenanceStr);
            
            DemandeSoutenance demande = soutenanceService.authorizeSoutenance(id, adminEmail, dateSoutenance, lieu);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Reject request
    @PostMapping("/demandes/{id}/reject")
    public ResponseEntity<?> rejectDemande(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String adminEmail = body.get("adminEmail");
            String raison = body.get("raison");
            
            DemandeSoutenance demande = soutenanceService.rejectDemande(id, adminEmail, raison);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Health check
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "soutenance-service"));
    }
}
