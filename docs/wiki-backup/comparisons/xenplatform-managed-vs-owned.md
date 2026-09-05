---
title: XenPlatform Managed vs Owned
created: 2026-09-03
updated: 2026-09-03
type: comparison
tags: [xendit, xenplatform, payment, comparison]
confidence: high
---

# XenPlatform: Managed vs Owned Sub-Account

Dua tipe sub-account XenPlatform Xendit. Sumber: docs & help center Xendit (Juli 2026).

| Dimensi | Managed | Owned |
|---|---|---|
| Identitas di mata pembayar | **Partner (tenant)** | Platform (Logikraf) |
| KYC partner ke Xendit | Ya — submit dokumen | Tidak |
| Akses dashboard partner | Otomatis | Diundang platform |
| Pembayar MDR | Partner | Platform (indirect) / partner (direct) |
| Developer access | Penuh | Dicabut (master kontrol) |
| Ketersediaan Indonesia | ✅ | ❌ Disabled by default (request khusus) |

## Biaya (Indonesia)
- Sub-account activity fee: Rp 25.000/bulan per sub-account **aktif** (≥1 transaksi LIVE; withdrawal/top-up tidak dihitung)
- In-house transaction fee: **0,5% cap Rp 10.000** per transfer antar akun / platform-fee split — ditagih ke platform
- Contoh: split fee Rp 5.000 → in-house Rp 25; split Rp 5 jt → cap Rp 10.000
- Disbursement payout: Rp 2.500/transfer + PPN

## Verdict untuk Smarthub
- Managed secara prinsip cocok (dana atas nama tenant), TAPI KYC entitas legal per tenant = blocker pengelola informal
- Owned tidak tersedia default di Indonesia + identitas jadi milik Logikraf (bertentangan dgn prinsip no-custody/no-branding siluman)
- Kesimpulan: ditunda — lihat [[payment-gateway-keputusan]]

## Related
- [[xenplatform]], [[xendit]], [[payment-gateway-keputusan]]
