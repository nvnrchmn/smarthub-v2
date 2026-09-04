import { useTheme } from '../../context/ThemeContext'
import { Icon } from './Icon'
import { cn } from '../../lib/utils'

interface Props {
  /** fixed kanan-atas layar (default). false = inline biasa */
  fixed?: boolean
  side?: 'right' | 'left'
  withLabel?: boolean
  className?: string
}

export function ThemeToggle({ fixed = true, side = 'right', withLabel = false, className }: Props) {
  const { mode, setMode } = useTheme()
  const dark = mode === 'dark' || (mode === 'auto' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  const next: 'light' | 'dark' = dark ? 'light' : 'dark'
  const icon = (
    <span className={cn('grid h-9 w-9 place-items-center rounded-full border border-border bg-surface-card text-text-secondary shadow-sm transition-all duration-300 hover:text-primary active:scale-95', fixed && 'h-9 w-9')}>
      <Icon name={dark ? 'sun' : 'moon'} size={17} />
    </span>
  )
  const btn = (
    <button
      type="button"
      onClick={() => setMode(next)}
      aria-label={dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      title={dark ? 'Mode terang' : 'Mode gelap'}
      className={cn('flex items-center gap-2 rounded-full transition-transform active:scale-95', withLabel && 'text-sm text-text-secondary hover:text-text-primary')}
    >
      {icon}
      {withLabel && <span>{dark ? 'Mode terang' : 'Mode gelap'}</span>}
    </button>
  )
  if (!fixed) return btn
  return <div className={cn('fixed top-3 z-[70]', side === 'right' ? 'right-3' : 'left-3', className)}>{btn}</div>
}