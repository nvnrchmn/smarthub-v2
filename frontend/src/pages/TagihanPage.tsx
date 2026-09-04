import { fmt } from '@/lib/utils'

interface Tagihan {
  id_tagihan: number
  id_rumah: number
  periode_bulan_tahun: string
  total_nominal: number
  status_pembayaran: 'PAID' | 'PENDING' | 'OVERDUE'
}

export function TagihanPage() {
  const tagihans: Tagihan[] = [
    { id_tagihan: 1, id_rumah: 1, periode_bulan_tahun: '2026-08', total_nominal: 150000, status_pembayaran: 'PAID' },
    { id_tagihan: 2, id_rumah: 2, periode_bulan_tahun: '2026-08', total_nominal: 150000, status_pembayaran: 'PENDING' },
  ]

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Tagihan Iuran</h1>
      </header>
      <div className="space-y-3">
        {tagihans.map(t => (
          <div key={t.id_tagihan} className={`rounded-xl border-l-4 bg-surface-card p-4 ${
            t.status_pembayaran === 'PAID' ? 'border-status-paid' : 'border-status-pending'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Periode {t.periode_bulan_tahun}</p>
                <p className="text-3xl font-bold text-text-primary">{fmt(t.total_nominal)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                t.status_pembayaran === 'PAID' ? 'bg-status-paid-bg text-status-paid' : 'bg-status-pending-bg text-status-pending'
              }`}>
                {t.status_pembayaran === 'PAID' ? 'Lunas' : 'Belum Bayar'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
