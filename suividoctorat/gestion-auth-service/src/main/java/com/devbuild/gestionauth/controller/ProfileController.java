package com.devbuild.gestionauth.controller;

import com.devbuild.gestionauth.model.Role;
import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;

@Controller
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public String profile(Model model, java.security.Principal principal) {
        if (principal == null) return "redirect:/login";
        String email = principal.getName();
        User u = userService.findByEmail(email).orElseThrow();
        model.addAttribute("user", u);
        java.util.Map<String,String> roleLabels = new java.util.HashMap<>();
        roleLabels.put("ROLE_CANDIDAT","Candidat"); roleLabels.put("ROLE_ENCADRANT","Encadrant"); roleLabels.put("ROLE_PERSONNEL","Personnel administratif");
        model.addAttribute("roleLabels", roleLabels);
        model.addAttribute("roles", Role.values());
        return "profile";
    }

    @PostMapping("/profile")
    public String updateProfile(@RequestParam(name = "firstName", required = false) String firstName,
                                @RequestParam(name = "lastName", required = false) String lastName,
                                @RequestParam(name = "phone", required = false) String phone,
                                @RequestParam(name = "affiliation", required = false) String affiliation,
                                @RequestParam(name = "proofUrl", required = false) String proofUrl,
                                @RequestParam(name = "requestedProfile", required = false) String requestedProfile,
                                java.security.Principal principal) {
        if (principal == null) return "redirect:/login";
        String email = principal.getName();
        userService.updateProfile(email, firstName, lastName, phone, affiliation, proofUrl, requestedProfile);
        return "redirect:/profile";
    }
}
