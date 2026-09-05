---
title: lemburin
created: 2026-09-03
updated: 2026-09-03
type: entity
tags: [lemburin, expo, supabase]
confidence: high
---

# Lemburin

App kehadiran/overtime. Expo React Native → APK + web; backend Supabase (bukan MySQL).
Repo lokal: `~/Projects/lemburin` — main branch lokal; VPS deploy di branch web
(`/www/wwwroot/lemburin.logikraf.id`, static nginx).

## Aturan
- Branch `main` = sumber kebenaran lokal; VPS jalan di branch `web`
- Fix via VPS hanya masuk branch web → harus sync manual ke main (pelajaran 2026-09-03)
- NEVER branch on Platform.OS
- Migration SQL ada di supabase/migrations, trigger auto-create profile on signup
- verify-native.sh; headless Chrome utk verifikasi web

## Related
- [[vps-logikraf]]
