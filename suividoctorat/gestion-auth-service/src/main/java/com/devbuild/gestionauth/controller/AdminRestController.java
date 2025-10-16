package com.devbuild.gestionauth.controller;

import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminRestController {

    private final UserService userService;

    public AdminRestController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> listUsers(@RequestParam(name = "role", required = false) String role) {
        if (role != null && !role.isBlank()) {
            try {
                return ResponseEntity.ok(userService.findUsersByRole(com.devbuild.gestionauth.model.Role.valueOf(role)));
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @PostMapping("/approve-user")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> approveUser(@RequestBody Map<String,String> body, java.security.Principal principal) {
        String email = body.get("email");
        if (email == null) return ResponseEntity.badRequest().body(Map.of("message","missing email"));
        String approver = principal != null ? principal.getName() : "system";
        User u = userService.approveAndAssign(email, approver);
        return ResponseEntity.ok(Map.of("email", u.getEmail(), "approved", u.getApproved()));
    }

    @PostMapping("/reject-user")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> rejectUser(@RequestBody Map<String,String> body, java.security.Principal principal) {
        String email = body.get("email");
        String reason = body.getOrDefault("reason", "");
        if (email == null) return ResponseEntity.badRequest().body(Map.of("message","missing email"));
        String approver = principal != null ? principal.getName() : "system";
        userService.rejectUser(email, reason, approver);
        return ResponseEntity.ok(Map.of("email", email, "rejected", true));
    }

    @PostMapping("/delete-user")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@RequestBody Map<String,String> body) {
        String email = body.get("email");
        if (email == null) return ResponseEntity.badRequest().body(Map.of("message","missing email"));
        userService.deleteUser(email);
        return ResponseEntity.ok(Map.of("email", email, "deleted", true));
    }

    @PostMapping("/assign-role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> assignRole(@RequestBody Map<String,String> body, java.security.Principal principal) {
        String email = body.get("email");
        String role = body.get("role");
        if (email == null || role == null) return ResponseEntity.badRequest().body(Map.of("message","missing fields"));
        String actor = principal != null ? principal.getName() : "system";
        userService.assignRole(email, com.devbuild.gestionauth.model.Role.valueOf(role), actor);
        return ResponseEntity.ok(Map.of("email", email, "role", role));
    }

    @PostMapping("/remove-role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> removeRole(@RequestBody Map<String,String> body, java.security.Principal principal) {
        String email = body.get("email");
        String role = body.get("role");
        if (email == null || role == null) return ResponseEntity.badRequest().body(Map.of("message","missing fields"));
        String actor = principal != null ? principal.getName() : "system";
        userService.removeRole(email, com.devbuild.gestionauth.model.Role.valueOf(role), actor);
        return ResponseEntity.ok(Map.of("email", email, "role", role));
    }

    @PostMapping("/disable-user")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> disableUser(@RequestBody Map<String,Object> body) {
        String email = (String) body.get("email");
        Boolean disable = body.get("disable") == null ? Boolean.TRUE : Boolean.valueOf(body.get("disable").toString());
        if (email == null) return ResponseEntity.badRequest().body(Map.of("message","missing email"));
        userService.setDisabled(email, disable);
        return ResponseEntity.ok(Map.of("email", email, "disabled", disable));
    }
}
