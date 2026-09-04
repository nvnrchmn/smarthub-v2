# SmartHub v2 — Design System (Referensi Tunggal)

> Status: 2026-09-05. Dokumen ini menggantikan `Design.md` sebagai acuan UI/UX
> yang berlaku (Design.md dipertahankan sebagai arsip brief awal).
> Pendamping: `UX-HEURISTICS.md` (10 heuristik Nielsen + psikologi UX).

## 1. Prinsip Produk
- Target: ibu-ibu 35-55, HP mid-range ≤360px, 4G kadang putus → **sederhana, cepat, teks jelas**.
- Bahasa Indonesia; mode gelap otomatis mengikuti OS (`prefers-color-scheme`) — keputusan v2 (brief awal menolak dark mode; dipakai karena biaya kecil & tetap default terang bagi mayoritas).
- Status TIDAK boleh hanya mengandalkan warna — selalu ada ikon/label teks.

## 2. Token (implementasi: `src/index.css`)
| Token | Terang | Gelap |
|---|---|---|
| `--sh-surface` (latar) | `#F7F8F6` | `#0F1512` |
| `--sh-card` (kartu) | `#FFFFFF` | `#18211C` |
| `--sh-border` | `#E7EBE8` | `#26332C` |
| `--sh-text-1` (judul) | `#1A1F1C` | `#EDF2EE` |
| `--sh-text-2` (sekunder) | `#64716A` | `#9CA9A1` |
| `--sh-text-3` (disabled) | `#9AA6A0` | `#7A8A82` |
| `--sh-ph` (placeholder) | `#93A09A` | `#8C9C94` |

Warna semantik (statis): `primary #1B6B4A` (+50 `#EBF5F0`, +100 `#C3E2D4`), status
paid `#22C55E` / pending `#F59E0B` / overdue `#EF4444` / empty `#94A3B8`
(+ varian `-bg` pastel: `#DCFCE7/#FEF3C7/#FEE2E2/#F1F5F9`), danger `#DC2626`.
Pakai token semantik (`bg-surface-card`, `text-text-primary`), JANGAN `bg-white` di dalam komponen.

## 3. Tipografi
Plus Jakarta Sans Variable. Base input 16px (cegah zoom iOS); teks utama 14-16px;
nominal besar `text-3xl font-bold` warna `text-primary`; chip/badge `11px`; label waktu `12px`.
**Tidak ada teks < 11px.** Judul halaman `text-xl font-bold`.

## 4. Spacing — skala 4px
4 ikon↔teks • 8 chip • 12 tombol kecil • 16 kartu • 20 antar kartu • 24 padding halaman •
32 antar section. Konsisten, jangan 14/18px seenaknya.

## 5. Komponen & Aturannya
- **Bottom nav** (mobile): 64px + safe-area; ≤5 item; **aktif: ikon + label (primary); tidak aktif: ikon saja (abu)**. Touch ≥44px.
- **Kartu**: `rounded-xl`/`2xl border border-border bg-surface-card p-4`. Kartu status = `border-l-4` warna status.
- **Kartu rumah**: border-kiri (Dihuni=hijau, Kosong=abu), ikon rumah SVG, dot + label teks. List dikelompokkan per gang dengan header sticky.
- **Kartu tagihan**: nominal 3xl `text-primary`, chip status pastel + teks warna status.
- **Form kelola data (Rumah/Warga)**: di dalam **Drawer** bottom-sheet (handle, Esc/backdrop tutup, `role=dialog`, max-h 90vh). Form sosial (forum/lapak) boleh kartu terlihat di halaman.
- **Pengumuman** ≠ **Diskusi**: pengumuman = `bg-primary-50` + border primary + badge megaphone putih; diskusi = kartu netral.
- **Avatar**: inisial, warna hash nama (8 preset) — tanpa foto (privasi).
- **Ikon**: SVG `Icon.tsx` (stroke konsisten). DILARANG emoji di UI.
- **Status Uang**: PAID=Lunas(hijau), PENDING=Belum Bayar(amber), OVERDUE=Terlambat(merah) + label teks.

## 6. State Wajib Setiap Fetch
`loading` → `Skeleton` (1-2 blok); `error` → pesan merah + tombol coba lagi; `empty` → `EmptyState` dengan aksi lanjut. Pesan sukses hijau, error merah (`role=status`/`role=alert`) — jangan semua hijau.

## 7. Aksesibilitas & Interaksi
- Tombol utama `h-12` (48px); minimum 44px.
- `:focus-visible` ring hijau; `aria-label` pada tombol ikon saja; `aria-hidden` dekorasi.
- Hapus `tap-highlight`; `touch-action: manipulation`.
- Hindari animasi berat: opacity 150ms cukup.

## 8. Dashboard (Bento — pola v2)
Kartu bento `components/ui/bento.tsx`: BentoCard (tone + span), KPI, ActionTile,
SectionHead, Progress, Avatar, Skeleton, EmptyState, ErrorState. Aturan: KPI besar
`md:col-span-2` di kiri atas; angka nyata dari API (JANGAN hardcode).

## 9. Checklist Komponen Selesai
- [ ] 360px aman (uji emulator)
- [ ] Tombol utama ≥48px, semua target ≥44px
- [ ] Teks ≥11px; input ≥16px
- [ ] Status terbaca tanpa warna
- [ ] Ada skeleton, empty, & error state
- [ ] Ikon SVG (bukan emoji), aria-label lengkap
- [ ] Dark mode: tidak ada `bg-white`/warna gelap hardcoded yang menabrak token
