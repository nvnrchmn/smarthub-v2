import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Drawer({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-t-2xl bg-surface-card p-6 animate-in slide-in-from-bottom">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-text-secondary hover:bg-muted">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l8 8M6 14L14 6" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
