---
title: xendit
created: 2026-09-03
updated: 2026-09-03
type: entity
tags: [xendit, payment, compliance]
confidence: high
---

# Xendit

Payment gateway (PJP BI) yang dipakai Logikraf. Akun Logikraf sudah **verified** (PT Perorangan + NIB).

## Status Integrasi (2026-09-03)
- **logikraf.id checkout**: Xendit aktif (Fase 1 selesai commit c9ef15f) — handler + webhook setara iPaymu
- **NiagaKu**: integrasi Xendit penuh (referensi pola)
- Smarthub: hanya utk aliran langganan SaaS (revenue Logikraf)

## Batasan penting (untuk model iuran warga)
- Xendit Indonesia **tidak lagi menerima Individual Business** utk pendaftaran baru — merchant wajib entitas legal (PT, CV, PT Perorangan, yayasan)
- Pengelola iuran informal (perorangan tanpa badan usaha) → tidak bisa settle ke rekening pribadi via Xendit
- Settlement tidak otomatis T+1 ke rekening pribadi; dana masuk saldo Xendit dulu, withdrawal terpisah

## Webhook
- URL: `https://logikraf.id/api/webhooks/xendit`, header X-Callback-Token (harus match setting `xendit_webhook_token`)

## Related
- [[xenplatform]], [[payment-gateway-keputusan]], [[logikraf-v2]], [[niagaku]]
