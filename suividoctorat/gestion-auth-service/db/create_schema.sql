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
