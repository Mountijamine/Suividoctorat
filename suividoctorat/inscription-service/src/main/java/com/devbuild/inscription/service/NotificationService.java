package com.devbuild.inscription.service;

import com.devbuild.inscription.model.DossierInscription;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationClient notificationClient;

    public NotificationService(NotificationClient notificationClient) {
        this.notificationClient = notificationClient;
    }

    public void notifyDirecteur(DossierInscription dossier) {
        String recipient = dossier.getDirecteurThese() + "@university.edu"; // placeholder email
        String subject = "Nouveau dossier d'inscription à examiner";
        String message = "Un nouveau dossier d'inscription (ID: " + dossier.getId() + 
                        ") de " + dossier.getDoctorant().getPrenom() + " " + dossier.getDoctorant().getNom() +
                        " a été soumis et nécessite votre avis.";
        
        notificationClient.sendNotification(recipient, subject, message, "EMAIL");
    }

    public void notifyAdmin(DossierInscription dossier) {
        String recipient = "admin@university.edu"; // placeholder admin email
        String subject = "Dossier d'inscription à valider";
        String message = "Le dossier d'inscription (ID: " + dossier.getId() + 
                        ") de " + dossier.getDoctorant().getPrenom() + " " + dossier.getDoctorant().getNom() +
                        " est prêt pour validation administrative.";
        
        notificationClient.sendNotification(recipient, subject, message, "EMAIL");
    }

    public void notifyDoctorant(DossierInscription dossier, boolean accepted) {
        String recipient = dossier.getDoctorant().getEmail();
        String subject = accepted ? "Dossier d'inscription validé" : "Dossier d'inscription rejeté";
        String message = "Votre dossier d'inscription (ID: " + dossier.getId() + ") a été " + 
                        (accepted ? "validé" : "rejeté") + " par l'administration.";
        
        notificationClient.sendNotification(recipient, subject, message, "EMAIL");
    }
}
