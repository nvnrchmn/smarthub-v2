import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/', label: 'Beranda', icon: '🏠' },
  { path: '/tagihan', label: 'Tagihan', icon: '📋' },
  { path: '/forum', label: 'Forum', icon: '💬' },
  { path: '/lapak', label: 'Lapak', icon: '🛍️' },
]

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-primary-100 bg-surface-card pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {navItems.map((item) => {
          const active = pathname === item.path
          return (
            <a
              key={item.path}
              href={item.path}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] transition-colors',
                active ? 'text-primary font-medium' : 'text-text-secondary'
              )}
            >
              <span className={cn('text-lg leading-none', active && 'scale-110')}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
