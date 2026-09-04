import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from './Icon'

const navItems: { path: string; label: string; icon: IconName }[] = [
  { path: '/app', label: 'Beranda', icon: 'home' },
  { path: '/app/tagihan', label: 'Tagihan', icon: 'file' },
  { path: '/app/forum', label: 'Forum', icon: 'chat' },
  { path: '/app/lapak', label: 'Lapak', icon: 'store' },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] transition-colors',
                isActive ? 'font-semibold text-primary' : 'text-text-secondary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} size={20} strokeWidth={isActive ? 2.4 : 2} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
