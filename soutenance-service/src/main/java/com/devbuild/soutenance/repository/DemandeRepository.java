package com.devbuild.soutenance.repository;

import com.devbuild.soutenance.model.DemandeSoutenance;
import com.devbuild.soutenance.model.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DemandeRepository extends JpaRepository<DemandeSoutenance, Long> {
    
    @Query("SELECT DISTINCT d FROM DemandeSoutenance d LEFT JOIN FETCH d.prerequis LEFT JOIN FETCH d.membresJury WHERE d.doctorantEmail = :email ORDER BY d.dateCreation DESC")
    List<DemandeSoutenance> findByDoctorantEmail(@Param("email") String email);
    
    @Query("SELECT DISTINCT d FROM DemandeSoutenance d LEFT JOIN FETCH d.prerequis LEFT JOIN FETCH d.membresJury WHERE d.directeurEmail = :email ORDER BY d.dateCreation DESC")
    List<DemandeSoutenance> findByDirecteurEmail(@Param("email") String email);
    
    @Query("SELECT DISTINCT d FROM DemandeSoutenance d LEFT JOIN FETCH d.prerequis LEFT JOIN FETCH d.membresJury WHERE d.statut = :statut ORDER BY d.dateCreation DESC")
    List<DemandeSoutenance> findByStatut(@Param("statut") StatutDemande statut);
    
    @Query("SELECT DISTINCT d FROM DemandeSoutenance d LEFT JOIN FETCH d.prerequis LEFT JOIN FETCH d.membresJury WHERE d.statut IN :statuts ORDER BY d.dateCreation DESC")
    List<DemandeSoutenance> findByStatutIn(@Param("statuts") List<StatutDemande> statuts);
    
    Optional<DemandeSoutenance> findByIdAndDoctorantEmail(Long id, String email);
    
    @Query("SELECT DISTINCT d FROM DemandeSoutenance d LEFT JOIN FETCH d.prerequis LEFT JOIN FETCH d.membresJury m WHERE m.email = :email ORDER BY d.dateCreation DESC")
    List<DemandeSoutenance> findByJuryMemberEmail(@Param("email") String email);
    
    @Query("SELECT DISTINCT d FROM DemandeSoutenance d LEFT JOIN FETCH d.prerequis LEFT JOIN FETCH d.membresJury ORDER BY d.dateCreation DESC")
    List<DemandeSoutenance> findAllWithDetails();
}
