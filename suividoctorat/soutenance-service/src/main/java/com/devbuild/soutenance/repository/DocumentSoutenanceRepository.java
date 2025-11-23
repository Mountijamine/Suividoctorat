package com.devbuild.soutenance.repository;

import com.devbuild.soutenance.model.DocumentSoutenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentSoutenanceRepository extends JpaRepository<DocumentSoutenance, Long> {
    
    List<DocumentSoutenance> findByDemandeId(Long demandeId);
    
    List<DocumentSoutenance> findByDemandeIdAndTypeDocument(Long demandeId, String typeDocument);
}
