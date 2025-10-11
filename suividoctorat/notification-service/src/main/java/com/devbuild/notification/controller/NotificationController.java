package com.devbuild.notification.controller;

import com.devbuild.notification.dto.NotificationRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@RequestBody NotificationRequest request) {
        // For now, just log the notification
        System.out.println("[NOTIFICATION-SERVICE] Received: " + request);
        
        // TODO: Implement actual email/SMS sending logic
        // For now, simulate successful sending
        
        return ResponseEntity.ok().body("{\"status\": \"sent\", \"id\": \"" + System.currentTimeMillis() + "\"}");
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok().body("{\"status\": \"UP\"}");
    }
}