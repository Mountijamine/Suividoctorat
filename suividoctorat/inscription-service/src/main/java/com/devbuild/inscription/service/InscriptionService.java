package com.devbuild.inscription.service;

import com.devbuild.inscription.model.*;
import com.devbuild.inscription.model.enums.StatutDossier;
import com.devbuild.inscription.repository.CampagneInscriptionRepository;
import com.devbuild.inscription.repository.DossierInscriptionRepository;
import com.devbuild.inscription.repository.DoctorantRepository;
import com.devbuild.inscription.repository.PieceJointeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InscriptionService {

    private final DoctorantRepository doctorantRepository;
    private final DossierInscriptionRepository dossierRepository;
    private final CampagneInscriptionRepository campagneRepository;
    private final PieceJointeRepository pieceRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public InscriptionService(DoctorantRepository doctorantRepository,
                              DossierInscriptionRepository dossierRepository,
                              CampagneInscriptionRepository campagneRepository,
                              PieceJointeRepository pieceRepository,
                              FileStorageService fileStorageService,
                              NotificationService notificationService) {
        this.doctorantRepository = doctorantRepository;
        this.dossierRepository = dossierRepository;
        this.campagneRepository = campagneRepository;
        this.pieceRepository = pieceRepository;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }

    @Transactional
    public DossierInscription soumettreDossier(Long doctorantId, DossierInscription payload) {
        Optional<Doctorant> d = doctorantRepository.findById(doctorantId);
        if (!d.isPresent()) throw new IllegalArgumentException("Doctorant introuvable");
        Doctorant doctorant = d.get();

        payload.setDoctorant(doctorant);
        payload.setDateSoumission(LocalDateTime.now());
        payload.setStatut(StatutDossier.SOUMIS);

        // if campaign is not set, try to pick an active one
        if (payload.getCampagne() == null) {
            List<CampagneInscription> campagnes = campagneRepository.findByActiveTrue();
            if (!campagnes.isEmpty()) payload.setCampagne(campagnes.get(0));
        }

        // If a campaign is set, enforce date window and active flag
        if (payload.getCampagne() != null) {
            CampagneInscription camp = campagneRepository.findById(payload.getCampagne().getId()).orElse(null);
            if (camp == null) throw new IllegalArgumentException("Campagne introuvable");
            if (!camp.isActive()) throw new IllegalStateException("La campagne n'est pas active");
            if (camp.getDateOuverture() != null && camp.getDateFermeture() != null) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (today.isBefore(camp.getDateOuverture()) || today.isAfter(camp.getDateFermeture())) {
                    throw new IllegalStateException("La campagne est fermée: soumission interdite en dehors des dates d'ouverture");
                }
            }
        }

        DossierInscription saved = dossierRepository.save(payload);

        // notifications
        notificationService.notifyDirecteur(saved);
        notificationService.notifyAdmin(saved);

        return saved;
    }

    public DossierInscription reinscription(Long doctorantId) {
        // find latest dossier for doctorant and copy selective fields
        List<DossierInscription> dossiers = dossierRepository.findByDoctorantId(doctorantId);
        if (dossiers.isEmpty()) throw new IllegalArgumentException("Aucun dossier précédent");

        DossierInscription latest = dossiers.get(dossiers.size() - 1);
        DossierInscription copy = new DossierInscription();
        copy.setDoctorant(latest.getDoctorant());
        copy.setSujetThese(latest.getSujetThese());
        copy.setDirecteurThese(latest.getDirecteurThese());
        copy.setCoDirecteur(latest.getCoDirecteur());
        copy.setLaboratoire(latest.getLaboratoire());
        copy.setReinscription(true);

        // attach the same campaign if exists
        copy.setCampagne(latest.getCampagne());

        return dossierRepository.save(copy);
    }

    public List<DossierInscription> getDossiersForDoctorant(Long doctorantId) {
        return dossierRepository.findByDoctorantId(doctorantId);
    }

    @Transactional
    public PieceJointe televerserPiece(Long dossierId, MultipartFile file) throws IOException {
        DossierInscription dossier = dossierRepository.findById(dossierId).orElseThrow(() -> new IllegalArgumentException("Dossier introuvable"));
        // if dossier is linked to a campaign, ensure campaign is open
        if (dossier.getCampagne() != null) {
            CampagneInscription camp = campagneRepository.findById(dossier.getCampagne().getId()).orElse(null);
            if (camp == null) throw new IllegalArgumentException("Campagne introuvable");
            if (!camp.isActive()) throw new IllegalStateException("La campagne liée au dossier n'est pas active");
            if (camp.getDateOuverture() != null && camp.getDateFermeture() != null) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (today.isBefore(camp.getDateOuverture()) || today.isAfter(camp.getDateFermeture())) {
                    throw new IllegalStateException("La campagne est fermée: téléversement interdit en dehors des dates d'ouverture");
                }
            }
        }
        String path = fileStorageService.store(file);
        PieceJointe piece = new PieceJointe();
        piece.setNomFichier(file.getOriginalFilename());
        piece.setTypeMime(file.getContentType());
        piece.setTaille(file.getSize());
        piece.setCheminStockage(path);
        piece.setDateTeleversement(LocalDateTime.now());
        piece.setDossier(dossier);
        piece = pieceRepository.save(piece);
        dossier.addPiece(piece);
        dossierRepository.save(dossier);
        return piece;
    }

    @Transactional
    public DossierInscription donnerAvisDirecteur(Long dossierId, String avis) {
        DossierInscription dossier = dossierRepository.findById(dossierId).orElseThrow(() -> new IllegalArgumentException("Dossier introuvable"));
        dossier.setAvisDirecteur(avis);
        dossier.setDateAvisDirecteur(LocalDateTime.now());
        // change status to EN_ATTENTE (waiting admin) or a specific director-reviewed state
        dossier.setStatut(StatutDossier.EN_ATTENTE);
        DossierInscription saved = dossierRepository.save(dossier);
        // notify admin that director gave opinion
        notificationService.notifyAdmin(saved);
        return saved;
    }

    @Transactional
    public DossierInscription validerParAdmin(Long dossierId, boolean valide, String noteAdmin) {
        DossierInscription dossier = dossierRepository.findById(dossierId).orElseThrow(() -> new IllegalArgumentException("Dossier introuvable"));
        dossier.setAvisAdmin(noteAdmin);
        dossier.setDateValidationAdmin(LocalDateTime.now());
        dossier.setStatut(valide ? StatutDossier.VALIDÉ : StatutDossier.REJETÉ);
        DossierInscription saved = dossierRepository.save(dossier);
        // notify doctorant
        notificationService.notifyDoctorant(saved, valide);
        return saved;
    }

}
