package com.devbuild.soutenance.dto;

import com.devbuild.soutenance.model.Document;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for document information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {

    private Long id;
    private Document.TypeDocument type;
    private String nomFichier;
    private String cheminFichier;
    private Long tailleFichier;
    private String formatFichier;
    private Boolean valide;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateUpload;
}
