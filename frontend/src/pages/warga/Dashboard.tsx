import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { fmt } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { ActionTile, Avatar, BentoCard, EmptyState, ErrorState, KPI, Progress, SectionHead, Skeleton } from '../../components/ui/bento'
import { Icon } from '../../components/ui/Icon'

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
  const badge = (s: string) =>
    s === 'PAID'
      ? 'bg-emerald-100 text-emerald-700'
      : s === 'OVERDUE'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700'
  const labelStatus = (s: string) => (s === 'PAID' ? 'Lunas' : s === 'OVERDUE' ? 'Terlambat' : 'Menunggu')

  return (
    <div className="mx-auto max-w-md px-4 pb-32 pt-4">
      {/* Header */}
      <header className="mb-4 flex items-center gap-3">
        <Avatar name={diriku?.nama_lengkap ?? 'Warga'} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-text-primary">Halo, {nama}</h1>
          <p className="truncate text-xs text-text-secondary">
            {idRumahKu ? `Rumah ${rumah.find((r) => r.id_rumah === idRumahKu)?.nomor_rumah ?? ''} — ${labelBulan(BULAN_INI)}` : labelBulan(BULAN_INI)}
          </p>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="col-span-2 h-40" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="col-span-2 h-28" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          {/* Hero: iuran bulan ini (data asli, bukan angka statis) */}
          <section className="grid grid-cols-2 gap-3">
            <BentoCard innerClassName="gap-3 p-5" tone={dueTotal > 0 ? 'primary' : 'success'}>
              <div className="flex items-center justify-between gap-2">
                <p className={`text-xs font-semibold ${dueTotal > 0 ? 'text-white/75' : 'text-emerald-800'}`}>Tagihan bulan ini</p>
                <span className={`grid h-8 w-8 place-items-center rounded-xl ${dueTotal > 0 ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                  <Icon name="wallet" size={16} />
                </span>
              </div>
              {lunasSemua ? (
                <>
                  <p className="text-xl font-extrabold text-emerald-900">Semua lunas 🎉</p>
                  <p className="text-xs text-emerald-700">Kamu sudah membayar {labelBulan(BULAN_INI).toLowerCase()}.</p>
                </>
              ) : bulanIni.length === 0 ? (
                <>
                  <p className="text-xl font-extrabold text-emerald-900">Belum ditagih</p>
                  <p className="text-xs text-emerald-700">Belum ada tagihan untuk {labelBulan(BULAN_INI).toLowerCase()}.</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-extrabold tracking-tight text-white">{fmt(dueTotal)}</p>
                  <p className="text-xs text-white/75">{due.length} tagihan belum dibayar</p>
                  <Link
                    to="/app/tagihan"
                    className="mt-1 inline-flex min-h-[44px] items-center justify-center gap-1.5 self-start rounded-xl bg-white px-4 text-sm font-bold text-primary shadow-sm active:scale-[0.98]"
                  >
                    Bayar sekarang <Icon name="arrow" size={15} />
                  </Link>
                </>
              )}
            </BentoCard>

            <KPI icon="home" label="Rumah" value={`${dihuni}/${rumah.length}`} sub="Dihuni" />
            <KPI icon="clock" label="Belum bayar" value={tunggak.length} sub={`${tunggak.length ? fmt(tunggak.reduce((s, t) => s + Number(t.total_nominal), 0)) : 'Aman'} total`} tone={tunggak.length ? 'warning' : 'success'} />

            <ActionTile to="/app/forum" icon="chat" title="Forum Warga" desc="Diskusi & pengumuman" />
            <ActionTile to="/app/lapak" icon="store" title="Lapak Warga" desc="Produk & jasa warga" />
          </section>

          {/* Riwayat tagihan terbaru */}
          <section className="mt-5">
            <SectionHead title="Tagihan terbaru" desc={labelBulan(BULAN_INI)} to="/app/tagihan" toLabel="Riwayat" />
            {terbaru.length === 0 ? (
              <EmptyState icon="file" title="Belum ada tagihan" desc="Tagihan iuran bulanan akan muncul di sini." />
            ) : (
              <BentoCard innerClassName="gap-1 p-2">
                {terbaru.map((t) => (
                  <Link
                    key={t.id_tagihan}
                    to="/app/tagihan"
                    className="flex min-h-[44px] items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-surface"
                  >
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge(t.status_pembayaran)}`}>{labelStatus(t.status_pembayaran)}</span>
                    <span className="min-w-0 flex-1 text-sm text-text-primary">{labelBulan(t.periode_bulan_tahun)}</span>
                    <span className="text-sm font-bold text-text-primary">{fmt(t.total_nominal)}</span>
                    <Icon name="chevron" size={15} className="text-text-disabled" />
                  </Link>
                ))}
              </BentoCard>
            )}
          </section>

          {/* Kepatuhan ringkas */}
          {rumah.length > 0 && (
            <section className="mt-5">
              <BentoCard innerClassName="gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">Kepatuhan iuran lingkungan</p>
                  <Icon name="trend" size={16} className="text-primary" />
                </div>
                <Progress value={(dihuni / rumah.length) * 100} tone="primary" />
                <p className="text-xs text-text-secondary">{dihuni} dari {rumah.length} rumah terdata dihuni bulan ini.</p>
              </BentoCard>
            </section>
          )}
        </>
      )}
    </div>
  )
}
