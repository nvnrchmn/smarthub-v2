import { fmt } from '@/lib/utils'

interface Props {
  periode: string
  totalNominal: number
  statusPembayaran: 'PAID' | 'PENDING' | 'OVERDUE'
}

const statusConfig = {
  PAID: { label: 'Lunas', bg: 'bg-status-paid-bg', text: 'text-status-paid', border: 'border-status-paid' },
  PENDING: { label: 'Belum Bayar', bg: 'bg-status-pending-bg', text: 'text-status-pending', border: 'border-status-pending' },
  OVERDUE: { label: 'Terlambat', bg: 'bg-status-overdue-bg', text: 'text-status-overdue', border: 'border-status-overdue' },
}

export function KartuTagihan({ periode, totalNominal, statusPembayaran }: Props) {
  const status = statusConfig[statusPembayaran]

  return (
    <div className={`rounded-xl border-l-[3px] ${status.border} bg-surface-card p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-text-secondary">Periode {periode}</p>
          <p className="text-[28px] font-bold text-text-primary">{fmt(totalNominal)}</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>
    </div>
  )
}
