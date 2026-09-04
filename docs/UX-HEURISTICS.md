# UX Audit & Heuristik — SmartHub v2 (2026-09-05)

Redesign dashboard bento grid + penerapan **10 Heuristik Nielsen** & **psikologi UX**.
Sumber: Nielsen Norman Group (1994); hukum psikologi: Fitts, Hick, Miller, Gestalt, Jakob, Von Restorff, estetika-guna, Zeigarnik, efek posisi serial.

## 10 Heuristik Nielsen → implementasi

| # | Heuristik | Implementasi di SmartHub |
|---|-----------|--------------------------|
| 1 | Visibilitas status sistem | Skeleton shimmer saat muat; badge status tagihan (Lunas/Menunggu/Terlambat); tombol disabled + "Membuat akun…" saat submit; progress bar kepatuhan animasi |
| 2 | Kecocokan sistem-dunia nyata | Angka dashboard **dari API, bukan hardcoded** (perbaikan: hapus "Rp 150.000" statis); bahasa Indonesia; periode bulan lokal ("September 2026"); ikon metafora rumah/warga/dompet |
| 3 | Kontrol & kebebasan pengguna | Tombol "Keluar" di header; tombol kembali antar halaman; empty state tidak buntu (ada aksi lanjut) |
| 4 | Konsistensi & standar | Emoji diganti **satu set ikon SVG stroke seragam** (Feather); navigasi bawah ≤5 item dengan label; radius/shadows konsisten (rounded-2xl, shadow-sm) |
| 5 | Pencegahan error | Validasi format WA `08…`, password ≥6, nama wajib di register; konfirmasi hapus data pengurus (sudah ada di halaman kelola) |
| 6 | Kenali daripada mengingat | Menu aksi cepat dengan ikon+deskripsi di tiap dashboard; role-based nav tetap terlihat; progres ringkas "X dari Y rumah lunas" |
| 7 | Fleksibilitas & efisiensi | Link "Lihat semua" dari dashboard ke halaman penuh; aksi cepat (Bayar sekarang, Kelola Rumah) 1-tap dari dashboard |
| 8 | Desain estetis & minimalis | Bento grid: KPI penting menonjol (span 2 + tone primary), dekorasi minimal; keseimbangan whitespace; ikon chip berwarna sebagai hirarki |
| 9 | Bantu pengguna mengenali & pulih dari error | `ErrorState` dengan pesan + tombol **Coba lagi** (retry refetch); pesan error inline merah; `role="alert"` |
| 10 | Bantuan & dokumentasi | Microcopy kontekstual ("semua angka dari data terbaru", "belum ada tagihan untuk…"); deskripsi di section header & empty state |

## Hukum psikologi yang dipakai

- **Fitts** — target sentuh ≥44px (nav 56px, tombol min-h-[44–48px]); aksi utama di area jangkauan ibu jari (hero CTA, bottom nav).
- **Hick** — keputusan dipangkas: nav ≤5, dashboard hanya 3–6 kartu bermakna; opsi tersembunyi di halaman detail (progressive disclosure).
- **Miller (7±2)** — daftar dibatasi: riwayat tagihan 3 item, tenant 3 kolom, group kecil.
- **Gestalt (proximity/containment)** — kartu bento mengelompokkan metrik terkait; border + gap menciptakan unit visual.
- **Jakob** — pola familiar: bottom nav mobile, sidebar desktop, kartu statistik standar.
- **Von Restorff** — kartu hero tone **primary** (hijau toska) atau **success** menonjol dari kartu netral → fokus pada 1 angka utama.
- **Estetika-guna** — ikon konsisten + grid rapi menaikkan persepsi kemudahan pemakaian.
- **Zona ibu jari** — FAB/aksi di bawah; logout & CTA mudah dijangkau di mobile.
- **Prefers-reduced-motion** — animasi skeleton/progress dimatikan untuk pengguna yang sensitif gerak (aksesibilitas).

## Anti-pola yang diperbaiki pada redesign ini

- ~~Angka statis "Rp 150.000"~~ → dihitung dari tagihan API bulan berjalan.
- ~~Emoji bervariasi antar-platform~~ → ikon SVG seragam.
- ~~Loading teks polos~~ → skeleton.
- ~~Error/empty state tak ada (fetch gagal senyap)~~ → ErrorState + retry, EmptyState + aksi.
- ~~Hardcode role/tenant 1~~ → tenant dari JWT (backend), frontend tidak perlu tahu id tenant.
- ~~Register tanpa auto-login~~ → backend menerbitkan token; frontend `setAuth` lalu redirect per role.
- ~~Belum ada mode gelap~~ → token warna jadi CSS variable + `prefers-color-scheme: dark` otomatis.
- ~~Tidak ada fokus keyboard~~ → `:focus-visible` ring hijau toska global.
