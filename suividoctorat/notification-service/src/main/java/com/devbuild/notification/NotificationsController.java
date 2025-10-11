package com.devbuild.notification;

import org.springframework.beans.factory.annotation.Value;
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

    public NotificationsController(@Value("${app.notification.internal-secret:}") String expectedInternalSecret) {
        this.expectedInternalSecret = expectedInternalSecret;
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
}
