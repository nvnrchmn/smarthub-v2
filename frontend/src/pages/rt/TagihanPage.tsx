import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { fmt, cn } from '../../lib/utils'
import { Link } from 'react-router-dom'
import { EmptyState, Skeleton } from '../../components/ui/bento'
import { Icon } from '../../components/ui/Icon'
import { BadgeStatus, normalStatus, labelBulan } from '../../components/tagihan/BadgeStatus'

interface Tagihan {
  id_tagihan: number
  id_rumah: number
  periode_bulan_tahun: string
  total_nominal: number
  status_pembayaran: string
}

export function RTTagihanPage() {
  const [tagihans, setTagihans] = useState<Tagihan[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [bulk, setBulk] = useState(false)
  const [periode] = useState(new Date().toISOString().slice(0, 7))
  const [filter, setFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const t = await api('/keuangan/tagihan')
      setTagihans(Array.isArray(t) ? t : [])
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal memuat tagihan' })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const generate = async () => {
    setBulk(true)
    try {
      const d = await api('/keuangan/tagihan/generate', { method: 'POST', body: JSON.stringify({ periode }) })
      setNotice({ type: 'ok', text: (d as any).message || 'Tagihan berhasil di-generate.' })
      load()
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal generate tagihan' })
    } finally {
      setBulk(false)
    }
  }

  const filterChips = [
    { key: 'all', label: 'Semua' },
    { key: 'PENDING', label: 'Belum Bayar' },
    { key: 'LUNAS', label: 'Lunas' },
  ]

  const filtered = useMemo(() => {
    if (filter === 'all') return tagihans
    return tagihans.filter(t => t.status_pembayaran === filter)
  }, [tagihans, filter])

  const sum = (xs: Tagihan[]) => xs.reduce((a, t) => a + t.total_nominal, 0)

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Kelola Tagihan</h1>
          <p className="text-xs text-text-secondary">Total {tagihans.length} tagihan</p>
        </div>
        <Link to="/rt/tagihan-custom" className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-95">
          <Icon name="plus" size={16} /> Tagih Custom
        </Link>
      </header>

      {notice && (
        <p className={cn('mb-3 rounded-xl px-3.5 py-2.5 text-sm', notice.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>{notice.text}</p>
      )}

      <div className="mb-4 flex gap-2">
        <button onClick={generate} disabled={bulk} className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-all hover:bg-primary/90 active:scale-[.98] disabled:opacity-60">
          {bulk ? <><Icon name="refresh" size={15} className="animate-spin" /> Membuat...</> : <><Icon name="trend" size={15} /> Generate semua rumah</>}
        </button>
      </div>

      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {filterChips.map(c => (
          <button key={c.key} onClick={() => setFilter(c.key)} className={cn('whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors', filter === c.key ? 'bg-primary text-white' : 'bg-surface-card text-text-secondary border border-border')}>{c.label}</button>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-border bg-surface-card p-3"><p className="text-[11px] text-text-secondary">Total</p><p className="text-sm font-bold text-text-primary">{fmt(sum(tagihans))}</p></div>
        <div className="rounded-xl border border-border bg-surface-card p-3"><p className="text-[11px] text-text-secondary">Belum Bayar</p><p className="text-sm font-bold text-status-pending">{fmt(sum(tagihans.filter(t => t.status_pembayaran !== 'LUNAS')))}</p></div>
        <div className="rounded-xl border border-border bg-surface-card p-3"><p className="text-[11px] text-text-secondary">Lunas</p><p className="text-sm font-bold text-status-paid">{fmt(sum(tagihans.filter(t => t.status_pembayaran === 'LUNAS')))}</p></div>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="file" title="Belum ada tagihan" desc="Generate tagihan bulanan atau buat tagihan custom." />
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id_tagihan} className="flex items-center gap-3 rounded-xl border border-border bg-surface-card p-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">Tagihan {labelBulan(t.periode_bulan_tahun)}</p>
                <p className="text-[11px] text-text-secondary">Rumah #{t.id_rumah}</p>
              </div>
              <p className="text-sm font-semibold text-text-primary tabular-nums">{fmt(t.total_nominal)}</p>
              <BadgeStatus status={normalStatus(t.status_pembayaran)} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
