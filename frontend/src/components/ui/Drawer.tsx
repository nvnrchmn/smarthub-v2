import { useEffect, useRef } from 'react'
import { Icon } from './Icon'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
}

/* Bottom sheet / drawer — form kelola data (Design.md: form pakai drawer,
   bukan modal tengah). Esc/tap-luar menutup; body terkunci saat terbuka. */
export function Drawer({ open, onClose, title, subtitle, children }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      closeRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-surface-card shadow-xl"
      >
        {/* handle tarik (afordan sheet bisa digeser/tutup) */}
        <div className="flex justify-center pt-2.5 pb-1">
          <span aria-hidden className="h-1 w-10 rounded-full bg-text-disabled/60" />
        </div>
        <div className="flex items-start justify-between gap-3 px-5 pb-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-text-primary">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-text-secondary hover:bg-primary-50 hover:text-primary"
          >
            <Icon name="x" size={18} aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  )
}
