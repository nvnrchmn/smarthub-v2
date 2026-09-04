import { NavLink } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from './Icon'

const navItems: { path: string; label: string; icon: IconName }[] = [
  { path: '/app', label: 'Beranda', icon: 'home' },
  { path: '/app/tagihan', label: 'Tagihan', icon: 'file' },
  { path: '/app/forum', label: 'Forum', icon: 'chat' },
  { path: '/app/lapak', label: 'Lapak', icon: 'store' },
]

export function BottomNav() {
  const { mode, setMode } = useTheme()
  const dark =
    mode === 'dark' ||
    (mode === 'auto' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  return (
    <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            aria-label={item.label}
            className={({ isActive }) =>
              cn(
                'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors',
                isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('transition-transform duration-200', isActive && '-translate-y-0.5 scale-110')}>
                  <Icon name={item.icon} size={20} />
                </span>
                <span className={cn(isActive ? 'opacity-100' : 'opacity-0')}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMode(dark ? 'light' : 'dark')}
          aria-label={dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
          className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] text-text-secondary transition-colors hover:text-text-primary"
        >
          <Icon name={dark ? 'sun' : 'moon'} size={20} />
          <span className="opacity-0">Mode</span>
        </button>
      </div>
    </nav>
  )
}