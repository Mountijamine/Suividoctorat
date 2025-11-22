package com.devbuild.soutenance.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.soutenance")
public class SoutenanceConfig {
    
    private String uploadDir = "./uploads/soutenance";
    private Integer publicationsRequises = 2;
    private Integer creditsFormationRequis = 30;
    private Integer minimumRapporteurs = 2;
    
    public String getUploadDir() {
        return uploadDir;
    }
    
    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }
    
    public Integer getPublicationsRequises() {
        return publicationsRequises;
    }
    
    public void setPublicationsRequises(Integer publicationsRequises) {
        this.publicationsRequises = publicationsRequises;
    }
    
    public Integer getCreditsFormationRequis() {
        return creditsFormationRequis;
    }
    
    public void setCreditsFormationRequis(Integer creditsFormationRequis) {
        this.creditsFormationRequis = creditsFormationRequis;
    }
    
    public Integer getMinimumRapporteurs() {
        return minimumRapporteurs;
    }
    
    public void setMinimumRapporteurs(Integer minimumRapporteurs) {
        this.minimumRapporteurs = minimumRapporteurs;
    }
}
