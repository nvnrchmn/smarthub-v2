import { cn } from '@/lib/utils'

const statusColor: Record<string, string> = {
  Dihuni: 'bg-status-paid',
  Kosong: 'bg-status-overdue',
}

export function StatusDot({ status }: { status: string }) {
  return <span className={cn('inline-block h-2.5 w-2.5 rounded-full', statusColor[status] || 'bg-muted')} />
}
