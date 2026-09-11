-- Tabel permintaan perbaikan data warga
CREATE TABLE IF NOT EXISTS permintaan_perbaikan (
    id_permintaan INT PRIMARY KEY AUTOINCREMENT,
    id_warga INT NOT NULL,
    id_tenant INT NOT NULL,
    id_user_pengaju INT NOT NULL,
    field_yang_diubah VARCHAR(50) NOT NULL,
    nilai_lama TEXT,
    nilai_baru TEXT NOT NULL,
    keterangan TEXT,
    status ENUM('pending','disetujui','ditolak') DEFAULT 'pending',
    ditinjau_oleh INT,
    catatan_pengurus TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_warga) REFERENCES warga(id_warga) ON DELETE CASCADE,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (id_user_pengaju) REFERENCES users(id) ON DELETE CASCADE
);
