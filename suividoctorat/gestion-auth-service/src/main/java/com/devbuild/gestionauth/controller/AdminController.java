package com.devbuild.gestionauth.controller;

import com.devbuild.gestionauth.model.Role;
import com.devbuild.gestionauth.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/admin/users")
    public String users(Model model) {
        model.addAttribute("users", userService.findAllUsers());
        model.addAttribute("roles", Role.values());
        java.util.Map<String, String> roleLabels = new java.util.HashMap<>();
        roleLabels.put("ROLE_CANDIDAT", "Candidat");
        roleLabels.put("ROLE_ENCADRANT", "Encadrant");
        roleLabels.put("ROLE_PERSONNEL", "Personnel administratif");
        roleLabels.put("ROLE_ADMIN", "Administrateur");
        roleLabels.put("ROLE_USER", "Utilisateur");
        model.addAttribute("roleLabels", roleLabels);
        return "admin/users";
    }

    @PostMapping("/admin/assign-role")
    public String assignRole(@RequestParam String email, @RequestParam String role) {
        userService.assignRole(email, Role.valueOf(role));
        return "redirect:/admin/users";
    }

    @PostMapping("/admin/approve-user")
    public String approveUser(@RequestParam String email, java.security.Principal principal) {
        String approver = principal != null ? principal.getName() : "unknown";
        userService.approveAndAssign(email, approver);
        return "redirect:/admin/users";
    }

    @PostMapping("/admin/reject-user")
    public String rejectUser(@RequestParam String email, @RequestParam(required = false) String reason, java.security.Principal principal) {
        String approver = principal != null ? principal.getName() : "unknown";
        userService.rejectUser(email, reason, approver);
        return "redirect:/admin/users";
    }
}
