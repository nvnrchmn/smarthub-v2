---
title: VPS Logikraf (103.197.188.248)
created: 2026-09-03
updated: 2026-09-03
type: entity
tags: [infra, aaPanel, keputusan-arsitektur]
confidence: high
---

# VPS Logikraf

Single VPS aaPanel di 103.197.188.248 (hostname: LogikrafID). Semua produk Logikraf berjalan di sini.

## Layout Port (verifikasi terakhir 2026-09-03)
| Port | Produk | Backend | DB | systemd |
|---|---|---|---|---|
| 8081 | logikraf.id (Logikraf AI Studio) | Go Fiber v3 | logikraf_v2 | logikraf-server |
| 8082 | smarthub.logikraf.id (d/h SB Digital) | Go Gin | sbdigital_v2 | (sbdigital) |
| 8083 | livinemanajemen.com | Go Fiber | livine_db | livine |
| 8084 | novanurachman.my.id | Go Fiber | - | - |
| 8090 | niagaku.logikraf.id | Go Fiber v2 | niagaku | niagaku-server |
| 8091 | export.logikraf.id | Go Fiber (logikraf-export) | - | - |

## Aturan Deploy
- Build di GitHub Actions, rsync artifact → VPS, restart systemd. **JANGAN build di server.**
- Deploy tak berefek → cek `ss -tlnp` (proses sita port) sebelum debugging lain.
- MySQL backup otomatis 02:30 (cron).
- NEVER edit `/etc/nginx/nginx.conf` (gunakan aaPanel vhost).

## Related
- [[logikraf-v2]], [[smarthub]], [[niagaku]], [[lemburin]], [[logikraf-export]]
