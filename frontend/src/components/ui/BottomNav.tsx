import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from './Icon'
import { Drawer } from './Drawer'

const navItems: { path: string; label: string; icon: IconName }[] = [
  { path: '/app', label: 'Beranda', icon: 'home' },
  { path: '/app/tagihan', label: 'Tagihan', icon: 'file' },
  { path: '/app/forum', label: 'Forum', icon: 'chat' },
  { path: '/app/lapak', label: 'Lapak', icon: 'store' },
  { path: '/app/pengaturan', icon: 'settings', label: 'Pengaturan' },
]

export function BottomNav() {
  const { isDark } = useTheme()
  const [showMore, setShowMore] = useState(false)
  const accent = isDark ? 'text-emerald-300' : 'text-primary'

  const mainItems = navItems.slice(0, 4)
  const extraItems = navItems.slice(4)

  return (
    <>
      <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-card pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {mainItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={({ isActive }) => cn(
                'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors',
                isActive ? cn('font-semibold', accent) : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {({ isActive }) => (
                <>
                  <span className={cn('transition-transform duration-200', isActive && '-translate-y-0.5 scale-110')}>
                    <Icon name={item.icon} size={20} />
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          {extraItems.length > 0 && (
            <button
              type="button"
              onClick={() => setShowMore(true)}
              aria-label="Menu lainnya"
              className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] text-text-secondary transition-colors"
            >
              <Icon name="more-horizontal" size={20} />
              <span>Lainnya</span>
            </button>
          )}
        </div>
      </nav>

      <Drawer open={showMore} onClose={() => setShowMore(false)} title="Menu Lainnya">
        <div className="space-y-1">
          {extraItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setShowMore(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors',
                isActive ? cn('bg-primary/10 font-semibold', accent) : 'text-text-secondary hover:bg-text-disabled/10'
              )}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </Drawer>
    </>
  )
}
