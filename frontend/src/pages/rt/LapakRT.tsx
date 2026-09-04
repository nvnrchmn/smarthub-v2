import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { fmt } from '../../lib/utils'

interface Produk {
  id_produk: number
  nama_produk_jasa: string
  deskripsi: string
  harga: number
  is_approved: boolean
}

export function LapakRT() {
  const [produk, setProduk] = useState<Produk[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api('/lapak')
      .then((d) => setProduk(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const hapus = async (id: number) => {
    setMsg('')
    try {
      await api(`/lapak/${id}`, { method: 'DELETE' })
      setProduk((p) => p.filter((x) => x.id_produk !== id))
    } catch (err: any) {
      setMsg(err.message || 'Gagal hapus produk')
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Lapak Warga</h1>
        <p className="text-xs text-text-secondary">Kelola produk/jasa yang dijual warga</p>
      </header>

      {msg && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{msg}</p>}
      {loading && <p className="text-sm text-text-secondary">Memuat…</p>}
      {!loading && produk.length === 0 && <p className="text-sm text-text-secondary">Belum ada produk.</p>}

      <div className="space-y-3">
        {produk.map((p) => (
          <div key={p.id_produk} className="flex items-start justify-between gap-3 rounded-2xl bg-surface-card p-4">
            <div className="min-w-0">
              <p className="font-medium text-text-primary">{p.nama_produk_jasa}</p>
              <p className="text-sm text-text-secondary line-clamp-2">{p.deskripsi}</p>
              <p className="mt-1 text-base font-bold text-primary">{fmt(p.harga)}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${p.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {p.is_approved ? 'Disetujui' : 'Menunggu'}
              </span>
              <button onClick={() => hapus(p.id_produk)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 min-h-[44px]">
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
