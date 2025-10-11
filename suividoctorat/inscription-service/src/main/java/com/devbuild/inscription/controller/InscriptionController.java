package com.devbuild.inscription.controller;

import com.devbuild.inscription.model.DossierInscription;
import com.devbuild.inscription.model.PieceJointe;
import com.devbuild.inscription.service.InscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/inscriptions")
public class InscriptionController {

    private final InscriptionService service;

    public InscriptionController(InscriptionService service) {
        this.service = service;
    }

    @PostMapping("/doctorant/{id}/soumettre")
    public ResponseEntity<?> soumettre(@PathVariable("id") Long doctorantId, @RequestBody DossierInscription payload) {
        DossierInscription saved = service.soumettreDossier(doctorantId, payload);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/doctorant/{id}/reinscription")
    public ResponseEntity<?> reinscription(@PathVariable("id") Long doctorantId) {
        DossierInscription newDossier = service.reinscription(doctorantId);
        return ResponseEntity.ok(newDossier);
    }

    @PostMapping(value = "/dossier/{id}/upload", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadPiece(@PathVariable("id") Long dossierId, @RequestParam("file") MultipartFile file) throws IOException {
        PieceJointe piece = service.televerserPiece(dossierId, file);
        return ResponseEntity.ok(piece);
    }

    @GetMapping("/doctorant/{id}/dashboard")
    public ResponseEntity<?> dashboard(@PathVariable("id") Long doctorantId) {
        // For simplicity return list of dossiers (could be a DTO with status and latest updates)
        List<DossierInscription> dossiers = service.getDossiersForDoctorant(doctorantId);
        return ResponseEntity.ok(dossiers);
    }

    @PostMapping("/dossier/{id}/directeur/avis")
    public ResponseEntity<?> avisDirecteur(@PathVariable("id") Long dossierId, @RequestParam("avis") String avis) {
        DossierInscription updated = service.donnerAvisDirecteur(dossierId, avis);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/dossier/{id}/admin/valider")
    public ResponseEntity<?> validerAdmin(@PathVariable("id") Long dossierId, @RequestParam("valide") boolean valide, @RequestParam(value = "note", required = false) String note) {
        DossierInscription updated = service.validerParAdmin(dossierId, valide, note);
        return ResponseEntity.ok(updated);
    }

}
