-- Tabel audit_log untuk tracking aktivitas user
CREATE TABLE IF NOT EXISTS audit_log (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    id_tenant INT,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    detail TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (id_user),
    INDEX idx_audit_tenant (id_tenant),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel broadcast untuk pengumuman dari super admin
CREATE TABLE IF NOT EXISTS broadcast (
    id_broadcast INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    judul VARCHAR(255) NOT NULL,
    pesan TEXT NOT NULL,
    tipe VARCHAR(20) NOT NULL DEFAULT 'all',
    id_target INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_broadcast_user (id_user),
    INDEX idx_broadcast_tipe (tipe)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
