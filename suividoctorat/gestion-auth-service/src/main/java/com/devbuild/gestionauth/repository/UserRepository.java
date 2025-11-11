package com.devbuild.gestionauth.repository;

import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.model.Role;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRolesContaining(Role role);
    default Optional<User> findByUsername(String username) {
        return findByEmail(username);
    }
}
