package com.devbuild.notification.service;

import com.devbuild.notification.dto.SendEmailRequest;
import com.devbuild.notification.model.EmailTemplate;
import com.devbuild.notification.repository.EmailTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import com.devbuild.notification.exception.EmailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.util.Map;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailTemplateRepository templateRepository;
    private final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final boolean dryRun;
    private final boolean debugErrors;

    public EmailService(JavaMailSender mailSender, EmailTemplateRepository templateRepository,
                        @Value("${app.notification.dry-run:true}") boolean dryRun,
                        @Value("${app.notification.debug-errors:false}") boolean debugErrors) {
        this.mailSender = mailSender;
        this.templateRepository = templateRepository;
        this.dryRun = dryRun;
        this.debugErrors = debugErrors;
    }

    public boolean sendFromTemplate(SendEmailRequest req) {
        if (req == null || req.getTo() == null || req.getTemplateCode() == null) {
            return false;
        }
        try {
            EmailTemplate template = templateRepository.findByCode(req.getTemplateCode()).orElse(null);
            if (template == null) {
                log.warn("Template not found: {}", req.getTemplateCode());
                return false;
            }

            String subject = req.getSubject() != null ? req.getSubject() : template.getSujet();
            String body = template.generer(req.getVariables());

            // Debug: log mailSender implementation and config when available
            try {
                log.debug("[EmailService] mailSender implementation: {}", mailSender.getClass().getName());
                if (mailSender instanceof JavaMailSenderImpl) {
                    JavaMailSenderImpl impl = (JavaMailSenderImpl) mailSender;
                    log.debug("[EmailService] mail sender host={}, port={}, username={}", impl.getHost(), impl.getPort(), impl.getUsername());
                }
            } catch (Throwable t) {
                log.warn("[EmailService] unable to inspect mailSender implementation", t);
            }

            // If dry-run is enabled or mail sender is not configured, log the rendered email and skip sending.
            boolean senderConfigured = true;
            if (mailSender instanceof JavaMailSenderImpl) {
                JavaMailSenderImpl impl = (JavaMailSenderImpl) mailSender;
                String host = impl.getHost();
                if (host == null || host.isBlank()) {
                    senderConfigured = false;
                }
            }

            if (dryRun || !senderConfigured) {
                log.info("[EmailService] dry-run/log-only mode: to={} subject={} body={}", req.getTo(), subject, body);
                return true;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setTo(req.getTo());
            helper.setSubject(subject);
            helper.setText(body, false);

            mailSender.send(message);
            log.info("Email sent to {} using template {}", req.getTo(), req.getTemplateCode());
            return true;
        } catch (Exception e) {
            // Log detailed context to help debugging (recipient + template + short exception message)
            try { log.error("Failed to send email to {} using template {} : {}", req != null ? req.getTo() : "<null>", req != null ? req.getTemplateCode() : "<null>", e.toString()); } catch (Throwable t) {}
            log.debug("Full exception for failed send:", e);
            if (debugErrors) {
                throw new EmailSendException("Failed to send email: " + e.getMessage(), e);
            }
            return false;
        }
    }

    public Map<String, String> renderPreview(SendEmailRequest req) {
        if (req == null || req.getTemplateCode() == null) {
            return Map.of("error", "invalid request");
        }
        EmailTemplate template = templateRepository.findByCode(req.getTemplateCode()).orElse(null);
        if (template == null) {
            return Map.of("error", "template not found");
        }
        String subject = req.getSubject() != null ? req.getSubject() : template.getSujet();
        String body = template.generer(req.getVariables());
        return Map.of("subject", subject, "body", body);
    }
}
