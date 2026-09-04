# Product Requirement Document (PRD)
## Sistem Manajemen Warga Digital (SaaS Multi-Tenancy)

---

### 1. Informasi Proyek
* **Nama Produk:** Sistem Manajemen Warga Digital (Platform SaaS)
* **Status:** Final & Siap Produksi
* **Tech Stack Utama:** 
  * **Backend:** Go (Golang) - Clean Architecture (Modular Monolith)
  * **Frontend:** React 19 + Vite + TypeScript + ShadcnUI (Progressive Web App / PWA)
  * **Database:** PostgreSQL (Main Data) & Redis (Session & Caching)
  * **Infrastruktur Finansial:** Xendit XenPlatform (Managed Sub-Account API)

---

### 2. Tujuan & Visi Produk
Sistem ini dirancang untuk mendigitalisasi tata kelola administrasi, keuangan, dan sosial di tingkat Rukun Tetangga (RT) atau Rukun Warga (RW) se-Indonesia dengan model bisnis **Software as a Service (SaaS)** [rtrwonline.id].

1. **Otomatisasi Keuangan Legal:** Menghilangkan penagihan iuran manual dengan sistem invoice otomatis **per rumah** terintegrasi payment gateway Xendit [rtrwonline.id, docs.xendit.co].
2. **Efisiensi Pengurus:** Menyediakan visualisasi kondisi lingkungan terpusat (Denah List Dinamis) serta sistem manajemen mutasi (warga pindah/meninggal) yang akurat tanpa merusak riwayat finansial.
3. **Ekosistem Sosial & Ekonomi:** Meningkatkan engagement harian warga melalui forum interaktif serta lapak digital terintegrasi WhatsApp untuk mendukung ekonomi mikro antar-tetangga.

---

### 3. Arsitektur Perangkat Lunak & Batasan Modul (Modular Monolith)
Aplikasi dikompilasi sebagai *single binary executable* di Go demi efisiensi biaya server, tetapi struktur kode dipisahkan secara ketat ke dalam modul domain mandiri di folder `internal/` dengan pola *Clean Architecture* (Handler, Service, Repository):

* **Aturan Komunikasi:** Larangan keras melakukan query SQL `JOIN` lintas tabel milik domain modul lain di layer Repository. Komunikasi data wajib melalui *interface function* yang disediakan oleh layer Service modul tujuan.

---

### 4. Matriks Hak Akses Pengguna (RBAC)

Sistem menerapkan kontrol akses berbasis peran (*Role-Based Access Control*) yang divalidasi oleh middleware JWT di backend Go:

| Modul / Fitur | Super Admin (SaaS) | Ketua RT (Owner) | Sekretaris | Bendahara | Warga (PWA) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Kelola Tenant SaaS** | ✍️ Penuh | ❌ | ❌ | ❌ | ❌ |
| **KYC & Akun Xendit** | 👁️ Monitor | ✍️ Registrasi | ❌ | 👁️ Lihat | ❌ |
| **Denah & Data Rumah** | ❌ | 👁️ Lihat | ✍️ Kelola | ❌ | 👁️ Lihat |
| **Mutasi Data Warga** | ❌ | 👁️ Lihat | ✍️ Kelola | ❌ | ❌ |
| **Tarif & Tagihan Iuran**| ❌ | 👁️ Lihat | ❌ | ✍️ Kelola | 👁️ Bayar |
| **Broadcast Pengumuman**| ❌ | ✍️ Buat | ✍️ Buat | ❌ | 👁️ Baca + Komen |
| **Thread Forum Diskusi**| ❌ | ✍️ Buat + Komen| ✍️ Buat + Komen| ✍️ Buat + Komen| ✍️ Buat + Komen |
| **Iklan Jasa/Produk** | ❌ | ⚖️ Moderasi | ⚖️ Moderasi | ❌ | ✍️ Kelola Lapak |

---

### 5. Spesifikasi Fungsional Fitur (Functional Requirements)

#### Modul 1: Auth & Onboarding Tenant (`internal/auth`)
* **FR-1.1 (Multi-Tenancy Sign Up):** Ketua RT dapat mendaftarkan RT/RW barunya ke sistem secara mandiri (Nama RT/RW, Kelurahan, Kecamatan, Kota).
* **FR-1.2 (Embedded White-Label KYC Xendit):** Pengurus mengunggah berkas KTP dan nomor rekening perorangan (Kas RT) langsung di dalam antarmuka ShadcnUI. Backend Go meneruskan dokumen digital tersebut ke API Xendit untuk aktivasi *Sub-Account* tipe **MANAGED** [docs.xendit.co].
* **FR-1.3 (Unified Login):** Login pengurus dan warga disatukan menggunakan nomor WhatsApp sebagai ID unik. Akses diamankan dengan token JWT berdurasi panjang untuk kenyamanan PWA.

#### Modul 2: Wilayah & Monitoring Denah Sederhana (`internal/wilayah`)
* **FR-2.1 (Penyederhanaan Denah):** Sistem memetakan rumah bukan dengan koordinat peta GIS/SVG yang kompleks, melainkan menggunakan **Grouped Card List** (Daftar kartu rumah yang dikelompokkan per Nama Jalan/Gang).
* **FR-2.2 (Visual Real-Time Anchor):** Kartu rumah di dashboard pengurus berubah warna otomatis berbasis status tabel tagihan berjalan:
  * 🟢 **Hijau:** Rumah lunas iuran bulan berjalan.
  * 🟡 **Kuning:** Rumah memiliki tagihan aktif yang belum dibayar (*Pending*).
  * 🔴 **Merah:** Rumah menunggak iuran lebih dari 1 bulan.
  * ⚪ **Abu-abu:** Rumah berstatus kosong/tidak berpenghuni.

#### Modul 3: Kependudukan & Dinamika Mutasi (`internal/warga`)
* **FR-3.1 (Tagihan Berbasis Rumah):** Struktur database mengunci tagihan pada entitas `RUMAH` [rtrwonline.id]. Satu rumah dapat menampung lebih dari satu kepala keluarga (KK) atau banyak warga.
* **FR-3.2 (Kepatuhan Hukum UU PDP):** Backend Go wajib mengenkripsi kolom NIK dan Nomor KK menggunakan algoritma AES-256 sebelum disimpan ke dalam database PostgreSQL.
* **FR-3.3 (Dinamika Status Warga):** Warga yang pindah keluar wilayah atau meninggal dunia diubah status logisnya (*soft-delete* melalui flags `status_warga`). Data tidak dihapus permanen agar tidak merusak validitas laporan keuangan historis. 
* **FR-3.4 (Manajemen Kontrakan):** Pemisahan data "Pemilik Asli" dan "Penyewa Aktif". Tagihan otomatis didorong ke akun PWA penyewa aktif saat itu.

#### Modul 4: Otomatisasi Iuran & Xendit Gateway (`internal/keuangan`)
* **FR-4.1 (Automated Invoicing Cron Job):** *Cron job* otomatis di Go berjalan setiap tanggal 1 awal bulan untuk meng-generate hanya **1 tagihan kolektif per rumah aktif**.
* **FR-4.2 (Sapa Cepat Dia Bayar Logic):** Seluruh warga yang terikat pada ID Rumah yang sama dapat melihat tagihan tersebut di HP masing-masing via PWA. Begitu salah satu anggota keluarga melunasi tagihan lewat QRIS/VA Xendit, status tagihan rumah tersebut langsung terkunci menjadi **Lunas** secara *real-time* bagi seluruh penghuni rumah tersebut [docs.xendit.co].
* **FR-4.3 (Secure Webhook):** Backend Go wajib melakukan validasi header `X-Callback-Token` dari Xendit sebelum memperbarui status transaksi menjadi sukses untuk menghindari injeksi data palsu.

#### Modul 5: Forum Diskusi & Pengumuman Threads (`internal/forum`)
* **FR-5.1 (Kategori Konten):** Sistem memisahkan tipe konten menjadi `Pengumuman Resmi` (Hanya dibuat oleh pengurus, memicu *push notification* otomatis ke seluruh warga) dan `Diskusi Umum` (Warga bebas membuat thread, misal: info kehilangan barang, koordinasi ronda, dll).
* **FR-5.2 (Nested Comments):** Warga dapat saling membalas komentar di bawah sebuah thread dengan visualisasi avatar dan nama asli (tidak ada fitur akun anonim demi menjaga ketertiban lingkungan).

#### Modul 6: Lapak Warga / Marketplace Mikro (`internal/lapak`)
* **FR-6.1 (Direktori Jasa & Produk):** Warga dapat mengiklankan usaha rumahan mereka (katering, warung, jasa service AC) dengan mengunggah foto produk, harga, dan deskripsi singkat.
* **FR-6.2 (Direct-to-WhatsApp Interaksi):** Transaksi pembelian dialirkan langsung tanpa fitur chat internal yang rumit. Disediakan tombol "Hubungi Penjual" yang jika diklik otomatis membuka aplikasi WhatsApp penjual dengan teks pesanan template yang rapi.
* **FR-6.3 (Lokal Moderasi):** Pengurus RT/RW memiliki hak penuh untuk menyembunyikan atau menurunkan iklan warga dari beranda direktori jika ditemukan produk ilegal atau tidak sesuai norma lingkungan.

---

### 6. Persyaratan Non-Fungsional (Non-Functional Requirements)
1. **Kecepatan & Performa PWA:** Kecepatan *load* pertama aplikasi PWA wajib di bawah **2 detik** menggunakan strategi caching aset statis via Vite PWA Plugin agar hemat kuota dan ramah bagi HP berspesifikasi rendah.
2. **Idempotency API:** Semua request pembuatan invoice tagihan ke API Xendit wajib menyertakan *Idempotency-Key* guna mengeliminasi error penagihan ganda ke warga akibat jaringan tidak stabil.
3. **Penyimpanan Media Efisien:** Foto produk lapak warga dikirim dari frontend langsung ke Cloud Storage (seperti AWS S3 atau Cloudinary). Database PostgreSQL hanya bertugas menyimpan string URL teks gambar tersebut.
4. **Mobile-First UX:** Antarmuka warga dirancang khusus untuk layar HP. Komponen ShadcnUI berupa *Drawer* (layar geser bawah) wajib diutamakan menggantikan komponen *Dialog/Modal* tengah agar lebih mudah dinavigasi menggunakan satu jempol.
