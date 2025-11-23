package com.devbuild.notification.model;

import java.time.LocalDateTime;
import java.util.Map;

public class EmailTemplate {

    private Long id;
    private String code;
    private String sujet;
    private String corps;
    private TypeNotification typeNotification;
    private String variables; // comma separated variable names
    private LocalDateTime dateModification;

    public EmailTemplate() {
    }

    public EmailTemplate(Long id, String code, String sujet, String corps, TypeNotification typeNotification, String variables, LocalDateTime dateModification) {
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

    // Generate the final email body by replacing ${key} placeholders with values from the map
    public String generer(Map<String, String> params) {
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

    // Modify the template - placeholder method for business logic
    public void modifier() {
        this.dateModification = LocalDateTime.now();
    }

    // Preview the template with params
    public String previsualiser(Map<String, String> params) {
        return generer(params);
    }
}
