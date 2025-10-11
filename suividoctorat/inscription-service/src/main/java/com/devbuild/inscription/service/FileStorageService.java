package com.devbuild.inscription.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;

@Service
public class FileStorageService {

    private final Path root;
    private final List<String> allowedMime = Arrays.asList("application/pdf", "image/jpeg", "image/jpg", "image/png");
    private final long maxSize = 10 * 1024 * 1024; // 10MB

    public FileStorageService() throws IOException {
        this.root = Path.of(System.getProperty("user.dir"), "inscription-service-uploads");
        Files.createDirectories(root);
    }

    public String store(MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("Fichier vide");
        if (file.getSize() > maxSize) throw new IllegalArgumentException("Fichier trop volumineux");
        String contentType = file.getContentType();
        if (contentType == null || !allowedMime.contains(contentType)) throw new IllegalArgumentException("Type de fichier non autorisé: " + contentType);

        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path target = root.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return target.toAbsolutePath().toString();
    }

}
