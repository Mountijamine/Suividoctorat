package com.devbuild.gestionauth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.ui.Model;

@Controller
public class DashboardController {

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken) {
            return "redirect:/login";
        }
        java.util.Set<String> roles = authentication.getAuthorities().stream().map(a -> a.getAuthority()).collect(java.util.stream.Collectors.toSet());
        if (roles.contains("ROLE_ADMIN")) return "redirect:/admin/users";
        if (roles.contains("ROLE_CANDIDAT")) return "candidat/dashboard";
        if (roles.contains("ROLE_ENCADRANT")) return "encadrant/dashboard";
        if (roles.contains("ROLE_PERSONNEL")) return "personnel/dashboard";
        // fallback
        return "login";
    }
}
