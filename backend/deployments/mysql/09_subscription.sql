-- Tabel paket layanan, langganan tenant, dan invoice berlangganan

CREATE TABLE IF NOT EXISTS paket (
    id_paket INT AUTO_INCREMENT PRIMARY KEY,
    nama_paket VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    harga_per_bulan DECIMAL(12,2) NOT NULL,
    max_rumah INT NOT NULL DEFAULT 100,
    max_warga INT NOT NULL DEFAULT 500,
    max_tagihan INT NOT NULL DEFAULT 1000,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS langganan (
    id_langganan INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    id_paket INT NOT NULL,
    status ENUM('AKTIF','SUSPENDED','EXPIRED') NOT NULL DEFAULT 'AKTIF',
    tanggal_mulai DATE NOT NULL,
    tanggal_expire DATE NOT NULL,
    harga DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    FOREIGN KEY (id_paket) REFERENCES paket(id_paket),
    INDEX idx_tenant (id_tenant),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS invoice (
    id_invoice INT AUTO_INCREMENT PRIMARY KEY,
    id_langganan INT NOT NULL,
    id_tenant INT NOT NULL,
    nomor_invoice VARCHAR(50) NOT NULL UNIQUE,
    bulan_tagihan VARCHAR(7) NOT NULL,
    total_nominal DECIMAL(12,2) NOT NULL,
    status ENUM('PENDING','PAID','OVERDUE','CANCELLED') NOT NULL DEFAULT 'PENDING',
    tanggal_jatuh_tempo DATE,
    tanggal_bayar TIMESTAMP NULL,
    metode_bayar VARCHAR(30),
    external_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_langganan) REFERENCES langganan(id_langganan) ON DELETE CASCADE,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    INDEX idx_tenant (id_tenant),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed paket default
INSERT INTO paket (nama_paket, deskripsi, harga_per_bulan, max_rumah, max_warga, max_tagihan) VALUES
('Starter', 'Paket dasar untuk RT/RW kecil', 50000, 50, 200, 500),
('Professional', 'Paket untuk RT/RW sedang', 100000, 100, 500, 1000),
('Enterprise', 'Paket untuk RT/RW besar tanpa batas', 200000, 9999, 9999, 9999);