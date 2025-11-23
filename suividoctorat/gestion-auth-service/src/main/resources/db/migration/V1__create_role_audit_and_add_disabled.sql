-- Create role_audit table and add disabled column to users
-- This migration is idempotent where possible; Flyway will only run it once.

-- Create role_audit table
CREATE TABLE IF NOT EXISTS role_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    target_email VARCHAR(255) NOT NULL,
    role_name VARCHAR(128) NOT NULL,
    action VARCHAR(32) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    timestamp DATETIME NOT NULL,
    details VARCHAR(1024)
);

-- Add disabled column to users table if it does not exist
-- MySQL does not have a simple "IF NOT EXISTS" for adding columns, so guard with a check
SET @has_disabled = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'disabled');

-- dynamic SQL to add the column only if missing
SET @sql = IF(@has_disabled = 0, 'ALTER TABLE users ADD COLUMN disabled BOOLEAN NOT NULL DEFAULT FALSE', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
