package com.devbuild.gestionauth.service;

import com.devbuild.gestionauth.model.Role;
import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(String email, String rawPassword) {
        User u = new User();
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.getRoles().add(Role.ROLE_USER);
        return userRepository.save(u);
    }

    public User createUserWithProfile(String email, String rawPassword, String firstName, String lastName, String phone, boolean acceptTerms, String requestedProfile) {
        User u = new User();
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setPhone(phone);
        u.setAcceptTerms(acceptTerms);
        u.setRequestedProfile(requestedProfile);
        u.getRoles().add(Role.ROLE_USER);
        u.setApproved(false);
        return userRepository.save(u);
    }

    public User approveAndAssign(String email) {
        User u = userRepository.findByEmail(email).orElseThrow();
        if (u.getRequestedProfile() == null) return u;
        try {
            Role r = Role.valueOf(u.getRequestedProfile());
            u.getRoles().add(r);
            u.setApproved(true);
            return userRepository.save(u);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Unknown requested profile: " + u.getRequestedProfile());
        }
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
