package com.devbuild.inscription.controller;

import com.devbuild.inscription.model.CampagneInscription;
import com.devbuild.inscription.repository.CampagneInscriptionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/campagnes")
public class AdminCampagneController {

    private final CampagneInscriptionRepository repo;

    public AdminCampagneController(CampagneInscriptionRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CampagneInscription campagne) {
        CampagneInscription saved = repo.save(campagne);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<CampagneInscription>> list() {
        return ResponseEntity.ok(repo.findAll());
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable("id") Long id) {
        CampagneInscription c = repo.findById(id).orElseThrow();
        c.setActive(!c.isActive());
        repo.save(c);
        return ResponseEntity.ok(c);
    }

}
