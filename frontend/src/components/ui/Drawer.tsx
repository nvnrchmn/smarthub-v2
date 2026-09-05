import { useEffect } from 'react'
import { Icon } from './Icon'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
}

/* Modal responsif: terpusat di mobile (card floating) maupun desktop,
   tinggi mengikuti viewport dengan konten discroll. Lebih mudah dilihat
   di layar kecil dibanding bottom sheet yang tersembunyi di bawah. */
export function Drawer({ open, onClose, title, subtitle, children }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="a-fade absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="sheet-up relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface-card shadow-2xl sm:max-h-[85vh] sm:max-w-lg">
        {/* handle tarik (visual, mobile) */}
        <div className="flex shrink-0 justify-center pt-2.5 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-text-disabled/40" />
        </div>
        <header className="flex shrink-0 items-start justify-between gap-3 px-5 pb-2 pt-2 sm:pt-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-text-primary">{title}</h3>
            {subtitle && <p className="mt-0.5 truncate text-xs text-text-secondary">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-text-disabled/10 text-text-secondary transition-colors hover:bg-text-disabled/20 active:scale-95">
            <Icon name="x" size={16} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))]" style={{ WebkitOverflowScrolling: 'touch' }}>{children}</div>
      </div>
    </div>
  )
}
