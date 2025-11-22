package com.devbuild.gestionauth.controller;

import com.devbuild.gestionauth.model.Document;
import com.devbuild.gestionauth.model.Role;
import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.service.DocumentService;
import com.devbuild.gestionauth.service.UserService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Controller
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final UserService userService;

    public DocumentController(DocumentService documentService, UserService userService) {
        this.documentService = documentService;
        this.userService = userService;
    }

    // Candidate: upload a document
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
                                     @RequestParam(name = "title", required = false) String title,
                                     @RequestParam(name = "category", required = false) String category,
                                     @RequestParam(name = "note", required = false) String note,
                                     java.security.Principal principal) throws Exception {
        if (principal == null) return ResponseEntity.status(401).body("Not authenticated");
        String email = principal.getName();
        User u = userService.findByEmail(email).orElseThrow();
    Document d = documentService.store(u, file, title, category, note);
        return ResponseEntity.ok(d);
    }

    // Candidate: list my documents
    @GetMapping("/me")
    @ResponseBody
    public ResponseEntity<?> myDocs(java.security.Principal principal,
                                    @RequestParam(name = "page", required = false, defaultValue = "0") int page,
                                    @RequestParam(name = "size", required = false, defaultValue = "20") int size) {
        if (principal == null) return ResponseEntity.status(401).body("Not authenticated");
        User u = userService.findByEmail(principal.getName()).orElseThrow();
        org.springframework.data.domain.Page<Document> docs = documentService.listFor(u, org.springframework.data.domain.PageRequest.of(page, size));
        return ResponseEntity.ok(docs);
    }

    // Download document by id (owner or admin)
    @GetMapping("/download/{id}")
    public ResponseEntity<?> download(@PathVariable("id") Long id, java.security.Principal principal) {
    Document d = documentService.findById(id).orElse(null);
        if (d == null) return ResponseEntity.notFound().build();
        User requesting = userService.findByEmail(principal.getName()).orElseThrow();
        boolean isAdmin = requesting.getRoles().stream().anyMatch(r -> r.name().equals("ROLE_ADMIN"));
        boolean owner = d.getOwner().getId().equals(requesting.getId());
        if (!isAdmin && !owner) return ResponseEntity.status(403).body("Forbidden");
        FileSystemResource fsr = new FileSystemResource(d.getPath());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + d.getOriginalFilename() + "\"")
                .contentLength(new java.io.File(d.getPath()).length())
                .contentType(MediaType.parseMediaType(d.getContentType() == null ? "application/octet-stream" : d.getContentType()))
                .body(fsr);
    }

    // Admin: list all documents
    @GetMapping("/all")
    @ResponseBody
    public ResponseEntity<?> all(java.security.Principal principal) {
        User requesting = userService.findByEmail(principal.getName()).orElseThrow();
        boolean isAdmin = requesting.getRoles().stream().anyMatch(r -> r.name().equals("ROLE_ADMIN"));
        if (!isAdmin) return ResponseEntity.status(403).body("Forbidden");
        return ResponseEntity.ok(documentService.findAll());
    }

    // Encadrant: list documents of candidates from the same affiliation (simple heuristic)
    @GetMapping("/for-encadrant")
    @ResponseBody
    public ResponseEntity<?> forEncadrant(java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body("Not authenticated");
        User enc = userService.findByEmail(principal.getName()).orElseThrow();
        boolean isEnc = enc.getRoles().stream().anyMatch(r -> r.name().equals("ROLE_ENCADRANT"));
        if (!isEnc) return ResponseEntity.status(403).body("Forbidden");
        String affiliation = enc.getAffiliation();
        if (affiliation == null) return ResponseEntity.ok(java.util.Collections.emptyList());
        return ResponseEntity.ok(documentService.findByOwnerAffiliation(affiliation));
    }
}
