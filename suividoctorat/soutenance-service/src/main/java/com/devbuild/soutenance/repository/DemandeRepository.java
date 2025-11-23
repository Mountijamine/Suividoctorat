package com.devbuild.soutenance.repository;

import com.devbuild.soutenance.model.DemandeSoutenance;
import com.devbuild.soutenance.model.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DemandeRepository extends JpaRepository<DemandeSoutenance, Long> {
    
    List<DemandeSoutenance> findByDoctorantEmail(String email);
    
    List<DemandeSoutenance> findByDirecteurEmail(String email);
    
    List<DemandeSoutenance> findByStatut(StatutDemande statut);
    
    List<DemandeSoutenance> findByStatutIn(List<StatutDemande> statuts);
    
    Optional<DemandeSoutenance> findByIdAndDoctorantEmail(Long id, String email);
}
