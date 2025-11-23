package com.devbuild.gestionauth.service;

import com.devbuild.gestionauth.model.Role;
import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Value;
import com.devbuild.gestionauth.notification.NotificationClient;
import reactor.core.publisher.Mono;

import java.util.Optional;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationClient notificationClient;
    private final com.devbuild.gestionauth.repository.RoleAuditRepository roleAuditRepository;
    private final JdbcTemplate jdbcTemplate;
    @Value("${app.notification.url:}")
    private String notificationUrl;
    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, NotificationClient notificationClient, com.devbuild.gestionauth.repository.RoleAuditRepository roleAuditRepository, JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationClient = notificationClient;
        this.roleAuditRepository = roleAuditRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public User createUser(String email, String rawPassword) {
        User u = new User();
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setCreatedAt(java.time.LocalDateTime.now());
        u.getRoles().add(Role.ROLE_USER);
        User saved = userRepository.save(u);
        try {
            String req = saved.getRequestedProfile();
            if (notificationUrl != null && !notificationUrl.isBlank() && req != null) {
                java.util.Map<String, String> payload = new java.util.HashMap<>();
                payload.put("type", "profile_request");
                payload.put("email", saved.getEmail());
                payload.put("requestedProfile", req);
                notificationClient.sendProfileRequest(payload).subscribe();
            }
        } catch (Exception ex) {
        }
        return saved;
    }

    public User createUserWithProfile(String email, String rawPassword, String firstName, String lastName, String phone, boolean acceptTerms, String requestedProfile, String affiliation) {
        User u = new User();
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setCreatedAt(java.time.LocalDateTime.now());
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setPhone(phone);
        u.setAcceptTerms(acceptTerms);
        u.setRequestedProfile(requestedProfile);
        u.setAffiliation(affiliation);
        u.getRoles().add(Role.ROLE_USER);
        u.setApproved(false);
        // generate email verification token
        String token = java.util.UUID.randomUUID().toString();
        u.setEmailVerificationToken(token);
        // generate initial verification code (6 digits) and expiry (15 min) for dual method
        String initialCode = String.format("%06d", new java.util.Random().nextInt(1_000_000));
        java.time.LocalDateTime now = java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC).toLocalDateTime();
        u.setVerificationCode(initialCode);
        u.setVerificationExpiry(now.plusMinutes(15));
        u.setVerificationSentAt(now);
        u.setVerificationSendCount(1);
        u.setVerificationSendCountReset(now.plusHours(24));
        User saved = userRepository.save(u);
        // send confirmation email (best-effort)
        try {
            if (notificationUrl != null && !notificationUrl.isBlank()) {
                java.util.Map<String, Object> payload = new java.util.HashMap<>();
                payload.put("to", saved.getEmail());
                payload.put("templateCode", "CONFIRM_EMAIL");
                java.util.Map<String, String> vars = new java.util.HashMap<>();
                vars.put("token", token);
                vars.put("link", frontendUrl + "/confirm?token=" + token);
                vars.put("fullname", (saved.getFirstName() != null ? saved.getFirstName() : ""));
                vars.put("code", initialCode);
                payload.put("variables", vars);
                // Log payload to console for debugging
                try { System.out.println("[UserService] Sending confirmation email payload to notification service: " + payload); } catch (Throwable t) {}
                notificationClient.sendEmailRequest(payload)
                    .doOnError(e -> {
                        try { System.err.println("[UserService] NotificationClient sendEmailRequest error: " + e.getMessage()); } catch (Throwable t) {}
                    })
                    .subscribe();
            } else {
                try { System.out.println("[UserService] app.notification.url is not configured; skipping email send"); } catch (Throwable t) {}
            }
        } catch (Exception ex) {
            try { System.err.println("[UserService] Exception while preparing notification payload: " + ex.getMessage()); } catch (Throwable t) {}
        }
        try {
            String req = saved.getRequestedProfile();
            if (notificationUrl != null && !notificationUrl.isBlank() && req != null) {
                java.util.Map<String, String> payload = new java.util.HashMap<>();
                payload.put("type", "profile_request");
                payload.put("email", saved.getEmail());
                payload.put("requestedProfile", req);
                // best-effort notification; ignore errors
                notificationClient.sendProfileRequest(payload).subscribe();
            }
        } catch (Exception ex) {
            // ignore notification failures
        }
        return saved;
    }

    public User createUserWithProfile(String email, String rawPassword, String firstName, String lastName, String phone, boolean acceptTerms) {
        return createUserWithProfile(email, rawPassword, firstName, lastName, phone, acceptTerms, null, null);
    }

    public User createUserWithProfile(String email, String rawPassword, String firstName, String lastName, String phone, boolean acceptTerms, String requestedProfile) {
        return createUserWithProfile(email, rawPassword, firstName, lastName, phone, acceptTerms, requestedProfile, null);
    }

    public User approveAndAssign(String email, String approver) {
        User u = userRepository.findByEmail(email).orElseThrow();
        if (u.getRequestedProfile() == null) return u;
        try {
            Role r = Role.valueOf(u.getRequestedProfile());
            u.getRoles().add(r);
            u.setApproved(true);
            u.setApprovedBy(approver);
            u.setApprovedAt(java.time.LocalDateTime.now());
            u.setRejectionReason(null);
            return userRepository.save(u);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Unknown requested profile: " + u.getRequestedProfile());
        }
    }

    public User approveAndAssign(String email) {
        return approveAndAssign(email, "system");
    }

    public User rejectUser(String email, String reason, String approver) {
        User u = userRepository.findByEmail(email).orElseThrow();
        u.setApproved(false);
        u.setRejectionReason(reason);
        u.setApprovedBy(approver);
        u.setApprovedAt(java.time.LocalDateTime.now());
        return userRepository.save(u);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Demande de réinitialisation : génère un token sécurisé, stocke son hash et envoie l'email.
     * Retourne true si l'opération a été initiée (même si l'envoi est best-effort).
     */
    public boolean requestPasswordReset(String email) {
        if (email == null) return false;
        var uOpt = userRepository.findByEmail(email);
        if (uOpt.isEmpty()) return false;
        User u = uOpt.get();
        try {
            // generate secure random token (URL-safe)
            SecureRandom rnd = new SecureRandom();
            byte[] bytes = new byte[32];
            rnd.nextBytes(bytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

            // hash token with SHA-256 before storing
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) { sb.append(String.format("%02x", b)); }
            String hash = sb.toString();

            java.time.LocalDateTime now = java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC).toLocalDateTime();
            // also generate a one-time 6-digit code (same concept as account creation)
            String code = String.format("%06d", new java.util.Random().nextInt(1_000_000));
            u.setPasswordResetTokenHash(hash);
            u.setPasswordResetExpiry(now.plusHours(1)); // token valide 1 heure
            // reuse verification code fields to provide alternative reset method (code)
            u.setVerificationCode(code);
            u.setVerificationExpiry(now.plusMinutes(15));
            u.setVerificationSentAt(now);
            if (u.getVerificationSendCountReset() == null || u.getVerificationSendCountReset().isBefore(now)) {
                u.setVerificationSendCount(1);
                u.setVerificationSendCountReset(now.plusHours(24));
            } else {
                u.setVerificationSendCount((u.getVerificationSendCount() == null ? 0 : u.getVerificationSendCount()) + 1);
            }
            userRepository.save(u);

            // prepare notification payload using existing notification service
            if (notificationUrl != null && !notificationUrl.isBlank()) {
                java.util.Map<String, Object> payload = new java.util.HashMap<>();
                payload.put("to", u.getEmail());
                payload.put("templateCode", "RESET_PASSWORD");
                java.util.Map<String, String> vars = new java.util.HashMap<>();
                vars.put("token", token);
                vars.put("link", frontendUrl + "/reset-password?token=" + token);
                vars.put("code", code);
                vars.put("fullname", (u.getFirstName() != null ? u.getFirstName() : ""));
                payload.put("variables", vars);
                try { System.out.println("[UserService] Sending password reset email payload: " + payload); } catch (Throwable t) {}
                notificationClient.sendEmailRequest(payload)
                    .doOnError(e -> { try { System.err.println("[UserService] sendPasswordReset email error: " + e.getMessage()); } catch (Throwable t) {} })
                    .subscribe();
            }
            return true;
        } catch (Exception ex) {
            try { System.err.println("[UserService] requestPasswordReset error: " + ex.getMessage()); ex.printStackTrace(); } catch (Throwable t) {}
            return false;
        }
    }

    /**
     * Consomme le token et met à jour le mot de passe si valide.
     */
    public boolean resetPassword(String token, String newRawPassword) {
        if (token == null || newRawPassword == null) return false;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) { sb.append(String.format("%02x", b)); }
            String hash = sb.toString();

            var uOpt = userRepository.findByPasswordResetTokenHash(hash);
            if (uOpt.isEmpty()) return false;
            User u = uOpt.get();
            java.time.LocalDateTime now = java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC).toLocalDateTime();
            if (u.getPasswordResetExpiry() == null || u.getPasswordResetExpiry().isBefore(now)) return false;

            u.setPassword(passwordEncoder.encode(newRawPassword));
            // invalidate token
            u.setPasswordResetTokenHash(null);
            u.setPasswordResetExpiry(null);
            userRepository.save(u);
            return true;
        } catch (Exception ex) {
            try { System.err.println("[UserService] resetPassword error: " + ex.getMessage()); } catch (Throwable t) {}
            return false;
        }
    }

    /**
     * Reset password using a 6-digit code sent by email (alternative to link).
     */
    public boolean resetPasswordWithCode(String email, String code, String newRawPassword) {
        if (email == null || code == null || newRawPassword == null) return false;
        var uOpt = userRepository.findByEmail(email);
        if (uOpt.isEmpty()) return false;
        User u = uOpt.get();
        try {
            String stored = u.getVerificationCode();
            if (stored == null) return false;
            if (!stored.trim().equals(code.trim())) return false;
            java.time.LocalDateTime now = java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC).toLocalDateTime();
            if (u.getVerificationExpiry() == null || u.getVerificationExpiry().isBefore(now)) return false;
            u.setPassword(passwordEncoder.encode(newRawPassword));
            // invalidate both code and any outstanding token
            u.setVerificationCode(null);
            u.setVerificationExpiry(null);
            u.setPasswordResetTokenHash(null);
            u.setPasswordResetExpiry(null);
            userRepository.save(u);
            return true;
        } catch (Exception ex) {
            try { System.err.println("[UserService] resetPasswordWithCode error: " + ex.getMessage()); } catch (Throwable t) {}
            return false;
        }
    }

    public java.util.List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public java.util.List<User> findUsersByRole(Role role) {
        return userRepository.findByRolesContaining(role);
    }

    public boolean confirmEmailByToken(String token) {
        if (token == null || token.isBlank()) return false;
        var uOpt = userRepository.findByEmailVerificationToken(token);
        if (uOpt.isEmpty()) return false;
        User u = uOpt.get();
        u.setEmailVerified(true);
        u.setEmailVerificationToken(null);
        // clear any one-time code as well
        u.setVerificationCode(null);
        u.setVerificationExpiry(null);
        userRepository.save(u);
        return true;
    }

    public boolean sendVerificationCode(User u) {
        if (u == null) return false;
        try {
            java.time.LocalDateTime now = java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC).toLocalDateTime();
            // enforce minimum interval between sends (e.g., 60 seconds)
            if (u.getVerificationSentAt() != null && u.getVerificationSentAt().isAfter(now.minusSeconds(60))) {
                try { System.out.println("[UserService] sendVerificationCode suppressed: sent too recently"); } catch (Throwable t) {}
                return false;
            }
            // reset daily counter if window expired
            if (u.getVerificationSendCountReset() == null || u.getVerificationSendCountReset().isBefore(now)) {
                u.setVerificationSendCount(0);
                u.setVerificationSendCountReset(now.plusHours(24));
            }
            if (u.getVerificationSendCount() == null) u.setVerificationSendCount(0);
            // limit sends per 24h (e.g., 5)
            if (u.getVerificationSendCount() >= 5) {
                try { System.out.println("[UserService] sendVerificationCode suppressed: daily limit reached"); } catch (Throwable t) {}
                return false;
            }

            String code = String.format("%06d", new java.util.Random().nextInt(1_000_000));
            u.setVerificationCode(code);
            u.setVerificationExpiry(now.plusMinutes(15));
            u.setVerificationSentAt(now);
            u.setVerificationSendCount(u.getVerificationSendCount() + 1);
            userRepository.save(u);
            // send via notification service
            if (notificationUrl != null && !notificationUrl.isBlank()) {
                java.util.Map<String, Object> payload = new java.util.HashMap<>();
                payload.put("to", u.getEmail());
                payload.put("templateCode", "VERIFY_CODE");
                java.util.Map<String, String> vars = new java.util.HashMap<>();
                vars.put("code", code);
                vars.put("fullname", (u.getFirstName() != null ? u.getFirstName() : ""));
                vars.put("link", frontendUrl + "/confirm?token=" + (u.getEmailVerificationToken() != null ? u.getEmailVerificationToken() : ""));
                payload.put("variables", vars);
                try { System.out.println("[UserService] Sending verification code payload to notification service: " + payload); } catch (Throwable t) {}
                notificationClient.sendEmailRequest(payload)
                    .doOnError(e -> { try { System.err.println("[UserService] sendVerificationCode error: " + e.getMessage()); } catch (Throwable t) {} })
                    .subscribe();
            } else {
                try { System.out.println("[UserService] app.notification.url is not configured; skipping code send but saved code=" + code); } catch (Throwable t) {}
            }
            return true;
        } catch (Exception ex) {
            try { System.err.println("[UserService] Exception while sending verification code: " + ex.getMessage()); } catch (Throwable t) {}
            return false;
        }
    }

    public boolean verifyCode(String email, String code) {
        if (email == null || code == null) {
            try { System.out.println("[UserService] verifyCode: email or code is null"); } catch (Throwable t) {}
            return false;
        }
        var uOpt = userRepository.findByEmail(email);
        if (uOpt.isEmpty()) {
            try { System.out.println("[UserService] verifyCode: user not found for email=" + email); } catch (Throwable t) {}
            return false;
        }
        User u = uOpt.get();
        if (u.getVerificationCode() == null) {
            try { System.out.println("[UserService] verifyCode: no code stored for user=" + email); } catch (Throwable t) {}
            return false;
        }
        String storedCode = (u.getVerificationCode() != null) ? u.getVerificationCode().trim() : "";
        String inputCode = (code != null) ? code.trim() : "";
        try { System.out.println("[UserService] verifyCode: stored='" + storedCode + "' input='" + inputCode + "' for user=" + email); } catch (Throwable t) {}
        if (!storedCode.equals(inputCode)) {
            try { System.out.println("[UserService] verifyCode: CODE MISMATCH"); } catch (Throwable t) {}
            return false;
        }
        java.time.LocalDateTime now = java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC).toLocalDateTime();
        if (u.getVerificationExpiry() != null && u.getVerificationExpiry().isBefore(now)) {
            try { System.out.println("[UserService] verifyCode: CODE EXPIRED - expiry=" + u.getVerificationExpiry() + " now=" + now); } catch (Throwable t) {}
            return false;
        }
        try { System.out.println("[UserService] verifyCode: SUCCESS for user=" + email + ", setting emailVerified=true"); } catch (Throwable t) {}
        u.setEmailVerified(true);
        u.setVerificationCode(null);
        u.setVerificationExpiry(null);
        u.setEmailVerificationToken(null);
        userRepository.save(u);
        return true;
    }

    public User assignRole(String email, Role role, String performedBy) {
        User u = userRepository.findByEmail(email).orElseThrow();
        u.getRoles().add(role);
        try {
            com.devbuild.gestionauth.model.RoleAudit a = new com.devbuild.gestionauth.model.RoleAudit();
            a.setTargetEmail(email);
            a.setRoleName(role.name());
            a.setAction("ASSIGNED");
            a.setPerformedBy(performedBy != null ? performedBy : "system");
            a.setTimestamp(java.time.LocalDateTime.now());
            roleAuditRepository.save(a);
        } catch (Exception ignored) {}
        return userRepository.save(u);
    }

    public User assignRole(String email, Role role) {
        return assignRole(email, role, "system");
    }

    public void removeRole(String email, Role role, String performedBy) {
        User u = userRepository.findByEmail(email).orElseThrow();
        u.getRoles().remove(role);
        // audit
        try {
            com.devbuild.gestionauth.model.RoleAudit a = new com.devbuild.gestionauth.model.RoleAudit();
            a.setTargetEmail(email);
            a.setRoleName(role.name());
            a.setAction("REMOVED");
            a.setPerformedBy(performedBy != null ? performedBy : "system");
            a.setTimestamp(java.time.LocalDateTime.now());
            roleAuditRepository.save(a);
        } catch (Exception ignored) {}
        userRepository.save(u);
    }

    public void removeRole(String email, Role role) {
        removeRole(email, role, "system");
    }

    @Transactional
    public User replaceUserRoleWithCandidat(String email, String performedBy) {
        User u = userRepository.findByEmail(email).orElseThrow();
        // Remove ROLE_USER if present
        boolean removed = false;
        if (u.getRoles().contains(Role.ROLE_USER)) {
            u.getRoles().remove(Role.ROLE_USER);
            removed = true;
            try {
                com.devbuild.gestionauth.model.RoleAudit a = new com.devbuild.gestionauth.model.RoleAudit();
                a.setTargetEmail(email);
                a.setRoleName(Role.ROLE_USER.name());
                a.setAction("REMOVED");
                a.setPerformedBy(performedBy != null ? performedBy : "system");
                a.setTimestamp(java.time.LocalDateTime.now());
                roleAuditRepository.save(a);
            } catch (Exception ignored) {}
        }
        // Assign ROLE_CANDIDAT if not already present
        if (!u.getRoles().contains(Role.ROLE_CANDIDAT)) {
            u.getRoles().add(Role.ROLE_CANDIDAT);
            try {
                com.devbuild.gestionauth.model.RoleAudit a = new com.devbuild.gestionauth.model.RoleAudit();
                a.setTargetEmail(email);
                a.setRoleName(Role.ROLE_CANDIDAT.name());
                a.setAction("ASSIGNED");
                a.setPerformedBy(performedBy != null ? performedBy : "system");
                a.setTimestamp(java.time.LocalDateTime.now());
                roleAuditRepository.save(a);
            } catch (Exception ignored) {}
        }
        return userRepository.save(u);
    }

    public void deleteUser(String email) {
        User u = userRepository.findByEmail(email).orElseThrow();
        userRepository.delete(u);
    }

    public User setDisabled(String email, boolean disabled) {
        User u = userRepository.findByEmail(email).orElseThrow();
        u.setDisabled(disabled);
        return userRepository.save(u);
    }

    public User updateProfile(String email, String firstName, String lastName, String phone, String affiliation, String requestedProfile) {
        User u = userRepository.findByEmail(email).orElseThrow();
        boolean profileChanged = false;
        if (firstName != null && !firstName.equals(u.getFirstName())) { u.setFirstName(firstName); profileChanged = true; }
        if (lastName != null && !lastName.equals(u.getLastName())) { u.setLastName(lastName); profileChanged = true; }
        if (phone != null && !phone.equals(u.getPhone())) { u.setPhone(phone); profileChanged = true; }
        if (affiliation != null && !affiliation.equals(u.getAffiliation())) { u.setAffiliation(affiliation); profileChanged = true; }
        if (requestedProfile != null && !requestedProfile.equals(u.getRequestedProfile())) {
            u.setRequestedProfile(requestedProfile);
            u.setApproved(false);
            u.setApprovedBy(null);
            u.setApprovedAt(null);
            u.setRejectionReason(null);
            profileChanged = true;
        }
        if (profileChanged) return userRepository.save(u);
        return u;
    }

    /**
     * Change the password for the given user email.
     * Validates the provided old password and applies a simple password policy
     * for the new password. Sends a notification email (best-effort) on success.
     */
    private final Logger log = LoggerFactory.getLogger(UserService.class);

    /**
     * Change the password for the given user email.
     * <p>
     * Security notes:
     * - Verifies the provided old password using the configured PasswordEncoder.
     * - Validates a minimal password policy server-side (length, contains digit & letter).
     * - Stores the new password hashed using the configured PasswordEncoder.
     * - Sends a best-effort notification to the user (via NotificationClient) without
     *   exposing internal details in the API response.
     *
     * Exceptions are thrown to allow the controller to return clear, actionable
     * responses to the client while keeping the implementation and logs useful
     * for debugging.
     *
     * @throws IllegalArgumentException with message "OLD_PASSWORD_MISMATCH" when the old password is incorrect
     * @throws IllegalArgumentException with message "PASSWORD_POLICY" when the new password does not meet policy
     */
    @Transactional
    public boolean changePassword(String email, String oldRawPassword, String newRawPassword) {
        log.info("changePassword ENTRY - email={} thread={} paramsPresent: old={}, new={}", email, Thread.currentThread().getName(), oldRawPassword != null, newRawPassword != null);
        if (email == null || oldRawPassword == null || newRawPassword == null) {
            log.warn("changePassword called with null parameter(s) for email={}", email);
            throw new IllegalArgumentException("MISSING_PARAMETERS");
        }
        var uOpt = userRepository.findByEmail(email);
        if (uOpt.isEmpty()) {
            log.warn("changePassword: user not found for email={}", email);
            throw new IllegalArgumentException("USER_NOT_FOUND");
        }
        User u = uOpt.get();
        try { log.debug("changePassword: found user id={} email={} existingPasswordPresent={} existingPasswordLength={}", u.getId(), email, u.getPassword() != null, u.getPassword() != null ? u.getPassword().length() : 0); } catch (Throwable t) {}
        try {
            // verify old password securely
            try { log.debug("changePassword: verifying old password for email={} using encoder={}", email, passwordEncoder.getClass().getName()); } catch (Throwable t) {}
            boolean matches = false;
            try {
                matches = passwordEncoder.matches(oldRawPassword, u.getPassword());
            } catch (Exception pe) {
                log.error("changePassword: passwordEncoder.matches threw an exception for {}: {}", email, pe.toString(), pe);
                throw new RuntimeException("PASSWORD_VERIFY_ERROR");
            }
            log.debug("changePassword: password match result for email={} => {}", email, matches);
            if (!matches) {
                log.info("changePassword: old password mismatch for email={}", email);
                throw new IllegalArgumentException("OLD_PASSWORD_MISMATCH");
            }

            // validate new password policy
            if (!isValidPassword(newRawPassword)) {
                log.info("changePassword: new password policy not met for email={}", email);
                throw new IllegalArgumentException("PASSWORD_POLICY");
            }

            // persist new hashed password (encode then save & verify)
            String hashed;
            try {
                hashed = passwordEncoder.encode(newRawPassword);
                log.debug("changePassword: generated password hash length={} for email={}", hashed != null ? hashed.length() : 0, email);
            } catch (Exception he) {
                log.error("changePassword: error while hashing new password for {}: {}", email, he.toString(), he);
                throw new RuntimeException("PASSWORD_HASH_ERROR");
            }

            u.setPassword(hashed);
            log.debug("changePassword: about to save user id={} email={} passwordPresent={}", u.getId(), email, u.getPassword() != null);
            User saved;
            try {
                saved = userRepository.saveAndFlush(u);
                log.info("changePassword: userRepository.saveAndFlush returned id={} for email={}", saved != null ? saved.getId() : null, email);
            } catch (Exception saveEx) {
                log.error("changePassword: userRepository.saveAndFlush threw exception for {}: {}", email, saveEx.toString(), saveEx);
                throw new RuntimeException("DB_PERSIST_ERROR");
            }

            // Re-read the persisted value to ensure it is committed in DB and matches new password
            try {
                User reloaded = userRepository.findById(saved.getId()).orElse(null);
                if (reloaded == null) {
                    log.error("changePassword: unable to re-read user after save for id={} email={}", saved.getId(), email);
                    throw new RuntimeException("DB_READBACK_ERROR");
                }
                boolean verifySaved = false;
                try { verifySaved = passwordEncoder.matches(newRawPassword, reloaded.getPassword()); } catch (Exception ve) { log.warn("changePassword: verification after re-read failed for {}: {}", email, ve.toString()); }
                log.debug("changePassword: verify saved password (reloaded) matches new raw for email={} => {}", email, verifySaved);
                if (!verifySaved) {
                    // Attempt a direct JDBC update as a fallback and re-check
                    try {
                        int updated = jdbcTemplate.update("update users set password = ? where id = ?", hashed, saved.getId());
                        log.warn("changePassword: persistence verification failed; jdbcTemplate.update fallback affectedRows={} for id={} email={}", updated, saved.getId(), email);
                    } catch (Exception jdbcEx) {
                        log.error("changePassword: jdbcTemplate.update fallback failed for {}: {}", email, jdbcEx.toString(), jdbcEx);
                        throw new RuntimeException("DB_PERSIST_FALLBACK_ERROR");
                    }
                    // re-check again
                    User reloaded2 = userRepository.findById(saved.getId()).orElse(null);
                    boolean verify2 = false;
                    if (reloaded2 != null) {
                        try { verify2 = passwordEncoder.matches(newRawPassword, reloaded2.getPassword()); } catch (Exception ve) { log.warn("changePassword: second verification failed for {}: {}", email, ve.toString()); }
                    }
                    log.debug("changePassword: second verify after fallback for email={} => {}", email, verify2);
                    if (!verify2) {
                        log.error("changePassword: unable to persist new password for id={} email={}", saved.getId(), email);
                        throw new RuntimeException("DB_PERSIST_VERIFY_FAILED");
                    }
                }
            } catch (RuntimeException rte) {
                throw rte;
            } catch (Exception ex) {
                log.error("changePassword: unexpected error during post-save verification for {}: {}", email, ex.toString(), ex);
                throw new RuntimeException("DB_POST_VERIFY_ERROR");
            }

            // notify user by email (best-effort) - avoid logging sensitive data
            try {
                if (notificationUrl != null && !notificationUrl.isBlank()) {
                    java.util.Map<String, Object> payload = new java.util.HashMap<>();
                    payload.put("to", u.getEmail());
                    payload.put("templateCode", "PASSWORD_CHANGED");
                    java.util.Map<String, String> vars = new java.util.HashMap<>();
                    vars.put("fullname", (u.getFirstName() != null ? u.getFirstName() : ""));
                    payload.put("variables", vars);
                    notificationClient.sendEmailRequest(payload)
                        .doOnError(e -> { try { log.error("Notification send (PASSWORD_CHANGED) failed for {}: {}", u.getEmail(), e.toString()); } catch (Throwable t) {} })
                        .subscribe();
                } else {
                    log.debug("changePassword: notificationUrl not configured; skipping email send for {}", email);
                }
            } catch (Exception ex) {
                log.warn("changePassword: notification send error for {}: {}", email, ex.toString());
            }

            return true;
        } catch (IllegalArgumentException iae) {
            // propagate known validation reasons for the controller to interpret
            throw iae;
        } catch (Exception ex) {
            log.error("changePassword: unexpected error for {}: {}", email, ex.toString(), ex);
            return false;
        }
    }

    // Simple password policy: at least 8 chars, at least one digit, at least one letter
    private boolean isValidPassword(String p) {
        if (p == null) return false;
        if (p.length() < 8) return false;
        boolean hasDigit = p.chars().anyMatch(Character::isDigit);
        boolean hasLetter = p.chars().anyMatch(Character::isLetter);
        return hasDigit && hasLetter;
    }

    
}
