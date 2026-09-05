import { Outlet, Link, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '../components/ui/Icon'
import { BottomBar } from '../components/ui/BottomBar'
import { cn } from '../lib/utils'

const adminLinks: { path: string; label: string; icon: IconName }[] = [
  { path: '/admin', label: 'Dashboard', icon: 'grid' },
  { path: '/admin/tenants', label: 'Tenants', icon: 'building' },
  { path: '/admin/users', label: 'Users', icon: 'users' },
  { path: '/admin/settings', label: 'Pengaturan', icon: 'settings' },
]

export function AdminLayout() {
  const { pathname } = useLocation()
  return (
    <div className="h-dvh flex flex-col bg-surface md:flex-row">
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
      </aside>
      <main key={pathname} className={cn("page-enter flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6", "pb-24")}>
        <Outlet />
      </main>
      <BottomBar links={adminLinks} />
    </div>
  )
}
