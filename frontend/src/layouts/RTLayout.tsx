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
        <h2 className="mb-1 text-lg font-bold text-text-primary">SmartHub</h2>
        <p className="mb-4 text-xs font-medium text-primary">Panel RT</p>
        <nav className="space-y-1">
          {rtLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors',
                pathname === l.path ? 'bg-primary-50 font-semibold text-primary' : 'text-text-secondary hover:bg-surface'
              )}
            >
              <Icon name={l.icon} size={18} />
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 pb-24 md:p-6 md:pb-6">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-card pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Navigasi RT">
        <div className="mx-auto flex max-w-lg items-stretch">
          {rtLinks.slice(0, 5).map((l) => {
            const active = pathname === l.path
            return (
              <Link key={l.path} to={l.path} className={cn('flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5', active ? 'text-primary' : 'text-text-secondary')}>
                <Icon name={l.icon} size={20} strokeWidth={active ? 2.4 : 2} />
                <span className={cn('text-[10px]', active && 'font-semibold')}>{l.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
