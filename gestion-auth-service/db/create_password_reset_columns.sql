-- Migration: add password reset token fields to users table
-- Usage: run on your MySQL database (XAMPP). Replace `your_database` with the real DB name.

-- Switch to your database
-- USE your_database;

-- Add columns for password reset token hash and expiry
ALTER TABLE `users`
  ADD COLUMN `password_reset_token_hash` VARCHAR(128) DEFAULT NULL,
  ADD COLUMN `password_reset_expiry` DATETIME DEFAULT NULL;

-- Add an index on the hash for faster lookups (prefix 64 is enough for hex SHA-256)
CREATE INDEX `idx_password_reset_token_hash` ON `users` (`password_reset_token_hash`(64));

-- Rollback (undo):
-- ALTER TABLE `users` DROP INDEX `idx_password_reset_token_hash`;
-- ALTER TABLE `users` DROP COLUMN `password_reset_token_hash`, DROP COLUMN `password_reset_expiry`;

-- Notes:
-- 1) The application stores SHA-256 hex (64 chars) of the token in `password_reset_token_hash`.
-- 2) `password_reset_expiry` is stored in UTC by the application; using DATETIME is portable.
-- 3) Run this script from phpMyAdmin or using the mysql client that ships with XAMPP.
