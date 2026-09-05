---
title: Xendit vs iPaymu
created: 2026-09-03
updated: 2026-09-03
type: comparison
tags: [xendit, ipaymu, payment, comparison]
confidence: medium
---

# Xendit vs iPaymu (2026-09-03)

Perbandingan utk use case Logikraf: penerimaan iuran warga multi-tenant + langganan SaaS.
Harga = estimasi publik, perlu quote resmi sebelum keputusan final.

| Dimensi | Xendit | iPaymu |
|---|---|---|
| Status akun Logikraf | ✅ Verified (PT Perorangan + NIB) | ⏳ Verifikasi PT Perorangan proses |
| Merchant personal (KTP) baru | ❌ Ditolak — wajib entitas legal | ✅ Bisa (personal) |
| KYC tiap tenant (pengelola informal) | Blocker utama | Ringan (KTP) |
| Split multi-tenant | Via XenPlatform (fee 0,5% cap 10rb + 25rb/bln/aktif) | Split payment Rp 150/transaksi |
| Settlement ke rek. pribadi tenant | ❌ Tidak bisa diasumsikan | Perlu konfirmasi (dana ke akun iPaymu sub-merchant) |
| Payout/disbursement | Rp 2.500/transfer + PPN | (n/a utk model split) |
| Kode Payment Hub existing | Sebagian (handler Xendit utk checkout) | ✅ Penuh (CreateSubAccount/CreateSplitPayment) |

## Verdict (per 2026-09-03)
- **Aliran SaaS (uang Logikraf)** → Xendit (sudah live)
- **Aliran iuran warga** → iPaymu Split Payment lebih cocok; menunggu verifikasi akun + konfirmasi use case sub-merchant personal

## Related
- [[xendit]], [[ipaymu]], [[payment-gateway-keputusan]]
