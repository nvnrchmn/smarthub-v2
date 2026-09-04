import { Outlet, Link, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '../components/ui/Icon'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { cn } from '../lib/utils'

const adminLinks: { path: string; label: string; icon: IconName }[] = [
  { path: '/admin', label: 'Dashboard', icon: 'grid' },
  { path: '/admin/tenants', label: 'Tenants', icon: 'building' },
  { path: '/admin/users', label: 'Users', icon: 'users' },
  { path: '/admin/settings', label: 'Pengaturan', icon: 'settings' },
]

function BottomBar({ links }: { links: { path: string; label: string; icon: IconName }[] }) {
  const { pathname } = useLocation()
  return (
    <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-card md:hidden">
      <div className="flex items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {links.slice(0, 5).map((l) => {
          const active = pathname === l.path
          return (
            <Link
              key={l.path}
              to={l.path}
              aria-label={l.label}
              aria-current={active ? 'page' : undefined}
              className={cn('flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors', active ? 'text-primary' : 'text-text-secondary')}
            >
              <Icon name={l.icon} size={20} />
              <span className={cn(active ? 'opacity-100' : 'opacity-0')}>{l.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function AdminLayout() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-surface md:flex">
      <aside className="hidden w-56 border-r border-border bg-surface-card p-4 md:block">
        <h2 className="mb-4 text-lg font-bold text-text-primary">Super Admin</h2>
        <nav className="space-y-1">
          {adminLinks.map((l) => {
            const active = pathname === l.path
            return (
              <Link key={l.path} to={l.path} aria-current={active ? 'page' : undefined} className={cn('flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm', active ? 'bg-primary-50 font-medium text-primary' : 'text-text-secondary hover:bg-text-disabled/10')}>
                <Icon name={l.icon} size={17} />
                {l.label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-6 border-t border-border pt-3">
          <ThemeToggle fixed={false} withLabel />
        </div>
      </aside>
      <main key={pathname} className="page-enter flex-1 p-4 md:p-6 md:pb-10">
        <Outlet />
      </main>
      <ThemeToggle className="md:hidden" />
      <BottomBar links={adminLinks} />
    </div>
  )
}