-- Seed Forum & Lapak
INSERT INTO forum_threads (id_tenant, id_user_pembuat, tipe_thread, judul, konten) VALUES
(1, 2, 'Pengumuman', 'Peraturan Baru Parkir', 'Dilarang parkir di area hijau.'),
(1, 3, 'Diskusi', 'Jadwal Posy Mingguan', 'Jadwal posy minggu depan pukul 08.00');

INSERT INTO forum_komentar (id_thread, id_user, komentar) VALUES
(1, 3, 'Baik, saya setuju.'),
(1, 4, 'Terima kasih informasinya.');

INSERT INTO lapak_warga (id_tenant, id_user_penjual, nama_produk_jasa, deskripsi, harga) VALUES
(1, 3, 'Kursi Plastik Bekas', 'Kursi plastik bekas pakai, masih layak', 25000),
(1, 4, 'Tanaman Hias Aglonema', 'Aglonema pink, tinggi 40cm', 75000);
