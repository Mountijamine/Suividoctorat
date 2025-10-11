package com.devbuild.soutenance.service;

import com.devbuild.soutenance.model.Soutenance;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service for sending notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;

    /**
     * Notify director about new defense request
     */
    public void notifyDirecteurNewDemande(Soutenance soutenance) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(soutenance.getDirecteurEmail());
            message.setSubject("Nouvelle demande de soutenance - " + soutenance.getDoctorantNom());
            message.setText(String.format(
                "Bonjour,\n\n" +
                "Une nouvelle demande de soutenance a été soumise par %s %s.\n\n" +
                "Titre de la thèse: %s\n" +
                "Date souhaitée: %s\n\n" +
                "Veuillez vous connecter au portail pour valider cette demande et proposer le jury.\n\n" +
                "Cordialement,\n" +
                "L'équipe de gestion des doctorats",
                soutenance.getDoctorantPrenom(),
                soutenance.getDoctorantNom(),
                soutenance.getTitreThese(),
                soutenance.getDateSouhaitee()
            ));

            mailSender.send(message);
            log.info("Notification sent to director: {}", soutenance.getDirecteurEmail());

        } catch (Exception ex) {
            log.error("Error sending notification to director", ex);
        }
    }

    /**
     * Notify admin about director validation
     */
    public void notifyAdminValidationDirecteur(Soutenance soutenance) {
        try {
            // In a real application, you would get admin email from configuration or database
            String adminEmail = "admin@university.edu";

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(adminEmail);
            message.setSubject("Demande de soutenance validée par le directeur - " + soutenance.getDoctorantNom());
            message.setText(String.format(
                "Bonjour,\n\n" +
                "La demande de soutenance de %s %s a été validée par le directeur de thèse.\n\n" +
                "Titre de la thèse: %s\n" +
                "Date souhaitée: %s\n" +
                "Directeur: %s\n\n" +
                "Veuillez vous connecter au portail pour donner l'autorisation finale et planifier la soutenance.\n\n" +
                "Cordialement,\n" +
                "L'équipe de gestion des doctorats",
                soutenance.getDoctorantPrenom(),
                soutenance.getDoctorantNom(),
                soutenance.getTitreThese(),
                soutenance.getDateSouhaitee(),
                soutenance.getDirecteurNom()
            ));

            mailSender.send(message);
            log.info("Notification sent to admin");

        } catch (Exception ex) {
            log.error("Error sending notification to admin", ex);
        }
    }

    /**
     * Notify student about rejection
     */
    public void notifyDoctorantRejet(Soutenance soutenance) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(soutenance.getDoctorantEmail());
            message.setSubject("Demande de soutenance rejetée");
            message.setText(String.format(
                "Bonjour %s,\n\n" +
                "Votre demande de soutenance a été rejetée par votre directeur de thèse.\n\n" +
                "Commentaire: %s\n\n" +
                "Veuillez contacter votre directeur pour plus d'informations.\n\n" +
                "Cordialement,\n" +
                "L'équipe de gestion des doctorats",
                soutenance.getDoctorantPrenom(),
                soutenance.getCommentaireDirecteur() != null ? soutenance.getCommentaireDirecteur() : "Aucun commentaire"
            ));

            mailSender.send(message);
            log.info("Rejection notification sent to student: {}", soutenance.getDoctorantEmail());

        } catch (Exception ex) {
            log.error("Error sending rejection notification to student", ex);
        }
    }

    /**
     * Notify student about authorization
     */
    public void notifyDoctorantAutorisation(Soutenance soutenance) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(soutenance.getDoctorantEmail());
            message.setSubject("Autorisation de soutenance accordée");
            message.setText(String.format(
                "Bonjour %s,\n\n" +
                "Félicitations! Votre demande de soutenance a été autorisée.\n\n" +
                "Date de soutenance: %s\n" +
                "Heure: %s\n" +
                "Salle: %s\n\n" +
                "Votre autorisation de soutenance est disponible sur le portail.\n\n" +
                "Bonne chance pour votre soutenance!\n\n" +
                "Cordialement,\n" +
                "L'équipe de gestion des doctorats",
                soutenance.getDoctorantPrenom(),
                soutenance.getDateDefense(),
                soutenance.getHeureDefense(),
                soutenance.getSalleDefense()
            ));

            mailSender.send(message);
            log.info("Authorization notification sent to student: {}", soutenance.getDoctorantEmail());

        } catch (Exception ex) {
            log.error("Error sending authorization notification to student", ex);
        }
    }

    /**
     * Notify director about authorization
     */
    public void notifyDirecteurAutorisation(Soutenance soutenance) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(soutenance.getDirecteurEmail());
            message.setSubject("Soutenance autorisée et planifiée - " + soutenance.getDoctorantNom());
            message.setText(String.format(
                "Bonjour,\n\n" +
                "La soutenance de %s %s a été autorisée et planifiée.\n\n" +
                "Date: %s\n" +
                "Heure: %s\n" +
                "Salle: %s\n\n" +
                "Cordialement,\n" +
                "L'équipe de gestion des doctorats",
                soutenance.getDoctorantPrenom(),
                soutenance.getDoctorantNom(),
                soutenance.getDateDefense(),
                soutenance.getHeureDefense(),
                soutenance.getSalleDefense()
            ));

            mailSender.send(message);
            log.info("Authorization notification sent to director: {}", soutenance.getDirecteurEmail());

        } catch (Exception ex) {
            log.error("Error sending authorization notification to director", ex);
        }
    }
}
