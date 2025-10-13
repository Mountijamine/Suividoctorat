package com.devbuild.gestionauth.service;

import com.devbuild.gestionauth.model.Role;
import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.devbuild.gestionauth.notification.NotificationClient;
import reactor.core.publisher.Mono;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationClient notificationClient;
    private final com.devbuild.gestionauth.repository.RoleAuditRepository roleAuditRepository;
    @Value("${app.notification.url:}")
    private String notificationUrl;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, NotificationClient notificationClient, com.devbuild.gestionauth.repository.RoleAuditRepository roleAuditRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationClient = notificationClient;
        this.roleAuditRepository = roleAuditRepository;
    }

    public User createUser(String email, String rawPassword) {
        User u = new User();
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.getRoles().add(Role.ROLE_USER);
        User saved = userRepository.save(u);
        // Notify admins about the new profile request (best-effort, async)
        try {
            String req = saved.getRequestedProfile();
            if (notificationUrl != null && !notificationUrl.isBlank() && req != null) {
                java.util.Map<String, String> payload = new java.util.HashMap<>();
                payload.put("type", "profile_request");
                payload.put("email", saved.getEmail());
                payload.put("requestedProfile", req);
                // fire-and-forget
                notificationClient.sendProfileRequest(payload).subscribe();
            }
        } catch (Exception ex) {
            // swallow - notification is best-effort
        }
        return saved;
    }

    public User createUserWithProfile(String email, String rawPassword, String firstName, String lastName, String phone, boolean acceptTerms, String requestedProfile, String affiliation) {
        User u = new User();
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setPhone(phone);
        u.setAcceptTerms(acceptTerms);
        u.setRequestedProfile(requestedProfile);
        u.setAffiliation(affiliation);
        u.getRoles().add(Role.ROLE_USER);
        u.setApproved(false);
        return userRepository.save(u);
    }

    // Backward-compatible overloads
    public User createUserWithProfile(String email, String rawPassword, String firstName, String lastName, String phone, boolean acceptTerms) {
        return createUserWithProfile(email, rawPassword, firstName, lastName, phone, acceptTerms, null, null);
    }

    public User createUserWithProfile(String email, String rawPassword, String firstName, String lastName, String phone, boolean acceptTerms, String requestedProfile) {
        return createUserWithProfile(email, rawPassword, firstName, lastName, phone, acceptTerms, requestedProfile, null);
    }

    // Approve and assign using approver email (records audit)
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

    // Backward-compatible method (no approver provided)
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

    public java.util.List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public java.util.List<User> findUsersByRole(Role role) {
        return userRepository.findByRolesContaining(role);
    }

    // New signature records actor who performed the change. Backwards-compatible overloads below.
    public User assignRole(String email, Role role, String performedBy) {
        User u = userRepository.findByEmail(email).orElseThrow();
        u.getRoles().add(role);
        // audit
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

    public void deleteUser(String email) {
        User u = userRepository.findByEmail(email).orElseThrow();
        userRepository.delete(u);
    }

    public User setDisabled(String email, boolean disabled) {
        User u = userRepository.findByEmail(email).orElseThrow();
        u.setDisabled(disabled);
        return userRepository.save(u);
    }

    // Update profile fields. If requestedProfile changes, mark approved=false and clear approval audit.
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

    
}
