package com.devbuild.gestionauth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/doctorants")
public class DoctorantController {

    public static class DoctorantDto {
        private Long id;
        private String nom;
        private String prenom;
        private String email;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    @GetMapping
    public List<DoctorantDto> list() {
        DoctorantDto d = new DoctorantDto();
        d.setId(1L); d.setNom("Dupont"); d.setPrenom("Jean"); d.setEmail("jean.dupont@example.com");
        return List.of(d);
    }
}
