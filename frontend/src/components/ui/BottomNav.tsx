import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from './Icon'

const navItems: { path: string; label: string; icon: IconName }[] = [
  { path: '/app', label: 'Beranda', icon: 'home' },
  { path: '/app/tagihan', label: 'Tagihan', icon: 'file' },
  { path: '/app/forum', label: 'Forum', icon: 'chat' },
  { path: '/app/lapak', label: 'Lapak', icon: 'store' },
]

/* Pola Design.md: 64px + safe-area; active = ikon primary + label,
   inactive = ikon abu tanpa label (fokus ke 4 tujuan utama). */
export function BottomNav() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-card pt-1.5 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex h-[60px] max-w-lg items-stretch justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            aria-label={item.label}
            className={({ isActive }) =>
              cn(
                'flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] transition-colors',
                isActive ? 'font-medium text-primary' : 'text-text-secondary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('transition-transform', isActive && 'scale-110')}>
                  <Icon name={item.icon} size={22} aria-hidden />
                </span>
                {isActive && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
