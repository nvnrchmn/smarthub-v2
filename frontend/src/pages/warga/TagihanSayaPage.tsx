import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { fmt } from '../../lib/utils'

interface Tagihan {
  id_tagihan: number
  id_rumah: number
  periode_bulan_tahun: string
  total_nominal: number
  status_pembayaran: 'PAID' | 'PENDING' | 'OVERDUE' | 'EXPIRED'
  xendit_payment_url?: string | null
}

export function TagihanSayaPage() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const [tagihans, setTagihans] = useState<Tagihan[]>([])
  const [loading, setLoading] = useState(true)
  const [bayarId, setBayarId] = useState<number | null>(null)
  const [err, setErr] = useState('')
  const notice = params.get('status') === 'success' ? 'Pembayaran berhasil diproses.' : ''

  const tenantId = user?.tenant_id ?? 1

  const load = () => {
    setLoading(true)
    api(`/api/keuangan/tagihan?tenant_id=${tenantId}`)
      .then((d) => setTagihans(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [tenantId])

  const bayar = async (t: Tagihan) => {
    setErr('')
    setBayarId(t.id_tagihan)
    try {
      const res = await api<{ payment_url: string }>(`/api/keuangan/tagihan/${t.id_tagihan}/bayar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      if (res.payment_url) window.location.href = res.payment_url
    } catch (e: any) {
      setErr(e.message || 'Gagal membuat pembayaran')
    } finally {
      setBayarId(null)
    }
  }

  const badge = (s: string) => {
    if (s === 'PAID') return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Lunas</span>
    if (s === 'EXPIRED') return <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">Kedaluwarsa</span>
    if (s === 'OVERDUE') return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Terlambat</span>
    return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">Belum Bayar</span>
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Tagihan Iuran</h1>
        <p className="text-xs text-text-secondary">Bayar iuran bulanan dengan mudah</p>
      </header>

      {notice && (
        <div role="alert" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</div>
      )}
      {err && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>
      )}

      <div className="space-y-3">
        {loading && <p className="text-sm text-text-secondary">Memuat…</p>}
        {!loading && tagihans.length === 0 && <p className="text-sm text-text-secondary">Belum ada tagihan untuk periode ini.</p>}
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
            {t.status_pembayaran === 'PENDING' && (
              <button
                onClick={() => bayar(t)}
                disabled={bayarId === t.id_tagihan}
                className="mt-3 min-h-[44px] w-full rounded-xl bg-primary px-4 py-3 text-base font-medium text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {bayarId === t.id_tagihan ? 'Menyiapkan pembayaran…' : 'Bayar Sekarang'}
              </button>
            )}
            {t.status_pembayaran === 'EXPIRED' && (
              <button
                onClick={() => bayar(t)}
                disabled={bayarId === t.id_tagihan}
                className="mt-3 min-h-[44px] w-full rounded-xl bg-primary px-4 py-3 text-base font-medium text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {bayarId === t.id_tagihan ? 'Menyiapkan pembayaran…' : 'Bayar Ulang'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
