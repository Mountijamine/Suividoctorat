package com.devbuild.notification.dto;

import com.devbuild.notification.enums.NotificationType;
import java.time.LocalDateTime;

public class CreateNotificationDto {
    private NotificationType type;
    private String recipient;
    private String subject;
    private String body;
    private LocalDateTime scheduledAt;

    public CreateNotificationDto() {}

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
}
