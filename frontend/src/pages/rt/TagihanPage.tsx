import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { fmt, cn } from '../../lib/utils'
import { Drawer } from '../../components/ui/Drawer'
import { EmptyState, Skeleton } from '../../components/ui/bento'
import { Icon } from '../../components/ui/Icon'

interface Tagihan {
  id_tagihan: number
  id_rumah: number
  periode_bulan_tahun: string
  total_nominal: number
  status_pembayaran: 'PAID' | 'PENDING' | 'OVERDUE'
}
interface Rumah {
  id_rumah: number
  nama_jalan_gang: string
  nomor_rumah: string
  status_hunian: string
}

const inputCls =
  'w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30'

export function RTTagihanPage() {
  const [tagihans, setTagihans] = useState<Tagihan[]>([])
  const [rumahs, setRumahs] = useState<Rumah[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL')
  const [periode, setPeriode] = useState(new Date().toISOString().slice(0, 7))
  // Drawer generate per rumah
  const [open, setOpen] = useState(false)
  const [cari, setCari] = useState('')
  const [pilih, setPilih] = useState<Rumah | null>(null)
  const [periodeSatu, setPeriodeSatu] = useState(new Date().toISOString().slice(0, 7))
  const [saving, setSaving] = useState(false)

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
    try {
      const d = await api('/keuangan/tagihan/generate', {
        method: 'POST',
        body: JSON.stringify({ periode }),
      })
      setNotice({ type: 'ok', text: (d as any).message || 'Tagihan berhasil di-generate.' })
      load()
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal generate tagihan' })
    }
  }

  const generateSatu = async () => {
    if (!pilih) return
    setSaving(true)
    setNotice(null)
    try {
      const d = await api('/keuangan/tagihan/generate-rumah', {
        method: 'POST',
        body: JSON.stringify({ id_rumah: pilih.id_rumah, periode: periodeSatu }),
      })
      setNotice({
        type: 'ok',
        text: `Tagihan ${fmt((d as any).total_nominal)} dibuat untuk ${pilih.nama_jalan_gang} No. ${pilih.nomor_rumah} (${periodeSatu}).`,
      })
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
    return rumahs.filter(
      (r) => !q || r.nama_jalan_gang.toLowerCase().includes(q) || r.nomor_rumah.toLowerCase().includes(q) || `no. ${r.nomor_rumah}`.includes(q)
    )
  }, [cari, rumahs])

  const labelRumah = (id: number) => {
    const r = rumahs.find((x) => x.id_rumah === id)
    return r ? `${r.nama_jalan_gang} No. ${r.nomor_rumah}` : `Rumah #${id}`
  }

  const terfilter = useMemo(
    () => (filter === 'ALL' ? tagihans : tagihans.filter((t) => t.status_pembayaran === filter)),
    [filter, tagihans]
  )

  const badge = (s: string) => {
    if (s === 'PAID') return <span className="rounded-full bg-status-paid-bg px-2.5 py-1 text-xs font-medium text-status-paid">Lunas</span>
    if (s === 'OVERDUE') return <span className="rounded-full bg-status-overdue-bg px-2.5 py-1 text-xs font-medium text-status-overdue">Terlambat</span>
    return <span className="rounded-full bg-status-pending-bg px-2.5 py-1 text-xs font-medium text-status-pending">Belum Bayar</span>
  }

  const filterChips = [
    { k: 'ALL' as const, label: 'Semua' },
    { k: 'PENDING' as const, label: 'Belum bayar' },
    { k: 'OVERDUE' as const, label: 'Terlambat' },
    { k: 'PAID' as const, label: 'Lunas' },
  ]

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Kelola Tagihan</h1>
          <p className="text-sm text-text-secondary">Generate & monitor iuran warga</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex min-h-[48px] items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[.98]">
          <Icon name="plus" size={16} /> Per Rumah
        </button>
      </header>

      {notice && (
        <p role="alert" className={cn('mb-4 rounded-xl px-4 py-3 text-sm font-medium', notice.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800')}>
          {notice.text}
        </p>
      )}

      {/* Generate massal */}
      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface-card p-4">
        <div className="min-w-[180px] flex-1">
          <label htmlFor="periode-bulk" className="mb-1 block text-xs font-medium text-text-secondary">Periode (bulan-tahun)</label>
          <input id="periode-bulk" type="month" value={periode} onChange={(e) => setPeriode(e.target.value)} className={inputCls} />
        </div>
        <button onClick={generate} className="min-h-[48px] rounded-xl bg-surface-card px-5 py-2.5 text-sm font-medium text-text-primary ring-1 ring-inset ring-border transition-all hover:ring-primary/40 active:scale-[.98]">
          Generate semua rumah
        </button>
      </div>

      {/* Daftar + filter */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filterChips.map((c) => (
          <button
            key={c.k}
            onClick={() => setFilter(c.k)}
            aria-pressed={filter === c.k}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors min-h-[32px]',
              filter === c.k ? 'bg-primary text-white' : 'bg-surface-card text-text-secondary ring-1 ring-inset ring-border hover:text-text-primary'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {loading && (
          <div className="space-y-2.5">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        )}
        {!loading && terfilter.length === 0 && (
          <EmptyState icon="file" title="Belum ada tagihan" desc={filter === 'ALL' ? 'Generate tagihan untuk semua rumah, atau pilih per rumah.' : 'Tidak ada tagihan dengan status ini.'} />
        )}
        {terfilter.map((t) => (
          <div key={t.id_tagihan} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-card p-4">
            <div className="min-w-0">
              <p className="text-lg font-bold text-text-primary">{fmt(t.total_nominal)}</p>
              <p className="truncate text-xs text-text-secondary">Periode {t.periode_bulan_tahun} • {labelRumah(t.id_rumah)}</p>
            </div>
            {badge(t.status_pembayaran)}
          </div>
        ))}
      </div>

      {/* Drawer: generate manual per rumah */}
      <Drawer open={open} onClose={() => setOpen(false)} title="Tagihan per rumah" subtitle="Cari & pilih rumah, lalu tentukan periode">
        <div className="space-y-4">
          <div>
            <label htmlFor="cari-rumah" className="mb-1 block text-xs font-medium text-text-secondary">Cari rumah (gang / nomor)</label>
            <input id="cari-rumah" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="cth: Mawar atau No. 12" className={inputCls} autoFocus />
          </div>

          {pilih ? (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-primary-50 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">
                  <Icon name="mapPin" size={14} className="mr-1 inline text-primary" />
                  {pilih.nama_jalan_gang} No. {pilih.nomor_rumah}
                </p>
                <p className="text-xs text-text-secondary">{pilih.status_hunian === 'Dihuni' ? 'Dihuni' : 'Kosong'}</p>
              </div>
              <button onClick={() => setPilih(null)} aria-label="Ganti rumah" className="grid h-9 w-9 place-items-center rounded-full bg-text-disabled/10 text-text-secondary active:scale-95">
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
            <label htmlFor="periode-satu" className="mb-1 block text-xs font-medium text-text-secondary">Periode (bulan-tahun)</label>
            <input id="periode-satu" type="month" value={periodeSatu} onChange={(e) => setPeriodeSatu(e.target.value)} className={inputCls} />
          </div>

          <p className="rounded-lg bg-primary-50 px-3 py-2.5 text-xs text-text-secondary">
            Tagihan dibuat dari master iuran wajib tenant ini (dihitung otomatis). Bila periode untuk rumah itu sudah ada, tidak akan dibuat duplikat.
          </p>

          <button
            onClick={generateSatu}
            disabled={!pilih || saving}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition-all hover:bg-primary/90 active:scale-[.98] disabled:opacity-50"
          >
            {saving ? 'Membuat…' : 'Buat tagihan'}
          </button>
        </div>
      </Drawer>
    </div>
  )
}