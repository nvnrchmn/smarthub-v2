import { Outlet, Link, useLocation } from 'react-router-dom'

const adminLinks = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/tenants', label: 'Tenants', icon: '🏢' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export function AdminLayout() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-surface md:flex">
      <aside className="hidden md:block w-56 border-r border-border bg-white p-4">
        <h2 className="text-lg font-bold text-text-primary mb-4">Super Admin</h2>
        <nav className="space-y-1">
          {adminLinks.map((l) => (
            <Link key={l.path} to={l.path} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${pathname === l.path ? 'bg-primary-50 text-primary font-medium' : 'text-text-secondary hover:bg-muted'}`}>
              <span>{l.icon}</span>{l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-6"><Outlet /></main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-border bg-white flex">
        {adminLinks.slice(0, 5).map((l) => (
          <Link key={l.path} to={l.path} className={`flex-1 py-2 text-center text-xs ${pathname === l.path ? 'text-primary' : 'text-text-secondary'}`}>
            <div className="text-lg">{l.icon}</div>{l.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
