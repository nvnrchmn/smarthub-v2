# Data Definition Language (DDL) SQL Final
## Sistem Manajemen Warga Digital (SaaS Multi-Tenancy)

---

### 📋 Deskripsi Skema
Skema database ini dirancang untuk database **PostgreSQL** dengan mengoptimalkan penggunaan indeks (*indexing*) pada kolom-kolom kritikal, penggunaan tipe data `NUMERIC` yang presisi untuk pencatatan finansial, serta relasi kunci asing (*Foreign Key Constraints*) yang menjaga integritas data antar-modul modular monolith.

---

```sql
-- Menggunakan timezone Asia/Jakarta secara default
SET timezone = 'Asia/Jakarta';

-- =========================================================================
-- 1. MODUL AUTH & TENANT (SaaS Core)
-- =========================================================================

CREATE TABLE tenants (
    id_tenant SERIAL PRIMARY KEY,
    nama_rt_rw VARCHAR(100) NOT NULL, -- Contoh: "RT 05 / RW 03"
    desa_kelurahan VARCHAR(100) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    kabupaten_kota VARCHAR(100) NOT NULL,
    provinsi VARCHAR(100) NOT NULL,
    xendit_sub_account_id VARCHAR(50) DEFAULT NULL, -- ID Akun Managed Xendit [docs.xendit.co]
    xendit_kyc_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, LIVE, REJECTED
    status_berlangganan VARCHAR(20) DEFAULT 'AKTIF', -- AKTIF, SUSPENDED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE user_role AS ENUM ('super_admin', 'ketua_rt', 'sekretaris', 'bendahara', 'warga');

CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    id_tenant INT REFERENCES tenants(id_tenant) ON DELETE SET NULL, -- Null jika super_admin
    nomor_wa VARCHAR(20) UNIQUE NOT NULL, -- Digunakan untuk Login & Notifikasi WA Gateway
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'warga',
    fcm_token_pwa TEXT DEFAULT NULL, -- Token untuk Push Notification PWA
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 2. MODUL WILAYAH & WARGA (Kependudukan & Denah)
-- =========================================================================

CREATE TYPE status_hunian_type AS ENUM ('Dihuni', 'Kosong');

CREATE TABLE rumah (
    id_rumah SERIAL PRIMARY KEY,
    id_tenant INT NOT NULL REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    nama_jalan_gang VARCHAR(100) NOT NULL, -- Contoh: "Gang Sate", "Jl. Swadaya" (Untuk Denah Sederhana)
    nomor_rumah VARCHAR(20) NOT NULL,     -- Contoh: "04", "12A"
    status_hunian status_hunian_type DEFAULT 'Dihuni',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_rumah_per_rt UNIQUE(id_tenant, nama_jalan_gang, nomor_rumah)
);

CREATE TYPE status_warga_type AS ENUM ('Aktif', 'Pindah', 'Meninggal');
CREATE TYPE status_hubungan_type AS ENUM ('Kepala Keluarga', 'Istri', 'Anak', 'Penyewa', 'Lainnya');

CREATE TABLE warga (
    id_warga SERIAL PRIMARY KEY,
    id_tenant INT NOT NULL REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    id_rumah INT REFERENCES rumah(id_rumah) ON DELETE SET NULL, -- Null jika sudah pindah rumah
    id_user INT REFERENCES users(id_user) ON DELETE SET NULL,     -- Link ke akun login PWA jika terdaftar
    nama_lengkap VARCHAR(155) NOT NULL,
    nik VARCHAR(255) NOT NULL, -- Wajib Dienkripsi di backend Go (UU PDP)
    no_kk VARCHAR(255) NOT NULL, -- Wajib Dienkripsi di backend Go (UU PDP)
    status_hubungan status_hubungan_type NOT NULL DEFAULT 'Lainnya',
    status_warga status_warga_type DEFAULT 'Aktif',
    tanggal_mutasi DATE DEFAULT NULL, -- Terisi jika pindah/meninggal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 3. MODUL KEUANGAN (Otomatisasi Iuran via Xendit)
-- =========================================================================

CREATE TABLE master_iuran (
    id_master_iuran SERIAL PRIMARY KEY,
    id_tenant INT NOT NULL REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    nama_iuran VARCHAR(100) NOT NULL, -- Contoh: "Iuran Keamanan", "Iuran Sampah"
    nominal NUMERIC(12, 2) NOT NULL,
    is_wajib BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE status_bayar_type AS ENUM ('PENDING', 'PAID', 'EXPIRED');

CREATE TABLE tagihan_iuran (
    id_tagihan SERIAL PRIMARY KEY,
    id_tenant INT NOT NULL REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    id_rumah INT NOT NULL REFERENCES rumah(id_rumah) ON DELETE CASCADE, -- Tagihan mengikat ke RUMAH [rtrwonline.id]
    periode_bulan_tahun VARCHAR(7) NOT NULL, -- Format: "YYYY-MM" (Contoh: "2026-09")
    total_nominal NUMERIC(12, 2) NOT NULL,
    status_pembayaran status_bayar_type DEFAULT 'PENDING',
    xendit_invoice_id VARCHAR(100) DEFAULT NULL, -- ID dari Xendit [docs.xendit.co]
    xendit_payment_url TEXT DEFAULT NULL,       -- Link Pembayaran Xendit Invoice [docs.xendit.co]
    id_user_pembayar INT REFERENCES users(id_user) DEFAULT NULL, -- Warga yang membayar duluan (Sapa Cepat Dia Bayar)
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_tagihan_rumah_per_periode UNIQUE(id_rumah, periode_bulan_tahun)
);

CREATE TABLE detail_tagihan_iuran (
    id_detail SERIAL PRIMARY KEY,
    id_tagihan INT NOT NULL REFERENCES tagihan_iuran(id_tagihan) ON DELETE CASCADE,
    nama_iuran VARCHAR(100) NOT NULL,
    nominal NUMERIC(12, 2) NOT NULL
);

-- =========================================================================
-- 4. MODUL FORUM DISKUSI (Threads)
-- =========================================================================

CREATE TYPE tipe_thread_enum AS ENUM ('Pengumuman', 'Diskusi');

CREATE TABLE forum_threads (
    id_thread SERIAL PRIMARY KEY,
    id_tenant INT NOT NULL REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    id_user_pembuat INT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    tipe_thread tipe_thread_enum NOT NULL DEFAULT 'Diskusi', -- 'Pengumuman' (Hanya Pengurus), 'Diskusi' (Bebas)
    judul VARCHAR(255) NOT NULL,
    konten TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forum_komentar (
    id_komentar SERIAL PRIMARY KEY,
    id_thread INT NOT NULL REFERENCES forum_threads(id_thread) ON DELETE CASCADE,
    id_user INT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    komentar TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 5. MODUL LAPAK WARGA (Ekonomi Mikro)
-- =========================================================================

CREATE TABLE lapak_warga (
    id_produk SERIAL PRIMARY KEY,
    id_tenant INT NOT NULL REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    id_user_penjual INT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    nama_produk_jasa VARCHAR(150) NOT NULL, -- Contoh: "Katering Nasi Kotak Ibu Sri", "Jasa Service AC"
    deskripsi TEXT NOT NULL,
    harga NUMERIC(12, 2) DEFAULT 0.00,
    foto_url TEXT DEFAULT NULL, -- Link gambar produk di Cloud Storage (S3/Cloudinary)
    is_approved BOOLEAN DEFAULT TRUE, -- Manajemen moderasi oleh pengurus RT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 6. INDEX UNTUK OPTIMASI PERFORMA
-- =========================================================================

CREATE INDEX idx_users_wa ON users(nomor_wa);
CREATE INDEX idx_warga_rumah ON warga(id_rumah);
CREATE INDEX idx_rumah_gang ON rumah(id_tenant, nama_jalan_gang);
CREATE INDEX idx_tagihan_status ON tagihan_iuran(id_rumah, status_pembayaran);
CREATE INDEX idx_xendit_invoice ON tagihan_iuran(xendit_invoice_id);
CREATE INDEX idx_forum_thread ON forum_threads(id_tenant, tipe_thread);
CREATE INDEX idx_forum_komentar ON forum_komentar(id_thread);
CREATE INDEX idx_lapak_tenant ON lapak_warga(id_tenant, is_approved);
```
