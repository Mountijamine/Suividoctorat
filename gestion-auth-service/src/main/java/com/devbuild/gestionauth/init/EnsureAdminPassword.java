package com.devbuild.gestionauth.init;

import com.devbuild.gestionauth.model.Role;
import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.regex.Pattern;

/**
 * Startup helper: ensures an admin user exists and that the stored password is BCrypt-encoded.
 * If missing or the password doesn't look like BCrypt, it will be set to "admin123" (encoded).
 */
@Component
public class EnsureAdminPassword implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(EnsureAdminPassword.class);
    private static final String ADMIN_EMAIL = "admin@local";
    private static final String DEFAULT_ADMIN_PASSWORD = "admin123";
    private static final Pattern BCRYPT_PATTERN = Pattern.compile("^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public EnsureAdminPassword(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        userRepository.findByEmail(ADMIN_EMAIL).ifPresentOrElse(u -> {
            String stored = u.getPassword();
            if (stored == null || !BCRYPT_PATTERN.matcher(stored).matches()) {
                String encoded = passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD);
                u.setPassword(encoded);
                u.getRoles().add(Role.ROLE_ADMIN);
                userRepository.save(u);
                log.warn("EnsureAdminPassword: admin password was not BCrypt; reset to '{}'.", DEFAULT_ADMIN_PASSWORD);
            } else {
                log.info("EnsureAdminPassword: admin exists and password looks BCrypt.");
            }
        }, () -> {
            User u = new User();
            u.setEmail(ADMIN_EMAIL);
            u.setPassword(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
            u.getRoles().add(Role.ROLE_ADMIN);
            userRepository.save(u);
            log.info("EnsureAdminPassword: created admin {} with default password ({}).", ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD);
        });
    }
}
