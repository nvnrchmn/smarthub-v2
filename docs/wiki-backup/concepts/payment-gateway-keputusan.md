---
title: Payment Gateway — Keputusan Arsitektur
created: 2026-09-03
updated: 2026-09-03
type: summary
tags: [payment, keputusan, keputusan-arsitektur, comparison]
confidence: high
---

# Keputusan Payment Gateway (2026-09-03)

Ringkasan keputusan arsitektur payment utk seluruh ekosistem Logikraf.

## Prinsip inti
**Logikraf tidak boleh memegang/mengendapkan uang tenant (iuran warga), walau sedetik.**
Ini batas compliance (PJP) sekaligus prinsip bisnis.

## Dua aliran uang (harus selalu dipisah)
1. **Langganan SaaS** → milik Logikraf → Xendit Logikraf (verified, Fase 1 selesai)
2. **Iuran warga** (IPL, keamanan) → milik tenant → JANGAN lewat rekening Logikraf

## Keputusan aliran iuran
| Opsi | Status |
|---|---|
| iPaymu Split Payment | **Favorit** — kode Payment Hub sudah ada, fee Rp150/split, merchant personal KTP bisa |
| Transfer langsung + verifikasi | Fallback — tanpa gateway, tanpa KYC |
| XenPlatform Managed | Ditunda — KYC entitas legal per sub-account = blocker pengelola informal |
| Single merchant + payout API (internal ledger) | **Ditolak** — Logikraf jadi pemegang dana = wilayah PJP, butuh izin BI (mustahil utk PT Perorangan skala ini) |

## Status terakhir
- Verifikasi akun iPaymu PT Perorangan: **proses** (2026-09-03)
- Setelah verifikasi kelar → uji end-to-end CreateSubAccount + CreateSplitPayment dengan sub-merchant pertama
- Pertanyaan kunci ke iPaymu: sub-merchant perorangan cukup KTP? dana split masuk akun sub-merchant?

## Detail
- [[xendit]], [[ipaymu]], [[xenplatform]], [[smarthub]], [[logikraf-v2]]
- Comparison: [[comparisons/xendit-vs-ipaymu]], [[comparisons/xenplatform-managed-vs-owned]]
