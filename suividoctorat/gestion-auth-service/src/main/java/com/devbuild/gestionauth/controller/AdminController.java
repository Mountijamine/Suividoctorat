package com.devbuild.gestionauth.controller;

import com.devbuild.gestionauth.model.Role;
import com.devbuild.gestionauth.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

@Controller
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final UserService userService;
    private final com.devbuild.gestionauth.repository.ExportAccessLogRepository exportAccessLogRepository;
    @Value("${app.inscription.url:}")
    private String inscriptionUrl; // optional URL for the inscription/campaigns microservice

    private final RestTemplate restTemplate = new RestTemplate();

    public AdminController(UserService userService, com.devbuild.gestionauth.repository.ExportAccessLogRepository exportAccessLogRepository) {
        this.userService = userService;
        this.exportAccessLogRepository = exportAccessLogRepository;
    }

    @GetMapping(path = "/admin/users.csv", produces = "text/csv")
    public org.springframework.http.ResponseEntity<org.springframework.core.io.InputStreamResource> exportUsersCsv(
        @RequestParam(name = "role", required = false) String role,
        @RequestParam(name = "columns", required = false) String[] columns,
        @RequestParam(name = "email", required = false) String emailFilter,
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "1000") int size,
            java.security.Principal principal) {

        // Determine result set (email filter and role filter applied)
        java.util.List<com.devbuild.gestionauth.model.User> usersPage;
        if (emailFilter != null && !emailFilter.isBlank()) {
            // simple contains search across email
            usersPage = userService.findAllUsers().stream().filter(u -> u.getEmail() != null && u.getEmail().toLowerCase().contains(emailFilter.toLowerCase())).toList();
        } else if (role != null && !role.isBlank()) {
            try {
                usersPage = userService.findUsersByRole(com.devbuild.gestionauth.model.Role.valueOf(role));
            } catch (IllegalArgumentException ex) {
                usersPage = java.util.Collections.emptyList();
            }
        } else {
            usersPage = userService.findAllUsers();
        }

        // paging
        int from = Math.max(0, page * size);
        int to = Math.min(usersPage.size(), from + Math.max(0, size));
        java.util.List<com.devbuild.gestionauth.model.User> users = usersPage.subList(Math.min(from, usersPage.size()), Math.min(to, usersPage.size()));

        java.util.List<String> cols = new java.util.ArrayList<>();
        if (columns != null && columns.length > 0) {
            for (String c : columns) if (c != null && !c.isBlank()) cols.add(c);
        }
        // default columns if none selected
        if (cols.isEmpty()) {
            cols = java.util.Arrays.asList("email","firstName","lastName","requestedProfile","roles");
        }

        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        try (java.io.PrintWriter pw = new java.io.PrintWriter(baos)) {
            // header
            pw.println(String.join(",", cols));
            for (com.devbuild.gestionauth.model.User u : users) {
                java.util.List<String> row = new java.util.ArrayList<>();
                for (String c : cols) {
                    switch (c) {
                        case "id": row.add(String.valueOf(u.getId() != null ? u.getId() : 0)); break;
                        case "email": row.add(csvEscape(u.getEmail())); break;
                        case "firstName": row.add(csvEscape(u.getFirstName())); break;
                        case "lastName": row.add(csvEscape(u.getLastName())); break;
                        case "phone": row.add(csvEscape(u.getPhone())); break;
                        case "affiliation": row.add(csvEscape(u.getAffiliation())); break;
                        case "requestedProfile": row.add(csvEscape(u.getRequestedProfile())); break;
                        case "approved": row.add(u.getApproved() != null ? u.getApproved().toString() : ""); break;
                        case "approvedBy": row.add(csvEscape(u.getApprovedBy())); break;
                        case "approvedAt": row.add(u.getApprovedAt() != null ? csvEscape(u.getApprovedAt().toString()) : ""); break;
                        case "rejectionReason": row.add(csvEscape(u.getRejectionReason())); break;
                        case "roles": row.add(csvEscape(u.getRoles() != null ? u.getRoles().toString() : "")); break;
                        case "disabled": row.add(u.getDisabled() != null ? u.getDisabled().toString() : ""); break;
                        default: row.add(""); break;
                    }
                }
                pw.println(String.join(",", row));
            }
            pw.flush();
        }

        java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(baos.toByteArray());

        // Log the export access
        try {
            com.devbuild.gestionauth.model.ExportAccessLog log = new com.devbuild.gestionauth.model.ExportAccessLog();
            log.setAdminEmail(principal != null ? principal.getName() : "system");
            log.setEndpoint("/admin/users.csv");
            java.util.Map<String,Object> p = new java.util.HashMap<>();
            p.put("role", role);
            p.put("email", emailFilter);
            p.put("page", page);
            p.put("size", size);
            p.put("columns", columns);
            log.setParams(p.toString());
            log.setTimestamp(java.time.LocalDateTime.now());
            log.setResultCount(users.size());
            exportAccessLogRepository.save(log);
        } catch (Exception ignored) {}

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.csv");
        return org.springframework.http.ResponseEntity.ok().headers(headers).contentLength(baos.size()).contentType(org.springframework.http.MediaType.parseMediaType("text/csv")).body(new org.springframework.core.io.InputStreamResource(bais));
    }

    private static String csvEscape(String v) {
        if (v == null) return "";
        String out = v.replace("\"", "\"\"");
        if (out.contains(",") || out.contains("\n") || out.contains("\r") || out.contains("\"")) {
            return "\"" + out + "\"";
        }
        return out;
    }

    @GetMapping("/admin/users")
    public String users(Model model) {
        model.addAttribute("users", userService.findAllUsers());
        model.addAttribute("roles", Role.values());
        // encadrant list for the encadrant management tab
        model.addAttribute("encadrants", userService.findUsersByRole(Role.ROLE_ENCADRANT));
        java.util.Map<String, String> roleLabels = new java.util.HashMap<>();
        roleLabels.put("ROLE_CANDIDAT", "Candidat");
        roleLabels.put("ROLE_ENCADRANT", "Encadrant");
        roleLabels.put("ROLE_PERSONNEL", "Personnel administratif");
        roleLabels.put("ROLE_ADMIN", "Administrateur");
        roleLabels.put("ROLE_USER", "Utilisateur");
        model.addAttribute("roleLabels", roleLabels);
        model.addAttribute("inscriptionUrl", inscriptionUrl);
        return "admin/users";
    }

    @PostMapping("/admin/assign-role")
    public String assignRole(@RequestParam("email") String email, @RequestParam("role") String role, java.security.Principal principal, RedirectAttributes ra) {
        String actor = principal != null ? principal.getName() : "system";
        try {
            userService.assignRole(email, Role.valueOf(role), actor);
            ra.addFlashAttribute("message", "Assigned role " + role + " to " + email);
        } catch (Exception ex) {
            ra.addFlashAttribute("error", "Failed to assign role: " + ex.getMessage());
        }
        return "redirect:/admin/users";
    }

    @PostMapping("/admin/remove-role")
    public String removeRole(@RequestParam("email") String email, @RequestParam("role") String role, RedirectAttributes ra, java.security.Principal principal) {
        try {
            Role r = Role.valueOf(role);
            com.devbuild.gestionauth.model.User u = userService.findByEmail(email).orElseThrow();
            if (!u.getRoles().contains(r)) {
                ra.addFlashAttribute("error", "User does not have role: " + r.name());
                return "redirect:/admin/users";
            }
            String actor = principal != null ? principal.getName() : "system";
            userService.removeRole(email, r, actor);
            ra.addFlashAttribute("message", "Removed role " + r.name() + " from " + email);
            return "redirect:/admin/users";
        } catch (IllegalArgumentException ex) {
            ra.addFlashAttribute("error", "Invalid role: " + role);
            return "redirect:/admin/users";
        }
    }

    @PostMapping("/admin/delete-user")
    public String deleteUser(@RequestParam("email") String email, RedirectAttributes ra) {
        try {
            userService.deleteUser(email);
            ra.addFlashAttribute("message", "User deleted: " + email);
        } catch (Exception ex) {
            ra.addFlashAttribute("error", "Failed to delete user: " + ex.getMessage());
        }
        return "redirect:/admin/users";
    }

    @PostMapping("/admin/disable-user")
    public String disableUser(@RequestParam("email") String email, @RequestParam(name = "disable", required = false, defaultValue = "true") boolean disable, RedirectAttributes ra) {
        try {
            userService.setDisabled(email, disable);
            ra.addFlashAttribute("message", (disable ? "Disabled" : "Enabled") + " user: " + email);
        } catch (Exception ex) {
            ra.addFlashAttribute("error", "Failed to update user status: " + ex.getMessage());
        }
        return "redirect:/admin/users";
    }

    @PostMapping("/admin/assign-encadrant")
    public String assignEncadrantToCampaign(@RequestParam("email") String email, @RequestParam("campaignId") String campaignId, RedirectAttributes ra, java.security.Principal principal) {
        String admin = principal != null ? principal.getName() : "system";
        // Validate campaignId: allow simple alphanumeric, dashes and underscores, max 128 chars
    if (campaignId == null || campaignId.isBlank() || !campaignId.matches("[A-Za-z0-9_-]{1,128}")) {
            ra.addFlashAttribute("error", "Invalid campaignId format. Use alphanumeric, dash or underscore, max 128 chars.");
            return "redirect:/admin/users";
        }
        // Best-effort: if inscription microservice URL configured, POST an assignment request
        if (inscriptionUrl != null && !inscriptionUrl.isBlank()) {
            try {
                String url = inscriptionUrl + "/api/campaigns/" + java.net.URLEncoder.encode(campaignId, java.nio.charset.StandardCharsets.UTF_8) + "/assign-encadrant";
                java.util.Map<String, String> payload = new java.util.HashMap<>();
                payload.put("email", email);
                payload.put("assignedBy", admin);
                ResponseEntity<String> resp = restTemplate.postForEntity(url, payload, String.class);
                if (resp.getStatusCode().is2xxSuccessful()) {
                    ra.addFlashAttribute("message", "Encadrant assigned (inscription service responded " + resp.getStatusCode() + ")");
                } else {
                    ra.addFlashAttribute("error", "Inscription service returned " + resp.getStatusCode());
                }
            } catch (Exception ex) {
                ra.addFlashAttribute("error", "Failed to contact inscription service: " + ex.getMessage());
            }
        } else {
            // Placeholder behaviour: we don't touch microservice 2 here. Inform admin how to connect.
            ra.addFlashAttribute("message", "(Placeholder) To complete assignment, call the Inscription microservice's API: POST /api/campaigns/{campaignId}/assign-encadrant { email }. Configure app.inscription.url to enable automatic calls. See README for details.");
        }
        return "redirect:/admin/users";
    }

    @PostMapping("/admin/approve-user")
    public String approveUser(@RequestParam("email") String email, java.security.Principal principal) {
        String approver = principal != null ? principal.getName() : "unknown";
        userService.approveAndAssign(email, approver);
        return "redirect:/admin/users";
    }

    @PostMapping("/admin/reject-user")
    public String rejectUser(@RequestParam("email") String email, @RequestParam(name = "reason", required = false) String reason, java.security.Principal principal) {
        String approver = principal != null ? principal.getName() : "unknown";
        userService.rejectUser(email, reason, approver);
        return "redirect:/admin/users";
    }
}
