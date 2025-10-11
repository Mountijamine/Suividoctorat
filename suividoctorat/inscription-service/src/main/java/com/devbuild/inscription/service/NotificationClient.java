package com.devbuild.inscription.service;

import com.devbuild.inscription.dto.NotificationRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NotificationClient {

    private final RestTemplate restTemplate;
    private final String notificationServiceUrl;

    public NotificationClient(@Value("${notification.service.url:http://localhost:8094}") String notificationServiceUrl) {
        this.restTemplate = new RestTemplate();
        this.notificationServiceUrl = notificationServiceUrl;
    }

    public void sendNotification(String recipient, String subject, String message, String type) {
        try {
            NotificationRequest request = new NotificationRequest(recipient, subject, message, type);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<NotificationRequest> entity = new HttpEntity<>(request, headers);
            
            String url = notificationServiceUrl + "/api/notifications/send";
            restTemplate.postForObject(url, entity, String.class);
            
            System.out.println("[NOTIFICATION-CLIENT] Sent notification to " + recipient);
        } catch (Exception e) {
            System.err.println("[NOTIFICATION-CLIENT] Failed to send notification: " + e.getMessage());
            // Fall back to console logging
            System.out.println("[FALLBACK] " + type + " to " + recipient + ": " + subject + " - " + message);
        }
    }
}