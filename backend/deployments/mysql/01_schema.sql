-- =========================================================================
-- SMARTHUB v2 — DDL MySQL (adaptasi dari PostgreSQL)
-- Sistem Manajemen Warga Digital (SaaS Multi-Tenancy)
-- =========================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================================
-- 1. MODUL AUTH & TENANT (SaaS Core)
-- =========================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id_tenant INT AUTO_INCREMENT PRIMARY KEY,
    nama_rt_rw VARCHAR(100) NOT NULL,
    desa_kelurahan VARCHAR(100) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    kabupaten_kota VARCHAR(100) NOT NULL,
    provinsi VARCHAR(100) NOT NULL,
    xendit_sub_account_id VARCHAR(50) DEFAULT NULL,
    xendit_kyc_status ENUM('PENDING','LIVE','REJECTED') DEFAULT 'PENDING',
    status_berlangganan ENUM('AKTIF','SUSPENDED') DEFAULT 'AKTIF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_kyc (xendit_kyc_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NULL,
    nomor_wa VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin','ketua_rt','sekretaris','bendahara','warga') NOT NULL DEFAULT 'warga',
    fcm_token_pwa TEXT DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE SET NULL,
    INDEX idx_wa (nomor_wa),
    INDEX idx_tenant (id_tenant)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- 2. MODUL WILAYAH & WARGA (Kependudukan & Denah)
-- =========================================================================

CREATE TABLE IF NOT EXISTS rumah (
    id_rumah INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT,
    nama_jalan_gang VARCHAR(100) NOT NULL,
    nomor_rumah VARCHAR(20) NOT NULL,
    status_hunian ENUM('Dihuni','Kosong') DEFAULT 'Dihuni',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    UNIQUE INDEX unique_rumah_per_rt (id_tenant, nama_jalan_gang, nomor_rumah),
    INDEX idx_gang (id_tenant, nama_jalan_gang)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS warga (
    id_warga INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT,
    id_rumah INT NULL,
    id_user INT NULL,
    nama_lengkap VARCHAR(155) NOT NULL,
    nik VARCHAR(255) NOT NULL COMMENT 'Wajib Dienkripsi di backend Go (UU PDP)',
    no_kk VARCHAR(255) NOT NULL COMMENT 'Wajib Dienkripsi di backend Go (UU PDP)',
    status_hubungan ENUM('Kepala Keluarga','Istri','Anak','Penyewa','Lainnya') NOT NULL DEFAULT 'Lainnya',
    status_warga ENUM('Aktif','Pindah','Meninggal') DEFAULT 'Aktif',
    tanggal_mutasi DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    FOREIGN KEY (id_rumah) REFERENCES rumah(id_rumah) ON DELETE SET NULL,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL,
    INDEX idx_rumah (id_rumah),
    INDEX idx_tenant (id_tenant),
    INDEX idx_status (status_warga)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- 3. MODUL KEUANGAN (Otomatisasi Iuran via Xendit)
-- =========================================================================

CREATE TABLE IF NOT EXISTS master_iuran (
    id_master_iuran INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT,
    nama_iuran VARCHAR(100) NOT NULL,
    nominal DECIMAL(12,2) NOT NULL,
    is_wajib TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    INDEX idx_tenant (id_tenant)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tagihan_iuran (
    id_tagihan INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT,
    id_rumah INT NOT NULL,
    periode_bulan_tahun VARCHAR(7) NOT NULL,
    total_nominal DECIMAL(12,2) NOT NULL,
    status_pembayaran ENUM('PENDING','PAID','EXPIRED') DEFAULT 'PENDING',
    xendit_invoice_id VARCHAR(100) DEFAULT NULL,
    xendit_payment_url TEXT DEFAULT NULL,
    id_user_pembayar INT DEFAULT NULL,
    paid_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    FOREIGN KEY (id_rumah) REFERENCES rumah(id_rumah) ON DELETE CASCADE,
    FOREIGN KEY (id_user_pembayar) REFERENCES users(id_user) ON DELETE SET NULL,
    UNIQUE INDEX unique_tagihan_rumah_per_periode (id_rumah, periode_bulan_tahun),
    INDEX idx_status (status_pembayaran),
    INDEX idx_xendit (xendit_invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS detail_tagihan_iuran (
    id_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_tagihan INT NOT NULL,
    nama_iuran VARCHAR(100) NOT NULL,
    nominal DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (id_tagihan) REFERENCES tagihan_iuran(id_tagihan) ON DELETE CASCADE,
    INDEX idx_tagihan (id_tagihan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- 4. MODUL FORUM DISKUSI (Threads)
-- =========================================================================

CREATE TABLE IF NOT EXISTS forum_threads (
    id_thread INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT,
    id_user_pembuat INT NOT NULL,
    tipe_thread ENUM('Pengumuman','Diskusi') NOT NULL DEFAULT 'Diskusi',
    judul VARCHAR(255) NOT NULL,
    konten TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    FOREIGN KEY (id_user_pembuat) REFERENCES users(id_user) ON DELETE CASCADE,
    INDEX idx_tipe (id_tenant, tipe_thread)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS forum_komentar (
    id_komentar INT AUTO_INCREMENT PRIMARY KEY,
    id_thread INT NOT NULL,
    id_user INT NOT NULL,
    komentar TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_thread) REFERENCES forum_threads(id_thread) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
    INDEX idx_thread (id_thread)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- 5. MODUL LAPAK WARGA (Ekonomi Mikro)
-- =========================================================================

CREATE TABLE IF NOT EXISTS lapak_warga (
    id_produk INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT,
    id_user_penjual INT NOT NULL,
    nama_produk_jasa VARCHAR(150) NOT NULL,
    deskripsi TEXT NOT NULL,
    harga DECIMAL(12,2) DEFAULT 0.00,
    foto_url TEXT DEFAULT NULL,
    is_approved TINYINT(1) DEFAULT 1 COMMENT 'Manajemen moderasi oleh pengurus RT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    FOREIGN KEY (id_user_penjual) REFERENCES users(id_user) ON DELETE CASCADE,
    INDEX idx_approved (id_tenant, is_approved),
    INDEX idx_penjual (id_user_penjual)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
