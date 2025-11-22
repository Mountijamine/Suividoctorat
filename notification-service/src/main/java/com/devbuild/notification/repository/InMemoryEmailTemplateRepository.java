package com.devbuild.notification.repository;

import com.devbuild.notification.model.EmailTemplate;
import com.devbuild.notification.model.TypeNotification;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class InMemoryEmailTemplateRepository implements EmailTemplateRepository {

    private final Map<String, EmailTemplate> templates = new HashMap<>();

    @PostConstruct
    public void init() {
        // CONFIRM_EMAIL template
        EmailTemplate confirm = new EmailTemplate();
        confirm.setId(1L);
        confirm.setCode("CONFIRM_EMAIL");
        confirm.setSujet("Confirmez votre adresse email");
        confirm.setCorps("Bonjour ${fullname},\n\nMerci pour votre inscription. Veuillez vérifier votre adresse email pour activer votre compte.\n\nOption 1 : Cliquez sur ce lien de confirmation :\n${link}\n\nOption 2 : Saisissez le code de vérification suivant sur la page de connexion :\nCode : ${code}\n\nCe code expire dans 15 minutes. Si vous n'êtes pas à l'origine de cette création de compte, ignorez simplement ce message.\n\nCordialement,\nL'équipe Support");
        confirm.setTypeNotification(TypeNotification.INSCRIPTION_SOUMISE);
        confirm.setVariables("fullname,link,code,token");
        confirm.setDateModification(LocalDateTime.now());
        templates.put(confirm.getCode(), confirm);

        // RESET_PASSWORD template
        EmailTemplate reset = new EmailTemplate();
        reset.setId(2L);
        reset.setCode("RESET_PASSWORD");
        reset.setSujet("Réinitialisation de votre mot de passe");
        reset.setCorps("Bonjour ${fullname},\n\nVous avez demandé la réinitialisation de votre mot de passe. Vous pouvez utiliser ce lien : ${link}\nou ce code : ${code} (valable 15 minutes).\nSi vous n'avez pas demandé, ignorez ce message.\n\nCordialement,\nL'équipe");
        reset.setTypeNotification(TypeNotification.INSCRIPTION_SOUMISE);
        reset.setVariables("fullname,link,token,code");
        reset.setDateModification(LocalDateTime.now());
        templates.put(reset.getCode(), reset);

        // VERIFY_CODE template
        EmailTemplate verify = new EmailTemplate();
        verify.setId(3L);
        verify.setCode("VERIFY_CODE");
        verify.setSujet("Votre code de vérification");
        verify.setCorps("Bonjour ${fullname},\n\nVotre code de vérification est : ${code}\nIl est valable pendant 15 minutes.\n\nSi vous n'avez pas demandé ce code, ignorez ce message.\n\nCordialement,\nL'équipe");
        verify.setTypeNotification(TypeNotification.INSCRIPTION_SOUMISE);
        verify.setVariables("fullname,code,link");
        verify.setDateModification(LocalDateTime.now());
        templates.put(verify.getCode(), verify);

        // PASSWORD_CHANGED template
        EmailTemplate pwdChanged = new EmailTemplate();
        pwdChanged.setId(4L);
        pwdChanged.setCode("PASSWORD_CHANGED");
        pwdChanged.setSujet("Votre mot de passe a été modifié");
        pwdChanged.setCorps("Bonjour ${fullname},\n\nVotre mot de passe a été modifié avec succès. Si vous n'avez pas initié ce changement, contactez le support immédiatement.\n\nCordialement,\nL'équipe");
        pwdChanged.setTypeNotification(TypeNotification.INSCRIPTION_SOUMISE);
        pwdChanged.setVariables("fullname");
        pwdChanged.setDateModification(LocalDateTime.now());
        templates.put(pwdChanged.getCode(), pwdChanged);
    }

    @Override
    public Optional<EmailTemplate> findByCode(String code) {
        return Optional.ofNullable(templates.get(code));
    }
}
