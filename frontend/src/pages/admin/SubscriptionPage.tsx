import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { ErrorState, KPI } from '../../components/ui/bento'
import { Icon } from '../../components/ui/Icon'
import { fmt } from '../../lib/utils'

interface LanggananRow {
  id_langganan: number
  id_tenant: number
  status: string
  tanggal_expire: string
  tenant?: { nama_rt_rw: string }
  paket?: { nama_paket: string; harga_per_bulan: number }
}

interface InvoiceRow {
  id_invoice: number
  id_tenant: number
  nomor_invoice: string
  total_nominal: number
  status: string
  tenant?: { nama_rt_rw: string }
}

export function AdminSubscriptionPage() {
  const [tab, setTab] = useState<'langganan' | 'invoice'>('langganan')
  const [langganans, setLangganans] = useState<LanggananRow[]>([])
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api<LanggananRow[]>('/admin/subscription/langganans'),
      api<InvoiceRow[]>('/admin/subscription/invoices?status=PENDING'),
    ])
      .then(([l, i]) => {
        setLangganans(l)
        setInvoices(i)
      })
      .catch(e => setErr(e.message || 'Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const totalPending = invoices.reduce((s, inv) => s + Number(inv.total_nominal || 0), 0)
  const totalAktif = langganans.filter(l => l.status === 'AKTIF').length

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Manajemen Subscription</h1>
        <p className="text-sm text-text-secondary">Kelola langganan dan invoice tenant</p>
      </header>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-xl bg-text-disabled/20 animate-pulse" />
          ))}
        </div>
      )}
      {err && <ErrorState message={err} onRetry={load} />}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KPI icon="building" label="Aktif" value={totalAktif} tone="success" />
        <KPI icon="file" label="Pending Invoice" value={invoices.length} tone="warning" />
        <KPI icon="wallet" label="Nominal Pending" value={fmt(totalPending)} />
        <KPI icon="users" label="Total Langganan" value={langganans.length} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('langganan')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === 'langganan' ? 'bg-primary text-white' : 'bg-surface-card text-text-secondary border border-border'}`}
        >
          Langganan
        </button>
        <button
          onClick={() => setTab('invoice')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === 'invoice' ? 'bg-primary text-white' : 'bg-surface-card text-text-secondary border border-border'}`}
        >
          Invoice
        </button>
      </div>

      {/* Langganan Tab */}
      {tab === 'langganan' && (
        <div className="space-y-2">
          {langganans.map(l => (
            <div key={l.id_langganan} className="flex items-center justify-between rounded-xl border border-border bg-surface-card p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                  <Icon name="building" size={18} className="text-primary" />
                </span>
                <div>
                  <p className="font-medium text-text-primary">{l.tenant?.nama_rt_rw || `Tenant ${l.id_tenant}`}</p>
                  <p className="text-sm text-text-secondary">{l.paket?.nama_paket} • Exp: {new Date(l.tanggal_expire).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                l.status === 'AKTIF' ? 'bg-success/10 text-success' :
                l.status === 'SUSPENDED' ? 'bg-warning/10 text-warning' :
                'bg-danger/10 text-danger'
              }`}>
                {l.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Tab */}
      {tab === 'invoice' && (
        <div className="space-y-2">
          {invoices.map(inv => (
            <div key={inv.id_invoice} className="flex items-center justify-between rounded-xl border border-border bg-surface-card p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-warning/10">
                  <Icon name="file" size={18} className="text-warning" />
                </span>
                <div>
                  <p className="font-medium text-text-primary">{inv.nomor_invoice}</p>
                  <p className="text-sm text-text-secondary">{inv.tenant?.nama_rt_rw || `Tenant ${inv.id_tenant}`}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-text-primary">{fmt(inv.total_nominal)}</p>
                <span className="text-xs font-medium text-warning">{inv.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}