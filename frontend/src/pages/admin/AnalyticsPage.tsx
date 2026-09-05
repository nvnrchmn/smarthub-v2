import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { BentoCard, ErrorState, KPI, SectionHead } from '../../components/ui/bento'
import { Icon } from '../../components/ui/Icon'

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

export function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api<Summary>('/admin/summary')
      .then(setSummary)
      .catch(e => setErr(e.message || 'Gagal memuat analytics'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
        <p className="text-sm text-text-secondary">Ringkasan performa platform</p>
      </header>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 rounded-xl bg-text-disabled/20 animate-pulse" />
          ))}
        </div>
      )}
      {err && <ErrorState message={err} onRetry={load} />}

      {summary && (
        <div className="space-y-6">
          {/* KPI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPI icon="building" label="Total Tenant" value={summary.total_tenants} tone="primary" />
            <KPI icon="users" label="Total User" value={summary.total_users} />
            <KPI icon="home" label="Total Rumah" value={summary.total_rumah} />
            <KPI icon="users" label="Total Warga" value={summary.total_warga} />
            <KPI icon="file" label="Total Tagihan" value={summary.total_tagihan} />
            <KPI icon="check" label="Lunas" value={summary.total_lunas} tone="success" />
            <KPI icon="clock" label="Belum Bayar" value={summary.total_belum_bayar} tone="warning" />
            <KPI icon="wallet" label="Total Nominal" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.total_nominal || 0)} />
          </div>

          {/* Revenue Chart Placeholder */}
          <BentoCard>
            <SectionHead title="Revenue 6 Bulan Terakhir" />
            <div className="mt-4 h-64 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
              <div className="text-center">
                <Icon name="trending" size={32} className="mx-auto text-primary/40 mb-2" />
                <p className="text-sm text-text-secondary">Grafik revenue akan ditampilkan di sini</p>
                <p className="text-xs text-text-disabled mt-1">Integrasi dengan Chart.js / Recharts</p>
              </div>
            </div>
          </BentoCard>
        </div>
      )}
    </div>
  )
}