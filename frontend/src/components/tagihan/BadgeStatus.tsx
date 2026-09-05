import { cn } from '../../lib/utils'

export type StatusTagihan = 'PAID' | 'PENDING' | 'OVERDUE' | 'EXPIRED'

const cfg: Record<StatusTagihan, { label: string; bg: string; text: string; dot: string; icon: 'check' | 'clock' | 'alert' | 'x' }> = {
  PAID: { label: 'Lunas', bg: 'bg-status-paid-bg', text: 'text-status-paid', dot: 'bg-status-paid', icon: 'check' },
  PENDING: { label: 'Belum Bayar', bg: 'bg-status-pending-bg', text: 'text-status-pending', dot: 'bg-status-pending', icon: 'clock' },
  OVERDUE: { label: 'Terlambat', bg: 'bg-status-overdue-bg', text: 'text-status-overdue', dot: 'bg-status-overdue', icon: 'alert' },
  EXPIRED: { label: 'Kedaluwarsa', bg: 'bg-text-disabled/10', text: 'text-text-secondary', dot: 'bg-text-disabled/50', icon: 'x' },
}

export function normalStatus(s?: string | null): StatusTagihan {
  const u = (s ?? '').toUpperCase()
  if (u === 'PAID' || u === 'LUNAS') return 'PAID'
  if (u === 'OVERDUE' || u === 'TERLAMBAT') return 'OVERDUE'
  if (u === 'EXPIRED' || u === 'KEDALUWARSA') return 'EXPIRED'
  return 'PENDING'
}

/* Lencana status tagihan standar: dot + ikon + label, warna ramah buta warna. */
export function BadgeStatus({ status, size = 'sm' }: { status?: string | null; size?: 'sm' | 'md' }) {
  const s = cfg[normalStatus(status)]
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium', size === 'md' ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]', s.bg, s.text)}>
      <span aria-hidden className={cn('rounded-full', s.dot, size === 'md' ? 'h-2 w-2' : 'h-1.5 w-1.5')} />
      {s.label}
    </span>
  )
}

/* Format periode YYYY-MM → "September 2026" (id-ID). */
export function labelBulan(p: string): string {
  const d = new Date(`${p}-01T00:00:00`)
  return isNaN(d.getTime()) ? p : d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export function statusLabel(s?: string | null): string {
  return cfg[normalStatus(s)].label
}
