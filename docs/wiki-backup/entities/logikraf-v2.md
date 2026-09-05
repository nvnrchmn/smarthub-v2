---
title: logikraf-v2 (logikraf.id)
created: 2026-09-03
updated: 2026-09-03
type: entity
tags: [logikraf-v2, go, fiber, react, mysql, payment]
confidence: high
---

# logikraf-v2 — logikraf.id (Logikraf AI Studio)

Website korporat PT Logika Kreatif Indonesia + Payment Hub multi-tenant.
Repo: `~/Projects/LogikaKreatifIndonesia` (GitHub nvnrchmn/LogikaKreatifIndonesia).

## Stack
- Backend: Go 1.25+ + GoFiber v3 + GORM (MySQL), port 8081, systemd `logikraf-server`
- Frontend: React 19 + TS + Vite + Ant Design + Tailwind v4 + TanStack Query
- DB: MySQL `logikraf_v2`
- Deploy: `git push origin main` → GitHub Actions → SSH VPS → systemd restart

## Struktur
- `logikraf-v2/` — app utama (backend Go + frontend React)
- `docs/` — ADR, blueprint (termasuk ADR-005-payment-hub.md)
- `internal/service/payment_hub.go` + `internal/delivery/handler/payment_hub.go` — Payment Hub

## Payment (status 2026-09-03)
- Gateway per-tenant via settings table (payment_gateways, fee, keys)
- Checkout publik: handler iPaymu/Xendit/Midtrans di `payment.go`
- Payment Hub: sub-merchant iPaymu + split payment utk tenant (iuran warga) — kode sudah ada (`CreateSubAccount`, `CreateSplitPayment`)
- 2026-09-03: Xendit diaktifkan utk checkout logikraf.id (Fase 1 selesai, commit c9ef15f) — lihat [[payment-gateway-keputusan]]

## Related
- [[vps-logikraf]], [[smarthub]], [[payment-gateway-keputusan]], [[xendit]], [[ipaymu]]
