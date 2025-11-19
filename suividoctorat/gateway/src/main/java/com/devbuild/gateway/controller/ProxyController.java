package com.devbuild.gateway.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProxyController {

    private static final Logger log = LoggerFactory.getLogger(ProxyController.class);

    private final WebClient webClient = WebClient.create();

    @GetMapping("/doctorants")
    public ResponseEntity<?> doctorants() {
        try {
            List<?> resp = webClient.get()
                    .uri("http://localhost:8081/api/doctorants")
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();
            return ResponseEntity.ok(resp);
        } catch (WebClientRequestException ex) {
            log.warn("Downstream service not available: {}", ex.getMessage());
            Map<String, Object> body = Map.of(
                    "timestamp", Instant.now().toString(),
                    "status", HttpStatus.SERVICE_UNAVAILABLE.value(),
                    "error", "Service Unavailable",
                    "message", "Doctorant service is not reachable",
                    "downstream", "http://localhost:8081/api/doctorants"
            );
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body);
        } catch (Exception ex) {
            log.error("Unexpected error proxying to doctorant-service", ex);
            Map<String, Object> body = Map.of(
                    "timestamp", Instant.now().toString(),
                    "status", HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "error", "Internal Server Error",
                    "message", "An unexpected error occurred while proxying the request"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }
}
