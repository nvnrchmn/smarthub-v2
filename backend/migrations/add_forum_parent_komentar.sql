ALTER TABLE forum_komentar ADD COLUMN parent_komentar_id INT NULL AFTER id_thread;
ALTER TABLE forum_komentar ADD COLUMN foto_url TEXT NULL AFTER komentar;
ALTER TABLE forum_komentar ADD FOREIGN KEY (parent_komentar_id) REFERENCES forum_komentar(id_komentar) ON DELETE SET NULL;
