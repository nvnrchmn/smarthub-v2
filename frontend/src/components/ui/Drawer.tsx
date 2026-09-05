import { useEffect } from 'react'
import { Icon } from './Icon'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
}

/*
 * Modal overlay terpusat yang responsif:
 * - Posisi fixed di viewport (tidak terpengaruh scroll user)
 * - Height mengikuti konten, max 60vh (mobile) / 65vh (desktop)
 * - Terpusat vertical & horizontal, tidak tertutup bottom nav
 * - Safe area untuk notched phones
 * - Animasi scale + fade yang halus
 */
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overscroll-none p-4 pb-20 sm:p-6 sm:pb-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="a-fade absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Card — centered in viewport */}
      <div className="sheet-panel relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface-card shadow-2xl sm:max-w-lg">
        {/* Visual handle (mobile) */}
        <div className="flex shrink-0 justify-center pt-2.5 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-text-disabled/40" />
        </div>

        {/* Header */}
        <header className="flex shrink-0 items-start justify-between gap-3 px-5 pb-2 pt-2 sm:pt-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-text-primary">{title}</h3>
            {subtitle && <p className="mt-0.5 truncate text-xs text-text-secondary">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-text-disabled/10 text-text-secondary transition-colors hover:bg-text-disabled/20 active:scale-95"
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        {/* Scrollable content — height follows content, max 60vh/65vh */}
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-1"
          style={{
            maxHeight: 'min(60dvh, 24rem)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
