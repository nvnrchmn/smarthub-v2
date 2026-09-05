-- Tabel settlement_requests untuk pencairan dana tagihan lunas
-- Tabel settlement_tagihan untuk link tagihan PAID ke settlement

CREATE TABLE IF NOT EXISTS settlement_requests (
    id_settlement INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    requested_by INT NOT NULL,
    total_nominal BIGINT NOT NULL,
    bank_code VARCHAR(20) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(155) NOT NULL,
    status ENUM('PENDING','PROCESSING','COMPLETED','REJECTED') NOT NULL DEFAULT 'PENDING',
    note TEXT,
    completed_at TIMESTAMP NULL,
    completed_by INT NULL,
    reject_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant (id_tenant),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS settlement_tagihan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_settlement INT NOT NULL,
    id_tagihan INT NOT NULL,
    nominal BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_tagihan (id_tagihan),
    INDEX idx_settlement (id_settlement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
