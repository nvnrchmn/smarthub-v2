# Arsitektur Sistem & Topologi Kode (Final)## Sistem Manajemen Warga Digital (SaaS Multi-Tenancy)---### 1. Desain Sistem Makro (High-Level Architecture)
Sistem ini didesain menggunakan pendekatan **Modular Monolith** pada sisi backend untuk menghemat biaya operasional awal dan mempermudah proses deployment, sementara sisi frontend mengadopsi **Progressive Web App (PWA)** berbasis komponen untuk performa maksimal di perangkat mobile 


┌────────────────────────────────────────────────────────┐
│ USER INTERFACE (FRONTEND) │
│ React 19 + Vite + TypeScript + ShadcnUI + TailwindCSS │
└──────────────────────────┬─────────────────────────────┘
│
│ (HTTPS / REST API / PWA Web Push)
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND (GO / GOLANG BINARY) │
│ │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ MIDDLEWARE & SECURITY ROUTER │ │
│ │ JWT Validator • RBAC Role Checker • CORS Handler │ │
│ └─────────────────────────────────┬─────────────────────────────────┘ │
│ │ │
│ ┌─────────────────────────────────▼─────────────────────────────────┐ │
│ │ MODULAR MONOLITH BOUNDARY │ │
│ │ │ │
│ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │ │
│ │ │ Modul AUTH │ │Modul WILAYAH │ │ Modul WARGA │ │ Modul │ │ │
│ │ │ (JWT/Login) │ │(Denah/Rumah) │ │ (Kependudukan)│ │ KEUANGAN │ │ │
│ │ └──────────────┘ └──────┬───────┘ └──────┬───────┘ └─────┬─────┘ │ │
│ │ │ ▲ │ │ │
│ │ │ In-Memory │ │ │ │
│ │ └─ (Interface) ──┘ │ │ │
│ │ │ │ │
│ │ ┌──────────────┐ ┌──────────────┐ │ │ │
│ │ │ Modul FORUM │ │ Modul LAPAK │ │ │ │
│ │ │ (Threads) │ │ (Iklan) │ │ │ │
│ │ └──────────────┘ └──────────────┘ │ │ │
│ └───────────────────────────────────────────────────────────┼───────┘ │
└──────────────────────────────────────┬─────────────────────────┼────────────┘
│ │
(SQL Query via │ │ (API Request /
Connection Pool) ▼ │ Webhook Callback)
┌──────────────┴──────────────┐ ▼
│ INFRASTRUCTURE DATA │ ┌──────────────┐
│ • PostgreSQL (Main DB) │ │ EXTERNAL API │
│ • Redis (Session & Caching) │ │ • Xendit │
└─────────────────────────────┘ │ • WA Gateway │
└──────────────┘


---

### 2. Standar Struktur Folder Go (Clean Architecture)

Setiap modul di dalam folder `internal/` diisolasi secara mandiri menggunakan prinsip *Clean Architecture* guna memisahkan urusan kode (*Separation of Concerns*):

* **Handler Layer:** Mengurus HTTP Request/Response parsing, validasi JSON payload, dan Webhook endpoint.
* **Service Layer:** Memuat logika bisnis utama, kalkulasi biaya, penanganan error, dan enkripsi data sensitif (UU PDP).
* **Repository Layer:** Satu-satunya layer yang berhak melakukan query SQL mentah ke PostgreSQL pool database.


warga-digital-backend/
├── cmd/
│ └── api/
│ └── main.go # Entry point utama kompilasi binary Go
├── config/
│ └── database.go # Inisialisasi pool PostgreSQL & Redis Client
├── internal/
│ ├── middleware/ # JWT Parser, CheckRole RBAC, Rate Limiter
│ │ └── auth.go
│ │
│ # --- BATAS SANKSI ANTAR-MODUL DOMAIN ---
│ ├── auth/ # Modul Auth: Login WA, Register Tenant, JWT Session
│ │ ├── handler.go | service.go | repository.go
│ ├── wilayah/ # Modul Wilayah: Blok Rumah, Urutan Gang, Data Hunian
│ │ ├── handler.go | service.go | repository.go
│ ├── warga/ # Modul Warga: Profil Kependudukan, Enkripsi NIK, Status Mutasi
│ │ ├── handler.go | service.go | repository.go
│ ├── keuangan/ # Modul Keuangan: Cron Job Iuran, API Invoice Xendit, Webhook [docs.xendit.co]
│ │ ├── handler.go | service.go | repository.go
│ ├── forum/ # Modul Forum: Broadcaster Pengumuman, Threads Diskusi, Komentar
│ │ ├── handler.go | service.go | repository.go
│ └── lapak/ # Modul Lapak: Iklan Produk Jasa Warga, Moderasi Dashboard
│ ├── handler.go | service.go | repository.go
│
├── pkg/ # Shared utilities package (dapat di-import semua modul)
│ └── encryption/ # Modul enkripsi simetris AES-256 untuk NIK/KK
├── go.mod
└── go.sum


---

### 3. Komunikasi Antar-Modul (*Inter-Module Communication Rules*)

Demi menjaga integritas kode agar tetap modular dan tidak menjadi *spaghetti code*, berlaku aturan arsitektur berikut:
1. **Dilarang Cross-Repository Query:** Repository modul `keuangan` tidak boleh mengeksekusi raw query langsung ke tabel `warga` atau `rumah`.
2. **Komunikasi Lewat Service Interface:** Jika modul `keuangan` membutuhkan nomor WhatsApp warga untuk notifikasi tagihan, layer Service `keuangan` harus meng-injeksi dan memanggil fungsi publik milik layer Service `warga` (contoh: `wargaService.GetKontakByRumahID(ctx, id_rumah)`).

---

### 4. Alur Pembayaran Kolektif Per Rumah (Xendit Webhook Sequence)

Arsitektur penagihan dirancang kolektif **per rumah** dengan metode penguncian transaksi agar terhindar dari pembayaran ganda oleh anggota keluarga lain [rtrwonline.id, docs.xendit.co]:


[ React PWA Warga ] [ Go Backend API ] [ Xendit API Engine ]
│ │ │
│ 1. Request Info Tagihan │ │
├───────────────────────────>│ │
│ (Berdasarkan ID Rumah) │ │
│ │ │
│ 2. Klik "Bayar Iuran" │ │
├───────────────────────────>│ │
│ │ 3. Generate Xendit Invoice │
│ │ + Idempotency-Key │
│ ├─────────────────────────────>│
│ │ │
│ │ 4. Return Payment URL & ID │
│ │<─────────────────────────────┤
│ 5. Tampilkan Web Checkout │ │
│<───────────────────────────┤ │
│ │ │
│ 6. Warga Bayar via QRIS/VA │ │
│────────────────────────────┼─────────────────────────────>│
│ │ │
│ │ 7. Kirim HTTP Webhook Sinyal │
│ │ + X-Callback-Token │
│ │<─────────────────────────────┤
│ │ │
│ │ 8. Validasi Token Keamanan │
│ │ Set DB Rumah -> "PAID" │
│ │ Trigger WhatsApp Bukti │
│ │ │
│ 9. UI Auto Update Lunas 🟢 │ │
│<───────────────────────────┤ │


---

### 5. Rencana Infrastruktur & Deployment (Deployment & S3 Storage)

* **Server Utama:** Go dikompilasi menjadi sebuah *native single binary image* yang dieksekusi di dalam container Docker. Server dideploy pada Virtual Private Server (VPS) berspesifikasi minimal (1 Virtual CPU, 1-2 GB RAM) karena Go sangat hemat memori.


* Database Pool: Membuka koneksi pool permanen ke satu instance PostgreSQL lokal atau managed database dengan pembatasan max open connections untuk efisiensi RAM server [rtrwonline.id].
* Aset File (Lapak Warga): Dokumen KTP (KYC) dan foto produk lapak dikirim langsung lewat sambungan aman pre-signed URL dari React PWA ke Object Storage (seperti AWS S3 atau Cloudinary). Database backend hanya memuat tautan string URL teks untuk optimasi ruang penyimpanan.


Dengan lengkapnya ketiga dokumen utama Anda (`PRD_Sistem_Manajemen_Warga.md`, `DDL_Sistem_Manajemen_Warga.md`, dan `ARSITEKTUR_SISTEM_WARGA.md`), seluruh kesepakatan spesifikasi sistem telah terstandarisasi dengan sangat rapi dan formal.
