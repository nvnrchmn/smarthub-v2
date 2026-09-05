-- 2026-09-05: Tabel invite_codes untuk alur pendaftaran via kode undangan
-- Digunakan oleh ketua_rt/pengurus untuk mengundang warga atau sesama pengurus

CREATE TABLE IF NOT EXISTS invite_codes (
    id_invite   INT AUTO_INCREMENT PRIMARY KEY,
    code        VARCHAR(50) NOT NULL UNIQUE,
    id_tenant   INT NOT NULL,
    created_by  INT NOT NULL,
    role_for    VARCHAR(20) NOT NULL DEFAULT 'warga',
    expires_at  TIMESTAMP NULL DEFAULT NULL,
    max_uses    INT DEFAULT NULL,
    used_count  INT DEFAULT 0,
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id_user)
);

CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_tenant ON invite_codes(id_tenant);
