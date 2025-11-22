package com.devbuild.gestionauth.repository;

import com.devbuild.gestionauth.model.Document;
import com.devbuild.gestionauth.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByOwner(User owner);
    Page<Document> findByOwner(User owner, Pageable pageable);
    List<Document> findByOwner_Affiliation(String affiliation);
    Page<Document> findByOwner_Affiliation(String affiliation, Pageable pageable);
}
