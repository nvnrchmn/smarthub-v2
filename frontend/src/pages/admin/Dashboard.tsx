import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { fmt } from '../../lib/utils'
import { ActionTile, Avatar, BentoCard, ErrorState, KPI, Progress, SectionHead, Skeleton } from '../../components/ui/bento'

interface Summary {
  total_tenants: number; total_users: number; total_rumah: number; total_warga: number
  total_tagihan: number; total_lunas: number; total_belum_bayar: number; total_nominal: number
}
interface Tenant {
  ID: number; NamaRTRW: string; DesaKelurahan: string; Kecamatan: string
  KabupatenKota: string; Provinsi: string; StatusBerlanggan: string; XenditKYCStatus: string
}

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
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Ringkasan Platform</h1>
        <p className="text-xs text-text-secondary">Pantau seluruh RT, warga, dan arus iuran dalam satu layar</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Skeleton className="col-span-2 h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="col-span-2 h-28" />
          <Skeleton className="col-span-2 h-28" />
        </div>
      ) : error || !s ? (
        <ErrorState message={error || 'Data tidak tersedia'} onRetry={load} />
      ) : (
        <>
          {/* KPI bento */}
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KPI icon="wallet" label="Total iuran beredar" value={fmt(s.total_nominal)} sub={`${s.total_lunas} lunas · ${s.total_belum_bayar} menunggu`} tone="primary" className="col-span-2" />
            <KPI icon="building" label="RT terdaftar" value={s.total_tenants} sub={`${aktif} berlangganan aktif`} />
            <KPI icon="shield" label="Pengguna" value={s.total_users} sub="Semua role" />

            <KPI icon="users" label="Warga" value={s.total_warga} sub={`di ${s.total_rumah} rumah`} />
            <BentoCard className="col-span-2" innerClassName="gap-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-text-secondary">Rasio iuran lunas (semua periode)</p>
                <span className="text-lg font-extrabold text-text-primary">{Math.round(lunasPct)}%</span>
              </div>
              <Progress value={lunasPct} tone={lunasPct >= 70 ? 'success' : 'warning'} />
              <p className="text-xs text-text-secondary">{s.total_lunas} dari {s.total_tagihan} tagihan lunas.</p>
            </BentoCard>
            <KPI icon="file" label="Total tagihan" value={s.total_tagihan} sub="Diproses sistem" />
          </section>

          {/* Aksi cepat */}
          <section className="mt-6">
            <SectionHead title="Menu admin" desc="Kelola tenant & pengguna" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ActionTile to="/admin/tenants" icon="building" title="Tenant" desc={`${tenants.length} RT terdaftar`} />
              <ActionTile to="/admin/users" icon="users" title="Pengguna" desc={`${s.total_users} akun seluruh role`} accent="neutral" />
              <ActionTile to="/admin/settings" icon="settings" title="Pengaturan" desc="Konfigurasi platform" accent="neutral" />
            </div>
          </section>

          {/* Daftar tenant */}
          <section className="mt-6">
            <SectionHead title="RT terdaftar" desc="Status berlangganan & wilayah" to="/admin/tenants" />
            {tenants.length === 0 ? (
              <BentoCard innerClassName="items-center justify-center py-10 text-center text-sm text-text-secondary">Belum ada tenant terdaftar.</BentoCard>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tenants.map((t) => (
                  <BentoCard key={t.ID} innerClassName="gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.NamaRTRW} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-text-primary">{t.NamaRTRW}</p>
                        <p className="truncate text-xs text-text-secondary">{t.DesaKelurahan}, {t.Kecamatan}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${t.StatusBerlanggan === 'AKTIF' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {t.StatusBerlanggan}
                      </span>
                    </div>
                    <p className="border-t border-border pt-2 text-xs text-text-secondary">
                      {t.KabupatenKota}, {t.Provinsi}
                    </p>
                  </BentoCard>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
