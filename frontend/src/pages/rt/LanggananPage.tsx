import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { BentoCard, ErrorState, KPI } from '../../components/ui/bento'
import { fmt } from '../../lib/utils'

interface Layanan {
  id_layanan: number
  id_rumah: number
  status: string
  harga_per_bulan: number
  tanggal_mulai: string
  tanggal_expire: string
  rumah?: { nama_jalan_gang: string; nomor_rumah: string }
}

interface Invoice {
  id_invoice: number
  id_layanan: number
  nomor_invoice: string
  bulan_tagihan: string
  jumlah_rumah: number
  harga_per_rumah: number
  total_nominal: number
  status: string
  tanggal_bayar?: string
  tanggal_jatuh_tempo: string
}

export function LanggananPage() {
  const [layanan, setLayanan] = useState<Layanan[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api<Layanan[]>('/subscription/layanan'),
      api<Invoice[]>('/subscription/invoices'),
    ])
      .then(([l, i]) => {
        setLayanan(l)
        setInvoices(i)
      })
      .catch(e => setErr(e.message || 'Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const activeLayanan = layanan.filter(l => l.status === 'AKTIF')
  const totalRumahAktif = activeLayanan.length
  const totalBiayaBulanan = activeLayanan.reduce((sum, l) => sum + l.harga_per_bulan, 0)
  const invoicesPending = invoices.filter(i => i.status === 'PENDING')

  const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Langganan</h1>
        <p className="text-sm text-text-secondary">Kelola layanan per-rumah</p>
      </header>

      {loading && <div className="h-32 rounded-2xl bg-text-disabled/20 animate-pulse" />}
      {err && <ErrorState message={err} onRetry={load} />}

      {!loading && !err && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <KPI icon="home" label="Rumah Aktif" value={totalRumahAktif.toString()} />
            <KPI icon="wallet" label="Bulanan" value={formatRp(totalBiayaBulanan)} />
            <KPI icon="file" label="Invoice Pending" value={invoicesPending.length.toString()} tone="warning" />
          </div>

          {/* Active Layanan */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Layanan Aktif</h2>
            {activeLayanan.length === 0 ? (
              <BentoCard>
                <p className="text-sm text-text-secondary">Belum ada layanan aktif. Tambahkan rumah untuk mulai berlangganan.</p>
              </BentoCard>
            ) : (
              <div className="space-y-2">
                {activeLayanan.map(l => (
                  <BentoCard key={l.id_layanan}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary">
                          {l.rumah ? `${l.rumah.nama_jalan_gang} ${l.rumah.nomor_rumah}` : `Rumah #${l.id_layanan}`}
                        </p>
                        <p className="text-xs text-text-secondary">
                          Mulai: {new Date(l.tanggal_mulai).toLocaleDateString('id-ID')}
                          {' · '}Expired: {new Date(l.tanggal_expire).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{formatRp(l.harga_per_bulan)}/bln</p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                          AKTIF
                        </span>
                      </div>
                    </div>
                  </BentoCard>
                ))}
              </div>
            )}
          </div>

          {/* Invoices */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Riwayat Invoice</h2>
            {invoices.length === 0 ? (
              <BentoCard>
                <p className="text-sm text-text-secondary">Belum ada invoice.</p>
              </BentoCard>
            ) : (
              <div className="rounded-2xl border border-border bg-surface-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface">
                      <th className="px-4 py-3 text-left font-medium text-text-secondary">Invoice</th>
                      <th className="px-4 py-3 text-left font-medium text-text-secondary">Bulan</th>
                      <th className="px-4 py-3 text-right font-medium text-text-secondary">Total</th>
                      <th className="px-4 py-3 text-center font-medium text-text-secondary">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id_invoice} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium text-text-primary">{inv.nomor_invoice}</td>
                        <td className="px-4 py-3 text-text-secondary">{inv.bulan_tagihan}</td>
                        <td className="px-4 py-3 text-right text-text-primary">{fmt(inv.total_nominal)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            inv.status === 'PAID' ? 'bg-success/10 text-success' :
                            inv.status === 'PENDING' ? 'bg-warning/10 text-warning' :
                            'bg-danger/10 text-danger'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
