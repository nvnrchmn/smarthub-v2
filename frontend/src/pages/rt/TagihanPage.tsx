import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { fmt, cn } from '../../lib/utils'
import { Drawer } from '../../components/ui/Drawer'
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
interface Rumah {
  id_rumah: number
  nama_jalan_gang: string
  nomor_rumah: string
  status_hunian: string
}

const inputCls =
  'h-12 w-full rounded-xl border border-border bg-surface px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30'

export function RTTagihanPage() {
  const [tagihans, setTagihans] = useState<Tagihan[]>([])
  const [rumahs, setRumahs] = useState<Rumah[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'OVERDUE' | 'PAID'>('ALL')
  const [periode, setPeriode] = useState(new Date().toISOString().slice(0, 7))
  const [open, setOpen] = useState(false)
  const [cari, setCari] = useState('')
  const [pilih, setPilih] = useState<Rumah | null>(null)
  const [periodeSatu, setPeriodeSatu] = useState(new Date().toISOString().slice(0, 7))
  const [saving, setSaving] = useState(false)
  const [bulk, setBulk] = useState(false)

  const load = async () => {
    try {
      const [t, r] = await Promise.all([api('/keuangan/tagihan'), api('/wilayah/rumah')])
      setTagihans(Array.isArray(t) ? t : [])
      setRumahs(Array.isArray(r) ? r : [])
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal memuat data' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const generate = async () => {
    setNotice(null)
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

  const generateSatu = async () => {
    if (!pilih) return
    setSaving(true)
    setNotice(null)
    try {
      const d = await api('/keuangan/tagihan/generate-rumah', { method: 'POST', body: JSON.stringify({ id_rumah: pilih.id_rumah, periode: periodeSatu }) })
      setNotice({ type: 'ok', text: `Tagihan ${fmt((d as any).total_nominal)} dibuat untuk ${pilih.nama_jalan_gang} No. ${pilih.nomor_rumah} (${labelBulan(periodeSatu)}).` })
      setOpen(false)
      setPilih(null)
      load()
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal membuat tagihan' })
    } finally {
      setSaving(false)
    }
  }

  const hasilCari = useMemo(() => {
    const q = cari.trim().toLowerCase()
    return rumahs.filter((r) => !q || r.nama_jalan_gang.toLowerCase().includes(q) || r.nomor_rumah.toLowerCase().includes(q) || `no. ${r.nomor_rumah}`.includes(q))
  }, [cari, rumahs])

  const labelRumah = (id: number) => {
    const r = rumahs.find((x) => x.id_rumah === id)
    return r ? `${r.nama_jalan_gang} No. ${r.nomor_rumah}` : `Rumah #${id}`
  }

  // Statistik (konsisten dengan status normal)
  const stat = useMemo(() => {
    const by = (s: ReturnType<typeof normalStatus>) => tagihans.filter((t) => normalStatus(t.status_pembayaran) === s)
    const aktif = [...by('PENDING'), ...by('OVERDUE'), ...by('EXPIRED')]
    const lunasL = by('PAID')
    const sum = (xs: Tagihan[]) => xs.reduce((a, t) => a + t.total_nominal, 0)
    return {
      total: tagihans.length,
      aktifN: aktif.length,
      aktifSum: sum(aktif),
      lunasN: lunasL.length,
      lunasSum: sum(lunasL),
      telatN: by('OVERDUE').length,
      pendingN: by('PENDING').length,
    }
  }, [tagihans])

  const terfilter = useMemo(() => {
    const s = (x: Tagihan) => normalStatus(x.status_pembayaran)
    if (filter === 'PAID') return tagihans.filter((t) => s(t) === 'PAID').sort((a, b) => b.periode_bulan_tahun.localeCompare(a.periode_bulan_tahun))
    if (filter === 'PENDING') return tagihans.filter((t) => s(t) === 'PENDING')
    if (filter === 'OVERDUE') return tagihans.filter((t) => s(t) === 'OVERDUE')
    return tagihans
  }, [filter, tagihans])

  const filterChips = [
    { k: 'ALL' as const, label: 'Semua', jml: stat.total },
    { k: 'PENDING' as const, label: 'Belum bayar', jml: stat.pendingN },
    { k: 'OVERDUE' as const, label: 'Terlambat', jml: stat.telatN },
    { k: 'PAID' as const, label: 'Lunas', jml: stat.lunasN },
  ]

  const kpis: { label: string; value: string; sub: string; icon: 'file' | 'clock' | 'alert' | 'check'; danger?: boolean }[] = [
    { label: 'Total tagihan', value: stat.total.toString(), sub: `${stat.aktifN} perlu dibayar`, icon: 'file' as const },
    { label: 'Belum dibayar', value: fmt(stat.aktifSum), sub: `${stat.aktifN} tagihan`, icon: 'clock' as const },
    { label: 'Terlambat', value: stat.telatN.toString(), sub: fmt(tagihans.filter((t) => normalStatus(t.status_pembayaran) === 'OVERDUE').reduce((a, t) => a + t.total_nominal, 0)), icon: 'alert' as const, danger: stat.telatN > 0 },
    { label: 'Lunas', value: fmt(stat.lunasSum), sub: `${stat.lunasN} tagihan`, icon: 'check' as const },
  ]

  return (
    <div className="page-enter mx-auto max-w-4xl">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Kelola Tagihan</h1>
          <p className="text-sm text-text-secondary">Generate, pantau, dan tagih iuran warga</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex min-h-[46px] items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[.98]">
          <Icon name="plus" size={16} /> Tagih per Rumah
        </button>
      </header>

      {notice && (
        <p role="alert" className={cn('mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium', notice.type === 'ok' ? 'bg-status-paid-bg text-status-paid' : 'bg-status-overdue-bg text-status-overdue')}>
          <Icon name={notice.type === 'ok' ? 'check' : 'alert'} size={15} /> {notice.text}
        </p>
      )}

      {/* KPI */}
      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-surface-card p-3.5">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Icon name={k.icon} size={14} className={k.danger ? 'text-status-overdue' : ''} />
              {k.label}
            </div>
            <p className={cn('mt-1 truncate text-lg font-bold leading-tight', k.danger ? 'text-status-overdue' : 'text-text-primary')}>{k.value}</p>
            <p className="truncate text-[11px] text-text-secondary">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Generate massal */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-surface-card p-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="periode-bulk" className="mb-1.5 block text-[13px] font-semibold text-text-primary">Periode penagihan</label>
          <input id="periode-bulk" type="month" value={periode} onChange={(e) => setPeriode(e.target.value)} className={inputCls} />
        </div>
        <div className="flex gap-2">
          <button onClick={generate} disabled={bulk} className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-all hover:bg-primary/90 active:scale-[.98] disabled:opacity-60 sm:flex-none">
            {bulk ? <><Icon name="refresh" size={15} className="animate-spin" /> Membuat…</> : <><Icon name="trend" size={15} /> Generate semua rumah</>}
          </button>
        </div>
      </div>

      {/* Filter + jumlah */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {filterChips.map((c) => (
            <button
              key={c.k}
              onClick={() => setFilter(c.k)}
              aria-pressed={filter === c.k}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors min-h-[34px]',
                filter === c.k ? 'bg-text-primary text-surface' : 'bg-surface-card text-text-secondary ring-1 ring-inset ring-border'
              )}
            >
              {c.label}
              <span className={cn('rounded-full px-1.5 text-[10px] font-bold', filter === c.k ? 'bg-white/20' : 'bg-text-disabled/10')}>{c.jml}</span>
            </button>
          ))}
        </div>
        <p className="hidden shrink-0 text-xs text-text-secondary sm:block">{labelBulan(periode)} · bulan berjalan</p>
      </div>

      {/* Daftar */}
      {loading ? (
        <div className="space-y-2.5">
          <Skeleton className="h-[72px] rounded-xl" />
          <Skeleton className="h-[72px] rounded-xl" />
          <Skeleton className="h-[72px] rounded-xl" />
        </div>
      ) : terfilter.length === 0 ? (
        <EmptyState icon="file" title="Belum ada tagihan" desc={filter === 'ALL' ? 'Generate tagihan untuk semua rumah, atau tagih satu rumah secara manual.' : 'Tidak ada tagihan dengan status ini.'} />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface-card">
          {terfilter.map((t) => {
            const s = normalStatus(t.status_pembayaran)
            return (
              <li key={t.id_tagihan} className="flex items-center gap-3 p-4 transition-colors hover:bg-surface/60">
                <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', s === 'PAID' ? 'bg-status-paid-bg text-status-paid' : s === 'OVERDUE' ? 'bg-status-overdue-bg text-status-overdue' : 'bg-text-disabled/8 text-text-secondary')}>
                  <Icon name={s === 'PAID' ? 'check' : s === 'OVERDUE' ? 'alert' : 'building'} size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-text-primary">{labelRumah(t.id_rumah)}</p>
                  <p className="text-xs text-text-secondary">Periode {labelBulan(t.periode_bulan_tahun)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={cn('text-base font-bold', s === 'PAID' ? 'text-text-secondary line-through decoration-text-disabled/40' : 'text-text-primary')}>{fmt(t.total_nominal)}</p>
                  <div className="mt-1 flex justify-end"><BadgeStatus status={s} /></div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* Drawer: tagihan per rumah */}
      <Drawer open={open} onClose={() => setOpen(false)} title="Tagih per rumah" subtitle="Cari rumah, pilih periode — tanpa duplikat">
        <div className="space-y-4">
          <div>
            <label htmlFor="cari-rumah" className="mb-1.5 block text-[13px] font-semibold text-text-primary">Cari rumah</label>
            <div className="relative">
              <Icon name="search" size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input id="cari-rumah" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Gang / nomor, cth: Mawar atau 12" className={cn(inputCls, 'pl-10')} autoFocus />
            </div>
          </div>

          {pilih ? (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/25 bg-primary-50 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-text-primary">
                  <Icon name="mapPin" size={14} className="mr-1 inline text-primary" />
                  {pilih.nama_jalan_gang} No. {pilih.nomor_rumah}
                </p>
                <p className="text-xs text-text-secondary">{pilih.status_hunian === 'Dihuni' ? 'Dihuni' : 'Kosong'} · periode {labelBulan(periodeSatu)}</p>
              </div>
              <button onClick={() => setPilih(null)} aria-label="Ganti rumah" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-text-disabled/10 text-text-secondary active:scale-95">
                <Icon name="x" size={15} />
              </button>
            </div>
          ) : (
            <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {hasilCari.length === 0 && <p className="py-4 text-center text-sm text-text-secondary">Rumah tidak ditemukan.</p>}
              {hasilCari.map((r) => (
                <button key={r.id_rumah} onClick={() => setPilih(r)} className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface-card px-3.5 py-2.5 text-left transition-colors hover:border-primary/40 active:scale-[.99]">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-text-primary">{r.nama_jalan_gang} No. {r.nomor_rumah}</span>
                    <span className="text-xs text-text-secondary">{r.status_hunian === 'Dihuni' ? 'Dihuni' : 'Kosong'}</span>
                  </span>
                  <Icon name="chevron" size={15} className="shrink-0 text-text-secondary" />
                </button>
              ))}
            </div>
          )}

          <div>
            <label htmlFor="periode-satu" className="mb-2 block text-[13px] font-semibold text-text-primary">Periode (bulan-tahun)</label>
            <input id="periode-satu" type="month" value={periodeSatu} onChange={(e) => setPeriodeSatu(e.target.value)} className={cn(inputCls, 'h-12 text-base')} />
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-primary-50 px-3.5 py-3 text-xs text-text-secondary">
            <Icon name="alert" size={14} className="mt-0.5 shrink-0 text-primary" />
            Nominal dihitung dari master iuran tenant. Bila tagihan periode itu sudah ada, tidak dibuat duplikat.
          </p>

          <button
            onClick={generateSatu}
            disabled={!pilih || saving}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[.98] disabled:opacity-50"
          >
            {saving ? <><Icon name="refresh" size={15} className="animate-spin" /> Membuat…</> : <><Icon name="plus" size={16} /> Buat tagihan</>}
          </button>
        </div>
      </Drawer>
    </div>
  )
}
