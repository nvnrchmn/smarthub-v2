import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { fmt } from '../../lib/utils'

interface Tagihan {
  id_tagihan: number
  id_rumah: number
  periode_bulan_tahun: string
  total_nominal: number
  status_pembayaran: 'PAID' | 'PENDING' | 'OVERDUE'
}

export function RTTagihanPage() {
  const [tagihans, setTagihans] = useState<Tagihan[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [periode, setPeriode] = useState('2026-10')

  const load = async () => {
    try {
      const d = await api('/keuangan/tagihan?tenant_id=1')
      setTagihans(Array.isArray(d) ? d : [])
    } catch (e: any) {
      setMsg(e.message || 'Gagal memuat data tagihan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const generate = async () => {
    setMsg('')
    try {
      const d = await api('/keuangan/tagihan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: 1, periode }),
      })
      setMsg((d as any).message || 'Tagihan di-generate ✅')
      load()
    } catch {
      setMsg('Gagal generate tagihan')
    }
  }

  const badge = (s: string) => {
    if (s === 'PAID') return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Lunas</span>
    if (s === 'OVERDUE') return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Terlambat</span>
    return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">Belum Bayar</span>
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-16">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Kelola Tagihan</h1>
        <p className="text-sm text-text-secondary">Generate & monitor iuran warga</p>
      </header>

      {/* Generate */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface-card p-4">
        <div className="flex-1 min-w-[180px]">
          <label className="mb-1 block text-xs font-medium text-text-secondary">Periode (bulan-tahun)</label>
          <input
            type="month"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={generate}
          className="rounded-xl bg-primary px-5 py-3 text-base font-medium text-white min-h-[44px]"
        >
          Generate Tagihan
        </button>
        {msg && <p className="w-full text-sm text-green-700" role="alert">{msg}</p>}
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {loading && <p className="text-sm text-text-secondary">Memuat…</p>}
        {!loading && tagihans.length === 0 && <p className="text-sm text-text-secondary">Belum ada tagihan.</p>}
        {tagihans.map((t) => (
          <div key={t.id_tagihan} className="flex items-center justify-between rounded-xl border border-border bg-surface-card p-4">
            <div>
              <p className="font-semibold text-text-primary">{fmt(t.total_nominal)}</p>
              <p className="text-xs text-text-secondary">
                Periode {t.periode_bulan_tahun} • Rumah #{t.id_rumah}
              </p>
            </div>
            {badge(t.status_pembayaran)}
          </div>
        ))}
      </div>
    </div>
  )
}
