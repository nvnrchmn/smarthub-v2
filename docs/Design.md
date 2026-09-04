# Design Brief: SmartHub V2

> ⚠️ ARSIP (2026-09-05) — acuan aktif kini `DESIGN-SYSTEM.md` (token, komponen,
> aturan v2) + `UX-HEURISTICS.md`. Brief ini tetap berguna untuk konteks persona,
> alasan keputusan, dan "yang sengaja tidak dimasukkan".
*Catatan internal untuk tim — bukan dokumen final klien*

---

## Siapa yang sebenarnya pakai ini?

Sebelum buka Figma, jujurlah dulu soal penggunanya. Mayoritas warga RT/RW Indonesia yang akan buka aplikasi ini adalah:

- Ibu-ibu 35–55 tahun, HP Android mid-range (Redmi, Samsung A-series)
- Bapak-bapak pengurus RT yang biasa pakai WhatsApp, bukan aplikasi kompleks
- Koneksi internet yang kadang 4G, kadang 3G, kadang numpang WiFi tetangga

Artinya: **desain ini bukan untuk mengesankan investor, tapi untuk dipakai ibu-ibu dengan kacamata baca sambil tiduran.** Beda sekali tujuannya.

Konsekuensinya langsung: tidak ada gesture pinch-to-zoom yang canggih, tidak ada micro-animation yang terlalu berat, tidak ada layout yang butuh scroll horizontal.

---

## Karakter Visual yang Ingin Dicapai

Kalau harus jujur, aplikasi warga RT di Indonesia masih ada dua kubu: yang terlalu "pemerintah" (biru berat, terasa dingin seperti situs BPJS) atau yang terlalu "startup" (gradien ungu-pink, terasa tidak relevan untuk konteks lingkungan).

SmartHub V2 sebaiknya berada di tengah-tengah: **terasa lokal, familiar, tapi bersih dan tidak berantakan.**

Referensi mental yang paling dekat: bayangkan kalau aplikasi Jago Bank punya anak dengan WhatsApp, tapi dibesarkan di lingkungan perumahan — itulah feel-nya. Hangat, ramah, bisa dipercaya, tidak berteriak-teriak.

---

## Palet Warna

Pilihan utama jatuh ke **hijau tua toska** sebagai primary. Alasannya pragmatis: hijau identik dengan komunitas, alam, dan keselamatan — cocok untuk konteks lingkungan warga. Tapi hijau yang dipilih bukan hijau "silaukan mata" — lebih ke arah sage gelap yang terasa dewasa.

```
Primary     #1B6B4A   /* Hijau toska tua, anchor utama */
Primary-50  #EBF5F0   /* Background kartu, highlight ringan */
Primary-100 #C3E2D4   /* Border tipis, divider */

Surface     #F7F8F6   /* Background halaman — off-white, bukan putih murni */
Surface-Card #FFFFFF  /* Kartu konten */

Text-Primary   #1A1F1C  /* Hampir hitam, bukan hitam penuh */
Text-Secondary #6B7770  /* Label kecil, metadata */
Text-Disabled  #B0BAB6

/* Status Tagihan — ini penting, jangan diganti */
Status-Paid    #22C55E  /* Hijau cerah */
Status-Pending #F59E0B  /* Kuning amber */
Status-Overdue #EF4444  /* Merah */
Status-Empty   #94A3B8  /* Abu-abu slate */

Danger  #DC2626
Warning #D97706
```

Tidak ada gradien warna-warni. Gradien boleh dipakai hanya untuk header section atau ilustrasi, bukan untuk tombol atau status.

---

## Tipografi

**Plus Jakarta Sans** — dan ini keputusan yang tidak perlu didebat. Font ini sudah jadi standar de-facto startup Indonesia (Koinworks, Pintu, banyak lagi pakai ini), keterbacaannya bagus di layar kecil, dan yang penting: terasa lokal tanpa terasa murahan.

```
Font Family : Plus Jakarta Sans (Google Fonts)
Fallback    : system-ui, sans-serif

/* Skala ukuran — simpel saja */
xs   : 11px  (timestamp, label sangat kecil)
sm   : 13px  (body kecil, caption)
base : 15px  (body utama — sengaja 15px, bukan 16px, lebih nyaman di mobile)
lg   : 17px  (body besar, preview)
xl   : 20px  (heading section)
2xl  : 24px  (heading halaman)
3xl  : 30px  (angka besar: nominal tagihan, jumlah warga)

/* Bobot */
Regular  (400) : body teks
Medium   (500) : label, tombol sekunder
SemiBold (600) : heading, nama warga, nominal penting
Bold     (700) : CTA utama, angka highlight
```

Line-height default: **1.6** untuk body. Ini bukan angka sembarangan — teks bahasa Indonesia rata-rata lebih panjang per kalimat, butuh breathing room lebih dari teks Inggris.

---

## Pola Komponen

### Navigasi Bawah (Bottom Navigation)

Pengurus dan warga sama-sama perlu ini. Jangan hamburger menu — ibu-ibu tidak akan explore menu tersembunyi. Taruh 4–5 ikon di bawah, selalu terlihat.

```
Warga:    Beranda | Tagihan | Forum | Lapak
Pengurus: Denah | Warga | Keuangan | Forum | Lapak
```

Active state: ikon berubah warna primary + label muncul. Inactive: ikon abu-abu tanpa label.
Tinggi bottom nav: **64px** + safe area inset bawah (untuk notch Android).

---

### Kartu Rumah (Komponen Paling Kritis)

Kartu ini akan dilihat paling sering oleh pengurus. Harus bisa dibaca dalam 1 detik:

```
┌─────────────────────────────────────┐
│ ● LUNAS          Gang Sate No. 04   │  ← Status dot kiri, alamat kanan
│                                     │
│  Keluarga Budi Santoso              │  ← Nama KK, font semibold 15px
│  3 penghuni · 2 KK                  │  ← Metadata kecil, text-secondary
└─────────────────────────────────────┘
```

- Status dot: lingkaran 10px solid, warna sesuai status tagihan
- Border kiri: 4px solid, warna sama dengan dot — ini yang membuat kartu langsung terbaca dari jauh
- Tidak ada shadow dramatis. Cukup `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`
- Tap/klik seluruh area kartu membuka detail rumah

Kartu dikelompokkan per nama gang dengan sticky header nama gang di atas. Ini yang disebut "Grouped Card List" di PRD — implementasinya sederhana, efeknya besar.

---

### Tagihan & Nominal

Nominal uang adalah informasi paling emosional di aplikasi ini. Tampilkan dengan benar:

```
Iuran Bulan September 2026

  Rp 75.000
  ──────────────────────────
  Iuran Keamanan   Rp 50.000
  Iuran Sampah     Rp 25.000

  [ Bayar Sekarang ]
```

- Nominal total: font `3xl bold`, warna `text-primary`
- Detail breakdown: tampilkan di bawah total, bukan di modal terpisah
- Tombol "Bayar Sekarang": full-width, tinggi 52px, sudut rounded-xl, warna primary
- Jika sudah PAID: tombol diganti badge "✓ Lunas dd MMMM yyyy"

---

### Drawer vs Dialog

PRD sudah menyebutkan ini, tapi perlu penekanan: **semua form input wajib pakai Drawer (slide dari bawah), bukan Dialog/Modal tengah.** Ini bukan soal estetika — ini soal ergonomi. Dialog tengah membuat pengguna harus menjangkau setengah layar ke atas, tidak nyaman di HP besar.

Drawer tingginya maksimal 90vh, bisa di-drag tutup. Jika form terlalu panjang, pecah jadi multi-step di dalam Drawer yang sama.

---

### Pengumuman & Forum

Ini titik yang sering disalah-desain. Pengumuman resmi dari pengurus RT harus **secara visual berbeda** dari thread diskusi biasa warga:

- **Pengumuman:** Background `primary-50`, ada ikon 📢 di kiri, nama pengurus + badge "Pengurus RT"
- **Diskusi:** Background putih biasa, avatar huruf inisial warga

Komentar tidak perlu avatar foto (risiko KTP/foto wajah bocor). Cukup inisial nama dalam lingkaran warna yang digenerate dari nama (hash sederhana → pilih dari 8 warna preset).

---

## Yang Sengaja Tidak Dimasukkan

Beberapa hal yang sering muncul di template desain modern tapi sengaja dihindari:

**Dark mode** — tidak diimplementasi di versi awal. Pengguna target tidak mengaktifkan dark mode, dan mendesain dua tema sekaligus di awal hanya membuang waktu.

**Animasi page transition yang berat** — cukup `opacity 150ms ease-out`. Tidak perlu slide kiri-kanan atau flip card. Perangkat mid-range akan terasa lambat dengan animasi kompleks.

**Skeleton loading yang rumit** — cukup satu blok abu-abu rounded beranimasi shimmer per section. Jangan buat skeleton yang persis mengikuti bentuk konten, itu overkill.

**Infinite scroll** — pakai pagination sederhana untuk daftar tagihan dan forum. Infinite scroll sulit di-debug dan membuat pengguna kehilangan posisi setelah kembali dari halaman detail.

---

## Aturan Jarak & Spacing

Pakai skala kelipatan 4:

```
4px   : gap antar ikon dan teks dalam baris yang sama
8px   : padding elemen kecil (badge, chip)
12px  : padding vertikal tombol kecil
16px  : padding kartu (standar)
20px  : gap antar kartu dalam list
24px  : padding horizontal halaman (margin kiri-kanan konten)
32px  : jarak antar section
48px  : padding atas header halaman
```

Konsistensi spacing lebih penting dari pilihan angkanya. Kalau sudah pakai 16px untuk padding kartu, jangan ada yang tiba-tiba 14px atau 18px.

---

## Checklist Sebelum Komponen Dinyatakan Selesai

Tempel ini di meja kerja. Setiap komponen baru harus lolos:

- [ ] Terbaca di layar 360px width (masih banyak HP dengan lebar ini)
- [ ] Tombol utama minimal tinggi 48px (touch target)
- [ ] Teks minimal 13px (tidak ada yang lebih kecil dari ini)
- [ ] Status bisa dibedakan tanpa mengandalkan warna saja (untuk buta warna parsial)
- [ ] Loading state sudah ada — tidak ada yang langsung "nembak" data tanpa indikator
- [ ] Empty state ada — jangan biarkan halaman kosong tanpa penjelasan
