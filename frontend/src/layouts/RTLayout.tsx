import { Outlet, Link, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '../components/ui/Icon'
import { cn } from '../lib/utils'

const rtLinks: { path: string; label: string; icon: IconName }[] = [
  { path: '/rt', label: 'Dashboard', icon: 'grid' },
  { path: '/rt/rumah', label: 'Rumah', icon: 'home' },
  { path: '/rt/warga', label: 'Warga', icon: 'users' },
  { path: '/rt/tagihan', label: 'Tagihan', icon: 'wallet' },
  { path: '/rt/forum', label: 'Forum', icon: 'chat' },
  { path: '/rt/lapak', label: 'Lapak', icon: 'store' },
]

export function RTLayout() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-surface md:flex">
      <aside className="hidden w-56 border-r border-border bg-surface-card p-4 md:block">
        <h2 className="mb-4 text-lg font-bold text-text-primary">RT Panel</h2>
        <nav aria-label="Menu pengurus" className="space-y-1">
          {rtLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={cn(
                'flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 py-2 text-sm',
                pathname === l.path ? 'bg-primary-50 font-medium text-primary' : 'text-text-secondary hover:bg-primary-50/60'
              )}
            >
              <Icon name={l.icon} size={18} aria-hidden />
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">
        <Outlet />
      </main>
      {/* Mobile: sama dengan BottomNav warga — label hanya di tab aktif */}
      <nav aria-label="Menu pengurus" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-card pt-1.5 pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex h-[60px] items-stretch justify-around">
          {rtLinks.slice(0, 5).map((l) => {
            const active = pathname === l.path
            return (
              <Link
                key={l.path}
                to={l.path}
                aria-label={l.label}
                className={cn(
                  'flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px]',
                  active ? 'font-medium text-primary' : 'text-text-secondary'
                )}
              >
                <span className={cn('transition-transform', active && 'scale-110')}>
                  <Icon name={l.icon} size={22} aria-hidden />
                </span>
                {active && <span>{l.label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
