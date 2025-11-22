package com.devbuild.gestionauth.controller;

import com.devbuild.gestionauth.model.Role;
import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.model.RoleRequest;
import com.devbuild.gestionauth.repository.RoleRequestRepository;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthApiController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RoleRequestRepository roleRequestRepository;

    public AuthApiController(UserService userService, JwtUtil jwtUtil, AuthenticationManager authenticationManager, RoleRequestRepository roleRequestRepository) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.roleRequestRepository = roleRequestRepository;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        try {
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
        } catch (Exception ex) {
            // Log full stacktrace to server logs and return helpful JSON to the frontend for debugging
            try { System.err.println("[AuthApiController] /signup error: " + ex.getClass().getName() + ": " + ex.getMessage()); ex.printStackTrace(); } catch (Throwable t) {}
            return ResponseEntity.status(500).body(Map.of("message", "Server error during signup", "error", ex.getMessage(), "exception", ex.getClass().getName()));
        }
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
        if (u == null) return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        // Block login if email not verified. Provide code or link without confusing rate-limit responses.
        if (u.getEmailVerified() == null || !u.getEmailVerified()) {
            java.time.LocalDateTime now = java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC).toLocalDateTime();
            boolean hasValidCode = u.getVerificationCode() != null && u.getVerificationExpiry() != null && u.getVerificationExpiry().isAfter(now);
            if (hasValidCode) {
                // Code already sent and still valid; do not attempt resend.
                return ResponseEntity.status(403).body(Map.of(
                        "message", "email not verified",
                        "action", "enter existing verification code or click confirmation link",
                        "codeExisting", true));
            }
            boolean sent = false;
            try { sent = userService.sendVerificationCode(u); } catch (Exception ignored) {}
            if (sent) {
                return ResponseEntity.status(403).body(Map.of(
                        "message", "email not verified",
                        "action", "verification code sent; check email or use confirmation link",
                        "codeExisting", false));
            }
            // Unable to send (rate-limited) and no valid code present -> inform user without 429 confusion if expired code exists
            boolean expiredCodePresent = u.getVerificationCode() != null;
            if (expiredCodePresent) {
                return ResponseEntity.status(403).body(Map.of(
                        "message", "email not verified",
                        "action", "previous code expired; wait before requesting a new one or use confirmation link",
                        "codeExisting", false,
                        "rateLimited", true));
            }
            return ResponseEntity.status(429).body(Map.of("message", "verification code rate-limited", "action", "try again later"));
        }
        Set<String> roles = u.getRoles().stream().map(Enum::name).collect(Collectors.toSet());
        String token = jwtUtil.generateToken(u.getEmail(), roles);
        java.util.Map<String, String> tok = new java.util.HashMap<>();
        tok.put("token", token);
        return ResponseEntity.ok(tok);
    }

    @GetMapping("/confirm")
    public ResponseEntity<?> confirmEmail(@RequestParam(value = "token", required = false) String token) {
        if (token == null || token.isBlank()) return ResponseEntity.badRequest().body(Map.of("message", "token required"));
        boolean ok = userService.confirmEmailByToken(token);
        if (ok) return ResponseEntity.ok(Map.of("message", "Email confirmed"));
        return ResponseEntity.status(400).body(Map.of("message", "Invalid or expired token"));
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null) return ResponseEntity.badRequest().body(Map.of("message", "email required"));
        // For privacy, always return success message even if email unknown
        try {
            boolean initiated = userService.requestPasswordReset(email);
            return ResponseEntity.ok(Map.of("message", "If the email exists, a password reset link was sent"));
        } catch (Exception ex) {
            // Log full stacktrace to help debugging in development environment
            try { System.err.println("[AuthApiController] requestPasswordReset error: " + ex.getMessage()); ex.printStackTrace(); } catch (Throwable t) {}
            return ResponseEntity.status(500).body(Map.of("message", "Server error", "error", ex.getMessage()));
        }
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<?> confirmPasswordReset(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String password = body.get("password");
        String confirm = body.get("confirmPassword");
        String code = body.get("code");
        String email = body.get("email");
        if (password == null || confirm == null) return ResponseEntity.badRequest().body(Map.of("message", "passwords required"));
        if (!password.equals(confirm)) return ResponseEntity.badRequest().body(Map.of("message", "passwords do not match"));
        boolean ok = false;
        if (code != null && email != null) {
            // consume code-based reset
            ok = userService.resetPasswordWithCode(email, code, password);
            if (!ok) return ResponseEntity.status(400).body(Map.of("message", "Invalid or expired code"));
            return ResponseEntity.ok(Map.of("message", "Password reset successful"));
        }
        if (token == null) return ResponseEntity.badRequest().body(Map.of("message", "token or code required"));
        ok = userService.resetPassword(token, password);
        if (!ok) return ResponseEntity.status(400).body(Map.of("message", "Invalid or expired token"));
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    @PostMapping("/send-verification-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null) return ResponseEntity.badRequest().body(Map.of("message", "email required"));
        var uOpt = userService.findByEmail(email);
        if (uOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        User u = uOpt.get();
        if (u.getEmailVerified() != null && u.getEmailVerified()) return ResponseEntity.badRequest().body(Map.of("message", "Email already verified"));
        boolean sent = userService.sendVerificationCode(u);
        if (!sent) return ResponseEntity.status(429).body(Map.of("message", "verification code rate-limited", "action", "try again later"));
        return ResponseEntity.ok(Map.of("message", "Verification code sent"));
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        if (email == null || code == null) return ResponseEntity.badRequest().body(Map.of("message", "email and code required"));
        boolean ok = userService.verifyCode(email, code);
        if (!ok) return ResponseEntity.status(400).body(Map.of("message", "Invalid or expired code"));
        return ResponseEntity.ok(Map.of("message", "Email verified"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        }
        try {
            User user = userService.findByEmail(auth.getName()).orElse(null);
            if (user == null) return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            java.util.Map<String, Object> resp = new java.util.HashMap<>();
            resp.put("email", user.getEmail());
            resp.put("firstName", user.getFirstName() != null ? user.getFirstName() : "");
            resp.put("lastName", user.getLastName() != null ? user.getLastName() : "");
            resp.put("phone", user.getPhone() != null ? user.getPhone() : "");
            resp.put("enrollmentDate", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
            resp.put("roles", user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()));
            return ResponseEntity.ok(resp);
        } catch (Exception ex) {
            try { System.err.println("[AuthApiController] /me error: " + ex.getMessage()); } catch (Throwable t) {}
            return ResponseEntity.status(500).body(Map.of("message", "Server error"));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        }
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        String confirm = body.get("confirmNewPassword");
        if (oldPassword == null || newPassword == null || confirm == null) return ResponseEntity.badRequest().body(Map.of("message", "oldPassword, newPassword and confirmNewPassword are required"));
        if (!newPassword.equals(confirm)) return ResponseEntity.badRequest().body(Map.of("message", "new passwords do not match"));
        try {
            boolean ok = userService.changePassword(auth.getName(), oldPassword, newPassword);
            if (!ok) return ResponseEntity.status(400).body(Map.of("message", "Invalid old password or new password policy not met"));
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception ex) {
            try { System.err.println("[AuthApiController] changePassword error: " + ex.getMessage()); ex.printStackTrace(); } catch (Throwable t) {}
            return ResponseEntity.status(500).body(Map.of("message", "Server error", "error", ex.getMessage()));
        }
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

    // Role change for candidat (immediate, no approval needed)
    @PatchMapping("/role")
    public ResponseEntity<?> updateRole(@RequestBody Map<String, String> body, Authentication auth) {
        try {
            // Allow any authenticated user to upgrade to candidat
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
            }
            
            String role = body.get("role");
            if (role == null || !role.equalsIgnoreCase("candidat")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only candidat role can be self-assigned"));
            }
            String email = auth.getName();
            // Replace default ROLE_USER with ROLE_CANDIDAT atomically in service layer
            User user = userService.replaceUserRoleWithCandidat(email, "self");
            // Generate a refreshed token reflecting new roles so clients can update immediately
            Set<String> roles = user.getRoles().stream().map(Enum::name).collect(Collectors.toSet());
            String token = jwtUtil.generateToken(user.getEmail(), roles);
            java.util.Map<String, Object> resp = new java.util.HashMap<>();
            resp.put("message", "Role updated successfully");
            resp.put("token", token);
            resp.put("roles", roles);
            return ResponseEntity.ok(resp);
        } catch (Exception ex) {
            // Log and return a helpful JSON body during development to aid debugging
            try { System.err.println("[AuthApiController] updateRole error: " + ex.getClass().getName() + ": " + ex.getMessage()); ex.printStackTrace(); } catch (Throwable t) {}
            return ResponseEntity.status(500).body(Map.of("message", "Server error during role update", "error", ex.getMessage(), "exception", ex.getClass().getName()));
        }
    }

    // Submit role request (for directeur/admin - requires approval)
    @PostMapping(value = "/role-requests", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitRoleRequest(
            @RequestParam("role") String roleName,
            @RequestParam(value = "affiliation", required = false) String affiliation,
            @RequestParam(value = "justification", required = false) String justification,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "province", required = false) String province,
            @RequestParam(value = "frontId", required = false) MultipartFile frontId,
            @RequestParam(value = "backId", required = false) MultipartFile backId,
            Authentication auth) {
        
        // Allow any authenticated user to request role upgrade
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        }
        
        String email = auth.getName();
        User user = userService.findByEmail(email).orElseThrow();

        Role requestedRole;
        try {
            requestedRole = Role.valueOf("ROLE_" + roleName.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role"));
        }

        RoleRequest request = new RoleRequest(user, requestedRole);
        request.setAffiliation(affiliation);
        request.setJustification(justification);
        request.setUsername(username);
        request.setProvince(province);

        // Save uploaded files
        if (frontId != null && !frontId.isEmpty()) {
            String frontPath = saveFile(frontId, user.getId());
            request.setFrontIdPath(frontPath);
        }
        if (backId != null && !backId.isEmpty()) {
            String backPath = saveFile(backId, user.getId());
            request.setBackIdPath(backPath);
        }

        roleRequestRepository.save(request);
        return ResponseEntity.ok(Map.of("message", "Request submitted successfully"));
    }

    // Get all role requests (admin only)
    @GetMapping("/role-requests")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getRoleRequests(@RequestParam(value = "status", required = false) String status) {
        var requests = status != null ? 
            roleRequestRepository.findByStatus(status) : 
            roleRequestRepository.findAll();
        
        var result = requests.stream().map(r -> {
            Map<String, Object> userMap = new java.util.HashMap<>();
            userMap.put("id", r.getUser().getId());
            userMap.put("email", r.getUser().getEmail());
            userMap.put("firstName", r.getUser().getFirstName() != null ? r.getUser().getFirstName() : "");
            userMap.put("lastName", r.getUser().getLastName() != null ? r.getUser().getLastName() : "");
            
            Map<String, Object> requestMap = new java.util.HashMap<>();
            requestMap.put("id", r.getId());
            requestMap.put("user", userMap);
            requestMap.put("requestedRole", r.getRequestedRole().name());
            requestMap.put("status", r.getStatus());
            requestMap.put("affiliation", r.getAffiliation() != null ? r.getAffiliation() : "");
            requestMap.put("justification", r.getJustification() != null ? r.getJustification() : "");
            requestMap.put("username", r.getUsername() != null ? r.getUsername() : "");
            requestMap.put("province", r.getProvince() != null ? r.getProvince() : "");
            requestMap.put("createdAt", r.getCreatedAt().toString());
            requestMap.put("frontIdPath", r.getFrontIdPath() != null ? r.getFrontIdPath() : "");
            requestMap.put("backIdPath", r.getBackIdPath() != null ? r.getBackIdPath() : "");
            // expose convenient URLs so frontend can fetch the images
            if (r.getFrontIdPath() != null) {
                requestMap.put("frontIdUrl", "/api/auth/role-requests/" + r.getId() + "/file/front");
            } else {
                requestMap.put("frontIdUrl", "");
            }
            if (r.getBackIdPath() != null) {
                requestMap.put("backIdUrl", "/api/auth/role-requests/" + r.getId() + "/file/back");
            } else {
                requestMap.put("backIdUrl", "");
            }
            requestMap.put("reviewReason", r.getReviewReason() != null ? r.getReviewReason() : "");
            requestMap.put("notifyByEmail", r.getNotifyByEmail() != null ? r.getNotifyByEmail() : false);
            
            return requestMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // Get current user's role requests
    @GetMapping("/role-requests/mine")
    public ResponseEntity<?> getMyRoleRequests(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        User user = userService.findByEmail(auth.getName()).orElseThrow();
        var requests = roleRequestRepository.findByUser(user);
        var result = requests.stream().map(r -> {
            Map<String, Object> requestMap = new java.util.HashMap<>();
            requestMap.put("id", r.getId());
            requestMap.put("requestedRole", r.getRequestedRole().name());
            requestMap.put("status", r.getStatus());
            requestMap.put("createdAt", r.getCreatedAt().toString());
            requestMap.put("affiliation", r.getAffiliation() != null ? r.getAffiliation() : "");
            requestMap.put("justification", r.getJustification() != null ? r.getJustification() : "");
            requestMap.put("frontIdPath", r.getFrontIdPath() != null ? r.getFrontIdPath() : "");
            requestMap.put("backIdPath", r.getBackIdPath() != null ? r.getBackIdPath() : "");
            if (r.getFrontIdPath() != null) requestMap.put("frontIdUrl", "/api/auth/role-requests/" + r.getId() + "/file/front"); else requestMap.put("frontIdUrl", "");
            if (r.getBackIdPath() != null) requestMap.put("backIdUrl", "/api/auth/role-requests/" + r.getId() + "/file/back"); else requestMap.put("backIdUrl", "");
            requestMap.put("reviewReason", r.getReviewReason() != null ? r.getReviewReason() : "");
            requestMap.put("notifyByEmail", r.getNotifyByEmail() != null ? r.getNotifyByEmail() : false);
            return requestMap;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // Approve role request (accepts optional reason and notifyByEmail flag)
    @PostMapping("/role-requests/{id}/approve")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> approveRoleRequest(@PathVariable("id") Long id, @RequestBody(required = false) Map<String, Object> body, Authentication auth) {
        RoleRequest request = roleRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Request already processed"));
        }

        String reason = null;
        Boolean notify = false;
        if (body != null) {
            reason = (String) body.getOrDefault("reason", null);
            Object n = body.get("notifyByEmail");
            if (n instanceof Boolean) notify = (Boolean) n;
            else if (n instanceof String) notify = Boolean.parseBoolean((String) n);
        }

        request.setStatus("APPROVED");
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedBy(auth.getName());
        request.setReviewReason(reason);
        request.setNotifyByEmail(notify);
        roleRequestRepository.save(request);

        // Remove default ROLE_USER if present, then assign the requested role
        try {
            userService.removeRole(request.getUser().getEmail(), com.devbuild.gestionauth.model.Role.ROLE_USER, auth.getName());
        } catch (Exception ignored) {}
        userService.assignRole(request.getUser().getEmail(), request.getRequestedRole(), auth.getName());

        // If requested, send a notification (placeholder logging for now)
        if (Boolean.TRUE.equals(notify)) {
            try { System.err.println("[AuthApiController] Notify by email: approved " + request.getUser().getEmail() + " reason=" + reason); } catch (Throwable t) {}
        }

        return ResponseEntity.ok(Map.of("message", "Request approved"));
    }

    // Reject role request (accepts optional reason and notifyByEmail flag)
    @PostMapping("/role-requests/{id}/reject")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> rejectRoleRequest(@PathVariable("id") Long id, @RequestBody(required = false) Map<String, Object> body, Authentication auth) {
        RoleRequest request = roleRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Request already processed"));
        }

        String reason = null;
        Boolean notify = false;
        if (body != null) {
            reason = (String) body.getOrDefault("reason", null);
            Object n = body.get("notifyByEmail");
            if (n instanceof Boolean) notify = (Boolean) n;
            else if (n instanceof String) notify = Boolean.parseBoolean((String) n);
        }

        request.setStatus("REJECTED");
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedBy(auth.getName());
        request.setReviewReason(reason);
        request.setNotifyByEmail(notify);
        roleRequestRepository.save(request);

        if (Boolean.TRUE.equals(notify)) {
            try { System.err.println("[AuthApiController] Notify by email: rejected " + request.getUser().getEmail() + " reason=" + reason); } catch (Throwable t) {}
        }

        return ResponseEntity.ok(Map.of("message", "Request rejected"));
    }

    // Send a message to the requester (dev/admin tool). This endpoint is intentionally simple
    // and primarily for admin communication; in production this should integrate with a notification service.
    @PostMapping("/role-requests/{id}/message")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> messageRoleRequest(@PathVariable("id") Long id, @RequestBody Map<String, String> body, Authentication auth) {
        RoleRequest request = roleRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        String message = body.getOrDefault("message", "");
        // Log the message for now — notification integration can be added later
        try { System.err.println("[AuthApiController] Admin message to " + request.getUser().getEmail() + ": " + message); } catch (Throwable t) {}
        return ResponseEntity.ok(Map.of("message", "Message recorded"));
    }

    // Cancel a pending role request (requester can cancel within a short window)
    @PostMapping("/role-requests/{id}/cancel")
    public ResponseEntity<?> cancelRoleRequest(@PathVariable("id") Long id, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        RoleRequest request = roleRequestRepository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        User user = userService.findByEmail(auth.getName()).orElseThrow();
        if (!request.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }
        if (!"PENDING".equals(request.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Request already processed"));
        }
        // allow cancel only within 5 minutes of creation
        java.time.Duration since = java.time.Duration.between(request.getCreatedAt(), java.time.LocalDateTime.now());
        if (since.toMinutes() > 5) {
            return ResponseEntity.status(400).body(Map.of("message", "Cancellation window expired"));
        }
        request.setStatus("CANCELLED");
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedBy(auth.getName());
        roleRequestRepository.save(request);
        return ResponseEntity.ok(Map.of("message", "Request cancelled"));
    }

    // Helper method to save uploaded files
    private String saveFile(MultipartFile file, Long userId) {
        try {
            String uploadDir = "uploads/role-requests/" + userId;
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);
            return filePath.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file", e);
        }
    }

    // Serve stored role-request front/back files to authorized users (owner or admin)
    @GetMapping("/role-requests/{id}/file/{side}")
    public ResponseEntity<?> getRoleRequestFile(@PathVariable("id") Long id, @PathVariable("side") String side, Authentication auth) {
        RoleRequest request = roleRequestRepository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        if (auth == null || !auth.isAuthenticated()) return ResponseEntity.status(401).body(Map.of("message","Authentication required"));
        User requesting = userService.findByEmail(auth.getName()).orElseThrow();
        boolean isAdmin = requesting.getRoles().stream().anyMatch(r -> r.name().equals("ROLE_ADMIN"));
        boolean owner = request.getUser().getId().equals(requesting.getId());
        if (!isAdmin && !owner) return ResponseEntity.status(403).body(Map.of("message","Forbidden"));

        String path = null;
        if ("front".equalsIgnoreCase(side)) path = request.getFrontIdPath();
        else if ("back".equalsIgnoreCase(side)) path = request.getBackIdPath();
        if (path == null || path.isBlank()) return ResponseEntity.notFound().build();

        java.io.File f = new java.io.File(path);
        if (!f.exists()) return ResponseEntity.notFound().build();

        FileSystemResource fsr = new FileSystemResource(f);
        String contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        try { contentType = java.nio.file.Files.probeContentType(f.toPath()); } catch (Exception ignored) {}
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + f.getName() + "\"")
                .contentLength(f.length())
                .contentType(MediaType.parseMediaType(contentType == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : contentType))
                .body(fsr);
    }
}
