package com.devbuild.notification.dto;

import com.devbuild.notification.model.TypeNotification;

import java.time.LocalDateTime;
import java.util.Map;

public class EmailTemplateDto {

    private Long id;
    private String code;
    private String sujet;
    private String corps;
    private TypeNotification typeNotification;
    private String variables;
    private LocalDateTime dateModification;

    public EmailTemplateDto() {
    }

    public EmailTemplateDto(Long id, String code, String sujet, String corps, TypeNotification typeNotification, String variables, LocalDateTime dateModification) {
        this.id = id;
        this.code = code;
        this.sujet = sujet;
        this.corps = corps;
        this.typeNotification = typeNotification;
        this.variables = variables;
        this.dateModification = dateModification;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getSujet() {
        return sujet;
    }

    public void setSujet(String sujet) {
        this.sujet = sujet;
    }

    public String getCorps() {
        return corps;
    }

    public void setCorps(String corps) {
        this.corps = corps;
    }

    public TypeNotification getTypeNotification() {
        return typeNotification;
    }

    public void setTypeNotification(TypeNotification typeNotification) {
        this.typeNotification = typeNotification;
    }

    public String getVariables() {
        return variables;
    }

    public void setVariables(String variables) {
        this.variables = variables;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }

    public String preview(Map<String, String> params) {
        if (corps == null) return null;
        String result = corps;
        if (params != null) {
            for (Map.Entry<String, String> e : params.entrySet()) {
                String placeholder = "${" + e.getKey() + "}";
                result = result.replace(placeholder, e.getValue() == null ? "" : e.getValue());
            }
        }
        return result;
    }
}
