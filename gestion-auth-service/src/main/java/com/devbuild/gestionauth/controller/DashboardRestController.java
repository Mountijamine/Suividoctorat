package com.devbuild.gestionauth.controller;

import com.devbuild.gestionauth.service.DocumentService;
import com.devbuild.gestionauth.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardRestController {

    private final UserService userService;
    private final DocumentService documentService;

    public DashboardRestController(UserService userService, DocumentService documentService) {
        this.userService = userService;
        this.documentService = documentService;
    }

    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> stats() {
        long users = userService.findAllUsers().size();
        long pending = userService.findAllUsers().stream().filter(u -> u.getRequestedProfile() != null && !u.getRequestedProfile().isBlank() && !u.getApproved()).count();
        long docs = documentService.findAll().size();
        return ResponseEntity.ok(Map.of(
                "users", users,
                "pendingApprovals", pending,
                "documents", docs
        ));
    }
}
