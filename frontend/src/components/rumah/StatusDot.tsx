import { cn } from '@/lib/utils'

/* Status tanpa andalkan warna saja (checklist Design.md): dot ini SELALU
   ditemani label teks di komponen pemakainya. Dihuni=hijau, Kosong=abu
   (bukan merah — kosong bukan kondisi "bahaya", heuristik makna warna). */
export function StatusDot({ status, className }: { status: string; className?: string }) {
  const map: Record<string, string> = {
    Dihuni: 'bg-status-paid',
    Kosong: 'bg-status-empty',
  }
  return (
    <span aria-hidden className={cn('inline-block h-2.5 w-2.5 shrink-0 rounded-full', map[status] || 'bg-muted', className)} />
  )
}
