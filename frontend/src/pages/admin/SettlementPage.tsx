import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { fmt } from '../../lib/utils'
import { ErrorState, KPI, Skeleton } from '../../components/ui/bento'

interface SettlementRow {
  id_settlement: number
  id_tenant: number
  total_nominal: number
  bank_code: string
  account_number: string
  account_name: string
  status: string
  note: string
  created_at: string
  completed_at: string
  reject_reason: string
}

export function AdminSettlementPage() {
  const [settlements, setSettlements] = useState<SettlementRow[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api<{ data: SettlementRow[] }>(`/settlements?status=${filter}`),
      api('/admin/settlements/summary')
    ])
      .then(([list, sum]) => {
        setSettlements(list.data)
        setSummary(sum)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { load() }, [load])

  const complete = async (id: number) => {
    await api(`/admin/settlements/${id}/complete`, { method: 'POST' })
    load()
  }

  const reject = async (id: number) => {
    const reason = prompt('Alasan penolakan?')
    if (!reason) return
    await api(`/admin/settlements/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
    load()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header>
        <h1 className="text-xl font-bold text-text-primary">Settlement</h1>
        <p className="text-sm text-text-secondary">Kelola pencairan dana tagihan QRIS ke rekening tenant</p>
      </header>

      {error && <ErrorState message={error} />}

      {loading ? <Skeleton className="h-32" /> : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPI icon="building" label="Total Tenant" value={String(summary?.total_tenants || 0)} />
          <KPI icon="clock" label="Pending" value={String(summary?.pending_count || 0)} tone="warning" />
          <KPI icon="check" label="Selesai" value={String(summary?.completed_count || 0)} tone="success" />
          <KPI icon="x" label="Ditolak" value={String(summary?.rejected_count || 0)} tone="danger" />
        </div>
      )}

      <div className="flex gap-2">
        {['', 'PENDING', 'COMPLETED', 'REJECTED'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === s ? 'bg-primary text-white' : 'bg-surface-card border border-border text-text-secondary'
            }`}
          >
            {s === '' ? 'Semua' : s}
          </button>
        ))}
      </div>

      {settlements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-text-secondary">Tidak ada data settlement</p>
        </div>
      ) : (
        <div className="space-y-2">
          {settlements.map(s => (
            <div key={s.id_settlement} className="rounded-xl border border-border bg-surface-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">#{s.id_settlement}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      s.status === 'COMPLETED' ? 'bg-status-paid-bg text-status-paid' :
                      s.status === 'REJECTED' ? 'bg-status-overdue-bg text-status-overdue' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">Tenant #{s.id_tenant}</p>
                  {s.note && <p className="mt-1 text-xs text-text-disabled">{s.note}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-primary">{fmt(s.total_nominal)}</p>
                  <p className="text-xs text-text-secondary">{new Date(s.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              {s.status === 'PENDING' && (
                <div className="mt-3 flex gap-2 border-t border-border pt-3">
                  <button
                    onClick={() => complete(s.id_settlement)}
                    className="flex-1 rounded-lg bg-status-paid py-2 text-xs font-semibold text-white hover:bg-status-paid/90"
                  >
                    Selesaikan
                  </button>
                  <button
                    onClick={() => reject(s.id_settlement)}
                    className="flex-1 rounded-lg bg-status-overdue py-2 text-xs font-semibold text-white hover:bg-status-overdue/90"
                  >
                    Tolak
                  </button>
                </div>
              )}

              {s.account_name && (
                <div className="mt-2 rounded-lg bg-surface p-2 text-xs text-text-secondary">
                  <p>{s.account_name} • {s.bank_code} • {s.account_number}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
