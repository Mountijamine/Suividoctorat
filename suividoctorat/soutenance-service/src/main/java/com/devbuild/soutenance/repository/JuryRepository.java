package com.devbuild.soutenance.repository;

import com.devbuild.soutenance.model.Jury;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Jury entity
 */
@Repository
public interface JuryRepository extends JpaRepository<Jury, Long> {

    Optional<Jury> findBySoutenanceId(Long soutenanceId);

    @Query("SELECT j FROM Jury j LEFT JOIN FETCH j.rapporteurs LEFT JOIN FETCH j.examinateurs WHERE j.soutenance.id = :soutenanceId")
    Optional<Jury> findBySoutenanceIdWithMembers(@Param("soutenanceId") Long soutenanceId);

    boolean existsBySoutenanceId(Long soutenanceId);
}
