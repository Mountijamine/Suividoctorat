package com.devbuild.notification;

import com.devbuild.notification.dto.SendEmailRequest;
import com.devbuild.notification.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationsController {

    private final String expectedInternalSecret;
    private final EmailService emailService;
    private final boolean debugErrors;
    private final JavaMailSender mailSender;
    private final boolean dryRun;

    public NotificationsController(@Value("${app.notification.internal-secret:}") String expectedInternalSecret,
                                   EmailService emailService,
                                   JavaMailSender mailSender,
                                   @Value("${app.notification.debug-errors:false}") boolean debugErrors,
                                   @Value("${app.notification.dry-run:false}") boolean dryRun) {
        this.expectedInternalSecret = expectedInternalSecret;
        this.emailService = emailService;
        this.debugErrors = debugErrors;
        this.mailSender = mailSender;
        this.dryRun = dryRun;
    }

    @GetMapping("/debug-config")
    public ResponseEntity<?> debugConfig(@RequestHeader(value = "X-INTERNAL-AUTH", required = false) String header) {
        if (expectedInternalSecret != null && !expectedInternalSecret.isBlank()) {
            if (header == null || !expectedInternalSecret.equals(header)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "forbidden"));
            }
        }
        try {
            String impl = mailSender != null ? mailSender.getClass().getName() : "<none>";
            String host = "<unknown>";
            Integer port = null;
            String username = "<unknown>";
            if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
                org.springframework.mail.javamail.JavaMailSenderImpl implObj = (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender;
                host = implObj.getHost();
                port = implObj.getPort();
                username = implObj.getUsername();
            }
            return ResponseEntity.ok(Map.of(
                "mailSenderImpl", impl,
                "mailHost", host == null ? "<null>" : host,
                "mailPort", port,
                "mailUsername", username,
                "dryRun", dryRun,
                "debugErrors", debugErrors
            ));
        } catch (Throwable t) {
            t.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "debug-failed", "message", t.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> receive(@RequestBody Map<String, Object> payload,
                                     @RequestHeader(value = "X-INTERNAL-AUTH", required = false) String header) {
        // If an internal secret is configured, require it
        if (expectedInternalSecret != null && !expectedInternalSecret.isBlank()) {
            if (header == null || !expectedInternalSecret.equals(header)) {
                System.out.println("[notification] rejected: invalid internal auth");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "forbidden"));
            }
        }
        System.out.println("[notification] received: " + payload);
        return ResponseEntity.ok(Map.of("status", "accepted"));
    }

    @PostMapping("/email")
    public ResponseEntity<?> sendEmail(@RequestBody SendEmailRequest req,
                                       @RequestHeader(value = "X-INTERNAL-AUTH", required = false) String header) {
        if (expectedInternalSecret != null && !expectedInternalSecret.isBlank()) {
            if (header == null || !expectedInternalSecret.equals(header)) {
                System.out.println("[notification] rejected email: invalid internal auth");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "forbidden"));
            }
        }

        try { System.out.println("[notification] /email received payload: " + req); } catch (Throwable t) {}
        boolean sent = false;
        try {
            sent = emailService.sendFromTemplate(req);
        } catch (com.devbuild.notification.exception.EmailSendException ese) {
            try { System.err.println("[notification] email send exception: " + ese.getMessage()); } catch (Throwable ignore) {}
            if (debugErrors) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("status", "failed", "reason", "send_failed", "error", ese.getMessage()));
            }
        } catch (Throwable t) {
            try { System.err.println("[notification] error while sending email: " + t.getMessage()); } catch (Throwable ignore) {}
        }
        if (sent) {
            try { System.out.println("[notification] email send returned: sent"); } catch (Throwable t) {}
            return ResponseEntity.ok(Map.of("status", "sent"));
        } else {
            try { System.out.println("[notification] email send returned: failed for payload=" + req); } catch (Throwable t) {}
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("status", "failed", "reason", "send_failed"));
        }
    }

    @PostMapping("/preview")
    public ResponseEntity<?> preview(@RequestBody SendEmailRequest req,
                                     @RequestHeader(value = "X-INTERNAL-AUTH", required = false) String header) {
        if (expectedInternalSecret != null && !expectedInternalSecret.isBlank()) {
            if (header == null || !expectedInternalSecret.equals(header)) {
                System.out.println("[notification] rejected preview: invalid internal auth");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "forbidden"));
            }
        }

        try {
            var preview = emailService.renderPreview(req);
            return ResponseEntity.ok(preview);
        } catch (Throwable t) {
            t.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "preview failed"));
        }
    }
}
