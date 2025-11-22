package com.devbuild.notification.dto;

import com.devbuild.notification.model.PrioriteNotification;
import com.devbuild.notification.model.TypeNotification;

import java.time.LocalDateTime;

public class NotificationDto {

    private Long id;
    private TypeNotification type;
    private String titre;
    private String message;
    private LocalDateTime dateEnvoi;
    private Boolean isRead;
    private String lien;
    private PrioriteNotification priorite;

    public NotificationDto() {
    }

    public NotificationDto(Long id, TypeNotification type, String titre, String message, LocalDateTime dateEnvoi, Boolean isRead, String lien, PrioriteNotification priorite) {
        this.id = id;
        this.type = type;
        this.titre = titre;
        this.message = message;
        this.dateEnvoi = dateEnvoi;
        this.isRead = isRead;
        this.lien = lien;
        this.priorite = priorite;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TypeNotification getType() {
        return type;
    }

    public void setType(TypeNotification type) {
        this.type = type;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getDateEnvoi() {
        return dateEnvoi;
    }

    public void setDateEnvoi(LocalDateTime dateEnvoi) {
        this.dateEnvoi = dateEnvoi;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public String getLien() {
        return lien;
    }

    public void setLien(String lien) {
        this.lien = lien;
    }

    public PrioriteNotification getPriorite() {
        return priorite;
    }

    public void setPriorite(PrioriteNotification priorite) {
        this.priorite = priorite;
    }
}
