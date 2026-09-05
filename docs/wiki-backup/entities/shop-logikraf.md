---
title: shop-logikraf (shop.logikraf.id)
created: 2026-09-03
updated: 2026-09-03
type: entity
tags: [shop, go, fiber, react, xendit, keputusan]
confidence: high
---

# shop.logikraf.id — Official Store Logikraf

Marketplace 1-vendor: jual produk/jasa **Logikraf sendiri** (bukan multi-vendor). Semua
hasil penjualan milik Logikraf → **tanpa isu custody/PJP** (beda dengan aliran iuran
smarthub).

## Keputusan (2026-09-03)
- Model: **toko 1-vendor** (bukan multi-vendor UMKM, bukan hybrid)
- Tipe produk: **campuran** — digital (template, lisensi SaaS), jasa (paket website),
  fisik (merchandise mousepad dll)
- Timeline: MVP cepat (produk & konten sudah siap), bukan project berbulan-bulan
- Repo: `~/Projects/logikraf-shop` (baru) — **app terpisah**, bukan perluas monolith
  logikraf-v2
- Stack: Go Fiber v3 + GORM + MySQL (`shop_logikraf`), React 19 Vite TS, systemd
  `shop-server`, **port 8085** (slot kosong VPS), deploy GitHub Actions (pola sama)
- Payment: **reuse pola Xendit Fase 1** (`CreateXenditInvoice` + webhook) — sudah
  teruji di logikraf-v2
- Login akun: MVP **tanpa akun** (cek order via ID/email); login menyusul kalau
  produk SaaS butuh license key per akun

## Model Data Inti
- `products`: type = digital | service | physical (+ stock nullable, asset path utk digital)
- `orders` + `order_items` (snapshot harga)
- `digital_assets`: link/license key dikirim otomatis setelah webhook PAID
- `shipments`: alamat + ongkir flat (Jabodetabek/luar), RajaOngkir nanti
- service order: alur progress, bukan checkout instan

## Milestone
- M1: katalog + keranjang + checkout Xendit → order paid
- M2: delivery digital otomatis + fisik (alamat/ongkir flat) + status order
- M3: produk jasa (progress) + admin panel

## Status Aktual (cek 2026-09-03)
- ✅ Repo `~/Projects/logikraf-shop` live di VPS port 8085 (systemd `shop-server`), DB `shop_logikraf`, 6 produk ter-seed, DNS+SSL ok
- ✅ M1 inti selesai: GET /api/products, POST /api/orders (order+items+invoice Xendit), GET /api/orders/:code, webhook xendit PAID → order paid + DigitalDelivery
- ✅ Frontend: shadcnUI + Tailwind v4 + 10 heuristik Nielsen (toast/sheet/skeleton/badge); dark; status order /order/:code
- ⚠️ XENDIT_SECRET_KEY & WEBHOOK_TOKEN masih kosong di /etc/logikraf-shop.env → pembayaran BELUM bisa live test
- ⚠️ 5 commit belum di-push (ahead 5); CI deploy butuh secrets VPS
- 🔲 M2: email delivery digital (link/license) — DigitalDelivery tercatat tapi pengiriman email belum; ongkir fisik masih flat=0; M3: admin panel belum ada

## Related
- [[logikraf-v2]] (sumber pola payment Xendit), [[xendit]], [[payment-gateway-keputusan]], [[vps-logikraf]]
