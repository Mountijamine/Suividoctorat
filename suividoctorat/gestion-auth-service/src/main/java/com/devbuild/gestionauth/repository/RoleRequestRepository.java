package com.devbuild.gestionauth.repository;

import com.devbuild.gestionauth.model.RoleRequest;
import com.devbuild.gestionauth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRequestRepository extends JpaRepository<RoleRequest, Long> {
    List<RoleRequest> findByStatus(String status);
    List<RoleRequest> findByUser(User user);
    List<RoleRequest> findByUserAndStatus(User user, String status);
}
