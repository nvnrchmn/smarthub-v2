import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { api } from '../../lib/api'
import { cn, fmt } from '../../lib/utils'
import { Icon, type IconName } from '../../components/ui/Icon'
import { ActionTile, Avatar, EmptyState, ErrorState, Progress, SectionHead, Skeleton } from '../../components/ui/bento'

interface Summary {
  total_tenants: number; total_users: number; total_rumah: number; total_warga: number
  total_tagihan: number; total_lunas: number; total_belum_bayar: number; total_nominal: number
}
interface Tenant {
  ID: number; NamaRTRW: string; DesaKelurahan: string; Kecamatan: string
  KabupatenKota: string; Provinsi: string; StatusBerlanggan: string; XenditKYCStatus: string
}

/* ------------------------------------------------------------------ */
/* Shell kartu — konsisten dengan primitif bento, sedikit ditinggikan  */
/* ------------------------------------------------------------------ */
const cardShell =
  'group relative overflow-hidden rounded-2xl border border-border bg-surface-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-5'

function MiniStat({
  icon,
  label,
  value,
  sub,
  iconClass,
  className,
}: {
  icon: IconName
  label: string
  value: ReactNode
  sub?: ReactNode
  iconClass?: string
  className?: string
}) {
  return (
    <article className={cn(cardShell, 'flex flex-col', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{label}</p>
        <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105', iconClass || 'bg-primary-50 text-primary')}>
          <Icon name={icon} size={15} />
        </span>
      </div>
      <p className="mt-2 truncate text-2xl font-extrabold tabular-nums tracking-tight text-text-primary">{value}</p>
      {sub && (
        <div className="mt-auto border-t border-border/70 pt-2.5 text-xs text-text-secondary">{sub}</div>
      )}
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Halaman ringkasan platform                                         */
/* ------------------------------------------------------------------ */
export function AdminDashboard() {
  const [s, setS] = useState<Summary | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([api<Summary>('/admin/summary'), api<Tenant[]>('/admin/tenants')])
      .then(([sum, tns]) => {
        setS(sum)
        setTenants(tns)
      })
      .catch((e: any) => setError(e.message || 'Terjadi kesalahan'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const lunasPct = s && s.total_tagihan ? (s.total_lunas / s.total_tagihan) * 100 : 0
  const aktif = tenants.filter((t) => t.StatusBerlanggan === 'AKTIF').length

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header sambutan */}
      <header className="relative mb-6 overflow-hidden rounded-3xl border border-border bg-surface-card p-5 shadow-sm sm:p-7">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-36 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Admin Console</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-text-primary sm:text-[30px]">
              Ringkasan{' '}
              <span className="bg-gradient-to-r from-primary via-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                Platform
              </span>
            </h1>
            <p className="mt-1.5 text-sm text-text-secondary">Pantau seluruh RT, warga, dan arus iuran dalam satu layar</p>
          </div>
          <button
            onClick={load}
            aria-label="Muat ulang data"
            title="Muat ulang data"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-md active:translate-y-0"
          >
            <Icon name="refresh" size={16} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Skeleton className="col-span-2 h-44" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="col-span-2 h-40" />
        </div>
      ) : error || !s ? (
        <ErrorState message={error || 'Data tidak tersedia'} onRetry={load} />
      ) : (
        <>
          {/* Metrik utama */}
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {/* Iuran beredar — kartu unggulan */}
            <article className={cn(cardShell, 'col-span-2 flex flex-col justify-between gap-4 sm:gap-5')}>
              <div aria-hidden className="pointer-events-none absolute -right-14 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary-50 text-primary">
                      <Icon name="wallet" size={13} />
                    </span>
                    Total iuran beredar
                  </p>
                  <p className="mt-3 text-3xl font-extrabold tabular-nums tracking-tight text-text-primary sm:text-4xl">
                    {fmt(s.total_nominal)}
                  </p>
                  <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-text-secondary">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {s.total_lunas} lunas
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {s.total_belum_bayar} menunggu
                    </span>
                  </p>
                </div>
                {/* Cincin rasio lunas */}
                <div
                  aria-hidden="true"
                  className="relative hidden h-24 w-24 shrink-0 place-items-center rounded-full sm:grid"
                  style={{ background: `conic-gradient(${lunasPct >= 70 ? '#10b981' : '#f59e0b'} ${lunasPct}%, #e5e7eb 0%)` }}
                >
                  <div className="flex h-[70px] w-[70px] flex-col items-center justify-center rounded-full border border-border bg-surface-card">
                    <span className="text-base font-extrabold leading-none tabular-nums text-text-primary">{Math.round(lunasPct)}%</span>
                    <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-text-secondary">lunas</span>
                  </div>
                </div>
              </div>
            </article>

            <MiniStat
              icon="building"
              label="RT terdaftar"
              value={s.total_tenants}
              sub={
                <span className="inline-flex items-center gap-1.5">
                  <span className={cn('h-1.5 w-1.5 rounded-full', aktif > 0 ? 'bg-emerald-500' : 'bg-red-500')} />
                  {aktif} berlangganan aktif
                </span>
              }
            />
            <MiniStat icon="shield" label="Pengguna" value={s.total_users} sub="Semua role" />

            <MiniStat
              icon="users"
              label="Warga"
              value={s.total_warga}
              sub={
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="home" size={13} className="text-text-disabled" />
                  di {s.total_rumah} rumah
                </span>
              }
            />
            <MiniStat icon="file" label="Total tagihan" value={s.total_tagihan} sub="Diproses sistem" />

            {/* Rasio lunas — progres */}
            <article className={cn(cardShell, 'col-span-2 flex flex-col gap-3')}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Rasio iuran lunas</p>
                  <p className="mt-0.5 text-[11px] text-text-disabled">Semua periode</p>
                </div>
                <p className={cn('shrink-0 text-2xl font-extrabold tabular-nums tracking-tight', lunasPct >= 70 ? 'text-emerald-600' : 'text-amber-600')}>
                  {Math.round(lunasPct)}%
                </p>
              </div>
              <Progress value={lunasPct} tone={lunasPct >= 70 ? 'success' : 'warning'} />
              <p className="mt-auto text-xs text-text-secondary">
                {s.total_lunas} dari {s.total_tagihan} tagihan lunas.
              </p>
            </article>
          </section>

          <div aria-hidden className="my-7 h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent" />

          {/* Aksi cepat */}
          <section>
            <SectionHead title="Menu admin" desc="Kelola tenant & pengguna" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ActionTile to="/admin/tenants" icon="building" title="Tenant" desc={`${tenants.length} RT terdaftar`} />
              <ActionTile to="/admin/users" icon="users" title="Pengguna" desc={`${s.total_users} akun seluruh role`} accent="neutral" />
              <ActionTile to="/admin/settings" icon="settings" title="Pengaturan" desc="Konfigurasi platform" accent="neutral" />
            </div>
          </section>

          <div aria-hidden className="my-7 h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent" />

          {/* Daftar tenant */}
          <section>
            <SectionHead title="RT terdaftar" desc="Status berlangganan & wilayah" to="/admin/tenants" />
            {tenants.length === 0 ? (
              <EmptyState
                icon="building"
                title="Belum ada tenant terdaftar"
                desc="Tenant yang baru mendaftar akan otomatis muncul di sini."
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tenants.map((t) => (
                  <article key={t.ID} className={cn(cardShell, 'flex flex-col gap-3')}>
                    <div className="flex items-center gap-3">
                      <Avatar name={t.NamaRTRW} className="rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-text-primary">{t.NamaRTRW}</p>
                        <p className="truncate text-xs text-text-secondary">{t.DesaKelurahan}, {t.Kecamatan}</p>
                      </div>
                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide',
                          t.StatusBerlanggan === 'AKTIF'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                        )}
                      >
                        <span className={cn('h-1 w-1 rounded-full', t.StatusBerlanggan === 'AKTIF' ? 'bg-emerald-500' : 'bg-red-500')} />
                        {t.StatusBerlanggan}
                      </span>
                    </div>
                    <p className="mt-auto flex min-w-0 items-center gap-1.5 border-t border-border/70 pt-3 text-xs text-text-secondary">
                      <Icon name="mapPin" size={13} className="shrink-0 text-text-disabled" />
                      <span className="truncate">{t.KabupatenKota}, {t.Provinsi}</span>
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
