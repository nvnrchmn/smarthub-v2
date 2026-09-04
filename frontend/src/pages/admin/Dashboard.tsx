import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { fmt } from '../../lib/utils'

interface Summary {
  total_tenants: number
  total_users: number
  total_rumah: number
  total_warga: number
  total_tagihan: number
  total_lunas: number
  total_belum_bayar: number
  total_nominal: number
}

interface Tenant {
  id_tenant: number
  nama_rt_rw: string
  desa_kelurahan: string
  kecamatan: string
  status_berlangganan: string
}

export function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [s, t] = await Promise.all([api('/api/admin/summary'), api('/api/admin/tenants')])
        setSummary(s)
        setTenants(Array.isArray(t) ? t : [])
      } catch {
        // biarkan null
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="p-6 text-sm text-text-secondary">Memuat…</div>

  const cards = [
    { label: 'Tenants', value: summary?.total_tenants ?? 0, sub: `${summary?.total_users ?? 0} pengguna` },
    { label: 'Rumah', value: summary?.total_rumah ?? 0, sub: `${summary?.total_warga ?? 0} warga` },
    { label: 'Tagihan', value: summary?.total_tagihan ?? 0, sub: `${summary?.total_lunas ?? 0} lunas` },
    { label: 'Belum Bayar', value: fmt(summary?.total_nominal ?? 0), sub: `${summary?.total_belum_bayar ?? 0} tagihan` },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-16">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard Super Admin</h1>
        <p className="text-sm text-text-secondary">Overview seluruh tenant Logikraf</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-surface-card p-4">
            <p className="text-xs text-text-secondary">{c.label}</p>
            <p className="mt-1 text-xl font-bold text-text-primary">{c.value}</p>
            <p className="text-xs text-text-secondary">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Tenants */}
      <section className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-text-primary">Daftar Tenant</h2>
        <div className="space-y-2.5">
          {tenants.map((t) => (
            <div key={t.id_tenant} className="flex items-center justify-between rounded-xl border border-border bg-surface-card p-4">
              <div>
                <p className="font-semibold text-text-primary">
                  {t.nama_rt_rw} <span className="text-xs text-text-secondary">#{t.id_tenant}</span>
                </p>
                <p className="text-xs text-text-secondary">
                  {t.desa_kelurahan}, {t.kecamatan}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  t.status_berlangganan === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {t.status_berlangganan}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
