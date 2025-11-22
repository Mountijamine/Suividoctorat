package com.devbuild.gestionauth.model;

public class Campaign {
    private String id;
    private String title;
    private String description;
    private String inscriptionUrl;

    public Campaign() {}

    public Campaign(String id, String title, String description, String inscriptionUrl) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.inscriptionUrl = inscriptionUrl;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getInscriptionUrl() { return inscriptionUrl; }
    public void setInscriptionUrl(String inscriptionUrl) { this.inscriptionUrl = inscriptionUrl; }
}
