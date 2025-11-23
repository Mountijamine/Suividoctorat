package com.devbuild.notification.dto;

import java.util.Map;

public class SendEmailRequest {
    private String to;
    private String templateCode;
    private String subject;
    private Map<String, String> variables;

    public SendEmailRequest() {
    }

    public SendEmailRequest(String to, String templateCode, String subject, Map<String, String> variables) {
        this.to = to;
        this.templateCode = templateCode;
        this.subject = subject;
        this.variables = variables;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getTemplateCode() {
        return templateCode;
    }

    public void setTemplateCode(String templateCode) {
        this.templateCode = templateCode;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Map<String, String> getVariables() {
        return variables;
    }

    public void setVariables(Map<String, String> variables) {
        this.variables = variables;
    }
}
