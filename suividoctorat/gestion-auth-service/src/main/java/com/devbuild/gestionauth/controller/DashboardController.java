package com.devbuild.gestionauth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.ui.Model;

@Controller
public class DashboardController {

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        // Let SPA handle dashboard rendering and role-based routing.
        return "forward:/index.html";
    }
}
