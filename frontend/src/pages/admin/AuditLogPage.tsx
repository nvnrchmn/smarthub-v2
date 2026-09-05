import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { ErrorState } from '../../components/ui/bento'

interface AuditLogRow {
  id_log: number
  id_user: number
  action: string
  resource: string
  detail: string
  ip_address: string
  created_at: string
}

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api<AuditLogRow[]>('/admin/audit-logs?limit=100')
      .then(setLogs)
      .catch(e => setErr(e.message || 'Gagal memuat audit log'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Audit Trail</h1>
        <p className="text-sm text-text-secondary">Log aktivitas seluruh user</p>
      </header>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 rounded-xl bg-text-disabled/20 animate-pulse" />
          ))}
        </div>
      )}
      {err && <ErrorState message={err} onRetry={load} />}

      <div className="rounded-2xl border border-border bg-surface-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-text-secondary text-left">
              <th className="px-4 py-3 font-medium">Waktu</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
              <th className="px-4 py-3 font-medium">Resource</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Detail</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map(l => (
              <tr key={l.id_log} className="hover:bg-text-disabled/5">
                <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{new Date(l.created_at).toLocaleString('id-ID')}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {l.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{l.resource}</td>
                <td className="px-4 py-3 text-text-secondary hidden sm:table-cell max-w-xs truncate">{l.detail}</td>
                <td className="px-4 py-3 text-text-secondary hidden md:table-cell font-mono text-xs">{l.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}