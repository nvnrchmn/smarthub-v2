---
title: Smarthub v2 — Sistem Manajemen Warga Digital
created: 2026-09-04
updated: 2026-09-05
type: entity
tags: [smarthub, go, fiber, mysql, redis, saas, multi-tenancy, warga, rt-rw, jwt, pwa, react]
---

# Smarthub v2

## Status: LIVE — semua fase selesai (0-7) + UI/UX layer restructure
URL: https://smarthub.logikraf.id | Repo: github.com/nvnrchmn/smarthub-v2 | DB: smarthub_v2 :8082

## Stack
Go Fiber v3 + GORM + MySQL + Redis + JWT + AES; React/Vite/Tailwind; PWA. Deploy systemd `/usr/local/bin/smarthub-server` + nginx strip `/api`.

## Layer & Route
- Public: `/` landing, `/login`, `/register`
- Warga (app mobile, BottomNav): `/app` beranda, `/app/tagihan`, `/app/forum`, `/app/lapak`
- Ketua RT (sidebar): `/rt` dashboard, `/rt/rumah`, `/rt/warga`, `/rt/tagihan` (generate tagihan per periode)
- Super Admin (sidebar): `/admin` — pakai admin API `GET /admin/summary` + `/admin/tenants` (RoleRequired super_admin)

## Layout Pattern (FIX 2026-09-05)
```
<h-dvh flex-col>
  <aside fixed> (admin/rt)
  <main flex-1 overflow-y-auto>
    <Outlet />
  </main>
  <BottomNav /> (flex-shrink-0, fixed di bawah)
</h-dvh>

<Portal>
  <Modal fixed inset-0 z-[100] flex items-center justify-center>
    <!-- Always centered in viewport, tidak terpengaruh scroll user -->
  </Modal>
</Portal>
```

- Semua layout: `h-dvh flex flex-col bg-surface` — TIDAK BOLEH pakai `min-h-screen` + scroll seluruh body
- `<main className="flex-1 overflow-y-auto overflow-x-hidden">` — hanya konten yang scroll
- BottomNav/BottomBar: fixed di bawah via `flex-shrink-0` (bukan `fixed` + `bottom-0` + `pb-28`)
- Modal/Drawer: render via `createPortal(..., document.body)` — centered viewport, independen dari scroll user

## Deployment (FIX 2026-09-05)
- Build lokal: `cd frontend && npm run build` → `frontend/dist/`
- Sync ke VPS: `sudo cp -r frontend/dist/* /www/wwwroot/smarthub.logikraf.id/ && sudo chown -R www:www /www/wwwroot/smarthub.logikraf.id/`
- Restart: `sudo nginx -s reload` + `sudo systemctl restart smarthub` (atau kill + nohup)
- File lama di web root harus dihapus sebelum copy baru (nama file hash berubah tiap build)
- Service: `/usr/local/bin/smarthub-server` (systemd), port 8082, config `/etc/smarthub.env`

## Features (2026-09-05 - sesi 4)

### Settlement (Tagihan QRIS)
- Alur: Warga bayar via QRIS → status PAID → Ketua RT request settlement → Super Admin approve/reject
- Backend: `internal/settlement/` (service + handler), tabel `settlement_requests`, `settlement_tagihan`
- Frontend: RT (`/rt/settlement`), Admin (`/admin/settlement`)
- Xendit API: `TransferToBank` siap pakai (butuh `XENDIT_SECRET_KEY` & `XENDIT_DISBURSEMENT_ID` di env)
- Endpoint: GET `/settlement/balance`, POST `/settlement/request`, GET `/settlements`, GET/POST `/admin/settlements/*`

### Subscription Per-Rumah (Rp 3.000/rumah/bulan)
- Model: 1 rumah = 1 langganan (bukan per-tenant)
- Tabel: `layanan`, `invoice`
- Backend: `internal/subscription/` (service + handler)
- Frontend: RT (`/rt/langganan`), Admin (`/admin/subscription`)
- Fitur lengkap otomatis aktif untuk rumah berlangganan
- Endpoint: GET `/subscription/layanan`, POST `/subscription/request`, GET `/subscription/invoices`, GET `/admin/subscription/*`

### CMS Landing Page
- Semua section editable: Hero, Features, Pricing, FAQ, Testimonials, Footer
- Backend: `internal/cms/` (service + handler), tabel `cms_landing` (JSON)
- Frontend: Admin (`/admin/cms`) dengan rich text editor
- Endpoint: GET `/cms/landing` (public), PUT `/admin/cms/:section` (super_admin)

### Super Admin Features
- Tenant Detail: `/admin/tenants/:id` (statistik lengkap tenant)
- Analytics Dashboard: `/admin/analytics` (grafik revenue, pertumbuhan)
- Audit Logs: `/admin/audit-logs` (tracking aktivitas user)
- Broadcast: `/admin/broadcast` (kirim pengumuman ke user)
- Audit Log juga dicatat otomatis di `audit_log` tabel

### Notifikasi & KYC
- In-app notification: `internal/notifikasi/` (service + handler), tabel `notifikasi`
- WhatsApp notification: `SendWhatsApp` service (butuh WA Business API)
- Upload KTP: `/notifikasi/upload-ktp` (KYC)
- Frontend: `NotificationBell` component (auto-refresh 30 detik, badge unread)

### Xendit Settings via Admin Panel
- Super Admin bisa save `xendit_secret_key` & `xendit_webhook_token` di `/admin/settings`
- Data disimpan terenkripsi AES-GCM di tabel `settings`
- Endpoint: GET `/admin/settings` (status), POST `/admin/settings` (save)

### Bottom Nav Pattern
- Maksimal 4 menu + tombol "Lainnya" (drawer untuk menu tambahan)
- Warga: Beranda, Tagihan, Forum, Lapak, Lainnya → Pengaturan
- RT: Dashboard, Warga, Tagihan, Settlement, Lainnya → Langganan + Pengaturan
- Admin: Dashboard, Tenants, Settlement, Subscription, Lainnya → CMS + Audit + Broadcast + Users + Pengaturan

## Catatan penting
- Auth: 3 role (super_admin/ketua_rt/warga), multi-tenant; login kirim `nomor_wa` + `password` → JWT
- Middleware `resolve()` tanpa Next — jangan panggil AuthRequired dari RoleRequired (panic/race) — sudah di-fix
- Model GORM butuh TableName() eksplisit (rumah, warga)
- Test user: 081234567890 (super_admin tenant 1)

## Backlog
- Pembayaran Xendit nyata (webhook ada, integrasi invoice belum)
- Notifikasi push PWA (FCM token column ada)
- Xendit sub-account per tenant (status KYC masih PENDING)
