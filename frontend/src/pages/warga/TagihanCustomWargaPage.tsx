import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { EmptyState, Skeleton } from '../../components/ui/bento'

import { cn } from '../../lib/utils'

interface TagihanCustom {
  id: number
  id_rumah: number
  deskripsi: string
  nominal: number
  periode: string
  status_pembayaran: string
  created_at: string
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  LUNAS: 'bg-green-100 text-green-700',
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export function TagihanWargaPage() {
  const [tagihans, setTagihans] = useState<TagihanCustom[]>([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const d = await api('/keuangan/tagihan-custom')
      setTagihans(Array.isArray(d) ? d : [])
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const bayar = async (id: number) => {
    setPayingId(id)
    try {
      const res = await api<{ payment_url: string }>(`/keuangan/tagihan-custom/${id}/bayar`, { method: 'POST' })
      if (res.payment_url) window.open(res.payment_url, '_blank')
      load()
    } catch {} finally {
      setPayingId(null)
    }
  }

  const pending = tagihans.filter(t => t.status_pembayaran === 'PENDING')
  
  const totalPending = pending.reduce((s, t) => s + t.nominal, 0)

  return (
    <div className="mx-auto max-w-xl px-4 pt-4">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Tagihan Custom</h1>
        <p className="text-xs text-text-secondary">Tagihan khusus dari pengurus RT</p>
      </header>

      {!loading && pending.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
          <p className="text-xs font-medium text-amber-700">Total yang harus dibayar</p>
          <p className="text-xl font-bold text-amber-800">{formatRp(totalPending)}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : tagihans.length === 0 ? (
        <EmptyState icon="file" title="Tidak ada tagihan custom" desc="Belum ada tagihan khusus dari pengurus." />
      ) : (
        <div className="space-y-2">
          {tagihans.map(t => (
            <div key={t.id} className="rounded-xl border border-border bg-surface-card p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary truncate">{t.deskripsi}</p>
                  <p className="text-xs text-text-secondary mt-0.5">Periode: {t.periode}</p>
                </div>
                <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', STATUS_COLOR[t.status_pembayaran])}>{t.status_pembayaran}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-base font-bold text-primary">{formatRp(t.nominal)}</p>
                {t.status_pembayaran === 'PENDING' && (
                  <button onClick={() => bayar(t.id)} disabled={payingId === t.id} className="rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50">
                    {payingId === t.id ? 'Memproses...' : 'Bayar'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
