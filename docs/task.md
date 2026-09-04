# Task List: SmartHub V2 — Sistem Manajemen Warga Digital

> Stack: **Go (Backend)** + **React 19 + Vite + TypeScript + ShadcnUI (Frontend)** + **PostgreSQL + Redis**
> Setiap task dirancang atomic agar hemat token dan dapat dikerjakan satu per satu.

---

## 🏗️ FASE 0 — Project Scaffolding

### Backend (Go)
- [ ] **T-001** Inisialisasi modul Go (`go mod init`) + struktur folder Clean Architecture (`cmd/`, `config/`, `internal/`, `pkg/`)
- [ ] **T-002** Setup `config/database.go` — koneksi pool PostgreSQL (`pgx`) + Redis client (`go-redis`)
- [ ] **T-003** Setup HTTP server utama (`cmd/api/main.go`) menggunakan `chi` atau `fiber`, dengan graceful shutdown
- [ ] **T-004** Buat `.env` + `config/config.go` untuk membaca environment variables (DB, Redis, JWT secret, Xendit key)

### Frontend (React PWA)
- [ ] **T-005** Scaffold project React 19 + Vite + TypeScript via `create-vite`
- [ ] **T-006** Install dan setup ShadcnUI + TailwindCSS + konfigurasi path alias (`@/`)
- [ ] **T-007** Setup `vite-plugin-pwa` — manifest, service worker, offline cache
- [ ] **T-008** Setup React Router v7, layout root, dan placeholder halaman utama

### Database
- [ ] **T-009** Jalankan DDL SQL dari `docs/DDL.md` ke PostgreSQL lokal — verifikasi semua tabel & index terbuat
- [ ] **T-010** Buat seed data awal: 1 tenant dummy, 1 user super_admin, 1 user ketua_rt, beberapa rumah & warga

---

## 🔐 FASE 1 — Modul Auth (`internal/auth`)

- [ ] **T-011** Buat `pkg/encryption/aes.go` — AES-256 encrypt/decrypt untuk NIK & No KK
- [ ] **T-012** Buat `pkg/jwt/jwt.go` — generate & validate JWT (access token long-lived)
- [ ] **T-013** `auth/repository.go` — query: `GetUserByNomorWA`, `CreateTenant`, `CreateUser`
- [ ] **T-014** `auth/service.go` — logic: register tenant, login via nomor WA + password, return JWT
- [ ] **T-015** `auth/handler.go` — endpoint: `POST /auth/register`, `POST /auth/login`
- [ ] **T-016** `internal/middleware/auth.go` — JWT validator middleware + RBAC `CheckRole(roles...)` middleware
- [ ] **T-017** Frontend: Halaman Login (nomor WA + password) dengan form ShadcnUI, panggil API, simpan token di `localStorage`
- [ ] **T-018** Frontend: Setup Axios instance dengan interceptor Bearer token + handling 401 auto-redirect

---

## 🗺️ FASE 2 — Modul Wilayah (`internal/wilayah`)

- [ ] **T-019** `wilayah/repository.go` — CRUD tabel `rumah`: `CreateRumah`, `GetRumahByTenant`, `UpdateRumah`, `DeleteRumah`
- [ ] **T-020** `wilayah/service.go` — business logic termasuk agregasi status warna dari tagihan berjalan
- [ ] **T-021** `wilayah/handler.go` — endpoint: `GET /wilayah/rumah`, `POST /wilayah/rumah`, `PUT /wilayah/rumah/:id`, `DELETE /wilayah/rumah/:id`
- [ ] **T-022** Frontend: Halaman Denah — Grouped Card List per Gang, warna kartu otomatis (🟢🟡🔴⚪) berdasarkan status tagihan
- [ ] **T-023** Frontend: Form tambah/edit Rumah menggunakan ShadcnUI `Drawer` (mobile-first)

---

## 👥 FASE 3 — Modul Warga (`internal/warga`)

- [ ] **T-024** `warga/repository.go` — CRUD tabel `warga`: `CreateWarga`, `GetWargaByRumah`, `UpdateStatusWarga`, enkripsi NIK/KK sebelum insert
- [ ] **T-025** `warga/service.go` — logic mutasi (pindah/meninggal = soft-delete via status flag), expose `GetKontakByRumahID` sebagai interface publik
- [ ] **T-026** `warga/handler.go` — endpoint: `GET /warga`, `POST /warga`, `PUT /warga/:id/mutasi`
- [ ] **T-027** Frontend: Halaman Daftar Warga per Rumah, tampilkan status hunian, status warga
- [ ] **T-028** Frontend: Form tambah Warga + Form Mutasi (pindah/meninggal) menggunakan `Drawer`

---

## 💰 FASE 4 — Modul Keuangan (`internal/keuangan`)

- [ ] **T-029** `keuangan/repository.go` — CRUD: `CreateMasterIuran`, `GetTagihanByRumah`, `CreateTagihanBulk`, `UpdateStatusTagihan`
- [ ] **T-030** `keuangan/service.go` — inject `wargaService`, logic generate tagihan kolektif per rumah, idempotency check
- [ ] **T-031** `keuangan/service.go` — integrasi Xendit: `CreateInvoice` (dengan Idempotency-Key), `HandleWebhook` (validasi `X-Callback-Token`)
- [ ] **T-032** `keuangan/handler.go` — endpoint: `GET /keuangan/tagihan`, `POST /keuangan/tagihan/generate`, `POST /keuangan/webhook/xendit`
- [ ] **T-033** Setup Cron Job (`robfig/cron`) di `main.go` — trigger generate tagihan setiap tanggal 1 pukul 07:00 WIB
- [ ] **T-034** Frontend: Halaman Tagihan Saya (view warga) — tampil nominal, status, tombol "Bayar Sekarang" (redirect ke Xendit URL)
- [ ] **T-035** Frontend: Dashboard Keuangan Bendahara — daftar tagihan semua rumah, filter status (PENDING/PAID/EXPIRED)

---

## 📣 FASE 5 — Modul Forum (`internal/forum`)

- [ ] **T-036** `forum/repository.go` — CRUD `forum_threads` & `forum_komentar`
- [ ] **T-037** `forum/service.go` — logic validasi tipe thread (hanya pengurus bisa buat `Pengumuman`), trigger FCM push notification saat pengumuman dibuat
- [ ] **T-038** `forum/handler.go` — endpoint: `GET /forum/threads`, `POST /forum/threads`, `GET /forum/threads/:id`, `POST /forum/threads/:id/komentar`
- [ ] **T-039** Frontend: Halaman Forum — list thread (tab Pengumuman / Diskusi), card thread
- [ ] **T-040** Frontend: Halaman Detail Thread + komentar bertingkat, form reply

---

## 🛒 FASE 6 — Modul Lapak (`internal/lapak`)

- [ ] **T-041** `lapak/repository.go` — CRUD `lapak_warga`: `CreateProduk`, `GetProdukByTenant`, `UpdateApproval`
- [ ] **T-042** `lapak/service.go` — logic moderasi (toggle `is_approved`)
- [ ] **T-043** `lapak/handler.go` — endpoint: `GET /lapak`, `POST /lapak`, `PUT /lapak/:id`, `PATCH /lapak/:id/moderasi`
- [ ] **T-044** Frontend: Upload foto produk langsung ke Cloud Storage via pre-signed URL (implementasi Cloudinary atau S3)
- [ ] **T-045** Frontend: Halaman Lapak — grid produk warga, tombol "Hubungi Penjual" (deep link WhatsApp)
- [ ] **T-046** Frontend: Form tambah/edit produk lapak, panel moderasi untuk pengurus

---

## 🚀 FASE 7 — Finalisasi & Deployment

- [ ] **T-047** Buat `Dockerfile` multi-stage untuk Go binary (builder + minimal alpine runner)
- [ ] **T-048** Buat `docker-compose.yml` — services: `api`, `postgres`, `redis`
- [ ] **T-049** Setup CORS handler di backend — whitelist domain frontend
- [ ] **T-050** Review keseluruhan RBAC — pastikan semua endpoint terlindungi sesuai matriks hak akses di PRD
- [ ] **T-051** Testing end-to-end alur pembayaran: generate tagihan → Xendit invoice → webhook → status PAID
- [ ] **T-052** PWA testing: install to homescreen, offline mode, push notification

---

## 📊 Progress Summary
| Fase | Total Task | Selesai |
|------|-----------|---------|
| 0 — Scaffolding | 10 | 0 |
| 1 — Auth | 8 | 0 |
| 2 — Wilayah | 5 | 0 |
| 3 — Warga | 5 | 0 |
| 4 — Keuangan | 7 | 0 |
| 5 — Forum | 5 | 0 |
| 6 — Lapak | 6 | 0 |
| 7 — Deployment | 6 | 0 |
| **Total** | **52** | **0** |
