-- Subscription per-rumah (Rp 3.000/rumah/bulan)
-- Hapus tabel lama jika ada
DROP TABLE IF EXISTS invoice_layanan;
DROP TABLE IF EXISTS langganan;
DROP TABLE IF EXISTS paket;

-- Tabel layanan (per-rumah)
CREATE TABLE IF NOT EXISTS layanan (
    id_layanan INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    id_rumah INT NOT NULL,
    status ENUM('AKTIF','SUSPENDED','EXPIRED') DEFAULT 'AKTIF',
    harga_per_bulan DECIMAL(12,2) DEFAULT 3000,
    tanggal_mulai DATE NOT NULL,
    tanggal_expire DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_tenant_rumah (id_tenant, id_rumah),
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    FOREIGN KEY (id_rumah) REFERENCES rumah(id_rumah) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel invoice (per-rumah)
CREATE TABLE IF NOT EXISTS invoice (
    id_invoice INT AUTO_INCREMENT PRIMARY KEY,
    id_layanan INT NOT NULL,
    nomor_invoice VARCHAR(50) NOT NULL UNIQUE,
    bulan_tagihan VARCHAR(7) NOT NULL,
    jumlah_rumah INT NOT NULL,
    harga_per_rumah DECIMAL(12,2) DEFAULT 3000,
    total_nominal DECIMAL(12,2) NOT NULL,
    status ENUM('PENDING','PAID','OVERDUE','CANCELLED') DEFAULT 'PENDING',
    tanggal_jatuh_tempo DATE NOT NULL,
    tanggal_bayar DATE,
    metode_bayar VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_layanan) REFERENCES layanan(id_layanan) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel CMS landing page
CREATE TABLE IF NOT EXISTS cms_landing (
    id_cms INT AUTO_INCREMENT PRIMARY KEY,
    section VARCHAR(50) NOT NULL,
    data JSON NOT NULL,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_section (section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default CMS data
INSERT INTO cms_landing (section, data) VALUES
('hero', '{"badge": "Sistem Manajemen Warga Digital", "title": "Kelola RT/RW Lebih Mudah", "subtitle": "Platform all-in-one untuk iuran, forum warga, lapak, dan administrasi lainnya.", "cta_primary": "Mulai Sekarang", "cta_primary_url": "/register", "cta_second": "Lihat Demo", "cta_second_url": "#features"}'),
('features', '{"title": "Fitur Lengkap", "subtitle": "Semua yang butuh untuk mengelola warga", "items": [{"icon": "wallet", "title": "Iuran Digital", "desc": "Pembayaran QRIS, otomatis tercatat, laporan lengkap"}, {"icon": "chat", "title": "Forum Warga", "desc": "Diskusi real-time, pengumuman, mention @warga"}, {"icon": "store", "title": "Lapak Warga", "desc": "Jual-beli antar warga, moderasi pengurus"}, {"icon": "users", "title": "Data Warga", "desc": "Terenkripsi, terintegrasi, mudah dikelola"}]}'),
('pricing', '{"title": "Harga Terjangkau", "subtitle": "Rp 3.000 per rumah per bulan", "items": [{"name": "Starter", "price": "3.000", "unit": "per rumah/bulan", "features": ["Fitur lengkap", "Forum warga", "Lapak", "Support WA"], "highlighted": true}]}'),
('faq', '{"title": "Pertanyaan Umum", "items": [{"q": "Apa itu Smarthub?", "a": "Platform manajemen RT/RW digital untuk iuran, forum, dan lapak warga."}, {"q": "Berapa harga?", "a": "Hanya Rp 3.000 per rumah per bulan."}, {"q": "Bagaimana pembayaran?", "a": "Transfer bank, QRIS, atau bayar tunai ke pengurus."}]}'),
('testimonials', '{"title": "Kata Mereka", "items": [{"name": "Pak RT 05", "role": "Ketua RT", "text": "Iuran jadi otomatis, tidak lagi repot tagih rumah ke rumah."}, {"name": "Bu Dina", "role": "Warga", "text": "Forum warga mempermudah komunikasi dan jual-beli antar warga."}]}'),
('footer', '{"copyright": "© 2026 Smarthub by Logikraf", "links": [{"text": "Kebijakan Privasi", "url": "/privacy"}, {"text": "Syarat & Ketentuan", "url": "/terms"}]}')
ON DUPLICATE KEY UPDATE section = VALUES(section);
