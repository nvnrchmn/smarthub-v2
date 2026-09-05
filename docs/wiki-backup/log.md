# Changelog Wiki

| Tanggal | Aksi | Detail |
|---|---|---|
| 2026-09-03 | init | SCHEMA + struktur direktori dibuat. Seed awal: 9 entity (vps, logikraf-v2, smarthub, niagaku, lemburin, export, xendit, ipaymu, xenplatform), 2 concept (payment-keputusan, payment-hub), 2 comparison (xendit-vs-ipaymu, xenplatform-managed-vs-owned). Sumber: memori sesi + diskusi payment 2026-09-03. |
| 2026-09-03 | add | entity shop-logikraf (keputusan model 1-vendor, stack, port 8085, milestone M1-M3). |
| 2026-09-03 | update | shop-logikraf: status aktual — M1 inti live, shadcnUI done, blokir = Xendit keys kosong + 5 commit un-pushed. Next: isi keys → push → M2. |
| 2026-09-05 | update | smarthub: layout pattern fix — h-dvh flex-col, main overflow-y-auto, BottomNav flex-shrink-0, Modal via createPortal. Deployment: build lokal → sudo cp ke VPS → nginx reload + systemctl restart. |
| 2026-09-05 | update | smarthub: sesi 4 — fitur lengkap: settlement (QRIS→RT→admin approve), subscription per-rumah (Rp 3.000), CMS landing page (editable semua section), super admin (tenant detail, analytics, audit, broadcast), notifikasi in-app + WA + KYC upload KTP, Xendit settings via admin panel, bottom nav pattern (4 menu + Lainnya drawer). |
