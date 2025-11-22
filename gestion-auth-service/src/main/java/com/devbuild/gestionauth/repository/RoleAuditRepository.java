package com.devbuild.gestionauth.repository;

import com.devbuild.gestionauth.model.RoleAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleAuditRepository extends JpaRepository<RoleAudit, Long> {
	Page<RoleAudit> findByAction(String action, Pageable pageable);
	org.springframework.data.domain.Page<RoleAudit> findByTimestampBetween(java.time.LocalDateTime start, java.time.LocalDateTime end, Pageable pageable);
	org.springframework.data.domain.Page<RoleAudit> findByActionAndTimestampBetween(String action, java.time.LocalDateTime start, java.time.LocalDateTime end, Pageable pageable);
}
