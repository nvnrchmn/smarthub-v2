import { useState, useEffect } from 'react'

interface Rumah {
  id_rumah: number
  id_tenant: number
  nama_jalan_gang: string
  nomor_rumah: string
  status_hunian: 'Dihuni' | 'Kosong'
}

export function HomePage() {
  const [rumahs, setRumahs] = useState<Rumah[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/wilayah/rumah?tenant_id=1')
      .then(r => r.json())
      .then(data => {
        setRumahs(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const grouped = rumahs.reduce<Record<string, Rumah[]>>((acc, r) => {
    const gang = r.nama_jalan_gang
    if (!acc[gang]) acc[gang] = []
    acc[gang].push(r)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Smarthub</h1>
        <p className="text-sm text-text-secondary">RT 01 / RW 01 • Desa Sukamaju</p>
      </header>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-primary-50 p-4">
          <p className="text-xs text-text-secondary">Total Rumah</p>
          <p className="text-2xl font-bold text-primary">{rumahs.length}</p>
        </div>
        <div className="rounded-xl bg-status-paid-bg p-4">
          <p className="text-xs text-text-secondary">Dihuni</p>
          <p className="text-2xl font-bold text-status-paid">{rumahs.filter(r => r.status_hunian === 'Dihuni').length}</p>
        </div>
      </div>

      {/* Daftar rumah per gang */}
      <h2 className="mb-3 text-sm font-semibold text-text-primary">Daftar Rumah</h2>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-primary-50" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([gang, rows]) => (
            <div key={gang}>
              <p className="mb-2 text-xs font-medium text-text-secondary">{gang}</p>
              <div className="space-y-2">
                {rows.map(r => (
                  <div
                    key={r.id_rumah}
                    className={`rounded-xl border-l-4 bg-surface-card p-4 ${
                      r.status_hunian === 'Dihuni' ? 'border-status-paid' : 'border-status-overdue'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary">Rumah {r.nomor_rumah}</p>
                        <p className="text-xs text-text-secondary">{r.nama_jalan_gang}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        r.status_hunian === 'Dihuni'
                          ? 'bg-status-paid-bg text-status-paid'
                          : 'bg-status-overdue-bg text-status-overdue'
                      }`}>
                        {r.status_hunian}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
