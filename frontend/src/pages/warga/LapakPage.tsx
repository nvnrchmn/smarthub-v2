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

export function LapakWargaPage() {
  const [produks, setProduks] = useState<Produk[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ nama_produk_jasa: '', deskripsi: '', harga: '' })

  const load = async () => {
    const d = await api('/api/lapak?tenant_id=1')
    setProduks(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    try {
      await api('/api/lapak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: 1, ...form, harga: Number(form.harga) }),
      })
      setForm({ nama_produk_jasa: '', deskripsi: '', harga: '' })
      setMsg('Produk berhasil dijual ✅ (menunggu approval RT)')
      load()
    } catch {
      setMsg('Gagal menambahkan produk')
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Lapak Warga</h1>
        <p className="text-xs text-text-secondary">Jual beli antar warga</p>
      </header>

      {/* Form baru */}
      <form onSubmit={submit} className="mb-5 rounded-2xl border border-border bg-surface-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Jual Produk / Jasa</h2>
        <div className="space-y-2.5">
          <input
            placeholder="Nama produk / jasa"
            required
            value={form.nama_produk_jasa}
            onChange={(e) => setForm({ ...form, nama_produk_jasa: e.target.value })}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            placeholder="Deskripsi"
            required
            rows={2}
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="number"
            placeholder="Harga (Rp)"
            required
            value={form.harga}
            onChange={(e) => setForm({ ...form, harga: e.target.value })}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button type="submit" className="w-full rounded-xl bg-primary px-4 py-3 text-base font-medium text-white min-h-[44px]">
            Jual Sekarang
          </button>
          {msg && <p className="text-sm text-green-700" role="alert">{msg}</p>}
        </div>
      </form>

      {/* List produk */}
      <div className="space-y-3">
        {loading && <p className="text-sm text-text-secondary">Memuat…</p>}
        {!loading && produks.length === 0 && <p className="text-sm text-text-secondary">Belum ada produk dijual.</p>}
        {produks.map((p) => (
          <div key={p.id_produk} className="flex items-start gap-3 rounded-xl border border-border bg-surface-card p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xl">
              📦
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-primary">{p.nama_produk_jasa}</p>
              <p className="text-sm text-text-secondary">{p.deskripsi}</p>
              <p className="mt-1 font-bold text-primary">{fmt(p.harga)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
