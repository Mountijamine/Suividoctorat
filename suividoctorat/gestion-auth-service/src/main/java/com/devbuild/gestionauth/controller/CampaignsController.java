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
        // Campaigns are rendered by the SPA. Keep this endpoint for legacy server-side usage if needed,
        // but redirect to the SPA entry point for client-side rendering.
        return "forward:/index.html";
    }
}
