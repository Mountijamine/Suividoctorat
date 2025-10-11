package com.devbuild.notification.controller;

import com.devbuild.notification.dto.CreateNotificationDto;
import com.devbuild.notification.dto.NotificationDto;
import com.devbuild.notification.service.NotificationService;
import com.devbuild.notification.service.NotificationPdfService;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;
    private final NotificationPdfService pdfService;

    public NotificationController(NotificationService service, NotificationPdfService pdfService) {
        this.service = service;
        this.pdfService = pdfService;
    }

    @PostMapping
    public ResponseEntity<NotificationDto> create(@Valid @RequestBody CreateNotificationDto dto) {
        NotificationDto created = service.create(dto);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping(value = "/{id}/pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> getPdf(@PathVariable Long id) {
        try {
            byte[] pdf = pdfService.generatePdfForId(id);
            return ResponseEntity.ok().header("Content-Disposition", "attachment; filename=notification-" + id + ".pdf").body(pdf);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            return ResponseEntity.status(500).build();
        }
    }
}
