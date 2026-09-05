-- Migration: Tambah kolom data rekening tenant untuk settlement Xendit

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS nama_pemilik_rekening VARCHAR(155) DEFAULT NULL AFTER provinsi;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS bank_code VARCHAR(20) DEFAULT NULL AFTER nama_pemilik_rekening;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS nomor_rekening VARCHAR(50) DEFAULT NULL AFTER bank_code;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ktp_url VARCHAR(255) DEFAULT NULL AFTER nomor_rekening;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ktp_verified TINYINT(1) DEFAULT 0 AFTER ktp_url;