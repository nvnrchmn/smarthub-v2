---
title: ipaymu
created: 2026-09-03
updated: 2026-09-03
type: entity
tags: [ipaymu, payment, compliance]
confidence: high
---

# iPaymu

Payment gateway (PJP BI) — gateway utama Payment Hub logikraf-v2.
Akun Logikraf PT Perorangan **sedang proses verifikasi** (2026-09-03).

## Keunggulan untuk model iuran warga
- Merchant **personal** (KTP saja) tetap diterima — beda dgn Xendit yang wajib entitas legal
- **Split Payment**: warga bayar → otomatis pecah master VA ↔ sub-merchant VA
- Fee split: **Rp 150/transaksi** (min split Rp 500)
- Merchant Scale Up (limit harian/mingguan/bulanan); Enterprise utk unlimited

## Kode Payment Hub (logikraf-v2)
- `CreateSubAccount` → `POST /api/v2/submerchant` (SubMerchantId + VaNumber)
- `CreateSplitPayment` → split otomatis utk iuran warga
- Route `/payment-hub/v1/split-payments` sudah terdaftar

## Pertanyaan terbuka (ke support iPaymu)
- Sub-merchant perorangan (pengelola perumahan tanpa badan usaha) bisa daftar cukup KTP?
- Dana split masuk akun iPaymu sub-merchant langsung?
- Use case iuran warga (non jual barang/jasa) eligible?

## Related
- [[payment-gateway-keputusan]], [[logikraf-v2]], [[smarthub]]
