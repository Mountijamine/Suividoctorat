package com.devbuild.soutenance.repository;

import com.devbuild.soutenance.model.MembreJury;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for MembreJury entity
 */
@Repository
public interface MembreJuryRepository extends JpaRepository<MembreJury, Long> {

    List<MembreJury> findByJuryId(Long juryId);

    List<MembreJury> findByJuryIdAndTypeRole(Long juryId, MembreJury.RoleJury typeRole);
}
