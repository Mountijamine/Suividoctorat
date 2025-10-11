package com.devbuild.soutenance.repository;

import com.devbuild.soutenance.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Document entity
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findBySoutenanceId(Long soutenanceId);

    Optional<Document> findBySoutenanceIdAndType(Long soutenanceId, Document.TypeDocument type);

    List<Document> findBySoutenanceIdAndValide(Long soutenanceId, Boolean valide);

    long countBySoutenanceIdAndValide(Long soutenanceId, Boolean valide);

    boolean existsBySoutenanceIdAndType(Long soutenanceId, Document.TypeDocument type);
}
