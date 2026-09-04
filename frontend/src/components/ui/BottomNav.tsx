import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/app', label: 'Beranda', icon: '🏠' },
  { path: '/app/tagihan', label: 'Tagihan', icon: '📋' },
  { path: '/app/forum', label: 'Forum', icon: '💬' },
  { path: '/app/lapak', label: 'Lapak', icon: '🛍️' },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-primary-100 bg-surface-card pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] transition-colors',
                isActive ? 'text-primary font-medium' : 'text-text-secondary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('text-lg leading-none', isActive && 'scale-110')}>{item.icon}</span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
