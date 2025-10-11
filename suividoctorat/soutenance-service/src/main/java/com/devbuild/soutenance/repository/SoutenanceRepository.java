package com.devbuild.soutenance.repository;

import com.devbuild.soutenance.model.Soutenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Soutenance entity
 */
@Repository
public interface SoutenanceRepository extends JpaRepository<Soutenance, Long> {

    List<Soutenance> findByDoctorantId(Long doctorantId);

    List<Soutenance> findByDirecteurId(Long directeurId);

    List<Soutenance> findByStatut(Soutenance.StatutSoutenance statut);

    @Query("SELECT s FROM Soutenance s WHERE s.statut = :statut AND s.directeurId = :directeurId")
    List<Soutenance> findByStatutAndDirecteurId(
        @Param("statut") Soutenance.StatutSoutenance statut,
        @Param("directeurId") Long directeurId
    );

    @Query("SELECT s FROM Soutenance s WHERE s.dateDefense BETWEEN :startDate AND :endDate")
    List<Soutenance> findByDateDefenseBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT s FROM Soutenance s LEFT JOIN FETCH s.documents LEFT JOIN FETCH s.jury LEFT JOIN FETCH s.prerequis WHERE s.id = :id")
    Optional<Soutenance> findByIdWithDetails(@Param("id") Long id);

    boolean existsByDoctorantIdAndStatutIn(Long doctorantId, List<Soutenance.StatutSoutenance> statuts);
}
