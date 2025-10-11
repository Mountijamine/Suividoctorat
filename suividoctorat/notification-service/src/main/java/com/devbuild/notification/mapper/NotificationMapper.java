package com.devbuild.notification.mapper;

import com.devbuild.notification.dto.CreateNotificationDto;
import com.devbuild.notification.dto.NotificationDto;
import com.devbuild.notification.model.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {
    public Notification toModel(CreateNotificationDto dto) {
        if (dto == null) return null;
        Notification n = new Notification();
        n.setType(dto.getType());
        n.setRecipient(dto.getRecipient());
        n.setSubject(dto.getSubject());
        n.setBody(dto.getBody());
        n.setScheduledAt(dto.getScheduledAt());
        return n;
    }

    public NotificationDto toDto(Notification n) {
        if (n == null) return null;
        NotificationDto d = new NotificationDto();
        d.setId(n.getId());
        d.setType(n.getType());
        d.setStatus(n.getStatus());
        d.setRecipient(n.getRecipient());
        d.setSubject(n.getSubject());
        d.setBody(n.getBody());
        d.setCreatedAt(n.getCreatedAt());
        return d;
    }
}
