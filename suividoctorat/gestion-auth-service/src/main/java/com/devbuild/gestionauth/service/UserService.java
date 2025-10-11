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
    @Value("${app.notification.url:}")
    private String notificationUrl;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, NotificationClient notificationClient) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationClient = notificationClient;
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

    public User createUserWithProfile(String email, String rawPassword, String firstName, String lastName, String phone, boolean acceptTerms, String requestedProfile, String affiliation, String proofUrl) {
        User u = new User();
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setPhone(phone);
        u.setAcceptTerms(acceptTerms);
        u.setRequestedProfile(requestedProfile);
        u.setAffiliation(affiliation);
        u.setProofUrl(proofUrl);
        u.getRoles().add(Role.ROLE_USER);
        u.setApproved(false);
        return userRepository.save(u);
    }

    // Backward-compatible overloads
    public User createUserWithProfile(String email, String rawPassword, String firstName, String lastName, String phone, boolean acceptTerms) {
        return createUserWithProfile(email, rawPassword, firstName, lastName, phone, acceptTerms, null, null, null);
    }

    public User createUserWithProfile(String email, String rawPassword, String firstName, String lastName, String phone, boolean acceptTerms, String requestedProfile) {
        return createUserWithProfile(email, rawPassword, firstName, lastName, phone, acceptTerms, requestedProfile, null, null);
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

    public User assignRole(String email, Role role) {
        User u = userRepository.findByEmail(email).orElseThrow();
        u.getRoles().add(role);
        return userRepository.save(u);
    }
}
