package com.devbuild.gestionauth.notification;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import java.util.Map;

@RestController
@RequestMapping("/api/auth/notify")
public class NotificationProxyController {

    private final NotificationClient notificationClient;

    public NotificationProxyController(NotificationClient notificationClient) {
        this.notificationClient = notificationClient;
    }

    /**
     * Proxy endpoint for sending emails via the internal notification service.
     * Accepts the same payload shape used by the backend when calling NotificationClient.
     * This avoids exposing the internal secret to the browser.
     */
    @PostMapping("/email")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, Object> payload) {
        try {
            // fire-and-forget; NotificationClient handles circuit breaker and retries
            notificationClient.sendEmailRequest(payload).subscribe();
            return ResponseEntity.accepted().body(Map.of("status", "accepted"));
        } catch (Exception ex) {
            try { System.err.println("[NotificationProxyController] error: " + ex.getMessage()); } catch (Throwable t) {}
            return ResponseEntity.status(500).body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }
}
