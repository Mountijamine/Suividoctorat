package com.devbuild.gestionauth.init;

import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Development helper: resets the seeded admin user's password to a known value (admin123).
 */
@Component
@Profile("dev")
public class DevResetAdminPassword implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevResetAdminPassword.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DevResetAdminPassword(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@local";
        userRepository.findByEmail(adminEmail).ifPresent(u -> {
            u.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(u);
            log.info("DevResetAdminPassword: reset password for {} to 'admin123' (development only)", adminEmail);
        });
    }
}
