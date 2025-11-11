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
        return "forward:/index.html";
    }

    @PostMapping("/profile")
    public String updateProfile(@RequestParam(name = "firstName", required = false) String firstName,
                                @RequestParam(name = "lastName", required = false) String lastName,
                                @RequestParam(name = "phone", required = false) String phone,
                                @RequestParam(name = "affiliation", required = false) String affiliation,
                                @RequestParam(name = "requestedProfile", required = false) String requestedProfile,
                                java.security.Principal principal) {
        if (principal == null) return "redirect:/login";
        String email = principal.getName();
        userService.updateProfile(email, firstName, lastName, phone, affiliation, requestedProfile);
        return "redirect:/profile";
    }
}
