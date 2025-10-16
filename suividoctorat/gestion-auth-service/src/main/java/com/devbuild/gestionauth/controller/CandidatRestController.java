package com.devbuild.gestionauth.controller;

import com.devbuild.gestionauth.model.Document;
import com.devbuild.gestionauth.service.DocumentService;
import com.devbuild.gestionauth.service.UserService;
import com.devbuild.gestionauth.model.User;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/candidat")
public class CandidatRestController {

    private final DocumentService documentService;
    private final UserService userService;

    public CandidatRestController(DocumentService documentService, UserService userService) {
        this.documentService = documentService;
        this.userService = userService;
    }

    @GetMapping("/documents")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> listDocuments(@RequestParam Map<String,String> params, java.security.Principal principal) {
        int page = Integer.parseInt(params.getOrDefault("page","0"));
        int size = Integer.parseInt(params.getOrDefault("size","20"));
        String q = params.getOrDefault("q", "");
        // DocumentService provides Page<Document> for a user
    org.springframework.data.domain.Page<com.devbuild.gestionauth.model.Document> p = documentService.listForUser(principal.getName(), q, page, size);
    // map entities to plain DTOs (avoid sending Hibernate proxies to Jackson)
    java.util.List<java.util.Map<String,Object>> content = p.getContent().stream().map(d -> {
        java.util.Map<String,Object> m = new java.util.HashMap<>();
        m.put("id", d.getId());
        m.put("title", d.getTitle() != null ? d.getTitle() : d.getOriginalFilename());
        m.put("category", d.getCategory());
        m.put("originalFilename", d.getOriginalFilename());
        m.put("uploadedAt", d.getUploadedAt());
        m.put("contentType", d.getContentType());
        m.put("ownerEmail", d.getOwner() != null ? d.getOwner().getEmail() : null);
        return m;
    }).collect(java.util.stream.Collectors.toList());
    Map<String,Object> resp = Map.of(
        "content", content,
        "totalPages", p.getTotalPages(),
        "totalElements", p.getTotalElements(),
        "number", p.getNumber()
    );
    return ResponseEntity.ok(resp);
    }

    @PostMapping(value = "/documents/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> upload(@RequestPart("file") MultipartFile file,
                                    @RequestPart(name = "title", required = false) String title,
                                    @RequestPart(name = "category", required = false) String category,
                                    java.security.Principal principal) throws Exception {
        // find User entity for owner
        java.util.Optional<User> opt = userService.findByEmail(principal.getName());
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message","user not found"));
        User owner = opt.get();
    com.devbuild.gestionauth.model.Document d = documentService.store(owner, file, title, category);
        return ResponseEntity.ok(d);
    }

    @GetMapping("/documents/download/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> download(@PathVariable("id") Long id, java.security.Principal principal) throws Exception {
        Resource res = documentService.loadAsResource(id, principal.getName());
        String filename = res.getFilename();
        String header = "attachment; filename=\"" + URLEncoder.encode(filename, StandardCharsets.UTF_8) + "\"";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, header)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(res);
    }

    @GetMapping("/documents/export")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> exportCsv(@RequestParam(name = "q", required = false) String q,
                                       @RequestParam(name = "category", required = false) String category,
                                       java.security.Principal principal) {
        try {
            java.util.List<Document> docs = documentService.findForUserAll(principal.getName(), q == null ? "" : q, category);
            // build CSV
            StringBuilder sb = new StringBuilder();
            sb.append("id,title,category,originalFilename,uploadedAt,contentType,ownerEmail\n");
                        java.util.function.Function<String,String> esc = s -> s == null ? "" : s.replace("\"", "\"\"");
                        for (Document d : docs) {
                                String title = d.getTitle() == null ? d.getOriginalFilename() : d.getTitle();
                                String cat = d.getCategory() == null ? "" : d.getCategory();
                                String orig = d.getOriginalFilename() == null ? "" : d.getOriginalFilename();
                                String uploaded = d.getUploadedAt() == null ? "" : d.getUploadedAt().toString();
                                String ct = d.getContentType() == null ? "" : d.getContentType();
                                String owner = "";
                                try { owner = d.getOwner() == null ? "" : d.getOwner().getEmail(); } catch(Exception ex) { owner = ""; }
                                sb.append(d.getId()).append(',')
                                    .append('"').append(esc.apply(title)).append('"').append(',')
                                    .append('"').append(esc.apply(cat)).append('"').append(',')
                                    .append('"').append(esc.apply(orig)).append('"').append(',')
                                    .append('"').append(esc.apply(uploaded)).append('"').append(',')
                                    .append('"').append(esc.apply(ct)).append('"').append(',')
                                    .append('"').append(esc.apply(owner)).append('"')
                                    .append('\n');
                        }
            byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=documents_export.csv")
                    .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                    .contentLength(bytes.length)
                    .body(bytes);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", "Export failed: " + ex.getMessage()));
        }
    }
}
