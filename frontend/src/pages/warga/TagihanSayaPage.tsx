import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { fmt, cn } from '../../lib/utils'
import { Icon } from '../../components/ui/Icon'
import { Drawer } from '../../components/ui/Drawer'
import { BadgeStatus, labelBulan, normalStatus } from '../../components/tagihan/BadgeStatus'
import { Skeleton } from '../../components/ui/bento'

interface Tagihan {
  id_tagihan: number
  id_rumah: number
  periode_bulan_tahun: string
  total_nominal: number
  status_pembayaran: string
  paid_at?: string | null
  xendit_invoice_id?: string | null
  xendit_payment_url?: string | null
}

interface RincianItem {
  id_detail: number
  nama_iuran: string
  nominal: number
}

type Filter = 'SEMUA' | 'AKTIF' | 'PAID'

export function TagihanSayaPage() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const [tagihans, setTagihans] = useState<Tagihan[]>([])
  const [loading, setLoading] = useState(true)
  const [bayarId, setBayarId] = useState<number | null>(null)
  const [err, setErr] = useState('')
  const [filter, setFilter] = useState<Filter>('SEMUA')
  const notice = params.get('status') === 'success' ? 'Pembayaran diterima — terima kasih!' : params.get('status') === 'cancel' ? 'Pembayaran dibatalkan. Kamu bisa mencoba lagi kapan saja.' : ''
  const idSelesai = Number(params.get('id') || 0)
  const [verif, setVerif] = useState<'cek' | 'ok' | 'belum' | 'gagal'>()
  const [det, setDet] = useState<{ tagihan: Tagihan; rincian: RincianItem[]; metode: string } | null>(null)
  const [detLoading, setDetLoading] = useState(false)

  const bukaDet = async (t: Tagihan) => {
    setDetLoading(true)
    setDet({ tagihan: t, rincian: [], metode: 'QRIS' })
    try {
      const d = await api<{ tagihan: Tagihan; rincian: RincianItem[]; metode: string }>(`/keuangan/tagihan/${t.id_tagihan}`)
      setDet(d)
    } catch {
      /* tetap tampilkan data dari list */
    } finally {
      setDetLoading(false)
    }
  }

  const tenantId = user?.tenant_id ?? 1

  const load = () => {
    setLoading(true)
    api(`/keuangan/tagihan?tenant_id=${tenantId}`)
      .then((d) => setTagihans(Array.isArray(d) ? d : []))
      .catch(() => setErr('Gagal memuat tagihan. Tarik untuk coba lagi.'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [tenantId])
  useEffect(() => { if (notice) setErr('') }, [notice])
  // Saat kembali dari Xendit (?status=success&id=…): konfirmasi status invoice
  // langsung ke Xendit — cadangan bila webhook belum terpasang/telat.
  useEffect(() => {
    if (!idSelesai || params.get('status') !== 'success') return
    let batal = false
    ;(async () => {
      setVerif('cek')
      try {
        const r = await api<{ status: string }>(`/keuangan/tagihan/${idSelesai}/verifikasi`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        })
        if (!batal) setVerif(r.status === 'PAID' ? 'ok' : 'belum')
      } catch {
        if (!batal) setVerif('gagal')
      } finally {
        if (!batal) load()
      }
    })()
    return () => { batal = true }
  }, [idSelesai])

  const bayar = async (t: Tagihan) => {
    setErr('')
    setBayarId(t.id_tagihan)
    try {
      const res = await api<{ payment_url: string }>(`/keuangan/tagihan/${t.id_tagihan}/bayar`, {
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

  const aktif = useMemo(() => tagihans.filter((t) => { const s = normalStatus(t.status_pembayaran); return s === 'PENDING' || s === 'OVERDUE' }), [tagihans])
  const terlambat = useMemo(() => tagihans.filter((t) => normalStatus(t.status_pembayaran) === 'OVERDUE'), [tagihans])
  const totalAktif = useMemo(() => aktif.reduce((a, t) => a + t.total_nominal, 0), [aktif])
  const lunas = useMemo(() => tagihans.filter((t) => normalStatus(t.status_pembayaran) === 'PAID'), [tagihans])

  const daftar = useMemo(() => {
    if (filter === 'AKTIF') return [...aktif].sort((a, b) => (normalStatus(a.status_pembayaran) === 'OVERDUE' ? -1 : 1) - (normalStatus(b.status_pembayaran) === 'OVERDUE' ? -1 : 1))
    if (filter === 'PAID') return lunas
    return tagihans
  }, [filter, aktif, lunas, tagihans])

  const chips: { k: Filter; label: string; jml: number }[] = [
    { k: 'SEMUA', label: 'Semua', jml: tagihans.length },
    { k: 'AKTIF', label: 'Perlu dibayar', jml: aktif.length },
    { k: 'PAID', label: 'Lunas', jml: lunas.length },
  ]

  return (
    <div className="page-enter mx-auto max-w-lg px-4 pt-4">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Tagihan</h1>
        <p className="text-sm text-text-secondary">Iuran warga — bayar cepat via Xendit</p>
      </header>

      {/* Hero: total tagihan aktif */}
      <section className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[#0E4A30] p-5 text-white shadow-lg shadow-primary/25">
        <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
        <p className="text-[13px] font-medium text-white/80">Total tagihan perlu dibayar</p>
        <p className="mt-1 text-[34px] font-bold leading-tight tracking-tight">{fmt(totalAktif)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <Icon name="clock" size={13} /> {aktif.length} belum dibayar
          </span>
          {terlambat.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-danger px-3 py-1 text-xs font-medium text-white">
              <Icon name="alert" size={13} /> {terlambat.length} terlambat
            </span>
          )}
          {lunas.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              <Icon name="check" size={13} /> {lunas.length} lunas
            </span>
          )}
        </div>
      </section>

      {(notice || verif) && (
        <div
          role="status"
          className={cn(
            'mb-4 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm',
            verif === 'cek'
              ? 'border-border bg-surface-card text-text-secondary'
              : verif === 'ok' || (verif !== 'belum' && verif !== 'gagal' && notice.startsWith('Pembayaran diterima'))
                ? 'border-status-paid/30 bg-status-paid-bg text-status-paid'
                : verif === 'gagal'
                  ? 'border-status-overdue/30 bg-status-overdue-bg text-status-overdue'
                  : 'border-border bg-surface-card text-text-secondary'
          )}
        >
          <Icon
            name={verif === 'cek' ? 'refresh' : verif === 'ok' ? 'check' : verif === 'gagal' ? 'alert' : 'clock'}
            size={16}
            className={cn('mt-0.5 shrink-0', verif === 'cek' && 'animate-spin')}
          />
          {verif === 'cek'
            ? 'Memverifikasi pembayaran ke Xendit…'
            : verif === 'ok'
              ? 'Pembayaran diterima — tagihan sudah lunas!'
              : verif === 'gagal'
                ? 'Gagal memverifikasi pembayaran. Coba muat ulang, atau hubungi pengurus.'
                : verif === 'belum'
                  ? 'Pembayaran belum tercatat otomatis. Bila sudah bayar, hubungi pengurus agar dicatat manual.'
                  : notice}
        </div>
      )}
      {err && !notice && (
        <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-status-overdue/30 bg-status-overdue-bg px-4 py-3 text-sm text-status-overdue">
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          {err}
        </div>
      )}

      {/* Filter */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {chips.map((c) => (
          <button
            key={c.k}
            onClick={() => setFilter(c.k)}
            aria-pressed={filter === c.k}
            className={cn(
              'flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-colors',
              filter === c.k ? 'bg-text-primary text-surface' : 'bg-surface-card text-text-secondary ring-1 ring-inset ring-border'
            )}
          >
            {c.label}
            <span className={cn('rounded-full px-1.5 text-[10px] font-bold', filter === c.k ? 'bg-white/20 text-inherit' : 'bg-text-disabled/10 text-text-secondary')}>{c.jml}</span>
          </button>
        ))}
      </div>

      {/* Daftar */}
      {loading ? (
        <div className="space-y-2.5">
          <Skeleton className="h-[104px] rounded-2xl" />
          <Skeleton className="h-[104px] rounded-2xl" />
        </div>
      ) : daftar.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-text-disabled/10 text-text-secondary">
            <Icon name="wallet" size={20} />
          </div>
          <p className="font-semibold text-text-primary">{filter === 'PAID' ? 'Belum ada tagihan lunas' : 'Tidak ada tagihan aktif'}</p>
          <p className="mt-1 text-sm text-text-secondary">{filter === 'AKTIF' ? 'Semua tagihanmu sudah terbayar.' : 'Tagihan baru akan muncul saat pengurus generate iuran bulanan.'}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface-card">
          {daftar.map((t) => {
            const s = normalStatus(t.status_pembayaran)
            const bolehBayar = s === 'PENDING' || s === 'OVERDUE' || s === 'EXPIRED'
            const sibuk = bayarId === t.id_tagihan
            return (
              <li key={t.id_tagihan} onClick={() => bukaDet(t)} role="button" aria-label={`Detail tagihan ${labelBulan(t.periode_bulan_tahun)}`} className="cursor-pointer p-4 transition-colors hover:bg-text-disabled/5 active:bg-text-disabled/8">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-text-disabled/8 text-text-secondary">
                      <Icon name="calendar" size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-text-primary">{labelBulan(t.periode_bulan_tahun)}</p>
                      <p className="text-xs text-text-secondary">Iuran warga bulanan</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn('text-[17px] font-bold leading-tight', s === 'PAID' ? 'text-text-secondary line-through decoration-text-disabled/40' : 'text-text-primary')}>{fmt(t.total_nominal)}</p>
                    <div className="mt-1 flex items-center justify-end gap-1"><BadgeStatus status={s} /><Icon name="chevron" size={13} className="-rotate-90 text-text-disabled" /></div>
                  </div>
                </div>
                {bolehBayar && (
                  <button
                    onClick={() => bayar(t)}
                    disabled={sibuk}
                    className="mt-3 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[.99] disabled:opacity-60"
                  >
                    <Icon name="wallet" size={16} />
                    {sibuk ? 'Menyiapkan pembayaran…' : 'Bayar via QRIS'}
                  </button>
                )}
                {s === 'PAID' && (
                  <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-status-paid">
                    <Icon name="check" size={13} />
                    {t.paid_at ? `Dibayar ${tglWaktu(t.paid_at)} — lihat detail` : 'Pembayaran sudah diterima'}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <p className="mt-4 text-center text-[11px] text-text-secondary">Pembayaran hanya via QRIS — diproses aman oleh Xendit. Scan pakai DANA, OVO, GoPay, atau ShopeePay.</p>

      {/* Detail tagihan */}
      <Drawer open={!!det} onClose={() => setDet(null)} title="Detail Tagihan" subtitle={det ? labelBulan(det.tagihan.periode_bulan_tahun) : ''}>
        {det && (() => {
          const s = normalStatus(det.tagihan.status_pembayaran)
          const sibuk = bayarId === det.tagihan.id_tagihan
          return (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
                <div>
                  <p className="text-xs text-text-secondary">Total tagihan</p>
                  <p className={cn('mt-0.5 text-[24px] font-bold leading-tight', s === 'PAID' ? 'text-text-secondary line-through decoration-text-disabled/40' : 'text-text-primary')}>{fmt(det.tagihan.total_nominal)}</p>
                </div>
                <BadgeStatus status={s} size="md" />
              </div>

              <div>
                <p className="mb-2 text-[13px] font-semibold text-text-primary">Rincian iuran</p>
                {detLoading && det.rincian.length === 0 ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl" />
                  </div>
                ) : det.rincian.length === 0 ? (
                  <p className="text-sm text-text-secondary">Belum ada rincian item.</p>
                ) : (
                  <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface-card">
                    {det.rincian.map((r) => (
                      <li key={r.id_detail} className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm text-text-primary">{r.nama_iuran}</span>
                        <span className="text-sm font-semibold text-text-primary">{fmt(r.nominal)}</span>
                      </li>
                    ))}
                    <li className="flex items-center justify-between bg-surface px-4 py-3">
                      <span className="text-[13px] font-semibold text-text-secondary">Total</span>
                      <span className="text-[15px] font-bold text-primary">{fmt(det.tagihan.total_nominal)}</span>
                    </li>
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-surface-card p-4">
                <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-text-primary">
                  <Icon name="wallet" size={14} /> Pembayaran
                </p>
                {s === 'PAID' ? (
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-status-paid"><Icon name="check" size={14} /> Lunas — dibayar via {det.metode || 'QRIS'}</p>
                    {det.tagihan.paid_at && <p className="text-xs text-text-secondary">Waktu bayar: {tglWaktu(det.tagihan.paid_at)}</p>}
                    {det.tagihan.xendit_invoice_id && (
                      <p className="truncate text-[11px] text-text-disabled">Referensi: {det.tagihan.xendit_invoice_id.slice(0, 24)}…</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => bayar(det.tagihan)}
                      disabled={sibuk}
                      className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[.99] disabled:opacity-60"
                    >
                      <Icon name="wallet" size={16} />
                      {sibuk ? 'Menyiapkan pembayaran…' : 'Bayar via QRIS'}
                    </button>
                    <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-text-secondary">
                      <Icon name="alert" size={12} className="mt-0.5 shrink-0" />
                      {s === 'EXPIRED' ? 'Invoice sebelumnya kedaluwarsa. Klik bayar untuk membuat QRIS baru.' : 'Scan QRIS dengan DANA, OVO, GoPay, atau ShopeePay dalam 24 jam.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </Drawer>
    </div>
  )
}

function tglWaktu(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
