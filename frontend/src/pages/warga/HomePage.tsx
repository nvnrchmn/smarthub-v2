import { useState, useEffect } from 'react'

interface Rumah {
  id_rumah: number
  nama_jalan_gang: string
  nomor_rumah: string
  status_hunian: 'Dihuni' | 'Kosong'
}

export function HomePage() {
  const [rumahs, setRumahs] = useState<Rumah[]>([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/wilayah/rumah?tenant_id=1')
      .then((r) => r.json())
      .then((d) => setRumahs(Array.isArray(d) ? d : []))
      .catch(() => setErr('Gagal memuat data rumah'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-primary">SmartHub</span>
          <span className="text-xs text-muted">RT 01 / RW 01</span>
        </div>
      </header>

      <main className="px-4 py-4 pb-24">
        <h1 className="mb-4 text-xl font-bold text-text">Beranda</h1>

        {loading && <p className="text-sm text-muted">Memuat…</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}

        {!loading && rumahs.length === 0 && (
          <p className="text-sm text-muted">Belum ada data rumah.</p>
        )}

        {/* Kartu rumah */}
        <div className="space-y-3">
          {rumahs.map((r) => (
            <div
              key={r.id_rumah}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-1 rounded-full ${
                    r.status_hunian === 'Dihuni' ? 'bg-green-600' : 'bg-gray-400'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-base font-semibold text-text">
                    {r.nama_jalan_gang} {r.nomor_rumah}
                  </p>
                  <p className="text-xs text-muted">
                    {r.status_hunian === 'Dihuni' ? 'Dihuni' : 'Kosong'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
