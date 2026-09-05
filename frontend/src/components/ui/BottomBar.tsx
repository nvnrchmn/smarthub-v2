import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { Icon, type IconName } from './Icon'
import { cn } from '../../lib/utils'

interface Item {
  path: string
  label: string
  icon: IconName
}

/* Bottom bar mobile untuk panel RT/Admin — label SELALU tampil agar terbaca
   di mode gelap/terang; item aktif diberi aksen (emerald saat dark). */
export function BottomBar({ links }: { links: Item[] }) {
  const { pathname } = useLocation()
  const { isDark } = useTheme()
  const accent = isDark ? 'text-emerald-300' : 'text-primary'
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
              className={cn('flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors', active ? cn('font-semibold', accent) : 'text-text-secondary')}
            >
              <Icon name={l.icon} size={20} />
              <span>{l.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}