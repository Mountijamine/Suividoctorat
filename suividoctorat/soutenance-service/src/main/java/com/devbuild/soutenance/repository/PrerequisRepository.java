package com.devbuild.soutenance.repository;

import com.devbuild.soutenance.model.Prerequis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Prerequis entity
 */
@Repository
public interface PrerequisRepository extends JpaRepository<Prerequis, Long> {

    Optional<Prerequis> findBySoutenanceId(Long soutenanceId);

    boolean existsBySoutenanceId(Long soutenanceId);
}
