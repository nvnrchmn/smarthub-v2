# Wiki Schema

## Domain
Ekosistem software house Logikraf Kreatif Indonesia: seluruh produk & layanan di VPS
103.197.188.248, arsitektur teknis, keputusan bisnis/payment gateway, dan pelajaran operasional.
Sumber kebenaran proyek: `.hermesrules` / `README-AI.md` di tiap repo (`~/Projects/*`).

## Conventions
- File names: lowercase, hyphens, no spaces
- Setiap halaman dimulai YAML frontmatter (lihat template)
- Gunakan `[[wikilinks]]` antar halaman (minimal 2 outbound links per halaman)
- Saat update halaman, selalu bump `updated` date
- Setiap halaman baru harus masuk ke `index.md` di section yang benar
- Setiap aksi harus di-append ke `log.md`
- Bahasa: Indonesia (konsisten dengan konvensi kerja Nova)
- Port/produk yang berubah: verifikasi dengan `ss -tlnp` / curl sebelum update halaman
- Jangan pernah menaruh kredensial di halaman wiki — simpan referensi "lihat aaPanel/.env"

## Frontmatter
```yaml
---
title: Page Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: entity | concept | comparison | query | summary
tags: [dari taksonomi di bawah]
sources: [raw/articles/nama.md]   # opsional
confidence: high | medium | low    # opsional
contested: true                    # opsional
---
```

## Tag Taxonomy
- Produk: logikraf-v2, smarthub, niagaku, lemburin, livine, export, profile, infra
- Stack: go, fiber, react, gin, expo, mysql, supabase, aaPanel, nginx, xendit, ipaymu
- Bisnis: payment, saas, monetisasi, compliance, keputusan
- Meta: comparison, keputusan-arsitektur, pelajaran, status
- Proyek lain: niagaku, lemburin (referensi)

Rule: setiap tag harus muncul di taksonomi ini. Tambahkan dulu ke sini sebelum dipakai.

## Page Thresholds
- **Buat halaman** saat entitas/konsep muncul di 2+ sumber ATAU sentral bagi ekosistem
- **Tambahkan ke halaman existing** saat info baru menyentuh yang sudah tercakup
- **JANGAN buat halaman** untuk mention sepintas / di luar domain
- **Split halaman** saat > ~200 baris
- **Archive** saat konten sepenuhnya tergantikan → pindah `_archive/`, hapus dari index

## Entity Pages
Per produk/entitas: overview, stack, port & systemd, repo & branch, DB, status terakhir, keputusan penting.

## Concept Pages
Konsep arsitektur & keputusan: payment hub, gateway, KYC, dsb.

## Comparison Pages
Perbandingan (Xendit vs iPaymu vs XenPlatform, dst): dimensi, tabel, verdict.

## Update Policy
1. Cek tanggal — info baru umumnya supersede yang lama
2. Konflik nyata → catat dua-duanya dengan tanggal + sumber, tandai `contradictions:`
3. Flag untuk review user di laporan lint
