package com.devbuild.gestionauth.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.client.RestTemplate;

@Controller
public class CampaignsController {

    @Value("${app.inscription.url:}")
    private String inscriptionUrl;

    private final RestTemplate rest = new RestTemplate();

    @GetMapping("/campaigns")
    public String campaigns(Model model) {
        if (inscriptionUrl == null || inscriptionUrl.isBlank()) {
            model.addAttribute("message", "Campaigns microservice not configured. To enable fetching campaigns, set app.inscription.url to the Inscription service base URL.");
            return "campaigns/list";
        }
        try {
            String url = inscriptionUrl + "/api/campaigns";
            Object resp = rest.getForObject(url, Object.class);
            model.addAttribute("campaigns", resp);
        } catch (Exception ex) {
            model.addAttribute("error", "Failed to fetch campaigns: " + ex.getMessage());
        }
        model.addAttribute("inscriptionUrl", inscriptionUrl);
        return "campaigns/list";
    }
}
