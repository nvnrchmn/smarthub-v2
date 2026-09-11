import { Outlet, Link, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '../components/ui/Icon'
import { BottomBar } from '../components/ui/BottomBar'
import { cn } from '../lib/utils'

interface AdminLink {
  path: string
  label: string
  icon: IconName
}

/* URUTAN TIDAK BOLEH DIUBAH: BottomBar (mobile) memakai 4 item pertama
   sebagai tab utama, sisanya masuk drawer "Lainnya". */
const adminLinks: AdminLink[] = [
  { path: '/admin', label: 'Dashboard', icon: 'grid' },
  { path: '/admin/tenants', label: 'Tenants', icon: 'building' },
  { path: '/admin/settlement', label: 'Settlement', icon: 'bank' },
  { path: '/admin/subscription', label: 'Subscription', icon: 'star' },
  { path: '/admin/cms', label: 'CMS', icon: 'file' },
  { path: '/admin/audit-logs', label: 'Audit', icon: 'clock' },
  { path: '/admin/broadcast', label: 'Broadcast', icon: 'megaphone' },
  { path: '/admin/users', label: 'Users', icon: 'users' },
  { path: '/admin/settings', label: 'Pengaturan', icon: 'settings' },
]

/* Sidebar dikelompokkan per seksi; referensi via Map agar tetap satu sumber
   kebenaran dengan adminLinks (label/ikon tidak diduplikasi). */
const linkByPath = new Map(adminLinks.map((l) => [l.path, l]))
const navSections: { title?: string; items: AdminLink[] }[] = [
  {
    items: [
      linkByPath.get('/admin')!,
      linkByPath.get('/admin/tenants')!,
      linkByPath.get('/admin/users')!,
    ],
  },
  {
    title: 'Keuangan',
    items: [linkByPath.get('/admin/settlement')!, linkByPath.get('/admin/subscription')!],
  },
  {
    title: 'Konten',
    items: [linkByPath.get('/admin/cms')!, linkByPath.get('/admin/broadcast')!],
  },
  {
    title: 'Sistem',
    items: [linkByPath.get('/admin/audit-logs')!, linkByPath.get('/admin/settings')!],
  },
]

export function AdminLayout() {
  const { pathname } = useLocation()
  // Dashboard aktif hanya di root /admin; menu lain aktif di semua halaman turunannya
  // (mis. /admin/tenants/:id) agar navigasi tetap menyala saat detail dibuka.
  const isActive = (path: string) => (path === '/admin' ? pathname === path : pathname.startsWith(path))

  return (
    <div className="h-dvh flex flex-col bg-surface md:flex-row">
      {/* ===== Sidebar desktop ===== */}
      <aside className="relative hidden w-64 shrink-0 flex-col overflow-hidden border-r border-border bg-surface-card md:flex">
        {/* Latar: wash gradien lembut + glow primary di pojok atas */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/[0.07] to-transparent" />
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

        {/* Brand */}
        <div className="relative z-10 flex h-16 shrink-0 items-center border-b border-border/60 px-3">
          <Link to="/admin" aria-label="Smarthub — Dashboard" className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-[13px] font-extrabold tracking-tight text-white shadow-md shadow-primary/25">
              SH
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[15px] font-bold tracking-tight text-text-primary">Smarthub</span>
              <span className="block text-[11px] font-medium text-text-secondary">Super Admin</span>
            </span>
          </Link>
        </div>

        {/* Navigasi */}
        <nav aria-label="Menu admin" className="no-scrollbar relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          {navSections.map((section, si) => (
            <div key={section.title ?? `seksi-${si}`} className={cn(si > 0 && 'mt-5')}>
              {section.title && (
                <div className="mb-1.5 flex items-center gap-2.5 pr-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-disabled">{section.title}</span>
                  <span aria-hidden className="h-px flex-1 bg-border" />
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg py-2 pr-3 pl-0.5 text-sm transition-colors duration-150',
                        active
                          ? 'bg-primary/10 font-semibold text-primary'
                          : 'text-text-secondary hover:bg-text-disabled/10 hover:text-text-primary'
                      )}
                    >
                      {active && (
                        <span aria-hidden className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                      )}
                      <span
                        className={cn(
                          'grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors duration-150',
                          active
                            ? 'bg-primary text-white shadow-sm shadow-primary/30'
                            : 'text-text-secondary group-hover:text-primary'
                        )}
                      >
                        <Icon name={item.icon} size={15} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Status role */}
        <div className="relative z-10 border-t border-border/60 px-3 pt-3 pb-3.5">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/70 p-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon name="shield" size={15} />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-semibold text-text-primary">Super Admin</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-text-secondary">
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-paid" />
                <span className="truncate">Akses penuh semua fitur</span>
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== Konten utama (hanya area ini yang scroll) ===== */}
      <main key={pathname} className="page-enter min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:p-8 md:pb-8">
        <Outlet />
      </main>

      {/* ===== Navigasi mobile ===== */}
      <BottomBar links={adminLinks} />
    </div>
  )
}
