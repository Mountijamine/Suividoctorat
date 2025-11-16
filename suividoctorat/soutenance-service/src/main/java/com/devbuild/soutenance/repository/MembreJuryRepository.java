package com.devbuild.soutenance.repository;

import com.devbuild.soutenance.model.MembreJury;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MembreJuryRepository extends JpaRepository<MembreJury, Long> {
    
    List<MembreJury> findByDemandeId(Long demandeId);
}
