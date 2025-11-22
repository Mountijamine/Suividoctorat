package com.devbuild.soutenance.controller;

import com.devbuild.soutenance.dto.*;
import com.devbuild.soutenance.model.*;
import com.devbuild.soutenance.service.SoutenanceService;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<?> createDemande(@RequestBody DemandeCreationDTO dto) {
        try {
            DemandeSoutenance demande = soutenanceService.createDemande(
                dto.getDoctorantEmail(), 
                dto.getDirecteurEmail(), 
                dto.getTitreThese(), 
                dto.getResume()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(demande);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Update demande
    @PutMapping("/demandes/{id}")
    public ResponseEntity<?> updateDemande(@PathVariable Long id, @RequestBody DemandeCreationDTO dto) {
        try {
            DemandeSoutenance demande = soutenanceService.updateDemande(
                id, 
                dto.getDoctorantEmail(), 
                dto.getTitreThese(), 
                dto.getResume()
            );
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Delete demande
    @DeleteMapping("/demandes/{id}")
    public ResponseEntity<?> deleteDemande(@PathVariable Long id, @RequestParam String doctorantEmail) {
        try {
            soutenanceService.deleteDemande(id, doctorantEmail);
            return ResponseEntity.ok(Map.of("message", "Demande deleted successfully"));
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
    public ResponseEntity<?> updatePrerequisDoctorant(@PathVariable Long id, @RequestBody PrerequisUpdateDTO dto) {
        try {
            Prerequis prerequis = soutenanceService.updatePrerequisDoctorant(
                id, 
                dto.getNombrePublications(), 
                dto.getCreditsFormation()
            );
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
    public ResponseEntity<?> validatePrerequisByAdmin(@PathVariable Long id, @RequestBody PrerequisValidationDTO dto) {
        try {
            Prerequis prerequis = soutenanceService.validatePrerequisByAdmin(
                id, 
                dto.getAdminEmail(), 
                dto.getValide(), 
                dto.getCommentaires()
            );
            return ResponseEntity.ok(prerequis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Start verification (admin)
    @PostMapping("/demandes/{id}/start-verification")
    public ResponseEntity<?> startVerification(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String adminEmail = body.get("adminEmail");
            DemandeSoutenance demande = soutenanceService.startVerification(id, adminEmail);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Request jury proposal (admin)
    @PostMapping("/demandes/{id}/request-jury")
    public ResponseEntity<?> requestJuryProposal(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String adminEmail = body.get("adminEmail");
            DemandeSoutenance demande = soutenanceService.requestJuryProposal(id, adminEmail);
            return ResponseEntity.ok(demande);
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
    public ResponseEntity<?> addJuryMember(@PathVariable Long id, @RequestBody JuryMemberDTO dto) {
        try {
            MembreJury membre = new MembreJury();
            membre.setNom(dto.getNom());
            membre.setPrenom(dto.getPrenom());
            membre.setEmail(dto.getEmail());
            membre.setEtablissement(dto.getEtablissement());
            membre.setGrade(dto.getGrade());
            membre.setRole(dto.getRole());
            membre.setCommentaires(dto.getCommentaires());
            
            MembreJury saved = soutenanceService.addJuryMember(id, membre);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Delete jury member
    @DeleteMapping("/jury/{membreId}")
    public ResponseEntity<?> deleteJuryMember(@PathVariable Long membreId, @RequestParam String directeurEmail) {
        try {
            soutenanceService.deleteJuryMember(membreId, directeurEmail);
            return ResponseEntity.ok(Map.of("message", "Jury member deleted successfully"));
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
    
    // Validate jury (admin)
    @PostMapping("/demandes/{id}/jury/validate")
    public ResponseEntity<?> validateJury(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String adminEmail = body.get("adminEmail");
            DemandeSoutenance demande = soutenanceService.validateJury(id, adminEmail);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Submit rapporteur report
    @PostMapping("/jury/{membreId}/rapport")
    public ResponseEntity<?> submitRapporteurReport(
            @PathVariable Long membreId,
            @RequestParam("favorable") Boolean favorable,
            @RequestParam(value = "commentaires", required = false) String commentaires,
            @RequestParam(value = "rapport", required = false) MultipartFile rapportFile) {
        try {
            MembreJury membre = soutenanceService.submitRapporteurReport(membreId, favorable, commentaires, rapportFile);
            return ResponseEntity.ok(membre);
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
    public ResponseEntity<?> authorizeSoutenance(@PathVariable Long id, @RequestBody SoutenanceAuthorizationDTO dto) {
        try {
            LocalDateTime dateSoutenance = LocalDateTime.parse(dto.getDateSoutenance());
            DemandeSoutenance demande = soutenanceService.authorizeSoutenance(
                id, 
                dto.getAdminEmail(), 
                dateSoutenance, 
                dto.getLieu()
            );
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Plan defense
    @PostMapping("/demandes/{id}/plan")
    public ResponseEntity<?> planSoutenance(@PathVariable Long id) {
        try {
            DemandeSoutenance demande = soutenanceService.planSoutenance(id);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Complete defense
    @PostMapping("/demandes/{id}/complete")
    public ResponseEntity<?> completeSoutenance(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String adminEmail = body.get("adminEmail");
            DemandeSoutenance demande = soutenanceService.completeSoutenance(id, adminEmail);
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
    
    // Get statistics
    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {
        try {
            Map<String, Long> stats = soutenanceService.getStatistics();
            return ResponseEntity.ok(stats);
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
