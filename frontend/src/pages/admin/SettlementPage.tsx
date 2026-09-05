import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { BentoCard, ErrorState, KPI, Skeleton } from '../../components/ui/bento'

interface SettlementRow {
  id_tenant: number
  nama_rt_rw: string
  nama_pemilik_rekening: string
  bank_code: string
  nomor_rekening: string
  ktp_url: string
  ktp_verified: boolean
  xendit_kyc_status: string
  created_at: string
}

interface Summary {
  total_tenants: number
  kyc_pending: number
  kyc_live: number
  kyc_rejected: number
}

export function AdminSettlementPage() {
  const [tenants, setTenants] = useState<SettlementRow[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [listRes, summaryRes] = await Promise.all([
        api<any>(`/admin/settlements?status=${filter}`),
        api<Summary>('/admin/settlements/summary')
      ])
      setTenants(listRes.data || [])
      setSummary(summaryRes)
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data settlement')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  const verify = async (id: number) => {
    try {
      await api(`/admin/settlements/${id}/verify`, { method: 'POST' })
      load()
    } catch (e: any) {
      setError(e.message || 'Gagal memverifikasi')
    }
  }

  const reject = async (id: number) => {
    try {
      await api(`/admin/settlements/${id}/reject`, { method: 'POST' })
      load()
    } catch (e: any) {
      setError(e.message || 'Gagal menolak')
    }
  }

  const statusLabel = (s: string) => s === 'LIVE' ? 'Terverifikasi' : s === 'REJECTED' ? 'Ditolak' : 'Pending'
  const statusColor = (s: string) => s === 'LIVE' ? 'text-emerald-500' : s === 'REJECTED' ? 'text-red-500' : 'text-amber-500'

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Settlement</h1>
        <p className="mt-1 text-sm text-text-secondary">Kelola verifikasi rekening dan KYC tenant</p>
      </header>

      {error && <ErrorState message={error} />}

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <KPI icon="building" label="Total Tenant" value={summary.total_tenants} />
          <KPI icon="clock" label="Pending" value={summary.kyc_pending} tone="warning" />
          <KPI icon="check" label="Terverifikasi" value={summary.kyc_live} tone="success" />
          <KPI icon="x" label="Ditolak" value={summary.kyc_rejected} tone="danger" />
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['all', 'PENDING', 'LIVE', 'REJECTED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === s ? 'bg-primary text-white' : 'bg-surface-card border border-border text-text-secondary hover:bg-text-disabled/10'
            }`}
          >
            {s === 'all' ? 'Semua' : s === 'LIVE' ? 'Terverifikasi' : s === 'REJECTED' ? 'Ditolak' : 'Pending'}
          </button>
        ))}
      </div>

      {/* Table */}
      <BentoCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-card">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Tenant</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Rekening</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tenants.map((t) => (
                <tr key={t.id_tenant} className="hover:bg-text-disabled/5">
                  <td className="px-4 py-3">
                    <div className="font-medium text-text-primary">{t.nama_rt_rw}</div>
                    <div className="text-xs text-text-secondary">{t.nama_pemilik_rekening}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-text-primary">{t.bank_code} {t.nomor_rekening}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${statusColor(t.xendit_kyc_status)}`}>
                      {statusLabel(t.xendit_kyc_status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.xendit_kyc_status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => verify(t.id_tenant)}
                          className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500 hover:bg-emerald-500/20"
                        >
                          Verifikasi
                        </button>
                        <button
                          onClick={() => reject(t.id_tenant)}
                          className="rounded-lg bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-500/20"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                    Tidak ada data settlement
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </BentoCard>
    </div>
  )
}
