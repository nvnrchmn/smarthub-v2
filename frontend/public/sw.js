/* SmartHub service worker — v2
   - Navigasi (HTML): network-first, fallback cache → deploy langsung terlihat.
   - Aset statis (assets/): cache-first setelah sukses → cepat di reload berikutnya.
   - /api/* : SELALU network (jangan pernah di-cache/respond dari cache).
   - Cache lama (smarthub-v1) dibersihkan saat activate.
*/
const CACHE_NAME = 'smarthub-v2'
const PRECACHE = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(PRECACHE).catch(() => {})))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // API tidak pernah di-cache
  if (url.pathname.startsWith('/api/')) return

  // Navigasi halaman (mode= navigate): network-first
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put('/', copy))
          return res
        })
        .catch(() => caches.match('/'))
    )
    return
  }

  // Aset statis: cache-first + isi cache saat sukses
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit
      return fetch(req).then((res) => {
        if (res.ok && url.origin === location.origin) {
          const copy = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(req, copy))
        }
        return res
      })
    })
  )
})
