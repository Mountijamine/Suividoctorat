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
    @Value("${app.inscription.url:}")
    private String inscriptionUrl; // optional URL for the inscription/campaigns microservice

    private final RestTemplate restTemplate = new RestTemplate();

    public AdminController(UserService userService) {
        this.userService = userService;
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
