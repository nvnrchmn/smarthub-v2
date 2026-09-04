-- =========================================================================
-- SMARTHUB v2 — Seed Data Awal (per struktur aktual)
-- =========================================================================

-- Tenant demo
INSERT INTO tenants (nama_rt_rw, desa_kelurahan, kecamatan, kabupaten_kota, provinsi, xendit_kyc_status, status_berlangganan) VALUES
('RT 01 / RW 01', 'Kejajar', 'Wonosobo', 'Wonosobo', 'Jawa Tengah', 'PENDING', 'AKTIF');

-- Users (password hash placeholder)
INSERT INTO users (id_tenant, nomor_wa, password_hash, role, is_active) VALUES
(1, '081234567890', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'super_admin', 1),
(1, '081234567891', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ketua_rt', 1),
(1, '081234567892', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'warga', 1),
(1, '081234567893', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'warga', 1),
(1, '081234567894', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'warga', 1);

-- Rumah
INSERT INTO rumah (id_tenant, nama_jalan_gang, nomor_rumah, status_hunian) VALUES
(1, 'Gang Melati', 'A1', 'Dihuni'),
(1, 'Gang Melati', 'A2', 'Dihuni'),
(1, 'Gang Melati', 'A3', 'Dihuni');

-- Warga (id_user = id users yang bersesuaian)
INSERT INTO warga (id_tenant, id_rumah, id_user, nama_lengkap, nik, no_kk, status_hubungan, status_warga) VALUES
(1, 1, 2, 'Budi Santoso', '3371010101010001', '3371010101010001', 'Kepala Keluarga', 'Aktif'),
(1, 1, 3, 'Ani Santoso', '3371010101010002', '3371010101010001', 'Istri', 'Aktif'),
(1, 2, 4, 'Siti Aminah', '3371010101010003', '3371010101010003', 'Kepala Keluarga', 'Aktif'),
(1, 3, 5, 'Joko Widodo', '3371010101010004', '3371010101010004', 'Kepala Keluarga', 'Aktif');

-- Master iuran
INSERT INTO master_iuran (id_tenant, nama_iuran, nominal, is_wajib) VALUES
(1, 'Iuran Keamanan', 100000, 1),
(1, 'Iuran Kebersihan', 50000, 1),
(1, 'Iuran Sosial', 25000, 0);

-- Tagihan iuran
INSERT INTO tagihan_iuran (id_tenant, id_rumah, periode_bulan_tahun, total_nominal, status_pembayaran) VALUES
(1, 1, '2026-09', 150000, 'PENDING'),
(1, 2, '2026-09', 100000, 'PENDING'),
(1, 3, '2026-09', 100000, 'PENDING'),
(1, 1, '2026-08', 150000, 'PAID'),
(1, 2, '2026-08', 100000, 'PAID'),
(1, 3, '2026-08', 100000, 'PENDING');

-- Detail tagihan (nama_iuran langsung, tidak ada FK ke master_iuran)
INSERT INTO detail_tagihan_iuran (id_tagihan, nama_iuran, nominal) VALUES
(1, 'Iuran Keamanan', 100000),
(1, 'Iuran Kebersihan', 50000),
(2, 'Iuran Keamanan', 100000),
(3, 'Iuran Keamanan', 100000),
(4, 'Iuran Keamanan', 100000),
(4, 'Iuran Kebersihan', 50000),
(5, 'Iuran Keamanan', 100000),
(6, 'Iuran Keamanan', 100000);

-- Forum thread
INSERT INTO forum_threads (id_tenant, id_user_pembuat, tipe_thread, judul, konten) VALUES
(1, 2, 'Pengumuman', 'Peraturan Baru Parkir', 'Diberitahukan kepada seluruh warga bahwa mulai bulan depan dilarang parkir di area hijau.');

-- Forum komentar
INSERT INTO forum_komentar (id_thread, id_user, komentar) VALUES
(1, 3, 'Baik, saya setuju dengan peraturan tersebut.');

-- Lapak warga
INSERT INTO lapak_warga (id_tenant, id_user_penjual, nama_produk_jasa, deskripsi, harga) VALUES
(1, 3, 'Kursi Plastik Bekas', 'Kursi plastik bekas pakai, masih layak', 25000),
(1, 4, 'Tanaman Hias Aglonema', 'Aglonema pink, tinggi 40cm', 75000);

SELECT 'Seed data berhasil' as status;
