import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { fmt } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { ActionTile, Avatar, BentoCard, EmptyState, ErrorState, KPI, Progress, SectionHead, Skeleton } from '../../components/ui/bento'
import { Icon, type IconName } from '../../components/ui/Icon'

interface Rumah { id_rumah: number; nama_jalan_gang: string; nomor_rumah: string; status_hunian: string }
interface WargaRow { id_warga: number; id_rumah: number | null; id_user: number | null; nama_lengkap: string }
interface Tagihan {
  id_tagihan: number; id_rumah: number; periode_bulan_tahun: string
  total_nominal: number; status_pembayaran: string; paid_at: string | null
}

const BULAN_INI = new Date().toISOString().slice(0, 7)
const labelBulan = (p: string) => {
  const [y, m] = p.split('-').map(Number)
  return new Date(y, m - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

/* Tampilan status tagihan — chip ikon token-aware (terbaca di mode terang & gelap) */
const STATUS_TINT: Record<string, string> = {
  PAID: 'bg-[color-mix(in_srgb,var(--color-status-paid)_13%,transparent)] text-status-paid ring-[color-mix(in_srgb,var(--color-status-paid)_26%,transparent)]',
  OVERDUE: 'bg-[color-mix(in_srgb,var(--color-status-overdue)_13%,transparent)] text-status-overdue ring-[color-mix(in_srgb,var(--color-status-overdue)_26%,transparent)]',
  PENDING: 'bg-[color-mix(in_srgb,var(--color-status-pending)_14%,transparent)] text-status-pending ring-[color-mix(in_srgb,var(--color-status-pending)_28%,transparent)]',
}
const STATUS_ICON: Record<string, IconName> = { PAID: 'check', OVERDUE: 'alert', PENDING: 'clock' }
const STATUS_TEXT: Record<string, string> = {
  PAID: 'text-status-paid',
  OVERDUE: 'text-status-overdue',
  PENDING: 'text-status-pending',
}

export function WargaDashboard() {
  const { user } = useAuth()
  const [rumah, setRumah] = useState<Rumah[]>([])
  const [warga, setWarga] = useState<WargaRow[]>([])
  const [tagihan, setTagihan] = useState<Tagihan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([api('/wilayah/rumah'), api('/warga'), api('/keuangan/tagihan')])
      .then(([r, w, t]: [Rumah[], WargaRow[], Tagihan[]]) => {
        setRumah(r)
        setWarga(w)
        setTagihan(t)
      })
      .catch((e: any) => setError(e.message || 'Terjadi kesalahan'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const diriku = warga.find((w) => w.id_user === user?.id) ?? null
  const idRumahKu = diriku?.id_rumah ?? null
  // tagihan rumah sendiri; kalau profil warga belum terhubung, tampilkan iuran lingkungan
  const tagihanKu = idRumahKu ? tagihan.filter((t) => t.id_rumah === idRumahKu) : tagihan
  const bulanIni = tagihanKu.filter((t) => t.periode_bulan_tahun === BULAN_INI)
  const tunggak = tagihanKu.filter((t) => t.status_pembayaran === 'PENDING' || t.status_pembayaran === 'OVERDUE')
  const lunasSemua = bulanIni.length > 0 && bulanIni.every((t) => t.status_pembayaran === 'PAID')
  const due = bulanIni.filter((t) => t.status_pembayaran !== 'PAID')
  const dueTotal = due.reduce((s, t) => s + Number(t.total_nominal || 0), 0)
  const dihuni = rumah.filter((r) => r.status_hunian === 'Dihuni').length
  const terbaru = [...tagihanKu].sort((a, b) => b.id_tagihan - a.id_tagihan).slice(0, 3)
  const nama = diriku?.nama_lengkap?.split(' ')[0] ?? 'Warga'
  const rumahKu = idRumahKu ? rumah.find((r) => r.id_rumah === idRumahKu) ?? null : null
  const bulanLower = labelBulan(BULAN_INI).toLowerCase()
  const labelStatus = (s: string) => (s === 'PAID' ? 'Lunas' : s === 'OVERDUE' ? 'Terlambat' : 'Menunggu')

  return (
    <div className="mx-auto max-w-md px-4 pb-32 pt-5">
      {/* Header — sapaan + identitas rumah */}
      <header className="mb-5 flex items-center gap-3.5">
        <span className="relative shrink-0 rounded-2xl p-0.5 ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-primary)_22%,var(--sh-border))]">
          <Avatar name={diriku?.nama_lengkap ?? 'Warga'} className="h-12 w-12 rounded-[14px] text-[15px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Beranda Warga</p>
          <h1 className="mt-0.5 truncate text-lg font-extrabold leading-tight tracking-[-0.02em] text-text-primary">
            Halo, {nama}
          </h1>
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-text-secondary">
            {rumahKu && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <Icon name="home" size={12} className="shrink-0 text-primary" />
                <span className="truncate font-semibold text-text-primary">Rumah {rumahKu.nomor_rumah}</span>
              </span>
            )}
            <span className="text-text-disabled" aria-hidden="true">·</span>
            <Icon name="calendar" size={12} className="shrink-0 text-text-disabled" />
            <span className="truncate">{labelBulan(BULAN_INI)}</span>
          </p>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 gap-3" aria-busy="true">
          <Skeleton className="col-span-2 h-48 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="col-span-2 h-[76px] rounded-2xl" />
          <Skeleton className="col-span-2 h-28 rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          {/* Hero: status iuran bulan ini */}
          <section className="grid grid-cols-2 gap-3">
            <BentoCard
              className="col-span-2"
              innerClassName="gap-4 p-5"
              tone={dueTotal > 0 ? 'primary' : 'success'}
            >
              {lunasSemua ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--color-status-paid)_70%,var(--sh-text-2))]">
                      Tagihan bulan ini
                    </p>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--color-status-paid)_14%,transparent)] text-status-paid ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-status-paid)_26%,transparent)]">
                      <Icon name="wallet" size={17} />
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_1px_2px_rgb(0_0_0/0.12)]">
                      <Icon name="check" size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xl font-extrabold tracking-[-0.02em] text-text-primary">Semua lunas</p>
                      <p className="mt-0.5 text-xs font-medium text-[color-mix(in_srgb,var(--color-status-paid)_58%,var(--sh-text-2))]">
                        Kamu sudah membayar {bulanLower}.
                      </p>
                    </div>
                  </div>
                </>
              ) : bulanIni.length === 0 ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--color-status-paid)_70%,var(--sh-text-2))]">
                      Tagihan bulan ini
                    </p>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--color-status-paid)_14%,transparent)] text-status-paid ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-status-paid)_26%,transparent)]">
                      <Icon name="calendar" size={17} />
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--color-status-paid)_13%,transparent)] text-status-paid ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-status-paid)_24%,transparent)]">
                      <Icon name="receipt" size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xl font-extrabold tracking-[-0.02em] text-text-primary">Belum ditagih</p>
                      <p className="mt-0.5 text-xs font-medium text-[color-mix(in_srgb,var(--color-status-paid)_58%,var(--sh-text-2))]">
                        Belum ada tagihan untuk {bulanLower}.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                      Tagihan bulan ini
                    </p>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                      <Icon name="wallet" size={17} />
                    </span>
                  </div>
                  <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-4">
                    <div className="min-w-0">
                      <p className="text-[34px] font-extrabold leading-none tracking-[-0.03em] text-white tabular-nums">
                        {fmt(dueTotal)}
                      </p>
                      <p className="mt-2 text-xs font-medium text-white/75">
                        {due.length} tagihan belum dibayar
                      </p>
                    </div>
                    <Link
                      to="/app/tagihan"
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 self-end rounded-xl bg-white px-4 text-sm font-bold text-primary shadow-[0_1px_2px_rgb(0_0_0/0.08),0_8px_16px_-8px_rgb(0_0_0/0.4)] transition-transform duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                      Bayar sekarang <Icon name="arrow" size={15} />
                    </Link>
                  </div>
                </>
              )}
            </BentoCard>

            <KPI icon="home" label="Rumah" value={`${dihuni}/${rumah.length}`} sub="Rumah dihuni" />
            <KPI
              icon="clock"
              label="Belum bayar"
              value={tunggak.length}
              sub={`${tunggak.length ? fmt(tunggak.reduce((s, t) => s + Number(t.total_nominal), 0)) : 'Aman'} total`}
              tone={tunggak.length ? 'warning' : 'success'}
              to="/app/tagihan"
            />

            <ActionTile to="/app/forum" icon="chat" title="Forum Warga" desc="Diskusi & pengumuman" accent="neutral" />
            <ActionTile to="/app/lapak" icon="store" title="Lapak Warga" desc="Produk & jasa warga" accent="neutral" />
          </section>

          {/* Riwayat tagihan terbaru */}
          <section className="mt-6">
            <SectionHead title="Tagihan terbaru" desc={labelBulan(BULAN_INI)} to="/app/tagihan" toLabel="Riwayat" />
            {terbaru.length === 0 ? (
              <EmptyState icon="receipt" title="Belum ada tagihan" desc="Tagihan iuran bulanan akan muncul di sini." />
            ) : (
              <BentoCard innerClassName="gap-0.5 p-2">
                {terbaru.map((t) => (
                  <Link
                    key={t.id_tagihan}
                    to="/app/tagihan"
                    className="group flex min-h-[52px] items-center gap-3 rounded-xl px-2.5 py-2 transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] ring-1 ring-inset ${STATUS_TINT[t.status_pembayaran] ?? STATUS_TINT.PENDING}`}
                    >
                      <Icon name={STATUS_ICON[t.status_pembayaran] ?? 'clock'} size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-text-primary">
                        {labelBulan(t.periode_bulan_tahun)}
                      </span>
                      <span className={`mt-0.5 block text-[11px] font-medium ${STATUS_TEXT[t.status_pembayaran] ?? STATUS_TEXT.PENDING}`}>
                        {labelStatus(t.status_pembayaran)}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-bold tracking-[-0.01em] text-text-primary tabular-nums">
                      {fmt(t.total_nominal)}
                    </span>
                    <Icon
                      name="chevron"
                      size={15}
                      className="shrink-0 text-text-disabled transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </Link>
                ))}
              </BentoCard>
            )}
          </section>

          {/* Kepatuhan ringkas */}
          {rumah.length > 0 && (
            <section className="mt-5">
              <BentoCard innerClassName="gap-3.5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold tracking-[-0.01em] text-text-primary">Kepatuhan iuran lingkungan</p>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-primary ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]">
                    <Icon name="trend" size={15} />
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={(dihuni / rumah.length) * 100} tone="primary" className="flex-1" />
                  <span className="shrink-0 text-xs font-extrabold text-primary tabular-nums">
                    {Math.round((dihuni / rumah.length) * 100)}%
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {dihuni} dari {rumah.length} rumah terdata dihuni bulan ini.
                </p>
              </BentoCard>
            </section>
          )}
        </>
      )}
    </div>
  )
}
