import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { BentoCard, ErrorState, KPI, SectionHead } from '../../components/ui/bento'
import { Icon } from '../../components/ui/Icon'
import { fmt } from '../../lib/utils'

interface TenantDetailData {
  tenant_id: number
  nama_rt_rw: string
  desa_kelurahan: string
  kecamatan: string
  kabupaten_kota: string
  provinsi: string
  total_users: number
  total_rumah: number
  total_warga: number
  total_tagihan: number
  total_lunas: number
  total_pending: number
  total_nominal: number
}

export function TenantDetailPage() {
  const [data, setData] = useState<TenantDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const id = window.location.pathname.split('/').pop()

  const load = useCallback(() => {
    setLoading(true)
    api<TenantDetailData>(`/admin/tenants/${id}`)
      .then(setData)
      .catch(e => setErr(e.message || 'Gagal memuat detail tenant'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(load, [load])

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Detail Tenant</h1>
      </header>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 rounded-xl bg-text-disabled/20 animate-pulse" />
          ))}
        </div>
      )}
      {err && <ErrorState message={err} onRetry={load} />}

      {data && (
        <div className="space-y-6">
          {/* Info Tenant */}
          <BentoCard>
            <div className="flex items-center gap-3 mb-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                <Icon name="building" size={20} className="text-primary" />
              </span>
              <div>
                <h2 className="font-semibold text-text-primary">{data.nama_rt_rw}</h2>
                <p className="text-sm text-text-secondary">
                  {data.desa_kelurahan}, {data.kecamatan}, {data.kabupaten_kota}, {data.provinsi}
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Stats */}
          <div>
            <SectionHead title="Statistik" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <KPI icon="users" label="Users" value={data.total_users} />
              <KPI icon="home" label="Rumah" value={data.total_rumah} />
              <KPI icon="users" label="Warga" value={data.total_warga} />
              <KPI icon="file" label="Tagihan" value={data.total_tagihan} />
              <KPI icon="check" label="Lunas" value={data.total_lunas} tone="success" />
              <KPI icon="clock" label="Pending" value={data.total_pending} tone="warning" />
              <KPI icon="wallet" label="Total Nominal" value={fmt(data.total_nominal)} />
              <KPI icon="trending" label="Kepatuhan" value={`${data.total_tagihan ? Math.round((data.total_lunas / data.total_tagihan) * 100) : 0}%`} tone="primary" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}