---
title: Payment Hub (arsitektur)
created: 2026-09-03
updated: 2026-09-03
type: concept
tags: [payment, keputusan-arsitektur, go, fiber]
confidence: high
---

# Payment Hub — Orkestrator Pembayaran Multi-Tenant

Central payment orchestrator di logikraf-v2. Dibuat agar produk Logikraf (smarthub, dll)
tidak integrasi gateway masing-masing — cukup panggil Payment Hub.
Referensi desain: `docs/ADR-005-payment-hub.md`.

## Prinsip ADR-005
- Dana flow: Warga → Produk (smarthub) → Payment Hub → Merchant Tenant → Settlement → Rekening Tenant
- **Logikraf tidak pernah memegang dana tenant** — hanya mencatat entitlement, fee, rekonsiliasi
- `tenantOf(c)` = host tanpa port/www → config per tenant di `settings` (composite PK tenant+key)

## Komponen kode (logikraf-v2)
- `internal/service/payment_hub.go` (387+ baris): CreateSubAccount, CreateSplitPayment, dsb
- `internal/delivery/handler/payment_hub.go`: routes `/payment-hub/v1/*` + webhook `/webhooks/ipaymu`
- `pkg/ipaymu/client.go`: shared client iPaymu v2 (signature logic) — dipakai logikraf & smarthub
- Model: `TenantPaymentAccount` (onboarding merchant), `PaymentTransaction` (ledger per-tenant), `ProcessedWebhook` (idempotency)

## Tenant / klien
- Smarthub (SB Digital): `PAYMENT_HUB_BASE_URL=https://logikraf.id/api/payment-hub/v1` + API key + webhook secret
- API key per tenant: `handleAdminCreateAPIKey`

## Arah masa depan (2026-09-03)
- Gateway utama = iPaymu (split payment utk iuran warga)
- Lihat [[payment-gateway-keputusan]]

## Related
- [[logikraf-v2]], [[ipaymu]], [[smarthub]], [[vps-logikraf]]
