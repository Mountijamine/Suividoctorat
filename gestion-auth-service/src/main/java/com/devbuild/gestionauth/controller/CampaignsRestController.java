package com.devbuild.gestionauth.controller;

import com.devbuild.gestionauth.model.Campaign;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CampaignsRestController {

    @Value("${app.inscription.url:}")
    private String inscriptionUrl;

    private final RestTemplate rest = new RestTemplate();

    @GetMapping("/campaigns")
    public ResponseEntity<List<Campaign>> campaigns() {
        if (inscriptionUrl != null && !inscriptionUrl.isBlank()) {
            try {
                Campaign[] arr = rest.getForObject(inscriptionUrl + "/api/campaigns", Campaign[].class);
                if (arr != null) return ResponseEntity.ok(List.of(arr));
            } catch (Exception ignored) { }
        }
        // Fallback: small static placeholder list
        List<Campaign> list = new ArrayList<>();
        list.add(new Campaign("camp-2025-01","PhD Intake 2025","Recruitment campaign 2025",""));
        return ResponseEntity.ok(list);
    }

    @GetMapping("/campaigns/{id}")
    public ResponseEntity<Campaign> getCampaign(@PathVariable("id") String id) {
        if (inscriptionUrl != null && !inscriptionUrl.isBlank()) {
            try {
                Campaign c = rest.getForObject(inscriptionUrl + "/api/campaigns/" + URI.create(id).toString(), Campaign.class);
                if (c != null) return ResponseEntity.ok(c);
            } catch (Exception ignored) { }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/campaigns/{id}/assign-encadrant")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> assignEncadrant(@PathVariable("id") String id, @RequestBody Map<String,String> body) {
        if (inscriptionUrl != null && !inscriptionUrl.isBlank()) {
            try {
                rest.postForLocation(inscriptionUrl + "/api/campaigns/" + id + "/assign-encadrant", body);
                return ResponseEntity.ok(Map.of("assigned", true));
            } catch (Exception ex) {
                return ResponseEntity.status(502).body(Map.of("error","failed to proxy to inscription service", "detail", ex.getMessage()));
            }
        }
        // Without inscription service available, accept the request as a placeholder and return 200.
        return ResponseEntity.ok(Map.of("assigned", true, "note", "placeholder - configure app.inscription.url to enable real assignments"));
    }
}
