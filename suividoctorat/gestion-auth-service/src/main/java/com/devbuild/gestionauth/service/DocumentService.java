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


    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    public Document store(User owner, MultipartFile file, String title, String category, String note) throws IOException {
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        String savedName = System.currentTimeMillis() + "-" + java.util.UUID.randomUUID() + "-" + file.getOriginalFilename();
        if (file.getSize() > maxUploadBytes) throw new IllegalArgumentException("File too large (max " + maxUploadBytes + " bytes)");
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
    d.setNote(note == null ? null : note.trim());
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

    public org.springframework.data.domain.Page<Document> listForUser(String email, String q, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"));
        List<Document> all = documentRepository.findAll();
        java.util.stream.Stream<Document> s = all.stream().filter(d -> d.getOwner() != null && email.equals(d.getOwner().getEmail()));
        if (q != null && !q.isBlank()) {
            String tq = q.toLowerCase();
            s = s.filter(d -> (d.getOriginalFilename() != null && d.getOriginalFilename().toLowerCase().contains(tq)) || (d.getTitle() != null && d.getTitle().toLowerCase().contains(tq)));
        }
        List<Document> filtered = s.collect(java.util.stream.Collectors.toList());
        int start = Math.min(page * size, filtered.size());
        int end = Math.min(start + size, filtered.size());
        List<Document> pageContent = filtered.subList(start, end);
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, filtered.size());
    }

    public java.util.List<Document> findAll() {
        return documentRepository.findAll();
    }

    public java.util.List<Document> findByOwnerAffiliation(String affiliation) {
        return documentRepository.findByOwner_Affiliation(affiliation);
    }

    
    public java.util.List<Document> findForUserAll(String email, String q, String category) {
        List<Document> all = documentRepository.findAll();
        java.util.stream.Stream<Document> s = all.stream().filter(d -> d.getOwner() != null && email.equals(d.getOwner().getEmail()));
        if (q != null && !q.isBlank()) {
            String tq = q.toLowerCase();
            s = s.filter(d -> (d.getOriginalFilename() != null && d.getOriginalFilename().toLowerCase().contains(tq)) || (d.getTitle() != null && d.getTitle().toLowerCase().contains(tq)));
        }
        if (category != null && !category.isBlank()) {
            String tc = category.toLowerCase().trim();
            s = s.filter(d -> d.getCategory() != null && d.getCategory().toLowerCase().contains(tc));
        }
        return s.collect(java.util.stream.Collectors.toList());
    }

   
    public java.util.List<String> findDistinctCategoriesForUser(String email) {
        List<Document> all = documentRepository.findAll();
        return all.stream()
                .filter(d -> d.getOwner() != null && email.equals(d.getOwner().getEmail()))
                .map(Document::getCategory)
                .filter(c -> c != null && !c.isBlank())
                .map(String::trim)
                .distinct()
                .collect(java.util.stream.Collectors.toList());
    }

    public org.springframework.core.io.Resource loadAsResource(Long id, String requestingUsername) throws java.io.IOException {
        Document d = documentRepository.findById(id).orElseThrow();
        boolean allowed = false;
        if (d.getOwner() != null && d.getOwner().getEmail().equals(requestingUsername)) allowed = true;
        // If calling code needs admin checks it can be done at controller level via roles; here allow owner only
        if (!allowed) throw new SecurityException("Forbidden");
        java.io.File f = new java.io.File(d.getPath());
        if (!f.exists()) throw new java.io.FileNotFoundException("file not found");
        return new org.springframework.core.io.UrlResource(f.toURI());
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
        v = v.replaceAll("\\s+", " ");
        v = v.replaceAll("[\\\\/\\r\\n\t]+", "-");
        return v;
    }

    private String normalizeTitle(String title) {
        if (title == null) return null;
        String v = title.trim();
        if (v.isEmpty()) return null;
        v = v.replaceAll("\\s+", " ");
        v = v.replaceAll("[\\r\\n\t]", " ");
        return v;
    }
}
