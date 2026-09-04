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

export function TagihanSayaPage() {
  const [tagihans, setTagihans] = useState<Tagihan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/api/keuangan/tagihan?tenant_id=1')
      .then((d) => setTagihans(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const badge = (s: string) => {
    if (s === 'PAID') return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Lunas</span>
    if (s === 'OVERDUE') return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Terlambat</span>
    return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">Belum Bayar</span>
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Tagihan Iuran</h1>
        <p className="text-xs text-text-secondary">Riwayat iuran bulanan warga</p>
      </header>

      <div className="space-y-3">
        {loading && <p className="text-sm text-text-secondary">Memuat…</p>}
        {!loading && tagihans.length === 0 && <p className="text-sm text-text-secondary">Belum ada tagihan.</p>}
        {tagihans.map((t) => (
          <div
            key={t.id_tagihan}
            className={`rounded-2xl border-l-4 bg-surface-card p-4 ${
              t.status_pembayaran === 'PAID' ? 'border-green-600' : 'border-amber-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Periode {t.periode_bulan_tahun}</p>
                <p className="text-2xl font-bold text-text-primary">{fmt(t.total_nominal)}</p>
              </div>
              {badge(t.status_pembayaran)}
            </div>
            {t.status_pembayaran !== 'PAID' && (
              <button className="mt-3 w-full rounded-xl bg-primary px-4 py-3 text-base font-medium text-white min-h-[44px]">
                Bayar Sekarang
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
