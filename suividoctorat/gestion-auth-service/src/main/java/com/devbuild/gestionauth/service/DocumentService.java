package com.devbuild.gestionauth.service;

import com.devbuild.gestionauth.model.Document;
import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;
    @Value("${app.upload.max-bytes:10485760}")
    private long maxUploadBytes; // default 10MB

    // allow free-form categories provided by users (sanitized/length-checked)

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    public Document store(User owner, MultipartFile file, String title, String category) throws IOException {
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        String savedName = System.currentTimeMillis() + "-" + java.util.UUID.randomUUID() + "-" + file.getOriginalFilename();
        if (file.getSize() > maxUploadBytes) throw new IllegalArgumentException("File too large (max " + maxUploadBytes + " bytes)");
        // normalize and validate title and category
        String normTitle = normalizeTitle(title);
        String normCategory = normalizeCategory(category);

        if (normTitle != null && normTitle.length() > 256) throw new IllegalArgumentException("Title too long (max 256 chars)");
        if (normCategory != null && normCategory.length() > 64) throw new IllegalArgumentException("Category too long (max 64 chars)");
        File dest = new File(dir, savedName);
        Files.copy(file.getInputStream(), dest.toPath(), StandardCopyOption.REPLACE_EXISTING);
        Document d = new Document();
        d.setOwner(owner);
        d.setFilename(savedName);
        d.setOriginalFilename(file.getOriginalFilename());
        d.setContentType(file.getContentType());
        d.setPath(dest.getAbsolutePath());
    d.setTitle(normTitle);
    d.setCategory(normCategory);
        return documentRepository.save(d);
    }

    public List<Document> listFor(User owner) {
        return documentRepository.findByOwner(owner);
    }

    public org.springframework.data.domain.Page<Document> listFor(User owner, org.springframework.data.domain.Pageable pageable) {
        return documentRepository.findByOwner(owner, pageable);
    }

    public java.util.Optional<Document> findById(Long id) {
        return documentRepository.findById(id);
    }

    public java.util.List<Document> findAll() {
        return documentRepository.findAll();
    }

    public java.util.List<Document> findByOwnerAffiliation(String affiliation) {
        return documentRepository.findByOwner_Affiliation(affiliation);
    }

    public void delete(Long id, User requesting) throws java.io.IOException {
        Document d = documentRepository.findById(id).orElseThrow();
        boolean isOwner = d.getOwner().getId().equals(requesting.getId());
        boolean isAdmin = requesting.getRoles().stream().anyMatch(r -> r.name().equals("ROLE_ADMIN"));
        if (!isOwner && !isAdmin) throw new SecurityException("Forbidden");
        java.io.File f = new java.io.File(d.getPath());
        if (f.exists()) f.delete();
        documentRepository.delete(d);
    }

    public java.util.List<Document> filterForOwner(User owner, String term) {
        List<Document> docs = listFor(owner);
        if (term == null || term.isBlank()) return docs;
        String t = term.toLowerCase();
        java.util.stream.Stream<Document> s = docs.stream().filter(d -> 
                (d.getOriginalFilename() != null && d.getOriginalFilename().toLowerCase().contains(t)) ||
                (d.getFilename() != null && d.getFilename().toLowerCase().contains(t))
        );
        return s.collect(java.util.stream.Collectors.toList());
    }

    private String normalizeCategory(String category) {
        if (category == null) return null;
        String v = category.trim();
        if (v.isEmpty()) return null;
        // collapse multiple spaces
        v = v.replaceAll("\\s+", " ");
        // remove path separators or control characters
        v = v.replaceAll("[\\\\/\\r\\n\t]+", "-");
        return v;
    }

    private String normalizeTitle(String title) {
        if (title == null) return null;
        String v = title.trim();
        if (v.isEmpty()) return null;
        v = v.replaceAll("\\s+", " ");
        // strip CR/LF and tabs
        v = v.replaceAll("[\\r\\n\t]", " ");
        return v;
    }
}
