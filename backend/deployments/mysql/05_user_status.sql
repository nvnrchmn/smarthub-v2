-- Migration: Tambah kolom user_status dan id_rumah di tabel users
-- Untuk alur approval warga oleh ketua_rt

ALTER TABLE users ADD COLUMN IF NOT EXISTS user_status ENUM('pending_verifikasi','active','suspended') NOT NULL DEFAULT 'pending_verifikasi' AFTER role;
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_rumah INT DEFAULT NULL AFTER is_active;
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_user_status (user_status);
