package com.devbuild.inscription.repository;

import com.devbuild.inscription.model.CampagneInscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CampagneInscriptionRepository extends JpaRepository<CampagneInscription, Long> {
    List<CampagneInscription> findByActiveTrue();
    List<CampagneInscription> findByDateOuvertureBeforeAndDateFermetureAfter(LocalDate before, LocalDate after);
}
