package com.devbuild.gestionauth.repository;

import com.devbuild.gestionauth.model.ExportAccessLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExportAccessLogRepository extends JpaRepository<ExportAccessLog, Long> {
}
