import { useToast } from '../../context/ToastContext'
import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { fmt } from '../../lib/utils'
import { ActionTile, BentoCard, ErrorState, KPI, Progress, SectionHead, Skeleton } from '../../components/ui/bento'
import { Icon } from '../../components/ui/Icon'

interface Rumah { id_rumah: number; nama_jalan_gang: string; nomor_rumah: string; status_hunian: string }
interface WargaRow { id_warga: number; id_rumah: number | null; nama_lengkap: string; status_warga: string }
interface Tagihan { id_tagihan: number; id_rumah: number; periode_bulan_tahun: string; total_nominal: number; status_pembayaran: string }
interface PendingUser { id: number; nama_lengkap: string; nomor_wa: string; invite_code?: string; created_at: string }

const BULAN_INI = new Date().toISOString().slice(0, 7)
const labelBulan = (p: string) => {
  const [y, m] = p.split('-').map(Number)
  return new Date(y, m - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export function RTDashboard() {
  const { toast } = useToast()
  const [rumah, setRumah] = useState<Rumah[]>([])
  const [warga, setWarga] = useState<WargaRow[]>([])
  const [tagihan, setTagihan] = useState<Tagihan[]>([])
  const [pending, setPending] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState<number | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([
      api('/wilayah/rumah'),
      api('/warga'),
      api('/keuangan/tagihan'),
      api('/auth/warga-pending')
    ])
      .then(([r, w, t, p]: [Rumah[], WargaRow[], Tagihan[], PendingUser[]]) => {
        setRumah(r)
        setWarga(w)
        setTagihan(t)
        setPending(p)
      })
      .catch((e: any) => setError(e.message || 'Terjadi kesalahan'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const handleApprove = async (userId: number) => {
    setProcessing(userId)
    try {
      await api(`/auth/warga-approve/${userId}`, { method: 'POST' })
      setPending(p => p.filter(x => x.id !== userId))
    } catch (e: any) {
      toast(e.message || 'Gagal mengaktifkan warga', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (userId: number) => {
    setProcessing(userId)
    try {
      await api(`/auth/warga-reject/${userId}`, { method: 'POST' })
      setPending(p => p.filter(x => x.id !== userId))
    } catch (e: any) {
      toast(e.message || 'Gagal menolak warga', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const lunas = tagihan.filter((t) => t.status_pembayaran === 'PAID')
  const belum = tagihan.filter((t) => t.status_pembayaran === 'PENDING' || t.status_pembayaran === 'OVERDUE')
  const bulanIni = tagihan.filter((t) => t.periode_bulan_tahun === BULAN_INI)
  const lunasBulan = bulanIni.filter((t) => t.status_pembayaran === 'PAID').length
  const nominalBulan = bulanIni.reduce((s, t) => s + Number(t.total_nominal || 0), 0)
  const nominalLunas = lunas.reduce((s, t) => s + Number(t.total_nominal || 0), 0)
  const dihuni = rumah.filter((r) => r.status_hunian === 'Dihuni').length
  const kepatuhan = bulanIni.length ? (lunasBulan / bulanIni.length) * 100 : 0
  const toneKepatuhan = kepatuhan >= 70 ? 'success' : kepatuhan >= 40 ? 'warning' : 'danger'

  return (
    <div className="mx-auto max-w-5xl">
      {/* ==== Header ringkasan ==== */}
      <header className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-white shadow-md shadow-primary/20 ring-1 ring-white/20 sm:mt-0">
            <Icon name="grid" size={19} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">Panel RT</p>
            <h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">Ringkasan RT</h1>
            <p className="mt-1 truncate text-xs text-text-secondary sm:max-w-none">Periode {labelBulan(BULAN_INI)} · semua angka dari data terbaru</p>
          </div>
        </div>
        <span className="hidden w-fit items-center gap-2 self-start rounded-full border border-border bg-surface-card py-1.5 pl-1.5 pr-4 text-xs font-semibold text-text-primary shadow-sm sm:inline-flex sm:self-auto">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-50 text-primary">
            <Icon name="calendar" size={13} />
          </span>
          <span className="font-bold tracking-wide">{BULAN_INI.split('-').reverse().join('-')}</span>
        </span>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4" aria-hidden="true">
          <Skeleton className="col-span-2 h-44" />
          <Skeleton className="h-32 md:h-40" />
          <Skeleton className="h-32 md:h-40" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="col-span-2 h-36 md:h-32" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="space-y-6 sm:space-y-7">
          {/* ==== Bento ringkasan keuangan & warga ==== */}
          <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4" aria-label="Ringkasan iuran dan warga">
            <BentoCard
              tone="primary"
              className="col-span-2"
              innerClassName="relative justify-between gap-4 overflow-hidden border-transparent p-5 shadow-md shadow-primary/20 sm:p-6"
            >
              <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-white/10" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-12 h-48 w-48 rounded-full bg-white/5" />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
                    Iuran {labelBulan(BULAN_INI).toLowerCase()}
                  </p>
                  <p className="mt-2 truncate text-[26px] font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                    {fmt(nominalBulan)}
                  </p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-inset ring-white/25">
                  <Icon name="wallet" size={20} />
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white transition-[width] duration-700 ease-out" style={{ width: `${kepatuhan}%` }} />
                </div>
                <p className="mt-2.5 text-xs font-medium text-white/80">
                  {lunasBulan} dari {bulanIni.length} rumah lunas
                </p>
              </div>
            </BentoCard>

            <KPI icon="building" label="Rumah" value={rumah.length} sub={`${dihuni} dihuni`} />
            <KPI icon="users" label="Warga" value={warga.length} sub="Terdaftar aktif" />
            <KPI icon="check" label="Lunas" value={lunas.length} sub={fmt(nominalLunas)} tone="success" />
            <KPI icon="alert" label="Belum bayar" value={belum.length} sub="Pending & terlambat" tone={belum.length ? 'warning' : 'success'} />

            <BentoCard tone={toneKepatuhan} className="col-span-2" innerClassName="gap-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-text-secondary">Kepatuhan iuran bulan ini</p>
                <span className="text-xl font-extrabold tabular-nums tracking-tight text-text-primary">{Math.round(kepatuhan)}%</span>
              </div>
              <Progress value={kepatuhan} tone={toneKepatuhan} />
              <p className="text-xs text-text-secondary">{bulanIni.length ? `${lunasBulan} dari ${bulanIni.length} rumah sudah lunas bulan ini.` : 'Belum ada tagihan yang di-generate bulan ini.'}</p>
            </BentoCard>
          </section>

          {/* ==== Persetujuan warga baru ==== */}
          {pending.length > 0 && (
            <section aria-label="Warga baru menunggu persetujuan">
              <SectionHead title="Menunggu Persetujuan" desc={`${pending.length} warga baru menunggu verifikasi`} />
              <ul className="space-y-3">
                {pending.map((p) => (
                  <li key={p.id} className="relative overflow-hidden rounded-2xl border border-border bg-surface-card shadow-sm transition-shadow duration-200 hover:shadow-md">
                    <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-warning to-warning/40" />
                    <div className="flex flex-col gap-4 py-4 pl-5 pr-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:py-4 sm:pl-6 sm:pr-5">
                      <div className="flex min-w-0 flex-1 items-center gap-3.5">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-warning/10 text-warning ring-1 ring-inset ring-warning/20">
                          <Icon name="user" size={18} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-text-primary">{p.nama_lengkap}</p>
                          <p className="mt-0.5 truncate text-xs text-text-secondary">{p.nomor_wa} · {new Date(p.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                        <button
                          onClick={() => handleReject(p.id)}
                          disabled={processing === p.id}
                          className="flex-1 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition-all hover:border-status-overdue/30 hover:bg-status-overdue/10 hover:text-status-overdue active:scale-95 disabled:opacity-50 sm:flex-none"
                        >
                          {processing === p.id ? '...' : 'Tolak'}
                        </button>
                        <button
                          onClick={() => handleApprove(p.id)}
                          disabled={processing === p.id}
                          className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25 active:scale-95 disabled:opacity-50 sm:flex-none"
                        >
                          {processing === p.id ? '...' : 'Setujui'}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ==== Aksi kelola cepat ==== */}
          <section aria-label="Menu kelola data">
            <SectionHead title="Kelola" desc="Aksi cepat data warga & iuran" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <ActionTile to="/rt/rumah" icon="building" title="Rumah" desc={`${rumah.length} rumah terdata`} />
              <ActionTile to="/rt/warga" icon="users" title="Warga" desc={`${warga.length} warga terdaftar`} />
              <ActionTile to="/rt/tagihan" icon="file" title="Tagihan" desc={`${belum.length} belum dibayar`} accent={belum.length ? 'warning' : 'success'} />
              <ActionTile to="/rt/forum" icon="chat" title="Forum" desc="Kelola thread & pengumuman" accent="neutral" />
              <ActionTile to="/rt/lapak" icon="store" title="Lapak" desc="Tinjau produk warga" accent="neutral" />
              <ActionTile to="/rt/warga" icon="plus" title="Tambah data" desc="Rumah atau warga baru" accent="neutral" />
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
