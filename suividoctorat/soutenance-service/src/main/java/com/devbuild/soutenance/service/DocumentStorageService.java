package com.devbuild.soutenance.service;

import com.devbuild.soutenance.model.Document;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service for managing document storage
 */
@Service
@Slf4j
public class DocumentStorageService {

    @Value("${app.upload.dir:uploads/soutenances}")
    private String uploadDir;

    /**
     * Store uploaded file
     */
    public String storeFile(MultipartFile file, Long soutenanceId, Document.TypeDocument type) {
        try {
            // Clean file name
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

            // Check if filename is valid
            if (originalFilename.contains("..")) {
                throw new IllegalArgumentException("Nom de fichier invalide: " + originalFilename);
            }

            // Create directory structure: uploads/soutenances/{soutenanceId}/{type}
            Path uploadPath = Paths.get(uploadDir, soutenanceId.toString(), type.name().toLowerCase());
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            // Copy file to target location
            Path targetLocation = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            log.info("File stored successfully: {}", targetLocation);
            return targetLocation.toString();

        } catch (IOException ex) {
            log.error("Error storing file", ex);
            throw new RuntimeException("Impossible de stocker le fichier: " + file.getOriginalFilename(), ex);
        }
    }

    /**
     * Delete file
     */
    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
            log.info("File deleted successfully: {}", filePath);
        } catch (IOException ex) {
            log.error("Error deleting file: {}", filePath, ex);
        }
    }

    /**
     * Get file as resource
     */
    public Path loadFile(String filePath) {
        return Paths.get(filePath);
    }
}
