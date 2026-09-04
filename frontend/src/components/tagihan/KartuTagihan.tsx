import { fmt } from '@/lib/utils'

interface Props {
  periode: string
  totalNominal: number
  statusPembayaran: 'PAID' | 'PENDING' | 'OVERDUE'
}

const statusConfig = {
  PAID: { label: 'Lunas', bg: 'bg-status-paid-bg', text: 'text-status-paid', border: 'border-status-paid', dot: 'bg-status-paid' },
  PENDING: { label: 'Belum Bayar', bg: 'bg-status-pending-bg', text: 'text-status-pending', border: 'border-status-pending', dot: 'bg-status-pending' },
  OVERDUE: { label: 'Terlambat', bg: 'bg-status-overdue-bg', text: 'text-status-overdue', border: 'border-status-overdue', dot: 'bg-status-overdue' },
} as const

/* Nominal = info paling emosional (Design.md): ukuran besar, bold, warna
   utama. Status selalu teks + dot (bukan warna saja). */
export function KartuTagihan({ periode, totalNominal, statusPembayaran }: Props) {
  const status = statusConfig[statusPembayaran]
  const bulan = (p: string) => {
    const d = new Date(`${p}-01T00:00:00`)
    return isNaN(d.getTime()) ? p : d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  }

  return (
    <div className={`rounded-xl border-l-4 bg-surface-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${status.border}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-text-secondary">{bulan(periode)}</p>
          <p className="truncate text-[28px] font-bold leading-tight text-primary">{fmt(totalNominal)}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${status.bg} ${status.text}`}>
          <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>
    </div>
  )
}
