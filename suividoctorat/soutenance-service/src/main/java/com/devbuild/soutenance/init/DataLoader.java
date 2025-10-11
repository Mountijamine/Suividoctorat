package com.devbuild.soutenance.init;

import com.devbuild.soutenance.model.*;
import com.devbuild.soutenance.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Data loader for development/testing purposes
 * Only runs when 'dev' profile is active
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final SoutenanceRepository soutenanceRepository;
    private final PrerequisRepository prerequisRepository;
    private final JuryRepository juryRepository;
    private final MembreJuryRepository membreJuryRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting data initialization for development environment...");

        if (soutenanceRepository.count() > 0) {
            log.info("Data already exists, skipping initialization");
            return;
        }

        loadSampleData();
        log.info("Sample data loaded successfully!");
    }

    private void loadSampleData() {
        // Soutenance 1: SOUMISE
        Soutenance soutenance1 = createSoutenance(
            "Intelligence Artificielle",
            "Apprentissage profond pour la détection d'anomalies dans les réseaux IoT",
            LocalDate.of(2025, 6, 15),
            1001L,
            "ALAMI",
            "Mohammed",
            "mohammed.alami@univ.ma",
            2001L,
            "Dr. BENALI",
            "benali@univ.ma",
            Soutenance.StatutSoutenance.SOUMISE
        );

        Prerequis prerequis1 = createPrerequis(soutenance1, 3, 4, 250);
        soutenance1.setPrerequis(prerequis1);
        soutenanceRepository.save(soutenance1);
        log.info("Created soutenance 1: {}", soutenance1.getId());

        // Soutenance 2: VALIDEE with Jury
        Soutenance soutenance2 = createSoutenance(
            "Cybersécurité",
            "Méthodes de détection d'intrusions basées sur l'apprentissage automatique",
            LocalDate.of(2025, 7, 10),
            1002L,
            "TAZI",
            "Fatima",
            "fatima.tazi@univ.ma",
            2001L,
            "Dr. BENALI",
            "benali@univ.ma",
            Soutenance.StatutSoutenance.VALIDEE
        );
        soutenance2.setCommentaireDirecteur("Excellente thèse, tous les prérequis sont satisfaits.");
        soutenance2.setDateValidationDirecteur(LocalDateTime.of(2025, 3, 15, 10, 30));

        Prerequis prerequis2 = createPrerequis(soutenance2, 2, 3, 210);
        prerequis2.setDocumentsValide(true);
        soutenance2.setPrerequis(prerequis2);

        soutenanceRepository.save(soutenance2);

        // Create jury for soutenance 2
        Jury jury2 = createJury(
            soutenance2,
            "Prof. RAHIMI Hassan",
            "rahimi@ensa.ma",
            "ENSA Tétouan"
        );

        addRapporteur(jury2, "BOUAZZA", "Karim", "k.bouazza@ensam.ma", "ENSAM Meknès", "Professeur");
        addRapporteur(jury2, "MANSOURI", "Sara", "s.mansouri@fst.ma", "FST Tanger", "Professeur");
        addExaminateur(jury2, "CHAKIR", "Ahmed", "a.chakir@uh2c.ma", "Université Hassan II", "Maître de Conférences");
        addExaminateur(jury2, "IDRISSI", "Lamia", "l.idrissi@usmba.ma", "Université Sidi Mohamed Ben Abdellah", "Maître de Conférences");

        juryRepository.save(jury2);
        log.info("Created soutenance 2 with jury: {}", soutenance2.getId());

        // Soutenance 3: AUTORISEE (fully authorized)
        Soutenance soutenance3 = createSoutenance(
            "Blockchain et Cryptographie",
            "Applications de la blockchain dans la sécurisation des données médicales",
            LocalDate.of(2025, 5, 20),
            1003L,
            "BENNANI",
            "Youssef",
            "youssef.bennani@univ.ma",
            2002L,
            "Dr. AMRANI",
            "amrani@univ.ma",
            Soutenance.StatutSoutenance.AUTORISEE
        );

        soutenance3.setDateDefense(LocalDate.of(2025, 5, 22));
        soutenance3.setHeureDefense(LocalTime.of(10, 0));
        soutenance3.setSalleDefense("Amphi A - Bâtiment Sciences");
        soutenance3.setAdminId(3001L);
        soutenance3.setCommentaireDirecteur("Thèse de haute qualité, contribution significative au domaine.");
        soutenance3.setCommentaireAdmin("Autorisation accordée. Tous les documents sont conformes.");
        soutenance3.setDateValidationDirecteur(LocalDateTime.of(2025, 4, 1, 14, 0));
        soutenance3.setDateAutorisation(LocalDateTime.of(2025, 4, 10, 9, 30));

        Prerequis prerequis3 = createPrerequis(soutenance3, 4, 5, 280);
        prerequis3.setDocumentsValide(true);
        soutenance3.setPrerequis(prerequis3);

        soutenanceRepository.save(soutenance3);

        // Create jury for soutenance 3
        Jury jury3 = createJury(
            soutenance3,
            "Prof. BERRADA Nadia",
            "berrada@um5.ma",
            "Université Mohammed V"
        );

        addRapporteur(jury3, "ELKAMEL", "Rachid", "r.elkamel@uir.ac.ma", "UIR Rabat", "Professeur");
        addRapporteur(jury3, "ZAHRAOUI", "Meryem", "m.zahraoui@emi.ac.ma", "EMI Rabat", "Professeur");
        addExaminateur(jury3, "FASSI", "Omar", "o.fassi@uiz.ma", "Université Ibn Zohr", "Maître de Conférences HDR");
        addExaminateur(jury3, "TAHIRI", "Sanaa", "s.tahiri@uca.ma", "Université Cadi Ayyad", "Maître de Conférences");
        addExaminateur(jury3, "LAHLOU", "Hassan", "h.lahlou@ehtp.ac.ma", "EHTP Casablanca", "Professeur Associé");

        juryRepository.save(jury3);
        log.info("Created soutenance 3 with jury: {}", soutenance3.getId());
    }

    private Soutenance createSoutenance(String sujet, String titreThese, LocalDate dateSouhaitee,
                                        Long doctorantId, String doctorantNom, String doctorantPrenom,
                                        String doctorantEmail, Long directeurId, String directeurNom,
                                        String directeurEmail, Soutenance.StatutSoutenance statut) {
        Soutenance soutenance = new Soutenance();
        soutenance.setSujet(sujet);
        soutenance.setTitreThese(titreThese);
        soutenance.setDateSouhaitee(dateSouhaitee);
        soutenance.setDoctorantId(doctorantId);
        soutenance.setDoctorantNom(doctorantNom);
        soutenance.setDoctorantPrenom(doctorantPrenom);
        soutenance.setDoctorantEmail(doctorantEmail);
        soutenance.setDirecteurId(directeurId);
        soutenance.setDirecteurNom(directeurNom);
        soutenance.setDirecteurEmail(directeurEmail);
        soutenance.setStatut(statut);
        return soutenance;
    }

    private Prerequis createPrerequis(Soutenance soutenance, int articles, int conferences, int heuresFormation) {
        Prerequis prerequis = new Prerequis();
        prerequis.setSoutenance(soutenance);
        prerequis.setNombreArticlesQ1Q2(articles);
        prerequis.setNombreConferences(conferences);
        prerequis.setHeuresFormation(heuresFormation);
        prerequis.validateAll();
        return prerequis;
    }

    private Jury createJury(Soutenance soutenance, String presidentNom, String presidentEmail, String presidentInstitution) {
        Jury jury = new Jury();
        jury.setSoutenance(soutenance);
        jury.setPresidentNom(presidentNom);
        jury.setPresidentEmail(presidentEmail);
        jury.setPresidentInstitution(presidentInstitution);
        jury.setValide(true);
        return jury;
    }

    private void addRapporteur(Jury jury, String nom, String prenom, String email, String institution, String grade) {
        MembreJury membre = new MembreJury();
        membre.setNom(nom);
        membre.setPrenom(prenom);
        membre.setEmail(email);
        membre.setInstitution(institution);
        membre.setGrade(grade);
        membre.setTypeRole(MembreJury.RoleJury.RAPPORTEUR);
        membre.setJury(jury);
        jury.getRapporteurs().add(membre);
    }

    private void addExaminateur(Jury jury, String nom, String prenom, String email, String institution, String grade) {
        MembreJury membre = new MembreJury();
        membre.setNom(nom);
        membre.setPrenom(prenom);
        membre.setEmail(email);
        membre.setInstitution(institution);
        membre.setGrade(grade);
        membre.setTypeRole(MembreJury.RoleJury.EXAMINATEUR);
        membre.setJury(jury);
        jury.getExaminateurs().add(membre);
    }
}
