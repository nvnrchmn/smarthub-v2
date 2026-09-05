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
      alert(e.message || 'Gagal mengaktifkan warga')
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
      alert(e.message || 'Gagal menolak warga')
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
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Ringkasan RT</h1>
          <p className="text-xs text-text-secondary">Periode {labelBulan(BULAN_INI)} · semua angka dari data terbaru</p>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary sm:flex">
          <Icon name="calendar" size={13} /> {BULAN_INI.split('-').reverse().join('-')}
        </span>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Skeleton className="col-span-2 h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="col-span-2 h-28" />
          <Skeleton className="col-span-2 h-28" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          {/* KPI Section */}
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KPI
              icon="wallet"
              label={`Iuran ${labelBulan(BULAN_INI).toLowerCase()}`}
              value={fmt(nominalBulan)}
              sub={`${lunasBulan} dari ${bulanIni.length} rumah lunas`}
              tone="primary"
              className="col-span-2"
            />
            <KPI icon="building" label="Rumah" value={rumah.length} sub={`${dihuni} dihuni`} />
            <KPI icon="users" label="Warga" value={warga.length} sub="Terdaftar aktif" />

            <BentoCard className="col-span-2" innerClassName="gap-3" tone={toneKepatuhan}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-text-secondary">Kepatuhan iuran bulan ini</p>
                <span className="text-lg font-extrabold text-text-primary">{Math.round(kepatuhan)}%</span>
              </div>
              <Progress value={kepatuhan} tone={toneKepatuhan === 'danger' ? 'danger' : toneKepatuhan === 'warning' ? 'warning' : 'success'} />
              <p className="text-xs text-text-secondary">{bulanIni.length ? `${lunasBulan} dari ${bulanIni.length} rumah sudah lunas bulan ini.` : 'Belum ada tagihan yang di-generate bulan ini.'}</p>
            </BentoCard>
            <KPI icon="check" label="Lunas" value={lunas.length} sub={fmt(nominalLunas)} tone="success" />
            <KPI icon="alert" label="Belum bayar" value={belum.length} sub="Pending & terlambat" tone={belum.length ? 'warning' : 'success'} />
          </section>

          {/* Pending Approval Section */}
          {pending.length > 0 && (
            <section className="mt-6">
              <SectionHead title="Menunggu Persetujuan" desc={`${pending.length} warga baru menunggu verifikasi`} />
              <div className="space-y-3">
                {pending.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-border bg-surface-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-warning/10 text-warning">
                          <Icon name="user" size={18} />
                        </span>
                        <div>
                          <p className="font-semibold text-text-primary truncate">{p.nama_lengkap}</p>
                          <p className="text-xs text-text-secondary">{p.nomor_wa} · {new Date(p.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleReject(p.id)}
                        disabled={processing === p.id}
                        className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-status-overdue/10 hover:text-status-overdue active:scale-95 disabled:opacity-50"
                      >
                        {processing === p.id ? '...' : 'Tolak'}
                      </button>
                      <button
                        onClick={() => handleApprove(p.id)}
                        disabled={processing === p.id}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                      >
                        {processing === p.id ? '...' : 'Setujui'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Kelola Section */}
          <section className="mt-6">
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
        </>
      )}
    </div>
  )
}
