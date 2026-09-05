import { Outlet, Link, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '../components/ui/Icon'
import { BottomBar } from '../components/ui/BottomBar'
import { cn } from '../lib/utils'

const rtLinks: { path: string; label: string; icon: IconName }[] = [
  { path: '/rt', label: 'Dashboard', icon: 'grid' },
  { path: '/rt/rumah', label: 'Rumah', icon: 'home' },
  { path: '/rt/warga', label: 'Warga', icon: 'users' },
  { path: '/rt/tagihan', label: 'Tagihan', icon: 'wallet' },
  { path: '/rt/pengaturan', label: 'Pengaturan', icon: 'settings' },
  { path: '/rt/forum', label: 'Forum', icon: 'chat' },
  { path: '/rt/lapak', label: 'Lapak', icon: 'store' },
]

export function RTLayout() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-surface md:flex">
      <aside className="hidden w-56 border-r border-border bg-surface-card p-4 md:block">
        <h2 className="mb-4 text-lg font-bold text-text-primary">RT Panel</h2>
        <nav className="space-y-1">
          {rtLinks.map((l) => {
            const active = pathname === l.path
            return (
              <Link key={l.path} to={l.path} aria-current={active ? 'page' : undefined} className={cn('flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm', active ? 'bg-primary-50 font-medium text-primary' : 'text-text-secondary hover:bg-text-disabled/10')}>
                <Icon name={l.icon} size={17} />
                {l.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main key={pathname} className="page-enter flex-1 p-4 pb-28 md:p-6 md:pb-12">
        <Outlet />
      </main>
      <BottomBar links={rtLinks} />
    </div>
  )
}