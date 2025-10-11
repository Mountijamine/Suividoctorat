package com.devbuild.inscription.repository;

import com.devbuild.inscription.model.DossierInscription;
import com.devbuild.inscription.model.enums.StatutDossier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DossierInscriptionRepository extends JpaRepository<DossierInscription, Long> {
    List<DossierInscription> findByDoctorantId(Long doctorantId);
    List<DossierInscription> findByStatut(StatutDossier statut);
}
