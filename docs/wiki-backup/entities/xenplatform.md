---
title: xenplatform
created: 2026-09-03
updated: 2026-09-03
type: entity
tags: [xendit, payment, compliance, keputusan]
confidence: high
---

# XenPlatform (Xendit)

Produk Xendit utk platform/marketplace: sub-account management, split payments,
transfer saldo antar akun, dashboard per partner.

## Model Akun
| Dimensi | Managed | Owned |
|---|---|---|
| Identitas di mata pembayar | Partner | Platform |
| KYC partner | Ya (submit dokumen ke Xendit) | Tidak |
| Akses dashboard partner | Otomatis | Diundang |
| Bayar MDR | Partner | Platform |
| Indonesia | Aktif | **Disabled by default** (request khusus) |

## Biaya (Indonesia, 2026)
- Sub-account activity fee: **Rp 25.000/sub-account aktif/bulan** (aktif = ≥1 transaksi LIVE)
- In-house transaction fee: **0,5% cap Rp 10.000** per transfer antar akun (termasuk platform fee split)
- Disbursement/payout: Rp 2.500/transfer sukses + PPN
- MDR transaksi: ditanggung sub-account/partner

## Evaluasi untuk Smarthub (2026-09-03)
- Use case platform berpotensi eligible, tapi tiap sub-account (pengelola) wajib KYC entitas legal
- Pengelola informal perorangan → blocker (sama dgn Xendit reguler)
- Kesimpulan: **jangan dulu** — lihat [[payment-gateway-keputusan]]

## Related
- [[xendit]], [[payment-gateway-keputusan]], [[smarthub]]
