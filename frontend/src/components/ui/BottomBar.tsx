import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { Icon, type IconName } from './Icon'
import { cn } from '../../lib/utils'
import { Drawer } from './Drawer'

interface Item {
  path: string
  label: string
  icon: IconName
}

/* Bottom bar mobile untuk panel RT/Admin — label SELALU tampil agar terbaca
   di mode gelap/terang; item aktif diberi aksen (emerald saat dark). 
   Maksimal 4 menu + 1 tombol "Lainnya" yang buka drawer. */
export function BottomBar({ links }: { links: Item[] }) {
  const { pathname } = useLocation()
  const { isDark } = useTheme()
  const [showMore, setShowMore] = useState(false)
  const accent = isDark ? 'text-emerald-300' : 'text-primary'

  const mainLinks = links.slice(0, 4)
  const extraLinks = links.slice(4)

  return (
    <>
      <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-card md:hidden">
        <div className="flex items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
          {mainLinks.map((l) => {
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
          {extraLinks.length > 0 && (
            <button
              type="button"
              onClick={() => setShowMore(true)}
              aria-label="Menu lainnya"
              className={cn('flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] text-text-secondary transition-colors', showMore && cn('font-semibold', accent))}
            >
              <Icon name="more-horizontal" size={20} />
              <span>Lainnya</span>
            </button>
          )}
        </div>
      </nav>

      <Drawer open={showMore} onClose={() => setShowMore(false)} title="Menu Lainnya">
        <div className="space-y-1">
          {extraLinks.map((l) => {
            const active = pathname === l.path
            return (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setShowMore(false)}
                className={cn('flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors', active ? cn('bg-primary/10 font-semibold', accent) : 'text-text-secondary hover:bg-text-disabled/10')}
              >
                <Icon name={l.icon} size={20} />
                <span>{l.label}</span>
              </Link>
            )
          })}
        </div>
      </Drawer>
    </>
  )
}
