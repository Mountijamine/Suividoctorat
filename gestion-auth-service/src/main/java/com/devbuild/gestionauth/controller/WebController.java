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
        // Redirect to SPA entry; Angular will render the login page client-side.
        return "redirect:/";
    }

    @GetMapping("/signup")
    public String signupPage() {
        return "redirect:/";
    }

    @PostMapping(value = "/signup", consumes = org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public String signupForm(@org.springframework.web.bind.annotation.RequestParam java.util.Map<String, String> params, org.springframework.ui.Model model) {
        String email = params.get("email");
        String password = params.get("password");
        String confirm = params.get("confirmPassword");
        String firstName = params.get("firstName");
        String lastName = params.get("lastName");
    String phone = params.get("phone");
    String affiliation = params.get("affiliation");
    String accept = params.get("acceptTerms");
        if (email == null || password == null || confirm == null) { model.addAttribute("error","Missing fields"); return "signup"; }
        if (!password.equals(confirm)) { model.addAttribute("error","Passwords do not match"); return "signup"; }
        if (!"on".equalsIgnoreCase(accept) && !"true".equalsIgnoreCase(accept)) { model.addAttribute("error","You must accept terms"); return "signup"; }
    // Users sign up as generic users; requested profile is collected later via profile update
    userService.createUserWithProfile(email, password, firstName, lastName, phone, true, null, affiliation);
        return "redirect:/login";
    }


    @GetMapping("/")
    public String index(Model model) {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        // Let the SPA decide routing for authenticated/anonymous users.
        // Forward to Angular index (resources/static/index.html) so the SPA can handle client-side routing.
        return "forward:/index.html";
    }

    @PostMapping(value = "/login", consumes = org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public String loginForm(@org.springframework.web.bind.annotation.RequestParam java.util.Map<String, String> params, org.springframework.ui.Model model, HttpServletResponse response, org.springframework.web.servlet.mvc.support.RedirectAttributes redirectAttributes, jakarta.servlet.http.HttpServletRequest request) {
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
            // mark Secure only when request uses HTTPS
            try {
                cookie.setSecure(request.isSecure());
            } catch (Exception ignored) {
                cookie.setSecure(false);
            }
            cookie.setPath("/");
            cookie.setMaxAge(60 * 60 * 24); // 1 day
            response.addCookie(cookie);
            boolean isAdmin = roles.contains("ROLE_ADMIN");
            if (isAdmin) {
                redirectAttributes.addFlashAttribute("message", "Logged in as admin");
                return "redirect:/admin/users";
            }
        }
        return "redirect:/dashboard";
    }

    @GetMapping("/logout")
    public String logout(HttpServletResponse response, jakarta.servlet.http.HttpServletRequest request, org.springframework.web.servlet.mvc.support.RedirectAttributes redirectAttributes) {
        // remove JWT cookie
        Cookie cookie = new Cookie("JWT", "");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        try { cookie.setSecure(request.isSecure()); } catch (Exception ignored) {}
        response.addCookie(cookie);
        // invalidate server session if present
        try {
            jakarta.servlet.http.HttpSession session = request.getSession(false);
            if (session != null) session.invalidate();
        } catch (Exception ignored) {}
        redirectAttributes.addFlashAttribute("message", "Logged out");
        return "redirect:/login";
    }
}
