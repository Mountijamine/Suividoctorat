package com.devbuild.gestionauth.controller;

import com.devbuild.gestionauth.model.Role;
import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.security.JwtUtil;
import com.devbuild.gestionauth.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthApiController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthApiController(UserService userService, JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String confirm = body.get("confirmPassword");
        String firstName = body.get("firstName");
        String lastName = body.get("lastName");
        String phone = body.get("phone");
        String accept = body.get("acceptTerms");
        String requestedProfile = body.get("requestedProfile");
        if (email == null || password == null || confirm == null) return ResponseEntity.badRequest().build();
        // If a user with the email already exists, return a clear conflict message instead of a generic forbidden
        if (userService.findByEmail(email).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "Email is already registered"));
        }
        if (!password.equals(confirm)) return ResponseEntity.badRequest().body(Map.of("message","passwords do not match"));
        if (!"true".equalsIgnoreCase(accept)) return ResponseEntity.badRequest().body(Map.of("message","terms must be accepted"));
        User u = userService.createUserWithProfile(email, password, firstName, lastName, phone, true, requestedProfile);
        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("id", u.getId());
        resp.put("email", u.getEmail());
        return ResponseEntity.ok(resp);
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null) return ResponseEntity.badRequest().build();
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        } catch (AuthenticationException ex) {
            java.util.Map<String, String> err = new java.util.HashMap<>();
            err.put("message", "invalid credentials");
            return ResponseEntity.status(401).body(err);
        }
        User u = userService.findByEmail(email).orElse(null);
        Set<String> roles = u.getRoles().stream().map(Enum::name).collect(Collectors.toSet());
        String token = jwtUtil.generateToken(u.getEmail(), roles);
        java.util.Map<String, String> tok = new java.util.HashMap<>();
        tok.put("token", token);
        return ResponseEntity.ok(tok);
    }

    // Form handlers moved to WebController (MVC controller) so redirects render correctly

    @PostMapping("/assign-role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> assignRole(@RequestBody Map<String, String> body, Authentication auth) {
        String email = body.get("email");
        String role = body.get("role");
        if (email == null || role == null) return ResponseEntity.badRequest().build();
        String actor = auth != null ? auth.getName() : "system";
        User u = userService.assignRole(email, Role.valueOf(role), actor);
        return ResponseEntity.ok(Map.of("email", u.getEmail(), "roles", u.getRoles(), "performedBy", actor));
    }

    @PostMapping("/approve-user")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> approveUser(@RequestBody Map<String, String> body, Authentication auth) {
        String email = body.get("email");
        if (email == null) return ResponseEntity.badRequest().build();
        String approver = auth != null ? auth.getName() : "unknown";
        User u = userService.approveAndAssign(email, approver);
        return ResponseEntity.ok(Map.of("email", u.getEmail(), "approved", u.getApproved()));
    }
}
