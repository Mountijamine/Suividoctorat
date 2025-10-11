package com.devbuild.gestionauth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import com.devbuild.gestionauth.service.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import com.devbuild.gestionauth.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@Controller
public class WebController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public WebController(UserService userService, AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/signup")
    public String signupPage() {
        return "signup";
    }

    @PostMapping(value = "/signup", consumes = org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public String signupForm(@org.springframework.web.bind.annotation.RequestParam java.util.Map<String, String> params, org.springframework.ui.Model model) {
        String email = params.get("email");
        String password = params.get("password");
        String confirm = params.get("confirmPassword");
        String firstName = params.get("firstName");
        String lastName = params.get("lastName");
    String phone = params.get("phone");
    String accept = params.get("acceptTerms");
    String requestedProfile = params.get("requestedProfile");
        if (email == null || password == null || confirm == null) { model.addAttribute("error","Missing fields"); return "signup"; }
        if (!password.equals(confirm)) { model.addAttribute("error","Passwords do not match"); return "signup"; }
        if (!"on".equalsIgnoreCase(accept) && !"true".equalsIgnoreCase(accept)) { model.addAttribute("error","You must accept terms"); return "signup"; }
    userService.createUserWithProfile(email, password, firstName, lastName, phone, true, requestedProfile);
        return "redirect:/login";
    }


    @GetMapping("/")
    public String index(Model model) {
        return "login";
    }

    @PostMapping(value = "/login", consumes = org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public String loginForm(@org.springframework.web.bind.annotation.RequestParam java.util.Map<String, String> params, org.springframework.ui.Model model, HttpServletResponse response, org.springframework.web.servlet.mvc.support.RedirectAttributes redirectAttributes) {
        String email = params.get("email");
        String password = params.get("password");
        if (email == null || password == null) { model.addAttribute("error","Missing credentials"); return "login"; }
        org.springframework.security.core.Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(email, password));
            org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (org.springframework.security.core.AuthenticationException ex) {
            model.addAttribute("error","Invalid credentials");
            return "login";
        }
        // generate jwt and set as secure httponly cookie
        com.devbuild.gestionauth.model.User u = userService.findByEmail(email).orElse(null);
        if (u != null) {
            java.util.Set<String> roles = u.getRoles().stream().map(Enum::name).collect(java.util.stream.Collectors.toSet());
            String token = jwtUtil.generateToken(u.getEmail(), roles);
            Cookie cookie = new Cookie("JWT", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // set to true if you use HTTPS in production
            cookie.setPath("/");
            cookie.setMaxAge(60 * 60 * 24); // 1 day
            response.addCookie(cookie);
            boolean isAdmin = roles.contains("ROLE_ADMIN");
            if (isAdmin) {
                redirectAttributes.addFlashAttribute("message", "Logged in as admin");
                return "redirect:/admin/users";
            }
        }
        return "redirect:/";
    }
}
