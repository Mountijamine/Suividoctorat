-- Schema for suividoctorat.users and user_roles (run this with mysql client or paste into phpMyAdmin)
CREATE DATABASE IF NOT EXISTS `suividoctorat` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `suividoctorat`;

-- users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(255) DEFAULT NULL,
  `last_name` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(255) DEFAULT NULL,
  `accept_terms` TINYINT(1) DEFAULT 0,
  `requested_profile` VARCHAR(255) DEFAULT NULL,
  `approved` TINYINT(1) NOT NULL DEFAULT 0,
  `affiliation` VARCHAR(512) DEFAULT NULL,
  `approved_by` VARCHAR(255) DEFAULT NULL,
  `approved_at` DATETIME DEFAULT NULL,
  `rejection_reason` VARCHAR(1024) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- user_roles collection table
CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_id` BIGINT NOT NULL,
  `roles` VARCHAR(255) NOT NULL,
  KEY `fk_user_roles_user_idx` (`user_id`),
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- seed admin (same as data.sql)
INSERT INTO users (id, email, password, first_name, last_name, accept_terms) VALUES (1, 'admin@local', '$2a$10$7QbGgk6s8XkQG6Qxq1N3CO5l8y6Z8gIYkOq6yQ2v8P7k9b6nE5u6', 'Admin', 'User', TRUE)
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO user_roles (user_id, roles) VALUES (1, 'ROLE_ADMIN')
ON DUPLICATE KEY UPDATE roles = roles;

-- If you already have an existing `users` table, run the ALTER statements below
-- to add the new columns required by the application (requested_profile, approved):
-- ALTER TABLE users ADD COLUMN requested_profile VARCHAR(255) DEFAULT NULL;
-- ALTER TABLE users ADD COLUMN approved TINYINT(1) NOT NULL DEFAULT 0;

-- Added optional fields and ALTER statements for existing DBs:
-- ALTER TABLE users ADD COLUMN affiliation VARCHAR(512) DEFAULT NULL;
-- proof_url column removed per request
-- ALTER TABLE users ADD COLUMN approved_by VARCHAR(255) DEFAULT NULL;
-- ALTER TABLE users ADD COLUMN approved_at DATETIME DEFAULT NULL;
-- ALTER TABLE users ADD COLUMN rejection_reason VARCHAR(1024) DEFAULT NULL;

-- Optionally, if you want to add audit fields for approval later, you can run:
-- ALTER TABLE users ADD COLUMN approved_by VARCHAR(255) DEFAULT NULL;
-- ALTER TABLE users ADD COLUMN approved_at DATETIME DEFAULT NULL;

-- export_access_log table to record CSV/export usage by admins
CREATE TABLE IF NOT EXISTS export_access_log (
  id BIGINT NOT NULL AUTO_INCREMENT,
  admin_email VARCHAR(255) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  params VARCHAR(2048),
  timestamp DATETIME NOT NULL,
  result_count INT DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
